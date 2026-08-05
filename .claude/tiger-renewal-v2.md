# 타이거커머스랩 리뉴얼 지시문 v2 — 최종 통합판 (2026-08-05)

대상 파일: 홈페이지 전체
근거: design-references.md OMNIRA 실측 요소추출(18장) + Patch AI 레퍼런스 + 기존 tigercommercelab.md 확정사항
(주: design-references.md / tigercommercelab.md는 이 저장소·이 세션 메모리에서 확인되지 않음 — 사용자가 직접 준 아래 내용만 근거로 삼는다)

## 0. 절대 준수
- 카드 아이콘에 브라우저 기본 이모티콘 금지 — 3D 렌더 이미지 또는 Tabler 라인아이콘만
- 신규 이미지는 투명 배경(누끼) + 워터마크 제거 필수
- 히어로/본문 텍스트는 컨테이너 기준값을 다른 섹션과 동일하게 재사용
- 전역 `overflow-x: hidden`을 body에 적용
- 애니메이션은 서술 금지, 코드 그대로 이식
- 폰 프레임 안 UI 목업은 AI 이미지 생성 금지 — 실제 HTML/CSS

## 1. 컬러 시스템 (중간톤 확정)
```css
--bg: #181B20;        /* 페이지 배경 - 따뜻한 차콜네이비 */
--card: #212429;      /* 카드 배경 */
--card-border: #2E323A;
--accent: #FF9700;    /* 포인트 오렌지 */
--text: #FFFFFF;
--text-muted: #8A8A8A;
--status: #96BB54;    /* 라임그린, 상태/성공 표시용 */
```

## 2. 타이포그래피
- 디스플레이(헤드라인): Paperlogy Black (Chakra Petch은 한글 미지원이라 실사용 시 Paperlogy로 확정 — 아래 검증 참고)
- 본문: Pretendard
- 3단계 위계 고정: 대제목 44~56px / 부제목 24~28px / 본문 16~18px
- 헤드라인 2줄 구성 시 마지막 줄 핵심 키워드만 --accent

## 3. 카드 디자인
- 코너클립: `clip-path: polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 0 100%)`
- 대괄호 eyebrow: `[ 서비스 ]`
- SF 코너브래킷 장식, 호버 시 --accent

## 4. 섹션 순서 (최종 확정)
1. 히어로 (타이포 키워드 순환 + 우측 폰 프레임 목업)
2. 무료 플레이스 점검 (신규, 리드마그넷)
3. 메인 서비스 — "음식점 메뉴 틱톡·유튜브·네이버로 전국 판매"
4. 진행사례 (배지 확대)
5. 업무 프로세스 6단계
6. 시장 데이터 (기존 "시장이 왜 지금인가")
7. 서비스안내 (요금표 세분화)
8. 실시간 업무 대시보드 쇼케이스
9. FAQ + 최종 CTA

(현재 사이트에 있던 2km반경 pain-point / 글보다 강한 영상의 힘 / 주 구매층 데이터 / 진짜를 찾습니다 / 채널연결 그래프 / 대표자소개 / 이런분들께 추천해요 섹션은 이 목록에 없음 — v2 지시대로 제거 대상.)

## 5~14
(전문은 사용자가 2026-08-05 채팅에 준 원문 참고 — 코드 스니펫: 키워드 순환, 카운트업, 마퀴, 스크롤 타임라인, 케이스카드 hover, 캐릭터 파츠 조립. 실제 위치: assets/characters/tiger-part-{head,body,arms,prop}.png (parts/ 하위 폴더 아님, 루트에 바로 있음 — 지시문 경로 오타 확인됨).

## 폰트 라이선스 확인 결과 (2026-08-05 웹서치)
- Paperlogy: OFL, 상업용 무료. CDN: `https://cdn.jsdelivr.net/gh/fonts-archive/Paperlogy/subsets/Paperlogy-dynamic-subset.css`
- Chakra Petch: SIL OFL 1.1, 상업용 무료, Google Fonts 제공. 단, 한글 미지원(라틴/타이 문자만) — 한글 헤드라인에는 사용 불가, Paperlogy로 확정.
