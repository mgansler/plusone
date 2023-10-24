import type { AxiosError } from '@nestjs/terminus/dist/errors/axios.error'
import type { AxiosRequestConfig } from 'axios'
import AxiosStatic, { AxiosHeaders } from 'axios'

import type { LoginResponseDto } from './index'
import { AUTHENTICATION_LOCAL_STORAGE_KEY } from './index'

function getAuthorizationHeader(type: 'access_token' | 'refresh_token'): { Authorization: string } | undefined {
  const value = localStorage.getItem(AUTHENTICATION_LOCAL_STORAGE_KEY)

  if (value === null || typeof value === 'undefined' || value === 'undefined') {
    return undefined
  }

  const auth = JSON.parse(value)

  if (auth[type] === undefined) {
    return undefined
  }

  return { Authorization: `Bearer ${auth[type]}` }
}

async function refreshAccessToken(): Promise<string | undefined> {
  const headers = getAuthorizationHeader('refresh_token')
  if (headers) {
    try {
      const resp = await AxiosStatic.create().get<LoginResponseDto>('/api/authentication/refresh', { headers })
      localStorage.setItem(AUTHENTICATION_LOCAL_STORAGE_KEY, JSON.stringify(resp.data))
      return resp.data.refresh_token
    } catch (e) {
      if ((e as AxiosError).response.status === 401) {
        localStorage.removeItem(AUTHENTICATION_LOCAL_STORAGE_KEY)
      }
    }
  }

  return undefined
}

export async function customAxiosInstance<T>(config: AxiosRequestConfig): Promise<T> {
  const axios = AxiosStatic.create()

  axios.interceptors.request.use(
    async (config) => {
      const headers = getAuthorizationHeader('access_token')
      if (headers) {
        config.headers = new AxiosHeaders(headers)
      }
      return config
    },
    (error) => Promise.reject(error),
  )

  axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config
      if (error.response.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true
        axios.defaults.headers.common['Authorization'] = `Bearer ${await refreshAccessToken()}`
        return axios(originalRequest)
      }

      console.log(error.response.data.message)
      if (error.response.data.message) {
        return Promise.reject(new Error(error.response.data.message))
      }

      return Promise.reject(error)
    },
  )

  // eslint-disable-next-line import/no-named-as-default-member
  const source = AxiosStatic.CancelToken.source()
  const promise = axios({
    ...config,
    cancelToken: source.token,
  }).then<T>(({ data }) => data)

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  promise.cancel = () => {
    source.cancel('Query was cancelled')
  }

  return promise
}
