# Sally Joy Camps — Ticketing Platform

A ticketing site for the Sally Joy Camps event (George Lilanda Edition, October
31, 2026). Sellers issue scannable QR tickets in person, gate staff scan them at
the door, and the admin sees every seller's sales live.

## Tech stack

- [TanStack Start](https://tanstack.com/start) (React 19, file-based routing)
- Tailwind CSS 4
- Firebase Firestore for all ticket data (project `sallyjoy-19efc`)
- `qrcode` to draw tickets, `jsqr` to read them with the phone camera
- Chart.js / react-chartjs-2 for the admin charts
- Deployed on Netlify

## Screens

- `/` — event landing page (photo hero, schedule, ticket prices)
- `/sell` — seller sign-in (name + booth), ticket issuing, WhatsApp / save-image / print
- `/checkin` — gate scanner: camera QR scan plus manual ticket-number entry
- `/admin` — PIN-protected dashboard: totals, sales by seller, charts, searchable list of every sale
- `/ticket/$id` — the customer's own ticket page (linked from the WhatsApp message)

## Running locally

```bash
pnpm install
pnpm dev
```

Or with the Netlify CLI, for full platform emulation:

```bash
netlify dev
```

## Configuration

- **Admin PIN**: defaults to `2026`. Set `VITE_ADMIN_PIN` in Netlify (Site settings →
  Environment variables) to change it. It is a soft lock, not real security: the value
  ships in the site's JavaScript.
- **Firestore rules**: the app reads and writes the `tickets` collection directly from the
  browser, so the rules must allow that. Check them in the Firebase console before the
  event: Test-mode rules expire 30 days after they are created.
- **Firebase project**: change the config in `src/lib/firebase.ts` to use a different project.

## Data

One Firestore collection, `tickets`, document id = ticket number. Fields: `name`, `phone`,
`type` (`"50"` | `"80"` | `"150"`), `typeText`, `payment`, `soldBy`, `location`, `date`,
`timestamp`, `checkedIn`, `checkedInAt`. The QR code holds `SJC:` + the ticket number.
Tickets sold in the earlier single-file app use the same collection and still appear
(without a seller name, they are listed as "Unassigned").

See `PLAN.md` for what is still to do.
