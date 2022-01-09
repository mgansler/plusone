import { json } from 'remix'

export function badRequest(data: object, status = 400) {
  return json(data, { status })
}
