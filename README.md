# HITS Brand Lab — 1차 리뉴얼 버전

『HITS — 팔리는 상품의 비밀』 공식 웹사이트. 순수 HTML/CSS/JS, 프레임워크 없음.
"HITS Brand Lab 1차 리뉴얼 기획안" 문서의 11개 아이디어를 전부 반영한 버전입니다.

## 폴더 구조

```
/                       홈
/about/                 HITS란?
/weekly/                Weekly HITS 아카이브
/weekly/001/            Weekly HITS #001 상세 (예시)
/library/               HITS Library
/insight/                HITS Insight 목록
/insight/why-consumers-open-wallets/   Insight 아티클 상세 (예시)
/canvas/                HITS LAB CANVAS 목록
/canvas/master/         HITS Master Canvas (실제 작동 폼)
/canvas/hook/           Hook Discovery Canvas (준비 중)
/canvas/insight/        Insight Canvas (준비 중)
/canvas/story/          Story Canvas (준비 중)
/work-with-hits/        협업·업무제휴 문의

css/style.css           전체 스타일 (컬러 토큰은 :root)
js/main.js              partial 로더, 데이터 렌더링, 폼 핸들링 전부
data/cases.json         Weekly + Library 공용 데이터
data/articles.json      Insight 아티클 목록
partials/header.html    공용 헤더 (JS가 각 페이지에 fetch로 삽입)
partials/footer.html    공용 푸터
```

## 로컬에서 확인하기

이 사이트는 fetch()로 partials와 data를 읽어오기 때문에, **반드시 로컬 서버로 실행**해야 합니다.

```bash
# 이 폴더 안에서
python3 -m http.server
# 이후 http://localhost:8000 접속
```

## 새 Weekly HITS 추가하는 법

1. `data/cases.json`에 새 항목 추가 (issueNumber, scores, tag 등)
2. 상세 페이지를 원하면 `weekly/001/` 폴더를 복사해서 `weekly/002/` 등으로 만들고 내용 수정
3. `cases.json`의 해당 항목에 `"hasDetail": true, "detailUrl": "/weekly/002/"` 추가

상세 페이지 없이 카드만 먼저 올리고 싶다면 `hasDetail: false`로 두면 됩니다 (Weekly 아카이브에는 나오되 클릭은 안 되는 상태).

## 새 Insight 아티클 추가하는 법

1. `insight/why-consumers-open-wallets/` 폴더를 복사해서 새 슬러그 폴더 생성
2. `data/articles.json`에 새 항목 추가 (url을 새 폴더 경로로)

## 헤더/푸터 수정하는 법

`partials/header.html`, `partials/footer.html` 파일 하나만 고치면 모든 페이지에 반영됩니다 (13개 페이지 각각 수정할 필요 없음).

## 이미지 교체하는 법

`class="image-slot"`이 붙은 요소를 찾아 인라인 스타일에 `background-image: url('경로')`를 추가하고, 그 안의 `.slot-placeholder`(및 `.scrim`)를 지우면 됩니다. 비율은 `style="--ratio:16/9"`로 고정되어 있어 레이아웃이 깨지지 않습니다.

## 아직 자리만 있는 기능 (의도된 상태)

- 진단 테스트, 뉴스레터 제출, 협업 문의 제출, 캔버스 검토요청 제출 → 전부 알림창만 뜸 (Mailchimp/Formspree 등 실제 연동은 다음 단계)
- HITS Master Canvas는 입력 내용이 브라우저에 로컬 저장됨 (제출 시 서버 전송은 아직 없음)
- CATEGORY / TOPIC 필터는 데이터에는 있지만 Library UI에는 아직 노출 안 함 (콘텐츠 20~30개 쌓이면 노출 예정)

## 톤앤매너

- 메인 `#111110` / 콘텐츠 배경 `#F5F5F2` / 포인트 `#2F5CFF`
- 폰트: Pretendard (헤드라인 900 ~ 본문 400 웨이트 대비)
- "─ 기획자의 한 줄 ─" 장치: Formula 섹션, Insight 아티클 등에서 일관 사용
