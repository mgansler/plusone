import { Injectable, PipeTransform } from '@nestjs/common'
import { ZodSchema } from 'zod'

@Injectable()
export class ZodPipe implements PipeTransform {
  constructor(private readonly schema: ZodSchema) {}

  transform(value: unknown) {
    return this.schema.parse(value)
  }
}
