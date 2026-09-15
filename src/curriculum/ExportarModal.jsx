import { useState, useEffect } from "react";
import { pal, card, label, btnPrimary, btnGhost, sectionTitle } from "./ui.js";
import { QRCodeImg } from "./QRBox.jsx";
import { IconPrint, IconDownload } from "./icons.jsx";
import { compartirDocumento, urlSitio } from "./apiCliente.js";

/* ============================================================
   EXPORTAR UN DOCUMENTO
   Cuatro salidas: impresión, archivo HTML autónomo, enlace
   público con QR e incrustación en un LMS.

   El enlace solo existe si el documento está publicado: mientras
   no se publique, nadie de fuera puede leerlo.
   ============================================================ */

export default function ExportarModal({
  dark = false, documento, onCerrar, onImprimir, onDescargar,
}) {
  const C = pal(dark);
  const [codigo, setCodigo] = useState(documento?.codigo || null);
  const [publicado, setPublicado] = useState(!!documento?.compartido);
  const [trabajando, setTrabajando] = useState(false);
  const [error, setError] = useState(null);
  const [copiado, setCopiado] = useState(null);

  const enlace = codigo ? `${urlSitio()}/d/${codigo}` : "";
  const embed = codigo
    ? `<iframe src="${urlSitio()}/d/${codigo}?embed=1" width="100%" height="720" style="border:0;border-radius:16px" allowfullscreen title="${(documento?.titulo || "Documento").replace(/"/g, "&quot;")}"></iframe>`
    : "";

  useEffect(() => {
    const esc = (e) => e.key === "Escape" && onCerrar();
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [onCerrar]);

  async function alternarPublicacion(activar) {
    setTrabajando(true); setError(null);
    try {
      const r = await compartirDocumento(documento.id, activar);
      setCodigo(r.codigo || null);
      setPublicado(!!r.compartido);
    } catch (e) { setError(e.message); }
    finally { setTrabajando(false); }
  }

  async function copiar(que, texto) {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(que);
      setTimeout(() => setCopiado(null), 1800);
    } catch { setCopiado("error"); setTimeout(() => setCopiado(null), 2500); }
  }

  const campo = {
    flex: 1, borderRadius: 10, padding: "10px 13px", fontSize: 12.5,
    border: `1.5px solid ${C.border}`, background: C.bg, color: C.text2,
    minWidth: 0, fontFamily: "inherit",
  };

  return (
    <div onClick={onCerrar}
      style={{ position: "fixed", inset: 0, zIndex: 60, display: "flex", alignItems: "center",
               justifyContent: "center", padding: 18, background: "rgba(0,39,57,.62)" }}>
      <div onClick={(e) => e.stopPropagation()} className="pf-fade-up"
        style={card(C, { width: "100%", maxWidth: 520, padding: 26, maxHeight: "90vh", overflowY: "auto" })}>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 14, marginBottom: 6 }}>
          <h3 style={{ fontSize: 19, fontWeight: 900, color: C.heading }}>Exportar</h3>
          <button onClick={onCerrar} aria-label="Cerrar"
            style={{ background: "none", border: "none", fontSize: 20, color: C.text3, cursor: "pointer", lineHeight: 1 }}>×</button>
        </div>
        <p style={{ fontSize: 13, color: C.text2, marginBottom: 22, lineHeight: 1.5 }}>
          {documento?.titulo}
        </p>

        {/* Salidas que no requieren publicar */}
        <div style={{ display: "flex", gap: 9, marginBottom: 24, flexWrap: "wrap" }}>
          <button onClick={onImprimir} style={btnGhost(C)}><IconPrint size={14} /> Imprimir o guardar en PDF</button>
          <button onClick={onDescargar} style={btnGhost(C)}><IconDownload size={14} /> Archivo HTML</button>
        </div>

        <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 22 }}>
          <div style={sectionTitle(C)}>Compartir en línea</div>

          {!publicado ? (
            <>
              <p style={{ fontSize: 13, color: C.text2, lineHeight: 1.6, marginBottom: 16 }}>
                Al publicarlo se crea un enlace con un código imposible de adivinar.
                Cualquiera que tenga ese enlace podrá leer el documento, sin necesidad de cuenta.
                Puedes dejar de publicarlo cuando quieras.
              </p>
              <button onClick={() => alternarPublicacion(true)} disabled={trabajando}
                style={btnPrimary(C, { opacity: trabajando ? 0.6 : 1, cursor: trabajando ? "wait" : "pointer" })}>
                {trabajando ? "Publicando…" : "Publicar y obtener enlace"}
              </button>
            </>
          ) : (
            <>
              <div style={{ display: "flex", gap: 16, alignItems: "flex-start", marginBottom: 20, flexWrap: "wrap" }}>
                <div style={{ background: "#fff", padding: 8, borderRadius: 12, border: `1px solid ${C.border}`, flexShrink: 0 }}>
                  <QRCodeImg url={enlace} size={104} />
                </div>
                <div style={{ flex: 1, minWidth: 170 }}>
                  <div style={label(C)}>Código de acceso</div>
                  <div style={{ fontSize: 25, fontWeight: 900, letterSpacing: "0.09em", color: C.heading, lineHeight: 1.1 }}>
                    {codigo}
                  </div>
                  <p style={{ fontSize: 11.5, color: C.text3, marginTop: 8, lineHeight: 1.5 }}>
                    Escanea el QR o entra en el enlace. No hace falta cuenta.
                  </p>
                </div>
              </div>

              <div style={label(C)}>Enlace</div>
              <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
                <input readOnly value={enlace} style={campo} onFocus={(e) => e.target.select()} />
                <button onClick={() => copiar("enlace", enlace)}
                  style={btnPrimary(C, { padding: "10px 17px", fontSize: 12.5, flexShrink: 0 })}>
                  {copiado === "enlace" ? "Copiado" : "Copiar"}
                </button>
              </div>

              <div style={label(C)}>Incrustar en un aula virtual (LMS)</div>
              <textarea readOnly value={embed} rows={3} onFocus={(e) => e.target.select()}
                style={{ ...campo, width: "100%", fontFamily: "ui-monospace,Menlo,monospace", fontSize: 11, resize: "none", marginBottom: 9 }} />
              <button onClick={() => copiar("embed", embed)} style={btnGhost(C, { width: "100%", justifyContent: "center" })}>
                {copiado === "embed" ? "Código copiado" : "Copiar código de incrustación"}
              </button>

              <button onClick={() => alternarPublicacion(false)} disabled={trabajando}
                style={{ background: "none", border: "none", color: C.orange1, fontSize: 12.5, fontWeight: 700,
                         cursor: "pointer", fontFamily: "inherit", marginTop: 18, padding: 0 }}>
                Dejar de publicar
              </button>
            </>
          )}

          {copiado === "error" && (
            <p style={{ fontSize: 12, color: C.orange1, marginTop: 10 }}>
              No se pudo copiar. Selecciona el texto y cópialo a mano.
            </p>
          )}
          {error && (
            <div style={{ background: C.orange1 + "18", border: `1px solid ${C.orange1}55`, borderRadius: 11,
                          padding: "11px 14px", marginTop: 16, fontSize: 13, color: C.text }}>
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
