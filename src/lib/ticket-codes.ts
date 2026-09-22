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
