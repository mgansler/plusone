import { useEffect } from 'react'

import { useValidatedBootInfo } from '@plusone/feeds/api-client'

const APP_VERSION_KEY = 'feeds_app_version'

function isUpdateAvailable(installed: string, available: string): boolean {
  const [installedMajor, installedMinor] = installed.split('.').map(Number)
  const [availableMajor, availableMinor] = available.split('.').map(Number)

  const newMajor = availableMajor > installedMajor
  const newMinor = availableMajor === installedMajor && availableMinor > installedMinor
  return newMajor || newMinor
}

export function AppVersion() {
  const { data: bootInfo } = useValidatedBootInfo({ query: { refetchOnWindowFocus: 'always' } })

  useEffect(() => {
    if (typeof bootInfo?.appVersion === 'string') {
      let installedAppVersion = localStorage.getItem(APP_VERSION_KEY)

      if (installedAppVersion === null) {
        localStorage.setItem(APP_VERSION_KEY, bootInfo.appVersion)
        installedAppVersion = bootInfo.appVersion
      }

      if (isUpdateAvailable(installedAppVersion, bootInfo.appVersion)) {
        if (window.confirm('There is an update available, reload to update?')) {
          localStorage.setItem(APP_VERSION_KEY, bootInfo.appVersion)
          window.location.reload()
        }
      }
    }
  }, [bootInfo?.appVersion])

  return null
}
