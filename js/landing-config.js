/* landing-config.js — Ronin Citadel landing page content configuration
   Edit this file to update any text, links, icons, or card data.
   Layout/dimension vars live in css/landing.css
   Rendering logic lives in js/landing.js                                     */

// ════════════════════════════════════════════════════════════════════════════
// PAGE CONFIGURATION — all changeable content in one place.
// ════════════════════════════════════════════════════════════════════════════
const PAGE_CONFIG = {

  // ── Site identity ──────────────────────────────────────────────────────
  logoIcon: '⛩',
  logoText: 'Ronin Citadel',
  navTitle: 'Ronin Empire',

  // ── Navbar links ───────────────────────────────────────────────────────
  navLinks: [
    { label: 'Sign Up',     href: '/register', style: 'ghost'   },
    { label: 'Open Portal', href: '/login',    style: 'primary' },
  ],

  // ── Hero ───────────────────────────────────────────────────────────────
  hero: {
    eyebrow:        'Ronin Empire · Self-Hosted Portal',
    titleLine1:     'One dashboard.',
    titleHighlight: 'Every tool you need.',
    subtitle:       'Manage game servers, firewall rules, disk storage, and server provisioning from a single secure web interface. No need to RDP into your machine.',
    cta: [
      { label: 'Open Portal',   href: '/login',    style: 'primary' },
      { label: 'View Features', href: '#features', style: 'ghost'   },
    ],
  },

  // ── Setup guide banner ─────────────────────────────────────────────────
  guide: {
    eyebrow: 'Getting Started',
    title:   'Connect RSM to Citadel',
    icon:    '🔗',
    desc:    'New to Ronin? Follow the step-by-step guide to install Ronin Server Manager on your dedicated machine and link it to the portal. From zero to live remote control in about 10 minutes.',
    steps:   ['Download &amp; install RSM', 'Create account &amp; org', 'Add a machine', 'Generate agent token', 'Connect &amp; go live'],
    tags:    ['Step-by-Step', '~10 Minutes', 'No Config Files', 'Any Browser'],
    href:    '/get-started',
  },

  // ── Feature sidebar list ────────────────────────────────────────────────
  featureList: [
    { label: 'Setup Guide',         card: 'setup'   },
    { label: 'Server Management',   card: 'rsm'     },
    { label: 'Firewall Control',    card: 'portier' },
    { label: 'Disk Analysis',       card: 'disk'    },
    { label: 'Server Provisioning', card: 'forge'   },
    { label: 'Live Console',        card: 'console' },
    { label: 'CPU & RAM Monitor',   card: 'monitor' },
    { label: 'Role-Based Access',   card: 'roles'   },
    { label: 'Two-Factor Auth',     card: '2fa'     },
    { label: 'Team Management',     card: 'team'    },
    { label: 'Remote Access',       card: 'remote'  },
  ],

  // ── Feature cards ───────────────────────────────────────────────────────
  // href:  where the card navigates on click - omit to make card non-clickable
  // badge: shown above the title instead of eyebrow (e.g. "Coming Soon")
  // img:   path to a background photo relative to index.html, e.g.
  //        'images/cards/rsm.jpg'
  //        Drop photos in: Ronin_Citadel/images/cards/
  //        When img is set it replaces the atmospheric gradient. Remove the
  //        comment (//) from the img line for each card once the file exists.
  cards: [
    {
      id:      'rsm',
      eyebrow: 'Server Management',
      title:   'Ronin Server Manager',
      icon:    '⚡',
      // img:  'images/cards/rsm.jpg',
      desc:    'Start, stop, and restart game server processes with real-time CPU & RAM monitoring, live console output, and direct command input. Fully remote.',
      tags:    ['Process Control', 'Live Console', 'CPU / RAM', 'Multi-Server'],
      href:    '/tools/ronin-server-manager',
    },
    {
      id:      'portier',
      eyebrow: 'Firewall Control',
      title:   'Ronin Portier',
      icon:    '🛡',
      // img:  'images/cards/portier.jpg',
      desc:    'Open and close Windows Firewall ports remotely. Persistent port lists, grouped rules, and per-server profiles - all visible and manageable from the portal.',
      tags:    ['Firewall Rules', 'Port Profiles', 'Rule Grouping'],
      href:    '/tools/ronin-portier',
    },
    {
      id:      'disk',
      eyebrow: 'Storage Analysis',
      title:   'Ronin Disk Manager',
      icon:    '💾',
      img:     'images/cards/tree-view.webp',
      desc:    'NTFS-native disk analysis using MFT scanning for near-instant results. Bulk move and delete operations with dry-run preview before anything changes.',
      tags:    ['MFT Scanning', 'Bulk Operations', 'Dry-Run Preview'],
      href:    '/tools/ronin-disk-manager',
    },
    {
      id:    'forge',
      title: 'Ronin Forge',
      icon:  '⚙',
      badge: 'Coming Soon',
      // img: 'images/cards/forge.jpg',
      desc:  'Download and install game server files by game type. Supports Minecraft, Space Engineers, Ark, and more. Built-in config editor. Run standalone or import directly into RSM.',
      tags:  ['Auto-Download', 'Config Editor', 'RSM Integration'],
      href:  '/tools/ronin-forge',
    },
    {
      id:      'console',
      eyebrow: 'Real-Time Output',
      title:   'Live Console',
      icon:    '⌨',
      // img:  'images/cards/console.jpg',
      desc:    'Stream live console output from any managed server directly in your browser. Send commands, read responses, and monitor activity in real time.',
      tags:    ['Live Output', 'Command Input', 'Per-Server', 'No RDP Needed'],
      href:    '/tools/live-console',
    },
    {
      id:      'monitor',
      eyebrow: 'Resource Monitoring',
      title:   'CPU & RAM Monitor',
      icon:    '📊',
      // img:  'images/cards/monitor.jpg',
      desc:    "Track CPU and memory usage per server in real time. Catch runaway processes before they affect players, and check your machine's health without logging in.",
      tags:    ['Live Metrics', 'Per-Server Stats', 'Always Visible', 'Status Bar'],
      href:    '/tools/cpu-ram-monitor',
    },
    {
      id:      'roles',
      eyebrow: 'Access Control',
      title:   'Role-Based Access',
      icon:    '🔐',
      // img:  'images/cards/roles.jpg',
      desc:    'Grant exactly the right level of access to each team member. Owners control everything, admins manage day-to-day operations, and community members get only what they need.',
      tags:    ['Custom Roles', 'Per-Node Permissions', 'Granular Control', 'Role Inheritance'],
      href:    '/tools/role-based-access',
    },
    {
      id:      '2fa',
      eyebrow: 'Security',
      title:   'Two-Factor Authentication',
      icon:    '🔑',
      // img:  'images/cards/2fa.jpg',
      desc:    'Protect your portal with TOTP-based two-factor authentication. Every login requires a time-based code from an authenticator app. A stolen password on its own gets you nowhere.',
      tags:    ['TOTP Standard', 'QR Code Setup', 'Authenticator App', 'Brute Force Proof'],
      href:    '/tools/two-factor-auth',
    },
    {
      id:      'team',
      eyebrow: 'Community Tools',
      title:   'Team Management',
      icon:    '👥',
      // img:  'images/cards/team.jpg',
      desc:    'Invite community admins, assign roles, and manage your whole team from one place. Add or remove members without touching any config files. Access changes take effect immediately.',
      tags:    ['Invite System', 'Role Assignment', 'Instant Changes', 'Community Scale'],
      href:    '/tools/team-management',
    },
    {
      id:      'remote',
      eyebrow: 'Anywhere Access',
      title:   'Remote Access',
      icon:    '🌐',
      // img:  'images/cards/remote.jpg',
      desc:    'Manage your entire server setup from any device, any location. HTTPS with a proper TLS certificate keeps your connection encrypted. Just a browser and your credentials.',
      tags:    ['HTTPS Encrypted', 'Any Device', 'No VPN Required', 'Rate Limited Login'],
      href:    '/tools/remote-access',
    },
  ],
};
