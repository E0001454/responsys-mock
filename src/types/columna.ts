export interface ColumnaData {
  idABCConfigMapeoLinea: number
  idABCCatLineaNegocio: number
  idABCUsuario: number
  nombre: string
  bolActivo: boolean
  bolCargar: boolean
  bolModificar: boolean
  bolEnviar: boolean
  regex: string
  bolDictaminacion: boolean | null
  fecCreacion: string
  idABCUsuarioUltModificacion: number
  fecUltModificacion: string
}

export interface ColumnaCampanaData extends ColumnaData {
  idABCCatCampana: number
}