/* ============================================================
   MARCOS CURRICULARES — CARIBE Y GUAYANAS
   R. Dominicana · Cuba · Puerto Rico · Haití · Jamaica ·
   Trinidad y Tobago · Bahamas · Barbados · Guyana · Surinam
   ============================================================ */
import { stage, uni, tecnica, DOC_WORDS_ES, DOC_WORDS_EN, DOC_WORDS_FR } from "./fw-core.js";

/* Los sistemas anglófonos del Caribe comparten el examen regional CXC.
   Este helper evita repetir la misma estructura diez veces. */
function cxcStages(opts = {}) {
  return [
    stage("early", "Early Childhood Education", "3–5 years", ["Nursery", "Kindergarten / Reception"],
      ["Language and Communication", "Numeracy and Reasoning", "Science and Discovery", "Social and Emotional Development", "Creative Expression", "Physical Development and Health"], "Learning area", ""),
    stage("primary", "Primary Education", "5–11 years",
      opts.primaryGrades || ["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6"],
      ["Language Arts", "Mathematics", "Science", "Social Studies", "Religious Education", "Visual and Performing Arts", "Physical Education", "Information and Communication Technology", "Health and Family Life Education", "Modern Languages"],
      "Subject", opts.primaryNote || ""),
    stage("secondary", "Secondary Education (Lower & Upper)", "11–17 years",
      opts.secondaryGrades || ["Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11"],
      ["English A", "English B (Literature)", "Mathematics", "Additional Mathematics", "Integrated Science", "Biology", "Chemistry", "Physics", "Social Studies", "History", "Geography", "Principles of Business", "Principles of Accounts", "Economics", "Information Technology", "Spanish", "French", "Visual Arts", "Music", "Physical Education and Sport", "Technical Drawing", "Agricultural Science", "Human and Social Biology", "Food, Nutrition and Health"],
      "Subject", "Culminates in CSEC — Caribbean Secondary Education Certificate (CXC)."),
    stage("sixth", "Sixth Form / CAPE", "17–19 years", ["Lower Sixth", "Upper Sixth"],
      ["Caribbean Studies", "Communication Studies", "Pure Mathematics", "Applied Mathematics", "Biology", "Chemistry", "Physics", "Economics", "Management of Business", "Accounting", "Sociology", "Law", "Literatures in English", "History", "Geography", "Information Technology", "Environmental Science", "Digital Media"],
      "CAPE Unit", "CAPE — Caribbean Advanced Proficiency Examination."),
    tecnica("Technical and Vocational Education and Training (TVET)", "14+ years",
      ["CVQ Level 1", "CVQ Level 2", "CVQ Level 3", "Technical Institute Diploma"],
      "Caribbean Vocational Qualification (CVQ) framework, coordinated by CANTA."),
    uni({ name: "Tertiary Education", ages: "17+", subjectWord: "Faculty", grades: ["Year 1", "Year 2", "Year 3", "Year 4", "Master's", "Doctoral"] }),
  ];
}

/* Marco compartido para los sistemas anglófonos del Caribe */
function cxcFw(o) {
  return {
    short: o.short,
    name: o.name,
    authority: o.authority,
    year: o.year,
    url: o.url,
    codeMask: "Attainment Target · Learning Outcome · Grade",
    codeHelp: "Curriculum organised by subject strands, attainment targets and grade-level learning outcomes",
    words: DOC_WORDS_EN,
    standardWord: "Attainment Target / Learning Outcome",
    unitWord: "Unit of Work",
    designUnit: o.designUnit || "Standards-based unit and lesson planning",
    designExplain: o.designExplain || "Caribbean systems plan from attainment targets and align assessment to the CXC regional examinations, with growing emphasis on project-based and STEM-integrated learning.",
    competencies: ["Critical thinking and problem solving", "Communication", "Collaboration and teamwork", "Creativity and innovation", "Digital literacy", "Self-management and resilience", "Citizenship and cultural identity"],
    competenciesWord: "Core competencies of the CARICOM Ideal Caribbean Person",
    transversal: ["Health and Family Life Education (HFLE)", "Environmental sustainability and climate resilience", "Disaster risk reduction", "Citizenship and civic responsibility", "Caribbean identity and heritage", "Gender equity", "Financial literacy", "Digital citizenship"],
    transversalWord: "Cross-curricular themes",
    assessment: o.assessment || "School-based assessment (SBA) plus regional CXC examinations (CSEC and CAPE); continuous formative assessment at primary level.",
    inclusion: "National inclusive education policy; individualised support plans and special education units.",
    planParts: ["Subject, grade and duration", "Attainment targets", "Learning outcomes", "Success criteria", "Prior knowledge check", "Engage · Explore · Explain · Elaborate · Evaluate", "Resources and ICT integration", "Assessment strategies", "Differentiation and inclusion"],
    notes: o.notes || "",
  };
}

export const CARIBE = [
  /* ── REPÚBLICA DOMINICANA ──────────────────────────────── */
  {
    code: "DO", name: "República Dominicana", flag: "🇩🇴", lang: "es", region: "caribe",
    fw: {
      short: "Diseño Curricular por Competencias",
      name: "Diseño Curricular Dominicano — enfoque por Competencias",
      authority: "MINERD · Ministerio de Educación de la República Dominicana",
      year: "Revisión y actualización curricular 2016 · Ordenanza 01-2016 · Bases de la Revisión Curricular",
      url: "https://www.ministeriodeeducacion.gob.do",
      codeMask: "Competencia Específica · Indicador de logro · Unidad de Aprendizaje",
      codeHelp: "Estructura: Competencias Fundamentales → Competencias Específicas por área → Indicadores de logro por grado",
      words: DOC_WORDS_ES,
      standardWord: "Indicador de logro",
      unitWord: "Unidad de Aprendizaje",
      designUnit: "Situación de aprendizaje en Unidad de Aprendizaje",
      designExplain: "El currículo dominicano exige que toda planificación parta de una situación de aprendizaje: un contexto real y significativo que obligue a movilizar competencias fundamentales y específicas de forma articulada.",
      competencies: [
        "Ética y Ciudadana", "Comunicativa", "Pensamiento Lógico, Creativo y Crítico",
        "Resolución de Problemas", "Científica y Tecnológica", "Ambiental y de la Salud",
        "Desarrollo Personal y Espiritual",
      ],
      competenciesWord: "Competencias Fundamentales",
      transversal: ["Educación para la ciudadanía y la convivencia", "Educación ambiental y desarrollo sostenible", "Educación en salud y afectivo-sexual", "Cultura de paz y derechos humanos", "Equidad de género", "Educación financiera", "Uso responsable de la tecnología"],
      transversalWord: "Ejes transversales",
      assessment: "Evaluación por competencias con indicadores de logro; escala de 0 a 100 con promoción desde 70. Estrategias: registro anecdótico, portafolio, diario reflexivo, rúbricas, debates y pruebas.",
      inclusion: "Ordenanza 04-2018 de Educación Inclusiva; adecuaciones curriculares y Centros de Recursos para la Atención a la Diversidad (CAD).",
      planParts: ["Situación de aprendizaje", "Competencias Fundamentales", "Competencias Específicas", "Contenidos (conceptuales, procedimentales, actitudinales)", "Indicadores de logro", "Estrategias de enseñanza y aprendizaje", "Actividades secuenciadas", "Recursos", "Evaluación (diagnóstica, formativa, sumativa)", "Ejes transversales"],
      notes: "Estrategias de enseñanza oficiales: aprendizaje basado en problemas, proyectos, estudio de casos, sociodrama, debate y aprendizaje por descubrimiento.",
    },
    stages: [
      stage("inicial", "Nivel Inicial", "0–6 años", ["Ciclo I · Maternal (0–3 años)", "Ciclo II · 3 años", "Ciclo II · 4 años", "Ciclo II · Preprimario 5 años"],
        ["Lengua Española", "Matemática", "Ciencias Sociales", "Ciencias de la Naturaleza", "Educación Artística", "Educación Física", "Formación Integral Humana y Religiosa"], "Área curricular", "El Grado Preprimario (5 años) es obligatorio."),
      stage("primario", "Nivel Primario", "6–12 años",
        ["1.º (Primer Ciclo)", "2.º (Primer Ciclo)", "3.º (Primer Ciclo)", "4.º (Segundo Ciclo)", "5.º (Segundo Ciclo)", "6.º (Segundo Ciclo)"],
        ["Lengua Española", "Matemática", "Ciencias Sociales", "Ciencias de la Naturaleza", "Lenguas Extranjeras (Inglés/Francés)", "Educación Artística", "Educación Física", "Formación Integral Humana y Religiosa"], "Área curricular", ""),
      stage("secundario", "Nivel Secundario", "12–18 años",
        ["1.º (Primer Ciclo)", "2.º (Primer Ciclo)", "3.º (Primer Ciclo)", "4.º (Segundo Ciclo)", "5.º (Segundo Ciclo)", "6.º (Segundo Ciclo)"],
        ["Lengua Española", "Matemática", "Ciencias Sociales", "Biología", "Física", "Química", "Lenguas Extranjeras (Inglés)", "Lenguas Extranjeras (Francés)", "Educación Artística", "Educación Física", "Formación Integral Humana y Religiosa", "Filosofía", "Sociología", "Talleres de la Modalidad"],
        "Área curricular", "Modalidades del Segundo Ciclo: Académica, Técnico-Profesional y en Artes."),
      tecnica("Modalidad Técnico-Profesional e INFOTEP", "14+ años", ["Técnico Básico", "Bachiller Técnico (4.º–6.º)", "Formación INFOTEP", "Tecnólogo"], ""),
      uni({ name: "Educación Superior", ages: "17+" }),
    ],
  },

  /* ── CUBA ──────────────────────────────────────────────── */
  {
    code: "CU", name: "Cuba", flag: "🇨🇺", lang: "es", region: "caribe",
    fw: {
      short: "III Perfeccionamiento",
      name: "Tercer Perfeccionamiento del Sistema Nacional de Educación",
      authority: "MINED · Ministerio de Educación de Cuba",
      year: "Implementación progresiva desde 2016 · planes de estudio y programas por asignatura",
      url: "https://www.mined.gob.cu",
      codeMask: "Objetivo formativo · Unidad · Grado",
      codeHelp: "Los programas se organizan por objetivos formativos generales, objetivos por grado y unidades del programa",
      words: DOC_WORDS_ES,
      standardWord: "Objetivo formativo",
      unitWord: "Unidad del programa",
      designUnit: "Plan de clase con objetivo formativo",
      designExplain: "La didáctica cubana estructura la clase por objetivo, contenido, método, medios, formas de organización y evaluación, con fuerte énfasis en el trabajo político-ideológico y la formación de valores.",
      competencies: ["Formación de valores y convicciones", "Independencia cognoscitiva", "Desarrollo del pensamiento lógico", "Cultura general integral", "Formación laboral y politécnica", "Educación estética", "Educación física y salud"],
      competenciesWord: "Dimensiones de la formación integral",
      transversal: ["Educación patriótica, militar e internacionalista", "Educación ambiental", "Educación para la salud y sexualidad", "Educación jurídica", "Educación económica", "Educación estética", "Educación laboral"],
      transversalWord: "Programas directores y ejes transversales",
      assessment: "Evaluación sistemática, parcial y final; escala de 0 a 100 con aprobación desde 60. Se integran evaluación sistemática oral y escrita y trabajos de control.",
      inclusion: "Sistema de Educación Especial con escuelas especializadas y estrategias de inclusión en la escuela general.",
      planParts: ["Objetivo de la clase", "Contenido", "Métodos y procedimientos", "Medios de enseñanza", "Formas de organización", "Sistema de tareas docentes", "Evaluación", "Trabajo con los valores"],
      notes: "",
    },
    stages: [
      stage("preescolar", "Educación Preescolar", "0–6 años", ["Círculo infantil (0–4 años)", "Quinto año de vida (5 años)", "Grado preescolar (6.º año de vida)"],
        ["Lengua Materna", "Nociones Elementales de Matemática", "Conocimiento del Mundo Natural", "Conocimiento del Mundo Social", "Educación Plástica", "Educación Musical", "Educación Física", "Juego"], "Área de desarrollo", ""),
      stage("primaria", "Educación Primaria", "6–11 años", ["1.er grado", "2.º grado", "3.er grado", "4.º grado", "5.º grado", "6.º grado"],
        ["Lengua Española", "Matemática", "El Mundo en que Vivimos", "Ciencias Naturales", "Historia de Cuba", "Geografía de Cuba", "Educación Cívica", "Educación Laboral", "Educación Plástica", "Educación Musical", "Educación Física", "Inglés", "Informática"], "Asignatura", "Ciclos: primero (1.º–4.º) y segundo (5.º–6.º)."),
      stage("secundaria", "Secundaria Básica", "12–14 años", ["7.º grado", "8.º grado", "9.º grado"],
        ["Español-Literatura", "Matemática", "Ciencias Naturales", "Biología", "Física", "Química", "Geografía", "Historia", "Educación Cívica", "Inglés", "Educación Física", "Educación Laboral", "Educación Artística", "Informática"], "Asignatura", ""),
      stage("preuniversitario", "Preuniversitario", "15–17 años", ["10.º grado", "11.º grado", "12.º grado"],
        ["Español-Literatura", "Matemática", "Física", "Química", "Biología", "Geografía", "Historia de Cuba", "Historia Contemporánea", "Inglés", "Educación Física", "Informática", "Preparación para la Defensa", "Cultura Política"], "Asignatura", "Da acceso a la educación superior mediante exámenes de ingreso."),
      tecnica("Educación Técnica y Profesional (ETP)", "15+ años", ["Obrero Calificado", "Técnico Medio", "Técnico Superior"], ""),
      uni({ name: "Educación Superior", ages: "17+" }),
    ],
  },

  /* ── PUERTO RICO ───────────────────────────────────────── */
  {
    code: "PR", name: "Puerto Rico", flag: "🇵🇷", lang: "es", region: "caribe",
    fw: {
      short: "Estándares DEPR",
      name: "Estándares de Contenido y Expectativas de Grado del Departamento de Educación de Puerto Rico",
      authority: "DEPR · Departamento de Educación de Puerto Rico",
      year: "Estándares por programa (2014–2022) · Cartas Circulares anuales",
      url: "https://www.de.pr.gov",
      codeMask: "M.5.N.1.1 · ES.4.LE.1",
      codeHelp: "Programa · grado · dominio · estándar · expectativa — el formato varía por materia",
      words: DOC_WORDS_ES,
      standardWord: "Expectativa de grado",
      unitWord: "Unidad / Mapa curricular",
      designUnit: "Plan de la unidad y plan diario alineado a estándares",
      designExplain: "Puerto Rico combina el modelo estadounidense de estándares y expectativas con el español como lengua de enseñanza; el mapa curricular del DEPR organiza las unidades por semestre y cada plan diario debe citar la expectativa.",
      competencies: ["Comunicación efectiva", "Pensamiento crítico", "Resolución de problemas", "Colaboración", "Creatividad e innovación", "Alfabetización tecnológica", "Ciudadanía responsable"],
      competenciesWord: "Perfil del estudiante graduado",
      transversal: ["Educación ambiental", "Educación para la paz y la convivencia", "Perspectiva de género y equidad", "Salud escolar y bienestar emocional", "Educación financiera", "Identidad puertorriqueña y cultura"],
      transversalWord: "Temas transversales del currículo",
      assessment: "Avalúo formativo continuo y evaluación sumativa; escala A–F. Pruebas META-PR (Medición y Evaluación para la Transformación Académica) como referencia externa.",
      inclusion: "Programa de Educación Especial bajo IDEA con PEI; acomodos razonables y Plan 504.",
      planParts: ["Materia, grado y unidad", "Estándares y expectativas", "Objetivos de aprendizaje", "Assessment / Avalúo", "Actividades de inicio, desarrollo y cierre", "Materiales y recursos", "Acomodos (PEI/504)", "Integración tecnológica", "Assignación"],
      notes: "La enseñanza es en español con inglés como segundo idioma obligatorio desde kindergarten.",
    },
    stages: [
      stage("preescolar", "Nivel Preescolar", "3–5 años", ["Pre-Kindergarten", "Kindergarten"],
        ["Español", "Inglés", "Matemáticas", "Ciencias", "Estudios Sociales", "Bellas Artes", "Educación Física", "Salud Escolar"], "Programa", ""),
      stage("elemental", "Nivel Elemental", "6–11 años", ["Primer grado", "Segundo grado", "Tercer grado", "Cuarto grado", "Quinto grado", "Sexto grado"],
        ["Español", "Inglés", "Matemáticas", "Ciencias", "Estudios Sociales", "Bellas Artes · Artes Visuales", "Bellas Artes · Música", "Bellas Artes · Teatro", "Bellas Artes · Baile", "Educación Física", "Salud Escolar", "Tecnología"], "Programa", ""),
      stage("intermedio", "Nivel Intermedio", "12–14 años", ["Séptimo grado", "Octavo grado", "Noveno grado"],
        ["Español", "Inglés", "Matemáticas", "Ciencias", "Estudios Sociales", "Historia de Puerto Rico", "Bellas Artes", "Educación Física", "Salud Escolar", "Tecnología", "Educación en Tecnología"], "Programa", ""),
      stage("superior", "Nivel Superior (Escuela Superior)", "15–17 años", ["Décimo grado", "Undécimo grado", "Duodécimo grado"],
        ["Español", "Inglés", "Matemáticas · Álgebra", "Matemáticas · Geometría", "Matemáticas · Precálculo", "Biología", "Química", "Física", "Ciencias Ambientales", "Historia de Estados Unidos", "Historia de Puerto Rico", "Ciencias Sociales", "Educación Cívica", "Bellas Artes", "Educación Física", "Salud Escolar", "Cursos de Ocupaciones"], "Programa", "Diploma de Escuela Superior; cursos AP disponibles."),
      tecnica("Educación Ocupacional y Técnica", "14+ años", ["Programa Ocupacional (Escuela Superior)", "Instituto Tecnológico", "Grado Asociado"], ""),
      uni({ name: "Educación Superior", ages: "17+", grades: ["Grado Asociado", "Bachillerato · 1.er año", "Bachillerato · 2.º año", "Bachillerato · 3.er año", "Bachillerato · 4.º año", "Maestría", "Doctorado"] }),
    ],
  },

  /* ── HAITÍ ─────────────────────────────────────────────── */
  {
    code: "HT", name: "Haití", flag: "🇭🇹", lang: "fr", region: "caribe",
    fw: {
      short: "Curriculum de l'École Fondamentale",
      name: "Curriculum de l'École Fondamentale + Nouveau Secondaire",
      authority: "MENFP · Ministère de l'Éducation Nationale et de la Formation Professionnelle",
      year: "Réforme Bernard (1979) · Nouveau Secondaire (2007–2016) · Plan Décennal d'Éducation et de Formation",
      url: "https://www.menfp.gouv.ht",
      codeMask: "Compétence · Objectif spécifique · Cycle",
      codeHelp: "Le curriculum est organisé par compétences, objectifs généraux et objectifs spécifiques par cycle",
      words: DOC_WORDS_FR,
      standardWord: "Objectif spécifique",
      unitWord: "Unité d'apprentissage",
      designUnit: "Planification par approche par compétences (APC)",
      designExplain: "Haïti applique l'approche par compétences avec une situation d'intégration en fin de séquence. Le bilinguisme créole–français structure toute la planification : la langue d'enseignement doit être déclarée explicitement.",
      competencies: ["Communiquer en créole et en français", "Raisonner logiquement et mathématiquement", "Comprendre son environnement naturel et social", "Agir en citoyen responsable", "S'exprimer artistiquement", "Utiliser les technologies", "Développer son autonomie"],
      competenciesWord: "Compétences du profil de sortie",
      transversal: ["Éducation à la citoyenneté", "Éducation à l'environnement", "Éducation à la santé", "Égalité de genre", "Réduction des risques et désastres", "Éducation à la paix", "Patrimoine et identité haïtienne"],
      transversalWord: "Thèmes transversaux",
      assessment: "Évaluation formative et sommative; notes sur 10; examens officiels de fin de 9e année fondamentale et baccalauréat (NS4).",
      inclusion: "Politique d'éducation inclusive du MENFP; adaptations pédagogiques.",
      planParts: ["Discipline, cycle et durée", "Compétence visée", "Objectifs spécifiques", "Langue d'enseignement (créole/français)", "Prérequis", "Déroulement: mise en situation, développement, intégration", "Matériel didactique", "Évaluation", "Situation d'intégration"],
      notes: "Le créole haïtien est la langue maternelle de la quasi-totalité des élèves; le français est introduit progressivement.",
    },
    stages: [
      stage("prescolaire", "Éducation Préscolaire", "3–5 ans", ["Petite section", "Moyenne section", "Grande section"],
        ["Langage et communication", "Éveil mathématique", "Découverte du monde", "Expression artistique", "Éducation physique", "Développement socio-affectif"], "Domaine", ""),
      stage("fondamental1", "École Fondamentale · 1er et 2e cycles", "6–11 ans",
        ["1re année", "2e année", "3e année", "4e année", "5e année", "6e année"],
        ["Créole", "Français", "Mathématiques", "Sciences Expérimentales", "Sciences Sociales", "Éducation Civique", "Éducation Artistique", "Éducation Physique et Sportive", "Éducation à la Technologie"], "Discipline", ""),
      stage("fondamental3", "École Fondamentale · 3e cycle", "12–14 ans", ["7e année", "8e année", "9e année"],
        ["Créole", "Français", "Anglais", "Espagnol", "Mathématiques", "Sciences Physiques", "Sciences de la Vie et de la Terre", "Histoire", "Géographie", "Éducation Civique", "Éducation Artistique", "Éducation Physique et Sportive", "Informatique"], "Discipline", "Se termine par l'examen officiel de 9e année fondamentale."),
      stage("secondaire", "Nouveau Secondaire", "15–18 ans", ["NS1 (Seconde)", "NS2 (Rhéto)", "NS3 (Philo)", "NS4"],
        ["Créole", "Français", "Anglais", "Espagnol", "Mathématiques", "Physique", "Chimie", "Sciences de la Vie et de la Terre", "Histoire", "Géographie", "Philosophie", "Économie", "Éducation Civique", "Informatique", "Arts"], "Discipline", "Se termine par le Baccalauréat."),
      tecnica("Formation Professionnelle (INFP)", "14+ ans", ["Certificat de Qualification Professionnelle", "Certificat d'Aptitude Professionnelle (CAP)", "Diplôme de Technicien"], ""),
      uni({ name: "Enseignement Supérieur", ages: "18+", subjectWord: "Faculté" }),
    ],
  },

  /* ── JAMAICA ───────────────────────────────────────────── */
  {
    code: "JM", name: "Jamaica", flag: "🇯🇲", lang: "en", region: "caribe",
    fw: cxcFw({
      short: "NSC",
      name: "National Standards Curriculum (NSC)",
      authority: "MOEYI · Ministry of Education, Youth and Information",
      year: "NSC rolled out from 2016 for Grades 1–9",
      url: "https://www.moey.gov.jm",
      designUnit: "Project-based unit aligned to the NSC",
      designExplain: "Jamaica's National Standards Curriculum is explicitly built on project-based learning and STEM/STEAM integration: each unit is framed by a focus question and culminates in a product, not a test.",
      notes: "Grades 1–9 follow the NSC; Grades 10–11 prepare for CSEC and Grades 12–13 for CAPE. Primary Exit Profile (PEP) replaces GSAT at the end of Grade 6.",
    }),
    stages: cxcStages({
      primaryGrades: ["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6"],
      primaryNote: "Ends with the Primary Exit Profile (PEP): Ability Test, Performance Task and Curriculum-Based Test.",
      secondaryGrades: ["Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11"],
    }),
  },

  /* ── TRINIDAD Y TOBAGO ─────────────────────────────────── */
  {
    code: "TT", name: "Trinidad y Tobago", flag: "🇹🇹", lang: "en", region: "caribe",
    fw: cxcFw({
      short: "National Curriculum",
      name: "National Primary and Secondary School Curriculum",
      authority: "MOE · Ministry of Education of Trinidad and Tobago",
      year: "Primary Curriculum 2013 · Secondary Curriculum (SEMP) · Draft revisions ongoing",
      url: "https://www.moe.gov.tt",
      designExplain: "Trinidad and Tobago's curriculum is standards-based and organised around essential learning outcomes, with a strong emphasis on continuous assessment and the Secondary Entrance Assessment (SEA) at the end of primary.",
      notes: "The Secondary Entrance Assessment (SEA) at the end of Standard 5 determines secondary school placement.",
    }),
    stages: cxcStages({
      primaryGrades: ["Infant Year 1", "Infant Year 2", "Standard 1", "Standard 2", "Standard 3", "Standard 4", "Standard 5"],
      primaryNote: "Ends with the Secondary Entrance Assessment (SEA).",
      secondaryGrades: ["Form 1", "Form 2", "Form 3", "Form 4", "Form 5"],
    }),
  },

  /* ── BAHAMAS ───────────────────────────────────────────── */
  {
    code: "BS", name: "Bahamas", flag: "🇧🇸", lang: "en", region: "caribe",
    fw: cxcFw({
      short: "National Curriculum Standards",
      name: "Bahamas National Curriculum Standards",
      authority: "Ministry of Education and Technical and Vocational Training",
      year: "National Curriculum Guidelines · BJC and BGCSE frameworks",
      url: "https://www.bahamas.gov.bs",
      assessment: "Continuous assessment plus national examinations: Grade Level Assessment Tests (GLAT), Bahamas Junior Certificate (BJC) and Bahamas General Certificate of Secondary Education (BGCSE).",
      notes: "The Bahamas uses its own national examinations (BJC/BGCSE) rather than CXC.",
    }),
    stages: cxcStages({
      primaryGrades: ["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6"],
      secondaryGrades: ["Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12"],
    }),
  },

  /* ── BARBADOS ──────────────────────────────────────────── */
  {
    code: "BB", name: "Barbados", flag: "🇧🇧", lang: "en", region: "caribe",
    fw: cxcFw({
      short: "Barbados National Curriculum",
      name: "Barbados National Curriculum",
      authority: "Ministry of Educational Transformation",
      year: "National curriculum by subject · Education Reform Unit revisions",
      url: "https://www.mes.gov.bb",
      notes: "The Barbados Secondary Schools' Entrance Examination (BSSEE, 'Common Entrance') marks the transition to secondary.",
    }),
    stages: cxcStages({
      primaryGrades: ["Class 1", "Class 2", "Class 3", "Class 4", "Infants A", "Infants B"],
      secondaryGrades: ["First Form", "Second Form", "Third Form", "Fourth Form", "Fifth Form"],
    }),
  },

  /* ── GUYANA ────────────────────────────────────────────── */
  {
    code: "GY", name: "Guyana", flag: "🇬🇾", lang: "en", region: "sur",
    fw: cxcFw({
      short: "National Curriculum Guides",
      name: "Guyana National Curriculum Guides",
      authority: "Ministry of Education of Guyana · NCERD",
      year: "National Curriculum Guides by subject and grade · Education Sector Plan",
      url: "https://education.gov.gy",
      assessment: "Continuous assessment, National Grade Six Assessment (NGSA) and CSEC/CAPE examinations.",
      notes: "The National Grade Six Assessment (NGSA) determines secondary school placement.",
    }),
    stages: cxcStages({
      primaryGrades: ["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6"],
      primaryNote: "Ends with the National Grade Six Assessment (NGSA).",
      secondaryGrades: ["Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11"],
    }),
  },

  /* ── SURINAM ───────────────────────────────────────────── */
  {
    code: "SR", name: "Surinam", flag: "🇸🇷", lang: "nl", region: "sur",
    fw: {
      short: "Nationaal Curriculum",
      name: "Currículo Nacional de Surinam (sistema de raíz neerlandesa)",
      authority: "MinOWC · Ministerie van Onderwijs, Wetenschap en Cultuur",
      year: "Reforma curricular con apoyo del BID · programas por asignatura",
      url: "https://onderwijs.sr",
      codeMask: "Leerdoel · Vak · Leerjaar",
      codeHelp: "Objetivos de aprendizaje (leerdoelen) por asignatura y año escolar, según el modelo neerlandés",
      words: DOC_WORDS_ES,
      standardWord: "Objetivo de aprendizaje (leerdoel)",
      unitWord: "Unidad temática",
      designUnit: "Planificación por objetivos de aprendizaje",
      designExplain: "Surinam sigue la estructura educativa neerlandesa (GLO, VOJ, VOS) con neerlandés como lengua de instrucción, en un contexto multilingüe con sranantongo, hindustaní, javanés y lenguas indígenas.",
      competencies: ["Comunicación en neerlandés", "Razonamiento matemático", "Alfabetización científica", "Ciudadanía y convivencia intercultural", "Competencia digital", "Orientación vocacional"],
      competenciesWord: "Competencias del perfil de egreso",
      transversal: ["Educación ambiental y Amazonía", "Interculturalidad y multilingüismo", "Educación en salud", "Ciudadanía", "Igualdad de género"],
      transversalWord: "Temas transversales",
      assessment: "Evaluación continua y exámenes nacionales al final de GLO y VOJ; escala de 1 a 10 con aprobación desde 5,5.",
      inclusion: "Educación especial (buitengewoon onderwijs) y apoyos en la escuela regular.",
      planParts: ["Asignatura y año", "Objetivos de aprendizaje", "Contenidos", "Actividades", "Recursos", "Evaluación", "Lengua de instrucción"],
      notes: "El neerlandés es la lengua oficial de enseñanza; el sranantongo funciona como lengua franca.",
    },
    stages: [
      stage("kleuter", "Kleuteronderwijs (Preescolar)", "4–6 años", ["Kleuterschool 1", "Kleuterschool 2"],
        ["Taalontwikkeling (Lenguaje)", "Rekenen (Cálculo)", "Wereldoriëntatie (Orientación al mundo)", "Expressie (Expresión)", "Bewegingsonderwijs (Motricidad)"], "Área", ""),
      stage("glo", "Gewoon Lager Onderwijs (Primaria)", "6–12 años",
        ["Leerjaar 1", "Leerjaar 2", "Leerjaar 3", "Leerjaar 4", "Leerjaar 5", "Leerjaar 6"],
        ["Nederlands (Neerlandés)", "Rekenen/Wiskunde (Matemática)", "Natuuronderwijs (Ciencias Naturales)", "Aardrijkskunde (Geografía)", "Geschiedenis (Historia)", "Engels (Inglés)", "Lichamelijke Opvoeding (Educación Física)", "Handvaardigheid/Tekenen (Artes)", "Muziek (Música)"], "Vak (asignatura)", "Termina con el examen nacional de GLO."),
      stage("voj", "Voortgezet Onderwijs Junioren (Secundaria Básica)", "12–16 años",
        ["MULO 1", "MULO 2", "MULO 3", "MULO 4", "LBO 1", "LBO 2", "LBO 3", "LBO 4"],
        ["Nederlands", "Engels", "Spaans", "Wiskunde (Matemática)", "Natuurkunde (Física)", "Scheikunde (Química)", "Biologie", "Aardrijkskunde", "Geschiedenis", "Economie", "Lichamelijke Opvoeding", "Informatica"], "Vak (asignatura)", "Ramas MULO (general) y LBO (técnico-vocacional)."),
      stage("vos", "Voortgezet Onderwijs Senioren (Secundaria Superior)", "16–19 años",
        ["VWO 1", "VWO 2", "VWO 3", "HAVO 1", "HAVO 2", "HAVO 3"],
        ["Nederlands", "Engels", "Spaans", "Wiskunde A", "Wiskunde B", "Natuurkunde", "Scheikunde", "Biologie", "Economie", "Geschiedenis", "Aardrijkskunde", "Maatschappijleer (Educación Cívica)"], "Vak (asignatura)", "HAVO y VWO dan acceso a la educación superior."),
      tecnica("Beroepsonderwijs (Formación Técnica)", "14+ años", ["LBO", "LTS (Técnica)", "NATIN (Instituto Técnico Natural)", "IMEAO (Instituto de Economía y Administración)"], ""),
      uni({ name: "Hoger Onderwijs (Educación Superior)", ages: "18+", subjectWord: "Faculteit" }),
    ],
  },
];
