export interface MapeoData {
  idABCConfigMapeoLinea: number
  idABCCatLineaNegocio: number
  idABCConfigMapeoCampana?: number
  idABCUsuario: number
  nombre: string
  descripcion: string
  bolActivo: 0 | 1
  bolDictaminacion: boolean
}

export interface CreateMapeoPayload {
  mapeo: {
    nombre: string
    descripcion: string
  }
  idABCUsuario: number
}

export interface UpdateMapeoPayload {
  mapeos: {
    id: number
    nombre: string
    descripcion: string
  }
  idABCUsuario: number
}

export interface PatchMapeoPayload {
  mapeo: {
    id: string | number
  }
  idABCUsuario: number
}

export interface FieldConfig {
  type: 'text' | 'textarea' | 'select' | 'number' | 'email' | 'date' | 'toggle'
  options?: { label: string; value: any }[] | string[]
  required?: boolean
  placeholder?: string
  rows?: number
}

export type FieldsConfig = Record<string, FieldConfig>

export interface Linea {
  id: string | number
  nombre: string
  descripcion: string
  status: 0 | 1
}

export interface Campana {
  id: string | number
  id_linea: number
  nombre: string
  descripcion: string
  status: 0 | 1
}