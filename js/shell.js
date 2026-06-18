// ── Ronin Citadel — portal shell ──────────────────────────────────────────────────────
// Requires api.js (RC global) and router.js (Router global) to be loaded first.
// Call initShell(activeNavId, callback) at the bottom of each portal page.
// The callback receives (user, orgSlug) so pages can scope their API calls.

function initShell(activeNavId, onUser) {
  RC.requireAuth(function (user) {
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
