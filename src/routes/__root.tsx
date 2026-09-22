import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
import { useEffect } from 'react'
import { Header } from '@/components/Header'
import { registerServiceWorker } from '@/lib/register-sw'

import '../styles.css'

const siteName = 'Sally Joy Camps Tickets'
const siteDescription =
  'Buy and sell tickets for Sally Joy Camps: George Lilanda Edition, October 31, 2026.'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
      { title: siteName },
      { name: 'description', content: siteDescription },
      { property: 'og:title', content: siteName },
      { property: 'og:description', content: siteDescription },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary_large_image' },
      // PWA
      { name: 'theme-color', content: '#2a0c38' },
      { name: 'mobile-web-app-capable', content: 'yes' },
      { name: 'apple-mobile-web-app-capable', content: 'yes' },
      { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
      { name: 'apple-mobile-web-app-title', content: 'SJC Tickets' },
      { name: 'application-name', content: 'SJC Tickets' },
    ],
    links: [
      { rel: 'manifest', href: '/manifest.webmanifest' },
      { rel: 'icon', href: '/favicon.ico' },
      { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
    ],
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    registerServiceWorker()
  }, [])

  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <Header />
        {children}
        <Scripts />
      </body>
    </html>
  )
}
