# HITS Brand Lab 작업 지침

순수 HTML/CSS/JS 정적 사이트(Vercel 자동 배포: `main` → https://www.hitsbrandlab.com). 사용자는 한국어로 소통한다.

## 작업 방식
- 작업마다 최신 `main` 에서 브랜치를 판다 → 구현 → 로컬 서버 + Playwright 로 검증(변경 전후 비교, 1440·390px, 가로 넘침·콘솔 오류·글자 크기 토큰) → 브랜치 푸시(Vercel 프리뷰) → 결과 보고 → **사용자가 "병합해/병합하자"라고 명시한 뒤에만** `main` 이 변하지 않았는지 확인하고 fast-forward 병합, push.
- 사용자가 직접 `main` 을 고칠 수 있으니 작업 전에 항상 `git fetch origin main` 으로 최신을 받는다.
- 답을 받지 못한 질문의 답을 임의로 추정해 진행하지 않는다. 삭제·제거는 승인받고 한다.
- 문구·오탈자는 사용자가 요청한 경우에만 고친다. 사용자가 직접 고친 본문은 덮어쓰지 않는다.
- 저장소 안에 시안·임시 파일을 남기지 않는다(시안은 scratchpad). 작업 끝에 `git status` 가 깨끗해야 한다.
- 얕은 클론이라 푸시 후 `git fetch origin <브랜치>:refs/remotes/origin/<브랜치>` 로 추적 ref 를 만들어 둔다.
- 환경 네트워크가 제한되어 막히는 호스트는 우회하지 말고 사용자에게 허용 요청(승인)을 한다.

## 사이트 공통 규칙 (README.md 의 해당 절이 기준)
- 화면 최대 폭: `<html class="site-frame">`(1240 프레임). 폭은 `--w-read` 800 / `--w-wide` 1140 두 가지.
- 글자 크기는 5단계 토큰만 쓴다: `--fs-caption`(12) / `--fs-body`(16) / `--fs-lead`(22) / `--fs-heading`(26~40) / `--fs-display`(40~72). `font-size: Npx` 직접 지정 금지. 제목 태그(h1~h3)에도 크기를 명시한다.
- 상세 본문(사례·인사이트): 공통 마무리 영역(`.ce`), 구독 폼·공유 버튼·CTA 는 공용 부품을 쓴다. 이미지는 JPG, 가로 1600px 이하, 약 300KB 이하, `alt`·`width`·`height`·`loading="lazy"`.
- 구독 폼은 가로 한 줄 공통 레이아웃. 법적 동의 문구는 뉴스레터 폼에만 있고 문의 폼에는 없다.
- GA4 이벤트는 hitsbrandlab.com 에서만 전송(`?notrack=1` 로 끔). 새 기능에는 `page_type` 과 필요한 이벤트를 추가한다.

## HITS NOW (카드뉴스)
- 사용자가 요청할 때마다 한 회차를 만든다(예약 실행 없음). 절차와 기준은 `.claude/skills/hits-now/` 스킬을 따른다.
- 핵심 규칙: 해외 사례만(태국 최대 2건), HITS 세계관(Hook·Insight·Tale·System)에 부합하는 소재만, 원문 확인한 사실만, 화면에는 날짜 대신 회차(No.N), 7장 구성, 사용자 승인은 최종본 한 번.
