// Configuración centralizada de la API

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  }

  const response = await fetch(url, {
    ...options,
    headers
  })

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

export const api = {
  get: <T>(endpoint: string) => request<T>(endpoint),
  post: <T>(endpoint: string, data: any) =>
    request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  put: <T>(endpoint: string, data: any) =>
    request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
  patch: <T>(endpoint: string, data?: any) =>
    request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined
    }),
  delete: <T>(endpoint: string) =>
    request<T>(endpoint, {
      method: 'DELETE'
    })
}