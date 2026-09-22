import { jsx, jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import QRCode from "qrcode";
import { Download } from "lucide-react";
import { a as Route, E as EVENT } from "./router-DVLsTF45.js";
import { f as fetchTicket, t as ticketTypeFor } from "./tickets-BS0suPY1.js";
import { q as qrPayload } from "./ticket-codes-BsMg6B1x.js";
import { d as downloadTicketImage } from "./ticket-image-qqvtVFW4.js";
import "@tanstack/react-router";
import "chart.js";
import "firebase/firestore";
import "firebase/app";
function TicketPage() {
  const {
    id
  } = Route.useParams();
  const [state, setState] = useState({
    status: "loading"
  });
  useEffect(() => {
    let alive = true;
    const number = id.trim().toUpperCase();
    fetchTicket(number).then(async (ticket) => {
      if (!alive) return;
      if (!ticket) {
        setState({
          status: "missing"
        });
        return;
      }
      const qr = await QRCode.toDataURL(qrPayload(ticket.number), {
        width: 280,
        margin: 1,
        color: {
          dark: "#21082f",
          light: "#ffffff"
        }
      });
      if (alive) setState({
        status: "ok",
        ticket,
        qr
      });
    }).catch((error) => {
      console.error(error);
      if (alive) setState({
        status: "error"
      });
    });
    return () => {
      alive = false;
    };
  }, [id]);
  const type = state.status === "ok" ? ticketTypeFor(state.ticket.type) : void 0;
  return /* @__PURE__ */ jsx("div", { className: "min-h-[80vh] flex items-center justify-center px-4 py-10 bg-[#1a0f14]", children: /* @__PURE__ */ jsxs("div", { className: "w-full max-w-sm overflow-hidden rounded-2xl border-2 border-[#c99b39] shadow-2xl bg-[#fbf4df]", children: [
    /* @__PURE__ */ jsxs("div", { className: "bg-[#2a0c38] text-center px-6 py-6 border-b-4 border-[#c99b39]", children: [
      /* @__PURE__ */ jsx("p", { className: "text-[11px] tracking-[0.2em] uppercase text-[#e6bd65] font-semibold", children: EVENT.edition }),
      /* @__PURE__ */ jsx("p", { className: "mt-1 text-2xl font-bold text-[#fbf4df] font-serif", children: EVENT.name }),
      type && /* @__PURE__ */ jsxs("p", { className: "mt-3 inline-block rounded-full bg-[#c99b39] text-[#21082f] text-sm font-bold px-4 py-1", children: [
        type.name,
        " · ",
        EVENT.currency,
        type.price
      ] })
    ] }),
    state.status === "loading" && /* @__PURE__ */ jsx("p", { className: "p-10 text-center text-[#5c3d4a]", children: "Loading your ticket…" }),
    state.status === "missing" && /* @__PURE__ */ jsx("p", { className: "p-10 text-center text-[#5c3d4a]", children: "We could not find this ticket. Check the link, or ask the seller who issued it." }),
    state.status === "error" && /* @__PURE__ */ jsx("p", { className: "p-10 text-center text-[#5c3d4a]", children: "Could not load the ticket. Check your internet connection and try again." }),
    state.status === "ok" && /* @__PURE__ */ jsxs("div", { className: "p-6 text-center", children: [
      /* @__PURE__ */ jsxs("p", { className: "italic text-[#2a0c38] text-sm leading-snug", children: [
        "“",
        EVENT.motto,
        "”"
      ] }),
      /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-[#8b5a18]", children: "1 Corinthians 1:16" }),
      /* @__PURE__ */ jsx("div", { className: "mt-5 mx-auto w-fit rounded-xl border-2 border-[#c99b39] bg-white p-2", children: /* @__PURE__ */ jsx("img", { src: state.qr, alt: "Ticket QR code", className: "w-52 h-52" }) }),
      /* @__PURE__ */ jsx("p", { className: "mt-3 font-serif text-xl font-bold text-[#2a0c38] tracking-wide", children: state.ticket.number }),
      /* @__PURE__ */ jsx("p", { className: "text-[11px] font-semibold tracking-widest text-[#8b5a18] uppercase mt-1", children: "Scan to verify · Admit one" }),
      state.ticket.checkedIn && /* @__PURE__ */ jsx("p", { className: "mt-4 rounded-lg bg-amber-100 text-amber-900 text-sm font-medium px-3 py-2 border border-amber-300", children: "This ticket has already been used to enter." }),
      /* @__PURE__ */ jsxs("div", { className: "mt-5 border-t border-[#c99b39]/40 pt-4", children: [
        /* @__PURE__ */ jsx("p", { className: "text-[11px] font-bold tracking-wider text-[#8b5a18] uppercase", children: "Ticket holder" }),
        /* @__PURE__ */ jsx("p", { className: "mt-1 text-lg font-bold text-[#2a0c38]", children: state.ticket.name })
      ] }),
      /* @__PURE__ */ jsxs("p", { className: "mt-4 text-sm text-[#2a0c38] leading-relaxed", children: [
        EVENT.date,
        /* @__PURE__ */ jsx("br", {}),
        EVENT.time,
        /* @__PURE__ */ jsx("br", {}),
        EVENT.venue,
        ", ",
        EVENT.location
      ] }),
      /* @__PURE__ */ jsx("p", { className: "mt-4 text-[11px] text-[#8b5a18]", children: "Valid for one entry · Non-transferable · Non-refundable" }),
      /* @__PURE__ */ jsxs("button", { onClick: () => void downloadTicketImage(state.ticket).catch((e) => console.error(e)), className: "mt-5 inline-flex items-center gap-2 bg-[#2a0c38] hover:bg-[#3c1353] text-[#fbf4df] text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors border border-[#c99b39]", children: [
        /* @__PURE__ */ jsx(Download, { className: "w-4 h-4" }),
        " Save as image"
      ] })
    ] })
  ] }) });
}
export {
  TicketPage as component
};
