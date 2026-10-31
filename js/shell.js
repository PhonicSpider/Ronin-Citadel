// ── Ronin Citadel — portal shell ──────────────────────────────────────────────────────
// Requires api.js (RC global) and router.js (Router global) to be loaded first.
// Call initShell(activeNavId, callback) at the bottom of each portal page.
// The callback receives (user, orgSlug) so pages can scope their API calls.

// Blocking prompt for accounts that have not accepted the current Terms and
// Privacy Policy, or have no date of birth on file (see publicUser() in the
// backend). The page behind it is made inert until the person accepts or signs
// out. The server records the acceptance; this only asks for it.
function showConsentGate(user) {
  if (document.getElementById('consentGate')) return;

  const overlay = document.createElement('div');
  overlay.id = 'consentGate';
  overlay.className = 'consent-gate';

  const card = document.createElement('div');
  card.className = 'consent-gate-card';
  card.setAttribute('role', 'dialog');
  card.setAttribute('aria-modal', 'true');
  card.setAttribute('aria-labelledby', 'consentGateTitle');

  const title = document.createElement('h2');
  title.id = 'consentGateTitle';
  title.className = 'consent-gate-title';
  title.textContent = 'Before you continue';
  card.appendChild(title);

  const intro = document.createElement('p');
  intro.className = 'consent-gate-text';
  intro.textContent = user.needsBirthday
    ? 'Please confirm your age and accept our Terms of Service and Privacy Policy to keep using Ronin Citadel.'
    : 'We have updated our Terms of Service and Privacy Policy. Please review and accept them to keep using Ronin Citadel.';
  card.appendChild(intro);

  let dobInput = null;
  if (user.needsBirthday) {
    const wrap = document.createElement('div');
    wrap.className = 'consent-gate-field';
    const label = document.createElement('label');
    label.htmlFor = 'consentGateDob';
    label.textContent = 'Date of birth';
    dobInput = document.createElement('input');
    dobInput.type = 'date';
    dobInput.id = 'consentGateDob';
    dobInput.max = new Date().toISOString().slice(0, 10);
    dobInput.autocomplete = 'bday';
    const hint = document.createElement('div');
    hint.className = 'consent-gate-hint';
    hint.textContent = 'You must be at least 16. It is used to confirm your age and for anonymous statistics, and cannot be changed later.';
    wrap.append(label, dobInput, hint);
    card.appendChild(wrap);
  }

  const check = document.createElement('label');
  check.className = 'consent-gate-check';
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.id = 'consentGateAccept';
  const span = document.createElement('span');
  const termsLink = document.createElement('a');
  termsLink.href = '/terms';
  termsLink.target = '_blank';
  termsLink.rel = 'noopener';
  termsLink.textContent = 'Terms of Service';
  const privacyLink = document.createElement('a');
  privacyLink.href = '/privacy';
  privacyLink.target = '_blank';
  privacyLink.rel = 'noopener';
  privacyLink.textContent = 'Privacy Policy';
  span.append('I agree to the ', termsLink, ' and the ', privacyLink, '.');
  check.append(box, span);
  card.appendChild(check);

  const err = document.createElement('div');
  err.className = 'consent-gate-error';
  err.setAttribute('role', 'alert');
  err.hidden = true;
  card.appendChild(err);

  const actions = document.createElement('div');
  actions.className = 'consent-gate-actions';
  const accept = document.createElement('button');
  accept.type = 'button';
  accept.className = 'btn btn-primary';
  accept.textContent = 'Accept and continue';
  const out = document.createElement('button');
  out.type = 'button';
  out.className = 'btn btn-ghost';
  out.textContent = 'Sign out';
  out.addEventListener('click', function () { RC.logout(); });
  actions.append(accept, out);
  card.appendChild(actions);

  function fail(msg) { err.textContent = msg; err.hidden = false; }

  accept.addEventListener('click', async function () {
    err.hidden = true;
    if (dobInput && !dobInput.value) { fail('Enter your date of birth.'); return; }
    if (!box.checked) { fail('Tick the box to accept the Terms of Service and Privacy Policy.'); return; }

    accept.disabled = true;
    const body = { acceptTerms: true };
    if (dobInput) body.dateOfBirth = dobInput.value;
    const res  = await RC.apiFetch('/api/users/me/accept-terms', { method: 'POST', body: JSON.stringify(body) });
    const data = await res.json().catch(function () { return {}; });
    accept.disabled = false;

    if (!res.ok) { fail(data.error || 'Could not save your answer. Try again.'); return; }

    RC.setSession(RC.getToken(), data.user);
    overlay.remove();
    document.querySelectorAll('[data-consent-inert]').forEach(function (el) {
      el.inert = false;
      el.removeAttribute('data-consent-inert');
    });
  });

  overlay.appendChild(card);
  document.body.appendChild(overlay);
  // Everything else on the page stays unreachable until the prompt is answered.
  Array.from(document.body.children).forEach(function (el) {
    if (el !== overlay && el.tagName !== 'SCRIPT') { el.inert = true; el.setAttribute('data-consent-inert', ''); }
  });
  (dobInput || box).focus();
}

function initShell(activeNavId, onUser) {
  RC.requireAuth(function (user) {
    if (user.needsTerms || user.needsBirthday) showConsentGate(user);

    // Staff (employee / master admin) get a link to the staff tools.
    if (user.isStaff) {
      const nav = document.querySelector('.side-nav');
      if (nav && !nav.querySelector('[data-nav="staff"]')) {
        const a = document.createElement('a');
        a.href = '/staff';
        a.className = 'side-nav-item';
        a.dataset.nav = 'staff';
        a.textContent = '★ Staff';
        nav.appendChild(a);
      }
    }

    // Populate user info across the page
    document.querySelectorAll('.user-name').forEach(el => {
      el.textContent = user.username;
    });
    document.querySelectorAll('.user-avatar').forEach(el => {
      el.textContent = user.username.charAt(0).toUpperCase();
    });

    // Mark active nav item
    document.querySelectorAll('[data-nav]').forEach(el => {
      el.classList.toggle('active', el.dataset.nav === activeNavId);
    });

    // Wire logout buttons
    document.querySelectorAll('.logout-btn').forEach(btn => {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        RC.logout();
      });
    });

    // Close modals on overlay click
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', function (e) {
        if (e.target === overlay) overlay.classList.remove('open');
      });
    });

    // Close modals on Escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay.open').forEach(m => m.classList.remove('open'));
      }
    });

    // ── Modal accessibility ───────────────────────────────────────────────
    // Marks each modal as a dialog, moves focus into it when it opens, keeps Tab
    // inside it, and hands focus back to the opener when it closes.
    const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const openers = new WeakMap();

    document.querySelectorAll('.modal-overlay').forEach(function (overlay, i) {
      const card = overlay.querySelector('.modal-card, .modal-box');
      if (!card) return;
      card.setAttribute('role', 'dialog');
      card.setAttribute('aria-modal', 'true');
      const title = card.querySelector('.modal-title');
      if (title) {
        if (!title.id) title.id = (overlay.id || 'modal' + i) + 'Title';
        card.setAttribute('aria-labelledby', title.id);
      }

      new MutationObserver(function () {
        if (overlay.classList.contains('open')) {
          if (!openers.has(overlay)) {
            openers.set(overlay, document.activeElement);
            const first = card.querySelector(FOCUSABLE);
            if (first) setTimeout(function () { first.focus(); }, 0);
          }
        } else if (openers.has(overlay)) {
          const opener = openers.get(overlay);
          openers.delete(overlay);
          if (opener && document.contains(opener) && typeof opener.focus === 'function') opener.focus();
        }
      }).observe(overlay, { attributes: true, attributeFilter: ['class'] });
    });

    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab') return;
      const open = document.querySelector('.modal-overlay.open');
      if (!open) return;
      const items = Array.from(open.querySelectorAll(FOCUSABLE)).filter(function (el) { return el.offsetParent !== null; });
      if (!items.length) return;
      const first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      else if (!open.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
    });

    // ── Mobile sidebar toggle ──────────────────────────────────────────────
    const sidebar = document.querySelector('.dash-sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    const toggle  = document.querySelector('.sb-toggle');

    if (sidebar && toggle) {
      toggle.setAttribute('aria-expanded', 'false');

      toggle.addEventListener('click', function () {
        const open = sidebar.classList.toggle('open');
        toggle.setAttribute('aria-expanded', String(open));
        sidebar.setAttribute('aria-hidden', String(!open));
        if (overlay) overlay.classList.toggle('active', open);
      });

      if (overlay) {
        overlay.addEventListener('click', function () {
          sidebar.classList.remove('open');
          toggle.setAttribute('aria-expanded', 'false');
          sidebar.setAttribute('aria-hidden', 'true');
          overlay.classList.remove('active');
        });
      }

      sidebar.querySelectorAll('a, .side-nav-item').forEach(function (el) {
        el.addEventListener('click', function () {
          if (window.matchMedia('(max-width: 768px)').matches) {
            sidebar.classList.remove('open');
            toggle.setAttribute('aria-expanded', 'false');
            sidebar.setAttribute('aria-hidden', 'true');
            if (overlay) overlay.classList.remove('active');
          }
        });
      });
    }

    // Extract org slug from URL and pass it to the page callback.
    const orgSlug = (typeof Router !== 'undefined')
      ? Router.parse().orgSlug
      : null;

    if (onUser) onUser(user, orgSlug);
  });
}
