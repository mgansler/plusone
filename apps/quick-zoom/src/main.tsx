import React from 'react'
import ReactDOM from 'react-dom'
import { CssBaseline } from '@material-ui/core'

import { App } from './app/app'

ReactDOM.render(
  <React.StrictMode>
    <CssBaseline />
    <App />
  </React.StrictMode>,
  document.getElementById('root'),
)
