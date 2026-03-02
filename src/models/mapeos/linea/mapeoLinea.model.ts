import type {
  CreateMapeoLineaPayload,
  UpdateMapeoLineaPayload
} from '@/types/mapeos/linea'

export interface MapeoLineaFormModel {
  idABCCatLineaNegocio?: number | ''
  nombre: string
  descripcion: string
  validar?: boolean
  enviar?: boolean
  dictaminar?: boolean
  porcentajeError?: number | ''
  idUsuario?: number | ''
}

export function toCreateMapeoLineaPayload(form: MapeoLineaFormModel): CreateMapeoLineaPayload {
  return {
    mapeo: {
      nombre: form.nombre,
      descripcion: form.descripcion,
      validar: form.validar ?? true,
      enviar: form.enviar ?? true,
      dictaminar: form.dictaminar,
      porcentajeError:
        form.porcentajeError === '' || form.porcentajeError === undefined
          ? undefined
          : Number(form.porcentajeError)
    },
    idUsuario: Number(form.idUsuario ?? 1)
  }
}

export function toUpdateMapeoLineaPayload(
  form: MapeoLineaFormModel,
  mapeoId: number
): UpdateMapeoLineaPayload {
  return {
    mapeo: {
      id: mapeoId,
      nombre: form.nombre,
      descripcion: form.descripcion,
      validar: form.validar,
      enviar: form.enviar,
      dictaminar: form.dictaminar,
      porcentajeError:
        form.porcentajeError === '' || form.porcentajeError === undefined
          ? undefined
          : Number(form.porcentajeError)
    },
    idUsuario: Number(form.idUsuario ?? 1)
  }
}
