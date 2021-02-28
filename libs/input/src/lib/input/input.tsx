import React from 'react'

import { useLabelStyles } from '../styles'

export interface InputProps extends React.HTMLProps<HTMLInputElement> {
  label: string
  inputRef?: React.Ref<HTMLInputElement>
}

export const Input: React.FC<InputProps> = ({
  label,
  inputRef,
  children,
  ...inputProps
}) => {
  const classNames = useLabelStyles()
  return (
    <label className={classNames.label}>
      {label}
      <input {...inputProps} ref={inputRef} />
    </label>
  )
}
