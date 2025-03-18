import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_BASE_URL,
  headers: {
    apiKey: import.meta.env.VITE_BACKEND_API_KEY
  }
})

export default api
