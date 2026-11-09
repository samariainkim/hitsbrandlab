/*
  HITS Brand Lab — main.js
  주의: 이 사이트는 fetch()로 partials/*.html, data/*.json 을 읽어옵니다.
  로컬에서 확인할 땐 반드시 로컬 서버로 실행하세요 (README 참고).
*/

/* ---------- Google Analytics 4 (측정 ID: G-QH98SJK4D6) ----------
   - 내 방문 제외: 사이트 주소 뒤에 ?notrack=1 을 붙여 한 번 접속하면 이 브라우저는 측정되지 않음 (해제: ?notrack=0)
   - 폼 이벤트(구독/문의)는 아래 bindNewsletterSubmit / initContactForm 안에서 hitsTrack()으로 전송 */
/* 페이지 종류 — 모든 GA 이벤트에 page_type 으로 함께 전송됨 */
function hitsPageType(path) {
  const p = path || location.pathname;
  if (p === '/') return 'home';
  if (p === '/about/') return 'about';
  if (p === '/work-with-hits/') return 'work_with_hits';
  if (p === '/library/') return 'library_list';
  if (p.startsWith('/library/')) return 'library_case';
  if (p === '/insight/') return 'insight_list';
  if (p.startsWith('/insight/')) return 'insight_article';
  if (p === '/now/') return 'now';
  if (p === '/canvas/') return 'canvas_list';
  if (p === '/canvas/master/') return 'canvas_master';
  if (p.startsWith('/canvas/')) return 'canvas_waitlist';
  return 'other';
}

/* 구독 CTA 버튼이 어느 위치에 있는지 (cta_location) */
function hitsCtaLocation(el) {
  if (el.classList && el.classList.contains('float-newsletter-btn')) return 'floating';
  if (el.getAttribute && el.getAttribute('href') === '#now-letter') return 'now_tile';
  const sec = el.closest('section');
  if (!sec) return 'other';
  if (sec.id === 'book') return 'home_book';
  const h2 = ((sec.querySelector('h2') || {}).textContent || '').toUpperCase();
  if (h2.indexOf('WEEKLY') > -1) return 'home_weekly';
  if (h2.indexOf('INSIGHT') > -1) return 'home_insight';
  return 'other';
}

/* 구독 폼이 어느 위치에 있는지 (form_location) */
function hitsFormLocation(form) {
  if (form.closest('#hits-letter')) return 'home_main';
  const pt = hitsPageType();
  if (pt === 'canvas_waitlist') return 'canvas_waitlist';
  if (pt === 'now') return 'now_page';
  if (pt === 'library_case' || pt === 'insight_article') return 'article_end';
  return 'other';
}

(function () {
  const GA_ID = 'G-QH98SJK4D6';

  try {
    const p = new URLSearchParams(location.search);
    if (p.get('notrack') === '1') localStorage.setItem('hits-notrack', '1');
    if (p.get('notrack') === '0') localStorage.removeItem('hits-notrack');
    if (localStorage.getItem('hits-notrack') === '1') {
      window.hitsTrack = function () {};
      return;
    }
  } catch (e) { /* 저장소 접근이 막힌 환경에서는 그냥 측정 진행 */ }

  /* 운영 도메인에서만 측정한다 (Vercel Preview, 로컬 확인용 접속은 제외) */
  if (!/^(www\.)?hitsbrandlab\.com$/.test(location.hostname)) {
    window.hitsTrack = function () {};
    return;
  }

  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { dataLayer.push(arguments); };
  gtag('js', new Date());
  gtag('config', GA_ID, { page_type: hitsPageType() });
  const s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
  document.head.appendChild(s);

  const track = (name, params) => {
    try { gtag('event', name, params || {}); } catch (e) {}
  };
  window.hitsTrack = track;

  /* 클릭 이벤트 (이벤트 위임 — 나중에 생기는 카드/버튼도 자동 적용) */
  document.addEventListener('click', (e) => {
    const t = e.target;
    if (!t || !t.closest) return;

    const share = t.closest('#share-mount [data-share]');
    if (share) {
      track('share', { method: share.dataset.share, content_type: ({ insight_article: 'insight_article', now: 'now' })[hitsPageType()] || 'library_case', item_id: location.pathname });
      return;
    }

    const letterCta = t.closest('a[href="#hits-letter"], a[href="#now-letter"], .float-newsletter-btn');
    if (letterCta) {
      track('newsletter_cta_click', { cta_text: (letterCta.textContent || '').trim().slice(0, 40), cta_location: hitsCtaLocation(letterCta) });
      return;
    }

    const nowSave = t.closest('[data-now-save]');
    if (nowSave) {
      track('now_card_save', { file_name: nowSave.getAttribute('download'), from: location.pathname });
      return;
    }

    const nowSrc = t.closest('.now-src a');
    if (nowSrc) {
      track('now_source_click', { link_url: nowSrc.getAttribute('href'), from: location.pathname });
      return;
    }

    const canvasCta = t.closest('a[href^="/canvas/"]');
    if (canvasCta) {
      track('canvas_cta_click', { link_url: canvasCta.getAttribute('href'), from: location.pathname });
      return;
    }

    const card = t.closest('.case-db-card, .lib-card, .weekly-feature, .insight-preview-card, .insight-card, .insight-featured, .wk2, .lib-card2, .ins-card, .lb-card, .ix-split, .ix-row, .kt-card, .now-arch-card');
    if (card && card.getAttribute('href')) {
      track('content_card_click', {
        card_type: card.className.split(' ')[0],
        link_url: card.getAttribute('href'),
        from: location.pathname
      });
      return;
    }

    /* 인사이트 글의 카테고리 칩(#PRODUCT 등) → 목록의 카테고리 필터로 이동 */
    const cat = t.closest('a[href^="/insight/?category="]');
    if (cat) {
      track('insight_category_click', { value: (cat.textContent || '').trim().replace(/^#/, ''), from: location.pathname });
      return;
    }

    /* 사례 페이지의 태그(#문제재정의 등): 클래스명이 페이지마다 달라서 링크 주소(/library/?축=값) 기준으로 감지 */
    const tag = t.closest('a[href^="/library/?"]');
    if (tag) {
      const q = new URLSearchParams((tag.getAttribute('href').split('?')[1] || ''));
      const axis = ['category', 'business', 'signal'].find(k => q.has(k)) || '';
      track('case_tag_click', { tag: (tag.textContent || '').trim().replace(/^#/, ''), axis: axis, from: location.pathname });
      return;
    }

  });
})();

/* GA 차단/제외 상태에서도 오류가 나지 않도록 안전 호출용 */
function hitsTrackSafe(name, params) {
  if (typeof window.hitsTrack === 'function') window.hitsTrack(name, params);
}

/* ---------- 공용 헤더/푸터 로드 ---------- */
async function loadPartials() {
  const headerMount = document.getElementById('site-header-mount');
  const footerMount = document.getElementById('site-footer-mount');
  try {
    if (headerMount) {
      const res = await fetch('/partials/header.html');
      headerMount.innerHTML = await res.text();
      setActiveNav();
      initHeaderToggle();
    }
    if (footerMount) {
      const res = await fetch('/partials/footer.html');
      footerMount.innerHTML = await res.text();
    }
  } catch (err) {
    console.error('partial load failed', err);
  }
}

/* 모바일 햄버거 메뉴 (640px 이하에서만 보임) */
function initHeaderToggle() {
  const header = document.querySelector('.site-header');
  const btn = header && header.querySelector('.nav-toggle');
  if (!btn) return;
  const close = () => {
    header.classList.remove('is-open');
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-label', '메뉴 열기');
  };
  btn.addEventListener('click', () => {
    const open = header.classList.toggle('is-open');
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    btn.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기');
  });
  header.querySelectorAll('.main-nav a').forEach(a => a.addEventListener('click', close));
  document.addEventListener('click', e => { if (!header.contains(e.target)) close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  window.addEventListener('resize', () => { if (window.innerWidth > 640) close(); });
}

function setActiveNav() {
  const current = document.body.dataset.nav;
  if (!current) return;
  const link = document.querySelector(`.main-nav a[data-nav="${current}"]`);
  if (link) link.classList.add('is-current');
}

/* ---------- 플로팅 뉴스레터 버튼 ---------- */
function initFloatingButton() {
  const mount = document.getElementById('float-newsletter-mount');
  if (!mount) return;
  const btn = document.createElement('button');
  btn.className = 'float-newsletter-btn';
  btn.textContent = 'HITS 레터 받아보기';
  btn.addEventListener('click', () => {
    if (document.getElementById('hits-letter')) {
      document.getElementById('hits-letter').scrollIntoView({ behavior: 'smooth' });
    } else {
      window.location.href = '/#hits-letter';
    }
  });
  mount.appendChild(btn);

  /* 노출 조건: 처음에는 숨김 → 히어로(홈) 또는 일정 거리(그 외 페이지)를 지나 스크롤하면 표시,
     페이지 안의 구독 폼이 화면에 보이는 동안에는 다시 숨김 */
  const hero = document.querySelector('.hero');
  /* 글 하단·캔버스 폼은 나중에 JS가 만들기 때문에, 폼이 들어갈 자리([data-newsletter-inline])를 감시 */
  const forms = document.querySelectorAll('#hits-letter, [data-newsletter-inline]');
  const visibleForms = new Set();
  const update = () => {
    const past = hero ? hero.getBoundingClientRect().bottom < 60 : window.scrollY > 600;
    btn.classList.toggle('is-visible', past && visibleForms.size === 0);
  };
  if ('IntersectionObserver' in window && forms.length) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => (en.isIntersecting ? visibleForms.add(en.target) : visibleForms.delete(en.target)));
      update();
    });
    forms.forEach(f => io.observe(f));
  }
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
}

/* ---------- 공용 완료 배너(화면 상단 고정) ---------- */
function showHitsBanner(message) {
  if (!document.getElementById('hits-banner-style')) {
    const style = document.createElement('style');
    style.id = 'hits-banner-style';
    style.textContent = `
      .hits-banner { position: fixed; top: 0; left: 0; right: 0; z-index: 9999; background: #2F5CFF; color: #fff; }
      .hits-banner-inner { max-width: 1140px; margin: 0 auto; padding: 14px 20px; display: flex; align-items: center; justify-content: center; gap: 16px; position: relative; }
      .hits-banner-inner p { margin: 0; font-size: 14px; font-weight: 700; line-height: 1.6; text-align: center; }
      .hits-banner-close { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: 0; color: #fff; font-size: 18px; line-height: 1; cursor: pointer; padding: 4px 8px; opacity: 0.85; }
      .hits-banner-close:hover { opacity: 1; }
      body.hits-banner-open { padding-top: 48px; }
    `;
    document.head.appendChild(style);
  }
  let banner = document.getElementById('hits-banner');
  if (!banner) {
    banner = document.createElement('div');
    banner.id = 'hits-banner';
    banner.className = 'hits-banner';
    document.body.prepend(banner);
  }
  banner.innerHTML = `
    <div class="hits-banner-inner">
      <p>${message}</p>
      <button type="button" class="hits-banner-close" aria-label="닫기">×</button>
    </div>`;
  document.body.classList.add('hits-banner-open');
  banner.querySelector('.hits-banner-close').addEventListener('click', () => {
    banner.remove();
    document.body.classList.remove('hits-banner-open');
  });
}

/* ---------- 공유 버튼 (URL 복사 · 페이스북 · X) ---------- */
function initShareButtons() {
  const mount = document.getElementById('share-mount');
  if (!mount) return;
  if (!document.getElementById('hits-share-style')) {
    const style = document.createElement('style');
    style.id = 'hits-share-style';
    style.textContent = `
      .hits-share { display: flex; align-items: center; gap: 14px; margin: 4px 0 32px; }
      .hits-share-label { font-size: 12px; font-weight: 850; letter-spacing: .12em; color: #6B6A66; }
      .hits-share-btn { width: 38px; height: 38px; border-radius: 50%; border: 1px solid #DEDDD8; display: flex; align-items: center; justify-content: center; color: #111110; text-decoration: none; font-weight: 800; font-size: var(--fs-body); background: #fff; cursor: pointer; transition: border-color .15s, color .15s; }
      .hits-share-btn:hover { border-color: #2F5CFF; color: #2F5CFF; }
    `;
    document.head.appendChild(style);
  }
  const url = location.href;
  const title = document.title;
  mount.innerHTML = `
    <div class="hits-share">
      <span class="hits-share-label">SHARE</span>
      <button type="button" class="hits-share-btn" data-share="copy" aria-label="URL 복사">🔗</button>
      <a class="hits-share-btn" data-share="facebook" target="_blank" rel="noopener" aria-label="페이스북 공유" href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}">f</a>
      <a class="hits-share-btn" data-share="x" target="_blank" rel="noopener" aria-label="X 공유" href="https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}">𝕏</a>
    </div>`;
  const copyBtn = mount.querySelector('[data-share="copy"]');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(url).then(() => {
        showHitsBanner('링크가 복사되었습니다.');
      }).catch(() => {
        showHitsBanner('복사에 실패했습니다. 주소창의 URL을 직접 복사해주세요.');
      });
    });
  }
}

/* ---------- 뉴스레터 폼 (3곳 공용) ---------- */
const STIBEE_LIST_ACTION = 'https://stibee.com/api/v1.0/lists/1tov19hsoSpDl7psKidNtEdwknT9Wg==/public/subscribers';
/* 레터 구독 동의 문구 (필수 동의 1건). 문구를 바꾸면 기존 구독자 재동의가 필요할 수 있음 */
const NEWSLETTER_CONSENT_HTML = `
  <p class="hits-notice-title">[필수] 개인정보 수집·이용 동의</p>
  <ol class="hits-consent-list">
    <li><b>수집·이용 목적:</b> HITS Letter(뉴스레터) 발송 및 구독자 관리</li>
    <li><b>수집 항목:</b> 이름, 이메일 주소, 직군(선택 입력)</li>
    <li><b>보유·이용 기간:</b> 구독 해지 또는 동의 철회 시까지</li>
    <li><b>동의를 거부할 권리 및 불이익:</b> 동의를 거부할 수 있습니다. 다만 거부하시면 뉴스레터를 구독하실 수 없습니다.</li>
    <li>뉴스레터에는 HITS의 도서, 강연, 서비스, 상품안내 등을 소개하는 광고성 정보가 포함될 수 있습니다. 수신을 원하지 않으시면 메일 하단의 [수신거부]를 눌러 언제든 해지하실 수 있습니다.</li>
    <li><b>동의 철회·수신거부 안내:</b> 동의는 언제든 철회하실 수 있습니다. 메일 하단의 [수신거부]를 누르시면 해지됩니다. 메일 없이 요청하시려면 <a href="/work-with-hits/">[문의 페이지]</a>로 알려 주세요. 요청을 받으면 14일 이내에 처리 결과를 알려드립니다.</li>
  </ol>`;

function newsletterFormHTML(idPrefix) {
  return `
    <form class="newsletter-form" id="${idPrefix}-form" action="${STIBEE_LIST_ACTION}" method="POST" target="${idPrefix}-target" accept-charset="utf-8">
      <input type="text" name="name" placeholder="이름" required>
      <input type="email" name="email" placeholder="이메일" required>
      <select name="role">
        <option value="">직군 선택 (선택)</option>
        <option value="제조사/브랜드 담당자">제조사 · 브랜드 담당자</option>
        <option value="MD/바이어">MD · 바이어</option>
        <option value="마케터/광고 담당자">마케터 · 광고 담당자</option>
        <option value="창업자/소상공인">창업자 · 소상공인</option>
        <option value="기타">기타</option>
      </select>
      <label class="newsletter-consent">
        <input type="checkbox" required>
        (필수) <button type="button" class="newsletter-policy-link" data-policy>개인정보 수집 및 이용</button>에 동의합니다.
      </label>
      <button type="submit" class="btn btn-accent">HITS 받아보기</button>
    </form>
    <iframe name="${idPrefix}-target" class="newsletter-hidden-frame" title="구독 처리" aria-hidden="true"></iframe>`;
}

function renderNewsletterInline(mountId, heading) {
  const mount = document.getElementById(mountId);
  if (!mount) return;
  mount.innerHTML = `
    <div class="newsletter-inline">
      <p class="newsletter-inline-title">${heading}</p>
      ${newsletterFormHTML(mountId)}
    </div>`;
  bindNewsletterSubmit(`${mountId}-form`);
}

function renderNewsletterMain(mountId) {
  const mount = document.getElementById(mountId);
  if (!mount) return;
  mount.innerHTML = `
    <div class="wrap newsletter-main-inner">
      <p class="newsletter-main-label">HITS LETTER</p>
      <p class="newsletter-main-title">매주 하나, 팔리는 상품의 비밀을 보내드립니다.</p>
      ${newsletterFormHTML(mountId)}
    </div>`;
  bindNewsletterSubmit(`${mountId}-form`);
}

function bindNewsletterSubmit(formId) {
  const form = document.getElementById(formId);
  if (!form) return;
  const idPrefix = formId.replace(/-form$/, '');
  const iframe = document.querySelector(`iframe[name="${idPrefix}-target"]`);
  const policyBtn = form.querySelector('[data-policy]');
  if (policyBtn) {
    policyBtn.addEventListener('click', () => showConsentDialog(policyBtn));
  }
  let submitted = false;
  form.addEventListener('submit', () => {
    // preventDefault 하지 않음 — 폼은 실제로 숨겨진 iframe을 통해 스티비 구독 API로 정상 제출됨.
    submitted = true;
    hitsTrackSafe('newsletter_submit', { form_id: idPrefix, form_location: hitsFormLocation(form), page_path: location.pathname });
  });
  if (iframe) {
    iframe.addEventListener('load', () => {
      if (!submitted) return; // 최초 빈 iframe 로드는 무시
      submitted = false;
      hitsTrackSafe('newsletter_subscribe', { form_id: idPrefix, form_location: hitsFormLocation(form), page_path: location.pathname });
      form.reset();
      showHitsBanner('HITS Letter 구독 신청이 접수가 완료되었습니다. 입력하신 이메일로 확인 메일을 보내드렸어요.');
    });
  }
}

/* ---------- 사례 상세 공통 마무리: EXPLORE 칩 + 메타 줄을 cases.json 에서 자동 생성 ----------
   규칙: 분류(category) → 사업(business) → 시그널(signal) 순서, 각 칩은 /library/?축=값 으로 연결 */
async function initCaseEnd() {
  const tagMount = document.querySelector('[data-ce-tags]');
  const metaMount = document.querySelector('[data-ce-meta]');
  if (!tagMount && !metaMount) return;
  try {
    const res = await fetch('/data/cases.json');
    const cases = await res.json();
    const num = (tagMount || metaMount).dataset.ceTags || (tagMount || metaMount).dataset.ceMeta;
    const c = cases.find(x => x.caseNumber === num);
    if (!c) return;
    if (tagMount) {
      tagMount.innerHTML = ['category', 'business', 'signal']
        .flatMap(axis => (c[axis] || []).map(v => `<a href="/library/?${axis}=${encodeURIComponent(v)}">#${v}</a>`))
        .join('');
    }
    if (metaMount) {
      const [y, m] = c.publishDate.split('-');
      metaMount.textContent = `HITS CASE ${c.caseNumber} · ${c.brand} · ${y}.${m}`;
    }
  } catch (err) { console.error(err); }
}

/* ---------- 인사이트 공통 마무리: 다음 글(KEEP THINKING) · 카테고리 칩 · 메타 줄을 articles.json 에서 자동 생성 ----------
   다음 글 규칙: 발행된 다른 글만, 같은 카테고리 먼저 → 최신순, 최대 3개 */
async function initInsightEnd() {
  const kt = document.querySelector('[data-kt]');
  const catMount = document.querySelector('[data-ce-cat]');
  const metaMount = document.querySelector('[data-ce-ameta]');
  const first = kt || catMount || metaMount;
  if (!first) return;
  try {
    const res = await fetch('/data/articles.json');
    const all = (await res.json()).filter(a => a.url && a.url !== '#');
    const num = parseInt(first.dataset.kt || first.dataset.ceCat || first.dataset.ceAmeta, 10);
    const cur = all.find(a => a.articleNumber === num);
    if (!cur) return;
    if (kt) {
      const others = all.filter(a => a !== cur)
        .sort((a, b) => (b.category === cur.category) - (a.category === cur.category) || b.articleNumber - a.articleNumber)
        .slice(0, 3);
      kt.innerHTML = others.map(a => `
        <a class="kt-card" href="${a.url}"><small>${a.category}</small><h3>${a.title}</h3><span>${readTimeLabel(a)} →</span></a>`).join('');
    }
    if (catMount) catMount.innerHTML = `<a href="/insight/?category=${encodeURIComponent(cur.category)}">#${cur.category}</a>`;
    if (metaMount) {
      const [y, m] = cur.publishDate.split('-');
      metaMount.textContent = `HITS INSIGHT ${String(cur.articleNumber).padStart(3, '0')} · ${y}.${m}`;
    }
  } catch (err) { console.error(err); }
}

/* ---------- 긴 텍스트를 대략 10줄 분량으로 자르고 자연스럽게 "... 더보기" 이어붙이기 ---------- */
function clampExcerpt(text, maxChars) {
  if (!text || text.length <= maxChars) return text || '';
  const cut = text.slice(0, maxChars);
  const lastSpace = cut.lastIndexOf(' ');
  const trimmed = lastSpace > maxChars * 0.6 ? cut.slice(0, lastSpace) : cut;
  return `${trimmed}... 더보기`;
}

/* ---------- 홈: 가장 최근 발행 사례 선택 (Weekly 카드와 Library 목록이 같은 기준을 씀) ---------- */
function pickLatestCase(cases) {
  const published = cases.filter(c => c.hasDetail);
  return (published.length ? published : cases).slice().sort((a, b) => b.publishDate.localeCompare(a.publishDate))[0];
}

/* ---------- Weekly HITS: 홈 대표 카드 (좌 이미지 / 우 본문 콘텐츠) ---------- */
async function renderWeeklyTeaser() {
  const mount = document.getElementById('weekly-teaser-mount');
  if (!mount) return;
  try {
    const res = await fetch('/data/cases.json');
    const cases = await res.json();
    const latest = pickLatestCase(cases);
    const dateStr = latest.publishDate.replaceAll('-', '.');
    const tags = [...(latest.category || []), ...(latest.business || []), ...(latest.signal || [])].slice(0, 5);
    const pos = latest.imagePosition ? ` style="object-position:${latest.imagePosition}"` : '';
    const imgInner = latest.image ? `<img src="${latest.image}" alt="" loading="lazy"${pos}>` : '';
    const inner = `
      <div class="wk2-img">${imgInner}</div>
      <div class="wk2-body">
        <div class="wk2-meta">
          <p class="wk2-label">WEEKLY HITS #${latest.caseNumber} · ${dateStr}</p>
          <div class="wk2-tags">${tags.map(t => `<span>${t}</span>`).join('')}</div>
        </div>
        <p class="wk2-title">${latest.question}</p>
        <p class="wk2-excerpt">${latest.excerpt || latest.description || ''}</p>
        ${latest.hitsPoint ? `<div class="wk2-bigquote"><p>${latest.hitsPoint}</p></div>` : ''}
        ${latest.applyQuestion ? `<div class="wk2-ask"><span>ONE LAST QUESTION</span>${latest.applyQuestion}</div>` : ''}
        <span class="wk2-more">사례 읽어보기 →</span>
      </div>`;
    mount.innerHTML = latest.hasDetail
      ? `<a class="wk2" href="${latest.detailUrl}">${inner}</a>`
      : `<div class="wk2">${inner}</div>`;
  } catch (err) { console.error(err); }
}

/* ---------- Library: 미리보기(홈) — 도서관 색인카드 스타일 ---------- */
function shortDate(dateStr) {
  const [y, m, d] = dateStr.split('-');
  return `${y.slice(2)}.${m}.${d}`;
}

/* ---------- Library: 홈 지난 사례 (썸네일 카드 줄) — 대표 카드로 보이는 최신 사례는 제외 ---------- */
async function renderLibraryPreview() {
  const mount = document.getElementById('library-preview-mount');
  if (!mount) return;
  try {
    const res = await fetch('/data/cases.json');
    const cases = await res.json();
    const latest = pickLatestCase(cases);
    const list = cases.filter(c => c.id !== latest.id)
      .sort((a, b) => b.caseNumber.localeCompare(a.caseNumber)).slice(0, 4);
    const cards = list.map(c => {
      const tag = (c.signal && c.signal[0]) || (c.category && c.category[0]) || '';
      const img = c.thumb || c.image;
      const inner = `
        <div class="lib-card2-img">${img ? `<img src="${img}" alt="" loading="lazy">` : ''}</div>
        <p class="lib-card2-no">NO. ${c.caseNumber} · ${tag.toUpperCase()}</p>
        <p class="lib-card2-title">${c.title}</p>
        <p class="lib-card2-meta">${(c.category || []).join('·').toUpperCase()} / ${shortDate(c.publishDate)}</p>`;
      return c.hasDetail
        ? `<a class="lib-card2" href="${c.detailUrl}">${inner}</a>`
        : `<div class="lib-card2">${inner}</div>`;
    }).join('');
    mount.innerHTML = `<div class="lib-strip">${cards}</div>`;
  } catch (err) { console.error(err); }
}

/* ---------- Library: 전체 목록 (이미지 카드 2열 + 사례에 실제로 있는 값만 칩으로 노출) ---------- */
let allCases = [];
const AXIS_ORDER = ['signal', 'category', 'business'];
const AXIS_LABEL = { signal: 'SIGNAL', category: 'CATEGORY', business: 'BUSINESS' };
const TOP_CHIPS = 5; // 상단에 바로 보이는 SIGNAL 칩 수 (나머지는 "필터 더보기")
let selected = { signal: new Set(), category: new Set(), business: new Set() };

function parseFiltersFromURL() {
  const params = new URLSearchParams(window.location.search);
  AXIS_ORDER.forEach(axis => {
    const val = params.get(axis);
    if (val) selected[axis] = new Set(val.split(','));
  });
}

function updateURL() {
  const params = new URLSearchParams();
  AXIS_ORDER.forEach(axis => {
    if (selected[axis].size) params.set(axis, [...selected[axis]].join(','));
  });
  const qs = params.toString();
  history.replaceState(null, '', qs ? `?${qs}` : window.location.pathname);
}

/* 사례 데이터에서 축별 값과 개수를 뽑는다 (개수 많은 순, 같으면 가나다순) */
function chipsForAxis(axis) {
  const count = {};
  allCases.forEach(c => (c[axis] || []).forEach(v => { count[v] = (count[v] || 0) + 1; }));
  return Object.keys(count)
    .sort((a, b) => count[b] - count[a] || a.localeCompare(b, 'ko'))
    .map(v => [v, count[v]]);
}

function libChipHTML(axis, value, n) {
  const on = selected[axis].has(value);
  return `<button type="button" class="chip lb-chip ${on ? 'is-active' : ''}" data-axis="${axis}" data-value="${value}" aria-pressed="${on}">${value} <em>${n}</em></button>`;
}

function renderLibraryFilter() {
  const top = document.getElementById('lb-top-chips');
  const panel = document.getElementById('lb-panel');
  if (!top || !panel) return;
  const signal = chipsForAxis('signal');
  top.innerHTML = signal.slice(0, TOP_CHIPS).map(([v, n]) => libChipHTML('signal', v, n)).join('');
  const groups = [['signal', signal.slice(TOP_CHIPS)], ['category', chipsForAxis('category')], ['business', chipsForAxis('business')]];
  panel.innerHTML = groups.filter(([, list]) => list.length).map(([axis, list]) => `
    <div class="explore-axis">
      <p class="explore-axis-label">${AXIS_LABEL[axis]}${axis === 'signal' ? ' (더보기)' : ''}</p>
      <div class="chip-row">${list.map(([v, n]) => libChipHTML(axis, v, n)).join('')}</div>
    </div>`).join('');
  const more = document.getElementById('lb-more');
  if (!panel.innerHTML.trim()) { more.hidden = true; panel.hidden = true; }
}

function libraryCardHTML(c) {
  const tags = [...(c.signal || []).map(t => [t, true]), ...[...(c.category || []), ...(c.business || [])].map(t => [t, false])].slice(0, 3);
  const tagsHTML = tags.map(([t, isSignal]) => `<span class="lb-tag ${isSignal ? 'signal' : ''}">${t}</span>`).join('');
  const img = c.thumb || c.image;
  const inner = `
    <div class="lb-card-img">${img ? `<img src="${img}" alt="" loading="lazy">` : ''}</div>
    <div class="lb-card-body">
      <p class="lb-meta">CASE ${c.caseNumber} · ${c.brand} · ${shortDate(c.publishDate)}</p>
      <p class="lb-q">${c.question}</p>
      <div class="lb-card-tags">${tagsHTML}</div>
    </div>`;
  return c.hasDetail
    ? `<a class="lb-card" href="${c.detailUrl}">${inner}</a>`
    : `<div class="lb-card" style="opacity:.7">${inner}</div>`;
}

function matchesFilters(c) {
  return AXIS_ORDER.every(axis => {
    if (!selected[axis].size) return true;
    const values = c[axis] || [];
    return [...selected[axis]].some(v => values.includes(v));
  });
}

function renderLibraryResults() {
  const grid = document.getElementById('case-db-grid');
  const list = allCases.filter(matchesFilters).sort((a, b) => b.caseNumber.localeCompare(a.caseNumber));
  const active = AXIS_ORDER.flatMap(axis => [...selected[axis]]);
  document.getElementById('lb-count').textContent = `${list.length} CASES`;
  document.getElementById('lb-active').innerHTML = active.map(v => `<button type="button" class="active-chip" data-value="${v}">${v} ×</button>`).join('');
  document.getElementById('lb-reset').hidden = !active.length;
  grid.innerHTML = list.length
    ? list.map(libraryCardHTML).join('')
    : '<p style="font-size:13px;color:#6B6A66;grid-column:1/-1">조건에 맞는 사례가 아직 없습니다.</p>';
}

function refreshLibrary() {
  renderLibraryFilter();
  renderLibraryResults();
  updateURL();
}

async function initLibraryPage() {
  const grid = document.getElementById('case-db-grid');
  const statEl = document.getElementById('library-stat-num');
  if (!grid) return;
  try {
    const res = await fetch('/data/cases.json');
    allCases = await res.json();
    if (statEl) statEl.textContent = allCases.length;
    parseFiltersFromURL();
    refreshLibrary();

    // 선택한 값이 "더보기" 안에 있으면 처음부터 펼쳐서 보이게 한다 (사례 페이지 태그에서 들어온 경우)
    const panel = document.getElementById('lb-panel');
    const more = document.getElementById('lb-more');
    if (panel && panel.querySelector('.chip.is-active')) { panel.hidden = false; more.setAttribute('aria-expanded', 'true'); }

    document.getElementById('explore-cases').addEventListener('click', (e) => {
      const btn = e.target.closest('.lb-chip');
      if (btn) {
        hitsTrackSafe('library_filter', { value: btn.dataset.value || '' }); // 목록을 다시 그리기 전에 기록
        const set = selected[btn.dataset.axis];
        if (set.has(btn.dataset.value)) set.delete(btn.dataset.value); else set.add(btn.dataset.value);
        refreshLibrary();
        return;
      }
      if (e.target.closest('#lb-more')) {
        panel.hidden = !panel.hidden;
        more.setAttribute('aria-expanded', String(!panel.hidden));
      }
    });
    document.getElementById('lb-active').addEventListener('click', (e) => {
      const chip = e.target.closest('.active-chip');
      if (!chip) return;
      AXIS_ORDER.forEach(axis => selected[axis].delete(chip.dataset.value));
      refreshLibrary();
    });
    document.getElementById('lb-reset').addEventListener('click', () => {
      AXIS_ORDER.forEach(axis => selected[axis].clear());
      refreshLibrary();
    });
  } catch (err) {
    grid.innerHTML = '<p style="font-size:13px;color:#6B6A66">사례 데이터를 불러오지 못했습니다. 로컬 서버로 실행 중인지 확인해주세요.</p>';
    console.error(err);
  }
}

/* ---------- Insight: 홈 최신 글 썸네일 카드 (발행된 글만, 최신순) ---------- */
async function renderInsightCards(mountId, limit) {
  const mount = document.getElementById(mountId);
  if (!mount) return;
  try {
    const res = await fetch('/data/articles.json');
    const articles = await res.json();
    const list = articles.filter(a => a.url && a.url !== '#')
      .sort((a, b) => (b.articleNumber ?? -1) - (a.articleNumber ?? -1)).slice(0, limit);
    mount.innerHTML = list.map(a => {
      const img = a.thumb || a.thumbnail;
      const visual = img
        ? `<img src="${img}" alt="" loading="lazy">`
        : `<div class="ins-thumb-text">${(a.tags && a.tags[0]) || a.category}</div>`;
      return `
        <a class="ins-card" href="${a.url}">
          <div class="ins-thumb">${visual}</div>
          <div class="ins-body">
            <p class="ins-cat">${a.category} · ${readTimeLabel(a)}</p>
            <p class="ins-title">${a.title}</p>
            <p class="ins-excerpt">${a.excerpt}</p>
          </div>
        </a>`;
    }).join('');
  } catch (err) { console.error(err); }
}

/* ---------- Insight: 전체 목록 (최신 글 50:50 분할 + 목록형, 글이 있는 카테고리만 노출) ---------- */
let allArticles = [];
let insightFilter = 'all';

/* 읽는 시간은 인사이트만의 공통 요소: 데이터의 "9분"을 "9 MIN READ"로 한 형식으로 표기 */
function readTimeLabel(a) {
  const n = parseInt(a.readTime, 10);
  return n ? `${n} MIN READ` : '';
}

function insightDate(s) {
  const [y, m, d] = s.split('-');
  return `${y.slice(2)}.${m}.${d}`;
}

function insightMetaHTML(a, featured) {
  return `<p class="ix-meta">${featured ? 'FEATURED · ' : ''}${a.category} <span>· ${readTimeLabel(a)} · ${insightDate(a.publishDate)}</span></p>`;
}

/* 이미지: thumb → thumbnail → 없으면 태그 글자(텍스트 비주얼) */
function insightThumbHTML(a, preferOriginal) {
  const img = preferOriginal ? (a.thumbnail || a.thumb) : (a.thumb || a.thumbnail);
  const pos = a.imagePosition ? ` style="object-position:${a.imagePosition}"` : '';
  return `<div class="ix-thumb">${img
    ? `<img src="${img}" alt="" loading="lazy"${pos}>`
    : `<div class="ix-thumb-text">${(a.tags && a.tags[0]) || a.category}</div>`}</div>`;
}

function insightCategories() {
  const count = {};
  allArticles.forEach(a => { count[a.category] = (count[a.category] || 0) + 1; });
  return Object.keys(count).sort((a, b) => count[b] - count[a] || a.localeCompare(b)).map(c => [c, count[c]]);
}

async function initInsightPage() {
  const gridMount = document.getElementById('insight-grid-mount');
  const nav = document.getElementById('insight-nav');
  if (!gridMount) return;
  try {
    const res = await fetch('/data/articles.json');
    const all = await res.json();
    allArticles = all.filter(a => a.url && a.url !== '#')
      .sort((a, b) => (b.articleNumber ?? -1) - (a.articleNumber ?? -1));

    const fromURL = new URLSearchParams(window.location.search).get('category');
    if (fromURL) {
      if (insightCategories().some(([c]) => c === fromURL)) insightFilter = fromURL;
      else history.replaceState(null, '', window.location.pathname); // 글이 없는 카테고리면 전체로 보이고 주소도 정리
    }

    if (nav) {
      nav.addEventListener('click', (e) => {
        const btn = e.target.closest('.ix-chip');
        if (!btn) return;
        insightFilter = btn.dataset.filter;
        hitsTrackSafe('insight_filter', { value: insightFilter });
        history.replaceState(null, '', insightFilter === 'all' ? window.location.pathname : `?category=${encodeURIComponent(insightFilter)}`);
        paintInsightPage();
      });
    }
    paintInsightPage();
  } catch (err) { console.error(err); }
}

function paintInsightPage() {
  const featuredMount = document.getElementById('insight-featured-mount');
  const gridMount = document.getElementById('insight-grid-mount');
  const nav = document.getElementById('insight-nav');

  if (nav) {
    const chips = [['all', allArticles.length], ...insightCategories()];
    nav.innerHTML = chips.map(([k, n]) => {
      const on = insightFilter === k;
      return `<button type="button" class="ix-chip ${on ? 'is-active' : ''}" data-filter="${k}" aria-pressed="${on}">${k === 'all' ? 'ALL' : k} <em>${n}</em></button>`;
    }).join('');
  }

  const list = insightFilter === 'all' ? allArticles : allArticles.filter(a => a.category === insightFilter);
  const [first, ...rest] = list;

  if (featuredMount) {
    featuredMount.innerHTML = first ? `
      <a class="ix-split" href="${first.url}">
        ${insightThumbHTML(first, true)}
        <div class="ix-split-body">
          ${insightMetaHTML(first, true)}
          <p class="ix-title">${first.title}</p>
          <p class="ix-excerpt">${first.excerpt}</p>
        </div>
      </a>` : '';
  }
  gridMount.innerHTML = rest.length ? rest.map(a => `
      <a class="ix-row" href="${a.url}">
        ${insightThumbHTML(a)}
        <div>
          ${insightMetaHTML(a)}
          <p class="ix-title">${a.title}</p>
          <p class="ix-excerpt">${a.excerpt}</p>
        </div>
        <span class="ix-row-go" aria-hidden="true">→</span>
      </a>`).join('') : (first ? '' : '<p style="font-size:13px;color:#6B6A66">아직 글이 없습니다.</p>');
}

/* ---------- Canvas Master: 로컬 저장 + 검토요청 ---------- */
function initCanvasMasterForm() {
  const form = document.getElementById('canvas-master-form');
  if (!form) return;
  const STORAGE_KEY = 'hits-canvas-master';

  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  form.querySelectorAll('textarea, input').forEach(field => {
    if (saved[field.name]) field.value = saved[field.name];
    field.addEventListener('input', () => {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      data[field.name] = field.value;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    alert('검토요청 접수 기능은 준비 중입니다. 입력하신 내용은 이 브라우저에 임시 저장되어 있습니다.');
  });
}

/* ---------- Weekly 상세: "다른 사례 N개 보기" 자동 카운트 ---------- */
async function renderRelatedCounts() {
  const els = document.querySelectorAll('.related-count');
  if (!els.length) return;
  try {
    const res = await fetch('/data/cases.json');
    const cases = await res.json();
    els.forEach(el => {
      const signal = el.dataset.signal;
      const excludeId = el.dataset.exclude;
      const count = cases.filter(c => (c.signal || []).includes(signal) && c.id !== excludeId).length;
      el.textContent = `#${signal} 다른 사례 ${count}개 보기 →`;
      el.setAttribute('href', `/library/?signal=${encodeURIComponent(signal)}`);
    });
  } catch (err) { console.error(err); }
}

/* ---------- CASE DATA 태그 클릭 → Library 필터 이동 ---------- */
document.addEventListener('click', (e) => {
  const val = e.target.closest('.case-data-value');
  if (!val) return;
  window.location.href = `/library/?${val.dataset.axis}=${encodeURIComponent(val.textContent)}`;
});

/* ---------- 진단 버튼 (히어로): 준비 중 안내 + 레터 구독 유도 ---------- */
function initDiagnoseButton() {
  const btn = document.getElementById('diagnose-btn');
  if (!btn) return;
  btn.addEventListener('click', () => {
    hitsTrackSafe('diagnose_click', { cta_location: 'hero' });
    showDiagnoseNotice(btn);
  });
}

/* 공용 안내 창: 포커스 이동 제한, Esc·바깥 클릭·버튼으로 닫기, 닫은 뒤 포커스 복원
   buttons: [{ text, className, autofocus, onClick(닫기 전), after(닫은 뒤) }] */
function openHitsDialog({ label, html, buttons, opener, extraClass }) {
  if (document.getElementById('hits-notice')) return;
  const overlay = document.createElement('div');
  overlay.id = 'hits-notice';
  overlay.className = 'hits-notice';
  overlay.innerHTML = `
    <div class="hits-notice-box ${extraClass || ''}" role="dialog" aria-modal="true" aria-label="${label}">
      ${html}
      <div class="hits-notice-actions"></div>
    </div>`;
  const actions = overlay.querySelector('.hits-notice-actions');
  let focusEl = null;
  function close() {
    overlay.remove();
    document.documentElement.classList.remove('hits-notice-open');
    document.removeEventListener('keydown', onKey);
    if (opener) opener.focus();
  }
  buttons.forEach(b => {
    const el = document.createElement('button');
    el.type = 'button';
    el.className = b.className;
    el.textContent = b.text;
    el.addEventListener('click', () => {
      if (b.onClick) b.onClick();
      close();
      if (b.after) b.after();
    });
    if (b.autofocus) focusEl = el;
    actions.appendChild(el);
  });
  const onKey = (e) => {
    if (e.key === 'Escape') { close(); return; }
    if (e.key === 'Tab') { // 안내 창 안에서만 포커스 이동
      const items = overlay.querySelectorAll('button, a[href]');
      const first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  };
  document.body.appendChild(overlay);
  document.documentElement.classList.add('hits-notice-open');
  document.addEventListener('keydown', onKey);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
  (focusEl || actions.querySelector('button')).focus();
}

function showDiagnoseNotice(opener) {
  openHitsDialog({
    label: '진단 테스트 안내',
    opener,
    html: '<p class="hits-notice-text">진단 테스트 서비스는 준비중입니다.<br>레터 구독하기를 신청하시면 오픈 소식을 가장 먼저 받아보실 수 있습니다.</p>',
    buttons: [
      { text: '닫기', className: 'btn hits-notice-close' },
      {
        text: '레터 구독하기', className: 'btn btn-accent', autofocus: true,
        onClick: () => hitsTrackSafe('newsletter_cta_click', { cta_text: '레터 구독하기', cta_location: 'diagnose_notice' }),
        after: () => {
          const section = document.getElementById('hits-letter');
          if (section) { section.scrollIntoView({ behavior: 'smooth' }); flashHitsLetter(); }
          else window.location.href = '/#hits-letter';
        }
      }
    ]
  });
}

/* 레터 구독 폼의 "개인정보 수집 및 이용" 동의 문구 */
function showConsentDialog(opener) {
  openHitsDialog({
    label: '개인정보 수집·이용 동의',
    opener,
    extraClass: 'is-consent',
    html: NEWSLETTER_CONSENT_HTML,
    buttons: [{ text: '닫기', className: 'btn btn-accent', autofocus: true }]
  });
}

/* ---------- 협업 문의 폼 ---------- */
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;
  const iframe = document.querySelector('iframe[name="contact-target"]');
  let submitted = false;
  form.addEventListener('submit', () => {
    // preventDefault 하지 않음 — 폼은 실제로 숨겨진 iframe을 통해 Formspree로 정상 제출됨.
    submitted = true;
    hitsTrackSafe('contact_submit', { form_id: 'contact-form' });
  });
  if (iframe) {
    iframe.addEventListener('load', () => {
      if (!submitted) return; // 최초 빈 iframe 로드는 무시
      submitted = false;
      hitsTrackSafe('contact_success', { form_id: 'contact-form' });
      form.reset();
      showHitsBanner('문의가 정상적으로 접수되었습니다. 빠른 시일 내에 담당자가 확인하여 회신드리도록 하겠습니다.');
    });
  }
}

/* ---------- 초기화 ---------- */

/* ==========================================================
   HITS NOW (카드뉴스) — data/now.json 의 한 회차를 카드 가로 스크롤로 보여줌
   ?n=회차번호 로 지난 회차 선택, 없으면 최신
   ========================================================== */
async function initNowPage() {
  const mount = document.getElementById('now-mount');
  if (!mount) return;
  let all = [];
  try {
    all = await (await fetch('/data/now.json', { cache: 'no-cache' })).json();
  } catch (e) { return; }
  all.sort((a, b) => b.no - a.no);
  const want = Number(new URLSearchParams(location.search).get('n'));
  const cur = all.find(e => e.no === want) || all[0];
  if (!cur) return;
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
  const base = `/images/now/${cur.id}/`;
  const urls = cur.cards.map(f => base + f);
  const fig = (k, cls) => `<figure class="now-fig${cls ? ' ' + cls : ''}"><button type="button" data-now-open="${k}" aria-label="${k + 1}번 카드 크게 보기"><img src="${urls[k]}" alt="HITS NOW No.${cur.no} ${k + 1}번 카드" width="1080" height="1350" loading="${k < 3 ? 'eager' : 'lazy'}" decoding="async"></button></figure>`;
  const cells = urls.map((u, k) => fig(k, k === 0 ? 'big' : '')).join('');
  const tiles = `
    <div class="now-tile blue"><div><h3>다음 HITS가<br>궁금하다면</h3><p>HITS 레터로 먼저 받아보세요.</p></div><a href="#now-letter">HITS 레터 받아보기 →</a></div>
    <div class="now-tile"><div><h3>지난 HITS NOW</h3><p>지난 회차의 카드를 다시 볼 수 있어요.</p></div><a href="#now-past">지난 회차 →</a></div>`;
  const src = cur.news.map((n, k) => `
    <div><small>${String(k + 1).padStart(2, '0')} · ${esc(n.region)}</small><b>${esc(n.brand)} · ${esc(n.headline)}</b>
    <a href="${esc(n.url)}" target="_blank" rel="noopener">${esc(n.title)} — ${esc(n.outlet)} ↗</a></div>`).join('');
  const past = all.map(e => `
    <a class="now-pc${e === cur ? ' on' : ''}" href="/now/?n=${e.no}">
      <img src="/images/now/${e.id}/${e.cards[0]}" alt="HITS NOW No.${e.no} 표지" width="1080" height="1350" loading="lazy" decoding="async">
      <b>No.${e.no}</b><span>${esc(e.insight)}</span>
    </a>`).join('');
  mount.innerHTML = `
    <div class="now-meta"><b>No.${cur.no}</b><span>${cur === all[0] ? 'LATEST' : 'ARCHIVE'}</span><em>${esc(cur.insight)}</em></div>
    <div class="now-grid">${cells}${tiles}</div>
    <div class="now-src">${src}</div>
    <div class="now-share" id="share-mount"></div>
    <div class="now-past" id="now-past"><h2>지난 HITS NOW</h2><p class="sub">놓친 회차도 카드로 다시 볼 수 있어요.</p><div class="now-prow">${past}</div></div>`;
  document.title = `HITS NOW No.${cur.no} — HITS Brand Lab`;
  if (typeof initShareButtons === 'function') initShareButtons();

  /* 카드 크게 보기(라이트박스): 클릭/←→/Esc */
  const lb = document.createElement('div');
  lb.className = 'now-lb';
  lb.setAttribute('role', 'dialog');
  lb.setAttribute('aria-label', '카드 크게 보기');
  lb.innerHTML = `<div class="now-lb-in"><img alt=""><a data-now-save download>↓ 이 카드 저장</a>
    <button type="button" class="x" aria-label="닫기">✕</button><button type="button" class="p" aria-label="이전 카드">←</button><button type="button" class="n" aria-label="다음 카드">→</button></div>`;
  document.body.appendChild(lb);
  let idx = 0;
  const lbImg = lb.querySelector('img');
  const lbSave = lb.querySelector('[data-now-save]');
  const show = k => {
    idx = (k + urls.length) % urls.length;
    lbImg.src = urls[idx];
    lbImg.alt = `HITS NOW No.${cur.no} ${idx + 1}번 카드`;
    lbSave.href = urls[idx];
    lbSave.setAttribute('download', `HITS-NOW_No${cur.no}_${String(idx + 1).padStart(2, '0')}.jpg`);
  };
  const open = k => { show(k); lb.classList.add('open'); hitsTrackSafe('now_card_open', { no: cur.no, card: k + 1 }); };
  const close = () => lb.classList.remove('open');
  mount.addEventListener('click', e => {
    const b = e.target.closest('[data-now-open]');
    if (b) open(Number(b.dataset.nowOpen));
  });
  lb.addEventListener('click', e => { if (e.target === lb || e.target.closest('.x')) close(); });
  lb.querySelector('.p').addEventListener('click', () => show(idx - 1));
  lb.querySelector('.n').addEventListener('click', () => show(idx + 1));
  document.addEventListener('keydown', e => {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') show(idx - 1);
    if (e.key === 'ArrowRight') show(idx + 1);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  loadPartials();
  initNowPage();
  initFloatingButton();
  initShareButtons();
  initDiagnoseButton();
  initCaseEnd();
  initInsightEnd();
  initContactForm();
  initCanvasMasterForm();
  renderWeeklyTeaser();
  renderLibraryPreview();
  initLibraryPage();
  renderInsightCards('insight-preview-mount', 3);
  initInsightPage();
  renderRelatedCounts();

  document.querySelectorAll('[data-newsletter-inline]').forEach((el, idx) => {
    if (!el.id) el.id = `newsletter-inline-${idx}`;
    renderNewsletterInline(el.id, el.dataset.newsletterInline);
  });
  if (document.getElementById('newsletter-mount-main')) renderNewsletterMain('newsletter-mount-main');

  bindHitsLetterCtaHighlight();
});

/* '#hits-letter'로 점프하는 CTA 버튼들: 스크롤만으로는 클릭했다는 느낌이 약해서,
   도착 지점의 구독 폼을 잠깐 강조(하이라이트)하고 이름 입력창에 포커스를 준다. */
function flashHitsLetter() {
  setTimeout(() => {
    const section = document.getElementById('hits-letter');
    const form = section && section.querySelector('.newsletter-form');
    if (!section) return;
    section.classList.add('newsletter-highlight');
    const nameInput = form && form.querySelector('input[name="name"]');
    if (nameInput) nameInput.focus();
    setTimeout(() => section.classList.remove('newsletter-highlight'), 1400);
  }, 550); // 부드러운 스크롤(smooth scroll)이 끝날 즈음 실행
}

function bindHitsLetterCtaHighlight() {
  document.querySelectorAll('a[href="#hits-letter"]').forEach(link => {
    link.addEventListener('click', flashHitsLetter);
  });
}
