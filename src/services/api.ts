const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`
  // Log outgoing requests to help debug GET-with-body situations
  try {
    const method = (options.method || 'GET').toUpperCase()
    console.log('[API Request]', method, url)
    if (options.body) console.log('[API Request] BODY:', options.body)
  } catch (e) {
    /* ignore logging errors */
  }
  const headers = {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
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

export const http = {
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

export const api = {
  // Mapeos por linea
  getAllMapeos: () => http.get('/lineas/0/mapeos'),
  getMapeosByLinea: (lineaId: string | number) =>
    http.get(`/lineas/${lineaId}/mapeos`),
  getMapeosCampana: () =>
    request('/lineas/0/campanas/0/mapeos', {
      method: 'GET',
      body: JSON.stringify({
        mapeo: { id: null }
      })
    }),
  getColumnasCampana: () =>
    request('/lineas/0/campanas/0/mapeos/columnas', {
      method: 'GET',
      body: JSON.stringify({
        mapeo: { id: null },
        columna: { id: null },
        idUsuario: 1
      })
    }),
  createMapeoLinea: (lineaId: string | number, payload: any) =>
    http.post(`/lineas/${lineaId}/mapeos`, payload),
  createMapeoCampana: (
    lineaId: string | number,
    campanaId: string | number,
    payload: any
  ) => http.post(`/lineas/${lineaId}/campanas/${campanaId}/mapeos`, payload),
  updateMapeoLinea: (payload: any) => http.put('/lineas/mapeos', payload),
  updateMapeoCampana: (payload: any) => http.put('/lineas/campanas/mapeos', payload),
  deleteMapeoLinea: (lineaId: string | number, mapeoId: string | number) =>
    http.delete(`/lineas/${lineaId}/mapeos/${mapeoId}`),
  patchActivarMapeoLinea: (payload: any) =>
    http.patch('/lineas/mapeos/activar', payload),
  patchDesactivarMapeoLinea: (payload: any) =>
    http.patch('/lineas/mapeos/desactivar', payload),
  patchActivarMapeoCampana: (payload: any) =>
    http.patch('/lineas/campanas/mapeos/activar', payload),
  patchDesactivarMapeoCampana: (payload: any) =>
    http.patch('/lineas/campanas/mapeos/desactivar', payload)
}