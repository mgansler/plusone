import { LiveReload } from 'remix'

export default function Root() {
  return (
    <html lang={'en'}>
      <head>
        <meta charSet={'utf-8'} />
        <title>Advent of Code 2021</title>
      </head>
      <body>
        Welcome to my Advent of Code App
        {process.env.NODE_ENV === 'development' ? <LiveReload /> : null}
      </body>
    </html>
  )
}
