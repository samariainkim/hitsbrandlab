# HITS NOW 수집원과 접근 방법

## 수집원 (확정)
- **사례 발굴(1순위)**: Ads of the World, Campaign, The Drum, Creative Review, It's Nice That, WARC(Cannes Creative Effectiveness)
- **뉴스**: Adweek Brand Marketing, Ad Age, Marketing Dive, Modern Retail, Digiday
- **태국(1~2건까지)**: Ads of the World Thailand, Brand Buffet, Campaign Brief Asia
- 보조(단독 근거 금지): Marketing Brew, Marketing Examples, 레딧 r/marketing 등

## 이 환경에서의 접근 (2026-11 확인, 바뀔 수 있으니 먼저 시험)
환경 네트워크가 제한(limited)이라 허용 호스트만 열린다. 허용 목록에 다음이 들어 있다:
`www.adsoftheworld.com, www.campaignlive.com, www.thedrum.com, www.creativereview.co.uk, www.itsnicethat.com, www.underconsideration.com, www.dezeen.com, www.warc.com, www.adweek.com, adage.com, www.marketingdive.com, modernretail.co, digiday.com, campaignbriefasia.com, www.brandbuffet.in.th, www.marketingoops.com, imgproxy.divecdn.com, static-www.adweek.com`
막히면(DNS 실패, `CONNECT tunnel failed 403`) 사용자에게 필요한 호스트를 말하고 환경 설정 변경 승인을 받는다(`update_environment`). 승인 없이 우회하지 않는다.

호스트가 열려 있어도 서버가 봇을 막는 곳이 있다. 마지막 확인 결과:
- **RSS/HTML로 읽힘**: `adweek.com/feed/`, `marketingdive.com/feeds/news/`, `digiday.com/feed/`, `campaignbriefasia.com/feed/`(+ 기사 본문 HTML)
- **403/404/오류**: Ads of the World, Campaign(campaignlive), Creative Review, Ad Age, Brand Buffet, Brand New, The Drum·It's Nice That의 RSS 주소, Modern Retail(연결 실패)
  → 이쪽은 `WebSearch`(allowed_domains 지정)로 제목·요약을 찾고, 원문은 열리는 곳에서 확인한다.

## 읽는 방법
- RSS: `curl -sSL -A "Mozilla/5.0" <feed>` 로 받아 `<item>` 의 제목·링크·날짜를 본다.
- 기사 본문: `curl -sSL -A "Mozilla/5.0" <url>` 로 HTML 을 받아 `<p>` 를 뽑는다. `og:image` 와 본문 이미지 주소도 같은 HTML 에서 얻는다.
- Adweek 은 유료 기사라 앞부분만 읽힌다(근거가 얇아 선정에서 불리).
- Marketing Dive 이미지는 서명된 imgproxy 주소라 크기를 바꾸면 깨진다. 페이지에 나오는 변형 중 가장 큰 것(예: `rs:fill:1600:900`)을 골라 쓴다.
- Campaign Brief Asia 이미지는 `-1024x575` 같은 접미사를 뗀 원본 주소가 더 크다.
