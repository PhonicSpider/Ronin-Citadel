// ── Ronin Citadel — shared API & auth utilities ───────────────────────────────
// Change API_BASE to '' when frontend and backend are on the same origin (prod).
const API_BASE = '';

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

  // Fetch with auth — auto-refreshes once on 401.
  async function apiFetch(path, options = {}) {
    const token = getToken();
    const makeHeaders = (t) => ({
      'Content-Type': 'application/json',
      ...(t ? { Authorization: `Bearer ${t}` } : {}),
      ...(options.headers ?? {}),
    });

    let res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: makeHeaders(token),
      credentials: 'include',
    });

    if (res.status === 401) {
      const refreshed = await refresh();
      if (!refreshed) return res;
      res = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers: makeHeaders(refreshed.accessToken),
        credentials: 'include',
      });
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
    window.location.href = 'login.html';
  }

  // Call on every protected page. Runs the callback with the user object if
  // authenticated, otherwise redirects to login.
  async function requireAuth(onUser) {
    const token = getToken();
    if (token && tokenIsAlive(token)) {
      const user = getUser();
      if (user) { onUser(user); return; }
    }

    const refreshed = await refresh();
    if (refreshed) { onUser(refreshed.user); return; }

    clearSession();
    window.location.href = 'login.html';
  }

  return { API_BASE, getToken, getUser, setSession, clearSession, refresh, apiFetch, logout, requireAuth };
})();
