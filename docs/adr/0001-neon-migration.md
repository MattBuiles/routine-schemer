# ADR 0001 - Neon (base de datos) y Neon Auth

- **Estado:** Completado (pendiente solo ejercicios)
- **Fecha:** 2026-08-27

## Contexto

Routine Schemer nació con Supabase como proveedor único de Postgres,
autenticación, RLS y sincronización. El objetivo de esta recuperación es
separar esas responsabilidades y conservar el sentido del producto: una
herramienta profesional para diseñar, estructurar y seguir planes de
entrenamiento, no una red social ni un marketplace.

## Decisión

- **Neon Auth** gestiona identidad y sesiones (email y contraseña, y Google).
  Se descartó Clerk.
- **Neon** aloja PostgreSQL.
- **Drizzle** gestiona el esquema y las migraciones nuevas.
- El acceso a datos de Neon es server-only y las consultas reciben el `userId`
  verificado por Neon Auth (`requireUserId()`).
- Realtime no se migra automáticamente: solo se añadirá una solución si una
  funcionalidad concreta demuestra que la necesita.

## Estado

La interfaz y el middleware usan Neon Auth. Todo el acceso a datos pasa por
server actions en `src/app/actions/` (perfil, programas, hábitos, notas y
calendario), con identificadores de usuario de Neon Auth como `text`. Supabase
se retiró del código y de las dependencias; `supabase/` queda solo como
esquema histórico. Las migraciones son SQL escrito a mano en `drizzle/`.
Pendiente: tabla y UI de ejercicios.

## Despliegue

El repositorio contiene artefactos estándar de Next.js y una referencia a
Vercel en el README original, pero GitHub no expone un dominio ni una
configuración de proyecto Vercel. Por tanto, el hosting no está confirmado.
La verificación requiere acceso al panel de Vercel o a la configuración DNS.
