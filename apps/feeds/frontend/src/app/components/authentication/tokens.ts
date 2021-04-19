import { Token } from '@plusone/feeds-schema'

const LOCAL_STORAGE_KEY = 'token'

export const readToken = (): Token | null => JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || 'null')

export const writeToken = (token: Token) => localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(token))

export const clearToken = () => localStorage.removeItem(LOCAL_STORAGE_KEY)
