// fithausen – Kleiderschrank-Webapp. Kein Build-Schritt, alles Vanilla JS.

// ---------------------------------------------------------------------------
// Konstanten
// ---------------------------------------------------------------------------
const SLOT_DEFS = [
  { key: 'kopf', label: 'Kopf', long: 'Mützen & Caps' },
  { key: 'schal', label: 'Schal', long: 'Schals' },
  { key: 'aussen', label: 'Außen', long: 'Jacken & Mäntel' },
  { key: 'drueber', label: 'Drüber', long: 'Strickjacken & Overshirts' },
  { key: 'mitte', label: 'Mitte', long: 'Pullis & Hoodies' },
  { key: 'basis', label: 'Basis', long: 'Shirts & Hemden' },
  { key: 'hose', label: 'Hose', long: 'Hosen', required: true },
  { key: 'schuhe', label: 'Schuhe', long: 'Schuhe', required: true },
  { key: 'tasche', label: 'Tasche', long: 'Taschen' },
];
const SLOT = Object.fromEntries(SLOT_DEFS.map((s) => [s.key, s]));
const ORDER = SLOT_DEFS.map((s) => s.key);
const TORSO = ['aussen', 'drueber', 'mitte', 'basis']; // außen → innen
// Position am Avatar in % der Bühne: [links, oben, breite, höhe, z-index]
const BOX = {
  hose: [27, 49, 46, 38, 1],
  schuhe: [23, 84, 54, 14, 2],
  basis: [22, 21, 56, 35, 3],
  mitte: [19, 19, 62, 35, 4],
  drueber: [16, 18, 68, 38, 5],
  aussen: [12, 17, 76, 44, 6],
  schal: [33, 15, 34, 24, 7],
  tasche: [69, 40, 30, 24, 8],
  face: [35, 1, 30, 19, 9],
  kopf: [32, -5, 36, 13, 10],
};
const CHIP_COLORS = { kopf: '#E4A0F7', schal: '#FF48B0', aussen: '#3E6B48', drueber: '#E8B04B', mitte: '#00A95C', basis: '#0078BF', hose: '#FF6C2F', schuhe: '#8B4A2B', tasche: '#C1502E' };
const GHOSTS = ['rgba(255,72,176,.6)', 'rgba(0,120,191,.5)', 'rgba(255,214,0,.9)'];
const PAPERS = ['#CFE3F4', '#FFF3A6', '#FFD6EA', '#D6EEDC', '#FFE0C7', '#E4DDF5'];
const TILTS = [-2.5, 1.5, -1, 2, -1.5, 1, 0.5, -2];
const WARMTH = [['luftig', 'luftig'], ['mittel', 'mittel'], ['warm', 'warm']];
const THEMES = [['grau', 'Hellgrau', '#DCDAD5', '#1A1A1A'], ['creme', 'Creme', '#F1EBDF', '#1A1A1A'], ['nacht', 'Nacht', '#141416', '#F2EFE8']];
const DEFAULT_LOC = { name: 'Düsseldorf', region: 'Nordrhein-Westfalen, Deutschland', lat: 51.2277, lon: 6.7735 };
const STALE_DAYS = 21;
const BG_LIB = 'https://cdn.jsdelivr.net/npm/@imgly/background-removal@1.4.5/+esm';

const I = {
  hanger: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 7a2 2 0 1 1 2-2"></path><path d="M12 7v1.5L3.5 15a1.6 1.6 0 0 0 1 2.9h15a1.6 1.6 0 0 0 1-2.9L12 8.5"></path></svg>',
  gear: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"></path></svg>',
  back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"></path></svg>',
  left: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"></path></svg>',
  right: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 5l7 7-7 7"></path></svg>',
  dice: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="3"></rect><circle cx="9" cy="9" r="1.2" fill="currentColor"></circle><circle cx="15" cy="15" r="1.2" fill="currentColor"></circle><circle cx="15" cy="9" r="1.2" fill="currentColor"></circle><circle cx="9" cy="15" r="1.2" fill="currentColor"></circle></svg>',
  shuffle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16 3h5v5"></path><path d="M4 20L21 3"></path><path d="M21 16v5h-5"></path><path d="M15 15l6 6"></path><path d="M4 4l5 5"></path></svg>',
  pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 4h6l-1 6 3 3H7l3-3Z"></path><path d="M12 13v7"></path></svg>',
  x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"></path></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"></path></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12l5 5 9-10"></path></svg>',
  camera: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 8h3l2-3h6l2 3h3v11H4Z"></path><circle cx="12" cy="13" r="3.5"></circle></svg>',
  info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"></circle><path d="M12 11v6M12 7.5v.5"></path></svg>',
  rain: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 15a4 4 0 0 1 .5-8 5 5 0 0 1 9.6 1.5A3.5 3.5 0 0 1 17 15Z"></path><path d="M9 18l-1 2M13 18l-1 2M17 18l-1 2"></path></svg>',
  sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"></path></svg>',
  cloud: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 18a4 4 0 0 1 .5-8 5 5 0 0 1 9.6 1.5A3.5 3.5 0 0 1 17 18Z"></path></svg>',
  trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"></path></svg>',
};

// ---------------------------------------------------------------------------
// Zustand
// ---------------------------------------------------------------------------
const app = document.getElementById('app');
const S = { phase: 'loading', pieces: [], wears: [], faces: [], settings: {}, weather: null, err: null, st: {} };
const G = { init: false, active: [], pick: {}, held: {}, sel: null, face: null, wfilter: true, addOpen: false, touched: false };
let ADD = null;
let CLOSET = { tab: 'alle', filter: 'alle' };
let confirmDel = null;
let lastView = null;

// ---------------------------------------------------------------------------
// Helfer
// ---------------------------------------------------------------------------
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
function hash(s) { let h = 7; for (const ch of String(s)) h = (h * 31 + ch.charCodeAt(0)) | 0; return Math.abs(h); }
const ghost = (id) => GHOSTS[hash(id) % GHOSTS.length];
const paper = (id) => PAPERS[hash(id + 'p') % PAPERS.length];
const tilt = (id) => TILTS[hash(id + 't') % TILTS.length];
const pieceById = (id) => S.pieces.find((p) => p.id === id) || null;
const isNight = () => document.documentElement.dataset.theme === 'nacht';

function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function daysBetween(a, b) { return Math.round((Date.parse(b + 'T12:00:00') - Date.parse(a + 'T12:00:00')) / 864e5); }
function fmtDate(d) { if (!d) return '–'; const [, m, day] = d.split('-'); return `${Number(day)}.${Number(m)}.`; }

function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => t.classList.remove('show'), 2200);
}

async function api(path, opts = {}) {
  const headers = { ...(opts.headers || {}) };
  if (typeof opts.body === 'string') headers['Content-Type'] = 'application/json';
  const res = await fetch('/api' + path, { credentials: 'same-origin', ...opts, headers });
  const isJson = (res.headers.get('content-type') || '').includes('json');
  const data = isJson ? await res.json() : null;
  if (!res.ok) {
    const e = new Error((data && data.error) || `Fehler ${res.status}`);
    e.code = data && data.code;
    e.status = res.status;
    if (res.status === 401 && path !== '/login') { S.phase = 'login'; render(); }
    throw e;
  }
  return data;
}

const debouncers = {};
function debounce(key, fn, ms = 600) { clearTimeout(debouncers[key]); debouncers[key] = setTimeout(fn, ms); }

// ---------------------------------------------------------------------------
// Statistik
// ---------------------------------------------------------------------------
function computeStats() {
  const st = {};
  for (const p of S.pieces) st[p.id] = { count: 0, last: null };
  for (const w of S.wears) {
    for (const id of Object.values(w.outfit || {})) {
      if (!st[id]) continue;
      st[id].count++;
      if (!st[id].last || w.date > st[id].last) st[id].last = w.date;
    }
  }
  const t = today();
  for (const id in st) st[id].days = st[id].last ? daysBetween(st[id].last, t) : null;
  S.st = st;
}
const statOf = (p) => S.st[p.id] || { count: 0, last: null, days: null };
const isStale = (p) => { const s = statOf(p); return s.days === null || s.days >= STALE_DAYS; };
function wornText(p) {
  const s = statOf(p);
  if (s.days === null) return 'noch nie getragen';
  if (s.days === 0) return 'heute an';
  if (s.days === 1) return 'gestern getragen';
  return s.days >= STALE_DAYS ? `seit ${s.days} Tagen nicht` : `vor ${s.days} Tagen`;
}

// ---------------------------------------------------------------------------
// Wetter
// ---------------------------------------------------------------------------
function wdesc(code, rain) {
  if (rain) return 'Regen';
  if (code === 0) return 'klar';
  if (code <= 3) return 'wolkig';
  if (code === 45 || code === 48) return 'Nebel';
  if (code >= 71 && code <= 77) return 'Schnee';
  if (code >= 95) return 'Gewitter';
  return 'wechselhaft';
}
async function loadWeather() {
  const loc = S.settings.location || DEFAULT_LOC;
  try {
    const u = `https://api.open-meteo.com/v1/forecast?latitude=${loc.lat}&longitude=${loc.lon}&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,weather_code&timezone=auto&forecast_days=1`;
    const d = await (await fetch(u)).json();
    const code = d.daily.weather_code[0];
    const tmax = d.daily.temperature_2m_max[0];
    const pp = d.daily.precipitation_probability_max[0] ?? 0;
    const rainy = (c) => (c >= 51 && c <= 67) || (c >= 80 && c <= 82) || c >= 95;
    const rain = pp >= 50 || rainy(code) || rainy(d.current.weather_code);
    const feel = tmax < 11 ? 'kalt' : tmax > 21 ? 'warm' : 'mild';
    S.weather = { temp: d.current.temperature_2m, tmax, tmin: d.daily.temperature_2m_min[0], rain, feel, code, desc: wdesc(code, rain), place: loc.name };
    S.weatherFailed = false;
  } catch (e) {
    S.weather = null;
    S.weatherFailed = true;
  }
  // Beim ersten Laden ohne Interaktion passend zum Wetter neu würfeln
  if (G.init && !G.touched && !todayWear()) shuffleAll(false);
  if (route().view === 'game') render();
}
function fits(p) {
  const w = S.weather;
  if (!w || !G.wfilter) return true;
  if (w.rain && !p.rain) return false;
  if (w.feel === 'kalt' && p.warmth === 'luftig') return false;
  if (w.feel === 'warm' && p.warmth === 'warm') return false;
  return true;
}

// ---------------------------------------------------------------------------
// Mini-Game-Logik
// ---------------------------------------------------------------------------
const cands = (slot) => S.pieces.filter((p) => p.slots.includes(slot));
const todayWear = () => S.wears.find((w) => w.date === today()) || null;
function ordered(slot) {
  return cands(slot).sort((a, b) => {
    const la = statOf(a).last || '0000', lb = statOf(b).last || '0000';
    return la < lb ? -1 : la > lb ? 1 : a.name.localeCompare(b.name);
  });
}
function usedElsewhere(slot) {
  return new Set(G.active.filter((k) => k !== slot).map((k) => G.pick[k]).filter(Boolean));
}
function rollSlot(slot) {
  const used = usedElsewhere(slot);
  let pool = cands(slot).filter((p) => !used.has(p.id));
  if (!pool.length) { G.pick[slot] = null; return; }
  const fit = pool.filter(fits);
  if (fit.length) pool = fit;
  if (pool.length > 1) pool = pool.filter((p) => p.id !== G.pick[slot]);
  const bag = [];
  for (const p of pool) { bag.push(p); if (isStale(p)) bag.push(p); }
  G.pick[slot] = bag[Math.floor(Math.random() * bag.length)].id;
}
function rollFace() {
  if (!S.faces.length) { G.face = null; return; }
  let pool = S.faces.map((f) => f.id);
  if (pool.length > 1) pool = pool.filter((id) => id !== G.face);
  G.face = pool[Math.floor(Math.random() * pool.length)];
}
function shuffleAll(withFace = true) {
  for (const k of G.active) if (!G.held[k]) rollSlot(k);
  if (withFace) rollFace();
}
function defaultSel() { return TORSO.find((k) => G.active.includes(k)) || G.active[0] || 'hose'; }
function initGame() {
  const t = todayWear();
  const last = [...S.wears].sort((a, b) => (a.date < b.date ? 1 : -1))[0];
  if (t) {
    G.active = ORDER.filter((k) => t.outfit[k]);
    G.pick = { ...t.outfit };
    G.face = t.face_id || null;
  } else {
    G.active = last ? ORDER.filter((k) => last.outfit[k]) : ['basis', 'mitte', 'hose', 'schuhe'];
    for (const k of ['hose', 'schuhe']) if (!G.active.includes(k)) G.active.push(k);
    G.active = ORDER.filter((k) => G.active.includes(k));
    G.pick = {};
    shuffleAll(true);
  }
  if (!G.face) rollFace();
  G.sel = defaultSel();
  G.init = true;
}
function pruneGame() {
  for (const k of G.active) if (!G.pick[k] || !pieceById(G.pick[k])) rollSlot(k);
  if (G.face && !S.faces.find((f) => f.id === G.face)) rollFace();
  if (!G.face && S.faces.length) rollFace();
  if (!G.active.includes(G.sel)) G.sel = defaultSel();
}
function currentOutfit() {
  const o = {};
  for (const k of G.active) if (G.pick[k]) o[k] = G.pick[k];
  return o;
}
function sameOutfit(a, b) {
  const ka = Object.keys(a).sort(), kb = Object.keys(b).sort();
  return ka.length === kb.length && ka.every((k, i) => k === kb[i] && a[k] === b[k]);
}
function step(dir) {
  const slot = G.sel;
  const used = usedElsewhere(slot);
  const list = ordered(slot).filter((p) => !used.has(p.id));
  if (!list.length) return;
  const i = list.findIndex((p) => p.id === G.pick[slot]);
  G.pick[slot] = list[(i + dir + list.length) % list.length].id;
  G.touched = true;
  render();
}

// ---------------------------------------------------------------------------
// Bausteine
// ---------------------------------------------------------------------------
function cutHTML(p) {
  if (!p) return '';
  if (p.image_id) return `<img class="cut" style="--g:${ghost(p.id)}" src="/api/images/${esc(p.image_id)}" alt="" draggable="false" loading="lazy">`;
  return `<div class="swatch" style="--c:${esc(p.color || '#BBBBBB')};--g:${ghost(p.id)}"><span>${esc(p.name)}</span></div>`;
}
function paperHTML(p, cls = '', extra = '') {
  return `<div class="paper ${cls}" style="--p:${paper(p.id)}"><span class="tape" aria-hidden="true"></span><div class="inner" style="--r:${tilt(p.id)}deg">${cutHTML(p)}</div>${extra}</div>`;
}
function faceDoodle() {
  return `<svg viewBox="0 0 80 80" width="100%" height="100%" aria-hidden="true"><path d="M14 22 L26 9 L44 12 L60 7 L72 24 L74 44 L68 64 L52 74 L32 76 L16 66 L8 46 Z" fill="#FF48B0"></path><circle cx="31" cy="38" r="4" fill="#1A1A1A"></circle><circle cx="52" cy="38" r="4" fill="#1A1A1A"></circle><path d="M30 53 Q41 64 53 53" fill="none" stroke="#1A1A1A" stroke-width="3.5" stroke-linecap="round"></path></svg>`;
}
function bodySVG() {
  return `<svg class="body" viewBox="0 0 300 400" preserveAspectRatio="none" aria-hidden="true">
    <g fill="var(--body)" stroke="var(--body-line)" stroke-width="1.6" stroke-dasharray="5 4" stroke-linejoin="round">
      <path d="M103 205 H197 L192 350 H157 L150 238 L143 350 H108 Z"></path>
      <path d="M92 90 L62 196 L78 202 L106 112 Z M208 90 L238 196 L222 202 L194 112 Z"></path>
      <path d="M95 90 Q150 76 205 90 L210 214 H90 Z"></path>
      <rect x="137" y="62" width="26" height="28" rx="8"></rect>
      <ellipse cx="150" cy="42" rx="32" ry="36"></ellipse>
      <path d="M106 346 H146 L147 372 H96 Q90 366 98 356 Z M154 346 H194 L204 356 Q210 366 204 372 H153 Z"></path>
    </g>
  </svg>`;
}
function topBar(left, mid, right) {
  return `<header class="top">${left}<div class="top-mid">${mid}</div>${right}</header>`;
}
const backBtn = (href, label) => `<a class="iconbtn" href="${href}" aria-label="${esc(label)}">${I.back}</a>`;

// ---------------------------------------------------------------------------
// Views
// ---------------------------------------------------------------------------
function splashView() {
  return `<div class="center"><h1 class="logo">fithausen</h1><p class="mono muted" style="font-size:12px">lädt …</p></div>`;
}

function loginView() {
  return `<div class="center">
    <div class="collage-mini" aria-hidden="true">
      <span style="left:8px;top:14px;width:80px;height:70px;background:#FFE800"></span>
      <span style="left:62px;top:4px;width:70px;height:64px;background:#FF48B0;opacity:.85"></span>
      <span style="left:44px;top:46px;width:86px;height:56px;background:#0078BF;opacity:.7"></span>
    </div>
    <h1 class="logo">fithausen</h1>
    <form class="card login" data-form="login">
      <label class="k" for="pw">Passwort</label>
      <input class="text-input" id="pw" name="password" type="password" autocomplete="current-password" required>
      <button class="big primary" type="submit">Rein da</button>
      <p class="note" id="loginErr" role="alert"></p>
    </form>
  </div>`;
}

function errorView() {
  const e = S.err || {};
  let help = '';
  if (e.code === 'NO_DB') help = `<p>In Cloudflare unter <b>Workers &amp; Pages → fithausen → Einstellungen → Bindings</b> eine <b>D1-Datenbank</b> mit dem Variablennamen <code>DB</code> hinzufügen und neu deployen.</p>`;
  else if (e.code === 'NO_PASSWORD') help = `<p>In Cloudflare unter <b>Einstellungen → Variablen und Geheimnisse</b> die Variable <code>APP_PASSWORD</code> anlegen und neu deployen.</p>`;
  else help = `<p>${esc(e.message || 'Unbekannter Fehler')}</p>`;
  return `<div class="center"><h1 class="logo">fithausen</h1><div class="card error-box"><p class="k">Setup fehlt noch</p>${help}<button class="big secondary" data-act="reload" style="margin-top:8px">Nochmal versuchen</button></div></div>`;
}

// ----- Mini-Game -----
function gameView() {
  if (!G.init) initGame();
  pruneGame();
  const w = S.weather;
  const hasPieces = S.pieces.length > 0;

  const day = new Date().toLocaleDateString('de-DE', { weekday: 'short', day: 'numeric', month: 'numeric' }).replace(',', '').toUpperCase();
  const wIcon = w ? (w.rain ? I.rain : w.code <= 1 ? I.sun : I.cloud) : I.cloud;
  const wText = w ? `${day} · ${Math.round(w.temp)}° · ${w.desc}${G.wfilter ? '' : ' · Filter aus'}` : `${day} · ${S.weatherFailed ? 'Wetter offline' : 'Wetter lädt'}`;
  const weatherBtn = `<button class="weather" data-act="wfilter" aria-pressed="${G.wfilter}" title="Wetter-Filter an/aus">${wIcon}<span>${esc(wText)}</span></button>`;

  const head = topBar(
    `<a class="iconbtn" href="#/schrank" aria-label="Schrank">${I.hanger}</a>`,
    `<h1 class="logo">fithausen</h1>`,
    `<a class="iconbtn" href="#/einstellungen" aria-label="Einstellungen">${I.gear}</a>`
  );

  if (!hasPieces) {
    return `${head}${weatherBtn}<div class="stage-wrap"><div class="stage"><div class="blob"></div>${bodySVG()}${faceHTML()}</div></div>
      <div class="card empty"><strong>Dein Schrank ist noch leer</strong><p>Fotografier jedes Teil einmal, fithausen stellt es frei. Danach kannst du hier würfeln und kombinieren.</p><a class="big primary" href="#/neu" style="width:100%">${I.camera}<span>Erstes Teil anlegen</span></a></div>`;
  }

  // Bühne
  const parts = G.active.map((k) => {
    const p = pieceById(G.pick[k]);
    const [x, y, wd, h, z] = BOX[k];
    return `<button class="slot ${k === G.sel ? 'is-sel' : ''}" data-act="sel" data-slot="${k}" style="left:${x}%;top:${y}%;width:${wd}%;height:${h}%;z-index:${z};--r:${p ? tilt(p.id) * 0.6 : 0}deg" aria-label="${esc(SLOT[k].label)}: ${esc(p ? p.name : 'leer')}">${p ? cutHTML(p) : `<span class="slot-empty">${esc(SLOT[k].label)}?</span>`}</button>`;
  }).join('');
  const torso = TORSO.filter((k) => G.active.includes(k) && G.pick[k]);
  const covered = torso.slice(1);
  const peeks = covered.length ? `<div class="peeks"><span class="peeks-lab">DRUNTER</span>${covered.map((k) => {
    const p = pieceById(G.pick[k]);
    return `<button class="peek" data-act="sel" data-slot="${k}" aria-label="Drunter: ${esc(SLOT[k].label)}, ${esc(p.name)}">${cutHTML(p)}<small>${esc(SLOT[k].label)}</small></button>`;
  }).join('')}</div>` : '';
  const stage = `<div class="stage-wrap"><div class="stage" id="stage"><div class="blob"></div>${bodySVG()}${parts}${faceHTML()}
    <span class="tape" style="left:21%;top:20%;transform:rotate(-24deg)" aria-hidden="true"></span>
    <span class="tape" style="right:21%;top:20%;transform:rotate(20deg)" aria-hidden="true"></span>${peeks}</div></div>`;

  // Karte zum gewählten Slot
  const sel = G.sel;
  const sp = pieceById(G.pick[sel]);
  const n = cands(sel).length;
  let card;
  if (!sp) {
    card = `<div class="card slotcard"><div class="slotcard-mid"><span class="lab">${esc(SLOT[sel].label)} · ${esc(SLOT[sel].long)}</span><strong>Noch nichts hier</strong><span class="sub">${n ? 'alle Teile sind schon in anderen Schichten' : 'leg ein Teil für diese Schicht an'}</span></div><a class="pill blue" href="#/neu/${sel}">${I.plus}<span>Anlegen</span></a></div>`;
  } else {
    const mismatch = !fits(sp);
    const sub = mismatch ? 'passt heute nicht zum Wetter' : `${wornText(sp)} · ${statOf(sp).count}×`;
    card = `<div class="card slotcard">
      <button class="nav" data-act="step" data-dir="-1" aria-label="Vorheriges Teil">${I.left}</button>
      <div class="slotcard-mid"><span class="lab">${esc(SLOT[sel].label)} · ${n} ${n === 1 ? 'Teil' : 'Teile'}</span><strong>${esc(sp.name)}</strong><span class="sub ${mismatch || isStale(sp) ? 'warn' : ''}">${esc(sub)}</span></div>
      <button class="nav" data-act="step" data-dir="1" aria-label="Nächstes Teil">${I.right}</button>
    </div>`;
  }
  const held = !!G.held[sel];
  const actions = `<div class="row scroll-x">
    <button class="pill" data-act="roll" ${n ? '' : 'disabled'}>${I.dice}<span>Würfeln</span></button>
    <button class="pill ${held ? 'blue' : ''}" data-act="hold" aria-pressed="${held}">${I.pin}<span>${held ? 'Festgehalten' : 'Festhalten'}</span></button>
    ${SLOT[sel].required ? '' : `<button class="pill" data-act="drop">${I.x}<span>Weglassen</span></button>`}
    ${sp ? `<a class="pill" href="#/teil/${sp.id}" aria-label="Details zu ${esc(sp.name)}">${I.info}</a>` : ''}
  </div>`;

  // Schicht-Chips
  const inactive = ORDER.filter((k) => !G.active.includes(k));
  const chips = G.active.map((k) => {
    const p = pieceById(G.pick[k]);
    return `<button class="pill chip ${k === G.sel ? 'on' : ''}" style="--chip:${CHIP_COLORS[k]}" data-act="sel" data-slot="${k}" aria-pressed="${k === G.sel}"><span>${esc(SLOT[k].label)}</span>${G.held[k] ? I.pin : ''}${p && isStale(p) ? '<span class="dot" title="lange nicht getragen"></span>' : ''}</button>`;
  }).join('');
  const coldHint = w && G.wfilter && w.feel === 'kalt' && !G.active.includes('aussen') && cands('aussen').length
    ? `<button class="pill chip hint" data-act="addslot" data-slot="aussen">${I.plus}<span>Außen, ist kalt</span></button>` : '';
  const addBtn = inactive.length ? `<button class="pill chip dashed" data-act="addopen" aria-expanded="${G.addOpen}">${I.plus}<span>Schicht</span></button>` : '';
  const addPanel = G.addOpen && inactive.length ? `<div class="card addpanel"><span class="mono">DAZUNEHMEN</span>${inactive.map((k) => `<button class="pill soft" data-act="addslot" data-slot="${k}">${esc(SLOT[k].label)} <span class="muted">${cands(k).length}</span></button>`).join('')}</div>` : '';

  // Heute an
  const tw = todayWear();
  const saved = tw && sameOutfit(tw.outfit, currentOutfit());
  const wornBtn = saved
    ? `<button class="big ok" data-act="wear">${I.check}<span>Gespeichert</span></button>`
    : `<button class="big secondary" data-act="wear">${tw ? 'Heute ändern' : 'Heute an'}</button>`;

  return `${head}${weatherBtn}${stage}${card}${actions}<div class="row scroll-x">${chips}${coldHint}${addBtn}</div>${addPanel}
    <div class="bottom"><button class="big primary" data-act="shuffle">${I.shuffle}<span>Shuffle</span></button>${wornBtn}</div>`;
}

function faceHTML() {
  const [x, y, w, h] = BOX.face;
  const f = S.faces.find((ff) => ff.id === G.face);
  const idx = f ? S.faces.indexOf(f) + 1 : 0;
  const inner = f ? `<img class="cut" src="/api/images/${esc(f.image_id)}" alt="" draggable="false">` : faceDoodle();
  const tag = f && S.faces.length > 1 ? `<span class="face-tag">FACE ${idx}/${S.faces.length}</span>` : '';
  return `<button class="face" data-act="face" style="left:${x}%;top:${y}%;width:${w}%;height:${h}%;z-index:${BOX.face[4]};transform:rotate(-3deg)" aria-label="${S.faces.length ? 'Anderes Gesicht' : 'Gesicht-Platzhalter, Gesichter in den Einstellungen hinzufügen'}">${inner}</button>${tag}`;
}

// ----- Schrank -----
function closetView(tabArg) {
  const tab = tabArg && (SLOT[tabArg] || tabArg === 'gesichter') ? tabArg : 'alle';
  CLOSET.tab = tab;
  const head = topBar(backBtn('#/', 'Zurück zum Mini-Game'), `<h1 class="title">Schrank</h1><span class="mono muted" style="font-size:11px">${S.pieces.length} Teile</span>`,
    `<a class="iconbtn" href="#/neu/${tab === 'gesichter' ? 'gesicht' : tab === 'alle' ? '' : tab}" aria-label="Neu hinzufügen">${I.plus}</a>`);
  const tabs = [['alle', 'Alle'], ...SLOT_DEFS.map((s) => [s.key, s.label]), ['gesichter', 'Gesichter']]
    .map(([k, l]) => `<a class="pill ${k === tab ? 'on' : ''}" href="#/schrank/${k}" aria-current="${k === tab ? 'page' : 'false'}">${esc(l)}</a>`).join('');

  if (tab === 'gesichter') return `${head}<nav class="row scroll-x tabs">${tabs}</nav>${facesGrid()}`;

  const filters = [['alle', 'Alle'], ['lange', 'Lange nicht'], ['selten', 'Selten'], ['nie', 'Nie getragen']]
    .map(([k, l]) => `<button class="pill ${CLOSET.filter === k ? 'on' : 'soft'}" data-act="cfilter" data-f="${k}">${l}</button>`).join('');
  let list = tab === 'alle' ? [...S.pieces] : cands(tab);
  if (CLOSET.filter === 'lange') list = list.filter(isStale);
  if (CLOSET.filter === 'selten') list = list.filter((p) => statOf(p).count <= 2);
  if (CLOSET.filter === 'nie') list = list.filter((p) => statOf(p).count === 0);
  list.sort((a, b) => { const la = statOf(a).last || '0000', lb = statOf(b).last || '0000'; return la < lb ? -1 : la > lb ? 1 : 0; });

  const tiles = list.map((p) => {
    const stale = isStale(p);
    return `<a class="tile" href="#/teil/${p.id}">${paperHTML(p, '', stale ? `<span class="badge">${statOf(p).count ? 'lange nicht' : 'neu'}</span>` : '')}
      <span class="tile-name">${esc(p.name)}</span><span class="sub ${stale && statOf(p).count ? 'warn' : ''}">${esc(wornText(p))} · ${statOf(p).count}×</span></a>`;
  }).join('');
  const newTile = `<a class="newtile" href="#/neu/${tab === 'alle' ? '' : tab}"><span class="iconbtn">${I.camera}</span><span>Neues Teil</span></a>`;
  const longLine = tab === 'alle' ? '' : `<p class="mono muted" style="margin:0;font-size:12px;text-align:center">${esc(SLOT[tab].long)}</p>`;
  const empty = !list.length && CLOSET.filter !== 'alle' ? `<div class="card empty"><p>Nichts in diesem Filter.</p></div>` : '';
  return `${head}<nav class="row scroll-x tabs">${tabs}</nav>${longLine}<div class="row scroll-x">${filters}</div>${empty}<div class="grid">${tiles}${newTile}</div>`;
}

function facesGrid() {
  const tiles = S.faces.map((f, i) => `<div class="paper facetile" style="--p:${PAPERS[i % PAPERS.length]}"><div class="inner" style="--r:${TILTS[i % TILTS.length]}deg"><img class="cut" style="--g:${GHOSTS[i % 3]}" src="/api/images/${esc(f.image_id)}" alt="Gesicht ${i + 1}"></div><button class="del" data-act="delface" data-id="${f.id}" aria-label="Gesicht ${i + 1} löschen">${I.x}</button></div>`).join('');
  return `<p class="note">Bei jedem Shuffle kriegt der Avatar eins davon. Je mehr Grimassen, desto besser.</p>
    <div class="faces">${tiles}<a class="newtile" style="min-height:0;aspect-ratio:1" href="#/neu/gesicht"><span class="iconbtn">${I.camera}</span><span>Gesicht</span></a></div>`;
}

// ----- Teil-Detail -----
function pieceView(id) {
  const p = pieceById(id);
  if (!p) return `${topBar(backBtn('#/schrank', 'Zurück'), '<h1 class="title">Nicht gefunden</h1>', '<span class="spacer"></span>')}<div class="card empty"><p>Dieses Teil gibt es nicht mehr.</p></div>`;
  const s = statOf(p);
  const mainSlot = p.slots[0];
  const head = topBar(backBtn(`#/schrank/${mainSlot || 'alle'}`, 'Zurück zum Schrank'),
    `<span class="mono muted" style="font-size:12px">${esc(p.slots.map((k) => SLOT[k]?.label).filter(Boolean).join(' · ') || 'ohne Schicht')}</span>`,
    `<span class="spacer"></span>`);
  const hero = paperHTML(p, 'hero', `<span class="tape l" aria-hidden="true"></span><span class="tape r" aria-hidden="true"></span>
    <label class="hero-btn">${I.camera}<span>Foto ändern</span><input class="sr" type="file" accept="image/*" data-file="replace" data-id="${p.id}"></label>`);

  const slotPills = SLOT_DEFS.map((d) => `<button class="pill ${p.slots.includes(d.key) ? 'on' : 'soft'}" data-act="pslot" data-id="${p.id}" data-slot="${d.key}" aria-pressed="${p.slots.includes(d.key)}">${esc(d.label)}</button>`).join('');
  const warmPills = WARMTH.map(([k, l]) => `<button class="pill ${p.warmth === k ? 'on' : 'soft'}" data-act="pwarm" data-id="${p.id}" data-v="${k}" aria-pressed="${p.warmth === k}">${l}</button>`).join('');
  const rainPill = `<button class="pill ${p.rain ? 'on' : 'soft'}" data-act="prain" data-id="${p.id}" aria-pressed="${p.rain}">${I.rain}<span>regen ok</span></button>`;

  // Oft kombiniert mit
  const co = {};
  for (const w of S.wears) {
    const ids = Object.values(w.outfit || {});
    if (!ids.includes(p.id)) continue;
    for (const o of ids) if (o !== p.id && pieceById(o)) co[o] = (co[o] || 0) + 1;
  }
  const combos = Object.entries(co).filter(([, c]) => c >= 2).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const comboHTML = combos.length ? `<div class="card section"><span class="k">Oft kombiniert mit</span><div class="wrap">${combos.map(([oid, c]) => {
    const o = pieceById(oid);
    return `<a class="pill soft combo" href="#/teil/${o.id}"><span class="mini">${cutHTML(o)}</span><span>${esc(o.name)}</span><span class="muted">${c}×</span></a>`;
  }).join('')}</div></div>` : '';

  const del = confirmDel === p.id
    ? `<button class="big danger" data-act="del" data-id="${p.id}">${I.trash}<span>Wirklich löschen?</span></button>`
    : `<button class="big secondary" data-act="del" data-id="${p.id}" style="flex:0 0 56px" aria-label="Teil löschen">${I.trash}</button>`;

  return `${head}${hero}
    <div><input class="name-input" value="${esc(p.name)}" data-pfield="name" data-id="${p.id}" aria-label="Name" maxlength="80">
      <p class="sub ${isStale(p) && s.count ? 'warn' : ''}" style="margin:2px 0 0">${esc(wornText(p))}${p.brand ? ' · ' + esc(p.brand) : ''}</p></div>
    <div class="card stats"><div><span class="k">Getragen</span><b>${s.count}×</b></div><div><span class="k">Zuletzt</span><b>${fmtDate(s.last)}</b></div><div><span class="k">Dabei seit</span><b>${fmtDate((p.created_at || '').slice(0, 10))}</b></div></div>
    <div class="card section">
      <div class="field"><span class="k">Passt in Schicht</span><div class="wrap">${slotPills}</div></div>
      <div class="field"><span class="k">Wetter</span><div class="wrap">${warmPills}${rainPill}</div></div>
      <div class="field"><span class="k">Farbe</span><div class="colorrow"><input type="color" value="${esc(p.color || '#BBBBBB')}" data-pfield="color" data-id="${p.id}" aria-label="Farbe"><span class="muted" style="font-size:14px">für Platzhalter und Übersicht</span></div></div>
    </div>
    ${comboHTML}
    <div class="card section">
      <div class="field"><label class="k" for="brand">Marke</label><input class="text-input" id="brand" value="${esc(p.brand || '')}" data-pfield="brand" data-id="${p.id}" maxlength="60" placeholder="optional"></div>
      <div class="field"><label class="k" for="notes">Notizen</label><textarea class="text-input" id="notes" rows="3" data-pfield="notes" data-id="${p.id}" placeholder="z. B. kratzt am Hals, besser mit Shirt drunter">${esc(p.notes || '')}</textarea></div>
    </div>
    <div class="bottom"><button class="big primary" data-act="togame" data-id="${p.id}">Ins Mini-Game</button>${del}</div>`;
}

// ----- Hinzufügen -----
function resetAdd(arg) {
  if (ADD) for (const r of [ADD.orig, ADD.cutRes, ADD.origRes]) if (r && r.url) URL.revokeObjectURL(r.url);
  const kind = arg === 'gesicht' ? 'face' : 'piece';
  const slot = SLOT[arg] ? arg : null;
  ADD = { kind, step: 'pick', slot, orig: null, cutRes: null, origRes: null, useCut: true, progress: '', cutError: '', error: '', saving: false,
    draft: { name: '', slots: slot ? [slot] : [], color: '#BBBBBB', warmth: 'mittel', rain: true, brand: '', notes: '' } };
}

function addView(arg) {
  if (!ADD) resetAdd(arg);
  const isFace = ADD.kind === 'face';
  const backHref = isFace ? '#/schrank/gesichter' : `#/schrank/${ADD.slot || 'alle'}`;
  const head = topBar(backBtn(backHref, 'Abbrechen'), `<h1 class="title">${isFace ? 'Neues Gesicht' : 'Neues Teil'}</h1>${ADD.slot ? `<span class="mono muted" style="font-size:11px">${esc(SLOT[ADD.slot].long)}</span>` : ''}`, '<span class="spacer"></span>');

  if (ADD.step === 'pick') {
    return `${head}<label class="drop card">
        <input type="file" accept="image/*" data-file="add" aria-label="Foto auswählen">
        <span class="iconbtn">${I.camera}</span>
        <strong>${isFace ? 'Selfie aufnehmen oder wählen' : 'Foto aufnehmen oder wählen'}</strong>
        <p>${isFace ? 'Grimasse ziehen erwünscht. Der Hintergrund wird automatisch entfernt.' : 'Am besten flach auf einem ruhigen Untergrund, ganzes Teil im Bild. Der Hintergrund wird automatisch entfernt.'}</p>
      </label>
      <p class="note">Oder ein schon freigestelltes Bild kopieren und hier einfügen.</p>
      ${ADD.error ? `<p class="note warn" role="alert">${esc(ADD.error)}</p>` : ''}`;
  }

  if (ADD.step === 'process') {
    return `${head}<div class="processing">${ADD.orig ? `<img src="${ADD.orig.url}" alt="">` : ''}<div class="scan"></div><div class="msg" id="progress">${esc(ADD.progress)}</div></div>
      <p class="note">Beim allerersten Mal lädt das Freistell-Modell einmalig, danach geht es schneller.</p>`;
  }

  // Details
  const res = ADD.useCut && ADD.cutRes ? ADD.cutRes : ADD.origRes;
  const preview = `<div class="paper hero" style="--p:${isFace ? '#FFD6EA' : '#FFF3A6'}"><span class="tape l"></span><span class="tape r"></span><div class="inner" style="--r:-2deg"><img class="cut" style="--g:${GHOSTS[0]}" src="${res.url}" alt="Vorschau"></div></div>`;
  const seg = ADD.cutRes ? `<div class="seg" role="group" aria-label="Bildvariante"><button data-act="usecut" data-v="1" aria-pressed="${ADD.useCut}">Freigestellt</button><button data-act="usecut" data-v="0" aria-pressed="${!ADD.useCut}">Original</button></div>` : '';
  const cutNote = ADD.cutError ? `<p class="note warn">${esc(ADD.cutError)}</p>` : '';
  const saveBtns = `<div class="bottom">
      <button class="big primary" data-act="addsave" data-next="0" ${ADD.saving ? 'disabled' : ''}>${ADD.saving ? 'Speichert …' : 'Speichern'}</button>
      <button class="big secondary" data-act="addsave" data-next="1" ${ADD.saving ? 'disabled' : ''}>+ Nächstes</button>
    </div>
    <button class="pill soft" data-act="addreset" style="align-self:center">Anderes Foto</button>`;

  if (isFace) return `${head}${preview}${seg}${cutNote}${saveBtns}`;

  const d = ADD.draft;
  const slotPills = SLOT_DEFS.map((s) => `<button class="pill ${d.slots.includes(s.key) ? 'on' : 'soft'}" data-act="dslot" data-slot="${s.key}" aria-pressed="${d.slots.includes(s.key)}">${esc(s.label)}</button>`).join('');
  const warmPills = WARMTH.map(([k, l]) => `<button class="pill ${d.warmth === k ? 'on' : 'soft'}" data-act="dwarm" data-v="${k}" aria-pressed="${d.warmth === k}">${l}</button>`).join('');
  return `${head}${preview}${seg}${cutNote}
    <div class="card section">
      <div class="field"><label class="k" for="dname">Name</label><input class="text-input" id="dname" data-dfield="name" value="${esc(d.name)}" maxlength="80" placeholder="z. B. Strickpulli creme" autocomplete="off"></div>
      <div class="field"><span class="k">Passt in Schicht ${d.slots.length ? '' : '<span class="warn">(mind. eine)</span>'}</span><div class="wrap">${slotPills}</div></div>
      <div class="field"><span class="k">Wetter</span><div class="wrap">${warmPills}<button class="pill ${d.rain ? 'on' : 'soft'}" data-act="drain" aria-pressed="${d.rain}">${I.rain}<span>regen ok</span></button></div></div>
      <div class="field"><span class="k">Farbe</span><div class="colorrow"><input type="color" value="${esc(d.color)}" data-dfield="color" aria-label="Farbe"><span class="muted" style="font-size:14px">automatisch erkannt</span></div></div>
      <div class="field"><label class="k" for="dbrand">Marke</label><input class="text-input" id="dbrand" data-dfield="brand" value="${esc(d.brand)}" maxlength="60" placeholder="optional"></div>
    </div>
    ${saveBtns}`;
}

// ----- Einstellungen -----
function settingsView() {
  const loc = S.settings.location || DEFAULT_LOC;
  const theme = document.documentElement.dataset.theme || 'grau';
  const head = topBar(backBtn('#/', 'Zurück'), '<h1 class="title">Einstellungen</h1>', '<span class="spacer"></span>');
  return `${head}
    <div class="card section">
      <div class="field"><span class="k">Standort fürs Wetter</span><strong>${esc(loc.name)}</strong><span class="muted" style="font-size:13px">${esc(loc.region || '')}</span></div>
      <div class="field"><label class="k" for="locq">Anderen Ort suchen</label><input class="text-input" id="locq" data-locsearch placeholder="z. B. Köln" autocomplete="off"><div class="results" id="locres"></div></div>
    </div>
    <div class="card section">
      <span class="k">Look</span>
      <div class="themes">${THEMES.map(([k, l, bg, fg]) => `<button class="theme-opt" style="background:${bg};color:${fg}" data-act="theme" data-v="${k}" aria-pressed="${theme === k}">${l}</button>`).join('')}</div>
    </div>
    <div class="card section">
      <a class="pill soft" href="#/schrank/gesichter" style="justify-content:flex-start">${I.camera}<span>Gesichter verwalten (${S.faces.length})</span></a>
      <button class="pill soft" data-act="logout" style="justify-content:flex-start">${I.x}<span>Abmelden</span></button>
    </div>
    <p class="note">fithausen · ${S.pieces.length} Teile · ${S.wears.length} Outfits geloggt</p>`;
}

// ---------------------------------------------------------------------------
// Routing & Render
// ---------------------------------------------------------------------------
function route() {
  const h = (location.hash || '#/').slice(1);
  const [, view = '', arg = ''] = h.split('/');
  const map = { '': 'game', schrank: 'closet', teil: 'piece', neu: 'add', einstellungen: 'settings' };
  return { view: map[view] || 'game', arg: decodeURIComponent(arg) };
}

function render() {
  let html;
  if (S.phase === 'loading') html = splashView();
  else if (S.phase === 'login') html = loginView();
  else if (S.phase === 'error') html = errorView();
  else {
    computeStats();
    const { view, arg } = route();
    if (view === 'closet') html = closetView(arg);
    else if (view === 'piece') html = pieceView(arg);
    else if (view === 'add') html = addView(arg);
    else if (view === 'settings') html = settingsView();
    else html = gameView();
    const key = view + ':' + arg;
    if (key !== lastView) { window.scrollTo(0, 0); confirmDel = null; }
    lastView = key;
  }
  app.innerHTML = html;
  const tc = getComputedStyle(document.body).backgroundColor;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta && tc) meta.setAttribute('content', tc);
}

window.addEventListener('hashchange', () => {
  const r = route();
  if (r.view === 'add') resetAdd(r.arg);
  render();
});

// ---------------------------------------------------------------------------
// Events
// ---------------------------------------------------------------------------
app.addEventListener('click', async (ev) => {
  const el = ev.target.closest('[data-act]');
  if (!el || el.disabled) return;
  const act = el.dataset.act;
  const slot = el.dataset.slot;
  const id = el.dataset.id;

  switch (act) {
    case 'reload': location.reload(); return;
    case 'sel': G.sel = slot; G.addOpen = false; render(); return;
    case 'step': step(Number(el.dataset.dir)); return;
    case 'roll': rollSlot(G.sel); G.touched = true; render(); return;
    case 'hold': G.held[G.sel] = !G.held[G.sel]; render(); return;
    case 'drop':
      G.active = G.active.filter((k) => k !== G.sel); delete G.held[G.sel]; G.sel = defaultSel(); G.touched = true; render(); return;
    case 'addopen': G.addOpen = !G.addOpen; render(); return;
    case 'addslot':
      if (!G.active.includes(slot)) G.active = ORDER.filter((k) => G.active.includes(k) || k === slot);
      rollSlot(slot); G.sel = slot; G.addOpen = false; G.touched = true; render(); return;
    case 'face': rollFace(); G.touched = true; render(); return;
    case 'shuffle': shuffleAll(true); G.touched = true; render(); return;
    case 'wfilter': G.wfilter = !G.wfilter; render(); return;
    case 'wear': await wearToday(); return;

    case 'cfilter': CLOSET.filter = el.dataset.f; render(); return;
    case 'delface':
      try { await api('/faces/' + id, { method: 'DELETE' }); S.faces = S.faces.filter((f) => f.id !== id); if (G.face === id) G.face = null; render(); } catch (e) { toast(e.message); }
      return;

    case 'pslot': {
      const p = pieceById(id); if (!p) return;
      const next = p.slots.includes(slot) ? p.slots.filter((k) => k !== slot) : ORDER.filter((k) => p.slots.includes(k) || k === slot);
      if (!next.length) { toast('Mindestens eine Schicht'); return; }
      p.slots = next; render(); savePiece(p.id, { slots: next }); return;
    }
    case 'pwarm': { const p = pieceById(id); p.warmth = el.dataset.v; render(); savePiece(id, { warmth: p.warmth }); return; }
    case 'prain': { const p = pieceById(id); p.rain = !p.rain; render(); savePiece(id, { rain: p.rain }); return; }
    case 'togame': {
      const p = pieceById(id); if (!p) return;
      const s = p.slots.find((k) => G.active.includes(k)) || p.slots[0];
      if (!s) { toast('Erst eine Schicht wählen'); return; }
      if (!G.init) initGame();
      for (const k of G.active) if (k !== s && G.pick[k] === p.id) rollSlot(k);
      if (!G.active.includes(s)) G.active = ORDER.filter((k) => G.active.includes(k) || k === s);
      G.pick[s] = p.id; G.sel = s; G.touched = true;
      location.hash = '#/';
      return;
    }
    case 'del': {
      if (confirmDel !== id) { confirmDel = id; render(); return; }
      try {
        await api('/pieces/' + id, { method: 'DELETE' });
        S.pieces = S.pieces.filter((p) => p.id !== id);
        confirmDel = null; toast('Gelöscht');
        location.hash = '#/schrank';
      } catch (e) { toast(e.message); }
      return;
    }

    case 'usecut': ADD.useCut = el.dataset.v === '1'; render(); return;
    case 'dslot': {
      const d = ADD.draft;
      d.slots = d.slots.includes(slot) ? d.slots.filter((k) => k !== slot) : ORDER.filter((k) => d.slots.includes(k) || k === slot);
      render(); return;
    }
    case 'dwarm': ADD.draft.warmth = el.dataset.v; render(); return;
    case 'drain': ADD.draft.rain = !ADD.draft.rain; render(); return;
    case 'addreset': resetAdd(ADD.kind === 'face' ? 'gesicht' : ADD.slot); render(); return;
    case 'addsave': await addSave(el.dataset.next === '1'); return;

    case 'theme': setTheme(el.dataset.v); return;
    case 'setloc': {
      const loc = JSON.parse(el.dataset.loc);
      S.settings.location = loc;
      try { await api('/settings', { method: 'PUT', body: JSON.stringify({ location: loc }) }); } catch (e) { toast(e.message); }
      toast(`Wetter jetzt für ${loc.name}`);
      render(); loadWeather(); return;
    }
    case 'logout':
      try { await api('/logout', { method: 'POST' }); } catch (e) { /* egal */ }
      S.phase = 'login'; render(); return;
  }
});

app.addEventListener('input', (ev) => {
  const el = ev.target;
  if (el.dataset.pfield) {
    const p = pieceById(el.dataset.id); if (!p) return;
    const f = el.dataset.pfield;
    p[f] = el.value;
    debounce('p' + p.id + f, () => savePiece(p.id, { [f]: el.value }), f === 'color' ? 400 : 700);
  } else if (el.dataset.dfield) {
    ADD.draft[el.dataset.dfield] = el.value;
  } else if ('locsearch' in el.dataset) {
    const q = el.value.trim();
    debounce('loc', () => searchLoc(q), 350);
  }
});

app.addEventListener('change', async (ev) => {
  const el = ev.target;
  if (el.dataset.file === 'add' && el.files && el.files[0]) startProcess(el.files[0]);
  if (el.dataset.file === 'replace' && el.files && el.files[0]) replacePhoto(el.dataset.id, el.files[0]);
});

app.addEventListener('submit', async (ev) => {
  const form = ev.target;
  if (form.dataset.form !== 'login') return;
  ev.preventDefault();
  const pw = form.password.value;
  const btn = form.querySelector('button');
  btn.disabled = true;
  try {
    await api('/login', { method: 'POST', body: JSON.stringify({ password: pw }) });
    S.phase = 'loading'; render(); boot();
  } catch (e) {
    btn.disabled = false;
    const err = document.getElementById('loginErr');
    if (err) err.textContent = e.message;
  }
});

// Wischen auf der Bühne = nächstes/vorheriges Teil
let touchX = null;
app.addEventListener('touchstart', (ev) => { if (ev.target.closest('#stage')) touchX = ev.touches[0].clientX; }, { passive: true });
app.addEventListener('touchend', (ev) => {
  if (touchX === null) return;
  const dx = ev.changedTouches[0].clientX - touchX;
  touchX = null;
  if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
}, { passive: true });

// Einfügen eines (freigestellten) Bildes beim Hinzufügen
document.addEventListener('paste', (ev) => {
  if (route().view !== 'add' || !ADD || ADD.step !== 'pick') return;
  const item = [...(ev.clipboardData?.items || [])].find((i) => i.type.startsWith('image/'));
  if (item) { ev.preventDefault(); startProcess(item.getAsFile(), true); }
});

// ---------------------------------------------------------------------------
// Aktionen
// ---------------------------------------------------------------------------
async function savePiece(id, patch) {
  try {
    const p = await api('/pieces/' + id, { method: 'PUT', body: JSON.stringify(patch) });
    const i = S.pieces.findIndex((x) => x.id === id);
    if (i >= 0) {
      // lokale Eingaben nicht überschreiben, nur Metadaten übernehmen
      S.pieces[i].updated_at = p.updated_at;
      if ('image_id' in patch) { S.pieces[i].image_id = p.image_id; render(); }
    }
  } catch (e) { toast('Nicht gespeichert: ' + e.message); }
}

async function wearToday() {
  const outfit = currentOutfit();
  if (!Object.keys(outfit).length) { toast('Erst ein Outfit zusammenstellen'); return; }
  const d = today();
  try {
    await api('/wears/' + d, { method: 'PUT', body: JSON.stringify({ outfit, face_id: G.face }) });
    S.wears = S.wears.filter((w) => w.date !== d);
    S.wears.unshift({ date: d, outfit, face_id: G.face });
    toast('Outfit für heute gespeichert');
    render();
  } catch (e) { toast(e.message); }
}

function setTheme(t) {
  document.documentElement.dataset.theme = t;
  try { localStorage.setItem('fh-theme', t); } catch (e) { /* privat */ }
  S.settings.theme = t;
  api('/settings', { method: 'PUT', body: JSON.stringify({ theme: t }) }).catch(() => {});
  render();
}

async function searchLoc(q) {
  const box = document.getElementById('locres');
  if (!box) return;
  if (q.length < 2) { box.innerHTML = ''; return; }
  try {
    const d = await (await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=6&language=de&format=json`)).json();
    const res = (d.results || []).map((r) => ({ name: r.name, region: [r.admin1, r.country].filter(Boolean).join(', '), lat: r.latitude, lon: r.longitude }));
    box.innerHTML = res.length
      ? res.map((r) => `<button class="result" data-act="setloc" data-loc="${esc(JSON.stringify(r))}">${esc(r.name)}<span>${esc(r.region)}</span></button>`).join('')
      : '<p class="note">Nichts gefunden.</p>';
  } catch (e) { box.innerHTML = '<p class="note">Suche gerade nicht erreichbar.</p>'; }
}

// ---------------------------------------------------------------------------
// Bilder: Freistellen, Zuschneiden, Verkleinern
// ---------------------------------------------------------------------------
let bgMod = null;
async function removeBg(blob, onProgress) {
  if (!bgMod) bgMod = await import(BG_LIB);
  const fn = bgMod.removeBackground || (bgMod.default && bgMod.default.removeBackground) || bgMod.default;
  const cfg = { progress: onProgress, output: { format: 'image/png' } };
  try { return await fn(blob, { ...cfg, model: 'isnet_quint8' }); } catch (e) { return await fn(blob, cfg); }
}
function loadImg(src) {
  return new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; });
}
function toBlob(c, type, q) { return new Promise((r) => c.toBlob(r, type, q)); }
async function blobToImg(blob) {
  const url = URL.createObjectURL(blob);
  try { return await loadImg(url); } finally { setTimeout(() => URL.revokeObjectURL(url), 1000); }
}
async function downscale(blob, max) {
  const img = await blobToImg(blob);
  const s = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
  const c = document.createElement('canvas');
  c.width = Math.round(img.naturalWidth * s); c.height = Math.round(img.naturalHeight * s);
  c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
  return toBlob(c, 'image/jpeg', 0.9);
}
function avgColor(data, transparent) {
  let r = 0, g = 0, b = 0, n = 0;
  for (let i = 0; i < data.length; i += 16) {
    if (transparent && data[i + 3] < 200) continue;
    r += data[i]; g += data[i + 1]; b += data[i + 2]; n++;
  }
  if (!n) return '#BBBBBB';
  const h = (v) => Math.round(v / n).toString(16).padStart(2, '0');
  return `#${h(r)}${h(g)}${h(b)}`;
}
// Schneidet transparente Ränder weg, verkleinert, wählt WebP/PNG (mit Alpha) oder JPEG
async function finalize(blob, transparent) {
  const img = await blobToImg(blob);
  let sx = 0, sy = 0, sw = img.naturalWidth, sh = img.naturalHeight;
  const work = document.createElement('canvas');
  work.width = sw; work.height = sh;
  const wctx = work.getContext('2d', { willReadFrequently: true });
  wctx.drawImage(img, 0, 0);
  let color;
  if (transparent) {
    const data = wctx.getImageData(0, 0, sw, sh).data;
    let minX = sw, minY = sh, maxX = -1, maxY = -1;
    for (let y = 0; y < sh; y += 2) {
      for (let x = 0; x < sw; x += 2) {
        if (data[(y * sw + x) * 4 + 3] > 24) { if (x < minX) minX = x; if (x > maxX) maxX = x; if (y < minY) minY = y; if (y > maxY) maxY = y; }
      }
    }
    if (maxX < 0) throw new Error('Nichts erkannt');
    const pad = Math.round(Math.max(maxX - minX, maxY - minY) * 0.03);
    sx = Math.max(0, minX - pad); sy = Math.max(0, minY - pad);
    sw = Math.min(img.naturalWidth, maxX + pad) - sx; sh = Math.min(img.naturalHeight, maxY + pad) - sy;
    color = avgColor(data, true);
  } else {
    const cx = Math.round(sw * 0.25), cy = Math.round(sh * 0.25);
    color = avgColor(wctx.getImageData(cx, cy, Math.max(1, sw / 2), Math.max(1, sh / 2)).data, false);
  }
  let max = transparent ? 900 : 1000;
  for (let attempt = 0; attempt < 4; attempt++) {
    const s = Math.min(1, max / Math.max(sw, sh));
    const c = document.createElement('canvas');
    c.width = Math.max(1, Math.round(sw * s)); c.height = Math.max(1, Math.round(sh * s));
    c.getContext('2d').drawImage(work, sx, sy, sw, sh, 0, 0, c.width, c.height);
    let out;
    if (transparent) {
      out = await toBlob(c, 'image/webp', 0.86);
      if (!out || out.type !== 'image/webp') out = await toBlob(c, 'image/png');
    } else {
      out = await toBlob(c, 'image/jpeg', 0.85);
    }
    if (out && out.size < 1_500_000) return { blob: out, url: URL.createObjectURL(out), color };
    max = Math.round(max * 0.75);
  }
  throw new Error('Bild bleibt zu groß');
}

function setProgress(msg) {
  ADD.progress = msg;
  const el = document.getElementById('progress');
  if (el) el.textContent = msg;
}

async function startProcess(file, pasted = false) {
  ADD.step = 'process'; ADD.error = ''; ADD.cutError = '';
  ADD.progress = 'Bild wird vorbereitet …';
  render();
  try {
    const small = await downscale(file, 1400);
    ADD.orig = { blob: small, url: URL.createObjectURL(small) };
    render();
    // Eingefügte PNGs mit Transparenz direkt übernehmen
    let cut = null;
    if (pasted && file.type === 'image/png') {
      try { cut = await finalize(file, true); } catch (e) { cut = null; }
    }
    if (!cut) {
      try {
        setProgress('Freistell-Modell wird geladen …');
        const raw = await removeBg(small, (key, cur, total) => {
          if (String(key).includes('fetch') && total) setProgress(`Lade Freistell-Modell (nur beim 1. Mal) · ${Math.round((cur / total) * 100)} %`);
          else setProgress('Stelle frei …');
        });
        setProgress('Fast fertig …');
        cut = await finalize(raw, true);
      } catch (e) {
        console.warn('Freistellen fehlgeschlagen', e);
        ADD.cutError = 'Freistellen hat nicht geklappt, deshalb siehst du das Original. Du kannst trotzdem speichern.';
      }
    }
    ADD.origRes = await finalize(small, false);
    ADD.cutRes = cut;
    ADD.useCut = !!cut;
    ADD.draft.color = (cut || ADD.origRes).color;
    ADD.step = 'details';
    render();
    if (ADD.kind === 'piece') document.getElementById('dname')?.focus({ preventScroll: true });
  } catch (e) {
    console.error(e);
    ADD.step = 'pick'; ADD.error = 'Das Bild konnte nicht gelesen werden. Probier ein anderes.';
    render();
  }
}

async function uploadImage(res) {
  return api('/images', { method: 'POST', body: res.blob, headers: { 'Content-Type': res.blob.type } });
}

async function addSave(next) {
  const res = ADD.useCut && ADD.cutRes ? ADD.cutRes : ADD.origRes;
  if (!res) return;
  if (ADD.kind === 'piece' && !ADD.draft.slots.length) { toast('Wähl mindestens eine Schicht'); return; }
  ADD.saving = true; render();
  try {
    const img = await uploadImage(res);
    let target;
    if (ADD.kind === 'face') {
      const f = await api('/faces', { method: 'POST', body: JSON.stringify({ image_id: img.id }) });
      S.faces.push(f);
      if (!G.face) G.face = f.id;
      toast('Gesicht gespeichert');
      target = '#/schrank/gesichter';
    } else {
      const d = ADD.draft;
      const name = d.name.trim() || `${SLOT[d.slots[0]].label} ${cands(d.slots[0]).length + 1}`;
      const p = await api('/pieces', { method: 'POST', body: JSON.stringify({ ...d, name, image_id: img.id }) });
      S.pieces.unshift(p);
      toast(`„${p.name}“ gespeichert`);
      target = '#/teil/' + p.id;
    }
    if (next) {
      const keep = ADD.kind === 'face' ? 'gesicht' : (ADD.slot || ADD.draft.slots[0]);
      const keepDraft = ADD.kind === 'piece' ? { slots: ADD.draft.slots, warmth: ADD.draft.warmth, rain: ADD.draft.rain } : null;
      resetAdd(keep);
      if (keepDraft) Object.assign(ADD.draft, keepDraft);
      render();
    } else {
      location.hash = target;
    }
  } catch (e) {
    ADD.saving = false; render();
    toast('Speichern fehlgeschlagen: ' + e.message);
  }
}

async function replacePhoto(id, file) {
  const ov = document.createElement('div');
  ov.className = 'overlay';
  ov.innerHTML = '<div class="card"><p id="progress">Stelle frei …</p></div>';
  document.body.appendChild(ov);
  const setMsg = (m) => { const e = ov.querySelector('#progress'); if (e) e.textContent = m; };
  try {
    const small = await downscale(file, 1400);
    let res;
    try {
      const raw = await removeBg(small, (key, cur, total) => {
        if (String(key).includes('fetch') && total) setMsg(`Lade Freistell-Modell · ${Math.round((cur / total) * 100)} %`);
        else setMsg('Stelle frei …');
      });
      res = await finalize(raw, true);
    } catch (e) {
      res = await finalize(small, false);
      toast('Freistellen ging nicht, Original genommen');
    }
    const img = await uploadImage(res);
    await savePiece(id, { image_id: img.id });
    URL.revokeObjectURL(res.url);
    toast('Foto aktualisiert');
  } catch (e) {
    toast('Hat nicht geklappt: ' + e.message);
  } finally {
    ov.remove();
  }
}

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------
async function boot() {
  try {
    const d = await api('/state');
    S.pieces = d.pieces; S.wears = d.wears; S.faces = d.faces; S.settings = d.settings || {};
    if (S.settings.theme) {
      document.documentElement.dataset.theme = S.settings.theme;
      try { localStorage.setItem('fh-theme', S.settings.theme); } catch (e) { /* privat */ }
    }
    S.phase = 'ready';
    const r = route();
    if (r.view === 'add') resetAdd(r.arg);
    render();
    loadWeather();
  } catch (e) {
    if (e.status === 401) S.phase = 'login';
    else { S.phase = 'error'; S.err = e; }
    render();
  }
}
render();
boot();
