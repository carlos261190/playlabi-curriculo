import { useState } from "react";
import { card, chip, sectionTitle, btnGhost, btnPrimary, BLOOM_COLOR } from "./ui.js";
import { ResourceCard } from "./QRBox.jsx";
import { getCountry, getStage } from "./frameworks.js";
import { IconPrint, IconDownload } from "./icons.jsx";
import { makeT, countryName, docLang } from "./i18n.js";
import { BRAND } from "./brand.js";

/* ============================================================
   VISTA DEL LIBRO DIDÁCTICO
   Dos capas: la arquitectura de la obra (sumario, cartas,
   secciones fijas, proyecto final) y el capítulo escrito.
   Los capítulos se generan bajo demanda porque una obra completa
   no cabe en una sola llamada al modelo.
   ============================================================ */

export default function BookView({
  outline, chapters, cfg, C, loadingChapter,
  onGenerateChapter, onPrint, onExport, onPrintChapter, lang = "es",
}) {
  const [openChapter, setOpenChapter] = useState(null);
  const tu = makeT(lang);
  if (!outline) return null;

  const country = getCountry(cfg.country);
  const st = getStage(cfg.country, cfg.stage);
  const fw = country?.fw;
  const t = makeT(docLang(country?.lang));
  const paleta = outline.paleta || {};
  const key = (u, c) => `${u}-${c}`;

  const totalCaps = (outline.unidades || []).reduce((n, u) => n + (u.capitulos?.length || 0), 0);
  const hechos = Object.keys(chapters || {}).length;

  return (
    <div className="pf-fade-up">
      {/* ── PORTADA EDITORIAL ── */}
      <div style={{
        borderRadius: 22, padding: 32, marginBottom: 16, color: "#fff",
        background: `linear-gradient(135deg, ${paleta.primario || "#002739"} 0%, ${paleta.secundario || "#0D4060"} 100%)`,
        position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", right: -40, top: -40, width: 200, height: 200, borderRadius: "50%",
          background: (paleta.acento || BRAND.magenta) + "33",
        }} />
        <div style={{ position: "relative" }}>
          <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 14 }}>
            {[`${country?.flag} ${countryName(country?.name, lang)}`, fw?.short, cfg.grade, cfg.subject].filter(Boolean).map((t, i) => (
              <span key={i} style={{ background: "rgba(255,255,255,.18)", padding: "3px 11px", borderRadius: 20, fontSize: 11, fontWeight: 800 }}>{t}</span>
            ))}
          </div>
          <h2 style={{ fontSize: 32, fontWeight: 900, letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 8, maxWidth: 640 }}>
            {outline.titulo_obra}
          </h2>
          <p style={{ fontSize: 15, opacity: 0.85, fontWeight: 500, marginBottom: 16, maxWidth: 560 }}>{outline.subtitulo}</p>
          <p style={{ fontSize: 13.5, opacity: 0.75, lineHeight: 1.6, maxWidth: 620 }}>{outline.sinopsis}</p>
          {outline.promesa && (
            <div style={{ marginTop: 18, padding: "13px 17px", background: "rgba(255,255,255,.12)", borderRadius: 12, maxWidth: 560, borderLeft: `3px solid ${paleta.acento || BRAND.magenta}` }}>
              <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", opacity: 0.6, marginBottom: 5 }}>{t("afterBook")}</div>
              <div style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.45 }}>{outline.promesa}</div>
            </div>
          )}
          <div className="no-print" style={{ display: "flex", gap: 8, marginTop: 20, flexWrap: "wrap" }}>
            <button onClick={onPrint} style={btnGhost(C, { background: "rgba(255,255,255,.16)", color: "#fff", border: "1px solid rgba(255,255,255,.28)" })}><IconPrint size={14}/> {tu("printBook")}</button>
            <button onClick={onExport} style={btnGhost(C, { background: "rgba(255,255,255,.16)", color: "#fff", border: "1px solid rgba(255,255,255,.28)" })}><IconDownload size={14}/> {tu("downloadHtml")}</button>
            <span style={{ alignSelf: "center", fontSize: 12, opacity: 0.7, marginLeft: 4 }}>
              {hechos} {tu("ofWord")} {totalCaps} {tu("chaptersWritten")}
            </span>
          </div>
        </div>
      </div>

      {/* ── CARTAS ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(290px,1fr))", gap: 14, marginBottom: 16 }}>
        {outline.carta_al_estudiante && (
          <div style={card(C, { breakInside: "avoid" })}>
            <div style={sectionTitle(C)}>{t("letterStudent")}</div>
            <p style={{ fontSize: 13.5, color: C.text, lineHeight: 1.7 }}>{outline.carta_al_estudiante}</p>
          </div>
        )}
        {outline.carta_al_docente && (
          <div style={card(C, { breakInside: "avoid" })}>
            <div style={sectionTitle(C)}>{t("letterTeacher")}</div>
            <p style={{ fontSize: 13.5, color: C.text, lineHeight: 1.7 }}>{outline.carta_al_docente}</p>
          </div>
        )}
      </div>

      {/* ── SECCIONES FIJAS: la firma editorial ── */}
      {outline.secciones_fijas?.length > 0 && (
        <div style={card(C, { marginBottom: 16, breakInside: "avoid" })}>
          <div style={sectionTitle(C)}>{t("chapterArchitecture")}</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 11 }}>
            {outline.secciones_fijas.map((s, i) => (
              <div key={i} style={{ background: C.bg, borderRadius: 12, padding: 13, display: "flex", gap: 11, alignItems: "flex-start" }}>
                
                <div>
                  <div style={{ fontWeight: 800, fontSize: 12.5, color: C.heading, marginBottom: 3 }}>{s.nombre}</div>
                  <div style={{ fontSize: 11.5, color: C.text2, lineHeight: 1.45 }}>{s.funcion}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── SUMARIO ── */}
      <div style={sectionTitle(C, { fontSize: 13, marginTop: 24, marginBottom: 14 })}>{t("summary")}</div>
      {outline.unidades?.map((u) => (
        <div key={u.n} style={card(C, { marginBottom: 14, padding: 0, overflow: "hidden", breakInside: "avoid" })}>
          <div style={{ background: (paleta.primario || C.blue), color: "#fff", padding: "16px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 7, flexWrap: "wrap" }}>
              <span style={{ background: "rgba(255,255,255,.2)", width: 26, height: 26, borderRadius: 8, display: "grid", placeItems: "center", fontWeight: 900, fontSize: 12 }}>{u.n}</span>
              <span style={{ fontWeight: 900, fontSize: 16 }}>{u.titulo}</span>
            </div>
            {u.pregunta_esencial && (
              <div style={{ fontSize: 12.5, opacity: 0.8, fontStyle: "italic", lineHeight: 1.45 }}>«{u.pregunta_esencial}»</div>
            )}
          </div>
          <div style={{ padding: 16 }}>
            {u.capitulos?.map((cap) => {
              const k = key(u.n, cap.n);
              const done = !!chapters?.[k];
              const busy = loadingChapter === k;
              return (
                <div key={cap.n} style={{
                  borderBottom: `1px solid ${C.border}`, padding: "13px 0",
                  display: "flex", gap: 14, alignItems: "flex-start", flexWrap: "wrap",
                }}>
                  <span style={{
                    width: 26, height: 26, borderRadius: 8, display: "grid", placeItems: "center",
                    fontWeight: 900, fontSize: 12, flexShrink: 0,
                    background: done ? C.green : C.bg, color: done ? "#fff" : C.text3,
                  }}>{done ? "✓" : cap.n}</span>
                  <div style={{ flex: 1, minWidth: 180 }}>
                    <div style={{ fontWeight: 800, fontSize: 14, color: C.heading, marginBottom: 4 }}>{cap.titulo}</div>
                    <div style={{ fontSize: 12.5, color: C.text2, lineHeight: 1.5, marginBottom: 7 }}>{cap.resumen}</div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                      {cap.estandares?.map((e, i) => (
                        <span key={i} style={{
                          fontFamily: "ui-monospace,Menlo,monospace", fontSize: 10, fontWeight: 800,
                          background: e.codigo ? C.blue : C.border, color: e.codigo ? "#fff" : C.text3,
                          padding: "2px 8px", borderRadius: 6,
                        }} title={e.enunciado}>{e.codigo || t("noCode")}</span>
                      ))}
                      {cap.paginas_estimadas && <span style={{ fontSize: 10.5, color: C.text3 }}>≈{cap.paginas_estimadas} {t("pagesShort")}</span>}
                    </div>
                    {cap.depende_de && (
                      <div style={{ fontSize: 11, color: C.text3, marginTop: 6 }}>{t("requires")}: {cap.depende_de}</div>
                    )}
                  </div>
                  <div className="no-print" style={{ display: "flex", gap: 7, flexShrink: 0 }}>
                    {done && (
                      <button onClick={() => setOpenChapter(openChapter === k ? null : k)} style={btnGhost(C, { padding: "7px 14px", fontSize: 12 })}>
                        {openChapter === k ? tu("close") : tu("read")}
                      </button>
                    )}
                    <button
                      onClick={() => onGenerateChapter(u, cap)}
                      disabled={busy}
                      style={btnPrimary(C, {
                        padding: "7px 14px", fontSize: 12, opacity: busy ? 0.6 : 1,
                        cursor: busy ? "wait" : "pointer",
                        background: done ? C.surface : C.grad,
                        color: done ? C.text2 : "#fff",
                        border: done ? `1.5px solid ${C.border}` : "none",
                      })}>
                      {busy ? tu("writing") : done ? tu("regenerate") : tu("write")}
                    </button>
                  </div>
                  {openChapter === k && chapters[k] && (
                    <div style={{ width: "100%", marginTop: 14 }}>
                      <Chapter chapter={chapters[k]} C={C} country={country} paleta={paleta} lang={lang} onPrint={() => onPrintChapter(k)} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* ── PROYECTO FINAL ── */}
      {outline.proyecto_final && (
        <div style={{ background: C.grad, borderRadius: 20, padding: 26, color: "#fff", marginTop: 18, breakInside: "avoid" }}>
          <div style={{ fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.09em", opacity: 0.75, marginBottom: 8 }}>{t("finalProject")}</div>
          <h3 style={{ fontSize: 22, fontWeight: 900, marginBottom: 10, letterSpacing: "-0.02em" }}>{outline.proyecto_final.titulo}</h3>
          <p style={{ fontSize: 13.5, lineHeight: 1.65, opacity: 0.92, marginBottom: 16, maxWidth: 640 }}>{outline.proyecto_final.descripcion}</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 12 }}>
            {[[t("product"), outline.proyecto_final.producto], [t("assessment"), outline.proyecto_final.evaluacion]].map(([t, v], i) => v && (
              <div key={i} style={{ background: "rgba(255,255,255,.16)", borderRadius: 12, padding: 13 }}>
                <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.07em", opacity: 0.7, marginBottom: 4 }}>{t}</div>
                <div style={{ fontSize: 13, fontWeight: 700, lineHeight: 1.45 }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {outline.nota_normativa && (
        <div style={{ background: C.blueLight + "22", border: `1px solid ${C.blueLight}55`, borderRadius: 14, padding: "13px 17px", marginTop: 16, fontSize: 12.5, color: C.text, lineHeight: 1.55 }}>
          <b style={{ color: C.heading }}>{t("normativeNote")} · {countryName(country?.name, lang)}:</b> {outline.nota_normativa}
        </div>
      )}
    </div>
  );
}

/* ── CAPÍTULO COMPLETO ─────────────────────────────────────── */
export function Chapter({ chapter, C, country, paleta = {}, onPrint, lang = "es" }) {
  const ch = chapter;
  const tu = makeT(lang);
  const t = makeT(docLang(country?.lang));
  const acento = paleta.acento || C.magenta;

  return (
    <div style={{ background: C.bg, borderRadius: 16, padding: 20, border: `1px solid ${C.border}` }}>
      {/* Apertura */}
      {ch.apertura && (
        <div style={{ marginBottom: 22 }}>
          <div style={{ fontSize: 18, fontWeight: 900, color: C.heading, marginBottom: 10, lineHeight: 1.25 }}>
            {ch.n}. {ch.titulo}
          </div>
          <div style={{ fontSize: 15.5, fontWeight: 700, color: acento, lineHeight: 1.5, marginBottom: 12 }}>
            {ch.apertura.frase_gancho}
          </div>
          {ch.apertura.pregunta_esencial && (
            <div style={{ background: C.surface, borderLeft: `3px solid ${acento}`, padding: "11px 15px", borderRadius: 8, marginBottom: 12 }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: C.text3, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>{t("essentialQuestion")}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.text, lineHeight: 1.45 }}>{ch.apertura.pregunta_esencial}</div>
            </div>
          )}
          {ch.apertura.lo_que_ya_sabes?.length > 0 && (
            <div style={{ background: C.surface, borderRadius: 12, padding: 14 }}>
              <div style={{ fontSize: 10.5, fontWeight: 800, color: C.text3, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>{t("whatYouKnow")}</div>
              {ch.apertura.lo_que_ya_sabes.map((x, i) => (
                <div key={i} style={{ fontSize: 12.5, color: C.text, lineHeight: 1.5, marginBottom: 5, display: "flex", gap: 8 }}>
                  <span style={{ color: C.blueLight, fontWeight: 900 }}>–</span><span>{x}</span>
                </div>
              ))}
            </div>
          )}
          {ch.apertura.imagen_prompt && (
            <div style={{ fontSize: 10.5, color: C.text3, marginTop: 10, fontStyle: "italic", lineHeight: 1.45 }}>
              {t("suggestedCover")}: «{ch.apertura.imagen_prompt}»
            </div>
          )}
        </div>
      )}

      {/* Objetivos y estándares */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 12, marginBottom: 22 }}>
        {ch.objetivos?.length > 0 && (
          <div style={{ background: C.surface, borderRadius: 12, padding: 14 }}>
            <div style={{ fontSize: 10.5, fontWeight: 800, color: acento, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>{t("objectives")}</div>
            {ch.objetivos.map((o, i) => (
              <div key={i} style={{ fontSize: 12.5, color: C.text, lineHeight: 1.5, marginBottom: 5 }}>{i + 1}. {o}</div>
            ))}
          </div>
        )}
        {ch.estandares?.length > 0 && (
          <div style={{ background: C.surface, borderRadius: 12, padding: 14 }}>
            <div style={{ fontSize: 10.5, fontWeight: 800, color: acento, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>{country?.fw?.standardWord || t("competencies")}</div>
            {ch.estandares.map((e, i) => (
              <div key={i} style={{ marginBottom: 7 }}>
                <span style={{ fontFamily: "ui-monospace,Menlo,monospace", fontSize: 10, fontWeight: 800, background: e.codigo ? C.blue : C.border, color: e.codigo ? "#fff" : C.text3, padding: "2px 7px", borderRadius: 5, marginRight: 7 }}>
                  {e.codigo || t("noCode")}
                </span>
                <span style={{ fontSize: 12, color: C.text2, lineHeight: 1.45 }}>{e.enunciado}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Vocabulario */}
      {ch.vocabulario?.length > 0 && (
        <div style={{ marginBottom: 22 }}>
          <div style={sectionTitle(C, { color: acento })}>{t("vocabulary")}</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(215px,1fr))", gap: 11 }}>
            {ch.vocabulario.map((v, i) => (
              <div key={i} style={{ background: C.surface, borderRadius: 12, padding: 13, borderTop: `3px solid ${acento}` }}>
                <div style={{ fontWeight: 900, fontSize: 13.5, color: C.heading, marginBottom: 5 }}>{v.termino}</div>
                <div style={{ fontSize: 12.5, color: C.text, lineHeight: 1.5, marginBottom: 7 }}>{v.definicion}</div>
                {v.ejemplo && <div style={{ fontSize: 11.5, color: C.text2, lineHeight: 1.45 }}><b>{t("example")}</b> {v.ejemplo}</div>}
                {v.en_contexto && <div style={{ fontSize: 11, color: C.text3, fontStyle: "italic", lineHeight: 1.45, marginTop: 5 }}>«{v.en_contexto}»</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Desarrollo */}
      {ch.desarrollo?.map((d, i) => (
        <div key={i} style={{ marginBottom: 22, breakInside: "avoid" }}>
          <h4 style={{ fontSize: 16, fontWeight: 900, color: C.heading, marginBottom: 10 }}>{d.subtitulo}</h4>
          <p style={{ fontSize: 14, color: C.text, lineHeight: 1.75, marginBottom: 12, textAlign: "justify" }}>{d.texto}</p>
          {d.idea_clave && (
            <div style={{ background: acento + "14", borderLeft: `3px solid ${acento}`, padding: "11px 15px", borderRadius: 8, marginBottom: 12 }}>
              <div style={{ fontSize: 9.5, fontWeight: 800, color: acento, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>{t("keyIdea")}</div>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: C.text, lineHeight: 1.5 }}>{d.idea_clave}</div>
            </div>
          )}
          {d.infografia && (
            <div style={{ background: C.surface, border: `1.5px dashed ${C.border}`, borderRadius: 12, padding: 15, marginBottom: 12 }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 7, flexWrap: "wrap" }}>
                <span style={chip(C, C.violet)}>{d.infografia.tipo}</span>
                <span style={{ fontSize: 10, color: C.text3, fontWeight: 700 }}>{t("designBrief")}</span>
              </div>
              <div style={{ fontSize: 12.5, color: C.text, lineHeight: 1.55, marginBottom: 9 }}>{d.infografia.descripcion}</div>
              {d.infografia.elementos?.length > 0 && (
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {d.infografia.elementos.map((e, j) => (
                    <span key={j} style={{ background: C.bg, padding: "3px 9px", borderRadius: 6, fontSize: 11, color: C.text2, fontWeight: 600 }}>{e}</span>
                  ))}
                </div>
              )}
            </div>
          )}
          {d.dato_curioso && (
            <div style={{ background: C.surface, borderRadius: 12, padding: 13, display: "flex", gap: 11, alignItems: "flex-start" }}>
              
              <div style={{ fontSize: 12.5, color: C.text, lineHeight: 1.55 }}>{d.dato_curioso}</div>
            </div>
          )}
        </div>
      ))}

      {/* Recursos QR */}
      {ch.recursos_qr?.length > 0 && (
        <div style={{ marginBottom: 22 }}>
          <div style={sectionTitle(C, { color: acento })}>{t("expandMobile")}</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(290px,1fr))", gap: 11 }}>
            {ch.recursos_qr.map((r, i) => <ResourceCard key={i} resource={r} C={C} lang={country?.lang || "es"} />)}
          </div>
        </div>
      )}

      {/* Actividades */}
      {ch.actividades?.length > 0 && (
        <div style={{ marginBottom: 22 }}>
          <div style={sectionTitle(C, { color: acento })}>{t("activities")}</div>
          {ch.actividades.map((a, i) => (
            <div key={i} style={{ background: C.surface, borderRadius: 12, padding: 14, marginBottom: 9, breakInside: "avoid" }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 7, flexWrap: "wrap" }}>
                <span style={{ background: BLOOM_COLOR[a.nivel] || C.magenta, color: "#fff", width: 22, height: 22, borderRadius: 7, display: "grid", placeItems: "center", fontSize: 11, fontWeight: 900 }}>{a.n}</span>
                <span style={chip(C, BLOOM_COLOR[a.nivel] || C.magenta)}>{a.nivel}</span>
                {a.formato && <span style={{ fontSize: 10.5, color: C.text3, fontWeight: 700 }}>{a.formato}</span>}
                {a.tiempo_min && <span style={{ fontSize: 10.5, color: C.text3 }}>· {a.tiempo_min} min</span>}
              </div>
              <div style={{ fontSize: 13, color: C.text, lineHeight: 1.55, marginBottom: 8 }}>{a.consigna}</div>
              {a.solucion && (
                <details style={{ fontSize: 12, color: C.text2 }}>
                  <summary style={{ cursor: "pointer", fontWeight: 700, color: C.text3, fontSize: 11 }}>{tu("seeSolution")}</summary>
                  <div style={{ marginTop: 6, lineHeight: 1.55, paddingLeft: 4 }}>{a.solucion}</div>
                </details>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Taller */}
      {ch.taller?.titulo && (
        <div style={{ background: C.blue, borderRadius: 16, padding: 20, color: "#fff", marginBottom: 22, breakInside: "avoid" }}>
          <div style={{ display: "flex", gap: 9, alignItems: "center", marginBottom: 10, flexWrap: "wrap" }}>
            <span style={{ background: "rgba(255,255,255,.2)", padding: "3px 11px", borderRadius: 20, fontSize: 10.5, fontWeight: 800 }}>{ch.taller.tipo}</span>
          </div>
          <h4 style={{ fontSize: 18, fontWeight: 900, marginBottom: 10 }}>{ch.taller.titulo}</h4>
          {ch.taller.materiales && (
            <div style={{ fontSize: 12.5, opacity: 0.82, marginBottom: 12, lineHeight: 1.55 }}><b>{t("materials")}:</b> {ch.taller.materiales}</div>
          )}
          {ch.taller.pasos?.map((p, i) => (
            <div key={i} style={{ display: "flex", gap: 10, marginBottom: 7, fontSize: 13, lineHeight: 1.55 }}>
              <span style={{ background: "rgba(255,255,255,.22)", width: 20, height: 20, borderRadius: 6, display: "grid", placeItems: "center", fontSize: 10.5, fontWeight: 900, flexShrink: 0 }}>{i + 1}</span>
              <span style={{ opacity: 0.92 }}>{p}</span>
            </div>
          ))}
          {ch.taller.que_observar && (
            <div style={{ marginTop: 13, padding: "11px 14px", background: "rgba(255,255,255,.13)", borderRadius: 10, fontSize: 12.5, lineHeight: 1.55 }}>
              <b>{t("observe")}:</b> {ch.taller.que_observar}
            </div>
          )}
          {ch.taller.precaucion && (
            <div style={{ marginTop: 9, fontSize: 11.5, color: "#FFC06A", lineHeight: 1.5 }}>{t("caution")}: {ch.taller.precaucion}</div>
          )}
        </div>
      )}

      {/* Conexiones */}
      {ch.conexiones && (
        <div style={{ marginBottom: 22 }}>
          <div style={sectionTitle(C, { color: acento })}>{t("connections")}</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 11 }}>
            {[[t("otherArea"), ch.conexiones.otra_area], [t("dailyLife"), ch.conexiones.vida_cotidiana], [t("sdg"), ch.conexiones.ods], [countryName(country?.name, lang) || t("local"), ch.conexiones.local]].map(([t, v], i) => v && (
              <div key={i} style={{ background: C.surface, borderRadius: 12, padding: 13 }}>
                <div style={{ fontSize: 10.5, fontWeight: 800, color: C.text3, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>{t}</div>
                <div style={{ fontSize: 12.5, color: C.text, lineHeight: 1.5 }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Inclusión */}
      {ch.inclusion && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))", gap: 11, marginBottom: 22 }}>
          {[[t("support"), ch.inclusion.apoyo, C.orange1], [t("extension"), ch.inclusion.ampliacion, C.green]].map(([t, v, col], i) => v && (
            <div key={i} style={{ background: C.surface, borderRadius: 12, padding: 13, borderLeft: `3px solid ${col}` }}>
              <div style={{ fontSize: 10.5, fontWeight: 800, color: col, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 5 }}>{t}</div>
              <div style={{ fontSize: 12.5, color: C.text, lineHeight: 1.5 }}>{v}</div>
            </div>
          ))}
        </div>
      )}

      {/* Síntesis */}
      {ch.sintesis && (
        <div style={{ background: C.surface, borderRadius: 14, padding: 17, marginBottom: 22, breakInside: "avoid" }}>
          <div style={sectionTitle(C, { color: acento })}>{t("synthesis")}</div>
          <p style={{ fontSize: 13.5, color: C.text, lineHeight: 1.7, marginBottom: 14 }}>{ch.sintesis.resumen}</p>
          {ch.sintesis.mapa_conceptual?.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {ch.sintesis.mapa_conceptual.map((m, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 9, flexWrap: "wrap", fontSize: 12 }}>
                  <span style={{ background: C.bg, padding: "5px 11px", borderRadius: 8, fontWeight: 800, color: C.heading }}>{m.concepto}</span>
                  <span style={{ color: acento, fontSize: 10.5, fontWeight: 700 }}>—{m.relacion}→</span>
                  <span style={{ background: C.bg, padding: "5px 11px", borderRadius: 8, fontWeight: 800, color: C.heading }}>{m.conecta_con}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Autoevaluación */}
      {ch.autoevaluacion?.length > 0 && (
        <div style={{ marginBottom: 22 }}>
          <div style={sectionTitle(C, { color: acento })}>{t("selfAssessment")}</div>
          <div style={{ background: C.surface, borderRadius: 12, padding: 15 }}>
            {ch.autoevaluacion.map((a, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 11, padding: "8px 0", borderBottom: i < ch.autoevaluacion.length - 1 ? `1px solid ${C.border}` : "none" }}>
                <span style={{ flex: 1, fontSize: 12.5, color: C.text, lineHeight: 1.45 }}>{a}</span>
                <span style={{ display: "flex", gap: 5, flexShrink: 0 }}>
                  {["✓", "~", "✗"].map(s => (
                    <span key={s} style={{ width: 22, height: 22, border: `1.5px solid ${C.border}`, borderRadius: 6, display: "grid", placeItems: "center", fontSize: 11, color: C.text3 }}>{s}</span>
                  ))}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Evaluación del capítulo */}
      {ch.evaluacion?.length > 0 && (
        <div>
          <div style={sectionTitle(C, { color: acento })}>{t("checkLearning")}</div>
          {ch.evaluacion.map((q, i) => (
            <div key={i} style={{ background: C.surface, borderRadius: 12, padding: 15, marginBottom: 10, breakInside: "avoid" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.text, lineHeight: 1.55, marginBottom: 10 }}>{i + 1}. {q.pregunta}</div>
              {q.opciones?.map((o, j) => (
                <div key={j} style={{ display: "flex", gap: 9, alignItems: "flex-start", marginBottom: 6, fontSize: 12.5 }}>
                  <span style={{
                    width: 20, height: 20, borderRadius: 6, border: `1.5px solid ${C.border}`, flexShrink: 0,
                    display: "grid", placeItems: "center", fontSize: 10.5, fontWeight: 800, color: C.text3,
                  }}>{String.fromCharCode(65 + j)}</span>
                  <span style={{ color: C.text, lineHeight: 1.5 }}>{o}</span>
                </div>
              ))}
              {q.por_que && (
                <details style={{ marginTop: 9 }}>
                  <summary style={{ cursor: "pointer", fontWeight: 700, color: C.text3, fontSize: 11 }}>{tu("seeAnswer")}</summary>
                  <div style={{ marginTop: 7, fontSize: 12, color: C.text2, lineHeight: 1.6 }}>
                    <b style={{ color: C.green }}>{t("correct")}: {String.fromCharCode(65 + (q.respuesta ?? 0))}.</b> {q.por_que}
                  </div>
                </details>
              )}
            </div>
          ))}
        </div>
      )}

      {onPrint && (
        <div className="no-print" style={{ marginTop: 18, textAlign: "right" }}>
          <button onClick={onPrint} style={btnGhost(C)}><IconPrint size={14}/> {tu("printChapter")}</button>
        </div>
      )}
    </div>
  );
}
