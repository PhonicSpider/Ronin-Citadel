/* spiderweb.js — Ronin Citadel spider web navigation */

const NS = 'http://www.w3.org/2000/svg';

// ══════════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ══════════════════════════════════════════════════════════════════════════════
const CFG = {
  rings:          8,
  nodeRingFactor: 0.72,
  nodeR:          11,
  labelPad:       70,
  sagFactor:      0.92,
  ringJitter: [1, 0.96, 1.03, 0.98, 1.02, 0.97, 1.01, 0.99, 1.0],

  ambientColor:        '#8b150008',
  ambientWidth:        80,
  ambientRadiusFactor: 0.85,

  glowBlur:     5,
  glowRingBlur: 3,

  strandMainColor:   '#7a1200',
  strandMainWidth:   1.5,
  strandMainOpacity: 0.85,

  strandSecColor:     '#4a0800',
  strandSecWidth:     1,
  strandSecOpacity:   0.55,
  strandSecStartRing: 2,

  ringColorOuter:  '#8b1500',
  ringColorInner:  '#6b0800',
  ringWidthOuter:  1.5,
  ringWidthInner:  1,
  ringOpacityBase: 0.15,
  ringOpacityRange: 0.6,

  secSegOpacityFactor: 0.65,
  secSegWidth:         0.8,

  nodeFill:         '#040c0d',
  nodeStrokeWidth:  2,
  nodeDefaultColor: '#00e5ff',
  innerDotR:        3,
  innerDotOpacity:  0.65,

  glowRingR:     22,
  glowRingWidth: 1.5,

  labelColor:          '#cccccc',
  labelFontSize:       '11.5',
  labelFont:           'Segoe UI, system-ui, sans-serif',
  labelFontWeight:     '500',
  labelOffsetBelow:    27,
  labelOffsetAbove:    17,
  labelSidePad:        10,
  labelSideVertOffset: 4,

  hubR:             6,
  hubColor:         '#cc2200',
  hubOpacity:       0.9,
  hubPulseR:        10,
  hubPulseOpacity:  0.4,
  hubPulseDuration: 1.6,
  hubPulseEase:     'sine.inOut',

  hoverDuration:    0.18,
  hoverNodeDelta:   3,
  hoverGlowOpacity: 0.6,
  hoverDotR:        5,

  entranceRingScale:      0.05,
  entranceRingDuration:   0.55,
  entranceRingEase:       'power2.out',
  entranceRingDelay:      0.05,
  entranceStrandOpacity:  0.75,
  entranceStrandDuration: 0.4,
  entranceStrandStagger:  0.04,
  entranceStrandDelay:    0.1,
  entranceNodeScale:      0.4,
  entranceNodeDuration:   0.45,
  entranceNodeStagger:    0.07,
  entranceNodeEase:       'back.out(1.8)',
  entranceNodeDelay:      0.2,

  zoomScale:          5,
  zoomInDuration:     0.5,
  zoomInEase:         'power2.in',
  zoomFadeDuration:   0.15,
  zoomFadeInDuration: 0.3,
  zoomFadeInEase:     'power2.out',

  backOutScale:    0.7,
  backOutDuration: 0.3,
  backOutEase:     'power2.in',
  backInScale:     1.15,
  backInDuration:  0.4,
  backInEase:      'power2.out',

  confirmOutScale:    0.1,
  confirmOutDuration: 0.5,
  confirmOutEase:     'power3.in',
  confirmInScale:     2,
  confirmInDuration:  0.6,
  confirmInEase:      'power2.out',

  crumbOutScale:    0.8,
  crumbOutDuration: 0.25,
  crumbOutEase:     'power2.in',
  crumbInScale:     1.1,
  crumbInDuration:  0.35,
  crumbInEase:      'power2.out',

  pulseMaxR:     40,
  pulseDuration: 0.45,
  pulseEase:     'power2.out',

  resizeDebounceMs: 150,
};

function computeDims() {
  const W = svg.clientWidth  || svg.parentElement.clientWidth  || 900;
  const H = svg.clientHeight || svg.parentElement.clientHeight || 680;
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  return { cx: W / 2, cy: H / 2, maxRadius: Math.min(W, H) / 2 - CFG.labelPad, vbW: W, vbH: H };
}

// ══════════════════════════════════════════════════════════════════════════════
// LEVEL DEFINITIONS
// Node flags:
//   isBack  — navigates up the navStack
//   isNav   — immediately loads page (href required)
//   isModal — opens an inline modal on dashboard.html (modalId required)
//   isAction — shows the confirm/deny action panel
//   isLeaf  — pulses but has no sub-level
// ══════════════════════════════════════════════════════════════════════════════
const LEVELS = {

  // ── Root ───────────────────────────────────────────────────────────────────
  root: {
    label: 'Home',
    nodes: [
      { id: 'orgs',     label: 'Organizations', angle: -90,  desc: 'Manage server groups and team members',   color: '#00e5ff' },
      { id: 'servers',  label: 'Servers',        angle: -30,  desc: 'Manage and monitor your game servers' },
      { id: 'firewall', label: 'Firewall',       angle:  30,  desc: 'Windows Firewall port management via Portier' },
      { id: 'storage',  label: 'Storage',        angle:  90,  desc: 'Disk usage analysis and bulk file operations' },
      { id: 'system',   label: 'System',         angle: 150,  desc: 'RSM process control and system settings' },
      { id: 'account',  label: 'Account',        angle: -150, desc: 'Profile, security, and team management',  color: '#cc8877' },
    ],
  },

  // ── Organizations ──────────────────────────────────────────────────────────
  orgs: {
    label: 'Organizations',
    nodes: [
      { id: '_orgs-list',  label: 'My Orgs',    angle: -108, desc: 'View and manage your organizations',  color: '#00e5ff', isNav: true, href: 'orgs.html' },
      { id: '_orgs-new',   label: 'New Org',    angle:  -36, desc: 'Create a new organization',          color: '#00cc44', isNav: true, href: 'orgs.html' },
      { id: '_orgs-inv',   label: 'Add Member', angle:   36, desc: 'Invite a user to your organization', color: '#00e5ff', isNav: true, href: 'orgs.html' },
      { id: '_orgs-roles', label: 'Roles',      angle:  108, desc: 'Assign and manage member roles',     color: '#00e5ff', isNav: true, href: 'orgs.html' },
      { id: '_back',       label: '↩ Back',     angle:  180, desc: 'Return to main web',                 color: '#886644', isBack: true },
    ],
  },

  // ── Servers ────────────────────────────────────────────────────────────────
  servers: {
    label: 'Servers',
    nodes: [
      { id: 'srv-portal', label: 'Portal',       angle: -108, desc: 'Register servers and manage agent tokens',    color: '#00e5ff' },
      { id: '_srv-live',  label: 'Live Servers', angle:  -36, desc: 'RSM-connected servers (API integration TBD)', color: '#444444', isLeaf: true },
      { id: '_srv-forge', label: 'Forge',        angle:   36, desc: 'Provision game servers via Ronin Forge',      color: '#888888', isLeaf: true },
      { id: '_srv-add',   label: 'Add Server',   angle:  108, desc: 'Register an existing RSM machine',            color: '#44aa55', isNav: true, href: 'servers.html' },
      { id: '_back',      label: '↩ Back',       angle:  180, desc: 'Return to main web',                          color: '#886644', isBack: true },
    ],
  },

  'srv-portal': {
    label: 'Portal',
    nodes: [
      { id: '_srv-list',     label: 'Server List',  angle: -90, desc: 'View all registered RSM servers',  color: '#00e5ff', isNav: true, href: 'servers.html' },
      { id: '_srv-tokens',   label: 'Agent Tokens', angle:   0, desc: 'Generate and manage agent tokens', color: '#00e5ff', isNav: true, href: 'servers.html' },
      { id: '_srv-register', label: 'Register New', angle:  90, desc: 'Register a new RSM machine',       color: '#00cc44', isNav: true, href: 'servers.html' },
      { id: '_back',         label: '↩ Back',       angle: 180, desc: 'Return to Servers',                color: '#886644', isBack: true },
    ],
  },

  // ── Firewall ───────────────────────────────────────────────────────────────
  firewall: {
    label: 'Firewall',
    nodes: [
      { id: '_fw-view',    label: 'View Rules',  angle: -108, desc: 'See all active firewall rules', color: '#00e5ff', isLeaf:  true },
      { id: '_fw-add',     label: 'Add Port',    angle:  -36, desc: 'Open a new firewall port',      color: '#00cc44', isAction: true, action: 'Open a new firewall port?' },
      { id: '_fw-remove',  label: 'Remove Port', angle:   36, desc: 'Close a firewall port rule',    color: '#cc3300', isAction: true, action: 'Remove a firewall port rule?' },
      { id: '_fw-refresh', label: 'Refresh',     angle:  108, desc: 'Refresh the port rules list',   color: '#00e5ff', isAction: true, action: 'Refresh firewall rules?' },
      { id: '_back',       label: '↩ Back',      angle:  180, desc: 'Return to main web',            color: '#886644', isBack: true },
    ],
  },

  // ── Storage ────────────────────────────────────────────────────────────────
  storage: {
    label: 'Storage',
    nodes: [
      { id: '_scan',   label: 'Scan Drive', angle: -108, desc: 'Storage integration coming soon', color: '#00e5ff', isLeaf: true },
      { id: '_browse', label: 'Browse',     angle:  -36, desc: 'Storage integration coming soon', color: '#00e5ff', isLeaf: true },
      { id: '_move',   label: 'Move Files', angle:   36, desc: 'Storage integration coming soon', color: '#cc8800', isLeaf: true },
      { id: '_delete', label: 'Delete',     angle:  108, desc: 'Storage integration coming soon', color: '#cc3300', isLeaf: true },
      { id: '_back',   label: '↩ Back',     angle:  180, desc: 'Return to main web',               color: '#886644', isBack: true },
    ],
  },

  // ── System ─────────────────────────────────────────────────────────────────
  system: {
    label: 'System',
    nodes: [
      { id: '_rsm-status',  label: 'RSM Status',  angle: -90, desc: 'View RSM process status',            color: '#00e5ff', isLeaf:  true },
      { id: '_rsm-restart', label: 'RSM Restart', angle:   0, desc: 'Restart the RSM process',            color: '#cc8800', isAction: true, action: 'Restart Ronin Server Manager?' },
      { id: '_rsm-stop',    label: 'RSM Stop',    angle:  90, desc: 'Stop RSM — coming in a future release', color: '#cc3300', isLeaf: true },
      { id: '_back',        label: '↩ Back',      angle: 180, desc: 'Return to main web',                 color: '#886644', isBack: true },
    ],
  },

  // ── Account ────────────────────────────────────────────────────────────────
  account: {
    label: 'Account',
    nodes: [
      { id: '_acct-profile', label: 'Profile',  angle: -120, desc: 'View and edit your profile',       color: '#00e5ff', isNav: true,   href: 'settings.html' },
      { id: '_acct-pass',    label: 'Password', angle:  -60, desc: 'Change your account password',     color: '#00e5ff', isModal: true, modalId: 'changePasswordModal' },
      { id: '_acct-2fa',     label: '2FA',      angle:    0, desc: 'Manage two-factor authentication', color: '#00e5ff', isNav: true,   href: 'settings.html' },
      { id: '_acct-team',    label: 'Team',     angle:   60, desc: 'Invite and manage team members',   color: '#00e5ff', isNav: true,   href: 'orgs.html' },
      { id: '_back',         label: '↩ Back',   angle:  120, desc: 'Return to main web',               color: '#886644', isBack: true },
    ],
  },
};

// ── URL ↔ level mapping ───────────────────────────────────────────────────────
// Maps LEVELS keys to their URL segment (the part after /{orgSlug}/).
// Only levels that appear in the URL path need an entry.
const LEVEL_SEGMENT = {
  root:         '',
  orgs:         'orgs',
  servers:      'servers',
  firewall:     'firewall',
  storage:      'storage',
  system:       'system',
  account:      'account',
  'srv-portal': 'portal',
};
const SEGMENT_LEVEL = Object.fromEntries(
  Object.entries(LEVEL_SEGMENT).map(([k, v]) => [v, k])
);

function urlForState(orgSlug, stack, level) {
  const parts = [orgSlug];
  const levels = [...stack.filter(l => l !== 'root'), ...(level !== 'root' ? [level] : [])];
  levels.forEach(l => {
    const seg = LEVEL_SEGMENT[l];
    if (seg) parts.push(seg);
  });
  return '/' + parts.join('/');
}

function stateFromUrl(orgSlug) {
  const parts = window.location.pathname.split('/').filter(Boolean);
  // parts[0] = orgSlug, parts[1] = section, parts[2] = sub-section
  const section    = parts[1] ? SEGMENT_LEVEL[parts[1]] : null;
  const subSection = parts[2] ? SEGMENT_LEVEL[parts[2]] : null;

  if (!section || section === 'root') return { navStack: [], currentLevel: 'root' };
  if (subSection) return { navStack: ['root', section], currentLevel: subSection };
  return { navStack: ['root'], currentLevel: section };
}

// ── State ────────────────────────────────────────────────────────────────────
const svg          = document.getElementById('webSvg');
const webContainer = document.getElementById('webContainer');
const breadcrumb   = document.getElementById('breadcrumb');
const tooltip      = document.getElementById('nodeTooltip');
const tooltipTitle = document.getElementById('tooltipTitle');
const tooltipDesc  = document.getElementById('tooltipDesc');
const actionPanel  = document.getElementById('actionPanel');
const actionTitle  = document.getElementById('actionTitle');
const actionDesc   = document.getElementById('actionDesc');
const actionConfirm = document.getElementById('actionConfirm');
const actionDeny   = document.getElementById('actionDeny');

let navStack     = [];
let currentLevel = 'root';
let centerAnim   = null;

// ── SVG helpers ──────────────────────────────────────────────────────────────
function el(tag, attrs = {}) {
  const e = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  return e;
}

// ── Build / render a web level ────────────────────────────────────────────────
function buildWeb(levelId) {
  const level = LEVELS[levelId];
  if (!level) return;

  if (centerAnim) { centerAnim.kill(); centerAnim = null; }
  while (svg.firstChild) svg.removeChild(svg.firstChild);

  const { cx, cy, maxRadius } = computeDims();
  const { rings, nodeRingFactor, nodeR } = CFG;
  const nodes = level.nodes;

  // ── Defs ─────────────────────────────────────────────────────────────────
  const defs     = el('defs');
  const nodeGlow = el('filter', { id: 'ng', x: '-100%', y: '-100%', width: '300%', height: '300%' });
  const ngBlur   = el('feGaussianBlur', { stdDeviation: String(CFG.glowBlur), result: 'blur' });
  const ngMerge  = el('feMerge');
  ngMerge.append(el('feMergeNode', { in: 'blur' }), el('feMergeNode', { in: 'SourceGraphic' }));
  nodeGlow.append(ngBlur, ngMerge);
  defs.appendChild(nodeGlow);
  svg.appendChild(defs);

  // ── Ambient ──────────────────────────────────────────────────────────────
  svg.appendChild(el('circle', {
    cx, cy,
    r: maxRadius * CFG.ambientRadiusFactor,
    fill: 'none',
    stroke: CFG.ambientColor,
    'stroke-width': CFG.ambientWidth,
  }));

  // ── Pre-compute angles ───────────────────────────────────────────────────
  const mainAngles = nodes.map(n => n.angle);
  const allAngles  = [];
  for (let i = 0; i < mainAngles.length; i++) {
    allAngles.push(mainAngles[i]);
    const next = mainAngles[(i + 1) % mainAngles.length];
    let mid = (mainAngles[i] + next) / 2;
    if (Math.abs(next - mainAngles[i]) > 180) mid += 180;
    allAngles.push(mid);
  }

  // ── Radial strands ───────────────────────────────────────────────────────
  mainAngles.forEach(angle => {
    const rad = angle * Math.PI / 180;
    svg.appendChild(el('line', {
      x1: cx, y1: cy,
      x2: cx + Math.cos(rad) * maxRadius,
      y2: cy + Math.sin(rad) * maxRadius,
      stroke: CFG.strandMainColor,
      'stroke-width': String(CFG.strandMainWidth),
      opacity: String(CFG.strandMainOpacity),
    }));
  });

  const secStartR = (CFG.strandSecStartRing / rings) * maxRadius;
  allAngles.forEach(angle => {
    if (mainAngles.includes(angle)) return;
    const rad = angle * Math.PI / 180;
    svg.appendChild(el('line', {
      x1: cx + Math.cos(rad) * secStartR,
      y1: cy + Math.sin(rad) * secStartR,
      x2: cx + Math.cos(rad) * maxRadius,
      y2: cy + Math.sin(rad) * maxRadius,
      stroke: CFG.strandSecColor,
      'stroke-width': String(CFG.strandSecWidth),
      opacity: String(CFG.strandSecOpacity),
    }));
  });

  // ── Concentric rings ─────────────────────────────────────────────────────
  for (let r = 1; r <= rings; r++) {
    const jitter  = CFG.ringJitter[r] ?? 1;
    const radius  = (r / rings) * maxRadius * jitter;
    const isOuter = r === rings;
    const stroke  = isOuter ? CFG.ringColorOuter : CFG.ringColorInner;
    const sw      = isOuter ? CFG.ringWidthOuter  : CFG.ringWidthInner;
    const opacity = (CFG.ringOpacityBase + (r / rings) * CFG.ringOpacityRange).toFixed(2);

    for (let i = 0; i < allAngles.length; i++) {
      const a1  = allAngles[i] * Math.PI / 180;
      const a2  = allAngles[(i + 1) % allAngles.length] * Math.PI / 180;
      const x1  = cx + Math.cos(a1) * radius;
      const y1  = cy + Math.sin(a1) * radius;
      const x2  = cx + Math.cos(a2) * radius;
      const y2  = cy + Math.sin(a2) * radius;
      const aMid = (a1 + a2) / 2;
      const cxP  = cx + Math.cos(aMid) * radius * CFG.sagFactor;
      const cyP  = cy + Math.sin(aMid) * radius * CFG.sagFactor;

      const isMainSeg  = mainAngles.includes(allAngles[i]) && mainAngles.includes(allAngles[(i + 1) % allAngles.length]);
      const segOpacity = isMainSeg ? opacity : (parseFloat(opacity) * CFG.secSegOpacityFactor).toFixed(2);
      const segSW      = isMainSeg ? String(sw) : String(CFG.secSegWidth);

      svg.appendChild(el('path', {
        d: `M ${x1} ${y1} Q ${cxP} ${cyP} ${x2} ${y2}`,
        fill: 'none',
        stroke,
        'stroke-width': segSW,
        opacity: segOpacity,
      }));
    }
  }

  // ── Nodes ────────────────────────────────────────────────────────────────
  const nodeRadius = maxRadius * nodeRingFactor;

  nodes.forEach(node => {
    const rad   = node.angle * Math.PI / 180;
    const nx    = cx + Math.cos(rad) * nodeRadius;
    const ny    = cy + Math.sin(rad) * nodeRadius;
    const color = node.color || CFG.nodeDefaultColor;

    const g = el('g', { class: 'wnode', 'data-id': node.id });
    g.style.cursor = 'pointer';

    const glowRing = el('circle', {
      cx: nx, cy: ny,
      r: CFG.glowRingR,
      fill: 'none',
      stroke: color,
      'stroke-width': String(CFG.glowRingWidth),
      opacity: '0',
    });
    glowRing.style.filter = `blur(${CFG.glowRingBlur}px)`;
    g.appendChild(glowRing);

    const circle = el('circle', {
      cx: nx, cy: ny,
      r: nodeR,
      fill: CFG.nodeFill,
      stroke: color,
      'stroke-width': String(CFG.nodeStrokeWidth),
      filter: 'url(#ng)',
    });
    g.appendChild(circle);

    const dot = el('circle', {
      cx: nx, cy: ny,
      r: CFG.innerDotR,
      fill: color,
      opacity: String(CFG.innerDotOpacity),
    });
    g.appendChild(dot);

    // Label positioning
    const sinA = Math.sin(rad);
    const cosA = Math.cos(rad);
    let lx = nx, ly = ny, anchor = 'middle';

    if (Math.abs(sinA) >= Math.abs(cosA)) {
      ly = ny + (sinA > 0 ? CFG.labelOffsetBelow : -CFG.labelOffsetAbove);
    } else {
      const pad = nodeR + CFG.labelSidePad;
      lx = nx + (cosA > 0 ? pad : -pad);
      ly = ny + CFG.labelSideVertOffset;
      anchor = cosA > 0 ? 'start' : 'end';
    }

    const label = el('text', {
      x: lx, y: ly,
      'text-anchor': anchor,
      fill: CFG.labelColor,
      'font-size': CFG.labelFontSize,
      'font-family': CFG.labelFont,
      'font-weight': CFG.labelFontWeight,
      'pointer-events': 'none',
    });
    label.textContent = node.label;
    g.appendChild(label);

    // Hover
    g.addEventListener('mouseenter', () => {
      gsap.to(circle,   { attr: { r: nodeR + CFG.hoverNodeDelta }, duration: CFG.hoverDuration });
      gsap.to(glowRing, { opacity: CFG.hoverGlowOpacity,          duration: CFG.hoverDuration });
      gsap.to(dot,      { attr: { r: CFG.hoverDotR }, opacity: 1, duration: CFG.hoverDuration });
      tooltipTitle.textContent = node.label;
      tooltipDesc.textContent  = node.desc || '';
      tooltip.classList.add('visible');
    });

    g.addEventListener('mouseleave', () => {
      gsap.to(circle,   { attr: { r: nodeR },                                     duration: CFG.hoverDuration });
      gsap.to(glowRing, { opacity: 0,                                             duration: CFG.hoverDuration });
      gsap.to(dot,      { attr: { r: CFG.innerDotR }, opacity: CFG.innerDotOpacity, duration: CFG.hoverDuration });
      tooltip.classList.remove('visible');
    });

    g.addEventListener('click', () => handleClick(node, nx, ny));
    svg.appendChild(g);
  });

  // ── Centre hub ───────────────────────────────────────────────────────────
  const hub = el('circle', {
    cx, cy,
    r: CFG.hubR,
    fill: CFG.hubColor,
    opacity: String(CFG.hubOpacity),
    id: 'hub',
  });
  svg.appendChild(hub);

  centerAnim = gsap.to(hub, {
    attr: { r: CFG.hubPulseR },
    opacity: CFG.hubPulseOpacity,
    duration: CFG.hubPulseDuration,
    repeat: -1,
    yoyo: true,
    ease: CFG.hubPulseEase,
  });

  // ── Entrance animation ───────────────────────────────────────────────────
  const wnodes  = svg.querySelectorAll('.wnode');
  const ringEls = svg.querySelectorAll('circle:not(.wnode circle)');

  gsap.set(wnodes,  { opacity: 0, scale: CFG.entranceNodeScale, transformOrigin: `${cx}px ${cy}px` });
  gsap.set(ringEls, { opacity: 0, scale: CFG.entranceRingScale, transformOrigin: `${cx}px ${cy}px` });
  gsap.set(svg.querySelectorAll('line'), { opacity: 0 });

  gsap.to(ringEls, { opacity: 1, scale: 1, duration: CFG.entranceRingDuration, ease: CFG.entranceRingEase, delay: CFG.entranceRingDelay });
  gsap.to(svg.querySelectorAll('line'), { opacity: CFG.entranceStrandOpacity, duration: CFG.entranceStrandDuration, stagger: CFG.entranceStrandStagger, delay: CFG.entranceStrandDelay });
  gsap.to(wnodes,  { opacity: 1, scale: 1, duration: CFG.entranceNodeDuration, stagger: CFG.entranceNodeStagger, ease: CFG.entranceNodeEase, delay: CFG.entranceNodeDelay });

  updateBreadcrumb();
}

// ── Click handler ─────────────────────────────────────────────────────────────
function handleClick(node, nx, ny) {
  tooltip.classList.remove('visible');

  if (node.isBack)   { navigateBack();                    return; }
  if (node.isNav)    { window.location.href = node.href;  return; }
  if (node.isModal)  { openNodeModal(node.modalId);       return; }
  if (node.isAction) { showActionPanel(node);             return; }
  if (node.isLeaf || !LEVELS[node.id]) {
    pulseNode(nx, ny, node.color || CFG.nodeDefaultColor);
    return;
  }

  navigateTo(node, nx, ny);
}

function openNodeModal(modalId) {
  const m = document.getElementById(modalId);
  if (m) m.classList.add('open');
}

// ── Forward navigation ────────────────────────────────────────────────────────
function navigateTo(node, nx, ny) {
  navStack.push(currentLevel);
  currentLevel = node.id;

  if (typeof Router !== 'undefined') {
    const { orgSlug } = Router.parse();
    if (orgSlug) Router.push(urlForState(orgSlug, navStack, currentLevel));
  }

  const svgRect  = svg.getBoundingClientRect();
  const cRect    = webContainer.getBoundingClientRect();
  const vbParts  = svg.getAttribute('viewBox').split(' ');
  const vbW      = parseFloat(vbParts[2]) || svgRect.width;
  const vbH      = parseFloat(vbParts[3]) || svgRect.height;
  const scaleX   = svgRect.width  / vbW;
  const scaleY   = svgRect.height / vbH;
  const screenNx = svgRect.left + nx * scaleX;
  const screenNy = svgRect.top  + ny * scaleY;
  const originX  = ((screenNx - cRect.left) / cRect.width  * 100).toFixed(1) + '%';
  const originY  = ((screenNy - cRect.top)  / cRect.height * 100).toFixed(1) + '%';

  gsap.set(webContainer, { transformOrigin: `${originX} ${originY}` });
  const tl = gsap.timeline();
  tl.to(webContainer, {
    scale: CFG.zoomScale,
    duration: CFG.zoomInDuration,
    ease: CFG.zoomInEase,
  })
  .to(webContainer, { opacity: 0, duration: CFG.zoomFadeDuration })
  .call(() => {
    buildWeb(currentLevel);
    gsap.set(webContainer, { scale: 1, opacity: 0, transformOrigin: '50% 50%' });
  })
  .to(webContainer, { opacity: 1, duration: CFG.zoomFadeInDuration, ease: CFG.zoomFadeInEase });
}

// ── Back navigation ───────────────────────────────────────────────────────────
function navigateBack() {
  if (navStack.length === 0) return;
  currentLevel = navStack.pop();

  if (typeof Router !== 'undefined') {
    const { orgSlug } = Router.parse();
    if (orgSlug) Router.push(urlForState(orgSlug, navStack, currentLevel));
  }

  const tl = gsap.timeline();
  tl.to(webContainer, { opacity: 0, scale: CFG.backOutScale, duration: CFG.backOutDuration, ease: CFG.backOutEase })
  .call(() => {
    buildWeb(currentLevel);
    gsap.set(webContainer, { opacity: 0, scale: CFG.backInScale, transformOrigin: '50% 50%' });
  })
  .to(webContainer, { opacity: 1, scale: 1, duration: CFG.backInDuration, ease: CFG.backInEase });
}

// ── Action panel ──────────────────────────────────────────────────────────────
function showActionPanel(node) {
  actionTitle.textContent = node.action || node.label;
  actionDesc.textContent  = node.desc   || '';
  actionPanel.classList.add('visible');

  actionConfirm.onclick = () => {
    actionPanel.classList.remove('visible');
    currentLevel = 'root';
    navStack = [];
    const tl = gsap.timeline();
    tl.to(webContainer, { scale: CFG.confirmOutScale, opacity: 0, duration: CFG.confirmOutDuration, ease: CFG.confirmOutEase })
    .call(() => {
      buildWeb('root');
      gsap.set(webContainer, { scale: CFG.confirmInScale, opacity: 0 });
    })
    .to(webContainer, { scale: 1, opacity: 1, duration: CFG.confirmInDuration, ease: CFG.confirmInEase });
  };

  actionDeny.onclick = () => {
    actionPanel.classList.remove('visible');
  };
}

// ── Node pulse (leaf / unimplemented) ────────────────────────────────────────
function pulseNode(nx, ny, color) {
  const ripple = el('circle', { cx: nx, cy: ny, r: CFG.nodeR, fill: color, 'pointer-events': 'none' });
  svg.appendChild(ripple);
  gsap.to(ripple, {
    attr: { r: CFG.pulseMaxR },
    opacity: 0,
    duration: CFG.pulseDuration,
    ease: CFG.pulseEase,
    onComplete: () => svg.removeChild(ripple),
  });
}

// ── Breadcrumb ────────────────────────────────────────────────────────────────
function updateBreadcrumb() {
  const stack = ['root', ...navStack.filter(l => l !== 'root')];
  if (currentLevel !== 'root') stack.push(currentLevel);

  breadcrumb.innerHTML = stack.map((lid, i) => {
    const isLast = i === stack.length - 1;
    const lbl    = LEVELS[lid]?.label || lid;
    let html = `<span class="crumb ${isLast ? 'active' : ''}" data-lid="${lid}">${lbl}</span>`;
    if (!isLast) html += `<span class="crumb-sep">›</span>`;
    return html;
  }).join('');

  breadcrumb.querySelectorAll('.crumb:not(.active)').forEach(crumb => {
    crumb.addEventListener('click', () => {
      const targetId = crumb.dataset.lid;
      if (targetId === 'root') {
        navStack     = [];
        currentLevel = 'root';
      } else {
        const idx = navStack.indexOf(targetId);
        if (idx >= 0) {
          navStack     = navStack.slice(0, idx);
          currentLevel = targetId;
        }
      }
      if (typeof Router !== 'undefined') {
        const { orgSlug } = Router.parse();
        if (orgSlug) Router.push(urlForState(orgSlug, navStack, currentLevel));
      }
      const tl = gsap.timeline();
      tl.to(webContainer, { opacity: 0, scale: CFG.crumbOutScale, duration: CFG.crumbOutDuration, ease: CFG.crumbOutEase })
      .call(() => {
        buildWeb(currentLevel);
        gsap.set(webContainer, { opacity: 0, scale: CFG.crumbInScale });
      })
      .to(webContainer, { opacity: 1, scale: 1, duration: CFG.crumbInDuration, ease: CFG.crumbInEase });
    });
  });
}

// ── Init ──────────────────────────────────────────────────────────────────────
// Restore spider web state from the URL if a section is encoded in the path.
if (typeof Router !== 'undefined') {
  const { orgSlug } = Router.parse();
  if (orgSlug) {
    const restored = stateFromUrl(orgSlug);
    navStack     = restored.navStack;
    currentLevel = restored.currentLevel;
  }
}
buildWeb(currentLevel);

// Browser back/forward: re-derive state from the new URL.
window.addEventListener('popstate', () => {
  if (typeof Router !== 'undefined') {
    const { orgSlug } = Router.parse();
    if (orgSlug) {
      const restored = stateFromUrl(orgSlug);
      navStack     = restored.navStack;
      currentLevel = restored.currentLevel;
      buildWeb(currentLevel);
    }
  }
});

let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => buildWeb(currentLevel), CFG.resizeDebounceMs);
});
