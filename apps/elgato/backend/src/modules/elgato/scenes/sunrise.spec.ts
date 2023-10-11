import { sunrise } from './sunrise'

describe('Sunrise', () => {
  it('should split up the definition', () => {
    expect(sunrise.lights[0].numberOfSceneElements).toBe(62)

    const expectedTotalDuration = 1_000 + 62 * 60_000
    const actualTotalDuration = sunrise.lights[0].scene.reduce(
      (previousValue, currentValue) => previousValue + currentValue.durationMs + currentValue.transitionMs,
      0,
    )

    expect(actualTotalDuration).toBe(expectedTotalDuration)
  })
})
