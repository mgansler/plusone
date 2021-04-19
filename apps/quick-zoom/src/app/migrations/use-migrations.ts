import { useEffect } from 'react'

import { ConferenceLink, fromLink } from '@plusone/conference-links'

type V1 = {
  name: string
  url: URL
  confno?: string
  pwd?: string
}

function migrateFromV1(old: V1): ConferenceLink {
  return fromLink(old.url.toString(), old.name)
}

function migrateStoredLinks(current: unknown[]) {
  return current.map((oldLink) => {
    if (Object.prototype.hasOwnProperty.call(oldLink, 'name')) {
      return migrateFromV1(oldLink as V1)
    }
    return oldLink
  })
}

export function useMigrations() {
  useEffect(() => {
    const oldLinks = (JSON.parse(localStorage.getItem('zoomLinks')) as unknown[]) ?? []
    const newLinks = migrateStoredLinks(oldLinks)
    localStorage.setItem('zoomLinks', JSON.stringify(newLinks))
  }, [])
}
