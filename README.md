# Routine Schemer

Lienzo interactivo para diseñar ciclos de entrenamiento a alto nivel: defines cuántos días dura el ciclo, arrastras bloques (enfoques como Fuerza, Hipertrofia o Descanso), ajustas su ancho, carga, zonas, icono y notas, y colocas alrededor widgets de Hábitos, Notas y Calendario. Todo se guarda por usuario.

Next.js 15 (App Router) · React 19 · Tailwind 4 · [strata](https://github.com/MattBuiles/strata-ui) (sistema de diseño) · Neon (Postgres + Drizzle) · Neon Auth.

## Uso
- **Zoom y desplazamiento:** Ctrl + rueda o pellizco para el zoom, rueda o arrastrar el fondo para moverte.
- **Ciclo:** botones +/− junto a la zona para añadir o quitar días; arrastra un enfoque de la paleta a un día (o doble clic en un hueco); mueve y redimensiona los bloques (ancho = días, alto = carga).
- **Panel del bloque:** enfoque, nombre, zonas, carga, color, icono y notas; «Guardar como enfoque» crea los tuyos.
- **Widgets:** los tres botones de la barra superior añaden o quitan Hábitos, Notas y Calendario.
- **Deshacer / rehacer:** Ctrl+Z y Ctrl+Shift+Z. Autoguardado.

## Desarrollo
Requisitos: Node 22+, pnpm 10+, un proyecto de Neon con Neon Auth activado.

```bash
pnpm install
# copia el fichero de variables de ejemplo a .env.local y rellena:
#   DATABASE_URL, NEON_AUTH_BASE_URL, NEON_AUTH_COOKIE_SECRET (≥ 32 caracteres)
pnpm exec tsx --env-file=.env.local scripts/migrate.ts   # aplica drizzle/*.sql pendientes
pnpm dev
```

| Comando | Qué hace |
|---|---|
| `pnpm dev` / `pnpm build` | servidor de desarrollo / build de producción |
| `pnpm typecheck` / `pnpm lint` / `pnpm test` | comprobaciones (también corren en CI) |

## Contribuir
Todo cambio va en una rama (`feat/`, `fix/`, `chore/`, `docs/`) y llega a `main` por PR con *Squash and merge*; el check `ci` debe estar en verde. Detalles en [CONTRIBUTING.md](CONTRIBUTING.md). Arquitectura y convenciones en [CLAUDE.md](CLAUDE.md).

`supabase/` conserva el esquema histórico anterior a Neon, solo como referencia.
