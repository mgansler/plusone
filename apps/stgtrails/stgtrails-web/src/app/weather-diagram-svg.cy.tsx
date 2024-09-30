import type { WeatherDataResponseDto } from '@plusone/stgtrails-api-client'

import { WeatherDiagramSvg } from './weather-diagram-svg'

const weatherData: Array<WeatherDataResponseDto> = [
  {
    time: '2024-01-01T00:00:00.000Z',
    rain: 10,
    soilMoisture0To1cm: 0.5,
    soilMoisture1To3cm: 0,
    soilMoisture3To9cm: 0,
    soilMoisture9To27cm: 0,
    temperature2m: 0,
  },
  {
    time: '2024-01-02T00:00:00.000Z',
    rain: 5,
    soilMoisture0To1cm: 0.4,
    soilMoisture1To3cm: 0,
    soilMoisture3To9cm: 0,
    soilMoisture9To27cm: 0,
    temperature2m: 0,
  },
  {
    time: '2024-01-02T23:00:00.000Z',
    rain: 15,
    soilMoisture0To1cm: 0.3,
    soilMoisture1To3cm: 0,
    soilMoisture3To9cm: 0,
    soilMoisture9To27cm: 0,
    temperature2m: 0,
  },
]

describe('WeatherDiagramSvg', () => {
  it('should render a svg', () => {
    cy.mount(<WeatherDiagramSvg weather={weatherData} threshold={0.33} />)

    cy.get('svg').within(() => {
      cy.get('rect').should('have.length', 4)

      // frame
      cy.get('rect')
        .eq(0)
        .should('have.attr', 'x', 0)
        .and('have.attr', 'y', 0)
        .and('have.attr', 'width', 980)
        .and('have.attr', 'height', 600)

      // 10mm of rain should be a full height
      cy.get('rect').eq(1).should('have.attr', 'height', 600).and('have.attr', 'y', 0)
      // 5mm of rain should be a bar of half height
      cy.get('rect').eq(2).should('have.attr', 'height', 300).and('have.attr', 'y', 300)
      // 15mm of rain should be capped at full height of the diagram
      cy.get('rect').eq(3).should('have.attr', 'height', 600).and('have.attr', 'y', 0)

      cy.get('text').should('have.length', 5)
      cy.get('text').eq(0).should('have.text', 'Now')
      cy.get('text').eq(2).should('have.text', 'Monday')
      cy.get('text').eq(4).should('have.text', 'Tuesday')
    })
  })

  it('should render the provided threshold', () => {
    cy.mount(<WeatherDiagramSvg weather={weatherData} threshold={0.5} />)

    cy.get('svg').within(() => {
      cy.get('line').eq(0).should('have.attr', 'stroke', 'red').and('have.attr', 'y1', 300).and('have.attr', 'y2', 300)
    })
  })
})
