import { createFileRoute } from '@tanstack/react-router'

import { GPXViewer } from '../components/GPXViewer'

/** GPX tools: open a local GPX file and analyse it (previously the start page) */
export const Route = createFileRoute('/utils')({
  component: UtilsPage,
})

function UtilsPage() {
  return <GPXViewer />
}
