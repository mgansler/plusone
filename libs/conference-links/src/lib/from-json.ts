import type { ConferenceLink } from './types'

function isZoomAppLink(link: string): boolean {
  const url = new URL(link)

  return url.protocol === 'zoommtg:' && url.searchParams.has('confno')
}

export function fromJson(json: unknown): ConferenceLink[] {
  if (!json || !Array.isArray(json)) {
    return []
  }

  return json.filter((value) => {
    // Check if properties from ConferenceLink are present
    if (
      !Object.prototype.hasOwnProperty.call(value, 'title') ||
      !Object.prototype.hasOwnProperty.call(value, 'type') ||
      !Object.prototype.hasOwnProperty.call(value, 'url')
    ) {
      return false
    }

    if (typeof value.title !== 'string') {
      return false
    }

    // Check if type has a valid value
    if (value.type !== 'msteams' && value.type !== 'zoom') {
      return false
    }

    return value.type === 'zoom' && isZoomAppLink(value.url)
  })
}
