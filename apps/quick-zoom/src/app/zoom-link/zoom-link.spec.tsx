import React from 'react'
import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ZoomLink } from './zoom-link'

test.each`
  name                  | given                                                                | expected
  ${'With Password'}    | ${new URL('https://example.zoom.us/j/0123456789?pwd=some_password')} | ${'zoommtg://example.zoom.us/join?action=join&confno=0123456789&pwd=some_password'}
  ${'Without Password'} | ${new URL('https://example.zoom.us/j/0123456789')}                   | ${'zoommtg://example.zoom.us/join?action=join&confno=0123456789'}
`('should open the correct url for $name', ({ name, given, expected }) => {
  const windowOpenSpy = jest.spyOn(global, 'open').mockImplementation()

  const { getByText } = render(<ZoomLink name={name} url={given} />)

  userEvent.click(getByText(name))

  expect(windowOpenSpy).toHaveBeenCalledWith(expected)
})

it('should not show a button with an invalid URL', () => {
  const { container } = render(
    <ZoomLink name={'Name'} url={new URL('https://example.zoom.us/j/xxx')} />,
  )

  expect(container).toBeEmptyDOMElement()
})
