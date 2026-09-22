// Static event content: what the event is, what tickets cost, how they can be paid for.
// All sales data lives in Firestore (see tickets.ts), not here.

export const EVENT = {
  name: 'Sally Joy Camps',
  edition: 'George Lilanda Edition',
  date: 'Saturday, October 31, 2026',
  doors: '11:30 AM',
  time: '12:00 PM – 6:00 PM',
  venue: 'Mount Zion Church',
  location: 'George Lilanda, Lusaka',
  motto: 'Carry God’s Presence Wherever You Go',
  currency: 'K',
  highlights: ['Live Music', 'Rap', 'Poetry', 'Dance & Drama'],
}

export type TicketType = {
  id: 'early-bird' | 'regular' | 'vip'
  code: string
  name: string
  price: number
  tagline: string
  perks: string[]
  popular?: boolean
}

export const TICKET_TYPES: TicketType[] = [
  {
    id: 'early-bird',
    code: 'K50',
    name: 'Early Bird',
    price: 50,
    tagline: 'Best value, limited quantity',
    perks: ['General admission', 'Access to all main-stage acts'],
  },
  {
    id: 'regular',
    code: 'K80',
    name: 'Regular',
    price: 80,
    tagline: 'The standard camp experience',
    perks: ['General admission', 'Access to all main-stage acts', 'Camp welcome pack'],
    popular: true,
  },
  {
    id: 'vip',
    code: 'K150',
    name: 'VIP',
    price: 150,
    tagline: 'Front-row access and extras',
    perks: ['Front-section seating', 'Fast-track entry', 'Camp welcome pack', 'Meet & greet'],
  },
]

export const PAYMENT_METHODS = ['Cash', 'Mobile Money', 'Bank Transfer', 'WhatsApp'] as const
