import { useSyncExternalStore } from 'react'

/** Routes selected for the comparison view; the first one is the reference for the differences */
export type CompareItem = { id: string; name: string }

const STORAGE_KEY = 'gpx-toolbox-compare'

const listeners = new Set<() => void>()
let items: Array<CompareItem> = read()

function read(): Array<CompareItem> {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
    return Array.isArray(parsed)
      ? parsed.filter((i): i is CompareItem => typeof i?.id === 'string' && typeof i?.name === 'string')
      : []
  } catch {
    return []
  }
}

function write(next: Array<CompareItem>) {
  items = next
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    // Storage unavailable (private mode, quota): the list still works until the next reload
  }
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  // Keep several open tabs in sync
  const onStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY) return
    items = read()
    listener()
  }
  window.addEventListener('storage', onStorage)
  return () => {
    listeners.delete(listener)
    window.removeEventListener('storage', onStorage)
  }
}

export const compareList = {
  add(item: CompareItem) {
    if (items.some((i) => i.id === item.id)) return
    write([...items, item])
  },
  remove(id: string) {
    write(items.filter((i) => i.id !== id))
  },
  /** Make a route the reference (first entry) of the comparison */
  makeReference(id: string) {
    const item = items.find((i) => i.id === id)
    if (item) write([item, ...items.filter((i) => i.id !== id)])
  },
  clear() {
    write([])
  },
}

/** The comparison list, persisted in localStorage and shared by all components */
export function useCompareList() {
  const current = useSyncExternalStore(subscribe, () => items)
  return {
    items: current,
    has: (id: string) => current.some((i) => i.id === id),
    ...compareList,
  }
}
