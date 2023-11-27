import { ApiProperty } from '@nestjs/swagger'
import { z as zod } from 'zod'

/**
 * When transitioning to a new scene element, it takes transitionMs to reach
 * the new hue/saturation/brightness values, and then it stays in that sate
 * for durationMs.
 *
 * This means for the first scene element the transitionMs can be 0 when
 * the scene is not supposed to loop.
 */
class SceneElement {
  @ApiProperty({ minimum: 0, maximum: 360 })
  hue: number

  @ApiProperty({ minimum: 0, maximum: 100 })
  saturation: number

  @ApiProperty({ minimum: 0, maximum: 100 })
  brightness: number

  @ApiProperty({ minimum: 0, maximum: 60_000 })
  transitionMs: number

  @ApiProperty({ minimum: 0, maximum: 60_000 })
  durationMs: number
}

const sceneElementSchema = zod.object({
  hue: zod.number().min(0).max(360),
  saturation: zod.number().min(0).max(100),
  brightness: zod.number().min(0).max(100),
  transitionMs: zod.number().int().min(0),
  durationMs: zod.number().int().min(0),
})

export class Lights {
  @ApiProperty()
  id: string

  @ApiProperty({ minimum: 0, maximum: 100 })
  brightness: number

  @ApiProperty({ type: () => [SceneElement] })
  scene: Array<SceneElement>

  @ApiProperty()
  name: string

  @ApiProperty({ minimum: 0, maximum: 1 })
  on: 1 | 0

  @ApiProperty()
  numberOfSceneElements: number
}

function splitTransition(data: Lights): Lights {
  const scene: SceneElement[] = []
  for (const [index, element] of data.scene.entries()) {
    if (element.transitionMs <= 60_000) {
      scene.push(element)
    } else {
      const elementBefore = index > 0 ? data.scene[index - 1] : data.scene[data.scene.length - 1]

      const hueDiff = element.hue - elementBefore.hue
      const satDiff = element.saturation - elementBefore.saturation
      const briDiff = element.brightness - elementBefore.brightness

      const hueStepPerMs = hueDiff / element.transitionMs
      const satStepPerMs = satDiff / element.transitionMs
      const briStepPerMs = briDiff / element.transitionMs

      const x = Math.floor(element.transitionMs / 60_000)
      const y = element.transitionMs % 60_000

      for (let i = 1; i <= x; i++) {
        scene.push({
          transitionMs: 60_000,
          durationMs: 0,
          hue: elementBefore.hue + hueStepPerMs * 60_000 * i,
          saturation: elementBefore.saturation + satStepPerMs * 60_000 * i,
          brightness: elementBefore.brightness + briStepPerMs * 60_000 * i,
        })
      }

      if (y > 0) {
        scene.push({
          transitionMs: y,
          durationMs: element.durationMs,
          hue: element.hue,
          saturation: element.saturation,
          brightness: element.brightness,
        })
      }
    }
  }

  return {
    ...data,
    numberOfSceneElements: scene.length,
    scene,
  }
}

function splitDuration(data: Lights): Lights {
  const scene: SceneElement[] = []
  for (const element of data.scene) {
    if (element.durationMs <= 60_000) {
      scene.push(element as SceneElement)
    } else {
      let remainingDuration = element.durationMs
      let isFirstSplit = true
      while (remainingDuration > 0) {
        const newElement = {
          ...element,
          transitionMs: isFirstSplit ? element.transitionMs : 0,
          durationMs: Math.min(remainingDuration, 60_000),
        } as SceneElement
        scene.push(newElement)
        remainingDuration -= newElement.durationMs
        isFirstSplit = false
      }
    }
  }
  return {
    ...data,
    numberOfSceneElements: scene.length,
    scene,
  }
}

const lightsSchema = zod
  .object({
    id: zod.string(),
    brightness: zod.number().int().min(0).max(100),
    name: zod.string(),
    on: zod.number().int().min(0).max(1),
    numberOfSceneElements: zod.number(),
    scene: zod.array(sceneElementSchema),
  })
  .refine(
    (data) => data.scene.length === data.numberOfSceneElements,
    (data) => {
      return {
        expected: data.scene.length,
        received: data.numberOfSceneElements,
        path: ['numberOfSceneElements'],
        message: 'numberOfSceneElements must match the length of scene array',
      }
    },
  )
  .transform(splitTransition)
  .transform(splitDuration)

export type LightStripWithScene = zod.infer<typeof lightsSchema>

export class ElgatoSceneRequestDto {
  @ApiProperty()
  numberOfLights: number

  @ApiProperty({ type: () => [Lights] })
  lights: Array<Lights>
}

export const elgatoSceneRequestSchema = zod
  .object({
    numberOfLights: zod.number(),
    lights: zod.array(lightsSchema),
  })
  .refine(
    (data) => data.numberOfLights === data.lights.length,
    (data) => {
      return {
        expected: data.lights.length,
        received: data.numberOfLights,
        path: ['numberOfLights'],
        message: 'numberOfLights must match the length of lights array',
      }
    },
  )
