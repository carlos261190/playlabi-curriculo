/* ============================================================
   PLAYLABI CURRÍCULO — NÚCLEO COMPARTIDO
   Tipos, helpers y bloques reutilizables del catálogo curricular.
   ============================================================ */

/* Una ETAPA tiene:
   id        identificador estable
   name      nombre oficial en el país
   ages      rango de edad orientativo
   grades[]  cursos/grados/años con su nombre oficial
   subjects[] asignaturas / áreas / campos formativos
   subjectWord  cómo llama el país a esas asignaturas
   note      matiz normativo relevante para el docente
*/

export function stage(id, name, ages, grades, subjects, subjectWord, note) {
  return { id, name, ages, grades, subjects, subjectWord: subjectWord || "Asignatura", note: note || "" };
}

/* Educación superior: estructura común, se adapta con el nombre del país */
export function uni(opts = {}) {
  return stage(
    "superior",
    opts.name || "Educación Superior / Universidad",
    opts.ages || "17+",
    opts.grades || ["1er año / 1er semestre", "2º año", "3er año", "4º año", "5º año", "Posgrado · Especialización", "Posgrado · Maestría", "Posgrado · Doctorado"],
    opts.subjects || [
      "Ciencias de la Salud", "Ingeniería y Tecnología", "Ciencias Sociales",
      "Ciencias Exactas y Naturales", "Humanidades y Artes", "Ciencias Económicas y Administración",
      "Derecho y Ciencias Jurídicas", "Educación y Pedagogía", "Ciencias Agrarias y Ambientales",
      "Comunicación y Diseño",
    ],
    opts.subjectWord || "Área de conocimiento",
    opts.note || "Planificación por resultados de aprendizaje y créditos académicos; el sílabo/programa de asignatura sustituye al plan de clase."
  );
}

/* Formación técnico-profesional: bloque reutilizable */
export function tecnica(name, ages, grades, note) {
  return stage(
    "tecnica",
    name,
    ages,
    grades,
    [
      "Administración y Gestión", "Informática y Comunicaciones", "Electricidad y Electrónica",
      "Mecánica e Industria", "Construcción y Obra Civil", "Hostelería y Turismo",
      "Sanidad y Cuidados", "Agropecuaria y Agroindustria", "Comercio y Marketing",
      "Servicios Socioculturales", "Artes Gráficas y Diseño", "Energía y Medio Ambiente",
    ],
    "Familia profesional",
    note || "Planificación por módulos formativos, resultados de aprendizaje y prácticas en entorno laboral."
  );
}

/* Etiquetas de documento por defecto (idioma español) */
export const DOC_WORDS_ES = {
  plan: "Plan de Clase",
  seq: "Secuencia Didáctica",
  book: "Libro de Texto",
  objective: "Objetivo de aprendizaje",
  standard: "Aprendizaje esperado",
  assessmentWord: "Evaluación",
};

export const DOC_WORDS_PT = {
  plan: "Plano de Aula",
  seq: "Sequência Didática",
  book: "Livro Didático",
  objective: "Objetivo de aprendizagem",
  standard: "Habilidade",
  assessmentWord: "Avaliação",
};

export const DOC_WORDS_EN = {
  plan: "Lesson Plan",
  seq: "Unit / Learning Sequence",
  book: "Textbook",
  objective: "Learning objective",
  standard: "Standard",
  assessmentWord: "Assessment",
};

export const DOC_WORDS_FR = {
  plan: "Plan de Leçon",
  seq: "Séquence Didactique",
  book: "Manuel Scolaire",
  objective: "Objectif d'apprentissage",
  standard: "Compétence",
  assessmentWord: "Évaluation",
};

/* Los 17 Objetivos de Desarrollo Sostenible — eje transversal universal.
   Se ofrecen en todos los países como capa de integración global. */
export const ODS = [
  "1 · Fin de la pobreza", "2 · Hambre cero", "3 · Salud y bienestar",
  "4 · Educación de calidad", "5 · Igualdad de género", "6 · Agua limpia y saneamiento",
  "7 · Energía asequible y no contaminante", "8 · Trabajo decente y crecimiento económico",
  "9 · Industria, innovación e infraestructura", "10 · Reducción de las desigualdades",
  "11 · Ciudades y comunidades sostenibles", "12 · Producción y consumo responsables",
  "13 · Acción por el clima", "14 · Vida submarina", "15 · Vida de ecosistemas terrestres",
  "16 · Paz, justicia e instituciones sólidas", "17 · Alianzas para lograr los objetivos",
];

/* Metodologías activas disponibles para el diseño del plan.
   effect = tamaño de efecto en la síntesis de Hattie (Visible Learning).
   Se usa para ordenar y justificar la recomendación pedagógica. */
export const METODOLOGIAS = [
  { id: "abp_proyectos", label: "Aprendizaje Basado en Proyectos (ABP)", effect: 0.44, best: "Integración de áreas, producto final, trabajo prolongado" },
  { id: "abp_problemas", label: "Aprendizaje Basado en Problemas", effect: 0.26, best: "Desarrollo del razonamiento en cursos superiores" },
  { id: "indagacion", label: "Aprendizaje por Indagación", effect: 0.46, best: "Ciencias naturales y método científico" },
  { id: "aula_invertida", label: "Aula Invertida (Flipped Classroom)", effect: 0.55, best: "Cuando hay acceso a dispositivos fuera del aula" },
  { id: "cooperativo", label: "Aprendizaje Cooperativo", effect: 0.59, best: "Habilidades sociales y contenidos que admiten roles" },
  { id: "ensenanza_reciproca", label: "Enseñanza Recíproca", effect: 0.74, best: "Comprensión lectora y trabajo con textos" },
  { id: "metacognicion", label: "Estrategias Metacognitivas", effect: 0.60, best: "Autorregulación del propio aprendizaje" },
  { id: "practica_distribuida", label: "Práctica Distribuida y Recuperación", effect: 0.71, best: "Retención a largo plazo, repaso espaciado" },
  { id: "feedback", label: "Retroalimentación Formativa", effect: 0.62, best: "Cualquier momento; el mayor retorno por minuto invertido" },
  { id: "gamificacion", label: "Gamificación y Juego Didáctico", effect: 0.35, best: "Motivación, repaso y consolidación de vocabulario" },
  { id: "aprendizaje_servicio", label: "Aprendizaje-Servicio (ApS)", effect: 0.42, best: "Vínculo con la comunidad y ciudadanía activa" },
  { id: "steam", label: "Enfoque STEAM", effect: 0.40, best: "Integración de ciencia, tecnología, arte y matemática" },
  { id: "estaciones", label: "Trabajo por Estaciones / Rincones", effect: 0.38, best: "Grupos numerosos y ritmos diversos" },
  { id: "modelado", label: "Modelado Explícito (I do, We do, You do)", effect: 0.57, best: "Procedimientos nuevos y contenidos complejos" },
  { id: "socratico", label: "Diálogo Socrático / Debate", effect: 0.82, best: "Pensamiento crítico y argumentación" },
];

/* Niveles taxonómicos — se ofrecen ambos marcos porque los países difieren */
export const BLOOM = ["recordar", "comprender", "aplicar", "analizar", "evaluar", "crear"];
export const DOK = ["DOK 1 · Recuerdo", "DOK 2 · Aplicación de conceptos", "DOK 3 · Razonamiento estratégico", "DOK 4 · Pensamiento extendido"];

/* Principios del Diseño Universal para el Aprendizaje (DUA / UDL 3.0) */
export const DUA = [
  { id: "engagement", label: "Múltiples formas de implicación", q: "¿Por qué van a querer aprender esto?" },
  { id: "representation", label: "Múltiples formas de representación", q: "¿De cuántas maneras se presenta la información?" },
  { id: "action", label: "Múltiples formas de acción y expresión", q: "¿De cuántas maneras pueden demostrar lo aprendido?" },
];
