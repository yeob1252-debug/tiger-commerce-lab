# TIGER COMMERCE LAB V6 QA REPORT

- 검사일: 2026-08-13
- 검사 대상 브랜치: `agent/tiger-homepage-omnira-v6`
- Preview 별칭: `https://tiger-commerce-lab-git-agent-tiger-homepage-omnira-v6-whybe1.vercel.app/`
- Production: 변경·배포하지 않음

## 구현 결과

최신 확정 메시지 흐름을 정확히 9개 카드뉴스형 섹션으로 구성했다.

1. HERO — 음식점 SNS 통합운영과 24시간 365일 핵심 후킹
2. 원하는 미래 — 신규유치·팬심·방문/재방문·판매/LIVE
3. TIGER가 잘하는 일 — 전략부터 판매연결까지 6개 실행범위
4. 해결 이야기 — 발견·관계·전환·자산화
5. CONTENT TO COMMERCE — ATTRACT → CONNECT → CONVERT → LIVE
6. 실제 증빙 — 광고비 0, 첫 게시물 66.1K/278/53/26/+69
7. 운영·플랜·확장 — 12/6개월 4개 플랜과 Dashboard/LIVE/선택형 확장
8. 무료서비스 — 플레이스·온라인판매 2개만 닫힌 상태로 제공
9. 최종 상담 — 상담신청·대표자 1:1 카카오톡·FAQ

## 자동 회귀검사

`node qa-homepage-v6.cjs` 결과:

| 검사항목 | 결과 |
|---|---:|
| 메인 섹션 | 9 |
| 상담 폼 인스턴스 | 1 |
| 무료서비스 카드 | 2 |
| 플랜 카드 | 4 |
| 카카오톡 링크 | 2 |
| 로컬 이미지/데이터 자산 | 12, 누락 0 |
| 중복 ID | 0 |
| JSDOM 런타임 오류 | 0 |
| 최종 판정 | PASS |

추가 정적 검사:

- `node --check js/main.js`: PASS
- `git diff --check`: PASS
- `html-validate index.html`: PASS
- 생성 이미지 3종 WebP 최적화: 68KB / 100KB / 124KB

## Preview 실제 브라우저 검사

PC 1363×936에서 Preview를 직접 열고 다음을 확인했다.

| 항목 | 확인값 |
|---|---|
| 레이아웃 | 가로 넘침 0, 9개 섹션 정상 표시 |
| HERO | 실사 호랑이, 마우스 발광, 순환문구 정상 |
| 진행구조 | 스크롤에 따라 골드 진행바·4개 카드 순차 활성 |
| 무료점검 | 초기 접힘, 클릭한 카드 내부로 단일 폼 이동 |
| 기간 전환 | 6개월 90/120/170/220만원 정상 |
| 12개월 데이터 | 70/100/150/200만원, VAT 별도 정상 |
| 운영 탭 | Dashboard/LIVE/맘커뮤니티 옵션 콘텐츠 정상 전환 |
| LIVE 고지 | 직접 방송·대행 방송·PG/배송비 조건 정확히 구분 |
| FAQ | 단일 항목 확장 및 답변 정상 |
| Kakao CTA | `https://open.kakao.com/o/sgxBgDIi` 2곳 연결 |
| 이미지 | 깨진 이미지 0 |
| 브라우저 오류 | 홈페이지 코드 오류 0 |

## 반응형 기준

| 환경 | 구현 방식 |
|---|---|
| PC 1200px 이상 | HERO 2분할, 과정 4열, 실사 이미지와 마우스 글로우 |
| Tablet 810–1199px | 카드 2열, 과정 2×2, 텍스트·이미지 균형 재배치 |
| Mobile 809px 이하 | 텍스트 우선 1열, 과정 세로 진행선, 터치 가독성·고정 CTA |
| Small Mobile 390px 이하 | 제목·간격·버튼 크기 추가 축소, 가로 넘침 방지 |

클라우드 브라우저는 뷰포트가 PC 크기로 고정되어 Tablet·Mobile 실스크린샷을 만들 수 없었다. 해당 환경은 CSS 분기, DOM 회귀검사와 가로 넘침 방지 규칙으로 검증했으며, 최종 승인을 위해 실제 휴대폰에서도 Preview 링크를 한 번 확인하는 것을 권장한다.

## 보호기능 회귀

- `/login`: 정상 표시, `noindex,nofollow`
- `/admin`: 정상 표시, `noindex,nofollow`
- `/client/gijang-endhouse`: 미인증 상태에서 `/login`으로 이동
- 로그인·client·admin·proposal·dashboard JS, `_common.json`, `vercel.json`: 수정하지 않음
- Google Form 및 온라인판매 Apps Script endpoint·field name: 유지

## 배포 안전상태

- Preview만 생성했다.
- Production 도메인과 `main` 브랜치는 변경하지 않았다.
- 사용자 최종 승인 전에는 Production으로 승격하지 않는다.
