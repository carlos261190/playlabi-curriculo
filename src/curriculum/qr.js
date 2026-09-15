/* ============================================================
   PLAYLABI CURRÍCULO — CÓDIGOS QR REALES
   Genera QR escaneables (no decorativos) con la librería qrcode.

   Decisión de diseño: la IA nunca inventa URLs completas —
   entrega plataforma + término de búsqueda. Aquí se convierte
   ese par en una URL de búsqueda REAL de la plataforma, de modo
   que el QR impreso siempre lleve a algo que existe.
   ============================================================ */
import QRCode from "qrcode";

/* Plataformas conocidas → constructor de URL de búsqueda.
   La clave se compara en minúsculas y sin acentos contra el campo "sitio". */
const PLATFORMS = [
  { match: ["youtube", "you tube"], build: (q) => `https://www.youtube.com/results?search_query=${q}` },
  { match: ["phet"], build: (q, l) => `https://phet.colorado.edu/${l === "en" ? "en" : "es"}/simulations/filter?q=${q}` },
  { match: ["wikipedia"], build: (q, l) => `https://${l}.wikipedia.org/w/index.php?search=${q}` },
  { match: ["khan academy", "khanacademy", "khan"], build: (q, l) => `https://${l === "es" ? "es." : ""}khanacademy.org/search?page_search_query=${q}` },
  { match: ["geogebra"], build: (q) => `https://www.geogebra.org/search/${q}` },
  { match: ["google arts", "arts & culture", "arts and culture", "google arts & culture"], build: (q) => `https://artsandculture.google.com/search?q=${q}` },
  { match: ["google maps", "maps"], build: (q) => `https://www.google.com/maps/search/${q}` },
  { match: ["google scholar", "scholar"], build: (q) => `https://scholar.google.com/scholar?q=${q}` },
  { match: ["nasa"], build: (q) => `https://www.nasa.gov/search/?q=${q}` },
  { match: ["national geographic", "natgeo"], build: (q) => `https://www.nationalgeographic.com/search?q=${q}` },
  { match: ["bbc"], build: (q) => `https://www.bbc.co.uk/search?q=${q}` },
  { match: ["ted", "ted-ed", "ted ed"], build: (q) => `https://www.ted.com/search?q=${q}` },
  { match: ["scratch"], build: (q) => `https://scratch.mit.edu/search/projects?q=${q}` },
  { match: ["spotify"], build: (q) => `https://open.spotify.com/search/${q}` },
  { match: ["internet archive", "archive.org", "archive"], build: (q) => `https://archive.org/search?query=${q}` },
  { match: ["openstax"], build: (q) => `https://openstax.org/search?q=${q}` },
  { match: ["datos", "dataset", "data", "our world in data", "ourworldindata"], build: (q) => `https://ourworldindata.org/search?q=${q}` },
  { match: ["unesco"], build: (q) => `https://www.unesco.org/en/search?text=${q}` },
  { match: ["onu", "un.org", "naciones unidas", "united nations"], build: (q) => `https://www.un.org/es/search?keys=${q}` },
  { match: ["educaplay"], build: (q) => `https://es.educaplay.com/recursos-educativos/?q=${q}` },
  { match: ["genially"], build: (q) => `https://view.genial.ly/search?q=${q}` },
  { match: ["prado", "museo del prado"], build: (q) => `https://www.museodelprado.es/busqueda?search=${q}` },
  { match: ["louvre"], build: (q) => `https://collections.louvre.fr/en/recherche?q=${q}` },
  { match: ["biodiversidad", "gbif"], build: (q) => `https://www.gbif.org/search?q=${q}` },
];

const deaccent = (s) =>
  (s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

/* Construye una URL real y funcional a partir del recurso descrito por la IA.
   Si la plataforma no se reconoce, cae en una búsqueda de Google acotada
   al sitio indicado — sigue siendo una URL que funciona. */
export function resourceUrl(resource, lang = "es") {
  if (!resource) return "";

  // Si la IA sí entregó una URL completa y válida, se respeta.
  const raw = resource.url || "";
  if (/^https?:\/\/\S+\.\S+/i.test(raw)) return raw.trim();

  const site = deaccent(resource.sitio || "");
  const query = encodeURIComponent((resource.busqueda || resource.titulo || "").trim());
  if (!query) return "";

  const uiLang = ["es", "pt", "en", "fr"].includes(lang) ? lang : "es";

  for (const p of PLATFORMS) {
    if (p.match.some((m) => site.includes(m))) return p.build(query, uiLang);
  }

  // Plataforma no catalogada: búsqueda de Google restringida a ese sitio si parece un dominio.
  if (/\.[a-z]{2,}$/i.test(site.replace(/\s/g, ""))) {
    return `https://www.google.com/search?q=${query}+site%3A${encodeURIComponent(site.replace(/\s/g, ""))}`;
  }
  const siteHint = resource.sitio ? `+${encodeURIComponent(resource.sitio)}` : "";
  return `https://www.google.com/search?q=${query}${siteHint}`;
}

/* SVG del QR como string. Se usa tanto en pantalla como en impresión:
   al ser vectorial, imprime nítido a cualquier tamaño. */
export async function qrSvg(text, opts = {}) {
  if (!text) return "";
  return QRCode.toString(text, {
    type: "svg",
    errorCorrectionLevel: opts.ecc || "M",
    margin: opts.margin ?? 1,
    color: { dark: opts.dark || "#002739", light: opts.light || "#FFFFFF" },
    width: opts.width || 160,
  });
}

/* PNG en data URL — necesario para exportar a PDF y para <img> */
export async function qrDataUrl(text, opts = {}) {
  if (!text) return "";
  return QRCode.toDataURL(text, {
    errorCorrectionLevel: opts.ecc || "M",
    margin: opts.margin ?? 1,
    scale: opts.scale || 6,
    color: { dark: opts.dark || "#002739", light: opts.light || "#FFFFFF" },
  });
}

/* Etiqueta legible del tipo de recurso */
export const RESOURCE_META = {
  video: { label: "Video" },
  "simulación": { label: "Simulación" },
  simulacion: { label: "Simulación" },
  simulation: { label: "Simulación" },
  "artículo": { label: "Artículo" },
  articulo: { label: "Artículo" },
  dataset: { label: "Datos" },
  "museo virtual": { label: "Museo virtual" },
  podcast: { label: "Podcast" },
  audio: { label: "Audio" },
  juego: { label: "Juego" },
  "actividad interactiva": { label: "Interactivo" },
};

export const resourceMeta = (t) =>
  RESOURCE_META[deaccent(t || "")] || RESOURCE_META[(t || "").toLowerCase()] || { label: t || "Recurso" };
