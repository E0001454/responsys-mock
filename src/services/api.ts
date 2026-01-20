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
  // Lineas
  getLineas: () => http.get('/lineas'),
  getLineaById: (id: string | number) => http.get(`/lineas/${id}`),

  // Campanas
  getCampanasByLinea: (lineaId: string | number) =>
    http.get(`/lineas/${lineaId}/campanas`),
  getCampanaById: (lineaId: string | number, campanaId: string | number) =>
    http.get(`/lineas/${lineaId}/campanas/${campanaId}`),

  // Mapeos
  getAllMapeos: () => http.get('/lineas/campanas/mapeos'),
  getMapeosByLinea: (lineaId: string | number) =>
    http.get(`/lineas/${lineaId}/mapeos`),
  getMapeosByCampana: (lineaId: string | number, campanaId: string | number) =>
    http.get(`/lineas/${lineaId}/campanas/${campanaId}/mapeos`),

  createMapeoLinea: (lineaId: string | number, payload: any) =>
    http.post(`/lineas/${lineaId}/mapeos`, payload),
  createMapeoCampana: (
    lineaId: string | number,
    campanaId: string | number,
    payload: any
  ) => http.post(`/lineas/${lineaId}/campanas/${campanaId}/mapeos`, payload),

  updateMapeoLinea: (payload: any) => http.put('/linea/mapeos', payload),
  updateMapeoCampana: (payload: any) => http.put('/linea/campana/mapeos', payload),

  deleteMapeoLinea: (lineaId: string | number, mapeoId: string | number) =>
    http.delete(`/lineas/${lineaId}/mapeos/${mapeoId}`),
  deleteMapeoCampana: (
    lineaId: string | number,
    campanaId: string | number,
    mapeoId: string | number
  ) => http.delete(`/lineas/${lineaId}/campanas/${campanaId}/mapeos/${mapeoId}`),

  patchActivarMapeoLinea: (payload: any) =>
    http.patch('/linea/mapeos/activar', payload),
  patchDesactivarMapeoLinea: (payload: any) =>
    http.patch('/linea/mapeos/desactivar', payload),
  patchActivarMapeoCampana: (payload: any) =>
    http.patch('/linea/campana/mapeos/activar', payload),
  patchDesactivarMapeoCampana: (payload: any) =>
    http.patch('/linea/campana/mapeos/desactivar', payload)
}