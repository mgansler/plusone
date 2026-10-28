import { mount } from 'cypress/react'

import type { TrackPoint } from '@plusone/gpx-toolbox-utils'

import { ElevationProfile } from './ElevationProfile'

const points: Array<TrackPoint> = [
  { latitude: 48.1372, longitude: 11.5756, elevation: 500, time: new Date('2024-01-01T10:00:00Z') },
  { latitude: 48.14, longitude: 11.58, elevation: 550, time: new Date('2024-01-01T10:05:00Z') },
  { latitude: 48.145, longitude: 11.585, elevation: 520, time: new Date('2024-01-01T10:10:00Z') },
]

describe('ElevationProfile (Cypress component test)', () => {
  it('renders an SVG with the full track, segment and start/end markers', () => {
    mount(<ElevationProfile points={points} range={[0, 100]} />)
    cy.get('svg').should('exist')
    // full area + full line + segment area + segment line
    cy.get('svg path').should('have.length.at.least', 3)
    // start + end markers
    cy.get('svg circle').should('have.length', 2)
  })

  it('shows the start and end elevation labels for the full range', () => {
    mount(<ElevationProfile points={points} range={[0, 100]} />)
    cy.get('body').should('contain.text', '↑ 500 m')
    cy.get('body').should('contain.text', '520 m ↓')
  })
})
