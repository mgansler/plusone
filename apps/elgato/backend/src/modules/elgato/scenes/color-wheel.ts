import { elgatoSceneRequestSchema } from '../dto/elgato-scene-request.dto'

export const colorWheel = elgatoSceneRequestSchema.parse({
  numberOfLights: 1,
  lights: [
    {
      id: 'de.martingansler.elgato.scene.color-wheel',
      brightness: 100,
      name: 'Color Wheel',
      on: 1,
      numberOfSceneElements: 3,
      scene: [
        { hue: 0, saturation: 100, brightness: 100, transitionMs: 0, durationMs: 0 },
        { hue: 180, saturation: 100, brightness: 100, transitionMs: 60 * 1_000, durationMs: 0 },
        { hue: 360, saturation: 100, brightness: 100, transitionMs: 60 * 1_000, durationMs: 0 },
      ],
    },
  ],
})
