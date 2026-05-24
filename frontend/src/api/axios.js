import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL

const api = axios.create({
  baseURL: `${API_URL}/api`, // This must say API_URL, not localhost
  withCredentials: false
})

export default api