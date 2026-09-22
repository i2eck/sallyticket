import { getFirestore, getDoc, doc, runTransaction, serverTimestamp, onSnapshot, setDoc, collection, query, where } from "firebase/firestore";
import { getApps, getApp, initializeApp } from "firebase/app";
import { T as TICKET_TYPES, E as EVENT } from "./router-DVLsTF45.js";
const firebaseConfig = {
  apiKey: "AIzaSyD6wUD2wLSSEQxbkLBPeZ8ksmek_8SM48c",
  authDomain: "sallyjoy-19efc.firebaseapp.com",
  projectId: "sallyjoy-19efc",
  storageBucket: "sallyjoy-19efc.firebasestorage.app",
  messagingSenderId: "416346266936",
  appId: "1:416346266936:web:e103c14a25a1d710b335cd"
};
let cached = null;
function getDb() {
  if (!cached) {
    const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
    cached = getFirestore(app);
  }
  return cached;
}
const COLLECTION = "tickets";
function ticketTypeFor(type) {
  return TICKET_TYPES.find((t) => String(t.price) === type);
}
function toDate(v) {
  if (!v) return null;
  if (typeof v === "object" && "toDate" in v && typeof v.toDate === "function") {
    return v.toDate();
  }
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}
function recordFromDoc(id, d) {
  return {
    number: String(d.number ?? id),
    name: String(d.name ?? ""),
    phone: String(d.phone ?? ""),
    type: String(d.type ?? "").replace(/\D/g, ""),
    payment: String(d.payment ?? "Unknown"),
    soldBy: String(d.soldBy ?? "").trim(),
    location: String(d.location ?? ""),
    timestamp: toDate(d.timestamp),
    checkedIn: Boolean(d.checkedIn),
    checkedInAt: toDate(d.checkedInAt)
  };
}
async function saveTicket(t) {
  try {
    const type = ticketTypeFor(t.type);
    const write = setDoc(doc(getDb(), COLLECTION, t.number), {
      name: t.name,
      phone: t.phone,
      type: t.type,
      typeText: type ? `${type.name} - ${EVENT.currency}${type.price}` : t.type,
      payment: t.payment,
      number: t.number,
      soldBy: t.soldBy,
      location: t.location,
      date: (/* @__PURE__ */ new Date()).toLocaleDateString(),
      timestamp: t.timestamp ?? /* @__PURE__ */ new Date(),
      checkedIn: false,
      checkedInAt: null,
      deviceId: typeof navigator === "undefined" ? "" : navigator.userAgent
    }).then(() => "saved");
    const timeout = new Promise((resolve) => setTimeout(() => resolve("failed"), 8e3));
    return await Promise.race([write, timeout]);
  } catch (error) {
    console.error("Error saving ticket", error);
    return "failed";
  }
}
function watch(source, onData, onError) {
  try {
    return onSnapshot(
      source(),
      (snap) => onData(snap.docs.map((d) => recordFromDoc(d.id, d.data()))),
      (err) => onError(err.message)
    );
  } catch (error) {
    onError(error instanceof Error ? error.message : "Could not connect");
    return () => {
    };
  }
}
function subscribeTickets(onData, onError) {
  return watch(() => collection(getDb(), COLLECTION), onData, onError);
}
function subscribeSellerTickets(seller, onData, onError) {
  return watch(() => query(collection(getDb(), COLLECTION), where("soldBy", "==", seller)), onData, onError);
}
async function fetchTicket(number) {
  const snap = await getDoc(doc(getDb(), COLLECTION, number));
  return snap.exists() ? recordFromDoc(snap.id, snap.data()) : null;
}
async function verifyTicket(number) {
  const db = getDb();
  const ref = doc(db, COLLECTION, number);
  const run = runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists()) return { status: "invalid" };
    const ticket = recordFromDoc(snap.id, snap.data());
    if (ticket.checkedIn) return { status: "used", ticket };
    tx.update(ref, { checkedIn: true, checkedInAt: serverTimestamp() });
    return { status: "valid", ticket };
  });
  const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), 12e3));
  return await Promise.race([run, timeout]);
}
export {
  saveTicket as a,
  subscribeTickets as b,
  fetchTicket as f,
  subscribeSellerTickets as s,
  ticketTypeFor as t,
  verifyTicket as v
};
