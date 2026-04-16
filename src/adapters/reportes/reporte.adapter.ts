import type {
  RegistroCL,
  RegistroPET,
  RegistroGeneral,
  ReporteApiResponseItem
} from '@/types/reportes/reporte'

function safeString(value: unknown): string {
  return value != null ? String(value) : ''
}

function safeDetalle(value: unknown): string | undefined {
  if (value == null) return undefined
  if (typeof value === 'string') return value
  return JSON.stringify(value)
}

export function unwrapRegistros<T>(data: unknown): T[] {
  if (!data) return []

  if (Array.isArray(data)) {
    if (data.length > 0 && Array.isArray((data[0] as ReporteApiResponseItem<T>)?.registros)) {
      const items: T[] = []
      for (const wrapper of data) {
        if (wrapper && Array.isArray((wrapper as ReporteApiResponseItem<T>).registros)) {
          items.push(...(wrapper as ReporteApiResponseItem<T>).registros)
        }
      }
      return items
    }
    return data as T[]
  }

  if (typeof data === 'object') {
    return [data as T]
  }

  return []
}

export function normalizeRegistroCL(raw: any): RegistroCL {
  return {
    lineaNegocio: safeString(raw?.lineaNegocio),
    riid: safeString(raw?.riid),
    nombre: safeString(raw?.nombre),
    apellidoPaterno: safeString(raw?.apellidoPaterno),
    apellidoMaterno: safeString(raw?.apellidoMaterno),
    correo: safeString(raw?.correo),
    telefono1: safeString(raw?.telefono1),
    telefono2: safeString(raw?.telefono2),
    noCuenta: safeString(raw?.noCuenta),
    nss: safeString(raw?.nss),
    curp: safeString(raw?.curp),
    rfc: safeString(raw?.rfc),
    poliza: safeString(raw?.poliza),
    fechaNacimiento: safeString(raw?.fechaNacimiento),
    cp: safeString(raw?.cp),
    calle1: safeString(raw?.calle1),
    calle2: safeString(raw?.calle2),
    ciudad: safeString(raw?.ciudad),
    estado: safeString(raw?.estado),
    genero: safeString(raw?.genero),
    prueba: safeString(raw?.prueba),
    suspension: safeString(raw?.suspension),
    fecha: safeString(raw?.fecha),
    estatus: raw?.estatus != null ? safeString(raw.estatus) : undefined,
    detalle: safeDetalle(raw?.detalle)
  }
}

export function normalizeRegistroPET(raw: any): RegistroPET {
  return {
    lineaDeNegocio: safeString(raw?.lineaDeNegocio),
    idCampana: safeString(raw?.idCampana),
    numLote: safeString(raw?.numLote),
    customerId: safeString(raw?.customerId),
    idAfore: safeString(raw?.idAfore),
    descripcionDeAfore: safeString(raw?.descripcionDeAfore),
    idClienteAhorrador: safeString(raw?.idClienteAhorrrador),
    idPrestamoPensionado: safeString(raw?.idPrestamoPensionado),
    idSusceptiblePrestamo: safeString(raw?.idSusceptiblePrestamo),
    idBajaCambio: safeString(raw?.idBajaCambio),
    idComunicacion: safeString(raw?.idComunicacion),
    idPersona: safeString(raw?.idPersona),
    firstName: safeString(raw?.firstName),
    lastName: safeString(raw?.lastName),
    correo: safeString(raw?.correo),
    telefono: safeString(raw?.telefono),
    siefore: safeString(raw?.siefore),
    segmento: safeString(raw?.segmento),
    regimen: safeString(raw?.regimen),
    tipoPension: safeString(raw?.tipoPension),
    grupoPago: safeString(raw?.grupoPago),
    fechaBajaCambio: safeString(raw?.fechaBajaCambio),
    regimenImss: safeString(raw?.regimenImss),
    segmentoAfo: safeString(raw?.segmentoAfo),
    edad: safeString(raw?.edad),
    genero: safeString(raw?.genero),
    ligaRsaldos: safeString(raw?.ligaRsaldos),
    segmentoPre: safeString(raw?.segmentoPre),
    domicilioPreferente: safeString(raw?.domicilioPreferente),
    empresa: safeString(raw?.empresa),
    segmentoProy: safeString(raw?.segmentoProy),
    paterno: safeString(raw?.paterno),
    ligaTitular: safeString(raw?.ligaTitular),
    instituto: safeString(raw?.instituto),
    trabajador: safeString(raw?.trabajador),
    entidad: safeString(raw?.entidad),
    mediosDigitales: safeString(raw?.mediosDigitales),
    apertura: safeString(raw?.apertura),
    numeroHijos: safeString(raw?.numeroHijos),
    masy65: safeString(raw?.masy65),
    menores: safeString(raw?.menores),
    cuentaMenor1: safeString(raw?.cuentaMenor1),
    nombreHijo1: safeString(raw?.nombreHijo1),
    ligaHijo1: safeString(raw?.ligaHijo1),
    cuentaMenor2: safeString(raw?.cuentaMenor2),
    nombreHijo2: safeString(raw?.nombreHijo2),
    ligaHijo2: safeString(raw?.ligaHijo2),
    cuentaMenor3: safeString(raw?.cuentaMenor3),
    nombreHijo3: safeString(raw?.nombreHijo3),
    ligaHijo3: safeString(raw?.ligaHijo3),
    cuentaMenor4: safeString(raw?.cuentaMenor4),
    nombreHijo4: safeString(raw?.nombreHijo4),
    ligaHijo4: safeString(raw?.ligaHijo4),
    cuentaMenor5: safeString(raw?.cuentaMenor5),
    nombreHijo5: safeString(raw?.nombreHijo5),
    ligaHijo5: safeString(raw?.ligaHijo5),
    cuentaMenor6: safeString(raw?.cuentaMenor6),
    nombreHijo6: safeString(raw?.nombreHijo6),
    ligaHijo6: safeString(raw?.ligaHijo6),
    perfil: safeString(raw?.perfil),
    hijos: safeString(raw?.hijos),
    estatusExp: safeString(raw?.estatusExp),
    sucursal: safeString(raw?.sucursal),
    domSucursal: safeString(raw?.domSucursal),
    fecha: safeString(raw?.fecha),
    estatus: raw?.estatus != null ? safeString(raw.estatus) : undefined,
    detalle: safeDetalle(raw?.detalle)
  }
}

export function normalizeRegistroGeneral(raw: any): RegistroGeneral {
  const rawFecha = raw?.fecha
  let fecha = ''
  if (rawFecha) {
    const num = Number(rawFecha)
    if (!isNaN(num) && num > 1e12) {
      fecha = new Date(num).toLocaleDateString('es-MX')
    } else {
      fecha = safeString(rawFecha)
    }
  }
  return {
    lineaNegocio: safeString(raw?.lineaNegocio),
    ...(raw?.campana != null ? { campana: safeString(raw.campana) } : {}),
    mapeo: safeString(raw?.mapeo),
    fecha,
    registros: Number(raw?.registros) || 0,
    ...(raw?.aprobados != null ? { aprobados: Number(raw.aprobados) || 0 } : {}),
    ...(raw?.rechazados != null ? { rechazados: Number(raw.rechazados) || 0 } : {})
  }
}
