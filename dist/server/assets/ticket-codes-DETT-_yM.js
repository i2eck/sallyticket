const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const NUMBER_LENGTH = 10;
function newTicketNumber() {
  const bytes = new Uint8Array(NUMBER_LENGTH);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (v) => ALPHABET[v % ALPHABET.length]).join("");
}
function qrPayload(number) {
  return "SJC:" + number;
}
function newShareToken() {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}
function ticketLink(origin, number, token) {
  return `${origin}/ticket/${number}?t=${token}`;
}
function extractTicketNumber(text) {
  const t = text.trim();
  const prefixed = /^SJC:([A-Z0-9]{6,20})$/i.exec(t);
  if (prefixed) return prefixed[1].toUpperCase();
  if (t.startsWith("{")) {
    try {
      const parsed = JSON.parse(t);
      if (typeof parsed.ticketId === "string" && parsed.ticketId) return parsed.ticketId.toUpperCase();
    } catch {
      return null;
    }
  }
  if (/^[A-Z0-9]{10}$/i.test(t)) return t.toUpperCase();
  return null;
}
function whatsappNumber(phone) {
  const digits = phone.replace(/\D/g, "");
  return digits.startsWith("0") ? "260" + digits.slice(1) : digits;
}
export {
  newShareToken as a,
  extractTicketNumber as e,
  newTicketNumber as n,
  qrPayload as q,
  ticketLink as t,
  whatsappNumber as w
};
