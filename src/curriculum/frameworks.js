/* ============================================================
   PLAYLABI CURRÍCULO — ÍNDICE DE MARCOS CURRICULARES
   Toda América + España y Portugal.
   ============================================================ */
import { IBERIA } from "./fw-iberia.js";
import { BRASIL_CONOSUR } from "./fw-brasil-conosur.js";
import { ANDINA } from "./fw-andina.js";
import { NORTE } from "./fw-norte.js";
import { CENTROAMERICA } from "./fw-centroamerica.js";
import { CARIBE } from "./fw-caribe.js";

export { ODS, METODOLOGIAS, BLOOM, DOK, DUA } from "./fw-core.js";

/* Orden de presentación: por región y luego alfabético dentro de cada región */
const REGION_ORDER = { norte: 0, centro: 1, caribe: 2, sur: 3, europa: 4 };

export const REGION_LABEL = {
  norte: "América del Norte",
  centro: "Centroamérica",
  caribe: "Caribe",
  sur: "América del Sur",
  europa: "Península Ibérica",
};

export const COUNTRIES = [...NORTE, ...CENTROAMERICA, ...CARIBE, ...BRASIL_CONOSUR, ...ANDINA, ...IBERIA]
  .sort((a, b) => {
    const r = (REGION_ORDER[a.region] ?? 9) - (REGION_ORDER[b.region] ?? 9);
    return r !== 0 ? r : a.name.localeCompare(b.name, "es");
  });

/* ── Búsquedas ──────────────────────────────────────────── */

export const getCountry = code => COUNTRIES.find(c => c.code === code) || null;

export const getStage = (code, stageId) => {
  const c = getCountry(code);
  return c ? c.stages.find(s => s.id === stageId) || null : null;
};

export function countriesByRegion() {
  const out = {};
  for (const c of COUNTRIES) (out[c.region] = out[c.region] || []).push(c);
  return out;
}

/* Texto compacto del marco normativo, listo para inyectar en el prompt de la IA.
   Se mantiene aquí (y no en el prompt) para que un cambio normativo se corrija
   en un solo lugar. */
export function frameworkBrief(code, stageId) {
  const c = getCountry(code);
  if (!c) return "";
  const s = stageId ? getStage(code, stageId) : null;
  const f = c.fw;
  const lines = [
    `PAÍS: ${c.name}`,
    `MARCO CURRICULAR OFICIAL: ${f.name} (${f.short})`,
    `AUTORIDAD: ${f.authority}`,
    `VIGENCIA: ${f.year}`,
    `CÓMO SE NOMBRA UN ESTÁNDAR: ${f.standardWord} — formato de código: ${f.codeMask} (${f.codeHelp})`,
    `UNIDAD DE DISEÑO: ${f.designUnit}. ${f.designExplain}`,
    `${f.competenciesWord.toUpperCase()}:\n- ${f.competencies.join("\n- ")}`,
    `${f.transversalWord.toUpperCase()}: ${f.transversal.join(" · ")}`,
    `EVALUACIÓN: ${f.assessment}`,
    `INCLUSIÓN: ${f.inclusion}`,
    `SECCIONES OBLIGATORIAS DEL DOCUMENTO: ${f.planParts.join(" · ")}`,
  ];
  if (f.notes) lines.push(`NOTA NORMATIVA: ${f.notes}`);
  if (s) {
    lines.push(`ETAPA: ${s.name} (${s.ages}) — el país llama a sus asignaturas «${s.subjectWord}».`);
    if (s.note) lines.push(`PARTICULARIDAD DE LA ETAPA: ${s.note}`);
  }
  return lines.join("\n");
}

/* Vocabulario del país para rotular la interfaz y los documentos */
export function words(code) {
  const c = getCountry(code);
  return c ? c.fw.words : { plan: "Plan de Clase", seq: "Secuencia Didáctica", book: "Libro de Texto", objective: "Objetivo de aprendizaje", standard: "Aprendizaje esperado", assessmentWord: "Evaluación" };
}

/* Idioma en que debe redactarse el material para ese país */
export const LANG_NAME = { es: "español", pt: "português do Brasil", en: "English", fr: "français", nl: "español (con terminología neerlandesa del sistema surinamés)" };

export function outputLanguage(code) {
  const c = getCountry(code);
  return LANG_NAME[c?.lang] || "español";
}

/* Estadísticas para la portada del módulo */
export const CATALOG_STATS = {
  countries: COUNTRIES.length,
  frameworks: new Set(COUNTRIES.map(c => c.fw.short)).size,
  stages: COUNTRIES.reduce((n, c) => n + c.stages.length, 0),
  grades: COUNTRIES.reduce((n, c) => n + c.stages.reduce((m, s) => m + s.grades.length, 0), 0),
  subjects: COUNTRIES.reduce((n, c) => n + c.stages.reduce((m, s) => m + s.subjects.length, 0), 0),
};
