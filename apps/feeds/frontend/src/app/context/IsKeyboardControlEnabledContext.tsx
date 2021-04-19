import { createContext, useContext, useEffect } from 'react'

import { useBoolean } from '@plusone/hooks'

interface ContextValue {
  isEnabled: boolean
  enable: () => void
  disable: () => void
}

const defaultValue: ContextValue = {
  isEnabled: true,
  enable: () => undefined,
  disable: () => undefined,
}

const Context = createContext<ContextValue>(defaultValue)

export const KeyboardControlProvider: React.FC = ({ children }) => {
  const [isEnabled, enable, disable] = useBoolean(true)

  return <Context.Provider value={{ isEnabled, enable, disable }}>{children}</Context.Provider>
}

export const useIsKeyboardControlEnabled = () => {
  return useContext(Context).isEnabled
}

export const useDisableKeyboardControl = () => {
  const { enable, disable } = useContext(Context)
  useEffect(() => {
    disable()
    return () => {
      enable()
    }
  }, [enable, disable])
}
