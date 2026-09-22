// Pure helpers that turn ticket records into the numbers shown on the admin page.
import type { TicketRecord } from '@/lib/tickets'

export type Period = 'all' | 'today'

export const UNASSIGNED = 'Unassigned (older sales)'

export function amountOf(t: Pick<TicketRecord, 'type'>): number {
  return parseInt(t.type, 10) || 0
}

export function sellerKey(t: Pick<TicketRecord, 'soldBy'>): string {
  return t.soldBy.trim().toLowerCase()
}

function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
  )
}

export function filterPeriod(rows: TicketRecord[], period: Period, now = new Date()): TicketRecord[] {
  if (period === 'all') return rows
  return rows.filter((r) => r.timestamp !== null && sameDay(r.timestamp, now))
}

export function newestFirst(rows: TicketRecord[]): TicketRecord[] {
  return [...rows].sort((a, b) => (b.timestamp?.getTime() ?? 0) - (a.timestamp?.getTime() ?? 0))
}

export type SellerSummary = {
  key: string
  label: string
  count: number
  revenue: number
  payments: Record<string, number>
  types: Record<string, number>
}

// Groups sales by seller. "John Banda" and "john banda " count as the same person.
export function summarizeBySeller(rows: TicketRecord[]): SellerSummary[] {
  const map = new Map<string, SellerSummary>()
  for (const r of rows) {
    const key = sellerKey(r)
    let s = map.get(key)
    if (!s) {
      s = { key, label: r.soldBy || UNASSIGNED, count: 0, revenue: 0, payments: {}, types: {} }
      map.set(key, s)
    }
    const amount = amountOf(r)
    s.count += 1
    s.revenue += amount
    s.payments[r.payment] = (s.payments[r.payment] ?? 0) + amount
    s.types[r.type] = (s.types[r.type] ?? 0) + 1
  }
  return Array.from(map.values()).sort((a, b) => b.revenue - a.revenue)
}

export function salesByDay(rows: TicketRecord[], maxDays = 14): { label: string; count: number }[] {
  const days = new Map<string, { date: Date; count: number }>()
  for (const r of rows) {
    if (!r.timestamp) continue
    const d = r.timestamp
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
    const entry = days.get(key)
    if (entry) entry.count += 1
    else days.set(key, { date: new Date(d.getFullYear(), d.getMonth(), d.getDate()), count: 1 })
  }
  return Array.from(days.values())
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(-maxDays)
    .map((e) => ({
      label: e.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      count: e.count,
    }))
}
