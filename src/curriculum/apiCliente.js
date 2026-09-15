/* ============================================================
   PLAYLABI CURRÍCULO — CLIENTE DE LA API
   La sesión viaja en una cookie httpOnly, así que todas las
   peticiones necesitan credentials:"include". El token nunca es
   accesible desde JavaScript, que es lo que impide robarlo con
   un script inyectado.
   ============================================================ */

const BASE = import.meta.env.VITE_API_URL || "";

async function pedir(ruta, opciones = {}) {
  const res = await fetch(BASE + "/api" + ruta, {
    credentials: "include",
    headers: opciones.body ? { "Content-Type": "application/json" } : undefined,
    ...opciones,
    body: opciones.body ? JSON.stringify(opciones.body) : undefined,
  });
  let datos = null;
  try { datos = await res.json(); } catch { /* respuesta sin cuerpo */ }
  if (!res.ok) {
    const err = new Error(datos?.error?.message || `Error ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return datos;
}

/* ── Cuentas ── */
export const registrarse = (datos) => pedir("/auth/registro", { method: "POST", body: datos });
export const entrar = (email, clave) => pedir("/auth/entrar", { method: "POST", body: { email, clave } });
export const salir = () => pedir("/auth/salir", { method: "POST" });
export const sesionActual = () => pedir("/auth/yo");

/* ── Banco de documentos ── */
export const listarDocumentos = () => pedir("/documentos");
export const guardarDocumento = (doc) => pedir("/documentos", { method: "POST", body: doc });
export const abrirDocumento = (id) => pedir("/documentos/" + id);
export const borrarDocumento = (id) => pedir("/documentos/" + id, { method: "DELETE" });
export const compartirDocumento = (id, compartir = true) =>
  pedir(`/documentos/${id}/compartir`, { method: "POST", body: { compartir } });

/* ── Administración ── */
export const resumenAdmin = () => pedir("/admin/resumen");
export const listarUsuarios = (estado) => pedir("/admin/usuarios" + (estado ? `?estado=${estado}` : ""));
export const cambiarEstadoUsuario = (id, estado, plan_id) =>
  pedir(`/admin/usuarios/${id}/estado`, { method: "POST", body: { estado, plan_id } });
export const asignarPlan = (id, plan_id) =>
  pedir(`/admin/usuarios/${id}/plan`, { method: "POST", body: { plan_id } });

export const listarPlanesAdmin = () => pedir("/admin/planes");
export const crearPlan = (plan) => pedir("/admin/planes", { method: "POST", body: plan });
export const editarPlan = (id, plan) => pedir("/admin/planes/" + id, { method: "PUT", body: plan });
export const eliminarPlan = (id) => pedir("/admin/planes/" + id, { method: "DELETE" });

/* ── Lectura pública ── */
export const documentoPublico = (codigo) => pedir("/publico/" + codigo);

/* URL base del sitio, para construir enlaces y embeds compartibles */
export const urlSitio = () =>
  (import.meta.env.VITE_APP_URL || window.location.origin).replace(/\/$/, "");
