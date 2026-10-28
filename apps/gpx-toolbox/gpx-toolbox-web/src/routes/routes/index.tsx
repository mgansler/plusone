import { createFileRoute, redirect } from '@tanstack/react-router'

/** The routes list moved to the start page; keep old links and bookmarks working */
export const Route = createFileRoute('/routes/')({
  beforeLoad: () => {
    throw redirect({ to: '/', replace: true })
  },
})
