import { useState, useMemo } from "react";
import { fmt, filterSearch } from "../utils/index.js";
import { KPI, Select, TR, TD, TH } from "../components/UI.jsx";
import { S } from "../utils/styles.js";

function parseDateStr(date) {
  const p = date.split(".");
  if (p.length === 3) return new Date(`${p[2]}-${p[1]}-${p[0]}`);
  return new Date(0);
}

function sortByDateDesc(a, b) {
  return parseDateStr(b.date) - parseDateStr(a.date);
}

// Ссылки вида .../file/d/FILE_ID/view?usp=sharing или .../uc?id=FILE_ID
// открываются в браузере (там это HTML-страница просмотра), но НЕ работают
// в теге <img>. Конвертируем их в прямой формат картинки.
function toDriveDirectUrl(url) {
  if (!url) return "";
  const trimmed = String(url).trim();

  let m = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (!m) m = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);

  if (m && m[1]) {
    return `https://lh3.googleusercontent.com/d/${m[1]}=w300`;
  }
  return trimmed;
}

// Цветовая метка даты доставки:
// прошла — зелёный (выполнено), сегодня — красный (срочно), впереди — синий.
function getDateStatus(dateStr) {
  const d = parseDateStr(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);

  if (d.getTime() < today.getTime()) {
    return {
      label: "Выполнено",
      color: "var(--green, #3fb950)",
      bg: "rgba(63,185,80,.12)",
    };
  }
  if (d.getTime() === today.getTime()) {
    return {
      label: "Сегодня",
      color: "var(--red, #f85149)",
      bg: "rgba(248,81,73,.12)",
    };
  }
  return {
    label: "Ожидается",
    color: "var(--accent)",
    bg: "rgba(88,166,255,.12)",
  };
}

// Миниатюра товара. Если картинки нет (или не загрузилась) — плейсхолдер.
function ProductThumb({ src, size = 36 }) {
  const [broken, setBroken] = useState(false);

  if (!src || broken) {
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: 8,
          background: "var(--s2)",
          border: "1px solid var(--b1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: size * 0.5,
          flexShrink: 0,
        }}
      >
        📦
      </div>
    );
  }
  return (
    <img
      src={src}
      alt=""
      onError={() => setBroken(true)}
      style={{
        width: size,
        height: size,
        borderRadius: 8,
        objectFit: "cover",
        border: "1px solid var(--b1)",
        flexShrink: 0,
        background: "var(--s2)",
      }}
    />
  );
}

function MarketChips({ markets }) {
  const entries = Object.entries(markets || {});
  if (entries.length === 0) {
    return <span style={{ color: "var(--muted)", fontSize: 12 }}>—</span>;
  }
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
      {entries.map(([market, qty]) => (
        <span
          key={market}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            padding: "2px 8px",
            borderRadius: 20,
            fontSize: 11,
            background: "rgba(88,166,255,.12)",
            color: "var(--accent)",
            whiteSpace: "nowrap",
          }}
        >
          {market}: <b>{qty}</b>
        </span>
      ))}
    </div>
  );
}

export function ProductionPage({ data, search, prices, isMobile, isTablet }) {
  const [dateFilter, setDateFilter] = useState("");
  const raw = data || {};
  const compact = isMobile || isTablet;

  const priceMap = useMemo(() => {
    const m = {};
    (prices || []).forEach((p) => {
      if (p.product) m[p.product] = toDriveDirectUrl(p.image || "");
    });
    return m;
  }, [prices]);

  const allItems = useMemo(() => {
    const result = [];
    Object.entries(raw).forEach(([date, products]) => {
      Object.entries(products).forEach(([product, info]) => {
        result.push({
          date,
          product,
          total: info.total,
          comment: info.comment || "",
          markets: info.markets || {},
        });
      });
    });
    return result.sort(sortByDateDesc);
  }, [raw]);

  const dates = [...new Set(allItems.map((x) => x.date))].sort().reverse();

  const filtered = useMemo(() => {
    let r = filterSearch(allItems, ["product", "comment"], search);
    if (dateFilter) r = r.filter((x) => x.date === dateFilter);
    return r;
  }, [allItems, search, dateFilter]);

  const totalProducts = filtered.reduce((s, r) => s + Number(r.total || 0), 0);

  const byDate = useMemo(() => {
    const groups = {};
    filtered.forEach((r) => {
      if (!groups[r.date]) groups[r.date] = [];
      groups[r.date].push(r);
    });
    return groups;
  }, [filtered]);

  const orderedDates = Object.keys(byDate).sort(
    (a, b) => parseDateStr(b) - parseDateStr(a),
  );

  return (
    <>
      <div style={isMobile ? S.kpiGridMobile : S.kpiGrid}>
        {/* <KPI label="Позиций" value={filtered.length} color="var(--accent)" />
        <KPI
          label="Всего единиц"
          value={fmt(totalProducts)}
          color="var(--accent)"
        /> */}
      </div>
      <div style={S.filters}>
        <Select
          value={dateFilter}
          onChange={setDateFilter}
          options={dates}
          placeholder="Все даты"
        />
      </div>

      {orderedDates.length === 0 ? (
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
        orderedDates.map((date) => {
          const rows = byDate[date];
          const status = getDateStatus(date);
          const dayTotal = rows.reduce((s, r) => s + Number(r.total || 0), 0);
          return (
            <div
              key={date}
              style={{
                ...S.card,
                marginBottom: 16,
                borderLeft: `3px solid ${status.color}`,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: isMobile ? "10px 12px" : "12px 18px",
                  borderBottom: "1px solid var(--b1)",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  flexWrap: "wrap",
                }}
              >
                <span style={{ fontSize: isMobile ? 13 : 14, fontWeight: 700 }}>
                  📅 {date}
                </span>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    padding: "3px 10px",
                    borderRadius: 20,
                    background: status.bg,
                    color: status.color,
                  }}
                >
                  {status.label}
                </span>
                <span style={{ fontSize: 12, color: "var(--muted)" }}>
                  {rows.length} товар(ов) · {fmt(dayTotal)} шт.
                </span>
              </div>

              {isMobile ? (
                // ── Мобильный вид: карточки вместо таблицы ──
                <div>
                  {rows.map((r, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        gap: 10,
                        padding: "12px 14px",
                        borderBottom:
                          i < rows.length - 1 ? "1px solid var(--b1)" : "none",
                      }}
                    >
                      <ProductThumb src={priceMap[r.product]} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            gap: 8,
                          }}
                        >
                          <b style={{ fontSize: 13 }}>{r.product}</b>
                          <span
                            style={{
                              fontFamily: "JetBrains Mono,monospace",
                              fontSize: 14,
                              fontWeight: 700,
                              color: "var(--accent)",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {fmt(r.total)}
                          </span>
                        </div>
                        <div style={{ marginTop: 6 }}>
                          <MarketChips markets={r.markets} />
                        </div>
                        {r.comment && (
                          <div
                            style={{
                              fontSize: 12,
                              color: "var(--muted)",
                              marginTop: 6,
                            }}
                          >
                            {r.comment}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                // ── Планшет/десктоп: таблица с горизонтальным скроллом на узких экранах ──
                <div style={{ overflowX: "auto" }}>
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      minWidth: compact ? 620 : undefined,
                    }}
                  >
                    <thead>
                      <tr style={{ background: "var(--s2)" }}>
                        <TH>Товар</TH>
                        <TH>Всего произвести</TH>
                        <TH>По рынкам</TH>
                        <TH>Комментарий</TH>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((r, i) => (
                        <TR key={i}>
                          <TD>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                              }}
                            >
                              <ProductThumb
                                src={priceMap[r.product]}
                                size={30}
                              />
                              <b>{r.product}</b>
                            </div>
                          </TD>
                          <TD>
                            <span
                              style={{
                                fontFamily: "JetBrains Mono,monospace",
                                fontSize: 14,
                                fontWeight: 700,
                                color: "var(--accent)",
                              }}
                            >
                              {fmt(r.total)}
                            </span>
                          </TD>
                          <TD>
                            <MarketChips markets={r.markets} />
                          </TD>
                          <TD
                            style={{
                              color: "var(--muted)",
                              maxWidth: 200,
                              whiteSpace: "normal",
                            }}
                          >
                            {r.comment || "—"}
                          </TD>
                        </TR>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })
      )}
    </>
  );
}

export function DeliveryPage({ data, search, isMobile }) {
  const [dateFilter, setDateFilter] = useState("");
  const [marketFilter, setMarketFilter] = useState("");
  const raw = data || {};

  const allRows = useMemo(() => {
    const result = [];
    Object.entries(raw).forEach(([date, products]) => {
      Object.entries(products).forEach(([product, info]) => {
        Object.entries(info.markets || {}).forEach(([market, qty]) => {
          result.push({
            date,
            market,
            product,
            qty,
            comment: (info.marketComments || {})[market] || "",
          });
        });
      });
    });
    return result.sort(sortByDateDesc);
  }, [raw]);

  const dates = [...new Set(allRows.map((x) => x.date))].sort().reverse();
  const markets = [...new Set(allRows.map((x) => x.market))].sort();

  const filtered = useMemo(() => {
    let r = filterSearch(allRows, ["product", "market", "comment"], search);
    if (dateFilter) r = r.filter((x) => x.date === dateFilter);
    if (marketFilter) r = r.filter((x) => x.market === marketFilter);
    return r;
  }, [allRows, search, dateFilter, marketFilter]);

  const totalQty = filtered.reduce((s, r) => s + Number(r.qty || 0), 0);

  const byDate = useMemo(() => {
    const groups = {};
    filtered.forEach((r) => {
      if (!groups[r.date]) groups[r.date] = [];
      groups[r.date].push(r);
    });
    return groups;
  }, [filtered]);

  const colorPool = [
    "rgba(88,166,255,.12)",
    "rgba(63,185,80,.12)",
    "rgba(210,153,34,.12)",
    "rgba(248,81,73,.10)",
    "rgba(139,148,158,.12)",
    "rgba(171,75,222,.12)",
  ];
  const marketColors = {};
  markets.forEach((m, i) => {
    marketColors[m] = colorPool[i % colorPool.length];
  });

  return (
    <>
      <div style={isMobile ? S.kpiGridMobile : S.kpiGrid}>
        <KPI label="Записей" value={filtered.length} color="var(--accent)" />
        <KPI label="Всего единиц" value={fmt(totalQty)} color="var(--green)" />
      </div>
      <div style={S.filters}>
        <Select
          value={dateFilter}
          onChange={setDateFilter}
          options={dates}
          placeholder="Все даты"
        />
        <Select
          value={marketFilter}
          onChange={setMarketFilter}
          options={markets}
          placeholder="Все рынки"
        />
      </div>

      {Object.keys(byDate).length === 0 ? (
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
        Object.entries(byDate).map(([date, rows]) => {
          const byMarket = {};
          rows.forEach((r) => {
            if (!byMarket[r.market]) byMarket[r.market] = [];
            byMarket[r.market].push(r);
          });
          return (
            <div key={date} style={{ ...S.card, marginBottom: 16 }}>
              <div
                style={{
                  padding: "12px 18px",
                  borderBottom: "1px solid var(--b1)",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <span style={{ fontSize: 14, fontWeight: 700 }}>📅 {date}</span>
                <span style={{ fontSize: 12, color: "var(--muted)" }}>
                  {rows.length} поз. ·{" "}
                  {fmt(rows.reduce((s, r) => s + Number(r.qty || 0), 0))} шт.
                </span>
              </div>
              <div
                style={{
                  padding: 14,
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 12,
                }}
              >
                {Object.entries(byMarket).map(([market, mRows]) => (
                  <div
                    key={market}
                    style={{
                      background: marketColors[market] || "var(--s2)",
                      border: "1px solid var(--b1)",
                      borderRadius: 10,
                      padding: "12px 16px",
                      minWidth: 180,
                      flex: "1 1 180px",
                      maxWidth: 280,
                    }}
                  >
                    <div
                      style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}
                    >
                      🏪 {market}
                    </div>
                    {mRows.map((r, i) => (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "4px 0",
                          borderBottom:
                            i < mRows.length - 1
                              ? "1px solid var(--b1)"
                              : "none",
                          gap: 8,
                        }}
                      >
                        <span style={{ fontSize: 12.5 }}>{r.product}</span>
                        <span
                          style={{
                            fontFamily: "JetBrains Mono,monospace",
                            fontSize: 13,
                            fontWeight: 700,
                            color: "var(--accent)",
                          }}
                        >
                          {fmt(r.qty)}
                        </span>
                      </div>
                    ))}
                    <div
                      style={{
                        marginTop: 8,
                        paddingTop: 6,
                        borderTop: "1px solid var(--b1)",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span
                        style={{
                          fontSize: 11,
                          color: "var(--muted)",
                          textTransform: "uppercase",
                        }}
                      >
                        Итого
                      </span>
                      <span
                        style={{
                          fontFamily: "JetBrains Mono,monospace",
                          fontSize: 13,
                          fontWeight: 700,
                        }}
                      >
                        {fmt(mRows.reduce((s, r) => s + Number(r.qty || 0), 0))}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })
      )}
    </>
  );
}
