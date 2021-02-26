import React from 'react'

import { useLabelStyles } from '../styles'

export interface InputProps extends React.HTMLProps<HTMLInputElement> {
  label: string
}

export const Input: React.FC<InputProps> = ({
  label,
  children,
  ...inputProps
}) => {
  const classNames = useLabelStyles()
  return (
    <label className={classNames.label}>
      {label}
      <input {...inputProps} />
    </label>
  )
}
