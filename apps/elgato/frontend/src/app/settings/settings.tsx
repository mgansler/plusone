import { Link } from '@tanstack/react-router'

import { settingsRoute } from '../../routes'

import { DevicesSettings } from './device-settings'
import { LocationSettings } from './location-settings'

export function Settings() {
  return (
    <div>
      <h2>Settings</h2>
      <Link from={settingsRoute.fullPath} to={'..'}>
        Back
      </Link>

      <LocationSettings />

      <DevicesSettings />
    </div>
  )
}
