# AGENTS.md

Overview of this codebase for AI agents and developers picking up the work.

## Project

Ticketing platform for the Sally Joy Camps event. Built with TanStack Start
(React 19 + file-based routing), Tailwind CSS 4, Chart.js, and Firebase Firestore.
Deployed on Netlify. Read `PLAN.md` before starting new work.

## Directory structure

```
├── public/
│   └── img/hero.jpg          # Event photo used as the landing-page hero
├── src/
│   ├── components/
│   │   └── Header.tsx        # Site nav: Home / Sell Tickets / Check-in / Admin
│   ├── lib/
│   │   ├── fixtures.ts       # Static event info, ticket types, payment methods
│   │   ├── firebase.ts       # Firebase init; getDb() (browser only)
│   │   ├── tickets.ts        # Firestore reads/writes: save, live queries, check-in transaction
│   │   ├── sales.ts          # Pure helpers: totals, per-seller summary, sales by day
│   │   ├── ticket-codes.ts   # Ticket numbers, QR payload, parsing scanned text
│   │   └── ticket-image.ts   # Draws the ticket PNG; share / download
│   ├── routes/
│   │   ├── __root.tsx        # Root layout: Header + global styles + SEO meta
│   │   ├── index.tsx         # Landing page
│   │   ├── sell.tsx          # Seller sign-in + ticket issuing
│   │   ├── checkin.tsx       # Gate scanner
│   │   ├── admin.tsx         # PIN-gated sales dashboard
│   │   └── ticket.$id.tsx    # Customer ticket page
│   ├── router.tsx            # TanStack Router setup
│   └── styles.css            # Tailwind import + base + print styles
├── netlify.toml
└── PLAN.md                   # Roadmap
```

## Key concepts

### Data lives in Firestore

There is one collection, `tickets` (document id = ticket number). `src/lib/tickets.ts` is
the only file that talks to Firestore; routes call its functions. `recordFromDoc` reads
every field defensively because tickets from the earlier single-file app have no
`soldBy` or `location`. Keep field names stable: the earlier app shares this collection.

Firebase must only be touched in the browser (effects and event handlers), never during
SSR: call `getDb()` lazily.

### Sellers

A seller signs in with a name and booth, kept in `localStorage`. Every ticket stores
`soldBy` and `location`. The admin groups by `soldBy` case-insensitively.

### Admin

`/admin` subscribes to the whole collection with `onSnapshot`. Everything shown is derived
from that one array through the helpers in `sales.ts`. The PIN gate (`VITE_ADMIN_PIN`,
default `2026`) is a soft lock only.

## Conventions

- Routes are files in `src/routes/`; add a screen by adding a file there.
- Import path alias `@/*` maps to `src/*`.
- TypeScript strict mode, including `noUnusedLocals`/`noUnusedParameters`: no unused
  imports or params.
- Tailwind utility classes only; no separate CSS files per component.
