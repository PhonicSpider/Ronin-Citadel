// ── Ronin Citadel — legal details used by /privacy and /terms ─────────────────
// FILL THESE IN before launch. Until all four required values are set, the legal
// pages show a "DRAFT" banner so the gaps cannot go unnoticed.
//
// Keep `auditRetentionDays` equal to AUDIT_RETENTION_DAYS in the backend (default
// 730) and `termsVersion` equal to TERMS_VERSION in backend/src/lib/legal.js.
// Change the version/date whenever either document changes materially.
window.RC_LEGAL = {
  // Trading / brand name shown in the documents.
  operatorName: 'Ronin Empire',

  // REQUIRED. Your full legal name, or the registered company name and number
  // if you operate as a company. Example: 'Ronin Empire Ltd (company no. 12345678)'.
  legalEntity: '',

  // REQUIRED. Country (and state/region if relevant) where you are established.
  country: '',

  // REQUIRED. A monitored mailbox for privacy requests and legal notices.
  contactEmail: '',

  // REQUIRED. Law that governs the Terms. Example: 'the laws of England and Wales'.
  governingLaw: '',

  // Name your email delivery provider here if you want it listed (optional).
  emailProvider: '',

  termsVersion: '2026-10-29',
  effectiveDate: '29 October 2026',
  auditRetentionDays: 730,
};
