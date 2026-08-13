# TIGER COMMERCE LAB 홈페이지 V5 QA REPORT

검사일: 2026-08-13  
작업 브랜치: `agent/tiger-homepage-v5-renewal`  
Production 배포: 실행하지 않음

## 1. 구현 결과

- `main > section` 정확히 9개 유지
- HERO 5개를 이미지·alt·eyebrow·제목·설명·CTA·viewport별 줄바꿈·이미지 초점이 포함된 단일 데이터로 통합
- Opportunity Loss를 `사장님의 하루 → 놓친 고객접점 → 고객의 화면` 카드뉴스 장면으로 재구성
- 전국판매를 `메뉴판 → 온라인 상품 → 패키지·배송 → 전국 고객 → 재구매` 장면으로 재구성
- SNS를 `발견 → 저장·공유 → 검색 → 방문·문의·구매 → 재구매` 고객행동 흐름으로 재구성
- TIGER 실행 엔진을 V5 확정 명칭 3개로 교체
- Proof 수치와 실제 자산을 유지하고 1회 count-up, 사례별 과제·실행·확인반응·다음행동 구조를 추가
- 진단 fieldset을 선택상태에 따라 hidden+disabled 처리
- CTA source·HERO·진단·플랜·기간·월요금·CTA label·선택옵션을 실제 제출 payload에 포함
- 가격표를 2×2 비교형으로 변경하고 12개월·6개월 가격 정확성 유지
- `맘커뮤니티 후기·핫딜 확산` 선택옵션과 값 없는 `예시 화면` 운영 Dashboard 구현
- Dashboard 탭의 이미지·alt·설명을 함께 전환
- V5 기준 FAQ 5개로 교체
- 모바일 메뉴 focus trap·Escape·label, 모바일 고정 CTA의 form/submit/footer/keyboard 회피 보강
- 필수 콘텐츠 기본상태를 visible로 바꾸고 observer 준비 시에만 reveal animation 적용
- `prefers-reduced-motion`에서 HERO 자동전환·mask·count-up·route animation을 제거

## 2. 자동검사 결과

| 검사 | 결과 |
|---|---|
| JavaScript syntax | PASS |
| HTML validation | PASS, error 0 |
| `git diff --check` | PASS |
| JSON parse — Vercel·공통가격·Proposal | PASS |
| 내부 asset 경로 19개 | PASS, missing 0 |
| `main > section` | PASS, 9개 |
| form | PASS, 1개 |
| H1 | PASS, 1개 |
| duplicate ID | PASS, 0개 |
| HERO image/copy/CTA sync | PASS, 5개 |
| HERO Desktop/Mobile focus data | PASS |
| 진단 맞춤패널 | PASS, 3개 |
| hidden fieldset disabled | PASS |
| 가격 플랜 | PASS, 4개 |
| 12개월 가격 | PASS, 70/100/150/200만원 |
| 6개월 가격 | PASS, 90/120/170/220만원 |
| 플랜 CTA payload | PASS |
| 맘커뮤니티 CTA payload | PASS |
| Dashboard image/description sync | PASS |
| runtime application error | PASS, 0개 |

## 3. Production 직접 회귀검사

| 경로·기능 | 결과 |
|---|---|
| Production 메인 9개 섹션 | PASS |
| Production HERO 5개 동기 전환 | PASS |
| Production 진단 3개 패널 | PASS |
| Production 가격 12/6개월 전환 | PASS |
| 가격 토글 뒤 카드 visibility/opacity | PASS |
| Proof 이미지 2장 `naturalWidth > 0` | PASS |
| 사례 이미지 3장 `naturalWidth > 0` | PASS |
| Dashboard 이미지 `naturalWidth > 0` | PASS |
| `/login` | PASS, noindex 유지 |
| `/admin` | PASS, noindex 유지 |
| `/client/gijang-endhouse` | PASS, 로그인 보호 이동 |
| `/proposal/gijang-endhouse` | PASS, 실제 데이터 로딩·noindex 유지 |

## 4. 보호 확인

다음 파일은 변경하지 않았다.

- `login.html`
- `client.html`
- `admin.html`
- `proposal.html`
- `vercel.json`
- `js/login.js`
- `js/client.js`
- `js/admin.js`
- `js/proposal.js`
- `js/dashboard-common.js`
- `data/proposals/_common.json`
- `data/proposals/gijang-endhouse.json`

## 5. Vercel Preview 직접 회귀검사

검수 배포:
`https://tiger-commerce-lab-git-agent-tiger-homepage-v5-renewal-whybe1.vercel.app/`

검수 커밋: `70694df2ced0c6c40244e7c8bf06fed66190e4bb`  
Vercel 상태: `READY`  
배포 환경: Preview (`target: null`)  
Production 배포: 실행하지 않음

| Preview 경로·기능 | 결과 |
|---|---|
| PC 실렌더링 1363×936 | PASS, 가로 넘침 0 |
| 메인 섹션 순서 | PASS, 정확히 9개 |
| HERO 이미지·카피 전환 | PASS, 이전/다음 전환 확인 |
| 이미지 로딩 | PASS, broken image 0 |
| duplicate ID | PASS, 0개 |
| 진단 선택 | PASS, SNS 패널 제목·문의유형·선택값 동기화 |
| 진단 조건부 fieldset | PASS, 선택 패널만 활성·나머지 hidden+disabled |
| 빈 폼 제출 방지 | PASS, 오류문구 표시·외부 전송 없음 |
| 12개월 가격 | PASS, 70/100/150/200만원 |
| 6개월 가격 | PASS, 90/120/170/220만원 |
| 가격 토글 뒤 카드 | PASS, 4개 모두 visible |
| 맘커뮤니티 CTA | PASS, 옵션·유입섹션·CTA label 동기화 |
| Dashboard 월간성과 탭 | PASS, image·alt·description 동기화 |
| FAQ 첫 항목 | PASS, `aria-expanded`·답변 visibility 동기화 |
| Preview 콘솔 application error | PASS, 0개 |
| `/login` | PASS, noindex 유지 |
| `/admin` | PASS, noindex 유지 |
| `/client/gijang-endhouse` | PASS, 로그인 보호 이동 |
| `/proposal/gijang-endhouse` | PASS, 기장끝집 데이터·noindex 유지 |

## 6. 반응형 검증 상태

- CSS 기준점 `1180 / 1024 / 861 / 768 / 640 / 390 / 360px` 존재 확인
- Tablet·Mobile에서 메뉴·진단·플랜·Proof·Dashboard·고정 CTA가 단일열 또는 축약형으로 전환되는 규칙 확인
- 로컬 DOM 회귀검사에서 1024·768·390·360 조건별 필수 요소와 overflow 방지 규칙 통과
- Cloud Browser의 현재 실창은 1363×936으로 고정되어 PC 실화면 증빙을 완료했다.
- Cloud Browser 보안정책이 고정 폭 프레임과 별도 viewport 생성을 차단해 Tablet·Mobile 실스크린샷은 현재 세션에서 생성하지 못했다.

## 7. Production 배포 조건

1. Tablet·Mobile 실스크린샷 보완
2. 사용자 Preview 최종 확인
3. 사용자 Production 배포 명시 승인
4. `main` 병합 및 Production 배포
