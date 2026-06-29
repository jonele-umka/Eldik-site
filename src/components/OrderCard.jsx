import { fmtM } from "../utils/index.js";
import { Badge, MoneyCell } from "./UI.jsx";

export function OrderCard({ group }) {
  const {
    client,
    market,
    orderDate,
    deliveryDate,
    status,
    rows,
    totalSum,
    paidAmount,
    returnedAmount,
  } = group;

  // Правильный расчёт: долг = (сумма - возврат) - оплачено
  const effectiveTotal = totalSum - returnedAmount;
  const debt = Math.max(0, effectiveTotal - paidAmount);
  const isFullyPaid = debt <= 0 && effectiveTotal > 0;
  const isPartiallyPaid = paidAmount > 0 && debt > 0;
  const hasReturn = returnedAmount > 0;

  let borderColor, bgColor, statusDot;
  if (isFullyPaid) {
    borderColor = "rgba(63,185,80,0.5)";
    bgColor = "rgba(63,185,80,0.06)";
    statusDot = "var(--green)";
  } else if (isPartiallyPaid) {
    borderColor = "rgba(210,153,34,0.5)";
    bgColor = "rgba(210,153,34,0.07)";
    statusDot = "var(--yellow)";
  } else {
    borderColor = "rgba(248,81,73,0.4)";
    bgColor = "rgba(248,81,73,0.06)";
    statusDot = "var(--red)";
  }

  const pct =
    effectiveTotal > 0
      ? Math.min(100, Math.round((paidAmount / effectiveTotal) * 100))
      : 0;

  return (
    <div
      style={{
        background: bgColor,
        border: `1.5px solid ${borderColor}`,
        borderRadius: 12,
        marginBottom: 12,
        overflow: "hidden",
      }}
    >
      {/* Заголовок */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 16px",
          borderBottom: `1px solid ${borderColor}`,
          background: bgColor,
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: statusDot,
              flexShrink: 0,
            }}
          />
          <span style={{ fontWeight: 700, fontSize: 14 }}>{client}</span>
          <span
            style={{
              fontSize: 11,
              color: "var(--muted)",
              background: "var(--s2)",
              borderRadius: 6,
              padding: "2px 7px",
            }}
          >
            {market}
          </span>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <span style={{ fontSize: 12, color: "var(--muted)" }}>
            📅 {orderDate?.split(" ")[0] || "—"}
          </span>
          {deliveryDate && (
            <span style={{ fontSize: 12, color: "var(--muted)" }}>
              🚚 {deliveryDate}
            </span>
          )}
          <Badge status={status} />
        </div>
      </div>

      {/* Строки товаров */}
      <div style={{ overflowX: "auto" }}>
        <table
          style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}
        >
          <thead>
            <tr>
              {["Товар", "Кол-во", "Цена", "Сумма"].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: "6px 14px",
                    textAlign: "left",
                    fontSize: 10,
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: ".07em",
                    color: "var(--muted)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr
                key={r.id || i}
                style={{
                  borderTop:
                    "1px solid " +
                    borderColor.replace("0.5", "0.2").replace("0.4", "0.15"),
                }}
              >
                <td style={{ padding: "7px 14px", fontWeight: 500 }}>
                  {r.product}
                </td>
                <td
                  style={{
                    padding: "7px 14px",
                    fontFamily: "JetBrains Mono,monospace",
                    fontSize: 12.5,
                  }}
                >
                  {r.paidQuantity ?? r.quantity}
                  {r.giftQty > 0 && (
                    <span
                      style={{
                        color: "var(--green)",
                        fontSize: 11,
                        marginLeft: 4,
                      }}
                    >
                      +{r.giftQty}🎁
                    </span>
                  )}
                </td>
                <td style={{ padding: "7px 14px" }}>
                  <MoneyCell n={r.price} />
                </td>
                <td style={{ padding: "7px 14px", fontWeight: 600 }}>
                  <MoneyCell n={r.total} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Итоговая панель */}
      <div
        style={{
          padding: "10px 16px",
          borderTop: `1px solid ${borderColor}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <div style={{ fontSize: 12 }}>
            <span style={{ color: "var(--muted)" }}>Итого: </span>
            <span
              style={{
                fontFamily: "JetBrains Mono,monospace",
                fontWeight: 600,
              }}
            >
              {fmtM(totalSum)}
            </span>
          </div>
          {hasReturn && (
            <div style={{ fontSize: 12 }}>
              <span style={{ color: "var(--muted)" }}>Возврат: </span>
              <span
                style={{
                  fontFamily: "JetBrains Mono,monospace",
                  color: "var(--yellow)",
                  fontWeight: 600,
                }}
              >
                −{fmtM(returnedAmount)}
              </span>
            </div>
          )}
          {hasReturn && (
            <div style={{ fontSize: 12 }}>
              <span style={{ color: "var(--muted)" }}>К оплате: </span>
              <span
                style={{
                  fontFamily: "JetBrains Mono,monospace",
                  fontWeight: 600,
                }}
              >
                {fmtM(effectiveTotal)}
              </span>
            </div>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {isFullyPaid ? (
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 16 }}>✅</span>
              <span
                style={{
                  fontFamily: "JetBrains Mono,monospace",
                  fontSize: 13,
                  fontWeight: 700,
                  color: "var(--green)",
                }}
              >
                {fmtM(paidAmount)}
              </span>
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                flexWrap: "wrap",
              }}
            >
              {paidAmount > 0 && (
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      fontSize: 10,
                      color: "var(--muted)",
                      marginBottom: 1,
                    }}
                  >
                    Оплачено
                  </div>
                  <span
                    style={{
                      fontFamily: "JetBrains Mono,monospace",
                      fontSize: 13,
                      fontWeight: 700,
                      color: "var(--green)",
                    }}
                  >
                    {fmtM(paidAmount)}
                  </span>
                </div>
              )}
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontSize: 10,
                    color: "var(--muted)",
                    marginBottom: 1,
                  }}
                >
                  Долг
                </div>
                <span
                  style={{
                    fontFamily: "JetBrains Mono,monospace",
                    fontSize: 13,
                    fontWeight: 700,
                    color: "var(--red)",
                  }}
                >
                  {fmtM(debt)}
                </span>
              </div>
            </div>
          )}

          {effectiveTotal > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div
                style={{
                  width: 80,
                  height: 5,
                  background: "var(--s3)",
                  borderRadius: 3,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${pct}%`,
                    background: isFullyPaid
                      ? "var(--green)"
                      : isPartiallyPaid
                        ? "var(--yellow)"
                        : "var(--red)",
                    borderRadius: 3,
                    transition: "width .3s",
                  }}
                />
              </div>
              <span
                style={{
                  fontSize: 11,
                  color: "var(--muted)",
                  fontFamily: "JetBrains Mono,monospace",
                }}
              >
                {pct}%
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
