import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useMemo, useState, type FormEvent } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { Bar, Line, Doughnut } from 'react-chartjs-2'
import { DollarSign, Lock, Search, Ticket as TicketIcon, CheckCircle2, Users } from 'lucide-react'
import { EVENT, TICKET_TYPES } from '@/lib/fixtures'
import { subscribeTickets, ticketTypeFor, type TicketRecord } from '@/lib/tickets'
import {
  amountOf,
  filterPeriod,
  newestFirst,
  salesByDay,
  sellerKey,
  summarizeBySeller,
  UNASSIGNED,
  type Period,
} from '@/lib/sales'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
)

export const Route = createFileRoute('/admin')({
  component: AdminPage,
})

// This PIN only keeps casual users off the page. It ships in the site's code, so it is
// not real security. Set VITE_ADMIN_PIN in Netlify to change it from the default.
const ADMIN_PIN = String(import.meta.env.VITE_ADMIN_PIN ?? '2026')
const UNLOCK_KEY = 'sjc-admin'
const MAX_ROWS = 300

function AdminPage() {
  const [ready, setReady] = useState(false)
  const [unlocked, setUnlocked] = useState(false)

  useEffect(() => {
    try {
      setUnlocked(window.sessionStorage.getItem(UNLOCK_KEY) === '1')
    } catch {
      // Session storage unavailable: the PIN screen simply shows again.
    }
    setReady(true)
  }, [])

  function lock() {
    try {
      window.sessionStorage.removeItem(UNLOCK_KEY)
    } catch {
      // Nothing to clear.
    }
    setUnlocked(false)
  }

  if (!ready) return <div className="min-h-screen bg-gray-50" />
  if (!unlocked) return <PinGate onUnlock={() => setUnlocked(true)} />
  return <AdminDashboard onLock={lock} />
}

function PinGate({ onUnlock }: { onUnlock: () => void }) {
  const [pin, setPin] = useState('')
  const [wrong, setWrong] = useState(false)

  function submit(e: FormEvent) {
    e.preventDefault()
    if (pin.trim() === ADMIN_PIN) {
      try {
        window.sessionStorage.setItem(UNLOCK_KEY, '1')
      } catch {
        // Works for this visit even if it cannot be remembered.
      }
      onUnlock()
    } else {
      setWrong(true)
    }
  }

  return (
    <div className="min-h-[80vh] bg-gray-50 flex items-center justify-center px-4">
      <form onSubmit={submit} className="bg-white rounded-2xl shadow-sm p-8 w-full max-w-sm">
        <div className="flex items-center gap-2 mb-2">
          <span className="bg-amber-500 text-gray-950 rounded-lg p-1.5">
            <Lock className="w-5 h-5" />
          </span>
          <h1 className="text-lg font-semibold text-gray-900">Admin</h1>
        </div>
        <p className="text-sm text-gray-500 mb-6">Enter the admin PIN to see every seller&apos;s sales.</p>
        <input
          type="password"
          inputMode="numeric"
          autoComplete="off"
          value={pin}
          onChange={(e) => {
            setPin(e.target.value)
            setWrong(false)
          }}
          placeholder="Admin PIN"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 mb-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
          autoFocus
        />
        <p className="text-sm text-red-600 min-h-5 mb-4">{wrong ? 'Wrong PIN. Try again.' : ''}</p>
        <button
          type="submit"
          className="w-full bg-amber-500 hover:bg-amber-400 text-gray-950 font-semibold py-2.5 rounded-lg transition-colors"
        >
          Unlock
        </button>
      </form>
    </div>
  )
}

function formatTime(d: Date | null): string {
  return d
    ? d.toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
    : '—'
}

function AdminDashboard({ onLock }: { onLock: () => void }) {
  const [tickets, setTickets] = useState<TicketRecord[] | null>(null)
  const [error, setError] = useState('')
  const [period, setPeriod] = useState<Period>('all')
  const [selectedSeller, setSelectedSeller] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => subscribeTickets(setTickets, setError), [])

  const rows = useMemo(() => newestFirst(filterPeriod(tickets ?? [], period)), [tickets, period])
  const sellers = useMemo(() => summarizeBySeller(rows), [rows])
  const trend = useMemo(() => salesByDay(tickets ?? []), [tickets])

  const totalTickets = rows.length
  const checkedIn = rows.filter((t) => t.checkedIn).length
  const totalRevenue = rows.reduce((sum, t) => sum + amountOf(t), 0)

  const stats = [
    { title: 'Tickets Sold', value: String(totalTickets), icon: TicketIcon, color: 'bg-amber-500' },
    {
      title: 'Checked In',
      value: `${checkedIn} / ${totalTickets}`,
      icon: CheckCircle2,
      color: 'bg-emerald-500',
    },
    {
      title: 'Revenue',
      value: `${EVENT.currency}${totalRevenue}`,
      icon: DollarSign,
      color: 'bg-blue-500',
    },
    { title: 'Active Sellers', value: String(sellers.length), icon: Users, color: 'bg-violet-500' },
  ]

  const salesTrendData = {
    labels: trend.map((d) => d.label),
    datasets: [
      {
        label: 'Tickets sold',
        data: trend.map((d) => d.count),
        borderColor: 'rgb(245, 158, 11)',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'rgb(245, 158, 11)',
      },
    ],
  }

  const revenueByType = {
    labels: TICKET_TYPES.map((t) => `${t.name} (${t.code})`),
    datasets: [
      {
        data: TICKET_TYPES.map((t) =>
          rows.filter((r) => r.type === String(t.price)).reduce((sum, r) => sum + amountOf(r), 0),
        ),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(139, 92, 246, 0.8)',
        ],
        borderWidth: 0,
      },
    ],
  }

  const sellerLeaderboard = {
    labels: sellers.map((s) => s.label),
    datasets: [
      {
        label: 'Revenue',
        data: sellers.map((s) => s.revenue),
        backgroundColor: 'rgba(16, 185, 129, 0.7)',
        borderRadius: 6,
      },
    ],
  }

  const q = search.trim().toLowerCase()
  const listed = rows
    .filter((r) => selectedSeller === null || sellerKey(r) === selectedSeller)
    .filter((r) => !q || `${r.name} ${r.phone} ${r.number} ${r.soldBy}`.toLowerCase().includes(q))
  const selected = sellers.find((s) => s.key === selectedSeller)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Admin Dashboard</h1>
            <p className="text-gray-500">
              {EVENT.name} — {EVENT.edition}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as Period)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              aria-label="Time period"
            >
              <option value="all">All time</option>
              <option value="today">Today only</option>
            </select>
            <button
              onClick={onLock}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <Lock className="w-4 h-4" /> Lock
            </button>
          </div>
        </div>

        {error && (
          <p className="mb-6 rounded-lg bg-red-50 text-red-700 text-sm px-4 py-3">
            Could not load sales: {error}
          </p>
        )}
        {tickets === null && !error && <p className="mb-6 text-sm text-gray-500">Loading sales…</p>}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <div
              key={stat.title}
              className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-4"
            >
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
          <h2 className="text-lg font-semibold text-gray-900 px-6 pt-6 pb-1">Sales by seller</h2>
          <p className="text-sm text-gray-500 px-6 pb-4">Select a seller to see only their sales below.</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-left">
                <tr>
                  <th className="px-6 py-2 font-medium">Seller</th>
                  <th className="px-6 py-2 font-medium">Tickets</th>
                  <th className="px-6 py-2 font-medium">Revenue</th>
                  <th className="px-6 py-2 font-medium">Paid by</th>
                  <th className="px-6 py-2 font-medium">Ticket types</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sellers.map((s) => (
                  <tr
                    key={s.key}
                    onClick={() => setSelectedSeller(selectedSeller === s.key ? null : s.key)}
                    className={`cursor-pointer hover:bg-gray-50 ${
                      selectedSeller === s.key ? 'bg-amber-50' : ''
                    }`}
                  >
                    <td className="px-6 py-3 font-medium text-gray-900">{s.label}</td>
                    <td className="px-6 py-3 text-gray-600">{s.count}</td>
                    <td className="px-6 py-3 font-semibold text-gray-900">
                      {EVENT.currency}
                      {s.revenue}
                    </td>
                    <td className="px-6 py-3 text-gray-600">
                      {Object.entries(s.payments)
                        .map(([method, amount]) => `${method} ${EVENT.currency}${amount}`)
                        .join(' · ')}
                    </td>
                    <td className="px-6 py-3 text-gray-600">
                      {Object.entries(s.types)
                        .map(([price, n]) => `${ticketTypeFor(price)?.name ?? EVENT.currency + price} ×${n}`)
                        .join(' · ')}
                    </td>
                  </tr>
                ))}
                {sellers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                      No sales yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Tickets Sold by Day</h2>
            <Line
              data={salesTrendData}
              options={{
                responsive: true,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
              }}
            />
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Ticket Type</h2>
            <div className="max-w-sm mx-auto">
              <Doughnut
                data={revenueByType}
                options={{
                  responsive: true,
                  plugins: { legend: { position: 'bottom' } },
                }}
              />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 lg:col-span-2">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Seller Leaderboard</h2>
            <Bar
              data={sellerLeaderboard}
              options={{
                responsive: true,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true } },
              }}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 px-6 pt-6 pb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {selected ? `Sales by ${selected.label}` : 'All Sales'} ({listed.length})
            </h2>
            <div className="flex items-center gap-3">
              {selected && (
                <button
                  onClick={() => setSelectedSeller(null)}
                  className="text-sm text-amber-700 underline"
                >
                  Show all sellers
                </button>
              )}
              <label className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search name, phone, ticket no."
                  className="rounded-lg border border-gray-300 pl-9 pr-3 py-2 text-sm w-64 max-w-full focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </label>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-left">
                <tr>
                  <th className="px-6 py-2 font-medium">Customer</th>
                  <th className="px-6 py-2 font-medium">Type</th>
                  <th className="px-6 py-2 font-medium">Amount</th>
                  <th className="px-6 py-2 font-medium">Payment</th>
                  <th className="px-6 py-2 font-medium">Sold By</th>
                  <th className="px-6 py-2 font-medium">Location</th>
                  <th className="px-6 py-2 font-medium">Sold</th>
                  <th className="px-6 py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {listed.slice(0, MAX_ROWS).map((t) => (
                  <tr key={t.number}>
                    <td className="px-6 py-3 text-gray-900">
                      {t.name || 'Guest'}
                      <span className="block text-xs text-gray-500">
                        {t.phone} · #{t.number}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-gray-600">{ticketTypeFor(t.type)?.name ?? '—'}</td>
                    <td className="px-6 py-3 text-gray-900 font-medium">
                      {EVENT.currency}
                      {amountOf(t)}
                    </td>
                    <td className="px-6 py-3 text-gray-600">{t.payment}</td>
                    <td className="px-6 py-3 text-gray-600">{t.soldBy || UNASSIGNED}</td>
                    <td className="px-6 py-3 text-gray-600">{t.location || '—'}</td>
                    <td className="px-6 py-3 text-gray-600 whitespace-nowrap">{formatTime(t.timestamp)}</td>
                    <td className="px-6 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          t.checkedIn ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {t.checkedIn ? 'Checked in' : 'Active'}
                      </span>
                    </td>
                  </tr>
                ))}
                {listed.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-gray-400">
                      No sales match.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {listed.length > MAX_ROWS && (
            <p className="px-6 py-3 text-xs text-gray-500 border-t border-gray-100">
              Showing the latest {MAX_ROWS} of {listed.length}. Search or pick a seller to narrow it down.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
