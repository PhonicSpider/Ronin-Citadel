// ── Ronin Citadel — shared API & auth utilities ───────────────────────────────
// Change API_BASE to '' when frontend and backend are on the same origin (prod).
const API_BASE = '';

// Dev mode — bypasses auth redirect with a mock user so you can work on the
// portal UI without a running backend. Toggle from the browser console:
//   localStorage.setItem('rc_dev_mode', 'true');  location.reload()
//   localStorage.removeItem('rc_dev_mode');        location.reload()
//
// DEV_MODE is only honoured when the backend indicates a non-production environment.
// The server sets a <meta name="rc-env" content="development"> tag in non-prod builds.
// In production, this meta tag is absent and DEV_MODE is always false — a console
// flag alone can never enable it.
const _envMeta = document.querySelector('meta[name="rc-env"]');
const DEV_MODE = _envMeta?.content === 'development' && localStorage.getItem('rc_dev_mode') === 'true';
const _DEV_USER = { id: 'dev-0', username: 'dev', email: 'dev@ronin.local', role: 'admin' };

const RC = (() => {
  const USER_KEY = 'rc_user';

  // The access token lives only in JS memory for the lifetime of the page.
  // It is never written to sessionStorage/localStorage where XSS could steal it.
  // On reload this is null; requireAuth() then transparently refreshes via the
  // HttpOnly refresh cookie, which does survive a reload.
  let _accessToken = null;

  function getToken() { return _accessToken; }
  function getUser()  {
    try { return JSON.parse(sessionStorage.getItem(USER_KEY)); } catch { return null; }
  }

  function setSession(accessToken, user) {
    _accessToken = accessToken ?? null;
    // The user object is display data (username, email) — not a secret — so it
    // may live in sessionStorage for cheap reads across same-tab navigations.
    sessionStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  function clearSession() {
    _accessToken = null;
    sessionStorage.removeItem(USER_KEY);
  }

  function tokenIsAlive(token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 > Date.now() + 10_000; // 10 s buffer
    } catch { return false; }
  }

  async function refresh() {
    try {
      const res = await fetch(`${API_BASE}/api/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) return null;
      const data = await res.json();
      setSession(data.accessToken, data.user);
      return data;
    } catch { return null; }
  }

  // Synthetic response for when the backend is unreachable.
  function _netErr() {
    return {
      ok: false,
      status: 0,
      json: async () => ({ error: 'Network error — backend unreachable.' }),
    };
  }

  // Fetch with auth — auto-refreshes once on 401.
  async function apiFetch(path, options = {}) {
    const token = getToken();
    const makeHeaders = (t) => ({
      'Content-Type': 'application/json',
      ...(t ? { Authorization: `Bearer ${t}` } : {}),
      ...(options.headers ?? {}),
    });

    let res;
    try {
      res = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers: makeHeaders(token),
        credentials: 'include',
      });
    } catch { return _netErr(); }

    if (res.status === 401) {
      const refreshed = await refresh();
      if (!refreshed) return res;
      try {
        res = await fetch(`${API_BASE}${path}`, {
          ...options,
          headers: makeHeaders(refreshed.accessToken),
          credentials: 'include',
        });
      } catch { return _netErr(); }
    }

    return res;
  }

  async function logout() {
    try {
      await fetch(`${API_BASE}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch {}
    clearSession();
    window.location.href = '/login';
  }

  // Call on every protected page. Runs the callback with the user object if
  // authenticated, otherwise redirects to login.
  async function requireAuth(onUser) {
    if (DEV_MODE) { onUser(_DEV_USER); return; }

    const token = getToken();
    if (token && tokenIsAlive(token)) {
      const user = getUser();
      if (user) { onUser(user); return; }
    }

    const refreshed = await refresh();
    if (refreshed) { onUser(refreshed.user); return; }

    clearSession();
    const redirect = encodeURIComponent(window.location.pathname + window.location.search);
    window.location.href = '/login?redirect=' + redirect;
  }

  // Non-redirecting auth check — returns the user object if logged in, null otherwise.
  // Use on public pages that have optional auth (e.g. accept-invite.html).
  async function tryAuth() {
    if (DEV_MODE) return _DEV_USER;
    const token = getToken();
    if (token && tokenIsAlive(token)) return getUser();
    const refreshed = await refresh();
    return refreshed?.user ?? null;
  }

  return { API_BASE, DEV_MODE, getToken, getUser, setSession, clearSession, refresh, apiFetch, logout, requireAuth, tryAuth };
})();
