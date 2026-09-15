import { useState, useEffect } from "react";
import { qrDataUrl, resourceUrl, resourceMeta } from "./qr.js";
import { chip } from "./ui.js";

/* ============================================================
   QR REAL — escaneable, no decorativo.
   Se genera como PNG en data URL para que sobreviva a la
   impresión y a la exportación a HTML autónomo.
   ============================================================ */

export function QRCodeImg({ url, size = 92, dark = "#002739", alt = "Código QR" }) {
  const [src, setSrc] = useState("");
  const [err, setErr] = useState(false);

  useEffect(() => {
    let alive = true;
    if (!url) { setSrc(""); return; }
    qrDataUrl(url, { scale: 8, dark })
      .then(d => { if (alive) { setSrc(d); setErr(false); } })
      .catch(() => { if (alive) setErr(true); });
    return () => { alive = false; };
  }, [url, dark]);

  if (err) return <div style={{ width: size, height: size, display: "grid", placeItems: "center", fontSize: 10, color: "#8FA8BB", border: "1px dashed #DDE8EF", borderRadius: 8 }}>QR no disponible</div>;
  if (!src) return <div style={{ width: size, height: size, background: "#EDF1F7", borderRadius: 8 }} />;
  return <img src={src} width={size} height={size} alt={alt} style={{ display: "block", borderRadius: 6 }} />;
}

/* Tarjeta completa de recurso con su QR — la pieza que hace que
   el material impreso sea también material digital. */
export function ResourceCard({ resource, C, lang = "es", compact = false }) {
  const url = resourceUrl(resource, lang);
  const meta = resourceMeta(resource.tipo);

  return (
    <div style={{
      display: "flex", gap: 14, alignItems: "flex-start",
      background: C.bg, borderRadius: 14, padding: compact ? 12 : 15,
      border: `1px solid ${C.border}`, breakInside: "avoid",
    }}>
      <div style={{ flexShrink: 0, background: "#fff", padding: 6, borderRadius: 10, border: `1px solid ${C.border}` }}>
        <QRCodeImg url={url} size={compact ? 68 : 84} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 5, flexWrap: "wrap" }}>
          <span style={chip(C, C.violet)}>{meta.label}</span>
          {resource.duracion && <span style={{ fontSize: 10, color: C.text3, fontWeight: 700 }}>{resource.duracion}</span>}
        </div>
        <div style={{ fontWeight: 800, fontSize: 13.5, color: C.text, marginBottom: 4, lineHeight: 1.3 }}>
          {resource.titulo}
        </div>
        {(resource.que_hacer || resource.para_que) && (
          <div style={{ fontSize: 12, color: C.text2, lineHeight: 1.5, marginBottom: 6 }}>
            {resource.que_hacer || resource.para_que}
          </div>
        )}
        <div style={{ fontSize: 10.5, color: C.text3, wordBreak: "break-all", lineHeight: 1.4 }}>
          <b style={{ color: C.text2 }}>{resource.sitio}</b>
          {resource.busqueda && <> · buscar: «{resource.busqueda}»</>}
        </div>
      </div>
    </div>
  );
}

/* Bloque de encabezado con QR del documento completo, para la portada */
export function DocumentQR({ url, C, code, caption }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
      <div style={{ background: "#fff", padding: 7, borderRadius: 12, border: `1px solid ${C.border}`, flexShrink: 0 }}>
        <QRCodeImg url={url} size={78} />
      </div>
      <div>
        {code && <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: "0.1em", color: C.heading, lineHeight: 1 }}>{code}</div>}
        <div style={{ fontSize: 11, color: C.text3, marginTop: 5, maxWidth: 180, lineHeight: 1.4 }}>{caption}</div>
      </div>
    </div>
  );
}
