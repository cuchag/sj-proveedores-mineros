# sj-proveedores-mineros

Panel de cumplimiento de la **Ley de Desarrollo Local Minero de San Juan** para contratistas y proveedores de la minería.

Muestra, para una empresa:

- **Mano de obra sanjuanina:** porcentaje de la nómina que vive en San Juan contra el mínimo del 80%, y cuántas contrataciones locales faltan para llegar.
- **Compras a proveedores locales:** porcentaje del monto comprado a proveedores sanjuaninos contra el mínimo del 60%.
- **Documentación:** semáforo de vencimientos (ARCA, Rentas, ART, seguro RC, F.931, registro provincial, seguridad e higiene).

## Estado

| Etapa | Qué hay |
| --- | --- |
| Prototipo v0 | `prototipo-v0/index.html`: HTML único, datos en el navegador. Para probarlo en red local o por Tailscale: `python -m http.server 8080 --bind 0.0.0.0` dentro de `prototipo-v0/`. |
| Prototipo funcional (actual) | App Next.js con base Postgres, carga de nómina, compras y documentos, y reglas de la ley testeadas. Una empresa por instalación. |
| Producción (siguiente) | Login, varias empresas por cuenta, subida de PDFs, avisos de vencimiento por mail/WhatsApp, deploy. |

## Requisitos

- Node.js 20.9 o superior.
- Nada más para desarrollo: la base de datos es un Postgres embebido (PGlite) que se guarda en `./.data`.

## Empezar

```bash
npm install
cp .env.example .env.local   # opcional en desarrollo
npm run db:seed              # crea las tablas y carga una empresa de demostración
npm run dev                  # http://localhost:3000
```

Para empezar sin datos de demo, usá `npm run db:setup` en lugar de `db:seed`: la app te pide cargar tu empresa.

## Scripts

| Script | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Compilación de producción |
| `npm start` | Sirve la compilación de producción |
| `npm test` | Tests de las reglas de cumplimiento (Vitest) |
| `npm run lint` / `npm run typecheck` | Calidad de código |
| `npm run check` | Typecheck + lint + tests juntos |
| `npm run db:generate` | Genera una migración SQL después de cambiar `src/db/schema.ts` |
| `npm run db:setup` / `npm run db:seed` | Aplica migraciones (y carga demo) |

## Estructura

```
src/
  app/            Pantalla (page.tsx), formularios (forms.tsx) y acciones del servidor (actions.ts)
  db/             Esquema de la base (schema.ts) y conexión (index.ts)
  lib/
    compliance.ts Reglas de la ley: porcentajes, umbrales, documentos requeridos
    san-juan.ts   Departamentos de San Juan y área de influencia minera
    data.ts       Consultas a la base
drizzle/          Migraciones SQL
scripts/          Setup de base y datos de demo
prototipo-v0/     Primer prototipo en HTML
```

## Producción

Definí `DATABASE_URL` con un Postgres real (por ejemplo Supabase o Neon), corré `npm run db:setup` una vez y desplegá (por ejemplo en Vercel). El mismo código funciona con PGlite o con Postgres.

## Próximos pasos

1. Validar la lista de documentos con 10 contratistas mineros (entrevistas).
2. Login y varias empresas por cuenta.
3. Subida de PDFs y avisos de vencimiento por mail/WhatsApp.

## Fuente de las reglas

Porcentajes según la Ley de Desarrollo Local Minero aprobada por San Juan en 2026, tal como se publicó en prensa (Ámbito, 7/7/2026). **Validar contra el texto reglamentado antes de vender.** Los valores están centralizados en `src/lib/compliance.ts`.
