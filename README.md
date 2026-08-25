# HITS Brand Lab

《HITS — 팔리는 상품의 비밀》 공식 웹사이트 초기 버전. 순수 HTML/CSS/JS, 프레임워크 없음.

## 폴더 구조

```
hits-brand-lab/
├── index.html          홈페이지
├── css/style.css        전체 스타일 (컬러 토큰은 :root 에 정의)
├── js/main.js            사례 필터링, 폼 핸들링
├── data/cases.json       사례 라이브러리 데이터 (새 사례는 이 파일에 추가)
└── README.md
```

## 로컬에서 확인하기

`index.html`을 더블클릭해서 열면 사례 데이터가 로드되지 않습니다(브라우저 보안 정책). 아래 중 하나로 실행하세요.

```bash
# 이 폴더 안에서
python3 -m http.server
# 이후 http://localhost:8000 접속
```

또는 VS Code의 **Live Server** 확장을 사용하세요.

## 배포

1. 이 폴더를 새 GitHub 레포로 push
2. Vercel 또는 Netlify에서 해당 레포를 New Project로 연결 (빌드 설정 불필요, 정적 사이트)
3. 후이즈 등에서 구매한 도메인의 DNS를 Vercel/Netlify 안내에 따라 연결

## 사례 추가하는 법

`data/cases.json`에 아래 형식으로 항목을 추가하고 push하면 자동 반영됩니다.

```json
{
  "id": "고유id",
  "tag": "Hook",
  "title": "상품명",
  "description": "한 줄 설명",
  "image": ""
}
```

`tag`는 `Hook` / `Insight` / `Tale` / `System` 중 하나여야 필터가 정상 작동합니다.

## 이미지 교체하는 법

`index.html`에서 `class="image-slot"`이 붙은 요소(히어로, 위클리 썸네일, 뉴스레터 배경)를 찾아, 인라인 스타일에 `background-image: url('경로')`를 추가하고 그 안의 `.slot-placeholder`, `.scrim`(선택) 요소를 지우면 됩니다. 비율은 `style="--ratio:16/9"`처럼 이미 고정되어 있어 레이아웃이 깨지지 않습니다.

## 톤앤매너

- 메인: 근접 블랙 `#111110` / 콘텐츠 배경: 오프화이트 `#F5F5F2`
- 포인트: 일렉트릭 블루 `#2F5CFF` (클릭 가능한 지점에만 사용)
- 폰트: Pretendard (Black 900 ~ Regular 400 웨이트 대비로 임팩트 연출)
