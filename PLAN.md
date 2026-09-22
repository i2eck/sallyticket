# Roadmap

## Done
- Landing page with event branding and ticket prices, using the event photo as the hero.
- Seller flow: sign-in with name and booth, ticket issuing, QR ticket saved to Firestore,
  WhatsApp share (ticket image), save image, print, and a live list of the seller's sales.
- Gate check-in: camera QR scan and manual entry. A transaction marks the ticket used, so
  two phones can never admit the same ticket.
- Admin dashboard on live data: totals, sales by seller (with payment split), charts, and a
  searchable list of every sale, filterable by seller and by day. PIN-protected.
- Public `/ticket/$id` page for customers.

## Next
- **Real access control.** The admin PIN is a soft lock and Firestore is opened to the
  browser. Add Firebase Auth (or a server function that checks a secret) and tighten the
  Firestore rules so only signed-in sellers can create tickets and only admins can read all.
- **Server-side ticket creation.** Issue tickets through a Netlify function so ticket
  numbers and prices are set by the server, not trusted from the browser.
- **Payment verification.** Let the admin mark sales as verified (cash handed in, mobile
  money received) and show unverified totals per seller.
- **Offline selling.** Queue sales on the seller's phone when there is no signal and sync
  when back online, with a clear "not valid yet" state.
- **Export.** Download all sales as CSV for reconciliation after the event.
