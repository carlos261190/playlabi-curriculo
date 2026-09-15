import { StrictMode, useState, useEffect, useCallback } from "react";
import { createRoot } from "react-dom/client";
import CurriculumStudio from "./curriculum/CurriculumStudio.jsx";
import Cuenta from "./curriculum/Cuenta.jsx";
import Banco from "./curriculum/Banco.jsx";
import Admin from "./curriculum/Admin.jsx";
import VistaPublica from "./curriculum/VistaPublica.jsx";
import ExportarModal from "./curriculum/ExportarModal.jsx";
import { PAL_DARK, PAL_LIGHT, pal } from "./curriculum/ui.js";
import { BRAND_FONT_STACK } from "./curriculum/brand.js";
import { LogoCurriculo, IconSun, IconMoon } from "./curriculum/icons.jsx";
import { sesionActual, salir } from "./curriculum/apiCliente.js";
import { LANGS } from "./curriculum/i18n.js";

/* ============================================================
   PLAYLABI CURRÍCULO — APLICACIÓN
   Tres zonas: el estudio donde se generan documentos, el banco
   donde se guardan y el panel de administración.
   Fuera de la sesión existe la vista pública /d/CÓDIGO, que es
   lo que abren el QR y el enlace compartido.
   ============================================================ */

function estiloGlobal(dark) {
  const C = dark ? PAL_DARK : PAL_LIGHT;
  return `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{font-family:${BRAND_FONT_STACK};background:${C.bg};color:${C.text}}
button,input,textarea,select{font-family:${BRAND_FONT_STACK}}
input::placeholder,textarea::placeholder{color:${C.text3};opacity:1}
input,textarea,select{color-scheme:${dark ? "dark" : "light"}}
input:focus,textarea:focus,select:focus{outline:2.5px solid ${C.magenta};outline-offset:2px}
::-webkit-scrollbar{width:6px;height:6px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:${C.border};border-radius:3px}
@keyframes curr-fade-up{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
@keyframes curr-spin{to{transform:rotate(360deg)}}
.pf-fade-up{animation:curr-fade-up .38s ease both}
.pf-spin{animation:curr-spin .9s linear infinite;display:block}
@media print{.no-print{display:none!important}html,body{background:#fff!important}
  *{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}
  details>summary{display:none!important}details>*:not(summary){display:block!important}
  @page{margin:14mm}}
`;
}

function App() {
  const [dark, setDark] = useState(() => localStorage.getItem("curriculo:dark") === "1");
  const [lang, setLang] = useState(() => {
    const g = localStorage.getItem("curriculo:lang");
    if (g) return g;
    const nav = (navigator.language || "es").slice(0, 2).toLowerCase();
    return ["es", "pt", "en"].includes(nav) ? nav : "es";
  });

  const [sesion, setSesion] = useState(undefined);   // undefined = comprobando
  const [zona, setZona] = useState("estudio");
  const [cargarDoc, setCargarDoc] = useState(null);
  const [exportando, setExportando] = useState(null);

  const C = pal(dark);
  const codigoPublico = leerCodigoDeUrl();

  useEffect(() => {
    localStorage.setItem("curriculo:dark", dark ? "1" : "0");
    localStorage.setItem("curriculo:lang", lang);
    document.documentElement.lang = lang;
    let el = document.getElementById("curriculo-estilos");
    if (!el) { el = document.createElement("style"); el.id = "curriculo-estilos"; document.head.appendChild(el); }
    el.textContent = estiloGlobal(dark);
  }, [dark, lang]);

  const comprobarSesion = useCallback(async () => {
    if (codigoPublico) { setSesion(null); return; }
    try {
      const r = await sesionActual();
      setSesion(r.usuario ? { ...r.usuario, uso: r.uso } : null);
    } catch { setSesion(null); }
  }, [codigoPublico]);

  useEffect(() => { comprobarSesion(); }, [comprobarSesion]);

  /* La vista pública no necesita sesión: es lo que abren el QR y el embed. */
  if (codigoPublico) return <VistaPublica codigo={codigoPublico} dark={dark} lang={lang} />;

  if (sesion === undefined) {
    return (
      <div style={{ minHeight: "100vh", background: C.bg, display: "grid", placeItems: "center" }}>
        <div className="pf-spin" style={{ width: 32, height: 32, border: `3px solid ${C.border}`, borderTopColor: C.magenta, borderRadius: "50%" }} />
      </div>
    );
  }

  if (!sesion) return <Cuenta dark={dark} onEntrado={() => comprobarSesion()} />;

  const zonas = [
    ["estudio", "Estudio"],
    ["banco", "Banco de currículos"],
    ...(sesion.rol === "admin" ? [["admin", "Administración"]] : []),
  ];

  return (
    <div style={{ minHeight: "100vh", background: C.bg }}>
      {/* Barra de la aplicación */}
      <div className="no-print" style={{ background: C.gradDark, color: "#fff" }}>
        <div style={{ padding: "0 clamp(18px, 2.5vw, 40px)", height: 58, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 22, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
              <LogoCurriculo size={30} sobreFondoOscuro />
              <div style={{ lineHeight: 1.1 }}>
                <div style={{ fontSize: 15, fontWeight: 900, letterSpacing: "-0.02em" }}>
                  Playlabi <span style={{ fontWeight: 500, color: C.blueLight }}>Currículo</span>
                </div>
              </div>
            </div>
            <nav style={{ display: "flex", gap: 3 }}>
              {zonas.map(([id, txt]) => (
                <button key={id} onClick={() => { setZona(id); setCargarDoc(null); }}
                  style={{
                    padding: "7px 15px", borderRadius: 20, fontSize: 12.5, fontWeight: 800, border: "none",
                    cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap",
                    background: zona === id ? "rgba(255,255,255,.18)" : "transparent",
                    color: zona === id ? "#fff" : "rgba(255,255,255,.6)",
                  }}>
                  {txt}
                </button>
              ))}
            </nav>
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <div style={{ textAlign: "right", lineHeight: 1.25, display: "none" }} className="pf-usuario" />
            <span style={{ fontSize: 12, color: "rgba(255,255,255,.7)", whiteSpace: "nowrap" }}>
              {sesion.nombre.split(" ")[0]}
              {sesion.plan && <span style={{ opacity: 0.6 }}> · {sesion.plan.nombre}</span>}
            </span>
            <div style={{ display: "flex", gap: 2, background: "rgba(255,255,255,.12)", borderRadius: 22, padding: 2 }}>
              {LANGS.map((l) => (
                <button key={l.id} onClick={() => setLang(l.id)}
                  style={{
                    fontSize: 11, fontWeight: 800, padding: "5px 10px", borderRadius: 20, letterSpacing: ".04em",
                    background: lang === l.id ? "#fff" : "transparent",
                    color: lang === l.id ? C.blue : "rgba(255,255,255,.55)",
                    border: "none", cursor: "pointer", fontFamily: "inherit",
                  }}>
                  {l.label}
                </button>
              ))}
            </div>
            <button onClick={() => setDark((d) => !d)} title={dark ? "Modo claro" : "Modo oscuro"}
              style={{ width: 38, height: 22, borderRadius: 11, border: "none", cursor: "pointer", padding: 0, position: "relative", background: "rgba(255,255,255,.16)", flexShrink: 0 }}>
              <span style={{ position: "absolute", top: 3, left: dark ? 18 : 3, width: 16, height: 16, borderRadius: 8, background: "#fff", transition: "left .25s", display: "grid", placeItems: "center" }}>
                {dark ? <IconMoon size={11} color="#002739" /> : <IconSun size={11} color="#002739" />}
              </span>
            </button>
            <button onClick={async () => { await salir(); setSesion(null); }}
              style={{ background: "rgba(255,255,255,.1)", border: "none", color: "rgba(255,255,255,.7)", padding: "6px 13px", borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
              Salir
            </button>
          </div>
        </div>
      </div>

      {/* Zonas */}
      {zona === "estudio" && (
        <CurriculumStudio
          dark={dark} lang={lang} onSetLang={setLang}
          sesion={sesion} documentoCargado={cargarDoc}
          onGuardado={comprobarSesion}
          integrado
        />
      )}

      {zona !== "estudio" && (
        <main style={{ maxWidth: 1320, margin: "0 auto", padding: "30px clamp(18px, 2.5vw, 40px) 72px" }}>
          {zona === "banco" && (
            <Banco dark={dark} uso={sesion.uso}
              onAbrir={(d) => { setCargarDoc(d); setZona("estudio"); }}
              onExportar={(d) => setExportando(d)} />
          )}
          {zona === "admin" && <Admin dark={dark} />}
        </main>
      )}

      {exportando && (
        <ExportarModal dark={dark} documento={exportando}
          onCerrar={() => setExportando(null)}
          onImprimir={() => { setExportando(null); window.print(); }}
          onDescargar={() => setExportando(null)} />
      )}
    </div>
  );
}

/* /d/CODIGO → vista pública del documento compartido */
function leerCodigoDeUrl() {
  const m = window.location.pathname.match(/^\/d\/([A-Za-z0-9-]{4,20})\/?$/);
  return m ? m[1].toUpperCase() : null;
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
