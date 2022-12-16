import { useEffect } from 'react'

import { useBootInfo } from '@plusone/feeds/api-client'

const APP_VERSION_KEY = 'feeds_app_version'

function isUpdateAvailable(installed: string, available: string): boolean {
  const [installedMajor, installedMinor] = installed.split('.').map(Number)
  const [availableMajor, availableMinor] = available.split('.').map(Number)

  if (availableMajor > installedMajor || (availableMajor === installedMajor && availableMinor > installedMinor)) {
    return true
  }

  return false
}

export function AppVersion() {
  const { data: bootInfo } = useBootInfo({ query: { refetchOnWindowFocus: 'always' } })

  useEffect(() => {
    if (bootInfo?.status === 200 && typeof bootInfo?.data.appVersion === 'string') {
      let installedAppVersion = localStorage.getItem(APP_VERSION_KEY)

      if (installedAppVersion === null) {
        localStorage.setItem(APP_VERSION_KEY, bootInfo.data.appVersion)
        installedAppVersion = bootInfo.data.appVersion
      }

      if (isUpdateAvailable(installedAppVersion, bootInfo.data.appVersion)) {
        if (window.confirm('There is an update available, reload to update?')) {
          localStorage.setItem(APP_VERSION_KEY, bootInfo.data.appVersion)
          window.location.reload()
        }
      }
    }
  }, [bootInfo?.data.appVersion, bootInfo?.status])

  return null
}
