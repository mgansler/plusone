import { useCallback, useEffect, useState } from 'react'

const getItem = (key: string) => {
  try {
    return JSON.parse(localStorage.getItem(key))
  } catch {
    return undefined
  }
}
type UseLocalStorageProps<ItemType> = {
  key: string
  defaultValue?: ItemType
}
export const useLocalStorage = <ItemType>({
  key,
  defaultValue,
}: UseLocalStorageProps<ItemType>): [
  ItemType,
  (newValue: ItemType) => void,
  () => void,
] => {
  const [value, setValue] = useState<ItemType>()

  useEffect(() => {
    const initialValue = getItem(key)

    if (initialValue) {
      setValue(initialValue)
    } else {
      setValue(defaultValue)
    }
  }, [defaultValue, key])

  const setItem = useCallback(
    (newValue: ItemType): void => {
      setValue((prev) => {
        try {
          localStorage.setItem(key, JSON.stringify(newValue))
        } catch {
          console.error(`Could not write to local storage: ${key}`)
        }
        return newValue
      })
    },
    [key],
  )

  const removeItem = useCallback(() => {
    localStorage.removeItem(key)
    setValue(undefined)
  }, [key])

  return [value, setItem, removeItem]
}
