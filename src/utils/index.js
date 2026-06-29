export const fmt = (n) => Number(n || 0).toLocaleString("ru-RU");
export const fmtM = (n) => fmt(n) + " с";

export const getMonth = (d) => {
  if (!d) return "";
  const p = String(d).split(" ")[0].split(".");
  return p.length === 3 ? `${p[2]}-${p[1]}` : "";
};

export const PAGE = 50;

export function paginate(arr, page) {
  return arr.slice((page - 1) * PAGE, page * PAGE);
}

export function filterSearch(arr, keys, q) {
  if (!q) return arr;
  const lq = q.toLowerCase();
  return arr.filter((r) =>
    keys.some((k) =>
      String(r[k] || "")
        .toLowerCase()
        .includes(lq),
    ),
  );
}

export function sortArr(arr, col, dir) {
  return [...arr].sort((a, b) => {
    let va = a[col],
      vb = b[col];
    const parseDate = (v) => {
      if (!v) return 0;
      const p = String(v).split(" ")[0].split(".");
      if (p.length === 3) return new Date(`${p[2]}-${p[1]}-${p[0]}`).getTime();
      return 0;
    };
    if (col === "orderDate" || col === "deliveryDate") {
      va = parseDate(va);
      vb = parseDate(vb);
    } else if (typeof va === "string") {
      va = va.toLowerCase();
      vb = vb.toLowerCase();
    }
    if (va < vb) return dir === "asc" ? -1 : 1;
    if (va > vb) return dir === "asc" ? 1 : -1;
    return 0;
  });
}

export function unique(arr, key) {
  return [...new Set(arr.map((r) => r[key]).filter(Boolean))].sort();
}

// Группируем строки заказов по orderId
export function buildOrderGroups(rows) {
  const map = new Map();
  rows.forEach((r) => {
    const oid = r.orderId || `${r.client}-${r.orderDate}`;
    if (!map.has(oid)) {
      map.set(oid, {
        oid,
        client: r.client,
        market: r.market,
        orderDate: r.orderDate,
        deliveryDate: r.deliveryDate,
        status: r.status,
        paidAmount: Number(r.paidAmount || 0),
        returnedAmount: Number(r.returnedAmount || 0),
        rows: [],
        totalSum: 0,
      });
    }
    const g = map.get(oid);
    g.rows.push(r);
    g.totalSum += Number(r.total || 0);
    g.paidAmount = Math.max(g.paidAmount, Number(r.paidAmount || 0));
    g.returnedAmount = Math.max(
      g.returnedAmount,
      Number(r.returnedAmount || 0),
    );
  });
  return [...map.values()];
}

export const parseDate = (s) => {
  const p = String(s || "")
    .split(" ")[0]
    .split(".");
  return p.length === 3 ? new Date(`${p[2]}-${p[1]}-${p[0]}`).getTime() : 0;
};
