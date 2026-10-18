"""Build the approved editorial proposal. Local files only; no publish/send."""
from pathlib import Path
from html import escape
from urllib.parse import urlsplit
import argparse
import json
import re
import shutil

KIT = Path(__file__).resolve().parent
REPO = KIT.parents[1]

def money(n):
    return f'{n/10000:,.1f}'.removesuffix('.0')

def render(data, common):
    if data.get('template_version') != 'TIGER_EDITORIAL_V1':
        raise ValueError('Use the editorial brief format; old briefs require --legacy.')
    if not re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*', data.get('slug', '')):
        raise ValueError('slug must contain lowercase letters, numbers and hyphens only')
    if not 1 <= len(data.get('plans', [])) <= 3:
        raise ValueError('Choose one to three approved plans')
    if not 1 <= len(data.get('ideas', [])) <= 3:
        raise ValueError('Provide one to three customer-specific content directions')
    if not data.get('channel', '').strip():
        raise ValueError('Specify the real inquiry channel')
    asset_url = urlsplit(data['asset_base'])
    if asset_url.scheme not in ('http', 'https') or not asset_url.netloc or not data['asset_base'].endswith('/'):
        raise ValueError('asset_base must be an HTTP(S) directory URL')
    catalog = {p['id']: p for p in common['plans']['items']}
    allowed_terms = {t['months'] for t in common['plans']['terms']}
    plans, alternates, term_labels = [], [], []
    selected_ids = set()
    for p in data['plans']:
        plan_id, months = p['id'], p['months']
        if plan_id not in catalog or months not in allowed_terms or plan_id in selected_ids:
            raise ValueError('Unknown/duplicate plan or unsupported term')
        if any(k in p for k in ['supply', 'monthly_with_vat', 'total_with_vat', 'counts', 'alternate']):
            raise ValueError('Prices and quantities must come from _common.json, not a customer brief')
        selected_ids.add(plan_id)
        official = catalog[plan_id]
        supply = official['prices'][str(months)]
        vat = supply * 110 // 100
        total = vat * months
        counts = [official[k] for k in ['shorts', 'card_news', 'threads', 'blog']]
        quantity = '<span>매월</span>'+''.join(f'<span>{label} <b>{n}{unit}</b></span>' for n,label,unit in zip(counts,['쇼츠','카드뉴스','Threads','블로그'],['편','건','건','건']))
        features = ''.join(f'<li>{escape(x)}</li>' for x in p['features'])
        plans.append(f'''<article class="plan {plan_id.lower()}"><div class="plan-desc"><p class="plan-label">{plan_id} <span>{months}개월 계약</span></p><h3>{escape(p['title'])}</h3><p class="plan-role">{escape(p['role'])}</p><ul>{features}</ul></div><div class="plan-price"><p class="amount"><strong>{money(supply)}</strong><small>만원 / 월 공급가</small></p><p class="vat">VAT 포함 월 <b>{money(vat)}만원</b></p><p class="contract">{months}개월 총액 <b>{money(total)}만원</b><small>VAT 포함 · 월별 지급 제안</small></p><div class="monthly-counts" aria-label="월 제작 수량">{quantity}</div></div><div class="plan-footer"><a href="#reply">이 운영안으로 먼저 상담하기 ↗</a></div></article>''')
        for alternate in common['plans']['terms']:
            m = alternate['months']
            if m == months:
                continue
            alt_supply = official['prices'][str(m)]
            alt_vat = alt_supply * 110 // 100
            alternates.append(f'<b>{plan_id}</b><br>{m}개월: 월 공급가 {money(alt_supply)}만원 / VAT 포함 {money(alt_vat)}만원 / 총 {money(alt_vat*m)}만원(VAT 포함)')
        term_labels.append(f'{plan_id}{"은" if plan_id=="BASIC" else "는"} {months}개월')
    values = {k:escape(str(v)) for k,v in data.items() if not isinstance(v,(list,dict))}
    values['plans'] = ''.join(plans)
    values['alternate_terms'] = '<br><br>'.join(alternates)
    values['term_warning'] = ', '.join(term_labels)+' 기준입니다.'
    if len({p['months'] for p in data['plans']}) > 1:
        values['term_warning'] += ' 계약기간이 서로 다릅니다.'
    tabs, panels, seen = [], [], set()
    for i,idea in enumerate(data['ideas']):
        key = idea['id']
        if not re.fullmatch(r'[a-z0-9-]+',key) or key in seen or len(idea['steps'])!=3:
            raise ValueError('Content IDs must be unique and each direction needs three steps')
        seen.add(key)
        tabs.append(f'<button id="tab-{key}" type="button" role="tab" aria-controls="idea-{key}" aria-selected="{str(i==0).lower()}" tabindex="{0 if i==0 else -1}" data-idea="{key}">{escape(idea["tab"])}</button>')
        steps=''.join(f'<li><span>{label}</span><b>{escape(text)}</b></li>' for label,text in zip(['보여주기','고르게 하기','연결하기'],idea['steps']))
        hidden='' if i==0 else ' hidden'
        panels.append(f'<div id="idea-{key}" role="tabpanel" aria-labelledby="tab-{key}" class="idea-panel"{hidden}><p class="idea-kicker">{escape(idea["audience"])}</p><h3>{escape(idea["first"])}<br><em>{escape(idea["second"])}</em></h3><ol class="story">{steps}</ol></div>')
    values['idea_tabs'],values['idea_panels']=''.join(tabs),''.join(panels)
    html = (KIT/'template.html').read_text(encoding='utf-8')
    def substitute(match):
        key = match.group(1)
        if key not in values or not values[key].strip():
            raise ValueError('Missing template value: '+key)
        return values[key]
    return re.sub(r'\{\{([a-z_]+)\}\}',substitute,html)

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--input',required=True)
    parser.add_argument('--out',help='Local preview output directory; defaults to proposals/<slug>')
    parser.add_argument('--replace',action='store_true',help='Explicitly replace the generated HTML/CSS/JS at the chosen destination')
    args=parser.parse_args()
    data=json.loads(Path(args.input).read_text(encoding='utf-8-sig'))
    common=json.loads((REPO/'data/proposals/_common.json').read_text(encoding='utf-8-sig'))
    html=render(data,common)
    out=Path(args.out).resolve() if args.out else REPO/'proposals'/data['slug']
    if data.get('test_only') and (out==REPO or REPO in out.parents):
        raise ValueError('Test fixtures must be generated outside the deployment repository')
    names=['index.html','style.css','interaction.js']
    if not args.replace and any((out/n).exists() for n in names):
        raise FileExistsError('Existing proposal preserved; review destination and pass --replace explicitly')
    out.mkdir(parents=True,exist_ok=True)
    (out/'index.html').write_text(html,encoding='utf-8')
    for name in names[1:]: shutil.copyfile(KIT/name,out/name)
    print(json.dumps({'status':'LOCAL_BUILD_ONLY','output':str(out),'future_public_path':'/proposals/'+data['slug']+'/','published':False,'sent':False},ensure_ascii=False))

if __name__=='__main__': main()
