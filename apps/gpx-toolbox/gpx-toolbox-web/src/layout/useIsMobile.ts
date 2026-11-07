import { useSyncExternalStore } from 'react'

import { MOBILE_MAX_WIDTH } from './tokens'

const MOBILE_QUERY = `(max-width: ${MOBILE_MAX_WIDTH}px)`

/** Whether the viewport is currently in the mobile range; for one-off checks outside of components */
export function isMobileViewport(): boolean {
  return window.matchMedia(MOBILE_QUERY).matches
}

function subscribe(onChange: () => void): () => void {
  const query = window.matchMedia(MOBILE_QUERY)
  query.addEventListener('change', onChange)
  return () => query.removeEventListener('change', onChange)
}

/** Re-renders when the viewport crosses the mobile breakpoint, so a page renders one layout instead of hiding the other */
export function useIsMobile(): boolean {
  return useSyncExternalStore(subscribe, isMobileViewport)
}
