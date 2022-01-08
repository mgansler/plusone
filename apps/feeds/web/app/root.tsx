import type { ReactNode } from 'react'
import { Links, LiveReload, Meta, Outlet, Scripts, ScrollRestoration } from 'remix'

export default function App() {
  return (
    <Document title={'feeds-web'}>
      <Outlet />
    </Document>
  )
}

function Document({ children, title }: { children: ReactNode; title?: string }) {
  return (
    <html lang={'en'}>
      <head>
        <meta charSet={'utf-8'} />
        {title ? <title>{title}</title> : null}
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
        {process.env.NODE_ENV === 'development' && <LiveReload />}
      </body>
    </html>
  )
}
