import { jsx, jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import QRCode from "qrcode";
import { Ticket, CheckCircle2, MessageCircle, Download, Printer } from "lucide-react";
import { R as Route, E as EVENT, T as TICKET_TYPES, P as PAYMENT_METHODS } from "./router-DVLsTF45.js";
import { s as subscribeSellerTickets, t as ticketTypeFor, a as saveTicket } from "./tickets-BS0suPY1.js";
import { f as filterPeriod, a as amountOf, n as newestFirst } from "./sales-CSJr0JZy.js";
import { n as newTicketNumber, q as qrPayload } from "./ticket-codes-BsMg6B1x.js";
import { s as shareTicketImage, d as downloadTicketImage } from "./ticket-image-qqvtVFW4.js";
import "@tanstack/react-router";
import "chart.js";
import "firebase/firestore";
import "firebase/app";
const SELLER_KEY = "sjc-seller";
function SellPage() {
  const {
    type
  } = Route.useSearch();
  const [seller, setSeller] = useState(null);
  const [nameInput, setNameInput] = useState("");
  const [locationInput, setLocationInput] = useState("");
  const [mine, setMine] = useState([]);
  const [lastIssued, setLastIssued] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [notice, setNotice] = useState("");
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(SELLER_KEY);
      if (saved) setSeller(JSON.parse(saved));
    } catch {
    }
  }, []);
  useEffect(() => {
    if (!seller) return;
    return subscribeSellerTickets(seller.name, setMine, (message) => console.error(message));
  }, [seller]);
  function handleSignIn(e) {
    e.preventDefault();
    const name = nameInput.replace(/\s+/g, " ").trim();
    const location = locationInput.replace(/\s+/g, " ").trim();
    if (name.length < 2 || !location) return;
    const next = {
      name,
      location
    };
    setSeller(next);
    window.localStorage.setItem(SELLER_KEY, JSON.stringify(next));
  }
  function handleSignOut() {
    setSeller(null);
    setMine([]);
    setLastIssued(null);
    window.localStorage.removeItem(SELLER_KEY);
  }
  async function handleSell(e) {
    e.preventDefault();
    if (!seller) return;
    const formEl = e.currentTarget;
    const form = new FormData(formEl);
    const customerName = String(form.get("customerName") ?? "").trim();
    const customerPhone = String(form.get("customerPhone") ?? "").trim();
    const ticketTypeId = String(form.get("ticketType") ?? TICKET_TYPES[0].id);
    const paymentMethod = String(form.get("paymentMethod") ?? PAYMENT_METHODS[0]);
    if (!customerName || !customerPhone) return;
    const ticketType = TICKET_TYPES.find((t) => t.id === ticketTypeId) ?? TICKET_TYPES[0];
    const number = newTicketNumber();
    setGenerating(true);
    setNotice("");
    try {
      const qrDataUrl = await QRCode.toDataURL(qrPayload(number), {
        width: 240,
        margin: 1
      });
      const ticket = {
        number,
        name: customerName,
        phone: customerPhone,
        type: String(ticketType.price),
        payment: paymentMethod,
        soldBy: seller.name,
        location: seller.location,
        timestamp: /* @__PURE__ */ new Date(),
        checkedIn: false,
        checkedInAt: null
      };
      setLastIssued({
        ticket,
        qrDataUrl,
        status: "saving"
      });
      formEl.reset();
      void saveTicket(ticket).then((status) => setLastIssued((cur) => cur && cur.ticket.number === number ? {
        ...cur,
        status
      } : cur));
    } catch (error) {
      console.error(error);
      setNotice("Could not generate the ticket. Please try again.");
    } finally {
      setGenerating(false);
    }
  }
  async function handleShare(ticket) {
    try {
      const result = await shareTicketImage(ticket, `${window.location.origin}/ticket/${ticket.number}`);
      setNotice(result === "saved" ? "Ticket image saved. In WhatsApp, attach it (paperclip) and send." : "");
    } catch (error) {
      console.error(error);
      setNotice("Could not create the ticket image. Use Print, or screenshot the QR code.");
    }
  }
  async function handleDownload(ticket) {
    try {
      await downloadTicketImage(ticket);
    } catch (error) {
      console.error(error);
      setNotice("Could not create the ticket image. Use Print, or screenshot the QR code.");
    }
  }
  const today = filterPeriod(mine, "today");
  const revenueByMe = mine.reduce((sum, t) => sum + amountOf(t), 0);
  const recent = newestFirst(mine).slice(0, 8);
  if (!seller) {
    return /* @__PURE__ */ jsx("div", { className: "min-h-[80vh] bg-gray-50 flex items-center justify-center px-4", children: /* @__PURE__ */ jsxs("form", { onSubmit: handleSignIn, className: "bg-white rounded-2xl shadow-sm p-8 w-full max-w-sm", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-6", children: [
        /* @__PURE__ */ jsx("span", { className: "bg-amber-500 text-gray-950 rounded-lg p-1.5", children: /* @__PURE__ */ jsx(Ticket, { className: "w-5 h-5" }) }),
        /* @__PURE__ */ jsx("h1", { className: "text-lg font-semibold text-gray-900", children: "Seller Sign In" })
      ] }),
      /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Your name" }),
      /* @__PURE__ */ jsx("input", { value: nameInput, onChange: (e) => setNameInput(e.target.value), placeholder: "e.g. John Banda", className: "w-full rounded-lg border border-gray-300 px-3 py-2 mb-1 focus:outline-none focus:ring-2 focus:ring-amber-500", required: true, minLength: 2, maxLength: 40 }),
      /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 mb-4", children: "Use the same name every time. Your sales are recorded under it." }),
      /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Booth / location" }),
      /* @__PURE__ */ jsx("input", { value: locationInput, onChange: (e) => setLocationInput(e.target.value), placeholder: "e.g. Main Gate Booth 1", className: "w-full rounded-lg border border-gray-300 px-3 py-2 mb-6 focus:outline-none focus:ring-2 focus:ring-amber-500", required: true }),
      /* @__PURE__ */ jsx("button", { type: "submit", className: "w-full bg-amber-500 hover:bg-amber-400 text-gray-950 font-semibold py-2.5 rounded-lg transition-colors", children: "Sign In" })
    ] }) });
  }
  return /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-gray-50", children: /* @__PURE__ */ jsxs("div", { className: "max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-8", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "Sell a Ticket" }),
        /* @__PURE__ */ jsxs("p", { className: "text-sm text-gray-500", children: [
          seller.name,
          " · ",
          seller.location
        ] })
      ] }),
      /* @__PURE__ */ jsx("button", { onClick: handleSignOut, className: "text-sm text-gray-500 hover:text-gray-800 underline", children: "Sign out" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-xl shadow-sm p-5", children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500", children: "Sold today" }),
        /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold text-gray-900", children: today.length }),
        /* @__PURE__ */ jsxs("p", { className: "text-xs text-gray-400 mt-1", children: [
          mine.length,
          " in total"
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-xl shadow-sm p-5", children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500", children: "Your revenue" }),
        /* @__PURE__ */ jsxs("p", { className: "text-2xl font-bold text-gray-900", children: [
          EVENT.currency,
          revenueByMe
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-xl shadow-sm p-5", children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500", children: "Location" }),
        /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold text-gray-900", children: seller.location })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [
      /* @__PURE__ */ jsxs("form", { onSubmit: handleSell, className: "bg-white rounded-2xl shadow-sm p-6", children: [
        /* @__PURE__ */ jsx("h2", { className: "font-semibold text-gray-900 mb-4", children: "Customer details" }),
        /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Customer name" }),
        /* @__PURE__ */ jsx("input", { name: "customerName", placeholder: "e.g. Mary Simwaba", className: "w-full rounded-lg border border-gray-300 px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-amber-500", required: true }),
        /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Phone number" }),
        /* @__PURE__ */ jsx("input", { name: "customerPhone", type: "tel", placeholder: "e.g. +260977123456", className: "w-full rounded-lg border border-gray-300 px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-amber-500", required: true }),
        /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Ticket type" }),
        /* @__PURE__ */ jsx("select", { name: "ticketType", defaultValue: type ?? TICKET_TYPES[0].id, className: "w-full rounded-lg border border-gray-300 px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-amber-500", children: TICKET_TYPES.map((t) => /* @__PURE__ */ jsxs("option", { value: t.id, children: [
          t.name,
          " — ",
          EVENT.currency,
          t.price
        ] }, t.id)) }),
        /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Payment method" }),
        /* @__PURE__ */ jsx("select", { name: "paymentMethod", defaultValue: PAYMENT_METHODS[0], className: "w-full rounded-lg border border-gray-300 px-3 py-2 mb-6 focus:outline-none focus:ring-2 focus:ring-amber-500", children: PAYMENT_METHODS.map((m) => /* @__PURE__ */ jsx("option", { value: m, children: m }, m)) }),
        /* @__PURE__ */ jsx("button", { type: "submit", disabled: generating, className: "w-full bg-gray-900 hover:bg-gray-800 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg transition-colors", children: generating ? "Generating ticket…" : "Generate & Issue Ticket" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-sm p-6 flex flex-col items-center justify-center text-center", children: [
        lastIssued ? /* @__PURE__ */ jsxs("div", { className: "print-ticket flex flex-col items-center", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-emerald-600 font-medium mb-4", children: [
            /* @__PURE__ */ jsx(CheckCircle2, { className: "w-5 h-5" }),
            " Ticket issued"
          ] }),
          /* @__PURE__ */ jsx("img", { src: lastIssued.qrDataUrl, alt: "Ticket QR code", className: "w-48 h-48 rounded-lg border border-gray-200" }),
          /* @__PURE__ */ jsx("p", { className: "mt-4 font-semibold text-gray-900", children: lastIssued.ticket.name }),
          /* @__PURE__ */ jsxs("p", { className: "text-sm text-gray-500", children: [
            ticketTypeFor(lastIssued.ticket.type)?.code,
            " · ",
            EVENT.currency,
            lastIssued.ticket.type,
            " · Ticket #",
            lastIssued.ticket.number
          ] }),
          /* @__PURE__ */ jsxs("p", { className: `mt-3 text-sm ${lastIssued.status === "failed" ? "text-amber-700" : lastIssued.status === "saved" ? "text-emerald-700" : "text-gray-500"}`, children: [
            lastIssued.status === "saving" && "Saving ticket…",
            lastIssued.status === "saved" && "Saved. This ticket is valid at the gate.",
            lastIssued.status === "failed" && "Not saved yet. Stay online: it will not scan at the gate until it syncs."
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "mt-5 flex flex-wrap justify-center gap-3 print:hidden", children: [
            /* @__PURE__ */ jsxs("button", { onClick: () => void handleShare(lastIssued.ticket), className: "inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors", children: [
              /* @__PURE__ */ jsx(MessageCircle, { className: "w-4 h-4" }),
              " WhatsApp"
            ] }),
            /* @__PURE__ */ jsxs("button", { onClick: () => void handleDownload(lastIssued.ticket), className: "inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-medium px-4 py-2 rounded-lg transition-colors", children: [
              /* @__PURE__ */ jsx(Download, { className: "w-4 h-4" }),
              " Save image"
            ] }),
            /* @__PURE__ */ jsxs("button", { onClick: () => window.print(), className: "inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-medium px-4 py-2 rounded-lg transition-colors", children: [
              /* @__PURE__ */ jsx(Printer, { className: "w-4 h-4" }),
              " Print"
            ] })
          ] })
        ] }) : /* @__PURE__ */ jsx("p", { className: "text-gray-400 text-sm max-w-xs", children: "Fill in the customer's details and issue a ticket to see the QR code here." }),
        notice && /* @__PURE__ */ jsx("p", { className: "mt-4 text-sm text-amber-700 print:hidden", children: notice })
      ] })
    ] }),
    recent.length > 0 && /* @__PURE__ */ jsxs("div", { className: "mt-8 bg-white rounded-2xl shadow-sm p-6", children: [
      /* @__PURE__ */ jsx("h2", { className: "font-semibold text-gray-900 mb-3", children: "Your recent sales" }),
      /* @__PURE__ */ jsx("ul", { className: "divide-y divide-gray-100", children: recent.map((t) => /* @__PURE__ */ jsxs("li", { className: "py-2.5 flex items-center justify-between gap-3 text-sm", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-900", children: t.name }),
          /* @__PURE__ */ jsxs("p", { className: "text-gray-500", children: [
            ticketTypeFor(t.type)?.name,
            " · ",
            t.payment,
            " · #",
            t.number
          ] })
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "font-semibold text-gray-900", children: [
          EVENT.currency,
          amountOf(t)
        ] })
      ] }, t.number)) })
    ] })
  ] }) });
}
export {
  SellPage as component
};
