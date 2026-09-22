import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState, type FormEvent } from 'react'
import QRCode from 'qrcode'
import { CheckCircle2, Download, MessageCircle, Printer, Ticket as TicketIcon } from 'lucide-react'
import { EVENT, PAYMENT_METHODS, TICKET_TYPES } from '@/lib/fixtures'
import {
  saveTicket,
  subscribeSellerTickets,
  ticketTypeFor,
  type SaveStatus,
  type TicketRecord,
} from '@/lib/tickets'
import { amountOf, filterPeriod, newestFirst } from '@/lib/sales'
import { newTicketNumber, qrPayload } from '@/lib/ticket-codes'
import { downloadTicketImage, shareTicketImage } from '@/lib/ticket-image'

type SellSearch = { type?: string }

export const Route = createFileRoute('/sell')({
  component: SellPage,
  validateSearch: (search: Record<string, unknown>): SellSearch => ({
    type: typeof search.type === 'string' ? search.type : undefined,
  }),
})

type Seller = { name: string; location: string }

type IssuedTicket = { ticket: TicketRecord; qrDataUrl: string; status: 'saving' | SaveStatus }

const SELLER_KEY = 'sjc-seller'

function SellPage() {
  const { type } = Route.useSearch()
  const [seller, setSeller] = useState<Seller | null>(null)
  const [nameInput, setNameInput] = useState('')
  const [locationInput, setLocationInput] = useState('')
  const [mine, setMine] = useState<TicketRecord[]>([])
  const [lastIssued, setLastIssued] = useState<IssuedTicket | null>(null)
  const [generating, setGenerating] = useState(false)
  const [notice, setNotice] = useState('')

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(SELLER_KEY)
      if (saved) setSeller(JSON.parse(saved) as Seller)
    } catch {
      // Ignore unreadable saved data; the seller just signs in again.
    }
  }, [])

  // Live list of everything this seller has sold, so the totals survive a refresh.
  useEffect(() => {
    if (!seller) return
    return subscribeSellerTickets(seller.name, setMine, (message) => console.error(message))
  }, [seller])

  function handleSignIn(e: FormEvent) {
    e.preventDefault()
    const name = nameInput.replace(/\s+/g, ' ').trim()
    const location = locationInput.replace(/\s+/g, ' ').trim()
    if (name.length < 2 || !location) return
    const next = { name, location }
    setSeller(next)
    window.localStorage.setItem(SELLER_KEY, JSON.stringify(next))
  }

  function handleSignOut() {
    setSeller(null)
    setMine([])
    setLastIssued(null)
    window.localStorage.removeItem(SELLER_KEY)
  }

  async function handleSell(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!seller) return
    // Keep a reference now: React clears e.currentTarget once the handler awaits.
    const formEl = e.currentTarget
    const form = new FormData(formEl)
    const customerName = String(form.get('customerName') ?? '').trim()
    const customerPhone = String(form.get('customerPhone') ?? '').trim()
    const ticketTypeId = String(form.get('ticketType') ?? TICKET_TYPES[0].id)
    const paymentMethod = String(form.get('paymentMethod') ?? PAYMENT_METHODS[0])
    if (!customerName || !customerPhone) return

    const ticketType = TICKET_TYPES.find((t) => t.id === ticketTypeId) ?? TICKET_TYPES[0]
    const number = newTicketNumber()

    setGenerating(true)
    setNotice('')
    try {
      const qrDataUrl = await QRCode.toDataURL(qrPayload(number), { width: 240, margin: 1 })
      const ticket: TicketRecord = {
        number,
        name: customerName,
        phone: customerPhone,
        type: String(ticketType.price),
        payment: paymentMethod,
        soldBy: seller.name,
        location: seller.location,
        timestamp: new Date(),
        checkedIn: false,
        checkedInAt: null,
      }
      setLastIssued({ ticket, qrDataUrl, status: 'saving' })
      formEl.reset()
      void saveTicket(ticket).then((status) =>
        setLastIssued((cur) => (cur && cur.ticket.number === number ? { ...cur, status } : cur)),
      )
    } catch (error) {
      console.error(error)
      setNotice('Could not generate the ticket. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  async function handleShare(ticket: TicketRecord) {
    try {
      const result = await shareTicketImage(ticket, `${window.location.origin}/ticket/${ticket.number}`)
      setNotice(
        result === 'saved'
          ? 'Ticket image saved. In WhatsApp, attach it (paperclip) and send.'
          : '',
      )
    } catch (error) {
      console.error(error)
      setNotice('Could not create the ticket image. Use Print, or screenshot the QR code.')
    }
  }

  async function handleDownload(ticket: TicketRecord) {
    try {
      await downloadTicketImage(ticket)
    } catch (error) {
      console.error(error)
      setNotice('Could not create the ticket image. Use Print, or screenshot the QR code.')
    }
  }

  const today = filterPeriod(mine, 'today')
  const revenueByMe = mine.reduce((sum, t) => sum + amountOf(t), 0)
  const recent = newestFirst(mine).slice(0, 8)

  if (!seller) {
    return (
      <div className="min-h-[80vh] bg-gray-50 flex items-center justify-center px-4">
        <form
          onSubmit={handleSignIn}
          className="bg-white rounded-2xl shadow-sm p-8 w-full max-w-sm"
        >
          <div className="flex items-center gap-2 mb-6">
            <span className="bg-amber-500 text-gray-950 rounded-lg p-1.5">
              <TicketIcon className="w-5 h-5" />
            </span>
            <h1 className="text-lg font-semibold text-gray-900">Seller Sign In</h1>
          </div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Your name</label>
          <input
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder="e.g. John Banda"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 mb-1 focus:outline-none focus:ring-2 focus:ring-amber-500"
            required
            minLength={2}
            maxLength={40}
          />
          <p className="text-xs text-gray-500 mb-4">
            Use the same name every time. Your sales are recorded under it.
          </p>
          <label className="block text-sm font-medium text-gray-700 mb-1">Booth / location</label>
          <input
            value={locationInput}
            onChange={(e) => setLocationInput(e.target.value)}
            placeholder="e.g. Main Gate Booth 1"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 mb-6 focus:outline-none focus:ring-2 focus:ring-amber-500"
            required
          />
          <button
            type="submit"
            className="w-full bg-amber-500 hover:bg-amber-400 text-gray-950 font-semibold py-2.5 rounded-lg transition-colors"
          >
            Sign In
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Sell a Ticket</h1>
            <p className="text-sm text-gray-500">
              {seller.name} · {seller.location}
            </p>
          </div>
          <button
            onClick={handleSignOut}
            className="text-sm text-gray-500 hover:text-gray-800 underline"
          >
            Sign out
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-5">
            <p className="text-sm text-gray-500">Sold today</p>
            <p className="text-2xl font-bold text-gray-900">{today.length}</p>
            <p className="text-xs text-gray-400 mt-1">{mine.length} in total</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-5">
            <p className="text-sm text-gray-500">Your revenue</p>
            <p className="text-2xl font-bold text-gray-900">
              {EVENT.currency}
              {revenueByMe}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-5">
            <p className="text-sm text-gray-500">Location</p>
            <p className="text-2xl font-bold text-gray-900">{seller.location}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <form onSubmit={handleSell} className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Customer details</h2>
            <label className="block text-sm font-medium text-gray-700 mb-1">Customer name</label>
            <input
              name="customerName"
              placeholder="e.g. Mary Simwaba"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-amber-500"
              required
            />
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone number</label>
            <input
              name="customerPhone"
              type="tel"
              placeholder="e.g. +260977123456"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-amber-500"
              required
            />
            <label className="block text-sm font-medium text-gray-700 mb-1">Ticket type</label>
            <select
              name="ticketType"
              defaultValue={type ?? TICKET_TYPES[0].id}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              {TICKET_TYPES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} — {EVENT.currency}
                  {t.price}
                </option>
              ))}
            </select>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment method</label>
            <select
              name="paymentMethod"
              defaultValue={PAYMENT_METHODS[0]}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 mb-6 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              {PAYMENT_METHODS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            <button
              type="submit"
              disabled={generating}
              className="w-full bg-gray-900 hover:bg-gray-800 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg transition-colors"
            >
              {generating ? 'Generating ticket…' : 'Generate & Issue Ticket'}
            </button>
          </form>

          <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col items-center justify-center text-center">
            {lastIssued ? (
              <div className="print-ticket flex flex-col items-center">
                <div className="flex items-center gap-2 text-emerald-600 font-medium mb-4">
                  <CheckCircle2 className="w-5 h-5" /> Ticket issued
                </div>
                <img
                  src={lastIssued.qrDataUrl}
                  alt="Ticket QR code"
                  className="w-48 h-48 rounded-lg border border-gray-200"
                />
                <p className="mt-4 font-semibold text-gray-900">{lastIssued.ticket.name}</p>
                <p className="text-sm text-gray-500">
                  {ticketTypeFor(lastIssued.ticket.type)?.code} · {EVENT.currency}
                  {lastIssued.ticket.type} · Ticket #{lastIssued.ticket.number}
                </p>
                <p
                  className={`mt-3 text-sm ${
                    lastIssued.status === 'failed'
                      ? 'text-amber-700'
                      : lastIssued.status === 'saved'
                        ? 'text-emerald-700'
                        : 'text-gray-500'
                  }`}
                >
                  {lastIssued.status === 'saving' && 'Saving ticket…'}
                  {lastIssued.status === 'saved' && 'Saved. This ticket is valid at the gate.'}
                  {lastIssued.status === 'failed' &&
                    'Not saved yet. Stay online: it will not scan at the gate until it syncs.'}
                </p>
                <div className="mt-5 flex flex-wrap justify-center gap-3 print:hidden">
                  <button
                    onClick={() => void handleShare(lastIssued.ticket)}
                    className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" /> WhatsApp
                  </button>
                  <button
                    onClick={() => void handleDownload(lastIssued.ticket)}
                    className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                  >
                    <Download className="w-4 h-4" /> Save image
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                  >
                    <Printer className="w-4 h-4" /> Print
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-gray-400 text-sm max-w-xs">
                Fill in the customer&apos;s details and issue a ticket to see the QR code
                here.
              </p>
            )}
            {notice && <p className="mt-4 text-sm text-amber-700 print:hidden">{notice}</p>}
          </div>
        </div>

        {recent.length > 0 && (
          <div className="mt-8 bg-white rounded-2xl shadow-sm p-6">
            <h2 className="font-semibold text-gray-900 mb-3">Your recent sales</h2>
            <ul className="divide-y divide-gray-100">
              {recent.map((t) => (
                <li key={t.number} className="py-2.5 flex items-center justify-between gap-3 text-sm">
                  <div>
                    <p className="font-medium text-gray-900">{t.name}</p>
                    <p className="text-gray-500">
                      {ticketTypeFor(t.type)?.name} · {t.payment} · #{t.number}
                    </p>
                  </div>
                  <p className="font-semibold text-gray-900">
                    {EVENT.currency}
                    {amountOf(t)}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
