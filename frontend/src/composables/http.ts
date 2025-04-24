import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse
} from 'axios'

class HttpClient {
  private instance: AxiosInstance

  constructor(baseURL: string) {
    this.instance = axios.create({
      baseURL,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json; charset=utf-8',
        apiKey: import.meta.env.VITE_BACKEND_API_KEY
      }
    })
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.request<T>({ ...config, method: 'get', url })
  }

  async post<T, R>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.request<T>({ ...config, method: 'post', url, data })
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.request<T>({ ...config, method: 'put', url, data })
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.request<T>({ ...config, method: 'delete', url })
  }

  async request<T>(config: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    try {
      const response: AxiosResponse<T> = await this.instance.request<T>(config)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  handleResponse<T>(response: AxiosResponse<T>): T {
    return response
  }

  handleError(error: AxiosError): Error {
    if (error.response) {
      return new Error(`Request failed with status ${error.response.status}`)
    } else if (error.request) {
      return new Error('No response received from server')
    } else {
      return new Error(`Error setting up request: ${error.message}`)
    }
  }
}

export const http = new HttpClient(import.meta.env.VITE_BACKEND_BASE_URL)
