import axios from 'axios'

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
})

// Request interceptor - ONLY add token if it exists
API.interceptors.request.use((req) => {
  const user = JSON.parse(localStorage.getItem('user'))
  
  // Don't add token for register or login routes
  if (user && user.token &&!req.url.includes('/users/register') &&!req.url.includes('/users/login')) {
    req.headers.Authorization = `Bearer ${user.token}`
  }
  
  return req
})

export default API