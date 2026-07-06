/* tool-page-config.js — Ronin Citadel tool / feature detail page data
   All content for every tool page lives here.
   Rendering logic lives in js/tool-page.js                                   */

// ── Shared site identity (used by the navbar on every tool page) ─────────────
const SITE = {
  logoIcon: '⛩',
  logoText: 'Ronin Citadel',
  navTitle: 'Ronin Empire',
  navLinks: [
    { label: 'Home',         href: '/',       style: 'ghost'   },
    { label: 'Open Portal',  href: '/login',  style: 'primary' },
  ],
};

// ════════════════════════════════════════════════════════════════════════════
// TOOL DEFINITIONS
//
// type: 'app'     — standalone downloadable application
//       'feature' — built into the Ronin Citadel portal, no download
//
// img (hero):   optional background photo for the hero, relative to index.html
//               Falls back to the atmospheric CSS gradient if omitted.
//
// screenshots:  optional array of { src, caption, layout } objects.
//               layout: 'full'  — single image, full container width (default)
//                       'grid'  — pair up adjacent entries side-by-side
//               Drop screenshots in: images/screenshots/
//
// features[].img: optional screenshot shown inside a feature tile.
//                 Drop in:  images/screenshots/
// ════════════════════════════════════════════════════════════════════════════
const TOOLS = {

  // ── Ronin Server Manager ─────────────────────────────────────────────────
  rsm: {
    id:       'rsm',
    name:     'Ronin Server Manager',
    eyebrow:  'Server Management',
    tagline:  'Full control over your game servers, from anywhere.',
    icon:     '⚡',
    type:     'app',
    // img:   'images/cards/rsm.jpg',
    desc:     'Ronin Server Manager is a desktop application for managing game server processes on a Windows dedicated server. Start, stop, and restart servers, stream live console output, and monitor CPU and RAM in real time. Works standalone or through the Ronin Citadel web portal.',
    platform: 'Windows 10 / 11',
    requires: 'Node.js 18+',
    version:  '1.0.0',
    size:     '~45 MB',
    download: '#',
    github:   '#',
    screenshots: [
      // { src: 'images/screenshots/rsm-main.jpg',    caption: 'Main server list with live CPU and RAM bars for each managed server.', layout: 'full' },
      // { src: 'images/screenshots/rsm-console.jpg', caption: 'Live console streaming — type a command and see the response in real time.', layout: 'grid' },
      // { src: 'images/screenshots/rsm-stats.jpg',   caption: 'Per-server resource monitor with historical usage graphs.', layout: 'grid' },
    ],
    features: [
      { icon: '▶', title: 'Process Control',  desc: 'Start, stop, and restart game server processes with a single click. No command line required.' },
      { icon: '⌨', title: 'Live Console',     desc: 'Stream real-time console output for any server. Send commands and read responses directly from the UI.' },
      { icon: '📊', title: 'Resource Monitor',desc: 'Live CPU and RAM usage per server, updated in real time so you can catch runaway processes before they impact players.' },
      { icon: '🔌', title: 'REST API',        desc: 'Built-in API server exposes all RSM functionality over HTTP, enabling Ronin Citadel and other tools to control servers remotely.' },
      { icon: '⚙', title: 'Multi-Server',    desc: 'Manage any number of game servers from a single RSM instance. Each server runs as an independent managed process.' },
      { icon: '📁', title: 'Server Profiles', desc: 'Store startup commands, working directories, and environment variables per server. Launch with one click every time.' },
      // To attach a screenshot to a specific feature tile, add:
      // img: 'images/screenshots/rsm-profiles.jpg'
    ],
  },

  // ── Ronin Portier ────────────────────────────────────────────────────────
  portier: {
    id:       'portier',
    name:     'Ronin Portier',
    eyebrow:  'Firewall Control',
    tagline:  'Manage Windows Firewall ports without touching the command line.',
    icon:     '🛡',
    type:     'app',
    // img:   'images/cards/portier.jpg',
    desc:     'Ronin Portier is a Windows desktop application for managing Windows Firewall port rules. Open and close ports, create persistent profiles per game server, and group rules by type. Works standalone or through the Ronin Citadel web portal.',
    platform: 'Windows 10 / 11',
    requires: '.NET 8 Runtime',
    version:  '1.0.0',
    size:     '~8 MB',
    download: '#',
    github:   '#',
    screenshots: [
      // { src: 'images/screenshots/portier-rules.jpg',   caption: 'All active firewall rules grouped by game server.', layout: 'full' },
      // { src: 'images/screenshots/portier-add.jpg',     caption: 'Add a new port rule — TCP/UDP, in/outbound.', layout: 'grid' },
      // { src: 'images/screenshots/portier-profile.jpg', caption: 'Saved port profile for Minecraft ready to apply in one click.', layout: 'grid' },
    ],
    features: [
      { icon: '🔓', title: 'Open / Close Ports', desc: 'Add or remove Windows Firewall inbound and outbound port rules without touching netsh or Windows Defender settings.' },
      { icon: '📋', title: 'Port Profiles',       desc: 'Save sets of ports per game server. One click opens everything a Minecraft server needs; another closes it all.' },
      { icon: '📂', title: 'Rule Grouping',       desc: 'Organize rules by game type or server name. See exactly which ports are open and why, at a glance.' },
      { icon: '🔄', title: 'Live Refresh',        desc: 'Reload the active rule list from Windows Firewall at any time to see the current state of all managed ports.' },
      { icon: '🌐', title: 'Portal Integration',  desc: 'Exposes a local API so Ronin Citadel can view and modify firewall rules remotely without RDP access.' },
      { icon: '📝', title: 'Persistent State',    desc: 'All profiles and rules are stored locally and survive restarts. Your port configuration is always ready.' },
    ],
  },

  // ── Ronin Disk Manager ───────────────────────────────────────────────────
  disk: {
    id:       'disk',
    name:     'Ronin Disk Manager',
    eyebrow:  'Storage Analysis',
    tagline:  'Scan, analyse, and reclaim disk space at machine speed.',
    icon:     '💾',
    type:     'app',
    img:      'images/screenshots/tree-view.png',
    desc:     'Ronin Disk Manager is a Windows desktop application for analysing and managing disk usage on your dedicated server. It reads the NTFS Master File Table (MFT) directly to scan a volume in seconds, visualises usage as a tree and treemap, finds duplicates and space hogs, and safely moves, copies, or cleans up files with a Recycle Bin default and dry-run previews.',
    platform: 'Windows 10 / 11',
    requires: 'Administrator (self-contained exe)',
    version:  '1.5.0',
    size:     '~150 MB',
    download: 'https://github.com/PhonicSpider/Ronin-Disk-Manager/releases/latest/download/RoninDiskManager.exe',
    github:   'https://github.com/PhonicSpider/Ronin-Disk-Manager',
    screenshots: [
      { src: 'images/cards/tree-view.webp', caption: 'Full disk tree view: every folder with its size, instantly.', layout: 'full' },
      // Optional wider walkthrough shots. Drop files in images/screenshots/ and uncomment:
      // { src: 'images/screenshots/disk-treemap.png', caption: 'Treemap with the age heatmap on: green is recent, red is old.', layout: 'grid' },
      // { src: 'images/screenshots/disk-cleanup.png', caption: 'Age-based cleanup previewing the files it would recycle.', layout: 'grid' },
    ],
    features: [
      { icon: '⚡', title: 'MFT Scanning',
        img: 'images/screenshots/disk-scan.png',
        desc: 'Instead of walking folders one by one, it opens the raw NTFS volume and streams the Master File Table through the USN journal (the technique WizTree uses), so a whole drive enumerates in seconds. Non-NTFS drives fall back to a fast recursive walk automatically.' },
      { icon: '🌲', title: 'Tree & Treemap',
        img: 'images/screenshots/disk-treemap.png',
        desc: 'Results load as a lazy, size-sorted tree with a proportion bar on every row, or as a squarified treemap you can drill into. Flip on the age heatmap to colour files from green (recent) to red (old) and find stale data at a glance.' },
      { icon: '🔍', title: 'Search & Analysis',
        img: 'images/screenshots/disk-analysis.png',
        desc: 'Search every fixed drive at once by name or wildcard, or use the analysis tabs: size by file extension, the largest files with a running free-space target, an empty-folders finder, and a duplicate finder that groups by size then confirms with a SHA-256 hash.' },
      { icon: '🧹', title: 'Age-Based Cleanup',
        img: 'images/screenshots/disk-cleanup.png',
        desc: 'Aim a rule at a folder with a pattern and an age, such as logs older than 30 days. Preview lists exactly what matches and its total size; Apply removes only those files and defaults to the Recycle Bin, so nothing is lost by mistake.' },
      { icon: '🗂', title: 'Safe File Operations',
        img: 'images/screenshots/disk-fileops.png',
        desc: 'Move, copy, or delete the selected item, with deletes going to the Recycle Bin by default. A WhatIf dry-run shows what would happen without changing anything, and a live preview shows the exact command before you run it.' },
      { icon: '🛠', title: 'Windows Tools',
        img: 'images/screenshots/disk-tools.png',
        desc: 'A built-in panel runs common Windows maintenance (CHKDSK, SFC, DISM, DNS and IP resets, Disk Cleanup, Memory Diagnostic) and streams the output live into the app console, so you do not need a separate admin terminal.' },
    ],
  },

  // ── Ronin Forge ──────────────────────────────────────────────────────────
  forge: {
    id:      'forge',
    name:    'Ronin Forge',
    eyebrow: 'Server Provisioning',
    tagline: 'Spin up a new game server in minutes, not hours.',
    icon:    '⚙',
    type:    'app',
    badge:   'Coming Soon',
    // img:  'images/cards/forge.jpg',
    desc:    'Ronin Forge automates the download and initial configuration of game server files. Pick a game, Forge fetches the correct server binary, generates a starting config, and optionally registers it in Ronin Server Manager so it is ready to launch.',
    platform: 'Windows 10 / 11',
    requires: '.NET 8 Runtime',
    version:  'In Development',
    screenshots: [],
    features: [
      { icon: '⬇', title: 'Auto-Download',    desc: 'Fetch the correct server binary for any supported game with one click. No hunting for the right SteamCMD arguments.' },
      { icon: '⚙', title: 'Config Editor',    desc: 'Edit server configuration files through a clean form interface. No manual INI or JSON editing required.' },
      { icon: '🎮', title: 'Game Library',     desc: 'Built-in support for Minecraft (Java & Bedrock), Ark, Space Engineers, and more — with new games added over time.' },
      { icon: '🔗', title: 'RSM Integration', desc: 'Newly provisioned servers can be registered directly in Ronin Server Manager and launched immediately.' },
      { icon: '📁', title: 'Managed Installs',desc: 'Forge tracks where each server is installed, making updates and reinstalls straightforward.' },
      { icon: '🔄', title: 'Update Support',  desc: 'Re-run Forge against an existing install to pull the latest server version without losing your config.' },
    ],
  },

  // ── Live Console ─────────────────────────────────────────────────────────
  console: {
    id:      'console',
    name:    'Live Console',
    eyebrow: 'Real-Time Output',
    tagline: "Your server's terminal, in the browser.",
    icon:    '⌨',
    type:    'feature',
    // img:  'images/cards/console.jpg',
    desc:    "The Live Console streams real-time output from any RSM-managed server directly into the Ronin Citadel portal. Open the portal, navigate to your server, and see exactly what it is doing right now. No RDP or SSH needed.",
    screenshots: [
      // { src: 'images/screenshots/console-view.jpg', caption: 'Live console — real-time log streaming with inline command input.', layout: 'full' },
    ],
    features: [
      { icon: '📡', title: 'Live Streaming',  desc: 'Console output is streamed in real time via WebSocket. You see every log line as it happens, with no polling delay.' },
      { icon: '⌨', title: 'Command Input',   desc: 'Type commands directly into the browser and send them to the server process. Works exactly like a local terminal window.' },
      { icon: '🖥', title: 'Per-Server View', desc: 'Each managed server has its own dedicated console view. Switch between servers without losing any output history.' },
      { icon: '📜', title: 'Output History',  desc: 'Scroll back through recent output from the current session. Useful for diagnosing issues that happened while you were away.' },
      { icon: '🔐', title: 'Role-Gated',      desc: 'Console access is controlled by your role. Admins get full read/write; Viewers can read but not send commands.' },
      { icon: '🌐', title: 'No RDP Required', desc: "Access your server's console from any device, any browser, without installing anything or opening a remote desktop session." },
    ],
  },

  // ── CPU & RAM Monitor ────────────────────────────────────────────────────
  monitor: {
    id:      'monitor',
    name:    'CPU & RAM Monitor',
    eyebrow: 'Resource Monitoring',
    tagline: 'Know what your server is doing before players feel it.',
    icon:    '📊',
    type:    'feature',
    // img:  'images/cards/monitor.jpg',
    desc:    'The Resource Monitor shows live CPU and memory usage for every RSM-managed server in the Ronin Citadel portal sidebar. No separate monitoring tool, no RDP session required.',
    screenshots: [
      // { src: 'images/screenshots/monitor-sidebar.jpg', caption: 'Persistent sidebar showing live CPU and RAM bars for all managed servers.', layout: 'full' },
    ],
    features: [
      { icon: '📊', title: 'Live Metrics',       desc: 'CPU and RAM figures update continuously in real time, sourced directly from the RSM process on the host machine.' },
      { icon: '🖥', title: 'Per-Server Stats',   desc: 'Each server in the portal sidebar shows its own CPU and RAM bars, so you can compare usage at a glance.' },
      { icon: '👁', title: 'Always Visible',     desc: 'Metrics appear in the persistent sidebar, visible regardless of which portal view you are currently in.' },
      { icon: '🚨', title: 'Spot Runaway Procs', desc: 'A spike to 100% CPU on one server is immediately obvious, letting you restart or investigate before players notice lag.' },
      { icon: '🔐', title: 'Role-Gated',         desc: "Resource stats respect your team's role configuration. Community members only see what they have permission to view." },
      { icon: '🔋', title: 'Low Overhead',       desc: "Metrics are collected by RSM's existing process monitoring. No additional agent or service needs to run on the host." },
    ],
  },

  // ── Role-Based Access ────────────────────────────────────────────────────
  roles: {
    id:      'roles',
    name:    'Role-Based Access',
    eyebrow: 'Access Control',
    tagline: 'Every team member gets exactly the access they need.',
    icon:    '🔐',
    type:    'feature',
    // img:  'images/cards/roles.jpg',
    desc:    "Ronin Citadel's role system lets you define exactly what each team member can see and do. Permissions are scoped per portal node and per action, so a community admin can restart a specific server without touching firewall rules or storage.",
    screenshots: [
      // { src: 'images/screenshots/roles-matrix.jpg', caption: 'Role permissions matrix — set exactly what each role can see and do.', layout: 'full' },
    ],
    features: [
      { icon: '👑', title: 'Owner Role',           desc: 'Full access to every node and action in the portal. Only Owners can manage roles and invite new team members.' },
      { icon: '🔧', title: 'Admin Role',           desc: 'Access to Servers, Firewall view/edit, and Storage view. Cannot access System or account management.' },
      { icon: '👥', title: 'Community Admin',      desc: 'Can view server status and restart specific assigned servers. No firewall, storage, or system access.' },
      { icon: '👁', title: 'Viewer Role',          desc: 'Read-only access to server status and live console output. Cannot send commands or make any changes.' },
      { icon: '🎛', title: 'Per-Node Permissions', desc: 'Permissions are enforced at the web node level — the portal never renders branches the user has no access to.' },
      { icon: '⚡', title: 'Instant Effect',       desc: 'Role changes take effect immediately. No restart required — the next page load reflects the new permission set.' },
    ],
  },

  // ── Two-Factor Authentication ────────────────────────────────────────────
  '2fa': {
    id:      '2fa',
    name:    'Two-Factor Authentication',
    eyebrow: 'Security',
    tagline: 'A stolen password is not enough to get in.',
    icon:    '🔑',
    type:    'feature',
    // img:  'images/cards/2fa.jpg',
    desc:    'Ronin Citadel enforces TOTP-based two-factor authentication on every account. After entering your password, you provide a time-based code from an authenticator app. A compromised password alone gets you nowhere.',
    screenshots: [
      // { src: 'images/screenshots/2fa-setup.jpg', caption: 'QR code setup — scan with any TOTP authenticator app in under a minute.', layout: 'grid' },
      // { src: 'images/screenshots/2fa-login.jpg', caption: 'Login flow — password then 30-second TOTP code.', layout: 'grid' },
    ],
    features: [
      { icon: '🔑', title: 'TOTP Standard',    desc: 'Uses RFC 6238 time-based one-time passwords, compatible with Google Authenticator, Authy, Microsoft Authenticator, and any TOTP app.' },
      { icon: '📱', title: 'QR Code Setup',    desc: 'Scan a QR code from the portal settings page to link your authenticator app in under a minute.' },
      { icon: '🕐', title: '30-Second Codes',  desc: 'Codes rotate every 30 seconds. Even if one is intercepted, it is useless within half a minute.' },
      { icon: '🚫', title: 'Brute Force Proof',desc: 'Login endpoints are rate-limited. Too many failed attempts locks the source IP, preventing automated code guessing.' },
      { icon: '🔒', title: 'Argon2 Passwords', desc: 'Passwords are hashed with Argon2, the winner of the Password Hashing Competition. Far stronger than bcrypt.' },
      { icon: '🔄', title: 'Recovery Codes',  desc: 'One-time backup codes are generated at 2FA setup. Store them safely to regain access if your authenticator is lost.' },
    ],
  },

  // ── Team Management ──────────────────────────────────────────────────────
  team: {
    id:      'team',
    name:    'Team Management',
    eyebrow: 'Community Tools',
    tagline: 'Your whole server team, managed in one place.',
    icon:    '👥',
    type:    'feature',
    // img:  'images/cards/team.jpg',
    desc:    "Ronin Citadel's team management tools let you build and maintain your community admin structure directly from the portal. Invite members, assign roles, revoke access. No config files, no restarts.",
    screenshots: [
      // { src: 'images/screenshots/team-list.jpg',   caption: 'Team member directory — names, roles, and last active timestamps.', layout: 'grid' },
      // { src: 'images/screenshots/team-invite.jpg', caption: 'Invite flow — generate a link, assign a role, set expiry.', layout: 'grid' },
    ],
    features: [
      { icon: '📨', title: 'Invite System',       desc: 'Send invite links to new team members. Links expire after a configurable window to prevent stale invites being used.' },
      { icon: '🎭', title: 'Role Assignment',      desc: 'Assign any portal role to a team member at invite time, or change it later from the team management page.' },
      { icon: '⚡', title: 'Instant Changes',     desc: "Adding, removing, or changing a member's role takes effect immediately without any restart or cache flush." },
      { icon: '📋', title: 'Member Directory',    desc: 'See all team members, their roles, and their last active time in a single list. Know who has access to what at a glance.' },
      { icon: '🚫', title: 'Quick Revoke',        desc: "Remove a team member's access instantly. Useful when a community admin leaves or causes problems." },
      { icon: '📈', title: 'Scales with Your Team',desc: 'Whether you have two admins or twenty, the same interface manages them all. No per-member config files.' },
    ],
  },

  // ── Remote Access ────────────────────────────────────────────────────────
  remote: {
    id:      'remote',
    name:    'Remote Access',
    eyebrow: 'Anywhere Access',
    tagline: 'Manage your server from your phone, your laptop, anywhere.',
    icon:    '🌐',
    type:    'feature',
    // img:  'images/cards/remote.jpg',
    desc:    'Ronin Citadel is a self-hosted web portal served over HTTPS. Once deployed, the full management interface is accessible from any device and any location. Just a browser and your credentials.',
    screenshots: [
      // { src: 'images/screenshots/remote-mobile.jpg', caption: 'Full portal access from a mobile browser — no app install required.', layout: 'grid' },
      // { src: 'images/screenshots/remote-https.jpg',  caption: 'HTTPS with a proper TLS cert — every request encrypted end-to-end.', layout: 'grid' },
    ],
    features: [
      { icon: '🔒', title: 'HTTPS Encrypted',  desc: 'All portal traffic is encrypted with TLS via Nginx or Caddy as a reverse proxy. Your credentials and commands are never sent in plaintext.' },
      { icon: '📱', title: 'Any Device',        desc: "Works in any modern browser on desktop, tablet, or mobile. Responsive layout adapts to whatever screen you're on." },
      { icon: '🌍', title: 'No VPN Required',  desc: "Expose the portal directly over HTTPS on a standard port. Your team members don't need to install or configure a VPN client." },
      { icon: '⚡', title: 'Rate-Limited Login',desc: 'The login endpoint is rate-limited per IP. Brute force attacks get blocked automatically.' },
      { icon: '🏠', title: 'Self-Hosted',       desc: 'The portal runs on your own server. You control where it is, who can reach it, and what data it holds. Nothing is sent to third-party servers.' },
      { icon: '🔑', title: 'JWT + Refresh',    desc: 'Short-lived JWT access tokens with secure refresh token rotation. Sessions expire automatically and cannot be replayed after logout.' },
    ],
  },
};
