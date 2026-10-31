// ── Ronin Citadel — cookie consent ───────────────────────────────────────────
// Loaded on every page.
//
// Categories
//   necessary    always on: the sign-in session cookie. No consent needed.
//   analytics    OFF until the visitor allows it. Nothing uses it yet.
//   advertising  OFF until the visitor allows it. Nothing uses it yet.
//
// Today no analytics or advertising code exists on the site, so choosing here
// changes nothing yet. The choice is stored so that it applies from the first day
// such code is added, and the banner says so plainly.
//
// ADDING ANALYTICS OR ADS LATER (all of these, or it is not compliant):
//   1. Never put the vendor <script> in the HTML. Load it from a callback:
//        RCConsent.whenAllowed('analytics', function () { /* inject the script */ });
//   2. Self-host the vendor script in js/vendor/ if its licence allows, otherwise
//      add its exact origin to the CSP in backend/src/app.js (scriptSrc, connectSrc, imgSrc).
//   3. List the vendor, what it collects and how long in /privacy and /cookies,
//      and bump TERMS_VERSION (backend/src/lib/legal.js) so users are told.
//   4. Honour withdrawal: onChange() fires when a choice is turned off; stop the
//      vendor and delete its cookies there.
//
// Global Privacy Control: a browser that sends the GPC signal has told us not to
// sell or share its data, so advertising is forced off and cannot be switched on here.
//
// The choice is kept in localStorage (not a cookie) for 12 months, then asked again.
(function () {
  'use strict';

  var KEY = 'rc_consent';
  var MAX_AGE_MS = 365 * 24 * 60 * 60 * 1000;
  var CATEGORIES = [
    {
      id: 'analytics',
      label: 'Analytics',
      text: 'Anonymous usage statistics that help us improve the portal. We do not run any yet. If we add analytics it will only run if you allow it.',
    },
    {
      id: 'advertising',
      label: 'Advertising',
      text: 'Ads and the cookies advertising partners use to choose and measure them. We do not show ads yet. If we do, they will only use these cookies if you allow it.',
    },
  ];

  var gpc = navigator.globalPrivacyControl === true;
  var listeners = [];
  var waiting = [];
  var lastFocus = null;

  // ── Stored state ──────────────────────────────────────────────────────────
  function read() {
    try {
      var v = JSON.parse(localStorage.getItem(KEY));
      if (!v || v.v !== 2 || typeof v.ts !== 'number') return null;
      if (Date.now() - v.ts > MAX_AGE_MS) return null;
      return v;
    } catch (e) { return null; }
  }
  function write(choices) {
    try {
      localStorage.setItem(KEY, JSON.stringify({
        v: 2, ts: Date.now(),
        analytics: !!choices.analytics,
        advertising: !!choices.advertising,
      }));
    } catch (e) { /* storage blocked: choices last for this page only */ }
  }

  var memory = null; // fallback when storage is blocked
  function current() { return read() || memory; }

  function has(category) {
    if (category === 'necessary') return true;
    if (category === 'advertising' && gpc) return false;
    var c = current();
    return !!(c && c[category] === true);
  }

  function save(choices) {
    var before = { analytics: has('analytics'), advertising: has('advertising') };
    memory = { v: 2, ts: Date.now(), analytics: !!choices.analytics, advertising: !!choices.advertising };
    write(choices);
    var state = { analytics: has('analytics'), advertising: has('advertising') };
    CATEGORIES.forEach(function (c) {
      if (before[c.id] !== state[c.id]) listeners.forEach(function (fn) { try { fn(c.id, state[c.id]); } catch (e) {} });
    });
    waiting = waiting.filter(function (w) {
      if (!has(w.category)) return true;
      try { w.fn(); } catch (e) {}
      return false;
    });
  }

  // ── Public API ────────────────────────────────────────────────────────────
  window.RCConsent = {
    has: has,
    // fn(category, allowed) whenever a category is switched on or off.
    onChange: function (fn) { listeners.push(fn); },
    // Runs fn once now if the category is allowed, otherwise as soon as it is.
    whenAllowed: function (category, fn) {
      if (has(category)) { try { fn(); } catch (e) {} } else { waiting.push({ category: category, fn: fn }); }
    },
    open: openPreferences,
    reopen: openPreferences,
  };

  // ── DOM helpers ───────────────────────────────────────────────────────────
  function el(tag, props, kids) {
    var node = document.createElement(tag);
    Object.keys(props || {}).forEach(function (k) {
      if (k === 'class') node.className = props[k];
      else if (k === 'text') node.textContent = props[k];
      else node.setAttribute(k, props[k]);
    });
    (kids || []).forEach(function (kid) { node.append(kid); });
    return node;
  }
  function button(text, cls, onClick) {
    var b = el('button', { type: 'button', class: cls, text: text });
    b.addEventListener('click', onClick);
    return b;
  }
  function loadCss() {
    if (document.getElementById('rcConsentCss')) return;
    var link = el('link', { id: 'rcConsentCss', rel: 'stylesheet', href: '/css/cookie-notice.css' });
    document.head.appendChild(link);
  }

  // ── Banner ────────────────────────────────────────────────────────────────
  function removeBanner() {
    var b = document.getElementById('rcCookieNotice');
    if (b) b.remove();
  }

  function showBanner() {
    if (document.getElementById('rcCookieNotice')) return;
    loadCss();

    var text = el('p', { class: 'cookie-notice-text' });
    text.append(
      'We use one essential cookie to keep you signed in. Optional analytics and advertising are not in use yet; ' +
      'what you choose here will apply if we add them. ',
      el('a', { href: '/cookies', text: 'Cookie policy' })
    );

    var actions = el('div', { class: 'cookie-notice-actions' }, [
      button('Reject non-essential', 'cookie-btn', function () { save({ analytics: false, advertising: false }); removeBanner(); }),
      button('Accept all', 'cookie-btn', function () { save({ analytics: true, advertising: true }); removeBanner(); }),
      button('Manage', 'cookie-btn cookie-btn-link', function () { openPreferences(); }),
    ]);

    var box = el('div', { id: 'rcCookieNotice', class: 'cookie-notice', role: 'region', 'aria-label': 'Cookie consent' }, [text, actions]);
    document.body.appendChild(box);
  }

  // ── Preferences dialog ────────────────────────────────────────────────────
  var FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled])';

  function closePreferences() {
    var d = document.getElementById('rcCookieDialog');
    if (d) d.remove();
    document.removeEventListener('keydown', onKey, true);
    if (lastFocus && document.contains(lastFocus)) lastFocus.focus();
  }

  function onKey(e) {
    var d = document.getElementById('rcCookieDialog');
    if (!d) return;
    if (e.key === 'Escape') { e.preventDefault(); closePreferences(); return; }
    if (e.key !== 'Tab') return;
    var items = Array.prototype.slice.call(d.querySelectorAll(FOCUSABLE));
    if (!items.length) return;
    var first = items[0], last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  function openPreferences() {
    if (document.getElementById('rcCookieDialog')) return;
    loadCss();
    lastFocus = document.activeElement;

    var boxes = {};
    var rows = [
      // Necessary: shown, locked on.
      el('div', { class: 'cookie-row' }, [
        el('div', { class: 'cookie-row-head' }, [
          el('strong', { text: 'Strictly necessary' }),
          el('span', { class: 'cookie-row-state', text: 'Always on' }),
        ]),
        el('p', { text: 'The cookie that keeps you signed in after you log in. The site cannot work without it, so it cannot be switched off.' }),
      ]),
    ];

    CATEGORIES.forEach(function (c) {
      var id = 'rcConsent_' + c.id;
      var input = el('input', { type: 'checkbox', id: id });
      input.checked = has(c.id);
      var locked = (c.id === 'advertising' && gpc);
      if (locked) { input.checked = false; input.disabled = true; }
      boxes[c.id] = input;

      var label = el('label', { class: 'cookie-switch', for: id }, [input, el('span', { text: c.label })]);
      var head = el('div', { class: 'cookie-row-head' }, [label]);
      var body = el('p', { text: c.text });
      var kids = [head, body];
      if (locked) kids.push(el('p', { class: 'cookie-row-note', text: 'Your browser sends a Global Privacy Control signal, so advertising stays off.' }));
      rows.push(el('div', { class: 'cookie-row' }, kids));
    });

    function choose(analytics, advertising) {
      save({ analytics: analytics, advertising: advertising });
      removeBanner();
      closePreferences();
    }

    var dialog = el('div', {
      class: 'cookie-dialog', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'rcCookieDialogTitle',
    }, [
      el('h2', { id: 'rcCookieDialogTitle', class: 'cookie-dialog-title', text: 'Cookie settings' }),
      el('p', { class: 'cookie-dialog-intro', text: 'Choose which optional cookies we may use. You can change this at any time from the footer of any page.' }),
      el('div', { class: 'cookie-rows' }, rows),
      el('div', { class: 'cookie-dialog-actions' }, [
        button('Reject non-essential', 'cookie-btn', function () { choose(false, false); }),
        button('Accept all', 'cookie-btn', function () { choose(true, !gpc); }),
        button('Save my choices', 'cookie-btn cookie-btn-primary', function () { choose(boxes.analytics.checked, boxes.advertising.checked); }),
      ]),
      el('p', { class: 'cookie-dialog-foot' }, [
        'More detail: ', el('a', { href: '/cookies', text: 'Cookie policy' }), ' and ', el('a', { href: '/privacy', text: 'Privacy Policy' }), '.',
      ]),
    ]);

    var overlay = el('div', { id: 'rcCookieDialog', class: 'cookie-overlay' }, [dialog]);
    overlay.addEventListener('mousedown', function (e) { if (e.target === overlay) closePreferences(); });
    document.body.appendChild(overlay);
    document.addEventListener('keydown', onKey, true);
    var first = dialog.querySelector(FOCUSABLE);
    if (first) first.focus();
  }

  // ── Start ─────────────────────────────────────────────────────────────────
  // "Cookie settings" links anywhere on the site: <button data-cookie-settings>.
  document.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('[data-cookie-settings]');
    if (t) { e.preventDefault(); openPreferences(); }
  });

  function init() {
    // The policy page is where people read the details; do not cover it.
    if (!current() && location.pathname !== '/cookies') showBanner();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
