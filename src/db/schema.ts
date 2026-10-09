import {
  pgTable,
  text,
  integer,
  boolean,
  date,
  timestamp,
  uuid,
  bigint,
} from "drizzle-orm/pg-core";

/** Empresa contratista o proveedora que usa el sistema (multi-empresa desde el inicio). */
export const organizations = pgTable("organizations", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  cuit: text("cuit").notNull().unique(),
  /** Departamento de San Juan del domicilio fiscal, o null si está fuera de la provincia. */
  fiscalDepartment: text("fiscal_department"),
  /** Año desde el que la empresa está radicada en San Juan. */
  establishedSince: integer("established_since"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/** Personas en la nómina de la empresa. */
export const employees = pgTable("employees", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  fullName: text("full_name").notNull(),
  cuil: text("cuil").notNull(),
  role: text("role"),
  /** Departamento de San Juan donde reside, o "Otra provincia". */
  department: text("department").notNull(),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/** Compras de bienes y servicios, para medir el porcentaje de compra local. */
export const purchases = pgTable("purchases", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  supplierName: text("supplier_name").notNull(),
  supplierCuit: text("supplier_cuit"),
  /** Proveedor con arraigo en San Juan (inscripto en el registro provincial). */
  supplierIsLocal: boolean("supplier_is_local").notNull(),
  description: text("description"),
  /** Monto en centavos de peso para evitar errores de redondeo. */
  amountCents: bigint("amount_cents", { mode: "number" }).notNull(),
  purchasedOn: date("purchased_on").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/** Documentación con vencimiento (ART, seguros, certificados, habilitaciones). */
export const documents = pgTable("documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  kind: text("kind").notNull(),
  reference: text("reference"),
  expiresOn: date("expires_on"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
