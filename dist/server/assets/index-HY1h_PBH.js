import { jsxs, jsx } from "react/jsx-runtime";
import { CalendarDays, Clock, MapPin, Sparkles, BookOpen, Mic2, Music, Users, Ticket, QrCode, Church } from "lucide-react";
import { E as EVENT, T as TICKET_TYPES, M as MOBILE_MONEY_NUMBERS } from "./router-CtCIkKPA.js";
import "@tanstack/react-router";
import "react";
import "chart.js";
const highlightIcons = {
  "Live Music": Music,
  Rap: Mic2,
  Poetry: BookOpen,
  "Dance & Drama": Sparkles
};
function Home() {
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-[#fbf4df]", children: [
    /* @__PURE__ */ jsxs("section", { className: "relative", children: [
      /* @__PURE__ */ jsxs("div", { className: "absolute inset-0", children: [
        /* @__PURE__ */ jsx("img", { src: "/img/hero.jpg", alt: "", className: "w-full h-full object-cover object-center" }),
        /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-[#1a0f14] via-[#1a0f14]/80 to-[#1a0f14]/45" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-28 sm:py-36 text-center", children: [
        /* @__PURE__ */ jsx("p", { className: "text-[#e6bd65] font-semibold tracking-[0.2em] uppercase text-sm mb-4", children: EVENT.edition }),
        /* @__PURE__ */ jsx("h1", { className: "text-4xl sm:text-6xl font-bold text-[#fbf4df] leading-tight font-serif", children: EVENT.name }),
        /* @__PURE__ */ jsxs("p", { className: "mt-4 text-lg text-[#f0e6c8] italic", children: [
          "“",
          EVENT.motto,
          "”"
        ] }),
        /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-[#c99b39]", children: "1 Corinthians 1:16" }),
        /* @__PURE__ */ jsxs("div", { className: "mt-8 flex flex-wrap items-center justify-center gap-3 text-[#f0e6c8] text-sm", children: [
          /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1.5 bg-white/10 rounded-full px-4 py-1.5 border border-[#c99b39]/40", children: [
            /* @__PURE__ */ jsx(CalendarDays, { className: "w-4 h-4 text-[#e6bd65]" }),
            " ",
            EVENT.date
          ] }),
          /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1.5 bg-white/10 rounded-full px-4 py-1.5 border border-[#c99b39]/40", children: [
            /* @__PURE__ */ jsx(Clock, { className: "w-4 h-4 text-[#e6bd65]" }),
            " Doors ",
            EVENT.doors
          ] }),
          /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1.5 bg-white/10 rounded-full px-4 py-1.5 border border-[#c99b39]/40", children: [
            /* @__PURE__ */ jsx(MapPin, { className: "w-4 h-4 text-[#e6bd65]" }),
            " ",
            EVENT.venue
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "mt-10", children: /* @__PURE__ */ jsx("a", { href: "#tickets", className: "inline-flex items-center gap-2 bg-[#c99b39] hover:bg-[#e6bd65] text-[#1a0f14] font-semibold px-7 py-3 rounded-lg transition-colors", children: "See ticket prices" }) })
      ] })
    ] }),
    /* @__PURE__ */ jsx("section", { className: "max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14", children: /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-6", children: EVENT.highlights.map((h) => {
      const Icon = highlightIcons[h];
      return /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
        /* @__PURE__ */ jsx("div", { className: "inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#2a0c38] text-[#e6bd65] mb-3", children: Icon ? /* @__PURE__ */ jsx(Icon, { className: "w-6 h-6" }) : /* @__PURE__ */ jsx(Sparkles, { className: "w-6 h-6" }) }),
        /* @__PURE__ */ jsx("p", { className: "font-medium text-[#2a0c38]", children: h })
      ] }, h);
    }) }) }),
    /* @__PURE__ */ jsx("section", { id: "tickets", className: "bg-white py-20 border-y border-[#c99b39]/30", children: /* @__PURE__ */ jsxs("div", { className: "max-w-6xl mx-auto px-4 sm:px-6 lg:px-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "text-center mb-12", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-3xl font-bold text-[#2a0c38] font-serif", children: "Ticket prices" }),
        /* @__PURE__ */ jsx("p", { className: "mt-2 text-[#5c3d4a] max-w-xl mx-auto", children: "Choose the experience that suits you. Tickets are sold in person and issued as a QR code you show at the gate." })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-6", children: TICKET_TYPES.map((t) => /* @__PURE__ */ jsxs("div", { className: `relative rounded-2xl p-8 flex flex-col border-2 ${t.popular ? "border-[#c99b39] bg-[#fbf4df] shadow-md" : "border-[#e8dcc0] bg-[#fffdf7]"}`, children: [
        t.popular && /* @__PURE__ */ jsx("span", { className: "absolute -top-3 left-1/2 -translate-x-1/2 bg-[#c99b39] text-[#1a0f14] text-xs font-bold px-3 py-1 rounded-full", children: "Most popular" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm font-bold text-[#8b5a18] uppercase tracking-wide", children: t.name }),
        /* @__PURE__ */ jsxs("p", { className: "mt-2 text-4xl font-bold text-[#2a0c38]", children: [
          EVENT.currency,
          t.price
        ] }),
        /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-[#5c3d4a]", children: t.tagline }),
        /* @__PURE__ */ jsx("ul", { className: "mt-6 space-y-2 flex-1", children: t.perks.map((perk) => /* @__PURE__ */ jsxs("li", { className: "text-sm text-[#2a0c38] flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-[#c99b39]", children: "✓" }),
          perk
        ] }, perk)) })
      ] }, t.id)) })
    ] }) }),
    /* @__PURE__ */ jsx("section", { id: "how-to-buy", className: "py-20 bg-[#fbf4df]", children: /* @__PURE__ */ jsxs("div", { className: "max-w-4xl mx-auto px-4 sm:px-6 lg:px-8", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-3xl font-bold text-[#2a0c38] font-serif text-center", children: "How to get your ticket" }),
      /* @__PURE__ */ jsx("p", { className: "mt-2 text-center text-[#5c3d4a]", children: "Tickets are sold in person — no online checkout required." }),
      /* @__PURE__ */ jsxs("div", { className: "mt-12 grid gap-8 sm:grid-cols-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
          /* @__PURE__ */ jsx("div", { className: "mx-auto w-14 h-14 rounded-full bg-[#2a0c38] text-[#e6bd65] flex items-center justify-center mb-4", children: /* @__PURE__ */ jsx(Users, { className: "w-7 h-7" }) }),
          /* @__PURE__ */ jsx("p", { className: "font-bold text-[#2a0c38]", children: "1. Find a seller" }),
          /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-[#5c3d4a]", children: "Buy from an official Sally Joy Camps booth or authorised seller." })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
          /* @__PURE__ */ jsx("div", { className: "mx-auto w-14 h-14 rounded-full bg-[#2a0c38] text-[#e6bd65] flex items-center justify-center mb-4", children: /* @__PURE__ */ jsx(Ticket, { className: "w-7 h-7" }) }),
          /* @__PURE__ */ jsx("p", { className: "font-bold text-[#2a0c38]", children: "2. Pay & receive QR" }),
          /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-[#5c3d4a]", children: "Pay cash or mobile money. You get a digital ticket with a QR code (often via WhatsApp)." }),
          /* @__PURE__ */ jsxs("div", { className: "mt-3 rounded-lg border border-[#c99b39]/60 bg-white/60 p-3 text-left", children: [
            /* @__PURE__ */ jsx("p", { className: "text-[11px] font-bold uppercase tracking-wider text-[#8b5a18]", children: "Mobile money" }),
            /* @__PURE__ */ jsx("ul", { className: "mt-1 space-y-0.5", children: MOBILE_MONEY_NUMBERS.map((m) => /* @__PURE__ */ jsxs("li", { className: "text-sm text-[#2a0c38]", children: [
              /* @__PURE__ */ jsx("span", { className: "font-mono font-semibold", children: m.number }),
              " ",
              /* @__PURE__ */ jsxs("span", { className: "text-[#5c3d4a]", children: [
                "— ",
                m.name
              ] })
            ] }, m.number)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
          /* @__PURE__ */ jsx("div", { className: "mx-auto w-14 h-14 rounded-full bg-[#2a0c38] text-[#e6bd65] flex items-center justify-center mb-4", children: /* @__PURE__ */ jsx(QrCode, { className: "w-7 h-7" }) }),
          /* @__PURE__ */ jsx("p", { className: "font-bold text-[#2a0c38]", children: "3. Show at the gate" }),
          /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-[#5c3d4a]", children: "Present your QR on the day. Each ticket is valid for one entry only." })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx("section", { id: "when-where", className: "py-20 bg-[#2a0c38] text-[#fbf4df]", children: /* @__PURE__ */ jsxs("div", { className: "max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-3xl font-bold font-serif", children: "When & where" }),
      /* @__PURE__ */ jsxs("div", { className: "mt-10 grid gap-8 sm:grid-cols-2 text-left", children: [
        /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-[#c99b39]/40 bg-[#1a0f14]/50 p-6", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 text-[#e6bd65] font-semibold", children: [
            /* @__PURE__ */ jsx(CalendarDays, { className: "w-5 h-5" }),
            "Date & time"
          ] }),
          /* @__PURE__ */ jsx("p", { className: "mt-3 text-lg font-medium", children: EVENT.date }),
          /* @__PURE__ */ jsxs("p", { className: "mt-1 text-[#d4b87a]", children: [
            "Doors open ",
            EVENT.doors
          ] }),
          /* @__PURE__ */ jsxs("p", { className: "text-[#d4b87a]", children: [
            "Programme ",
            EVENT.time
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-[#c99b39]/40 bg-[#1a0f14]/50 p-6", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 text-[#e6bd65] font-semibold", children: [
            /* @__PURE__ */ jsx(Church, { className: "w-5 h-5" }),
            "Venue"
          ] }),
          /* @__PURE__ */ jsx("p", { className: "mt-3 text-lg font-medium", children: EVENT.venue }),
          /* @__PURE__ */ jsx("p", { className: "mt-1 text-[#d4b87a]", children: EVENT.location }),
          /* @__PURE__ */ jsxs("p", { className: "mt-3 text-sm text-[#c99b39] flex items-start gap-2", children: [
            /* @__PURE__ */ jsx(MapPin, { className: "w-4 h-4 shrink-0 mt-0.5" }),
            "Come early for a good seat — VIP tickets include front-row access."
          ] })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx("footer", { className: "bg-[#1a0f14] text-[#a89070] py-10", children: /* @__PURE__ */ jsxs("div", { className: "max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm", children: [
      /* @__PURE__ */ jsx("p", { className: "text-[#fbf4df] font-semibold font-serif text-lg", children: EVENT.name }),
      /* @__PURE__ */ jsx("p", { className: "mt-1 text-[#e6bd65]", children: EVENT.edition }),
      /* @__PURE__ */ jsxs("p", { className: "mt-3", children: [
        EVENT.date,
        " · ",
        EVENT.time
      ] }),
      /* @__PURE__ */ jsxs("p", { children: [
        EVENT.venue,
        ", ",
        EVENT.location
      ] }),
      /* @__PURE__ */ jsx("p", { className: "mt-6 text-xs text-[#6b5344]", children: "Official guest information site. Ticket sales are handled in person by authorised sellers only." })
    ] }) })
  ] });
}
export {
  Home as component
};
