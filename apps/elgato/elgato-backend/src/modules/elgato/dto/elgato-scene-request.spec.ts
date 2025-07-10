import { elgatoSceneRequestSchema } from './elgato-scene-request.dto'

describe('lightsSchema', () => {
  it('should show an error when scene elements and numberOfSceneElements mismatch', () => {
    const input = {
      numberOfLights: 1,
      lights: [
        {
          id: 'invalid-number-of-numberOfSceneElements',
          brightness: 100,
          name: 'Invalid number of numberOfSceneElements',
          on: 1,
          numberOfSceneElements: 1,
          scene: [
            { hue: 0, saturation: 100, brightness: 100, transitionMs: 0, durationMs: 1_000 },
            { hue: 180, saturation: 100, brightness: 100, transitionMs: 1_000, durationMs: 90_000 },
          ],
        },
      ],
    }

    expect(() => elgatoSceneRequestSchema.parse(input)).toThrowErrorMatchingInlineSnapshot(`
      "[
        {
          "code": "custom",
          "path": [
            "lights",
            0,
            "numberOfSceneElements"
          ],
          "message": "numberOfSceneElements (1) must match the length of scene array (2)"
        }
      ]"
    `)
  })

  it('should split up scene elements when duration is longer then 60s', () => {
    const input = {
      numberOfLights: 1,
      lights: [
        {
          id: 'too-long-duration',
          brightness: 100,
          name: 'Too long duration',
          on: 1,
          numberOfSceneElements: 2,
          scene: [
            { hue: 0, saturation: 100, brightness: 100, transitionMs: 0, durationMs: 1_000 },
            { hue: 180, saturation: 100, brightness: 100, transitionMs: 1_000, durationMs: 90_000 },
          ],
        },
      ],
    }

    const result = elgatoSceneRequestSchema.parse(input)

    // The result should still be valid
    elgatoSceneRequestSchema.parse(result)

    expect(result.lights[0].numberOfSceneElements).toBe(3)
    expect(result.lights[0].scene).toEqual([
      { hue: 0, saturation: 100, brightness: 100, transitionMs: 0, durationMs: 1_000 },
      { hue: 180, saturation: 100, brightness: 100, transitionMs: 1_000, durationMs: 60_000 },
      { hue: 180, saturation: 100, brightness: 100, transitionMs: 0, durationMs: 30_000 },
    ])
  })

  it('should split up scene elements when transition is longer then 60s', () => {
    const input = {
      numberOfLights: 1,
      lights: [
        {
          id: 'too-long-transition',
          brightness: 0,
          name: 'Too long transition',
          on: 1,
          numberOfSceneElements: 3,
          scene: [
            { hue: 25, saturation: 100, brightness: 0, transitionMs: 0, durationMs: 1_000 },
            { hue: 50, saturation: 30, brightness: 100, transitionMs: 150_000, durationMs: 0 },
            { hue: 50, saturation: 30, brightness: 0, transitionMs: 60_000, durationMs: 60_000 },
          ],
        },
      ],
    }

    const result = elgatoSceneRequestSchema.parse(input)

    // The result should still be valid
    elgatoSceneRequestSchema.parse(result)

    expect(result.lights[0].numberOfSceneElements).toBe(5)
    expect(result.lights[0].scene).toEqual([
      { hue: 25, saturation: 100, brightness: 0, transitionMs: 0, durationMs: 1_000 },
      { hue: 35, saturation: 72, brightness: 40, transitionMs: 60_000, durationMs: 0 },
      { hue: 45, saturation: 44, brightness: 80, transitionMs: 60_000, durationMs: 0 },
      { hue: 50, saturation: 30, brightness: 100, transitionMs: 30_000, durationMs: 0 },
      { hue: 50, saturation: 30, brightness: 0, transitionMs: 60_000, durationMs: 60_000 },
    ])
  })

  it('should split up scene elements when transition and duration are longer then 60s', () => {
    const input = {
      numberOfLights: 1,
      lights: [
        {
          id: 'too-long-duration-and-transition',
          brightness: 0,
          name: 'Too long duration and transition',
          on: 1,
          numberOfSceneElements: 2,
          scene: [
            { hue: 25, saturation: 100, brightness: 0, transitionMs: 0, durationMs: 1_000 },
            { hue: 50, saturation: 30, brightness: 100, transitionMs: 150_000, durationMs: 150_000 },
          ],
        },
      ],
    }

    const result = elgatoSceneRequestSchema.parse(input)

    // The result should still be valid
    elgatoSceneRequestSchema.parse(result)

    expect(result.lights[0].numberOfSceneElements).toBe(6)
    expect(result.lights[0].scene).toEqual([
      { hue: 25, saturation: 100, brightness: 0, transitionMs: 0, durationMs: 1_000 },
      { hue: 35, saturation: 72, brightness: 40, transitionMs: 60_000, durationMs: 0 },
      { hue: 45, saturation: 44, brightness: 80, transitionMs: 60_000, durationMs: 0 },
      { hue: 50, saturation: 30, brightness: 100, transitionMs: 30_000, durationMs: 60_000 },
      { hue: 50, saturation: 30, brightness: 100, transitionMs: 0, durationMs: 60_000 },
      { hue: 50, saturation: 30, brightness: 100, transitionMs: 0, durationMs: 30_000 },
    ])
  })
})
