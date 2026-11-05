// fithausen API – läuft als Cloudflare Pages Function unter /api/*
// Braucht: D1-Binding "DB" und Umgebungsvariable "APP_PASSWORD".

const SLOTS = ['kopf', 'schal', 'aussen', 'drueber', 'mitte', 'basis', 'hose', 'schuhe', 'tasche'];
const WARMTH = ['luftig', 'mittel', 'warm'];
const SETTING_KEYS = ['location', 'theme'];
const MAX_IMAGE_BYTES = 1_900_000; // D1 erlaubt max. ~2 MB pro Zeile

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS pieces (
    id TEXT PRIMARY KEY, name TEXT NOT NULL, slots TEXT NOT NULL DEFAULT '[]',
    color TEXT, warmth TEXT DEFAULT 'mittel', rain INTEGER DEFAULT 1,
    brand TEXT, notes TEXT, image_id TEXT,
    created_at TEXT NOT NULL, updated_at TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS wears (
    date TEXT PRIMARY KEY, outfit TEXT NOT NULL, face_id TEXT, created_at TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS faces (
    id TEXT PRIMARY KEY, image_id TEXT NOT NULL, created_at TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS images (
    id TEXT PRIMARY KEY, mime TEXT NOT NULL, data BLOB NOT NULL, created_at TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL)`,
];

let schemaReady = false;

export async function onRequest(ctx) {
  try {
    return await handle(ctx);
  } catch (e) {
    return json({ error: e && e.message ? e.message : 'Serverfehler' }, 500);
  }
}

async function handle({ request, env, params }) {
  const method = request.method;
  const parts = Array.isArray(params.path) ? params.path : params.path ? [params.path] : [];
  const [a, b] = parts;

  if (!env.DB) return json({ error: 'Die Datenbank (D1) ist noch nicht verbunden.', code: 'NO_DB' }, 500);
  if (!env.APP_PASSWORD) return json({ error: 'Die Variable APP_PASSWORD fehlt.', code: 'NO_PASSWORD' }, 500);
  const db = env.DB;
  if (!schemaReady) {
    await db.batch(SCHEMA.map((s) => db.prepare(s)));
    schemaReady = true;
  }

  // ---------- Login ----------
  if (a === 'login' && method === 'POST') {
    const body = await request.json().catch(() => ({}));
    const pw = typeof body.password === 'string' ? body.password : '';
    const [given, real] = await Promise.all([token(pw), token(env.APP_PASSWORD)]);
    if (given !== real) {
      await new Promise((r) => setTimeout(r, 700));
      return json({ error: 'Falsches Passwort' }, 401);
    }
    return json({ ok: true }, 200, { 'Set-Cookie': cookie(real, 31536000) });
  }
  if (a === 'logout') return json({ ok: true }, 200, { 'Set-Cookie': cookie('', 0) });

  if (!(await isAuthed(request, env))) return json({ error: 'Nicht angemeldet', code: 'AUTH' }, 401);

  // ---------- Gesamtzustand ----------
  if (a === 'state' && method === 'GET') {
    const [p, w, f, s] = await db.batch([
      db.prepare('SELECT * FROM pieces ORDER BY created_at DESC'),
      db.prepare('SELECT * FROM wears ORDER BY date DESC'),
      db.prepare('SELECT id, image_id, created_at FROM faces ORDER BY created_at'),
      db.prepare('SELECT * FROM settings'),
    ]);
    return json({
      pieces: p.results.map(rowPiece),
      wears: w.results.map((r) => ({ date: r.date, outfit: safeParse(r.outfit, {}), face_id: r.face_id })),
      faces: f.results,
      settings: Object.fromEntries(s.results.map((r) => [r.key, safeParse(r.value, null)])),
    });
  }

  // ---------- Bilder ----------
  if (a === 'images') {
    if (!b && method === 'POST') {
      const mime = (request.headers.get('content-type') || '').split(';')[0].trim();
      if (!/^image\/(png|jpeg|webp)$/.test(mime)) return json({ error: 'Nur PNG, JPEG oder WebP' }, 400);
      const buf = await request.arrayBuffer();
      if (!buf.byteLength) return json({ error: 'Leeres Bild' }, 400);
      if (buf.byteLength > MAX_IMAGE_BYTES) return json({ error: 'Bild ist zu groß' }, 413);
      const id = uid();
      await db.prepare('INSERT INTO images (id, mime, data, created_at) VALUES (?, ?, ?, ?)')
        .bind(id, mime, buf, now()).run();
      return json({ id });
    }
    if (b && method === 'GET') {
      const row = await db.prepare('SELECT mime, data FROM images WHERE id = ?').bind(b).first();
      if (!row) return new Response('Not found', { status: 404 });
      return new Response(new Uint8Array(row.data), {
        headers: { 'Content-Type': row.mime, 'Cache-Control': 'private, max-age=31536000, immutable' },
      });
    }
  }

  // ---------- Teile ----------
  if (a === 'pieces') {
    if (!b && method === 'POST') {
      const body = await request.json();
      const c = cleanPiece(body);
      const id = uid();
      const t = now();
      await db.prepare(`INSERT INTO pieces (id, name, slots, color, warmth, rain, brand, notes, image_id, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
        .bind(id, c.name ?? 'Neues Teil', c.slots ?? '[]', c.color ?? null, c.warmth ?? 'mittel',
          c.rain ?? 1, c.brand ?? null, c.notes ?? null, c.image_id ?? null, t, t).run();
      const row = await db.prepare('SELECT * FROM pieces WHERE id = ?').bind(id).first();
      return json(rowPiece(row));
    }
    if (b && method === 'PUT') {
      const old = await db.prepare('SELECT image_id FROM pieces WHERE id = ?').bind(b).first();
      if (!old) return json({ error: 'Teil nicht gefunden' }, 404);
      const c = cleanPiece(await request.json());
      const keys = Object.keys(c);
      if (keys.length) {
        const sets = keys.map((k) => `${k} = ?`).join(', ');
        await db.prepare(`UPDATE pieces SET ${sets}, updated_at = ? WHERE id = ?`)
          .bind(...keys.map((k) => c[k]), now(), b).run();
        if ('image_id' in c && old.image_id && old.image_id !== c.image_id) {
          await db.prepare('DELETE FROM images WHERE id = ?').bind(old.image_id).run();
        }
      }
      const row = await db.prepare('SELECT * FROM pieces WHERE id = ?').bind(b).first();
      return json(rowPiece(row));
    }
    if (b && method === 'DELETE') {
      const old = await db.prepare('SELECT image_id FROM pieces WHERE id = ?').bind(b).first();
      const stmts = [db.prepare('DELETE FROM pieces WHERE id = ?').bind(b)];
      if (old && old.image_id) stmts.push(db.prepare('DELETE FROM images WHERE id = ?').bind(old.image_id));
      await db.batch(stmts);
      return json({ ok: true });
    }
  }

  // ---------- Getragen-Log (ein Outfit pro Tag) ----------
  if (a === 'wears' && b && /^\d{4}-\d{2}-\d{2}$/.test(b)) {
    if (method === 'PUT') {
      const body = await request.json();
      const outfit = {};
      if (body && typeof body.outfit === 'object') {
        for (const [k, v] of Object.entries(body.outfit)) {
          if (SLOTS.includes(k) && typeof v === 'string') outfit[k] = v.slice(0, 40);
        }
      }
      const faceId = typeof body.face_id === 'string' ? body.face_id.slice(0, 40) : null;
      await db.prepare('INSERT OR REPLACE INTO wears (date, outfit, face_id, created_at) VALUES (?, ?, ?, ?)')
        .bind(b, JSON.stringify(outfit), faceId, now()).run();
      return json({ date: b, outfit, face_id: faceId });
    }
    if (method === 'DELETE') {
      await db.prepare('DELETE FROM wears WHERE date = ?').bind(b).run();
      return json({ ok: true });
    }
  }

  // ---------- Gesichter ----------
  if (a === 'faces') {
    if (!b && method === 'POST') {
      const body = await request.json();
      if (typeof body.image_id !== 'string') return json({ error: 'image_id fehlt' }, 400);
      const id = uid();
      const t = now();
      await db.prepare('INSERT INTO faces (id, image_id, created_at) VALUES (?, ?, ?)').bind(id, body.image_id, t).run();
      return json({ id, image_id: body.image_id, created_at: t });
    }
    if (b && method === 'DELETE') {
      const old = await db.prepare('SELECT image_id FROM faces WHERE id = ?').bind(b).first();
      const stmts = [db.prepare('DELETE FROM faces WHERE id = ?').bind(b)];
      if (old) stmts.push(db.prepare('DELETE FROM images WHERE id = ?').bind(old.image_id));
      await db.batch(stmts);
      return json({ ok: true });
    }
  }

  // ---------- Einstellungen ----------
  if (a === 'settings' && method === 'PUT') {
    const body = await request.json();
    const stmts = [];
    for (const k of SETTING_KEYS) {
      if (k in body) {
        stmts.push(db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').bind(k, JSON.stringify(body[k])));
      }
    }
    if (stmts.length) await db.batch(stmts);
    return json({ ok: true });
  }

  return json({ error: 'Unbekannte Anfrage' }, 404);
}

// ---------- Helfer ----------
function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers },
  });
}

function cookie(value, maxAge) {
  return `fh=${value}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`;
}

async function token(secret) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', enc.encode(secret || ' '), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode('fithausen-session-v1'));
  return [...new Uint8Array(sig)].map((x) => x.toString(16).padStart(2, '0')).join('');
}

async function isAuthed(request, env) {
  const c = request.headers.get('cookie') || '';
  const m = c.match(/(?:^|;\s*)fh=([a-f0-9]{64})/);
  if (!m) return false;
  return m[1] === (await token(env.APP_PASSWORD));
}

function uid() {
  return crypto.randomUUID().replace(/-/g, '').slice(0, 20);
}

function now() {
  return new Date().toISOString();
}

function safeParse(s, fallback) {
  try { return JSON.parse(s); } catch { return fallback; }
}

function str(v, max) {
  if (v == null) return null;
  const s = String(v).trim().slice(0, max);
  return s || null;
}

function cleanPiece(b) {
  const o = {};
  if (!b || typeof b !== 'object') return o;
  if ('name' in b) o.name = str(b.name, 80) || 'Ohne Namen';
  if ('slots' in b) o.slots = JSON.stringify((Array.isArray(b.slots) ? b.slots : []).filter((s) => SLOTS.includes(s)).slice(0, 4));
  if ('color' in b) o.color = /^#[0-9a-f]{6}$/i.test(b.color || '') ? b.color : null;
  if ('warmth' in b) o.warmth = WARMTH.includes(b.warmth) ? b.warmth : 'mittel';
  if ('rain' in b) o.rain = b.rain ? 1 : 0;
  if ('brand' in b) o.brand = str(b.brand, 60);
  if ('notes' in b) o.notes = str(b.notes, 2000);
  if ('image_id' in b) o.image_id = str(b.image_id, 40);
  return o;
}

function rowPiece(r) {
  return {
    id: r.id, name: r.name, slots: safeParse(r.slots, []), color: r.color, warmth: r.warmth || 'mittel',
    rain: !!r.rain, brand: r.brand, notes: r.notes, image_id: r.image_id,
    created_at: r.created_at, updated_at: r.updated_at,
  };
}
