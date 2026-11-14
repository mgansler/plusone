import { useEffect } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'

import { useAuth } from '../lib/auth-context'

/** Root redirect: authenticated users go to /routes */
function RootRedirect() {
  const navigate = useNavigate()
  const { isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    if (isLoading) return
    if (!isAuthenticated) {
      navigate({ to: '/login', replace: true })
      return
    }
    navigate({ to: '/routes', replace: true })
  }, [isAuthenticated, isLoading, navigate])

  return null
}

export const Route = createFileRoute('/')({
  component: RootRedirect,
})
