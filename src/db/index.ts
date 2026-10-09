import "server-only";
import { drizzle as drizzlePg, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { drizzle as drizzleLite } from "drizzle-orm/pglite";
import { mkdirSync } from "node:fs";
import * as schema from "./schema";

/**
 * Base de datos:
 * - Producción: Postgres real, definido por la variable DATABASE_URL.
 * - Desarrollo / prototipo: Postgres embebido (PGlite) guardado en ./.data,
 *   sin instalar nada. Mismo dialecto, así el código no cambia al pasar a producción.
 */
export type Db = NodePgDatabase<typeof schema>;

function createDb(): Db {
  if (process.env.DATABASE_URL) {
    return drizzlePg(process.env.DATABASE_URL, { schema });
  }
  const dir = process.env.PGLITE_DIR ?? "./.data/pglite";
  mkdirSync(dir, { recursive: true });
  // PGlite expone la misma API de consultas de Postgres que node-postgres.
  return drizzleLite(dir, {
    schema,
  }) as unknown as Db;
}

const globalForDb = globalThis as unknown as { __db?: Db };

export const db: Db = globalForDb.__db ?? createDb();
if (process.env.NODE_ENV !== "production") globalForDb.__db = db;

export { schema };
