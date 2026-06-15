/* landing.js — Ronin Citadel landing page rendering
   Depends on: js/landing-config.js (PAGE_CONFIG must be loaded first)
   Reads PAGE_CONFIG and builds all dynamic DOM on page load.                 */

// ── Render navbar ────────────────────────────────────────────────────────────
const navLogo = document.getElementById('navLogo');
navLogo.innerHTML = `<span class="logo-icon">${PAGE_CONFIG.logoIcon}</span><span class="logo-text">${PAGE_CONFIG.logoText}</span>`;

document.getElementById('navTitle').textContent = PAGE_CONFIG.navTitle;

const navActionsEl = document.getElementById('navActions');
PAGE_CONFIG.navLinks.forEach(link => {
  const a = document.createElement('a');
  a.href = link.href;
  a.className = `btn btn-${link.style}`;
  a.textContent = link.label;
  navActionsEl.appendChild(a);
});

// ── Render hero ──────────────────────────────────────────────────────────────
const { hero } = PAGE_CONFIG;
document.getElementById('hero').innerHTML = `
  <div class="hero-eyebrow">${hero.eyebrow}</div>
  <h1 class="hero-title">
    ${hero.titleLine1}<br>
    <span>${hero.titleHighlight}</span>
  </h1>
  <p class="hero-sub">${hero.subtitle}</p>
  <div class="hero-actions">
    ${hero.cta.map(c => `<a href="${c.href}" class="btn btn-${c.style}">${c.label}</a>`).join('')}
  </div>
`;

// ── Render feature sidebar list ──────────────────────────────────────────────
const listEl = document.getElementById('featureList');
PAGE_CONFIG.featureList.forEach((item, i) => {
  const li = document.createElement('li');
  li.className = 'feature-item' + (i === 0 ? ' active' : '');
  li.dataset.card = item.card;
  li.textContent = item.label;
  listEl.appendChild(li);
});

// ── Render feature cards ─────────────────────────────────────────────────────
const cardsEl = document.getElementById('featureCards');
PAGE_CONFIG.cards.forEach(card => {
  const div = document.createElement('div');
  div.className = 'feature-card';
  div.id = 'card-' + card.id;
  if (card.href) div.addEventListener('click', () => { window.location = card.href; });

  const imgStyle = card.img ? ` style="background-image:url('${card.img}')"` : '';
  div.innerHTML = `
    <div class="card-img"${imgStyle}></div>
    <div class="card-icon-wrap">
      <span class="card-icon-large">${card.icon}</span>
    </div>
    <div class="card-body">
      ${card.badge   ? `<span class="card-badge">${card.badge}</span>` : ''}
      ${card.eyebrow ? `<div class="card-eyebrow">${card.eyebrow}</div>` : ''}
      <h2 class="card-title">${card.title}</h2>
      <p class="card-desc">${card.desc}</p>
      <div class="card-tags">${card.tags.map(t => `<span class="tag">${t}</span>`).join('')}</div>
    </div>
  `;
  cardsEl.appendChild(div);
});

// ── Sidebar → scroll-to-card ─────────────────────────────────────────────────
listEl.addEventListener('click', e => {
  const item = e.target.closest('.feature-item[data-card]');
  if (!item) return;
  document.querySelectorAll('.feature-item').forEach(el => el.classList.remove('active'));
  item.classList.add('active');
  const card = document.getElementById('card-' + item.dataset.card);
  if (card) card.scrollIntoView({ behavior: 'smooth', block: 'center' });
});

// ── Search filter ────────────────────────────────────────────────────────────
const searchInput = document.getElementById('searchInput');
searchInput.addEventListener('keydown', e => { if (e.key === 'Enter') filterCards(); });

function filterCards() {
  const q = searchInput.value.toLowerCase().trim();
  document.querySelectorAll('.feature-card').forEach(card => {
    card.style.display = !q || card.textContent.toLowerCase().includes(q) ? '' : 'none';
  });
}
