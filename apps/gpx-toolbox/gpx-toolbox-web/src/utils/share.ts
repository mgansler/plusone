import i18n from 'i18next'

/** Share a GPX file using the Web Share API (mobile only). Falls back to clipboard copy on HTTP/unsupported browsers. */
export async function shareGpx(routeId: string, routeName: string): Promise<void> {
  const token = localStorage.getItem('gpx-toolbox-jwt')
  if (!token) return

  const response = await fetch(`/api/routes/${routeId}/export`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!response.ok) {
    console.error('[shareGpx] Export failed:', response.status)
    return
  }

  const gpxText = await response.text()
  const fileName = `${routeName
    .replace(/[^a-z0-9äöüß -]/gi, '')
    .replace(/\s+/g, ' ')
    .trim()}.gpx`
  const file = new File([gpxText], fileName, {
    type: 'application/xml',
  })

  if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
    await navigator.share({ files: [file] })
  } else {
    // Fallback: copy GPX text to clipboard (works over HTTP on iOS Safari)
    try {
      await navigator.clipboard.writeText(gpxText)
      alert(i18n.t('share.copied', { name: routeName }))
    } catch {
      // If clipboard API is also unavailable, offer download as last resort
      const blob = new Blob([gpxText], { type: 'application/gpx+xml' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      a.click()
      URL.revokeObjectURL(url)
    }
  }
}
