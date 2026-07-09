// console.js — SSE console stream consumer for Ronin Citadel.
//
// Uses fetch() + ReadableStream rather than the native EventSource so the
// in-memory access token can be sent as a normal `Authorization: Bearer` header
// (via RC.apiFetch, which also refreshes on 401). This keeps the token out of
// the URL/query string — EventSource cannot set headers, which is why the legacy
// ?token= fallback existed. No token ever lands in access logs or history here.
//
// Backend stream: GET /api/agent/:machineId/stream — emits default `data:` frames
// of JSON { type: 'console_output' | 'status_update' | 'perf_update' | 'connected'
// | 'agent_connected' | 'agent_disconnected', ... }.
//
// Public API: window.RC_openConsole(machineId, label), window.RC_closeConsole().

(function () {
  'use strict';

  const panel    = document.getElementById('consolePanel');
  const output   = document.getElementById('consoleOutput');
  const title    = document.getElementById('consolePanelTitle');
  const filter   = document.getElementById('consoleFilter');
  const closeBtn = document.getElementById('consoleClose');

  if (!panel) return; // page has no console panel

  let _abort      = null;   // AbortController for the active stream
  let _machineId  = null;
  let _closed     = true;
  let _filter     = 'all';
  let _autoScroll = true;
  let _retry      = 1000;   // reconnect backoff (ms), capped
  const _buffer   = [];     // { text, level }
  const MAX_LINES = 2000;

  // ── Open / close ──────────────────────────────────────────────────────────
  function openConsole(machineId, label) {
    _machineId = machineId;
    _closed    = false;
    _retry     = 1000;
    title.textContent = `Console — ${label || machineId}`;
    panel.hidden = false;
    panel.classList.add('open');
    _buffer.length = 0;
    output.textContent = '';
    _connect();
  }

  function closeConsole() {
    _closed = true;
    panel.classList.remove('open');
    if (_abort) { try { _abort.abort(); } catch {} _abort = null; }
    setTimeout(() => { if (_closed) panel.hidden = true; }, 300);
  }

  // ── Streaming connection ────────────────────────────────────────────────────
  async function _connect() {
    if (_closed || !_machineId) return;
    _abort = new AbortController();

    let res;
    try {
      res = await RC.apiFetch(`/api/agent/${encodeURIComponent(_machineId)}/stream`, {
        headers: { Accept: 'text/event-stream' },
        signal: _abort.signal,
      });
    } catch {
      return _scheduleReconnect();
    }

    if (!res || !res.ok || !res.body) {
      _appendLine(`[console unavailable: ${res ? 'HTTP ' + res.status : 'network error'}]`, 'error');
      return _scheduleReconnect();
    }

    _retry = 1000; // healthy connection — reset backoff
    const reader  = res.body.getReader();
    const decoder = new TextDecoder();
    let bufferStr = '';

    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        bufferStr += decoder.decode(value, { stream: true });

        // SSE frames are separated by a blank line.
        let sep;
        while ((sep = bufferStr.indexOf('\n\n')) !== -1) {
          const frame = bufferStr.slice(0, sep);
          bufferStr = bufferStr.slice(sep + 2);
          _handleFrame(frame);
        }
      }
    } catch {
      // aborted or network drop — fall through to reconnect
    }

    if (!_closed) _scheduleReconnect();
  }

  function _scheduleReconnect() {
    if (_closed) return;
    _appendLine(`[connection lost — reconnecting in ${Math.round(_retry / 1000)}s…]`, 'warn');
    setTimeout(() => {
      _retry = Math.min(_retry * 2, 30000);
      _connect();
    }, _retry);
  }

  // ── Frame parsing ───────────────────────────────────────────────────────────
  function _handleFrame(frame) {
    // A frame may contain comment lines (": ka") and one or more data: lines.
    const dataLines = frame.split('\n')
      .filter(l => l.startsWith('data:'))
      .map(l => l.slice(5).trimStart());
    if (!dataLines.length) return;

    let msg;
    try { msg = JSON.parse(dataLines.join('\n')); } catch { return; }

    switch (msg.type) {
      case 'console_output':
        _handleLine(msg.line ?? msg.data ?? '');
        break;
      case 'connected':
        _appendLine(`[connected — agent ${msg.agentOnline ? 'online' : 'offline'}]`, 'info');
        break;
      case 'agent_connected':
        _appendLine('[agent connected]', 'info');
        break;
      case 'agent_disconnected':
        _appendLine('[agent disconnected]', 'warn');
        break;
      // status_update / perf_update are surfaced elsewhere (sidebar) — ignore here.
      default:
        break;
    }
  }

  // ── Rendering ────────────────────────────────────────────────────────────────
  function _handleLine(rawText) {
    String(rawText).split('\n').forEach(line => {
      if (line === '') return;
      const level = _classify(line);
      _buffer.push({ text: line, level });
      if (_buffer.length > MAX_LINES) _buffer.shift();
      if (_filter === 'all' || level === _filter) _appendLine(line, level);
    });
  }

  function _appendLine(text, level) {
    const span = document.createElement('span');
    span.textContent = text + '\n';
    span.className   = `log-line log-${level}`;
    output.appendChild(span);
    while (output.childNodes.length > MAX_LINES) output.removeChild(output.firstChild);
    if (_autoScroll) output.scrollTop = output.scrollHeight;
  }

  function _classify(text) {
    const t = text.toLowerCase();
    if (t.includes('error') || t.includes('exception') || t.includes('fatal')) return 'error';
    if (t.includes('warn')) return 'warn';
    return 'info';
  }

  function _redraw() {
    output.textContent = '';
    _buffer
      .filter(e => _filter === 'all' || e.level === _filter)
      .forEach(e => _appendLine(e.text, e.level));
  }

  // ── Events ────────────────────────────────────────────────────────────────
  closeBtn?.addEventListener('click', closeConsole);

  filter?.addEventListener('change', () => { _filter = filter.value; _redraw(); });

  output?.addEventListener('scroll', () => {
    _autoScroll = output.scrollHeight - output.scrollTop <= output.clientHeight + 32;
  });

  // ── Expose ──────────────────────────────────────────────────────────────────
  window.RC_openConsole  = openConsole;
  window.RC_closeConsole = closeConsole;
}());
