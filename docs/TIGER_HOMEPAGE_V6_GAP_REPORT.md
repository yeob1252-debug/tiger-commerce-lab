# TIGER COMMERCE LAB V6 GAP REPORT

- 기준: `TIGER_HOMEPAGE_RENEWAL_COMPLETE_HANDOFF_V5.md` + 이후 대화에서 확정한 최신 구조
- Production: `https://www.tigercommercelab.com/`
- 직접 검사일: 2026-08-13
- PC 실제 검사 뷰포트: 1363×936
- Production 직접 확인값: 메인 9섹션, HERO 5개, 무료진단 카드 3개, 폼 1개, 플랜 4개, 가로 넘침 0

## 결론

현재 Production은 V5 기능을 상당 부분 반영했지만, 최신 확정안의 핵심인 `음식점 자체 SNS 채널을 24시간 365일 운영해 신규유치 → 팬심확보 → 방문·판매 → 자체 LIVE 수익화로 연결한다`는 메시지가 첫 화면에서 즉시 이해되지 않는다. 온라인판매·플레이스·SNS가 동급 서비스처럼 분산되어 핵심 사업이 흐려지고, 섹션마다 큰 제목과 카드가 반복되어 오래된 PPT형 인상이 강하다.

가격·실제 성과·단일 폼·보호 라우트는 유지할 가치가 있다. 디자인과 정보구조는 Omnira형 검정·골드 시스템, 실사 호랑이 히어로, 스크롤 반응형 과정으로 전면 재구축해야 한다.

## 항목별 GAP

| 구분 | 최신 확정안 | Production 확인 | 판정 | V6 조치 |
|---|---|---|---|---|
| 첫 화면 핵심이해 | 음식점 SNS 통합운영, 24시간 365일 고객유치·팬심·판매 | HERO 5개가 온라인판매·SNS·플레이스·통합운영을 번갈아 말해 정체성이 분산됨 | 미반영 | 단일 실사 호랑이 HERO와 고정 핵심문구·순환 결과문구로 교체 |
| 핵심·보조 구분 | SNS가 핵심, 플레이스는 방문전환 보조 | 네비게이션·HERO·무료진단에서 플레이스와 온라인판매가 핵심과 동급 | 오류 | SNS 운영을 중심축으로 재배치하고 플레이스는 무료 보조진단으로만 노출 |
| 고객욕구 흐름 | 신규유치 → 팬심 → 방문·재방문 → 판매·LIVE | 손실·온라인판매·SNS 필요성이 별도 섹션으로 나뉘어 한 번에 이해하기 어려움 | 부분반영 | 네 가지 원하는 미래를 하나의 카드뉴스 장면으로 통합 |
| TIGER가 잘하는 일 | 전략·촬영·제작·업로드·반응·분석·판매연결을 짧게 | 운영범위는 존재하나 Funnel과 긴 설명 사이에 분산 | 부분반영 | 6개 실행 카드로 압축 |
| 해결 이야기 | 콘텐츠가 고객자산으로 쌓이는 과정 | 정적 Funnel과 텍스트 칩 중심 | 부분반영 | sticky 화면과 고객행동 단계 반응으로 구현 |
| CONTENT TO COMMERCE | ATTRACT → CONNECT → CONVERT → LIVE, 골드바와 카드 활성 | 정적 3개 Engine과 별도 4단계 진행구조 | 미반영 | Omnira형 상단 진행바·발광점·순차 카드 반응 구현 |
| 자체 LIVE 조건 | 사장님·직원 직접 방송 시 별도 중개·대행 판매수수료 없음, PG·배송비 등 고지 | `라이브커머스 연계`만 있고 조건·역할·비용 구분 없음 | 오류 | 과정·FAQ에 정확한 조건과 TIGER/외부 진행 별도상담 고지 |
| 실제 성과 | 광고비 0, 첫 게시물 66.1K·278·53·26·+69 | 정확히 반영 | 반영 | 숫자·캡처·주의문구 그대로 유지, 시각 위계만 개선 |
| 플랜 | 12/6개월, 4플랜, 정확한 수량·가격 | 정확히 반영 | 반영 | 데이터 소스 유지, 2×2 프리미엄 카드로 재구성 |
| 운영지원 | Dashboard, 직접 LIVE 지원, 맘커뮤니티 옵션 | Dashboard와 옵션 일부 존재하나 분산 | 부분반영 | 한 화면 탭형 운영지원으로 통합 |
| 무료서비스 | 플레이스·온라인판매 2개만 닫힌 상태, 클릭한 자리에서 신청내용 전개 | 플레이스·SNS·온라인판매 3개가 항상 노출 | 오류 | 2개 카드만 유지, 하나의 실제 폼을 선택한 카드 안으로 이동 |
| 상담전환 | 상담신청 + 대표자 1:1 카카오톡 | 상담 폼은 있으나 카카오톡 CTA 없음 | 미반영 | `https://open.kakao.com/o/sgxBgDIi`를 PC·Mobile 최종 CTA에 연결 |
| 시각디자인 | Omnira에 가까운 검정·골드, 실사 호랑이, 반응형 발광·디더링 | 밝은 섹션과 유사한 카드 반복으로 PPT형 인상 | 오류 | `#020202 / #FF9800 / off-white`, clipped corner, halftone·scanline, 생성 실사 3종 적용 |
| 반응형 | PC 4/3열, Tablet 2열, Mobile 1열·세로 과정 | CSS 분기와 일부 모바일 처리는 있으나 최신 구조 기준 아님 | 부분반영 | 1199/809/390px에서 2열·1열·세로 진행선·모바일 고정 CTA 적용 |
| 보호기능 | login·client/admin·proposal·backend 보호 | 별도 파일·rewrite로 분리됨 | 반영/보호 | 홈페이지 3파일만 변경하고 보호 라우트·데이터 무변경 |

## 반응형 확인 범위

- PC는 Production을 1363×936 실제 브라우저에서 직접 열고 HERO 전환, 섹션 수, 폼 수, 플랜 수, 가로 넘침을 확인했다.
- 현재 클라우드 브라우저는 창 크기가 1363×936으로 고정되고 기기 에뮬레이션 API가 없어 Production의 Tablet·Mobile 실스크린샷을 생성할 수 없었다.
- Tablet·Mobile은 Production 소스의 media query와 DOM 구조를 비교 판정했으며, V6 Preview에서는 1199/809/390px 규칙·DOM 회귀검사·실제 화면 검사를 별도 증빙한다.

## 보호 범위

다음 파일과 경로는 변경하지 않는다.

- `login.html`, `client.html`, `admin.html`, `proposal.html`
- `js/login.js`, `js/client.js`, `js/admin.js`, `js/proposal.js`, `js/dashboard-common.js`
- `data/proposals/_common.json`, 업체별 Proposal JSON
- `vercel.json` rewrite
- 기존 Google Form과 온라인판매 Apps Script endpoint·field name

Production 배포는 Preview 검수와 사용자 명시 승인 전까지 실행하지 않는다.
