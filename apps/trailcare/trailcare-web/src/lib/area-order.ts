import { useCallback, useState } from 'react'

import type { TrailAreaDto } from '@plusone/trailcare-api-client'

function readIds(key: string): Array<number> {
  try {
    const ids: unknown = JSON.parse(localStorage.getItem(key) ?? '[]')
    return Array.isArray(ids) ? ids.filter((id): id is number => typeof id === 'number') : []
  } catch {
    return []
  }
}

function storeIds(key: string, ids: Array<number>) {
  try {
    if (ids.length === 0) {
      localStorage.removeItem(key)
    } else {
      localStorage.setItem(key, JSON.stringify(ids))
    }
  } catch {
    // localStorage unavailable, the order is just not remembered
  }
}

/** Areas in the stored order, areas that are not in it (e.g. new ones) follow in their original order */
export function applyAreaOrder<T extends Pick<TrailAreaDto, 'id'>>(areas: Array<T>, order: Array<number>): Array<T> {
  const position = new Map(order.map((id, index) => [id, index]))
  const rank = (area: T) => position.get(area.id) ?? Number.MAX_SAFE_INTEGER
  // Array.prototype.sort is stable, so areas without a stored position keep their original order at the end
  return [...areas].sort((a, b) => rank(a) - rank(b))
}

/** The order after moving one area a step up or down, `undefined` at the ends of the list */
export function moveArea<T extends Pick<TrailAreaDto, 'id'>>(
  areas: Array<T>,
  order: Array<number>,
  areaId: number,
  direction: 'up' | 'down',
): Array<number> | undefined {
  const ids = applyAreaOrder(areas, order).map((area) => area.id)
  const from = ids.indexOf(areaId)
  const to = direction === 'up' ? from - 1 : from + 1
  if (from === -1 || to < 0 || to >= ids.length) {
    return undefined
  }
  ;[ids[from], ids[to]] = [ids[to], ids[from]]
  return ids
}

/** The order of the trail areas, remembered per device under the given key. Without an order they stay alphabetical. */
export function useAreaOrder(storageKey: string) {
  const [order, setOrder] = useState(() => readIds(storageKey))

  const update = useCallback(
    (next: Array<number>) => {
      storeIds(storageKey, next)
      setOrder(next)
    },
    [storageKey],
  )

  const sort = useCallback(
    <T extends Pick<TrailAreaDto, 'id'>>(areas: Array<T>) => applyAreaOrder(areas, order),
    [order],
  )

  const move = useCallback(
    (areas: Array<Pick<TrailAreaDto, 'id'>>, areaId: number, direction: 'up' | 'down') => {
      const next = moveArea(areas, order, areaId, direction)
      if (next) {
        update(next)
      }
    },
    [order, update],
  )

  const reset = useCallback(() => update([]), [update])

  return { sort, move, reset, isCustom: order.length > 0 }
}
