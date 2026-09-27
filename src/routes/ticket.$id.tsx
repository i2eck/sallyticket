import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { EVENT } from '@/lib/fixtures'
import { claimTicket, ticketTypeFor, type TicketRecord } from '@/lib/tickets'
import { getDeviceId } from '@/lib/device'
import { qrPayload } from '@/lib/ticket-codes'

type TicketSearch = { t?: string }

export const Route = createFileRoute('/ticket/$id')({
  component: TicketPage,
  validateSearch: (search: Record<string, unknown>): TicketSearch => ({
    t: typeof search.t === 'string' ? search.t : undefined,
  }),
})

type State =
  | { status: 'loading' }
  | { status: 'missing' }
  /** The link was forwarded, or opened on a second phone. Shows no ticket details. */
  | { status: 'blocked' }
  | { status: 'error' }
  | { status: 'ok'; ticket: TicketRecord; qr: string }

// The link a customer opens from WhatsApp: their ticket, ready to show at the gate.
// It only works on the phone that opened it first, so it cannot be passed on.
function TicketPage() {
  const { id } = Route.useParams()
  const { t } = Route.useSearch()
  const [state, setState] = useState<State>({ status: 'loading' })

  useEffect(() => {
    let alive = true
    const number = id.trim().toUpperCase()
    claimTicket(number, t ?? '', getDeviceId())
      .then(async (result) => {
        if (!alive) return
        if (result.status === 'invalid' || result.status === 'wrong-device') {
          setState({ status: result.status === 'wrong-device' ? 'blocked' : 'missing' })
          return
        }
        const ticket = result.ticket
        const qr = await QRCode.toDataURL(qrPayload(ticket.number), {
          width: 280,
          margin: 1,
          color: { dark: '#21082f', light: '#ffffff' },
        })
        if (alive) setState({ status: 'ok', ticket, qr })
      })
      .catch((error) => {
        console.error(error)
        if (alive) setState({ status: 'error' })
      })
    return () => {
      alive = false
    }
  }, [id, t])

  const type = state.status === 'ok' ? ticketTypeFor(state.ticket.type) : undefined

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-10 bg-[#1a0f14]">
      <div className="w-full max-w-sm overflow-hidden rounded-2xl border-2 border-[#c99b39] shadow-2xl bg-[#fbf4df]">
        {/* Header */}
        <div className="bg-[#2a0c38] text-center px-6 py-6 border-b-4 border-[#c99b39]">
          <p className="text-[11px] tracking-[0.2em] uppercase text-[#e6bd65] font-semibold">
            {EVENT.edition}
          </p>
          <p className="mt-1 text-2xl font-bold text-[#fbf4df] font-serif">{EVENT.name}</p>
          {type && (
            <p className="mt-3 inline-block rounded-full bg-[#c99b39] text-[#21082f] text-sm font-bold px-4 py-1">
              {type.name} · {EVENT.currency}
              {type.price}
            </p>
          )}
        </div>

        {state.status === 'loading' && (
          <p className="p-10 text-center text-[#5c3d4a]">Loading your ticket…</p>
        )}
        {state.status === 'missing' && (
          <p className="p-10 text-center text-[#5c3d4a]">
            We could not find this ticket. Check the link, or ask the seller who issued it.
          </p>
        )}
        {state.status === 'blocked' && (
          <div className="p-10 text-center">
            <p className="font-bold text-[#2a0c38] text-lg">This ticket belongs to another phone</p>
            <p className="mt-3 text-sm text-[#5c3d4a] leading-relaxed">
              Each ticket works on one phone only, so it cannot be passed on. If you changed phones
              or cleared your browser data, tell the seller your ticket number and they will sort you
              out at the gate.
            </p>
          </div>
        )}
        {state.status === 'error' && (
          <p className="p-10 text-center text-[#5c3d4a]">
            Could not load the ticket. Check your internet connection and try again.
          </p>
        )}

        {state.status === 'ok' && (
          <div className="p-6 text-center">
            <p className="italic text-[#2a0c38] text-sm leading-snug">“{EVENT.motto}”</p>
            <p className="mt-1 text-xs text-[#8b5a18]">1 Corinthians 1:16</p>

            <div className="mt-5 mx-auto w-fit rounded-xl border-2 border-[#c99b39] bg-white p-2">
              <img src={state.qr} alt="Ticket QR code" className="w-52 h-52" />
            </div>

            <p className="mt-3 font-serif text-xl font-bold text-[#2a0c38] tracking-wide">
              {state.ticket.number}
            </p>
            <p className="text-[11px] font-semibold tracking-widest text-[#8b5a18] uppercase mt-1">
              Scan to verify · Admit one
            </p>

            {state.ticket.checkedIn && (
              <p className="mt-4 rounded-lg bg-amber-100 text-amber-900 text-sm font-medium px-3 py-2 border border-amber-300">
                This ticket has already been used to enter.
              </p>
            )}

            <div className="mt-5 border-t border-[#c99b39]/40 pt-4">
              <p className="text-[11px] font-bold tracking-wider text-[#8b5a18] uppercase">
                Ticket holder
              </p>
              <p className="mt-1 text-lg font-bold text-[#2a0c38]">{state.ticket.name}</p>
            </div>

            <p className="mt-4 text-sm text-[#2a0c38] leading-relaxed">
              {EVENT.date}
              <br />
              {EVENT.time}
              <br />
              {EVENT.venue}, {EVENT.location}
            </p>

            <p className="mt-4 text-[11px] text-[#8b5a18]">
              Valid for one entry · Works on this phone only · Non-refundable
            </p>
            <p className="mt-1 text-[11px] text-[#8b5a18]">
              There is nothing to save or forward — keep this page open at the gate.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
