import type { ConferenceLink } from './types'
import { fromLink } from './from-link'

describe('fromLink', () => {
  test.each`
    title | link | expected
    ${'with password'} | ${'https://example.zoom.us/j/0123456789?pwd=some_password'} | ${{
  type: 'zoom',
  url: 'zoommtg://example.zoom.us/join?action=join&confno=0123456789&pwd=some_password',
  title: 'with password',
} as ConferenceLink}
    ${'without password'} | ${'https://example.zoom.us/j/0123456789'} | ${{
  type: 'zoom',
  url: 'zoommtg://example.zoom.us/join?action=join&confno=0123456789',
  title: 'without password',
} as ConferenceLink}
  `('should return a zoom conference $title', ({ title, link, expected }) => {
    const actual = fromLink(link, title)

    expect(actual).toEqual(expected)
  })
})
