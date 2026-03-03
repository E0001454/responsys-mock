export type CatalogoCodigo = 'ROL' | 'LNN' | 'CMP' | 'CLM' | 'CLI' | 'CCM' | 'VAL' | 'CDN' | 'NMR' | 'FCH' | 'DIA' | 'HRS' | 'EJE' | 'ACT' | 'STS'

export interface CatalogoItem {
  id: number
  bolActivo: boolean
  codigo: string
  nombre: string
  esRequerido?: boolean
  obligatorio?: boolean
  fechaCreacion: string
  fechaUltimaModificacion: string
}

export interface CatalogoGrupo {
  codigo: CatalogoCodigo | string
  nombre: string
  registros: CatalogoItem[]
}

export type CatalogosResponse = CatalogoItem[]
export type CatalogosGroupedResponse = CatalogoGrupo[]
