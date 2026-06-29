import { useState, useMemo } from "react";
import {
  fmtM,
  filterSearch,
  unique,
  buildOrderGroups,
  getMonth,
  parseDate,
} from "../utils/index.js";
import { KPI, Select } from "../components/UI.jsx";
import { OrderCard } from "../components/OrderCard.jsx";
import { S } from "../utils/styles.js";

const GPAGE = 20;

export default function OrdersPage({ data, expenses, search, isMobile }) {
  const [market, setMarket] = useState("");
  const [status, setStatus] = useState("");
  const [month, setMonth] = useState("");
  const [page, setPage] = useState(1);
  const [sortDir, setSortDir] = useState("desc");

  const arr = data || [];

  const filteredRows = useMemo(() => {
    let r = filterSearch(
      arr,
      ["client", "product", "market", "orderId", "comment"],
      search,
    );
    if (market) r = r.filter((x) => x.market === market);
    if (status) r = r.filter((x) => x.status === status);
    if (month) r = r.filter((x) => getMonth(x.orderDate) === month);
    return r;
  }, [arr, search, market, status, month]);

  const allGroups = useMemo(() => {
    const groups = buildOrderGroups(filteredRows);
    return groups.sort((a, b) => {
      const diff = parseDate(b.orderDate) - parseDate(a.orderDate);
      return sortDir === "desc" ? diff : -diff;
    });
  }, [filteredRows, sortDir]);

  const totalPages = Math.ceil(allGroups.length / GPAGE);
  const groups = allGroups.slice((page - 1) * GPAGE, page * GPAGE);

  const kpiTotal = allGroups.reduce((s, g) => s + g.totalSum, 0);
  const kpiPaid = allGroups.reduce((s, g) => s + g.paidAmount, 0);
  const kpiRet = allGroups.reduce((s, g) => s + g.returnedAmount, 0);
  const kpiDebt = allGroups.reduce(
    (s, g) => s + Math.max(0, g.totalSum - g.returnedAmount - g.paidAmount),
    0,
  );
  const totalExpenses = (expenses || []).reduce(
    (s, r) => s + Number(r.amount || 0),
    0,
  );
  const balance = kpiPaid - kpiRet - totalExpenses;

  const monthOptions = [
    ...new Set(arr.map((r) => getMonth(r.orderDate)).filter(Boolean)),
  ]
    .sort()
    .reverse();
  const kpiGrid = isMobile ? S.kpiGridMobile : S.kpiGrid;

  return (
    <>
      <div style={kpiGrid}>
        <KPI label="Заказов" value={allGroups.length} color="var(--accent)" />
        <KPI label="Сумма" value={fmtM(kpiTotal)} color="var(--accent)" />
        <KPI label="Оплачено" value={fmtM(kpiPaid)} color="var(--green)" />
        <KPI label="Возвраты" value={fmtM(kpiRet)} color="var(--yellow)" />
        <KPI label="Долг" value={fmtM(kpiDebt)} color="var(--red)" />
        <KPI
          label="Расходы"
          value={fmtM(totalExpenses)}
          color="var(--yellow)"
        />
        <KPI
          label="Баланс"
          value={fmtM(balance)}
          color={balance >= 0 ? "var(--green)" : "var(--red)"}
        />
      </div>

      <div style={{ ...S.filters, justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <Select
            value={market}
            onChange={(v) => {
              setMarket(v);
              setPage(1);
            }}
            options={unique(arr, "market")}
            placeholder="Рынок"
          />
          <Select
            value={status}
            onChange={(v) => {
              setStatus(v);
              setPage(1);
            }}
            options={unique(arr, "status")}
            placeholder="Статус"
          />
          {!isMobile && (
            <Select
              value={month}
              onChange={(v) => {
                setMonth(v);
                setPage(1);
              }}
              options={monthOptions}
              placeholder="Месяц"
            />
          )}
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {isMobile && (
            <Select
              value={month}
              onChange={(v) => {
                setMonth(v);
                setPage(1);
              }}
              options={monthOptions}
              placeholder="Месяц"
            />
          )}
          <button
            onClick={() => setSortDir((d) => (d === "desc" ? "asc" : "desc"))}
            style={{
              background: "var(--s2)",
              border: "1px solid var(--b1)",
              borderRadius: 8,
              padding: "7px 10px",
              color: "var(--text)",
              fontSize: 12,
              cursor: "pointer",
              fontFamily: "Inter,sans-serif",
              whiteSpace: "nowrap",
            }}
          >
            {sortDir === "desc" ? "↓" : "↑"}
          </button>
        </div>
      </div>

      {!isMobile && (
        <div
          style={{
            display: "flex",
            gap: 16,
            marginBottom: 12,
            fontSize: 12,
            color: "var(--muted)",
          }}
        >
          {[
            ["var(--green)", "Оплачен"],
            ["var(--yellow)", "Частично"],
            ["var(--red)", "Не оплачен"],
          ].map(([color, label]) => (
            <span
              key={label}
              style={{ display: "flex", alignItems: "center", gap: 5 }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: color,
                  display: "inline-block",
                }}
              />
              {label}
            </span>
          ))}
        </div>
      )}

      <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 10 }}>
        {allGroups.length} заказов · стр. {page} из {Math.max(1, totalPages)}
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
          Нет данных
        </div>
      ) : (
        groups.map((g) => (
          <OrderCard key={g.oid} group={g} isMobile={isMobile} />
        ))
      )}

      {totalPages > 1 && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 6,
            marginTop: 16,
          }}
        >
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            style={{
              background: "var(--s2)",
              border: "1px solid var(--b1)",
              borderRadius: 6,
              padding: "5px 12px",
              color: "var(--text)",
              cursor: "pointer",
              opacity: page === 1 ? 0.4 : 1,
            }}
          >
            ‹
          </button>
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
            return (
              <button
                key={p}
                onClick={() => setPage(p)}
                style={{
                  background: p === page ? "var(--accent)" : "var(--s2)",
                  border:
                    "1px solid " + (p === page ? "var(--accent)" : "var(--b1)"),
                  borderRadius: 6,
                  padding: "5px 12px",
                  color: p === page ? "#fff" : "var(--text)",
                  cursor: "pointer",
                }}
              >
                {p}
              </button>
            );
          })}
          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            style={{
              background: "var(--s2)",
              border: "1px solid var(--b1)",
              borderRadius: 6,
              padding: "5px 12px",
              color: "var(--text)",
              cursor: "pointer",
              opacity: page === totalPages ? 0.4 : 1,
            }}
          >
            ›
          </button>
        </div>
      )}
    </>
  );
}
