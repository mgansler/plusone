export interface LoginProps {
  username: string
  password: string
}

export type RegisterProps = LoginProps

export interface User {
  username: string
  isAdmin: boolean
}

export type Token = string
