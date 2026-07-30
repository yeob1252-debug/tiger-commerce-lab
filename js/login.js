(function () {
  'use strict';

  const form = document.getElementById('loginForm');
  const errorEl = document.getElementById('loginError');
  const submitBtn = form.querySelector('.login-submit');

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    errorEl.hidden = true;
    submitBtn.disabled = true;
    submitBtn.classList.add('is-loading');

    const storeName = document.getElementById('storeName').value.trim();
    const password = document.getElementById('password').value;

    DashboardCommon.postToScript('login', { storeName: storeName, password: password })
      .then(function (res) {
        if (res && res.success) {
          DashboardCommon.saveSession({
            slug: res.slug,
            storeName: res.storeName,
            token: res.token,
          });
          window.location.href = '/client/' + res.slug;
        } else {
          showError((res && res.message) || '매장명 또는 비밀번호가 올바르지 않습니다');
        }
      })
      .catch(function () {
        showError('연결에 실패했습니다. 잠시 후 다시 시도해주세요');
      });
  });

  function showError(msg) {
    errorEl.textContent = msg;
    errorEl.hidden = false;
    submitBtn.disabled = false;
    submitBtn.classList.remove('is-loading');
  }
})();
