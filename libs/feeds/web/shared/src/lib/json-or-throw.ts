export function jsonOrThrow(response: Response) {
  if (response.ok) return response.json()
  throw new Error(`${response.status}: ${response.statusText}`)
}
