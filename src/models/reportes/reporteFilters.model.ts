import type { ReporteScope, FiltroIndividualCL, FiltroIndividualPET } from '@/types/reportes/reporte'

export interface ReporteFilterFormModel {
  scope: ReporteScope
  idLinea: number | ''
  idCampana: number | ''
  cl: FiltroIndividualCL
  pet: FiltroIndividualPET
}

function todayISO(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${dd}`
}

export function createEmptyReporteFilterForm(): ReporteFilterFormModel {
  const hoy = todayISO()
  return {
    scope: 'linea',
    idLinea: '',
    idCampana: '',
    cl: {
      riid: '', nombre: '', apellidoPaterno: '', correo: '', telefono: '',
      noCuenta: '', nss: '', curp: '', rfc: '', poliza: '',
      fechaInicio: hoy, fechaFin: hoy
    },
    pet: {
      noLote: '', idCliente: '', idAfore: '', idClienteAhorrador: '',
      idPrestamoPensionado: '', idSusceptiblePrestamo: '', idBajaCambio: '',
      idComunicacion: '', idPersona: '', nombre: '', apellido: '',
      correo: '', telefono: '', fechaInicial: hoy, fechaFinal: hoy
    }
  }
}

export interface ReporteFilterValidation {
  valid: boolean
  errors: Record<string, string>
}

export function validateReporteFilterForm(form: ReporteFilterFormModel): ReporteFilterValidation {
  const errors: Record<string, string> = {}
  const hoy = todayISO()

  if (form.scope === 'linea') {
    const cl = form.cl

    const hasAtLeastOne = [
      cl.riid, cl.correo, cl.telefono, cl.noCuenta,
      cl.nss, cl.curp, cl.rfc, cl.poliza
    ].some(v => !!v)
    if (!hasAtLeastOne) {
      errors.clAtLeastOne = 'Ingresa al menos uno de los campos marcados con *'
    }

    if (!cl.fechaInicio) errors.fechaInicio = 'La fecha de inicio es requerida'
    if (!cl.fechaFin) errors.fechaFin = 'La fecha de fin es requerida'
    if (cl.fechaInicio && cl.fechaInicio > hoy) errors.fechaInicio = 'La fecha de inicio no puede ser mayor a hoy'
    if (cl.fechaFin && cl.fechaFin > hoy) errors.fechaFin = 'La fecha de fin no puede ser mayor a hoy'
    if (cl.fechaInicio && cl.fechaFin && cl.fechaInicio > cl.fechaFin) {
      errors.fechaFin = 'La fecha de fin debe ser posterior a la fecha de inicio'
    }
  } else {
    const pet = form.pet

    if (!form.idCampana) errors.idCampana = 'La campaña es requerida'

    const hasAtLeastOne = [
      pet.idCliente, pet.idAfore, pet.idClienteAhorrador,
      pet.idPrestamoPensionado, pet.idSusceptiblePrestamo,
      pet.idBajaCambio, pet.idComunicacion, pet.idPersona,
      pet.correo, pet.telefono
    ].some(v => !!v)
    if (!hasAtLeastOne) {
      errors.petAtLeastOne = 'Ingresa al menos uno de los campos marcados con *'
    }

    if (!pet.fechaInicial) errors.fechaInicial = 'La fecha inicial es requerida'
    if (!pet.fechaFinal) errors.fechaFinal = 'La fecha final es requerida'
    if (pet.fechaInicial && pet.fechaInicial > hoy) errors.fechaInicial = 'La fecha inicial no puede ser mayor a hoy'
    if (pet.fechaFinal && pet.fechaFinal > hoy) errors.fechaFinal = 'La fecha final no puede ser mayor a hoy'
    if (pet.fechaInicial && pet.fechaFinal && pet.fechaInicial > pet.fechaFinal) {
      errors.fechaFinal = 'La fecha final debe ser posterior a la fecha inicial'
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  }
}

function isoToApiDate(isoDate: string): string {
  if (!isoDate) return ''
  const [y, m, d] = isoDate.split('-')
  if (!y || !m || !d) return isoDate
  return `${d}/${m}/${y}`
}

function compactObj(obj: Record<string, string | undefined>): Record<string, string> {
  const out: Record<string, string> = {}
  for (const [k, v] of Object.entries(obj)) {
    if (v) out[k] = v
  }
  return out
}

export function buildCLBody(form: ReporteFilterFormModel): Record<string, string> {
  const cl = form.cl
  return compactObj({
    ...(form.idLinea ? { idLinea: String(form.idLinea) } : {}),
    riid: cl.riid, nombre: cl.nombre, apellidoPaterno: cl.apellidoPaterno,
    correo: cl.correo, telefono: cl.telefono, noCuenta: cl.noCuenta,
    nss: cl.nss, curp: cl.curp, rfc: cl.rfc, poliza: cl.poliza,
    fechaInicio: isoToApiDate(cl.fechaInicio ?? ''),
    fechaFin: isoToApiDate(cl.fechaFin ?? '')
  })
}

export function buildPETBody(form: ReporteFilterFormModel): Record<string, string> {
  const pet = form.pet
  return compactObj({
    ...(form.idLinea ? { idLinea: String(form.idLinea) } : {}),
    ...(form.idCampana ? { idCampana: String(form.idCampana) } : {}),
    noLote: pet.noLote, idCliente: pet.idCliente, idAfore: pet.idAfore,
    idClienteAhorrador: pet.idClienteAhorrador, idPrestamoPensionado: pet.idPrestamoPensionado,
    idSusceptiblePrestamo: pet.idSusceptiblePrestamo, idBajaCambio: pet.idBajaCambio,
    idComunicacion: pet.idComunicacion, idPersona: pet.idPersona,
    nombre: pet.nombre, apellido: pet.apellido, correo: pet.correo, telefono: pet.telefono,
    fechaInicial: isoToApiDate(pet.fechaInicial ?? ''),
    fechaFinal: isoToApiDate(pet.fechaFinal ?? '')
  })
}
