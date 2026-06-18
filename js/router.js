/* router.js — Ronin Citadel client-side URL router
   Parses the current pathname into org/section/param segments.
   All portal pages load this before api.js so the org slug is
   available to auth redirects and API calls.                    */

const Router = (() => {

  // Reserved top-level slugs that cannot be org slugs.
  const RESERVED = new Set([
    'login', 'register', 'accept-invite', 'get-started', 'tools', 'api',
  ]);

  // Parse the current URL pathname into named segments.
  // e.g. /ronin-empire/machines/game-server-01
  //   → { orgSlug: 'ronin-empire', section: 'machines', param: 'game-server-01' }
  function parse(pathname) {
    const path  = pathname ?? window.location.pathname;
    const parts = path.split('/').filter(Boolean);

    const orgSlug = (parts[0] && !RESERVED.has(parts[0])) ? parts[0] : null;
    const section = parts[1] ?? null;
    const param   = parts[2] ?? null;

    return { orgSlug, section, param };
  }

  // Push a new URL without reloading the page.
  function push(path) {
    history.pushState({}, '', path);
  }

  // Replace the current history entry without reloading the page.
  function replace(path) {
    history.replaceState({}, '', path);
  }

  // Build a portal path from parts, skipping nulls.
  // buildPath('ronin-empire', 'machines', 'game-server') → '/ronin-empire/machines/game-server'
  function buildPath(...parts) {
    return '/' + parts.filter(Boolean).join('/');
  }

  return { parse, push, replace, buildPath, RESERVED };
})();
