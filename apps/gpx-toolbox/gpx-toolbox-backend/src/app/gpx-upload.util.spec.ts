import { BadRequestException } from '@nestjs/common'

import { extractGpxName, readUploadedGpx } from './gpx-upload.util'

describe('readUploadedGpx', () => {
  const content = '<gpx></gpx>'

  it('returns the file content of a valid GPX upload', () => {
    const file = { buffer: Buffer.from(content), originalname: 'Tour.GPX', size: content.length }
    expect(readUploadedGpx(file)).toBe(content)
  })

  it('rejects a missing file', () => {
    expect(() => readUploadedGpx(undefined)).toThrow(new BadRequestException('No GPX file provided'))
  })

  it('rejects files larger than 50 MB', () => {
    const file = { buffer: Buffer.from(content), originalname: 'tour.gpx', size: 50_000_001 }
    expect(() => readUploadedGpx(file)).toThrow('File size exceeds 50 MB limit')
  })

  it('rejects files without .gpx extension', () => {
    const file = { buffer: Buffer.from(content), originalname: 'tour.fit', size: content.length }
    expect(() => readUploadedGpx(file)).toThrow('File must be a .gpx file')
  })
})

describe('extractGpxName', () => {
  it('returns the track name', () => {
    expect(extractGpxName('<gpx><trk><name> Feierabendrunde </name><trkseg/></trk></gpx>')).toBe('Feierabendrunde')
  })

  it('handles a trk element with attributes', () => {
    expect(extractGpxName('<gpx><trk id="1"><name>Runde</name></trk></gpx>')).toBe('Runde')
  })

  it('ignores the metadata name outside of the track', () => {
    expect(extractGpxName('<gpx><metadata><name>Meta</name></metadata><trk><trkseg/></trk></gpx>')).toBeUndefined()
  })

  it('returns undefined for an empty track name', () => {
    expect(extractGpxName('<gpx><trk><name>  </name></trk></gpx>')).toBeUndefined()
  })
})
