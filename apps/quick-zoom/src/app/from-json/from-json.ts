import { fromUrl, ZoomLinkProps } from '../zoom-link/zoom-link'

export const fromJson = (json: string): ZoomLinkProps[] => {
  const items = JSON.parse(json)

  if (!Array.isArray(items)) {
    return []
  }

  return items.map(
    ({
      name,
      url: link,
      confno,
      pwd,
    }: Omit<ZoomLinkProps, 'url'> & { url: string }) => {
      const url = new URL(link)

      if (confno !== undefined) {
        return { name, url, confno, pwd }
      }

      const [confnoFromUrl, pwdFromUrl] = fromUrl(url)
      return { name, url, confno: confnoFromUrl, pwd: pwdFromUrl }
    },
  )
}
