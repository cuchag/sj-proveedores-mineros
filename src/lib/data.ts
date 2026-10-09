import "server-only";
import { connection } from "next/server";
import { asc, desc, eq } from "drizzle-orm";
import { db, schema } from "@/db";

/**
 * Empresa activa. En esta etapa cada instalación atiende a una empresa;
 * el modelo ya es multi-empresa para sumar login y varias empresas después.
 */
export async function getCurrentOrganization() {
  await connection();
  const [org] = await db
    .select()
    .from(schema.organizations)
    .orderBy(asc(schema.organizations.createdAt))
    .limit(1);
  return org ?? null;
}

export async function getOrganizationData(organizationId: string) {
  const [employees, purchases, documents] = await Promise.all([
    db
      .select()
      .from(schema.employees)
      .where(eq(schema.employees.organizationId, organizationId))
      .orderBy(asc(schema.employees.fullName)),
    db
      .select()
      .from(schema.purchases)
      .where(eq(schema.purchases.organizationId, organizationId))
      .orderBy(desc(schema.purchases.purchasedOn)),
    db
      .select()
      .from(schema.documents)
      .where(eq(schema.documents.organizationId, organizationId))
      .orderBy(asc(schema.documents.kind)),
  ]);
  return { employees, purchases, documents };
}
