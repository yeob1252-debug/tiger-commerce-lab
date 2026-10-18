# 새 고객 제안서 기본 형식

2026-10-18 대표 승인: r78 디자인을 공개 제안서와 이후 고객 제안서의 기본 형식으로 사용한다.

1. `data/proposals/banchan-salad.editorial.json`을 새 고객 원고의 구조로 사용한다. 새 slug, 고객명/지역, 후킹, 확인된 조건, 콘텐츠 방향, 무료 첫 답변, 실제 문의 채널, 날짜를 변경한다. 이전 고객의 원본·촬영·예산 조건을 복사하지 않는다. 담당자가 작성하는 입력이며 대표에게 JSON 작성을 요구하지 않는다.
2. 매장 링크를 확인한 뒤 사실과 제안을 구분한다. 기존 조가네/쇼핑왕와이비 사례는 공통 실제 증거다. 조회수의 관찰일과 고객사/자체 브랜드 구분을 유지한다. 주문·매출 성과로 바꾸지 않는다.
3. `plans`의 ID·기간만 선택한다. 가격·부가세·전체 합계·월 수량은 홈페이지 정본 `data/proposals/_common.json`에서 자동 계산된다. 업무 설명은 승인된 범위 안에서 작성하며 몰 구축·방문 촬영·주문 CS·라이브 대행을 임의 포함하지 않는다.
4. 아래 기존 명령으로 생성한다. 결과는 로컬 검토 파일이며 자동 공개·고객 발송은 하지 않는다.

```powershell
node tools/create-proposal.mjs --input data/proposals/새고객.editorial.json
```

생성 경로: `proposals/<slug>/index.html`, `style.css`, `interaction.js`.
기존 파일 보호: 승인한 덮어쓰기만 `--replace`를 붙인다. 로컬 별도 미리보기는 `--out <폴더>`를 사용한다. 테스트 데이터는 `test_only: true`와 저장소 밖 출력 폴더를 사용하며 운영 커밋에 넣지 않는다.

디자인은 `template.html`, `style.css`, `interaction.js` 세 공통 파일이다. 제목/본문 왼쪽 축, 큰 실제 사례, 역할→가격→기간/총액, 상세 규격 펼치기, 플랫폼 내 가벼운 CTA를 유지한다. 생성 HTML을 직접 고치지 않는다.

반찬·샐러드 갱신:
```powershell
node tools/create-proposal.mjs --input data/proposals/banchan-salad.editorial.json --replace
```

새 고객 공개 전 PC·모바일 픽셀, 수치·기간·별도 비용, 실제 링크와 답장 버튼을 검수하고 대표의 해당 고객 공개 승인을 받는다. 견적 발송·비용 사용은 별도다. `noindex`는 접근 통제가 아니므로 비공개 고객자료·연락처·내부 검토 메모를 원고에 넣지 않는다.

이전 `/proposal/<slug>` 형식과 로그인/대시보드는 그대로 유지된다. 구형 brief 작업은 명시적으로 `--legacy`를 사용한다. 신규 제안서 기본값은 이 형식이다.
