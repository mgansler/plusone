import { z as zod } from 'zod'

import { elgatoSceneRequestSchema } from '../dto/elgato-scene-request.dto'

export function getTotalDurationInMs(scene: zod.infer<typeof elgatoSceneRequestSchema>) {
  return scene.lights[0].scene.reduce(
    (totalDuration, sceneElement) => totalDuration + sceneElement.durationMs + sceneElement.transitionMs,
    0,
  )
}
