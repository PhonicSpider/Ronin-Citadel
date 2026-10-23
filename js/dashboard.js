// dashboard.js — Ronin Citadel dashboard controller.
//
// Extracted from the former inline <script> in dashboard.html. Responsibilities:
//   • boot the page via initShell()
//   • resolve the selected org's role and drive the spider web (webInit)
//   • toast notifications (window.RC_showToast)
//   • machine-context resolution for machine-level actions
//   • firewall panel (view / add / remove with a rule picker) via the portal relay
//   • RSM status / restart relays
//   • change-password modal
//
// All machine commands route through POST /api/agent/:machineId/command, which the
// backend relays to the RSM agent over WSS.

(function () {
  'use strict';

  // ── Shared context ──────────────────────────────────────────────────────────
  const ctx = { orgSlug: null, orgId: null, role: 'viewer', machine: null };

  function escHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  // ── Toasts ──────────────────────────────────────────────────────────────────
  function showToast(message, type = 'info', durationMs = 4000) {
    const container = document.getElementById('toastContainer');
    if (!container) { console.log('[RC]', message); return; }
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.2s';
      setTimeout(() => toast.remove(), 200);
    }, durationMs);
  }
  window.RC_showToast = showToast;

  // ── Boot ─────────────────────────────────────────────────────────────────────
  initShell('dashboard', async function (user, orgSlug) {
    ctx.orgSlug = orgSlug || null;

    if (orgSlug) {
      document.getElementById('navOrgs').href     = '/' + orgSlug + '/orgs';
      document.getElementById('navMachines').href = '/' + orgSlug + '/machines';
      document.getElementById('navSettings').href = '/' + orgSlug + '/settings';
    }

    // Resolve the user's role for the *selected* org. Role is per-org, so we read
    // it from the org list (each row carries the caller's membership role).
    ctx.role = await resolveOrgRole(orgSlug, user);

    // Start the spider web with the resolved role (filters gated branches).
    if (typeof webInit === 'function') webInit(ctx.role);

    if (RC.DEV_MODE) {
      document.getElementById('devBadge').style.display = 'flex';
      const section = document.getElementById('sidebarServers');
      section.innerHTML = '<div class="sb-label">Servers</div>'
        + '<div style="font-size:11px;color:var(--text-muted);padding:4px 0;">Dev mode — no API calls.</div>';
      return;
    }

    await loadSidebarServers();
  });

  // Returns the caller's role string for the selected org (defaults to viewer).
  async function resolveOrgRole(orgSlug, user) {
    if (RC.DEV_MODE) return (user && user.role) || 'admin';
    try {
      const res  = await RC.apiFetch('/api/orgs');
      const data = await res.json();
      if (!res.ok || !Array.isArray(data.orgs)) return 'viewer';

      const org = orgSlug
        ? data.orgs.find(o => o.slug === orgSlug)
        : data.orgs[0];
      if (org) {
        ctx.orgId = org.id;
        ctx._defaultMachineSlug = org.default_machine_slug || null;
        return org.role || 'viewer';
      }
    } catch { /* fall through */ }
    return 'viewer';
  }

  // ── Sidebar servers ───────────────────────────────────────────────────────────
  async function loadSidebarServers() {
    const section = document.getElementById('sidebarServers');

    const orgsRes  = await RC.apiFetch('/api/orgs');
    const orgsData = await orgsRes.json();

    if (!orgsRes.ok || !orgsData.orgs?.length) {
      section.innerHTML = '<div class="sb-label">Servers</div>'
        + '<div style="font-size:11px;color:var(--text-muted);padding:4px 0;">No orgs yet — <a href="/register" style="color:var(--cyan-dim);">create one</a>.</div>';
      return;
    }

    const results = await Promise.all(
      orgsData.orgs.map(org => RC.apiFetch(`/api/servers?orgId=${org.id}`).then(r => r.json()))
    );

    const servers = results.flatMap(r => r.servers ?? []);
    section.innerHTML = `<div class="sb-label">Servers (${servers.length})</div>`;

    if (servers.length === 0) {
      section.innerHTML += '<div style="font-size:11px;color:var(--text-muted);padding:4px 0;">No servers yet.</div>';
      return;
    }

    servers.forEach(srv => {
      const div = document.createElement('div');
      div.className = 'server-entry ' + (srv.status?.toLowerCase() === 'online' ? 'online' : 'offline');
      div.innerHTML = `<span class="status-dot"></span><span class="server-name">${escHtml(srv.name)}</span>`;
      section.appendChild(div);
    });
  }

  // ── Machine context ───────────────────────────────────────────────────────────
  // Resolve which machine the machine-level actions target. Priority:
  //   1. already-selected machine for this session
  //   2. the org's default machine
  //   3. the only machine, if exactly one
  //   4. otherwise prompt with a picker modal
  // Returns the machine row { id, slug, name } or null (and toasts on failure).
  async function ensureMachine() {
    if (ctx.machine) return ctx.machine;
    if (!ctx.orgId) { showToast('No organization selected.', 'error'); return null; }

    const res  = await RC.apiFetch(`/api/machines?orgId=${ctx.orgId}`);
    const data = await res.json();
    if (!res.ok) { showToast(data.error || 'Failed to load machines.', 'error'); return null; }

    const machines = data.machines ?? [];
    if (machines.length === 0) {
      showToast('No machines registered for this organization.', 'error');
      return null;
    }

    let chosen = null;
    if (ctx._defaultMachineSlug) chosen = machines.find(m => m.slug === ctx._defaultMachineSlug);
    if (!chosen && machines.length === 1) chosen = machines[0];
    if (!chosen) chosen = await pickMachine(machines);
    if (!chosen) return null;

    ctx.machine = { id: chosen.id, slug: chosen.slug, name: chosen.name };
    if (typeof window.RC_setSelectedMachine === 'function') window.RC_setSelectedMachine(ctx.machine);
    return ctx.machine;
  }

  function pickMachine(machines) {
    return new Promise(resolve => {
      const modal = document.getElementById('machinePickerModal');
      const list  = document.getElementById('machinePickerList');
      if (!modal || !list) { resolve(machines[0]); return; }

      list.innerHTML = '';
      machines.forEach(m => {
        const btn = document.createElement('button');
        btn.className = 'btn btn-ghost';
        btn.style.cssText = 'width:100%;text-align:left;margin-bottom:6px;';
        btn.textContent = `${m.name} (${m.slug})`;
        btn.addEventListener('click', () => { close(m); });
        list.appendChild(btn);
      });

      function close(result) {
        modal.classList.remove('open');
        modal.removeEventListener('click', onBackdrop);
        resolve(result || null);
      }
      function onBackdrop(e) { if (e.target === modal) close(null); }

      modal.addEventListener('click', onBackdrop);
      modal.classList.add('open');
    });
  }

  // ── Relay helper ──────────────────────────────────────────────────────────────
  // POSTs a command to the portal relay and returns the agent's data payload.
  async function relay(machineId, body) {
    const res  = await RC.apiFetch(`/api/agent/${encodeURIComponent(machineId)}/command`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.error || `Request failed (${res.status})`);
    return json.data; // agent response data
  }

  // ── Firewall panel ──────────────────────────────────────────────────────────────
  const fwPanel = () => document.getElementById('firewallPanel');

  async function openFirewall(mode, forceRefresh) {
    const machine = await ensureMachine();
    if (!machine) return;

    const panel = fwPanel();
    if (!panel) { showToast('Firewall panel unavailable.', 'error'); return; }

    document.getElementById('firewallMachineName').textContent = machine.name;
    panel.hidden = false;
    panel.classList.add('open');

    // Toggle the add form depending on the requested mode.
    document.getElementById('firewallAddForm').style.display = (mode === 'add') ? 'block' : 'none';

    await refreshFirewall(forceRefresh !== false);
  }

  function closeFirewall() {
    const panel = fwPanel();
    if (panel) { panel.classList.remove('open'); setTimeout(() => { panel.hidden = true; }, 250); }
  }

  async function refreshFirewall(showFlash) {
    const machine = ctx.machine;
    if (!machine) return;
    const listEl = document.getElementById('firewallRules');
    listEl.innerHTML = '<div style="color:var(--text-muted);font-size:12px;padding:6px 0;">Loading…</div>';

    let rules;
    try {
      const data = await relay(machine.id, { action: 'firewall', firewall: { op: 'list' } });
      rules = Array.isArray(data?.rules) ? data.rules : [];
    } catch (err) {
      listEl.innerHTML = `<div style="color:var(--red-bright);font-size:12px;">${escHtml(err.message)}</div>`;
      return;
    }

    if (!rules.length) {
      listEl.innerHTML = '<div style="color:var(--text-muted);font-size:12px;padding:6px 0;">No Ronin Portier firewall rules.</div>';
    } else {
      listEl.innerHTML = '';
      rules.forEach(rule => listEl.appendChild(renderRuleRow(rule)));
    }
    if (showFlash) showToast('Firewall rules refreshed.', 'success', 1800);
  }

  // One row = name/proto/port + enable toggle + Remove button (the "rule picker").
  function renderRuleRow(rule) {
    const row = document.createElement('div');
    row.className = 'fw-rule';
    const enabled = String(rule.enabled).toLowerCase() === 'true' || rule.enabled === true;
    row.innerHTML =
      `<div class="fw-rule-info">
         <span class="fw-rule-name">${escHtml(rule.name || '(unnamed)')}</span>
         <span class="fw-rule-meta">${escHtml(rule.protocol || '?')} · port ${escHtml(rule.port || '?')}</span>
       </div>`;

    const toggle = document.createElement('button');
    toggle.className = 'btn btn-ghost fw-btn';
    toggle.textContent = enabled ? 'Disable' : 'Enable';
    toggle.addEventListener('click', () => doFirewall('toggle', { name: rule.name, enabled: !enabled }, `Rule ${enabled ? 'disabled' : 'enabled'}.`));

    const remove = document.createElement('button');
    remove.className = 'btn fw-btn fw-btn-danger';
    remove.textContent = 'Remove';
    remove.addEventListener('click', () => {
      if (!confirmInline(remove, 'Confirm?')) return;
      doFirewall('remove', { name: rule.name }, 'Rule removed.');
    });

    const actions = document.createElement('div');
    actions.className = 'fw-rule-actions';
    actions.append(toggle, remove);
    row.appendChild(actions);
    return row;
  }

  // Two-click inline confirm to avoid blocking confirm() dialogs.
  function confirmInline(btn, confirmText) {
    if (btn.dataset.armed === '1') { btn.dataset.armed = '0'; return true; }
    const original = btn.textContent;
    btn.dataset.armed = '1';
    btn.textContent = confirmText;
    setTimeout(() => { if (btn.dataset.armed === '1') { btn.dataset.armed = '0'; btn.textContent = original; } }, 2500);
    return false;
  }

  async function doFirewall(op, rule, successMsg) {
    const machine = ctx.machine;
    if (!machine) return;
    try {
      await relay(machine.id, { action: 'firewall', firewall: { op, rule } });
      showToast(successMsg, 'success', 2200);
      await refreshFirewall(false);
    } catch (err) {
      showToast(err.message || 'Firewall action failed.', 'error');
    }
  }

  async function submitAddRule() {
    const name = document.getElementById('fwName').value.trim();
    const port = document.getElementById('fwPort').value.trim();
    const tcp  = document.getElementById('fwTcp').checked;
    const udp  = document.getElementById('fwUdp').checked;

    if (!name)            { showToast('Rule name is required.', 'error'); return; }
    if (!/^\d{1,5}$/.test(port) || +port < 1 || +port > 65535) { showToast('Port must be 1–65535.', 'error'); return; }
    if (!tcp && !udp)     { showToast('Select TCP, UDP, or both.', 'error'); return; }

    const btn = document.getElementById('fwAddBtn');
    btn.disabled = true; btn.textContent = 'Adding…';
    try {
      await relay(ctx.machine.id, { action: 'firewall', firewall: { op: 'add', rule: { displayName: name, port: +port, tcp, udp } } });
      showToast('Firewall rule added.', 'success', 2200);
      document.getElementById('fwName').value = '';
      document.getElementById('fwPort').value = '';
      await refreshFirewall(false);
    } catch (err) {
      showToast(err.message || 'Failed to add rule.', 'error');
    } finally {
      btn.disabled = false; btn.textContent = 'Add Rule';
    }
  }

  // ── RSM status / restart relays ─────────────────────────────────────────────────
  async function rsmStatus() {
    const machine = await ensureMachine();
    if (!machine) return;
    try {
      const data = await relay(machine.id, { action: 'system', system: { op: 'status' } });
      showToast(`RSM ${data.version ?? '?'} · ${data.online ?? 0}/${data.servers ?? 0} servers online (${data.platform ?? '?'}).`, 'info', 6000);
    } catch (err) {
      showToast(err.message || 'Failed to get RSM status.', 'error');
    }
  }

  async function rsmRestart() {
    const machine = await ensureMachine();
    if (!machine) throw new Error('No machine selected.');
    const data = await relay(machine.id, { action: 'system', system: { op: 'restart' } });
    showToast(data.message || 'RSM is restarting…', 'success', 5000);
  }

  // ── Live console ─────────────────────────────────────────────────────────────
  async function openConsole() {
    const machine = await ensureMachine();
    if (!machine) return;
    if (typeof window.RC_openConsole !== 'function') { showToast('Console unavailable.', 'error'); return; }
    window.RC_openConsole(machine.id, machine.name);
  }

  // Expose the controller for spiderweb.js's action dispatcher.
  window.RC_dashboard = { ensureMachine, openFirewall, closeFirewall, refreshFirewall, rsmStatus, rsmRestart, openConsole };

  // ── Change-password modal ──────────────────────────────────────────────────────
  function closeModal(id) { document.getElementById(id)?.classList.remove('open'); }

  async function changePassword() {
    const current = document.getElementById('pwdCurrent').value;
    const newPwd  = document.getElementById('pwdNew').value;
    const confirm = document.getElementById('pwdConfirm').value;
    const errEl   = document.getElementById('pwdModalError');
    const btn     = document.getElementById('pwdSaveBtn');

    errEl.classList.remove('visible');

    if (!current || !newPwd || !confirm) { errEl.textContent = 'All fields are required.'; errEl.classList.add('visible'); return; }
    if (newPwd !== confirm)              { errEl.textContent = 'New passwords do not match.'; errEl.classList.add('visible'); return; }
    if (newPwd.length < 8)               { errEl.textContent = 'New password must be at least 8 characters.'; errEl.classList.add('visible'); return; }

    btn.disabled = true; btn.textContent = 'Saving…';

    const res  = await RC.apiFetch('/api/users/password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword: current, newPassword: newPwd }),
    });
    const data = await res.json();

    btn.disabled = false; btn.textContent = 'Save Password';

    if (!res.ok) { errEl.textContent = data.error ?? 'Failed to update password.'; errEl.classList.add('visible'); return; }

    closeModal('changePasswordModal');
    ['pwdCurrent', 'pwdNew', 'pwdConfirm'].forEach(id => { document.getElementById(id).value = ''; });
    showToast('Password updated. Other sessions have been signed out.', 'success');
  }

  // ── DOM wiring ─────────────────────────────────────────────────────────────────
  document.getElementById('pwdSaveBtn')?.addEventListener('click', changePassword);
  document.getElementById('pwdCancelBtn')?.addEventListener('click', () => closeModal('changePasswordModal'));
  ['pwdCurrent', 'pwdNew', 'pwdConfirm'].forEach(id => {
    document.getElementById(id)?.addEventListener('keydown', e => { if (e.key === 'Enter') changePassword(); });
  });
  document.getElementById('changePasswordModal')?.addEventListener('click', function (e) {
    if (e.target === this) closeModal('changePasswordModal');
  });

  document.getElementById('firewallClose')?.addEventListener('click', closeFirewall);
  document.getElementById('firewallRefresh')?.addEventListener('click', () => refreshFirewall(true));
  document.getElementById('firewallAddToggle')?.addEventListener('click', () => {
    const form = document.getElementById('firewallAddForm');
    form.style.display = form.style.display === 'none' ? 'block' : 'none';
  });
  document.getElementById('fwAddBtn')?.addEventListener('click', submitAddRule);
}());
