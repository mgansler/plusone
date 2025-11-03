import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useValidatedCountryList, useValidatedTrailAreas } from '@plusone/stgtrails-api-client'

import { indexRoute } from '../routes'

import { TrailArea } from './trail-area'
import { AnyCountryOrState, useTrailAreaFilter } from './use-trail-area-filter'
import { useTrailAreaId } from './use-trail-area-id'

export function App() {
  const { t } = useTranslation()
  const trailAreaFilter = useTrailAreaFilter()
  const navigate = useNavigate()

  const { data: trailAreas } = useValidatedTrailAreas({
    country: trailAreaFilter.country === AnyCountryOrState ? undefined : trailAreaFilter.country,
    state: trailAreaFilter.state === AnyCountryOrState ? undefined : trailAreaFilter.state,
  })

  const { data: countries } = useValidatedCountryList()
  const distinctCountries = [...new Set((countries ?? []).map((value) => value.country))]

  const trailAreaId = useTrailAreaId(trailAreas, trailAreaFilter.trailArea)
  const [hours, setHours] = useState<number>(96)

  if (!trailAreas) {
    return (
      <>
        <h1>Welcome stgtrails-web</h1>
        <div>Please wait until the data is loaded.</div>
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
                void navigate({ to: indexRoute.path })
              } else {
                void navigate({ to: '/country/$country', params: { country } })
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
                  void navigate({ to: '/country/$country', params: { country: trailAreaFilter.country } })
                } else {
                  void navigate({
                    to: '/country/$country/state/$state',
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
                to: `/country/$country/state/$state/trailArea/$trailArea`,
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
