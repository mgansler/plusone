import { httpError, networkError } from '../test/fake-api'

import { errorMessage } from './api-error'

describe('errorMessage', () => {
  it('uses the message from the backend', () => {
    expect(errorMessage(httpError(409, 'Ein Trailgebiet mit diesem Namen existiert bereits'))).toBe(
      'Ein Trailgebiet mit diesem Namen existiert bereits',
    )
  })

  it('uses the first validation message', () => {
    const error = httpError(400)
    ;(error.response as { data: unknown }).data = { message: ['name must be longer', 'other'] }
    expect(errorMessage(error)).toBe('name must be longer')
  })

  it('explains missing connectivity', () => {
    expect(errorMessage(networkError())).toBe('Keine Verbindung zum Server. Bitte prüf deinen Empfang.')
  })

  it('falls back for unknown errors', () => {
    expect(errorMessage(new Error('boom'))).toBe('Das hat nicht geklappt. Bitte versuch es nochmal.')
    expect(errorMessage(httpError(500), 'Eigener Text')).toBe('Eigener Text')
  })
})
