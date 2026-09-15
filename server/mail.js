/* ============================================================
   PLAYLABI CURRÍCULO — AVISOS POR CORREO
   El correo es OPCIONAL: si no hay RESEND_API_KEY configurada, la
   aplicación funciona igual y los avisos quedan solo en el panel de
   administración. Así no hace falta contratar nada para empezar.

   Para activarlo: crear cuenta en resend.com, verificar el dominio y
   poner en .env  RESEND_API_KEY, MAIL_FROM y ADMIN_EMAIL.
   ============================================================ */

const CLAVE = () => process.env.RESEND_API_KEY || "";
const REMITENTE = () => process.env.MAIL_FROM || "Playlabi Currículo <onboarding@resend.dev>";
const URL_APP = () => process.env.APP_URL || "http://localhost:5176";

export const correoActivo = () => !!CLAVE();

async function enviar({ para, asunto, html }) {
  if (!correoActivo()) return { enviado: false, motivo: "correo_desactivado" };
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${CLAVE()}` },
      body: JSON.stringify({ from: REMITENTE(), to: [para], subject: asunto, html }),
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) {
      const detalle = await res.text();
      console.warn("[correo] fallo al enviar:", res.status, detalle.slice(0, 200));
      return { enviado: false, motivo: `http_${res.status}` };
    }
    return { enviado: true };
  } catch (e) {
    // Un fallo de correo nunca debe tumbar un registro ni una aprobación.
    console.warn("[correo] error:", e.message);
    return { enviado: false, motivo: e.message };
  }
}

/* ── Plantilla común ── */
const plantilla = (titulo, cuerpo, boton) => `
<div style="font-family:system-ui,-apple-system,'Segoe UI',sans-serif;background:#EDF1F7;padding:32px 16px">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:18px;overflow:hidden;border:1px solid #DDE8EF">
    <div style="background:linear-gradient(135deg,#002739,#0D4060);padding:24px 28px">
      <div style="color:#fff;font-size:17px;font-weight:800">Playlabi <span style="color:#82d3f1;font-weight:500">Currículo</span></div>
    </div>
    <div style="padding:28px">
      <h1 style="font-size:20px;color:#002739;margin:0 0 14px">${titulo}</h1>
      <div style="font-size:14px;color:#4A6172;line-height:1.65">${cuerpo}</div>
      ${boton ? `<a href="${boton.url}" style="display:inline-block;margin-top:22px;background:linear-gradient(135deg,#ed466f,#ef5041 33%,#f37b4f 66%,#f9a54b);color:#fff;text-decoration:none;padding:12px 24px;border-radius:12px;font-weight:800;font-size:14px">${boton.texto}</a>` : ""}
    </div>
    <div style="padding:16px 28px;border-top:1px solid #DDE8EF;font-size:11px;color:#8FA8BB">
      Playlabi Currículo · planes de aula y libros didácticos
    </div>
  </div>
</div>`;

/* ── Avisos ── */

export function avisarAdminNuevoRegistro(solicitante) {
  const destino = (process.env.ADMIN_EMAIL || "").trim();
  if (!destino) return Promise.resolve({ enviado: false, motivo: "sin_admin_email" });
  return enviar({
    para: destino,
    asunto: `Nueva solicitud de acceso · ${solicitante.nombre}`,
    html: plantilla(
      "Tienes una solicitud de acceso pendiente",
      `<p><b>${escapar(solicitante.nombre)}</b> ha solicitado acceso a Playlabi Currículo.</p>
       <p style="margin-top:12px">
         Correo: ${escapar(solicitante.email)}<br>
         Institución: ${escapar(solicitante.institucion || "—")}<br>
         ${solicitante.motivo ? `Motivo: ${escapar(solicitante.motivo)}` : ""}
       </p>
       <p style="margin-top:12px">Puedes aprobarla o rechazarla desde tu panel de administración.</p>`,
      { url: `${URL_APP()}/admin`, texto: "Abrir el panel" }
    ),
  });
}

export function avisarUsuarioAprobado(usuario, plan) {
  return enviar({
    para: usuario.email,
    asunto: "Tu acceso a Playlabi Currículo está activo",
    html: plantilla(
      `Bienvenido, ${escapar(usuario.nombre.split(" ")[0])}`,
      `<p>Tu solicitud ha sido aprobada. Ya puedes entrar y empezar a generar planes de aula, fichas del estudiante y libros didácticos alineados a la normativa de tu país.</p>
       ${plan ? `<p style="margin-top:12px">Tu plan es <b>${escapar(plan.nombre)}</b>${plan.limite_docs > 0 ? `, con hasta <b>${plan.limite_docs} documentos al mes</b>` : ", sin límite de documentos"}.</p>` : ""}`,
      { url: URL_APP(), texto: "Entrar" }
    ),
  });
}

export function avisarUsuarioRechazado(usuario) {
  return enviar({
    para: usuario.email,
    asunto: "Sobre tu solicitud de acceso a Playlabi Currículo",
    html: plantilla(
      "Tu solicitud no ha sido aprobada",
      `<p>Hemos revisado tu solicitud de acceso y por ahora no ha sido aprobada.</p>
       <p style="margin-top:12px">Si crees que se trata de un error o quieres darnos más contexto sobre tu uso previsto, responde a este correo y lo revisamos.</p>`
    ),
  });
}

const escapar = (s) =>
  String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
