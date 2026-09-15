import "dotenv/config";
import express from "express";
import { inicializar, MOTOR } from "./db.js";
import { asegurarAdmin, estaActivo } from "./auth.js";
import { api } from "./api.js";
import { correoActivo } from "./mail.js";

/* ============================================================
   PLAYLABI CURRÍCULO — SERVIDOR
   Sirve la API de cuentas, banco y administración, y hace de
   intermediario con Anthropic para que la clave nunca viaje al
   navegador.
   ============================================================ */

const app = express();
app.use(express.json({ limit: "20mb" }));

const PORT = process.env.API_PORT || 3002;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    servicio: "playlabi-curriculo",
    claveConfigurada: !!ANTHROPIC_API_KEY,
    baseDeDatos: MOTOR,
    correoActivo: correoActivo(),
  });
});

/* Cuentas, banco de documentos, compartición y administración */
app.use("/api", api);

/* ── Puente con Anthropic ──────────────────────────────────
   Detrás de sesión: sin cuenta aprobada no se puede generar nada.
   Sin esta guarda, cualquiera que encuentre la URL podría gastar
   la clave de API a tu costa. */
app.post("/api/claude", async (req, res) => {
  if (!estaActivo(req.usuario)) {
    return res.status(401).json({
      error: { message: "Necesitas iniciar sesión con una cuenta aprobada para generar documentos." },
    });
  }
  if (!ANTHROPIC_API_KEY) {
    return res.status(500).json({
      error: { message: "ANTHROPIC_API_KEY no está configurada. Revisa el archivo .env del proyecto." },
    });
  }
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(req.body),
      // Un capítulo de libro puede tardar más de un minuto.
      signal: AbortSignal.timeout(300000),
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    const msg = err.name === "TimeoutError"
      ? "La generación tardó demasiado. Reduce el número de sesiones o capítulos e inténtalo de nuevo."
      : "No se pudo contactar con el servicio de IA: " + err.message;
    res.status(502).json({ error: { message: msg } });
  }
});

/* ── Arranque ─────────────────────────────────────────────── */

const arrancar = async () => {
  await inicializar();
  const admin = await asegurarAdmin();

  app.listen(PORT, () => {
    console.log(`Playlabi Currículo · API en http://localhost:${PORT}`);
    console.log(`  base de datos : ${MOTOR}${MOTOR === "sqlite" ? " (./datos/curriculo.db)" : ""}`);
    console.log(`  correo        : ${correoActivo() ? "activo" : "desactivado (avisos solo en el panel)"}`);

    if (!ANTHROPIC_API_KEY) console.warn("  AVISO: falta ANTHROPIC_API_KEY en .env — la generación fallará.");
    if (admin.motivo === "sin_credenciales") {
      console.warn("  AVISO: no hay cuenta de administración.");
      console.warn("         Añade ADMIN_EMAIL y ADMIN_PASSWORD al .env y reinicia.");
    } else if (admin.creado) {
      console.log(`  admin         : creado (${process.env.ADMIN_EMAIL})`);
    } else {
      console.log(`  admin         : ${process.env.ADMIN_EMAIL}`);
    }
  });
};

arrancar().catch((e) => {
  console.error("No se pudo arrancar el servidor:", e);
  process.exit(1);
});
