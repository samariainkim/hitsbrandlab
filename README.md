# HITS Brand Lab — 1차 리뉴얼 버전 (보완 반영)

『HITS — 팔리는 상품의 비밀』 공식 웹사이트. 순수 HTML/CSS/JS, 프레임워크 없음.
"HITS Brand Lab 1차 리뉴얼 기획안"과 이후 보완 논의(Weekly/Library 구조, System Canvas 추가, BOOK/Work with HITS 문구 수정)를 전부 반영한 버전입니다.

## 폴더 구조

```
/                       홈
/about/                 HITS란?
/library/               HITS Library (데이터베이스형 테이블 UI, 전체 아카이브 역할 겸함)
/library/00N-사례명/     개별 상세 페이지 (Weekly HITS로 발행, 현재 001~005)
/insight/                HITS Insight 목록
/insight/00N-슬러그/      Insight 아티클 상세 (현재 001~005)
/canvas/                HITS LAB CANVAS 목록 (5개: Hook·Insight·Story·System·Master)
/canvas/master/         HITS Master Canvas (실제 작동 폼)
/canvas/hook/           Hook Discovery Canvas (준비 중)
/canvas/insight/        Insight Canvas (준비 중)
/canvas/story/          Story Canvas (준비 중)
/canvas/system/         System Canvas (준비 중, Repeat→Scale→Sustain→Fan)
/work-with-hits/        협업·업무제휴 문의

css/style.css           전체 스타일 (컬러 토큰은 :root)
js/main.js              partial 로더, 데이터 렌더링, 폼 핸들링 전부
data/cases.json         Weekly 홈 티저 + Library 공용 데이터
data/articles.json      Insight 아티클 목록
partials/header.html    공용 헤더 (JS가 각 페이지에 fetch로 삽입)
partials/footer.html    공용 푸터
```

> **구조 메모**: `/weekly` 별도 페이지는 없습니다(정리 완료). Weekly는 홈페이지의 대형 티저(최신 1개, 이미지 50%+텍스트 50%, 발행일·순번·미리보기 포함)로만 존재하고, 클릭하면 바로 `/library/[순번-사례명]/` 상세 페이지로 이동합니다. 발행된 모든 사례의 아카이브 역할은 `/library`가 전담하며, 카드형이 아닌 데이터베이스형 테이블(사례/HITS/카테고리/스코어/발행일)로 노출됩니다.

## 로컬에서 확인하기

이 사이트는 fetch()로 partials와 data를 읽어오기 때문에, **반드시 로컬 서버로 실행**해야 합니다.

```bash
# 이 폴더 안에서
python3 -m http.server
# 이후 http://localhost:8000 접속
```

## 새 사례(=Weekly HITS) 추가하는 법

1. `data/cases.json`에 새 항목 추가 (issueNumber, scores, tag, excerpt 등)
2. 상세 페이지는 가장 최근 사례 폴더(예: `library/005-brompton-life-unfolded/`)를 복사해서 다음 번호 폴더로 만들고 내용 수정. 이미지는 `images/library/<폴더명>/`에 둡니다.
3. `cases.json`의 해당 항목에 `"hasDetail": true, "detailUrl": "/library/006-사례명/"` 추가 (번호는 예시)

상세 페이지 없이 목록에만 먼저 올리고 싶다면 `hasDetail: false`로 두면 됩니다 (Library 테이블에는 나오되 클릭은 안 되는 상태). **가장 최근(issueNumber가 가장 큰) 항목이 자동으로 홈페이지 Weekly 티저가 됩니다** — 별도로 홈페이지를 수정할 필요 없습니다.

**홈 카드용 선택 항목** (`cases.json` / `articles.json`)
- `thumb`: 홈 썸네일 이미지(사례 640×480, 글 800×500 권장, 수십 KB). 없으면 원본 `image`/`thumbnail`을 그대로 써서 느려질 수 있음
- `imagePosition`(사례): 홈 Weekly 카드에서 사진이 잘릴 때 보여줄 중심 위치. 예: `"68% 50%"`
- Weekly 카드 오른쪽은 `excerpt`, `hitsPoint`, `applyQuestion` 및 분류 태그에서 자동으로 채워짐

## 새 Insight 아티클 추가하는 법

1. 가장 최근 아티클 폴더(예: `insight/005-game-round/`)를 복사해서 새 번호-슬러그 폴더 생성
2. `data/articles.json`에 새 항목 추가 (url을 새 폴더 경로로)

## 헤더/푸터 수정하는 법

`partials/header.html`, `partials/footer.html` 파일 하나만 고치면 모든 페이지에 반영됩니다.

## 이미지 교체하는 법

`class="image-slot"`이 붙은 요소를 찾아 인라인 스타일에 `background-image: url('경로')`를 추가하고, 그 안의 `.slot-placeholder`(및 `.scrim`)를 지우면 됩니다. 비율은 `style="--ratio:16/9"`로 고정되어 있어 레이아웃이 깨지지 않습니다.

## 아직 자리만 있는 기능 (의도된 상태)

- 진단 테스트, 캔버스 검토요청 제출 → 알림창만 뜸 (홈 히어로의 "내 상품 진단하기" 버튼은 "준비중" 안내 창을 띄우고, 창 안의 "레터 구독하기" 버튼으로 뉴스레터 구독 폼으로 이동시킴)
- 독자 오픈채팅방 링크: 오픈 전이라 푸터에서 제외한 상태. 오픈하면 `partials/footer.html`의 `.footer-links`에 링크를 다시 추가
- HITS Master Canvas는 입력 내용이 브라우저에 로컬 저장됨 (제출 시 서버 전송은 아직 없음)
- System Canvas는 아직 콘텐츠 미확정 상태(Repeat→Scale→Sustain→Fan 문항은 책 원고 보강 후 반영 예정)
- CATEGORY / TOPIC 필터는 데이터에는 있지만 Library UI에는 아직 노출 안 함 (콘텐츠 20~30개 쌓이면 노출 예정)

## 레이아웃 폭

- 콘텐츠 폭 1140px (`.wrap` = 1180px, 좌우 패딩 20px 포함) · 글 본문 읽기 폭 740~760px
- `<html class="site-frame">` 인 페이지(홈·목록·소개·캔버스·문의·404)는 색상 면을 1240px(`--frame-width`) 패널 안으로 제한하고, 바깥은 `--bg-outer`(연회색)로 채웁니다. 값은 `css/style.css` 상단 토큰에서 한 번에 바꿉니다.
- 글 상세 페이지(사례·인사이트)는 각자 레이아웃을 쓰므로 `site-frame`을 붙이지 않습니다.

## 상세 본문 공통 규격 (사례 · 인사이트)

본문마다 글의 구조와 첫 화면 톤은 자유롭게 가져가되, 아래 공통 규칙은 **모든 상세 본문(사례, 인사이트)에서 지킵니다.** 새 글을 쓸 때도 그대로 적용합니다.

**공통 (사례 · 인사이트)**
- **화면 최대 폭**: `<html class="site-frame">` 를 붙여 색상 면을 1240px 패널 안으로 제한 (홈과 동일)
- **폭 2종**: 읽는 폭 `var(--w-read)` 800px, 넓은 폭 `var(--w-wide)` 1140px. 이 외의 폭 값은 쓰지 않음 (700px 미만의 좁은 글줄 제한은 예외)
- **글자 크기 5단계**: `var(--fs-caption)` 12 / `var(--fs-body)` 16 / `var(--fs-lead)` 22 / `var(--fs-heading)` 26~40 / `var(--fs-display)` 40~72. `font-size: Npx` 를 직접 쓰지 말고 토큰만 사용. 제목 태그(h1~h3)에 글자 크기를 지정하지 않으면 브라우저 기본값이 적용되니 반드시 지정
- **구독 · 공유 · 푸터**: 글 맨 아래에 공통 마무리 영역(`.ce`)을 복사해 사용하고, 푸터는 공용 partial 이 자동으로 붙음. 구독 폼, 공유 버튼, CTA 버튼(`btn-case`)은 같은 부품·같은 크기 토큰을 사용
- **이미지**: 가로 1600px 이하, JPG(투명도가 필요 없으면 PNG 사용 금지), 한 장 약 300KB 이하 권장. 본문 이미지에는 `alt`, `width`, `height`, `loading="lazy"` 를 넣음
- 카드(홈, 목록)의 제목은 데이터의 제목이며, 본문 H1과 같은 문구로 맞춤

**사례(Library)**
- 마무리 영역에는 EXPLORE 칩(분류 → 사업 → 시그널 순서, `data/cases.json` 에서 자동 생성)이 들어가고, 칩은 Library 검색 필터로 연결됨. `data-ce-tags`, `data-ce-meta` 에 사례 번호만 넣으면 됨
- 읽는 시간은 표기하지 않음

**인사이트**
- 마무리 영역에는 다음 글(KEEP THINKING, 발행된 다른 글을 `data/articles.json` 에서 같은 카테고리 우선·최신순 최대 3개 자동 생성), 카테고리 칩(Insight 목록의 필터로 연결), 공유, "다른 HITS 인사이트 더 보기", 구독이 들어감. `data-kt`, `data-ce-cat`, `data-ce-ameta` 에 글 번호만 넣으면 됨
- **읽는 시간은 인사이트만의 공통 요소**: 첫 화면 메타에 `N MIN READ · YYYY.MM`, 카드와 목록에는 데이터의 `readTime` 으로 `N MIN READ` 형식으로 표기
- 링크가 없는 카드("COMING SOON", `#`)와 "SEE IT IN PRACTICE" 영역은 만들지 않음

## HITS NOW (카드뉴스) 운영 규칙

- **발행**: 월~금 평일 하루 1편. 날짜는 화면에 쓰지 않고 발행 회차(No.1, No.2…)로 표기(못 올리는 날이 있어도 어색하지 않게) 해외 마케팅 사례·뉴스 5개 + 표지 + 오늘의 인사이트 = 카드 7장
- **소재 기준**: 소개하는 뉴스·사례가 HITS 세계관(Hook·Insight·Tale·System)과 부합해야 함. 인사 이동, 인수합병, 실적, 플랫폼 운영 팁, 바이럴 자체가 목적인 이벤트는 제외
- **수집원**: Ads of the World, Campaign, The Drum, Creative Review, It's Nice That, WARC / Adweek, Ad Age, Marketing Dive, Modern Retail, Digiday / 태국: Ads of the World Thailand, Brand Buffet, Campaign Brief Asia
- **원고 원칙**: 숫자·날짜·인용은 원문을 열어 확인한 것만 쓰고, 브랜드 제공 수치는 그렇게 표기. 출처(매체·날짜·대행사)와 이미지 출처를 카드에 적음
- **카드**: 1080×1350(4:5) JPG, 7장. 하단에 HITS Brand Lab 워터마크. 사진은 최종 컨펌 때 사용자가 검수
- **데이터**: `data/now.json` 에 회차 1건을 추가(`no`=회차 번호, `id`=세 자리 폴더명, `insight`, `cards`, `news`), 이미지는 `images/now/<id>/01.jpg ~ 07.jpg`. 페이지(`/now/`)는 가장 큰 `no` 를 최신으로 보여주고 `?n=회차번호` 로 지난 회차를 봄
- **이미지 용량**: 회차당 약 1MB(장당 120~170KB). 누적이 커지면 오래된 회차의 카드 해상도를 줄이는 정리가 필요

## 톤앤매너

- 메인 `#111110` / 콘텐츠 배경 `#F5F5F2` / 포인트 `#2F5CFF`
- 폰트: Pretendard (헤드라인 900 ~ 본문 400 웨이트 대비)
- "─ 기획자의 한 줄 ─" 장치: Formula 섹션, Insight 아티클 등에서 일관 사용
