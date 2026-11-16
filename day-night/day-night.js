/*! DAY & NIGHT EXPERIENCE v1.3.0 · modalidade: cinematic · módulos: core, globe, clouds · gerado em 15/11/2026
 * Desenvolvimento: Eliseu Fernandes Laurindo · https://eliseuangelos.github.io/ */
(function (root) {
  'use strict';
  var DN = { v: "1.3.0", D: {"mode":"cinematic","attribute":"data-theme","themes":{"light":"light","dark":"dark"},"persistence":true,"storageKey":"dn-theme","respectSystem":true,"animation":true,"label":"Modo escuro","button":{"size":44,"position":"inline","offset":16},"speed":"normal","rotation":true,"clouds":true} };

  /* módulo: core */
  (function (DN, root) {
/* núcleo: configuração validada, tema, persistência, botão e ciclo de vida. Sem CSS e sem gráficos. */
var SPEED = { slow: 4200, normal: 2800, fast: 1600 }, POS = ['inline', 'top-right', 'top-left', 'bottom-right', 'bottom-left'], live = [],
  ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><g class="dn-sun"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.4M12 19.1v2.4M2.5 12h2.4M19.1 12h2.4M5.3 5.3L7 7M17 17l1.7 1.7M5.3 18.7L7 17M17 7l1.7-1.7" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"/></g><path class="dn-moon" d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>';

function num(v, min, max, d) { v = +v; return v >= min && v <= max ? v : d; }

function configure(opt) { // padrões embutidos na versão gerada + opções de init, validados
  var D = DN.D, o = Object.assign({}, D, opt), b = Object.assign({}, D.button, opt && opt.button), t = Object.assign({}, D.themes, opt && opt.themes);
  if (opt && opt.size != null) b.size = opt.size; // compatível com a API 1.x
  if (opt && opt.position) b.position = opt.position;
  b.size = num(b.size, 24, 128, D.button.size); b.offset = num(b.offset, 0, 96, D.button.offset);
  if (POS.indexOf(b.position) < 0) b.position = D.button.position;
  t.light = String(t.light || 'light'); t.dark = String(t.dark || 'dark');
  if (!SPEED[o.speed] && !(+o.speed > 0)) o.speed = D.speed;
  if (!/^[A-Za-z_][\w:.-]*$/.test(o.attribute)) o.attribute = D.attribute;
  if (opt && opt.mode === 'cinematic' && !DN.fx) console.warn('[DayNight] este arquivo foi gerado sem o efeito da Terra; usando o modo botão.');
  o.mode = o.mode === 'cinematic' && DN.fx ? 'cinematic' : 'button';
  o.button = b; o.themes = t; o.persistence = o.persistence !== false; o.animation = o.animation !== false;
  return o;
}

function init(opt) {
  var o = configure(opt), b = o.button, D = DN.D, mq = matchMedia('(prefers-color-scheme: dark)'), rm = matchMedia('(prefers-reduced-motion: reduce)'),
    scope = o.root || null, btn, theme, busy, dead, stopFx, inst, i;
  for (i = 0; i < live.length; i++) if (live[i].scope === scope) { console.warn('[DayNight] já inicializado neste escopo; use destroy() antes de iniciar de novo.'); return live[i].inst; }

  function read() { if (!o.persistence) return null; try { var v = localStorage.getItem(o.storageKey); return v === 'dark' || v === 'light' ? v : null; } catch (e) { return null; } }
  function write(v) { if (!o.persistence) return; try { v ? localStorage.setItem(o.storageKey, v) : localStorage.removeItem(o.storageKey); } catch (e) {} }
  function commit(t) {
    var el = scope || document.documentElement;
    theme = t;
    if (o.apply) o.apply(t);
    else if (o.attribute === 'class') el.classList.toggle(o.themes.dark, t === 'dark');
    else { el.setAttribute(o.attribute, o.themes[t]); el.style.colorScheme = t; }
    if (btn) btn.setAttribute('aria-checked', t === 'dark');
  }
  function announce(t) {
    document.dispatchEvent(new CustomEvent('daynight:change', { detail: { theme: t, saved: !!read() } }));
    if (o.onChange) o.onChange(t, inst);
  }
  function set(t, s) {
    s = s || {};
    if (dead || busy || t === theme || (t !== 'dark' && t !== 'light')) return;
    if (s.persist !== false) write(t);
    if (o.mode === 'cinematic' && o.animation && s.animate !== false && !rm.matches) {
      busy = true;
      stopFx = DN.fx.play(t, SPEED[o.speed] || +o.speed, function () { commit(t); }, function () { busy = false; stopFx = null; announce(t); }, { root: scope, cfg: o });
    } else { commit(t); announce(t); }
  }
  function toggle() { set(theme === 'dark' ? 'light' : 'dark'); }
  function sys() { return mq.matches ? 'dark' : 'light'; }
  function onSys() { if (!read() && o.respectSystem) set(sys(), { persist: false, animate: false }); }
  function mount() {
    if (dead) return;
    var host = typeof o.target === 'string' ? document.querySelector(o.target) : o.target;
    btn = document.createElement('button'); btn.type = 'button'; btn.className = 'dn-btn';
    btn.setAttribute('role', 'switch'); btn.setAttribute('aria-label', o.label); btn.setAttribute('aria-checked', theme === 'dark'); btn.innerHTML = ICON;
    if (b.size !== D.button.size) btn.style.setProperty('--dn-size', b.size + 'px'); // inline só para valores dinâmicos
    if (b.offset !== D.button.offset) btn.style.setProperty('--dn-offset', b.offset + 'px');
    if (scope) btn.classList.add('dn-scoped');
    if (!host && b.position !== 'inline') btn.classList.add('dn-fixed', 'dn-' + b.position);
    (host || scope || document.body).appendChild(btn);
    btn.addEventListener('click', toggle);
  }

  commit(o.theme === 'dark' || o.theme === 'light' ? o.theme : read() || (o.respectSystem && mq.matches ? 'dark' : 'light'));
  if (document.body) mount(); else document.addEventListener('DOMContentLoaded', mount);
  if (mq.addEventListener) mq.addEventListener('change', onSys);
  if (o.mode === 'cinematic') (root.requestIdleCallback || setTimeout)(function () { if (!dead) DN.fx.prewarm(scope); });
  inst = {
    get: function () { return theme; }, set: set, toggle: toggle, saved: function () { return !!read(); },
    clear: function () { write(null); announce(theme); if (o.respectSystem) set(sys(), { persist: false }); },
    setSpeed: function (v) { if (SPEED[v] || +v > 0) o.speed = v; }, setAnimation: function (v) { o.animation = !!v; },
    button: function () { return btn; },
    config: function () { var r = {}, k; for (k in o) if (typeof o[k] !== 'function' && !(o[k] && o[k].nodeType)) r[k] = o[k]; return r; },
    destroy: function () {
      dead = true; busy = false; if (stopFx) stopFx(); if (btn) btn.remove();
      if (mq.removeEventListener) mq.removeEventListener('change', onSys);
      live = live.filter(function (e) { return e.inst !== inst; });
    }
  };
  live.push({ scope: scope, inst: inst });
  return inst;
}

DN.api = { init: init, version: DN.v, durations: SPEED };
  })(DN, root);

  /* módulo: globe */
  (function (DN, root) {
/* motor gráfico: Terra em Canvas 2D (texturas, esfera por pixel e palco). Depende do núcleo; as nuvens são um módulo opcional. */
  var TW = 720, TH = 360, N = 256, TILT = .2, G, T, STARS, ALB, CLD, CTY, PX = new Float32Array(3);
  var LAND = [ // continentes estilizados (lon,lat); Américas com mais detalhe
    [-166,68.5,-156,71.3,-141,69.6,-128,70.2,-115,68.5,-100,68.2,-94,71.2,-85,69.5,-82,67,-78,64,-70,62.5,-65,60.3,-62,57.5,-57,54,-55.5,52,-60,50.3,-65.5,49.2,-64.5,46,-66,44.3,-70,43.7,-70.5,41.8,-74,40.5,-75.5,38.2,-75.5,35.2,-79,33.8,-81.2,31.5,-80.2,27,-80.3,25.2,-81.6,25.6,-82.8,28,-84.2,30,-87.5,30.3,-89.5,29.2,-94,29.6,-97.2,27.8,-97.6,24.5,-97.4,21.8,-96,19,-94.5,18.2,-91.5,18.6,-90.4,21,-87,21.5,-87.5,18.5,-88.3,15.9,-84,15.9,-83.5,11.5,-82.4,9.2,-79.8,9.6,-77.5,8.7,-75.5,10.8,-72,12,-68,10.6,-62,10.6,-60,8.3,-57,6,-52,4.8,-50,1.5,-50.2,-.5,-44.5,-2.5,-39,-3.3,-35.2,-5.5,-34.8,-8,-37.5,-11.8,-39,-14,-39.2,-17.8,-41,-22,-44,-23,-48.5,-26,-48.8,-28.5,-53,-33,-55,-35,-57.5,-36.5,-57,-38,-62,-39,-62.5,-41,-65,-41.2,-64,-42.8,-65.5,-45,-67.5,-46.4,-66,-48,-68.5,-50.3,-68.4,-52.4,-68,-54.2,-65.5,-55,-72,-54.8,-74.5,-52.2,-75.6,-48.5,-74,-44,-73.5,-40,-73.2,-37,-71.6,-33,-71.5,-29.5,-70.3,-25,-70.2,-19.5,-71.6,-17.3,-76,-14,-77.5,-11,-79.2,-8,-81.2,-5.7,-80,-3,-80.5,-1,-79.8,1,-78.7,2.8,-77.4,4.5,-77.2,6.5,-78,7.2,-79.5,8.9,-80.4,7.4,-82.8,8.2,-84.5,9.5,-85.8,11,-87.5,13,-91,14,-94,16,-96.5,15.7,-100,16.8,-103.5,18.2,-105.5,20.4,-105.6,22.6,-108.2,25.5,-110.6,27.6,-112.8,30,-114.7,31.8,-113,29,-112,27.2,-110.2,24.3,-109.5,23,-112,24.8,-114.5,27.5,-115.8,29.8,-117,32.5,-118.5,34,-120.6,34.6,-121.9,36.6,-122.6,37.8,-124,39.6,-124.2,42.5,-124,46.2,-124.7,48.4,-125.5,50,-128,51.5,-130.2,54.5,-134,57,-136.5,58.3,-140,59.8,-146,60.5,-151.5,59.2,-157,56.7,-162,55,-164.5,54.6,-160,57.5,-158,58.7,-162,58.8,-162,60.5,-165,61.5,-165,63.5,-161,64.5,-166,64.6,-168,65.8],
    [-8.9,38.7,-9,43,-1.8,43.4,-4.5,48.4,1.6,50.9,8.6,53.8,8.6,57,12,55,19,54.4,24,59.5,30,60,25,65.5,17,61,16.5,56.5,11,59,5,59,5,62,14,67.5,25,71,41,66.5,53,68.7,68,68.5,70,73,100,77.7,113,73.6,140,72.5,170,70,180,68.9,180,65,163,59.8,156.7,51,150,59.3,137,54,140.5,48.5,129.5,41,129.4,35.2,126.5,37.5,121.5,39,119,37.2,122.5,37.3,121.8,31.5,119.5,25.5,113.5,22.2,108,21.5,108.8,15.5,105,8.6,100.8,13.3,100.2,6.5,104.2,1.4,98.5,8,97.6,16.5,94,19.5,88,21.7,84,18,80.3,15.5,77.5,8.1,74.8,12.8,72.8,21,68.5,23.3,61.5,25.2,56.5,27,50.5,29.8,48.8,30.3,51.5,24.5,56.3,26.2,59.8,22.5,52,16,45,12.8,43.2,12.7,41,19.5,36.7,26.5,34.8,29.5,34.3,31.3,36,35.8,27.5,36.8,26.5,40.2,23.7,38,21.2,37.5,19.4,41.8,13.7,45.5,16.2,41.9,18.5,40.2,15.8,38.4,12.5,41.5,8.8,44.4,3.1,42.4,-.4,38.3,-5.6,36,-8.9,37],
    [-17,21,-13,28,-6,35.8,10,37,11,33,20,32,32,31,34,28,37,22,43,12,51,11.8,48,5,40,-3,40.5,-15,35,-24,32,-29,20,-35,16,-28,12,-17,9,4,5,4.3,-8,4.6,-13,8,-17,14.7],
    [44,-25,47,-25,50,-15,49.5,-12,44,-17],
    [-55,60,-50,64,-52,70,-60,76,-70,78,-65,82,-30,83.5,-20,81,-20,72,-22,70,-32,68,-40,65,-43,60],
    [-90,73.5,-76,72,-62,67,-66,62.5,-75,64.5,-80,70], [-85,22,-80,23.1,-74.2,20.2,-77.5,19.9,-82,22.5], [-74.4,18.5,-72,19.9,-68.4,18.5,-71,17.8],
    [-59.3,47.6,-52.7,46.7,-52.9,49.5,-55.5,51.6,-57.5,50.5], [-5,50,1.5,51,0,54,-2,57.5,-3,58.6,-6,57,-5,55,-3.2,54], [-10,52,-6,52.2,-6,55,-8,55.2],
    [-24,65.5,-18,63.4,-14,64.5,-14.5,66,-22,66.4], [130,31,132,34,135,34.2,140,35,141,38,142,41,141,45.5,144,43,141.5,41.5,140,38,137,36.8,135,35.6,131,34.5],
    [120,18,122,18.5,124,13,126,7,122,7,120,14], [95,5.5,98,4,104,-1,106,-5.9,102,-4,98,0], [109,1.5,111,2.5,117,7,119,5,117.8,1,116,-3.8,111,-3,109,-1],
    [105.5,-6.5,114.5,-7.8,114,-8.5,106,-7.5], [131,-1,135,-3.5,141,-2.6,147,-6,150.5,-10.5,141,-9,138,-8,134,-4],
    [114,-22,114,-26,115,-34.3,118,-35,124,-33.5,130,-31.5,135,-34.8,138,-35,140,-38,146,-39,150,-37.5,153.5,-28,152,-24,146,-19,142.5,-10.7,141.5,-13,140,-17.5,136,-15,135,-12,131,-11.3,129,-15,126,-14,122,-17],
    [172.7,-34.5,178.5,-37.7,175,-41.5,173,-40.5], [172,-40.6,174,-41.7,170.5,-46.5,166.5,-46,168,-44],
    [-180,-71,-150,-77,-100,-73,-60,-64,-58,-64,-62,-70,-60,-75,-30,-78,0,-70,40,-68,100,-66,140,-66,165,-70,180,-71,180,-90,-180,-90]
  ];
  var WATER = [ // baía de Hudson, mar Negro, mar Cáspio
    [-95,59,-93,61.5,-88,64,-82,63.5,-78,64,-70,62.8,-69,61.5,-77,60,-79,56.5,-79,54.5,-82,52.8,-85,55.3,-89,56.8,-92.5,57.2],
    [28,41.5,29,45,33,46,37,45,41.5,41.5,35,42,31,41.2], [47,45,51,47,53,45,54,41,53.5,37,50,37,49,40.5,47.5,43]
  ];
  var HUBS = [ // metrópoles para as luzes noturnas: lon, lat, peso
    -74,40.7,3,-87.6,41.9,2,-118.2,34,3,-122.4,37.8,1.5,-123,47.6,1,-96,31,2,-80.2,25.8,1.5,-84.4,33.7,1.5,-79.4,43.7,1.5,-99.1,19.4,3,-74,4.7,2,-66.9,10.5,1.5,-77,-12,2,-70.7,-33.4,2,-58.4,-34.6,3,-46.6,-23.5,3.5,-43.2,-22.9,2.5,-47.9,-15.8,1.2,-38.5,-12.9,1,
    -.1,51.5,2.5,2.3,48.9,2.5,-3.7,40.4,1.5,12.5,41.9,1.5,13.4,52.5,1.5,37.6,55.8,2.5,29,41,1.8,31.2,30,2,3.4,6.5,2,28,-26.2,1.5,51.4,35.7,1.5,77.2,28.6,3,72.9,19,2.5,90.4,23.8,2,100.5,13.8,1.8,106.8,-6.2,2.5,116.4,39.9,3,121.5,31.2,3,113.5,23,3,127,37.6,2.2,139.7,35.7,3.5,151.2,-33.9,1.8
  ];
  function ease(t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function nFor(r) { return Math.min(384, Math.max(224, Math.ceil(Math.min(r ? r.clientWidth : innerWidth, r ? r.clientHeight : innerHeight) * Math.min(root.devicePixelRatio || 1, 2) * .72 / 32) * 32)); } // resolução da esfera conforme o tamanho em tela

  function fbm(w, h, oct, rnd) { // ruído de valor, periódico em longitude
    var out = new Float32Array(w * h), amp = 1, tot = 0, o, i, x, y, gx, gy, Lt, fy, y0, ty, u, v, fx, x0, tx, x1, t1, t2;
    for (o = 0; o < oct; o++) {
      gx = 4 << o; gy = (2 << o) + 1; Lt = [];
      for (i = 0; i < gx * gy; i++) Lt.push(rnd());
      for (y = 0; y < h; y++) {
        fy = y / h * (gy - 1); y0 = fy | 0; ty = fy - y0; ty = ty * ty * (3 - 2 * ty); u = y0 * gx; v = u + gx;
        for (x = 0; x < w; x++) {
          fx = x / w * gx; x0 = fx | 0; tx = fx - x0; tx = tx * tx * (3 - 2 * tx); x1 = (x0 + 1) % gx;
          t1 = Lt[u + x0] + (Lt[u + x1] - Lt[u + x0]) * tx; t2 = Lt[v + x0] + (Lt[v + x1] - Lt[v + x0]) * tx;
          out[y * w + x] += amp * (t1 + (t2 - t1) * ty);
        }
      }
      tot += amp; amp *= .5;
    }
    for (i = 0; i < out.length; i++) out[i] /= tot;
    return out;
  }

  function prep(nn) { // albedo (oceano, plataforma, biomas, relevo), nuvens, luzes e esfera: calculados uma única vez
    nn = nn || N; if (ALB) { if (!G || G.N !== nn) geo(nn); return; }
    var s = 7, i, j, x, y, v, f, a = mk(), m = mk(), ci = mk(), oc, md, nA;
    function rnd() { s = s * 16807 % 2147483647; return s / 2147483647; }
    function mk() { var c = document.createElement('canvas'); c.width = TW; c.height = TH; return c.getContext('2d'); }
    function poly(c, P) { c.beginPath(); for (j = 0; j < P.length; j += 2) c[j ? 'lineTo' : 'moveTo']((P[j] + 180) / 360 * TW, (90 - P[j + 1]) / 180 * TH); c.fill(); }
    function grad(st) { var g = a.createLinearGradient(0, 0, 0, TH); st.forEach(function (c) { g.addColorStop(c[0], c[1]); }); return g; }
    oc = grad([[0, '#173f6c'], [.25, '#0f4a86'], [.5, '#1572b8'], [.75, '#0f4a86'], [1, '#173f6c']]);
    a.fillStyle = oc; a.fillRect(0, 0, TW, TH);
    a.shadowColor = 'rgba(80,200,205,.95)'; a.shadowBlur = 8; a.fillStyle = '#000'; // águas rasas ao redor das costas
    LAND.forEach(function (P) { poly(a, P); }); a.shadowBlur = 0;
    a.fillStyle = grad([[0, '#f1f5f8'], [.11, '#eef3f6'], [.16, '#8fa58c'], [.26, '#477f47'], [.33, '#86994f'], [.4, '#c9ac70'], [.46, '#2f7d3b'], [.54, '#33813f'], [.6, '#8aa04c'], [.65, '#bd9f64'], [.74, '#4d8753'], [.79, '#a9b59a'], [.84, '#eef3f6'], [1, '#f1f5f8']]);
    LAND.forEach(function (P) { poly(a, P); });
    a.fillStyle = oc; WATER.forEach(function (P) { poly(a, P); });
    m.fillStyle = '#000'; LAND.forEach(function (P) { poly(m, P); }); m.globalCompositeOperation = 'destination-out'; WATER.forEach(function (P) { poly(m, P); });
    ALB = a.getImageData(0, 0, TW, TH).data; md = m.getImageData(0, 0, TW, TH).data; T = new Uint8Array(TW * TH); nA = fbm(TW, TH, 5, rnd);
    for (i = 0; i < T.length; i++) { T[i] = md[i * 4 + 3] > 100 ? 1 : 0; f = T[i] ? .62 + .8 * nA[i] : .94 + .12 * nA[i]; ALB[i * 4] *= f; ALB[i * 4 + 1] *= f; ALB[i * 4 + 2] *= f; }
    ci.fillStyle = '#fff';
    for (i = 0; i < HUBS.length; i += 3) for (j = 0, v = 50 * HUBS[i + 2] | 0; j < v; j++) {
      f = Math.sqrt(-2 * Math.log(rnd() + 1e-6)) * HUBS[i + 2] * .6; x = rnd() * 6.2832; ci.globalAlpha = .45 + rnd() * .55;
      ci.fillRect((HUBS[i] + Math.cos(x) * f * 1.3 + 180) / 360 * TW, (90 - HUBS[i + 1] - Math.sin(x) * f) / 180 * TH, 2, 2);
    }
    CTY = ci.getImageData(0, 0, TW, TH).data;
    CLD = DN.clouds ? DN.clouds.build(fbm, rnd, TW, TH) : null;
    STARS = []; for (i = 0; i < 140; i++) STARS.push([rnd(), rnd(), 1 + rnd() * 1.2]);
    geo(nn);
  }

  function geo(N) { // geometria da esfera na resolução N (recalculada só quando N muda)
    var n = N * N, cs = Math.cos(TILT), sn = Math.sin(TILT), x, y, o = document.createElement('canvas');
    o.width = o.height = N;
    G = { N: N, c: o, x: o.getContext('2d'), AL: new Uint8Array(n), X: new Float32Array(n), Y: new Float32Array(n), Z: new Float32Array(n), R: new Float32Array(n), V: new Float32Array(n), L: new Float32Array(n) };
    G.im = G.x.createImageData(N, N);
    for (y = 0; y < N; y++) for (x = 0; x < N; x++) {
      var nx = (x + .5) / N * 2 - 1, ny = 1 - (y + .5) / N * 2, r = Math.sqrt(nx * nx + ny * ny), cv = (1 - r) * N / 2 + .5, k = y * N + x, nz, yy, zz;
      if (cv <= 0) continue;
      if (r > 1) { nx /= r; ny /= r; r = 1; } // anel de antialiasing no limbo
      nz = Math.sqrt(1 - r * r); yy = Math.max(-1, Math.min(1, ny * cs + nz * sn)); zz = -ny * sn + nz * cs;
      G.AL[k] = cv >= 1 ? 255 : cv * 255; G.X[k] = nx; G.Y[k] = ny; G.Z[k] = nz; G.R[k] = Math.pow(1 - nz, 2.5);
      G.V[k] = (.5 - Math.asin(yy) / Math.PI) * (TH - 1); G.L[k] = Math.atan2(nx, zz) / (2 * Math.PI);
    }
  }

  // Palco cinematográfico: espaço, Terra girando em 3D, terminador dia/noite e revelação circular do novo tema.
  function play(to, ms, swap, end, opt) {
    opt = opt || {}; opt.cfg = opt.cfg || {};
    try { prep(nFor(opt.root)); } catch (e) { console.warn('[DayNight]', e); swap(); end(); return function () {}; }
    var host = document.createElement('div'), cv = document.createElement('canvas'), g = cv.getContext('2d'),
      bw = opt.root ? opt.root.clientWidth : innerWidth, bh = opt.root ? opt.root.clientHeight : innerHeight,
      dpr = Math.min(root.devicePixelRatio || 1, 2), W = cv.width = Math.max(bw * dpr | 0, 2), H = cv.height = Math.max(bh * dpr | 0, 2),
      cx = W / 2, cy = H / 2, m = Math.min(W, H), dn = to === 'dark', gl = dn ? '110,160,255' : '255,196,110', t0, swapped, raf, el = 0, last, rot = opt.cfg.rotation === false ? 0 : 1, CLo = opt.cfg.clouds === false ? null : CLD;
    host.className = 'dn-stage' + (opt.root ? ' dn-scoped' : ''); host.setAttribute('aria-hidden', 'true'); host.appendChild(cv); (opt.root || document.body).appendChild(host);
    function stop() { cancelAnimationFrame(raf); host.remove(); }
    function safe(now) { try { frame(now); } catch (e) { console.warn('[DayNight]', e); stop(); if (!swapped) swap(); end(); } }
    function frame(now) {
      if (last === undefined) last = now; el += Math.min(now - last, 50); last = now; // pausa efetiva com a aba oculta
      var p = Math.min(el / ms, 1), a = ease(Math.min(p / .18, 1)), e = ease(Math.min(Math.max((p - .1) / .55, 0), 1)),
        q = ease(Math.max((p - .62) / .38, 0)), az = -.5 - 2.4 * (dn ? e : 1 - e),
        cl = -.21 + rot * (dn ? -e : 1 - e) * .35, cd = cl * 1.12 + rot * now / 6e5, sx = Math.sin(az) * .964, sy = .268, sz = Math.cos(az) * .964,
        R = m * (.26 + .03 * e + .07 * q) * (.1 + .9 * a), im = G.im.data, nt = G.N * G.N, hn = Math.sqrt(sx * sx + sy * sy + (sz + 1) * (sz + 1)), i, k, d, u, tx, j, cr, cg, cb, tw, rim, o, sh, nh, s, c, ca, fx, fy, x0, x1, y0, a0, a1, w0, w1, w2, w3, j1, j2, j3;
      if (p >= .62 && !swapped) { swapped = true; swap(); }
      g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1; g.clearRect(0, 0, W, H);
      var sk = g.createLinearGradient(0, 0, 0, H); sk.addColorStop(0, '#01030a'); sk.addColorStop(1, '#0b1b38');
      g.globalAlpha = Math.min(p / .1, 1); g.fillStyle = sk; g.fillRect(0, 0, W, H);
      g.fillStyle = '#fff';
      for (i = 0; i < STARS.length; i++) { g.globalAlpha = a * (.35 + .65 * Math.abs(Math.sin(now / 500 + i))); g.fillRect(STARS[i][0] * W, STARS[i][1] * H, STARS[i][2] * dpr, STARS[i][2] * dpr); }
      for (i = 0; i < nt; i++) { // esfera por pixel: albedo bilinear, nuvens, brilho do oceano, terminador, luzes e atmosfera
        if (!G.AL[i]) continue;
        d = G.X[i] * sx + G.Y[i] * sy + G.Z[i] * sz;
        k = d < -.12 ? 0 : d > .22 ? 1 : (d + .12) / .34; k = k * k * (3 - 2 * k);
        u = G.L[i] + cl + .5; u -= Math.floor(u); fx = u * TW; x0 = fx | 0; fx -= x0; x1 = x0 + 1 === TW ? 0 : x0 + 1;
        fy = G.V[i]; y0 = fy | 0; fy -= y0; a0 = y0 * TW; a1 = (y0 + 1 < TH ? y0 + 1 : y0) * TW;
        w0 = (1 - fx) * (1 - fy); w1 = fx * (1 - fy); w2 = (1 - fx) * fy; w3 = fx * fy;
        tx = a0 + x0; j = tx * 4; j1 = (a0 + x1) * 4; j2 = (a1 + x0) * 4; j3 = (a1 + x1) * 4;
        sh = .32 + .8 * (d > 0 ? d : 0);
        cr = (ALB[j] * w0 + ALB[j1] * w1 + ALB[j2] * w2 + ALB[j3] * w3) * (sh * k + .06 * (1 - k));
        cg = (ALB[j + 1] * w0 + ALB[j1 + 1] * w1 + ALB[j2 + 1] * w2 + ALB[j3 + 1] * w3) * (sh * k + .08 * (1 - k));
        cb = (ALB[j + 2] * w0 + ALB[j1 + 2] * w1 + ALB[j2 + 2] * w2 + ALB[j3 + 2] * w3) * (sh * k + .15 * (1 - k));
        if (T[tx]) { c = CTY[j + 3] / 255 * (1 - k); cr += 255 * c; cg += 190 * c; cb += 90 * c; }
        else if ((nh = (G.X[i] * sx + G.Y[i] * sy + G.Z[i] * (sz + 1)) / hn) > .93) { s = nh * nh; s *= s; s *= s; s *= s; s *= s; s *= s; s *= k * 180; cr += s; cg += s; cb += s * .9; }
        if (CLo) { PX[0] = cr; PX[1] = cg; PX[2] = cb; DN.clouds.shade(PX, CLo, G.L[i] + cd, a0, TW, k, sh); cr = PX[0]; cg = PX[1]; cb = PX[2]; }
        tw = Math.max(0, 1 - Math.abs(d) * 6) * .3; rim = G.R[i] * (.18 + .82 * Math.max(d + .25, 0));
        o = i * 4; im[o] = cr + 255 * tw + 60 * rim; im[o + 1] = cg + 120 * tw + 130 * rim; im[o + 2] = cb + 30 * tw + 255 * rim; im[o + 3] = G.AL[i];
      }
      G.x.putImageData(G.im, 0, 0);
      g.globalAlpha = a;
      var hg = g.createRadialGradient(cx, cy, R * .95, cx, cy, R * 1.5);
      hg.addColorStop(0, 'rgba(130,195,255,.8)'); hg.addColorStop(.1, 'rgba(80,150,255,.36)'); hg.addColorStop(1, 'rgba(60,120,255,0)'); g.fillStyle = hg; g.fillRect(0, 0, W, H);
      if (sz > -.2) {
        var gx = cx + sx * R * 1.7, gy = cy - sy * R * 1.7, sg = g.createRadialGradient(gx, gy, 0, gx, gy, R * 1.3);
        sg.addColorStop(0, 'rgba(255,225,170,' + .6 * Math.min(1, (sz + .2) * 2) + ')'); sg.addColorStop(1, 'rgba(255,200,120,0)');
        g.fillStyle = sg; g.fillRect(0, 0, W, H);
      }
      g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high'; g.drawImage(G.c, cx - R, cy - R, 2 * R, 2 * R);
      g.globalAlpha = 1;
      if (q > 0) { // revelação progressiva: abertura circular com borda luminosa
        var r = q * Math.hypot(W, H) * .78 + 1, hl = g.createRadialGradient(cx, cy, r * .68, cx, cy, r), rg = g.createRadialGradient(cx, cy, r * .6, cx, cy, r * 1.04);
        hl.addColorStop(0, '#000'); hl.addColorStop(1, 'rgba(0,0,0,0)');
        g.globalCompositeOperation = 'destination-out'; g.fillStyle = hl; g.fillRect(0, 0, W, H);
        rg.addColorStop(0, 'rgba(' + gl + ',0)'); rg.addColorStop(.75, 'rgba(' + gl + ',' + .4 * (1 - q) + ')'); rg.addColorStop(1, 'rgba(' + gl + ',0)');
        g.globalCompositeOperation = 'source-over'; g.fillStyle = rg; g.fillRect(0, 0, W, H);
      }
      if (p < 1) raf = requestAnimationFrame(safe); else { stop(); end(); }
    }
    raf = requestAnimationFrame(safe);
    return stop;
  }

  DN.fx = { play: play, prewarm: function (r) { try { prep(nFor(r)); } catch (e) {} } };
  })(DN, root);

  /* módulo: clouds */
  (function (DN, root) {
/* nuvens (opcional): textura de ruído e mistura por pixel. Depende do motor gráfico. */
DN.clouds = {
  build: function (fbm, rnd, TW, TH) {
    var n = fbm(TW, TH, 5, rnd), C = new Uint8Array(TW * TH), i, v;
    for (i = 0; i < C.length; i++) { v = (n[i] - .46) / .22; v = v < 0 ? 0 : v > 1 ? 1 : v; C[i] = v * v * (3 - 2 * v) * 255; }
    return C;
  },
  shade: function (px, C, lon, a0, TW, k, sh) {
    var u = lon + .5, ca, c; u -= Math.floor(u);
    ca = C[a0 + (u * TW | 0)] / 255 * .9; c = (.07 + .93 * k) * (sh > 1 ? 1 : sh);
    px[0] += (240 * c - px[0]) * ca; px[1] += (244 * c - px[1]) * ca; px[2] += (250 * c - px[2]) * ca;
  }
};
  })(DN, root);

  root.DayNight = DN.api;
  if (typeof module !== 'undefined' && module.exports) module.exports = DN.api;
})(typeof window !== 'undefined' ? window : this);
