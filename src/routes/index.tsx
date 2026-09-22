import { createFileRoute, Link } from '@tanstack/react-router'
import { Music, Mic2, BookOpen, Sparkles, MapPin, Clock, CalendarDays, ArrowRight } from 'lucide-react'
import { EVENT, TICKET_TYPES } from '@/lib/fixtures'

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
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative">
        <div className="absolute inset-0">
          <img
            src="/.netlify/images?url=/img/hero.jpg&w=1920&fm=webp&q=80"
            alt=""
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/75 to-gray-950/50" />
        </div>
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-28 sm:py-36 text-center">
          <p className="text-amber-400 font-semibold tracking-wide uppercase text-sm mb-4">
            {EVENT.edition}
          </p>
          <h1 className="text-4xl sm:text-6xl font-bold text-white leading-tight">
            {EVENT.name}
          </h1>
          <p className="mt-4 text-lg text-gray-200 italic">&ldquo;{EVENT.motto}&rdquo;</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-gray-200 text-sm">
            <span className="flex items-center gap-1.5 bg-white/10 rounded-full px-4 py-1.5">
              <CalendarDays className="w-4 h-4" /> {EVENT.date}
            </span>
            <span className="flex items-center gap-1.5 bg-white/10 rounded-full px-4 py-1.5">
              <Clock className="w-4 h-4" /> Doors {EVENT.doors}
            </span>
            <span className="flex items-center gap-1.5 bg-white/10 rounded-full px-4 py-1.5">
              <MapPin className="w-4 h-4" /> {EVENT.venue}, {EVENT.location}
            </span>
          </div>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <a
              href="#tickets"
              className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-gray-950 font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              See Ticket Prices <ArrowRight className="w-4 h-4" />
            </a>
            <Link
              to="/sell"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-3 rounded-lg border border-white/20 transition-colors"
            >
              I&apos;m a Seller
            </Link>
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
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-amber-100 text-amber-600 mb-3">
                  <Icon className="w-6 h-6" />
                </div>
                <p className="font-medium text-gray-900">{h}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* Ticket types */}
      <section id="tickets" className="bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Ticket Prices</h2>
            <p className="mt-2 text-gray-600">
              Tickets are sold in person at the booths below and issued instantly as a QR
              code ticket.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {TICKET_TYPES.map((t) => (
              <div
                key={t.id}
                className={`relative bg-white rounded-2xl shadow-sm p-8 border-2 flex flex-col ${
                  t.popular ? 'border-amber-500' : 'border-transparent'
                }`}
              >
                {t.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-gray-950 text-xs font-semibold px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                )}
                <p className="text-sm font-semibold text-amber-600 uppercase tracking-wide">
                  {t.name}
                </p>
                <p className="mt-2 text-4xl font-bold text-gray-900">
                  {EVENT.currency}
                  {t.price}
                </p>
                <p className="mt-1 text-sm text-gray-500">{t.tagline}</p>
                <ul className="mt-6 space-y-2 flex-1">
                  {t.perks.map((perk) => (
                    <li key={perk} className="text-sm text-gray-700 flex gap-2">
                      <span className="text-amber-500">•</span>
                      {perk}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/sell"
                  search={{ type: t.id }}
                  className="mt-6 inline-flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white font-medium px-4 py-2.5 rounded-lg transition-colors"
                >
                  Issue this ticket <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer info */}
      <footer className="bg-gray-950 text-gray-400 py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm">
          <p className="text-white font-semibold">
            {EVENT.name} — {EVENT.edition}
          </p>
          <p className="mt-1">
            {EVENT.date} · {EVENT.time} · {EVENT.venue}, {EVENT.location}
          </p>
        </div>
      </footer>
    </div>
  )
}
