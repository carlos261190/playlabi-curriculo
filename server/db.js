/* ============================================================
   PLAYLABI CURRÍCULO — CAPA DE DATOS
   Un solo interfaz, dos motores:

   · Sin DATABASE_URL  → SQLite (integrado en Node, sin dependencias).
     Es lo que se usa en tu Mac mientras desarrollas.
   · Con DATABASE_URL  → PostgreSQL (Neon o Supabase).
     Es lo que se usará en Netlify, donde no se puede guardar un
     archivo en disco.

   El SQL está escrito para funcionar igual en ambos. Las diferencias
   de sintaxis (marcadores ? frente a $1) las resuelve el adaptador.
   ============================================================ */
import { DatabaseSync } from "node:sqlite";
import { randomUUID, randomBytes } from "node:crypto";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

const URL_POSTGRES = process.env.DATABASE_URL || "";
export const MOTOR = URL_POSTGRES ? "postgres" : "sqlite";

let sqlite = null;
let pool = null;

/* ── Arranque ─────────────────────────────────────────────── */

async function conectar() {
  if (MOTOR === "postgres") {
    if (pool) return;
    const { default: pg } = await import("pg");
    pool = new pg.Pool({
      connectionString: URL_POSTGRES,
      ssl: { rejectUnauthorized: false },
      max: 3,
    });
    return;
  }
  if (sqlite) return;
  const ruta = resolve(process.env.SQLITE_PATH || "./datos/curriculo.db");
  mkdirSync(dirname(ruta), { recursive: true });
  sqlite = new DatabaseSync(ruta);
  sqlite.exec("PRAGMA journal_mode = WAL");
  sqlite.exec("PRAGMA foreign_keys = ON");
}

/* Convierte los ? del SQL en $1, $2… que es lo que espera Postgres */
const aPostgres = (sql) => { let n = 0; return sql.replace(/\?/g, () => `$${++n}`); };

export async function ejecutar(sql, params = []) {
  await conectar();
  if (MOTOR === "postgres") { await pool.query(aPostgres(sql), params); return; }
  sqlite.prepare(sql).run(...params);
}

export async function uno(sql, params = []) {
  await conectar();
  if (MOTOR === "postgres") return (await pool.query(aPostgres(sql), params)).rows[0] || null;
  return sqlite.prepare(sql).get(...params) || null;
}

export async function varios(sql, params = []) {
  await conectar();
  if (MOTOR === "postgres") return (await pool.query(aPostgres(sql), params)).rows;
  return sqlite.prepare(sql).all(...params);
}

/* ── Esquema ──────────────────────────────────────────────── */
/* TEXT y las marcas de tiempo en ISO 8601 funcionan igual en los dos
   motores, lo que evita tener dos esquemas que mantener en paralelo. */

const ESQUEMA = [
  `CREATE TABLE IF NOT EXISTS planes (
     id            TEXT PRIMARY KEY,
     nombre        TEXT NOT NULL,
     descripcion   TEXT DEFAULT '',
     limite_docs   INTEGER NOT NULL DEFAULT 10,
     orden         INTEGER NOT NULL DEFAULT 0,
     activo        INTEGER NOT NULL DEFAULT 1,
     es_defecto    INTEGER NOT NULL DEFAULT 0,
     creado_en     TEXT NOT NULL
   )`,

  `CREATE TABLE IF NOT EXISTS usuarios (
     id            TEXT PRIMARY KEY,
     nombre        TEXT NOT NULL,
     email         TEXT NOT NULL UNIQUE,
     hash          TEXT NOT NULL,
     institucion   TEXT DEFAULT '',
     rol           TEXT NOT NULL DEFAULT 'docente',
     estado        TEXT NOT NULL DEFAULT 'pendiente',
     plan_id       TEXT,
     motivo        TEXT DEFAULT '',
     creado_en     TEXT NOT NULL,
     resuelto_en   TEXT,
     ultimo_acceso TEXT
   )`,

  `CREATE TABLE IF NOT EXISTS sesiones (
     token       TEXT PRIMARY KEY,
     usuario_id  TEXT NOT NULL,
     creado_en   TEXT NOT NULL,
     expira_en   TEXT NOT NULL
   )`,

  `CREATE TABLE IF NOT EXISTS documentos (
     id           TEXT PRIMARY KEY,
     usuario_id   TEXT NOT NULL,
     tipo         TEXT NOT NULL,
     titulo       TEXT NOT NULL,
     pais         TEXT DEFAULT '',
     marco        TEXT DEFAULT '',
     etapa        TEXT DEFAULT '',
     grado        TEXT DEFAULT '',
     asignatura   TEXT DEFAULT '',
     datos        TEXT NOT NULL,
     cfg          TEXT NOT NULL,
     codigo       TEXT UNIQUE,
     compartido   INTEGER NOT NULL DEFAULT 0,
     creado_en    TEXT NOT NULL,
     actualizado_en TEXT NOT NULL
   )`,

  `CREATE INDEX IF NOT EXISTS idx_docs_usuario ON documentos(usuario_id, creado_en)`,
  `CREATE INDEX IF NOT EXISTS idx_docs_codigo  ON documentos(codigo)`,
  `CREATE INDEX IF NOT EXISTS idx_ses_usuario  ON sesiones(usuario_id)`,
];

export const ahora = () => new Date().toISOString();
export const nuevoId = () => randomUUID();

/* Código corto para compartir. Sin caracteres que se confundan al
   leerlos en voz alta o teclearlos desde un QR impreso. */
const ALFABETO = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
export function nuevoCodigo() {
  const b = randomBytes(8);
  let c = "";
  for (let i = 0; i < 8; i++) c += ALFABETO[b[i] % ALFABETO.length];
  return c.slice(0, 4) + "-" + c.slice(4);
}

let listo = false;
export async function inicializar() {
  if (listo) return;
  await conectar();
  for (const sql of ESQUEMA) await ejecutar(sql);

  // Planes de partida. Son editables desde el panel de administración;
  // esto solo evita que el sistema arranque sin ningún plan asignable.
  const hayPlanes = await uno("SELECT COUNT(*) AS n FROM planes");
  if (Number(hayPlanes?.n || 0) === 0) {
    const base = [
      { nombre: "Prueba",     desc: "Para evaluar la herramienta",        limite: 5,    orden: 1, defecto: 1 },
      { nombre: "Docente",    desc: "Uso individual en aula",             limite: 40,   orden: 2, defecto: 0 },
      { nombre: "Institución", desc: "Uso por equipo o centro educativo", limite: 400,  orden: 3, defecto: 0 },
      { nombre: "Sin límite", desc: "Cuentas internas y demostraciones",  limite: 0,    orden: 4, defecto: 0 },
    ];
    for (const p of base) {
      await ejecutar(
        `INSERT INTO planes (id,nombre,descripcion,limite_docs,orden,activo,es_defecto,creado_en)
         VALUES (?,?,?,?,?,1,?,?)`,
        [nuevoId(), p.nombre, p.desc, p.limite, p.orden, p.defecto, ahora()]
      );
    }
  }
  listo = true;
}

/* Plan que se asigna a quien se registra */
export async function planPorDefecto() {
  return (await uno("SELECT * FROM planes WHERE es_defecto = 1 AND activo = 1")) ||
         (await uno("SELECT * FROM planes WHERE activo = 1 ORDER BY orden LIMIT 1"));
}

/* Documentos creados por un usuario en el mes en curso.
   El límite se cuenta por documento guardado, no por llamada a la IA:
   un libro con ocho capítulos cuenta como uno solo. */
export async function usoDelMes(usuarioId) {
  const desde = new Date();
  desde.setUTCDate(1); desde.setUTCHours(0, 0, 0, 0);
  const r = await uno(
    "SELECT COUNT(*) AS n FROM documentos WHERE usuario_id = ? AND creado_en >= ?",
    [usuarioId, desde.toISOString()]
  );
  return Number(r?.n || 0);
}
