/** The search measures the distance to the midpoint of a route; this is the midpoint of the Hausrunde fixture */
export const HAUSRUNDE = { latitude: 48.7898, longitude: 9.2029 }

/** Logarithmic radius steps in km — must match NearbyFilters.tsx */
export const RADIUS_STEPS = [0.2, 0.5, 1, 2, 5, 10, 20, 50, 500] as const

/** The midpoint of the Bergtour fixture is about 10.5 km away from the one of the Hausrunde; 20 km is the first RADIUS_STEPS value that reaches it */
export const RADIUS_TO_REACH_BERGTOUR_KM = 20

/** Open /routes with the browser located at `position`, so the search does not wait for a permission prompt */
export function visitRoutesAt(position: { latitude: number; longitude: number }) {
  cy.visit('/routes', {
    onBeforeLoad(win) {
      Object.defineProperty(win.navigator, 'geolocation', {
        configurable: true,
        value: {
          getCurrentPosition: (onFound: PositionCallback) => onFound({ coords: position } as GeolocationPosition),
        },
      })
    },
  })
}

/** Move the radius slider; React only notices a value set through the native setter followed by an input event */
export function setRadius(km: (typeof RADIUS_STEPS)[number]) {
  const index = RADIUS_STEPS.indexOf(km)
  if (index < 0) {
    throw new Error(`setRadius(${km}) called with a value not in RADIUS_STEPS: ${RADIUS_STEPS.join(', ')}`)
  }
  cy.findByLabelText(/^Radius:/).then(($slider) => {
    const slider = $slider[0] as HTMLInputElement
    const win = slider.ownerDocument.defaultView as Window & typeof globalThis
    Object.getOwnPropertyDescriptor(win.HTMLInputElement.prototype, 'value')?.set?.call(slider, String(index))
    slider.dispatchEvent(new win.Event('input', { bubbles: true }))
  })
}
