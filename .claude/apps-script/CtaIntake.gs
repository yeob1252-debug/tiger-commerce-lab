/**
 * TIGER 홈페이지 통합 CTA 접수 백엔드.
 *
 * 연결 대상:
 * - 네이버 플레이스 무료점검
 * - 온라인판매 가능성 점검
 * - 요금제/일반 통합운영 상담
 *
 * 이 코드는 `타이거커머스랩_온라인판매점검_신청데이터`에 바인딩된
 * Apps Script 프로젝트에 배포한다. 기존 `Untitled` 탭은 보존하고,
 * 신규 접수는 `통합문의` 탭에 저장한다.
 */

const CTA_SHEET_NAME = '통합문의';
const CTA_MESSAGE_SOURCE = 'TIGER_CTA_SYNC';
const CTA_NOTIFICATION_RECIPIENT_PROPERTY = 'TIGER_INTAKE_NOTIFICATION_RECIPIENT';
const CTA_HEADERS = [
  '타임스탬프',
  '제출ID',
  '문의유형',
  '매장명',
  '매장지역',
  '연락처',
  '현재온라인판매',
  '유입섹션',
  '유입CTA',
  '선택진단',
  '선택플랜',
  '선택기간',
  '월이용료',
  '플랜CTA',
  '선택서비스',
  '히어로슬라이드',
  'SNS목표',
  'SNS주소',
  '플레이스URL',
  '플레이스운영여부',
  '플레이스고민항목',
  '플레이스추가내용',
  '운영기간',
  '사업자등록여부',
  '즉석판매제조가공업여부',
  '현재영업형태',
  '통신판매업여부',
  '공간분리가능여부',
  '보건증',
  '위생교육',
  '대표메뉴1',
  '대표메뉴1가격',
  '대표메뉴2',
  '대표메뉴2가격',
  '대표메뉴3',
  '대표메뉴3가격',
  '포장비',
  '배송비부담주체',
  '강점스토리',
  '추가메시지',
  '개인정보동의',
  '처리상태',
];

function doGet() {
  return jsonResponse_({ ok: true, service: CTA_MESSAGE_SOURCE, sheet: CTA_SHEET_NAME });
}

function doPost(e) {
  let leadId = '';
  let alertSent = false;
  try {
    const raw = e && e.parameter && e.parameter.payload
      ? e.parameter.payload
      : (e && e.postData && e.postData.contents ? e.postData.contents : '{}');
    const data = JSON.parse(raw);
    leadId = clean_(data['제출ID']);
    if (!leadId) throw new Error('제출ID가 없습니다.');

    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      const sheet = getOrCreateCtaSheet_();
      if (!hasLeadId_(sheet, leadId)) {
        const row = CTA_HEADERS.map((header) => {
          if (header === '타임스탬프') return new Date();
          if (header === '처리상태') return clean_(data[header]) || '신규';
          return clean_(data[header]);
        });
        sheet.appendRow(row);
        SpreadsheetApp.flush();
      }
      alertSent = sendOperatorAlertOnce_(data, leadId);
    } finally {
      lock.releaseLock();
    }

    return iframeResponse_({ source: CTA_MESSAGE_SOURCE, ok: true, leadId: leadId, alertSent: alertSent });
  } catch (error) {
    console.error(error);
    return iframeResponse_({
      source: CTA_MESSAGE_SOURCE,
      ok: false,
      leadId: leadId,
      message: '접수 저장에 실패했습니다.',
    });
  }
}

function sendOperatorAlertOnce_(data, leadId) {
  const properties = PropertiesService.getScriptProperties();
  const alertKey = 'CTA_ALERT_SENT_' + Utilities.base64EncodeWebSafe(
    Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, leadId)
  );
  if (properties.getProperty(alertKey) === 'SENT') return false;

  const recipient = clean_(properties.getProperty(CTA_NOTIFICATION_RECIPIENT_PROPERTY));
  if (!recipient) {
    throw new Error('접수 알림 수신 주소가 설정되지 않았습니다.');
  }

  const inquiryType = clean_(data['문의유형']) || '일반상담';
  const testPrefix = /^TEST[-_\s]|\[TEST\]/i.test(leadId) || /\[TEST\]/i.test(clean_(data['매장명'])) ? '[TEST] ' : '';
  const subject = testPrefix + '[TIGER 접수][' + inquiryType + '] ' + (clean_(data['매장명']) || '매장명 미입력') + ' · ' + leadId;
  const body = [
    'TIGER COMMERCE LAB 홈페이지에 새 접수가 저장되었습니다.',
    '',
    '제출 ID: ' + leadId,
    '문의 유형: ' + inquiryType,
    '매장명: ' + clean_(data['매장명']),
    '매장 지역: ' + clean_(data['매장지역']),
    '연락처: ' + clean_(data['연락처']),
    'SNS 목표: ' + clean_(data['SNS목표']),
    '선택 진단: ' + clean_(data['선택진단']),
    '선택 플랜: ' + clean_(data['선택플랜']),
    '선택 기간: ' + clean_(data['선택기간']),
    '월 이용료: ' + clean_(data['월이용료']),
    '유입 섹션: ' + clean_(data['유입섹션']),
    '유입 CTA: ' + clean_(data['유입CTA']),
    '추가 메시지: ' + clean_(data['추가메시지']),
    '',
    '처리 상태: 신규',
  ].join('\n');

  MailApp.sendEmail({ to: recipient, subject: subject, body: body });
  properties.setProperty(alertKey, 'SENT');
  return true;
}

function getOrCreateCtaSheet_() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(CTA_SHEET_NAME);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(CTA_SHEET_NAME);
    sheet.getRange(1, 1, 1, CTA_HEADERS.length).setValues([CTA_HEADERS]);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, CTA_HEADERS.length)
      .setBackground('#181B20')
      .setFontColor('#FFFFFF')
      .setFontWeight('bold')
      .setWrap(true);
    sheet.getRange('A:A').setNumberFormat('yyyy-mm-dd hh:mm:ss');
    sheet.setColumnWidth(1, 150);
    sheet.setColumnWidth(2, 250);
    sheet.setColumnWidth(3, 190);
    sheet.setColumnWidth(4, 180);
    sheet.setColumnWidth(5, 150);
    sheet.setColumnWidth(6, 150);
    sheet.setColumnWidth(40, 300);
  } else {
    const currentHeaders = sheet.getRange(1, 1, 1, CTA_HEADERS.length).getDisplayValues()[0];
    const mismatch = CTA_HEADERS.some((header, index) => currentHeaders[index] !== header);
    if (mismatch) throw new Error('통합문의 시트 헤더가 정본과 다릅니다.');
  }
  return sheet;
}

function hasLeadId_(sheet, leadId) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return false;
  return sheet.getRange(2, 2, lastRow - 1, 1)
    .getDisplayValues()
    .some((row) => row[0] === leadId);
}

function clean_(value) {
  return value == null ? '' : String(value).trim();
}

function jsonResponse_(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

function iframeResponse_(payload) {
  const safePayload = JSON.stringify(payload).replace(/</g, '\\u003c');
  return HtmlService.createHtmlOutput(
    '<!doctype html><meta charset="utf-8"><script>' +
    'window.top.postMessage(' + safePayload + ', "*");' +
    '</script>'
  ).setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
