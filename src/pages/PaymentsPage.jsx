import { useState, useMemo } from "react";
import {
  fmtM,
  filterSearch,
  unique,
  paginate,
  getMonth,
} from "../utils/index.js";
import {
  KPI,
  Select,
  TableWrap,
  TR,
  TD,
  TH,
  MoneyCell,
  Pagination,
} from "../components/UI.jsx";
import { S } from "../utils/styles.js";

export default function PaymentsPage({ data, search }) {
  const [market, setMarket] = useState("");
  const [month, setMonth] = useState("");
  const [page, setPage] = useState(1);
  const arr = data || [];

  const filtered = useMemo(() => {
    let r = filterSearch(arr, ["client", "market"], search);
    if (market) r = r.filter((x) => x.market === market);
    if (month) r = r.filter((x) => getMonth(x.paymentDate) === month);
    return [...r].reverse();
  }, [arr, search, market, month]);

  const total = filtered.reduce((s, r) => s + Number(r.amount || 0), 0);
  const monthOptions = [
    ...new Set(arr.map((r) => getMonth(r.paymentDate)).filter(Boolean)),
  ]
    .sort()
    .reverse();

  return (
    <>
      <div style={S.kpiGrid}>
        <KPI label="Платежей" value={filtered.length} color="var(--green)" />
        <KPI label="Общая сумма" value={fmtM(total)} color="var(--green)" />
      </div>
      <div style={S.filters}>
        <Select
          value={market}
          onChange={(v) => {
            setMarket(v);
            setPage(1);
          }}
          options={unique(arr, "market")}
          placeholder="Все рынки"
        />
        <Select
          value={month}
          onChange={(v) => {
            setMonth(v);
            setPage(1);
          }}
          options={monthOptions}
          placeholder="Все месяцы"
        />
      </div>
      <TableWrap
        title="Платежи"
        count={`${filtered.length} записей`}
        pagination={
          <Pagination total={filtered.length} page={page} onPage={setPage} />
        }
      >
        <thead>
          <tr style={{ background: "var(--s2)" }}>
            {["Дата платежа", "Дата заказа", "Клиент", "Рынок", "Сумма"].map(
              (h) => (
                <TH key={h}>{h}</TH>
              ),
            )}
          </tr>
        </thead>
        <tbody>
          {paginate(filtered, page).length === 0 ? (
            <tr>
              <td
                colSpan={5}
                style={{
                  textAlign: "center",
                  padding: 40,
                  color: "var(--muted)",
                }}
              >
                Нет данных
              </td>
            </tr>
          ) : (
            paginate(filtered, page).map((r, i) => (
              <TR key={r.id || i}>
                <TD>{r.paymentDate?.split(" ")[0] || "—"}</TD>
                <TD style={{ color: "var(--muted)" }}>
                  {r.orderDate?.split(" ")[0] || "—"}
                </TD>
                <TD>
                  <b>{r.client}</b>
                </TD>
                <TD style={{ color: "var(--muted)" }}>{r.market}</TD>
                <TD>
                  <MoneyCell n={r.amount} pos={true} />
                </TD>
              </TR>
            ))
          )}
        </tbody>
      </TableWrap>
    </>
  );
}
