import { useState } from "react";
import { pal, card, label, input, btnPrimary, btnGhost } from "./ui.js";
import { LogoCurriculo } from "./icons.jsx";
import { entrar, registrarse } from "./apiCliente.js";

/* ============================================================
   ENTRADA Y REGISTRO
   El registro no da acceso: crea una solicitud que la
   administración aprueba desde su panel.
   ============================================================ */

export default function Cuenta({ dark = false, onEntrado }) {
  const C = pal(dark);
  const [modo, setModo] = useState("entrar");
  const [f, setF] = useState({ nombre: "", email: "", clave: "", institucion: "", motivo: "" });
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const [enviado, setEnviado] = useState(false);

  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }));

  async function enviar(e) {
    e.preventDefault();
    setCargando(true); setError(null);
    try {
      if (modo === "entrar") {
        const r = await entrar(f.email, f.clave);
        onEntrado(r.usuario);
      } else {
        await registrarse(f);
        setEnviado(true);
      }
    } catch (err) { setError(err.message); }
    finally { setCargando(false); }
  }

  const marco = { minHeight: "100vh", background: C.bg, display: "grid", placeItems: "center", padding: 24 };

  /* Confirmación tras solicitar acceso */
  if (enviado) {
    return (
      <div style={marco}>
        <div style={{ ...card(C), maxWidth: 460, textAlign: "center", padding: 36 }} className="pf-fade-up">
          <div style={{ display: "grid", placeItems: "center", marginBottom: 18 }}>
            <LogoCurriculo size={48} />
          </div>
          <h1 style={{ fontSize: 21, fontWeight: 900, color: C.heading, marginBottom: 12 }}>
            Solicitud enviada
          </h1>
          <p style={{ fontSize: 14, color: C.text2, lineHeight: 1.65, marginBottom: 24 }}>
            Tu cuenta queda pendiente de aprobación. Cuando la administración la revise
            podrás entrar con el correo y la contraseña que acabas de registrar.
          </p>
          <button onClick={() => { setEnviado(false); setModo("entrar"); }} style={btnGhost(C)}>
            Volver a la entrada
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={marco}>
      <div style={{ width: "100%", maxWidth: 440 }} className="pf-fade-up">
        {/* Marca */}
        <div style={{ display: "flex", alignItems: "center", gap: 13, justifyContent: "center", marginBottom: 26 }}>
          <LogoCurriculo size={44} />
          <div>
            <div style={{ fontSize: 20, fontWeight: 900, color: C.heading, letterSpacing: "-0.02em", lineHeight: 1 }}>
              Playlabi <span style={{ fontWeight: 500, color: C.magenta }}>Currículo</span>
            </div>
            <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: "0.13em", color: C.text3, textTransform: "uppercase", marginTop: 3 }}>
              Planes de aula y libros didácticos
            </div>
          </div>
        </div>

        <div style={card(C, { padding: 28 })}>
          {/* Alternador */}
          <div style={{ display: "flex", gap: 3, background: C.bg, borderRadius: 12, padding: 3, marginBottom: 22 }}>
            {[["entrar", "Entrar"], ["registro", "Solicitar acceso"]].map(([id, txt]) => (
              <button key={id} type="button" onClick={() => { setModo(id); setError(null); }}
                style={{
                  flex: 1, padding: "9px 0", borderRadius: 10, fontSize: 13, fontWeight: 800,
                  cursor: "pointer", fontFamily: "inherit", border: "none", transition: "all .18s",
                  background: modo === id ? C.surface : "transparent",
                  color: modo === id ? C.heading : C.text3,
                  boxShadow: modo === id ? "0 1px 3px rgba(0,39,57,.12)" : "none",
                }}>
                {txt}
              </button>
            ))}
          </div>

          <form onSubmit={enviar}>
            {modo === "registro" && (
              <>
                <label style={label(C)}>Nombre y apellidos</label>
                <input value={f.nombre} onChange={set("nombre")} required autoComplete="name"
                  style={{ ...input(C), marginBottom: 16 }} />

                <label style={label(C)}>Institución educativa</label>
                <input value={f.institucion} onChange={set("institucion")} autoComplete="organization"
                  placeholder="Colegio, escuela o universidad"
                  style={{ ...input(C), marginBottom: 16 }} />
              </>
            )}

            <label style={label(C)}>Correo electrónico</label>
            <input type="email" value={f.email} onChange={set("email")} required autoComplete="email"
              style={{ ...input(C), marginBottom: 16 }} />

            <label style={label(C)}>Contraseña</label>
            <input type="password" value={f.clave} onChange={set("clave")} required
              autoComplete={modo === "entrar" ? "current-password" : "new-password"}
              minLength={modo === "registro" ? 8 : undefined}
              style={{ ...input(C), marginBottom: modo === "registro" ? 16 : 8 }} />
            {modo === "registro" && (
              <p style={{ fontSize: 11.5, color: C.text3, marginTop: -10, marginBottom: 16 }}>
                Mínimo 8 caracteres.
              </p>
            )}

            {modo === "registro" && (
              <>
                <label style={label(C)}>¿Para qué vas a usarlo? (opcional)</label>
                <textarea value={f.motivo} onChange={set("motivo")} rows={2}
                  placeholder="Ayuda a la administración a revisar tu solicitud"
                  style={{ ...input(C), resize: "vertical", marginBottom: 16 }} />
              </>
            )}

            {error && (
              <div style={{
                background: C.orange1 + "18", border: `1px solid ${C.orange1}55`, borderRadius: 11,
                padding: "11px 14px", marginBottom: 16, fontSize: 13, color: C.text, lineHeight: 1.5,
              }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={cargando}
              style={btnPrimary(C, {
                width: "100%", justifyContent: "center", display: "flex",
                opacity: cargando ? 0.6 : 1, cursor: cargando ? "wait" : "pointer",
              })}>
              {cargando ? "Un momento…" : modo === "entrar" ? "Entrar" : "Enviar solicitud"}
            </button>
          </form>
        </div>

        {modo === "registro" && (
          <p style={{ fontSize: 11.5, color: C.text3, textAlign: "center", marginTop: 16, lineHeight: 1.6 }}>
            El acceso se concede tras revisión. No se comparte tu correo con terceros.
          </p>
        )}
      </div>
    </div>
  );
}
