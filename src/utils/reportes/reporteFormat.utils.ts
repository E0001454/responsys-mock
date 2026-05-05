import type { RegistroCL, RegistroPET, ReporteTipo } from '@/types/reportes/reporte'

interface DetalleError { columna?: string; atributo?: string; error?: string | string[]; err?: string | string[] }

function repairDetalleJson(text: string): string {
  let t = text.trim()
  t = t.replace(/([^":,{\[])"\s*"([^":,}\]])/g, '$1, $2')
  t = t.replace(/\}\s*\{/g, '},{')
  if (t.startsWith('{')) t = `[${t}]`
  return t
}

const ATRIBUTO_TO_KEY: Record<string, string> = {
  afore: 'descripciondeafore', idcliente: 'customerid', nolote: 'numlote',
  campana: 'campana', idcampana: 'campana', nombre: 'firstname', apellido: 'lastname',
  lineanegocio: 'lineadenegocio', regimenimss: 'regimenimss'
}
const COLUMNA_TO_KEY: Record<string, string> = {
  email_address_: 'correo', mobile_number_: 'telefono', mobile_country_: 'telefono2',
  riid_: 'riid', nombre: 'nombre', apellido_paterno: 'apellidopaterno',
  apellido_materno: 'apellidomaterno', linea_de_negocio: 'lineanegocio',
  numero_de_cuenta: 'nocuenta', date_of_birth: 'fechanacimiento',
  postal_street_1_: 'calle1', postal_street_2_: 'calle2', city_: 'ciudad',
  state_: 'estado', postal_code_: 'cp', suspension_logica: 'suspension',
  'usuario prueba': 'prueba', id_afore: 'idafore', descripcion_de_afore: 'descripciondeafore',
  id_cliente_ahorrador: 'idclienteahorrador', id_prestamo_pensionado: 'idprestamopensionado',
  id_susceptible_prestamo: 'idsusceptibleprestamo', tipo_pension: 'tipopension',
  grupo_pago: 'grupopago', customer_id_: 'customerid', num_lote: 'numlote',
  nombre_campana: 'campana', id_campana: 'campana', idcampana: 'campana', id_baja_cambio: 'idbajacambio',
  fecha_baja_cambio: 'fechabajacambio', regimen_imss: 'regimenimss',
  segmento_afo: 'segmentoafo', liga_rsaldos: 'ligarsaldos', segmento_pre: 'segmentopre',
  first_name: 'firstname', last_name: 'lastname', id_comunicacion: 'idcomunicacion',
  domicilio_preferente: 'domiciliopreferente', segmento_proy: 'segmentoproy',
  idpersona: 'idpersona', liga_titular: 'ligatitular', medios_digitales: 'mediosdigitales',
  numero_hijos: 'numerohijos', cuenta_menor_1: 'cuentamenor1', nombre_hijo_1: 'nombrehijo1',
  liga_hijo_1: 'ligahijo1', cuenta_menor_2: 'cuentamenor2', nombre_hijo_2: 'nombrehijo2',
  liga_hijo_2: 'ligahijo2', cuenta_menor_3: 'cuentamenor3', nombre_hijo_3: 'nombrehijo3',
  liga_hijo_3: 'ligahijo3', cuenta_menor_4: 'cuentamenor4', nombre_hijo_4: 'nombrehijo4',
  liga_hijo_4: 'ligahijo4', cuenta_menor_5: 'cuentamenor5', nombre_hijo_5: 'nombrehijo5',
  liga_hijo_5: 'ligahijo5', cuenta_menor_6: 'cuentamenor6', nombre_hijo_6: 'nombrehijo6',
  liga_hijo_6: 'ligahijo6', estatus_exp: 'estatusexp', dom_sucursal: 'domsucursal'
}

function resolveColumnKeys(d: DetalleError): string[] {
  const attr = (d.atributo ?? '').toLowerCase().trim()
  const col = (d.columna ?? '').toLowerCase().trim()
  const keys = new Set<string>()
  if (attr) { keys.add(attr); if (ATRIBUTO_TO_KEY[attr]) keys.add(ATRIBUTO_TO_KEY[attr]) }
  if (col) { keys.add(col); if (COLUMNA_TO_KEY[col]) keys.add(COLUMNA_TO_KEY[col]) }
  return [...keys]
}

function cleanMsg(v: unknown): string {
  if (Array.isArray(v)) return v.join(', ')
  let s = String(v ?? '')
  if (s.startsWith('[')) {
    try { const arr = JSON.parse(s); if (Array.isArray(arr)) return arr.join(', ') } catch {}
  }
  return s.replace(/^\[|\]$/g, '').replace(/"/g, '').trim()
}

function parseDetalleMap(text: string | undefined): Map<string, string> {
  if (!text) return new Map()
  try {
    const parsed = JSON.parse(repairDetalleJson(text))
    const arr: DetalleError[] = Array.isArray(parsed) ? parsed
      : (parsed && typeof parsed === 'object') ? [parsed] : []
    const map = new Map<string, string>()
    for (const d of arr) {
      const keys = resolveColumnKeys(d)
      const msg = cleanMsg(d.error || d.err || '')
      for (const key of keys) {
        if (key) map.set(key, map.has(key) ? `${map.get(key)}, ${msg}` : msg)
      }
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
  return s ? `${s} (${errMsg})` : errMsg
}

export function formatTimestamp(value: string | number | undefined | null): string {
  if (value === undefined || value === null || value === '') return ''
  const s = String(value).trim()
  if (!s) return ''
  // Large numeric timestamp
  const num = Number(s)
  if (!isNaN(num) && num > 1e10) {
    const d = new Date(num)
    if (!isNaN(d.getTime())) {
      return d.toLocaleString('es-MX', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false })
    }
  }
  // dd/mm/yyyy
  const dmy = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (dmy) {
    const d = new Date(`${dmy[3]}-${dmy[2]}-${dmy[1]}T00:00:00`)
    if (!isNaN(d.getTime())) return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
  }
  const d = new Date(s)
  if (!isNaN(d.getTime())) {
    return d.toLocaleString('es-MX', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false })
  }
  return s
}

export function formatDateOnly(value: string | number | undefined | null): string {
  if (value === undefined || value === null || value === '') return ''
  const s = String(value).trim()
  if (!s) return ''
  // Large numeric timestamp
  const num = Number(s)
  if (!isNaN(num) && num > 1e10) {
    const d = new Date(num)
    if (!isNaN(d.getTime())) return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
  }
  // dd/mm/yyyy
  const dmy = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (dmy) {
    const d = new Date(`${dmy[3]}-${dmy[2]}-${dmy[1]}T00:00:00`)
    if (!isNaN(d.getTime())) return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
  }
  // ISO yyyy-mm-dd
  const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (iso) {
    const d = new Date(`${iso[1]}-${iso[2]}-${iso[3]}T00:00:00`)
    if (!isNaN(d.getTime())) return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
  }
  return s
}

export function getEstatusClass(estatus?: string): string {
  const c = String(estatus ?? '').toUpperCase()
  if (c === 'ACEPTADO' || c === 'APROBADO' || c === 'EXITOSO' || c === 'OK') return 'bg-emerald-100 text-emerald-800'
  if (c === 'RECHAZADO' || c === 'ERROR') return 'bg-red-100 text-red-800'
  if (c === 'PENDIENTE' || c === 'EN_PROCESO') return 'bg-amber-100 text-amber-700'
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
      'Campaña': v(row.campana, 'campana'),
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
