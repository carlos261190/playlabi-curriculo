# Línea base de respaldo — Playlabi Currículo

**Creado:** 15 de septiembre de 2026
**Motivo:** respaldo verificable previo a cualquier trabajo sobre Playlabi 2.0.
Corresponde al elemento `BK-01` de la matriz de bloqueadores.

A diferencia de Playlabi Genius, este proyecto **ya tenía control de versiones**
cuando se hizo la revisión: repositorio privado, árbol de trabajo limpio y
sincronizado con el remoto. Su historial se conserva íntegro; no se recreó
ninguna línea base artificial.

Este documento solo añade lo que faltaba: estado de producción e inventario de
dependencias. **No se modificó ningún archivo de código.**

Para cómo ejecutar, construir y desplegar, ver el `README.md`.

---

## Qué está en producción, y dónde

| Componente | Estado | Dónde |
|---|---|---|
| Frontend | `SIN CONFIRMAR` | Previsto en Netlify. No se verificó que haya un despliegue activo |
| API Express | `SIN CONFIRMAR` | Debe ir en un servicio siempre encendido, no en funciones serverless |
| Base de datos | `LOCAL` | SQLite en `datos/curriculo.db`. En producción requiere `DATABASE_URL` de Neon o Supabase |
| Correo (Resend) | `OPCIONAL` | Sin `RESEND_API_KEY` la aplicación funciona; los avisos quedan solo en el panel |

**Nada de esto pudo verificarse desde el código.** Determinar si hay despliegue
activo, en qué proveedor y con qué dominio es el elemento `LO-04` de la matriz.

### Restricción de despliegue conocida

Las funciones serverless de Netlify cortan a los 10 segundos y una generación
tarda entre 60 y 90. El frontend puede ir en Netlify, pero la API necesita un
servicio siempre encendido (Render, DigitalOcean) o convertir la generación en
asíncrona con sondeo. Playlabi Genius tiene exactamente la misma restricción.

---

## Inventario de dependencias

### Producción

| Paquete | Versión declarada | Para qué |
|---|---|---|
| `express` | ^4.19.2 | Servidor de la API |
| `dotenv` | ^16.4.5 | Carga del `.env` |
| `qrcode` | ^1.5.4 | Generación de QR **reales y decodificables** |
| `react` | ^18.3.1 | Interfaz |
| `react-dom` | ^18.3.1 | Interfaz |

### Desarrollo

| Paquete | Versión declarada | Para qué |
|---|---|---|
| `vite` | ^5.4.2 | Servidor de desarrollo y construcción |
| `@vitejs/plugin-react` | ^4.3.1 | Soporte de React en Vite |
| `concurrently` | ^9.0.1 | Levanta Vite y el servidor a la vez |

### Módulos nativos de Node (sin paquete)

`node:sqlite` (base de datos local), `node:crypto` (scrypt y sesiones),
`node:fs`, `node:path`.

> **`node:sqlite` fija el mínimo de Node.** Está disponible a partir de Node 22.5.
> El `package.json` no declara `engines`, así que nada impide instalar el
> proyecto en una versión de Node donde no arrancará.

### Defecto conocido en las dependencias

**`pg` no está declarado en `package.json` y no está instalado**, pero
`server/db.js:30` lo importa dinámicamente cuando existe `DATABASE_URL`.

Consecuencia: en local con SQLite nunca se ejecuta esa rama y todo funciona.
**En producción con PostgreSQL fallaría al arrancar** con `MODULE_NOT_FOUND`.
Esto contradice la afirmación del `README.md` de que «el mismo código pasa a
PostgreSQL sin cambios»: hace falta además instalar `pg`.

**No se ha corregido aquí.** Este documento es un inventario, no un arreglo.

---

## Superficie de la API

Servidor en `server/index.js` más un router en `server/api.js`.

| Grupo | Rutas |
|---|---|
| Salud | `GET /api/health` |
| Puente con IA | `POST /api/claude` — **exige sesión aprobada** |
| Cuentas | `POST /auth/registro`, `/auth/entrar`, `/auth/salir` · `GET /auth/yo` |
| Documentos | `GET`/`POST` `/documentos` · `GET`/`PUT`/`DELETE` `/documentos/:id` · `POST /documentos/:id/compartir` |
| Público | `GET /publico/:codigo` |
| Administración | `GET /admin/resumen`, `/admin/usuarios` · `POST /admin/usuarios/:id/estado`, `/admin/usuarios/:id/plan` |
| Planes | `GET /planes`, `/admin/planes` · `POST`/`PUT`/`DELETE` `/admin/planes` |

La guarda de sesión sobre `/api/claude` es deliberada: sin ella, cualquiera que
alcanzase el endpoint podría gastar la clave de Anthropic. **Playlabi Genius no
tiene esa guarda** — al reutilizar código entre ambos, no perderla.

### Servicios externos

- **Anthropic** — `api.anthropic.com/v1/messages`, modelo `claude-sonnet-4-6`
- **Resend** — `api.resend.com/emails` (opcional)

---

## Qué se excluyó del repositorio, y por qué

| Excluido | Motivo |
|---|---|
| `.env` | Contiene `ANTHROPIC_API_KEY` y la contraseña del administrador |
| `datos/` | Base de datos SQLite con **cuentas y documentos de usuarios reales** |
| `node_modules/` | Reproducible con `npm install` |
| `dist/` | Artefacto de construcción |

Se verificó con un barrido de patrones de secretos sobre todos los archivos
publicados **y sobre el historial completo**: sin coincidencias. La única
alerta fue `# DATABASE_URL=postgres://usuario:clave@host/base` en
`.env.example`, que es un marcador de posición, no una credencial.

La exclusión de `datos/` importa especialmente: contiene datos personales de
usuarios registrados. No debe subirse a ningún repositorio.
