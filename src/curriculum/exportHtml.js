/* ============================================================
   PLAYLABI CURRÍCULO — EXPORTACIÓN A HTML AUTÓNOMO
   Un solo archivo, sin dependencias externas, con los QR
   embebidos como PNG en base64. Se abre en cualquier navegador
   y se imprime a PDF con Ctrl/Cmd+P.
   ============================================================ */
import { qrDataUrl, resourceUrl, resourceMeta } from "./qr.js";
import { getCountry, getStage } from "./frameworks.js";

const esc = (s) =>
  String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const CSS = `
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Gilroy','Outfit',system-ui,-apple-system,'Segoe UI',sans-serif;background:#EDF1F7;color:#0D1F2D;line-height:1.6;padding:28px 18px 64px}
.wrap{max-width:900px;margin:0 auto}
.hero{background:linear-gradient(135deg,#002739 0%,#0D4060 100%);color:#fff;border-radius:20px;padding:30px;margin-bottom:18px}
.hero h1{font-size:26px;font-weight:900;letter-spacing:-.02em;margin-bottom:10px;line-height:1.2}
.hero p{opacity:.85;font-size:14px}
.tags{display:flex;gap:7px;flex-wrap:wrap;margin-bottom:14px}
.tag{background:rgba(255,255,255,.18);padding:3px 11px;border-radius:20px;font-size:11px;font-weight:800}
.meta{display:flex;gap:18px;flex-wrap:wrap;margin-top:14px;font-size:12px;opacity:.75}
.card{background:#fff;border:1px solid #DDE8EF;border-radius:18px;padding:22px;margin-bottom:14px;break-inside:avoid}
.st{font-size:12px;font-weight:900;text-transform:uppercase;letter-spacing:.08em;color:#ed466f;margin-bottom:12px}
.code{font-family:ui-monospace,Menlo,monospace;font-size:11px;font-weight:800;background:#002739;color:#fff;padding:4px 9px;border-radius:7px;display:inline-block}
.code.none{background:#DDE8EF;color:#8FA8BB}
.row{display:flex;gap:12px;align-items:flex-start;margin-bottom:10px}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:12px}
.soft{background:#EDF1F7;border-radius:12px;padding:14px}
.pill{display:inline-block;background:#EDF1F7;padding:3px 11px;border-radius:20px;font-size:11px;font-weight:800;color:#4A6172;margin:0 5px 5px 0}
.sess{background:#fff;border:1px solid #DDE8EF;border-radius:18px;margin-bottom:14px;overflow:hidden;break-inside:avoid}
.sess-h{background:#EDF1F7;padding:14px 20px;border-bottom:1px solid #DDE8EF;display:flex;align-items:center;gap:12px;flex-wrap:wrap}
.num{background:linear-gradient(135deg,#ed466f 0%,#ef5041 33%,#f37b4f 66%,#f9a54b 100%);color:#fff;width:28px;height:28px;border-radius:9px;display:grid;place-items:center;font-weight:900;font-size:13px;flex-shrink:0}
.sess-b{padding:20px}
.phase{border-left:4px solid #ed466f;padding-left:13px;margin-bottom:15px}
.phase h4{font-size:13px;font-weight:800;color:#ed466f;margin-bottom:8px}
.two{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10}
.lbl{font-size:10px;font-weight:800;color:#8FA8BB;text-transform:uppercase;letter-spacing:.05em;margin-bottom:4px}
.quote{background:rgba(237,70,111,.09);border-left:3px solid #ed466f;padding:11px 15px;border-radius:8px;margin-bottom:14px}
table{width:100%;border-collapse:collapse;font-size:11.5px}
th{text-align:left;padding:9px 11px;background:#EDF1F7;color:#4A6172;font-weight:800;font-size:10.5px;text-transform:uppercase;letter-spacing:.05em;border-bottom:2px solid #DDE8EF}
th:first-child{background:#002739;color:#fff}
td{padding:10px 11px;border-bottom:1px solid #DDE8EF;vertical-align:top;color:#4A6172}
td:first-child{font-weight:800;color:#002739;background:#EDF1F7}
.qr{display:flex;gap:14px;align-items:flex-start;background:#EDF1F7;border:1px solid #DDE8EF;border-radius:14px;padding:15px;break-inside:avoid}
.qr img{background:#fff;padding:6px;border-radius:10px;border:1px solid #DDE8EF;display:block}
.dark{background:#002739;color:#fff;border-radius:16px;padding:20px;margin-bottom:14px;break-inside:avoid}
.grad{background:linear-gradient(135deg,#ed466f 0%,#ef5041 33%,#f37b4f 66%,#f9a54b 100%);color:#fff;border-radius:20px;padding:26px;margin-bottom:14px}
.foot{text-align:center;font-size:10.5px;color:#8FA8BB;margin-top:30px;line-height:1.7}
h2.ch{font-size:22px;font-weight:900;color:#002739;margin:28px 0 12px;letter-spacing:-.02em}
h3{font-size:16px;font-weight:900;color:#002739;margin-bottom:10px}
p.body{font-size:14px;line-height:1.8;text-align:justify;margin-bottom:12px}
.idea{background:rgba(237,70,111,.09);border-left:3px solid #ed466f;padding:11px 15px;border-radius:8px;margin-bottom:12px;font-weight:700;font-size:13.5px}
.brief{border:1.5px dashed #DDE8EF;border-radius:12px;padding:15px;margin-bottom:12px;background:#fff}
.act{background:#fff;border:1px solid #DDE8EF;border-radius:12px;padding:14px;margin-bottom:9px;break-inside:avoid}
@media print{
  body{background:#fff;padding:0}
  .card,.sess,.act{border-color:#ccc}
  @page{margin:14mm}
}
`;

/* ── Bloques auxiliares ── */

async function qrBlock(r, lang) {
  const url = resourceUrl(r, lang);
  const meta = resourceMeta(r.tipo);
  const img = url ? await qrDataUrl(url, { scale: 7 }) : "";
  return `<div class="qr">
    ${img ? `<img src="${img}" width="84" height="84" alt="QR ${esc(r.titulo)}">` : ""}
    <div style="flex:1;min-width:0">
      <div style="margin-bottom:5px"><span class="pill" style="background:rgba(123,92,255,.14);color:#7B5CFF">${esc(meta.label)}</span>${r.duracion ? `<span style="font-size:10px;color:#8FA8BB;font-weight:700">${esc(r.duracion)}</span>` : ""}</div>
      <div style="font-weight:800;font-size:13.5px;margin-bottom:4px">${esc(r.titulo)}</div>
      ${(r.que_hacer || r.para_que) ? `<div style="font-size:12px;color:#4A6172;margin-bottom:6px">${esc(r.que_hacer || r.para_que)}</div>` : ""}
      <div style="font-size:10.5px;color:#8FA8BB;word-break:break-all"><b style="color:#4A6172">${esc(r.sitio)}</b>${r.busqueda ? ` · buscar: «${esc(r.busqueda)}»` : ""}</div>
      ${url ? `<div style="font-size:9.5px;color:#8FA8BB;margin-top:4px;word-break:break-all">${esc(url)}</div>` : ""}
    </div>
  </div>`;
}

const stdRow = (e) =>
  `<div class="row"><span class="code${e.codigo ? "" : " none"}">${esc(e.codigo || "sin código")}</span><div><div style="font-size:13px">${esc(e.enunciado)}</div>${e.componente ? `<div style="font-size:11px;color:#8FA8BB;margin-top:3px">${esc(e.componente)}</div>` : ""}</div></div>`;

/* ── PLAN ── */
async function planHTML(plan, cfg) {
  const country = getCountry(cfg.country);
  const st = getStage(cfg.country, cfg.stage);
  const fw = country?.fw;
  const lang = country?.lang || "es";

  const recursos = plan.recursos_digitales?.length
    ? (await Promise.all(plan.recursos_digitales.map(r => qrBlock(r, lang)))).join("")
    : "";

  return `
<div class="hero">
  <div class="tags">
    <span class="tag">${esc(country?.flag)} ${esc(country?.name)}</span>
    <span class="tag">${esc(fw?.short)}</span>
    <span class="tag">${esc(cfg.grade)}</span>
  </div>
  <h1>${esc(plan.titulo)}</h1>
  <p>${esc(plan.justificacion)}</p>
  <div class="meta">
    <span><b>${esc(plan.numero_sesiones || cfg.sessions)}</b> sesión(es)</span>
    <span><b>${esc(plan.duracion_total_min || cfg.sessions * cfg.minutes)}</b> min</span>
    <span>${esc(cfg.subject)}</span>
    <span>${esc(st?.name)}</span>
  </div>
</div>

${plan.estandares?.length ? `<div class="card"><div class="st">${esc(fw?.standardWord)} · ${esc(fw?.short)}</div>${plan.estandares.map(stdRow).join("")}</div>` : ""}

<div class="card">
  <div class="st">Objetivos de aprendizaje</div>
  <div class="soft" style="margin-bottom:12px">
    <div class="lbl">General</div>
    <div style="font-size:14.5px;font-weight:700">${esc(plan.objetivo_general)}</div>
  </div>
  ${(plan.objetivos_especificos || []).map((o, i) => `<div class="row"><b style="color:#ed466f">${i + 1}.</b><span style="font-size:13px">${esc(o)}</span></div>`).join("")}
</div>

<div class="grid" style="margin-bottom:14px">
  ${plan.competencias?.length ? `<div class="card" style="margin:0"><div class="st">${esc(fw?.competenciesWord)}</div>${plan.competencias.map(c => `<div class="row"><b style="color:#1FA89B">✓</b><span style="font-size:12.5px">${esc(c)}</span></div>`).join("")}</div>` : ""}
  <div class="card" style="margin:0">
    <div class="st">${esc(fw?.transversalWord)}</div>
    ${plan.transversal ? `<div style="font-weight:800;font-size:13.5px;margin-bottom:6px">${esc(plan.transversal.eje)}</div><div style="font-size:12.5px;color:#4A6172;margin-bottom:12px">${esc(plan.transversal.como_se_integra)}</div>` : ""}
    ${(plan.ods || []).map(o => `<span class="pill" style="background:rgba(31,168,155,.14);color:#1FA89B">ODS ${esc(o)}</span>`).join("")}
  </div>
</div>

${plan.metodologia ? `<div class="dark"><div class="lbl" style="color:rgba(255,255,255,.55)">Metodología</div><div style="font-size:17px;font-weight:800;margin-bottom:6px">${esc(plan.metodologia.nombre)}</div><div style="font-size:13px;opacity:.8">${esc(plan.metodologia.por_que)}</div></div>` : ""}

${plan.conceptos_clave?.length ? `<div class="card"><div class="st">Conceptos clave y dificultades previstas</div><div class="grid">${plan.conceptos_clave.map(c => `<div class="soft"><div style="font-weight:800;font-size:13.5px;margin-bottom:5px">${esc(c.termino)}</div><div style="font-size:12.5px;color:#4A6172;margin-bottom:8px">${esc(c.definicion)}</div>${c.por_que_cuesta ? `<div style="font-size:11.5px;color:#EF5041;border-top:1px dashed #DDE8EF;padding-top:7px"><b>Dificultad:</b> ${esc(c.por_que_cuesta)}</div>` : ""}</div>`).join("")}</div></div>` : ""}

<div class="st" style="font-size:13px;margin:24px 0 14px">Secuencia de sesiones</div>
${(plan.sesiones || []).map(s => `
<div class="sess">
  <div class="sess-h"><span class="num">${esc(s.n)}</span><span style="font-weight:800;font-size:15px;flex:1">${esc(s.titulo)}</span><span class="pill">${esc(s.duracion_min)} min</span></div>
  <div class="sess-b">
    ${s.pregunta_detonante ? `<div class="quote"><div class="lbl" style="color:#ed466f">Pregunta detonante</div><div style="font-size:14px;font-weight:700">«${esc(s.pregunta_detonante)}»</div></div>` : ""}
    ${(s.fases || []).map(f => `
      <div class="phase">
        <h4>${esc(f.nombre)} <span class="pill">${esc(f.min)} min</span>${f.recurso ? `<span style="font-size:11px;color:#8FA8BB;font-weight:500"> · ${esc(f.recurso)}</span>` : ""}</h4>
        <div class="two">
          <div class="soft"><div class="lbl">Docente</div><div style="font-size:12.5px">${esc(f.docente)}</div></div>
          <div class="soft"><div class="lbl">Estudiante</div><div style="font-size:12.5px">${esc(f.estudiante)}</div></div>
        </div>
      </div>`).join("")}
    <div class="two" style="border-top:1px dashed #DDE8EF;padding-top:14px;margin-top:14px">
      ${s.cierre_metacognitivo ? `<div><div class="lbl">Metacognición</div><div style="font-size:12.5px;font-style:italic">«${esc(s.cierre_metacognitivo)}»</div></div>` : ""}
      ${s.evidencia ? `<div><div class="lbl">Evidencia</div><div style="font-size:12.5px">${esc(s.evidencia)}</div></div>` : ""}
    </div>
  </div>
</div>`).join("")}

${plan.evaluacion ? `<div class="card">
  <div class="st">Evaluación</div>
  <div style="font-size:13px;color:#4A6172;margin-bottom:8px">${esc(plan.evaluacion.enfoque)}</div>
  ${plan.evaluacion.instrumento ? `<span class="pill" style="background:rgba(123,92,255,.14);color:#7B5CFF">${esc(plan.evaluacion.instrumento)}</span>` : ""}
  ${plan.evaluacion.rubrica?.length ? `<table style="margin-top:14px"><thead><tr><th>Criterio</th><th>Inicial</th><th>En proceso</th><th>Logrado</th><th>Destacado</th></tr></thead><tbody>${plan.evaluacion.rubrica.map(r => `<tr><td>${esc(r.criterio)}</td><td>${esc(r.inicial)}</td><td>${esc(r.en_proceso)}</td><td>${esc(r.logrado)}</td><td>${esc(r.destacado)}</td></tr>`).join("")}</tbody></table>` : ""}
</div>` : ""}

<div class="grid" style="margin-bottom:14px">
  ${plan.diferenciacion ? `<div class="card" style="margin:0"><div class="st">Diferenciación</div>
    ${[["Apoyo", plan.diferenciacion.apoyo, "#EF5041"], ["Estándar", plan.diferenciacion.estandar, "#4A6172"], ["Ampliación", plan.diferenciacion.ampliacion, "#1FA89B"]].filter(x => x[1]).map(([t, v, c]) => `<div style="margin-bottom:11px"><div style="font-size:11px;font-weight:800;color:${c};margin-bottom:3px">${t}</div><div style="font-size:12.5px">${esc(v)}</div></div>`).join("")}
  </div>` : ""}
  ${plan.dua ? `<div class="card" style="margin:0"><div class="st">Diseño Universal para el Aprendizaje</div>
    ${[["Implicación", plan.dua.implicacion], ["Representación", plan.dua.representacion], ["Acción y expresión", plan.dua.accion]].filter(x => x[1]).map(([t, v]) => `<div style="margin-bottom:11px"><div style="font-size:11px;font-weight:800;color:#7B5CFF;margin-bottom:3px">${t}</div><div style="font-size:12.5px">${esc(v)}</div></div>`).join("")}
  </div>` : ""}
</div>

${plan.adaptaciones?.length ? `<div class="card" style="border-left:4px solid #7B5CFF"><div class="st" style="color:#7B5CFF">Adaptaciones aplicadas al perfil del grupo</div><div style="font-size:11.5px;color:#8FA8BB;margin-bottom:14px">Estas decisiones ya están incorporadas en las sesiones anteriores.</div>${plan.adaptaciones.map(a => `<div class="soft" style="margin-bottom:11px"><span class="pill" style="background:rgba(123,92,255,.14);color:#7B5CFF">${esc(a.perfil)}</span>${a.momento ? `<span style="font-size:10.5px;color:#8FA8BB;font-weight:700"> ${esc(a.momento)}</span>` : ""}<div style="font-size:12.5px;margin-top:6px">${esc(a.en_esta_clase)}</div></div>`).join("")}</div>` : ""}

${recursos ? `<div class="card"><div class="st">Recursos digitales · escanea el QR</div><div class="grid">${recursos}</div></div>` : ""}

${plan.errores_frecuentes?.length ? `<div class="card"><div class="st">Errores frecuentes que anticipar</div>${plan.errores_frecuentes.map(e => `<div class="row"><b style="color:#EF5041">!</b><span style="font-size:12.5px">${esc(e)}</span></div>`).join("")}</div>` : ""}

${plan.pregunta_examen_modelo?.enunciado ? `<div class="card"><div class="st">Pregunta modelo (estilo evaluación externa)</div><div style="font-size:13.5px;margin-bottom:8px">${esc(plan.pregunta_examen_modelo.enunciado)}</div><div style="font-size:11.5px;color:#8FA8BB"><b>Evalúa:</b> ${esc(plan.pregunta_examen_modelo.que_evalua)}</div></div>` : ""}

<div class="grid">
  ${plan.materiales ? `<div class="card" style="margin:0"><div class="st">Materiales</div><div style="font-size:12.5px">${esc(plan.materiales)}</div></div>` : ""}
  ${plan.tarea_casa ? `<div class="card" style="margin:0"><div class="st">Trabajo para casa</div><div style="font-size:12.5px">${esc(plan.tarea_casa)}</div></div>` : ""}
  ${plan.bibliografia?.length ? `<div class="card" style="margin:0"><div class="st">Bibliografía</div>${plan.bibliografia.map(b => `<div style="font-size:11.5px;color:#4A6172;margin-bottom:5px">${esc(b)}</div>`).join("")}</div>` : ""}
</div>

${plan.nota_normativa ? `<div class="card" style="background:rgba(130,211,241,.14)"><b>Nota normativa · ${esc(country?.name)}:</b> ${esc(plan.nota_normativa)}</div>` : ""}
`;
}

/* ── LIBRO ── */
async function chapterHTML(ch, lang, country) {
  const recursos = ch.recursos_qr?.length
    ? (await Promise.all(ch.recursos_qr.map(r => qrBlock(r, lang)))).join("")
    : "";

  return `
<h2 class="ch">${esc(ch.n)}. ${esc(ch.titulo)}</h2>
${ch.apertura ? `
  <div style="font-size:15.5px;font-weight:700;color:#ed466f;margin-bottom:12px">${esc(ch.apertura.frase_gancho)}</div>
  ${ch.apertura.pregunta_esencial ? `<div class="quote"><div class="lbl">Pregunta esencial</div><div style="font-size:14px;font-weight:700">${esc(ch.apertura.pregunta_esencial)}</div></div>` : ""}
  ${ch.apertura.lo_que_ya_sabes?.length ? `<div class="card"><div class="st">Lo que ya sabes</div>${ch.apertura.lo_que_ya_sabes.map(x => `<div class="row"><b style="color:#82D3F1">–</b><span style="font-size:12.5px">${esc(x)}</span></div>`).join("")}</div>` : ""}
` : ""}

<div class="grid" style="margin-bottom:14px">
  ${ch.objetivos?.length ? `<div class="card" style="margin:0"><div class="st">Objetivos</div>${ch.objetivos.map((o, i) => `<div style="font-size:12.5px;margin-bottom:5px">${i + 1}. ${esc(o)}</div>`).join("")}</div>` : ""}
  ${ch.estandares?.length ? `<div class="card" style="margin:0"><div class="st">${esc(country?.fw?.standardWord || "Estándares")}</div>${ch.estandares.map(stdRow).join("")}</div>` : ""}
</div>

${ch.vocabulario?.length ? `<div class="card"><div class="st">Vocabulario</div><div class="grid">${ch.vocabulario.map(v => `<div class="soft" style="border-top:3px solid #ed466f"><div style="font-weight:900;font-size:13.5px;margin-bottom:5px">${esc(v.termino)}</div><div style="font-size:12.5px;margin-bottom:7px">${esc(v.definicion)}</div>${v.ejemplo ? `<div style="font-size:11.5px;color:#4A6172"><b>Ej.</b> ${esc(v.ejemplo)}</div>` : ""}${v.en_contexto ? `<div style="font-size:11px;color:#8FA8BB;font-style:italic;margin-top:5px">«${esc(v.en_contexto)}»</div>` : ""}</div>`).join("")}</div></div>` : ""}

${(ch.desarrollo || []).map(d => `
<div class="card">
  <h3>${esc(d.subtitulo)}</h3>
  <p class="body">${esc(d.texto)}</p>
  ${d.idea_clave ? `<div class="idea">${esc(d.idea_clave)}</div>` : ""}
  ${d.infografia ? `<div class="brief"><span class="pill" style="background:rgba(123,92,255,.14);color:#7B5CFF">${esc(d.infografia.tipo)}</span><div style="font-size:12.5px;margin:8px 0">${esc(d.infografia.descripcion)}</div>${(d.infografia.elementos || []).map(e => `<span class="pill">${esc(e)}</span>`).join("")}</div>` : ""}
  ${d.dato_curioso ? `<div class="soft" style="display:flex;gap:11px"><div style="font-size:12.5px">${esc(d.dato_curioso)}</div></div>` : ""}
</div>`).join("")}

${recursos ? `<div class="card"><div class="st">Amplía con tu móvil</div><div class="grid">${recursos}</div></div>` : ""}

${ch.actividades?.length ? `<div class="card"><div class="st">Actividades</div>${ch.actividades.map(a => `<div class="act"><div style="margin-bottom:7px"><span class="num" style="display:inline-grid;width:22px;height:22px;font-size:11px">${esc(a.n)}</span> <span class="pill">${esc(a.nivel)}</span> <span class="pill">${esc(a.formato)}</span> <span class="pill">${esc(a.tiempo_min)} min</span></div><div style="font-size:13px;margin-bottom:8px">${esc(a.consigna)}</div>${a.solucion ? `<div style="font-size:12px;color:#4A6172;border-top:1px dashed #DDE8EF;padding-top:7px"><b>Solución:</b> ${esc(a.solucion)}</div>` : ""}</div>`).join("")}</div>` : ""}

${ch.taller?.titulo ? `<div class="dark"><span class="tag">${esc(ch.taller.tipo)}</span><h3 style="color:#fff;margin:10px 0">${esc(ch.taller.titulo)}</h3>${ch.taller.materiales ? `<div style="font-size:12.5px;opacity:.82;margin-bottom:12px"><b>Materiales:</b> ${esc(ch.taller.materiales)}</div>` : ""}${(ch.taller.pasos || []).map((p, i) => `<div style="display:flex;gap:10px;margin-bottom:7px;font-size:13px"><span style="background:rgba(255,255,255,.22);width:20px;height:20px;border-radius:6px;display:grid;place-items:center;font-size:10.5px;font-weight:900;flex-shrink:0">${i + 1}</span><span style="opacity:.92">${esc(p)}</span></div>`).join("")}${ch.taller.que_observar ? `<div style="margin-top:13px;padding:11px 14px;background:rgba(255,255,255,.13);border-radius:10px;font-size:12.5px"><b>Observa:</b> ${esc(ch.taller.que_observar)}</div>` : ""}${ch.taller.precaucion ? `<div style="margin-top:9px;font-size:11.5px;color:#FFC06A">Precaución: ${esc(ch.taller.precaucion)}</div>` : ""}</div>` : ""}

${ch.conexiones ? `<div class="card"><div class="st">Conexiones</div><div class="grid">${[["Otra área", ch.conexiones.otra_area], ["Vida cotidiana", ch.conexiones.vida_cotidiana], ["ODS", ch.conexiones.ods], [country?.name || "Local", ch.conexiones.local]].filter(x => x[1]).map(([t, v]) => `<div class="soft"><div class="lbl">${esc(t)}</div><div style="font-size:12.5px">${esc(v)}</div></div>`).join("")}</div></div>` : ""}

${ch.inclusion ? `<div class="grid" style="margin-bottom:14px">${[["Apoyo", ch.inclusion.apoyo, "#EF5041"], ["Ampliación", ch.inclusion.ampliacion, "#1FA89B"]].filter(x => x[1]).map(([t, v, c]) => `<div class="card" style="margin:0;border-left:3px solid ${c}"><div class="lbl" style="color:${c}">${t}</div><div style="font-size:12.5px">${esc(v)}</div></div>`).join("")}</div>` : ""}

${ch.sintesis ? `<div class="card"><div class="st">Síntesis</div><p style="font-size:13.5px;margin-bottom:14px">${esc(ch.sintesis.resumen)}</p>${(ch.sintesis.mapa_conceptual || []).map(m => `<div style="margin-bottom:7px;font-size:12px"><span class="pill">${esc(m.concepto)}</span> <span style="color:#ed466f;font-weight:700;font-size:10.5px">—${esc(m.relacion)}→</span> <span class="pill">${esc(m.conecta_con)}</span></div>`).join("")}</div>` : ""}

${ch.autoevaluacion?.length ? `<div class="card"><div class="st">Autoevaluación</div>${ch.autoevaluacion.map(a => `<div style="display:flex;align-items:center;gap:11px;padding:8px 0;border-bottom:1px solid #DDE8EF"><span style="flex:1;font-size:12.5px">${esc(a)}</span><span style="flex-shrink:0">${["✓", "~", "✗"].map(s => `<span style="display:inline-grid;place-items:center;width:22px;height:22px;border:1.5px solid #DDE8EF;border-radius:6px;font-size:11px;color:#8FA8BB;margin-left:5px">${s}</span>`).join("")}</span></div>`).join("")}</div>` : ""}

${ch.evaluacion?.length ? `<div class="card"><div class="st">Comprueba lo que aprendiste</div>${ch.evaluacion.map((q, i) => `<div class="act"><div style="font-size:13px;font-weight:700;margin-bottom:10px">${i + 1}. ${esc(q.pregunta)}</div>${(q.opciones || []).map((o, j) => `<div style="display:flex;gap:9px;margin-bottom:6px;font-size:12.5px"><span style="width:20px;height:20px;border:1.5px solid #DDE8EF;border-radius:6px;display:grid;place-items:center;font-size:10.5px;font-weight:800;color:#8FA8BB;flex-shrink:0">${String.fromCharCode(65 + j)}</span><span>${esc(o)}</span></div>`).join("")}${q.por_que ? `<div style="margin-top:9px;font-size:12px;color:#4A6172;border-top:1px dashed #DDE8EF;padding-top:8px"><b style="color:#1FA89B">Correcta: ${String.fromCharCode(65 + (q.respuesta ?? 0))}.</b> ${esc(q.por_que)}</div>` : ""}</div>`).join("")}</div>` : ""}
`;
}

async function bookHTML(outline, chapters, cfg) {
  const country = getCountry(cfg.country);
  const st = getStage(cfg.country, cfg.stage);
  const fw = country?.fw;
  const lang = country?.lang || "es";
  const p = outline.paleta || {};

  const caps = [];
  for (const u of outline.unidades || []) {
    for (const c of u.capitulos || []) {
      const k = `${u.n}-${c.n}`;
      if (chapters?.[k]) caps.push(await chapterHTML(chapters[k], lang, country));
    }
  }

  return `
<div class="hero" style="background:linear-gradient(135deg,${p.primario || "#002739"},${p.secundario || "#0D4060"})">
  <div class="tags">
    <span class="tag">${esc(country?.flag)} ${esc(country?.name)}</span>
    <span class="tag">${esc(fw?.short)}</span>
    <span class="tag">${esc(cfg.grade)}</span>
    <span class="tag">${esc(cfg.subject)}</span>
  </div>
  <h1 style="font-size:32px">${esc(outline.titulo_obra)}</h1>
  <p style="font-size:15px;font-weight:500;margin-bottom:14px">${esc(outline.subtitulo)}</p>
  <p style="font-size:13.5px;opacity:.78">${esc(outline.sinopsis)}</p>
  ${outline.promesa ? `<div style="margin-top:18px;padding:13px 17px;background:rgba(255,255,255,.12);border-radius:12px;border-left:3px solid ${p.acento || "#ed466f"}"><div class="lbl" style="color:rgba(255,255,255,.55)">Al terminar el libro</div><div style="font-size:14px;font-weight:700">${esc(outline.promesa)}</div></div>` : ""}
</div>

<div class="grid" style="margin-bottom:14px">
  ${outline.carta_al_estudiante ? `<div class="card" style="margin:0"><div class="st">Carta al estudiante</div><p style="font-size:13.5px;line-height:1.7">${esc(outline.carta_al_estudiante)}</p></div>` : ""}
  ${outline.carta_al_docente ? `<div class="card" style="margin:0"><div class="st">Carta al docente</div><p style="font-size:13.5px;line-height:1.7">${esc(outline.carta_al_docente)}</p></div>` : ""}
</div>

${outline.secciones_fijas?.length ? `<div class="card"><div class="st">Arquitectura de cada capítulo</div><div class="grid">${outline.secciones_fijas.map(s => `<div class="soft" style="display:flex;gap:11px"><div><div style="font-weight:800;font-size:12.5px;margin-bottom:3px">${esc(s.nombre)}</div><div style="font-size:11.5px;color:#4A6172">${esc(s.funcion)}</div></div></div>`).join("")}</div></div>` : ""}

<div class="st" style="font-size:13px;margin:26px 0 14px">Sumario de la obra</div>
${(outline.unidades || []).map(u => `
<div class="sess">
  <div style="background:${p.primario || "#002739"};color:#fff;padding:16px 20px">
    <div style="display:flex;align-items:center;gap:11px;margin-bottom:7px"><span style="background:rgba(255,255,255,.2);width:26px;height:26px;border-radius:8px;display:grid;place-items:center;font-weight:900;font-size:12px">${esc(u.n)}</span><span style="font-weight:900;font-size:16px">${esc(u.titulo)}</span></div>
    ${u.pregunta_esencial ? `<div style="font-size:12.5px;opacity:.8;font-style:italic">«${esc(u.pregunta_esencial)}»</div>` : ""}
  </div>
  <div class="sess-b">
    ${(u.capitulos || []).map(c => `<div style="border-bottom:1px solid #DDE8EF;padding:13px 0"><div style="font-weight:800;font-size:14px;margin-bottom:4px">${esc(c.n)}. ${esc(c.titulo)}</div><div style="font-size:12.5px;color:#4A6172;margin-bottom:7px">${esc(c.resumen)}</div>${(c.estandares || []).map(e => `<span class="code${e.codigo ? "" : " none"}" style="margin-right:5px">${esc(e.codigo || "sin código")}</span>`).join("")}${c.paginas_estimadas ? `<span style="font-size:10.5px;color:#8FA8BB">≈${esc(c.paginas_estimadas)} pp.</span>` : ""}</div>`).join("")}
  </div>
</div>`).join("")}

${caps.length ? `<div class="st" style="font-size:13px;margin:30px 0 6px">Capítulos</div>${caps.join("")}` : `<div class="card" style="text-align:center;color:#8FA8BB;font-size:13px">Aún no se ha escrito ningún capítulo. Genéralos desde el módulo y vuelve a exportar.</div>`}

${outline.proyecto_final ? `<div class="grad"><div class="lbl" style="color:rgba(255,255,255,.7)">Proyecto final de la obra</div><h3 style="color:#fff;font-size:22px;margin:8px 0 10px">${esc(outline.proyecto_final.titulo)}</h3><p style="font-size:13.5px;opacity:.92;margin-bottom:16px">${esc(outline.proyecto_final.descripcion)}</p><div class="two">${[["Producto", outline.proyecto_final.producto], ["Evaluación", outline.proyecto_final.evaluacion]].filter(x => x[1]).map(([t, v]) => `<div style="background:rgba(255,255,255,.16);border-radius:12px;padding:13px"><div class="lbl" style="color:rgba(255,255,255,.7)">${t}</div><div style="font-size:13px;font-weight:700">${esc(v)}</div></div>`).join("")}</div></div>` : ""}

${outline.nota_normativa ? `<div class="card" style="background:rgba(130,211,241,.14)"><b>Nota normativa · ${esc(country?.name)}:</b> ${esc(outline.nota_normativa)}</div>` : ""}
`;
}

/* ── FICHA DEL ESTUDIANTE ── */
const lineas = (n) => Array.from({length: n || 3}).map(() => '<div style="border-bottom:1px solid #DDE8EF;height:26px"></div>').join('');

async function studentHTML(sheet, cfg, t) {
  const country = getCountry(cfg.country);
  const st = getStage(cfg.country, cfg.stage);
  const lang = country?.lang || 'es';
  const recursos = sheet.recursos_qr?.length
    ? (await Promise.all(sheet.recursos_qr.map(r => qrBlock(r, lang)))).join('')
    : '';

  return `
<div class="card" style="border:2px solid #002739">
  <div style="font-size:10.5px;font-weight:800;color:#ed466f;text-transform:uppercase;letter-spacing:.09em;margin-bottom:7px">${esc(sheet.materia || cfg.subject)} · ${esc(cfg.grade)}</div>
  <h1 style="font-size:25px;font-weight:900;color:#002739;margin-bottom:18px">${esc(sheet.titulo)}</h1>
  <div style="display:grid;grid-template-columns:2fr 1fr 1fr;gap:12px">
    ${[t('studentName'), t('studentGroup'), t('studentDate')].map(l => `<div><div class="lbl">${esc(l)}</div><div style="border-bottom:1.5px solid #DDE8EF;height:24px"></div></div>`).join('')}
  </div>
</div>

${sheet.gancho ? `<div class="grad"><p style="font-size:15px;line-height:1.65">${esc(sheet.gancho)}</p></div>` : ''}

${sheet.que_vas_a_aprender?.length ? `<div class="card"><div class="st">${esc(t('whatYouWillLearn'))}</div>${sheet.que_vas_a_aprender.map((x,i) => `<div class="row"><b style="color:#ed466f">${i+1}.</b><span style="font-size:14px">${esc(x)}</span></div>`).join('')}</div>` : ''}

${sheet.lo_que_ya_sabes?.length ? `<div class="card"><div class="st">${esc(t('whatYouKnow'))}</div>${sheet.lo_que_ya_sabes.map(q => `<div style="margin-bottom:14px"><div style="font-size:14px;font-weight:600">${esc(q.pregunta)}</div>${lineas(q.lineas || 1)}</div>`).join('')}</div>` : ''}

${(sheet.explicacion || []).map(b => `<div class="card"><h3>${esc(b.subtitulo)}</h3><p class="body" style="text-align:left">${esc(b.texto)}</p>${b.para_recordar ? `<div style="background:rgba(130,211,241,.18);border-left:3px solid #82D3F1;padding:12px 16px;border-radius:8px"><div class="lbl">${esc(t('remember'))}</div><div style="font-size:14px;font-weight:700">${esc(b.para_recordar)}</div></div>` : ''}</div>`).join('')}

${sheet.palabras_clave?.length ? `<div class="card"><div class="st">${esc(t('vocabulary'))}</div><div class="grid">${sheet.palabras_clave.map(p => `<div class="soft"><div style="font-weight:900;font-size:14px;margin-bottom:5px">${esc(p.palabra)}</div><div style="font-size:13px;color:#4A6172">${esc(p.significado)}</div></div>`).join('')}</div></div>` : ''}

${sheet.actividades?.length ? `<div class="st" style="font-size:13px;margin:24px 0 14px">${esc(t('yourTurn'))}</div>${sheet.actividades.map(a => `<div class="card"><div style="display:flex;gap:12px;align-items:flex-start"><span class="num">${esc(a.n)}</span><div style="flex:1"><div style="font-size:14.5px;font-weight:600">${esc(a.consigna)}</div>${a.tipo ? `<span class="pill" style="margin-top:7px">${esc(a.tipo)}</span>` : ''}</div></div>${lineas(a.lineas || 3)}${a.pista ? `<div style="font-size:12px;color:#8FA8BB;margin-top:9px;font-style:italic">${esc(a.pista)}</div>` : ''}</div>`).join('')}` : ''}

${recursos ? `<div class="card"><div class="st">${esc(t('expandMobile'))}</div><div class="grid">${recursos}</div></div>` : ''}

${sheet.reto_extra?.consigna ? `<div class="dark"><div style="font-size:17px;font-weight:900;margin-bottom:9px">${esc(sheet.reto_extra.titulo)}</div><p style="font-size:14px;opacity:.9">${esc(sheet.reto_extra.consigna)}</p></div>` : ''}

${sheet.como_te_fue?.length ? `<div class="card"><div class="st">${esc(t('howDidItGo'))}</div>${sheet.como_te_fue.map(x => `<div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid #DDE8EF"><span style="flex:1;font-size:13.5px">${esc(x)}</span><span>${['✓','~','✗'].map(k => `<span style="display:inline-grid;place-items:center;width:26px;height:26px;border:1.5px solid #DDE8EF;border-radius:7px;font-size:12px;color:#8FA8BB;margin-left:7px">${k}</span>`).join('')}</span></div>`).join('')}</div>` : ''}

${sheet.para_casa ? `<div class="card" style="border:1.5px dashed #DDE8EF"><div class="lbl">${esc(t('homework'))}</div><div style="font-size:14px">${esc(sheet.para_casa)}</div></div>` : ''}
`;
}

/* ── Documento completo ── */
export async function buildStandaloneHTML({ mode, plan, outline, chapters, sheet, cfg, t }) {
  const country = getCountry(cfg.country);
  const fw = country?.fw;
  const body = mode === "plan" ? await planHTML(plan, cfg)
    : mode === "student" ? await studentHTML(sheet, cfg, t)
    : await bookHTML(outline, chapters, cfg);
  const title = mode === "plan" ? (plan?.titulo || "Plan de aula")
    : mode === "student" ? (sheet?.titulo || "Ficha del estudiante")
    : (outline?.titulo_obra || "Libro didáctico");
  const fecha = new Date().toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });

  return `<!doctype html>
<html lang="${country?.lang || "es"}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<style>@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap');
${CSS}</style>
</head>
<body>
<div class="wrap">
${body}
<div class="foot">
  Generado con <b>Playlabi Currículo</b> · ${esc(fecha)}<br>
  Alineado a ${esc(fw?.name)} (${esc(fw?.short)}) · ${esc(fw?.authority)}<br>
  Los códigos normativos deben verificarse en la fuente oficial antes de su presentación institucional.
</div>
</div>
</body>
</html>`;
}
