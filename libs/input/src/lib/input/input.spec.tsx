import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { Input } from './input'

describe('Input', () => {
  it('should render a label', () => {
    render(<Input label={'Label'} />)

    expect(screen.getByText(/label/i)).toBeInTheDocument()
  })

  it('should allow access via ref', () => {
    const inputRef = React.createRef<HTMLInputElement>()

    render(<Input label={'Label'} inputRef={inputRef} />)

    userEvent.type(screen.getByLabelText(/label/i), 'Hello World')

    expect(inputRef.current.value).toBe('Hello World')
  })
})
