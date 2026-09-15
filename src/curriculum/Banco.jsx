import { useState, useEffect, useMemo } from "react";
import { pal, card, chip, input, btnPrimary, btnGhost, sectionTitle } from "./ui.js";
import { IconDoc, IconBook, IconStudent, IconSearch } from "./icons.jsx";
import { listarDocumentos, abrirDocumento, borrarDocumento } from "./apiCliente.js";

/* ============================================================
   BANCO DE CURRÍCULOS
   Todo lo guardado queda aquí y se reabre sin volver a generarlo
   —ni a gastar una generación de IA—.
   ============================================================ */

const ICONO = { plan: IconDoc, student: IconStudent, book: IconBook };
const ETIQUETA = {
  plan: "Plan de aula",
  student: "Ficha del estudiante",
  book: "Libro didáctico",
};

export default function Banco({ dark = false, onAbrir, onExportar, uso }) {
  const C = pal(dark);
  const [docs, setDocs] = useState(null);
  const [error, setError] = useState(null);
  const [busca, setBusca] = useState("");
  const [tipo, setTipo] = useState("todos");
  const [ocupado, setOcupado] = useState(null);

  useEffect(() => { recargar(); }, []);

  async function recargar() {
    try { setDocs((await listarDocumentos()).documentos); }
    catch (e) { setError(e.message); }
  }

  async function abrir(id) {
    setOcupado(id); setError(null);
    try {
      const r = await abrirDocumento(id);
      onAbrir(r.documento);
    } catch (e) { setError(e.message); }
    finally { setOcupado(null); }
  }

  async function borrar(d) {
    if (!window.confirm(`¿Eliminar «${d.titulo}»? Esta acción no se puede deshacer.`)) return;
    setOcupado(d.id);
    try { await borrarDocumento(d.id); await recargar(); }
    catch (e) { setError(e.message); }
    finally { setOcupado(null); }
  }

  const visibles = useMemo(() => {
    if (!docs) return [];
    const q = busca.trim().toLowerCase();
    return docs.filter((d) =>
      (tipo === "todos" || d.tipo === tipo) &&
      (!q || [d.titulo, d.asignatura, d.grado, d.pais, d.marco]
        .some((x) => String(x || "").toLowerCase().includes(q)))
    );
  }, [docs, busca, tipo]);

  const fecha = (iso) =>
    new Date(iso).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });

  return (
    <div className="pf-fade-up">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, flexWrap: "wrap", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 25, fontWeight: 900, color: C.heading, letterSpacing: "-0.025em", marginBottom: 7 }}>
            Banco de currículos
          </h1>
          <p style={{ fontSize: 13.5, color: C.text2, lineHeight: 1.6, maxWidth: 560 }}>
            Todo lo que guardas queda aquí. Puedes reabrirlo, imprimirlo o compartirlo
            cuando quieras, sin volver a generarlo.
          </p>
        </div>
        {uso && (
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: C.text3, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Este mes
            </div>
            <div style={{ fontSize: 19, fontWeight: 900, color: C.heading, marginTop: 3 }}>
              {uso.documentos}{uso.limite > 0 ? ` / ${uso.limite}` : ""}
              <span style={{ fontSize: 12, fontWeight: 600, color: C.text3 }}> documentos</span>
            </div>
          </div>
        )}
      </div>

      {/* Filtros */}
      <div style={{ display: "flex", gap: 10, marginBottom: 18, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 220 }}>
          <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: C.text3, display: "flex" }}>
            <IconSearch size={15} />
          </span>
          <input value={busca} onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por título, asignatura, grado o país"
            style={{ ...input(C), paddingLeft: 38, background: C.surface }} />
        </div>
        <div style={{ display: "flex", gap: 3, background: C.bg, borderRadius: 11, padding: 3 }}>
          {[["todos", "Todos"], ["plan", "Planes"], ["student", "Fichas"], ["book", "Libros"]].map(([id, txt]) => (
            <button key={id} onClick={() => setTipo(id)}
              style={{
                padding: "8px 14px", borderRadius: 9, fontSize: 12.5, fontWeight: 800, border: "none",
                cursor: "pointer", fontFamily: "inherit",
                background: tipo === id ? C.surface : "transparent",
                color: tipo === id ? C.heading : C.text3,
                boxShadow: tipo === id ? "0 1px 3px rgba(0,39,57,.12)" : "none",
              }}>
              {txt}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div style={{ background: C.orange1 + "18", border: `1px solid ${C.orange1}55`, borderRadius: 13,
                      padding: "12px 16px", marginBottom: 16, fontSize: 13, color: C.text }}>
          {error}
        </div>
      )}

      {docs === null ? (
        <div style={{ textAlign: "center", padding: "50px 20px" }}>
          <div className="pf-spin" style={{ width: 30, height: 30, border: `3px solid ${C.border}`, borderTopColor: C.magenta, borderRadius: "50%", margin: "0 auto" }} />
        </div>
      ) : visibles.length === 0 ? (
        <div style={card(C, { textAlign: "center", padding: "48px 24px" })}>
          <p style={{ fontSize: 14.5, fontWeight: 700, color: C.heading, marginBottom: 8 }}>
            {docs.length === 0 ? "Todavía no has guardado nada" : "Ningún documento coincide con la búsqueda"}
          </p>
          <p style={{ fontSize: 13, color: C.text2, lineHeight: 1.6, maxWidth: 420, margin: "0 auto" }}>
            {docs.length === 0
              ? "Genera un plan de aula, una ficha del estudiante o un libro y pulsa «Guardar en el banco». Aparecerá aquí."
              : "Prueba con otro término o quita el filtro de tipo."}
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))", gap: 13 }}>
          {visibles.map((d) => {
            const Icono = ICONO[d.tipo] || IconDoc;
            const cargando = ocupado === d.id;
            return (
              <div key={d.id} style={card(C, { padding: 18, display: "flex", flexDirection: "column", gap: 13 })}>
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <span style={{ color: C.magenta, marginTop: 2, flexShrink: 0 }}><Icono size={21} /></span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 800, fontSize: 14.5, color: C.heading, lineHeight: 1.35, marginBottom: 6 }}>
                      {d.titulo}
                    </div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                      <span style={chip(C, C.violet)}>{ETIQUETA[d.tipo] || d.tipo}</span>
                      {d.marco && <span style={chip(C, C.text2)}>{d.marco}</span>}
                      {d.compartido ? <span style={chip(C, C.green)}>Publicado</span> : null}
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: 11.5, color: C.text3, lineHeight: 1.55 }}>
                  {[d.pais, d.grado, d.asignatura].filter(Boolean).join(" · ")}
                  <br />Guardado el {fecha(d.creado_en)}
                </div>

                <div style={{ display: "flex", gap: 7, marginTop: "auto", flexWrap: "wrap" }}>
                  <button onClick={() => abrir(d.id)} disabled={cargando}
                    style={btnPrimary(C, { padding: "8px 16px", fontSize: 12.5, opacity: cargando ? 0.6 : 1 })}>
                    {cargando ? "Abriendo…" : "Abrir"}
                  </button>
                  <button onClick={() => onExportar(d)} style={btnGhost(C, { padding: "8px 14px", fontSize: 12.5 })}>
                    Exportar
                  </button>
                  <button onClick={() => borrar(d)} disabled={cargando}
                    style={{ background: "none", border: "none", color: C.text3, fontSize: 12.5, fontWeight: 700,
                             cursor: "pointer", fontFamily: "inherit", marginLeft: "auto" }}>
                    Eliminar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
