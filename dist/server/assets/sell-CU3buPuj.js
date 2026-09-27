import { jsx, jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import QRCode from "qrcode";
import { Ticket, CheckCircle2, MessageCircle, Download, Printer } from "lucide-react";
import { E as EVENT, R as Route, P as PAYMENT_METHODS, T as TICKET_TYPES, M as MOBILE_MONEY_NUMBERS } from "./router-CtCIkKPA.js";
import { t as ticketTypeFor, s as subscribeSellerTickets, a as saveTicket } from "./tickets-B2FiYyRM.js";
import { f as filterPeriod, a as amountOf, n as newestFirst } from "./sales-CSJr0JZy.js";
import { w as whatsappNumber, q as qrPayload, n as newTicketNumber, a as newShareToken, t as ticketLink } from "./ticket-codes-DETT-_yM.js";
import "@tanstack/react-router";
import "chart.js";
import "firebase/firestore";
import "firebase/app";
const W = 900;
const H = 1400;
const PALETTES = {
  "50": {
    // Early Bird — warm gold field, deep purple type
    bg: "#1a0f05",
    panel: "#f0d48a",
    accent: "#4b1d58",
    gold: "#8b5a18",
    text: "#2a0c38",
    muted: "#5c3d1a",
    border: "#c99b39",
    badge: "#3c1353",
    badgeText: "#f7d981",
    rule: "#8b5a18"
  },
  "80": {
    // Regular — deep purple field, gold type
    bg: "#0f0514",
    panel: "#2a0c38",
    accent: "#c99b39",
    gold: "#e6bd65",
    text: "#fbf4df",
    muted: "#d4b87a",
    border: "#c99b39",
    badge: "#c99b39",
    badgeText: "#21082f",
    rule: "#c99b39"
  },
  "150": {
    // VIP — cream field, purple + gold ornaments
    bg: "#1a0f14",
    panel: "#fbf4df",
    accent: "#4b1d58",
    gold: "#c99b39",
    text: "#2a0c38",
    muted: "#5c3d4a",
    border: "#c99b39",
    badge: "#3c1353",
    badgeText: "#f7d981",
    rule: "#c99b39"
  }
};
function paletteFor(type) {
  return PALETTES[type] ?? PALETTES["80"];
}
function roundRect(ctx, px, py, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(px + radius, py);
  ctx.arcTo(px + w, py, px + w, py + h, radius);
  ctx.arcTo(px + w, py + h, px, py + h, radius);
  ctx.arcTo(px, py + h, px, py, radius);
  ctx.arcTo(px, py, px + w, py, radius);
  ctx.closePath();
}
function drawOrnamentCorner(ctx, x, y, size, color, flipX = false, flipY = false) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(flipX ? -1 : 1, flipY ? -1 : 1);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(0, size * 0.55);
  ctx.quadraticCurveTo(0, 0, size * 0.55, 0);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(size * 0.12, size * 0.45);
  ctx.quadraticCurveTo(size * 0.12, size * 0.12, size * 0.45, size * 0.12);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(size * 0.28, size * 0.28, size * 0.08, size * 0.14, Math.PI / 4, 0, Math.PI * 2);
  ctx.fill();
  const cx = size * 0.08;
  const cy = size * 0.08;
  const arm = size * 0.07;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - arm, cy);
  ctx.lineTo(cx + arm, cy);
  ctx.moveTo(cx, cy - arm);
  ctx.lineTo(cx, cy + arm);
  ctx.stroke();
  ctx.restore();
}
function drawCross(ctx, x, y, size, color) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.2;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x, y - size);
  ctx.lineTo(x, y + size * 0.7);
  ctx.moveTo(x - size * 0.55, y - size * 0.25);
  ctx.lineTo(x + size * 0.55, y - size * 0.25);
  ctx.stroke();
  ctx.restore();
}
function drawGoldRule(ctx, x, y, w, color) {
  const grad = ctx.createLinearGradient(x, y, x + w, y);
  grad.addColorStop(0, "transparent");
  grad.addColorStop(0.15, color);
  grad.addColorStop(0.85, color);
  grad.addColorStop(1, "transparent");
  ctx.strokeStyle = grad;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + w, y);
  ctx.stroke();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x + w / 2, y - 4);
  ctx.lineTo(x + w / 2 + 5, y);
  ctx.lineTo(x + w / 2, y + 4);
  ctx.lineTo(x + w / 2 - 5, y);
  ctx.closePath();
  ctx.fill();
}
function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(" ");
  let line = "";
  let cy = y;
  for (let n = 0; n < words.length; n++) {
    const test = line + words[n] + " ";
    if (ctx.measureText(test).width > maxWidth && n > 0) {
      ctx.fillText(line.trim(), x, cy);
      line = words[n] + " ";
      cy += lineHeight;
    } else {
      line = test;
    }
  }
  ctx.fillText(line.trim(), x, cy);
  return cy;
}
function ticketFileName(t) {
  return `SallyJoy-Ticket-${(t.name || "guest").replace(/[^a-z0-9]+/gi, "_")}-${t.number}.png`;
}
async function makeTicketBlob(t) {
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d");
  if (!ctx) throw new Error("Canvas is not available");
  const p = paletteFor(t.type);
  const type = ticketTypeFor(t.type);
  const typeName = (type?.name ?? "Ticket").toUpperCase();
  const priceLabel = type ? `${EVENT.currency}${type.price}` : t.type;
  ctx.fillStyle = p.bg;
  ctx.fillRect(0, 0, W, H);
  const margin = 36;
  roundRect(ctx, margin, margin, W - margin * 2, H - margin * 2, 28);
  ctx.fillStyle = p.panel;
  ctx.fill();
  ctx.strokeStyle = p.border;
  ctx.lineWidth = 6;
  roundRect(ctx, margin + 8, margin + 8, W - margin * 2 - 16, H - margin * 2 - 16, 22);
  ctx.stroke();
  ctx.lineWidth = 1.5;
  roundRect(ctx, margin + 16, margin + 16, W - margin * 2 - 32, H - margin * 2 - 32, 18);
  ctx.stroke();
  const cornerSize = 70;
  const inset = margin + 28;
  drawOrnamentCorner(ctx, inset, inset, cornerSize, p.accent);
  drawOrnamentCorner(ctx, W - inset, inset, cornerSize, p.accent, true, false);
  drawOrnamentCorner(ctx, inset, H - inset, cornerSize, p.accent, false, true);
  drawOrnamentCorner(ctx, W - inset, H - inset, cornerSize, p.accent, true, true);
  drawCross(ctx, inset + 55, inset + 55, 10, p.gold);
  drawCross(ctx, W - inset - 55, inset + 55, 10, p.gold);
  drawCross(ctx, inset + 55, H - inset - 55, 10, p.gold);
  drawCross(ctx, W - inset - 55, H - inset - 55, 10, p.gold);
  ctx.textAlign = "center";
  ctx.fillStyle = p.gold;
  ctx.font = '600 22px Georgia, "Times New Roman", serif';
  ctx.fillText(EVENT.edition.toUpperCase(), W / 2, 110);
  ctx.fillStyle = p.accent;
  ctx.font = 'bold 52px Georgia, "Times New Roman", serif';
  ctx.fillText(EVENT.name.toUpperCase(), W / 2, 170);
  drawGoldRule(ctx, 160, 195, W - 320, p.gold);
  const badgeW = 280;
  const badgeH = 56;
  const badgeX = (W - badgeW) / 2;
  const badgeY = 220;
  roundRect(ctx, badgeX, badgeY, badgeW, badgeH, 12);
  ctx.fillStyle = p.badge;
  ctx.fill();
  ctx.fillStyle = p.badgeText;
  ctx.font = "bold 26px sans-serif";
  ctx.fillText(`${typeName}  ·  ${priceLabel}`, W / 2, badgeY + 37);
  ctx.fillStyle = p.text;
  ctx.font = 'italic 26px Georgia, "Times New Roman", serif';
  const themeY = wrapText(ctx, `"${EVENT.motto}"`, W / 2, 320, W - 160, 34);
  ctx.fillStyle = p.muted;
  ctx.font = '20px Georgia, "Times New Roman", serif';
  ctx.fillText("1 Corinthians 1:16", W / 2, themeY + 36);
  drawGoldRule(ctx, 180, themeY + 60, W - 360, p.gold);
  const detailsTop = themeY + 100;
  ctx.textAlign = "left";
  const leftCol = 100;
  const rightCol = W / 2 + 20;
  ctx.fillStyle = p.muted;
  ctx.font = "bold 18px sans-serif";
  ctx.fillText("DATE", leftCol, detailsTop);
  ctx.fillText("TIME", rightCol, detailsTop);
  ctx.fillStyle = p.text;
  ctx.font = "bold 26px sans-serif";
  ctx.fillText(EVENT.date, leftCol, detailsTop + 36);
  ctx.fillText(EVENT.time, rightCol, detailsTop + 36);
  ctx.fillStyle = p.muted;
  ctx.font = "bold 18px sans-serif";
  ctx.fillText("VENUE", leftCol, detailsTop + 90);
  ctx.fillStyle = p.text;
  ctx.font = "bold 26px sans-serif";
  ctx.fillText(EVENT.venue, leftCol, detailsTop + 126);
  ctx.font = "22px sans-serif";
  ctx.fillText(EVENT.location, leftCol, detailsTop + 156);
  const qrSize = 280;
  const qrX = (W - qrSize) / 2;
  const qrY = detailsTop + 200;
  roundRect(ctx, qrX - 18, qrY - 18, qrSize + 36, qrSize + 36, 16);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.strokeStyle = p.border;
  ctx.lineWidth = 2;
  ctx.stroke();
  const qrUrl = await QRCode.toDataURL(qrPayload(t.number), {
    width: qrSize,
    margin: 1,
    errorCorrectionLevel: "M",
    color: { dark: "#21082f", light: "#ffffff" }
  });
  const qr = new Image();
  qr.src = qrUrl;
  await qr.decode();
  ctx.drawImage(qr, qrX, qrY, qrSize, qrSize);
  ctx.textAlign = "center";
  ctx.fillStyle = p.muted;
  ctx.font = "bold 16px sans-serif";
  ctx.fillText("SCAN TO VERIFY  ·  ADMIT ONE", W / 2, qrY + qrSize + 42);
  ctx.fillStyle = p.accent;
  ctx.font = 'bold 36px Georgia, "Times New Roman", serif';
  ctx.fillText(t.number, W / 2, qrY + qrSize + 90);
  const stripY = H - 200;
  drawGoldRule(ctx, 120, stripY - 20, W - 240, p.gold);
  ctx.textAlign = "left";
  ctx.fillStyle = p.muted;
  ctx.font = "bold 16px sans-serif";
  ctx.fillText("TICKET HOLDER", 100, stripY + 10);
  ctx.fillText("PHONE", W / 2 + 20, stripY + 10);
  ctx.fillStyle = p.text;
  ctx.font = "bold 28px sans-serif";
  ctx.fillText(t.name || "Guest", 100, stripY + 48, 320);
  ctx.fillText(t.phone || "—", W / 2 + 20, stripY + 48, 280);
  ctx.textAlign = "center";
  ctx.fillStyle = p.muted;
  ctx.font = "16px sans-serif";
  ctx.fillText("Valid for one entry  ·  Non-transferable  ·  Non-refundable", W / 2, H - 70);
  const blob = await new Promise((resolve) => c.toBlob(resolve, "image/png"));
  if (!blob) throw new Error("Could not create the ticket image");
  return blob;
}
async function downloadTicketImage(t) {
  const blob = await makeTicketBlob(t);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = ticketFileName(t);
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5e3);
}
function ticketMessage(t, ticketUrl) {
  return `Your ${EVENT.name} ticket 🎫
${EVENT.date}, ${EVENT.time}
${EVENT.venue}, ${EVENT.location}
Ticket no: ${t.number}
Open this link on your phone to show your ticket at the gate: ${ticketUrl}
This ticket works on one phone only, so please do not forward it.`;
}
function openWhatsAppTicketChat(t, ticketUrl) {
  const text = ticketMessage(t, ticketUrl);
  window.open(`https://wa.me/${whatsappNumber(t.phone)}?text=${encodeURIComponent(text)}`, "_blank");
}
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
  const [payment, setPayment] = useState(PAYMENT_METHODS[0]);
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
        checkedInAt: null,
        shareToken: newShareToken(),
        claimDeviceId: ""
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
  function handleShare(ticket) {
    openWhatsAppTicketChat(ticket, ticketLink(window.location.origin, ticket.number, ticket.shareToken));
    setNotice("WhatsApp opened with the ticket link. The customer opens it on their own phone.");
  }
  async function handleDownload(ticket) {
    try {
      await downloadTicketImage(ticket);
      setNotice("Image saved. Hand it over in person — do not send it over WhatsApp.");
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
        /* @__PURE__ */ jsx("select", { name: "paymentMethod", value: payment, onChange: (e) => setPayment(e.target.value), className: "w-full rounded-lg border border-gray-300 px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-amber-500", children: PAYMENT_METHODS.map((m) => /* @__PURE__ */ jsx("option", { value: m, children: m }, m)) }),
        payment === "Mobile Money" && /* @__PURE__ */ jsxs("div", { className: "mb-6 rounded-lg border border-emerald-200 bg-emerald-50 p-3", children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold text-emerald-900", children: "Ask the customer to send the money to either number:" }),
          /* @__PURE__ */ jsx("ul", { className: "mt-2 space-y-1", children: MOBILE_MONEY_NUMBERS.map((m) => /* @__PURE__ */ jsxs("li", { className: "text-sm text-emerald-900", children: [
            /* @__PURE__ */ jsx("span", { className: "font-mono font-bold", children: m.number }),
            " ",
            /* @__PURE__ */ jsxs("span", { className: "text-emerald-700", children: [
              "— ",
              m.name
            ] })
          ] }, m.number)) })
        ] }),
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
