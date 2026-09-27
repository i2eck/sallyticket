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

## Payment

Only two methods are accepted: **Cash** and **Mobile Money**. Mobile money goes to either
number, both listed in `MOBILE_MONEY_NUMBERS` in `src/lib/fixtures.ts`:

- **0962493177** — June Mumba
- **0972322985** — Joshua Phiri

They are shown on the landing page and on the sell form as soon as Mobile Money is picked.
Tickets already sold under the old `Bank Transfer` / `WhatsApp` options keep their stored
`payment` value and still show correctly in the admin dashboard.

## Ticket sharing

A ticket is tied to the phone that opens its link first, so a buyer cannot pass it on:

- The WhatsApp message contains a **link, not the ticket image**. A picture of the QR can be
  forwarded and shown at the gate by anyone; a link cannot.
- Each ticket gets a random `shareToken`. The link is `/ticket/$id?t=TOKEN`, so the ticket
  number on its own is not enough to open a ticket.
- The first phone to open the link is recorded in `claimDeviceId`. Any other phone gets
  "this ticket belongs to another phone" and no QR code.
- The customer page has no download button, so there is no forwardable copy to hand on.
  Sellers hand over paper at the booth instead (Save image / Print on `/sell`).
- The gate is unaffected: the QR still contains only `SJC:` + the ticket number, and a ticket
  is still admitted once, inside a transaction.

Limits worth knowing before the event:

- A customer who changes phones or clears their browser data loses the QR. Gate staff admit
  them by typing the ticket number, which is the intended escape hatch.
- Nothing stops a buyer photographing their own screen at the gate. The only real answer to
  that is matching the photo ID on the ticket to the name printed on it.
- **The rules are the weak point, not the link.** The browser still writes `tickets` directly,
  so while the Firestore rules are open anyone can clear `checkedIn` in the console and reuse
  a ticket. Locking the check-in write behind a server function is the next step in `PLAN.md`.

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
`timestamp`, `checkedIn`, `checkedInAt`, `shareToken`, `claimDeviceId`, `claimedAt`. The QR
code holds `SJC:` + the ticket number. Tickets sold in the earlier single-file app use the
same collection and still appear (without a seller name, they are listed as "Unassigned"),
and because they have no `shareToken` their ticket page still works for anyone who has the
link.

See `PLAN.md` for what is still to do.
