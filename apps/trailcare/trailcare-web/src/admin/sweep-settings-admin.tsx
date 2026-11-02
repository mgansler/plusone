import type { FormEvent } from 'react'
import { useEffect, useState } from 'react'

import type { SweepSettingsDto } from '@plusone/trailcare-api-client'
import { useGetSweepSettings, useGetTrailAreas, useUpdateSweepSettings } from '@plusone/trailcare-api-client'

import { SweepThresholdFields } from './sweep-threshold-fields'
import { useAdminMutationOptions } from './use-admin-mutation'

/** Traffic light thresholds that apply to all trails without their own */
export function SweepSettingsAdmin() {
  const { data: settings } = useGetSweepSettings()
  return settings ? <SweepSettingsForm settings={settings} /> : null
}

function SweepSettingsForm({ settings }: { settings: SweepSettingsDto }) {
  const { data: areas } = useGetTrailAreas()
  const [green, setGreen] = useState(String(settings.sweepGreenMaxDays))
  const [yellow, setYellow] = useState(String(settings.sweepYellowMaxDays))
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!saved) return
    const timeout = window.setTimeout(() => setSaved(false), 2_000)
    return () => window.clearTimeout(timeout)
  }, [saved])

  const update = useUpdateSweepSettings(useAdminMutationOptions(() => setSaved(true)))

  const customTrails = areas?.flatMap((area) => area.trails).filter((trail) => trail.hasCustomSweepThresholds).length

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    update.mutate({ data: { sweepGreenMaxDays: Number(green), sweepYellowMaxDays: Number(yellow) } })
  }

  return (
    <form className="care-form" onSubmit={onSubmit}>
      <SweepThresholdFields green={green} yellow={yellow} onGreenChange={setGreen} onYellowChange={setYellow} />
      <p className="hint">
        Danach ist ein Trail rot. Tag 0 ist der Tag, an dem gefegt wurde. Gilt für alle Trails, die keine eigenen Werte
        haben
        {customTrails ? ` (${customTrails === 1 ? 'ein Trail hat' : `${customTrails} Trails haben`} eigene Werte)` : ''}
        .
      </p>
      <div className="button-row">
        <button className="button button-primary" type="submit" disabled={update.isPending}>
          {saved ? 'Gespeichert' : 'Ampel speichern'}
        </button>
      </div>
    </form>
  )
}
