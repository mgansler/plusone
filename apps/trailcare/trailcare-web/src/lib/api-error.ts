import { isAxiosError } from 'axios'

/** Use the backend's message (they are German) or fall back to a generic one */
export function errorMessage(error: unknown, fallback = 'Das hat nicht geklappt. Bitte versuch es nochmal.'): string {
  if (isAxiosError(error)) {
    if (!error.response) {
      return 'Keine Verbindung zum Server. Bitte prüf deinen Empfang.'
    }
    const message = (error.response.data as { message?: unknown } | undefined)?.message
    if (typeof message === 'string') {
      return message
    }
    if (Array.isArray(message) && typeof message[0] === 'string') {
      return message[0]
    }
  }
  return fallback
}
