# Contribuir a Routine Schemer

## Puesta en marcha

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Para trabajar con Neon, define `DATABASE_URL` y ejecuta `pnpm db:migrate`. Neon Auth
requiere `NEON_AUTH_BASE_URL` y `NEON_AUTH_COOKIE_SECRET` (mínimo 32
caracteres); ninguna clave debe entrar al cliente ni al repositorio.

## Flujo

`main` está protegida: no se hace push directo, todo entra por Pull Request y se
integra con **Squash and merge** (es el único método habilitado).

1. Crea una rama desde `main` actualizada: `feat/…`, `fix/…`, `chore/…` o `docs/…`.
2. Mantén los cambios acotados a una responsabilidad.
3. Ejecuta `pnpm lint`, `pnpm typecheck`, `pnpm test` y `pnpm build` antes de abrir el PR.
   Si cambias lógica, añade o actualiza sus tests (`*.test.ts` junto al código, con Vitest).
4. Abre el PR contra `main`. Su **título** será el mensaje del commit en `main`
   (por ejemplo `feat: registrar sesiones de entrenamiento`), así que escríbelo
   como tal; la descripción pasa a ser el cuerpo del commit.
5. El check `ci` (lint, typecheck, test y build) debe estar en verde para fusionar.
6. Haz *Squash and merge*. La rama se borra sola al fusionar.
7. No uses `npm` ni `yarn`.

## Datos y seguridad

El acceso a Neon ocurre exclusivamente desde módulos server-side. Las rutas y
acciones deben obtener el usuario con `requireUserId()` y aplicar su `userId` en la consulta;
no se acepta identidad desde parámetros confiados del navegador.

La carpeta `supabase/` conserva el esquema histórico durante la migración y no
es la fuente para nuevas tablas. Las nuevas migraciones viven en `drizzle/`.

## Estado de la migración

La migración a Neon y Neon Auth está completa salvo la biblioteca de
ejercicios. Supabase ya no es una dependencia.
