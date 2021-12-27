import type { ConferenceLink } from './types'

function zoomLinkFromUrl(url: URL, title: string): ConferenceLink {
  const [confNo] = new RegExp(/\d+/).exec(url.pathname) ?? []
  if (!confNo) {
    return null
  }

  const password = url.searchParams.get('pwd')

  const appUrl = new URL(`zoommtg://${url.hostname}/join`)
  appUrl.searchParams.set('action', 'join')
  appUrl.searchParams.set('confno', confNo)
  if (password) {
    appUrl.searchParams.set('pwd', password)
  }

  return {
    title,
    type: 'zoom',
    url: appUrl.toString(),
  }
}

// function teamsLinkFromUrl(url: URL, title: string): ConferenceLink {}

export function fromLink(link: string, title: string): ConferenceLink {
  const url = new URL(link)
  if (url.hostname.includes('zoom')) {
    return zoomLinkFromUrl(url, title)
  }
}
