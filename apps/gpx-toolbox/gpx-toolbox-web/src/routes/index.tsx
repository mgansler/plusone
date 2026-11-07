import { useEffect } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'

import { isMobileViewport } from '../layout/useIsMobile'
import { useAuth } from '../lib/auth-context'

/** Root redirect: mobile goes to /nearby, desktop goes to /routes */
function RootRedirect() {
  const navigate = useNavigate()
  const { isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    if (isLoading) return
    if (!isAuthenticated) {
      navigate({ to: '/login', replace: true })
      return
    }
    const target = isMobileViewport() ? '/nearby' : '/routes'
    navigate({ to: target, replace: true })
  }, [isAuthenticated, isLoading, navigate])

  return null
}

export const Route = createFileRoute('/')({
  component: RootRedirect,
})
