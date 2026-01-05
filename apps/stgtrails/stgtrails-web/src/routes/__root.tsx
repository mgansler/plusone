import * as React from 'react'
import { useState } from 'react'
import { createRootRoute, useMatchRoute, useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

import { useValidatedCountryList, useValidatedTrailAreas } from '@plusone/stgtrails-api-client'

import { TrailArea } from '../app/trail-area'
import { AnyCountryOrState, useTrailAreaFilter } from '../app/use-trail-area-filter'
import { useTrailAreaId } from '../app/use-trail-area-id'
import { Egg } from '../app/egg'

export const COUNTRY_PATH = '/country/$country'
export const STATE_PATH = COUNTRY_PATH + '/state/$state'
export const TRAIL_AREA_PATH = STATE_PATH + '/trailArea/$trailArea'

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  const { t } = useTranslation()
  const trailAreaFilter = useTrailAreaFilter()
  const navigate = useNavigate()

  const matchRoute = useMatchRoute()

  const { data: trailAreas } = useValidatedTrailAreas({
    country: trailAreaFilter.country === AnyCountryOrState ? undefined : trailAreaFilter.country,
    state: trailAreaFilter.state === AnyCountryOrState ? undefined : trailAreaFilter.state,
  })

  const { data: countries } = useValidatedCountryList()
  const distinctCountries = [...new Set((countries ?? []).map((value) => value.country))]

  const trailAreaId = useTrailAreaId(trailAreas, trailAreaFilter.trailArea)
  const [hours, setHours] = useState<number>(96)

  if (matchRoute({ to: '/egg' })) {
    return <Egg />
  }

  if (!trailAreas) {
    return (
      <>
        <h1>{t(['app.title'])}</h1>
        <div>{t(['app.loading'])}</div>
      </>
    )
  }

  return (
    <div className="app">
      <div className={'header-controls'}>
        <label>
          <span>{t(['filter.country.label'])}</span>
          <select
            name={'country'}
            value={trailAreaFilter.country}
            onChange={(event) => {
              const country = event.currentTarget.value
              if (country === AnyCountryOrState) {
                void navigate({ to: '/' })
              } else {
                void navigate({ to: COUNTRY_PATH, params: { country } })
              }
            }}
          >
            <option value="any">{t(['filter.all'])}</option>
            {distinctCountries.map((country) => (
              <option key={country} value={country}>
                {t([`filter.country.${country}`])}
              </option>
            ))}
          </select>
        </label>
        {trailAreaFilter.country === AnyCountryOrState ? null : (
          <label>
            <span>{t(['filter.state.label'])}</span>
            <select
              name={'state'}
              value={trailAreaFilter.state}
              onChange={(event) => {
                const state = event.currentTarget.value
                if (state === AnyCountryOrState) {
                  void navigate({ to: COUNTRY_PATH, params: { country: trailAreaFilter.country } })
                } else {
                  void navigate({
                    to: STATE_PATH,
                    params: { country: trailAreaFilter.country, state },
                  })
                }
              }}
            >
              <option value="any">{t(['filter.all'])}</option>
              {countries
                ?.filter(({ country }) => country === trailAreaFilter.country)
                .map((value) => (
                  <option key={value.state} value={value.state}>
                    {t([`filter.state.${trailAreaFilter.country}.${value.state}`])}
                  </option>
                ))}
            </select>
          </label>
        )}
        <label>
          <span>{t(['filter.trailArea'])}</span>
          <select
            name={'trail-area'}
            onChange={(event) => {
              void navigate({
                to: TRAIL_AREA_PATH,
                params: {
                  country: trailAreaFilter.country,
                  state: trailAreaFilter.state,
                  trailArea: event.currentTarget.value,
                },
              })
            }}
            value={trailAreaId}
          >
            {trailAreas.map((trailArea) => (
              <option key={trailArea.id} value={trailArea.id}>
                {trailArea.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>{t(['filter.pastDays.label'])}</span>
          <select name={'past-days'} onChange={(event) => setHours(Number(event.currentTarget.value))}>
            {[1, 2, 3, 4, 5, 6, 7].map((days) => (
              <option key={days} value={days * 24 + 72}>
                {t(['filter.pastDays.value'], { count: days })}
              </option>
            ))}
          </select>
        </label>
      </div>

      {typeof trailAreaId === 'number' ? (
        <TrailArea
          trailAreaId={trailAreaId}
          threshold={trailAreas.find((trailArea) => trailArea.id === trailAreaId)?.threshold}
          hours={hours}
        />
      ) : null}
    </div>
  )
}
