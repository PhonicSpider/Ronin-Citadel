// ── Ronin Citadel — staff dashboard charts ───────────────────────────────────
// Small hand-written SVG charts, no library. Follows the data-viz rules the
// dashboard was designed against:
//   - one hue for one series; a second hue only when two series are compared
//   - thin marks (bars <= 24px with a 4px rounded end, 2px lines, >= 8px markers),
//     hairline solid grid, 2px surface gap between bars and ring on end dots
//   - a legend whenever there are two series, direct labels used sparingly
//   - text never wears the series colour
//   - hover shows exact values (crosshair on time series, per-bar on bars); the same
//     readout appears on keyboard focus (arrow keys move through the points)
//   - every chart has a table twin, so no value depends on hovering
// Colours come from CSS custom properties (css/staff-charts.css), validated for the
// dark card surface: series 1/2 pass the CVD and contrast checks; the ordinal ramps
// pass the monotone-lightness check. Labels are inserted with textContent only.
(function () {
  'use strict';

  var NS = 'http://www.w3.org/2000/svg';

  // ── helpers ────────────────────────────────────────────────────────────────
  function svgEl(name, attrs) {
    var e = document.createElementNS(NS, name);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === 'text') e.textContent = attrs[k]; else e.setAttribute(k, attrs[k]);
    });
    return e;
  }
  function htmlEl(name, cls, text) {
    var e = document.createElement(name);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  // 1284 -> "1,284", 12900 -> "12.9K", 4200000 -> "4.2M"
  function compact(n) {
    if (n == null) return '';
    var a = Math.abs(n);
    if (a >= 1e6) return (n / 1e6).toFixed(a >= 1e7 ? 0 : 1).replace(/\.0$/, '') + 'M';
    if (a >= 1e4) return (n / 1e3).toFixed(a >= 1e5 ? 0 : 1).replace(/\.0$/, '') + 'K';
    return Math.round(n).toLocaleString();
  }
  function full(n) { return n == null ? 'no data' : Math.round(n).toLocaleString(); }

  // Round the top of an axis to 1, 2 or 5 x 10^k and return ~4 ticks.
  function niceScale(max) {
    if (!(max > 0)) return { max: 4, ticks: [0, 1, 2, 3, 4] };
    var raw = max / 4, pow = Math.pow(10, Math.floor(Math.log10(raw))), n = raw / pow;
    var step = (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * pow;
    if (step < 1) step = 1;
    var top = Math.ceil(max / step) * step, ticks = [];
    for (var v = 0; v <= top + 1e-9; v += step) ticks.push(v);
    return { max: top, ticks: ticks };
  }

  function shortDay(ymd) {
    var d = new Date(ymd + 'T00:00:00Z');
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', timeZone: 'UTC' });
  }
  function longDay(ymd) {
    var d = new Date(ymd + 'T00:00:00Z');
    return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
  }

  // One shared tooltip. rows: [{ key: cssColour|null, name, value }]
  var tipEl = null;
  function tip() {
    if (!tipEl) {
      tipEl = htmlEl('div', 'sc-tip');
      tipEl.setAttribute('role', 'status');
      tipEl.hidden = true;
      document.body.appendChild(tipEl);
    }
    return tipEl;
  }
  function showTip(title, rows, x, y) {
    var t = tip();
    t.textContent = '';
    if (title) t.appendChild(htmlEl('div', 'sc-tip-title', title));
    rows.forEach(function (r) {
      var row = htmlEl('div', 'sc-tip-row');
      if (r.key) { var k = htmlEl('span', 'sc-tip-key'); k.style.background = r.key; row.appendChild(k); }
      row.appendChild(htmlEl('span', 'sc-tip-value', r.value));
      row.appendChild(htmlEl('span', 'sc-tip-name', r.name));
      t.appendChild(row);
    });
    t.hidden = false;
    var w = t.offsetWidth, h = t.offsetHeight;
    var left = Math.min(Math.max(8, x + 14), window.innerWidth - w - 8);
    var top = y - h - 14 < 8 ? y + 18 : y - h - 14;
    t.style.left = left + 'px';
    t.style.top = top + 'px';
  }
  function hideTip() { if (tipEl) tipEl.hidden = true; }

  // Rectangle with a rounded top (4px) and square base, for columns.
  function columnPath(x, y, w, h, r) {
    r = Math.min(r, w / 2, h);
    return 'M' + x + ',' + (y + h) + 'V' + (y + r) + 'Q' + x + ',' + y + ' ' + (x + r) + ',' + y +
      'H' + (x + w - r) + 'Q' + (x + w) + ',' + y + ' ' + (x + w) + ',' + (y + r) + 'V' + (y + h) + 'Z';
  }
  // Horizontal bar: rounded right end, square at the baseline (left).
  function barPath(x, y, w, h, r) {
    r = Math.min(r, h / 2, w);
    return 'M' + x + ',' + y + 'H' + (x + w - r) + 'Q' + (x + w) + ',' + y + ' ' + (x + w) + ',' + (y + r) +
      'V' + (y + h - r) + 'Q' + (x + w) + ',' + (y + h) + ' ' + (x + w - r) + ',' + (y + h) + 'H' + x + 'Z';
  }

  // Redraw on resize. draw(width) rebuilds the svg. Charts are usually built
  // before they are attached to the page (no width yet), so the caller finishes
  // with StaffCharts.flush() once everything is in the document; the
  // ResizeObserver then only has to handle later resizes.
  var live = [];
  function responsive(container, draw) {
    var last = 0;
    function run() {
      var w = Math.floor(container.clientWidth);
      if (w < 120 || w === last) return;
      last = w;
      draw(w);
    }
    if (typeof ResizeObserver !== 'undefined') new ResizeObserver(run).observe(container);
    var handle = { redraw: function () { last = 0; run(); } };
    live.push({ container: container, handle: handle });
    run();
    return handle;
  }
  function flush() {
    live = live.filter(function (x) { return x.container.isConnected; });
    live.forEach(function (x) { x.handle.redraw(); });
  }

  // ── table twin ──────────────────────────────────────────────────────────────
  function table(host, columns, rows) {
    host.textContent = '';
    var d = htmlEl('details', 'sc-table');
    d.appendChild(htmlEl('summary', null, 'View as table'));
    var wrap = htmlEl('div', 'sc-table-wrap');
    var t = htmlEl('table');
    var tr = htmlEl('tr');
    columns.forEach(function (c) { var th = htmlEl('th', null, c); th.scope = 'col'; tr.appendChild(th); });
    var thead = htmlEl('thead'); thead.appendChild(tr); t.appendChild(thead);
    var tb = htmlEl('tbody');
    rows.forEach(function (r) {
      var row = htmlEl('tr');
      r.forEach(function (cell) { row.appendChild(htmlEl('td', null, cell == null ? 'no data' : String(cell))); });
      tb.appendChild(row);
    });
    t.appendChild(tb); wrap.appendChild(t); d.appendChild(wrap); host.appendChild(d);
  }

  // ── time series: columns (one series) ──────────────────────────────────────
  // cfg: { labels:['2026-10-01',...], values:[n|null,...], name:'New users', color:'var(--sc-series-1)', ariaLabel }
  function columns(host, cfg) {
    host.textContent = '';
    var plot = htmlEl('div', 'sc-plot'), twin = htmlEl('div');
    host.append(plot, twin);
    table(twin, ['Day', cfg.name], cfg.labels.map(function (l, i) { return [longDay(l), cfg.values[i] == null ? null : full(cfg.values[i])]; }));
    var active = -1;

    return responsive(plot, function (W) {
      plot.textContent = '';
      var H = 210, m = { t: 12, r: 12, b: 28, l: 40 };
      var iw = W - m.l - m.r, ih = H - m.t - m.b, n = cfg.labels.length;
      var vals = cfg.values.map(function (v) { return v == null ? 0 : v; });
      var sc = niceScale(Math.max.apply(null, vals));
      var band = iw / n, bw = Math.min(24, Math.max(2, band - 2));
      var svg = svgEl('svg', { viewBox: '0 0 ' + W + ' ' + H, width: W, height: H, role: 'img', tabindex: 0, 'aria-label': cfg.ariaLabel });
      svg.classList.add('sc-svg');

      sc.ticks.forEach(function (t) {
        var y = m.t + ih - (t / sc.max) * ih;
        svg.appendChild(svgEl('line', { x1: m.l, x2: W - m.r, y1: y, y2: y, class: t === 0 ? 'sc-axis' : 'sc-grid' }));
        svg.appendChild(svgEl('text', { x: m.l - 8, y: y + 4, class: 'sc-tick', 'text-anchor': 'end', text: compact(t) }));
      });
      var every = Math.ceil(n / Math.max(2, Math.floor(iw / 70)));
      cfg.labels.forEach(function (l, i) {
        if (i % every !== 0 && i !== n - 1) return;
        if (i === n - 1 && (n - 1) % every !== 0 && (n - 1) % every < every / 2) return;
        svg.appendChild(svgEl('text', { x: m.l + band * i + band / 2, y: H - 8, class: 'sc-tick', 'text-anchor': 'middle', text: shortDay(l) }));
      });

      var marks = [];
      cfg.values.forEach(function (v, i) {
        var h = v ? Math.max(2, (v / sc.max) * ih) : 0;
        var x = m.l + band * i + (band - bw) / 2;
        var p = svgEl('path', { d: v ? columnPath(x, m.t + ih - h, bw, h, 4) : '', class: 'sc-mark', style: 'fill:' + cfg.color });
        svg.appendChild(p); marks.push(p);
      });

      function focusAt(i, cx, cy) {
        active = i;
        marks.forEach(function (p, j) { p.classList.toggle('is-active', j === i); });
        showTip(longDay(cfg.labels[i]), [{ key: cfg.color, name: cfg.name, value: full(cfg.values[i]) }], cx, cy);
      }
      var hit = svgEl('rect', { x: m.l, y: m.t, width: iw, height: ih, fill: 'transparent' });
      hit.addEventListener('pointermove', function (e) {
        var r = svg.getBoundingClientRect(), i = Math.min(n - 1, Math.max(0, Math.floor((e.clientX - r.left - m.l) / band)));
        focusAt(i, e.clientX, e.clientY);
      });
      hit.addEventListener('pointerleave', function () { hideTip(); marks.forEach(function (p) { p.classList.remove('is-active'); }); });
      svg.appendChild(hit);
      svg.addEventListener('keydown', function (e) {
        if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
        e.preventDefault();
        var i = active < 0 ? n - 1 : Math.min(n - 1, Math.max(0, active + (e.key === 'ArrowRight' ? 1 : -1)));
        var r = svg.getBoundingClientRect();
        focusAt(i, r.left + m.l + band * i + band / 2, r.top + m.t);
      });
      svg.addEventListener('blur', hideTip);
      plot.appendChild(svg);
    });
  }

  // ── time series: lines (one or more series) ────────────────────────────────
  // cfg: { labels, series:[{name,color,values}], ariaLabel }
  function lines(host, cfg) {
    host.textContent = '';
    var many = cfg.series.length > 1;
    if (many) {
      var legend = htmlEl('div', 'sc-legend');
      cfg.series.forEach(function (s) {
        var item = htmlEl('span', 'sc-legend-item');
        var k = htmlEl('span', 'sc-legend-key'); k.style.background = s.color;
        item.append(k, htmlEl('span', null, s.name));
        legend.appendChild(item);
      });
      host.appendChild(legend);
    }
    var plot = htmlEl('div', 'sc-plot'), twin = htmlEl('div');
    host.append(plot, twin);
    table(twin, ['Day'].concat(cfg.series.map(function (s) { return s.name; })),
      cfg.labels.map(function (l, i) { return [longDay(l)].concat(cfg.series.map(function (s) { return s.values[i] == null ? null : full(s.values[i]); })); }));
    var active = -1;

    return responsive(plot, function (W) {
      plot.textContent = '';
      var H = 210, m = { t: 14, r: many ? 14 : 18, b: 28, l: 40 };
      var iw = W - m.l - m.r, ih = H - m.t - m.b, n = cfg.labels.length;
      var all = [];
      cfg.series.forEach(function (s) { s.values.forEach(function (v) { if (v != null) all.push(v); }); });
      var sc = niceScale(all.length ? Math.max.apply(null, all) : 0);
      var X = function (i) { return m.l + (n === 1 ? iw / 2 : (i / (n - 1)) * iw); };
      var Y = function (v) { return m.t + ih - (v / sc.max) * ih; };

      var svg = svgEl('svg', { viewBox: '0 0 ' + W + ' ' + H, width: W, height: H, role: 'img', tabindex: 0, 'aria-label': cfg.ariaLabel });
      svg.classList.add('sc-svg');
      sc.ticks.forEach(function (t) {
        svg.appendChild(svgEl('line', { x1: m.l, x2: W - m.r, y1: Y(t), y2: Y(t), class: t === 0 ? 'sc-axis' : 'sc-grid' }));
        svg.appendChild(svgEl('text', { x: m.l - 8, y: Y(t) + 4, class: 'sc-tick', 'text-anchor': 'end', text: compact(t) }));
      });
      var every = Math.ceil(n / Math.max(2, Math.floor(iw / 70)));
      cfg.labels.forEach(function (l, i) {
        if (i % every !== 0) return;
        svg.appendChild(svgEl('text', { x: X(i), y: H - 8, class: 'sc-tick', 'text-anchor': i === 0 ? 'start' : 'middle', text: shortDay(l) }));
      });

      cfg.series.forEach(function (s) {
        // A gap (null) breaks the line; it is never drawn as zero.
        var d = '', pen = false, last = -1;
        s.values.forEach(function (v, i) {
          if (v == null) { pen = false; return; }
          d += (pen ? 'L' : 'M') + X(i).toFixed(1) + ',' + Y(v).toFixed(1); pen = true; last = i;
        });
        if (!many && d) {
          var first = s.values.findIndex(function (v) { return v != null; });
          svg.appendChild(svgEl('path', { d: d + 'L' + X(last) + ',' + (m.t + ih) + 'L' + X(first) + ',' + (m.t + ih) + 'Z', class: 'sc-area', style: 'fill:' + s.color }));
        }
        svg.appendChild(svgEl('path', { d: d, class: 'sc-line', style: 'stroke:' + s.color }));
        if (last >= 0) {
          svg.appendChild(svgEl('circle', { cx: X(last), cy: Y(s.values[last]), r: 6, class: 'sc-ring' }));
          svg.appendChild(svgEl('circle', { cx: X(last), cy: Y(s.values[last]), r: 4, style: 'fill:' + s.color }));
        }
      });

      var cross = svgEl('line', { y1: m.t, y2: m.t + ih, class: 'sc-cross' });
      cross.style.display = 'none';
      svg.appendChild(cross);
      var dots = cfg.series.map(function (s) {
        var c = svgEl('circle', { r: 4, class: 'sc-dot', style: 'fill:' + s.color });
        c.style.display = 'none'; svg.appendChild(c); return c;
      });

      function focusAt(i, cx, cy) {
        active = i;
        cross.setAttribute('x1', X(i)); cross.setAttribute('x2', X(i)); cross.style.display = '';
        var rows = [];
        cfg.series.forEach(function (s, k) {
          var v = s.values[i];
          if (v == null) { dots[k].style.display = 'none'; } else { dots[k].setAttribute('cx', X(i)); dots[k].setAttribute('cy', Y(v)); dots[k].style.display = ''; }
          rows.push({ key: s.color, name: s.name, value: full(v) });
        });
        showTip(longDay(cfg.labels[i]), rows, cx, cy);
      }
      function clear() { hideTip(); cross.style.display = 'none'; dots.forEach(function (c) { c.style.display = 'none'; }); }

      var hit = svgEl('rect', { x: m.l, y: m.t, width: iw, height: ih, fill: 'transparent' });
      hit.addEventListener('pointermove', function (e) {
        var r = svg.getBoundingClientRect(), rel = (e.clientX - r.left - m.l) / iw;
        focusAt(Math.min(n - 1, Math.max(0, Math.round(rel * (n - 1)))), e.clientX, e.clientY);
      });
      hit.addEventListener('pointerleave', clear);
      svg.appendChild(hit);
      svg.addEventListener('keydown', function (e) {
        if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
        e.preventDefault();
        var i = active < 0 ? n - 1 : Math.min(n - 1, Math.max(0, active + (e.key === 'ArrowRight' ? 1 : -1)));
        var r = svg.getBoundingClientRect();
        focusAt(i, r.left + X(i), r.top + m.t);
      });
      svg.addEventListener('blur', clear);
      plot.appendChild(svg);
    });
  }

  // ── horizontal bars ─────────────────────────────────────────────────────────
  // cfg: { items:[{label,value|null}], colors:['var(--sc-ord-1)',...] | color, unit:'users', ariaLabel, hiddenText:'fewer than 5' }
  function hbars(host, cfg) {
    host.textContent = '';
    var plot = htmlEl('div', 'sc-plot'), twin = htmlEl('div');
    host.append(plot, twin);
    table(twin, ['', cfg.unit || 'Count'], cfg.items.map(function (it) { return [it.label, it.value == null ? (cfg.hiddenText || 'hidden') : full(it.value)]; }));

    return responsive(plot, function (W) {
      plot.textContent = '';
      var rowH = 34, H = cfg.items.length * rowH + 4;
      var labelW = Math.min(150, Math.max(90, W * 0.3)), valW = 56;
      var iw = W - labelW - valW - 8;
      var max = Math.max.apply(null, cfg.items.map(function (i) { return i.value || 0; }).concat([1]));
      var svg = svgEl('svg', { viewBox: '0 0 ' + W + ' ' + H, width: W, height: H, role: 'img', 'aria-label': cfg.ariaLabel });
      svg.classList.add('sc-svg');
      svg.appendChild(svgEl('line', { x1: labelW, x2: labelW, y1: 0, y2: H, class: 'sc-axis' }));

      cfg.items.forEach(function (it, i) {
        var y = i * rowH + 4, bh = 20;
        var label = it.label.length > 22 ? it.label.slice(0, 21) + '…' : it.label;
        var lab = svgEl('text', { x: labelW - 10, y: y + bh / 2 + 4, class: 'sc-tick sc-label', 'text-anchor': 'end', text: label });
        svg.appendChild(lab);
        var color = (cfg.colors && cfg.colors[i]) || cfg.color;
        var w = it.value ? Math.max(2, (it.value / max) * iw) : 0;
        var bar = svgEl('path', { d: w ? barPath(labelW + 1, y, w, bh, 4) : '', class: 'sc-mark', style: 'fill:' + color });
        svg.appendChild(bar);
        svg.appendChild(svgEl('text', {
          x: labelW + 1 + w + 8, y: y + bh / 2 + 4, class: 'sc-value',
          text: it.value == null ? '<' + 5 : compact(it.value),
        }));
        var hit = svgEl('rect', { x: 0, y: i * rowH, width: W, height: rowH, fill: 'transparent' });
        hit.addEventListener('pointermove', function (e) {
          bar.classList.add('is-active');
          showTip(it.label, [{ key: it.value == null ? null : color, name: cfg.unit || 'count', value: it.value == null ? (cfg.hiddenText || 'hidden') : full(it.value) }], e.clientX, e.clientY);
        });
        hit.addEventListener('pointerleave', function () { bar.classList.remove('is-active'); hideTip(); });
        svg.appendChild(hit);
      });
      plot.appendChild(svg);
    });
  }

  // ── small pieces ────────────────────────────────────────────────────────────
  // 12-point trend for a stat tile (de-emphasis line, current point in the accent).
  function sparkline(values) {
    var pts = values.filter(function (v) { return v != null; });
    var svg = svgEl('svg', { viewBox: '0 0 96 28', width: 96, height: 28, 'aria-hidden': 'true', class: 'sc-spark' });
    if (pts.length < 2) return svg;
    var max = Math.max.apply(null, pts), min = Math.min.apply(null, pts), span = max - min || 1;
    var d = pts.map(function (v, i) { return (i ? 'L' : 'M') + (2 + (i / (pts.length - 1)) * 92).toFixed(1) + ',' + (24 - ((v - min) / span) * 20).toFixed(1); }).join('');
    svg.appendChild(svgEl('path', { d: d, class: 'sc-spark-line' }));
    var lastV = pts[pts.length - 1];
    svg.appendChild(svgEl('circle', { cx: 94, cy: (24 - ((lastV - min) / span) * 20).toFixed(1), r: 3, class: 'sc-spark-now' }));
    return svg;
  }

  // Sum a daily series down to ~12 points for a sparkline.
  function bucket(values, parts) {
    var n = values.length, size = Math.max(1, Math.ceil(n / parts)), out = [];
    for (var i = 0; i < n; i += size) {
      var slice = values.slice(i, i + size).filter(function (v) { return v != null; });
      out.push(slice.length ? slice.reduce(function (a, b) { return a + b; }, 0) : null);
    }
    return out;
  }

  window.StaffCharts = { flush: flush, columns: columns, lines: lines, hbars: hbars, sparkline: sparkline, bucket: bucket, compact: compact, full: full, shortDay: shortDay };
})();
