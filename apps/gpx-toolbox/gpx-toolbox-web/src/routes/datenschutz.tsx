import { createFileRoute } from '@tanstack/react-router'

import { PrivacyPolicy } from '../components/PrivacyPolicy'

/** Public, so it can be read before logging in and be linked from Google's consent screen */
export const Route = createFileRoute('/datenschutz')({
  component: PrivacyPolicy,
})
