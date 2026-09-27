// A stable id for this browser. Tickets are bound to the device that first opens
// their link, so a forwarded link cannot render a QR on another phone.
const DEVICE_KEY = 'sjc-device-id'

export function getDeviceId(): string {
  try {
    const saved = window.localStorage.getItem(DEVICE_KEY)
    if (saved) return saved
    const id = randomHex(16)
    window.localStorage.setItem(DEVICE_KEY, id)
    return id
  } catch {
    // Storage blocked (private mode, or site data cleared mid-session): keep the
    // id in memory for this page load so the ticket still opens at all.
    return 'session-' + randomHex(8)
  }
}

function randomHex(bytes: number): string {
  const buf = new Uint8Array(bytes)
  crypto.getRandomValues(buf)
  return Array.from(buf, (b) => b.toString(16).padStart(2, '0')).join('')
}
