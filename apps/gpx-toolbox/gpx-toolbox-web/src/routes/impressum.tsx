import { createFileRoute } from '@tanstack/react-router'

import { Imprint } from '../components/Imprint'

/** Public, like the privacy policy */
export const Route = createFileRoute('/impressum')({
  component: Imprint,
})
