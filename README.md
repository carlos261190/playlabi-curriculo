# Playlabi Currículo

Genera **planes de aula**, **fichas del estudiante** y **libros didácticos**
alineados a la normativa curricular oficial de cada país.

No es una plantilla traducida: cada marco tiene su propia lógica de diseño, su
terminología y su forma de codificar los estándares. Un plan para Brasil parte
de una *habilidade* de la BNCC; uno para España, de una situación de aprendizaje
LOMLOE; uno para Bolivia, de un objetivo holístico del MESCP.

**Cobertura:** 32 países (toda América más España y Portugal), 186 etapas
educativas, 876 grados y 2.085 asignaturas.

---

## Qué genera

| Documento | Para quién | Contiene |
|---|---|---|
| **Plan de aula** | Docente | Estándares codificados, objetivos, secuencia de sesiones con rol docente y del estudiante separados, rúbrica por niveles, DUA, diferenciación y errores frecuentes |
| **Ficha del estudiante** | Alumno | Explicación en segunda persona, actividades con renglones para escribir a mano, vocabulario y autoevaluación. Sin jerga pedagógica, sin códigos normativos y **sin soluciones** |
| **Libro didáctico** | Obra completa | Portada, cartas, sumario por unidades, capítulos redactados, talleres y proyecto final |

El plan y la ficha son **dos caras del mismo documento**: la ficha se deriva del
plan ya generado, de modo que las actividades, los conceptos y los recursos
coinciden pieza por pieza.

## Decisiones de diseño que conviene conocer

**Los códigos normativos no se inventan.** Si el modelo no está seguro del
código oficial de un estándar, lo deja vacío y avisa en el documento, pero
redacta igualmente el enunciado con la formulación del país. Un código falso con
formato plausible invalidaría el documento ante una supervisión educativa.

**Los QR son reales y escaneables.** El modelo nunca devuelve URLs completas:
entrega plataforma y término de búsqueda, y el código los convierte en una URL
de búsqueda real (YouTube, PhET, Wikipedia, GeoGebra…). Así ningún QR impreso
lleva a un enlace muerto.

**Neurodivergencia y desfase edad-grado son ejes distintos.** La neurodivergencia
cambia *cómo* se presenta y se evalúa el contenido, nunca rebaja el objetivo. El
desfase edad-grado cambia el *registro y el contexto*, nunca el nivel curricular:
un estudiante de 15 años en 5.º grado recibe el contenido de 5.º escrito como se
le habla a alguien de 15. Confundirlos —infantilizar— es el error que el módulo
existe para evitar.

## Puesta en marcha

```bash
npm install
cp .env.example .env    # rellena ANTHROPIC_API_KEY, ADMIN_EMAIL y ADMIN_PASSWORD
npm run dev
```

La aplicación queda en `http://localhost:5176` y la API en el `3002`.
El administrador se crea solo al arrancar, con las credenciales del `.env`.

## Arquitectura

```
src/curriculum/     Interfaz y lógica del módulo
  frameworks.js     Índice del catálogo curricular
  fw-*.js           Marcos por región (BNCC, LOMLOE, CNEB, NEM…)
  prompts.js        Instrucciones de generación por tipo de documento
  adaptaciones.js   Perfiles de neurodivergencia y desfase edad-grado
  brand.js          Identidad de marca (Manual v1.0) — no aproximar valores
server/             API: cuentas, banco, administración y puente con Anthropic
  db.js             SQLite en local, PostgreSQL con DATABASE_URL
  auth.js           scrypt y sesiones en cookie httpOnly
```

**Cuentas y límites.** El registro crea una solicitud; nadie entra sin
aprobación desde el panel de administración. Cada plan define un tope de
documentos al mes y se cuenta por documento guardado: un libro con ocho
capítulos cuenta como uno solo.

## Despliegue

En local la base de datos es SQLite y no hay nada que configurar. Al publicar,
basta añadir `DATABASE_URL` de Neon o Supabase y el mismo código pasa a
PostgreSQL sin cambios.

> **Aviso sobre Netlify.** Las funciones serverless cortan a los 10 segundos y
> una generación tarda entre 60 y 90. El frontend puede ir en Netlify, pero la
> API necesita un servicio siempre encendido (Render, DigitalOcean) o convertir
> la generación en asíncrona con sondeo.

---

© Playlabi. Los colores, la tipografía y el logotipo proceden del Manual de
Marca v1.0 y no deben modificarse.
