import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ConferenceLinkButton } from './conference-link-button'

describe('ConferenceLinkButton', () => {
  test.each`
    title                 | given                                                                               | expected
    ${'With Password'}    | ${'zoommtg://example.zoom.us/join?action=join&confno=0123456789&pwd=some_password'} | ${'zoommtg://example.zoom.us/join?action=join&confno=0123456789&pwd=some_password'}
    ${'Without Password'} | ${'zoommtg://example.zoom.us/join?action=join&confno=0123456789'}                   | ${'zoommtg://example.zoom.us/join?action=join&confno=0123456789'}
  `('should open the correct url for $title', ({ title, given, expected }) => {
    const windowOpenSpy = jest.spyOn(global, 'open').mockImplementation()

    const { getByText } = render(<ConferenceLinkButton title={title} url={given} type={'zoom'} />)

    userEvent.click(getByText(title))

    expect(windowOpenSpy).toHaveBeenCalledWith(expected)
  })
})
