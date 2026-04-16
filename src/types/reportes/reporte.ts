export type ReporteTipo = 'carga' | 'validacion' | 'envio'
export type ReporteScope = 'linea' | 'campana'

export interface FiltroIndividualCL {
  riid?: string
  nombre?: string
  apellidoPaterno?: string
  correo?: string
  telefono?: string
  noCuenta?: string
  nss?: string
  curp?: string
  rfc?: string
  poliza?: string
  fechaInicio?: string
  fechaFin?: string
}

export interface FiltroIndividualPET {
  noLote?: string
  idCliente?: string
  idAfore?: string
  idClienteAhorrador?: string
  idPrestamoPensionado?: string
  idSusceptiblePrestamo?: string
  idBajaCambio?: string
  idComunicacion?: string
  idPersona?: string
  nombre?: string
  apellido?: string
  correo?: string
  telefono?: string
  fechaInicial?: string
  fechaFinal?: string
}

export interface RegistroCL {
  lineaNegocio: string
  riid: string
  nombre: string
  apellidoPaterno: string
  apellidoMaterno: string
  correo: string
  telefono1: string
  telefono2: string
  noCuenta: string
  nss: string
  curp: string
  rfc: string
  poliza: string
  fechaNacimiento: string
  cp: string
  calle1: string
  calle2: string
  ciudad: string
  estado: string
  genero: string
  prueba: string
  suspension: string
  fecha: string
  estatus?: string
  detalle?: string
}

export interface RegistroPET {
  lineaDeNegocio: string
  idCampana: string
  numLote: string
  customerId: string
  idAfore: string
  descripcionDeAfore: string
  idClienteAhorrador: string
  idPrestamoPensionado: string
  idSusceptiblePrestamo: string
  idBajaCambio: string
  idComunicacion: string
  idPersona: string
  firstName: string
  lastName: string
  correo: string
  telefono: string
  siefore: string
  segmento: string
  regimen: string
  tipoPension: string
  grupoPago: string
  fechaBajaCambio: string
  regimenImss: string
  segmentoAfo: string
  edad: string
  genero: string
  ligaRsaldos: string
  segmentoPre: string
  domicilioPreferente: string
  empresa: string
  segmentoProy: string
  paterno: string
  ligaTitular: string
  instituto: string
  trabajador: string
  entidad: string
  mediosDigitales: string
  apertura: string
  numeroHijos: string
  masy65: string
  menores: string
  cuentaMenor1: string
  nombreHijo1: string
  ligaHijo1: string
  cuentaMenor2: string
  nombreHijo2: string
  ligaHijo2: string
  cuentaMenor3: string
  nombreHijo3: string
  ligaHijo3: string
  cuentaMenor4: string
  nombreHijo4: string
  ligaHijo4: string
  cuentaMenor5: string
  nombreHijo5: string
  ligaHijo5: string
  cuentaMenor6: string
  nombreHijo6: string
  ligaHijo6: string
  perfil: string
  hijos: string
  estatusExp: string
  sucursal: string
  domSucursal: string
  fecha: string
  estatus?: string
  detalle?: string
}

export interface ReporteApiResponseItem<T> {
  registros: T[]
}

export type ReporteGeneralTipo = 'carga' | 'validacion' | 'envio'

export interface RegistroGeneral {
  lineaNegocio: string
  campana?: string
  mapeo: string
  fecha: string
  registros: number
  aprobados?: number
  rechazados?: number
}

export interface FiltroGeneralCL {
  fechaInicio: string
  fechaFin: string
}

export interface FiltroGeneralPET {
  fechaInicial: string
  fechaFinal: string
}
