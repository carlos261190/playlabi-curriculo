/* ============================================================
   PLAYLABI CURRÍCULO — AUTENTICACIÓN
   Contraseñas con scrypt y sesiones en base de datos.
   Todo con el módulo crypto de Node: sin dependencias externas,
   que es una superficie de ataque menos que mantener.
   ============================================================ */
import { scrypt, randomBytes, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { ejecutar, uno, ahora, nuevoId } from "./db.js";

const derivar = promisify(scrypt);

/* Parámetros de scrypt. N=16384 es el mínimo recomendado por OWASP
   para contraseñas y tarda ~100 ms, tiempo suficiente para que un
   ataque por fuerza bruta sea inviable sin molestar al usuario. */
const N = 16384, r = 8, p = 1, LARGO = 32;

export async function hashearClave(clave) {
  const sal = randomBytes(16);
  const clave_ = await derivar(clave, sal, LARGO, { N, r, p });
  return `scrypt$${N}$${r}$${p}$${sal.toString("base64")}$${clave_.toString("base64")}`;
}

export async function verificarClave(clave, almacenado) {
  try {
    const [alg, n, rr, pp, salB64, hashB64] = String(almacenado).split("$");
    if (alg !== "scrypt") return false;
    const sal = Buffer.from(salB64, "base64");
    const esperado = Buffer.from(hashB64, "base64");
    const calculado = await derivar(clave, sal, esperado.length, { N: +n, r: +rr, p: +pp });
    // Comparación en tiempo constante: comparar con === filtraría
    // información sobre el hash a través del tiempo de respuesta.
    return calculado.length === esperado.length && timingSafeEqual(calculado, esperado);
  } catch { return false; }
}

/* ── Sesiones ─────────────────────────────────────────────── */

const DIAS_SESION = 30;
export const COOKIE = "curriculo_sesion";

export async function crearSesion(usuarioId) {
  const token = randomBytes(32).toString("base64url");
  const expira = new Date(Date.now() + DIAS_SESION * 864e5).toISOString();
  await ejecutar(
    "INSERT INTO sesiones (token, usuario_id, creado_en, expira_en) VALUES (?,?,?,?)",
    [token, usuarioId, ahora(), expira]
  );
  return { token, expira };
}

export async function cerrarSesion(token) {
  if (token) await ejecutar("DELETE FROM sesiones WHERE token = ?", [token]);
}

/* Devuelve el usuario de la petición, o null. Nunca devuelve el hash. */
export async function usuarioDePeticion(req) {
  const token = leerCookie(req, COOKIE);
  if (!token) return null;
  const ses = await uno("SELECT * FROM sesiones WHERE token = ?", [token]);
  if (!ses) return null;
  if (new Date(ses.expira_en) < new Date()) {
    await cerrarSesion(token);
    return null;
  }
  const u = await uno(
    `SELECT u.id, u.nombre, u.email, u.institucion, u.rol, u.estado, u.plan_id,
            u.creado_en, u.ultimo_acceso,
            p.nombre AS plan_nombre, p.limite_docs
       FROM usuarios u LEFT JOIN planes p ON p.id = u.plan_id
      WHERE u.id = ?`,
    [ses.usuario_id]
  );
  return u || null;
}

export function leerCookie(req, nombre) {
  const raw = req.headers?.cookie || "";
  for (const parte of raw.split(";")) {
    const [k, ...v] = parte.trim().split("=");
    if (k === nombre) return decodeURIComponent(v.join("="));
  }
  return null;
}

export function cabeceraCookie(token, expira) {
  const seguro = process.env.NODE_ENV === "production" ? "; Secure" : "";
  if (!token) return `${COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${seguro}`;
  const maxAge = Math.floor((new Date(expira) - Date.now()) / 1000);
  return `${COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${seguro}`;
}

/* ── Alta del administrador ───────────────────────────────── */
/* El primer administrador no puede crearse desde el registro público:
   se define con ADMIN_EMAIL y ADMIN_PASSWORD en el .env y se crea al
   arrancar. Así nunca existe una ventana en la que cualquiera pueda
   reclamar la cuenta de administración. */
export async function asegurarAdmin() {
  const email = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  const clave = process.env.ADMIN_PASSWORD || "";
  if (!email || !clave) return { creado: false, motivo: "sin_credenciales" };

  const existente = await uno("SELECT id, rol FROM usuarios WHERE email = ?", [email]);
  if (existente) {
    if (existente.rol !== "admin") {
      await ejecutar("UPDATE usuarios SET rol='admin', estado='aprobado' WHERE id = ?", [existente.id]);
      return { creado: false, motivo: "promovido" };
    }
    return { creado: false, motivo: "ya_existia" };
  }
  await ejecutar(
    `INSERT INTO usuarios (id,nombre,email,hash,institucion,rol,estado,creado_en,resuelto_en)
     VALUES (?,?,?,?,?,'admin','aprobado',?,?)`,
    [nuevoId(), process.env.ADMIN_NAME || "Administración", email, await hashearClave(clave),
     "Playlabi", ahora(), ahora()]
  );
  return { creado: true, motivo: "creado" };
}

/* ── Guardas ──────────────────────────────────────────────── */

export const esAdmin = (u) => !!u && u.rol === "admin" && u.estado === "aprobado";
export const estaActivo = (u) => !!u && u.estado === "aprobado";
