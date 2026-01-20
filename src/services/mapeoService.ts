import { api } from './api'
import { mockApi } from './mockData'
import type { Linea, Campana, MapeoData } from '../types/mapeo'

interface ApiClient {
  getLineas(): Promise<Linea[]>
  getLineaById(id: string | number): Promise<Linea>
  getCampanasByLinea(lineaId: string | number): Promise<Campana[]>
  getCampanaById(lineaId: string | number, campanaId: string | number): Promise<Campana>

  getMapeosByLinea(lineaId: string | number): Promise<MapeoData[]>
  getMapeosByCampana(lineaId: string | number, campanaId: string | number): Promise<MapeoData[]>
  getAllMapeos(): Promise<MapeoData[]>

  createMapeoLinea(lineaId: string | number, payload: any): Promise<MapeoData>
  createMapeoCampana(lineaId: string | number, campanaId: string | number, payload: any): Promise<MapeoData>

  updateMapeoLinea(payload: any): Promise<MapeoData>
  updateMapeoCampana(payload: any): Promise<MapeoData>

  deleteMapeoLinea(lineaId: string | number, mapeoId: string | number): Promise<void>
  deleteMapeoCampana(lineaId: string | number, campanaId: string | number, mapeoId: string | number): Promise<void>

  patchActivarMapeoLinea(payload: any): Promise<MapeoData>
  patchDesactivarMapeoLinea(payload: any): Promise<MapeoData>
  patchActivarMapeoCampana(payload: any): Promise<MapeoData>
  patchDesactivarMapeoCampana(payload: any): Promise<MapeoData>
}

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'
const apiClient = (USE_MOCK ? mockApi : api) as ApiClient

export const mapeoService = {
  getLineas() {
    return apiClient.getLineas()
  },

  getLineaById(id: string | number) {
    return apiClient.getLineaById(id)
  },

  getCampanasByLinea(lineaId: string | number) {
    return apiClient.getCampanasByLinea(lineaId)
  },

  getCampanaById(lineaId: string | number, campanaId: string | number) {
    return apiClient.getCampanaById(lineaId, campanaId)
  },

  getMapeos(lineaId: string | number, campanaId?: string | number) {
    if (campanaId !== undefined) {
      return apiClient.getMapeosByCampana(lineaId, campanaId)
    }
    return apiClient.getMapeosByLinea(lineaId)
  },

  getAllMapeos() {
    return apiClient.getAllMapeos()
  },

  createMapeo(lineaId: string | number, payload: any, campanaId?: string | number) {
    if (campanaId !== undefined) {
      return apiClient.createMapeoCampana(lineaId, campanaId, payload)
    }
    return apiClient.createMapeoLinea(lineaId, payload)
  },

  updateMapeo(payload: any) {
    if (payload.mapeos.id_campana !== undefined) {
      return apiClient.updateMapeoCampana(payload)
    }
    return apiClient.updateMapeoLinea(payload)
  },

  deleteMapeo(lineaId: string | number, mapeoId: string | number, campanaId?: string | number) {
    if (campanaId !== undefined) {
      return apiClient.deleteMapeoCampana(lineaId, campanaId, mapeoId)
    }
    return apiClient.deleteMapeoLinea(lineaId, mapeoId)
  },

  patchActivarMapeoLinea(mapeoId: number, idUsuario: number) {
    return apiClient.patchActivarMapeoLinea({
      mapeo: { id: mapeoId },
      idUsuario
    })
  },

  patchDesactivarMapeoLinea(mapeoId: number, idUsuario: number) {
    return apiClient.patchDesactivarMapeoLinea({
      mapeo: { id: mapeoId },
      idUsuario
    })
  },

  patchActivarMapeoCampana(mapeoId: number, idUsuario: number) {
    return apiClient.patchActivarMapeoCampana({
      mapeo: { id: mapeoId },
      idUsuario
    })
  },

  patchDesactivarMapeoCampana(mapeoId: number, idUsuario: number) {
    return apiClient.patchDesactivarMapeoCampana({
      mapeo: { id: mapeoId },
      idUsuario
    })
  }
}