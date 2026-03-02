import type {
  CreateMapeoCampanaPayload,
  UpdateMapeoCampanaPayload
} from '@/types/mapeos/campana'

export interface MapeoCampanaFormModel {
  idABCCatLineaNegocio?: number | ''
  idABCCatCampana?: number | ''
  nombre: string
  descripcion: string
  validar?: boolean
  enviar?: boolean
  dictaminar?: boolean
  porcentajeError?: number | ''
  idUsuario?: number | ''
}

export function toCreateMapeoCampanaPayload(
  form: MapeoCampanaFormModel
): CreateMapeoCampanaPayload {
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

export function toUpdateMapeoCampanaPayload(
  form: MapeoCampanaFormModel,
  mapeoId: number
): UpdateMapeoCampanaPayload {
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
