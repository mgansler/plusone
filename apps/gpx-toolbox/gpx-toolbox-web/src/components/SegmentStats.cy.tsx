import { mount } from 'cypress/react'

import type { TrackPoint } from '@plusone/gpx-toolbox-utils'

import { SegmentStats } from './SegmentStats'

// Same fixture as the Vitest spec: three 5-min hops at ~48°N.
// Distance/speed come from the Haversine calc (not asserted exactly);
// elevation and duration are deterministic.
const points: Array<TrackPoint> = [
  { latitude: 48.1372, longitude: 11.5756, elevation: 500, time: new Date('2024-01-01T10:00:00Z') },
  { latitude: 48.14, longitude: 11.58, elevation: 550, time: new Date('2024-01-01T10:05:00Z') },
  { latitude: 48.145, longitude: 11.585, elevation: 520, time: new Date('2024-01-01T10:10:00Z') },
]

describe('SegmentStats (Cypress component test)', () => {
  it('shows the empty-state hint for fewer than two points', () => {
    mount(<SegmentStats points={[]} />)
    cy.get('body').should('contain.text', 'Wähle mindestens 2 Punkte aus')
  })

  it('renders the overview labels in a real browser', () => {
    mount(<SegmentStats points={points} />)
    cy.get('body').should('contain.text', 'Distanz')
    cy.get('body').should('contain.text', 'Höhenmeter ↑')
    cy.get('body').should('contain.text', 'Tiefenmeter ↓')
    cy.get('body').should('contain.text', 'Dauer')
    cy.get('body').should('contain.text', 'Ø Geschw.')
  })

  it('computes deterministic elevation gain, loss and duration', () => {
    mount(<SegmentStats points={points} />)
    cy.get('body').should('contain.text', '50 m') // 500→550 gain
    cy.get('body').should('contain.text', '30 m') // 550→520 loss
    cy.get('body').should('contain.text', '10m 0s') // 10:00→10:10
  })
})
