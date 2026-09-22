const UNASSIGNED = "Unassigned (older sales)";
function amountOf(t) {
  return parseInt(t.type, 10) || 0;
}
function sellerKey(t) {
  return t.soldBy.trim().toLowerCase();
}
function sameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function filterPeriod(rows, period, now = /* @__PURE__ */ new Date()) {
  if (period === "all") return rows;
  return rows.filter((r) => r.timestamp !== null && sameDay(r.timestamp, now));
}
function newestFirst(rows) {
  return [...rows].sort((a, b) => (b.timestamp?.getTime() ?? 0) - (a.timestamp?.getTime() ?? 0));
}
function summarizeBySeller(rows) {
  const map = /* @__PURE__ */ new Map();
  for (const r of rows) {
    const key = sellerKey(r);
    let s = map.get(key);
    if (!s) {
      s = { key, label: r.soldBy || UNASSIGNED, count: 0, revenue: 0, payments: {}, types: {} };
      map.set(key, s);
    }
    const amount = amountOf(r);
    s.count += 1;
    s.revenue += amount;
    s.payments[r.payment] = (s.payments[r.payment] ?? 0) + amount;
    s.types[r.type] = (s.types[r.type] ?? 0) + 1;
  }
  return Array.from(map.values()).sort((a, b) => b.revenue - a.revenue);
}
function salesByDay(rows, maxDays = 14) {
  const days = /* @__PURE__ */ new Map();
  for (const r of rows) {
    if (!r.timestamp) continue;
    const d = r.timestamp;
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    const entry = days.get(key);
    if (entry) entry.count += 1;
    else days.set(key, { date: new Date(d.getFullYear(), d.getMonth(), d.getDate()), count: 1 });
  }
  return Array.from(days.values()).sort((a, b) => a.date.getTime() - b.date.getTime()).slice(-maxDays).map((e) => ({
    label: e.date.toLocaleDateString(void 0, { month: "short", day: "numeric" }),
    count: e.count
  }));
}
export {
  UNASSIGNED as U,
  amountOf as a,
  salesByDay as b,
  sellerKey as c,
  filterPeriod as f,
  newestFirst as n,
  summarizeBySeller as s
};
