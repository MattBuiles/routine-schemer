# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Next.js 15 (App Router) + React 19 + Tailwind 4 + Zustand. Documentación del producto en español (`README.md`).

## Comandos
Gestor: pnpm (`package-lock.json` está obsoleto; ignorarlo).
- `pnpm dev` (turbopack), `pnpm build`, `pnpm lint`, `pnpm typecheck`
- `pnpm db:generate` (drizzle-kit, lee `DATABASE_URL` de `.env.local`)
- `pnpm db:migrate` ejecuta `scripts/migrate.ts`: aplica en orden los `drizzle/*.sql` pendientes (registro en la tabla `_app_migrations`). Lee `DATABASE_URL` del entorno, no de `.env.local`: `pnpm exec tsx --env-file=.env.local scripts/migrate.ts`. Las migraciones son SQL escrito a mano (no hay `drizzle/meta`), así que `db:generate` no es la vía; al añadir tablas, actualizar `src/db/schema.ts` y crear el siguiente `.sql`.
- No hay tests ni CI.

## Arquitectura: Neon (DB) + Neon Auth (migrada desde Supabase)
Proveedor de auth vigente: **Neon Auth** (`@neondatabase/auth`; `src/lib/auth/{client,server}.ts`, `src/middleware.ts`, `src/app/api/auth/[...path]`, `NeonAuthUIProvider` en `src/app/providers.tsx`; vistas de login en `/` y el resto en `src/app/auth/[path]/page.tsx`). Variables requeridas: `DATABASE_URL`, `NEON_AUTH_BASE_URL`, `NEON_AUTH_COOKIE_SECRET` (`serverEnv()` falla con 500 si falta alguna). Clerk es residuo de un plan anterior (README y ADR 0001 están desactualizados); no usarlo.
- **DB:** Neon + Drizzle. `src/db/schema.ts` (14 tablas: perfil, metas, programas y sus sesiones/splits/mesociclos/reglas, hábitos, registros de hábitos, notas y eventos de calendario) y `src/db/client.ts` (server-only, driver HTTP: sin transacciones interactivas, usar `db.batch` y generar los UUID en código). Todo el acceso va por server actions en `src/app/actions/{profile,programs,habits,notes,calendar}.ts`, que sacan el `userId` con `requireUserId()` (`src/lib/auth/session.ts`) (nunca del cliente) y filtran por él: no hay RLS efectivo que lo respalde.
- **Pendiente:** tabla y UI de ejercicios (hoy los ejercicios de una sesión son texto libre; `lib/exerciseService.ts` es una API externa sin usar). `routine/WorkoutCalendar.tsx` y `lib/exerciseService.ts` no los importa nadie.
- `drizzle/0000` activa `FORCE ROW LEVEL SECURITY` sin políticas en las 3 primeras tablas; funciona porque el rol `neondb_owner` tiene BYPASSRLS (comprobado). Con otro rol, las consultas no verían filas.

## Estructura
- `src/app/` rutas (`page.tsx` es el dashboard; navegación por vistas, ver `src/config/viewConfig.ts` y `useRoutineNavigation`) y `api/`.
- `src/components/{routine,planner,auth,ui}`; estilos CSS por módulo en `src/styles/`.

## Reglas
- Nunca leer ni editar `.env*`. No ejecutar `db:migrate` contra datos reales sin autorización.
- Sin dependencias, abstracciones ni documentación nuevas salvo que la tarea lo pida.

## Terminado cuando
`typecheck` y `lint` pasan.
