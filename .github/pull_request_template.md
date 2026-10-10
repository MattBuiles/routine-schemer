## Resumen

<!-- Qué cambia y por qué. El título del PR pasa a ser el mensaje del commit al hacer squash. -->

## Cambios

-

## Cómo probarlo

<!-- Pasos o comandos. Si hay migraciones, indícalo. -->

## Checklist

- [ ] `pnpm lint`, `pnpm typecheck`, `pnpm test` y `pnpm build` pasan
- [ ] Los cambios con lógica tienen tests
- [ ] Si toca datos, la acción filtra por el `userId` de la sesión
- [ ] Si añade tablas, hay un nuevo `drizzle/NNNN_*.sql` y se actualizó `src/db/schema.ts`
- [ ] Sin secretos ni archivos `.env*` en el diff
