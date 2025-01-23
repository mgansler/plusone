import type { SunriseSunsetResponseDto, WeatherDataResponseDto } from '@plusone/stgtrails-api-client'

import { WeatherDiagramSvg } from './weather-diagram-svg'

const weatherData: Array<WeatherDataResponseDto> = [
  {
    time: '2024-01-01T00:00:00.000Z',
    rain: 1,
    soilMoisture0To1cm: 0.5,
    soilMoisture1To3cm: 0,
    soilMoisture3To9cm: 0,
    soilMoisture9To27cm: 0,
    soilTemperature0cm: -1.0,
    soilTemperature6cm: 0,
    temperature2m: 0,
  },
  {
    time: '2024-01-02T00:00:00.000Z',
    rain: 5,
    soilMoisture0To1cm: 0.4,
    soilMoisture1To3cm: 0,
    soilMoisture3To9cm: 0,
    soilMoisture9To27cm: 0,
    soilTemperature0cm: -0.9,
    soilTemperature6cm: 0,
    temperature2m: 0,
  },
  {
    time: '2024-01-02T23:00:00.000Z',
    rain: 15,
    soilMoisture0To1cm: 0.3,
    soilMoisture1To3cm: 0,
    soilMoisture3To9cm: 0,
    soilMoisture9To27cm: 0,
    soilTemperature0cm: -0.8,
    soilTemperature6cm: 0,
    temperature2m: 0,
  },
]

const sunriseSunsetData: Array<SunriseSunsetResponseDto> = [
  {
    date: '2024-01-01',
    sunrise: '2024-01-01T06:00:00.000Z',
    sunset: '2024-01-01T18:00:00.000Z',
  },
  {
    date: '2024-01-02',
    sunrise: '2024-01-01T05:50:00.000Z',
    sunset: '2024-01-01T18:10:00.000Z',
  },
]

describe('WeatherDiagramSvg', () => {
  it('should render a svg', () => {
    cy.mount(<WeatherDiagramSvg weather={weatherData} sunriseSunset={sunriseSunsetData} threshold={0.33} />)

    cy.get('svg').within(() => {
      cy.get('rect').should('have.length', 6)

      // frame
      cy.get('rect')
        .eq(0)
        .should('have.attr', 'x', 0)
        .and('have.attr', 'y', 0)
        .and('have.attr', 'width', 980)
        .and('have.attr', 'height', 600)

      // 1mm of rain should be around 1/3
      cy.get('rect')
        .eq(1)
        .should(($rect) => {
          expect(Number($rect.attr('height'))).greaterThan(198)
          expect(Number($rect.attr('height'))).lessThan(199)
        })
      // 5mm of rain should be around 5/6
      cy.get('rect')
        .eq(2)
        .should(($rect) => {
          expect(Number($rect.attr('height'))).greaterThan(513)
          expect(Number($rect.attr('height'))).lessThan(514)
        })
      // 15mm of rain should be capped at full height of the diagram
      cy.get('rect').eq(3).should('have.attr', 'height', 600).and('have.attr', 'y', 0)

      cy.get('text').should('have.length', 9)
      cy.get('text').eq(0).should('have.text', 'Now')
      // Depending on the locale of the browser used in testing we get 18:00:00 or 6:00:00 PM
      cy.get('text').eq(2).should('include.text', 'Monday, Sunset at').and('include.text', ':00:00')
      cy.get('text').eq(4).should('include.text', 'Tuesday, Sunset at').and('include.text', ':10:00')
    })
  })

  it('should render the provided threshold', () => {
    cy.mount(<WeatherDiagramSvg weather={weatherData} sunriseSunset={sunriseSunsetData} threshold={0.5} />)

    cy.get('svg').within(() => {
      cy.get('line')
        .eq(0)
        .should('have.attr', 'stroke', 'orange')
        .and('have.attr', 'y1', 200)
        .and('have.attr', 'y2', 200)
      cy.get('line').eq(1).should('have.attr', 'stroke', 'red').and('have.attr', 'y1', 300).and('have.attr', 'y2', 300)
    })
  })
})
