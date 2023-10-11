import { ElgatoSceneRequestDto, elgatoSceneRequestSchema } from '../dto/elgato-scene-request.dto'

/**
 * Start with a dim reddish light (hue: 25, saturation 100, brightness 0).
 * Transition to a warm white light (hue: 50, saturation: 30, brightness: 100).
 * Finish sunrise by slowly dimming the light strip to brightness of 0.
 * Turn of the device while the brightness is 0
 */
export const sunrise = elgatoSceneRequestSchema.parse({
  numberOfLights: 1,
  lights: [
    {
      id: 'de.martingansler.elgato.scene.sunrise',
      brightness: 100,
      name: 'Sunrise',
      on: 1,
      numberOfSceneElements: 3,
      scene: [
        { hue: 25, saturation: 100, brightness: 2, transitionMs: 0, durationMs: 1_000 },
        { hue: 50, saturation: 30, brightness: 100, transitionMs: 60 * 60_000, durationMs: 0 },
        { hue: 50, saturation: 30, brightness: 0, transitionMs: 60_000, durationMs: 60_000 },
      ],
    },
  ],
}) as ElgatoSceneRequestDto
