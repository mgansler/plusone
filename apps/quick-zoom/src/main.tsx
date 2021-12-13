import ReactDOM from 'react-dom'
import { CssBaseline } from '@mui/material'
import React from 'react'

import { App } from './app/app'

ReactDOM.render(
  <React.StrictMode>
    <CssBaseline />
    <App />
  </React.StrictMode>,
  document.getElementById('root'),
)
