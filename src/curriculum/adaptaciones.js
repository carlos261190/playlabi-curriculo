/* ============================================================
   PLAYLABI CURRÍCULO — PERFILES DE APRENDIZAJE
   Dos ejes distintos que no deben confundirse:

   1) NEURODIVERGENCIA — cómo procesa la información el estudiante.
      Cambia el CÓMO se presenta y se evalúa, no el QUÉ se aprende.

   2) DISTORSIÓN EDAD-GRADO (sobreedad) — el estudiante está en un
      grado por debajo del que le corresponde por edad. Cambia el
      REGISTRO y el CONTEXTO, no el nivel curricular pendiente.

   La confusión entre ambos es el error más común y más dañino:
   tratar a un adolescente con desfase escolar como si fuera un niño.
   ============================================================ */

export const PERFILES_NEURO = [
  {
    id: "tea",
    label: "Autismo (TEA)",
    corto: "Estructura predecible y lenguaje literal",
    implica: [
      "Anticipar la secuencia de la clase con una agenda visual al inicio",
      "Instrucciones literales: sin metáforas, ironía ni dobles sentidos",
      "Avisar las transiciones antes de que ocurran",
      "Ofrecer alternativa individual a toda actividad grupal obligatoria",
      "Controlar la carga sensorial: ruido, luz, olores, contacto físico",
      "Permitir intereses profundos como puerta de entrada al contenido",
    ],
  },
  {
    id: "tdah",
    label: "TDAH",
    corto: "Segmentos cortos, movimiento y retroalimentación inmediata",
    implica: [
      "Bloques de trabajo de 8 a 12 minutos con cambio de actividad",
      "Instrucciones de un solo paso a la vez, verbal y escrita",
      "Movimiento legítimo integrado: repartir material, escribir en la pizarra",
      "Apoyos externos de memoria de trabajo: guion visible, checklist",
      "Retroalimentación inmediata, no al final de la clase",
      "Reducir tareas administrativas (copiar enunciados largos)",
    ],
  },
  {
    id: "dislexia",
    label: "Dislexia",
    corto: "Menos carga de decodificación, misma exigencia conceptual",
    implica: [
      "Tipografía sans-serif, cuerpo grande, interlineado 1,5, texto no justificado",
      "Fragmentar el texto en bloques cortos con subtítulos",
      "Ofrecer siempre una vía alternativa al texto: audio, vídeo, esquema",
      "No pedir lectura en voz alta sin aviso previo",
      "Evaluar el contenido, no la ortografía, salvo que ese sea el objetivo",
      "Dar más tiempo de lectura, no más cantidad de texto",
    ],
  },
  {
    id: "discalculia",
    label: "Discalculia",
    corto: "Material manipulable y cálculo no cronometrado",
    implica: [
      "Partir siempre de lo concreto antes que del símbolo",
      "Recta numérica y representaciones visuales permanentes a la vista",
      "Permitir calculadora cuando el objetivo no es el cálculo en sí",
      "No cronometrar operaciones",
      "Descomponer los problemas en pasos explícitos y numerados",
    ],
  },
  {
    id: "disgrafia",
    label: "Disgrafía",
    corto: "Alternativas a la escritura manual",
    implica: [
      "Aceptar respuesta oral, grabada o tecleada",
      "Entregar plantillas y esquemas semicompletos en vez de copia",
      "No penalizar la caligrafía ni la presentación",
      "Reducir la cantidad de escritura, no la profundidad de la respuesta",
    ],
  },
  {
    id: "tel",
    label: "Trastorno del lenguaje (TEL)",
    corto: "Vocabulario preenseñado y frases cortas",
    implica: [
      "Preenseñar el vocabulario clave antes de la actividad",
      "Frases cortas, una idea por frase",
      "Apoyo visual permanente junto a la instrucción oral",
      "Dar tiempo de respuesta ampliado sin completar la frase por el estudiante",
    ],
  },
  {
    id: "intelectual",
    label: "Discapacidad intelectual",
    corto: "Objetivos priorizados y práctica distribuida",
    implica: [
      "Priorizar los aprendizajes funcionales e imprescindibles del tema",
      "Secuenciar en pasos pequeños con modelado explícito",
      "Repetición espaciada del mismo contenido en contextos distintos",
      "Evaluar con evidencias de ejecución, no con pruebas escritas extensas",
    ],
  },
  {
    id: "altas_capacidades",
    label: "Altas capacidades",
    corto: "Más profundidad, nunca más cantidad",
    implica: [
      "Enriquecer con preguntas abiertas y problemas sin solución única",
      "Permitir saltar la práctica ya dominada y pasar al reto",
      "Proyectos de investigación con producto real",
      "Evitar usarlo como ayudante permanente de sus compañeros",
    ],
  },
  {
    id: "ansiedad",
    label: "Ansiedad / regulación emocional",
    corto: "Previsibilidad y evaluación de bajo riesgo",
    implica: [
      "Anticipar qué se va a evaluar y cómo, sin sorpresas",
      "Ofrecer ensayo previo en contexto de bajo riesgo",
      "Permitir salida regulada del aula acordada de antemano",
      "Evitar exposición pública no elegida (lectura o salida a la pizarra por sorteo)",
    ],
  },
  {
    id: "sensorial",
    label: "Procesamiento sensorial",
    corto: "Control del entorno de estímulos",
    implica: [
      "Prever un espacio de menor estimulación dentro del aula",
      "Permitir auriculares o elementos de regulación",
      "Avisar antes de actividades ruidosas o con luces",
      "Cuidar texturas y olores en los materiales manipulativos",
    ],
  },
  {
    id: "vision_audicion",
    label: "Baja visión / hipoacusia",
    corto: "Accesibilidad sensorial del material",
    implica: [
      "Alto contraste, cuerpo de letra ampliable, descripción de toda imagen",
      "Subtítulos y transcripción en todo recurso audiovisual",
      "Ubicación preferente y campo visual despejado para lectura labial",
      "No depender del color como único portador de información",
    ],
  },
];

/* ── Distorsión edad-grado ──────────────────────────────────
   Llamada según el país: distorção idade-série (Brasil),
   sobreedad (Argentina, Uruguay), extraedad (Colombia),
   rezago escolar (México), atraso escolar (Portugal).       */

export const NOMBRE_SOBREEDAD = {
  BR: "Distorção idade-série", PT: "Atraso escolar",
  AR: "Sobreedad", UY: "Sobreedad", CL: "Sobreedad", PY: "Sobreedad",
  CO: "Extraedad", MX: "Rezago escolar / extraedad",
  US: "Overage / off-track student", CA: "Overage student",
  HT: "Surâge scolaire",
};

export const nombreSobreedad = (code) => NOMBRE_SOBREEDAD[code] || "Sobreedad / desfase edad-grado";

/* Principio rector: el nivel curricular se mantiene, el registro sube.
   Un estudiante de 15 años en 6.º grado necesita el contenido de 6.º
   presentado como se le habla a alguien de 15, no como se le habla a
   alguien de 11. Infantilizar es la causa principal de abandono. */
export const PRINCIPIOS_SOBREEDAD = [
  "Mantener intacta la exigencia curricular del grado; cambiar el registro, no el nivel",
  "Contextos propios de la edad real: trabajo, dinero, transporte, autonomía, redes sociales, proyecto de vida",
  "Alto interés y baja carga de decodificación: textos cortos y densos, no textos infantiles",
  "Reconocer y usar el saber adquirido fuera de la escuela como punto de partida",
  "Nada de personajes infantiles, diminutivos ni ilustraciones para primera infancia",
  "Evitar cualquier dinámica que exponga públicamente el desfase ante el grupo",
  "Acelerar lo que ya se domina por experiencia vital y detenerse solo en el vacío real",
  "Vincular explícitamente cada aprendizaje con la certificación y la trayectoria de salida",
];

export const brechaEdad = (real, esperada) => {
  const r = Number(real), e = Number(esperada);
  if (!r || !e || r <= e) return 0;
  return r - e;
};

/* ── Texto para el prompt ────────────────────────────────────
   Se construye aquí, no en el prompt, para que la lógica
   pedagógica viva en un único lugar auditable.              */
export function adaptacionesBrief(cfg, country) {
  const partes = [];

  const perfiles = (cfg.perfiles || [])
    .map(id => PERFILES_NEURO.find(p => p.id === id))
    .filter(Boolean);

  if (perfiles.length) {
    partes.push(
      `── PERFILES DE NEURODIVERGENCIA PRESENTES EN EL GRUPO ──`,
      `El documento debe estar diseñado desde el inicio para estos perfiles, no adaptado al final.`,
      ...perfiles.map(p =>
        `\n${p.label} — ${p.corto}\nImplicaciones obligatorias de diseño:\n- ${p.implica.join("\n- ")}`
      ),
      `\nREGLA: la neurodivergencia cambia CÓMO se presenta, se practica y se evalúa el contenido. NUNCA rebaja el objetivo de aprendizaje ni el nivel curricular. No escribas "adaptar según necesidad": escribe la adaptación concreta.`
    );
  }

  const brecha = cfg.sobreedad ? brechaEdad(cfg.edadReal, cfg.edadEsperada) : 0;
  if (brecha > 0) {
    partes.push(
      `\n── ${nombreSobreedad(cfg.country).toUpperCase()} ──`,
      `El grupo tiene ${brecha} año(s) de desfase: estudiantes de ${cfg.edadReal} años cursando un grado previsto para ${cfg.edadEsperada} años.`,
      `Principios obligatorios:`,
      `- ${PRINCIPIOS_SOBREEDAD.join("\n- ")}`,
      `\nREGLA CRÍTICA: mantén el contenido curricular del grado, pero escribe TODO —ejemplos, contextos, ilustraciones sugeridas, tono, actividades— para una persona de ${cfg.edadReal} años. Cualquier rastro de infantilización invalida el material. Si dudas entre dos ejemplos, elige el que un adolescente de ${cfg.edadReal} años no consideraría humillante leer delante de sus compañeros.`
    );
  }

  return partes.join("\n");
}

/* Resumen corto para mostrar en la interfaz y en el documento */
export function resumenPerfil(cfg) {
  const perfiles = (cfg.perfiles || [])
    .map(id => PERFILES_NEURO.find(p => p.id === id))
    .filter(Boolean);
  const brecha = cfg.sobreedad ? brechaEdad(cfg.edadReal, cfg.edadEsperada) : 0;
  return { perfiles, brecha };
}
