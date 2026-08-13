# TIGER COMMERCE LAB 홈페이지 V5 GAP REPORT

검사 기준: `TIGER_HOMEPAGE_RENEWAL_COMPLETE_HANDOFF_V5.md`  
Production: `https://www.tigercommercelab.com/`  
검사일: 2026-08-13  
검사 대상 커밋: `c6a3bc3`

## 1. 결론

Production에는 정확히 9개의 메인 섹션, 5개 HERO 데이터, 단일 진단 폼, 12개월·6개월 가격 전환까지 반영돼 있다. 그러나 V5 완료 상태는 아니다. 가장 큰 미반영 항목은 `맘커뮤니티 후기·핫딜 확산` 선택옵션 전체, 카드뉴스형 시각 장면의 밀도, 세 실행 엔진의 V5 명칭·역할, CTA 선택정보의 실제 제출 payload, 모바일 메뉴 focus trap, Dashboard 설명 동기화, V5 기준 FAQ이다.

스크롤 전 `loading="lazy"` 이미지의 `naturalWidth=0` 상태는 로딩 오류가 아니었다. Proof와 Service Plan을 실제로 통과한 뒤 조가네 성과 이미지 2장, 사례 이미지 3장, Dashboard 이미지가 모두 `naturalWidth > 0`으로 확인됐다.

## 2. Production GAP 표

| 구분 | 확정 요구 | 현재 Production | 상태 | 수정 위치 | 수정 방법 |
|---|---|---|---|---|---|
| HERO | 5개 이미지·카피·CTA를 한 데이터로 동기화 | 5개 카피·CTA 전환은 작동하나 이미지 마크업과 카피 데이터가 분리돼 있다. Tablet·Mobile 전용 title/crop 데이터가 없다. | PARTIAL | `index.html` HERO, `js/main.js` `HERO_SLIDES`, `css/styles.css` HERO | 이미지·alt·viewport별 title·focus까지 `HERO_SLIDES` 단일 데이터에 통합하고 mask/stagger 상태를 추가한다. |
| 온라인판매 | 독립 카드뉴스형 섹션과 `메뉴판→상품→패키지→배송→전국고객→재구매` | 독립 섹션과 7단계 텍스트는 있으나 고객이 원하는 미래를 보여주는 주 비주얼이 약하다. | PARTIAL | `index.html` `#nationwide-sales`, 관련 CSS | 상품화 여정을 큰 카드뉴스 장면으로 만들고 7개 점검범위를 보조 구조로 재배치한다. |
| SNS 필요성 | 고객행동 흐름과 TIGER 전체 운영역할 | 행동 5단계와 운영범위는 존재하나 발견→저장·공유→검색→방문·문의→구매→재구매 흐름이 축약돼 있다. | PARTIAL | `index.html` `#why-sns`, 관련 CSS | 고객 행동 경로와 TIGER 운영범위를 하나의 전환 장면으로 강화한다. |
| TIGER System | 전체 Funnel과 3개 실행 엔진 | Funnel은 있으나 엔진이 `SNS GROWTH / PLACE CONVERSION / NATIONWIDE SALES`로 표시돼 V5의 `CONTENT / DISCOVERY & CONVERSION / COMMERCE & RETENTION`과 다르다. | FAIL | `index.html` `#tiger-system` | 세 실행 엔진 명칭과 실제 수행범위를 V5로 교체한다. |
| Proof | 66.1K·278·53·26·+69, 사례 이미지, 성과 주의문구 | 수치와 첫 게시물·광고비 0원 맥락은 정확하다. 스크롤 후 성과 2장과 사례 3장 모두 실제 로딩된다. 사례 카드는 업종·문제·실행·반응·다음 행동 구조가 부족하다. | PARTIAL | `index.html` `#proof-cases`, 관련 CSS | 정확한 수치와 자산은 유지하고 사례 카드를 문제→실행→확인 가능한 결과 구조로 보강한다. |
| 진단 | 같은 섹션의 3개 맞춤패널, 단일 form, 유입정보 payload | 세 카드와 패널 전환, `aria-expanded`, 기존 전국판매 필드명은 유지돼 있다. 숨은 fieldset 입력이 disabled 처리되지 않으며 선택정보가 실제 Backend payload에 충분히 전달되지 않는다. | PARTIAL | `index.html` `#diagnosis`, `js/main.js` 진단·submit | 숨은 fieldset을 disabled 처리하고 source·진단·플랜·기간·월요금·옵션을 전송 payload에 포함한다. 선택 요약을 폼 상단에 표시한다. |
| 가격 | 기간→4플랜→선택상세→공통→옵션→Dashboard | 가격과 수량, 선택상세, 공통사항, 12/6개월 전환은 정확하다. 모든 카드가 토글 뒤에도 visible·opacity 1이다. Desktop 4열이며 선택옵션이 없다. | PARTIAL | `index.html` `#service-plan`, `js/main.js` plan, `css/styles.css` plan | Desktop도 2×2 비교로 바꾸고 플랜·기간·월요금·CTA label을 폼에 전달한다. |
| 맘커뮤니티 옵션 | 월30건·후기형/핫딜형·별도문의·운영 Dashboard | 섹션·카피·CTA·대시보드·payload가 전부 없다. | FAIL | `index.html` `#service-plan`, `js/main.js`, CSS | V5 확정 옵션을 가격 아래에 추가하고 값 없는 `예시 화면` 대시보드와 정책 고지를 넣는다. |
| 운영 Dashboard | 탭 클릭 시 이미지·설명·selected state 동기화 | 이미지와 selected state는 바뀌나 설명이 없고 첫 이미지가 offscreen lazy 상태에서는 미로딩으로 보일 수 있다. | PARTIAL | `index.html` Dashboard, `js/main.js` `DASH_SHOTS` | 탭마다 설명·alt·이미지를 함께 갱신하고 고정 비율 frame을 적용한다. |
| 반응형 | 1440·1280·1024·768·390·360, overflow 0 | CSS breakpoint는 1180·1024·860·640·560으로 존재한다. HERO는 640 이하 공통축소이며 slide별 Tablet·Mobile crop이 없다. 1024 이상 가격이 4열이다. | PARTIAL | `css/styles.css`, HERO 데이터 | 1024·768·390·360 기준 재배치, slide별 focus, 가격 2열, 진단·Dashboard 모바일 레이아웃을 추가한다. |
| 애니메이션 | 의미 기반, fallback, reduced motion | HERO crossfade와 reveal이 존재한다. 필수 콘텐츠 기본상태가 `.reveal{opacity:0}`이어서 observer 실패 시 숨을 수 있다. 전 섹션이 동일 fade-up 중심이다. | FAIL | `css/styles.css` `.reveal`, `js/main.js` observer | 기본상태를 visible로 바꾸고 enhancement class가 있을 때만 reveal한다. 섹션별 route·number·panel animation을 분리한다. |
| Header·Mobile CTA | focus trap·Escape·keyboard, form/submit/footer/keyboard 가림 방지 | Escape와 첫 링크 focus는 있으나 Tab focus trap이 없다. 고정 CTA는 HERO·Footer·form focus만 보고 submit 노출 여부를 보지 않는다. | PARTIAL | `js/main.js` Header·mobile CTA | focus trap과 submit visibility observer를 추가한다. |
| 보호기능 | login·client/admin Dashboard·proposal·form | `/login`, `/client/:slug`, `/admin`, `/proposal/:slug` rewrite와 별도 JS가 분리돼 있다. 이번 변경 대상에서 제외한다. | PASS/보호 | `vercel.json`, `login.html`, `client.html`, `admin.html`, `proposal.html`, 각 전용 JS | 홈페이지 전용 3파일만 수정하고 protected route·Proposal JSON·공유 JS를 유지한다. |

## 3. 직접 기능검사 결과

- `main > section`: 9개 PASS
- `form`: 1개 PASS
- `h1`: 1개 PASS
- duplicate ID: 0 PASS
- HERO dot 5개와 슬라이드별 copy/CTA 데이터 존재 PASS
- 진단 카드 3개: 같은 섹션의 패널과 맞춤 fieldset 전환 PASS
- 가격 12개월: 70/100/150/200만원 PASS
- 가격 6개월: 90/120/170/220만원 PASS
- 가격 토글 후 4개 카드: `display:block`, `visibility:visible`, `opacity:1` PASS
- Proof/사례/Dashboard 자산: 실제 스크롤 후 `naturalWidth > 0` PASS
- 애플리케이션 console error: 확인된 오류 없음. 브라우저 확장 자체 오류는 홈페이지 오류에서 제외했다.

## 4. 이번 수정 범위

1. `index.html`의 기존 9개 섹션을 V5 카드뉴스 장면으로 교체·보강한다.
2. `css/styles.css`의 구형 동일 reveal 중심 표현을 V5 디자인·반응형·접근성 규칙으로 교체한다.
3. `js/main.js`의 HERO 데이터, 진단 payload, 가격 선택, 맘커뮤니티 옵션, Dashboard, 모바일 메뉴·CTA를 보강한다.
4. `data/proposals/_common.json`의 확정 가격·수량은 읽기 전용으로 유지한다.
5. login·client/admin Dashboard·Proposal route와 전용 코드는 수정하지 않는다.

## 5. 삭제할 구형 코드

- HERO 이미지 5장을 별도 정적 마크업으로 반복한 구조
- 필수 콘텐츠를 기본 `opacity:0`으로 두는 reveal 규칙
- V5와 다른 세 실행 엔진 명칭
- Dashboard 이미지만 바꾸고 설명은 바꾸지 않는 탭 처리
- Service Plan의 4열 요약 레이아웃
- V5와 범위가 다른 기존 FAQ 문항

## 6. 예상 회귀 위험

- 진단 fieldset disabled 처리 시 선택 fieldset까지 비활성화되는 오류
- 플랜 CTA에서 plan·term·price·label 중 일부 hidden value가 누락되는 오류
- HERO를 데이터 렌더링으로 바꿀 때 최초 이미지가 늦게 표시되는 오류
- Dashboard 탭 frame 높이 변화와 lazy image 로딩
- 360px에서 가격 문자열·Dashboard 표·CTA 가로 넘침
- Google Form과 전국판매 Apps Script에 기존 필드가 누락되는 오류

## 7. 확인이 필요한 사실값

- 대시보드가 모든 플랜의 계약 제공항목인지 확정되지 않았으므로 공통 제공사항에는 넣지 않는다.
- 맘커뮤니티 옵션 가격은 확정되지 않았으므로 `별도 문의`만 표시한다.
- 맘커뮤니티 실제 성과값이 없으므로 예시 Dashboard에 조회수·댓글수 숫자를 만들지 않는다.
- 다른 선택형 추가 서비스는 새로 만들지 않는다.

