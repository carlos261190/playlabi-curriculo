import { BRAND_LOGO } from "./brand.js";

/* ============================================================
   PLAYLABI CURRÍCULO — ICONOGRAFÍA
   Iconos de trazo, no emojis. Los emojis en la interfaz delatan
   generación automática y restan credibilidad al documento ante
   una supervisión educativa.
   ============================================================ */

const base = (size, color) => ({
  width: size, height: size, viewBox: "0 0 24 24", fill: "none",
  stroke: color || "currentColor", strokeWidth: 1.8,
  strokeLinecap: "round", strokeLinejoin: "round",
  style: { flexShrink: 0, display: "block" },
  "aria-hidden": "true",
});

export const IconDoc = ({ size = 20, color }) => (
  <svg {...base(size, color)}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <path d="M14 2v6h6M8 13h8M8 17h5" />
  </svg>
);

export const IconBook = ({ size = 20, color }) => (
  <svg {...base(size, color)}>
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    <path d="M9 7h7" />
  </svg>
);

export const IconPrint = ({ size = 16, color }) => (
  <svg {...base(size, color)}>
    <path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
    <path d="M6 14h12v8H6z" />
  </svg>
);

export const IconDownload = ({ size = 16, color }) => (
  <svg {...base(size, color)}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
  </svg>
);

export const IconSun = ({ size = 12, color }) => (
  <svg {...base(size, color)} strokeWidth="2.2">
    <circle cx="12" cy="12" r="4.5" />
    <path d="M12 1.5v2M12 20.5v2M3.6 3.6l1.4 1.4M19 19l1.4 1.4M1.5 12h2M20.5 12h2M3.6 20.4L5 19M19 5l1.4-1.4" />
  </svg>
);

export const IconMoon = ({ size = 12, color }) => (
  <svg {...base(size, color)} strokeWidth="2.2">
    <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
  </svg>
);

export const IconSpark = ({ size = 15, color }) => (
  <svg {...base(size, color)}>
    <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8" />
  </svg>
);

export const IconSearch = ({ size = 16, color }) => (
  <svg {...base(size, color)}>
    <circle cx="11" cy="11" r="7" />
    <path d="M20 20l-3.5-3.5" />
  </svg>
);

export const IconAlert = ({ size = 16, color }) => (
  <svg {...base(size, color)}>
    <path d="M12 9v4M12 17h.01" />
    <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
  </svg>
);

export const IconCheck = ({ size = 15, color }) => (
  <svg {...base(size, color)} strokeWidth="2.4">
    <path d="M4 12.5l5.2 5.2L20 7" />
  </svg>
);

export const IconStudent = ({ size = 20, color }) => (
  <svg {...base(size, color)}>
    <path d="M22 9 12 4 2 9l10 5 10-5z" />
    <path d="M6 11.5V16c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5v-4.5" />
    <path d="M22 9v5" />
  </svg>
);

/* Marca del módulo — logotipo OFICIAL, archivo intacto del manual.
   No sustituir por un SVG recreado. */
export const LogoCurriculo = ({ size = 34, sobreFondoOscuro = false }) => {
  const img = (
    <img src={BRAND_LOGO.isotipo} width={size} height={size} alt="Playlabi"
      style={{ display: "block", flexShrink: 0, objectFit: "contain" }} />
  );
  // El isotipo es Blue 1 sobre transparente: sobre la cabecera azul marino
  // desaparecería. En vez de recolorearlo (alteraría el logo), se apoya en
  // una placa blanca, que es un uso admitido por el manual.
  if (!sobreFondoOscuro) return img;
  return (
    <span style={{
      display: "grid", placeItems: "center", flexShrink: 0,
      width: size + 12, height: size + 12, borderRadius: 11,
      background: "#fff",
    }}>
      {img}
    </span>
  );
};
