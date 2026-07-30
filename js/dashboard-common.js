/* 사장님 대시보드 공통 유틸 — login.html / client.html / admin.html 에서 공용으로 사용 */
(function (global) {
  'use strict';

  const SESSION_KEY = 'tcl_dashboard_session';

  function postToScript(action, params) {
    const body = new URLSearchParams(Object.assign({ action: action }, params));
    return fetch(APPS_SCRIPT_URL, { method: 'POST', body: body }).then((r) => r.json());
  }

  function getFromScript(action, params) {
    const qs = new URLSearchParams(Object.assign({ action: action }, params));
    return fetch(APPS_SCRIPT_URL + '?' + qs.toString()).then((r) => r.json());
  }

  function saveSession(session) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }

  function getSession() {
    try {
      return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
    } catch (e) {
      return null;
    }
  }

  function clearSession() {
    localStorage.removeItem(SESSION_KEY);
  }

  /* client.html에서 호출: 세션이 없거나 slug가 다르면 로그인 페이지로 보낸다 */
  function requireSession(slug) {
    const session = getSession();
    if (!session || !session.token || session.slug !== slug) {
      window.location.href = '/login';
      return null;
    }
    return session;
  }

  global.DashboardCommon = {
    postToScript: postToScript,
    getFromScript: getFromScript,
    saveSession: saveSession,
    getSession: getSession,
    clearSession: clearSession,
    requireSession: requireSession,
  };
})(window);
