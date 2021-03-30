import { createMuiTheme } from '@material-ui/core'

declare module '@material-ui/core/styles/createMuiTheme' {
  interface Theme {
    appDrawer: {
      width: number
    }
  }

  // allow configuration using `createMuiTheme`
  interface ThemeOptions {
    appDrawer: {
      width: number
    }
  }
}

export const theme = createMuiTheme({
  appDrawer: {
    width: 320,
  },
})
