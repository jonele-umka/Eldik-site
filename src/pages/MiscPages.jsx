import { useState, useMemo } from "react";
import { fmtM, filterSearch, unique, paginate } from "../utils/index.js";
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

export function ReturnsPage({ data, search }) {
  const arr = data || [];
  const filtered = useMemo(
    () => filterSearch(arr, ["client", "product"], search),
    [arr, search],
  );
  const total = filtered.reduce((s, r) => s + Number(r.amount || 0), 0);

  return (
    <>
      <div style={S.kpiGrid}>
        <KPI label="Возвратов" value={filtered.length} color="var(--yellow)" />
        <KPI
          label="Сумма возвратов"
          value={fmtM(total)}
          color="var(--yellow)"
        />
      </div>
      <TableWrap title="Возвраты" count={`${filtered.length} записей`}>
        <thead>
          <tr style={{ background: "var(--s2)" }}>
            {["Клиент", "Товар", "Кол-во", "Цена", "Сумма"].map((h) => (
              <TH key={h}>{h}</TH>
            ))}
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 ? (
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
            filtered.map((r, i) => (
              <TR key={i}>
                <TD>
                  <b>{r.client}</b>
                </TD>
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
            ))
          )}
        </tbody>
      </TableWrap>
    </>
  );
}

export function ExpensesPage({ data, search }) {
  const [cat, setCat] = useState("");
  const [market, setMarket] = useState("");
  const [page, setPage] = useState(1);
  const arr = data || [];

  const filtered = useMemo(() => {
    let r = filterSearch(arr, ["category", "market"], search);
    if (cat) r = r.filter((x) => x.category === cat);
    if (market) r = r.filter((x) => x.market === market);
    return r;
  }, [arr, search, cat, market]);

  const total = filtered.reduce((s, r) => s + Number(r.amount || 0), 0);

  return (
    <>
      <div style={S.kpiGrid}>
        <KPI
          label="Записей расходов"
          value={filtered.length}
          color="var(--red)"
        />
        <KPI label="Сумма расходов" value={fmtM(total)} color="var(--red)" />
      </div>
      <div style={S.filters}>
        <Select
          value={cat}
          onChange={(v) => {
            setCat(v);
            setPage(1);
          }}
          options={unique(arr, "category")}
          placeholder="Все категории"
        />
        <Select
          value={market}
          onChange={(v) => {
            setMarket(v);
            setPage(1);
          }}
          options={unique(arr, "market")}
          placeholder="Все рынки"
        />
      </div>
      <TableWrap
        title="Расходы"
        count={`${filtered.length} записей`}
        pagination={
          <Pagination total={filtered.length} page={page} onPage={setPage} />
        }
      >
        <thead>
          <tr style={{ background: "var(--s2)" }}>
            {["Дата", "Категория", "Сумма", "Рынок"].map((h) => (
              <TH key={h}>{h}</TH>
            ))}
          </tr>
        </thead>
        <tbody>
          {paginate(filtered, page).length === 0 ? (
            <tr>
              <td
                colSpan={4}
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
                <TD style={{ color: "var(--muted)" }}>
                  {r.date?.split(" ")[0] || "—"}
                </TD>
                <TD>
                  <b>{r.category}</b>
                </TD>
                <TD>
                  <MoneyCell n={r.amount} pos={false} />
                </TD>
                <TD style={{ color: "var(--muted)" }}>{r.market || "—"}</TD>
              </TR>
            ))
          )}
        </tbody>
      </TableWrap>
    </>
  );
}

export function ClientsPage({ data, search, onSelectClient }) {
  const [market, setMarket] = useState("");
  const arr = data || [];

  const filtered = useMemo(() => {
    let r = filterSearch(arr, ["name", "market", "address", "phone"], search);
    if (market) r = r.filter((x) => x.market === market);
    return r;
  }, [arr, search, market]);

  return (
    <>
      <div style={S.filters}>
        <Select
          value={market}
          onChange={setMarket}
          options={unique(arr, "market")}
          placeholder="Все рынки"
        />
      </div>
      <TableWrap title="Клиенты" count={`${filtered.length} клиентов`}>
        <thead>
          <tr style={{ background: "var(--s2)" }}>
            {["Рынок", "Имя", "Адрес", "Телефон"].map((h) => (
              <TH key={h}>{h}</TH>
            ))}
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 ? (
            <tr>
              <td
                colSpan={4}
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
            filtered.map((r, i) => (
              <TR key={r.id || i}>
                <TD style={{ color: "var(--muted)" }}>{r.market}</TD>
                <TD>
                  <b
                    onClick={() => onSelectClient?.(r.name)}
                    style={{
                      cursor: onSelectClient ? "pointer" : "default",
                      color: onSelectClient ? "var(--accent)" : "inherit",
                      textDecoration: onSelectClient ? "none" : "none",
                    }}
                    onMouseEnter={(e) => {
                      if (onSelectClient)
                        e.currentTarget.style.textDecoration = "underline";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.textDecoration = "none";
                    }}
                  >
                    {r.name}
                  </b>
                </TD>
                <TD style={{ color: "var(--muted)" }}>{r.address || "—"}</TD>
                <TD>
                  <span
                    style={{
                      fontFamily: "JetBrains Mono,monospace",
                      fontSize: 12.5,
                    }}
                  >
                    {r.phone || "—"}
                  </span>
                </TD>
              </TR>
            ))
          )}
        </tbody>
      </TableWrap>
    </>
  );
}
