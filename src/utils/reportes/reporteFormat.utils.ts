import type { RegistroCL, RegistroPET, ReporteTipo } from '@/types/reportes/reporte'

interface DetalleError { columna?: string; atributo?: string; error?: string; err?: string }

function parseDetalleMap(text: string | undefined): Map<string, string> {
  if (!text) return new Map()
  try {
    const parsed = JSON.parse(text)
    const arr: DetalleError[] = Array.isArray(parsed) ? parsed
      : (parsed && typeof parsed === 'object') ? [parsed] : []
    const map = new Map<string, string>()
    for (const d of arr) {
      const key = (d.atributo ?? d.columna ?? '').toLowerCase()
      const msg = d.error || d.err || ''
      if (key && msg) map.set(key, msg)
    }
    return map
  } catch {
    return new Map()
  }
}

function appendDetalle(val: unknown, key: string, errorMap: Map<string, string>): unknown {
  const errMsg = errorMap.get(key.toLowerCase())
  if (!errMsg) return val
  const s = String(val ?? '')
  return s ? `${s} [${errMsg}]` : `[${errMsg}]`
}

export function getEstatusClass(estatus?: string): string {
  const c = String(estatus ?? '').toUpperCase()
  if (c === 'ACEPTADO' || c === 'EXITOSO' || c === 'OK') return 'bg-emerald-100 text-emerald-700'
  if (c === 'RECHAZADO' || c === 'ERROR') return 'bg-red-100 text-red-700'
  if (c === 'PENDIENTE' || c === 'EN_PROCESO') return 'bg-blue-100 text-blue-700'
  return 'bg-slate-100 text-slate-600'
}

export function buildCLCsvRows(
  rows: RegistroCL[],
  tipo: ReporteTipo
): Array<Record<string, unknown>> {
  const showDetalle = tipo !== 'carga'
  return rows.map(row => {
    const errMap = showDetalle ? parseDetalleMap(row.detalle) : new Map<string, string>()
    const v = (val: unknown, key: string) => showDetalle && errMap.size ? appendDetalle(val, key, errMap) : val
    const base: Record<string, unknown> = {
      'Línea de Negocio': v(row.lineaNegocio, 'lineaNegocio'),
      'RIID': v(row.riid, 'riid'),
      'Nombre': v(row.nombre, 'nombre'),
      'Apellido Paterno': v(row.apellidoPaterno, 'apellidoPaterno'),
      'Apellido Materno': v(row.apellidoMaterno, 'apellidoMaterno'),
      'Correo': v(row.correo, 'correo'),
      'Teléfono 1': v(row.telefono1, 'telefono1'),
      'Teléfono 2': v(row.telefono2, 'telefono2'),
      'Número de Cuenta': v(row.noCuenta, 'noCuenta'),
      'NSS': v(row.nss, 'nss'),
      'CURP': v(row.curp, 'curp'),
      'RFC': v(row.rfc, 'rfc'),
      'Póliza': v(row.poliza, 'poliza'),
      'Fecha de Nacimiento': v(row.fechaNacimiento, 'fechaNacimiento'),
      'Código Postal': v(row.cp, 'cp'),
      'Calle 1': v(row.calle1, 'calle1'),
      'Calle 2': v(row.calle2, 'calle2'),
      'Ciudad': v(row.ciudad, 'ciudad'),
      'Estado': v(row.estado, 'estado'),
      'Género': v(row.genero, 'genero'),
      'Prueba': v(row.prueba, 'prueba'),
      'Suspensión': v(row.suspension, 'suspension'),
      'Fecha': v(row.fecha, 'fecha')
    }
    if (tipo !== 'carga') {
      base['Estatus'] = row.estatus ?? ''
    }
    return base
  })
}

export function buildPETCsvRows(
  rows: RegistroPET[],
  tipo: ReporteTipo
): Array<Record<string, unknown>> {
  const showDetalle = tipo !== 'carga'
  return rows.map(row => {
    const errMap = showDetalle ? parseDetalleMap(row.detalle) : new Map<string, string>()
    const v = (val: unknown, key: string) => showDetalle && errMap.size ? appendDetalle(val, key, errMap) : val
    const base: Record<string, unknown> = {
      'Línea de Negocio': v(row.lineaDeNegocio, 'lineaDeNegocio'),
      'Campaña': v(row.idCampana, 'idCampana'),
      'Número de Lote': v(row.numLote, 'numLote'),
      'ID Cliente': v(row.customerId, 'customerId'),
      'ID Afore': v(row.idAfore, 'idAfore'),
      'Descripción de Afore': v(row.descripcionDeAfore, 'descripcionDeAfore'),
      'ID Cliente Ahorrador': v(row.idClienteAhorrador, 'idClienteAhorrador'),
      'ID Préstamo Pensionado': v(row.idPrestamoPensionado, 'idPrestamoPensionado'),
      'ID Susceptible Préstamo': v(row.idSusceptiblePrestamo, 'idSusceptiblePrestamo'),
      'ID Baja/Cambio': v(row.idBajaCambio, 'idBajaCambio'),
      'ID Comunicación': v(row.idComunicacion, 'idComunicacion'),
      'ID Persona': v(row.idPersona, 'idPersona'),
      'Nombre': v(row.firstName, 'firstName'),
      'Apellido': v(row.lastName, 'lastName'),
      'Correo': v(row.correo, 'correo'),
      'Teléfono': v(row.telefono, 'telefono'),
      'Siefore': v(row.siefore, 'siefore'),
      'Segmento': v(row.segmento, 'segmento'),
      'Régimen': v(row.regimen, 'regimen'),
      'Tipo de Pensión': v(row.tipoPension, 'tipoPension'),
      'Grupo de Pago': v(row.grupoPago, 'grupoPago'),
      'Fecha de Baja/Cambio': v(row.fechaBajaCambio, 'fechaBajaCambio'),
      'Régimen IMSS': v(row.regimenImss, 'regimenImss'),
      'Segmento Afore': v(row.segmentoAfo, 'segmentoAfo'),
      'Edad': v(row.edad, 'edad'),
      'Género': v(row.genero, 'genero'),
      'Liga Rsaldos': v(row.ligaRsaldos, 'ligaRsaldos'),
      'Segmento Preferente': v(row.segmentoPre, 'segmentoPre'),
      'Domicilio Preferente': v(row.domicilioPreferente, 'domicilioPreferente'),
      'Empresa': v(row.empresa, 'empresa'),
      'Segmento Proyección': v(row.segmentoProy, 'segmentoProy'),
      'Paterno': v(row.paterno, 'paterno'),
      'Liga Titular': v(row.ligaTitular, 'ligaTitular'),
      'Instituto': v(row.instituto, 'instituto'),
      'Trabajador': v(row.trabajador, 'trabajador'),
      'Entidad': v(row.entidad, 'entidad'),
      'Medios Digitales': v(row.mediosDigitales, 'mediosDigitales'),
      'Apertura': v(row.apertura, 'apertura'),
      'Número de Hijos': v(row.numeroHijos, 'numeroHijos'),
      'Mayores de 65': v(row.masy65, 'masy65'),
      'Menores': v(row.menores, 'menores'),
      'Cuenta Menor 1': v(row.cuentaMenor1, 'cuentaMenor1'),
      'Nombre Hijo 1': v(row.nombreHijo1, 'nombreHijo1'),
      'Liga Hijo 1': v(row.ligaHijo1, 'ligaHijo1'),
      'Cuenta Menor 2': v(row.cuentaMenor2, 'cuentaMenor2'),
      'Nombre Hijo 2': v(row.nombreHijo2, 'nombreHijo2'),
      'Liga Hijo 2': v(row.ligaHijo2, 'ligaHijo2'),
      'Cuenta Menor 3': v(row.cuentaMenor3, 'cuentaMenor3'),
      'Nombre Hijo 3': v(row.nombreHijo3, 'nombreHijo3'),
      'Liga Hijo 3': v(row.ligaHijo3, 'ligaHijo3'),
      'Cuenta Menor 4': v(row.cuentaMenor4, 'cuentaMenor4'),
      'Nombre Hijo 4': v(row.nombreHijo4, 'nombreHijo4'),
      'Liga Hijo 4': v(row.ligaHijo4, 'ligaHijo4'),
      'Cuenta Menor 5': v(row.cuentaMenor5, 'cuentaMenor5'),
      'Nombre Hijo 5': v(row.nombreHijo5, 'nombreHijo5'),
      'Liga Hijo 5': v(row.ligaHijo5, 'ligaHijo5'),
      'Cuenta Menor 6': v(row.cuentaMenor6, 'cuentaMenor6'),
      'Nombre Hijo 6': v(row.nombreHijo6, 'nombreHijo6'),
      'Liga Hijo 6': v(row.ligaHijo6, 'ligaHijo6'),
      'Perfil': v(row.perfil, 'perfil'),
      'Hijos': v(row.hijos, 'hijos'),
      'Estatus Expediente': v(row.estatusExp, 'estatusExp'),
      'Sucursal': v(row.sucursal, 'sucursal'),
      'Domicilio Sucursal': v(row.domSucursal, 'domSucursal'),
      'Fecha': v(row.fecha, 'fecha')
    }
    if (tipo !== 'carga') {
      base['Estatus'] = row.estatus ?? ''
    }
    return base
  })
}
