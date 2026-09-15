import { useState, useMemo, useRef, useEffect } from "react";
import { COUNTRIES, REGION_LABEL, getCountry, getStage, CATALOG_STATS, countriesByRegion } from "./frameworks.js";
import { SYSTEM_PLAN_CURRICULAR, buildPlanUser, SYSTEM_BOOK_OUTLINE, buildBookOutlineUser, SYSTEM_BOOK_CHAPTER, buildChapterUser, SYSTEM_STUDENT, buildStudentUser, fallbackResources } from "./prompts.js";
import { callCurriculum } from "./api.js";
import { pal, card, label, input, btnPrimary, btnGhost, chip, sectionTitle, download, slug } from "./ui.js";
import { PERFILES_NEURO, nombreSobreedad, brechaEdad } from "./adaptaciones.js";
import { IconDoc, IconBook, IconStudent, IconSun, IconMoon, LogoCurriculo } from "./icons.jsx";
import { makeT, LANGS, REGION_I18N, countryName, perfilLabel, perfilCorto } from "./i18n.js";
import { BRAND_FONT_STACK } from "./brand.js";
import PlanView from "./PlanView.jsx";
import BookView from "./BookView.jsx";
import StudentView from "./StudentView.jsx";
import { buildStandaloneHTML } from "./exportHtml.js";
import { guardarDocumento } from "./apiCliente.js";

/* ============================================================
   PLAYLABI CURRÍCULO — MÓDULO PRINCIPAL
   Asistente de 4 pasos: país → etapa → configuración → documento.
   ============================================================ */

const PRINT_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap');

#curr-print-root, #curr-print-root button, #curr-print-root input,
#curr-print-root textarea, #curr-print-root select {
  font-family: ${BRAND_FONT_STACK};
}
#curr-print-root *, #curr-print-root *::before, #curr-print-root *::after {
  box-sizing: border-box; margin: 0; padding: 0;
}
#curr-print-root h1, #curr-print-root h2, #curr-print-root h3, #curr-print-root h4 { font-weight: 900; }
#curr-print-root input:focus, #curr-print-root textarea:focus, #curr-print-root select:focus {
  outline: 2.5px solid #ed466f; outline-offset: 2px;
}
@keyframes curr-fade-up { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
@keyframes curr-spin { to { transform: rotate(360deg); } }
#curr-print-root .pf-fade-up { animation: curr-fade-up .38s ease both; }
#curr-print-root .pf-spin { animation: curr-spin .9s linear infinite; display: block; }

@media print {
  /* Se oculta solo lo que es interfaz; el resto de la página ES el documento. */
  .no-print { display: none !important; }

  html, body { background: #fff !important; }
  #curr-print-root { background: #fff !important; min-height: 0 !important; }
  #curr-print-root main { padding: 0 !important; max-width: 100% !important; }
  #curr-doc { max-width: 100% !important; padding: 0 !important; }

  /* Las cabeceras de color y las rúbricas forman parte del documento:
     sin esto el navegador las imprime en blanco. */
  #curr-print-root * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  /* Las soluciones y respuestas viven en <details>; en papel deben verse. */
  #curr-print-root details > summary { display: none !important; }
  #curr-print-root details > *:not(summary) { display: block !important; }

  @page { margin: 14mm; }
}
`;

const DEFAULT_CFG = {
  country: "BR", stage: "", grade: "", subject: "",
  topic: "", objective: "", context: "",
  sessions: 1, minutes: 50, groupSize: 30,
  resources: "", resourcesTouched: false,
  scopeIdx: 0, units: 3, chaptersPerUnit: 2,
  source: "",
  perfiles: [], sobreedad: false, edadReal: 15, edadEsperada: 11,
};

export default function CurriculumStudio({ dark = false, onToggleDark, lang = "es", onSetLang, integrado = false, documentoCargado = null, sesion = null, onGuardado }) {
  const C = pal(dark);
  const t = makeT(lang);
  const REG = REGION_I18N[lang] || REGION_I18N.es;
  const [step, setStep] = useState(0);
  const [cfg, setCfg] = useState(DEFAULT_CFG);
  const [mode, setMode] = useState("plan");
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState(false);
  const [busyLabel, setBusyLabel] = useState("");
  const [error, setError] = useState(null);
  const [plan, setPlan] = useState(null);
  const [outline, setOutline] = useState(null);
  const [chapters, setChapters] = useState({});
  const [sheet, setSheet] = useState(null);
  // Plan y ficha son dos caras del mismo documento: conviven y se alternan.
  const [face, setFace] = useState("plan");
  const [loadingChapter, setLoadingChapter] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [guardadoId, setGuardadoId] = useState(null);
  const docRef = useRef(null);

  const country = getCountry(cfg.country);
  const stage = getStage(cfg.country, cfg.stage);
  const set = (patch) => setCfg(c => ({ ...c, ...patch }));

  // Los valores por defecto en texto libre siguen al idioma de la interfaz
  // mientras el docente no los haya editado.
  useEffect(() => {
    setCfg(c => (c.resourcesTouched ? c : { ...c, resources: t("defaultResources") }));
  }, [lang]);

  const byRegion = useMemo(() => countriesByRegion(), []);
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return null;
    return COUNTRIES.filter(c =>
      c.name.toLowerCase().includes(q) || c.fw.short.toLowerCase().includes(q) || c.fw.name.toLowerCase().includes(q)
    );
  }, [search]);

  /* ── Generación ─────────────────────────────────────────── */

  async function generatePlan() {
    setBusy(true); setError(null); setBusyLabel(t("busyPlan"));
    try {
      const result = await callCurriculum(SYSTEM_PLAN_CURRICULAR, buildPlanUser(cfg), 8000);
      if (!result.recursos_digitales?.length) result.recursos_digitales = fallbackResources(cfg);
      setPlan(result); setOutline(null); setChapters({}); setSheet(null); setFace("plan"); setStep(3);
    } catch (e) { setError(e.message); }
    finally { setBusy(false); setBusyLabel(""); }
  }

  // Si ya hay un plan, la ficha se DERIVA de él: mismas actividades, mismos
  // conceptos y mismos recursos, traducidos a la voz del alumno. Así los dos
  // documentos describen exactamente la misma clase.
  async function generateStudent(desdePlan = null) {
    setBusy(true); setError(null);
    setBusyLabel(desdePlan ? t("busyStudentFromPlan") : t("busyStudent"));
    try {
      const result = await callCurriculum(SYSTEM_STUDENT, buildStudentUser(cfg, desdePlan), 6000);
      if (!result.recursos_qr?.length) {
        result.recursos_qr = desdePlan?.recursos_digitales?.length
          ? desdePlan.recursos_digitales
          : fallbackResources(cfg);
      }
      setSheet(result);
      if (!desdePlan) { setPlan(null); setOutline(null); setChapters({}); }
      setFace("student"); setStep(3);
    } catch (e) { setError(e.message); }
    finally { setBusy(false); setBusyLabel(""); }
  }

  async function generateOutline() {
    setBusy(true); setError(null); setBusyLabel(t("busyBook"));
    try {
      const result = await callCurriculum(SYSTEM_BOOK_OUTLINE, buildBookOutlineUser({ ...cfg, scope: t("scopeOptions")[cfg.scopeIdx] }), 6000);
      setOutline(result); setPlan(null); setChapters({}); setSheet(null); setStep(3);
    } catch (e) { setError(e.message); }
    finally { setBusy(false); setBusyLabel(""); }
  }

  async function generateChapter(unit, chapter) {
    const k = `${unit.n}-${chapter.n}`;
    setLoadingChapter(k); setError(null);
    try {
      const result = await callCurriculum(SYSTEM_BOOK_CHAPTER, buildChapterUser(cfg, outline, chapter, unit), 8000);
      if (!result.recursos_qr?.length) result.recursos_qr = fallbackResources({ ...cfg, topic: chapter.titulo });
      setChapters(prev => ({ ...prev, [k]: { ...result, n: chapter.n, titulo: result.titulo || chapter.titulo } }));
    } catch (e) { setError(`${t("chapterWord")} ${chapter.n}: ${e.message}`); }
    finally { setLoadingChapter(null); }
  }


  /* ── Banco ────────────────────────────────────────────────
     Al guardar se consume una unidad del plan. Un libro con
     muchos capítulos cuenta como un solo documento. */
  async function guardarEnBanco() {
    const vista = mode === "book" ? "book" : face;
    const datos = vista === "plan" ? plan : vista === "student" ? sheet : { outline, chapters };
    if (!datos) return;
    setGuardando(true); setError(null);
    try {
      const titulo = vista === "plan" ? plan?.titulo
                   : vista === "student" ? sheet?.titulo
                   : outline?.titulo_obra;
      const r = await guardarDocumento({
        tipo: vista, titulo: titulo || cfg.topic, datos, cfg,
        meta: {
          pais: country?.name || "", marco: country?.fw?.short || "",
          etapa: stage?.name || "", grado: cfg.grade, asignatura: cfg.subject,
        },
      });
      setGuardadoId(r.id);
      onGuardado?.();
    } catch (e) { setError(e.message); }
    finally { setGuardando(false); }
  }

  /* Reabre un documento del banco sin volver a generarlo */
  useEffect(() => {
    if (!documentoCargado) return;
    const d = documentoCargado;
    setCfg(c => ({ ...c, ...(d.cfg || {}) }));
    setMode(d.tipo === "book" ? "book" : d.tipo);
    setPlan(null); setSheet(null); setOutline(null); setChapters({});
    if (d.tipo === "plan") { setPlan(d.datos); setFace("plan"); }
    if (d.tipo === "student") { setSheet(d.datos); setFace("student"); }
    if (d.tipo === "book") { setOutline(d.datos.outline || d.datos); setChapters(d.datos.chapters || {}); }
    setGuardadoId(d.id);
    setStep(3);
  }, [documentoCargado]);

  /* ── Exportación ────────────────────────────────────────── */

  const doPrint = () => window.print();

  const doExport = async () => {
    setBusyLabel(t("busyFile")); setBusy(true);
    try {
      const vista = mode === "book" ? "book" : face;
      const html = await buildStandaloneHTML({ mode: vista, plan, outline, chapters, sheet, cfg, t });
      const name = slug(vista === "plan" ? (plan?.titulo || "plan") : vista === "student" ? (sheet?.titulo || "ficha") : (outline?.titulo_obra || "libro"));
      download(`${name}.html`, html);
    } catch (e) { setError(t("exportFailed") + ": " + e.message); }
    finally { setBusy(false); setBusyLabel(""); }
  };

  /* ── Validación por paso ────────────────────────────────── */
  const canStep1 = !!cfg.country;
  const canStep2 = !!cfg.stage && !!cfg.grade && !!cfg.subject;
  const canGenerate = canStep2 && cfg.topic.trim().length > 2;

  /* ── UI ─────────────────────────────────────────────────── */

  return (
    <div id="curr-print-root" style={{ background: C.bg, minHeight: "100vh" }}>
      <style>{PRINT_CSS}</style>

      {/* Barra del módulo (solo cuando funciona suelto) */}
      {!integrado && <div className="no-print" style={{ background: C.gradDark, color: "#fff" }}>
        {/* La cabecera es el armazón de la aplicación: ocupa todo el ancho y
            ancla la marca a la izquierda y los controles a la derecha. Si se
            encierra en la columna del contenido, en pantallas anchas queda
            flotando hacia el centro con la barra medio vacía. */}
        <div style={{ padding: "0 clamp(18px, 2.5vw, 40px)", height: 58, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
            <LogoCurriculo size={30} sobreFondoOscuro />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 900, letterSpacing: "-0.02em", lineHeight: 1 }}>
                Playlabi <span style={{ fontWeight: 500, color: C.blueLight }}>Currículo</span>
              </div>
              <div style={{ fontSize: 8.5, fontWeight: 700, letterSpacing: "0.13em", color: "rgba(130,211,241,.6)", textTransform: "uppercase", marginTop: 2 }}>
                {t("tagline")}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end" }}>
            {step > 0 && country && <span style={{ fontSize: 12, opacity: 0.8 }}>{country.flag} {country.fw.short}</span>}
            {step > 0 && (
              <button onClick={() => { setStep(0); setPlan(null); setOutline(null); setChapters({}); setSheet(null); setFace("plan"); setError(null); }}
                style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,.65)", background: "rgba(255,255,255,.1)", border: "none", padding: "6px 13px", borderRadius: 20, cursor: "pointer", fontFamily: "inherit" }}>
                {t("newDoc")}
              </button>
            )}
            {onSetLang && (
              <div title={t("uiLang")} style={{ display: "flex", gap: 2, background: "rgba(255,255,255,.12)", borderRadius: 22, padding: 2 }}>
                {LANGS.map(l => (
                  <button key={l.id} onClick={() => onSetLang(l.id)}
                    style={{
                      fontSize: 11, fontWeight: 800, padding: "5px 11px", borderRadius: 20, letterSpacing: ".04em",
                      background: lang === l.id ? "#fff" : "transparent",
                      color: lang === l.id ? C.blue : "rgba(255,255,255,.55)",
                      border: "none", cursor: "pointer", fontFamily: "inherit", transition: "all .18s",
                    }}>
                    {l.label}
                  </button>
                ))}
              </div>
            )}
            {onToggleDark && (
              <button onClick={onToggleDark} title={dark ? t("lightMode") : t("darkMode")}
                style={{ width: 38, height: 22, borderRadius: 11, border: "none", cursor: "pointer", padding: 0, position: "relative", background: "rgba(255,255,255,0.16)", flexShrink: 0 }}>
                <span style={{ position: "absolute", top: 3, left: dark ? 18 : 3, width: 16, height: 16, borderRadius: 8, background: "#fff", transition: "left .25s", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9 }}>
                  {dark ? <IconMoon size={11} color="#002739"/> : <IconSun size={11} color="#002739"/>}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>}

      {/* Indicador de pasos */}
      <div className="no-print" style={{ background: dark ? "rgba(255,255,255,.03)" : "rgba(0,39,57,.05)", borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 1320, margin: "0 auto", padding: "0 clamp(18px, 2.5vw, 40px)", height: 42, display: "flex", alignItems: "center", gap: 4, overflowX: "auto" }}>
          {t("steps").map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
              {i > 0 && <div style={{ width: 20, height: 1, background: i <= step ? C.magenta : C.border, margin: "0 8px" }} />}
              <button
                onClick={() => i < step && setStep(i)}
                disabled={i > step}
                style={{
                  fontSize: 12, fontWeight: i === step ? 800 : 500, fontFamily: "inherit",
                  color: i < step ? C.magenta : i === step ? C.heading : C.text3,
                  background: "none", border: "none", padding: 0,
                  cursor: i < step ? "pointer" : "default", whiteSpace: "nowrap",
                }}>{s}</button>
            </div>
          ))}
        </div>
      </div>

      <main style={{ maxWidth: 1320, margin: "0 auto", padding: "28px clamp(18px, 2.5vw, 40px) 72px" }}>

        {error && (
          <div className="no-print" style={{ background: C.orange1 + "18", border: `1px solid ${C.orange1}55`, borderRadius: 14, padding: "13px 17px", marginBottom: 18, fontSize: 13, color: C.text, lineHeight: 1.55 }}>
            <b style={{ color: C.orange1 }}>{t("failed")}:</b> {error}
          </div>
        )}

        {busy && (
          <div className="no-print" style={{ textAlign: "center", padding: "56px 20px" }}>
            <div className="pf-spin" style={{ width: 36, height: 36, border: `3px solid ${C.border}`, borderTopColor: C.magenta, borderRadius: "50%", margin: "0 auto 18px" }} />
            <p style={{ color: C.text, fontWeight: 700, fontSize: 15, marginBottom: 6 }}>{busyLabel}</p>
            <p style={{ color: C.text3, fontSize: 12.5 }}>
              {country?.flag} {country?.fw.name}
            </p>
          </div>
        )}

        {/* ── PASO 0 · PAÍS ── */}
        {!busy && step === 0 && (
          <div className="pf-fade-up">
            <div style={{ marginBottom: 22 }}>
              <h1 style={{ fontSize: 26, fontWeight: 900, color: C.heading, marginBottom: 8, letterSpacing: "-0.025em" }}>
                {t("s0Title")}
              </h1>
              <p style={{ fontSize: 14, color: C.text2, lineHeight: 1.6, maxWidth: 620 }}>
                {t("s0Desc")}
              </p>
              <div style={{ display: "flex", gap: 16, marginTop: 14, flexWrap: "wrap", fontSize: 12, color: C.text3 }}>
                <span><b style={{ color: C.magenta }}>{CATALOG_STATS.countries}</b> {t("statCountries")}</span>
                <span><b style={{ color: C.magenta }}>{CATALOG_STATS.stages}</b> {t("statStages")}</span>
                <span><b style={{ color: C.magenta }}>{CATALOG_STATS.grades}</b> {t("statGrades")}</span>
                <span><b style={{ color: C.magenta }}>{CATALOG_STATS.subjects}</b> {t("statSubjects")}</span>
              </div>
            </div>

            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t("searchPh")}
              style={{ ...input(C), marginBottom: 18, background: C.surface }}
            />

            {(filtered ? [["", filtered]] : Object.entries(byRegion)).map(([region, list]) => (
              <div key={region} style={{ marginBottom: 24 }}>
                {region && <div style={sectionTitle(C, { color: C.text3 })}>{REG[region] || REGION_LABEL[region]}</div>}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(232px,1fr))", gap: 11 }}>
                  {list.map(c => {
                    const active = cfg.country === c.code;
                    return (
                      <button key={c.code}
                        onClick={() => { set({ country: c.code, stage: "", grade: "", subject: "" }); setStep(1); }}
                        style={{
                          textAlign: "left", padding: 15, borderRadius: 15, cursor: "pointer", fontFamily: "inherit",
                          background: active ? C.blue : C.surface,
                          border: `1.5px solid ${active ? C.blue : C.border}`,
                          color: active ? "#fff" : C.text,
                          transition: "transform .14s, border-color .14s",
                        }}
                        onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.borderColor = C.magenta; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.borderColor = active ? C.blue : C.border; }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 7 }}>
                          <span style={{ fontSize: 21 }}>{c.flag}</span>
                          <span style={{ fontWeight: 800, fontSize: 14 }}>{countryName(c.name, lang)}</span>
                        </div>
                        <div style={{ fontSize: 11.5, fontWeight: 800, color: active ? C.blueLight : C.magenta, marginBottom: 4 }}>{c.fw.short}</div>
                        <div style={{ fontSize: 11, color: active ? "rgba(255,255,255,.6)" : C.text3, lineHeight: 1.4 }}>
                          {c.stages.length} {t("stagesShort")} · {c.fw.standardWord}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
            {filtered?.length === 0 && (
              <p style={{ color: C.text3, fontSize: 13, textAlign: "center", padding: 30 }}>{t("noResults")} «{search}».</p>
            )}
          </div>
        )}

        {/* ── PASO 1 · ETAPA, GRADO, ASIGNATURA ── */}
        {!busy && step === 1 && country && (
          <div className="pf-fade-up">
            <FrameworkCard country={country} C={C} t={t} lang={lang} />

            <div style={{ ...card(C), marginBottom: 14 }}>
              <label style={label(C)}>{t("stageLabel")}</label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(215px,1fr))", gap: 10 }}>
                {country.stages.map(s => {
                  const active = cfg.stage === s.id;
                  return (
                    <button key={s.id}
                      onClick={() => set({ stage: s.id, grade: "", subject: "" })}
                      style={{
                        textAlign: "left", padding: 13, borderRadius: 13, cursor: "pointer", fontFamily: "inherit",
                        background: active ? C.blue : C.bg,
                        border: `1.5px solid ${active ? C.blue : "transparent"}`,
                        color: active ? "#fff" : C.text,
                      }}>
                      <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 4, lineHeight: 1.3 }}>{s.name}</div>
                      <div style={{ fontSize: 11, color: active ? "rgba(255,255,255,.6)" : C.text3 }}>{s.ages}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {stage && (
              <>
                {stage.note && (
                  <div style={{ background: C.blueLight + "1F", borderRadius: 12, padding: "11px 15px", marginBottom: 14, fontSize: 12.5, color: C.text, lineHeight: 1.55 }}>
                    {stage.note}
                  </div>
                )}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 14, marginBottom: 18 }}>
                  <div style={card(C)}>
                    <label style={label(C)}>{t("gradeLabel")}</label>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                      {stage.grades.map(g => (
                        <button key={g} onClick={() => set({ grade: g })}
                          style={{
                            padding: "8px 13px", borderRadius: 10, fontSize: 12.5, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                            background: cfg.grade === g ? C.magenta : C.bg,
                            color: cfg.grade === g ? "#fff" : C.text2,
                            border: "none",
                          }}>{g}</button>
                      ))}
                    </div>
                  </div>
                  <div style={card(C)}>
                    <label style={label(C)}>{stage.subjectWord}</label>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 7, maxHeight: 230, overflowY: "auto" }}>
                      {stage.subjects.map(s => (
                        <button key={s} onClick={() => set({ subject: s })}
                          style={{
                            padding: "8px 13px", borderRadius: 10, fontSize: 12.5, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                            background: cfg.subject === s ? C.magenta : C.bg,
                            color: cfg.subject === s ? "#fff" : C.text2,
                            border: "none", textAlign: "left",
                          }}>{s}</button>
                      ))}
                    </div>
                    <input
                      value={stage.subjects.includes(cfg.subject) ? "" : cfg.subject}
                      onChange={e => set({ subject: e.target.value })}
                      placeholder={t("otherSubject")}
                      style={{ ...input(C), marginTop: 11, fontSize: 13 }}
                    />
                  </div>
                </div>
              </>
            )}

            <div style={{ display: "flex", gap: 10, justifyContent: "space-between", flexWrap: "wrap" }}>
              <button onClick={() => setStep(0)} style={btnGhost(C)}>{t("changeCountry")}</button>
              <button onClick={() => setStep(2)} disabled={!canStep2}
                style={btnPrimary(C, { opacity: canStep2 ? 1 : 0.4, cursor: canStep2 ? "pointer" : "not-allowed" })}>
                {t("continue")}
              </button>
            </div>
          </div>
        )}

        {/* ── PASO 2 · ENCARGO ── */}
        {!busy && step === 2 && country && stage && (
          <div className="pf-fade-up">
            <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 18 }}>
              <span style={chip(C, C.blue)}>{country.flag} {country.name}</span>
              <span style={chip(C, C.magenta)}>{country.fw.short}</span>
              <span style={chip(C, C.text2)}>{stage.name}</span>
              <span style={chip(C, C.text2)}>{cfg.grade}</span>
              <span style={chip(C, C.violet)}>{cfg.subject}</span>
            </div>

            {/* Selector de artefacto */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 12, marginBottom: 18 }}>
              {[
                { id: "plan", Icon: IconDoc, t: country.fw.words.plan, d: t("planDesc") },
                { id: "book", Icon: IconBook, t: country.fw.words.book, d: t("bookDesc") },
                { id: "student", Icon: IconStudent, t: t("studentSheet"), d: t("studentDesc") },
              ].map(o => (
                <button key={o.id} onClick={() => setMode(o.id)}
                  style={{
                    textAlign: "left", padding: 20, borderRadius: 17, cursor: "pointer", fontFamily: "inherit",
                    background: mode === o.id ? C.blue : C.surface,
                    border: `2px solid ${mode === o.id ? C.magenta : C.border}`,
                    color: mode === o.id ? "#fff" : C.text,
                  }}>
                  <div style={{ marginBottom: 11, color: mode === o.id ? C.blueLight : C.magenta }}>
                    <o.Icon size={26} />
                  </div>
                  <div style={{ fontWeight: 900, fontSize: 16, marginBottom: 6 }}>{o.t}</div>
                  <div style={{ fontSize: 12.5, lineHeight: 1.55, color: mode === o.id ? "rgba(255,255,255,.72)" : C.text2 }}>{o.d}</div>
                </button>
              ))}
            </div>

            <div style={{ ...card(C), marginBottom: 14 }}>
              <label style={label(C)}>{mode === "book" ? t("topicBook") : t("topicClass")}</label>
              <input value={cfg.topic} onChange={e => set({ topic: e.target.value })}
                placeholder={mode === "book" ? t("topicPhBook") : t("topicPhClass")}
                style={{ ...input(C), marginBottom: 14 }} />

              <label style={label(C)}>
                {mode === "book" ? t("contextLabel") : t("intentLabel")}
              </label>
              <textarea value={mode === "book" ? cfg.context : cfg.objective}
                onChange={e => set(mode === "book" ? { context: e.target.value } : { objective: e.target.value })}
                rows={2}
                placeholder={mode === "book" ? t("contextPh") : t("intentPh")}
                style={{ ...input(C), resize: "vertical" }} />
            </div>

            {mode !== "book" ? (
              <div style={{ ...card(C), marginBottom: 14 }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 14 }}>
                  <Num C={C} l={t("sessions")} v={cfg.sessions} min={1} max={8} on={v => set({ sessions: v })} />
                  <Num C={C} l={t("minutesPer")} v={cfg.minutes} min={20} max={180} step={5} on={v => set({ minutes: v })} />
                  <Num C={C} l={t("students")} v={cfg.groupSize} min={1} max={60} on={v => set({ groupSize: v })} />
                </div>
                <div style={{ marginTop: 14 }}>
                  <label style={label(C)}>{t("classroomRes")}</label>
                  <input value={cfg.resources} onChange={e => set({ resources: e.target.value, resourcesTouched: true })} style={input(C)} />
                </div>
              </div>
            ) : (
              <div style={{ ...card(C), marginBottom: 14 }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 14 }}>
                  <div>
                    <label style={label(C)}>{t("scope")}</label>
                    <select value={cfg.scopeIdx} onChange={e => set({ scopeIdx: Number(e.target.value) })} style={input(C)}>
                      {t("scopeOptions").map((o, i) => <option key={i} value={i}>{o}</option>)}
                    </select>
                  </div>
                  <Num C={C} l={t("units")} v={cfg.units} min={1} max={8} on={v => set({ units: v })} />
                  <Num C={C} l={t("chaptersPerUnit")} v={cfg.chaptersPerUnit} min={1} max={6} on={v => set({ chaptersPerUnit: v })} />
                </div>
                <p style={{ fontSize: 11.5, color: C.text3, marginTop: 12, lineHeight: 1.5 }}>
                  {t("bookNote").replace("{n}", cfg.units * cfg.chaptersPerUnit)}
                </p>
              </div>
            )}

            <PerfilGrupo cfg={cfg} set={set} C={C} stage={stage} t={t} lang={lang} />

            <div style={{ ...card(C), marginBottom: 18 }}>
              <label style={label(C)}>{t("sourceLabel")}</label>
              <textarea value={cfg.source} onChange={e => set({ source: e.target.value })} rows={4}
                placeholder={t("sourcePh")}
                style={{ ...input(C), resize: "vertical" }} />
              {cfg.source.trim() && (
                <p style={{ fontSize: 11.5, color: C.green, marginTop: 8, fontWeight: 700 }}>
                  {cfg.source.trim().split(/\s+/).length} {t("sourceWords")}
                </p>
              )}
            </div>

            <div style={{ display: "flex", gap: 10, justifyContent: "space-between", flexWrap: "wrap" }}>
              <button onClick={() => setStep(1)} style={btnGhost(C)}>{t("back")}</button>
              <button onClick={mode === "plan" ? generatePlan : mode === "student" ? generateStudent : generateOutline} disabled={!canGenerate}
                style={btnPrimary(C, { opacity: canGenerate ? 1 : 0.4, cursor: canGenerate ? "pointer" : "not-allowed" })}>
                {t("generate")} {mode === "plan" ? country.fw.words.plan : mode === "student" ? t("studentSheet") : country.fw.words.book}
              </button>
            </div>
          </div>
        )}

        {/* ── PASO 3 · DOCUMENTO ── */}
        {!busy && step === 3 && (
          <div id="curr-doc" ref={docRef}>
            <div className="no-print" style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", marginBottom: 16 }}>
              {mode !== "book" && plan && sheet && (
                <FaceSwitch face={face} setFace={setFace} C={C} t={t} />
              )}
              <button onClick={guardarEnBanco} disabled={guardando || !!guardadoId}
                style={btnPrimary(C, {
                  marginLeft: "auto", padding: "10px 20px", fontSize: 13,
                  opacity: guardando ? 0.6 : 1,
                  background: guardadoId ? C.surface : C.grad,
                  color: guardadoId ? C.green : "#fff",
                  border: guardadoId ? `1.5px solid ${C.border}` : "none",
                  cursor: guardadoId ? "default" : guardando ? "wait" : "pointer",
                })}>
                {guardadoId ? "Guardado en el banco" : guardando ? "Guardando…" : "Guardar en el banco"}
              </button>
            </div>
            {mode !== "book" && plan && face === "plan" && (
              <PlanView plan={plan} cfg={cfg} C={C} onPrint={doPrint} onExport={doExport} lang={lang}
                onMakeSheet={sheet ? null : () => generateStudent(plan)} />
            )}
            {mode !== "book" && sheet && face === "student" && (
              <StudentView sheet={sheet} cfg={cfg} C={C} onPrint={doPrint} onExport={doExport} lang={lang}
                derivedFrom={plan ? plan.titulo : null} />
            )}
            {mode === "book" && outline && (
              <BookView
                outline={outline} chapters={chapters} cfg={cfg} C={C}
                loadingChapter={loadingChapter} lang={lang}
                onGenerateChapter={generateChapter}
                onPrint={doPrint} onExport={doExport}
                onPrintChapter={doPrint}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
}

/* ── Conmutador entre las dos caras del mismo documento ── */
function FaceSwitch({ face, setFace, C, t }) {
  return (
    <div className="no-print" style={{
      display: "inline-flex", gap: 3, background: C.bg, borderRadius: 12,
      padding: 3, marginBottom: 16, border: `1px solid ${C.border}`,
    }}>
      {[["plan", t("teacherCopy")], ["student", t("studentCopy")]].map(([id, etiqueta]) => (
        <button key={id} onClick={() => setFace(id)}
          style={{
            padding: "8px 18px", borderRadius: 10, fontSize: 12.5, fontWeight: 800,
            cursor: "pointer", fontFamily: "inherit", border: "none", transition: "all .18s",
            background: face === id ? C.surface : "transparent",
            color: face === id ? C.heading : C.text3,
            boxShadow: face === id ? "0 1px 3px rgba(0,39,57,.12)" : "none",
          }}>
          {etiqueta}
        </button>
      ))}
    </div>
  );
}

/* ── Perfil del grupo: neurodivergencia y desfase edad-grado ── */
function PerfilGrupo({ cfg, set, C, stage, t, lang }) {
  const [abierto, setAbierto] = useState(false);
  const activos = cfg.perfiles || [];
  const brecha = cfg.sobreedad ? brechaEdad(cfg.edadReal, cfg.edadEsperada) : 0;
  const hayAlgo = activos.length > 0 || brecha > 0;

  const toggle = (id) =>
    set({ perfiles: activos.includes(id) ? activos.filter(x => x !== id) : [...activos, id] });

  return (
    <div style={{ ...card(C), marginBottom: 14, borderLeft: hayAlgo ? `4px solid ${C.violet}` : undefined }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 14, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 220 }}>
          <label style={{ ...label(C), marginBottom: 6 }}>{t("profileTitle")}</label>
          <p style={{ fontSize: 12.5, color: C.text2, lineHeight: 1.55 }}>
            {t("profileDesc")}
          </p>
        </div>
        <button onClick={() => setAbierto(o => !o)} style={btnGhost(C, { flexShrink: 0, fontSize: 12, padding: "7px 14px" })}>
          {abierto ? t("hide") : hayAlgo ? t("edit") : t("configure")}
        </button>
      </div>

      {hayAlgo && !abierto && (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 12 }}>
          {activos.map(id => {
            const p = PERFILES_NEURO.find(x => x.id === id);
            return p ? <span key={id} style={chip(C, C.violet)}>{perfilLabel(p, lang)}</span> : null;
          })}
          {brecha > 0 && <span style={chip(C, C.orange2)}>{nombreSobreedad(cfg.country)} · +{brecha} año(s)</span>}
        </div>
      )}

      {abierto && (
        <div style={{ marginTop: 18, paddingTop: 18, borderTop: `1px solid ${C.border}` }}>
          <div style={sectionTitle(C)}>{t("neuroTitle")}</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(215px,1fr))", gap: 9, marginBottom: 22 }}>
            {PERFILES_NEURO.map(p => {
              const on = activos.includes(p.id);
              return (
                <button key={p.id} onClick={() => toggle(p.id)}
                  title={p.implica.join(" · ")}
                  style={{
                    textAlign: "left", padding: 12, borderRadius: 12, cursor: "pointer", fontFamily: "inherit",
                    background: on ? C.violet : C.bg,
                    border: `1.5px solid ${on ? C.violet : "transparent"}`,
                    color: on ? "#fff" : C.text,
                  }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    
                    <span style={{ fontWeight: 800, fontSize: 12.5 }}>{perfilLabel(p, lang)}</span>
                  </div>
                  <div style={{ fontSize: 11, lineHeight: 1.4, color: on ? "rgba(255,255,255,.75)" : C.text3 }}>{perfilCorto(p, lang)}</div>
                </button>
              );
            })}
          </div>

          <div style={sectionTitle(C)}>{nombreSobreedad(cfg.country)}</div>
          <p style={{ fontSize: 12.5, color: C.text2, lineHeight: 1.55, marginBottom: 12 }}>
            {t("gapDesc")}
          </p>
          <button onClick={() => set({ sobreedad: !cfg.sobreedad })}
            style={{
              display: "flex", alignItems: "center", gap: 10, padding: "11px 15px", borderRadius: 12,
              cursor: "pointer", fontFamily: "inherit", width: "100%", textAlign: "left",
              background: cfg.sobreedad ? C.orange2 : C.bg,
              border: `1.5px solid ${cfg.sobreedad ? C.orange2 : "transparent"}`,
              color: cfg.sobreedad ? "#fff" : C.text,
            }}>
            <span style={{
              width: 20, height: 20, borderRadius: 6, flexShrink: 0, display: "grid", placeItems: "center",
              background: cfg.sobreedad ? "rgba(255,255,255,.28)" : C.surface,
              border: `1.5px solid ${cfg.sobreedad ? "transparent" : C.border}`, fontSize: 12, fontWeight: 900,
            }}>{cfg.sobreedad ? "✓" : ""}</span>
            <span style={{ fontWeight: 800, fontSize: 13 }}>{t("gapToggle")}</span>
          </button>

          {cfg.sobreedad && (
            <div style={{ marginTop: 14 }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 14 }}>
                <Num C={C} l={t("realAge")} v={cfg.edadReal} min={5} max={60} on={v => set({ edadReal: v })} />
                <Num C={C} l={t("expectedAge")} v={cfg.edadEsperada} min={3} max={30} on={v => set({ edadEsperada: v })} />
              </div>
              {brecha > 0 ? (
                <div style={{ background: C.orange2 + "18", borderRadius: 12, padding: "12px 15px", marginTop: 12, fontSize: 12.5, color: C.text, lineHeight: 1.55 }}>
                  <b>{t("gapOf")} {brecha} {t("years")}.</b> {cfg.grade || ""} {t("gapExplain")} {cfg.edadReal} {t("gapExplain2")}
                </div>
              ) : (
                <div style={{ background: C.bg, borderRadius: 12, padding: "12px 15px", marginTop: 12, fontSize: 12.5, color: C.text3, lineHeight: 1.55 }}>
                  {t("noGap")}{stage?.ages && <> {t("stageCovers")} {stage.ages}.</>}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Marca del módulo: documento con marcador curricular ── */
function CurriculoLogo({ size = 34 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" style={{ flexShrink: 0 }} aria-hidden="true">
      <rect x="2" y="2" width="36" height="36" rx="10" fill="url(#curr-g)" />
      <path d="M11 12.5h13.5M11 18h13.5M11 23.5h9" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" opacity=".95" />
      <path d="M27.5 9v18l3.2-2.6L33.9 27V9z" fill="#002739" opacity=".82" />
      <defs>
        <linearGradient id="curr-g" x1="2" y1="2" x2="38" y2="38" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ed466f" />
          <stop offset="1" stopColor="#F9A54B" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/* ── Tarjeta del marco normativo del país ── */
function FrameworkCard({ country, C, t, lang }) {
  const [open, setOpen] = useState(false);
  const f = country.fw;
  return (
    <div style={{ ...card(C), marginBottom: 16, borderLeft: `4px solid ${C.magenta}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 14, flexWrap: "wrap", alignItems: "flex-start" }}>
        <div style={{ flex: 1, minWidth: 240 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 7 }}>
            <span style={{ fontSize: 24 }}>{country.flag}</span>
            <div>
              <div style={{ fontWeight: 900, fontSize: 16, color: C.heading, lineHeight: 1.2 }}>{f.name}</div>
              <div style={{ fontSize: 11.5, color: C.text3, marginTop: 2 }}>{f.authority}</div>
            </div>
          </div>
          <p style={{ fontSize: 13, color: C.text2, lineHeight: 1.6, marginTop: 10 }}>{f.designExplain}</p>
        </div>
        <button onClick={() => setOpen(o => !o)} style={btnGhost(C, { flexShrink: 0, fontSize: 12, padding: "7px 14px" })}>
          {open ? t("hideFramework") : t("seeFramework")}
        </button>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 14 }}>
        <span style={chip(C, C.blue)}>{f.short}</span>
        <span style={chip(C, C.text2)}>{f.year}</span>
        <span style={{ ...chip(C, C.violet), fontFamily: "ui-monospace,Menlo,monospace" }}>{f.codeMask}</span>
      </div>

      {open && (
        <div style={{ marginTop: 18, paddingTop: 18, borderTop: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 11.5, color: C.text3, marginBottom: 14, lineHeight: 1.5 }}>{f.codeHelp}</div>

          <div style={sectionTitle(C)}>{f.competenciesWord}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: 18 }}>
            {f.competencies.map((c, i) => (
              <div key={i} style={{ fontSize: 12.5, color: C.text, lineHeight: 1.5, display: "flex", gap: 8 }}>
                <span style={{ color: C.magenta, fontWeight: 900, flexShrink: 0 }}>·</span><span>{c}</span>
              </div>
            ))}
          </div>

          <div style={sectionTitle(C)}>{f.transversalWord}</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 18 }}>
            {f.transversal.map((t, i) => <span key={i} style={chip(C, C.green)}>{t}</span>)}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))", gap: 14 }}>
            <div>
              <div style={sectionTitle(C)}>{t("assessment")}</div>
              <p style={{ fontSize: 12.5, color: C.text2, lineHeight: 1.6 }}>{f.assessment}</p>
            </div>
            <div>
              <div style={sectionTitle(C)}>{t("inclusion")}</div>
              <p style={{ fontSize: 12.5, color: C.text2, lineHeight: 1.6 }}>{f.inclusion}</p>
            </div>
          </div>

          <div style={{ marginTop: 18 }}>
            <div style={sectionTitle(C)}>{t("requiredSections")}</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {f.planParts.map((p, i) => (
                <span key={i} style={{ background: C.bg, padding: "5px 11px", borderRadius: 8, fontSize: 11.5, color: C.text2, fontWeight: 600 }}>{p}</span>
              ))}
            </div>
          </div>

          {f.notes && (
            <p style={{ fontSize: 12, color: C.text2, lineHeight: 1.6, marginTop: 16, padding: "11px 14px", background: C.bg, borderRadius: 10 }}>
              <b style={{ color: C.heading }}>{t("note")}:</b> {f.notes}
            </p>
          )}

          {f.url && (
            <a href={f.url} target="_blank" rel="noreferrer" style={{ display: "inline-block", marginTop: 14, fontSize: 12, fontWeight: 800, color: C.magenta, textDecoration: "none" }}>
              {t("officialSource")}
            </a>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Control numérico ── */
function Num({ C, l, v, on, min = 1, max = 99, step = 1 }) {
  return (
    <div>
      <label style={label(C)}>{l}</label>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <button onClick={() => on(Math.max(min, v - step))}
          style={{ width: 34, height: 38, borderRadius: 10, border: `1.5px solid ${C.border}`, background: C.bg, color: C.text2, fontSize: 16, fontWeight: 800, cursor: "pointer", fontFamily: "inherit", flexShrink: 0 }}>−</button>
        <div style={{ flex: 1, textAlign: "center", fontSize: 17, fontWeight: 900, color: C.heading }}>{v}</div>
        <button onClick={() => on(Math.min(max, v + step))}
          style={{ width: 34, height: 38, borderRadius: 10, border: `1.5px solid ${C.border}`, background: C.bg, color: C.text2, fontSize: 16, fontWeight: 800, cursor: "pointer", fontFamily: "inherit", flexShrink: 0 }}>+</button>
      </div>
    </div>
  );
}
