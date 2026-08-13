const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const repo = __dirname;
const jsdomRoot = path.resolve(repo, '../jsdom-qa.my0PmN');
const { JSDOM } = require(path.join(jsdomRoot, 'node_modules', 'jsdom'));
const html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8').replace('<script src="js/main.js"></script>', '');
const mainJs = fs.readFileSync(path.join(repo, 'js/main.js'), 'utf8');
const css = fs.readFileSync(path.join(repo, 'css/styles.css'), 'utf8');
const common = JSON.parse(fs.readFileSync(path.join(repo, 'data/proposals/_common.json'), 'utf8'));
const runtimeErrors = [];

const dom = new JSDOM(html, {
  url: 'https://preview.local/',
  runScripts: 'dangerously',
  pretendToBeVisual: true,
  beforeParse(window) {
    window.matchMedia = (query) => ({ matches: query.includes('prefers-reduced-motion'), addEventListener() {}, removeEventListener() {} });
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

dom.window.eval(mainJs);
const { document } = dom.window;
const wait = (ms = 20) => new Promise((resolve) => setTimeout(resolve, ms));
const click = (selector) => {
  const target = document.querySelector(selector);
  assert.ok(target, `missing ${selector}`);
  target.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true, cancelable: true }));
};

(async () => {
  await wait(50);
  assert.equal(document.querySelectorAll('main > section').length, 9, 'exactly nine homepage sections');
  assert.equal(document.querySelectorAll('form').length, 1, 'single shared form');
  assert.equal(document.querySelectorAll('h1').length, 1, 'single h1');
  const ids = [...document.querySelectorAll('[id]')].map((element) => element.id);
  assert.equal(new Set(ids).size, ids.length, 'no duplicate ids');
  const localAssets = [...document.querySelectorAll('img[src],link[href],script[src]')]
    .map((element) => element.getAttribute('src') || element.getAttribute('href'))
    .filter((source) => source && !/^(https?:|data:|#)/.test(source));
  localAssets.forEach((source) => assert.ok(fs.existsSync(path.join(repo, source)), `missing local asset: ${source}`));
  assert.match(document.querySelector('h1').textContent, /24시간 365일/);
  assert.equal(document.querySelectorAll('[data-free-check]').length, 2, 'two free services only');
  assert.equal(document.querySelector('#sharedFormShell').hidden, true, 'form closed by default');
  assert.equal(document.querySelectorAll('a[href="https://open.kakao.com/o/sgxBgDIi"]').length, 2, 'Kakao links');

  click('[data-free-check="place"]');
  assert.equal(document.querySelector('#sharedFormShell').hidden, false);
  assert.equal(document.querySelector('#sharedFormShell').parentElement.dataset.formSlot, 'place');
  assert.equal(document.querySelector('#fieldsetPlace').hidden, false);
  assert.equal(document.querySelector('#fieldsetPlace').disabled, false);
  assert.equal(document.querySelector('#fieldsetNationwide').disabled, true);
  assert.equal(document.querySelectorAll('.free-card.is-open').length, 1);
  click('[data-free-check="place"]');
  assert.equal(document.querySelector('#sharedFormShell').hidden, true, 'same button closes form');

  click('[data-free-check="nationwide"]');
  assert.equal(document.querySelector('#sharedFormShell').parentElement.dataset.formSlot, 'nationwide');
  assert.equal(document.querySelector('#fieldsetNationwide').disabled, false);
  assert.equal(document.querySelector('#inquiryType').value, '온라인판매 가능성 점검');

  click('[data-consult-open]');
  assert.equal(document.querySelector('#sharedFormShell').parentElement.id, 'consultFormSlot');
  assert.equal(document.querySelector('#fieldsetGeneral').disabled, false);
  assert.equal(document.querySelector('#inquiryType').value, 'SNS 통합운영 상담');

  assert.equal(document.querySelectorAll('.plan-card').length, 4, 'four plans loaded');
  assert.deepEqual([...document.querySelectorAll('.plan-price')].map((element) => element.firstChild.textContent.trim()), ['70만원','100만원','150만원','200만원']);
  click('[data-plan-term="6"]');
  assert.deepEqual([...document.querySelectorAll('.plan-price')].map((element) => element.firstChild.textContent.trim()), ['90만원','120만원','170만원','220만원']);
  click('[data-plan-consult="PERFORMANCE"]');
  assert.equal(document.querySelector('#selectedPlanField').value, 'PERFORMANCE');
  assert.equal(document.querySelector('#selectedTermField').value, '6');
  assert.match(document.querySelector('#selectedMonthlyPriceField').value, /170만원/);

  click('[data-operation="live"]');
  assert.match(document.querySelector('#operationTitle').textContent, /직접 LIVE/);
  assert.match(document.querySelector('#operationImage').src, /menu-to-commerce\.webp$/);
  click('.faq-question');
  assert.equal(document.querySelector('.faq-question').getAttribute('aria-expanded'), 'true');
  assert.equal(document.querySelector('.faq-answer').hidden, false);

  document.querySelector('#diagnosisForm').dispatchEvent(new dom.window.Event('submit', { bubbles: true, cancelable: true }));
  assert.match(document.querySelector('#formStatus').textContent, /필수 항목/);

  assert.match(css, /@media \(max-width: 1199px\)/);
  assert.match(css, /@media \(max-width: 809px\)/);
  assert.match(css, /@media \(max-width: 390px\)/);
  assert.match(css, /prefers-reduced-motion/);
  assert.doesNotMatch(css, /100vw/);
  assert.equal(runtimeErrors.length, 0, `runtime errors: ${runtimeErrors.join(' | ')}`);

  console.log(JSON.stringify({ status: 'PASS', sections: 9, forms: 1, freeServices: 2, plans: 4, kakaoLinks: 2, localAssets: localAssets.length, duplicateIds: 0, runtimeErrors: 0 }, null, 2));
  dom.window.close();
})().catch((error) => {
  console.error(error.stack || error);
  process.exitCode = 1;
});
