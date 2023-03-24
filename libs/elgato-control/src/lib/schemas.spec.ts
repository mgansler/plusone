import { ZodError } from 'zod'

import { lightStripControlStateSchema } from './schemas'

describe('schemas', () => {
  describe('light strip', () => {
    it('should accept on/off', () => {
      lightStripControlStateSchema.parse({ on: 0 })
      lightStripControlStateSchema.parse({ on: 1 })
    })

    it('should accept setting the hue', () => {
      lightStripControlStateSchema.parse({ hue: 180 })
    })

    it('should accept setting the saturation', () => {
      lightStripControlStateSchema.parse({ saturation: 50 })
    })

    it('should accept setting the brightness', () => {
      lightStripControlStateSchema.parse({ brightness: 50 })
    })

    it('should have at least one property', () => {
      expect(() => lightStripControlStateSchema.parse({})).toThrow(ZodError)
    })
  })
})
