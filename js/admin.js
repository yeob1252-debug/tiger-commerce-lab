(function () {
  'use strict';

  const loadingEl = document.getElementById('adminLoading');
  const listEl = document.getElementById('adminList');

  DashboardCommon.getFromScript('getClientList', {})
    .then(function (rows) {
      if (!rows || !rows.length) {
        loadingEl.textContent = '등록된 매장이 없습니다';
        return;
      }
      listEl.innerHTML = rows
        .map(function (r) {
          return (
            '<div class="admin-row">' +
            '<span><span class="admin-row-name">' + (r.storeName || '') + '</span>' +
            '<span class="admin-row-slug">' + (r.slug || '') + '</span></span>' +
            '<a class="admin-row-link" href="/client/' + encodeURIComponent(r.slug) + '">대시보드 보기</a>' +
            '</div>'
          );
        })
        .join('');
      loadingEl.hidden = true;
      listEl.hidden = false;
    })
    .catch(function () {
      loadingEl.textContent = '목록을 불러오지 못했습니다';
    });
})();
