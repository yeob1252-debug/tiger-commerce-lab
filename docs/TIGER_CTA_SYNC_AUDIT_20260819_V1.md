# 타이거커머스랩 CTA 동기화 점검 · 복구 기록 V1

- 점검일: 2026-08-19 (Asia/Seoul)
- 대상: 홈페이지 CTA, Apps Script, Google Sheets, Google Drive, 고객 대시보드 연결

## 최종 구조

`홈페이지 #diagnosisForm` → `Apps Script 웹앱 V4` → `타이거커머스랩_온라인판매점검_신청데이터 / 통합문의`

- SNS 통합운영 상담, 네이버 플레이스 무료점검, 온라인판매 가능성 점검을 하나의 42열 정본으로 통합했다.
- 홈페이지는 시트 저장 성공 메시지를 받은 뒤에만 접수 완료를 표시한다.
- 제출ID 중복 검사를 적용해 재시도에 따른 중복 저장을 막는다.
- 기존 `Untitled` 탭과 `타이거커머스랩_신청서`의 고객 대시보드 데이터는 보존했다.

## 발견·수정한 문제

1. 일반/플레이스 문의가 Google Form으로 분리돼 모드별 세부항목이 누락됐다.
2. 온라인판매 점검은 시트 저장 후에도 브라우저의 CORS/iframe 제약 때문에 실패로 표시됐다.
3. 기존 온라인판매 백엔드는 `통신판매업여부`와 CTA 유입 문맥을 저장하지 않았다.
4. 관련 스프레드시트 시간대가 `America/Los_Angeles`로 설정돼 있었다.

수정 후에는 세 문의유형을 같은 Apps Script와 `통합문의` 탭으로 연결하고, Apps Script 응답 iframe 허용 및 실제 저장 확인 메시지를 적용했다. 두 스프레드시트 시간대는 `Asia/Seoul`로 맞췄다.

## 검증 결과

- Apps Script 웹앱: V4, 기존 배포 ID/URL 유지
- 직접 POST: HTTP 200, 성공응답 확인
- 중복 제출ID 2회 전송: 시트에는 1행만 유지
- 일반 상담 화면 E2E: 성공, SNS목표·SNS주소·CTA 유입값 저장 확인
- 플레이스 화면 E2E: 성공, URL·운영여부·고민항목·추가내용 저장 확인
- 온라인판매 화면 E2E: 성공, 필수값과 `통신판매업여부` 저장 확인
- 고객 대시보드 Apps Script `getClientList`: HTTP 200, 기존 고객목록 반환 확인
- 테스트 행: 검증 후 삭제, 정본 헤더와 기존 데이터 보존 확인

## 정본 위치

- 홈페이지 제출 코드: `js/main.js`
- Apps Script 배포 정본: `.claude/apps-script/CtaIntake.gs`
- 통합 접수 시트: `https://docs.google.com/spreadsheets/d/1VorxSeDWlUjoCgQKaxEVTTyFpamLhY9PIqvs6iW6qUQ/edit`
