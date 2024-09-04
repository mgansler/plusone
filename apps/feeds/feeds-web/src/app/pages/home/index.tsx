import { Link } from 'react-router-dom'

import { useUserContext } from '../../context/user'

export function Home() {
  const { isLoggedIn, userInfo } = useUserContext()

  return (
    <div>
      <h4>This will be the homepage/landing page of the app</h4>
      <Link to={isLoggedIn ? (userInfo?.isAdmin ? '/admin' : '/member') : '/'}>Let's get started</Link>
    </div>
  )
}
