import { useCallback, useState } from 'react'

export const useBoolean = (initialState = false): [boolean, () => void, () => void] => {
  const [state, setState] = useState<boolean>(initialState)

  const setTrue = useCallback(() => setState(true), [])
  const setFalse = useCallback(() => setState(false), [])

  return [state, setTrue, setFalse]
}
