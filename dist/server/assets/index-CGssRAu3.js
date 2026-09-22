import { jsxs, jsx } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import { CalendarDays, Clock, MapPin, ArrowRight, Sparkles, BookOpen, Mic2, Music } from "lucide-react";
import { E as EVENT, T as TICKET_TYPES } from "./router-DVLsTF45.js";
import "react";
import "chart.js";
const highlightIcons = {
  "Live Music": Music,
  Rap: Mic2,
  Poetry: BookOpen,
  "Dance & Drama": Sparkles
};
function Home() {
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-white", children: [
    /* @__PURE__ */ jsxs("section", { className: "relative", children: [
      /* @__PURE__ */ jsxs("div", { className: "absolute inset-0", children: [
        /* @__PURE__ */ jsx("img", { src: "/.netlify/images?url=/img/hero.jpg&w=1920&fm=webp&q=80", alt: "", className: "w-full h-full object-cover object-center" }),
        /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/75 to-gray-950/50" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-28 sm:py-36 text-center", children: [
        /* @__PURE__ */ jsx("p", { className: "text-amber-400 font-semibold tracking-wide uppercase text-sm mb-4", children: EVENT.edition }),
        /* @__PURE__ */ jsx("h1", { className: "text-4xl sm:text-6xl font-bold text-white leading-tight", children: EVENT.name }),
        /* @__PURE__ */ jsxs("p", { className: "mt-4 text-lg text-gray-200 italic", children: [
          "“",
          EVENT.motto,
          "”"
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mt-8 flex flex-wrap items-center justify-center gap-3 text-gray-200 text-sm", children: [
          /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1.5 bg-white/10 rounded-full px-4 py-1.5", children: [
            /* @__PURE__ */ jsx(CalendarDays, { className: "w-4 h-4" }),
            " ",
            EVENT.date
          ] }),
          /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1.5 bg-white/10 rounded-full px-4 py-1.5", children: [
            /* @__PURE__ */ jsx(Clock, { className: "w-4 h-4" }),
            " Doors ",
            EVENT.doors
          ] }),
          /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1.5 bg-white/10 rounded-full px-4 py-1.5", children: [
            /* @__PURE__ */ jsx(MapPin, { className: "w-4 h-4" }),
            " ",
            EVENT.venue,
            ", ",
            EVENT.location
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mt-10 flex flex-wrap items-center justify-center gap-4", children: [
          /* @__PURE__ */ jsxs("a", { href: "#tickets", className: "inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-gray-950 font-semibold px-6 py-3 rounded-lg transition-colors", children: [
            "See Ticket Prices ",
            /* @__PURE__ */ jsx(ArrowRight, { className: "w-4 h-4" })
          ] }),
          /* @__PURE__ */ jsx(Link, { to: "/sell", className: "inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-3 rounded-lg border border-white/20 transition-colors", children: "I'm a Seller" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx("section", { className: "max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14", children: /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-6", children: EVENT.highlights.map((h) => {
      const Icon = highlightIcons[h];
      return /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
        /* @__PURE__ */ jsx("div", { className: "inline-flex items-center justify-center w-14 h-14 rounded-full bg-amber-100 text-amber-600 mb-3", children: /* @__PURE__ */ jsx(Icon, { className: "w-6 h-6" }) }),
        /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-900", children: h })
      ] }, h);
    }) }) }),
    /* @__PURE__ */ jsx("section", { id: "tickets", className: "bg-gray-50 py-20", children: /* @__PURE__ */ jsxs("div", { className: "max-w-6xl mx-auto px-4 sm:px-6 lg:px-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "text-center mb-12", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-3xl font-bold text-gray-900", children: "Ticket Prices" }),
        /* @__PURE__ */ jsx("p", { className: "mt-2 text-gray-600", children: "Tickets are sold in person at the booths below and issued instantly as a QR code ticket." })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-6", children: TICKET_TYPES.map((t) => /* @__PURE__ */ jsxs("div", { className: `relative bg-white rounded-2xl shadow-sm p-8 border-2 flex flex-col ${t.popular ? "border-amber-500" : "border-transparent"}`, children: [
        t.popular && /* @__PURE__ */ jsx("span", { className: "absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-gray-950 text-xs font-semibold px-3 py-1 rounded-full", children: "Most Popular" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold text-amber-600 uppercase tracking-wide", children: t.name }),
        /* @__PURE__ */ jsxs("p", { className: "mt-2 text-4xl font-bold text-gray-900", children: [
          EVENT.currency,
          t.price
        ] }),
        /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-gray-500", children: t.tagline }),
        /* @__PURE__ */ jsx("ul", { className: "mt-6 space-y-2 flex-1", children: t.perks.map((perk) => /* @__PURE__ */ jsxs("li", { className: "text-sm text-gray-700 flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-amber-500", children: "•" }),
          perk
        ] }, perk)) }),
        /* @__PURE__ */ jsxs(Link, { to: "/sell", search: {
          type: t.id
        }, className: "mt-6 inline-flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white font-medium px-4 py-2.5 rounded-lg transition-colors", children: [
          "Issue this ticket ",
          /* @__PURE__ */ jsx(ArrowRight, { className: "w-4 h-4" })
        ] })
      ] }, t.id)) })
    ] }) }),
    /* @__PURE__ */ jsx("footer", { className: "bg-gray-950 text-gray-400 py-10", children: /* @__PURE__ */ jsxs("div", { className: "max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm", children: [
      /* @__PURE__ */ jsxs("p", { className: "text-white font-semibold", children: [
        EVENT.name,
        " — ",
        EVENT.edition
      ] }),
      /* @__PURE__ */ jsxs("p", { className: "mt-1", children: [
        EVENT.date,
        " · ",
        EVENT.time,
        " · ",
        EVENT.venue,
        ", ",
        EVENT.location
      ] })
    ] }) })
  ] });
}
export {
  Home as component
};
