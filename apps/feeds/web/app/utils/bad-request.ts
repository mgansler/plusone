import { json } from 'remix'

export function badRequest(data: any, status = 400) {
  return json(data, { status })
}
