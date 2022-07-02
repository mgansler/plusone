import { Link } from '@remix-run/react'

export default function Index() {
  return (
    <main>
      <h2>Welcome to feeds-web</h2>
      <Link to={'/login'}>Login</Link>
    </main>
  )
}
