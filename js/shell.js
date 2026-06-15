// ── Ronin Citadel — portal shell ──────────────────────────────────────────────────────
// Requires api.js (RC global) to be loaded first.
// Call initShell(activeNavId, callback) at the bottom of each portal page.

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
    var sidebar = document.querySelector('.dash-sidebar');
    var overlay = document.querySelector('.sidebar-overlay');
    var toggle  = document.querySelector('.sb-toggle');

    if (sidebar && toggle) {
      toggle.addEventListener('click', function () {
        var open = sidebar.classList.toggle('open');
        if (overlay) overlay.classList.toggle('active', open);
      });

      if (overlay) {
        overlay.addEventListener('click', function () {
          sidebar.classList.remove('open');
          overlay.classList.remove('active');
        });
      }

      sidebar.querySelectorAll('a, .side-nav-item').forEach(function (el) {
        el.addEventListener('click', function () {
          if (window.innerWidth <= 768) {
            sidebar.classList.remove('open');
            if (overlay) overlay.classList.remove('active');
          }
        });
      });
    }

    if (onUser) onUser(user);
  });
}
