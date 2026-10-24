import type { AxiosRequestConfig } from 'axios'
import AxiosStatic from 'axios'

const TOKEN_KEY = 'gpx-toolbox-jwt'

function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export async function customAxiosInstance<T>(config: AxiosRequestConfig): Promise<T> {
  const axios = AxiosStatic.create()

  const token = getToken()
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
  }

  const source = AxiosStatic.CancelToken.source()
  const promise = axios({
    ...config,
    cancelToken: source.token,
  }).then<T>(({ data }) => data)

  // @ts-expect-error false positive `Property cancel does not exist on type Promise<T>
  promise.cancel = () => {
    source.cancel('Query was cancelled')
  }

  return promise
}
