import { useEffect, useState } from 'react'

export const useIsDesktop = (): boolean => {
  const [isDesktop, setIsDesktop] = useState(true)

  useEffect(() => {
    // Funktion zur Erkennung des User-Agents
    const checkUserAgent = () => {
      const userAgent = navigator.userAgent.toLowerCase()

      // Überprüfe, ob es sich um einen mobilen Browser handelt
      const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)

      // Überprüfe die Viewport-Breite
      const viewportWidth = window.innerWidth

      // Wenn es kein mobiles Gerät ist oder die Viewport-Breite groß ist,
      // oder wenn der User-Agent einen Desktop-Browser angibt
      setIsDesktop(!isMobile || viewportWidth > 768 || userAgent.includes('desktop'))
    }

    // Führe die Überprüfung beim ersten Laden durch
    checkUserAgent()

    // Füge einen Event-Listener für Größenänderungen hinzu
    window.addEventListener('resize', checkUserAgent)

    // Bereinige den Event-Listener
    return () => window.removeEventListener('resize', checkUserAgent)
  }, [])

  return isDesktop
}
