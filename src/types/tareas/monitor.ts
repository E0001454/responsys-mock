export type MonitorScope = 'linea' | 'campana'

export type MonitorActividadCode = 'CARGA' | 'VALIDACION' | 'ENVIO'

export type MonitorStatusCode = 'PLN' | 'EJC' | 'APB' | 'CMP' | 'ERR' | 'DCT' | 'BLQ' | 'CNC'

export type MonitorExecutionMode = 'AUTOMATICA' | 'MANUAL' | 'HIBRIDA'

export interface MonitorCatalogRef {
  id?: number
  codigo: string
  nombre?: string
}

export interface MonitorExecutionRef extends MonitorCatalogRef {
  modo: MonitorExecutionMode
}

export interface MonitorStatusHistoryItem extends MonitorCatalogRef {
  fechaCreacion?: string
  detalle?: string | null
}

export interface TareaMonitorBase {
  id: number
  scope: MonitorScope
  pipelineId: string
  idABCCatLineaNegocio: number
  idABCCatCampana?: number
  idABCConfigMapeo: number
  nombreMapeo: string
  actividad: MonitorCatalogRef
  estatus: MonitorCatalogRef
  estatusHistorial?: MonitorStatusHistoryItem[]
  ejecucion: MonitorExecutionRef
  etapaIndex: number
  horarioDiaId?: number
  horarioHoraId?: number
  horarioProgramado: string
  fechaCreacion: string
  fechaInicio: string
  fechaFin: string
  fechaAprobada?: string
  fechaDictaminacion?: string
  fechaUltimaModificacion: string
  numeroRegistros: number
  numeroRegistrosProcesados: number
  dictaminacionRequerida: boolean
  dictaminado: boolean
  error?: { nombre: string; codigo: string; detalle: string }
}

export interface TareaMonitorLineaData extends TareaMonitorBase {
  scope: 'linea'
}

export interface TareaMonitorCampanaData extends TareaMonitorBase {
  scope: 'campana'
  idABCCatCampana: number
}

export type TareaMonitorData = TareaMonitorLineaData | TareaMonitorCampanaData

export interface MonitorRawRef {
  id?: number
}

export interface MonitorRawStatusEvent {
  id?: number
  detalle?: string | null
  fechaCreacion?: string
}

export interface MonitorRawTarea {
  id?: number
  actividad?: MonitorRawRef
  ejecucion?: MonitorRawRef
  estatus?: MonitorRawRef | MonitorRawStatusEvent[]
  dia?: MonitorRawRef
  hora?: MonitorRawRef
  diaId?: number
  horaId?: number
  idABCCatDia?: number
  idABCCatHora?: number
  fechaInicio?: string
  fechaInico?: string
  fechaFin?: string
  fechaCreacion?: string
  fecCreacion?: string
  registros?: number
  numeroRegistros?: number
  totalRegistros?: number
  procesados?: number
  numeroRegistrosProcesados?: number
  registrosProcesados?: number
  dictaminar?: boolean
  dictaminacionRequerida?: boolean
}

export interface MonitorRawRecord {
  id?: number
  idABCCatLineaNegocio?: number
  idABCCatCampana?: number
  idABCConfigMapeo?: number
  idABCConfigMapeoLinea?: number
  idABCConfigMapeoCampana?: number
  nombreMapeo?: string
  linea?: MonitorRawRef & { campana?: MonitorRawRef }
  campana?: MonitorRawRef
  mapeo?: {
    id?: number
    nombre?: string
  }
  tarea?: MonitorRawTarea[]
  tareas?: MonitorRawTarea[]
  dia?: MonitorRawRef
  hora?: MonitorRawRef
  diaId?: number
  horaId?: number
  idABCCatDia?: number
  idABCCatHora?: number
  actividad?: MonitorRawRef
  actividadId?: number
  ejecucion?: MonitorRawRef
  ejecucionId?: number
  estatus?: MonitorRawRef
  estatusId?: number
  status?: MonitorRawRef
  statusId?: number
  fechaInicio?: string
  fechaInico?: string
  fechaProgramada?: string
  horarioProgramado?: string
  fechaFin?: string
  fechaCreacion?: string
  fecCreacion?: string
  fechaUltimaModificacion?: string
  fecUltModificacion?: string
  fechaUltModificacion?: string
  fecInicio?: string
  fecFin?: string
  registros?: number
  numeroRegistros?: number
  totalRegistros?: number
  procesados?: number
  numeroRegistrosProcesados?: number
  registrosProcesados?: number
  dictaminar?: boolean
  dictaminacionRequerida?: boolean
}
