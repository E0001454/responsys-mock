import type { ReporteScope, FiltroIndividualCL, FiltroIndividualPET } from '@/types/reportes/reporte'

export interface ReporteFilterFormModel {
  scope: ReporteScope
  idLinea: number | ''
  idCampana: number | ''
  cl: FiltroIndividualCL
  pet: FiltroIndividualPET
}

export function createEmptyReporteFilterForm(): ReporteFilterFormModel {
  return {
    scope: 'linea',
    idLinea: '',
    idCampana: '',
    cl: {
      riid: '', nombre: '', apellidoPaterno: '', correo: '', telefono: '',
      noCuenta: '', nss: '', curp: '', rfc: '', poliza: '',
      fechaInicio: '', fechaFin: ''
    },
    pet: {
      noLote: '', idCliente: '', idAfore: '', idClienteAhorrador: '',
      idPrestamoPensionado: '', idSusceptiblePrestamo: '', idBajaCambio: '',
      idComunicacion: '', idPersona: '', nombre: '', apellido: '',
      correo: '', telefono: '', fechaInicial: '', fechaFinal: ''
    }
  }
}

export interface ReporteFilterValidation {
  valid: boolean
  errors: Record<string, string>
}

export function validateReporteFilterForm(form: ReporteFilterFormModel): ReporteFilterValidation {
  const errors: Record<string, string> = {}

  if (form.scope === 'linea') {
    const cl = form.cl
    if (!cl.riid) errors.riid = 'El RIID es requerido'
    if (!cl.nombre) errors.clNombre = 'El nombre es requerido'
    if (!cl.apellidoPaterno) errors.apellidoPaterno = 'El apellido paterno es requerido'
    if (!cl.correo) errors.clCorreo = 'El correo es requerido'
    if (!cl.telefono) errors.clTelefono = 'El teléfono es requerido'
    if (!cl.noCuenta) errors.noCuenta = 'El No. Cuenta es requerido'
    if (!cl.nss) errors.nss = 'El NSS es requerido'
    if (!cl.curp) errors.curp = 'El CURP es requerido'
    if (!cl.rfc) errors.rfc = 'El RFC es requerido'
    if (!cl.poliza) errors.poliza = 'La póliza es requerida'
    if (cl.fechaInicio && cl.fechaFin && cl.fechaInicio > cl.fechaFin) {
      errors.fechaFin = 'La fecha de fin debe ser posterior a la fecha de inicio'
    }
  } else {
    const pet = form.pet
    if (!pet.noLote) errors.noLote = 'El No. Lote es requerido'
    if (!pet.idCliente) errors.idCliente = 'El ID Cliente es requerido'
    if (!pet.idAfore) errors.idAfore = 'El ID Afore es requerido'
    if (!pet.idClienteAhorrador) errors.idClienteAhorrador = 'El ID Cli. Ahorrador es requerido'
    if (!pet.idPrestamoPensionado) errors.idPrestamoPensionado = 'El ID Prést. Pens. es requerido'
    if (!pet.idSusceptiblePrestamo) errors.idSusceptiblePrestamo = 'El ID Susc. Prést. es requerido'
    if (!pet.idBajaCambio) errors.idBajaCambio = 'El ID Baja/Cambio es requerido'
    if (!pet.idComunicacion) errors.idComunicacion = 'El ID Comunicación es requerido'
    if (!pet.idPersona) errors.idPersona = 'El ID Persona es requerido'
    if (!pet.nombre) errors.petNombre = 'El nombre es requerido'
    if (!pet.apellido) errors.apellido = 'El apellido es requerido'
    if (!pet.correo) errors.petCorreo = 'El correo es requerido'
    if (!pet.telefono) errors.petTelefono = 'El teléfono es requerido'
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
