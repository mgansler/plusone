import type { ChartData } from 'chart.js'
import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js'
import { Line } from 'react-chartjs-2'

import { useValidatedTrailsForTrailArea, useValidatedWeatherDataForTrailArea } from '@plusone/stgtrails-api-client'

const items = [CategoryScale, LinearScale, Title, Legend, Tooltip, PointElement, LineElement]
ChartJS.register(items)

type TrailAreaProps = {
  trailAreaId: number
}

export function TrailArea({ trailAreaId }: TrailAreaProps) {
  const { data: trails } = useValidatedTrailsForTrailArea(trailAreaId)
  const { data: weather } = useValidatedWeatherDataForTrailArea(trailAreaId)

  if (!weather) {
    return null
  }

  const chartData: ChartData<'line'> = {
    labels: weather.map((v) => {
      const ts = new Date(v.time)
      return ts.toLocaleString()
    }),
    datasets: [
      { label: 'rain', data: weather.map((v) => v.rain), backgroundColor: 'blue' },
      { label: 'soilMoisture0To1cm', data: weather.map((v) => v.soilMoisture0To1cm), backgroundColor: 'red' },
      {
        label: 'moistureThreshold',
        data: weather.map(() => 0.3),
        backgroundColor: 'purple',
        borderColor: 'purple',
        pointRadius: 0,
      },
    ],
  }

  return (
    <div>
      <ul>{trails?.map((trail) => <li key={trail.id}>{trail.name}</li>)}</ul>
      <div style={{ maxHeight: 600 }}>
        <Line data={chartData} options={{ responsive: true }} />
      </div>
    </div>
  )
}
