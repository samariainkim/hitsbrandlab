---
name: hits-now
description: HITS Brand Lab 사이트의 "HITS NOW"(해외 마케팅 사례·뉴스 카드뉴스) 한 회차를 조사부터 카드 7장 제작, 사이트 반영(브랜치 푸시)까지 만든다. 사용자가 "히츠 나우 N호 작업해줘", "HITS NOW 새 회차", "카드뉴스 다음 호" 등을 요청할 때 사용한다. 사용자가 요청할 때만 작업하며 예약 실행은 하지 않는다.
---

# HITS NOW 한 회차 만들기

사용자가 요청하면 **조사 → 선정 → 원문 확인 → 문구 → 사진 → 카드 제작 → 사이트 반영 → 프리뷰용 브랜치 푸시**까지 끝내고, 사용자는 **최종본을 한 번만 승인**한다(원고 단계의 별도 확인은 없다). 승인 전에는 `main` 에 병합하지 않는다.

먼저 읽을 것: `references/copy-guide.md`(선정 기준·문구 규칙), `references/sources.md`(수집원·접근 방법). 저장소 루트의 `README.md` 의 "HITS NOW 운영 규칙"과 `CLAUDE.md` 도 따른다.

## 절차

1. **준비**: `git fetch origin main` 후 최신 `main` 에서 `now-00N` 브랜치를 판다. 회차 번호 N 은 `data/now.json` 의 가장 큰 `no` + 1. 작업 폴더는 세션 scratchpad 아래에 만든다(`<scratchpad>/now-00N/`, 안에 `img/`). 저장소 안에 임시 파일을 두지 않는다(끝에 untracked 가 남으면 안 된다).
2. **수집**: `references/sources.md` 의 방법으로 후보 15~20건을 모은다. RSS 로 열리는 곳 + `WebSearch`(allowed_domains)로 못 읽는 곳을 보완. 이전 회차와 같은 사례는 뺀다.
3. **원문 확인과 점수화**: 상위 8건 이상은 원문을 끝까지 읽고 Hook·Insight·Tale·System 으로 점수를 매긴다. 제외 기준에 걸리는 건 뺀다.
4. **5건 선정**: 해외 5건(태국 최대 2건, 지역 분산). 유료로 막혀 근거가 얇은 건 피하고, 대체 후보 2~3건을 따로 적어 둔다.
5. **문구 작성**: `copy-guide.md` 의 톤으로 카드별 헤드라인·칩·본문·출처 줄, 오늘의 인사이트 한 줄을 쓴다(인사이트 문구는 후보 1~3개를 내되 최종 보고에는 추천 1개를 쓰고 사용자가 바꾸면 따른다).
6. **사진**: 기사 이미지 중 가장 큰 원본을 `<작업폴더>/img/<뉴스id>.jpg` 로 저장(WEBP 등은 JPG 로 변환). 각 사진의 해상도·위험 요소(선정적, 브랜드 미노출, 저해상도)를 메모한다.
7. **카드 제작**: `<작업폴더>/edition.json` 을 `assets/edition.example.json` 형식으로 쓴다. 그다음
   ```bash
   python3 .claude/skills/hits-now/scripts/build_cards.py <작업폴더>
   ```
   로 미리보기(PNG 7장 + `sheet.jpg`)를 만들고, 글자 넘침(출력의 영역 끝 위치: 본문 `txt` 끝 ≤ 1180, 인사이트 `refs` 끝 ≤ 1260)과 깨진 이미지(`broken` ≠ 0)를 확인한다. 이미지를 직접 열어 눈으로도 본다. 문제가 있으면 문구를 줄이거나 `pos` 를 조정한다.
8. **사이트 반영**: 같은 명령에 `--publish` 를 붙여 `images/now/00N/01~07.jpg` 와 `data/now.json` 을 갱신한다. 로컬 서버로 `/now/` 를 열어 새 회차가 LATEST 로, 지난 HITS NOW 에 표지가 추가됐는지, `?n=N-1` 이 이전 회차인지, 가로 넘침·콘솔 오류가 없는지 확인한다(Playwright, 1440·390).
9. **푸시**: 커밋(회차 번호와 사례 요약) 후 `git push -u origin now-00N`, 이어서 `git fetch origin now-00N:refs/remotes/origin/now-00N`(얕은 클론에서 추적 ref 누락 방지). 커밋 메시지 끝에 시스템이 지정한 attribution 줄을 붙인다.
10. **보고(한 번에 승인받는 패키지)**: `SendUserFile` 로 `sheet.jpg` 와 카드 7장을 보내고, 아래를 한 메시지에 담는다. 카드 7장 전체 문구는 이미지에 있으므로 반복하지 않는다.
    - 인사이트 한 줄, 선정 5건 표(사례·지역·HITS 요소·핵심 한 줄)
    - 확인 필요한 것: 사진별 위험·해상도, 출처가 발표 수치인 부분, 오래된 기사, 근거가 얇은 부분
    - 대체 후보
    - 승인 방법("병합해" 또는 바꿀 부분 지시)과 프리뷰 확인 안내
11. **수정 요청**: 해당 카드만 다시 만든다(문구 수정은 `edition.json` 수정 → `build_cards.py --publish` → 커밋·푸시). 사용자가 확정한 부분은 건드리지 않는다.
12. **병합**: 사용자가 "병합해/병합하자"라고 **명시적으로** 말한 뒤에만. `git fetch origin main` 으로 `main` 이 변하지 않았는지(`merge-base --is-ancestor origin/main <브랜치>`) 확인하고 fast-forward 병합 후 push, `git fetch origin main` 으로 일치 확인. 변했다면 사용자에게 알리고 합치는 방법을 묻는다.

## edition.json 형식

`assets/edition.example.json`(2호)이 완성된 예시다.
- 최상위: `no`(회차), `id`(세 자리 폴더명, 예 "003"), `label`("HITS NOW · No.3" — **날짜는 화면에 쓰지 않는다**), `subtitle`(표지 부제), `insight`, `insight_highlight`(insight 안의 파란 강조 구절), `news`(5개)
- 뉴스 항목: `id`(사진 파일명), `region`, `brand`, `tag`(칩), `headline`, `body`, `source`(카드 하단 출처 줄: "매체(발행일) · 대행사 · 수치 출처 표기"), `imgcredit`(매체명), `title`(기사 제목), `outlet`, `url`(원문), `pos`(사진 잘림 위치, 기본 "50% 50%")
- 출처 줄의 날짜는 **기사 발행일**(출처 인용 정보)이며 우리 발행일이 아니다.

## 하지 않는 것
- 사용자 승인 전 병합, 예약 작업 등록, 승인 없는 네트워크 허용 변경
- 사용자가 확정한 문구·사진의 임의 수정
- 원문에서 확인하지 못한 숫자·사실 서술
- 저장소 안에 임시 파일·시안을 커밋하거나 남기기
