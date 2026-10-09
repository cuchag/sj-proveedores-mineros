import { Suspense } from "react";
import {
  documentsSummary,
  formatArs,
  purchasesSummary,
  RULES,
  workforceSummary,
  type Status,
} from "@/lib/compliance";
import { isSanJuanDepartment } from "@/lib/san-juan";
import { getCurrentOrganization, getOrganizationData } from "@/lib/data";
import { toggleEmployee } from "./actions";
import { DocumentForm, EmployeeForm, OrganizationForm, PurchaseForm } from "./forms";

const STATUS_LABEL: Record<Status, string> = {
  ok: "Cumple",
  warning: "Atención",
  fail: "No cumple",
};

export default function Page() {
  return (
    <main className="page">
      <header className="top">
        <p className="eyebrow">Ley de Desarrollo Local Minero · San Juan</p>
        <h1>Panel de cumplimiento</h1>
      </header>
      <Suspense fallback={<p className="muted">Cargando datos…</p>}>
        <Dashboard />
      </Suspense>
    </main>
  );
}

async function Dashboard() {
  const org = await getCurrentOrganization();
  if (!org) {
    return (
      <section className="card">
        <h2>Primero, cargá tu empresa</h2>
        <p className="muted">
          Con estos datos se arma la carpeta para el registro provincial de proveedores mineros.
        </p>
        <OrganizationForm />
      </section>
    );
  }

  const { employees, purchases, documents } = await getOrganizationData(org.id);
  const work = workforceSummary(employees);
  const buy = purchasesSummary(purchases);
  const docs = documentsSummary(documents, new Date());
  const statuses = [work.status, buy.status, docs.status];
  const overall: Status = statuses.includes("fail")
    ? "fail"
    : statuses.includes("warning")
      ? "warning"
      : "ok";
  const docsOk = docs.items.filter((i) => i.status === "ok").length;
  const docsFail = docs.items.filter((i) => i.status === "fail").length;
  const docsWarn = docs.items.filter((i) => i.status === "warning").length;

  return (
    <>
      <section className={`hero status-${overall}`}>
        <p className="eyebrow">{org.name}</p>
        <h2>{STATUS_LABEL[overall]}</h2>
        <p>
          CUIT {org.cuit}
          {org.fiscalDepartment
            ? ` · Domicilio fiscal en ${org.fiscalDepartment}`
            : " · Domicilio fiscal fuera de San Juan"}
          {org.establishedSince ? ` · En San Juan desde ${org.establishedSince}` : ""}
        </p>
      </section>

      <section className="metrics">
        <Metric
          title="Mano de obra sanjuanina"
          value={formatPct(work.localPct)}
          target={`Mínimo ${RULES.minLocalWorkforcePct}%`}
          status={work.status}
          detail={
            work.localNeeded > 0
              ? `${work.local} de ${work.total} personas. Faltan ${work.localNeeded} contrataciones locales para llegar al mínimo.`
              : `${work.local} de ${work.total} personas. ${work.community} del área de influencia.`
          }
        />
        <Metric
          title="Compras a proveedores locales"
          value={formatPct(buy.localPct)}
          target={`Mínimo ${RULES.minLocalPurchasesPct}%`}
          status={buy.status}
          detail={`${formatArs(buy.localCents)} de ${formatArs(buy.totalCents)}`}
        />
        <Metric
          title="Documentación vigente"
          value={`${docsOk}/${docs.items.length}`}
          target="Todos vigentes"
          status={docs.status}
          detail={`${docsFail} vencidos o faltantes, ${docsWarn} por vencer en ${RULES.expiryWarningDays} días`}
        />
      </section>

      <section className="card">
        <h2>Documentación</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Documento</th>
                <th>Vence</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {docs.items.map((d) => (
                <tr key={d.kind}>
                  <td>{d.kind}</td>
                  <td>{d.present ? (d.expiresOn ? formatDate(d.expiresOn) : "No vence") : "—"}</td>
                  <td>
                    <Badge status={d.status}>
                      {!d.present
                        ? "Falta"
                        : d.status === "fail"
                          ? "Vencido"
                          : d.status === "warning"
                            ? "Por vencer"
                            : "Vigente"}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <DocumentForm organizationId={org.id} />
      </section>

      <section className="card">
        <h2>Nómina · {work.total} activos</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Puesto</th>
                <th>Reside en</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {employees.map((e) => (
                <tr key={e.id} className={e.active ? "" : "inactive"}>
                  <td>{e.fullName}</td>
                  <td>{e.role ?? "—"}</td>
                  <td>
                    <Badge status={isSanJuanDepartment(e.department) ? "ok" : "fail"}>
                      {e.department}
                    </Badge>
                  </td>
                  <td className="num">
                    <form action={toggleEmployee.bind(null, org.id, e.id, !e.active)}>
                      <button type="submit" className="link">
                        {e.active ? "Dar de baja" : "Reactivar"}
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <EmployeeForm organizationId={org.id} />
      </section>

      <section className="card">
        <h2>Compras</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Proveedor</th>
                <th>Detalle</th>
                <th className="num">Monto</th>
              </tr>
            </thead>
            <tbody>
              {purchases.map((p) => (
                <tr key={p.id}>
                  <td>{formatDate(p.purchasedOn)}</td>
                  <td>
                    {p.supplierName}{" "}
                    <Badge status={p.supplierIsLocal ? "ok" : "fail"}>
                      {p.supplierIsLocal ? "Local" : "Externo"}
                    </Badge>
                  </td>
                  <td>{p.description ?? "—"}</td>
                  <td className="num">{formatArs(p.amountCents)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <PurchaseForm organizationId={org.id} />
      </section>

      <p className="muted small">
        Porcentajes según la Ley de Desarrollo Local Minero de San Juan (2026), tal como se publicó en
        prensa. Validar contra el texto reglamentado.
      </p>
    </>
  );
}

function Metric(props: {
  title: string;
  value: string;
  target: string;
  status: Status;
  detail: string;
}) {
  return (
    <article className={`metric status-${props.status}`}>
      <p className="metric-title">{props.title}</p>
      <p className="metric-value">{props.value}</p>
      <p className="metric-target">
        {props.target} · <strong>{STATUS_LABEL[props.status]}</strong>
      </p>
      <p className="metric-detail">{props.detail}</p>
    </article>
  );
}

function Badge({ status, children }: { status: Status; children: React.ReactNode }) {
  return <span className={`badge status-${status}`}>{children}</span>;
}

function formatPct(n: number) {
  return `${n.toLocaleString("es-AR", { maximumFractionDigits: 1 })}%`;
}

function formatDate(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}
