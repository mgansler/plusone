import { useCallback, useState } from 'react'

function readIds(key: string): Set<number> {
  try {
    const ids: unknown = JSON.parse(localStorage.getItem(key) ?? '[]')
    return new Set(Array.isArray(ids) ? ids.filter((id): id is number => typeof id === 'number') : [])
  } catch {
    return new Set()
  }
}

function storeIds(key: string, ids: Set<number>) {
  try {
    localStorage.setItem(key, JSON.stringify([...ids]))
  } catch {
    // localStorage unavailable, collapsed areas are just not remembered
  }
}

/** Which trail areas are collapsed, remembered per device under the given key */
export function useCollapsedAreas(storageKey: string) {
  const [collapsed, setCollapsed] = useState(() => readIds(storageKey))

  const toggle = useCallback(
    (areaId: number) => {
      setCollapsed((current) => {
        const next = new Set(current)
        if (!next.delete(areaId)) {
          next.add(areaId)
        }
        storeIds(storageKey, next)
        return next
      })
    },
    [storageKey],
  )

  const isCollapsed = useCallback((areaId: number) => collapsed.has(areaId), [collapsed])

  return { isCollapsed, toggle }
}
