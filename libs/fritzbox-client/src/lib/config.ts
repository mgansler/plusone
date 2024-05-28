export type FritzBoxConfig = {
  host: string
  username: string
  password: string
}

export type ServiceConfig = {
  host: FritzBoxConfig['host']
  port: number
}
