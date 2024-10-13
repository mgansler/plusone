import type { AxiosRequestConfig } from 'axios'
import AxiosStatic from 'axios'

export async function customAxiosInstance<T>(config: AxiosRequestConfig): Promise<T> {
  const axios = AxiosStatic.create()

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
