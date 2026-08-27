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
function newsletterFormHTML(idPrefix) {
  return `
    <form class="newsletter-form" id="${idPrefix}-form">
      <input type="text" name="name" placeholder="이름" required>
      <input type="email" name="email" placeholder="이메일" required>
      <select name="role">
        <option value="">직군 선택 (선택)</option>
        <option value="manufacturer">제조사 · 브랜드 담당자</option>
        <option value="md">MD · 바이어</option>
        <option value="marketer">마케터 · 광고 담당자</option>
        <option value="founder">창업자 · 소상공인</option>
        <option value="etc">기타</option>
      </select>
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
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    alert('뉴스레터 연동은 준비 중입니다. Mailchimp/스티비 폼으로 교체 예정입니다.');
  });
}

/* ---------- Weekly HITS: 홈 티저 (5:5 대형 카드) ---------- */
async function renderWeeklyTeaser() {
  const mount = document.getElementById('weekly-teaser-mount');
  if (!mount) return;
  try {
    const res = await fetch('/data/cases.json');
    const cases = await res.json();
    const latest = cases.slice().sort((a, b) => b.issueNumber.localeCompare(a.issueNumber))[0];
    const dateStr = latest.publishDate.replaceAll('-', '.');
    const inner = `
      <div class="image-slot weekly-feature-img" style="--ratio:1/1">
        <div class="slot-placeholder">대표 이미지</div>
      </div>
      <div class="weekly-feature-text">
        <p class="weekly-feature-label">WEEKLY HITS #${latest.issueNumber} · ${dateStr}</p>
        <p class="weekly-feature-title">${latest.question}</p>
        <p class="weekly-feature-excerpt">${latest.excerpt || latest.description}</p>
      </div>`;
    mount.innerHTML = latest.hasDetail
      ? `<a class="weekly-feature" href="${latest.detailUrl}">${inner}</a>`
      : `<div class="weekly-feature">${inner}</div>`;
  } catch (err) { console.error(err); }
}

/* ---------- Library: 미리보기(홈) ---------- */
async function renderLibraryPreview() {
  const mount = document.getElementById('library-preview-mount');
  if (!mount) return;
  try {
    const res = await fetch('/data/cases.json');
    const cases = await res.json();
    const sorted = cases.slice().sort((a, b) => b.issueNumber.localeCompare(a.issueNumber)).slice(0, 3);
    mount.innerHTML = libraryTableHTML(sorted, false);
  } catch (err) { console.error(err); }
}

/* ---------- Library: 행(row) 렌더링 공용 함수 ---------- */
function scoreDotsHTML(scores) {
  const total = scores ? (scores.hook + scores.insight + scores.tale + scores.system) : 0;
  const avg = scores ? Math.round((scores.hook + scores.insight + scores.tale + scores.system) / 4) : 0;
  let dots = '';
  for (let i = 1; i <= 5; i++) {
    dots += `<span class="mini-dot ${i <= avg ? 'filled' : ''}"></span>`;
  }
  return dots;
}

function libraryRowHTML(c) {
  const dateStr = c.publishDate.replaceAll('-', '.');
  const inner = `
    <span class="library-row-title">#${c.issueNumber} ${c.title}</span>
    <span class="library-row-tag">${c.tag}</span>
    <span class="library-row-meta">${c.category}</span>
    <span class="library-row-dots">${scoreDotsHTML(c.scores)}</span>
    <span class="library-row-meta col-date">${dateStr}</span>`;
  return c.hasDetail
    ? `<a class="library-row" href="${c.detailUrl}">${inner}</a>`
    : `<div class="library-row" style="opacity:.75">${inner}</div>`;
}

function libraryTableHTML(list, withHeader) {
  const header = withHeader ? `
    <div class="library-row header-row">
      <span>사례</span><span>HITS</span><span>카테고리</span><span>스코어</span><span class="col-date">발행일</span>
    </div>` : '';
  return `<div class="library-table">${header}${list.map(libraryRowHTML).join('')}</div>`;
}

/* ---------- Library: 전체 페이지 (필터 + 카운트) ---------- */
let allCases = [];
async function initLibraryPage() {
  const grid = document.getElementById('case-grid');
  const filterRow = document.getElementById('case-filters');
  const countEl = document.getElementById('library-count');
  if (!grid) return;

  try {
    const res = await fetch('/data/cases.json');
    allCases = await res.json();

    const params = new URLSearchParams(window.location.search);
    const initialFilter = params.get('hits') || 'all';

    renderLibraryGrid(initialFilter);
    if (countEl) countEl.textContent = allCases.length;

    if (filterRow) {
      const target = filterRow.querySelector(`[data-filter="${initialFilter}"]`) || filterRow.querySelector('[data-filter="all"]');
      filterRow.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('is-active'));
      target.classList.add('is-active');

      filterRow.addEventListener('click', (e) => {
        const btn = e.target.closest('.filter-chip');
        if (!btn) return;
        filterRow.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('is-active'));
        btn.classList.add('is-active');
        renderLibraryGrid(btn.dataset.filter);
      });
    }
  } catch (err) {
    grid.innerHTML = '<p style="font-size:13px;color:#6B6A66">사례 데이터를 불러오지 못했습니다. 로컬 서버로 실행 중인지 확인해주세요.</p>';
    console.error(err);
  }
}

function renderLibraryGrid(filter) {
  const grid = document.getElementById('case-grid');
  const list = filter === 'all' ? allCases : allCases.filter(c => c.tag === filter);
  const sorted = list.slice().sort((a, b) => b.issueNumber.localeCompare(a.issueNumber));
  grid.innerHTML = libraryTableHTML(sorted, true);
}

/* ---------- Insight: 그리드 (홈 미리보기 + 전체 목록 공용) ---------- */
let allArticles = [];
async function renderInsightGrid(mountId, limit) {
  const mount = document.getElementById(mountId);
  if (!mount) return;
  try {
    const res = await fetch('/data/articles.json');
    allArticles = await res.json();
    paintInsightGrid(mountId, limit ? allArticles.slice(0, limit) : allArticles);

    const filterRow = document.getElementById('insight-filters');
    if (filterRow && !limit) {
      filterRow.addEventListener('click', (e) => {
        const btn = e.target.closest('.filter-chip');
        if (!btn) return;
        filterRow.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('is-active'));
        btn.classList.add('is-active');
        const cat = btn.dataset.filter;
        const list = cat === 'all' ? allArticles : allArticles.filter(a => a.category === cat);
        paintInsightGrid(mountId, list);
      });
    }
  } catch (err) { console.error(err); }
}

function paintInsightGrid(mountId, articles) {
  const mount = document.getElementById(mountId);
  articles = articles.slice().sort((a, b) => b.publishDate.localeCompare(a.publishDate));
  mount.innerHTML = articles.map(a => `
      <a href="${a.url}">
        <div class="image-slot insight-card-img light-slot" style="--ratio:4/3">
          <div class="slot-placeholder small">이미지</div>
        </div>
        <div class="insight-card-body">
          <p class="insight-card-title">${a.title}</p>
          <p class="insight-card-desc">${a.excerpt}</p>
          <div class="insight-tags">${a.tags.map(t => `<span class="insight-tag">#${t}</span>`).join('')}</div>
        </div>
      </a>`).join('');
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
      const tag = el.dataset.tag;
      const excludeId = el.dataset.exclude;
      const count = cases.filter(c => c.tag === tag && c.id !== excludeId).length;
      el.textContent = `${tag}이(가) 강한 다른 사례 ${count}개 보기 →`;
      el.setAttribute('href', `/library/?hits=${tag}`);
    });
  } catch (err) { console.error(err); }
}

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
  renderInsightGrid('insight-grid-mount', null);
  renderRelatedCounts();

  document.querySelectorAll('[data-newsletter-inline]').forEach((el, idx) => {
    if (!el.id) el.id = `newsletter-inline-${idx}`;
    renderNewsletterInline(el.id, el.dataset.newsletterInline);
  });
  if (document.getElementById('newsletter-mount-main')) renderNewsletterMain('newsletter-mount-main');
});
