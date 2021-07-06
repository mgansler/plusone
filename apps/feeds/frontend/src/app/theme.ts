import { createTheme } from '@material-ui/core/styles'

declare module '@material-ui/core/styles/createTheme' {
  interface Theme {
    appDrawer: {
      width: number
    }
  }

  // allow configuration using `createTheme`
  interface ThemeOptions {
    appDrawer: {
      width: number
    }
  }
}

export const theme = createTheme({
  appDrawer: {
    width: 320,
  },
})
