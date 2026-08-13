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

## 5. Preview·화면 증빙 상태

현재 실행환경의 Agent Preview 연결이 제공되지 않아 로컬 변경본을 Cloud Browser에 연결할 수 없었다. 원격 검수 브랜치를 만들면 기존 GitHub–Vercel 연결에서 Preview 배포와 동일 build 스크린샷 검사를 진행할 수 있다.

원격 브랜치 생성은 외부 공개 저장소 변경이므로 별도 명시 승인이 필요하다. 승인 전에는 원격 브랜치·PR·Vercel Preview·Production 배포를 실행하지 않았다.

## 6. Production 배포 조건

1. 원격 검수 브랜치 생성 승인
2. Vercel Preview URL 생성 확인
3. 1440·1280·1024·768·390·360 화면검사
4. V5 필수 18개 화면 캡처
5. Preview form payload·console·network 최종검사
6. 사용자 최종 승인
7. Production 배포

