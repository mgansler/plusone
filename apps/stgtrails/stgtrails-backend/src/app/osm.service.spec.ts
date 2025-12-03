import { HttpService } from '@nestjs/axios'
import { Test } from '@nestjs/testing'

import { OsmService } from './osm.service'

// Disabled because of rate limiting by osm.org
// eslint-disable-next-line no-restricted-properties
describe.skip('OsmService', () => {
  let osmService: OsmService

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [OsmService, { provide: HttpService, useValue: new HttpService() }],
    }).compile()

    osmService = moduleRef.get<OsmService, OsmService>(OsmService)
  })

  it('should return location details for an area in germany', async () => {
    // Kurpfalz Park
    const actual = await osmService.reverseLookup({ latitude: 49.407692, longitude: 8.118681 })

    expect(actual).toEqual({
      country: 'Deutschland',
      countryCode: 'de',
      state: 'Rheinland-Pfalz',
      stateCode: 'rp',
    })
  })

  it('should handle single character states', async () => {
    // Innsbruck
    const actual = await osmService.reverseLookup({ latitude: 47.289351, longitude: 11.376731 })

    expect(actual).toEqual({
      country: 'Österreich',
      countryCode: 'at',
      state: 'Tirol',
      stateCode: '7',
    })
  })

  it('should return location details for an area in italy', async () => {
    // Finale Ligure
    const actual = await osmService.reverseLookup({ latitude: 44.189, longitude: 8.318 })

    expect(actual).toEqual({
      country: 'Italia',
      countryCode: 'it',
      state: 'Liguria',
      stateCode: '42',
    })
  })

  it('should return location details for an area in north america', async () => {
    // Whistler
    const actual = await osmService.reverseLookup({ latitude: 50.113, longitude: -122.954 })

    expect(actual).toEqual({
      country: 'Canada',
      countryCode: 'ca',
      state: 'British Columbia',
      stateCode: 'bc',
    })
  })

  it('should return location details for an area in south america', async () => {
    const actual = await osmService.reverseLookup({ latitude: -18.836, longitude: -55.755 })

    expect(actual).toEqual({
      country: 'Brasil',
      countryCode: 'br',
      state: 'Mato Grosso do Sul',
      stateCode: 'ms',
    })
  })
})
