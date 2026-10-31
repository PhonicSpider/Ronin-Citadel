// Fills <span data-legal="key"> placeholders on the legal pages from RC_LEGAL and
// shows a DRAFT banner while any required detail is still empty.
(function () {
  'use strict';
  var L = window.RC_LEGAL || {};
  var REQUIRED = ['legalEntity', 'country', 'contactEmail', 'governingLaw'];
  var missing = REQUIRED.filter(function (k) { return !String(L[k] || '').trim(); });

  document.querySelectorAll('[data-legal]').forEach(function (el) {
    var key = el.getAttribute('data-legal');
    var val = String(L[key] == null ? '' : L[key]).trim();
    if (key === 'contactEmail' && val) {
      var a = document.createElement('a');
      a.href = 'mailto:' + val;
      a.textContent = val;
      el.textContent = '';
      el.appendChild(a);
    } else if (val) {
      el.textContent = val;
    } else {
      el.textContent = '[' + key + ' not set]';
      el.setAttribute('data-unset', '');
    }
  });

  if (missing.length) {
    var doc = document.querySelector('.doc');
    if (doc) {
      var b = document.createElement('div');
      b.className = 'draft-banner';
      b.setAttribute('role', 'note');
      b.textContent = 'DRAFT: this document is not in force yet. The operator details are incomplete (' +
        missing.join(', ') + '). Fill them in js/legal-config.js and have the text reviewed before launch.';
      doc.insertBefore(b, doc.firstChild);
    }
  }
})();
