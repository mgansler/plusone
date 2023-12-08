/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */
import { join } from 'path'

import express from 'express'

const app = express()

app.use('/feeds', express.static(join(__dirname, 'feeds')))

const port = process.env.PORT || 3334
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`)
})
server.on('error', console.error)
