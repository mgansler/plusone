import { CareType } from '@plusone/trailcare-api-client'

import { CARE_TYPE_DONE, CARE_TYPE_LABEL, CARE_TYPES } from './care-types'

describe('care types', () => {
  it('offers every type of the API with a label and a confirmation', () => {
    expect([...CARE_TYPES].sort()).toEqual(Object.values(CareType).sort())
    for (const type of CARE_TYPES) {
      expect(CARE_TYPE_LABEL[type]).toBeTruthy()
      expect(CARE_TYPE_DONE[type]).toBeTruthy()
    }
  })

  it('starts with sweeping, the most common job', () => {
    expect(CARE_TYPES[0]).toBe(CareType.SWEPT)
  })
})
