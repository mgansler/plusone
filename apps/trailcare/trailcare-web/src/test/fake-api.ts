import type { AxiosRequestConfig } from 'axios'
import { AxiosError, AxiosHeaders } from 'axios'

type Handler = unknown | ((config: AxiosRequestConfig) => unknown)

const handlers = new Map<string, Handler>()
const calls: Array<AxiosRequestConfig> = []

const key = (method: string | undefined, url: string | undefined) => `${(method ?? 'GET').toUpperCase()} ${url}`

/**
 * Stand-in for the backend, wired into the generated client in `setup.ts`.
 * Register responses per `METHOD /api/url`, a function handler can inspect the request or throw `httpError(…)`.
 */
export const fakeApi = {
  on(method: string, url: string, handler: Handler) {
    handlers.set(key(method, url), handler)
    return fakeApi
  },
  calls(method: string, url: string): Array<AxiosRequestConfig> {
    return calls.filter((call) => key(call.method, call.url) === key(method, url))
  },
  /** Request bodies sent to `METHOD url` */
  bodies(method: string, url: string): Array<unknown> {
    return fakeApi.calls(method, url).map((call) => call.data)
  },
  reset() {
    handlers.clear()
    calls.length = 0
  },
  async handle<T>(config: AxiosRequestConfig): Promise<T> {
    calls.push(config)
    if (!handlers.has(key(config.method, config.url))) {
      throw new Error(`fakeApi: no handler for ${key(config.method, config.url)}`)
    }
    const handler = handlers.get(key(config.method, config.url))
    return (typeof handler === 'function' ? await handler(config) : structuredClone(handler)) as T
  },
}

/** An error as axios throws it for a non 2xx response */
export function httpError(status: number, message?: string, url = '/api/test'): AxiosError {
  const config = { url, headers: new AxiosHeaders() }
  return new AxiosError(`Request failed with status code ${status}`, 'ERR_BAD_RESPONSE', config, undefined, {
    status,
    statusText: String(status),
    data: message === undefined ? {} : { message, statusCode: status },
    headers: {},
    config,
  })
}

/** An error as axios throws it when the server cannot be reached */
export function networkError(): AxiosError {
  return new AxiosError('Network Error', 'ERR_NETWORK', { headers: new AxiosHeaders() })
}
