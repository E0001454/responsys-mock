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
      id: 1,
      id_linea: 0,
      nombre: 'Mapeo Línea 1',
      descripcion: 'Primer mapeo',
      status: 1
    }
  ]
}

const mockMapeosCampanas: Record<string, MapeoData[]> = {
  '0_0': [
    {
      id: 2,
      id_linea: 0,
      id_campana: 0,
      nombre: 'Mapeo Campaña 1',
      descripcion: 'Mapeo campaña',
      status: 1
    }
  ]
}

let mapeoIdCounter = 3

export const mockApi = {
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
        id: mapeoIdCounter++,
        id_linea: Number(lineaId),
        nombre: payload.mapeo.nombre,
        descripcion: payload.mapeo.descripcion,
        status: 1
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
      id: mapeoIdCounter++,
      id_linea: Number(lineaId),
      id_campana: Number(campanaId),
      nombre: payload.mapeo.nombre,
      descripcion: payload.mapeo.descripcion,
      status: 1
    }

    mockMapeosCampanas[key] ??= []
    mockMapeosCampanas[key].push(m)
    return m
  },

  async patchActivarMapeoLinea(payload: any): Promise<MapeoData> {
    await delay()
    logRequest('PATCH', '/linea/mapeos/activar', payload)

    const id = payload.mapeo.id

    for (const list of Object.values(mockMapeosLineas)) {
      const m = list.find(x => x.id === id)
      if (m) {
        m.status = m.status === 1 ? 0 : 1
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
      const m = list.find(x => x.id === id)
      if (m) {
        m.status = 0
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
      const m = list.find(x => x.id === id)
      if (m) {
        m.status = m.status === 1 ? 0 : 1
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
      const m = list.find(x => x.id === id)
      if (m) {
        m.status = 0
        return m
      }
    }

    throw new Error('Mapeo no encontrado')
    },

    async updateMapeoLinea(payload: any): Promise<MapeoData> {
    await delay()
    logRequest('PUT', '/linea/mapeos', payload)

    const { id, id_linea, nombre, descripcion } = payload.mapeos

    const list = mockMapeosLineas[id_linea]
    if (!list) throw new Error('Línea no encontrada')

    const m = list.find(x => x.id === id)
    if (!m) throw new Error('Mapeo no encontrado')

    m.nombre = nombre
    m.descripcion = descripcion

    return m
    },

    async updateMapeoCampana(payload: any): Promise<MapeoData> {
    await delay()
    logRequest('PUT', '/linea/campana/mapeos', payload)

    const { id, id_linea, id_campana, nombre, descripcion } = payload.mapeos
    const key = `${id_linea}_${id_campana}`

    const list = mockMapeosCampanas[key]
    if (!list) throw new Error('Campaña no encontrada')

    const m = list.find(x => x.id === id)
    if (!m) throw new Error('Mapeo no encontrado')

    m.nombre = nombre
    m.descripcion = descripcion

    return m
    }


}