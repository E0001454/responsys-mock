import logoProfuturo from '@/assets/img/logo_blue.webp'
import { getImageWatermarkDataUrl } from '@/utils/reports/pdfWatermark'
import type { RegistroCL, RegistroPET, RegistroGeneral, ReporteScope, ReporteTipo, ReporteGeneralTipo } from '@/types/reportes/reporte'

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

export interface DownloadReportePdfParams {
  scope: ReporteScope
  tipo: ReporteTipo
  registrosCL: RegistroCL[]
  registrosPET: RegistroPET[]
}

const TIPO_LABELS: Record<ReporteTipo, string> = {
  carga: 'Carga',
  validacion: 'Validación',
  envio: 'Envío'
}

function buildHeadAndBody(params: DownloadReportePdfParams): { head: string[][]; body: string[][]; colKeys: string[]; errorMaps: Map<string, string>[] } {
  const showStatus = params.tipo === 'validacion'

  if (params.scope === 'linea') {
    const colKeys = [
      ...(showStatus ? ['estatus'] : []),
      'lineaNegocio', 'riid', 'nombre', 'apellidoPaterno', 'apellidoMaterno', 'correo',
      'telefono1', 'telefono2', 'noCuenta', 'nss', 'curp', 'rfc', 'poliza',
      'fechaNacimiento', 'cp', 'calle1', 'calle2', 'ciudad', 'estado',
      'genero', 'prueba', 'suspension', 'fecha'
    ]
    const head = [[
      ...(showStatus ? ['Estatus'] : []),
      'Línea de Negocio', 'RIID', 'Nombre', 'Apellido Paterno', 'Apellido Materno', 'Correo',
      'Teléfono 1', 'Teléfono 2', 'Número de Cuenta', 'NSS', 'CURP', 'RFC', 'Póliza',
      'Fecha de Nacimiento', 'Código Postal', 'Calle 1', 'Calle 2', 'Ciudad', 'Estado',
      'Género', 'Prueba', 'Suspensión', 'Fecha'
    ]]
    const errorMaps: Map<string, string>[] = []
    const body = params.registrosCL.map(r => {
      errorMaps.push(showStatus ? parseDetalleMap(r.detalle) : new Map())
      return ([
        ...(showStatus ? [r.estatus ?? ''] : []),
        r.lineaNegocio, r.riid, r.nombre, r.apellidoPaterno, r.apellidoMaterno, r.correo,
        r.telefono1, r.telefono2, r.noCuenta, r.nss, r.curp, r.rfc, r.poliza,
        r.fechaNacimiento, r.cp, r.calle1, r.calle2, r.ciudad, r.estado,
        r.genero, r.prueba, r.suspension, r.fecha
      ].map(v => String(v ?? '')))
    })
    return { head, body, colKeys, errorMaps }
  }

  const colKeys = [
    ...(showStatus ? ['estatus'] : []),
    'lineaDeNegocio', 'idCampana', 'numLote', 'customerId', 'idAfore', 'descripcionDeAfore',
    'idClienteAhorrador', 'idPrestamoPensionado', 'idSusceptiblePrestamo',
    'idBajaCambio', 'idComunicacion', 'idPersona',
    'firstName', 'lastName', 'correo', 'telefono',
    'siefore', 'segmento', 'regimen', 'tipoPension', 'grupoPago',
    'fechaBajaCambio', 'regimenImss', 'segmentoAfo', 'edad', 'genero',
    'ligaRsaldos', 'segmentoPre', 'domicilioPreferente', 'empresa', 'segmentoProy',
    'paterno', 'ligaTitular', 'instituto', 'trabajador', 'entidad',
    'mediosDigitales', 'apertura', 'numeroHijos', 'masy65', 'menores',
    'cuentaMenor1', 'nombreHijo1', 'ligaHijo1',
    'cuentaMenor2', 'nombreHijo2', 'ligaHijo2',
    'cuentaMenor3', 'nombreHijo3', 'ligaHijo3',
    'cuentaMenor4', 'nombreHijo4', 'ligaHijo4',
    'cuentaMenor5', 'nombreHijo5', 'ligaHijo5',
    'cuentaMenor6', 'nombreHijo6', 'ligaHijo6',
    'perfil', 'hijos', 'estatusExp', 'sucursal', 'domSucursal', 'fecha'
  ]
  const head = [[
    ...(showStatus ? ['Estatus'] : []),
    'Línea de Negocio', 'Campaña', 'Número de Lote', 'ID Cliente', 'ID Afore', 'Descripción de Afore',
    'ID Cliente Ahorrador', 'ID Préstamo Pensionado', 'ID Susceptible Préstamo', 'ID Baja/Cambio', 'ID Comunicación', 'ID Persona',
    'Nombre', 'Apellido', 'Correo', 'Teléfono',
    'Siefore', 'Segmento', 'Régimen', 'Tipo de Pensión', 'Grupo de Pago',
    'Fecha de Baja/Cambio', 'Régimen IMSS', 'Segmento Afore', 'Edad', 'Género',
    'Liga Rsaldos', 'Segmento Preferente', 'Domicilio Preferente', 'Empresa', 'Segmento Proyección',
    'Paterno', 'Liga Titular', 'Instituto', 'Trabajador', 'Entidad',
    'Medios Digitales', 'Apertura', 'Número de Hijos', 'Mayores de 65', 'Menores',
    'Cuenta Menor 1', 'Nombre Hijo 1', 'Liga Hijo 1',
    'Cuenta Menor 2', 'Nombre Hijo 2', 'Liga Hijo 2',
    'Cuenta Menor 3', 'Nombre Hijo 3', 'Liga Hijo 3',
    'Cuenta Menor 4', 'Nombre Hijo 4', 'Liga Hijo 4',
    'Cuenta Menor 5', 'Nombre Hijo 5', 'Liga Hijo 5',
    'Cuenta Menor 6', 'Nombre Hijo 6', 'Liga Hijo 6',
    'Perfil', 'Hijos', 'Estatus Expediente', 'Sucursal', 'Domicilio Sucursal', 'Fecha'
  ]]
  const errorMaps: Map<string, string>[] = []
  const body = params.registrosPET.map(r => {
    errorMaps.push(showStatus ? parseDetalleMap(r.detalle) : new Map())
    return ([
      ...(showStatus ? [r.estatus ?? ''] : []),
      r.lineaDeNegocio, r.idCampana, r.numLote, r.customerId, r.idAfore, r.descripcionDeAfore,
      r.idClienteAhorrador, r.idPrestamoPensionado, r.idSusceptiblePrestamo,
      r.idBajaCambio, r.idComunicacion, r.idPersona,
      r.firstName, r.lastName, r.correo, r.telefono,
      r.siefore, r.segmento, r.regimen, r.tipoPension, r.grupoPago,
      r.fechaBajaCambio, r.regimenImss, r.segmentoAfo, r.edad, r.genero,
      r.ligaRsaldos, r.segmentoPre, r.domicilioPreferente, r.empresa, r.segmentoProy,
      r.paterno, r.ligaTitular, r.instituto, r.trabajador, r.entidad,
      r.mediosDigitales, r.apertura, r.numeroHijos, r.masy65, r.menores,
      r.cuentaMenor1, r.nombreHijo1, r.ligaHijo1,
      r.cuentaMenor2, r.nombreHijo2, r.ligaHijo2,
      r.cuentaMenor3, r.nombreHijo3, r.ligaHijo3,
      r.cuentaMenor4, r.nombreHijo4, r.ligaHijo4,
      r.cuentaMenor5, r.nombreHijo5, r.ligaHijo5,
      r.cuentaMenor6, r.nombreHijo6, r.ligaHijo6,
      r.perfil, r.hijos, r.estatusExp, r.sucursal, r.domSucursal, r.fecha
    ].map(v => String(v ?? '')))
  })
  return { head, body, colKeys, errorMaps }
}

export async function downloadReportePdfReport(params: DownloadReportePdfParams) {
  const [{ jsPDF }, autoTableModule] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable')
  ])
  const autoTable = autoTableModule.default

  const isPET = params.scope === 'campana'
  const format = isPET ? 'a3' : 'a4'
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format })
  const watermarkDataUrl = await getImageWatermarkDataUrl(logoProfuturo)

  const brandBlue: [number, number, number] = [0, 53, 127]
  const brandBlueLight: [number, number, number] = [233, 242, 252]
  const grayText: [number, number, number] = [71, 85, 105]
  const lineGray: [number, number, number] = [203, 213, 225]
  const generatedAt = new Date().toLocaleString('es-MX', { hour12: false })

  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()

  const tipoLabel = TIPO_LABELS[params.tipo]
  const scopeLabel = params.scope === 'linea'
    ? 'Líneas de contacto (CL)'
    : 'Extensión de perfil (PET)'
  const totalRows = params.scope === 'linea' ? params.registrosCL.length : params.registrosPET.length

  const drawWatermark = () => {
    if (!watermarkDataUrl) return
    const wmWidth = 150
    const wmHeight = 30
    const wmX = (pageW - wmWidth) / 2
    const wmY = (pageH - wmHeight) / 2 + 6
    const docAny = doc as any
    const canOpacity = typeof docAny.setGState === 'function' && typeof docAny.GState === 'function'
    if (canOpacity) {
      docAny.setGState(new docAny.GState({ opacity: 0.08 }))
      doc.addImage(watermarkDataUrl, 'PNG', wmX, wmY, wmWidth, wmHeight)
      docAny.setGState(new docAny.GState({ opacity: 1 }))
      return
    }
    doc.addImage(watermarkDataUrl, 'PNG', wmX, wmY, wmWidth, wmHeight)
  }

  const drawPageFrame = () => {
    drawWatermark()
    doc.setDrawColor(...lineGray)
    doc.setLineWidth(0.2)
    doc.line(10, 28, pageW - 10, 28)
    doc.line(10, pageH - 10, pageW - 10, pageH - 10)

    if (watermarkDataUrl) {
      const wmW = 62
      const wmH = 12
      doc.addImage(watermarkDataUrl, 'PNG', pageW - wmW - 12, 8, wmW, wmH)
    }

    doc.setFillColor(...brandBlue)
    doc.rect(10, 8, 3.2, 16, 'F')

    doc.setTextColor(...brandBlue)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(13)
    doc.text(`Reporte ${tipoLabel} - ${scopeLabel}`, 16, 15)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(...grayText)
    doc.text(`Generado: ${generatedAt}`, 16, 20.2)
  }

  drawPageFrame()

  doc.setFillColor(...brandBlueLight)
  doc.roundedRect(10, 31, pageW - 20, 12, 1.8, 1.8, 'F')
  doc.setTextColor(...brandBlue)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9.5)
  doc.text(`Total registros: ${totalRows}`, 14, 38)

  if (!totalRows) {
    doc.setTextColor(...grayText)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.text('No hay datos para exportar con los filtros seleccionados.', 14, 57)
    doc.save(`reporte-${params.tipo}-${params.scope}-${new Date().toISOString().split('T')[0]}.pdf`)
    return
  }

  const { head, body, colKeys, errorMaps } = buildHeadAndBody(params)

  const bodyFontSize = isPET ? 4 : 6
  const headFontSize = isPET ? 4 : 6
  const cellPad = isPET ? 0.5 : 1.2

  const APPROVED = new Set(['ACEPTADO', 'APROBADO', 'EXITOSO', 'OK'])
  const rowStatuses: string[] = (params.scope === 'linea'
    ? params.registrosCL.map(r => String((r as any).estatus ?? ''))
    : params.registrosPET.map(r => String((r as any).estatus ?? ''))
  ).map(s => s.toUpperCase())

  const usableWidth = pageW - 20
  const charWidthMm = bodyFontSize * 0.38
  const colChunks: number[][] = []
  let currentChunk: number[] = []
  let currentWidth = 0

  const labels = head[0] ?? []
  for (let i = 0; i < labels.length; i++) {
    const colW = Math.max((labels[i] ?? '').length * charWidthMm + 2 * cellPad, 8)
    if (currentWidth + colW > usableWidth && currentChunk.length > 0) {
      colChunks.push(currentChunk)
      currentChunk = [i]
      currentWidth = colW
    } else {
      currentChunk.push(i)
      currentWidth += colW
    }
  }
  if (currentChunk.length > 0) colChunks.push(currentChunk)

  const sharedHeadStyles = {
    fillColor: brandBlue,
    textColor: [255, 255, 255] as [number, number, number],
    fontStyle: 'bold' as const,
    fontSize: headFontSize,
    halign: 'left' as const,
    valign: 'middle' as const
  }
  const sharedBodyStyles = {
    font: 'helvetica',
    fontSize: bodyFontSize,
    textColor: [30, 41, 59] as [number, number, number],
    valign: 'top' as const
  }
  const sharedStyles = {
    lineColor: [226, 232, 240] as [number, number, number],
    lineWidth: 0.15,
    cellPadding: cellPad,
    overflow: 'ellipsize' as const
  }

  let startY = 47

  for (const chunk of colChunks) {
    const chunkHead = [chunk.map(i => labels[i] ?? '')]
    const chunkBody = body.map(row => chunk.map(i => row[i]))
    const chunkColKeys = chunk.map(i => colKeys[i])

    autoTable(doc, {
      startY,
      head: chunkHead,
      body: chunkBody,
      tableWidth: 'auto',
      margin: { top: 30, left: 10, right: 10, bottom: 14 },
      rowPageBreak: 'avoid',
      headStyles: sharedHeadStyles,
      bodyStyles: sharedBodyStyles,
      alternateRowStyles: { fillColor: [248, 250, 252] },
      styles: sharedStyles,
      didParseCell: (data: any) => {
        if (data.section !== 'body') return
        const rowIdx = data.row.index as number
        const colIdx = data.column.index as number

        if (params.tipo === 'envio') {
          data.cell.styles.fillColor = [219, 234, 254]
          return
        }

        if (params.tipo !== 'validacion') return

        const errMap = errorMaps[rowIdx]
        const colKey = chunkColKeys[colIdx]

        if (errMap && errMap.size > 0) {
          if (colKey && errMap.has(colKey.toLowerCase())) {
            data.cell.styles.fillColor = [254, 226, 226]
            data.cell.styles.textColor = [153, 27, 27]
            const errMsg = errMap.get(colKey.toLowerCase())
            if (errMsg) {
              const current = Array.isArray(data.cell.text) ? data.cell.text.join('') : String(data.cell.text ?? '')
              data.cell.text = [current ? `${current} (${errMsg})` : errMsg]
            }
          } else {
            data.cell.styles.fillColor = [254, 242, 242]
          }
        } else if (APPROVED.has(rowStatuses[rowIdx] ?? '')) {
          data.cell.styles.fillColor = [209, 250, 229]
        }
      },
      didDrawPage: () => {
        drawPageFrame()
        doc.setTextColor(...grayText)
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(8)
        const current = doc.getCurrentPageInfo().pageNumber
        const total = doc.getNumberOfPages()
        doc.text(`Página ${current} de ${total}`, pageW - 38, pageH - 6)
      }
    })

    startY = (doc as any).lastAutoTable.finalY + 4
  }

  doc.save(`reporte-${params.tipo}-${params.scope}-${new Date().toISOString().split('T')[0]}.pdf`)
}

export interface DownloadGeneralPdfParams {
  scope: ReporteScope
  tipo: ReporteGeneralTipo
  rows: RegistroGeneral[]
  includeChart?: boolean
  summary: {
    total: number
    cargas: number
    fechaMin: string
    fechaMax: string
    lineaSlices: { label: string; count: number; color: string }[]
    aprobados: number
    rechazados: number
  } | null
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  return [
    parseInt(h.substring(0, 2), 16),
    parseInt(h.substring(2, 4), 16),
    parseInt(h.substring(4, 6), 16)
  ]
}

function renderPieChartDataUrl(slices: { count: number; color: string }[], total: number): string | null {
  if (typeof document === 'undefined' || !slices.length || !total) return null
  const size = 300
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  const cx = size / 2
  const cy = size / 2
  const r = size / 2 - 8
  let angle = -Math.PI / 2
  for (const s of slices) {
    const sweep = (s.count / total) * Math.PI * 2
    ctx.beginPath()
    ctx.moveTo(cx, cy)
    ctx.arc(cx, cy, r, angle, angle + sweep)
    ctx.closePath()
    ctx.fillStyle = s.color
    ctx.fill()
    angle += sweep
  }
  ctx.beginPath()
  ctx.arc(cx, cy, r * 0.55, 0, Math.PI * 2)
  ctx.fillStyle = '#ffffff'
  ctx.fill()
  ctx.fillStyle = '#1e293b'
  ctx.font = `bold ${Math.round(size / 8)}px sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(total.toLocaleString(), cx, cy)
  return canvas.toDataURL('image/png')
}

export async function downloadReporteGeneralPdf(params: DownloadGeneralPdfParams) {
  const [{ jsPDF }, autoTableModule] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable')
  ])
  const autoTable = autoTableModule.default

  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
  const watermarkDataUrl = await getImageWatermarkDataUrl(logoProfuturo)

  const brandBlue: [number, number, number] = [0, 53, 127]
  const brandBlueLight: [number, number, number] = [233, 242, 252]
  const grayText: [number, number, number] = [71, 85, 105]
  const lineGray: [number, number, number] = [203, 213, 225]
  const generatedAt = new Date().toLocaleString('es-MX', { hour12: false })

  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()

  const tipoLabel = params.tipo === 'carga' ? 'Carga' : params.tipo === 'envio' ? 'Envío' : 'Validación'
  const scopeLabel = params.scope === 'linea'
    ? 'Líneas de contacto (CL)'
    : 'Extensión de perfil (PET)'

  const drawWatermark = () => {
    if (!watermarkDataUrl) return
    const wmWidth = 150
    const wmHeight = 30
    const wmX = (pageW - wmWidth) / 2
    const wmY = (pageH - wmHeight) / 2 + 6
    const docAny = doc as any
    const canOpacity = typeof docAny.setGState === 'function' && typeof docAny.GState === 'function'
    if (canOpacity) {
      docAny.setGState(new docAny.GState({ opacity: 0.08 }))
      doc.addImage(watermarkDataUrl, 'PNG', wmX, wmY, wmWidth, wmHeight)
      docAny.setGState(new docAny.GState({ opacity: 1 }))
      return
    }
    doc.addImage(watermarkDataUrl, 'PNG', wmX, wmY, wmWidth, wmHeight)
  }

  const drawPageFrame = () => {
    drawWatermark()
    doc.setDrawColor(...lineGray)
    doc.setLineWidth(0.2)
    doc.line(10, 28, pageW - 10, 28)
    doc.line(10, pageH - 10, pageW - 10, pageH - 10)

    if (watermarkDataUrl) {
      doc.addImage(watermarkDataUrl, 'PNG', pageW - 74, 8, 62, 12)
    }

    doc.setFillColor(...brandBlue)
    doc.rect(10, 8, 3.2, 16, 'F')

    doc.setTextColor(...brandBlue)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(13)
    doc.text(`Reporte General ${tipoLabel} - ${scopeLabel}`, 16, 15)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(...grayText)
    doc.text(`Generado: ${generatedAt}`, 16, 20.2)
  }

  drawPageFrame()

  let cursorY = 32

  if (params.summary) {
    const s = params.summary

    doc.setFillColor(...brandBlueLight)
    const showAprobados = params.tipo === 'validacion'
    doc.roundedRect(10, cursorY, pageW - 20, showAprobados ? 24 : 14, 1.8, 1.8, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(...brandBlue)

    doc.text(`Total registros: ${s.total.toLocaleString()}`, 14, cursorY + 8)
    doc.text(`Cargas: ${s.cargas.toLocaleString()}`, 70, cursorY + 8)
    doc.text(`Líneas: ${s.lineaSlices.length}`, 130, cursorY + 8)
    doc.text(`Fechas: ${s.fechaMin} – ${s.fechaMax}`, 175, cursorY + 8)

    if (showAprobados) {
      doc.setTextColor(16, 185, 129)
      doc.text(`Aprobados: ${s.aprobados.toLocaleString()}`, 14, cursorY + 18)
      doc.setTextColor(239, 68, 68)
      doc.text(`Rechazados: ${s.rechazados.toLocaleString()}`, 70, cursorY + 18)
      doc.setTextColor(...brandBlue)
    }

    cursorY += showAprobados ? 28 : 18

    const chartSlices = showAprobados && (s.aprobados || s.rechazados)
      ? [
          { label: 'Aprobados', count: s.aprobados, color: '#10B981' },
          { label: 'Rechazados', count: s.rechazados, color: '#EF4444' },
          ...(s.total - s.aprobados - s.rechazados > 0
            ? [{ label: 'Otros', count: s.total - s.aprobados - s.rechazados, color: '#CBD5E1' }]
            : [])
        ]
      : s.lineaSlices

    const chartTotal = chartSlices.reduce((a, c) => a + c.count, 0)
    const chartDataUrl = params.includeChart !== false ? renderPieChartDataUrl(chartSlices, chartTotal) : null

    if (chartDataUrl) {
      const chartSize = 45
      doc.addImage(chartDataUrl, 'PNG', 14, cursorY, chartSize, chartSize)

      doc.setFontSize(7)
      let legendY = cursorY + 2
      for (const item of chartSlices) {
        const [r, g, b] = hexToRgb(item.color)
        doc.setFillColor(r, g, b)
        doc.rect(14 + chartSize + 4, legendY, 3, 3, 'F')
        doc.setTextColor(...grayText)
        doc.text(`${item.label} (${item.count.toLocaleString()})`, 14 + chartSize + 9, legendY + 2.5)
        legendY += 5
      }

      cursorY += chartSize + 4
    }
  }

  const isPET = params.scope === 'campana'
  const showAprobados = params.tipo === 'validacion'

  const head = [['Línea de Negocio', ...(isPET ? ['Campaña'] : []), 'Mapeo', 'Fecha', 'Registros',
    ...(showAprobados ? ['Aprobados', 'Rechazados'] : [])
  ]]

  const body = params.rows.map(r => [
    r.lineaNegocio,
    ...(isPET ? [r.campana ?? ''] : []),
    r.mapeo,
    r.fecha,
    r.registros.toLocaleString(),
    ...(showAprobados ? [(r.aprobados ?? 0).toLocaleString(), (r.rechazados ?? 0).toLocaleString()] : [])
  ])

  if (!body.length) {
    doc.setTextColor(...grayText)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.text('No hay datos para exportar.', 14, cursorY + 10)
  } else {
    autoTable(doc, {
      startY: cursorY + 2,
      head,
      body,
      tableWidth: 'auto',
      margin: { top: 30, left: 10, right: 10, bottom: 14 },
      rowPageBreak: 'avoid',
      headStyles: {
        fillColor: brandBlue,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8,
        halign: 'left',
        valign: 'middle'
      },
      bodyStyles: {
        font: 'helvetica',
        fontSize: 8,
        textColor: [30, 41, 59],
        valign: 'top'
      },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      styles: {
        lineColor: [226, 232, 240],
        lineWidth: 0.15,
        cellPadding: 1.5,
        overflow: 'linebreak'
      },
      didDrawPage: () => {
        drawPageFrame()
        doc.setTextColor(...grayText)
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(8)
        const current = doc.getCurrentPageInfo().pageNumber
        const total = doc.getNumberOfPages()
        doc.text(`Página ${current} de ${total}`, pageW - 38, pageH - 6)
      }
    })
  }

  doc.save(`reporte-general-${params.tipo}-${params.scope}-${new Date().toISOString().split('T')[0]}.pdf`)
}