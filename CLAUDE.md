# Instrucciones para Claude y otros agentes

@AGENTS.md

## Producto

Panel de cumplimiento de la Ley de Desarrollo Local Minero de San Juan (Argentina) para contratistas mineros. Usuarios: administrativos y responsables de RR. HH. de pymes sanjuaninas. Idioma de la interfaz: español rioplatense.

## Stack

Next.js (App Router, Cache Components) · TypeScript · Drizzle ORM sobre Postgres (PGlite en desarrollo) · Zod · Vitest.

Esta versión de Next.js trae cambios respecto de lo conocido: antes de usar una API de Next, leé la guía en `node_modules/next/dist/docs/`. En particular:
- Los datos dinámicos van en componentes dentro de `<Suspense>` y llaman a `connection()` (ver `src/lib/data.ts`).
- Las acciones del servidor llaman a `refresh()` de `next/cache` para actualizar la pantalla.

## Comandos

- `npm run check` antes de cada commit (typecheck + lint + tests).
- `npm run build` para confirmar que compila.
- Cambios de base: editar `src/db/schema.ts`, luego `npm run db:generate`, revisar el SQL en `drizzle/` y `npm run db:setup`.

## Reglas del dominio

- Toda regla de la ley vive en `src/lib/compliance.ts` (`RULES`, `REQUIRED_DOCUMENTS`). No dupliques umbrales en la interfaz.
- Cada cambio de regla lleva su test en `src/lib/compliance.test.ts`.
- Montos en centavos (`amountCents`), nunca en flotantes.
- Fechas de negocio como `date` (AAAA-MM-DD), mostradas como DD/MM/AAAA.

## Convenciones

- Validar toda entrada del usuario con Zod en `src/app/actions.ts`.
- Toda consulta filtra por `organizationId`.
- Mensajes al usuario en español, cortos y concretos.
- Commits en español, en imperativo ("Agregar…", "Corregir…").
