import { useMemo } from "react";
import { fmtM, buildOrderGroups, parseDate } from "../utils/index.js";
import { KPI, TableWrap, TR, TD, TH, MoneyCell } from "../components/UI.jsx";
import { OrderCard } from "../components/OrderCard.jsx";
import { S } from "../utils/styles.js";

const norm = (s) =>
  String(s || "")
    .trim()
    .toLowerCase();

export default function ClientDetailPage({
  client,
  orders,
  payments,
  returns,
  isMobile,
  onBack,
}) {
  const clientKey = norm(client);

  const clientOrders = useMemo(
    () => (orders || []).filter((o) => norm(o.client) === clientKey),
    [orders, clientKey],
  );

  const clientPayments = useMemo(
    () => (payments || []).filter((p) => norm(p.client) === clientKey),
    [payments, clientKey],
  );

  const clientReturns = useMemo(
    () => (returns || []).filter((r) => norm(r.client) === clientKey),
    [returns, clientKey],
  );

  const groups = useMemo(() => {
    const g = buildOrderGroups(clientOrders);
    return g.sort((a, b) => parseDate(b.orderDate) - parseDate(a.orderDate));
  }, [clientOrders]);

  const totalSum = groups.reduce((s, g) => s + g.totalSum, 0);
  const paidSum = groups.reduce((s, g) => s + g.paidAmount, 0);
  const retSum = groups.reduce((s, g) => s + g.returnedAmount, 0);
  const debt = Math.max(0, totalSum - paidSum - retSum);

  const kpiGrid = isMobile ? S.kpiGridMobile : S.kpiGrid;

  return (
    <>
      <button
        onClick={onBack}
        style={{
          background: "var(--s2)",
          border: "1px solid var(--b1)",
          borderRadius: 8,
          padding: "7px 12px",
          color: "var(--text)",
          fontSize: 13,
          cursor: "pointer",
          marginBottom: 14,
        }}
      >
        ← Назад к клиентам
      </button>

      <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 14 }}>
        {client || "Клиент"}
      </h2>

      <div style={kpiGrid}>
        <KPI label="Заказов" value={groups.length} color="var(--accent)" />
        <KPI
          label="Сумма заказов"
          value={fmtM(totalSum)}
          color="var(--accent)"
        />
        <KPI label="Оплачено" value={fmtM(paidSum)} color="var(--green)" />
        <KPI label="Возвраты" value={fmtM(retSum)} color="var(--yellow)" />
        <KPI
          label="Долг"
          value={fmtM(debt)}
          color={debt > 0 ? "var(--red)" : "var(--green)"}
        />
      </div>
       {clientPayments.length > 0 && (
        <>
          <div style={{ fontSize: 13, fontWeight: 600, margin: "22px 0 10px" }}>
            История платежей
          </div>
          <TableWrap title="Платежи" count={`${clientPayments.length} записей`}>
            <thead>
              <tr style={{ background: "var(--s2)" }}>
                {["Дата платежа", "Дата заказа", "Сумма"].map((h) => (
                  <TH key={h}>{h}</TH>
                ))}
              </tr>
            </thead>
            <tbody>
              {clientPayments
                .slice()
                .sort(
                  (a, b) => parseDate(b.paymentDate) - parseDate(a.paymentDate),
                )
                .map((p, i) => (
                  <TR key={p.id || i}>
                    <TD style={{ color: "var(--muted)" }}>
                      {p.paymentDate?.split(" ")[0] || "—"}
                    </TD>
                    <TD style={{ color: "var(--muted)" }}>
                      {p.orderDate?.split(" ")[0] || "—"}
                    </TD>
                    <TD>
                      <MoneyCell n={p.amount} />
                    </TD>
                  </TR>
                ))}
            </tbody>
          </TableWrap>
        </>
      )}
      {clientReturns.length > 0 && (
        <>
          <div style={{ fontSize: 13, fontWeight: 600, margin: "22px 0 10px" }}>
            История возвратов
          </div>
          <TableWrap title="Возвраты" count={`${clientReturns.length} записей`}>
            <thead>
              <tr style={{ background: "var(--s2)" }}>
                {["Товар", "Кол-во", "Цена", "Сумма"].map((h) => (
                  <TH key={h}>{h}</TH>
                ))}
              </tr>
            </thead>
            <tbody>
              {clientReturns.map((r, i) => (
                <TR key={i}>
                  <TD>{r.product}</TD>
                  <TD>
                    <span
                      style={{
                        fontFamily: "JetBrains Mono,monospace",
                        fontSize: 12.5,
                      }}
                    >
                      {r.quantity}
                    </span>
                  </TD>
                  <TD>
                    <MoneyCell n={r.price} />
                  </TD>
                  <TD>
                    <MoneyCell n={r.amount} pos={false} />
                  </TD>
                </TR>
              ))}
            </tbody>
          </TableWrap>
        </>
      )}
      <div style={{ fontSize: 13, fontWeight: 600, margin: "18px 0 10px" }}>
        История заказов
      </div>
      {groups.length === 0 ? (
        <div
          style={{
            ...S.card,
            padding: 40,
            textAlign: "center",
            color: "var(--muted)",
          }}
        >
          Нет заказов
        </div>
      ) : (
        groups.map((g) => (
          <OrderCard key={g.oid} group={g} isMobile={isMobile} />
        ))
      )}
    </>
  );
}
