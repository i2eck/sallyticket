// Draws the ticket as a PNG (for WhatsApp / download) and shares or saves it.
// Designs inspired by the ornate purple / cream / gold sample tickets.
import QRCode from 'qrcode'
import { EVENT } from '@/lib/fixtures'
import { qrPayload, whatsappNumber } from '@/lib/ticket-codes'
import { ticketTypeFor, type TicketRecord } from '@/lib/tickets'

const W = 900
const H = 1400

type Palette = {
  bg: string
  panel: string
  accent: string
  gold: string
  text: string
  muted: string
  border: string
  badge: string
  badgeText: string
  rule: string
}

const PALETTES: Record<string, Palette> = {
  '50': {
    // Early Bird — warm gold field, deep purple type
    bg: '#1a0f05',
    panel: '#f0d48a',
    accent: '#4b1d58',
    gold: '#8b5a18',
    text: '#2a0c38',
    muted: '#5c3d1a',
    border: '#c99b39',
    badge: '#3c1353',
    badgeText: '#f7d981',
    rule: '#8b5a18',
  },
  '80': {
    // Regular — deep purple field, gold type
    bg: '#0f0514',
    panel: '#2a0c38',
    accent: '#c99b39',
    gold: '#e6bd65',
    text: '#fbf4df',
    muted: '#d4b87a',
    border: '#c99b39',
    badge: '#c99b39',
    badgeText: '#21082f',
    rule: '#c99b39',
  },
  '150': {
    // VIP — cream field, purple + gold ornaments
    bg: '#1a0f14',
    panel: '#fbf4df',
    accent: '#4b1d58',
    gold: '#c99b39',
    text: '#2a0c38',
    muted: '#5c3d4a',
    border: '#c99b39',
    badge: '#3c1353',
    badgeText: '#f7d981',
    rule: '#c99b39',
  },
}

function paletteFor(type: string): Palette {
  return PALETTES[type] ?? PALETTES['80']
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  px: number,
  py: number,
  w: number,
  h: number,
  r: number,
) {
  const radius = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(px + radius, py)
  ctx.arcTo(px + w, py, px + w, py + h, radius)
  ctx.arcTo(px + w, py + h, px, py + h, radius)
  ctx.arcTo(px, py + h, px, py, radius)
  ctx.arcTo(px, py, px + w, py, radius)
  ctx.closePath()
}

function drawOrnamentCorner(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
  flipX = false,
  flipY = false,
) {
  ctx.save()
  ctx.translate(x, y)
  ctx.scale(flipX ? -1 : 1, flipY ? -1 : 1)
  ctx.strokeStyle = color
  ctx.fillStyle = color
  ctx.lineWidth = 2.5
  ctx.beginPath()
  // Outer flourish
  ctx.moveTo(0, size * 0.55)
  ctx.quadraticCurveTo(0, 0, size * 0.55, 0)
  ctx.stroke()
  // Inner scroll
  ctx.beginPath()
  ctx.moveTo(size * 0.12, size * 0.45)
  ctx.quadraticCurveTo(size * 0.12, size * 0.12, size * 0.45, size * 0.12)
  ctx.stroke()
  // Leaf tip
  ctx.beginPath()
  ctx.ellipse(size * 0.28, size * 0.28, size * 0.08, size * 0.14, Math.PI / 4, 0, Math.PI * 2)
  ctx.fill()
  // Small cross accent
  const cx = size * 0.08
  const cy = size * 0.08
  const arm = size * 0.07
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(cx - arm, cy)
  ctx.lineTo(cx + arm, cy)
  ctx.moveTo(cx, cy - arm)
  ctx.lineTo(cx, cy + arm)
  ctx.stroke()
  ctx.restore()
}

function drawCross(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string) {
  ctx.save()
  ctx.strokeStyle = color
  ctx.lineWidth = 2.2
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(x, y - size)
  ctx.lineTo(x, y + size * 0.7)
  ctx.moveTo(x - size * 0.55, y - size * 0.25)
  ctx.lineTo(x + size * 0.55, y - size * 0.25)
  ctx.stroke()
  ctx.restore()
}

function drawGoldRule(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, color: string) {
  const grad = ctx.createLinearGradient(x, y, x + w, y)
  grad.addColorStop(0, 'transparent')
  grad.addColorStop(0.15, color)
  grad.addColorStop(0.85, color)
  grad.addColorStop(1, 'transparent')
  ctx.strokeStyle = grad
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(x, y)
  ctx.lineTo(x + w, y)
  ctx.stroke()
  // Center diamond
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.moveTo(x + w / 2, y - 4)
  ctx.lineTo(x + w / 2 + 5, y)
  ctx.lineTo(x + w / 2, y + 4)
  ctx.lineTo(x + w / 2 - 5, y)
  ctx.closePath()
  ctx.fill()
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
): number {
  const words = text.split(' ')
  let line = ''
  let cy = y
  for (let n = 0; n < words.length; n++) {
    const test = line + words[n] + ' '
    if (ctx.measureText(test).width > maxWidth && n > 0) {
      ctx.fillText(line.trim(), x, cy)
      line = words[n] + ' '
      cy += lineHeight
    } else {
      line = test
    }
  }
  ctx.fillText(line.trim(), x, cy)
  return cy
}

export function ticketFileName(t: TicketRecord): string {
  return `SallyJoy-Ticket-${(t.name || 'guest').replace(/[^a-z0-9]+/gi, '_')}-${t.number}.png`
}

export async function makeTicketBlob(t: TicketRecord): Promise<Blob> {
  const c = document.createElement('canvas')
  c.width = W
  c.height = H
  const ctx = c.getContext('2d')
  if (!ctx) throw new Error('Canvas is not available')

  const p = paletteFor(t.type)
  const type = ticketTypeFor(t.type)
  const typeName = (type?.name ?? 'Ticket').toUpperCase()
  const priceLabel = type ? `${EVENT.currency}${type.price}` : t.type

  // Outer dark frame
  ctx.fillStyle = p.bg
  ctx.fillRect(0, 0, W, H)

  // Main panel
  const margin = 36
  roundRect(ctx, margin, margin, W - margin * 2, H - margin * 2, 28)
  ctx.fillStyle = p.panel
  ctx.fill()

  // Double border
  ctx.strokeStyle = p.border
  ctx.lineWidth = 6
  roundRect(ctx, margin + 8, margin + 8, W - margin * 2 - 16, H - margin * 2 - 16, 22)
  ctx.stroke()
  ctx.lineWidth = 1.5
  roundRect(ctx, margin + 16, margin + 16, W - margin * 2 - 32, H - margin * 2 - 32, 18)
  ctx.stroke()

  // Corner ornaments
  const cornerSize = 70
  const inset = margin + 28
  drawOrnamentCorner(ctx, inset, inset, cornerSize, p.accent)
  drawOrnamentCorner(ctx, W - inset, inset, cornerSize, p.accent, true, false)
  drawOrnamentCorner(ctx, inset, H - inset, cornerSize, p.accent, false, true)
  drawOrnamentCorner(ctx, W - inset, H - inset, cornerSize, p.accent, true, true)

  // Small crosses near corners
  drawCross(ctx, inset + 55, inset + 55, 10, p.gold)
  drawCross(ctx, W - inset - 55, inset + 55, 10, p.gold)
  drawCross(ctx, inset + 55, H - inset - 55, 10, p.gold)
  drawCross(ctx, W - inset - 55, H - inset - 55, 10, p.gold)

  // Header
  ctx.textAlign = 'center'
  ctx.fillStyle = p.gold
  ctx.font = '600 22px Georgia, "Times New Roman", serif'
  ctx.fillText(EVENT.edition.toUpperCase(), W / 2, 110)

  ctx.fillStyle = p.accent
  ctx.font = 'bold 52px Georgia, "Times New Roman", serif'
  ctx.fillText(EVENT.name.toUpperCase(), W / 2, 170)

  drawGoldRule(ctx, 160, 195, W - 320, p.gold)

  // Ticket type badge
  const badgeW = 280
  const badgeH = 56
  const badgeX = (W - badgeW) / 2
  const badgeY = 220
  roundRect(ctx, badgeX, badgeY, badgeW, badgeH, 12)
  ctx.fillStyle = p.badge
  ctx.fill()
  ctx.fillStyle = p.badgeText
  ctx.font = 'bold 26px sans-serif'
  ctx.fillText(`${typeName}  ·  ${priceLabel}`, W / 2, badgeY + 37)

  // Theme / scripture
  ctx.fillStyle = p.text
  ctx.font = 'italic 26px Georgia, "Times New Roman", serif'
  const themeY = wrapText(ctx, `"${EVENT.motto}"`, W / 2, 320, W - 160, 34)

  ctx.fillStyle = p.muted
  ctx.font = '20px Georgia, "Times New Roman", serif'
  ctx.fillText('1 Corinthians 1:16', W / 2, themeY + 36)

  drawGoldRule(ctx, 180, themeY + 60, W - 360, p.gold)

  // Event details block
  const detailsTop = themeY + 100
  ctx.textAlign = 'left'
  const leftCol = 100
  const rightCol = W / 2 + 20

  ctx.fillStyle = p.muted
  ctx.font = 'bold 18px sans-serif'
  ctx.fillText('DATE', leftCol, detailsTop)
  ctx.fillText('TIME', rightCol, detailsTop)
  ctx.fillStyle = p.text
  ctx.font = 'bold 26px sans-serif'
  ctx.fillText(EVENT.date, leftCol, detailsTop + 36)
  ctx.fillText(EVENT.time, rightCol, detailsTop + 36)

  ctx.fillStyle = p.muted
  ctx.font = 'bold 18px sans-serif'
  ctx.fillText('VENUE', leftCol, detailsTop + 90)
  ctx.fillStyle = p.text
  ctx.font = 'bold 26px sans-serif'
  ctx.fillText(EVENT.venue, leftCol, detailsTop + 126)
  ctx.font = '22px sans-serif'
  ctx.fillText(EVENT.location, leftCol, detailsTop + 156)

  // QR section
  const qrSize = 280
  const qrX = (W - qrSize) / 2
  const qrY = detailsTop + 200

  // QR background panel
  roundRect(ctx, qrX - 18, qrY - 18, qrSize + 36, qrSize + 36, 16)
  ctx.fillStyle = '#ffffff'
  ctx.fill()
  ctx.strokeStyle = p.border
  ctx.lineWidth = 2
  ctx.stroke()

  const qrUrl = await QRCode.toDataURL(qrPayload(t.number), {
    width: qrSize,
    margin: 1,
    errorCorrectionLevel: 'M',
    color: { dark: '#21082f', light: '#ffffff' },
  })
  const qr = new Image()
  qr.src = qrUrl
  await qr.decode()
  ctx.drawImage(qr, qrX, qrY, qrSize, qrSize)

  ctx.textAlign = 'center'
  ctx.fillStyle = p.muted
  ctx.font = 'bold 16px sans-serif'
  ctx.fillText('SCAN TO VERIFY  ·  ADMIT ONE', W / 2, qrY + qrSize + 42)

  // Ticket number
  ctx.fillStyle = p.accent
  ctx.font = 'bold 36px Georgia, "Times New Roman", serif'
  ctx.fillText(t.number, W / 2, qrY + qrSize + 90)

  // Attendee strip
  const stripY = H - 200
  drawGoldRule(ctx, 120, stripY - 20, W - 240, p.gold)

  ctx.textAlign = 'left'
  ctx.fillStyle = p.muted
  ctx.font = 'bold 16px sans-serif'
  ctx.fillText('TICKET HOLDER', 100, stripY + 10)
  ctx.fillText('PHONE', W / 2 + 20, stripY + 10)

  ctx.fillStyle = p.text
  ctx.font = 'bold 28px sans-serif'
  ctx.fillText(t.name || 'Guest', 100, stripY + 48, 320)
  ctx.fillText(t.phone || '—', W / 2 + 20, stripY + 48, 280)

  // Footer note
  ctx.textAlign = 'center'
  ctx.fillStyle = p.muted
  ctx.font = '16px sans-serif'
  ctx.fillText('Valid for one entry  ·  Non-transferable  ·  Non-refundable', W / 2, H - 70)

  const blob = await new Promise<Blob | null>((resolve) => c.toBlob(resolve, 'image/png'))
  if (!blob) throw new Error('Could not create the ticket image')
  return blob
}

export async function downloadTicketImage(t: TicketRecord): Promise<void> {
  const blob = await makeTicketBlob(t)
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = ticketFileName(t)
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 5000)
}

export function ticketMessage(t: TicketRecord, ticketUrl: string): string {
  return (
    `Your ${EVENT.name} ticket 🎫\n${EVENT.date}, ${EVENT.time}\n${EVENT.venue}, ${EVENT.location}\n` +
    `Ticket no: ${t.number}\nOpen this link on your phone to show your ticket at the gate: ${ticketUrl}\n` +
    `This ticket works on one phone only, so please do not forward it.`
  )
}

/**
 * Opens a WhatsApp chat with the customer's ticket link. The ticket image is
 * deliberately not attached: a picture of the QR can be forwarded and shown at the
 * gate by anyone, whereas the link only opens on the phone it is first used on.
 * Sellers hand over printed or downloaded copies in person instead.
 */
export function openWhatsAppTicketChat(t: TicketRecord, ticketUrl: string): void {
  const text = ticketMessage(t, ticketUrl)
  window.open(`https://wa.me/${whatsappNumber(t.phone)}?text=${encodeURIComponent(text)}`, '_blank')
}
