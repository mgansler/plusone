import { useEffect, useRef } from 'react'

export function useDebounce(callback: () => void, timeout = 250) {
  const debounce = useRef<number>()
  useEffect(() => {
    if (debounce.current) {
      window.clearTimeout(debounce.current)
    }
    debounce.current = window.setTimeout(callback, timeout)
    return () => {
      window.clearTimeout(debounce.current)
    }
  }, [callback, timeout])
}
