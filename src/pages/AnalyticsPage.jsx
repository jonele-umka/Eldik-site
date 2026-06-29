import { fmtM } from "../utils/index.js";
import { KPI, TR, TD, TH, MoneyCell } from "../components/UI.jsx";
import { S } from "../utils/styles.js";

export default function AnalyticsPage({ analytics, months, expenses }) {
  const arr = analytics || [];
  const mon = months || [];
  const exp = expenses || [];

  const totRev = arr.reduce((s, r) => s + Number(r.revenue || 0), 0);
  const totInc = arr.reduce((s, r) => s + Number(r.income || 0), 0);
  const totExp = exp.reduce((s, r) => s + Number(r.amount || 0), 0);
  const totRet = arr.reduce((s, r) => s + Number(r.returns || 0), 0);
  // Баланс = приход - возвраты - расходы
  const balance = totInc - totRet - totExp;

  const sorted = [...arr].sort(
    (a, b) => Number(b.revenue || 0) - Number(a.revenue || 0),
  );
  const sortedMon = [...mon].sort((a, b) =>
    (b.month || "").localeCompare(a.month || ""),
  );

  const sectionStyle = { ...S.card, marginBottom: 20 };
  const sectionHeader = {
    padding: "13px 18px",
    borderBottom: "1px solid var(--b1)",
    fontSize: 14,
    fontWeight: 600,
  };

  return (
    <>
      <div style={S.kpiGrid}>
        <KPI label="Выручка" value={fmtM(totRev)} color="var(--accent)" />
        <KPI label="Приход" value={fmtM(totInc)} color="var(--green)" />
        <KPI label="Возвраты" value={fmtM(totRet)} color="var(--yellow)" />
        <KPI label="Расходы" value={fmtM(totExp)} color="var(--red)" />
        <KPI
          label="Баланс"
          value={fmtM(balance)}
          color={balance >= 0 ? "var(--green)" : "var(--red)"}
        />
      </div>

      <div style={sectionStyle}>
        <div style={sectionHeader}>По рынкам</div>
        <div style={{ overflowX: "auto" }}>
          <table
            style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}
          >
            <thead>
              <tr style={{ background: "var(--s2)" }}>
                {[
                  "Рынок",
                  "Выручка",
                  "Приход",
                  "Расход",
                  "Возвраты",
                  "Прибыль",
                ].map((h) => (
                  <TH key={h}>{h}</TH>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
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
                <>
                  {sorted.map((r, i) => (
                    <TR key={i}>
                      <TD>
                        <b>{r.market}</b>
                      </TD>
                      <TD>
                        <MoneyCell n={r.revenue} />
                      </TD>
                      <TD>
                        <MoneyCell n={r.income} pos={true} />
                      </TD>
                      <TD>
                        <MoneyCell n={r.expense} pos={false} />
                      </TD>
                      <TD>
                        <MoneyCell n={r.returns} pos={false} />
                      </TD>
                      <TD>
                        <MoneyCell n={r.profit} pos={Number(r.profit) >= 0} />
                      </TD>
                    </TR>
                  ))}
                  <tr
                    style={{
                      background: "var(--s2)",
                      borderTop: "2px solid var(--b1)",
                    }}
                  >
                    <td
                      style={{
                        padding: "9px 13px",
                        fontWeight: 700,
                        fontSize: 13,
                      }}
                    >
                      Итого
                    </td>
                    <td style={{ padding: "9px 13px" }}>
                      <MoneyCell n={totRev} />
                    </td>
                    <td style={{ padding: "9px 13px" }}>
                      <MoneyCell n={totInc} pos={true} />
                    </td>
                    <td style={{ padding: "9px 13px" }}>
                      <MoneyCell
                        n={arr.reduce((s, r) => s + Number(r.expense || 0), 0)}
                        pos={false}
                      />
                    </td>
                    <td style={{ padding: "9px 13px" }}>
                      <MoneyCell n={totRet} pos={false} />
                    </td>
                    <td style={{ padding: "9px 13px" }}>
                      <MoneyCell
                        n={arr.reduce((s, r) => s + Number(r.profit || 0), 0)}
                        pos={
                          arr.reduce((s, r) => s + Number(r.profit || 0), 0) >=
                          0
                        }
                      />
                    </td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div style={S.card}>
        <div style={sectionHeader}>По месяцам</div>
        <div style={{ overflowX: "auto" }}>
          <table
            style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}
          >
            <thead>
              <tr style={{ background: "var(--s2)" }}>
                {[
                  "Месяц",
                  "Выручка",
                  "Приход",
                  "Расход",
                  "Возвраты",
                  "Прибыль",
                ].map((h) => (
                  <TH key={h}>{h}</TH>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedMon.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
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
                sortedMon.map((r, i) => {
                  const [yr, mn] = (r.month || "").split("-");
                  const label = mn && yr ? `${mn}.${yr}` : r.month;
                  return (
                    <TR key={i}>
                      <TD>
                        <b>{label}</b>
                      </TD>
                      <TD>
                        <MoneyCell n={r.revenue} />
                      </TD>
                      <TD>
                        <MoneyCell n={r.income} pos={true} />
                      </TD>
                      <TD>
                        <MoneyCell n={r.expense} pos={false} />
                      </TD>
                      <TD>
                        <MoneyCell n={r.returns} pos={false} />
                      </TD>
                      <TD>
                        <MoneyCell n={r.profit} pos={Number(r.profit) >= 0} />
                      </TD>
                    </TR>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
