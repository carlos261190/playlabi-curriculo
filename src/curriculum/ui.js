/* ============================================================
   PLAYLABI CURRÍCULO — CAPA VISUAL COMPARTIDA
   Refleja la marca de PlaylabiGenius para que el módulo se vea
   nativo dentro de la app.
   ============================================================ */
import { BRAND, brandGradient } from "./brand.js";

/* Los colores de marca vienen del Manual v1.0 y no se tocan aquí.
   Los tonos de interfaz (fondos, bordes, grises) sí son propios del
   módulo: el manual no los define. */
export const PAL_LIGHT = {
  magenta: BRAND.magenta, orange1: BRAND.orange1, orange2: BRAND.orange2, orange3: BRAND.orange3,
  blue: BRAND.blue1, heading: BRAND.blue1, blueLight: BRAND.blue2,
  surface: BRAND.white2, bg: "#EDF1F7", text: "#0D1F2D", text2: "#4A6172", text3: "#8FA8BB",
  border: "#DDE8EF",
  grad: brandGradient(),
  gradDark: `linear-gradient(135deg, ${BRAND.blue1} 0%, #0D4060 100%)`,
  green: "#1FA89B", violet: "#7B5CFF",
};

/* En oscuro se aclaran los tonos de marca lo justo para mantener el
   contraste AA sobre fondo #101B26, conservando el matiz original. */
export const PAL_DARK = {
  magenta: "#FF6B93", orange1: "#FF7A6B", orange2: "#FF9B72", orange3: "#FFC06A",
  blue: "#0D3348", heading: "#C2DFF0", blueLight: BRAND.blue2,
  surface: "#1C2B3A", bg: "#101B26", text: "#D8EAF4", text2: "#7AAAC4", text3: "#4D7390",
  border: "#1E3348",
  grad: "linear-gradient(135deg,#FF6B93 0%,#FF7A6B 33%,#FF9B72 66%,#FFC06A 100%)",
  gradDark: "linear-gradient(135deg,#0D1F2D 0%,#1C2B3A 100%)",
  green: "#2FC7B8", violet: "#9B82FF",
};

export const pal = (dark) => (dark ? PAL_DARK : PAL_LIGHT);

/* ── Primitivas de estilo reutilizadas en todo el módulo ── */

export const card = (C, extra = {}) => ({
  background: C.surface,
  borderRadius: 18,
  border: `1px solid ${C.border}`,
  padding: 22,
  ...extra,
});

export const label = (C) => ({
  fontSize: 11,
  fontWeight: 800,
  textTransform: "uppercase",
  letterSpacing: "0.07em",
  color: C.text3,
  display: "block",
  marginBottom: 10,
});

export const input = (C) => ({
  width: "100%",
  borderRadius: 12,
  padding: "12px 14px",
  fontSize: 14,
  border: `1.5px solid ${C.border}`,
  background: C.bg,
  color: C.text,
  fontFamily: "inherit",
  outline: "none",
  boxSizing: "border-box",
});

export const btnPrimary = (C, extra = {}) => ({
  background: C.grad,
  color: "#fff",
  border: "none",
  padding: "13px 28px",
  borderRadius: 13,
  fontWeight: 800,
  fontSize: 14,
  cursor: "pointer",
  fontFamily: "inherit",
  ...extra,
});

export const btnGhost = (C, extra = {}) => ({
  background: C.surface,
  color: C.heading,
  border: `1.5px solid ${C.border}`,
  padding: "10px 18px",
  borderRadius: 11,
  fontWeight: 700,
  fontSize: 13,
  cursor: "pointer",
  fontFamily: "inherit",
  // Los botones combinan icono de trazo y texto: han de alinearse en línea.
  display: "inline-flex",
  alignItems: "center",
  gap: 7,
  ...extra,
});

export const chip = (C, color, extra = {}) => ({
  background: (color || C.blue) + "1A",
  color: color || C.blue,
  padding: "3px 11px",
  borderRadius: 20,
  fontSize: 11,
  fontWeight: 800,
  display: "inline-block",
  ...extra,
});

export const sectionTitle = (C, extra = {}) => ({
  fontSize: 12,
  fontWeight: 900,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: C.magenta,
  marginBottom: 12,
  ...extra,
});

/* Colores por nivel cognitivo, coherentes con el resto de la app */
export const BLOOM_COLOR = {
  recordar: BRAND.orange1, comprender: BRAND.orange2, aplicar: BRAND.orange3,
  analizar: "#0EA5C9", evaluar: "#7B5CFF", crear: BRAND.magenta,
};

/* Descarga de un texto como archivo — usado para exportar HTML/Markdown */
export function download(filename, content, mime = "text/html;charset=utf-8") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export const slug = (s) =>
  (s || "documento").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);
