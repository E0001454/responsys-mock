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

function normalizeMapeo(item: any): MapeoData {
  const base: MapeoData = {
    idABCConfigMapeoLinea: Number(
      item?.idABCConfigMapeoLinea ?? item?.id ?? item?.id_mapeo ?? 0
    ),
    idABCCatLineaNegocio: Number(
      item?.idABCCatLineaNegocio ?? item?.id_linea ?? item?.idLinea ?? 0
    ),
    idABCUsuario: Number(item?.idABCUsuario ?? item?.id_usuario ?? 1),
    nombre: item?.nombre ?? '',
    descripcion: item?.descripcion ?? '',
    bolActivo: (item?.bolActivo ?? item?.status ?? 0) as 0 | 1,
    bolDictaminacion: Boolean(item?.bolDictaminacion ?? item?.dictaminacion ?? false)
  }

  if (item?.idABCConfigMapeoCampana !== undefined && item?.idABCConfigMapeoCampana !== null) {
    base.idABCConfigMapeoCampana = Number(item.idABCConfigMapeoCampana)
  } else if (item?.id_campana !== undefined && item?.id_campana !== null) {
    base.idABCConfigMapeoCampana = Number(item.id_campana)
  }

  return base
}

function normalizeMapeos(data: any): MapeoData[] {
  const list = Array.isArray(data) ? data : data?.data ?? []
  return list.map(normalizeMapeo)
}

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
      return apiClient.getMapeosByCampana(lineaId, campanaId).then(normalizeMapeos)
    }
    return apiClient.getMapeosByLinea(lineaId).then(normalizeMapeos)
  },

  getAllMapeos() {
    return apiClient.getAllMapeos().then(res => {
      console.log('[mapeoService] getAllMapeos raw:', res)
      return normalizeMapeos(res)
    })
  },

  createMapeo(lineaId: string | number, payload: any, campanaId?: string | number) {
    const normalized = {
      ...payload,
      idABCUsuario: payload.idABCUsuario ?? payload.idUsuario ?? 1,
      idUsuario: payload.idUsuario ?? payload.idABCUsuario ?? payload.idUsuario ?? 1,
      mapeo: payload.mapeo ?? payload.mapeos ?? {}
    }

    if (campanaId !== undefined) {
      return apiClient.createMapeoCampana(lineaId, campanaId, normalized)
    }
    return apiClient.createMapeoLinea(lineaId, normalized)
  },

  updateMapeo(payload: any) {
    const mapeoData = payload.mapeos ?? payload.mapeo ?? {}

    const normalized = {
      ...payload,
      mapeos: mapeoData,
      mapeo: mapeoData,
      idABCUsuario: payload.idABCUsuario ?? payload.idUsuario ?? 1,
      idUsuario: payload.idUsuario ?? payload.idABCUsuario ?? 1
    }

    const isCampana =
      mapeoData.id_campana !== undefined || mapeoData.idABCConfigMapeoCampana !== undefined

    if (isCampana) {
      return apiClient.updateMapeoCampana(normalized)
    }

    return apiClient.updateMapeoLinea(normalized)
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