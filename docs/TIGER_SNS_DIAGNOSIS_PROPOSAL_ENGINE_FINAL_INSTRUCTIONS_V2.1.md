# TIGER SNS 진단·PROPOSAL ENGINE｜FINAL INSTRUCTIONS V2.1

## 1. 목적

신규 음식점·외식 브랜드의 공개 정보를 조사·진단하고, TIGER COMMERCE LAB의 현재 홈페이지 디자인 시스템으로 업체별 맞춤 웹 제안서를 생성하는 프로젝트이다. 결과물은 단순 분석보고서가 아니라 `발견 → 신뢰 → 검색 → 방문·구매 → 재구매`를 설계해 상담과 계약으로 연결하는 웹 Proposal이다.

## 2. 기준 우선순위

작업 시작 시 다음 순서로 확인한다.

1. 본 지침의 최신 승인 버전
2. 사용자가 해당 업체에 대해 이번 채팅에서 승인한 최신 내용
3. `00_WORKSPACE_MASTER_INDEX_V1.1_FINAL.md`
4. `TIGER_COMMERCE_LAB_CONTENT_ENGINE_FINAL_V1.2.2.md`
5. `TIGER_CONTENT_QUALITY_CONVERSION_SCORECARD_V1.1.md`
6. `05_TIGER_DIAGNOSIS_PROPOSAL_STATUS_V2.md`
7. `TIGER_PROPOSAL_CONVERSION_SCORECARD_V1.md`
8. 현재 Production 홈페이지와 공통 Proposal 코드

`TIGER_PROPOSAL_V2_CLAUDE_CODE_IMPLEMENTATION_FINAL.md`는 기존 자동생성 구조 참고용으로만 사용한다. 화면 디자인·반응형·카피·가격은 현재 Production과 공통 Proposal 코드가 우선한다. 구버전 화면이나 과거 채팅 기억으로 되돌리지 않는다.

## 3. 공식 브랜드 자산

다음 공식 로고만 사용한다.

- `TIGER_LOGO_PRIMARY_HORIZONTAL_V1.png`
- `TIGER_LOGO_PRIMARY_HORIZONTAL_WHITE_V1.png`
- `TIGER_LOGO_SYMBOL_V1.png`
- `TIGER_LOGO_PROFILE_V2.png`

구형 로고, PROFILE V1, 이모티콘형 호랑이, AI가 다시 그린 호랑이 심벌은 금지한다. 비율·색상·문자·형태를 바꾸지 않는다. 웹·카카오톡·SNS 공유 미리보기에는 공식 호랑이 로고가 포함된 1200×630 공유 이미지를 사용한다.

## 4. 자동생성 구조 고정

기존 TIGER 홈페이지와 Proposal 시스템을 유지한다.

- 공통 데이터: `data/proposals/_common.json`
- 업체별 데이터: `data/proposals/{slug}.json`
- 공통 렌더러: `js/proposal.js`
- 공통 디자인: `css/proposal.css`
- 주소: `/proposal/{slug}`

업체별 HTML·CSS·JS를 복사해 새 페이지를 만들지 않는다. 신규 업체는 업체별 JSON과 필요한 전용 이미지만 추가한다. 공통 템플릿 수정이 필요하면 변경 이유·영향 범위를 먼저 보고하고 승인받는다. 기장끝집 Proposal은 현재 디자인·반응형·구조의 기준본이다.

## 5. 기본 입력과 사실 확인

기본 입력은 다음과 같다.

- 필수: 상호명, 사업장 주소
- 권장: 네이버 플레이스 URL
- 선택: 공식 홈페이지, SNS, 판매채널, 대표 메뉴·상품, 업체 제공 캡처

동명이거나 주소만으로 특정하기 어려우면 네이버 플레이스 URL을 요청한다. 공개 정보로 확인되지 않는 항목은 캡처나 원본 자료를 요청하고 `FACT_CHECK_REQUIRED`로 관리한다. 미확인 계정·주소·상품·성과·판매채널을 추측하지 않는다.

## 6. 전체 작업 흐름

업체 입력 → 최신 리서치 → FACT REVIEW → 사업·채널 진단 → 고객 Funnel 설계 → Proposal 초안 → `PROPOSAL_REVIEW` → 사용자 수정·승인 → FINAL Data·JSON → Preview 구현 → 1440·768·390 QA → 사용자 Preview 승인 → Production 배포 → STATUS 갱신 순서로 진행한다.

초안 승인 전 FINAL JSON·실제 URL·배포를 만들지 않는다. Preview 승인과 Production 배포 승인을 구분하며 AI가 임의로 승인 상태를 바꾸지 않는다.

## 7. 신규 업체 리서치

공식 홈페이지, 네이버 플레이스, Instagram, Threads, TikTok, YouTube, 네이버 블로그, 스마트스토어·자사몰, 배달·예약·구매 채널, 지역·메뉴 검색 수요, 경쟁업체 운영 방식, 외부 인기 콘텐츠, 고객 리뷰의 반복 장점·불만을 최신 공개 자료로 확인한다.

검색 결과를 나열하지 않는다. 이미 가진 경쟁력, 끊긴 고객 접점, 놓친 유입·방문·구매·재구매 기회를 구분하고 근거 URL과 확인일을 남긴다. 업체를 `LOCAL VISIT / BRAND GROWTH / COMMERCE READY / FULL COMMERCE` 중 하나로 분류하되 모든 업체에 같은 전략과 상품을 반복 추천하지 않는다.

## 8. Proposal 12개 섹션

1. 업체 맞춤 HERO
2. 이미 가진 경쟁력·채널 현황
3. 관심 이후 끊기는 고객 행동
4. 지금 고객 동선을 완성해야 하는 이유
5. SNS → 검색 → 방문 → 온라인 구매 → 재구매
6. HOOK → RETENTION → VALUE → CTA 콘텐츠 엔진
7. 숏폼·카드뉴스·Threads·블로그 맞춤 예시
8. 조가네맛곳간 실제 Proof
9. 계약 후 첫 30일 실행계획
10. 추천 플랜·가격·운영 지원
11. TIGER가 다른 이유와 대표 경력
12. 상담·계약 CTA

모든 노출 문구는 자연스러운 존댓말로 작성한다. 반말형 종결어미와 보고서식 장문을 금지한다. 가격부터 보여주지 않고 문제 → 기회 → 해결 구조 → Proof → 추천 이유 → 가격 → CTA 순서로 설득한다.

## 9. 현재 디자인·반응형 기준

- 블랙 바탕, TIGER 오렌지·골드 발광, 큰 타이포, 실사 중심으로 구성한다.
- PC HERO는 문구 왼쪽·호랑이 오른쪽의 분리 구조로 만들고 겹치지 않는다.
- 모바일 HERO는 호랑이 이미지를 먼저 충분히 보여주고 문구를 이미지 아래 별도 영역에 배치한다.
- 호랑이 눈빛은 포인터·스크롤에 반응하되 공식 로고와 합성하지 않는다.
- SECTION 06의 HOOK·RETENTION·VALUE·CTA에는 업체 내용과 맞는 실사 이미지 4장을 적용한다.
- 휴대폰 화면 방향, 손가락, 음식, 매장 구조가 물리적으로 자연스러워야 하며 AI 티·가짜 UI·워터마크를 금지한다.
- 고객 흐름·콘텐츠 엔진·30일 실행·운영 지원은 스크롤에 따라 현재 단계만 금빛으로 활성화한다.
- 모바일에서 지나치게 긴 빈 구간, 가로 잘림, 텍스트·이미지 겹침, 고정 CTA 가림을 금지한다.
- PC 고정 상담 동선과 모바일 하단 고정 `상담 신청 / 1:1 카톡`을 유지한다.
- 업체명·추천 플랜·계약기간·월 금액을 홈페이지 상담 폼으로 전달한다.
- Proposal은 `noindex,nofollow,noarchive`를 유지한다.

## 10. 가격·Proof 사실 고정

가격은 `_common.json` 한 곳에서만 관리한다. VAT 별도 기준은 다음과 같다.

- BASIC: 12개월 70만원 / 6개월 90만원
- GROWTH: 12개월 100만원 / 6개월 120만원
- PERFORMANCE: 12개월 150만원 / 6개월 170만원
- COMMERCE: 12개월 200만원 / 6개월 220만원

공개 SNS 콘텐츠에는 가격을 노출하지 않는다. 조가네맛곳간 Proof는 `66.1K Views / 278 Likes / 53 Comments / 26 Saves / +69 Followers`만 사용한다. 핵심 문장은 “조회수가 아니라 고객이 말을 걸기 시작했습니다.”로 표기한다. 동일 성과 보장, 예상 매출, 임의 수치와 사례를 만들지 않는다.

## 11. QA와 배포 제한

1440px·768px·390px에서 HERO 분리, 글자 크기, 이미지 비율, 스크롤 단계, 가격 전환, 플랜 선택, 상담 폼 전달, 카카오톡 링크, 고정 CTA, 로고, OG 공유 이미지, 로컬 자산 404, 중복 ID, 콘솔·런타임 오류를 검사한다. 기존 홈페이지·로그인·대시보드·상담 기능의 회귀검사도 함께 수행한다.

최종 판단은 `멈추는가 → 바로 이해하는가 → 믿는가 → 상담하고 싶은가 → 계약으로 이어지는가`이다. QA 통과 후 Preview URL과 PC·모바일 증빙을 제출한다. 사용자의 명시적 승인 전에는 main 병합과 Production 배포를 금지한다.

## 12. 최종 출력과 문서 관리

승인 후 다음을 생성한다.

1. 업체별 FINAL Proposal Data·JSON
2. 영문 slug와 예정 URL
3. 구현 변경내역
4. Conversion Scorecard와 FACT CHECK
5. PC·Tablet·Mobile QA 결과
6. Preview 증빙
7. STATUS와 NEXT ACTION

공통 규칙 변경은 Proposal MASTER 새 버전, 업체 진행상태는 STATUS, 가격·서비스 범위는 `_common.json`, 자동생성 구조 변경은 Implementation 문서에 기록한다. 기존 FINAL 문서를 조용히 덮어쓰지 않고 새 버전으로 관리한다.
