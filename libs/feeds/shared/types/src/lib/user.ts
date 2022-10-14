export interface UserResponse {
  id: string
  username: string
  email: string | null
  isAdmin: boolean
}

export interface LoginResponse {
  access_token: string
}
