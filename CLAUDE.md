# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Next.js 15 (App Router) + React 19 + Tailwind 4 + strata. Documentación del producto en español (`README.md`).

## Comandos
Gestor: pnpm (`package-lock.json` está obsoleto; ignorarlo).
- `pnpm dev` (turbopack), `pnpm build`, `pnpm lint`, `pnpm typecheck`, `pnpm test` (Vitest; un archivo: `pnpm exec vitest run src/lib/utils.test.ts`)
- `pnpm db:generate` (drizzle-kit, lee `DATABASE_URL` de `.env.local`)
- `pnpm db:migrate` ejecuta `scripts/migrate.ts`: aplica en orden los `drizzle/*.sql` pendientes (registro en la tabla `_app_migrations`). Lee `DATABASE_URL` del entorno, no de `.env.local`: `pnpm exec tsx --env-file=.env.local scripts/migrate.ts`. Las migraciones son SQL escrito a mano (no hay `drizzle/meta`), así que `db:generate` no es la vía; al añadir tablas, actualizar `src/db/schema.ts` y crear el siguiente `.sql`.
- Tests `*.test.ts` junto al código (utilidades, validación de entorno, acciones con la BD simulada). CI en `.github/workflows/ci.yml` (`ci`: lint, typecheck, test, build). `main` solo admite PRs con Squash and merge.
- Las server actions de escritura nunca vuelcan la entrada del cliente a la BD: usar `pick()` con una lista de columnas (`src/lib/pick.ts`) y tomar el `userId` de `requireUserId()`.

## Arquitectura: Neon (DB) + Neon Auth + lienzo de bloques
Proveedor de auth: **Neon Auth** (`@neondatabase/auth`; `src/lib/auth/{client,server}.ts`, `src/middleware.ts`, `src/app/api/auth/[...path]`, `NeonAuthUIProvider` en `src/app/providers.tsx`; login en `/` y el resto en `src/app/auth/[path]/page.tsx`). Variables requeridas: `DATABASE_URL`, `NEON_AUTH_BASE_URL`, `NEON_AUTH_COOKIE_SECRET` (`serverEnv()` falla con 500 si falta alguna). El ADR 0001 describe la migración y está parcialmente desactualizado (menciona Clerk, que no se usa).
- **App:** `/` es un lienzo (`src/components/canvas/BoardEngine.tsx`) con zoom/pan, la zona del ciclo de N días (`CycleZone`, bloques con enfoque, zonas, carga, icono y notas) y widgets de Hábitos, Notas y Calendario (`canvas/widgets/`). Lógica pura y testeable en `src/lib/board/` (`geometry`, `cycle`, `history`, `sanitize`, `widgets`); `/board` solo redirige a `/`.
- **DB:** Neon + Drizzle. `src/db/schema.ts` y `src/db/client.ts` (server-only, driver HTTP: sin transacciones interactivas, usar `db.batch` y generar los UUID en código). Tablas vivas: `boards`, `board_blocks` (`kind` = `cycle` | `widget`), `block_types`, `habits`, `habit_records`, `notes`, `calendar_events`. Las tablas de programas y de perfil se retiraron en la migración `0007` (estaban vacías). Todo el acceso va por server actions en `src/app/actions/{board,habits,notes,calendar}.ts`, que sacan el `userId` con `requireUserId()` (nunca del cliente), filtran por él y normalizan la entrada del cliente (`sanitizeCycle`, `sanitizeWidgets`, `pick`): no hay RLS efectivo que lo respalde.
- `drizzle/0000` activa `FORCE ROW LEVEL SECURITY` sin políticas en las 3 primeras tablas; funciona porque el rol `neondb_owner` tiene BYPASSRLS (comprobado). Con otro rol, las consultas no verían filas.
- El script de migraciones separa las sentencias por `;`: no usar `;` dentro de los comentarios de los `.sql`.
- **UI:** sistema de diseño `strata` (repo `MattBuiles/strata-ui`, dependencia git; tokens `bg-bg/surface/border-border/text-fg/text-muted/bg-accent`, componentes `Button`, `Input`, `Field`, `Modal`, `useToast`, `useConfirm`…). Código nuevo usa strata, no colores sueltos de Tailwind. Los estilos de `auth-ui` se importan en la capa `base` desde `globals.css` (sin capa pisan las utilidades de padding y margen).
- **Pendiente:** biblioteca de ejercicios y ejercicios por bloque; mesociclos y progresión.

## Estructura
- `src/app/` rutas y `api/`; `src/components/{auth,canvas}`; `src/lib/{auth,board}`; `src/types/index.ts` (hábitos, notas, calendario).

## Reglas
- Nunca leer ni editar `.env*`. No ejecutar `db:migrate` contra datos reales sin autorización.
- Sin dependencias, abstracciones ni documentación nuevas salvo que la tarea lo pida.

## Terminado cuando
`typecheck`, `lint` y `test` pasan.
