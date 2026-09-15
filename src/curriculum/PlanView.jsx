import { card, chip, sectionTitle, btnGhost, BLOOM_COLOR } from "./ui.js";
import { ResourceCard } from "./QRBox.jsx";
import { getCountry, getStage } from "./frameworks.js";
import { IconPrint, IconDownload } from "./icons.jsx";
import { makeT, countryName, docLang } from "./i18n.js";

/* ============================================================
   VISTA DEL PLAN DE AULA
   Render normativo: cada bloque corresponde a una sección que
   una supervisión educativa espera encontrar.
   ============================================================ */

const FASE_COLOR = (C) => ({ Inicio: C.magenta, Desarrollo: C.orange2, Cierre: C.orange3 });

function Block({ C, title, children, style }) {
  return (
    <div style={card(C, { marginBottom: 14, breakInside: "avoid", ...style })}>
      <div style={sectionTitle(C)}>{title}</div>
      {children}
    </div>
  );
}

export default function PlanView({ plan, cfg, C, onPrint, onExport, lang = "es", onMakeSheet }) {
  if (!plan) return null;
  // tu = idioma de la interfaz (botones). t = idioma del documento (secciones).
  const tu = makeT(lang);
  const country = getCountry(cfg.country);
  const t = makeT(docLang(country?.lang));
  const st = getStage(cfg.country, cfg.stage);
  const fw = country?.fw;
  const FC = FASE_COLOR(C);

  const sinCodigo = (plan.estandares || []).filter(e => !e.codigo).length;
  const sinConfirmar = (plan.estandares || []).filter(e => e.codigo && e.verificado === false).length;

  return (
    <div className="pf-fade-up">
      {/* ── Cabecera del documento ── */}
      <div style={{ background: C.gradDark, borderRadius: 20, padding: 26, color: "#fff", marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "flex-start" }}>
          <div style={{ flex: 1, minWidth: 240 }}>
            <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 10 }}>
              <span style={{ background: "rgba(255,255,255,.16)", padding: "3px 11px", borderRadius: 20, fontSize: 11, fontWeight: 800 }}>
                {country?.flag} {countryName(country?.name, lang)}
              </span>
              <span style={{ background: "rgba(255,255,255,.16)", padding: "3px 11px", borderRadius: 20, fontSize: 11, fontWeight: 800 }}>
                {fw?.short}
              </span>
              <span style={{ background: "rgba(255,255,255,.16)", padding: "3px 11px", borderRadius: 20, fontSize: 11, fontWeight: 800 }}>
                {cfg.grade}
              </span>
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 900, letterSpacing: "-0.02em", marginBottom: 8, lineHeight: 1.2 }}>
              {plan.titulo}
            </h2>
            <p style={{ fontSize: 13.5, opacity: 0.82, lineHeight: 1.55, maxWidth: 620 }}>{plan.justificacion}</p>
            <div style={{ display: "flex", gap: 18, marginTop: 14, flexWrap: "wrap", fontSize: 12, opacity: 0.75 }}>
              <span><b>{plan.numero_sesiones || cfg.sessions}</b> {t("sessionsCount")}</span>
              <span><b>{plan.duracion_total_min || cfg.sessions * cfg.minutes}</b> {t("minTotal")}</span>
              <span>{cfg.subject}</span>
              <span>{st?.name}</span>
            </div>
          </div>
          <div className="no-print" style={{ display: "flex", gap: 8, flexShrink: 0 }}>
            <button onClick={onPrint} style={btnGhost(C, { background: "rgba(255,255,255,.14)", color: "#fff", border: "1px solid rgba(255,255,255,.25)" })}><IconPrint size={14}/> {tu("print")}</button>
            <button onClick={onExport} style={btnGhost(C, { background: "rgba(255,255,255,.14)", color: "#fff", border: "1px solid rgba(255,255,255,.25)" })}><IconDownload size={14}/> {tu("downloadHtml")}</button>
            {onMakeSheet && (
              <button onClick={onMakeSheet} style={btnGhost(C, { background: "#fff", color: C.blue, border: "none", fontWeight: 800 })}>
                {tu("makeSheet")}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Aviso de verificación de códigos ── */}
      {(sinCodigo > 0 || sinConfirmar > 0) && (
        <div className="no-print" style={{ background: C.orange3 + "1F", border: `1px solid ${C.orange3}55`, borderRadius: 14, padding: "12px 16px", marginBottom: 14, fontSize: 12.5, color: C.text, lineHeight: 1.5 }}>
          <b>{tu("verifyCodes")}</b>{" "}
          {sinCodigo > 0 && <>{sinCodigo} {fw?.standardWord || ""} {tu("noCodeGiven")} </>}
          {sinConfirmar > 0 && <>{sinConfirmar} {tu("unconfirmed")} </>}
          {fw?.url && <>{tu("sourceOfficial")}: <a href={fw.url} target="_blank" rel="noreferrer" style={{ color: C.magenta, fontWeight: 700 }}>{fw.url}</a></>}
        </div>
      )}

      {/* ── Estándares ── */}
      {plan.estandares?.length > 0 && (
        <Block C={C} title={`${fw?.standardWord || t("competencies")} · ${fw?.short}`}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {plan.estandares.map((e, i) => (
              <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <span style={{
                  fontFamily: "ui-monospace,SFMono-Regular,Menlo,monospace", fontSize: 11.5, fontWeight: 800,
                  background: e.codigo ? C.blue : C.border, color: e.codigo ? "#fff" : C.text3,
                  padding: "5px 10px", borderRadius: 8, flexShrink: 0, minWidth: 74, textAlign: "center",
                }}>
                  {e.codigo || t("noCode")}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: C.text, lineHeight: 1.55 }}>{e.enunciado}</div>
                  {e.componente && <div style={{ fontSize: 11, color: C.text3, marginTop: 3 }}>{e.componente}</div>}
                </div>
              </div>
            ))}
          </div>
        </Block>
      )}

      {/* ── Objetivos ── */}
      <Block C={C} title={t("learningObjectives")}>
        <div style={{ background: C.bg, borderRadius: 12, padding: 15, marginBottom: 12 }}>
          <div style={{ fontSize: 10.5, fontWeight: 800, color: C.text3, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>{t("general")}</div>
          <div style={{ fontSize: 14.5, fontWeight: 700, color: C.text, lineHeight: 1.5 }}>{plan.objetivo_general}</div>
        </div>
        {plan.objetivos_especificos?.map((o, i) => (
          <div key={i} style={{ display: "flex", gap: 10, marginBottom: 7, fontSize: 13, lineHeight: 1.5 }}>
            <span style={{ color: C.magenta, fontWeight: 900, flexShrink: 0 }}>{i + 1}.</span>
            <span style={{ color: C.text }}>{o}</span>
          </div>
        ))}
      </Block>

      {/* ── Competencias y transversalidad ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 14, marginBottom: 14 }}>
        {plan.competencias?.length > 0 && (
          <div style={card(C, { breakInside: "avoid" })}>
            <div style={sectionTitle(C)}>{fw?.competenciesWord || t("competencies")}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {plan.competencias.map((c, i) => (
                <div key={i} style={{ fontSize: 12.5, color: C.text, lineHeight: 1.5, display: "flex", gap: 8 }}>
                  <span style={{ color: C.green, fontWeight: 900 }}>✓</span><span>{c}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        <div style={card(C, { breakInside: "avoid" })}>
          <div style={sectionTitle(C)}>{fw?.transversalWord || t("transversality")}</div>
          {plan.transversal && (
            <>
              <div style={{ fontSize: 13.5, fontWeight: 800, color: C.heading, marginBottom: 6 }}>{plan.transversal.eje}</div>
              <div style={{ fontSize: 12.5, color: C.text2, lineHeight: 1.55, marginBottom: 12 }}>{plan.transversal.como_se_integra}</div>
            </>
          )}
          {plan.ods?.length > 0 && (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {plan.ods.map((o, i) => <span key={i} style={chip(C, C.green)}>ODS {o}</span>)}
            </div>
          )}
        </div>
      </div>

      {/* ── Metodología ── */}
      {plan.metodologia && (
        <div style={{ background: C.blue, borderRadius: 16, padding: 20, color: "#fff", marginBottom: 14, breakInside: "avoid" }}>
          <div style={{ fontSize: 10.5, opacity: 0.6, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 7 }}>{t("methodology")}</div>
          <div style={{ fontSize: 17, fontWeight: 800, marginBottom: 6 }}>{plan.metodologia.nombre}</div>
          <div style={{ fontSize: 13, opacity: 0.8, lineHeight: 1.55 }}>{plan.metodologia.por_que}</div>
        </div>
      )}

      {/* ── Conceptos clave ── */}
      {plan.conceptos_clave?.length > 0 && (
        <Block C={C} title={t("keyConcepts")}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))", gap: 12 }}>
            {plan.conceptos_clave.map((c, i) => (
              <div key={i} style={{ background: C.bg, borderRadius: 12, padding: 14 }}>
                <div style={{ fontWeight: 800, fontSize: 13.5, color: C.heading, marginBottom: 5 }}>{c.termino}</div>
                <div style={{ fontSize: 12.5, color: C.text2, lineHeight: 1.5, marginBottom: 8 }}>{c.definicion}</div>
                {c.por_que_cuesta && (
                  <div style={{ fontSize: 11.5, color: C.orange1, lineHeight: 1.45, borderTop: `1px dashed ${C.border}`, paddingTop: 7 }}>
                    <b>{t("difficulty")}:</b> {c.por_que_cuesta}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Block>
      )}

      {/* ── Sesiones ── */}
      <div style={sectionTitle(C, { fontSize: 13, marginTop: 22, marginBottom: 14 })}>{t("sessionSequence")}</div>
      {plan.sesiones?.map((s, i) => (
        <div key={i} style={card(C, { marginBottom: 14, breakInside: "avoid", padding: 0, overflow: "hidden" })}>
          <div style={{ background: C.bg, padding: "14px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <span style={{ background: C.grad, color: "#fff", width: 28, height: 28, borderRadius: 9, display: "grid", placeItems: "center", fontWeight: 900, fontSize: 13, flexShrink: 0 }}>{s.n}</span>
            <span style={{ fontWeight: 800, fontSize: 15, color: C.heading, flex: 1, minWidth: 150 }}>{s.titulo}</span>
            <span style={chip(C, C.text2)}>{s.duracion_min} min</span>
          </div>
          <div style={{ padding: 20 }}>
            {s.pregunta_detonante && (
              <div style={{ background: C.magenta + "12", borderLeft: `3px solid ${C.magenta}`, padding: "11px 15px", borderRadius: 8, marginBottom: 16 }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: C.magenta, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>{t("triggerQuestion")}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: C.text, lineHeight: 1.45 }}>«{s.pregunta_detonante}»</div>
              </div>
            )}
            {s.fases?.map((f, j) => (
              <div key={j} style={{ display: "flex", gap: 13, marginBottom: 14 }}>
                <div style={{ width: 4, borderRadius: 3, background: FC[f.nombre] || C.magenta, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 8, flexWrap: "wrap" }}>
                    <span style={{ fontWeight: 800, fontSize: 13, color: FC[f.nombre] || C.magenta }}>{f.nombre}</span>
                    <span style={chip(C, C.text3)}>{f.min} min</span>
                    {f.recurso && <span style={{ fontSize: 11, color: C.text3 }}>· {f.recurso}</span>}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 10 }}>
                    <div style={{ background: C.bg, borderRadius: 10, padding: 11 }}>
                      <div style={{ fontSize: 10, fontWeight: 800, color: C.text3, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>{t("teacher")}</div>
                      <div style={{ fontSize: 12.5, color: C.text, lineHeight: 1.5 }}>{f.docente}</div>
                    </div>
                    <div style={{ background: C.bg, borderRadius: 10, padding: 11 }}>
                      <div style={{ fontSize: 10, fontWeight: 800, color: C.text3, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>{t("student")}</div>
                      <div style={{ fontSize: 12.5, color: C.text, lineHeight: 1.5 }}>{f.estudiante}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 14, paddingTop: 14, borderTop: `1px dashed ${C.border}` }}>
              {s.cierre_metacognitivo && (
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ fontSize: 10, fontWeight: 800, color: C.text3, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>{t("metacognition")}</div>
                  <div style={{ fontSize: 12.5, color: C.text, fontStyle: "italic", lineHeight: 1.45 }}>«{s.cierre_metacognitivo}»</div>
                </div>
              )}
              {s.evidencia && (
                <div style={{ flex: 1, minWidth: 180 }}>
                  <div style={{ fontSize: 10, fontWeight: 800, color: C.text3, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>{t("evidence")}</div>
                  <div style={{ fontSize: 12.5, color: C.text, lineHeight: 1.45 }}>{s.evidencia}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* ── Evaluación y rúbrica ── */}
      {plan.evaluacion && (
        <Block C={C} title={t("assessment")}>
          <div style={{ fontSize: 13, color: C.text2, lineHeight: 1.55, marginBottom: 6 }}>{plan.evaluacion.enfoque}</div>
          {plan.evaluacion.instrumento && (
            <div style={{ marginBottom: 16 }}><span style={chip(C, C.violet)}>{plan.evaluacion.instrumento}</span></div>
          )}
          {plan.evaluacion.rubrica?.length > 0 && (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11.5, minWidth: 640 }}>
                <thead>
                  <tr>
                    {t("rubricHeads").map((h, i) => (
                      <th key={i} style={{
                        textAlign: "left", padding: "9px 11px", background: i === 0 ? C.blue : C.bg,
                        color: i === 0 ? "#fff" : C.text2, fontWeight: 800, fontSize: 10.5,
                        textTransform: "uppercase", letterSpacing: "0.05em",
                        borderBottom: `2px solid ${C.border}`,
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {plan.evaluacion.rubrica.map((r, i) => (
                    <tr key={i}>
                      <td style={{ padding: "10px 11px", fontWeight: 800, color: C.heading, borderBottom: `1px solid ${C.border}`, verticalAlign: "top", background: C.bg }}>{r.criterio}</td>
                      {["inicial", "en_proceso", "logrado", "destacado"].map(k => (
                        <td key={k} style={{ padding: "10px 11px", color: C.text2, borderBottom: `1px solid ${C.border}`, verticalAlign: "top", lineHeight: 1.45 }}>{r[k]}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Block>
      )}

      {/* ── Diferenciación y DUA ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 14, marginBottom: 14 }}>
        {plan.diferenciacion && (
          <div style={card(C, { breakInside: "avoid" })}>
            <div style={sectionTitle(C)}>{t("differentiation")}</div>
            {[[t("support"), plan.diferenciacion.apoyo, C.orange1], [t("standard"), plan.diferenciacion.estandar, C.text2], [t("extension"), plan.diferenciacion.ampliacion, C.green]].map(([t, v, col], i) => v && (
              <div key={i} style={{ marginBottom: 11 }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: col, marginBottom: 3 }}>{t}</div>
                <div style={{ fontSize: 12.5, color: C.text, lineHeight: 1.5 }}>{v}</div>
              </div>
            ))}
          </div>
        )}
        {plan.dua && (
          <div style={card(C, { breakInside: "avoid" })}>
            <div style={sectionTitle(C)}>{t("udl")}</div>
            {[[t("udlEngage"), plan.dua.implicacion], [t("udlRepresent"), plan.dua.representacion], [t("udlAction"), plan.dua.accion]].map(([t, v], i) => v && (
              <div key={i} style={{ marginBottom: 11 }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: C.violet, marginBottom: 3 }}>{t}</div>
                <div style={{ fontSize: 12.5, color: C.text, lineHeight: 1.5 }}>{v}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Adaptaciones por perfil ── */}
      {plan.adaptaciones?.length > 0 && (
        <div style={card(C, { marginBottom: 14, breakInside: "avoid", borderLeft: `4px solid ${C.violet}` })}>
          <div style={sectionTitle(C, { color: C.violet })}>{t("adaptationsTitle")}</div>
          <p style={{ fontSize: 11.5, color: C.text3, lineHeight: 1.5, marginBottom: 14 }}>
            {t("adaptationsNote")}
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
            {plan.adaptaciones.map((a, i) => (
              <div key={i} style={{ background: C.bg, borderRadius: 12, padding: 14 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6, flexWrap: "wrap" }}>
                  <span style={chip(C, C.violet)}>{a.perfil}</span>
                  {a.momento && <span style={{ fontSize: 10.5, color: C.text3, fontWeight: 700 }}>{a.momento}</span>}
                </div>
                <div style={{ fontSize: 12.5, color: C.text, lineHeight: 1.55 }}>{a.en_esta_clase}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Recursos digitales con QR ── */}
      {plan.recursos_digitales?.length > 0 && (
        <Block C={C} title={t("digitalResources")}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 12 }}>
            {plan.recursos_digitales.map((r, i) => (
              <ResourceCard key={i} resource={r} C={C} lang={country?.lang || "es"} />
            ))}
          </div>
        </Block>
      )}

      {/* ── Errores frecuentes ── */}
      {plan.errores_frecuentes?.length > 0 && (
        <Block C={C} title={t("commonErrors")}>
          {plan.errores_frecuentes.map((e, i) => (
            <div key={i} style={{ display: "flex", gap: 10, marginBottom: 9, fontSize: 12.5, lineHeight: 1.5 }}>
              <span style={{ color: C.orange1, fontWeight: 900, flexShrink: 0 }}>!</span>
              <span style={{ color: C.text }}>{e}</span>
            </div>
          ))}
        </Block>
      )}

      {/* ── Pregunta modelo de examen externo ── */}
      {plan.pregunta_examen_modelo?.enunciado && (
        <Block C={C} title={t("modelQuestion")}>
          <div style={{ fontSize: 13.5, color: C.text, lineHeight: 1.6, marginBottom: 8 }}>{plan.pregunta_examen_modelo.enunciado}</div>
          <div style={{ fontSize: 11.5, color: C.text3 }}><b>{t("evaluates")}:</b> {plan.pregunta_examen_modelo.que_evalua}</div>
        </Block>
      )}

      {/* ── Cierre administrativo ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 14 }}>
        {plan.materiales && (
          <div style={card(C, { breakInside: "avoid" })}>
            <div style={sectionTitle(C)}>{t("materials")}</div>
            <div style={{ fontSize: 12.5, color: C.text, lineHeight: 1.55 }}>{plan.materiales}</div>
          </div>
        )}
        {plan.tarea_casa && (
          <div style={card(C, { breakInside: "avoid" })}>
            <div style={sectionTitle(C)}>{t("homework")}</div>
            <div style={{ fontSize: 12.5, color: C.text, lineHeight: 1.55 }}>{plan.tarea_casa}</div>
          </div>
        )}
        {plan.bibliografia?.length > 0 && (
          <div style={card(C, { breakInside: "avoid" })}>
            <div style={sectionTitle(C)}>{t("bibliography")}</div>
            {plan.bibliografia.map((b, i) => (
              <div key={i} style={{ fontSize: 11.5, color: C.text2, lineHeight: 1.5, marginBottom: 5 }}>{b}</div>
            ))}
          </div>
        )}
      </div>

      {plan.nota_normativa && (
        <div style={{ background: C.blueLight + "22", border: `1px solid ${C.blueLight}55`, borderRadius: 14, padding: "13px 17px", marginTop: 14, fontSize: 12.5, color: C.text, lineHeight: 1.55 }}>
          <b style={{ color: C.heading }}>{t("normativeNote")} · {countryName(country?.name, lang)}:</b> {plan.nota_normativa}
        </div>
      )}

      <div style={{ textAlign: "center", fontSize: 10.5, color: C.text3, marginTop: 24, lineHeight: 1.6 }}>
        {t("footerLine")} {fw?.name} ({fw?.short})<br />
        {t("footerVerify")}
      </div>
    </div>
  );
}
