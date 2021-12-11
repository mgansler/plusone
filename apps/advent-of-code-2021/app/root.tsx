import type { LinksFunction } from 'remix'
import { Link, Links, LiveReload, Outlet, useCatch } from 'remix'

import globalStylesUrl from './styles/global.css'

export const links: LinksFunction = () => {
  return [{ rel: 'stylesheet', href: globalStylesUrl }]
}

export function CatchBoundary() {
  const caught = useCatch()

  console.log(caught)

  return (
    <main>
      <p>The page you are looking for does not exist!</p>
    </main>
  )
}

export default function Root() {
  const days = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11']

  return (
    <html lang={'en'}>
      <head>
        <meta charSet={'utf-8'} />
        <title>Advent of Code 2021</title>
        <Links />
      </head>
      <body>
        Welcome to my Advent of Code App
        {process.env.NODE_ENV === 'development' ? <LiveReload /> : null}
        <nav>
          {days.map((day) => (
            <Link key={day} to={`days/${day}`}>
              {day}
            </Link>
          ))}
        </nav>
        <Outlet />
      </body>
    </html>
  )
}
