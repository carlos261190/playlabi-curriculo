import { useState, useEffect } from "react";
import { pal, card } from "./ui.js";
import { LogoCurriculo } from "./icons.jsx";
import { documentoPublico } from "./apiCliente.js";
import PlanView from "./PlanView.jsx";
import StudentView from "./StudentView.jsx";
import BookView from "./BookView.jsx";

/* ============================================================
   VISTA PÚBLICA DE UN DOCUMENTO COMPARTIDO
   Es lo que se abre al escanear el QR, al seguir el enlace o al
   incrustar el documento en un aula virtual.
   No requiere cuenta y es de solo lectura.

   Con ?embed=1 se suprime la cabecera, para que dentro de un
   iframe se vea el documento y nada más.
   ============================================================ */

export default function VistaPublica({ codigo, dark = false, lang = "es" }) {
  const C = pal(dark);
  const [doc, setDoc] = useState(undefined);
  const [error, setError] = useState(null);
  const embebido = new URLSearchParams(window.location.search).get("embed") === "1";

  useEffect(() => {
    documentoPublico(codigo)
      .then((r) => setDoc(r.documento))
      .catch((e) => { setError(e.message); setDoc(null); });
  }, [codigo]);

  const marco = { minHeight: "100vh", background: C.bg };

  if (doc === undefined) {
    return (
      <div style={{ ...marco, display: "grid", placeItems: "center" }}>
        <div className="pf-spin" style={{ width: 30, height: 30, border: `3px solid ${C.border}`, borderTopColor: C.magenta, borderRadius: "50%" }} />
      </div>
    );
  }

  if (!doc) {
    return (
      <div style={{ ...marco, display: "grid", placeItems: "center", padding: 24 }}>
        <div style={card(C, { maxWidth: 420, textAlign: "center", padding: 36 })}>
          <div style={{ display: "grid", placeItems: "center", marginBottom: 16 }}><LogoCurriculo size={44} /></div>
          <h1 style={{ fontSize: 18, fontWeight: 900, color: C.heading, marginBottom: 10 }}>
            Documento no disponible
          </h1>
          <p style={{ fontSize: 13.5, color: C.text2, lineHeight: 1.6 }}>
            {error || "Este enlace ya no está activo."}
          </p>
        </div>
      </div>
    );
  }

  const cfg = doc.cfg || {};
  const nada = () => {};

  return (
    <div style={marco}>
      {!embebido && (
        <div className="no-print" style={{ background: C.gradDark, color: "#fff" }}>
          <div style={{ maxWidth: 1320, margin: "0 auto", padding: "0 clamp(18px,2.5vw,40px)", height: 56, display: "flex", alignItems: "center", gap: 11 }}>
            <LogoCurriculo size={28} sobreFondoOscuro />
            <div style={{ fontSize: 14, fontWeight: 900, letterSpacing: "-0.02em" }}>
              Playlabi <span style={{ fontWeight: 500, color: C.blueLight }}>Currículo</span>
            </div>
            <span style={{ marginLeft: "auto", fontSize: 11.5, color: "rgba(255,255,255,.6)" }}>
              Documento compartido · solo lectura
            </span>
          </div>
        </div>
      )}

      <main style={{ maxWidth: 1000, margin: "0 auto", padding: embebido ? "18px 16px 40px" : "28px clamp(16px,2.5vw,36px) 64px" }}>
        <div id="curr-doc">
          {doc.tipo === "plan" && <PlanView plan={doc.datos} cfg={cfg} C={C} lang={lang} onPrint={nada} onExport={nada} />}
          {doc.tipo === "student" && <StudentView sheet={doc.datos} cfg={cfg} C={C} lang={lang} onPrint={nada} onExport={nada} />}
          {doc.tipo === "book" && (
            <BookView outline={doc.datos.outline || doc.datos} chapters={doc.datos.chapters || {}}
              cfg={cfg} C={C} lang={lang}
              onGenerateChapter={nada} onPrint={nada} onExport={nada} onPrintChapter={nada} />
          )}
        </div>
      </main>
    </div>
  );
}
