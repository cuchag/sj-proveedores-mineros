/**
 * Aplica las migraciones y, con --seed, carga una empresa de demostración.
 *   npm run db:setup        → solo migraciones
 *   npm run db:seed         → migraciones + datos de ejemplo (borra los datos de demo previos)
 */
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import { migrate as migratePg } from "drizzle-orm/node-postgres/migrator";
import { drizzle as drizzleLite } from "drizzle-orm/pglite";
import { migrate as migrateLite } from "drizzle-orm/pglite/migrator";
import { eq } from "drizzle-orm";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import * as schema from "../src/db/schema";

const DEMO_CUIT = "30-71234567-8";

async function main() {
  const seed = process.argv.includes("--seed");
  const url = process.env.DATABASE_URL;
  const liteDir = process.env.PGLITE_DIR ?? "./.data/pglite";
  if (!url) mkdirSync(dirname(liteDir), { recursive: true });

  const db = url ? drizzlePg(url, { schema }) : drizzleLite(liteDir, { schema });

  if (url) await migratePg(db as ReturnType<typeof drizzlePg>, { migrationsFolder: "./drizzle" });
  else await migrateLite(db as ReturnType<typeof drizzleLite>, { migrationsFolder: "./drizzle" });
  console.log("Migraciones aplicadas.");

  if (seed) {
    const d = db as ReturnType<typeof drizzlePg>;
    await d.delete(schema.organizations).where(eq(schema.organizations.cuit, DEMO_CUIT));
    const [org] = await d
      .insert(schema.organizations)
      .values({
        name: "Montajes Cuyo SRL (demo)",
        cuit: DEMO_CUIT,
        fiscalDepartment: "Rivadavia",
        establishedSince: 2014,
      })
      .returning();

    const people: [string, string, string][] = [
      ["Juan Pérez", "Soldador", "Rawson"],
      ["María Gómez", "Supervisora de seguridad", "Capital"],
      ["Carlos Díaz", "Chofer", "Jáchal"],
      ["Lucía Fernández", "Administrativa", "Rivadavia"],
      ["Pedro Ruiz", "Operario", "Iglesia"],
      ["Sofía Molina", "Técnica eléctrica", "Chimbas"],
      ["Diego Castro", "Operario", "Pocito"],
      ["Andrés López", "Ingeniero", "Otra provincia"],
      ["Martín Sosa", "Operario", "Otra provincia"],
      ["Valeria Ortiz", "Operaria", "Calingasta"],
      ["Raúl Herrera", "Capataz", "Otra provincia"],
      ["Nadia Quiroga", "Pañolera", "Santa Lucía"],
    ];
    await d.insert(schema.employees).values(
      people.map(([fullName, role, department], i) => ({
        organizationId: org.id,
        fullName,
        role,
        department,
        cuil: `20-${30000000 + i * 1111}-${i % 10}`,
      })),
    );

    await d.insert(schema.purchases).values([
      { organizationId: org.id, supplierName: "Ferretería Industrial Sarmiento", supplierIsLocal: true, description: "Insumos de soldadura", amountCents: 4_850_000_00, purchasedOn: "2026-09-03" },
      { organizationId: org.id, supplierName: "Transportes Zonda", supplierIsLocal: true, description: "Traslado de personal", amountCents: 6_200_000_00, purchasedOn: "2026-09-10" },
      { organizationId: org.id, supplierName: "Aceros del Litoral SA", supplierIsLocal: false, description: "Perfiles estructurales", amountCents: 9_700_000_00, purchasedOn: "2026-09-15" },
      { organizationId: org.id, supplierName: "Catering Andino", supplierIsLocal: true, description: "Viandas", amountCents: 2_100_000_00, purchasedOn: "2026-09-22" },
      { organizationId: org.id, supplierName: "EPP Sur Distribuciones", supplierIsLocal: false, description: "Elementos de protección personal", amountCents: 1_300_000_00, purchasedOn: "2026-09-28" },
    ]);

    await d.insert(schema.documents).values([
      { organizationId: org.id, kind: "Constancia de inscripción en ARCA", expiresOn: null },
      { organizationId: org.id, kind: "Inscripción en Rentas San Juan (Ingresos Brutos)", expiresOn: "2027-03-31" },
      { organizationId: org.id, kind: "Certificado de cobertura ART", reference: "Póliza 55-123", expiresOn: "2026-10-25" },
      { organizationId: org.id, kind: "Seguro de responsabilidad civil", reference: "RC 9981", expiresOn: "2026-09-30" },
      { organizationId: org.id, kind: "Formulario 931 (último período)", expiresOn: "2026-11-10" },
      { organizationId: org.id, kind: "Programa de seguridad e higiene", expiresOn: "2027-06-30" },
    ]);
    console.log(`Datos de demo cargados para ${org.name}.`);
  }
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
