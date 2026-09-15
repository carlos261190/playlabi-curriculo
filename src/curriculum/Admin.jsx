import { useState, useEffect } from "react";
import { pal, card, chip, label, input, btnPrimary, btnGhost, sectionTitle } from "./ui.js";
import {
  resumenAdmin, listarUsuarios, cambiarEstadoUsuario, asignarPlan,
  listarPlanesAdmin, crearPlan, editarPlan, eliminarPlan,
} from "./apiCliente.js";

/* ============================================================
   PANEL DE ADMINISTRACIÓN
   Dos cosas: aprobar quién entra y definir cuánto puede generar.
   ============================================================ */

export default function Admin({ dark = false }) {
  const C = pal(dark);
  const [pestana, setPestana] = useState("solicitudes");
  const [resumen, setResumen] = useState(null);
  const [usuarios, setUsuarios] = useState(null);
  const [planes, setPlanes] = useState(null);
  const [error, setError] = useState(null);
  const [ocupado, setOcupado] = useState(null);

  useEffect(() => { cargar(); }, []);

  async function cargar() {
    try {
      const [r, u, p] = await Promise.all([resumenAdmin(), listarUsuarios(), listarPlanesAdmin()]);
      setResumen(r); setUsuarios(u.usuarios); setPlanes(p.planes);
    } catch (e) { setError(e.message); }
  }

  async function resolver(u, estado) {
    setOcupado(u.id); setError(null);
    try { await cambiarEstadoUsuario(u.id, estado); await cargar(); }
    catch (e) { setError(e.message); }
    finally { setOcupado(null); }
  }

  const pendientes = (usuarios || []).filter((u) => u.estado === "pendiente");
  const resto = (usuarios || []).filter((u) => u.estado !== "pendiente");
  const fecha = (i) => new Date(i).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });

  return (
    <div className="pf-fade-up">
      <h1 style={{ fontSize: 25, fontWeight: 900, color: C.heading, letterSpacing: "-0.025em", marginBottom: 7 }}>
        Administración
      </h1>
      <p style={{ fontSize: 13.5, color: C.text2, marginBottom: 20 }}>
        Aprueba quién puede entrar y define los límites de cada plan.
      </p>

      {/* Indicadores */}
      {resumen && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 12, marginBottom: 22 }}>
          {[
            ["Solicitudes pendientes", resumen.pendientes, resumen.pendientes > 0 ? C.magenta : C.text3],
            ["Cuentas activas", resumen.aprobados, C.heading],
            ["Documentos creados", resumen.documentos, C.heading],
          ].map(([t, v, col]) => (
            <div key={t} style={card(C, { padding: 16 })}>
              <div style={{ fontSize: 10.5, fontWeight: 800, color: C.text3, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>{t}</div>
              <div style={{ fontSize: 26, fontWeight: 900, color: col, lineHeight: 1 }}>{v}</div>
            </div>
          ))}
        </div>
      )}

      {resumen && !resumen.correoActivo && (
        <div style={{ background: C.blueLight + "22", border: `1px solid ${C.blueLight}55`, borderRadius: 13,
                      padding: "12px 16px", marginBottom: 18, fontSize: 12.5, color: C.text, lineHeight: 1.55 }}>
          Los avisos por correo están desactivados: las solicitudes aparecen aquí, pero no recibes email.
          Para activarlos, añade <b>RESEND_API_KEY</b> y <b>MAIL_FROM</b> al archivo <code>.env</code> del servidor.
        </div>
      )}

      {/* Pestañas */}
      <div style={{ display: "inline-flex", gap: 3, background: C.bg, borderRadius: 12, padding: 3, marginBottom: 18, border: `1px solid ${C.border}` }}>
        {[["solicitudes", `Solicitudes${pendientes.length ? ` (${pendientes.length})` : ""}`],
          ["usuarios", "Usuarios"], ["planes", "Planes"]].map(([id, txt]) => (
          <button key={id} onClick={() => setPestana(id)}
            style={{
              padding: "8px 18px", borderRadius: 10, fontSize: 12.5, fontWeight: 800, border: "none",
              cursor: "pointer", fontFamily: "inherit",
              background: pestana === id ? C.surface : "transparent",
              color: pestana === id ? C.heading : C.text3,
              boxShadow: pestana === id ? "0 1px 3px rgba(0,39,57,.12)" : "none",
            }}>
            {txt}
          </button>
        ))}
      </div>

      {error && (
        <div style={{ background: C.orange1 + "18", border: `1px solid ${C.orange1}55`, borderRadius: 13,
                      padding: "12px 16px", marginBottom: 16, fontSize: 13, color: C.text }}>{error}</div>
      )}

      {/* ── Solicitudes ── */}
      {pestana === "solicitudes" && (
        pendientes.length === 0 ? (
          <div style={card(C, { textAlign: "center", padding: "44px 24px" })}>
            <p style={{ fontSize: 14, color: C.text2 }}>No hay solicitudes pendientes.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {pendientes.map((u) => (
              <div key={u.id} style={card(C, { padding: 20, borderLeft: `4px solid ${C.magenta}` })}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
                  <div style={{ flex: 1, minWidth: 230 }}>
                    <div style={{ fontWeight: 800, fontSize: 16, color: C.heading, marginBottom: 5 }}>{u.nombre}</div>
                    <div style={{ fontSize: 13, color: C.text2, lineHeight: 1.6 }}>
                      {u.email}
                      {u.institucion && <><br />{u.institucion}</>}
                      <br /><span style={{ color: C.text3, fontSize: 11.5 }}>Solicitado el {fecha(u.creado_en)}</span>
                    </div>
                    {u.motivo && (
                      <div style={{ background: C.bg, borderRadius: 10, padding: "10px 13px", marginTop: 11, fontSize: 12.5, color: C.text, lineHeight: 1.55 }}>
                        «{u.motivo}»
                      </div>
                    )}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, flexShrink: 0, minWidth: 170 }}>
                    <div>
                      <div style={label(C)}>Plan al aprobar</div>
                      <select value={u.plan_id || ""} onChange={async (e) => { await asignarPlan(u.id, e.target.value); cargar(); }}
                        style={{ ...input(C), fontSize: 13 }}>
                        {(planes || []).map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.nombre} · {p.limite_docs > 0 ? `${p.limite_docs}/mes` : "sin límite"}
                          </option>
                        ))}
                      </select>
                    </div>
                    <button onClick={() => resolver(u, "aprobado")} disabled={ocupado === u.id}
                      style={btnPrimary(C, { padding: "10px 18px", fontSize: 13, opacity: ocupado === u.id ? 0.6 : 1 })}>
                      Aprobar
                    </button>
                    <button onClick={() => resolver(u, "rechazado")} disabled={ocupado === u.id}
                      style={btnGhost(C, { padding: "9px 18px", fontSize: 12.5, justifyContent: "center" })}>
                      Rechazar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* ── Usuarios ── */}
      {pestana === "usuarios" && (
        <div style={card(C, { padding: 0, overflow: "hidden" })}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 720 }}>
              <thead>
                <tr>
                  {["Usuario", "Plan", "Uso del mes", "Estado", ""].map((h, i) => (
                    <th key={i} style={{ textAlign: "left", padding: "12px 15px", background: C.bg, color: C.text2,
                                         fontSize: 10.5, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em",
                                         borderBottom: `1px solid ${C.border}` }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {resto.map((u) => (
                  <tr key={u.id}>
                    <td style={{ padding: "13px 15px", borderBottom: `1px solid ${C.border}` }}>
                      <div style={{ fontWeight: 800, color: C.heading }}>{u.nombre}</div>
                      <div style={{ fontSize: 11.5, color: C.text3 }}>{u.email}</div>
                    </td>
                    <td style={{ padding: "13px 15px", borderBottom: `1px solid ${C.border}` }}>
                      <select value={u.plan_id || ""} onChange={async (e) => { await asignarPlan(u.id, e.target.value); cargar(); }}
                        style={{ ...input(C), fontSize: 12.5, padding: "7px 10px" }} disabled={u.rol === "admin"}>
                        {(planes || []).map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                      </select>
                    </td>
                    <td style={{ padding: "13px 15px", borderBottom: `1px solid ${C.border}`, color: C.text2 }}>
                      {u.usados}{u.limite_docs > 0 ? ` / ${u.limite_docs}` : ""}
                    </td>
                    <td style={{ padding: "13px 15px", borderBottom: `1px solid ${C.border}` }}>
                      <span style={chip(C, u.estado === "aprobado" ? C.green : C.orange1)}>{u.estado}</span>
                      {u.rol === "admin" && <span style={{ ...chip(C, C.violet), marginLeft: 5 }}>admin</span>}
                    </td>
                    <td style={{ padding: "13px 15px", borderBottom: `1px solid ${C.border}`, textAlign: "right" }}>
                      {u.rol !== "admin" && (
                        <button onClick={() => resolver(u, u.estado === "aprobado" ? "rechazado" : "aprobado")}
                          style={{ background: "none", border: "none", color: u.estado === "aprobado" ? C.orange1 : C.green,
                                   fontWeight: 700, fontSize: 12.5, cursor: "pointer", fontFamily: "inherit" }}>
                          {u.estado === "aprobado" ? "Suspender" : "Reactivar"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Planes ── */}
      {pestana === "planes" && <Planes C={C} planes={planes} recargar={cargar} setError={setError} />}
    </div>
  );
}

/* ── Gestión de planes ── */
function Planes({ C, planes, recargar, setError }) {
  const [nuevo, setNuevo] = useState({ nombre: "", descripcion: "", limite_docs: 20 });
  const [creando, setCreando] = useState(false);

  async function crear(e) {
    e.preventDefault();
    setCreando(true); setError(null);
    try {
      await crearPlan({ ...nuevo, limite_docs: Number(nuevo.limite_docs) || 0 });
      setNuevo({ nombre: "", descripcion: "", limite_docs: 20 });
      await recargar();
    } catch (er) { setError(er.message); }
    finally { setCreando(false); }
  }

  async function guardar(p, cambios) {
    setError(null);
    try { await editarPlan(p.id, cambios); await recargar(); }
    catch (e) { setError(e.message); }
  }

  async function borrar(p) {
    if (!window.confirm(`¿Eliminar el plan «${p.nombre}»?`)) return;
    setError(null);
    try { await eliminarPlan(p.id); await recargar(); }
    catch (e) { setError(e.message); }
  }

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 22 }}>
        {(planes || []).map((p) => (
          <div key={p.id} style={card(C, { padding: 18 })}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 14, alignItems: "end" }}>
              <div>
                <div style={label(C)}>Nombre del plan</div>
                <input defaultValue={p.nombre} onBlur={(e) => e.target.value !== p.nombre && guardar(p, { nombre: e.target.value })}
                  style={{ ...input(C), fontWeight: 800 }} />
              </div>
              <div>
                <div style={label(C)}>Documentos al mes</div>
                <input type="number" min="0" defaultValue={p.limite_docs}
                  onBlur={(e) => Number(e.target.value) !== p.limite_docs && guardar(p, { limite_docs: Number(e.target.value) })}
                  style={input(C)} />
                <p style={{ fontSize: 10.5, color: C.text3, marginTop: 5 }}>0 = sin límite</p>
              </div>
              <div>
                <div style={label(C)}>Descripción</div>
                <input defaultValue={p.descripcion} onBlur={(e) => e.target.value !== p.descripcion && guardar(p, { descripcion: e.target.value })}
                  style={input(C)} />
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <span style={chip(C, C.text2)}>{p.usuarios} usuario(s)</span>
                {p.es_defecto
                  ? <span style={chip(C, C.green)}>por defecto</span>
                  : <button onClick={() => guardar(p, { es_defecto: true })}
                      style={{ background: "none", border: "none", color: C.magenta, fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
                      Usar por defecto
                    </button>}
                {p.usuarios === 0 && !p.es_defecto && (
                  <button onClick={() => borrar(p)}
                    style={{ background: "none", border: "none", color: C.text3, fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
                    Eliminar
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={card(C, { padding: 20 })}>
        <div style={sectionTitle(C)}>Nuevo plan</div>
        <form onSubmit={crear} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 14, alignItems: "end" }}>
          <div>
            <div style={label(C)}>Nombre</div>
            <input value={nuevo.nombre} onChange={(e) => setNuevo({ ...nuevo, nombre: e.target.value })}
              required placeholder="ej. Red de escuelas" style={input(C)} />
          </div>
          <div>
            <div style={label(C)}>Documentos al mes</div>
            <input type="number" min="0" value={nuevo.limite_docs}
              onChange={(e) => setNuevo({ ...nuevo, limite_docs: e.target.value })} style={input(C)} />
          </div>
          <div>
            <div style={label(C)}>Descripción</div>
            <input value={nuevo.descripcion} onChange={(e) => setNuevo({ ...nuevo, descripcion: e.target.value })}
              placeholder="Para quién es este plan" style={input(C)} />
          </div>
          <button type="submit" disabled={creando} style={btnPrimary(C, { justifyContent: "center", opacity: creando ? 0.6 : 1 })}>
            {creando ? "Creando…" : "Crear plan"}
          </button>
        </form>
      </div>
    </>
  );
}
