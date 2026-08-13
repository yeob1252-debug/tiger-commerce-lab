const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const repo = __dirname;
const jsdomRoot = path.resolve(repo, '../jsdom-qa.my0PmN');
const { JSDOM } = require(path.join(jsdomRoot, 'node_modules', 'jsdom'));
const html = fs.readFileSync(path.join(repo, 'proposal.html'), 'utf8').replace('<script src="js/proposal.js" defer></script>', '');
const script = fs.readFileSync(path.join(repo, 'js/proposal.js'), 'utf8');
const homepageHtml = fs.readFileSync(path.join(repo, 'index.html'), 'utf8').replace('<script src="js/main.js"></script>', '');
const homepageScript = fs.readFileSync(path.join(repo, 'js/main.js'), 'utf8');
const css = fs.readFileSync(path.join(repo, 'css/proposal.css'), 'utf8');
const client = JSON.parse(fs.readFileSync(path.join(repo, 'data/proposals/gijang-endhouse.json'), 'utf8'));
const common = JSON.parse(fs.readFileSync(path.join(repo, 'data/proposals/_common.json'), 'utf8'));
const runtimeErrors = [];
let scrollY = 0;

const dom = new JSDOM(html, {
  url: 'https://preview.local/proposal/gijang-endhouse',
  runScripts: 'dangerously',
  pretendToBeVisual: true,
  beforeParse(window) {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 390 });
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 844 });
    Object.defineProperty(window, 'scrollY', { configurable: true, get: () => scrollY });
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
      if (String(url).includes('gijang-endhouse.json')) return { ok: true, json: async () => client };
      return { ok: false, status: 404, json: async () => ({}) };
    };
    window.addEventListener('error', (event) => runtimeErrors.push(String(event.error || event.message)));
    window.console.error = (...args) => runtimeErrors.push(args.join(' '));
  },
});

dom.window.eval(script);
const { document, Event, MouseEvent } = dom.window;
const wait = (ms = 30) => new Promise((resolve) => setTimeout(resolve, ms));
const click = (selector) => {
  const target = document.querySelector(selector);
  assert.ok(target, `missing ${selector}`);
  target.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
};

function setStage(selector, start, height) {
  const element = document.querySelector(selector);
  assert.ok(element, `missing ${selector}`);
  Object.defineProperty(element, 'offsetHeight', { configurable: true, value: height });
  element.getBoundingClientRect = () => ({ top: start - scrollY, bottom: start - scrollY + height, left: 0, right: 390, width: 390, height });
  return { start, height };
}

async function move(stage, progress) {
  scrollY = stage.start + ((stage.height - 844) * progress);
  dom.window.dispatchEvent(new Event('scroll'));
  await wait();
}

async function verifyPlanHandoff() {
  const handoffErrors = [];
  const homepage = new JSDOM(homepageHtml, {
    url: 'https://preview.local/index.html?proposalPlan=1#contact',
    runScripts: 'dangerously',
    pretendToBeVisual: true,
    beforeParse(window) {
      window.matchMedia = () => ({ matches: true, addEventListener() {}, removeEventListener() {} });
      window.HTMLElement.prototype.scrollIntoView = () => {};
      window.IntersectionObserver = class { observe() {} unobserve() {} disconnect() {} };
      window.fetch = async (url) => String(url).includes('_common.json')
        ? { ok: true, json: async () => common }
        : { ok: true, json: async () => ({ ok: true }) };
      window.HTMLFormElement.prototype.submit = () => {};
      window.sessionStorage.setItem('tiger_plan_interest', JSON.stringify({ planId: 'PERFORMANCE', term: 6, monthlyPrice: 1700000, planCta: 'PERFORMANCE로 통합운영 상담하기' }));
      window.addEventListener('error', (event) => handoffErrors.push(String(event.error || event.message)));
      window.console.error = (...args) => handoffErrors.push(args.join(' '));
    },
  });
  homepage.window.eval(homepageScript);
  await new Promise((resolve) => setTimeout(resolve, 70));
  const homeDoc = homepage.window.document;
  assert.equal(homeDoc.querySelector('#sharedFormShell').hidden, false, 'proposal plan opens homepage form');
  assert.equal(homeDoc.querySelector('#selectedPlanField').value, 'PERFORMANCE');
  assert.equal(homeDoc.querySelector('#selectedTermField').value, '6');
  assert.match(homeDoc.querySelector('#selectedMonthlyPriceField').value, /170만원/);
  assert.equal(homepage.window.sessionStorage.getItem('tiger_plan_interest'), null, 'handoff storage cleared');
  assert.equal(handoffErrors.length, 0, `handoff runtime errors: ${handoffErrors.join(' | ')}`);
  homepage.window.close();
}

(async () => {
  await wait(80);
  assert.equal(document.querySelectorAll('#proposalRoot > section').length, 12, '12 proposal sections');
  assert.equal(document.querySelectorAll('h1').length, 1, 'single h1');
  const ids = [...document.querySelectorAll('[id]')].map((item) => item.id);
  assert.equal(new Set(ids).size, ids.length, 'no duplicate ids');

  assert.match(document.querySelector('.prop-hero-tiger').src, /tiger-hero-cinematic\.webp$/);
  assert.match(document.querySelector('.prop-hero-tiger-lit').src, /tiger-hero-illuminated\.webp$/);
  const mobileSources = [...document.querySelectorAll('.prop-hero source')].map((item) => item.srcset);
  assert.deepEqual(mobileSources, ['assets/home/v7/tiger-hero-mobile-cinematic.webp', 'assets/home/v7/tiger-hero-mobile-illuminated.webp']);

  assert.equal(document.querySelectorAll('[data-flow-step]').length, 5, 'five journey steps');
  assert.equal(document.querySelectorAll('[data-engine-step]').length, 4, 'four engine steps');
  assert.equal(document.querySelectorAll('[data-week-step]').length, 4, 'four week steps');
  assert.equal(document.querySelectorAll('.prop-plan-card').length, 4, 'four plans');
  assert.deepEqual([...document.querySelectorAll('.prop-plan-price')].map((item) => item.firstChild.textContent.trim()), ['700,000', '1,000,000', '1,500,000', '2,000,000']);
  assert.equal(document.querySelector('.prop-plan-badge').textContent, '\u00a0');
  assert.equal([...document.querySelectorAll('.prop-plan-badge')].some((item) => item.textContent === 'TIGER RECOMMENDED'), true);
  assert.doesNotMatch(document.body.textContent, /가장 많이 선택/);
  click('[data-prop-term="6"]');
  assert.deepEqual([...document.querySelectorAll('.prop-plan-price')].map((item) => item.firstChild.textContent.trim()), ['900,000', '1,200,000', '1,700,000', '2,200,000']);

  assert.equal(document.querySelectorAll('[data-operation-step]').length, 3, 'three operation modes');
  click('[data-operation-step="1"]');
  assert.match(document.querySelector('[data-operation-title]').textContent, /신인판매왕/);
  assert.match(document.querySelector('[data-operation-image]').src, /menu-to-commerce\.webp$/);
  click('[data-operation-step="2"]');
  assert.match(document.querySelector('[data-operation-caption]').textContent, /실제 후기·성과값 아님/);
  assert.equal(document.querySelectorAll('a[href="https://open.kakao.com/o/sgxBgDIi"]').length, 2, 'two Kakao CTAs');

  const hero = setStage('.prop-hero', 0, 1080);
  const flow = setStage('[data-scroll-story="flow"]', 3200, 1850);
  const engine = setStage('[data-scroll-story="engine"]', 6000, 1810);
  const week = setStage('[data-scroll-story="week"]', 8500, 1600);
  const operation = setStage('[data-scroll-story="operation"]', 10900, 1520);
  await move(hero, .8);
  const heroEye = Number(document.querySelector('.prop-hero').style.getPropertyValue('--eye'));
  assert.ok(heroEye > .9, `hero eye intensity ${heroEye}`);
  await move(flow, .75);
  assert.equal(document.querySelector('[data-flow-step="3"]').classList.contains('is-active'), true, 'flow changes on scroll');
  await move(engine, .6);
  assert.equal(document.querySelector('.prop-engine-card h3').textContent, 'VALUE', 'engine changes on scroll');
  await move(week, .9);
  assert.equal(document.querySelector('[data-week-step="3"]').classList.contains('is-active'), true, 'week changes on scroll');
  await move(operation, .9);
  assert.match(document.querySelector('[data-operation-title]').textContent, /맘커뮤니티/, 'operation changes on scroll');

  const localAssets = [
    ...document.querySelectorAll('img[src]'),
    ...document.querySelectorAll('source[srcset]'),
    ...document.querySelectorAll('link[href]'),
  ].map((element) => element.getAttribute('src') || element.getAttribute('srcset') || element.getAttribute('href'))
    .filter((source) => source && !/^(https?:|data:|#)/.test(source));
  localAssets.forEach((source) => assert.ok(fs.existsSync(path.join(repo, source.replace(/^\//, ''))), `missing local asset: ${source}`));

  assert.match(css, /\.prop-hero\s*\{[^}]*min-height:\s*128svh/s);
  assert.match(css, /\.prop-flow\s*\{\s*min-height:\s*220svh/);
  assert.match(css, /\.prop-engine\s*\{\s*min-height:\s*215svh/);
  assert.match(css, /\.prop-week\s*\{\s*min-height:\s*190svh/);
  assert.match(css, /\.prop-operation\s*\{\s*min-height:\s*180svh/);
  assert.match(css, /@media \(min-width: 810px\) and \(max-width: 1199px\)/);
  assert.match(css, /prefers-reduced-motion/);
  assert.doesNotMatch(css, /var\(--(?:bg|card|card-border|font-display|accent)\)/);
  await verifyPlanHandoff();
  assert.equal(runtimeErrors.length, 0, `runtime errors: ${runtimeErrors.join(' | ')}`);

  console.log(JSON.stringify({ status: 'PASS', viewport: '390x844', sections: 12, plans: 4, prices: 'homepage-shared', planHandoff: 'PASS', scrollStories: 5, kakaoLinks: 2, localAssets: localAssets.length, runtimeErrors: 0 }, null, 2));
  dom.window.close();
})().catch((error) => {
  console.error(error.stack || error);
  process.exitCode = 1;
});
