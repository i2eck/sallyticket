import { jsx, jsxs } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import { Ticket, ScanLine, LayoutDashboard, ArrowRight } from "lucide-react";
import { E as EVENT } from "./router-CtCIkKPA.js";
import "react";
import "chart.js";
const tools = [{
  to: "/sell",
  title: "Sell tickets",
  description: "Sign in with your name and booth, issue QR tickets, share on WhatsApp.",
  icon: Ticket,
  color: "bg-amber-500 text-gray-950"
}, {
  to: "/checkin",
  title: "Gate check-in",
  description: "Scan QR codes or type ticket numbers. Marks each ticket used once.",
  icon: ScanLine,
  color: "bg-emerald-600 text-white"
}, {
  to: "/admin",
  title: "Admin dashboard",
  description: "Live sales totals, charts, and every ticket. PIN protected.",
  icon: LayoutDashboard,
  color: "bg-purple-800 text-amber-100"
}];
function StaffPortal() {
  return /* @__PURE__ */ jsx("div", { className: "min-h-[80vh] bg-gray-100", children: /* @__PURE__ */ jsxs("div", { className: "max-w-3xl mx-auto px-4 py-12", children: [
    /* @__PURE__ */ jsx("p", { className: "text-xs font-bold tracking-[0.2em] uppercase text-amber-700", children: "Staff only" }),
    /* @__PURE__ */ jsx("h1", { className: "mt-2 text-3xl font-bold text-gray-950 font-serif", children: EVENT.name }),
    /* @__PURE__ */ jsxs("p", { className: "mt-2 text-gray-600", children: [
      "Tools for sellers, gate team, and organisers. Guests should use the",
      " ",
      /* @__PURE__ */ jsx(Link, { to: "/", className: "text-amber-800 font-medium underline underline-offset-2", children: "public event page" }),
      "."
    ] }),
    /* @__PURE__ */ jsx("div", { className: "mt-10 grid gap-4", children: tools.map((tool) => /* @__PURE__ */ jsxs(Link, { to: tool.to, className: "group flex items-start gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm hover:border-amber-400 hover:shadow-md transition-all", children: [
      /* @__PURE__ */ jsx("span", { className: `rounded-xl p-3 ${tool.color}`, children: /* @__PURE__ */ jsx(tool.icon, { className: "w-6 h-6" }) }),
      /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
        /* @__PURE__ */ jsx("p", { className: "font-bold text-gray-950 text-lg group-hover:text-amber-900", children: tool.title }),
        /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-gray-600", children: tool.description })
      ] }),
      /* @__PURE__ */ jsx(ArrowRight, { className: "w-5 h-5 text-gray-300 group-hover:text-amber-600 shrink-0 mt-1" })
    ] }, tool.to)) }),
    /* @__PURE__ */ jsxs("p", { className: "mt-10 text-center text-xs text-gray-400", children: [
      "Bookmark this page for event day: ",
      /* @__PURE__ */ jsx("span", { className: "font-mono", children: "/staff" })
    ] })
  ] }) });
}
export {
  StaffPortal as component
};
