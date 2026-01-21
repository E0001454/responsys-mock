import type { MapeoData } from '../types/mapeo'

export function delay(ms: number = 500): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function logRequest(method: string, endpoint: string, payload?: any) {
  console.log(`[${method}] ${endpoint}`)
  if (payload) {
    console.log('PAYLOAD:', JSON.stringify(payload, null, 2))
  }
}

const mockMapeosLineas: Record<number, MapeoData[]> = {
  0: [
    {
      idABCConfigMapeoLinea: 1,
      idABCCatLineaNegocio: 0,
      idABCUsuario: 1,
      nombre: 'Mapeo Línea Afore',
      descripcion: 'Mapeo principal de Afore',
      bolActivo: 1,
      bolDictaminacion: false
    }
  ],
  1: [
    {
      idABCConfigMapeoLinea: 2,
      idABCCatLineaNegocio: 1,
      idABCUsuario: 1,
      nombre: 'Mapeo Línea Sofom',
      descripcion: 'Mapeo principal de sofom',
      bolActivo: 1,
      bolDictaminacion: false
    }
  ],
  2: [
    {
      idABCConfigMapeoLinea: 3,
      idABCCatLineaNegocio: 2,
      idABCUsuario: 1,
      nombre: 'Mapeo Línea Seguros',
      descripcion: 'Mapeo principal de Seguros',
      bolActivo: 1,
      bolDictaminacion: false
    }
  ]
}

const mockMapeosCampanas: Record<string, MapeoData[]> = {
  '0_0': [
    {
      idABCConfigMapeoLinea: 10,
      idABCConfigMapeoCampana: 0,
      idABCCatLineaNegocio: 0,
      idABCUsuario: 1,
      nombre: 'Mapeo Campaña 0',
      descripcion: 'Mapeo específico de campaña',
      bolActivo: 1,
      bolDictaminacion: false
    }
  ],
  '0_1': [
    {
      idABCConfigMapeoLinea: 11,
      idABCConfigMapeoCampana: 1,
      idABCCatLineaNegocio: 0,
      idABCUsuario: 1,
      nombre: 'Mapeo Campaña 1',
      descripcion: 'Mapeo específico de campaña',
      bolActivo: 1,
      bolDictaminacion: false
    }
  ]
}

let mapeoIdCounter = 3

export const mockApi = {
  async getAllMapeos(): Promise<MapeoData[]> {
    await delay()
    logRequest('GET', '/lineas/0/mapeos')
    const lineas = Object.values(mockMapeosLineas).flat()
    const campanas = Object.values(mockMapeosCampanas).flat()
    return [...lineas, ...campanas]
  },

  async getMapeosByLinea(lineaId: string | number): Promise<MapeoData[]> {
    await delay()
    logRequest('GET', `/lineas/${lineaId}/mapeos`)
    return mockMapeosLineas[Number(lineaId)] ?? []
  },

  async getMapeosByCampana(
    lineaId: string | number,
    campanaId: string | number
  ): Promise<MapeoData[]> {
    await delay()
    logRequest('GET', `/lineas/${lineaId}/campanas/${campanaId}/mapeos`)
    return mockMapeosCampanas[`${lineaId}_${campanaId}`] ?? []
  },

  async createMapeoLinea(
    lineaId: string | number,
    payload: any
  ): Promise<MapeoData> {
    await delay()
    logRequest('POST', `/lineas/${lineaId}/mapeos`, payload)

    const m: MapeoData = {
      idABCConfigMapeoLinea: mapeoIdCounter++,
      idABCCatLineaNegocio: Number(lineaId),
      idABCUsuario: payload.idABCUsuario ?? 1,
      nombre: payload.mapeo.nombre,
      descripcion: payload.mapeo.descripcion,
      bolActivo: 1,
      bolDictaminacion: false
    }

    const lineaKey = Number(lineaId)
    mockMapeosLineas[lineaKey] ??= []
    mockMapeosLineas[lineaKey].push(m)

    return m
  },

  async createMapeoCampana(
    lineaId: string | number,
    campanaId: string | number,
    payload: any
  ): Promise<MapeoData> {
    await delay()
    logRequest(
      'POST',
      `/lineas/${lineaId}/campanas/${campanaId}/mapeos`,
      payload
    )

    const key = `${lineaId}_${campanaId}`

    const m: MapeoData = {
      idABCConfigMapeoLinea: mapeoIdCounter++,
      idABCConfigMapeoCampana: Number(campanaId),
      idABCCatLineaNegocio: Number(lineaId),
      idABCUsuario: payload.idABCUsuario ?? 1,
      nombre: payload.mapeo.nombre,
      descripcion: payload.mapeo.descripcion,
      bolActivo: 1,
      bolDictaminacion: false
    }

    mockMapeosCampanas[key] ??= []
    mockMapeosCampanas[key].push(m)
    return m
  },

  async updateMapeoLinea(payload: any): Promise<MapeoData> {
    await delay()
    logRequest('PUT', '/linea/mapeos', payload)

    const { idABCConfigMapeoLinea, idABCCatLineaNegocio, id, id_linea, nombre, descripcion } = payload.mapeos
    const lineaKey = Number(idABCCatLineaNegocio ?? id_linea)

    const list = mockMapeosLineas[lineaKey]
    if (!list) throw new Error('Línea no encontrada')

    const mapeoId = Number(idABCConfigMapeoLinea ?? id)
    const m = list.find(x => x.idABCConfigMapeoLinea === mapeoId)
    if (!m) throw new Error('Mapeo no encontrado')

    m.nombre = nombre
    m.descripcion = descripcion

    return m
  },

  async updateMapeoCampana(payload: any): Promise<MapeoData> {
    await delay()
    logRequest('PUT', '/linea/campana/mapeos', payload)

    const { id, idABCConfigMapeoLinea, idABCCatLineaNegocio, idABCConfigMapeoCampana, id_linea, id_campana, nombre, descripcion } = payload.mapeos
    const lineaKey = Number(idABCCatLineaNegocio ?? id_linea)
    const campanaKey = Number(idABCConfigMapeoCampana ?? id_campana)
    const key = `${lineaKey}_${campanaKey}`

    const list = mockMapeosCampanas[key]
    if (!list) throw new Error('Campaña no encontrada')

    const mapeoId = Number(idABCConfigMapeoLinea ?? id)
    const m = list.find(x => x.idABCConfigMapeoLinea === mapeoId)
    if (!m) throw new Error('Mapeo no encontrado')

    m.nombre = nombre
    m.descripcion = descripcion

    return m
  },

  async deleteMapeoLinea(
    lineaId: string | number,
    mapeoId: string | number
  ): Promise<void> {
    await delay()
    logRequest('DELETE', `/lineas/${lineaId}/mapeos/${mapeoId}`)

    const key = Number(lineaId)
    if (mockMapeosLineas[key]) {
      mockMapeosLineas[key] = mockMapeosLineas[key].filter(
        m => m.idABCConfigMapeoLinea !== Number(mapeoId)
      )
    }
  },

  async deleteMapeoCampana(
    lineaId: string | number,
    campanaId: string | number,
    mapeoId: string | number
  ): Promise<void> {
    await delay()
    logRequest(
      'DELETE',
      `/lineas/${lineaId}/campanas/${campanaId}/mapeos/${mapeoId}`
    )

    const key = `${lineaId}_${campanaId}`
    if (mockMapeosCampanas[key]) {
      mockMapeosCampanas[key] = mockMapeosCampanas[key].filter(
        m => m.idABCConfigMapeoLinea !== Number(mapeoId)
      )
    }
  },

  async patchActivarMapeoLinea(payload: any): Promise<MapeoData> {
    await delay()
    logRequest('PATCH', '/linea/mapeos/activar', payload)

    const id = payload.mapeo.id

    for (const list of Object.values(mockMapeosLineas)) {
      const m = list.find(x => x.idABCConfigMapeoLinea === id)
      if (m) {
        m.bolActivo = m.bolActivo === 1 ? 0 : 1
        return m
      }
    }

    throw new Error('Mapeo no encontrado')
  },

  async patchDesactivarMapeoLinea(payload: any): Promise<MapeoData> {
    await delay()
    logRequest('PATCH', '/linea/mapeos/desactivar', payload)

    const id = payload.mapeo.id

    for (const list of Object.values(mockMapeosLineas)) {
      const m = list.find(x => x.idABCConfigMapeoLinea === id)
      if (m) {
        m.bolActivo = 0
        return m
      }
    }

    throw new Error('Mapeo no encontrado')
  },

  async patchActivarMapeoCampana(payload: any): Promise<MapeoData> {
    await delay()
    logRequest('PATCH', '/linea/campana/mapeos/activar', payload)

    const id = payload.mapeo.id

    for (const list of Object.values(mockMapeosCampanas)) {
      const m = list.find(x => x.idABCConfigMapeoLinea === id)
      if (m) {
        m.bolActivo = m.bolActivo === 1 ? 0 : 1
        return m
      }
    }

    throw new Error('Mapeo no encontrado')
  },

  async patchDesactivarMapeoCampana(payload: any): Promise<MapeoData> {
    await delay()
    logRequest('PATCH', '/linea/campana/mapeos/desactivar', payload)

    const id = payload.mapeo.id

    for (const list of Object.values(mockMapeosCampanas)) {
      const m = list.find(x => x.idABCConfigMapeoLinea === id)
      if (m) {
        m.bolActivo = 0
        return m
      }
    }

    throw new Error('Mapeo no encontrado')
  },
  
  async getLineas() {
    return []
  },
  async getLineaById() {
    return {} as any
  },
  async getCampanasByLinea() {
    return []
  },
  async getCampanaById() {
    return {} as any
  }
}