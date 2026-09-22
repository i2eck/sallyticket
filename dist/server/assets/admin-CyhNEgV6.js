import { jsx, jsxs } from "react/jsx-runtime";
import { useState, useEffect, useMemo } from "react";
import { Line, Doughnut, Bar } from "react-chartjs-2";
import { Lock, Ticket, CheckCircle2, DollarSign, Users, Search } from "lucide-react";
import { E as EVENT, T as TICKET_TYPES } from "./router-DVLsTF45.js";
import { b as subscribeTickets, t as ticketTypeFor } from "./tickets-BS0suPY1.js";
import { n as newestFirst, f as filterPeriod, s as summarizeBySeller, b as salesByDay, a as amountOf, c as sellerKey, U as UNASSIGNED } from "./sales-CSJr0JZy.js";
import "@tanstack/react-router";
import "chart.js";
import "firebase/firestore";
import "firebase/app";
const ADMIN_PIN = String("2026");
const UNLOCK_KEY = "sjc-admin";
const MAX_ROWS = 300;
function AdminPage() {
  const [ready, setReady] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  useEffect(() => {
    try {
      setUnlocked(window.sessionStorage.getItem(UNLOCK_KEY) === "1");
    } catch {
    }
    setReady(true);
  }, []);
  function lock() {
    try {
      window.sessionStorage.removeItem(UNLOCK_KEY);
    } catch {
    }
    setUnlocked(false);
  }
  if (!ready) return /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-gray-50" });
  if (!unlocked) return /* @__PURE__ */ jsx(PinGate, { onUnlock: () => setUnlocked(true) });
  return /* @__PURE__ */ jsx(AdminDashboard, { onLock: lock });
}
function PinGate({
  onUnlock
}) {
  const [pin, setPin] = useState("");
  const [wrong, setWrong] = useState(false);
  function submit(e) {
    e.preventDefault();
    if (pin.trim() === ADMIN_PIN) {
      try {
        window.sessionStorage.setItem(UNLOCK_KEY, "1");
      } catch {
      }
      onUnlock();
    } else {
      setWrong(true);
    }
  }
  return /* @__PURE__ */ jsx("div", { className: "min-h-[80vh] bg-gray-50 flex items-center justify-center px-4", children: /* @__PURE__ */ jsxs("form", { onSubmit: submit, className: "bg-white rounded-2xl shadow-sm p-8 w-full max-w-sm", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
      /* @__PURE__ */ jsx("span", { className: "bg-amber-500 text-gray-950 rounded-lg p-1.5", children: /* @__PURE__ */ jsx(Lock, { className: "w-5 h-5" }) }),
      /* @__PURE__ */ jsx("h1", { className: "text-lg font-semibold text-gray-900", children: "Admin" })
    ] }),
    /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 mb-6", children: "Enter the admin PIN to see every seller's sales." }),
    /* @__PURE__ */ jsx("input", { type: "password", inputMode: "numeric", autoComplete: "off", value: pin, onChange: (e) => {
      setPin(e.target.value);
      setWrong(false);
    }, placeholder: "Admin PIN", className: "w-full rounded-lg border border-gray-300 px-3 py-2 mb-2 focus:outline-none focus:ring-2 focus:ring-amber-500", autoFocus: true }),
    /* @__PURE__ */ jsx("p", { className: "text-sm text-red-600 min-h-5 mb-4", children: wrong ? "Wrong PIN. Try again." : "" }),
    /* @__PURE__ */ jsx("button", { type: "submit", className: "w-full bg-amber-500 hover:bg-amber-400 text-gray-950 font-semibold py-2.5 rounded-lg transition-colors", children: "Unlock" })
  ] }) });
}
function formatTime(d) {
  return d ? d.toLocaleString(void 0, {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  }) : "—";
}
function AdminDashboard({
  onLock
}) {
  const [tickets, setTickets] = useState(null);
  const [error, setError] = useState("");
  const [period, setPeriod] = useState("all");
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [search, setSearch] = useState("");
  useEffect(() => subscribeTickets(setTickets, setError), []);
  const rows = useMemo(() => newestFirst(filterPeriod(tickets ?? [], period)), [tickets, period]);
  const sellers = useMemo(() => summarizeBySeller(rows), [rows]);
  const trend = useMemo(() => salesByDay(tickets ?? []), [tickets]);
  const totalTickets = rows.length;
  const checkedIn = rows.filter((t) => t.checkedIn).length;
  const totalRevenue = rows.reduce((sum, t) => sum + amountOf(t), 0);
  const stats = [{
    title: "Tickets Sold",
    value: String(totalTickets),
    icon: Ticket,
    color: "bg-amber-500"
  }, {
    title: "Checked In",
    value: `${checkedIn} / ${totalTickets}`,
    icon: CheckCircle2,
    color: "bg-emerald-500"
  }, {
    title: "Revenue",
    value: `${EVENT.currency}${totalRevenue}`,
    icon: DollarSign,
    color: "bg-blue-500"
  }, {
    title: "Active Sellers",
    value: String(sellers.length),
    icon: Users,
    color: "bg-violet-500"
  }];
  const salesTrendData = {
    labels: trend.map((d) => d.label),
    datasets: [{
      label: "Tickets sold",
      data: trend.map((d) => d.count),
      borderColor: "rgb(245, 158, 11)",
      backgroundColor: "rgba(245, 158, 11, 0.1)",
      fill: true,
      tension: 0.4,
      pointBackgroundColor: "rgb(245, 158, 11)"
    }]
  };
  const revenueByType = {
    labels: TICKET_TYPES.map((t) => `${t.name} (${t.code})`),
    datasets: [{
      data: TICKET_TYPES.map((t) => rows.filter((r) => r.type === String(t.price)).reduce((sum, r) => sum + amountOf(r), 0)),
      backgroundColor: ["rgba(59, 130, 246, 0.8)", "rgba(245, 158, 11, 0.8)", "rgba(139, 92, 246, 0.8)"],
      borderWidth: 0
    }]
  };
  const sellerLeaderboard = {
    labels: sellers.map((s) => s.label),
    datasets: [{
      label: "Revenue",
      data: sellers.map((s) => s.revenue),
      backgroundColor: "rgba(16, 185, 129, 0.7)",
      borderRadius: 6
    }]
  };
  const q = search.trim().toLowerCase();
  const listed = rows.filter((r) => selectedSeller === null || sellerKey(r) === selectedSeller).filter((r) => !q || `${r.name} ${r.phone} ${r.number} ${r.soldBy}`.toLowerCase().includes(q));
  const selected = sellers.find((s) => s.key === selectedSeller);
  return /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-gray-50", children: /* @__PURE__ */ jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-start justify-between gap-3 mb-8", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold text-gray-900 mb-1", children: "Admin Dashboard" }),
        /* @__PURE__ */ jsxs("p", { className: "text-gray-500", children: [
          EVENT.name,
          " — ",
          EVENT.edition
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxs("select", { value: period, onChange: (e) => setPeriod(e.target.value), className: "rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500", "aria-label": "Time period", children: [
          /* @__PURE__ */ jsx("option", { value: "all", children: "All time" }),
          /* @__PURE__ */ jsx("option", { value: "today", children: "Today only" })
        ] }),
        /* @__PURE__ */ jsxs("button", { onClick: onLock, className: "inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-100", children: [
          /* @__PURE__ */ jsx(Lock, { className: "w-4 h-4" }),
          " Lock"
        ] })
      ] })
    ] }),
    error && /* @__PURE__ */ jsxs("p", { className: "mb-6 rounded-lg bg-red-50 text-red-700 text-sm px-4 py-3", children: [
      "Could not load sales: ",
      error
    ] }),
    tickets === null && !error && /* @__PURE__ */ jsx("p", { className: "mb-6 text-sm text-gray-500", children: "Loading sales…" }),
    /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8", children: stats.map((stat) => /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-xl shadow-sm p-6 flex items-center gap-4", children: [
      /* @__PURE__ */ jsx("div", { className: `${stat.color} p-3 rounded-lg`, children: /* @__PURE__ */ jsx(stat.icon, { className: "w-6 h-6 text-white" }) }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500", children: stat.title }),
        /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold text-gray-900", children: stat.value })
      ] })
    ] }, stat.title)) }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-xl shadow-sm overflow-hidden mb-8", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold text-gray-900 px-6 pt-6 pb-1", children: "Sales by seller" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 px-6 pb-4", children: "Select a seller to see only their sales below." }),
      /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsx("thead", { className: "bg-gray-50 text-gray-500 text-left", children: /* @__PURE__ */ jsxs("tr", { children: [
          /* @__PURE__ */ jsx("th", { className: "px-6 py-2 font-medium", children: "Seller" }),
          /* @__PURE__ */ jsx("th", { className: "px-6 py-2 font-medium", children: "Tickets" }),
          /* @__PURE__ */ jsx("th", { className: "px-6 py-2 font-medium", children: "Revenue" }),
          /* @__PURE__ */ jsx("th", { className: "px-6 py-2 font-medium", children: "Paid by" }),
          /* @__PURE__ */ jsx("th", { className: "px-6 py-2 font-medium", children: "Ticket types" })
        ] }) }),
        /* @__PURE__ */ jsxs("tbody", { className: "divide-y divide-gray-100", children: [
          sellers.map((s) => /* @__PURE__ */ jsxs("tr", { onClick: () => setSelectedSeller(selectedSeller === s.key ? null : s.key), className: `cursor-pointer hover:bg-gray-50 ${selectedSeller === s.key ? "bg-amber-50" : ""}`, children: [
            /* @__PURE__ */ jsx("td", { className: "px-6 py-3 font-medium text-gray-900", children: s.label }),
            /* @__PURE__ */ jsx("td", { className: "px-6 py-3 text-gray-600", children: s.count }),
            /* @__PURE__ */ jsxs("td", { className: "px-6 py-3 font-semibold text-gray-900", children: [
              EVENT.currency,
              s.revenue
            ] }),
            /* @__PURE__ */ jsx("td", { className: "px-6 py-3 text-gray-600", children: Object.entries(s.payments).map(([method, amount]) => `${method} ${EVENT.currency}${amount}`).join(" · ") }),
            /* @__PURE__ */ jsx("td", { className: "px-6 py-3 text-gray-600", children: Object.entries(s.types).map(([price, n]) => `${ticketTypeFor(price)?.name ?? EVENT.currency + price} ×${n}`).join(" · ") })
          ] }, s.key)),
          sellers.length === 0 && /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: 5, className: "px-6 py-8 text-center text-gray-400", children: "No sales yet." }) })
        ] })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-xl shadow-sm p-6", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold text-gray-900 mb-4", children: "Tickets Sold by Day" }),
        /* @__PURE__ */ jsx(Line, { data: salesTrendData, options: {
          responsive: true,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                precision: 0
              }
            }
          }
        } })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-xl shadow-sm p-6", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold text-gray-900 mb-4", children: "Revenue by Ticket Type" }),
        /* @__PURE__ */ jsx("div", { className: "max-w-sm mx-auto", children: /* @__PURE__ */ jsx(Doughnut, { data: revenueByType, options: {
          responsive: true,
          plugins: {
            legend: {
              position: "bottom"
            }
          }
        } }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-xl shadow-sm p-6 lg:col-span-2", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold text-gray-900 mb-4", children: "Seller Leaderboard" }),
        /* @__PURE__ */ jsx(Bar, { data: sellerLeaderboard, options: {
          responsive: true,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: true
            }
          }
        } })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-xl shadow-sm overflow-hidden", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3 px-6 pt-6 pb-4", children: [
        /* @__PURE__ */ jsxs("h2", { className: "text-lg font-semibold text-gray-900", children: [
          selected ? `Sales by ${selected.label}` : "All Sales",
          " (",
          listed.length,
          ")"
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          selected && /* @__PURE__ */ jsx("button", { onClick: () => setSelectedSeller(null), className: "text-sm text-amber-700 underline", children: "Show all sellers" }),
          /* @__PURE__ */ jsxs("label", { className: "relative", children: [
            /* @__PURE__ */ jsx(Search, { className: "w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" }),
            /* @__PURE__ */ jsx("input", { value: search, onChange: (e) => setSearch(e.target.value), placeholder: "Search name, phone, ticket no.", className: "rounded-lg border border-gray-300 pl-9 pr-3 py-2 text-sm w-64 max-w-full focus:outline-none focus:ring-2 focus:ring-amber-500" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsx("thead", { className: "bg-gray-50 text-gray-500 text-left", children: /* @__PURE__ */ jsxs("tr", { children: [
          /* @__PURE__ */ jsx("th", { className: "px-6 py-2 font-medium", children: "Customer" }),
          /* @__PURE__ */ jsx("th", { className: "px-6 py-2 font-medium", children: "Type" }),
          /* @__PURE__ */ jsx("th", { className: "px-6 py-2 font-medium", children: "Amount" }),
          /* @__PURE__ */ jsx("th", { className: "px-6 py-2 font-medium", children: "Payment" }),
          /* @__PURE__ */ jsx("th", { className: "px-6 py-2 font-medium", children: "Sold By" }),
          /* @__PURE__ */ jsx("th", { className: "px-6 py-2 font-medium", children: "Location" }),
          /* @__PURE__ */ jsx("th", { className: "px-6 py-2 font-medium", children: "Sold" }),
          /* @__PURE__ */ jsx("th", { className: "px-6 py-2 font-medium", children: "Status" })
        ] }) }),
        /* @__PURE__ */ jsxs("tbody", { className: "divide-y divide-gray-100", children: [
          listed.slice(0, MAX_ROWS).map((t) => /* @__PURE__ */ jsxs("tr", { children: [
            /* @__PURE__ */ jsxs("td", { className: "px-6 py-3 text-gray-900", children: [
              t.name || "Guest",
              /* @__PURE__ */ jsxs("span", { className: "block text-xs text-gray-500", children: [
                t.phone,
                " · #",
                t.number
              ] })
            ] }),
            /* @__PURE__ */ jsx("td", { className: "px-6 py-3 text-gray-600", children: ticketTypeFor(t.type)?.name ?? "—" }),
            /* @__PURE__ */ jsxs("td", { className: "px-6 py-3 text-gray-900 font-medium", children: [
              EVENT.currency,
              amountOf(t)
            ] }),
            /* @__PURE__ */ jsx("td", { className: "px-6 py-3 text-gray-600", children: t.payment }),
            /* @__PURE__ */ jsx("td", { className: "px-6 py-3 text-gray-600", children: t.soldBy || UNASSIGNED }),
            /* @__PURE__ */ jsx("td", { className: "px-6 py-3 text-gray-600", children: t.location || "—" }),
            /* @__PURE__ */ jsx("td", { className: "px-6 py-3 text-gray-600 whitespace-nowrap", children: formatTime(t.timestamp) }),
            /* @__PURE__ */ jsx("td", { className: "px-6 py-3", children: /* @__PURE__ */ jsx("span", { className: `px-2 py-1 rounded-full text-xs font-medium ${t.checkedIn ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`, children: t.checkedIn ? "Checked in" : "Active" }) })
          ] }, t.number)),
          listed.length === 0 && /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: 8, className: "px-6 py-8 text-center text-gray-400", children: "No sales match." }) })
        ] })
      ] }) }),
      listed.length > MAX_ROWS && /* @__PURE__ */ jsxs("p", { className: "px-6 py-3 text-xs text-gray-500 border-t border-gray-100", children: [
        "Showing the latest ",
        MAX_ROWS,
        " of ",
        listed.length,
        ". Search or pick a seller to narrow it down."
      ] })
    ] })
  ] }) });
}
export {
  AdminPage as component
};
