import { Link, useRouterState } from '@tanstack/react-router'
import { Ticket } from 'lucide-react'
import { EVENT } from '@/lib/fixtures'

const navLink =
  'px-2 sm:px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 transition-colors'
const activeNavLink = 'text-white bg-white/15'

const STAFF_PREFIXES = ['/sell', '/checkin', '/admin', '/staff']

function isStaffPath(pathname: string): boolean {
  return STAFF_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '/'))
}

export function Header() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const staff = isStaffPath(pathname)

  return (
    <header className="bg-gray-950 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-white font-semibold">
          <span className="bg-amber-500 text-gray-950 rounded-lg p-1.5">
            <Ticket className="w-5 h-5" />
          </span>
          <span className="hidden sm:flex flex-col leading-tight">
            <span>{EVENT.name}</span>
            <span className="text-xs font-normal text-gray-400">
              {staff ? 'Staff tools' : EVENT.edition}
            </span>
          </span>
        </Link>

        {staff ? (
          <nav className="flex items-center gap-1">
            <Link to="/staff" className={navLink} activeProps={{ className: `${navLink} ${activeNavLink}` }} activeOptions={{ exact: true }}>
              Staff home
            </Link>
            <Link to="/sell" className={navLink} activeProps={{ className: `${navLink} ${activeNavLink}` }}>
              Sell
            </Link>
            <Link to="/checkin" className={navLink} activeProps={{ className: `${navLink} ${activeNavLink}` }}>
              Check-in
            </Link>
            <Link to="/admin" className={navLink} activeProps={{ className: `${navLink} ${activeNavLink}` }}>
              Admin
            </Link>
            <Link to="/" className={navLink}>
              Public site
            </Link>
          </nav>
        ) : (
          <nav className="flex items-center gap-1">
            <a href="#tickets" className={navLink}>
              Tickets
            </a>
            <a href="#when-where" className={navLink}>
              When &amp; where
            </a>
            <a href="#how-to-buy" className={navLink}>
              How to buy
            </a>
          </nav>
        )}
      </div>
    </header>
  )
}
