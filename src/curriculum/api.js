/* ============================================================
   PLAYLABI CURRÍCULO — CLIENTE DE IA
   Los documentos curriculares son mucho más largos que una
   actividad de juego, así que este cliente admite techos de
   tokens altos y reintenta cuando el modelo devuelve texto
   alrededor del JSON.
   ============================================================ */

const API_BASE = import.meta.env.VITE_API_URL || "";
const MODEL = "claude-sonnet-4-6";

export function extractJSON(text) {
  const clean = String(text).replace(/```json|```/g, "").trim();
  const s = clean.indexOf("{");
  const e = clean.lastIndexOf("}");
  if (s === -1 || e === -1) throw new Error("La respuesta no contiene JSON.");
  return JSON.parse(clean.slice(s, e + 1));
}

async function ask(system, messages, maxTokens) {
  const res = await fetch(API_BASE + "/api/claude", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: MODEL, max_tokens: maxTokens, system, messages }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message || `Error ${res.status} del servidor de IA.`);
  }
  const text = (data.content || []).filter(b => b.type === "text").map(b => b.text).join("\n");
  if (!text) throw new Error(`Respuesta vacía (motivo: ${data.stop_reason || "desconocido"}).`);
  return { text, stop: data.stop_reason };
}

export async function callCurriculum(system, userMsg, maxTokens = 4000) {
  const messages = [{ role: "user", content: userMsg }];
  const first = await ask(system, messages, maxTokens);

  try {
    return extractJSON(first.text);
  } catch (err) {
    // Truncado por límite de tokens: el JSON quedó incompleto y no hay reparación posible.
    if (first.stop === "max_tokens") {
      throw new Error("El documento superó el límite de generación. Reduce el número de sesiones, unidades o capítulos y vuelve a intentarlo.");
    }
    // El modelo envolvió el JSON en texto: se le pide solo el JSON.
    const retry = await ask(system, [
      ...messages,
      { role: "assistant", content: first.text },
      { role: "user", content: "Responde ÚNICAMENTE el JSON válido y compacto, sin texto alrededor." },
    ], maxTokens);
    try {
      return extractJSON(retry.text);
    } catch {
      throw new Error(`No se pudo interpretar la respuesta. Inicio recibido: «${first.text.slice(0, 110)}…»`);
    }
  }
}
