import React from 'react'

import { useLabelStyles } from '../styles'

export interface SelectProps extends React.HTMLProps<HTMLSelectElement> {
  label: string
}

export const Select: React.FC<SelectProps> = ({
  label,
  children,
  ...selectProps
}) => {
  const classNames = useLabelStyles()
  return (
    <label className={classNames.label}>
      {label}
      <select {...selectProps}>{children}</select>
    </label>
  )
}
