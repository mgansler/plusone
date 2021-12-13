import { createTheme, StyledEngineProvider, ThemeProvider, useMediaQuery } from '@mui/material'
import React, { ReactNode, useMemo } from 'react'

export interface DarkModeThemeProviderProps {
  children: ReactNode
}

export function DarkModeThemeProvider({ children }: DarkModeThemeProviderProps) {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)')
  const theme = useMemo(() => createTheme({ palette: { mode: prefersDarkMode ? 'dark' : 'light' } }), [prefersDarkMode])

  return (
    <StyledEngineProvider injectFirst={true}>
      <ThemeProvider theme={theme} children={children} />
    </StyledEngineProvider>
  )
}
