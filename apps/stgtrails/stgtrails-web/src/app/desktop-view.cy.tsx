import type { ReactNode } from 'react'

import type { SunriseSunsetResponseDto, WeatherDataResponseDto } from '@plusone/stgtrails-api-client'

import { DesktopView } from './desktop-view'

describe('DesktopView', () => {
  it('should render a svg', () => {
    generateSunriseSunsetData()
    cy.mount(
      (
        <DesktopView weather={generateWeatherData(-3)} sunriseSunset={generateSunriseSunsetData()} threshold={0.33} />
      ) as ReactNode,
    )

    cy.get('svg').within(() => {
      cy.get('rect[id=outer-frame]')
        .should('have.attr', 'x', 0)
        .and('have.attr', 'y', 0)
        .and('have.attr', 'width', 980)
        .and('have.attr', 'height', 600)

      cy.get('polyline[id=temperature]').should('be.visible')
      cy.get('polyline[id=moisture]').should('be.visible')

      // Depending on the locale of the browser used in testing, we get 18:00:00 or 6:00:00 PM
      cy.findAllByText(/Sunset at.+/i)
        .eq(0)
        .should('include.text', ':00:00')
      cy.findAllByText(/Sunset at.+/i)
        .eq(1)
        .should('include.text', ':10:00')
    })
  })

  it('should render the provided threshold for cold weather', () => {
    cy.mount(
      (
        <DesktopView weather={generateWeatherData(0)} sunriseSunset={generateSunriseSunsetData()} threshold={0.5} />
      ) as ReactNode,
    )

    cy.get('svg').within(() => {
      cy.get('line[id=temperature-threshold]')
        .should('have.attr', 'stroke', 'orange')
        .and('have.attr', 'y1', 200)
        .and('have.attr', 'y2', 200)

      cy.get('line[id=moisture-threshold]')
        .should('have.attr', 'stroke', 'red')
        .and('have.attr', 'y1', 315)
        .and('have.attr', 'y2', 315)
    })
  })

  it('should render the provided threshold for warm weather', () => {
    cy.mount(
      (
        <DesktopView weather={generateWeatherData()} sunriseSunset={generateSunriseSunsetData()} threshold={0.5} />
      ) as ReactNode,
    )

    cy.get('line[id=moisture-threshold]')
      .should('have.attr', 'stroke', 'red')
      .and('have.attr', 'y1', 300)
      .and('have.attr', 'y2', 300)
  })
})

function generateWeatherData(minTemp = 6): Array<WeatherDataResponseDto> {
  const yesterday = new Date()
  yesterday.setHours(0, 0, 0, 0)
  yesterday.setDate(new Date().getDate() - 1)

  const weatherData: Array<WeatherDataResponseDto> = []
  for (let i = 0; i < 48; i++) {
    const timeSlot = new Date(yesterday.getTime())
    timeSlot.setHours(yesterday.getHours() + i)

    weatherData.push({
      time: timeSlot.toISOString(),
      rain: Math.max(0, Math.random() * 2 - 1),
      soilMoisture0To1cm: Math.min(0.35, Math.max(0.25, Math.random() / 10 + 0.25)),
      soilMoisture1To3cm: 0,
      soilMoisture3To9cm: 0,
      soilMoisture9To27cm: 0,
      soilTemperature0cm: Math.max(minTemp, Math.random() * 20 - 10),
      soilTemperature6cm: 0,
      temperature2m: 0,
      windGusts10m: 30,
    })
  }

  return weatherData
}

function generateSunriseSunsetData(): Array<SunriseSunsetResponseDto> {
  const todayDate = new Date().toISOString().split('T')[0]
  const yesterday = new Date()
  yesterday.setDate(new Date().getDate() - 1)
  const yesterdayDate = yesterday.toISOString().split('T')[0]

  return [
    {
      date: yesterdayDate,
      sunrise: `${yesterdayDate}T06:00:00.000Z`,
      sunset: `${yesterdayDate}T18:00:00.000Z`,
    },
    {
      date: todayDate,
      sunrise: `${todayDate}T05:50:00.000Z`,
      sunset: `${todayDate}T18:10:00.000Z`,
    },
  ]
}
