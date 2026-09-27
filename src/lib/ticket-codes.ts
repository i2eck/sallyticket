// Ticket numbers and the QR payload. Kept identical to the original system so
// tickets from either app scan at the gate: the QR holds "SJC:" + ticket number.

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
const NUMBER_LENGTH = 10

export function newTicketNumber(): string {
  const bytes = new Uint8Array(NUMBER_LENGTH)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (v) => ALPHABET[v % ALPHABET.length]).join('')
}

export function qrPayload(number: string): string {
  return 'SJC:' + number
}

// Secret in the customer's link. /ticket/NUMBER on its own would let anyone who
// learns a number render a QR for it, so the number alone is not a credential.
export function newShareToken(): string {
  const bytes = new Uint8Array(24)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
}

// The link the customer opens from WhatsApp. Kept here so the token stays next
// to the number format it is paired with.
export function ticketLink(origin: string, number: string, token: string): string {
  return `${origin}/ticket/${number}?t=${token}`
}

// Accepts a scanned QR string or something typed by hand and returns the ticket number.
export function extractTicketNumber(text: string): string | null {
  const t = text.trim()
  const prefixed = /^SJC:([A-Z0-9]{6,20})$/i.exec(t)
  if (prefixed) return prefixed[1].toUpperCase()
  if (t.startsWith('{')) {
    try {
      const parsed = JSON.parse(t) as { ticketId?: unknown }
      if (typeof parsed.ticketId === 'string' && parsed.ticketId) return parsed.ticketId.toUpperCase()
    } catch {
      return null
    }
  }
  if (/^[A-Z0-9]{10}$/i.test(t)) return t.toUpperCase()
  return null
}

// wa.me needs the country code: 0977… -> 260977…
export function whatsappNumber(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  return digits.startsWith('0') ? '260' + digits.slice(1) : digits
}
