import { INFLUENCE_AREA_DEPARTMENTS, isSanJuanDepartment } from "./san-juan";

/**
 * Reglas de la Ley de Desarrollo Local Minero de San Juan (2026), tal como fueron
 * publicadas en prensa. Validar contra el texto reglamentado antes de vender.
 */
export const RULES = {
  /** Porcentaje mínimo de la nómina que debe residir en San Juan. */
  minLocalWorkforcePct: 80,
  /** Porcentaje mínimo del monto de compras que debe ir a proveedores locales. */
  minLocalPurchasesPct: 60,
  /** Días antes del vencimiento en que un documento pasa a "por vencer". */
  expiryWarningDays: 30,
} as const;

/** Documentación que suele pedir una minera a sus contratistas. Configurable. */
export const REQUIRED_DOCUMENTS = [
  "Constancia de inscripción en ARCA",
  "Inscripción en Rentas San Juan (Ingresos Brutos)",
  "Certificado de cobertura ART",
  "Seguro de responsabilidad civil",
  "Formulario 931 (último período)",
  "Inscripción en el registro provincial de proveedores mineros",
  "Programa de seguridad e higiene",
] as const;

export type Status = "ok" | "warning" | "fail";

export function pct(part: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((part / total) * 1000) / 10;
}

export function workforceSummary(employees: { department: string; active: boolean }[]) {
  const active = employees.filter((e) => e.active);
  const local = active.filter((e) => isSanJuanDepartment(e.department));
  const community = local.filter((e) =>
    INFLUENCE_AREA_DEPARTMENTS.includes(e.department),
  );
  const localPct = pct(local.length, active.length);
  return {
    total: active.length,
    local: local.length,
    community: community.length,
    localPct,
    communityPct: pct(community.length, active.length),
    /** Cuántas personas locales más harían falta para llegar al mínimo. */
    localNeeded: localGap(local.length, active.length, RULES.minLocalWorkforcePct),
    status: thresholdStatus(localPct, RULES.minLocalWorkforcePct, active.length),
  };
}

export function purchasesSummary(
  purchases: { amountCents: number; supplierIsLocal: boolean }[],
) {
  const totalCents = purchases.reduce((s, p) => s + p.amountCents, 0);
  const localCents = purchases
    .filter((p) => p.supplierIsLocal)
    .reduce((s, p) => s + p.amountCents, 0);
  const localPct = pct(localCents, totalCents);
  return {
    totalCents,
    localCents,
    localPct,
    status: thresholdStatus(localPct, RULES.minLocalPurchasesPct, purchases.length),
  };
}

export function documentStatus(expiresOn: string | null, today: Date): Status {
  if (!expiresOn) return "ok";
  const exp = new Date(`${expiresOn}T00:00:00`);
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const days = Math.round((exp.getTime() - start.getTime()) / 86_400_000);
  if (days < 0) return "fail";
  if (days <= RULES.expiryWarningDays) return "warning";
  return "ok";
}

export function documentsSummary(
  docs: { kind: string; expiresOn: string | null }[],
  today: Date,
) {
  const items = REQUIRED_DOCUMENTS.map((kind) => {
    const matches = docs.filter((d) => d.kind === kind);
    // Si hay varias versiones, vale la de vencimiento más lejano.
    const best = matches.sort((a, b) =>
      (b.expiresOn ?? "9999").localeCompare(a.expiresOn ?? "9999"),
    )[0];
    const status: Status = best ? documentStatus(best.expiresOn, today) : "fail";
    return { kind, present: Boolean(best), expiresOn: best?.expiresOn ?? null, status };
  });
  const worst: Status = items.some((i) => i.status === "fail")
    ? "fail"
    : items.some((i) => i.status === "warning")
      ? "warning"
      : "ok";
  return { items, status: worst };
}

function thresholdStatus(value: number, min: number, count: number): Status {
  if (count === 0) return "warning";
  if (value >= min) return "ok";
  if (value >= min - 5) return "warning";
  return "fail";
}

/** Personas locales adicionales necesarias para alcanzar `minPct` (contratando locales). */
export function localGap(local: number, total: number, minPct: number): number {
  if (total === 0) return 0;
  // (local + x) / (total + x) >= min/100  →  x >= (min*total - 100*local) / (100 - min)
  const x = Math.ceil((minPct * total - 100 * local) / (100 - minPct));
  return Math.max(0, x);
}

export function formatArs(cents: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}
