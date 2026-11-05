/** Min/max as typed into the inputs (empty string = no bound) */
export type NumberRange = { min: string; max: string }

export const emptyRange: NumberRange = { min: '', max: '' }

export function isEmptyRange(range: NumberRange): boolean {
  return range.min === '' && range.max === ''
}

/** Turn a typed range into query params, converting to meters with `factor` */
export function rangeParams<Min extends string, Max extends string>(
  range: NumberRange,
  minKey: Min,
  maxKey: Max,
  factor: number,
): Partial<Record<Min | Max, number>> {
  const params: Partial<Record<Min | Max, number>> = {}
  const min = parseFloat(range.min)
  const max = parseFloat(range.max)
  if (!isNaN(min)) params[minKey] = min * factor
  if (!isNaN(max)) params[maxKey] = max * factor
  return params
}
