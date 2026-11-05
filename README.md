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

## 새 Insight 아티클 추가하는 법

1. 가장 최근 아티클 폴더(예: `insight/005-game-round/`)를 복사해서 새 번호-슬러그 폴더 생성
2. `data/articles.json`에 새 항목 추가 (url을 새 폴더 경로로)

## 헤더/푸터 수정하는 법

`partials/header.html`, `partials/footer.html` 파일 하나만 고치면 모든 페이지에 반영됩니다.

## 이미지 교체하는 법

`class="image-slot"`이 붙은 요소를 찾아 인라인 스타일에 `background-image: url('경로')`를 추가하고, 그 안의 `.slot-placeholder`(및 `.scrim`)를 지우면 됩니다. 비율은 `style="--ratio:16/9"`로 고정되어 있어 레이아웃이 깨지지 않습니다.

## 아직 자리만 있는 기능 (의도된 상태)

- 진단 테스트, 캔버스 검토요청 제출 → 알림창만 뜸 (홈 히어로의 "진단 오픈 소식 받기" 버튼은 뉴스레터 구독 폼으로 연결됨)
- 독자 오픈채팅방 링크: 오픈 전이라 푸터에서 제외한 상태. 오픈하면 `partials/footer.html`의 `.footer-links`에 링크를 다시 추가
- HITS Master Canvas는 입력 내용이 브라우저에 로컬 저장됨 (제출 시 서버 전송은 아직 없음)
- System Canvas는 아직 콘텐츠 미확정 상태(Repeat→Scale→Sustain→Fan 문항은 책 원고 보강 후 반영 예정)
- CATEGORY / TOPIC 필터는 데이터에는 있지만 Library UI에는 아직 노출 안 함 (콘텐츠 20~30개 쌓이면 노출 예정)

## 레이아웃 폭

- 콘텐츠 폭 1140px (`.wrap` = 1180px, 좌우 패딩 20px 포함) · 글 본문 읽기 폭 740~760px
- `<html class="site-frame">` 인 페이지(홈·목록·소개·캔버스·문의·404)는 색상 면을 1240px(`--frame-width`) 패널 안으로 제한하고, 바깥은 `--bg-outer`(연회색)로 채웁니다. 값은 `css/style.css` 상단 토큰에서 한 번에 바꿉니다.
- 글 상세 페이지(사례·인사이트)는 각자 레이아웃을 쓰므로 `site-frame`을 붙이지 않습니다.

## 톤앤매너

- 메인 `#111110` / 콘텐츠 배경 `#F5F5F2` / 포인트 `#2F5CFF`
- 폰트: Pretendard (헤드라인 900 ~ 본문 400 웨이트 대비)
- "─ 기획자의 한 줄 ─" 장치: Formula 섹션, Insight 아티클 등에서 일관 사용
