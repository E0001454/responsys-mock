import type { RegistroCL, RegistroPET, RegistroGeneral, ReporteTipo } from '@/types/reportes/reporte'

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
  campana: 'idcampana', nombre: 'firstname', apellido: 'lastname',
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
  nombre_campana: 'idcampana', id_campana: 'idcampana', id_baja_cambio: 'idbajacambio',
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

function parseDetalle(text: string | undefined): Map<string, string> {
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

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

interface ColDef { key: string; label: string }

const clCols: ColDef[] = [
  { key: 'lineaNegocio', label: 'Línea de Negocio' },
  { key: 'riid', label: 'RIID' },
  { key: 'nombre', label: 'Nombre' },
  { key: 'apellidoPaterno', label: 'Apellido Paterno' },
  { key: 'apellidoMaterno', label: 'Apellido Materno' },
  { key: 'correo', label: 'Correo' },
  { key: 'telefono1', label: 'Teléfono 1' },
  { key: 'telefono2', label: 'Teléfono 2' },
  { key: 'noCuenta', label: 'Número de Cuenta' },
  { key: 'nss', label: 'NSS' },
  { key: 'curp', label: 'CURP' },
  { key: 'rfc', label: 'RFC' },
  { key: 'poliza', label: 'Póliza' },
  { key: 'fechaNacimiento', label: 'Fecha de Nacimiento' },
  { key: 'cp', label: 'Código Postal' },
  { key: 'calle1', label: 'Calle 1' },
  { key: 'calle2', label: 'Calle 2' },
  { key: 'ciudad', label: 'Ciudad' },
  { key: 'estado', label: 'Estado' },
  { key: 'genero', label: 'Género' },
  { key: 'prueba', label: 'Prueba' },
  { key: 'suspension', label: 'Suspensión' },
  { key: 'fecha', label: 'Fecha' }
]

const petCols: ColDef[] = [
  { key: 'lineaDeNegocio', label: 'Línea de Negocio' },
  { key: 'idCampana', label: 'Campaña' },
  { key: 'numLote', label: 'Número de Lote' },
  { key: 'customerId', label: 'ID Cliente' },
  { key: 'idAfore', label: 'ID Afore' },
  { key: 'descripcionDeAfore', label: 'Descripción de Afore' },
  { key: 'idClienteAhorrador', label: 'ID Cliente Ahorrador' },
  { key: 'idPrestamoPensionado', label: 'ID Préstamo Pensionado' },
  { key: 'idSusceptiblePrestamo', label: 'ID Susceptible Préstamo' },
  { key: 'idBajaCambio', label: 'ID Baja/Cambio' },
  { key: 'idComunicacion', label: 'ID Comunicación' },
  { key: 'idPersona', label: 'ID Persona' },
  { key: 'firstName', label: 'Nombre' },
  { key: 'lastName', label: 'Apellido' },
  { key: 'correo', label: 'Correo' },
  { key: 'telefono', label: 'Teléfono' },
  { key: 'siefore', label: 'Siefore' },
  { key: 'segmento', label: 'Segmento' },
  { key: 'regimen', label: 'Régimen' },
  { key: 'tipoPension', label: 'Tipo de Pensión' },
  { key: 'grupoPago', label: 'Grupo de Pago' },
  { key: 'fechaBajaCambio', label: 'Fecha de Baja/Cambio' },
  { key: 'regimenImss', label: 'Régimen IMSS' },
  { key: 'segmentoAfo', label: 'Segmento Afore' },
  { key: 'edad', label: 'Edad' },
  { key: 'genero', label: 'Género' },
  { key: 'ligaRsaldos', label: 'Liga Rsaldos' },
  { key: 'segmentoPre', label: 'Segmento Preferente' },
  { key: 'domicilioPreferente', label: 'Domicilio Preferente' },
  { key: 'empresa', label: 'Empresa' },
  { key: 'segmentoProy', label: 'Segmento Proyección' },
  { key: 'paterno', label: 'Paterno' },
  { key: 'ligaTitular', label: 'Liga Titular' },
  { key: 'instituto', label: 'Instituto' },
  { key: 'trabajador', label: 'Trabajador' },
  { key: 'entidad', label: 'Entidad' },
  { key: 'mediosDigitales', label: 'Medios Digitales' },
  { key: 'apertura', label: 'Apertura' },
  { key: 'numeroHijos', label: 'Número de Hijos' },
  { key: 'masy65', label: 'Mayores de 65' },
  { key: 'menores', label: 'Menores' },
  { key: 'cuentaMenor1', label: 'Cuenta Menor 1' },
  { key: 'nombreHijo1', label: 'Nombre Hijo 1' },
  { key: 'ligaHijo1', label: 'Liga Hijo 1' },
  { key: 'cuentaMenor2', label: 'Cuenta Menor 2' },
  { key: 'nombreHijo2', label: 'Nombre Hijo 2' },
  { key: 'ligaHijo2', label: 'Liga Hijo 2' },
  { key: 'cuentaMenor3', label: 'Cuenta Menor 3' },
  { key: 'nombreHijo3', label: 'Nombre Hijo 3' },
  { key: 'ligaHijo3', label: 'Liga Hijo 3' },
  { key: 'cuentaMenor4', label: 'Cuenta Menor 4' },
  { key: 'nombreHijo4', label: 'Nombre Hijo 4' },
  { key: 'ligaHijo4', label: 'Liga Hijo 4' },
  { key: 'cuentaMenor5', label: 'Cuenta Menor 5' },
  { key: 'nombreHijo5', label: 'Nombre Hijo 5' },
  { key: 'ligaHijo5', label: 'Liga Hijo 5' },
  { key: 'cuentaMenor6', label: 'Cuenta Menor 6' },
  { key: 'nombreHijo6', label: 'Nombre Hijo 6' },
  { key: 'ligaHijo6', label: 'Liga Hijo 6' },
  { key: 'perfil', label: 'Perfil' },
  { key: 'hijos', label: 'Hijos' },
  { key: 'estatusExp', label: 'Estatus Expediente' },
  { key: 'sucursal', label: 'Sucursal' },
  { key: 'domSucursal', label: 'Domicilio Sucursal' },
  { key: 'fecha', label: 'Fecha' }
]

export interface ExcelExportParams {
  scope: 'linea' | 'campana'
  tipo: ReporteTipo
  registrosCL: RegistroCL[]
  registrosPET: RegistroPET[]
}

export function downloadReporteExcel(params: ExcelExportParams) {
  const showEstatus = params.tipo === 'validacion'
  const cols = params.scope === 'linea' ? clCols : petCols
  const rows: any[] = params.scope === 'linea' ? params.registrosCL : params.registrosPET

  const allCols = [...(showEstatus ? [{ key: 'estatus', label: 'Estatus' }] : []), ...cols]

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<?mso-application progid="Excel.Sheet"?>\n`
  xml += `<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"\n`
  xml += ` xmlns:o="urn:schemas-microsoft-com:office:office"\n`
  xml += ` xmlns:x="urn:schemas-microsoft-com:office:excel"\n`
  xml += ` xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">\n`
  xml += `<Styles>\n`
  xml += `<Style ss:ID="Default"><Font ss:Size="10"/></Style>\n`
  xml += `<Style ss:ID="header"><Font ss:Bold="1" ss:Color="#FFFFFF" ss:Size="10"/><Interior ss:Color="#00357F" ss:Pattern="Solid"/></Style>\n`
  xml += `<Style ss:ID="error"><Interior ss:Color="#FEE2E2" ss:Pattern="Solid"/><Font ss:Color="#991B1B" ss:Size="10"/></Style>\n`
  xml += `<Style ss:ID="errorRow"><Interior ss:Color="#FEF2F2" ss:Pattern="Solid"/></Style>\n`
  xml += `<Style ss:ID="envioRow"><Interior ss:Color="#DBEAFE" ss:Pattern="Solid"/></Style>\n`
  xml += `<Style ss:ID="approvedRow"><Interior ss:Color="#D1FAE5" ss:Pattern="Solid"/></Style>\n`
  xml += `</Styles>\n`
  xml += `<Worksheet ss:Name="Reporte"><Table>\n`

  xml += `<Row ss:StyleID="header">\n`
  for (const c of allCols) {
    xml += `<Cell><Data ss:Type="String">${esc(c.label)}</Data></Cell>\n`
  }
  xml += `</Row>\n`

  for (const row of rows) {
    const errorMap = showEstatus ? parseDetalle(row.detalle as string | undefined) : new Map<string, string>()
    const hasErrors = errorMap.size > 0
    const isEnvio = params.tipo === 'envio'
    const statusVal = String(row['estatus'] ?? '').toUpperCase()
    const APPROVED = new Set(['ACEPTADO', 'APROBADO', 'EXITOSO', 'OK'])
    const isApproved = showEstatus && !hasErrors && APPROVED.has(statusVal)
    const rowStyle = isEnvio ? ' ss:StyleID="envioRow"' : (hasErrors ? ' ss:StyleID="errorRow"' : (isApproved ? ' ss:StyleID="approvedRow"' : ''))
    xml += `<Row${rowStyle}>\n`
    for (const c of allCols) {
      const val = String(row[c.key] ?? '')
      const isError = showEstatus && errorMap.has(c.key.toLowerCase())
      const errMsg = isError ? errorMap.get(c.key.toLowerCase()) : ''
      const cellVal = isError && errMsg ? `${val} (${errMsg})` : val
      const cellStyle = isError ? ' ss:StyleID="error"' : (isEnvio ? ' ss:StyleID="envioRow"' : (isApproved ? ' ss:StyleID="approvedRow"' : (hasErrors ? ' ss:StyleID="errorRow"' : '')))
      xml += `<Cell${cellStyle}><Data ss:Type="String">${esc(cellVal)}</Data></Cell>\n`
    }
    xml += `</Row>\n`
  }

  xml += `</Table></Worksheet></Workbook>`

  const blob = new Blob([xml], { type: 'application/vnd.ms-excel' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `reporte-${params.tipo}-${params.scope}-${new Date().toISOString().split('T')[0]}.xls`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function downloadGeneralExcel(params: { scope: 'linea' | 'campana'; tipo: 'carga' | 'validacion' | 'envio'; rows: RegistroGeneral[] }) {
  const showAprobados = params.tipo !== 'carga'
  const isPET = params.scope === 'campana'

  const cols = [
    { key: 'lineaNegocio', label: 'Línea de Negocio' },
    ...(isPET ? [{ key: 'campana', label: 'Campaña' }] : []),
    { key: 'mapeo', label: 'Mapeo' },
    { key: 'fecha', label: 'Fecha' },
    { key: 'registros', label: 'Registros' },
    ...(showAprobados ? [
      { key: 'aprobados', label: 'Aprobados' },
      { key: 'rechazados', label: 'Rechazados' }
    ] : [])
  ]

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<?mso-application progid="Excel.Sheet"?>\n`
  xml += `<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"\n`
  xml += ` xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">\n`
  xml += `<Styles>\n`
  xml += `<Style ss:ID="Default"><Font ss:Size="10"/></Style>\n`
  xml += `<Style ss:ID="header"><Font ss:Bold="1" ss:Color="#FFFFFF" ss:Size="10"/><Interior ss:Color="#00357F" ss:Pattern="Solid"/></Style>\n`
  xml += `</Styles>\n`
  xml += `<Worksheet ss:Name="General"><Table>\n`

  xml += `<Row ss:StyleID="header">\n`
  for (const c of cols) xml += `<Cell><Data ss:Type="String">${esc(c.label)}</Data></Cell>\n`
  xml += `</Row>\n`

  for (const row of params.rows) {
    xml += `<Row>\n`
    for (const c of cols) {
      const val = String((row as any)[c.key] ?? '')
      xml += `<Cell><Data ss:Type="String">${esc(val)}</Data></Cell>\n`
    }
    xml += `</Row>\n`
  }

  xml += `</Table></Worksheet></Workbook>`

  const blob = new Blob([xml], { type: 'application/vnd.ms-excel' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `reporte-general-${params.tipo}-${params.scope}-${new Date().toISOString().split('T')[0]}.xls`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
