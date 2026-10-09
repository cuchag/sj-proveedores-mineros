import { describe, expect, it } from "vitest";
import {
  documentStatus,
  documentsSummary,
  localGap,
  purchasesSummary,
  REQUIRED_DOCUMENTS,
  workforceSummary,
} from "./compliance";

describe("workforceSummary", () => {
  it("cuenta como local solo a quien vive en un departamento de San Juan", () => {
    const r = workforceSummary([
      { department: "Capital", active: true },
      { department: "Iglesia", active: true },
      { department: "Otra provincia", active: true },
      { department: "Otra provincia", active: false },
    ]);
    expect(r.total).toBe(3);
    expect(r.local).toBe(2);
    expect(r.community).toBe(1);
    expect(r.localPct).toBe(66.7);
    expect(r.status).toBe("fail");
  });

  it("aprueba con 80% o más", () => {
    const list = [
      ...Array(8).fill({ department: "Rawson", active: true }),
      ...Array(2).fill({ department: "Otra provincia", active: true }),
    ];
    expect(workforceSummary(list).status).toBe("ok");
  });
});

describe("localGap", () => {
  it("calcula cuántos locales hay que sumar para llegar al mínimo", () => {
    // 6 de 10 locales; con 10 locales más: 16/20 = 80%
    expect(localGap(6, 10, 80)).toBe(10);
    expect(localGap(8, 10, 80)).toBe(0);
  });
});

describe("purchasesSummary", () => {
  it("mide por monto, no por cantidad de compras", () => {
    const r = purchasesSummary([
      { amountCents: 70_000, supplierIsLocal: true },
      { amountCents: 30_000, supplierIsLocal: false },
      { amountCents: 0, supplierIsLocal: false },
    ]);
    expect(r.localPct).toBe(70);
    expect(r.status).toBe("ok");
  });
});

describe("documentos", () => {
  const today = new Date(2026, 9, 9);
  it("marca vencido, por vencer y vigente", () => {
    expect(documentStatus("2026-10-01", today)).toBe("fail");
    expect(documentStatus("2026-10-20", today)).toBe("warning");
    expect(documentStatus("2027-01-01", today)).toBe("ok");
    expect(documentStatus(null, today)).toBe("ok");
  });

  it("un documento faltante hace fallar el resumen", () => {
    const r = documentsSummary([], today);
    expect(r.items).toHaveLength(REQUIRED_DOCUMENTS.length);
    expect(r.status).toBe("fail");
  });
});
