const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const repo = __dirname;
const { JSDOM } = require('../qa-env/node_modules/jsdom');
const html = fs.readFileSync(path.join(repo, 'proposal.html'), 'utf8').replace('<script src="js/proposal.js" defer></script>', '');
const script = fs.readFileSync(path.join(repo, 'js/proposal.js'), 'utf8');
const client = JSON.parse(fs.readFileSync(path.join(repo, 'data/proposals/namcheon-bulgogi.json'), 'utf8'));
const common = JSON.parse(fs.readFileSync(path.join(repo, 'data/proposals/_common.json'), 'utf8'));
const runtimeErrors = [];

const dom = new JSDOM(html, {
  url: 'https://preview.local/proposal/namcheon-bulgogi',
  runScripts: 'dangerously',
  pretendToBeVisual: true,
  beforeParse(window) {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 390 });
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 844 });
    window.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
    window.HTMLElement.prototype.scrollIntoView = () => {};
    window.IntersectionObserver = class {
      constructor(callback) { this.callback = callback; }
      observe(target) { this.callback([{ target, isIntersecting: true }]); }
      unobserve() {}
      disconnect() {}
    };
    window.fetch = async (url) => {
      if (String(url).includes('_common.json')) return { ok: true, json: async () => common };
      if (String(url).includes('namcheon-bulgogi.json')) return { ok: true, json: async () => client };
      return { ok: false, status: 404, json: async () => ({}) };
    };
    window.addEventListener('error', (event) => runtimeErrors.push(String(event.error || event.message)));
    window.console.error = (...args) => runtimeErrors.push(args.join(' '));
  },
});

dom.window.eval(script);
const { document, MouseEvent } = dom.window;
const click = (selector) => {
  const target = document.querySelector(selector);
  assert.ok(target, `missing ${selector}`);
  target.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
};

setTimeout(() => {
  try {
    assert.equal(document.querySelectorAll('#proposalRoot > section').length, 12, '12 proposal sections');
    assert.equal(document.querySelectorAll('h1').length, 1, 'single h1');
    assert.match(document.title, /남천불고기/);
    assert.equal(document.querySelector('meta[name="robots"]')?.content, 'noindex,nofollow,noarchive');
    assert.match(document.querySelector('meta[property="og:title"]')?.content || '', /남천불고기/);
    assert.match(document.querySelector('meta[property="og:image"]')?.content || '', /og-namcheon-bulgogi-1200x630\.jpg$/);
    assert.match(document.querySelector('.prop-hero h1')?.textContent || '', /남천동에서 불고기를 찾는 순간/);
    assert.match(document.querySelector('.prop-hero-tiger')?.getAttribute('src') || '', /hero-v1\.webp$/);
    assert.equal(document.querySelectorAll('.prop-hero source').length, 0, 'client hero does not render tiger mobile sources');
    assert.equal(document.querySelectorAll('[data-flow-step]').length, 5);
    assert.equal(document.querySelectorAll('[data-engine-step]').length, 4);
    assert.match(document.querySelector('.prop-engine-image')?.getAttribute('src') || '', /hook-v1\.webp$/);
    click('[data-engine-step="1"]');
    assert.match(document.querySelector('.prop-engine-image')?.getAttribute('src') || '', /retention-v1\.webp$/);
    click('[data-engine-step="2"]');
    assert.match(document.querySelector('.prop-engine-image')?.getAttribute('src') || '', /value-v1\.webp$/);
    click('[data-engine-step="3"]');
    assert.match(document.querySelector('.prop-engine-image')?.getAttribute('src') || '', /cta-v1\.webp$/);
    assert.equal(document.querySelectorAll('[data-week-step]').length, 4);
    assert.equal(document.querySelectorAll('.prop-plan-card').length, 4);
    assert.equal(document.querySelector('.prop-plan-card.is-recommended h3')?.textContent, 'PERFORMANCE');
    assert.deepEqual([...document.querySelectorAll('.prop-plan-price')].map((item) => item.firstChild.textContent.trim()), ['700,000', '1,000,000', '1,500,000', '2,000,000']);
    click('[data-prop-term="6"]');
    assert.deepEqual([...document.querySelectorAll('.prop-plan-price')].map((item) => item.firstChild.textContent.trim()), ['900,000', '1,200,000', '1,700,000', '2,200,000']);
    assert.equal(document.querySelectorAll('a[href="https://open.kakao.com/o/sgxBgDIi"]').length, 2);
    assert.equal(document.querySelector('.prop-naver-link')?.getAttribute('href'), 'https://naver.me/58qytMTJ');
    assert.match(document.body.textContent, /생성 이미지 · 실제 매장 촬영본이 아닙니다/);
    assert.doesNotMatch(document.body.textContent, /TIGER_LOGO_PRIMARY\.png/);

    const localAssets = [
      ...document.querySelectorAll('img[src]'),
      ...document.querySelectorAll('source[srcset]'),
      ...document.querySelectorAll('link[href]'),
    ].map((element) => element.getAttribute('src') || element.getAttribute('srcset') || element.getAttribute('href'))
      .filter((source) => source && !/^(https?:|data:|#)/.test(source));
    localAssets.forEach((source) => assert.ok(fs.existsSync(path.join(repo, source.replace(/^\//, ''))), `missing local asset: ${source}`));
    assert.equal(runtimeErrors.length, 0, `runtime errors: ${runtimeErrors.join(' | ')}`);
    console.log(JSON.stringify({ status: 'PASS', slug: 'namcheon-bulgogi', viewport: '390x844', sections: 12, plans: 4, generatedImages: 4, noindex: true, runtimeErrors: 0 }, null, 2));
  } catch (error) {
    console.error(error.stack || error);
    process.exitCode = 1;
  } finally {
    dom.window.close();
  }
}, 120);
