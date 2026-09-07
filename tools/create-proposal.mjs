import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const commonPath = path.join(projectRoot, 'data', 'proposals', '_common.json');
const outputDir = path.join(projectRoot, 'data', 'proposals');
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function fail(message) {
  throw new Error(message);
}

function clean(value, label, { required = true, max = 900 } = {}) {
  const result = String(value ?? '').trim();
  if (required && !result) fail(`${label}: required`);
  if (result.length > max) fail(`${label}: maximum ${max} characters`);
  if (/[<>\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(result)) fail(`${label}: markup/control characters are not allowed`);
  return result;
}

function list(value, label, min, max) {
  if (!Array.isArray(value) || value.length < min || value.length > max) fail(`${label}: requires ${min}-${max} items`);
  return value;
}

function optionalUrl(value, label) {
  const text = clean(value, label, { required: false, max: 500 });
  if (!text) return null;
  let parsed;
  try { parsed = new URL(text); } catch { fail(`${label}: invalid URL`); }
  if (!['http:', 'https:'].includes(parsed.protocol)) fail(`${label}: only http/https URLs are allowed`);
  return parsed.href;
}

function readJson(filename) {
  return JSON.parse(fs.readFileSync(filename, 'utf8'));
}

function normalizeBrief(raw, common) {
  const slug = clean(raw.slug, 'slug', { max: 80 });
  if (!slugPattern.test(slug)) fail('slug: use lowercase letters, numbers, and single hyphens only');

  const business = raw.business || {};
  const name = clean(business.name, 'business.name', { max: 80 });
  const category = clean(business.category, 'business.category', { max: 120 });
  const region = clean(business.region, 'business.region', { max: 80 });
  const goal = clean(raw.goal, 'goal', { max: 500 });

  const strengths = list(raw.verified?.strengths, 'verified.strengths', 1, 4).map((item, index) => ({
    fact: clean(item.fact, `verified.strengths[${index}].fact`, { max: 160 }),
    source: clean(item.source, `verified.strengths[${index}].source`, { max: 180 }),
  }));
  const priorities = list(raw.priorities, 'priorities', 3, 3).map((item, index) => ({
    current: clean(item.current, `priorities[${index}].current`, { max: 180 }),
    proposed: clean(item.proposed, `priorities[${index}].proposed`, { max: 180 }),
    basis: clean(item.basis, `priorities[${index}].basis`, { max: 220 }),
  }));
  const contentExamples = list(raw.content_examples, 'content_examples', 1, 3).map((item, index) => ({
    id: `example-${String(index + 1).padStart(2, '0')}`,
    title: clean(item.title, `content_examples[${index}].title`, { max: 140 }),
    format: clean(item.format, `content_examples[${index}].format`, { max: 80 }),
    hook: clean(item.hook, `content_examples[${index}].hook`, { max: 220 }),
    value: clean(item.value, `content_examples[${index}].value`, { max: 220 }),
    cta: clean(item.cta, `content_examples[${index}].cta`, { max: 160 }),
    basis: clean(item.basis, `content_examples[${index}].basis`, { max: 220 }),
  }));
  const platformRoles = list(raw.platform_roles, 'platform_roles', 1, 4).map((item, index) => ({
    platform: clean(item.platform, `platform_roles[${index}].platform`, { max: 80 }),
    customer_action: clean(item.customer_action, `platform_roles[${index}].customer_action`, { max: 140 }),
    basis: clean(item.basis, `platform_roles[${index}].basis`, { max: 220 }),
  }));
  const firstMonth = list(raw.first_month, 'first_month', 1, 4).map((item, index) => ({
    week: clean(item.week, `first_month[${index}].week`, { max: 40 }),
    focus: clean(item.focus, `first_month[${index}].focus`, { max: 120 }),
    actions: list(item.actions, `first_month[${index}].actions`, 1, 4).map((action, actionIndex) => clean(action, `first_month[${index}].actions[${actionIndex}]`, { max: 140 })),
    basis: clean(item.basis, `first_month[${index}].basis`, { max: 220 }),
  }));

  const knownPlans = new Set((common.plans?.items || []).map((plan) => plan.id));
  const knownTerms = new Set((common.plans?.terms || []).map((term) => Number(term.months)));
  const requestedPlan = clean(raw.recommendation?.plan, 'recommendation.plan', { required: false, max: 40 });
  const planBasis = clean(raw.recommendation?.basis, 'recommendation.basis', { required: false, max: 300 });
  let recommendation = { recommended_plan: null, recommended_term_months: null, basis: planBasis || '목표·예산·운영 가능 범위 확인 필요' };
  if (requestedPlan) {
    if (!knownPlans.has(requestedPlan)) fail('recommendation.plan: unknown plan id');
    if (!planBasis) fail('recommendation.basis: required when a plan is selected');
    const term = Number(raw.recommendation?.term_months || common.plans?.default_term_months);
    if (!knownTerms.has(term)) fail('recommendation.term_months: unsupported contract term');
    recommendation = { recommended_plan: requestedPlan, recommended_term_months: term, basis: planBasis };
  }

  const channels = {};
  (raw.verified?.channels || []).slice(0, 8).forEach((item, index) => {
    const id = clean(item.id, `verified.channels[${index}].id`, { max: 40 });
    if (!/^[a-z][a-z0-9_]*$/.test(id)) fail(`verified.channels[${index}].id: invalid id`);
    channels[id] = {
      status: item.status === 'ACTIVE' ? 'ACTIVE' : 'NOT_VERIFIED',
      analysis: clean(item.analysis, `verified.channels[${index}].analysis`, { max: 260 }),
      url: optionalUrl(item.url, `verified.channels[${index}].url`),
    };
  });

  const needsConfirmation = (raw.needs_confirmation || []).slice(0, 8).map((item, index) => clean(item, `needs_confirmation[${index}]`, { max: 180 }));
  const hero = raw.hero || {};
  const contact = raw.contact || {};
  const planIds = (common.plans?.items || []).map((plan) => plan.id);
  const planSection = { id: 'section-10', type: 'plans', eyebrow: 'RECOMMENDED OPERATION', plan_ids: planIds };
  if (recommendation.recommended_plan) planSection.highlight_plan = recommendation.recommended_plan;

  return {
    meta: {
      template_version: 'TIGER_PROPOSAL_5_ZONE_V1',
      client_slug: slug,
      status: raw.test_only ? 'DRAFT_TEST' : 'DRAFT_FOR_REPRESENTATIVE_REVIEW',
      generated_at: new Date().toISOString(),
      test_only: Boolean(raw.test_only),
    },
    client: {
      business_name: name,
      category,
      address: clean(business.address, 'business.address', { required: false, max: 180 }) || null,
      region,
      official_website: optionalUrl(business.official_website, 'business.official_website'),
      naver_place: optionalUrl(business.naver_place, 'business.naver_place'),
    },
    channels,
    hero: {
      eyebrow: clean(hero.eyebrow, 'hero.eyebrow', { required: false, max: 100 }) || `TIGER COMMERCE LAB × ${name}`,
      headline: clean(hero.headline, 'hero.headline', { max: 220 }),
      subheadline: clean(hero.subheadline, 'hero.subheadline', { max: 360 }),
      primary_cta: clean(hero.primary_cta, 'hero.primary_cta', { required: false, max: 80 }) || '추천 운영안 보기',
      secondary_cta: clean(hero.secondary_cta, 'hero.secondary_cta', { required: false, max: 80 }) || '매장 맞춤 제안 보기',
      trust_note: `${name} 맞춤 제안 · 제공 사실과 운영 제안 구분`,
    },
    diagnosis: {
      fact_basis: strengths,
      proposal_basis: priorities.map((item) => item.basis),
      needs_confirmation: needsConfirmation,
    },
    strategy: { primary_goal: goal, platform_roles: platformRoles },
    sections: [
      { id: 'section-01', type: 'hero', headline: clean(hero.headline, 'hero.headline', { max: 220 }) },
      { id: 'section-02', type: 'current-position', headline: `${name}의 확인된 시작점`, body: `제공 자료에서 확인된 강점만 정리했습니다. 확인이 필요한 정보 ${needsConfirmation.length}건은 사실로 단정하지 않습니다.`, cards: strengths.map((item) => item.fact) },
      { id: 'section-03', type: 'opportunity', headline: '강점을 고객의 다음 행동으로 연결합니다.', body: `목표: ${goal}`, comparison: priorities.map((item) => ({ before: item.current, after: item.proposed, basis: item.basis })) },
      { id: 'section-04', type: 'why-now', headline: '확인된 정보 안에서 실행 우선순위를 정합니다.', body: '아래 내용은 매장 제공 사실을 바탕으로 한 운영 제안이며 성과를 보장하지 않습니다.' },
      { id: 'section-07', type: 'content-examples', headline: `${name}의 강점에서 시작하는 콘텐츠`, body: '가상의 성과가 아니라 제공된 메뉴·지역·운영 조건을 바탕으로 구성한 실행 예시입니다.', content_example_ids: contentExamples.map((item) => item.id) },
      { id: 'section-09', type: 'monthly-execution', headline: '첫 달 실행 순서', weeks: firstMonth },
      planSection,
      { id: 'section-12', type: 'final-cta', headline: clean(contact.headline, 'contact.headline', { required: false, max: 200 }) || '매장 상황을 확인하고 첫 실행 범위를 정합니다.', body: clean(contact.body, 'contact.body', { required: false, max: 360 }) || '상담에서 목표·예산·운영 가능 범위를 확인한 뒤 플랜과 일정을 확정합니다.', primary_cta: clean(contact.primary_cta, 'contact.primary_cta', { required: false, max: 80 }) || '맞춤 상담 신청' },
    ],
    content_examples: contentExamples,
    monthly_execution: firstMonth,
    recommendation,
    assets: {},
    final_cta: { body: clean(contact.body, 'contact.body', { required: false, max: 360 }) || '상담에서 목표·예산·운영 가능 범위를 확인한 뒤 플랜과 일정을 확정합니다.' },
    web: {
      proposal_path: `/proposal/${slug}`,
      public_navigation: false,
      include_in_sitemap: false,
      noindex: true,
      robots: 'noindex,nofollow,noarchive',
      page_title: `${name} 맞춤 운영 제안 | TIGER COMMERCE LAB`,
      meta_description: `${name}의 확인된 강점과 목표를 바탕으로 정리한 TIGER 맞춤 운영 제안입니다.`,
    },
  };
}

function create(inputPath) {
  const common = readJson(commonPath);
  const brief = readJson(path.resolve(inputPath));
  const proposal = normalizeBrief(brief, common);
  const outputPath = path.join(outputDir, `${proposal.meta.client_slug}.json`);
  if (fs.existsSync(outputPath)) fail(`refusing overwrite: ${outputPath}`);
  fs.writeFileSync(outputPath, `${JSON.stringify(proposal, null, 2)}\n`, { encoding: 'utf8', flag: 'wx' });
  return outputPath;
}

function selfTest() {
  const common = readJson(commonPath);
  const base = readJson(path.join(projectRoot, 'data', 'proposals', 'briefs', 'test-neighborhood-table.json'));
  const checks = [
    () => normalizeBrief({ ...base, slug: '../bad' }, common),
    () => normalizeBrief({ ...base, business: { ...base.business, name: '<script>alert(1)</script>' } }, common),
  ];
  checks.forEach((check, index) => {
    let rejected = false;
    try { check(); } catch { rejected = true; }
    if (!rejected) fail(`self-test ${index + 1}: invalid input was accepted`);
  });
  const existing = path.join(outputDir, `${base.slug}.json`);
  if (!fs.existsSync(existing)) fail('self-test: generated fixture is missing');
  let overwriteRejected = false;
  try { create(path.join(projectRoot, 'data', 'proposals', 'briefs', 'test-neighborhood-table.json')); } catch (error) { overwriteRejected = /refusing overwrite/.test(error.message); }
  if (!overwriteRejected) fail('self-test: existing proposal overwrite was not rejected');
  console.log('PASS: slug, markup, and existing-file protection');
}

try {
  if (process.argv.includes('--self-test')) {
    selfTest();
  } else {
    const inputIndex = process.argv.indexOf('--input');
    if (inputIndex < 0 || !process.argv[inputIndex + 1]) fail('usage: node tools/create-proposal.mjs --input <brief.json>');
    const outputPath = create(process.argv[inputIndex + 1]);
    console.log(`CREATED ${outputPath}`);
    console.log(`PREVIEW http://127.0.0.1:5191/proposal.html?slug=${path.basename(outputPath, '.json')}`);
  }
} catch (error) {
  console.error(`ERROR ${error.message}`);
  process.exitCode = 1;
}
