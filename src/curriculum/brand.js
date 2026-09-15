/* ============================================================
   PLAYLABI — IDENTIDAD DE MARCA
   Valores tomados literalmente del Manual de Marca v1.0 (©2023).
   No inventar ni aproximar: cualquier cambio debe venir del manual.

   Manual: ~/Downloads/Manual de marca.pdf
   · Paleta cromática ......... pág. 14
   · Paleta monocromática ..... pág. 16
   · Degradados permitidos .... pág. 18
   · Tipografía ............... pág. 20
   · Jerarquía tipográfica .... pág. 21
   ============================================================ */

/* ── Paleta cromática oficial (pág. 14) ── */
export const BRAND = {
  magenta:  "#ed466f",   // Playlabi Magenta   · CMYK 0,88,37,0   · RGB 237,70,111
  orange1:  "#ef5041",   // Playlabi Orange 1  · CMYK 0,84,78,0   · RGB 239,80,65
  orange2:  "#f37b4f",   // Playlabi Orange 2  · CMYK 0,64,74,0   · RGB 243,123,79
  orange3:  "#f9a54b",   // Playlabi Orange 3  · CMYK 0,41,80,0   · RGB 249,165,75
  blue1:    "#002739",   // Playlabi Blue 1    · CMYK 97,74,51,57 · RGB 0,39,57
  blue2:    "#82d3f1",   // Playlabi Blue 2    · CMYK 44,0,2,0    · RGB 130,211,241
  white1:   "#f7f7f7",   // Playlabi White 1   (pág. 16)
  white2:   "#ffffff",   // Playlabi White 2
  black:    "#000000",   // Playlabi Black
};

/* ── Degradado permitido (pág. 18) ──
   Es de CUATRO paradas, no de dos: magenta → orange1 → orange2 → orange3.
   Reducirlo a dos extremos altera el color del centro y deja de ser el
   degradado de marca. */
export const BRAND_GRADIENT_STOPS = [BRAND.magenta, BRAND.orange1, BRAND.orange2, BRAND.orange3];

export const brandGradient = (angulo = "135deg") =>
  `linear-gradient(${angulo}, ${BRAND.magenta} 0%, ${BRAND.orange1} 33%, ${BRAND.orange2} 66%, ${BRAND.orange3} 100%)`;

/* ── Tipografía (pág. 20) ──
   La familia oficial es Gilroy (Light, Regular, Medium, Bold, ExtraBold,
   Heavy). Gilroy es una fuente comercial: no está en Google Fonts y no
   se puede servir desde un CDN sin licencia. La pila la usa si está
   instalada en el sistema y, si no, cae en Outfit, que comparte la
   construcción geométrica y la 'a' de un solo piso.

   Para cumplimiento pleno: colocar los .woff2 de Gilroy en
   public/marca/fuentes/ y declararlos con @font-face. */
export const BRAND_FONT_STACK =
  "'Gilroy', 'Outfit', system-ui, -apple-system, 'Segoe UI', sans-serif";

/* Jerarquía tipográfica oficial (pág. 21).
   Gilroy: Light 300 · Regular 400 · Medium 500 · Bold 700 · ExtraBold 800 · Heavy 900 */
export const BRAND_WEIGHTS = {
  titulo:    800,  // Gilroy ExtraBold — títulos y headers
  subtitulo: 500,  // Gilroy Medium    — subtítulos
  contenido: 400,  // Gilroy Regular   — cuerpo de texto
  cta:       700,  // Gilroy Bold      — llamadas a la acción
  leyenda:   300,  // Gilroy Light     — leyendas y descriptivos
};

/* ── Logotipo ──
   Archivos oficiales copiados sin modificar desde el manual de marca.
   No recrear el logo en SVG: usar siempre estos archivos. */
export const BRAND_LOGO = {
  isotipo:     "/marca/playlabi-isotipo.png",       // Blue 1 + Blue 2 (uso principal)
  isotipoMono: "/marca/playlabi-isotipo-mono.png",  // monocromo Blue 1
};
