/* ============================================================
   PLAYLABI CURRÍCULO — API
   Cuentas, banco de documentos, compartición y administración.
   ============================================================ */
import { Router } from "express";
import { ejecutar, uno, varios, ahora, nuevoId, nuevoCodigo, planPorDefecto, usoDelMes } from "./db.js";
import {
  hashearClave, verificarClave, crearSesion, cerrarSesion,
  usuarioDePeticion, leerCookie, cabeceraCookie, COOKIE, esAdmin, estaActivo,
} from "./auth.js";
import { avisarAdminNuevoRegistro, avisarUsuarioAprobado, avisarUsuarioRechazado, correoActivo } from "./mail.js";

export const api = Router();

/* ── Utilidades ───────────────────────────────────────────── */

const mal = (res, codigo, mensaje) => res.status(codigo).json({ error: { message: mensaje } });
const emailValido = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(e || "").trim());

/* Adjunta req.usuario si hay sesión válida. */
async function conUsuario(req, _res, next) {
  try { req.usuario = await usuarioDePeticion(req); } catch { req.usuario = null; }
  next();
}
api.use(conUsuario);

const exigeSesion = (req, res, next) =>
  estaActivo(req.usuario) ? next() : mal(res, 401, "Necesitas iniciar sesión con una cuenta aprobada.");

const exigeAdmin = (req, res, next) =>
  esAdmin(req.usuario) ? next() : mal(res, 403, "Solo la administración puede hacer esto.");

/* Datos del usuario que sí pueden viajar al navegador */
const publico = (u) => u && ({
  id: u.id, nombre: u.nombre, email: u.email, institucion: u.institucion,
  rol: u.rol, estado: u.estado,
  plan: u.plan_nombre ? { nombre: u.plan_nombre, limite: u.limite_docs } : null,
});

/* ── Cuentas ──────────────────────────────────────────────── */

api.post("/auth/registro", async (req, res) => {
  const { nombre, email, clave, institucion, motivo } = req.body || {};
  if (!String(nombre || "").trim()) return mal(res, 400, "Falta el nombre.");
  if (!emailValido(email)) return mal(res, 400, "El correo no es válido.");
  if (String(clave || "").length < 8) return mal(res, 400, "La contraseña debe tener al menos 8 caracteres.");

  const correo = String(email).trim().toLowerCase();
  if (await uno("SELECT id FROM usuarios WHERE email = ?", [correo]))
    return mal(res, 409, "Ya existe una cuenta con ese correo.");

  const plan = await planPorDefecto();
  const id = nuevoId();
  await ejecutar(
    `INSERT INTO usuarios (id,nombre,email,hash,institucion,rol,estado,plan_id,motivo,creado_en)
     VALUES (?,?,?,?,?,'docente','pendiente',?,?,?)`,
    [id, String(nombre).trim(), correo, await hashearClave(clave),
     String(institucion || "").trim(), plan?.id || null, String(motivo || "").trim(), ahora()]
  );

  // El aviso por correo nunca debe hacer fallar el registro.
  avisarAdminNuevoRegistro({ nombre, email: correo, institucion, motivo }).catch(() => {});

  res.json({ ok: true, estado: "pendiente" });
});

api.post("/auth/entrar", async (req, res) => {
  const { email, clave } = req.body || {};
  const correo = String(email || "").trim().toLowerCase();
  const u = await uno("SELECT * FROM usuarios WHERE email = ?", [correo]);

  // Mismo mensaje exista o no la cuenta: no revelamos qué correos están registrados.
  if (!u || !(await verificarClave(String(clave || ""), u.hash)))
    return mal(res, 401, "Correo o contraseña incorrectos.");

  if (u.estado === "pendiente") return mal(res, 403, "Tu cuenta todavía está pendiente de aprobación.");
  if (u.estado === "rechazado") return mal(res, 403, "Tu solicitud de acceso no fue aprobada.");

  const { token, expira } = await crearSesion(u.id);
  await ejecutar("UPDATE usuarios SET ultimo_acceso = ? WHERE id = ?", [ahora(), u.id]);
  res.setHeader("Set-Cookie", cabeceraCookie(token, expira));
  res.json({ ok: true, usuario: publico(await usuarioDePeticion({ headers: { cookie: `${COOKIE}=${token}` } })) });
});

api.post("/auth/salir", async (req, res) => {
  await cerrarSesion(leerCookie(req, COOKIE));
  res.setHeader("Set-Cookie", cabeceraCookie(null));
  res.json({ ok: true });
});

api.get("/auth/yo", async (req, res) => {
  if (!req.usuario) return res.json({ usuario: null });
  const usados = await usoDelMes(req.usuario.id);
  res.json({
    usuario: publico(req.usuario),
    uso: { documentos: usados, limite: req.usuario.limite_docs ?? 0 },
    correoActivo: correoActivo(),
  });
});

/* ── Banco de documentos ──────────────────────────────────── */

api.get("/documentos", exigeSesion, async (req, res) => {
  const filas = await varios(
    `SELECT id,tipo,titulo,pais,marco,etapa,grado,asignatura,codigo,compartido,creado_en,actualizado_en
       FROM documentos WHERE usuario_id = ? ORDER BY actualizado_en DESC`,
    [req.usuario.id]
  );
  res.json({ documentos: filas });
});

api.post("/documentos", exigeSesion, async (req, res) => {
  const { tipo, titulo, datos, cfg, meta } = req.body || {};
  if (!["plan", "student", "book"].includes(tipo)) return mal(res, 400, "Tipo de documento no válido.");
  if (!datos) return mal(res, 400, "No hay contenido que guardar.");

  // El límite se cuenta por documento guardado dentro del mes en curso.
  const limite = Number(req.usuario.limite_docs ?? 0);
  if (limite > 0) {
    const usados = await usoDelMes(req.usuario.id);
    if (usados >= limite)
      return mal(res, 402, `Has alcanzado el límite de tu plan (${limite} documentos este mes).`);
  }

  const id = nuevoId(), t = ahora();
  await ejecutar(
    `INSERT INTO documentos (id,usuario_id,tipo,titulo,pais,marco,etapa,grado,asignatura,datos,cfg,creado_en,actualizado_en)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [id, req.usuario.id, tipo, String(titulo || "Sin título").slice(0, 200),
     meta?.pais || "", meta?.marco || "", meta?.etapa || "", meta?.grado || "", meta?.asignatura || "",
     JSON.stringify(datos), JSON.stringify(cfg || {}), t, t]
  );
  res.json({ ok: true, id, usados: await usoDelMes(req.usuario.id), limite });
});

api.get("/documentos/:id", exigeSesion, async (req, res) => {
  const d = await uno("SELECT * FROM documentos WHERE id = ? AND usuario_id = ?", [req.params.id, req.usuario.id]);
  if (!d) return mal(res, 404, "Documento no encontrado.");
  res.json({ documento: { ...d, datos: JSON.parse(d.datos), cfg: JSON.parse(d.cfg) } });
});

api.put("/documentos/:id", exigeSesion, async (req, res) => {
  const d = await uno("SELECT id FROM documentos WHERE id = ? AND usuario_id = ?", [req.params.id, req.usuario.id]);
  if (!d) return mal(res, 404, "Documento no encontrado.");
  const { datos, titulo } = req.body || {};
  await ejecutar(
    "UPDATE documentos SET datos = COALESCE(?,datos), titulo = COALESCE(?,titulo), actualizado_en = ? WHERE id = ?",
    [datos ? JSON.stringify(datos) : null, titulo || null, ahora(), req.params.id]
  );
  res.json({ ok: true });
});

api.delete("/documentos/:id", exigeSesion, async (req, res) => {
  await ejecutar("DELETE FROM documentos WHERE id = ? AND usuario_id = ?", [req.params.id, req.usuario.id]);
  res.json({ ok: true });
});

/* Publicar o dejar de publicar. Al publicar se crea un código corto e
   imposible de adivinar; cualquiera que tenga el enlace puede leerlo,
   que es justo lo que hace falta para el QR y el embed. */
api.post("/documentos/:id/compartir", exigeSesion, async (req, res) => {
  const d = await uno("SELECT * FROM documentos WHERE id = ? AND usuario_id = ?", [req.params.id, req.usuario.id]);
  if (!d) return mal(res, 404, "Documento no encontrado.");
  const activar = req.body?.compartir !== false;

  if (!activar) {
    await ejecutar("UPDATE documentos SET compartido = 0 WHERE id = ?", [d.id]);
    return res.json({ ok: true, compartido: false, codigo: d.codigo });
  }
  let codigo = d.codigo;
  if (!codigo) {
    for (let i = 0; i < 6 && !codigo; i++) {
      const c = nuevoCodigo();
      if (!(await uno("SELECT id FROM documentos WHERE codigo = ?", [c]))) codigo = c;
    }
    if (!codigo) return mal(res, 500, "No se pudo generar un código único.");
  }
  await ejecutar("UPDATE documentos SET codigo = ?, compartido = 1 WHERE id = ?", [codigo, d.id]);
  res.json({ ok: true, compartido: true, codigo });
});

/* Lectura pública: sin sesión, solo si está publicado. */
api.get("/publico/:codigo", async (req, res) => {
  const d = await uno(
    "SELECT tipo,titulo,datos,cfg,creado_en FROM documentos WHERE codigo = ? AND compartido = 1",
    [String(req.params.codigo || "").toUpperCase()]
  );
  if (!d) return mal(res, 404, "Este documento no existe o ya no está publicado.");
  res.json({ documento: { tipo: d.tipo, titulo: d.titulo, datos: JSON.parse(d.datos), cfg: JSON.parse(d.cfg), creado_en: d.creado_en } });
});

/* ── Administración ───────────────────────────────────────── */

api.get("/admin/resumen", exigeAdmin, async (_req, res) => {
  const p = await uno("SELECT COUNT(*) AS n FROM usuarios WHERE estado = 'pendiente'");
  const a = await uno("SELECT COUNT(*) AS n FROM usuarios WHERE estado = 'aprobado'");
  const d = await uno("SELECT COUNT(*) AS n FROM documentos");
  res.json({
    pendientes: Number(p?.n || 0),
    aprobados: Number(a?.n || 0),
    documentos: Number(d?.n || 0),
    correoActivo: correoActivo(),
  });
});

api.get("/admin/usuarios", exigeAdmin, async (req, res) => {
  const estado = req.query.estado;
  const filas = estado
    ? await varios(`SELECT u.id,u.nombre,u.email,u.institucion,u.rol,u.estado,u.motivo,u.plan_id,u.creado_en,u.ultimo_acceso,
                           p.nombre AS plan_nombre, p.limite_docs
                      FROM usuarios u LEFT JOIN planes p ON p.id=u.plan_id
                     WHERE u.estado = ? ORDER BY u.creado_en DESC`, [estado])
    : await varios(`SELECT u.id,u.nombre,u.email,u.institucion,u.rol,u.estado,u.motivo,u.plan_id,u.creado_en,u.ultimo_acceso,
                           p.nombre AS plan_nombre, p.limite_docs
                      FROM usuarios u LEFT JOIN planes p ON p.id=u.plan_id
                     ORDER BY CASE u.estado WHEN 'pendiente' THEN 0 ELSE 1 END, u.creado_en DESC`);

  for (const f of filas) f.usados = await usoDelMes(f.id);
  res.json({ usuarios: filas });
});

api.post("/admin/usuarios/:id/estado", exigeAdmin, async (req, res) => {
  const { estado, plan_id } = req.body || {};
  if (!["aprobado", "rechazado", "pendiente"].includes(estado)) return mal(res, 400, "Estado no válido.");

  const u = await uno("SELECT * FROM usuarios WHERE id = ?", [req.params.id]);
  if (!u) return mal(res, 404, "Usuario no encontrado.");
  if (u.rol === "admin" && estado !== "aprobado")
    return mal(res, 400, "No se puede desactivar una cuenta de administración.");

  await ejecutar(
    "UPDATE usuarios SET estado = ?, plan_id = COALESCE(?, plan_id), resuelto_en = ? WHERE id = ?",
    [estado, plan_id || null, ahora(), u.id]
  );
  // Si se rechaza o se suspende, se cierran sus sesiones abiertas.
  if (estado !== "aprobado") await ejecutar("DELETE FROM sesiones WHERE usuario_id = ?", [u.id]);

  const plan = await uno("SELECT * FROM planes WHERE id = ?", [plan_id || u.plan_id]);
  if (estado === "aprobado") avisarUsuarioAprobado(u, plan).catch(() => {});
  if (estado === "rechazado") avisarUsuarioRechazado(u).catch(() => {});

  res.json({ ok: true });
});

api.post("/admin/usuarios/:id/plan", exigeAdmin, async (req, res) => {
  const { plan_id } = req.body || {};
  if (!(await uno("SELECT id FROM planes WHERE id = ?", [plan_id]))) return mal(res, 400, "Plan no válido.");
  await ejecutar("UPDATE usuarios SET plan_id = ? WHERE id = ?", [plan_id, req.params.id]);
  res.json({ ok: true });
});

/* ── Planes ───────────────────────────────────────────────── */

api.get("/planes", async (_req, res) => {
  res.json({ planes: await varios("SELECT * FROM planes WHERE activo = 1 ORDER BY orden, nombre") });
});

api.get("/admin/planes", exigeAdmin, async (_req, res) => {
  const planes = await varios("SELECT * FROM planes ORDER BY orden, nombre");
  for (const p of planes) {
    const r = await uno("SELECT COUNT(*) AS n FROM usuarios WHERE plan_id = ?", [p.id]);
    p.usuarios = Number(r?.n || 0);
  }
  res.json({ planes });
});

api.post("/admin/planes", exigeAdmin, async (req, res) => {
  const { nombre, descripcion, limite_docs, orden } = req.body || {};
  if (!String(nombre || "").trim()) return mal(res, 400, "El plan necesita un nombre.");
  const id = nuevoId();
  await ejecutar(
    `INSERT INTO planes (id,nombre,descripcion,limite_docs,orden,activo,es_defecto,creado_en)
     VALUES (?,?,?,?,?,1,0,?)`,
    [id, String(nombre).trim(), String(descripcion || ""), Math.max(0, Number(limite_docs) || 0), Number(orden) || 99, ahora()]
  );
  res.json({ ok: true, id });
});

api.put("/admin/planes/:id", exigeAdmin, async (req, res) => {
  const { nombre, descripcion, limite_docs, orden, activo, es_defecto } = req.body || {};
  const p = await uno("SELECT id FROM planes WHERE id = ?", [req.params.id]);
  if (!p) return mal(res, 404, "Plan no encontrado.");

  // Solo puede haber un plan por defecto.
  if (es_defecto) await ejecutar("UPDATE planes SET es_defecto = 0", []);

  await ejecutar(
    `UPDATE planes SET nombre=COALESCE(?,nombre), descripcion=COALESCE(?,descripcion),
            limite_docs=COALESCE(?,limite_docs), orden=COALESCE(?,orden),
            activo=COALESCE(?,activo), es_defecto=COALESCE(?,es_defecto)
      WHERE id = ?`,
    [nombre ?? null, descripcion ?? null,
     limite_docs === undefined ? null : Math.max(0, Number(limite_docs) || 0),
     orden === undefined ? null : Number(orden),
     activo === undefined ? null : (activo ? 1 : 0),
     es_defecto === undefined ? null : (es_defecto ? 1 : 0),
     req.params.id]
  );
  res.json({ ok: true });
});

api.delete("/admin/planes/:id", exigeAdmin, async (req, res) => {
  const enUso = await uno("SELECT COUNT(*) AS n FROM usuarios WHERE plan_id = ?", [req.params.id]);
  if (Number(enUso?.n || 0) > 0)
    return mal(res, 400, "Hay usuarios en este plan. Muévelos a otro plan antes de eliminarlo.");
  await ejecutar("DELETE FROM planes WHERE id = ?", [req.params.id]);
  res.json({ ok: true });
});

export { exigeSesion };
