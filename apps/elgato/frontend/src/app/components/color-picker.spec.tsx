import { describe, expect, it } from 'vitest'

import { parseRgb, rgbToHue, toRgb } from './color-picker'

describe('parseRgb', () => {
  it('should handle rgb with #', () => {
    const actual = parseRgb('#789abc')
    expect(actual).toEqual([120, 154, 188])
  })

  it('should handle rgb without #', () => {
    const actual = parseRgb('789abc')
    expect(actual).toEqual([120, 154, 188])
  })
})

describe('toRgb', () => {
  it('should convert rgb values to rgb string', () => {
    const actual = toRgb([255, 0, 0])
    expect(actual).toEqual('#ff0000')
  })
})

describe('rgbToHue', () => {
  it('should handle rgb string', () => {
    const actual = rgbToHue('#ff0000')
    expect(actual).toEqual(0)
  })

  it('should handle rgb as number[]', () => {
    const actual = rgbToHue([255, 0, 0])
    expect(actual).toEqual(0)
  })
})
