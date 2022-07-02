import { Link } from '@remix-run/react'

export default function () {
  return (
    <div>
      <h1>Welcome to Feeds-Remix</h1>
      <p>
        This is the landing page, to get started you need to <Link to={'/login'}>login</Link>
      </p>
    </div>
  )
}
