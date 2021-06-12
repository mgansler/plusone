import { createMuiTheme, ThemeProvider, useMediaQuery } from '@material-ui/core'
import React, { ReactNode, useMemo } from 'react'

export interface DarkModeThemeProviderProps {
  children: ReactNode
}

export function DarkModeThemeProvider({ children }: DarkModeThemeProviderProps) {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)')
  const theme = useMemo(
    () => createMuiTheme({ palette: { type: prefersDarkMode ? 'dark' : 'light' } }),
    [prefersDarkMode],
  )

  return <ThemeProvider theme={theme} children={children} />
}
