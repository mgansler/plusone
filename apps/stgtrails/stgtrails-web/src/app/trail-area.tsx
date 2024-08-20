import type { ChartData, ChartType } from 'chart.js'
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js'
import type { Plugin } from 'chart.js/dist/types'
import { Chart } from 'react-chartjs-2'

import { useValidatedTrailsForTrailArea, useValidatedWeatherDataForTrailArea } from '@plusone/stgtrails-api-client'

const items = [CategoryScale, LinearScale, Title, Legend, Tooltip, PointElement, LineElement, BarElement]
ChartJS.register(items)

type TrailAreaProps = {
  trailAreaId: number
}

const nowPlugin: Plugin = {
  id: 'now',
  beforeDraw(chart: ChartJS<ChartType>) {
    const ctx = chart.ctx

    const now = new Date()
    const xValue = chart.scales.x.getPixelForValue(now.getUTCHours() + 24 + now.getMinutes() / 60)
    ctx.save()
    ctx.strokeStyle = 'blue'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(xValue, 30)
    ctx.lineTo(xValue, chart.height - 105)
    ctx.stroke()
    ctx.restore()
  },
}

export function TrailArea({ trailAreaId }: TrailAreaProps) {
  const { data: trails } = useValidatedTrailsForTrailArea(trailAreaId)
  const { data: weather } = useValidatedWeatherDataForTrailArea(trailAreaId)

  if (!weather) {
    return null
  }

  const chartData: ChartData = {
    labels: weather.map((v) => {
      const ts = new Date(v.time)
      return ts.getHours() > 0 && ts.getHours() < 3 ? ts.toLocaleString() : ts.toLocaleTimeString()
    }),
    datasets: [
      {
        label: 'Soil Moisture 0 to 1cm',
        type: 'line',
        data: weather.map((v) => v.soilMoisture0To1cm),
        backgroundColor: 'blue',
        pointRadius: 1.5,
      },
      {
        label: 'Moisture Threshold (0.3)',
        type: 'line',
        data: weather.map(() => 0.3),
        backgroundColor: 'red',
        borderColor: 'red',
        pointRadius: 0,
        borderWidth: 2,
      },
      { label: 'Rain (mm)', type: 'bar', data: weather.map((v) => v.rain), backgroundColor: 'lightblue' },
    ],
  }

  return (
    <div>
      <ul>{trails?.map((trail) => <li key={trail.id}>{trail.name}</li>)}</ul>
      <div style={{ maxHeight: 600 }}>
        <Chart
          type={'bar'}
          data={chartData}
          plugins={[nowPlugin]}
          options={{
            responsive: true,
          }}
        />
      </div>
    </div>
  )
}
