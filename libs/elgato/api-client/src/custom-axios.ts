import type { AxiosRequestConfig, AxiosResponse } from 'axios'
import AxiosStatic from 'axios'

export async function customAxiosInstance<T>(config: AxiosRequestConfig): Promise<AxiosResponse<T>> {
  const axios = AxiosStatic.create()

  return axios({ ...config })
}
