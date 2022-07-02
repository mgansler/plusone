import { json } from '@remix-run/node'

export function badRequest(data: object, status = 400) {
  return json(data, { status })
}
