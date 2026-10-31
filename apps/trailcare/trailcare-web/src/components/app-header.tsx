import { Link, useLocation } from '@tanstack/react-router'
import type { ReactNode } from 'react'

import { useLogout, useSession } from '../lib/session'

type AppHeaderProps = { title?: ReactNode; back?: ReactNode }

export function AppHeader({ title = 'Trailcare', back }: AppHeaderProps) {
  const { isAdmin } = useSession()
  const logout = useLogout()
  const isAdminArea = useLocation({ select: (location) => location.pathname.startsWith('/admin') })

  return (
    <header className="app-header">
      {back}
      <div className="app-header-title">{title}</div>
      <nav className="app-header-nav">
        {isAdmin && !isAdminArea && (
          <Link to="/admin" className="header-link">
            Verwaltung
          </Link>
        )}
        <button className="header-link" onClick={logout}>
          Abmelden
        </button>
      </nav>
    </header>
  )
}
