// This file can be replaced during build by using the `fileReplacements` array.
// When building for production, this file is replaced with `environment.prod.ts`.

export interface Environment {
  production: boolean
  endpoint: string
}

export const environment: Environment = {
  production: false,
  endpoint: 'https://api.github.com/graphql',
}
