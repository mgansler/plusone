import type { ChartData, ChartOptions, ChartType } from 'chart.js'
import {
  BarController,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js'
import type { Plugin } from 'chart.js/dist/types'
import { Chart } from 'react-chartjs-2'

import type { WeatherDataResponseDto } from '@plusone/stgtrails-api-client'

const nowPlugin: Plugin<ChartType, { hours: number }> = {
  id: 'nowPlugin',
  afterDraw(chart: ChartJS<ChartType>, _, options) {
    const ctx = chart.ctx

    const now = new Date()
    const xValue = chart.scales.x.getPixelForValue(now.getUTCHours() + options.hours - 72 + now.getMinutes() / 60)
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

ChartJS.register(
  BarController,
  BarElement,
  CategoryScale,
  Legend,
  LineController,
  LineElement,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  nowPlugin,
)

type WeatherDiagramLegacyProps = {
  weather: Array<WeatherDataResponseDto>
  hours: number
}

export function WeatherDiagramLegacy({ hours, weather }: WeatherDiagramLegacyProps) {
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

  const options: ChartOptions & { plugins: { nowPlugin: { hours: number } } } = {
    responsive: true,
    plugins: { nowPlugin: { hours } },
  }

  return (
    <div style={{ maxHeight: 800 }}>
      <Chart type={'bar'} data={chartData} plugins={[nowPlugin]} options={options} />
    </div>
  )
}
