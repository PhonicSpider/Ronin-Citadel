// ── Ronin Citadel — shared API & auth utilities ───────────────────────────────
// Change API_BASE to '' when frontend and backend are on the same origin (prod).
const API_BASE = '';

// Dev mode — bypasses auth redirect with a mock user so you can work on the
// portal UI without a running backend. Toggle from the browser console:
//   localStorage.setItem('rc_dev_mode', 'true');  location.reload()
//   localStorage.removeItem('rc_dev_mode');        location.reload()
const DEV_MODE = localStorage.getItem('rc_dev_mode') === 'true';
const _DEV_USER = { id: 'dev-0', username: 'dev', email: 'dev@ronin.local', role: 'admin' };

const RC = (() => {
  const TOKEN_KEY = 'rc_access_token';
  const USER_KEY  = 'rc_user';

  function getToken() { return sessionStorage.getItem(TOKEN_KEY); }
  function getUser()  {
    try { return JSON.parse(sessionStorage.getItem(USER_KEY)); } catch { return null; }
  }

  function setSession(accessToken, user) {
    sessionStorage.setItem(TOKEN_KEY, accessToken);
    sessionStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  function clearSession() {
    sessionStorage.removeItem(TOKEN_KEY);
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
