import type {
  CreateColumnaLineaPayload,
  PatchColumnaLineaPayload,
  UpdateColumnaLineaPayload,
  PatchColumnaCampanaPayload,
  UpdateColumnaCampanaPayload,
  CreateColumnaCampanaPayload
} from '../types/columnas/columna'
import type { BitacoraPayload } from '../types/bitacora'
import { addToast } from '@/stores/toastStore'

type ApiService =
  | 'catalogos'
  | 'mapeos_linea'
  | 'mapeos_campana'
  | 'tareas_linea'
  | 'tareas_campana'
  | 'columnas_linea'
  | 'columnas_campana'
  | 'bitacora'
  | 'horarios_linea'
  | 'horarios_campana'
  | 'monitor_linea'
  | 'monitor_campana'
  | 'reportes_linea'
  | 'reportes_campana'
  | 'reportes_abc_linea'
  | 'reportes_abc_campana'
  | 'reportes_responsys_linea'
  | 'reportes_responsys_campana'
  | 'default'

const GLOBAL_USE_MOCK = String(import.meta.env.VITE_USE_MOCK ?? 'false').toLowerCase() === 'true'
const API_BASE_URL_REAL = import.meta.env.VITE_API_URL_REAL
  || 'http://localhost:3000/api'
const API_BASE_URL_MOCK = import.meta.env.VITE_API_URL_MOCK
  || 'http://localhost:3100/api'

function parseEnvBoolean(value: unknown): boolean | undefined {
  if (value === undefined || value === null || value === '') return undefined
  const normalized = String(value).trim().toLowerCase()
  if (normalized === 'true' || normalized === '1' || normalized === 'yes') return true
  if (normalized === 'false' || normalized === '0' || normalized === 'no') return false
  return undefined
}

function getEndpointService(endpoint: string): ApiService {
  const path = String(endpoint || '').toLowerCase()

  const isLineasMapeos = /^\/lineas(?:\/[^/]+)?\/mapeos(?:\/|$)/.test(path)
  const isLineasMapeosColumnas = /^\/lineas\/mapeos(?:\/[^/]+)?\/columnas(?:\/|$)/.test(path)
  const isLineasCampanasMapeos = /^\/lineas\/[^/]+\/campanas\/[^/]+\/mapeos(?:\/|$)/.test(path)
  const isLineasActividades = /^\/lineas(?:\/[^/]+)?\/actividades(?:\/|$)/.test(path)
  const isLineasCampanasActividades = /^\/lineas\/[^/]+\/campanas\/[^/]+\/actividades(?:\/|$)/.test(path)
  const isLineasHorarios = /^\/lineas(?:\/[^/]+)?\/actividades\/[^/]+\/horarios(?:\/|$)/.test(path)

  if (path.includes('/bitacoras')) return 'bitacora'
  if (path.includes('/catalogos')) return 'catalogos'

  // Reportes — envío
  if (path.includes('/pet/individual/envio')) return 'reportes_responsys_campana'
  if (path.includes('/cl/individual/envio')) return 'reportes_responsys_linea'
  // Reportes — validación
  if (path.includes('/pet/individual/validacion')) return 'reportes_abc_campana'
  if (path.includes('/cl/individual/validacion')) return 'reportes_abc_linea'
  // Reportes — carga (default reportes)
  if (path.includes('/pet/individual')) return 'reportes_campana'
  if (path.includes('/cl/individual')) return 'reportes_linea'

  if (path.includes('/lineas/campanas/tareas')) return 'monitor_campana'
  if (path.includes('/lineas/tareas')) return 'monitor_linea'

  if (isLineasHorarios || (path.includes('/lineas/actividades/') && path.includes('/horarios'))) return 'horarios_linea'
  if (path.includes('/campanas/actividades/') && path.includes('/horarios')) return 'horarios_campana'

  if ((path.includes('/campanas/mapeos') && path.includes('/columnas'))) return 'columnas_campana'
  if ((path.includes('/lineas/mapeos') && path.includes('/columnas')) || isLineasMapeosColumnas) return 'columnas_linea'

  if (path.includes('/lineas/campanas/mapeos') || isLineasCampanasMapeos) return 'mapeos_campana'
  if (path.includes('/lineas/mapeos') || isLineasMapeos) return 'mapeos_linea'

  if (path.includes('/lineas/campanas/actividades') || isLineasCampanasActividades) return 'tareas_campana'
  if (path.includes('/lineas/actividades') || isLineasActividades) return 'tareas_linea'

  return 'default'
}

const SERVICE_SUFFIX: Record<ApiService, string> = {
  catalogos: 'CATALOGOS',
  mapeos_linea: 'MAPEOS_LINEA',
  mapeos_campana: 'MAPEOS_CAMPANA',
  tareas_linea: 'TAREAS_LINEA',
  tareas_campana: 'TAREAS_CAMPANA',
  columnas_linea: 'COLUMNAS_LINEA',
  columnas_campana: 'COLUMNAS_CAMPANA',
  bitacora: 'BITACORA',
  horarios_linea: 'HORARIOS_LINEA',
  horarios_campana: 'HORARIOS_CAMPANA',
  monitor_linea: 'MONITOR_LINEA',
  monitor_campana: 'MONITOR_CAMPANA',
  reportes_linea: 'REPORTES_LINEA',
  reportes_campana: 'REPORTES_CAMPANA',
  reportes_abc_linea: 'REPORTES_ABC_LINEA',
  reportes_abc_campana: 'REPORTES_ABC_CAMPANA',
  reportes_responsys_linea: 'REPORTES_RESPONSYS_LINEA',
  reportes_responsys_campana: 'REPORTES_RESPONSYS_CAMPANA',
  default: 'DEFAULT'
}

function shouldUseMockByService(service: ApiService): boolean {
  const envObj = import.meta.env as Record<string, unknown>
  const suffix = SERVICE_SUFFIX[service]

  const specific = parseEnvBoolean(envObj[`VITE_MS_${suffix}_USE_MOCK`])
  if (specific !== undefined) return specific

  return GLOBAL_USE_MOCK
}

function resolveBaseByService(service: ApiService, useMock: boolean): string {
  const envObj = import.meta.env as Record<string, unknown>
  const suffix = SERVICE_SUFFIX[service]

  const specific = String(
    envObj[useMock ? `VITE_MS_${suffix}_MOCK` : `VITE_MS_${suffix}_REAL`] ?? ''
  ).trim()

  if (specific) return specific
  return useMock ? API_BASE_URL_MOCK : API_BASE_URL_REAL
}

function resolveBaseUrl(endpoint: string): string {
  const service = getEndpointService(endpoint)
  const useMock = shouldUseMockByService(service)
  return resolveBaseByService(service, useMock)
}
const _shownLoadedToasts = new Set<string>()

function getBrowserInfo() {
  if (typeof navigator === 'undefined') {
    return { name: 'unknown', version: 'unknown', ua: 'unknown' }
  }

  const ua = navigator.userAgent
  const edge = /Edg\/([\d.]+)/.exec(ua)
  const chrome = /Chrome\/([\d.]+)/.exec(ua)
  const firefox = /Firefox\/([\d.]+)/.exec(ua)
  const safari = /Version\/([\d.]+).*Safari/.exec(ua)

  if (edge) return { name: 'Edge', version: edge[1], ua }
  if (chrome) return { name: 'Chrome', version: chrome[1], ua }
  if (firefox) return { name: 'Firefox', version: firefox[1], ua }
  if (safari) return { name: 'Safari', version: safari[1], ua }

  return { name: 'unknown', version: 'unknown', ua }
}

async function getClientIp(): Promise<string> {
    return '0.0.0.0'
}

async function getClientMac(): Promise<string> {
  return 'No permitido'
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${resolveBaseUrl(endpoint)}${endpoint}`

  const incomingHeaders = (options.headers ?? {}) as Record<string, string>
  const hasBody = options.body !== undefined && options.body !== null
  const hasExplicitContentType =
    Object.prototype.hasOwnProperty.call(incomingHeaders, 'Content-Type')
    || Object.prototype.hasOwnProperty.call(incomingHeaders, 'content-type')

  const headers = {
    ...(hasBody && !hasExplicitContentType ? { 'Content-Type': 'application/json' } : {}),
    'Accept': 'application/json, text/plain, */*',
    'ngrok-skip-browser-warning': 'true',
    ...incomingHeaders
  }

  const endpointLower = String(endpoint || '').toLowerCase()
  const isBitacoraEndpoint = endpointLower.includes('/bitacoras/eventos') || endpointLower.includes('/bitacoras')
  const suppressToast = ((): boolean => {
    const raw = (headers as any)['X-Suppress-Toast'] ?? (headers as any)['x-suppress-toast']
    return String(raw ?? '').toLowerCase() === 'true' || isBitacoraEndpoint
  })()

  let response: Response
  try {
    response = await fetch(url, {
      ...options,
      headers
    })
  } catch (err) {
    if (!suppressToast) addToast('Error de red: no se pudo conectar al servidor', 'error')
    throw err
  }

  const status = response.status
  const method = (options.method || 'GET').toUpperCase()

  const text = await response.text()
  let data: any = undefined
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = text
    }
  }

    if (response.ok) {
      const path = endpointLower
    if (method === 'GET') {
      if (!suppressToast && (path.includes('/mapeos') || path.includes('/columnas'))) {
        if (!_shownLoadedToasts.has(path)) {
          addToast('Datos cargados correctamente', 'info')
          _shownLoadedToasts.add(path)
        }
      }
    } else if (method === 'POST') {
      if (!suppressToast && !isBitacoraEndpoint) addToast('Recurso creado correctamente', 'success')
    } else if (method === 'PUT' || method === 'PATCH') {
      if (!suppressToast && !isBitacoraEndpoint) addToast('Recurso actualizado correctamente', 'success')
    } else if (method === 'DELETE') {
      if (!suppressToast && !isBitacoraEndpoint) addToast('Recurso eliminado correctamente', 'success')
    }

    return data as T
  }

  let message = `Error ${status}`
  switch (status) {
    case 400:
      message = 'Solicitud inválida (400)'
      break
    case 401:
      message = 'No autorizado (401)'
      break
    case 403:
      message = 'Prohibido (403)'
      break
    case 404:
      message = 'No encontrado (404)'
      break
    case 429:
      message = 'Demasiadas solicitudes (429). Intenta más tarde.'
      break
    case 500:
      message = 'Error interno del servidor (500)'
      break
    default:
      message = data && data.message ? String(data.message) : `${status} ${response.statusText}`
  }

  if (!((options.headers as any)?.['X-Suppress-Toast'] === 'true' || (options.headers as any)?.['x-suppress-toast'] === 'true' || suppressToast)) {
    addToast(message, 'error')
  }
  const err = new Error(message)
  ;(err as any).status = status
  ;(err as any).response = response
  throw err
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
  getCatalogos: () => http.get('/catalogos'),

  getAllMapeos: () => http.get('/lineas/mapeos'),
  getMapeosByLinea: (lineaId: string | number) =>
    http.get(`/lineas/${lineaId}/mapeos`),
  createMapeoLinea: (lineaId: string | number, payload: any) =>
    http.post(`/lineas/${lineaId}/mapeos`, payload),
  updateMapeoLinea: (payload: any) => http.put('/lineas/mapeos', payload),
  deleteMapeoLinea: (lineaId: string | number, mapeoId: string | number) =>
    http.delete(`/lineas/${lineaId}/mapeos/${mapeoId}`),
  patchActivarMapeoLinea: (payload: any) =>
    http.patch('/lineas/mapeos/activar', payload),
  patchDesactivarMapeoLinea: (payload: any) =>
    http.patch('/lineas/mapeos/desactivar', payload),

  getMapeosCampana: () => http.get('/lineas/campanas/mapeos'),
  createMapeoCampana: (
    lineaId: string | number,
    campanaId: string | number,
    payload: any
  ) => http.post(`/lineas/${lineaId}/campanas/${campanaId}/mapeos`, payload),
  updateMapeoCampana: (payload: any) => {
    const mapeoId = payload?.mapeo?.id ?? payload?.mapeo?.idABCConfigMapeoLinea ?? payload?.mapeo?.idABCConfigMapeoCampana
    const endpoint = mapeoId
      ? `/lineas/campanas/mapeos`
      : '/lineas/campanas/mapeos'
    return http.put(endpoint, payload)
  },
  
  patchActivarMapeoCampana: (payload: any) =>
    http.patch('/lineas/campanas/mapeos/activar', payload),
  patchDesactivarMapeoCampana: (payload: any) =>
    http.patch('/lineas/campanas/mapeos/desactivar', payload),

  getTareasLinea: () => http.get('/lineas/actividades'),
  getTareasLineaByLinea: (lineaId: string | number) =>
    http.get(`/lineas/${lineaId}/actividades`),
  createTareaLinea: (lineaId: string | number, payload: any) =>
    request(`/lineas/${lineaId}/actividades`, {
      method: 'POST',
      headers: { 'X-Suppress-Toast': 'true' },
      body: JSON.stringify(payload)
    }),
  updateTareaLinea: (payload: any) => request('/lineas/actividades', {
    method: 'PUT',
    headers: { 'X-Suppress-Toast': 'true' },
    body: JSON.stringify(payload)
  }),
  deleteTareaLinea: (lineaId: string | number, tareaId: string | number) =>
    http.delete(`/lineas/${lineaId}/actividades/${tareaId}`),
  patchActivarTareaLinea: (payload: any) =>
    request('/lineas/actividades/activar', {
      method: 'PATCH',
      headers: { 'X-Suppress-Toast': 'true' },
      body: JSON.stringify(payload)
    }),
  patchDesactivarTareaLinea: (payload: any) =>
    request('/lineas/actividades/desactivar', {
      method: 'PATCH',
      headers: { 'X-Suppress-Toast': 'true' },
      body: JSON.stringify(payload)
    }),
  getHorariosTareaLinea: (tareaId: string | number) =>
    http.get(`/lineas/actividades/${tareaId}/horarios`),
  postHorariosTareaLinea: (tareaId: string | number, payload: any) =>
    request(`/lineas/actividades/${tareaId}/horarios`, {
      method: 'POST',
      headers: { 'X-Suppress-Toast': 'true' },
      body: JSON.stringify(payload)
    }),
  patchActivarHorarioTareaLinea: (tareaId: string | number, payload: any) =>
    request(`/lineas/actividades/${tareaId}/horarios/activar`, {
      method: 'PATCH',
      headers: { 'X-Suppress-Toast': 'true' },
      body: JSON.stringify(payload)
    }),
  patchDesactivarHorarioTareaLinea: (tareaId: string | number, payload: any) =>
    request(`/lineas/actividades/${tareaId}/horarios/desactivar`, {
      method: 'PATCH',
      headers: { 'X-Suppress-Toast': 'true' },
      body: JSON.stringify(payload)
    }),

  getTareasCampana: () => http.get('/lineas/campanas/actividades'),
  getTareasCampanaByLineaCampana: (lineaId: string | number, campanaId: string | number) =>
    http.get(`/lineas/${lineaId}/campanas/${campanaId}/actividades`),
  createTareaCampana: (lineaId: string | number, campanaId: string | number, payload: any) =>
    request(`/lineas/${lineaId}/campanas/${campanaId}/actividades`, {
      method: 'POST',
      headers: { 'X-Suppress-Toast': 'true' },
      body: JSON.stringify(payload)
    }),
  updateTareaCampana: (payload: any) => request('/lineas/campanas/actividades', {
    method: 'PUT',
    headers: { 'X-Suppress-Toast': 'true' },
    body: JSON.stringify(payload)
  }),
  deleteTareaCampana: (lineaId: string | number, campanaId: string | number, tareaId: string | number) =>
    http.delete(`/lineas/${lineaId}/campanas/${campanaId}/actividades/${tareaId}`),
  patchActivarTareaCampana: (payload: any) =>
    request('/lineas/campanas/actividades/activar', {
      method: 'PATCH',
      headers: { 'X-Suppress-Toast': 'true' },
      body: JSON.stringify(payload)
    }),
  patchDesactivarTareaCampana: (payload: any) =>
    request('/lineas/campanas/actividades/desactivar', {
      method: 'PATCH',
      headers: { 'X-Suppress-Toast': 'true' },
      body: JSON.stringify(payload)
    }),
  getHorariosTareaCampana: (tareaId: string | number) =>
    http.get(`/campanas/actividades/${tareaId}/horarios`),
  postHorariosTareaCampana: (tareaId: string | number, payload: any) =>
    request(`/campanas/actividades/${tareaId}/horarios`, {
      method: 'POST',
      headers: { 'X-Suppress-Toast': 'true' },
      body: JSON.stringify(payload)
    }),
  patchActivarHorarioTareaCampana: (tareaId: string | number, payload: any) =>
    request(`/campanas/actividades/${tareaId}/horarios/activar`, {
      method: 'PATCH',
      headers: { 'X-Suppress-Toast': 'true' },
      body: JSON.stringify(payload)
    }),
  patchDesactivarHorarioTareaCampana: (tareaId: string | number, payload: any) =>
    request(`/campanas/actividades/${tareaId}/horarios/desactivar`, {
      method: 'PATCH',
      headers: { 'X-Suppress-Toast': 'true' },
      body: JSON.stringify(payload)
    }),

  getTareasMonitorLinea: () => http.get('/lineas/tareas'),
  getTareasMonitorCampana: () => http.get('/lineas/campanas/tareas'),
  patchActivarTareaMonitorLinea: (payload: any) =>
    http.patch('/lineas/tareas/activar', payload),
  patchDesactivarTareaMonitorLinea: (payload: any) =>
    http.patch('/lineas/tareas/desactivar', payload),
  patchActivarTareaMonitorCampana: (payload: any) =>
    http.patch('/lineas/campanas/tareas/activar', payload),
  patchDesactivarTareaMonitorCampana: (payload: any) =>
    http.patch('/lineas/campanas/tareas/desactivar', payload),

  getColumnasLinea: () => http.get('/lineas/mapeos/0/columnas'),
  getColumnasByMapeo: (mapeoId: string | number) =>
    http.get(`/lineas/mapeos/${mapeoId}/columnas`),
  createColumnaLinea: (
    mapeoId: string | number,
    payload: CreateColumnaLineaPayload
  ) => http.post(`/lineas/mapeos/${mapeoId}/columnas`, payload),
  updateColumnaLinea: (mapeoId: string | number | undefined, payload: UpdateColumnaLineaPayload) => {
    const endpoint = mapeoId ? `/lineas/mapeos/${mapeoId}/columnas` : '/lineas/mapeos/columnas'
    return http.put(endpoint, payload)
  },
  patchActivarColumnaLinea: (mapeoId: string | number, payload: PatchColumnaLineaPayload) =>
    http.patch(`/lineas/mapeos/${mapeoId}/columnas/activar`, payload),
  patchDesactivarColumnaLinea: (mapeoId: string | number, payload: PatchColumnaLineaPayload) =>
    http.patch(`/lineas/mapeos/${mapeoId}/columnas/desactivar`, payload),

  getColumnasCampana: () => http.get('/campanas/mapeos/0/columnas'),
  getColumnasCampanaByMapeo: (mapeoId: string | number) =>
    http.get(`/campanas/mapeos/${mapeoId}/columnas`),
  createColumnaCampanaGlobal: (payload: any) => http.post('/campanas/mapeos/0/columnas', payload),
  createColumnaCampana: (
    mapeoId: string | number,
    payload: CreateColumnaCampanaPayload
  ) => http.post(`/campanas/mapeos/${mapeoId}/columnas`, payload),
  updateColumnaCampana: (mapeoId: string | number | undefined, payload: UpdateColumnaCampanaPayload) => {
    const endpoint = mapeoId ? `/campanas/mapeos/${mapeoId}/columnas` : '/campanas/mapeos/columnas'
    return http.put(endpoint, payload)
  },
  patchActivarColumnaCampana: (mapeoId: string | number, payload: PatchColumnaCampanaPayload) =>
    http.patch(`/campanas/mapeos/${mapeoId}/columnas/activar`, payload),
  patchDesactivarColumnaCampana: (mapeoId: string | number, payload: PatchColumnaCampanaPayload) =>
    http.patch(`/campanas/mapeos/${mapeoId}/columnas/desactivar`, payload),

  getReporteCLCarga: (filtros: Record<string, string>) => {
    const p = new URLSearchParams(filtros)
    return http.get(`/cl/individual/carga?${p}`)
  },
  getReporteCLValidacion: (filtros: Record<string, string>) => {
    const p = new URLSearchParams(filtros)
    return http.get(`/cl/individual/validacion?${p}`)
  },
  getReportePETCarga: (filtros: Record<string, string>) => {
    const p = new URLSearchParams(filtros)
    return http.get(`/pet/individual/carga?${p}`)
  },
  getReportePETValidacion: (filtros: Record<string, string>) => {
    const p = new URLSearchParams(filtros)
    return http.get(`/pet/individual/validacion?${p}`)
  },
  getReporteCLEnvio: (filtros: Record<string, string>) => {
    const p = new URLSearchParams(filtros)
    return http.get(`/cl/individual/envio?${p}`)
  },
  getReportePETEnvio: (filtros: Record<string, string>) => {
    const p = new URLSearchParams(filtros)
    return http.get(`/pet/individual/envio?${p}`)
  }

  ,
  postBitacoraUsuario: (payload: BitacoraPayload) => http.post('/bitacoras/eventos', payload),
  postBitacoraByContext: async (
    method: 'POST' | 'PUT' | 'PATCH' | string,
    endpoint: string,
    resourcePayload: any = {},
    detalle?: string,
    idUsuario: number = 1,
    ip: string = '192.178.14.14',
    navegador: string = 'chrome'
  ) => {
    void resourcePayload
    const endpointStr = String(endpoint)
    const isColumnas = endpointStr.includes('/columnas')
    const isLineaColumnas = isColumnas && endpointStr.includes('/lineas/')
    const isCampanaColumnas = isColumnas && endpointStr.includes('/campanas/')

    const evento = isColumnas
      ? 1
      : (method === 'POST' ? 3 : method === 'PUT' || method === 'PATCH' ? 4 : 0)

    const objeto = isColumnas ? 1 : 2

    const browserInfo = getBrowserInfo()
    const mac = await getClientMac()
    const resolvedIp = ip || (await getClientIp())
    const browserName = browserInfo.name === 'Chrome' ? 'Google Chrome' : browserInfo.name
    const resolvedNavegador = navegador || browserName
    const resolvedDetalle = detalle
      ?? (isColumnas
        ? `${JSON.stringify({ navegador: { nombre: browserName, version: browserInfo.version } })}\n`
        : `${browserInfo.ua}, ${browserInfo.name}, ${browserInfo.version}, ${mac}`)

    const columnaId = Number(
      resourcePayload?.columna?.tipo?.id
      ?? resourcePayload?.columnaLinea?.id
      ?? resourcePayload?.columnaCampana?.id
      ?? 0
    )

    const payload: BitacoraPayload = {
      idUsuario: idUsuario,
      bitacora: {
        evento: { id: evento },
        objeto: { id: objeto },
        ...(isLineaColumnas && columnaId > 0 ? { columnaLinea: { id: columnaId } } : {}),
        ...(isCampanaColumnas && columnaId > 0 ? { columnaCampana: { id: columnaId } } : {}),
        detalle: resolvedDetalle,
        ip: resolvedIp,
        navegador: resolvedNavegador
      }
    }

    return request<any>('/bitacoras/eventos', {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: { 'X-Suppress-Toast': 'true' }
    })
  }
}