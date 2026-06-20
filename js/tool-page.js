/* tool-page.js — Ronin Citadel tool detail page renderer
   Depends on: js/tool-page-config.js (SITE + TOOLS must be loaded first)
   Reads ?id= from the URL and builds the full page from TOOLS config.        */

// ── Resolve tool from URL ─────────────────────────────────────────────────────
// Supports both /tools/{slug} (production) and ?id={slug} (fallback)
const SLUG_TO_ID = {
  'ronin-server-manager': 'rsm',
  'ronin-portier':        'portier',
  'ronin-disk-manager':   'disk',
  'ronin-forge':          'forge',
  'live-console':         'console',
  'cpu-ram-monitor':      'monitor',
  'role-based-access':    'roles',
  'two-factor-auth':      '2fa',
  'team-management':      'team',
  'remote-access':        'remote',
  // short IDs also accepted directly
  'rsm': 'rsm', 'portier': 'portier', 'disk': 'disk', 'forge': 'forge',
  'console': 'console', 'monitor': 'monitor', 'roles': 'roles',
  '2fa': '2fa', 'team': 'team', 'remote': 'remote',
};

const urlSegment = window.location.pathname.split('/').filter(Boolean).pop() ?? '';
const queryId    = new URLSearchParams(window.location.search).get('id') ?? '';
const toolId     = SLUG_TO_ID[urlSegment] ?? SLUG_TO_ID[queryId] ?? '';
const tool       = TOOLS[toolId];

if (!tool) {
  window.location.replace('/');
  throw new Error('Unknown tool: ' + (urlSegment || queryId));
}

document.title = tool.name + ' — Ronin Citadel';

// ── Render navbar ────────────────────────────────────────────────────────────
document.getElementById('navLogo').innerHTML =
  `<span class="logo-icon">${SITE.logoIcon}</span><span class="logo-text">${SITE.logoText}</span>`;
document.getElementById('navTitle').textContent = SITE.navTitle;

const navActionsEl = document.getElementById('navActions');
SITE.navLinks.forEach(link => {
  const a = document.createElement('a');
  a.href = link.href;
  a.className = `btn btn-${link.style}`;
  a.textContent = link.label;
  navActionsEl.appendChild(a);
});

// ── Render hero ──────────────────────────────────────────────────────────────
const heroEl = document.getElementById('toolHero');
heroEl.classList.add('tool-hero--' + tool.id);

// If tool has a real photo, set it as background-image (overlays the CSS gradient)
if (tool.img) heroEl.style.backgroundImage = `url('${tool.img}')`;

// CTA button(s)
let ctaHtml;
if (tool.type === 'feature') {
  ctaHtml = `<a href="/login" class="btn btn-primary btn-lg">Open Ronin Citadel Portal →</a>`;
} else if (tool.badge) {
  ctaHtml = `
    <span class="tool-badge">${tool.badge}</span>
    <button class="btn btn-ghost btn-lg" disabled style="opacity:0.4;cursor:not-allowed;">Download not yet available</button>
  `;
} else {
  ctaHtml = `
    <a href="${tool.download}" class="btn btn-primary btn-lg">
      ⬇ Download ${tool.name}${tool.size ? `<span class="btn-meta">${tool.size}</span>` : ''}
    </a>
    ${tool.github ? `<a href="${tool.github}" class="btn btn-ghost btn-lg">View on GitHub</a>` : ''}
  `;
}

document.getElementById('toolHeroInner').innerHTML = `
  <a href="/" class="tool-back">← Back to Ronin Citadel</a>
  <div class="tool-hero-icon">${tool.icon}</div>
  <div class="tool-eyebrow">${tool.eyebrow}</div>
  <h1 class="tool-name">${tool.name}</h1>
  <p class="tool-tagline">${tool.tagline}</p>
  <div class="tool-cta">${ctaHtml}</div>
`;

// ── Render body ──────────────────────────────────────────────────────────────
const bodyEl = document.getElementById('toolBody');

// Build screenshots HTML
function buildScreenshots(shots) {
  if (!shots || shots.length === 0) return '';

  let html = '<div class="tool-screenshots"><div class="tool-section-label">Screenshots</div>';
  let i = 0;
  while (i < shots.length) {
    const s = shots[i];
    if (s.layout === 'grid' && shots[i + 1]?.layout === 'grid') {
      // Pair two grid items side by side
      const s2 = shots[i + 1];
      html += `
        <div class="screenshots-grid">
          <div class="screenshot-block">
            <img src="${s.src}" alt="${s.caption || ''}" loading="lazy">
            ${s.caption ? `<div class="screenshot-caption">${s.caption}</div>` : ''}
          </div>
          <div class="screenshot-block">
            <img src="${s2.src}" alt="${s2.caption || ''}" loading="lazy">
            ${s2.caption ? `<div class="screenshot-caption">${s2.caption}</div>` : ''}
          </div>
        </div>`;
      i += 2;
    } else {
      // Full-width single screenshot
      html += `
        <div class="screenshot-block">
          <img src="${s.src}" alt="${s.caption || ''}" loading="lazy">
          ${s.caption ? `<div class="screenshot-caption">${s.caption}</div>` : ''}
        </div>`;
      i++;
    }
  }
  html += '</div>';
  return html;
}

// Build feature tiles HTML
function buildFeatureTile(f) {
  if (f.img) {
    return `
      <div class="feature-tile feature-tile--has-img">
        <img class="tile-screenshot" src="${f.img}" alt="${f.title}" loading="lazy">
        <div class="tile-text">
          <div class="feature-tile-icon">${f.icon}</div>
          <h3 class="feature-tile-title">${f.title}</h3>
          <p class="feature-tile-desc">${f.desc}</p>
        </div>
      </div>`;
  }
  return `
    <div class="feature-tile">
      <div class="feature-tile-icon">${f.icon}</div>
      <h3 class="feature-tile-title">${f.title}</h3>
      <p class="feature-tile-desc">${f.desc}</p>
    </div>`;
}

// Build the download / info panel at the bottom
function buildInfoPanel(t) {
  if (t.type === 'feature') {
    return `
      <div class="tool-info-panel tool-info-panel--feature">
        <div class="info-panel-label">Portal Feature</div>
        <p class="info-panel-desc">
          ${t.name} is built into the Ronin Citadel web portal.
          No separate download needed. Open the portal and navigate to it.
        </p>
        <a href="/login" class="btn btn-primary btn-lg">Open Ronin Citadel Portal →</a>
        <a href="/" class="btn btn-ghost" style="margin-top:4px">← Back to Home</a>
      </div>`;
  }

  if (t.badge) {
    return `
      <div class="tool-info-panel tool-info-panel--dev">
        <div class="info-panel-label">In Development</div>
        <p class="info-panel-desc">
          ${t.name} is currently being built. Check back for release announcements.
        </p>
        <a href="/" class="btn btn-ghost">← Back to Home</a>
      </div>`;
  }

  return `
    <div class="tool-info-panel">
      <div class="info-panel-label">Download</div>
      <div class="tool-info-meta">
        <div class="meta-item"><span class="meta-label">Version</span><span class="meta-value">${t.version}</span></div>
        <div class="meta-item"><span class="meta-label">Platform</span><span class="meta-value">${t.platform}</span></div>
        <div class="meta-item"><span class="meta-label">Requires</span><span class="meta-value">${t.requires}</span></div>
        <div class="meta-item"><span class="meta-label">Size</span><span class="meta-value">${t.size}</span></div>
      </div>
      <a href="${t.download}" class="btn btn-primary btn-lg">⬇ Download ${t.name}</a>
      ${t.github ? `<a href="${t.github}" class="btn btn-ghost" style="margin-top:8px">View Source on GitHub</a>` : ''}
    </div>`;
}

bodyEl.innerHTML = `
  <div class="tool-container">
    <p class="tool-desc">${tool.desc}</p>

    <div class="tool-section-label">Features</div>
    <div class="tool-features-grid">
      ${tool.features.map(buildFeatureTile).join('')}
    </div>

    ${buildScreenshots(tool.screenshots)}

    ${buildInfoPanel(tool)}
  </div>
`;
