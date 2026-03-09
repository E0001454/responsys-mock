export type MonitorScope = 'linea' | 'campana'

export type MonitorActividadCode = 'CARGA' | 'VALIDACION' | 'ENVIO'

export type MonitorStatusCode = 'EJC' | 'PLN' | 'CMP' | 'BLQ' | 'CNC' | 'ERR'

export type MonitorExecutionMode = 'AUTOMATICA' | 'MANUAL' | 'HIBRIDA'

export interface MonitorCatalogRef {
  id?: number
  codigo: string
  nombre?: string
}

export interface MonitorExecutionRef extends MonitorCatalogRef {
  modo: MonitorExecutionMode
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
  ejecucion: MonitorExecutionRef
  etapaIndex: number
  horarioProgramado: string
  fechaCreacion: string
  fechaInicio: string
  fechaFin: string
  fechaUltimaModificacion: string
  numeroRegistros: number
  numeroRegistrosProcesados: number
  dictaminacionRequerida: boolean
  dictaminado: boolean
}

export interface TareaMonitorLineaData extends TareaMonitorBase {
  scope: 'linea'
}

export interface TareaMonitorCampanaData extends TareaMonitorBase {
  scope: 'campana'
  idABCCatCampana: number
}

export type TareaMonitorData = TareaMonitorLineaData | TareaMonitorCampanaData
