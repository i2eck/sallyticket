// Firestore access for tickets. The "tickets" collection and its field names match
// the original app (document id = ticket number), so old and new tickets mix freely.
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  where,
  type DocumentData,
  type Query,
  type Unsubscribe,
} from 'firebase/firestore'
import { getDb } from '@/lib/firebase'
import { EVENT, TICKET_TYPES, type TicketType } from '@/lib/fixtures'

const COLLECTION = 'tickets'

export type TicketRecord = {
  number: string
  name: string
  phone: string
  /** Ticket price as digits: '50' | '80' | '150' (same value the original app stored). */
  type: string
  payment: string
  soldBy: string
  location: string
  timestamp: Date | null
  checkedIn: boolean
  checkedInAt: Date | null
  /** Secret that makes the customer's link unguessable. Empty on older tickets. */
  shareToken: string
  /** Device that first opened the link. Empty until the customer opens it. */
  claimDeviceId: string
}

export type SaveStatus = 'saved' | 'failed'

export function ticketTypeFor(type: string): TicketType | undefined {
  return TICKET_TYPES.find((t) => String(t.price) === type)
}

function toDate(v: unknown): Date | null {
  if (!v) return null
  if (typeof v === 'object' && 'toDate' in v && typeof v.toDate === 'function') {
    return (v as { toDate: () => Date }).toDate()
  }
  const d = new Date(v as string | number)
  return Number.isNaN(d.getTime()) ? null : d
}

// Older documents may lack soldBy / location / shareToken, so every field is read
// defensively.
export function recordFromDoc(id: string, d: DocumentData): TicketRecord {
  return {
    number: String(d.number ?? id),
    name: String(d.name ?? ''),
    phone: String(d.phone ?? ''),
    type: String(d.type ?? '').replace(/\D/g, ''),
    payment: String(d.payment ?? 'Unknown'),
    soldBy: String(d.soldBy ?? '').trim(),
    location: String(d.location ?? ''),
    timestamp: toDate(d.timestamp),
    checkedIn: Boolean(d.checkedIn),
    checkedInAt: toDate(d.checkedInAt),
    shareToken: String(d.shareToken ?? ''),
    claimDeviceId: String(d.claimDeviceId ?? ''),
  }
}

// Resolves 'saved' once Firestore confirms. If there is no connection the write stays
// queued, but after 8s we report 'failed' so the seller knows it is not valid yet.
export async function saveTicket(t: TicketRecord): Promise<SaveStatus> {
  try {
    const type = ticketTypeFor(t.type)
    const write = setDoc(doc(getDb(), COLLECTION, t.number), {
      name: t.name,
      phone: t.phone,
      type: t.type,
      typeText: type ? `${type.name} - ${EVENT.currency}${type.price}` : t.type,
      payment: t.payment,
      number: t.number,
      soldBy: t.soldBy,
      location: t.location,
      date: new Date().toLocaleDateString(),
      timestamp: t.timestamp ?? new Date(),
      checkedIn: false,
      checkedInAt: null,
      // The link the customer gets is worthless without this token, and the token
      // is claimed by whichever phone opens it first.
      shareToken: t.shareToken,
      claimDeviceId: '',
      deviceId: typeof navigator === 'undefined' ? '' : navigator.userAgent,
    }).then((): SaveStatus => 'saved')
    const timeout = new Promise<SaveStatus>((resolve) => setTimeout(() => resolve('failed'), 8000))
    return await Promise.race([write, timeout])
  } catch (error) {
    console.error('Error saving ticket', error)
    return 'failed'
  }
}

function watch(
  source: () => Query,
  onData: (rows: TicketRecord[]) => void,
  onError: (message: string) => void,
): Unsubscribe {
  try {
    return onSnapshot(
      source(),
      (snap) => onData(snap.docs.map((d) => recordFromDoc(d.id, d.data()))),
      (err) => onError(err.message),
    )
  } catch (error) {
    onError(error instanceof Error ? error.message : 'Could not connect')
    return () => {}
  }
}

/** Every ticket sold by anyone, live. Used by the admin page. */
export function subscribeTickets(
  onData: (rows: TicketRecord[]) => void,
  onError: (message: string) => void,
): Unsubscribe {
  return watch(() => collection(getDb(), COLLECTION), onData, onError)
}

/** Tickets sold under one seller name, live. Used by the seller page. */
export function subscribeSellerTickets(
  seller: string,
  onData: (rows: TicketRecord[]) => void,
  onError: (message: string) => void,
): Unsubscribe {
  return watch(() => query(collection(getDb(), COLLECTION), where('soldBy', '==', seller)), onData, onError)
}

export async function fetchTicket(number: string): Promise<TicketRecord | null> {
  const snap = await getDoc(doc(getDb(), COLLECTION, number))
  return snap.exists() ? recordFromDoc(snap.id, snap.data()) : null
}

export type VerifyResult = { status: 'valid' | 'used' | 'invalid'; ticket?: TicketRecord }

// Marks a ticket as used inside a transaction, so two gate phones can never both let
// the same ticket in.
export async function verifyTicket(number: string): Promise<VerifyResult> {
  const db = getDb()
  const ref = doc(db, COLLECTION, number)
  const run = runTransaction(db, async (tx): Promise<VerifyResult> => {
    const snap = await tx.get(ref)
    if (!snap.exists()) return { status: 'invalid' }
    const ticket = recordFromDoc(snap.id, snap.data())
    if (ticket.checkedIn) return { status: 'used', ticket }
    tx.update(ref, { checkedIn: true, checkedInAt: serverTimestamp() })
    return { status: 'valid', ticket }
  })
  const timeout = new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), 12000))
  return await Promise.race([run, timeout])
}

export type ClaimResult =
  /** Link is good, and this device now owns the ticket. */
  | { status: 'claimed'; ticket: TicketRecord }
  /** This device already owns the ticket. */
  | { status: 'yours'; ticket: TicketRecord }
  /** Ticket predates the share token, so there is nothing to bind. */
  | { status: 'unbound'; ticket: TicketRecord }
  /** The link was forwarded to another phone. Deliberately reveals nothing. */
  | { status: 'wrong-device' }
  /** No such ticket, or the token in the link does not match. */
  | { status: 'invalid' }

/**
 * Binds a ticket to the phone that first opens its link, so the buyer cannot pass it
 * on: a forwarded copy of the link renders no QR anywhere else. The gate is
 * unaffected, because the QR payload is still just the ticket number.
 */
export async function claimTicket(number: string, token: string, deviceId: string): Promise<ClaimResult> {
  const db = getDb()
  const ref = doc(db, COLLECTION, number)
  const run = runTransaction(db, async (tx): Promise<ClaimResult> => {
    const snap = await tx.get(ref)
    if (!snap.exists()) return { status: 'invalid' }
    const ticket = recordFromDoc(snap.id, snap.data())
    // Tickets from the earlier single-file app have no token. They keep working.
    if (!ticket.shareToken) return { status: 'unbound', ticket }
    if (ticket.shareToken !== token) return { status: 'invalid' }
    if (!ticket.claimDeviceId) {
      tx.update(ref, { claimDeviceId: deviceId, claimedAt: serverTimestamp() })
      return { status: 'claimed', ticket }
    }
    return ticket.claimDeviceId === deviceId
      ? { status: 'yours', ticket }
      : { status: 'wrong-device' }
  })
  const timeout = new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), 12000))
  return await Promise.race([run, timeout])
}
