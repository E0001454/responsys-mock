import { api, http } from './api'
import { mockColumnasApi } from './mockData'
import type { ColumnaData, ColumnaCampanaData } from '../types/columna'

interface ApiClient {
  getColumnasByMapeo(mapeoId: string | number): Promise<ColumnaData[]>
  getColumnasCampana(): Promise<ColumnaCampanaData[]>
}

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'
const apiClient = (USE_MOCK ? mockColumnasApi : {
  getColumnasByMapeo: (mapeoId: string | number) =>
    http.get(`/lineas/mapeos/${mapeoId}/columnas`),
  getColumnasCampana: () => api.getColumnasCampana()
}) as ApiClient

export const columnaService = {
  getColumnasByMapeo(mapeoId: string | number) {
    return apiClient.getColumnasByMapeo(mapeoId)
  },

  getColumnasCampana() {
    return apiClient.getColumnasCampana()
  }
}