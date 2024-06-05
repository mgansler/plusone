import { z } from 'zod'

const specVersionSchema = z.object({ major: z.number().int(), minor: z.number().int() })

export const serviceSchema = z.object({
  serviceType: z.string(),
  serviceId: z.string(),
  controlURL: z.string(),
  eventSubURL: z.string(),
  SCPDURL: z.string(),
})

export const deviceSchema = z.object({
  deviceType: z.string(),
  friendlyName: z.string(),
  manufacturer: z.string(),
  manufacturerURL: z.string(),
  modelDescription: z.string(),
  modelName: z.string(),
  modelNumber: z.string(),
  modelURL: z.string(),
  UDN: z.string(),
  serviceList: z.object({
    service: serviceSchema
      .or(z.array(serviceSchema))
      .transform((services) => (Array.isArray(services) ? services : [services])),
  }),
})

export const tr064DescSchema = z.object({
  root: z.object({
    specVersion: specVersionSchema,
    systemVersion: z.object({
      HW: z.number().int(),
      Major: z.number().int(),
      Minor: z.number().int(),
      Patch: z.number().int(),
      Buildnumber: z.number().int(),
      Display: z.string(),
    }),
    device: deviceSchema.extend({
      serialNumber: z.string(),
      originUDN: z.string(),
      iconList: z.object({
        icon: z.object({
          mimetype: z.string(),
          width: z.number().int(),
          height: z.number().int(),
          depth: z.number().int(),
          url: z.string(),
        }),
      }),
      deviceList: z.object({
        device: deviceSchema
          .or(z.array(deviceSchema))
          .transform((devices) => (Array.isArray(devices) ? devices : [devices])),
      }),
      presentationURL: z.string().url(),
    }),
  }),
})

export const argumentSchema = z.object({
  name: z.string(),
  direction: z.string(),
  relatedStateVariable: z.string(),
})

export type ActionArgument = z.infer<typeof argumentSchema>

export const actionSchema = z.object({
  name: z.string(),
  argumentList: z
    .object({
      argument: argumentSchema.or(z.array(argumentSchema)),
    })
    .optional(),
})

export const scdpResponseSchema = z.object({
  scpd: z.object({
    specVersion: specVersionSchema,
    actionList: z.object({
      action: z.array(actionSchema),
    }),
  }),
})
