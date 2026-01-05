import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import type { GetElevationForCoordinatesParams } from '@plusone/stgtrails-api-client'
import { useValidatedElevationDataForCoordinates } from '@plusone/stgtrails-api-client'

function diameterToSize(diameter: number): string {
  if (diameter < 44) {
    return 'S'
  } else if (diameter < 49) {
    return 'M'
  } else if (diameter < 54) {
    return 'L'
  } else if (diameter < 60) {
    return 'XL'
  }
  return 'Out of range'
}

type EggCalculatorProps = {
  diameter: number
  height?: number
  startTemp: number
  endTemp: number
}

export function calculateCookingTime({ diameter, startTemp, endTemp, height = 0 }: EggCalculatorProps): string {
  // The boiling point of water is reduced by around 1˚C per 300 meters
  const waterBoilingTemp = 100 - height / 300

  // https://www.eierfans.de/eirechner-wie-lange-eier-kochen/
  const time = 0.0016 * diameter ** 2 * Math.log((2 * (waterBoilingTemp - startTemp)) / (waterBoilingTemp - endTemp))

  const minutes = Math.floor(time)
  const seconds = Math.floor((time - minutes) * 60)

  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

export function Egg() {
  const { t } = useTranslation()

  const [coords, setCoords] = useState<GetElevationForCoordinatesParams>({ latitude: -1, longitude: -1 })
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (success) => {
        const { latitude, longitude } = success.coords
        setCoords({ latitude, longitude })
      },
      (error) => {
        console.error(error)
      },
    )
  }, [])

  const { data: height } = useValidatedElevationDataForCoordinates(coords, {
    query: { enabled: coords.latitude !== -1 },
  })

  const [diameter, setDiameter] = useState(45)
  const [startTemp, setStartTemp] = useState(4)
  const [endTemp, setEndTemp] = useState(67)

  return (
    <div style={{ marginLeft: 10 }}>
      <h2>{t(['egg.title'])}</h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <label>
          {t(['egg.size'], { size: diameterToSize(diameter) })}
          <input
            type={'range'}
            min={40}
            max={55}
            step={5}
            value={diameter}
            // Workaround for cypress not triggering change event
            onInput={(event) => setDiameter(Number((event.target as HTMLInputElement).value))}
          />
        </label>

        <label>
          {t(['egg.refrigerator'])}
          <input
            type={'checkbox'}
            checked={startTemp === 4}
            onChange={(event) => setStartTemp(event.target.checked ? 4 : 20)}
          />
        </label>

        <label>
          {t(['egg.targetTemp'], { temp: endTemp })}
          <input
            type={'range'}
            min={62}
            max={82}
            value={endTemp}
            // Workaround for cypress not triggering change event
            onInput={(event) => setEndTemp(Number((event.target as HTMLInputElement).value))}
          />
        </label>

        <span>{t(['egg.duration'], { duration: calculateCookingTime({ diameter, height, endTemp, startTemp }) })}</span>
      </div>
    </div>
  )
}
