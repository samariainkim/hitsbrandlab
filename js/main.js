/*
  HITS Brand Lab — main.js
  주의: 이 사이트는 fetch()로 partials/*.html, data/*.json 을 읽어옵니다.
  로컬에서 확인할 땐 반드시 로컬 서버로 실행하세요 (README 참고).
*/

/* ---------- 공용 헤더/푸터 로드 ---------- */
async function loadPartials() {
  const headerMount = document.getElementById('site-header-mount');
  const footerMount = document.getElementById('site-footer-mount');
  try {
    if (headerMount) {
      const res = await fetch('/partials/header.html');
      headerMount.innerHTML = await res.text();
      setActiveNav();
    }
    if (footerMount) {
      const res = await fetch('/partials/footer.html');
      footerMount.innerHTML = await res.text();
    }
  } catch (err) {
    console.error('partial load failed', err);
  }
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
}

/* ---------- 뉴스레터 폼 (3곳 공용) ---------- */
const STIBEE_LIST_ACTION = 'https://stibee.com/api/v1.0/lists/1tov19hsoSpDl7psKidNtEdwknT9Wg==/public/subscribers';
const STIBEE_POLICY_TEXT = `[개인정보 수집 및 이용 동의]

HITS Brand Lab은 아래와 같이 개인정보를 수집·이용합니다.

1. 수집 항목: 이름, 이메일 주소, 직군(선택)
2. 수집 목적:
- HITS LETTER 뉴스레터 발송
- 신규 콘텐츠, 세미나 등 자체 서비스 안내
- 협업·강연·자문 등 사업 제안 및 안내
- 제3자 제휴사의 광고성 정보(제품, 서비스, 프로모션 등) 제공
- 금융 상품·서비스 관련 정보 제공
3. 보유 및 이용 기간: 수신 동의 철회 시 또는 구독 해지 시까지
4. 동의를 거부할 권리가 있으며, 거부 시 뉴스레터 구독이 제한될 수 있습니다.`;

function newsletterFormHTML(idPrefix) {
  return `
    <form class="newsletter-form" id="${idPrefix}-form" action="${STIBEE_LIST_ACTION}" method="POST" target="_blank" accept-charset="utf-8" novalidate>
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
    </form>`;
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
  const policyBtn = form.querySelector('[data-policy]');
  if (policyBtn) {
    policyBtn.addEventListener('click', () => alert(STIBEE_POLICY_TEXT));
  }
  // 폼은 실제로 스티비(Stibee) 구독 API로 제출됩니다(action/method 참고).
  // 별도의 JS 처리 없이 브라우저 기본 제출을 그대로 사용하고,
  // 결과 확인 페이지는 새 탭(target="_blank")에서 열립니다.
}

/* ---------- 긴 텍스트를 대략 10줄 분량으로 자르고 자연스럽게 "... 더보기" 이어붙이기 ---------- */
function clampExcerpt(text, maxChars) {
  if (!text || text.length <= maxChars) return text || '';
  const cut = text.slice(0, maxChars);
  const lastSpace = cut.lastIndexOf(' ');
  const trimmed = lastSpace > maxChars * 0.6 ? cut.slice(0, lastSpace) : cut;
  return `${trimmed}... 더보기`;
}

/* ---------- Weekly HITS: 홈 티저 (5:5 대형 카드) ---------- */
async function renderWeeklyTeaser() {
  const mount = document.getElementById('weekly-teaser-mount');
  if (!mount) return;
  try {
    const res = await fetch('/data/cases.json');
    const cases = await res.json();
    const published = cases.filter(c => c.hasDetail);
    const latest = (published.length ? published : cases).slice().sort((a, b) => b.publishDate.localeCompare(a.publishDate))[0];
    const dateStr = latest.publishDate.replaceAll('-', '.');
    const excerpt = clampExcerpt(latest.excerpt || latest.description, 380);
    const imgInner = latest.image
      ? `<img src="${latest.image}" alt="${latest.title}" style="width:100%;height:100%;object-fit:cover">`
      : `<div class="slot-placeholder">대표 이미지</div>`;
    const inner = `
      <div class="image-slot weekly-feature-img" style="--ratio:1/1">
        ${imgInner}
      </div>
      <div class="weekly-feature-text">
        <p class="weekly-feature-label">WEEKLY HITS #${latest.caseNumber} · ${dateStr}</p>
        <p class="weekly-feature-title">${latest.question}</p>
        <p class="weekly-feature-excerpt">${excerpt}</p>
      </div>`;
    mount.innerHTML = latest.hasDetail
      ? `<a class="weekly-feature" href="${latest.detailUrl}">${inner}</a>`
      : `<div class="weekly-feature">${inner}</div>`;
  } catch (err) { console.error(err); }
}

/* ---------- Library: 미리보기(홈) — 도서관 색인카드 스타일 ---------- */
function shortDate(dateStr) {
  const [y, m, d] = dateStr.split('-');
  return `${y.slice(2)}.${m}.${d}`;
}

/* ---------- Library: 홈 티저 (도서관 색인카드) ---------- */
async function renderLibraryPreview() {
  const mount = document.getElementById('library-preview-mount');
  if (!mount) return;
  try {
    const res = await fetch('/data/cases.json');
    const cases = await res.json();
    const sorted = cases.slice().sort((a, b) => b.caseNumber.localeCompare(a.caseNumber)).slice(0, 3);
    const cards = sorted.map(c => {
      const tag = (c.signal && c.signal[0]) || (c.category && c.category[0]) || '';
      const inner = `
        <p class="lib-card-no">NO. ${c.caseNumber} · ${tag.toUpperCase()}</p>
        <p class="lib-card-title">${c.title}</p>
        <p class="lib-card-meta">${(c.category || []).join('·').toUpperCase()} / ${shortDate(c.publishDate)}</p>`;
      return c.hasDetail
        ? `<a class="lib-card" href="${c.detailUrl}">${inner}</a>`
        : `<div class="lib-card">${inner}</div>`;
    }).join('');
    mount.innerHTML = `
      <div class="lib-card-row">
        ${cards}
        <a class="lib-card-more" href="/library/">전체 보기 →</a>
      </div>`;
  } catch (err) { console.error(err); }
}

/* ---------- Library: 케이스 카드 (전체 페이지 CASE DATABASE) ---------- */
function caseDbCardHTML(c) {
  const tags = [...(c.category || []), ...(c.business || []), ...(c.signal || [])].slice(0, 5);
  const tagsHTML = tags.map(t => {
    const isSignal = (c.signal || []).includes(t);
    return `<span class="case-db-tag ${isSignal ? 'signal' : ''}">${t}</span>`;
  }).join('');
  const inner = `
    <p class="case-db-num">CASE ${c.caseNumber}</p>
    <p class="case-db-brand">${c.brand}</p>
    <p class="case-db-question">${c.question}</p>
    <div class="case-db-tags">${tagsHTML}</div>
    ${c.hasDetail ? '<span class="case-db-cta">H × I × T × S →</span>' : ''}`;
  return c.hasDetail
    ? `<a class="case-db-card" href="${c.detailUrl}">${inner}</a>`
    : `<div class="case-db-card" style="opacity:.7">${inner}</div>`;
}

/* ---------- Library: 전체 페이지 — EXPLORE CASES 다중선택 필터 ---------- */
let allCases = [];
const AXES = {
  category: ['식품', '뷰티', '패션', '리빙', '테크', '모빌리티', '금융', '여행', '렌탈', '생활'],
  business: ['제조', '유통', '플랫폼', 'D2C', '구독', '멤버십', '서비스'],
  signal: ['문제재정의', '차별화', '컨셉', '프리미엄', '가격혁신', 'UX혁신', '스토리', '팬덤', '재구매', '카테고리확장']
};
let selected = { category: new Set(), business: new Set(), signal: new Set() };

function parseFiltersFromURL() {
  const params = new URLSearchParams(window.location.search);
  ['category', 'business', 'signal'].forEach(axis => {
    const val = params.get(axis);
    if (val) selected[axis] = new Set(val.split(','));
  });
}

function updateURL() {
  const params = new URLSearchParams();
  ['category', 'business', 'signal'].forEach(axis => {
    if (selected[axis].size) params.set(axis, [...selected[axis]].join(','));
  });
  const qs = params.toString();
  history.replaceState(null, '', qs ? `?${qs}` : window.location.pathname);
}

async function initLibraryPage() {
  const grid = document.getElementById('case-db-grid');
  const explore = document.getElementById('explore-cases');
  const statEl = document.getElementById('library-stat-num');
  if (!grid) return;

  try {
    const res = await fetch('/data/cases.json');
    allCases = await res.json();
    if (statEl) statEl.textContent = allCases.length;

    parseFiltersFromURL();

    if (explore) {
      explore.innerHTML = Object.entries(AXES).map(([axis, values]) => `
        <div class="explore-axis">
          <p class="explore-axis-label">${axis.toUpperCase()}</p>
          <div class="chip-row" data-axis="${axis}">
            ${values.map(v => `<button class="chip ${selected[axis].has(v) ? 'is-active' : ''}" data-value="${v}">${v}</button>`).join('')}
          </div>
        </div>`).join('');

      explore.addEventListener('click', (e) => {
        const btn = e.target.closest('.chip');
        if (!btn) return;
        const axis = btn.closest('.chip-row').dataset.axis;
        const value = btn.dataset.value;
        if (selected[axis].has(value)) selected[axis].delete(value);
        else selected[axis].add(value);
        btn.classList.toggle('is-active');
        updateURL();
        renderLibraryResults();
        renderActiveFilterBar();
      });
    }

    renderLibraryResults();
    renderActiveFilterBar();
  } catch (err) {
    grid.innerHTML = '<p style="font-size:13px;color:#6B6A66">사례 데이터를 불러오지 못했습니다. 로컬 서버로 실행 중인지 확인해주세요.</p>';
    console.error(err);
  }
}

function matchesFilters(c) {
  return ['category', 'business', 'signal'].every(axis => {
    if (!selected[axis].size) return true;
    const values = c[axis] || [];
    return [...selected[axis]].some(v => values.includes(v));
  });
}

function renderLibraryResults() {
  const grid = document.getElementById('case-db-grid');
  const list = allCases.filter(matchesFilters).sort((a, b) => b.caseNumber.localeCompare(a.caseNumber));
  grid.innerHTML = list.length
    ? list.map(caseDbCardHTML).join('')
    : '<p style="font-size:13px;color:#6B6A66;grid-column:1/-1">조건에 맞는 사례가 아직 없습니다.</p>';
}

function renderActiveFilterBar() {
  const bar = document.getElementById('active-filter-bar');
  if (!bar) return;
  const total = [...selected.category, ...selected.business, ...selected.signal];
  const count = allCases.filter(matchesFilters).length;

  if (!total.length) { bar.style.display = 'none'; return; }
  bar.style.display = 'flex';

  const chips = total.map(v => `<span class="active-chip" data-value="${v}">${v} ×</span>`).join('');
  bar.innerHTML = `
    <span class="active-filter-count">${count} CASES</span>
    <div class="active-filter-chips">${chips}</div>
    <button class="filter-reset" id="filter-reset-btn">RESET</button>`;

  bar.querySelectorAll('.active-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const val = chip.dataset.value;
      ['category', 'business', 'signal'].forEach(axis => selected[axis].delete(val));
      document.querySelectorAll(`.chip[data-value="${val}"]`).forEach(c => c.classList.remove('is-active'));
      updateURL();
      renderLibraryResults();
      renderActiveFilterBar();
    });
  });
  const resetBtn = document.getElementById('filter-reset-btn');
  if (resetBtn) resetBtn.addEventListener('click', () => {
    selected = { category: new Set(), business: new Set(), signal: new Set() };
    document.querySelectorAll('.chip.is-active').forEach(c => c.classList.remove('is-active'));
    updateURL();
    renderLibraryResults();
    renderActiveFilterBar();
  });
}

/* ---------- Insight: 홈 미리보기 (간단 2열, 이미지 없음) ---------- */
async function renderInsightGrid(mountId, limit) {
  const mount = document.getElementById(mountId);
  if (!mount) return;
  try {
    const res = await fetch('/data/articles.json');
    const articles = await res.json();
    const sorted = articles.slice().sort((a, b) => b.publishDate.localeCompare(a.publishDate));
    const list = limit ? sorted.slice(0, limit) : sorted;
    mount.innerHTML = list.map(a => `
      <a class="insight-preview-card" href="${a.url}">
        <p class="insight-preview-cat">${a.category}</p>
        <p class="insight-preview-title">${a.title}</p>
        <p class="insight-preview-desc">${a.excerpt}</p>
      </a>`).join('');
  } catch (err) { console.error(err); }
}

/* ---------- Insight: 전체 페이지 (Featured + 1-2-3 Editorial Rhythm + 페이지네이션) ---------- */
let allArticles = [];
let insightPage = 1;
const INSIGHT_PER_PAGE = 5; // 2(큰+작은) + 3(균등) = 5개(Featured 제외)

async function initInsightPage() {
  const featuredMount = document.getElementById('insight-featured-mount');
  const gridMount = document.getElementById('insight-grid-mount');
  const nav = document.getElementById('insight-nav');
  if (!gridMount) return;

  try {
    const res = await fetch('/data/articles.json');
    allArticles = await res.json();

    if (nav) {
      nav.addEventListener('click', (e) => {
        const btn = e.target.closest('.chip');
        if (!btn) return;
        nav.querySelectorAll('.chip').forEach(c => c.classList.remove('is-active'));
        btn.classList.add('is-active');
        insightPage = 1;
        paintInsightPage(btn.dataset.filter);
      });
    }

    paintInsightPage('all');
  } catch (err) { console.error(err); }
}

function paintInsightPage(filter) {
  const featuredMount = document.getElementById('insight-featured-mount');
  const gridMount = document.getElementById('insight-grid-mount');
  const pagerMount = document.getElementById('insight-pager');

  const sorted = allArticles.slice().sort((a, b) => b.publishDate.localeCompare(a.publishDate));
  const filtered = filter === 'all' ? sorted : sorted.filter(a => a.category === filter);

  const featured = filtered.find(a => a.featured) || filtered[0];
  const rest = filtered.filter(a => a !== featured);

  if (featuredMount) {
    featuredMount.innerHTML = featured ? featuredCardHTML(featured) : '';
  }

  const totalPages = Math.max(1, Math.ceil(rest.length / INSIGHT_PER_PAGE));
  if (insightPage > totalPages) insightPage = 1;
  const pageItems = rest.slice((insightPage - 1) * INSIGHT_PER_PAGE, insightPage * INSIGHT_PER_PAGE);
  const row2 = pageItems.slice(0, 2);
  const row3 = pageItems.slice(2, 5);

  let html = '';
  if (row2.length) {
    html += `<div class="insight-row insight-row-2">${row2.map((a, i) => insightCardHTML(a, i === 0)).join('')}</div>`;
  }
  if (row3.length) {
    html += `<div class="insight-row insight-row-3">${row3.map(a => insightCardHTML(a, false)).join('')}</div>`;
  }
  gridMount.innerHTML = html || '<p style="font-size:13px;color:#6B6A66">아직 글이 없습니다.</p>';

  if (pagerMount) {
    if (totalPages <= 1) { pagerMount.innerHTML = ''; }
    else {
      let pagerHTML = '';
      for (let i = 1; i <= totalPages; i++) {
        pagerHTML += `<span class="page-num ${i === insightPage ? 'is-active' : ''}" data-page="${i}">${i}</span>`;
      }
      pagerMount.innerHTML = pagerHTML;
      pagerMount.querySelectorAll('.page-num').forEach(el => {
        el.addEventListener('click', () => {
          insightPage = parseInt(el.dataset.page, 10);
          const activeFilter = document.querySelector('#insight-nav .chip.is-active');
          paintInsightPage(activeFilter ? activeFilter.dataset.filter : 'all');
        });
      });
    }
  }
}

function featuredCardHTML(a) {
  return `
    <a class="insight-featured" href="${a.url}">
      <div class="insight-featured-text">
        <p class="insight-featured-label">FEATURED · ${a.category}</p>
        <p class="insight-featured-title">${a.title}</p>
        <p class="insight-featured-desc">${a.excerpt}</p>
        <p class="insight-featured-time">${a.readTime} READ →</p>
      </div>
      <div class="image-slot light-slot insight-featured-img" style="--ratio:4/3">
        <div class="slot-placeholder small">대표 이미지</div>
      </div>
    </a>`;
}

function insightCardHTML(a, withVisual) {
  const visual = withVisual ? `<div class="insight-idea-visual">${a.tags[0] || ''}</div>` : '';
  return `
    <a class="insight-card ${withVisual ? 'is-large' : ''}" href="${a.url}">
      <div class="insight-card-text">
        <p class="insight-card-num">INSIGHT · ${a.category}</p>
        <p class="insight-card-title">${a.title}</p>
        ${withVisual ? `<p class="insight-card-desc">${a.excerpt}</p>` : ''}
        <p class="insight-card-time">${a.readTime} READ →</p>
      </div>
      ${visual}
    </a>`;
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

/* ---------- 진단 버튼 (히어로) ---------- */
function initDiagnoseButton() {
  const btn = document.getElementById('diagnose-btn');
  if (btn) {
    btn.addEventListener('click', () => alert('진단 테스트는 준비 중입니다. 곧 만나보실 수 있어요.'));
  }
}

/* ---------- 협업 문의 폼 ---------- */
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    alert('문의 접수 기능은 준비 중입니다. 지금은 hello@hitsbrandlab.com으로 직접 연락 부탁드립니다.');
  });
}

/* ---------- 초기화 ---------- */
document.addEventListener('DOMContentLoaded', () => {
  loadPartials();
  initFloatingButton();
  initDiagnoseButton();
  initContactForm();
  initCanvasMasterForm();
  renderWeeklyTeaser();
  renderLibraryPreview();
  initLibraryPage();
  renderInsightGrid('insight-preview-mount', 2);
  initInsightPage();
  renderRelatedCounts();

  document.querySelectorAll('[data-newsletter-inline]').forEach((el, idx) => {
    if (!el.id) el.id = `newsletter-inline-${idx}`;
    renderNewsletterInline(el.id, el.dataset.newsletterInline);
  });
  if (document.getElementById('newsletter-mount-main')) renderNewsletterMain('newsletter-mount-main');
});
