import { createFileRoute, Link } from '@tanstack/react-router'
import { Ticket, ScanLine, LayoutDashboard, ArrowRight } from 'lucide-react'
import { EVENT } from '@/lib/fixtures'

export const Route = createFileRoute('/staff')({
  component: StaffPortal,
})

const tools = [
  {
    to: '/sell' as const,
    title: 'Sell tickets',
    description: 'Sign in with your name and booth, issue QR tickets, share on WhatsApp.',
    icon: Ticket,
    color: 'bg-amber-500 text-gray-950',
  },
  {
    to: '/checkin' as const,
    title: 'Gate check-in',
    description: 'Scan QR codes or type ticket numbers. Marks each ticket used once.',
    icon: ScanLine,
    color: 'bg-emerald-600 text-white',
  },
  {
    to: '/admin' as const,
    title: 'Admin dashboard',
    description: 'Live sales totals, charts, and every ticket. PIN protected.',
    icon: LayoutDashboard,
    color: 'bg-purple-800 text-amber-100',
  },
]

function StaffPortal() {
  return (
    <div className="min-h-[80vh] bg-gray-100">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <p className="text-xs font-bold tracking-[0.2em] uppercase text-amber-700">Staff only</p>
        <h1 className="mt-2 text-3xl font-bold text-gray-950 font-serif">{EVENT.name}</h1>
        <p className="mt-2 text-gray-600">
          Tools for sellers, gate team, and organisers. Guests should use the{' '}
          <Link to="/" className="text-amber-800 font-medium underline underline-offset-2">
            public event page
          </Link>
          .
        </p>

        <div className="mt-10 grid gap-4">
          {tools.map((tool) => (
            <Link
              key={tool.to}
              to={tool.to}
              className="group flex items-start gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm hover:border-amber-400 hover:shadow-md transition-all"
            >
              <span className={`rounded-xl p-3 ${tool.color}`}>
                <tool.icon className="w-6 h-6" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-950 text-lg group-hover:text-amber-900">
                  {tool.title}
                </p>
                <p className="mt-1 text-sm text-gray-600">{tool.description}</p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-amber-600 shrink-0 mt-1" />
            </Link>
          ))}
        </div>

        <p className="mt-10 text-center text-xs text-gray-400">
          Bookmark this page for event day: <span className="font-mono">/staff</span>
        </p>
      </div>
    </div>
  )
}
