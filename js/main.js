/*
  HITS Brand Lab — main.js

  주의: fetch()로 data/cases.json을 읽어오기 때문에,
  index.html을 더블클릭해서 파일로 직접 열면(file://) 브라우저 보안 정책상
  데이터가 로드되지 않습니다.
  로컬에서 확인하려면 VS Code의 Live Server 확장을 쓰거나,
  터미널에서 이 폴더 안에서 `python3 -m http.server` 실행 후
  http://localhost:8000 으로 접속하세요.
  GitHub 연동 후 Vercel/Netlify에 배포하면 정상적으로 동작합니다.
*/

const caseGrid = document.getElementById('case-grid');
const filterRow = document.getElementById('case-filters');

let allCases = [];

async function loadCases() {
  try {
    const res = await fetch('data/cases.json');
    allCases = await res.json();
    renderCases('all');
  } catch (err) {
    caseGrid.innerHTML = '<p style="font-size:13px;color:#6B6A66">사례 데이터를 불러오지 못했습니다. 로컬 서버로 실행 중인지 확인해주세요.</p>';
    console.error(err);
  }
}

function renderCases(filter) {
  const list = filter === 'all' ? allCases : allCases.filter(c => c.tag === filter);

  caseGrid.innerHTML = list.map(item => `
    <div class="case-card">
      <span class="case-tag">${item.tag}</span>
      <p class="case-title">${item.title}</p>
      <p class="case-desc">${item.description}</p>
    </div>
  `).join('');
}

if (filterRow) {
  filterRow.addEventListener('click', (e) => {
    const btn = e.target.closest('.filter-chip');
    if (!btn) return;

    filterRow.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('is-active'));
    btn.classList.add('is-active');
    renderCases(btn.dataset.filter);
  });
}

loadCases();

/* 진단 테스트 버튼 — 1단계 MVP 자리. 추후 진단 로직/페이지로 연결 */
const diagnoseBtn = document.getElementById('diagnose-btn');
if (diagnoseBtn) {
  diagnoseBtn.addEventListener('click', () => {
    alert('진단 테스트는 준비 중입니다. 곧 만나보실 수 있어요.');
  });
}

/* 뉴스레터 폼 — 지금은 자리만 확보. 추후 Mailchimp/스티비 연동으로 교체 */
const newsletterForm = document.getElementById('newsletter-form');
if (newsletterForm) {
  newsletterForm.addEventListener('submit', (e) => {
    e.preventDefault();
    alert('뉴스레터 연동은 준비 중입니다. Mailchimp/스티비 폼으로 교체 예정입니다.');
  });
}

/* 협업 문의 폼 — 지금은 자리만 확보. 추후 실제 접수 방식(이메일 전송/폼 서비스)으로 교체 */
const contactForm = document.getElementById('contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    alert('문의 접수 기능은 준비 중입니다. 지금은 hello@hitsbrandlab.com으로 직접 연락 부탁드립니다.');
  });
}
