import { useParams } from '@remix-run/react'

import { ColorPicker } from '../components/color-picker'

export function DeviceDetails() {
  const { deviceId } = useParams()
  console.log({ deviceId })

  return (
    <div>
      <h2>Device Details</h2>
      <ColorPicker />
    </div>
  )
}
