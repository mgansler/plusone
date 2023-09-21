import type { MetaFunction } from '@remix-run/node'
import { Link, Links, LiveReload, Meta, Outlet, Scripts, ScrollRestoration } from '@remix-run/react'

export const meta: MetaFunction = () => {
  return [
    {
      charset: 'utf-8',
      title: 'Advent of Code 2021',
      viewport: 'width=device-width,initial-scale=1',
    },
  ]
}

export default function App() {
  const days = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17']

  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        Welcome to my Advent of Code App
        <nav>
          {days.map((day) => (
            <Link key={day} to={`days/${day}`}>
              {day}
            </Link>
          ))}
        </nav>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}
