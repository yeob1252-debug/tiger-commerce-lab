/**
 * 타이거커머스랩 사장님 대시보드 백엔드 (Google Apps Script Web App)
 *
 * 이 스크립트는 "고객목록" 탭이 있는 마스터 스프레드시트에 바인딩해서 배포한다.
 * 배포 방법은 저장소 루트의 docs/apps-script-deploy-guide.md 참고.
 *
 * 절대 비밀번호를 응답으로 돌려주지 않는다. 로그인 성공 시 임시 토큰만 발급하고,
 * 대시보드 조회/댓글 작성은 그 토큰이 유효할 때만 허용한다(6시간 만료).
 */

const MASTER_SHEET_ID = '136ndDU2fJfoLP3w39Pxv4yoACGrzmVKNJ49mu0myf8g';
const CLIENT_LIST_TAB = '고객목록';
const TOKEN_TTL_SECONDS = 6 * 60 * 60; // 6시간

function doGet(e) {
  const action = e.parameter.action;
  try {
    if (action === 'getClientData') {
      return jsonResponse_(getClientData_(e.parameter.slug, e.parameter.token));
    }
    if (action === 'getClientList') {
      return jsonResponse_(getClientList_());
    }
    return jsonResponse_({ error: 'unknown action' });
  } catch (err) {
    return jsonResponse_({ error: String(err) });
  }
}

function doPost(e) {
  const action = e.parameter.action;
  try {
    if (action === 'login') {
      return jsonResponse_(login_(e.parameter.storeName, e.parameter.password));
    }
    if (action === 'addComment') {
      return jsonResponse_(
        addComment_(e.parameter.slug, e.parameter.token, e.parameter.author, e.parameter.text)
      );
    }
    return jsonResponse_({ error: 'unknown action' });
  } catch (err) {
    return jsonResponse_({ error: String(err) });
  }
}

function jsonResponse_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}

/* ---------- 고객목록(마스터 시트) ---------- */

function getClientRows_() {
  const sheet = SpreadsheetApp.openById(MASTER_SHEET_ID).getSheetByName(CLIENT_LIST_TAB);
  const values = sheet.getDataRange().getValues();
  const headers = values[0];
  return values
    .slice(1)
    .filter((row) => row.some((c) => c !== ''))
    .map((row) => {
      const obj = {};
      headers.forEach((h, i) => (obj[h] = row[i]));
      return obj;
    });
}

function findClientBySlug_(slug) {
  return getClientRows_().find((r) => String(r['slug']).trim() === String(slug).trim());
}

function getClientList_() {
  return getClientRows_().map((r) => ({ slug: r['slug'], storeName: r['매장명'] }));
}

/* ---------- 로그인 / 토큰 ---------- */

function login_(storeName, password) {
  if (!storeName || !password) {
    return { success: false, message: '매장명 또는 비밀번호가 올바르지 않습니다' };
  }
  const match = getClientRows_().find(
    (r) =>
      String(r['매장명']).trim() === String(storeName).trim() &&
      String(r['로그인비밀번호']) === String(password)
  );
  if (!match) {
    return { success: false, message: '매장명 또는 비밀번호가 올바르지 않습니다' };
  }
  const token = Utilities.getUuid();
  CacheService.getScriptCache().put('token_' + token, String(match['slug']), TOKEN_TTL_SECONDS);
  return { success: true, slug: match['slug'], storeName: match['매장명'], token: token };
}

function verifyToken_(slug, token) {
  if (!slug || !token) return false;
  const cachedSlug = CacheService.getScriptCache().get('token_' + token);
  return cachedSlug === String(slug);
}

/* ---------- 클라이언트 대시보드 데이터 ---------- */

function sheetToObjects_(sheet) {
  const values = sheet.getDataRange().getValues();
  if (values.length < 1) return [];
  const headers = values[0];
  return values
    .slice(1)
    .filter((row) => row.some((c) => c !== ''))
    .map((row) => {
      const obj = {};
      headers.forEach((h, i) => (obj[h] = row[i]));
      return obj;
    });
}

/* '대시보드' 탭은 1행에 항목 이름, 2행에 실제 값이 가로로 나열된 표
   형식이다(세로형 key-value가 아님) — 헤더 행을 키로, 그 아래 첫 데이터
   행을 값으로 매핑한다. */
function sheetRowToObject_(sheet) {
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return {};
  const headers = values[0];
  const row = values[1];
  const obj = {};
  headers.forEach((h, i) => {
    if (h !== '') obj[h] = row[i];
  });
  return obj;
}

function getClientData_(slug, token) {
  if (!verifyToken_(slug, token)) {
    return { error: 'unauthorized' };
  }
  const client = findClientBySlug_(slug);
  if (!client) return { error: 'not found' };

  const ss = SpreadsheetApp.openById(client['구글시트ID']);
  const dashboardSheet = ss.getSheetByName('대시보드');
  const monthlySheet = ss.getSheetByName('월간성과');
  const calendarSheet = ss.getSheetByName('운영캘린더');
  const menuSheet = ss.getSheetByName('메뉴단가');
  const boardSheet = ss.getSheetByName('소통게시판');

  return {
    storeName: client['매장명'],
    dashboard: dashboardSheet ? sheetRowToObject_(dashboardSheet) : {},
    monthly: monthlySheet ? sheetToObjects_(monthlySheet) : [],
    calendar: calendarSheet ? sheetToObjects_(calendarSheet) : [],
    menu: menuSheet ? sheetToObjects_(menuSheet) : [],
    board: boardSheet ? sheetToObjects_(boardSheet).reverse() : [],
  };
}

function addComment_(slug, token, author, text) {
  if (!verifyToken_(slug, token)) {
    return { error: 'unauthorized' };
  }
  if (!text || !String(text).trim()) {
    return { error: 'empty text' };
  }
  const client = findClientBySlug_(slug);
  if (!client) return { error: 'not found' };

  const ss = SpreadsheetApp.openById(client['구글시트ID']);
  const sheet = ss.getSheetByName('소통게시판');
  const now = Utilities.formatDate(new Date(), 'Asia/Seoul', 'yyyy-MM-dd HH:mm');
  sheet.appendRow([now, author || '사장님', text]);
  return { success: true };
}
