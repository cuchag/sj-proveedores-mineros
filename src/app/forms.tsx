"use client";

import { useActionState, useRef, useEffect, type ReactNode } from "react";
import {
  addDocument,
  addEmployee,
  addPurchase,
  createOrganization,
  type ActionState,
} from "./actions";
import { REQUIRED_DOCUMENTS } from "@/lib/compliance";
import { OUTSIDE_PROVINCE, SAN_JUAN_DEPARTMENTS } from "@/lib/san-juan";

type Action = (prev: ActionState, formData: FormData) => Promise<ActionState>;

function Form({
  action,
  submitLabel,
  children,
}: {
  action: Action;
  submitLabel: string;
  children: ReactNode;
}) {
  const [state, formAction, pending] = useActionState(action, null);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state?.ok) ref.current?.reset();
  }, [state]);
  return (
    <form ref={ref} action={formAction} className="form">
      <div className="form-grid">{children}</div>
      <div className="form-footer">
        <button type="submit" disabled={pending}>
          {pending ? "Guardando…" : submitLabel}
        </button>
        {state && (
          <p role="status" className={state.ok ? "msg ok" : "msg fail"}>
            {state.message}
          </p>
        )}
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}

function DepartmentSelect({ name = "department" }: { name?: string }) {
  return (
    <select name={name} required defaultValue="">
      <option value="" disabled>
        Elegí…
      </option>
      {SAN_JUAN_DEPARTMENTS.map((d) => (
        <option key={d}>{d}</option>
      ))}
      <option>{OUTSIDE_PROVINCE}</option>
    </select>
  );
}

export function OrganizationForm() {
  return (
    <Form action={createOrganization} submitLabel="Crear empresa">
      <Field label="Razón social">
        <input name="name" required placeholder="Montajes Cuyo SRL" />
      </Field>
      <Field label="CUIT">
        <input name="cuit" required placeholder="30-71234567-8" />
      </Field>
      <Field label="Domicilio fiscal">
        <DepartmentSelect name="fiscalDepartment" />
      </Field>
      <Field label="En San Juan desde (año)">
        <input name="establishedSince" type="number" min={1900} max={2100} />
      </Field>
    </Form>
  );
}

export function EmployeeForm({ organizationId }: { organizationId: string }) {
  return (
    <Form action={addEmployee} submitLabel="Agregar a la nómina">
      <input type="hidden" name="organizationId" value={organizationId} />
      <Field label="Nombre y apellido">
        <input name="fullName" required />
      </Field>
      <Field label="CUIL">
        <input name="cuil" required placeholder="20-12345678-9" />
      </Field>
      <Field label="Puesto">
        <input name="role" />
      </Field>
      <Field label="Departamento donde vive">
        <DepartmentSelect />
      </Field>
    </Form>
  );
}

export function PurchaseForm({ organizationId }: { organizationId: string }) {
  return (
    <Form action={addPurchase} submitLabel="Registrar compra">
      <input type="hidden" name="organizationId" value={organizationId} />
      <Field label="Proveedor">
        <input name="supplierName" required />
      </Field>
      <Field label="¿Proveedor local registrado?">
        <select name="supplierIsLocal" required defaultValue="">
          <option value="" disabled>
            Elegí…
          </option>
          <option value="si">Sí, sanjuanino</option>
          <option value="no">No</option>
        </select>
      </Field>
      <Field label="Monto (ARS)">
        <input name="amount" type="number" min="0.01" step="0.01" required />
      </Field>
      <Field label="Fecha">
        <input name="purchasedOn" type="date" required />
      </Field>
      <Field label="Detalle">
        <input name="description" />
      </Field>
    </Form>
  );
}

export function DocumentForm({ organizationId }: { organizationId: string }) {
  return (
    <Form action={addDocument} submitLabel="Cargar documento">
      <input type="hidden" name="organizationId" value={organizationId} />
      <Field label="Documento">
        <select name="kind" required defaultValue="">
          <option value="" disabled>
            Elegí…
          </option>
          {REQUIRED_DOCUMENTS.map((d) => (
            <option key={d}>{d}</option>
          ))}
        </select>
      </Field>
      <Field label="N.º / referencia">
        <input name="reference" />
      </Field>
      <Field label="Vence (vacío si no vence)">
        <input name="expiresOn" type="date" />
      </Field>
    </Form>
  );
}
