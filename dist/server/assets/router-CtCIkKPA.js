import { useRouterState, Link, createRootRoute, HeadContent, Scripts, createFileRoute, lazyRouteComponent, createRouter } from "@tanstack/react-router";
import { jsx, jsxs } from "react/jsx-runtime";
import { useEffect } from "react";
import { Ticket } from "lucide-react";
import { Chart, CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler } from "chart.js";
const EVENT = {
  name: "Sally Joy Camps",
  edition: "George Lilanda Edition",
  date: "Saturday, October 31, 2026",
  doors: "11:30 AM",
  time: "12:00 PM – 6:00 PM",
  venue: "Mount Zion Church",
  location: "George Lilanda, Lusaka",
  motto: "Carry God’s Presence Wherever You Go",
  currency: "K",
  highlights: ["Live Music", "Rap", "Poetry", "Dance & Drama"]
};
const TICKET_TYPES = [
  {
    id: "early-bird",
    code: "K50",
    name: "Early Bird",
    price: 50,
    tagline: "Best value, limited quantity",
    perks: ["General admission", "Access to all main-stage acts"]
  },
  {
    id: "regular",
    code: "K80",
    name: "Regular",
    price: 80,
    tagline: "The standard camp experience",
    perks: ["General admission", "Access to all main-stage acts", "Camp welcome pack"],
    popular: true
  },
  {
    id: "vip",
    code: "K150",
    name: "VIP",
    price: 150,
    tagline: "Front-row access and extras",
    perks: ["Front-section seating", "Fast-track entry", "Camp welcome pack", "Meet & greet"]
  }
];
const PAYMENT_METHODS = ["Cash", "Mobile Money"];
const MOBILE_MONEY_NUMBERS = [
  { name: "June Mumba", number: "0962493177" },
  { name: "Joshua Phiri", number: "0972322985" }
];
const navLink = "px-2 sm:px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 transition-colors";
const activeNavLink = "text-white bg-white/15";
const STAFF_PREFIXES = ["/sell", "/checkin", "/admin", "/staff"];
function isStaffPath(pathname) {
  return STAFF_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"));
}
function Header() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const staff = isStaffPath(pathname);
  return /* @__PURE__ */ jsx("header", { className: "bg-gray-950 border-b border-white/10", children: /* @__PURE__ */ jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between", children: [
    /* @__PURE__ */ jsxs(Link, { to: "/", className: "flex items-center gap-2 text-white font-semibold", children: [
      /* @__PURE__ */ jsx("span", { className: "bg-amber-500 text-gray-950 rounded-lg p-1.5", children: /* @__PURE__ */ jsx(Ticket, { className: "w-5 h-5" }) }),
      /* @__PURE__ */ jsxs("span", { className: "hidden sm:flex flex-col leading-tight", children: [
        /* @__PURE__ */ jsx("span", { children: EVENT.name }),
        /* @__PURE__ */ jsx("span", { className: "text-xs font-normal text-gray-400", children: staff ? "Staff tools" : EVENT.edition })
      ] })
    ] }),
    staff ? /* @__PURE__ */ jsxs("nav", { className: "flex items-center gap-1", children: [
      /* @__PURE__ */ jsx(Link, { to: "/staff", className: navLink, activeProps: { className: `${navLink} ${activeNavLink}` }, activeOptions: { exact: true }, children: "Staff home" }),
      /* @__PURE__ */ jsx(Link, { to: "/sell", className: navLink, activeProps: { className: `${navLink} ${activeNavLink}` }, children: "Sell" }),
      /* @__PURE__ */ jsx(Link, { to: "/checkin", className: navLink, activeProps: { className: `${navLink} ${activeNavLink}` }, children: "Check-in" }),
      /* @__PURE__ */ jsx(Link, { to: "/admin", className: navLink, activeProps: { className: `${navLink} ${activeNavLink}` }, children: "Admin" }),
      /* @__PURE__ */ jsx(Link, { to: "/", className: navLink, children: "Public site" })
    ] }) : /* @__PURE__ */ jsxs("nav", { className: "flex items-center gap-1", children: [
      /* @__PURE__ */ jsx("a", { href: "#tickets", className: navLink, children: "Tickets" }),
      /* @__PURE__ */ jsx("a", { href: "#when-where", className: navLink, children: "When & where" }),
      /* @__PURE__ */ jsx("a", { href: "#how-to-buy", className: navLink, children: "How to buy" })
    ] })
  ] }) });
}
function registerServiceWorker() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch((err) => {
      console.warn("Service worker registration failed:", err);
    });
  });
}
const siteName = "Sally Joy Camps Tickets";
const siteDescription = "Buy and sell tickets for Sally Joy Camps: George Lilanda Edition, October 31, 2026.";
const Route$6 = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { title: siteName },
      { name: "description", content: siteDescription },
      { property: "og:title", content: siteName },
      { property: "og:description", content: siteDescription },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      // PWA
      { name: "theme-color", content: "#2a0c38" },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      { name: "apple-mobile-web-app-title", content: "SJC Tickets" },
      { name: "application-name", content: "SJC Tickets" }
    ],
    links: [
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "icon", href: "/favicon.ico" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" }
    ]
  }),
  shellComponent: RootDocument
});
function RootDocument({ children }) {
  useEffect(() => {
    registerServiceWorker();
  }, []);
  return /* @__PURE__ */ jsxs("html", { lang: "en", children: [
    /* @__PURE__ */ jsx("head", { children: /* @__PURE__ */ jsx(HeadContent, {}) }),
    /* @__PURE__ */ jsxs("body", { children: [
      /* @__PURE__ */ jsx(Header, {}),
      children,
      /* @__PURE__ */ jsx(Scripts, {})
    ] })
  ] });
}
const $$splitComponentImporter$5 = () => import("./staff-C5CNhJNH.js");
const Route$5 = createFileRoute("/staff")({
  component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
const $$splitComponentImporter$4 = () => import("./sell-CU3buPuj.js");
const Route$4 = createFileRoute("/sell")({
  component: lazyRouteComponent($$splitComponentImporter$4, "component"),
  validateSearch: (search) => ({
    type: typeof search.type === "string" ? search.type : void 0
  })
});
const $$splitComponentImporter$3 = () => import("./checkin-B6JxPvNM.js");
const Route$3 = createFileRoute("/checkin")({
  component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
const $$splitComponentImporter$2 = () => import("./admin-CtzqNZC4.js");
Chart.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler);
const Route$2 = createFileRoute("/admin")({
  component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
const $$splitComponentImporter$1 = () => import("./index-HY1h_PBH.js");
const Route$1 = createFileRoute("/")({
  component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
const $$splitComponentImporter = () => import("./ticket._id-CY8X9pXq.js");
const Route = createFileRoute("/ticket/$id")({
  component: lazyRouteComponent($$splitComponentImporter, "component"),
  validateSearch: (search) => ({
    t: typeof search.t === "string" ? search.t : void 0
  })
});
const StaffRoute = Route$5.update({
  id: "/staff",
  path: "/staff",
  getParentRoute: () => Route$6
});
const SellRoute = Route$4.update({
  id: "/sell",
  path: "/sell",
  getParentRoute: () => Route$6
});
const CheckinRoute = Route$3.update({
  id: "/checkin",
  path: "/checkin",
  getParentRoute: () => Route$6
});
const AdminRoute = Route$2.update({
  id: "/admin",
  path: "/admin",
  getParentRoute: () => Route$6
});
const IndexRoute = Route$1.update({
  id: "/",
  path: "/",
  getParentRoute: () => Route$6
});
const TicketIdRoute = Route.update({
  id: "/ticket/$id",
  path: "/ticket/$id",
  getParentRoute: () => Route$6
});
const rootRouteChildren = {
  IndexRoute,
  AdminRoute,
  CheckinRoute,
  SellRoute,
  StaffRoute,
  TicketIdRoute
};
const routeTree = Route$6._addFileChildren(rootRouteChildren)._addFileTypes();
const getRouter = () => {
  const router2 = createRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreloadStaleTime: 0
  });
  return router2;
};
const router = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  getRouter
}, Symbol.toStringTag, { value: "Module" }));
export {
  EVENT as E,
  MOBILE_MONEY_NUMBERS as M,
  PAYMENT_METHODS as P,
  Route$4 as R,
  TICKET_TYPES as T,
  Route as a,
  router as r
};
