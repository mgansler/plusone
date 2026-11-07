import { vi } from 'vitest'

/**
 * Replaces `window.matchMedia` so tests choose between the mobile and desktop layout.
 * Returns a function that switches the viewport and notifies subscribed components.
 */
export function mockViewport(initiallyMobile: boolean): (mobile: boolean) => void {
  let mobile = initiallyMobile
  const listeners = new Set<() => void>()

  vi.stubGlobal('matchMedia', (query: string) => ({
    media: query,
    get matches() {
      return mobile
    },
    addEventListener: (_type: string, listener: () => void) => listeners.add(listener),
    removeEventListener: (_type: string, listener: () => void) => listeners.delete(listener),
  }))

  return (next) => {
    mobile = next
    listeners.forEach((listener) => listener())
  }
}
