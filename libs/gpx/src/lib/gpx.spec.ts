import { gpx } from './gpx'
import { join } from 'node:path'

describe('gpx', () => {
  it.each(['test.gpx'])('should open %s', (filename) => {
    const path = join(__dirname, '../../tracks', filename)

    expect(gpx(path)).toEqual('gpx')
  })
})
