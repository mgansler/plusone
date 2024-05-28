import { XMLBuilder, XMLParser } from 'fast-xml-parser'
import { z } from 'zod'

export const dateTransformSchema = z
  .string()
  .regex(/\d{2}\.\d{2}\.\d{2} \d{2}:\d{2}/)
  .transform((input) => {
    const [datePart, timePart] = input.split(' ')
    const [day, month, year] = datePart.split('.').map(Number)
    const [hour, minute] = timePart.split(':').map(Number)

    return new Date(year + 2000, month - 1, day, hour, minute)
  })

export const xmlParser = new XMLParser({ ignoreAttributes: false })
export const xmlBuilder = new XMLBuilder({
  ignoreAttributes: false,
  attributeNamePrefix: '@@',
  format: true,
})
