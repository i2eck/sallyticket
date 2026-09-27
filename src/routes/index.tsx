import { createFileRoute } from '@tanstack/react-router'
import {
  Music,
  Mic2,
  BookOpen,
  Sparkles,
  MapPin,
  Clock,
  CalendarDays,
  Ticket,
  QrCode,
  Users,
  Church,
} from 'lucide-react'
import { EVENT, MOBILE_MONEY_NUMBERS, TICKET_TYPES } from '@/lib/fixtures'

export const Route = createFileRoute('/')({
  component: Home,
})

const highlightIcons = {
  'Live Music': Music,
  Rap: Mic2,
  Poetry: BookOpen,
  'Dance & Drama': Sparkles,
} as const

function Home() {
  return (
    <div className="min-h-screen bg-[#fbf4df]">
      {/* Hero */}
      <section className="relative">
        <div className="absolute inset-0">
          <img
            src="/img/hero.jpg"
            alt=""
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1a0f14] via-[#1a0f14]/80 to-[#1a0f14]/45" />
        </div>
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-28 sm:py-36 text-center">
          <p className="text-[#e6bd65] font-semibold tracking-[0.2em] uppercase text-sm mb-4">
            {EVENT.edition}
          </p>
          <h1 className="text-4xl sm:text-6xl font-bold text-[#fbf4df] leading-tight font-serif">
            {EVENT.name}
          </h1>
          <p className="mt-4 text-lg text-[#f0e6c8] italic">&ldquo;{EVENT.motto}&rdquo;</p>
          <p className="mt-2 text-sm text-[#c99b39]">1 Corinthians 1:16</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-[#f0e6c8] text-sm">
            <span className="flex items-center gap-1.5 bg-white/10 rounded-full px-4 py-1.5 border border-[#c99b39]/40">
              <CalendarDays className="w-4 h-4 text-[#e6bd65]" /> {EVENT.date}
            </span>
            <span className="flex items-center gap-1.5 bg-white/10 rounded-full px-4 py-1.5 border border-[#c99b39]/40">
              <Clock className="w-4 h-4 text-[#e6bd65]" /> Doors {EVENT.doors}
            </span>
            <span className="flex items-center gap-1.5 bg-white/10 rounded-full px-4 py-1.5 border border-[#c99b39]/40">
              <MapPin className="w-4 h-4 text-[#e6bd65]" /> {EVENT.venue}
            </span>
          </div>
          <div className="mt-10">
            <a
              href="#tickets"
              className="inline-flex items-center gap-2 bg-[#c99b39] hover:bg-[#e6bd65] text-[#1a0f14] font-semibold px-7 py-3 rounded-lg transition-colors"
            >
              See ticket prices
            </a>
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          {EVENT.highlights.map((h) => {
            const Icon = highlightIcons[h as keyof typeof highlightIcons]
            return (
              <div key={h} className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#2a0c38] text-[#e6bd65] mb-3">
                  {Icon ? <Icon className="w-6 h-6" /> : <Sparkles className="w-6 h-6" />}
                </div>
                <p className="font-medium text-[#2a0c38]">{h}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* Ticket types — client view only */}
      <section id="tickets" className="bg-white py-20 border-y border-[#c99b39]/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#2a0c38] font-serif">Ticket prices</h2>
            <p className="mt-2 text-[#5c3d4a] max-w-xl mx-auto">
              Choose the experience that suits you. Tickets are sold in person and issued as a
              QR code you show at the gate.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {TICKET_TYPES.map((t) => (
              <div
                key={t.id}
                className={`relative rounded-2xl p-8 flex flex-col border-2 ${
                  t.popular
                    ? 'border-[#c99b39] bg-[#fbf4df] shadow-md'
                    : 'border-[#e8dcc0] bg-[#fffdf7]'
                }`}
              >
                {t.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#c99b39] text-[#1a0f14] text-xs font-bold px-3 py-1 rounded-full">
                    Most popular
                  </span>
                )}
                <p className="text-sm font-bold text-[#8b5a18] uppercase tracking-wide">
                  {t.name}
                </p>
                <p className="mt-2 text-4xl font-bold text-[#2a0c38]">
                  {EVENT.currency}
                  {t.price}
                </p>
                <p className="mt-1 text-sm text-[#5c3d4a]">{t.tagline}</p>
                <ul className="mt-6 space-y-2 flex-1">
                  {t.perks.map((perk) => (
                    <li key={perk} className="text-sm text-[#2a0c38] flex gap-2">
                      <span className="text-[#c99b39]">✓</span>
                      {perk}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How to buy */}
      <section id="how-to-buy" className="py-20 bg-[#fbf4df]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-[#2a0c38] font-serif text-center">
            How to get your ticket
          </h2>
          <p className="mt-2 text-center text-[#5c3d4a]">
            Tickets are sold in person — no online checkout required.
          </p>
          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto w-14 h-14 rounded-full bg-[#2a0c38] text-[#e6bd65] flex items-center justify-center mb-4">
                <Users className="w-7 h-7" />
              </div>
              <p className="font-bold text-[#2a0c38]">1. Find a seller</p>
              <p className="mt-2 text-sm text-[#5c3d4a]">
                Buy from an official Sally Joy Camps booth or authorised seller.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto w-14 h-14 rounded-full bg-[#2a0c38] text-[#e6bd65] flex items-center justify-center mb-4">
                <Ticket className="w-7 h-7" />
              </div>
              <p className="font-bold text-[#2a0c38]">2. Pay &amp; receive QR</p>
              <p className="mt-2 text-sm text-[#5c3d4a]">
                Pay cash or mobile money. You get a digital ticket with a QR code (often via
                WhatsApp).
              </p>
              <div className="mt-3 rounded-lg border border-[#c99b39]/60 bg-white/60 p-3 text-left">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#8b5a18]">
                  Mobile money
                </p>
                <ul className="mt-1 space-y-0.5">
                  {MOBILE_MONEY_NUMBERS.map((m) => (
                    <li key={m.number} className="text-sm text-[#2a0c38]">
                      <span className="font-mono font-semibold">{m.number}</span>{' '}
                      <span className="text-[#5c3d4a]">— {m.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="text-center">
              <div className="mx-auto w-14 h-14 rounded-full bg-[#2a0c38] text-[#e6bd65] flex items-center justify-center mb-4">
                <QrCode className="w-7 h-7" />
              </div>
              <p className="font-bold text-[#2a0c38]">3. Show at the gate</p>
              <p className="mt-2 text-sm text-[#5c3d4a]">
                Present your QR on the day. Each ticket is valid for one entry only.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* When & where */}
      <section id="when-where" className="py-20 bg-[#2a0c38] text-[#fbf4df]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold font-serif">When &amp; where</h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-2 text-left">
            <div className="rounded-2xl border border-[#c99b39]/40 bg-[#1a0f14]/50 p-6">
              <div className="flex items-center gap-3 text-[#e6bd65] font-semibold">
                <CalendarDays className="w-5 h-5" />
                Date &amp; time
              </div>
              <p className="mt-3 text-lg font-medium">{EVENT.date}</p>
              <p className="mt-1 text-[#d4b87a]">Doors open {EVENT.doors}</p>
              <p className="text-[#d4b87a]">Programme {EVENT.time}</p>
            </div>
            <div className="rounded-2xl border border-[#c99b39]/40 bg-[#1a0f14]/50 p-6">
              <div className="flex items-center gap-3 text-[#e6bd65] font-semibold">
                <Church className="w-5 h-5" />
                Venue
              </div>
              <p className="mt-3 text-lg font-medium">{EVENT.venue}</p>
              <p className="mt-1 text-[#d4b87a]">{EVENT.location}</p>
              <p className="mt-3 text-sm text-[#c99b39] flex items-start gap-2">
                <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
                Come early for a good seat — VIP tickets include front-row access.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1a0f14] text-[#a89070] py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm">
          <p className="text-[#fbf4df] font-semibold font-serif text-lg">
            {EVENT.name}
          </p>
          <p className="mt-1 text-[#e6bd65]">{EVENT.edition}</p>
          <p className="mt-3">
            {EVENT.date} · {EVENT.time}
          </p>
          <p>
            {EVENT.venue}, {EVENT.location}
          </p>
          <p className="mt-6 text-xs text-[#6b5344]">
            Official guest information site. Ticket sales are handled in person by authorised
            sellers only.
          </p>
        </div>
      </footer>
    </div>
  )
}
