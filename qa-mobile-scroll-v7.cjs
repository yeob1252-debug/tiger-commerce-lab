const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const repo = __dirname;
const jsdomRoot = path.resolve(repo, '../jsdom-qa.my0PmN');
const { JSDOM } = require(path.join(jsdomRoot, 'node_modules', 'jsdom'));
const html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8').replace('<script src="js/main.js"></script>', '');
const mainJs = fs.readFileSync(path.join(repo, 'js/main.js'), 'utf8');
const common = JSON.parse(fs.readFileSync(path.join(repo, 'data/proposals/_common.json'), 'utf8'));
const runtimeErrors = [];
let scrollY = 0;

const dom = new JSDOM(html, {
  url: 'https://mobile-preview.local/',
  runScripts: 'dangerously',
  pretendToBeVisual: true,
  beforeParse(window) {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 390 });
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 844 });
    Object.defineProperty(window, 'scrollY', { configurable: true, get: () => scrollY });
    window.matchMedia = (query) => ({ matches: query.includes('max-width: 809px'), addEventListener() {}, removeEventListener() {} });
    window.HTMLElement.prototype.scrollIntoView = () => {};
    window.IntersectionObserver = class {
      constructor(callback) { this.callback = callback; }
      observe(target) { this.callback([{ target, isIntersecting: true }]); }
      unobserve() {}
      disconnect() {}
    };
    window.fetch = async (url) => {
      if (String(url).includes('_common.json')) return { ok: true, json: async () => common };
      return { ok: true, json: async () => ({ ok: true }) };
    };
    window.HTMLFormElement.prototype.submit = () => {};
    window.addEventListener('error', (event) => runtimeErrors.push(String(event.error || event.message)));
    window.console.error = (...args) => runtimeErrors.push(args.join(' '));
  },
});

const { document, Event } = dom.window;
const stages = {
  hero: { selector: '.hero-media', start: 0, height: 1165 },
  story: { selector: '#story', start: 4000, height: 2110 },
  process: { selector: '#content-commerce', start: 7000, height: 2110 },
  operation: { selector: '.operation-showcase', start: 10500, height: 1730 },
};

Object.values(stages).forEach(({ selector, start, height }) => {
  const element = document.querySelector(selector);
  assert.ok(element, `missing ${selector}`);
  Object.defineProperty(element, 'offsetHeight', { configurable: true, value: height });
  element.getBoundingClientRect = () => ({ top: start - scrollY, bottom: start - scrollY + height, left: 0, right: 390, width: 390, height });
});

dom.window.eval(mainJs);
const wait = (ms = 30) => new Promise((resolve) => setTimeout(resolve, ms));
const moveToProgress = async (stage, progress, topOffset = 0) => {
  const visibleHeight = 844 - topOffset;
  const range = stage.height - visibleHeight;
  scrollY = stage.start - topOffset + (range * progress);
  dom.window.dispatchEvent(new Event('scroll'));
  await wait();
};

(async () => {
  await wait(60);

  assert.match(document.querySelector('.hero-tiger-base').src, /tiger-hero-mobile-cinematic\.webp$/);
  assert.match(document.querySelector('.hero-tiger-illuminated').src, /tiger-hero-mobile-illuminated\.webp$/);

  await moveToProgress(stages.hero, 0.5);
  const tigerProgress = Number(document.querySelector('#hero').dataset.mobileTigerProgress);
  assert.ok(tigerProgress >= 49 && tigerProgress <= 51, `tiger progress ${tigerProgress}`);

  await moveToProgress(stages.story, 0.38, 62);
  assert.equal(document.querySelector('#storyScreen').dataset.state, '1', 'story changes to connection');
  assert.match(document.querySelector('#storyImage').src, /story-connection\.webp$/);

  await moveToProgress(stages.process, 0.62, 62);
  assert.equal(document.querySelector('#content-commerce').dataset.activeStep, '2', 'process changes to conversion');
  assert.equal(document.querySelector('[data-process-step="2"]').classList.contains('is-active'), true);
  const processProgress = parseFloat(document.querySelector('#content-commerce').style.getPropertyValue('--mobile-progress'));
  assert.ok(processProgress > 61.9 && processProgress < 62.1, `process progress ${processProgress}`);

  await moveToProgress(stages.operation, 0.85, 62);
  assert.equal(document.querySelector('#operationShowcase').dataset.activeOperation, 'community', 'operation changes to community');
  assert.match(document.querySelector('#operationImage').src, /mom-community-spread\.webp$/);
  assert.equal(runtimeErrors.length, 0, `runtime errors: ${runtimeErrors.join(' | ')}`);

  console.log(JSON.stringify({ status: 'PASS', viewport: '390x844', tigerProgress, storyStep: 1, processStep: 2, operation: 'community', runtimeErrors: 0 }, null, 2));
  dom.window.close();
})().catch((error) => {
  console.error(error.stack || error);
  process.exitCode = 1;
});
