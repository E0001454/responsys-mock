import type { RegistroCL, RegistroPET, ReporteTipo } from '@/types/reportes/reporte'

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
  return rows.map(row => {
    const base: Record<string, unknown> = {
      'Línea de negocio': row.lineaNegocio,
      'RIID': row.riid,
      'Nombre': row.nombre,
      'Apellido Paterno': row.apellidoPaterno,
      'Apellido Materno': row.apellidoMaterno,
      'Correo': row.correo,
      'Teléfono 1': row.telefono1,
      'Teléfono 2': row.telefono2,
      'No. Cuenta': row.noCuenta,
      'NSS': row.nss,
      'CURP': row.curp,
      'RFC': row.rfc,
      'Póliza': row.poliza,
      'Fecha Nacimiento': row.fechaNacimiento,
      'CP': row.cp,
      'Calle 1': row.calle1,
      'Calle 2': row.calle2,
      'Ciudad': row.ciudad,
      'Estado': row.estado,
      'Género': row.genero,
      'Prueba': row.prueba,
      'Suspensión': row.suspension,
      'Fecha': row.fecha
    }
    if (tipo !== 'carga') {
      base['Estatus'] = row.estatus ?? ''
      base['Detalle'] = row.detalle ?? ''
    }
    return base
  })
}

export function buildPETCsvRows(
  rows: RegistroPET[],
  tipo: ReporteTipo
): Array<Record<string, unknown>> {
  return rows.map(row => {
    const base: Record<string, unknown> = {
      'Línea de negocio': row.lineaNegocio,
      'Campaña': row.campana,
      'No. Lote': row.noLote,
      'ID Cliente': row.idCliente,
      'ID Afore': row.idAfore,
      'Afore': row.afore,
      'ID Cliente Ahorrador': row.idClienteAhorrador,
      'ID Préstamo Pensionado': row.idPrestamoPensionado,
      'ID Susceptible Préstamo': row.idSusceptiblePrestamo,
      'ID Baja/Cambio': row.idBajaCambio,
      'ID Comunicación': row.idComunicacion,
      'ID Persona': row.idPersona,
      'Nombre': row.nombre,
      'Apellido': row.apellido,
      'Correo': row.correo,
      'Teléfono': row.telefono,
      'Siefore': row.siefore,
      'Segmento': row.segmento,
      'Régimen': row.regimen,
      'Tipo Pensión': row.tipoPension,
      'Grupo Pago': row.grupoPago,
      'Fecha Baja/Cambio': row.fechaBajaCambio,
      'Régimen IMSS': row.regimenIMSS,
      'Segmento Afo': row.segmentoAfo,
      'Edad': row.edad,
      'Género': row.genero,
      'Liga Rsaldos': row.ligaRsaldos,
      'Segmento Pre': row.segmentoPre,
      'Domicilio Preferente': row.domicilioPreferente,
      'Empresa': row.empresa,
      'Segmento Proy': row.segmentoProy,
      'Paterno': row.paterno,
      'Liga Titular': row.ligaTitular,
      'Instituto': row.instituto,
      'Trabajador': row.trabajador,
      'Entidad': row.entidad,
      'Medios Digitales': row.mediosDigitales,
      'Apertura': row.apertura,
      'No. Hijos': row.numeroHijos,
      '+65': row.masy65,
      'Menores': row.menores,
      'Cuenta Menor 1': row.cuentaMenor1,
      'Nombre Hijo 1': row.nombreHijo1,
      'Liga Hijo 1': row.ligaHijo1,
      'Cuenta Menor 2': row.cuentaMenor2,
      'Nombre Hijo 2': row.nombreHijo2,
      'Liga Hijo 2': row.ligaHijo2,
      'Cuenta Menor 3': row.cuentaMenor3,
      'Nombre Hijo 3': row.nombreHijo3,
      'Liga Hijo 3': row.ligaHijo3,
      'Cuenta Menor 4': row.cuentaMenor4,
      'Nombre Hijo 4': row.nombreHijo4,
      'Liga Hijo 4': row.ligaHijo4,
      'Cuenta Menor 5': row.cuentaMenor5,
      'Nombre Hijo 5': row.nombreHijo5,
      'Liga Hijo 5': row.ligaHijo5,
      'Cuenta Menor 6': row.cuentaMenor6,
      'Nombre Hijo 6': row.nombreHijo6,
      'Liga Hijo 6': row.ligaHijo6,
      'Perfil': row.perfil,
      'Hijos': row.hijos,
      'Estatus Exp.': row.estatusExp,
      'Sucursal': row.sucursal,
      'Dom. Sucursal': row.domSucursal,
      'Fecha': row.fecha
    }
    if (tipo !== 'carga') {
      base['Estatus'] = row.estatus ?? ''
      base['Detalle'] = row.detalle ?? ''
    }
    return base
  })
}
