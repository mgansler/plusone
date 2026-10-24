import { createFileRoute } from '@tanstack/react-router'
import { GPXViewer } from '../components/GPXViewer'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  return <GPXViewer />
}
