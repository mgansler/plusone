import { useCallback, useState } from 'react'

const getItem = (key: string) => {
  const jsonString = localStorage.getItem(key)
  try {
    return JSON.parse(jsonString)
  } catch (e) {
    console.error(`Could not parse JSON '${jsonString}' ${e}`)
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
}: UseLocalStorageProps<ItemType>): [ItemType, (newValue: ItemType) => void, () => void] => {
  const [value, setValue] = useState<ItemType>(() => getItem(key) ?? defaultValue)

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
