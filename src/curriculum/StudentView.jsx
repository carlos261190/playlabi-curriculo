import { card, chip, sectionTitle, btnGhost } from "./ui.js";
import { ResourceCard } from "./QRBox.jsx";
import { getCountry, getStage } from "./frameworks.js";
import { IconPrint, IconDownload } from "./icons.jsx";
import { makeT, docLang } from "./i18n.js";

/* ============================================================
   FICHA DEL ESTUDIANTE
   Lo que llega a las manos del alumno. Sin rúbricas, sin códigos
   normativos, sin notas del docente y sin soluciones.
   Diseñada para imprimirse y rellenarse a mano.
   ============================================================ */

/* Renglones para escribir a mano. En pantalla se ven como líneas;
   en papel son el espacio real de respuesta. */
function Lineas({ n = 3, C }) {
  return (
    <div style={{ marginTop: 10 }}>
      {Array.from({ length: n }).map((_, i) => (
        <div key={i} style={{ borderBottom: `1px solid ${C.border}`, height: 26 }} />
      ))}
    </div>
  );
}

export default function StudentView({ sheet, cfg, C, onPrint, onExport, lang = "es", derivedFrom }) {
  if (!sheet) return null;
  // La ficha la lee el alumno: se rotula entera en el idioma del país.
  const tu = makeT(lang);
  const country = getCountry(cfg.country);
  const t = makeT(docLang(country?.lang));
  const st = getStage(cfg.country, cfg.stage);

  return (
    <div className="pf-fade-up">
      {/* ── Encabezado de la ficha ── */}
      <div style={{ background: C.surface, border: `2px solid ${C.blue}`, borderRadius: 18, padding: 24, marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "flex-start", marginBottom: 18 }}>
          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{ fontSize: 10.5, fontWeight: 800, color: C.magenta, textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: 7 }}>
              {sheet.materia || cfg.subject} · {cfg.grade}
            </div>
            <h2 style={{ fontSize: 25, fontWeight: 900, color: C.heading, letterSpacing: "-0.02em", lineHeight: 1.15 }}>
              {sheet.titulo}
            </h2>
            {derivedFrom && (
              <div className="no-print" style={{ fontSize: 11, color: C.text3, marginTop: 8 }}>
                {tu("derivedNote")}: «{derivedFrom}»
              </div>
            )}
          </div>
          <div className="no-print" style={{ display: "flex", gap: 8, flexShrink: 0 }}>
            <button onClick={onPrint} style={btnGhost(C)}><IconPrint size={14} /> {tu("print")}</button>
            <button onClick={onExport} style={btnGhost(C)}><IconDownload size={14} /> {tu("downloadHtml")}</button>
          </div>
        </div>

        {/* Casilleros de identificación: se rellenan a mano */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 12 }}>
          {[t("studentName"), t("studentGroup"), t("studentDate")].map((l, i) => (
            <div key={i}>
              <div style={{ fontSize: 9.5, fontWeight: 800, color: C.text3, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 5 }}>{l}</div>
              <div style={{ borderBottom: `1.5px solid ${C.border}`, height: 24 }} />
            </div>
          ))}
        </div>
      </div>

      {/* ── Gancho de apertura ── */}
      {sheet.gancho && (
        <div style={{ background: C.grad, borderRadius: 16, padding: 22, color: "#fff", marginBottom: 14, breakInside: "avoid" }}>
          <p style={{ fontSize: 15, lineHeight: 1.65, fontWeight: 500 }}>{sheet.gancho}</p>
        </div>
      )}

      {/* ── Qué vas a aprender ── */}
      {sheet.que_vas_a_aprender?.length > 0 && (
        <div style={card(C, { marginBottom: 14, breakInside: "avoid" })}>
          <div style={sectionTitle(C)}>{t("whatYouWillLearn")}</div>
          {sheet.que_vas_a_aprender.map((x, i) => (
            <div key={i} style={{ display: "flex", gap: 11, marginBottom: 8, fontSize: 14, lineHeight: 1.55 }}>
              <span style={{ color: C.magenta, fontWeight: 900, flexShrink: 0 }}>{i + 1}.</span>
              <span style={{ color: C.text }}>{x}</span>
            </div>
          ))}
        </div>
      )}

      {/* ── Activación de conocimientos previos ── */}
      {sheet.lo_que_ya_sabes?.length > 0 && (
        <div style={card(C, { marginBottom: 14, breakInside: "avoid" })}>
          <div style={sectionTitle(C)}>{t("whatYouKnow")}</div>
          {sheet.lo_que_ya_sabes.map((q, i) => (
            <div key={i} style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 14, color: C.text, fontWeight: 600, lineHeight: 1.5 }}>{q.pregunta}</div>
              <Lineas n={q.lineas || 1} C={C} />
            </div>
          ))}
        </div>
      )}

      {/* ── Explicación ── */}
      {sheet.explicacion?.map((b, i) => (
        <div key={i} style={card(C, { marginBottom: 14, breakInside: "avoid" })}>
          <h3 style={{ fontSize: 17, fontWeight: 900, color: C.heading, marginBottom: 11 }}>{b.subtitulo}</h3>
          <p style={{ fontSize: 14.5, color: C.text, lineHeight: 1.8, marginBottom: b.para_recordar ? 14 : 0 }}>{b.texto}</p>
          {b.para_recordar && (
            <div style={{ background: C.blueLight + "22", borderLeft: `3px solid ${C.blueLight}`, padding: "12px 16px", borderRadius: 8 }}>
              <div style={{ fontSize: 9.5, fontWeight: 800, color: C.heading, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 5 }}>{t("remember")}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.text, lineHeight: 1.5 }}>{b.para_recordar}</div>
            </div>
          )}
        </div>
      ))}

      {/* ── Palabras clave ── */}
      {sheet.palabras_clave?.length > 0 && (
        <div style={card(C, { marginBottom: 14, breakInside: "avoid" })}>
          <div style={sectionTitle(C)}>{t("vocabulary")}</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(215px,1fr))", gap: 11 }}>
            {sheet.palabras_clave.map((p, i) => (
              <div key={i} style={{ background: C.bg, borderRadius: 12, padding: 13 }}>
                <div style={{ fontWeight: 900, fontSize: 14, color: C.heading, marginBottom: 5 }}>{p.palabra}</div>
                <div style={{ fontSize: 13, color: C.text2, lineHeight: 1.5 }}>{p.significado}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Actividades con espacio para responder ── */}
      {sheet.actividades?.length > 0 && (
        <>
          <div style={sectionTitle(C, { fontSize: 13, marginTop: 22, marginBottom: 14 })}>{t("yourTurn")}</div>
          {sheet.actividades.map((a, i) => (
            <div key={i} style={card(C, { marginBottom: 14, breakInside: "avoid" })}>
              <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 4 }}>
                <span style={{
                  background: C.grad, color: "#fff", width: 26, height: 26, borderRadius: 8,
                  display: "grid", placeItems: "center", fontWeight: 900, fontSize: 13, flexShrink: 0,
                }}>{a.n}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14.5, color: C.text, lineHeight: 1.55, fontWeight: 600 }}>{a.consigna}</div>
                  {a.tipo && <span style={{ ...chip(C, C.violet), marginTop: 7 }}>{a.tipo}</span>}
                </div>
              </div>
              <Lineas n={a.lineas || 3} C={C} />
              {a.pista && (
                <div style={{ fontSize: 12, color: C.text3, marginTop: 9, fontStyle: "italic", lineHeight: 1.45 }}>
                  {a.pista}
                </div>
              )}
            </div>
          ))}
        </>
      )}

      {/* ── Recursos con QR ── */}
      {sheet.recursos_qr?.length > 0 && (
        <div style={card(C, { marginBottom: 14, breakInside: "avoid" })}>
          <div style={sectionTitle(C)}>{t("expandMobile")}</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(290px,1fr))", gap: 11 }}>
            {sheet.recursos_qr.map((r, i) => (
              <ResourceCard key={i} resource={r} C={C} lang={country?.lang || "es"} />
            ))}
          </div>
        </div>
      )}

      {/* ── Reto extra ── */}
      {sheet.reto_extra?.consigna && (
        <div style={{ background: C.blue, borderRadius: 16, padding: 20, color: "#fff", marginBottom: 14, breakInside: "avoid" }}>
          <div style={{ fontSize: 17, fontWeight: 900, marginBottom: 9 }}>{sheet.reto_extra.titulo}</div>
          <p style={{ fontSize: 14, lineHeight: 1.6, opacity: 0.9 }}>{sheet.reto_extra.consigna}</p>
        </div>
      )}

      {/* ── Autoevaluación ── */}
      {sheet.como_te_fue?.length > 0 && (
        <div style={card(C, { marginBottom: 14, breakInside: "avoid" })}>
          <div style={sectionTitle(C)}>{t("howDidItGo")}</div>
          {sheet.como_te_fue.map((x, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: i < sheet.como_te_fue.length - 1 ? `1px solid ${C.border}` : "none" }}>
              <span style={{ flex: 1, fontSize: 13.5, color: C.text, lineHeight: 1.45 }}>{x}</span>
              <span style={{ display: "flex", gap: 7, flexShrink: 0 }}>
                {["✓", "~", "✗"].map(s => (
                  <span key={s} style={{ width: 26, height: 26, border: `1.5px solid ${C.border}`, borderRadius: 7, display: "grid", placeItems: "center", fontSize: 12, color: C.text3 }}>{s}</span>
                ))}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* ── Para casa ── */}
      {sheet.para_casa && (
        <div style={{ background: C.bg, border: `1.5px dashed ${C.border}`, borderRadius: 14, padding: 17, breakInside: "avoid" }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: C.text3, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>{t("homework")}</div>
          <div style={{ fontSize: 14, color: C.text, lineHeight: 1.6 }}>{sheet.para_casa}</div>
        </div>
      )}

      <div style={{ textAlign: "center", fontSize: 10, color: C.text3, marginTop: 24 }}>
        {country?.flag} {st?.name} · {cfg.grade} · {sheet.materia || cfg.subject}
      </div>
    </div>
  );
}
