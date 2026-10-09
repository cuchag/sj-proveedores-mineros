"use server";

import { refresh } from "next/cache";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "@/db";
import { REQUIRED_DOCUMENTS } from "@/lib/compliance";
import { OUTSIDE_PROVINCE, SAN_JUAN_DEPARTMENTS } from "@/lib/san-juan";

export type ActionState = { ok: boolean; message: string } | null;

const departments = [...SAN_JUAN_DEPARTMENTS, OUTSIDE_PROVINCE] as [string, ...string[]];
const cuitLike = z
  .string()
  .trim()
  .regex(/^\d{2}-?\d{8}-?\d$/, "Formato esperado: 20-12345678-9");

const organizationSchema = z.object({
  name: z.string().trim().min(2, "Ingresá el nombre de la empresa"),
  cuit: cuitLike,
  fiscalDepartment: z.enum(departments),
  establishedSince: z.coerce.number().int().min(1900).max(2100).optional(),
});

const employeeSchema = z.object({
  organizationId: z.uuid(),
  fullName: z.string().trim().min(2, "Ingresá nombre y apellido"),
  cuil: cuitLike,
  role: z.string().trim().max(80).optional(),
  department: z.enum(departments),
});

const purchaseSchema = z.object({
  organizationId: z.uuid(),
  supplierName: z.string().trim().min(2, "Ingresá el proveedor"),
  supplierIsLocal: z.enum(["si", "no"]),
  description: z.string().trim().max(120).optional(),
  amount: z.coerce.number().positive("El monto debe ser mayor a cero"),
  purchasedOn: z.iso.date("Fecha inválida"),
});

const documentSchema = z.object({
  organizationId: z.uuid(),
  kind: z.enum(REQUIRED_DOCUMENTS as unknown as [string, ...string[]]),
  reference: z.string().trim().max(80).optional(),
  expiresOn: z.union([z.iso.date(), z.literal("")]).optional(),
});

function fields(formData: FormData) {
  const out: Record<string, string> = {};
  for (const [k, v] of formData.entries()) {
    if (typeof v === "string" && !k.startsWith("$ACTION")) {
      if (v.trim() !== "") out[k] = v;
    }
  }
  return out;
}

function firstError(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Revisá los datos ingresados";
}

export async function createOrganization(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = organizationSchema.safeParse(fields(formData));
  if (!parsed.success) return { ok: false, message: firstError(parsed.error) };
  const fiscalDepartment =
    parsed.data.fiscalDepartment === OUTSIDE_PROVINCE ? null : parsed.data.fiscalDepartment;
  try {
    await db.insert(schema.organizations).values({ ...parsed.data, fiscalDepartment });
  } catch {
    return { ok: false, message: "Ya existe una empresa con ese CUIT" };
  }
  refresh();
  return { ok: true, message: "Empresa creada" };
}

export async function addEmployee(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = employeeSchema.safeParse(fields(formData));
  if (!parsed.success) return { ok: false, message: firstError(parsed.error) };
  await db.insert(schema.employees).values(parsed.data);
  refresh();
  return { ok: true, message: `${parsed.data.fullName} agregado a la nómina` };
}

export async function toggleEmployee(organizationId: string, id: string, active: boolean) {
  await db
    .update(schema.employees)
    .set({ active })
    .where(
      and(eq(schema.employees.id, id), eq(schema.employees.organizationId, organizationId)),
    );
  refresh();
}

export async function addPurchase(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = purchaseSchema.safeParse(fields(formData));
  if (!parsed.success) return { ok: false, message: firstError(parsed.error) };
  const { amount, supplierIsLocal, ...rest } = parsed.data;
  await db.insert(schema.purchases).values({
    ...rest,
    supplierIsLocal: supplierIsLocal === "si",
    amountCents: Math.round(amount * 100),
  });
  refresh();
  return { ok: true, message: "Compra registrada" };
}

export async function addDocument(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = documentSchema.safeParse(fields(formData));
  if (!parsed.success) return { ok: false, message: firstError(parsed.error) };
  const { expiresOn, ...rest } = parsed.data;
  await db.insert(schema.documents).values({ ...rest, expiresOn: expiresOn || null });
  refresh();
  return { ok: true, message: "Documento cargado" };
}
