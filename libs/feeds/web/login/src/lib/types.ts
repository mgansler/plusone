export interface LoginProps {
  username: string
  password: string
}

export type RegisterProps = LoginProps

export interface User {
  username: string
}

export type Token = string
