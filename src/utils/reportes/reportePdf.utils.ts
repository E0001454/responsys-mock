import logoProfuturo from '@/assets/img/logo_blue.webp'
import { getImageWatermarkDataUrl } from '@/utils/reports/pdfWatermark'
import type { RegistroCL, RegistroPET, ReporteScope, ReporteTipo } from '@/types/reportes/reporte'

export interface DownloadReportePdfParams {
  scope: ReporteScope
  tipo: ReporteTipo
  registrosCL: RegistroCL[]
  registrosPET: RegistroPET[]
}

const TIPO_LABELS: Record<ReporteTipo, string> = {
  carga: 'Carga',
  validacion: 'Validacion',
  envio: 'Envio'
}

function buildHeadAndBody(params: DownloadReportePdfParams): { head: string[][]; body: string[][] } {
  const showStatus = params.tipo !== 'carga'

  if (params.scope === 'linea') {
    const head = [['Linea', 'RIID', 'Nombre', 'Ap. Paterno', 'Ap. Materno', 'Correo',
      'Tel 1', 'Tel 2', 'No. Cuenta', 'NSS', 'CURP', 'RFC', 'Poliza',
      'Fec. Nac.', 'CP', 'Calle 1', 'Calle 2', 'Ciudad', 'Estado',
      'Genero', 'Prueba', 'Suspension', 'Fecha',
      ...(showStatus ? ['Estatus', 'Detalle'] : [])
    ]]
    const body = params.registrosCL.map(r => ([
      r.lineaNegocio, r.riid, r.nombre, r.apellidoPaterno, r.apellidoMaterno, r.correo,
      r.telefono1, r.telefono2, r.noCuenta, r.nss, r.curp, r.rfc, r.poliza,
      r.fechaNacimiento, r.cp, r.calle1, r.calle2, r.ciudad, r.estado,
      r.genero, r.prueba, r.suspension, r.fecha,
      ...(showStatus ? [r.estatus ?? '', r.detalle ?? ''] : [])
    ].map(v => String(v ?? ''))))
    return { head, body }
  }

  const head = [['Linea', 'Campana', 'Lote', 'ID Cli', 'ID Afore', 'Desc. Afore',
    'ID Cli Ahor', 'ID Prest Pens', 'ID Susc Prest', 'ID Baja', 'ID Com', 'ID Persona',
    'Nombre', 'Apellido', 'Correo', 'Telefono',
    'Siefore', 'Segmento', 'Regimen', 'Tipo Pens.', 'Grupo Pago',
    'Fec. Baja', 'Reg. IMSS', 'Seg. Afo', 'Edad', 'Genero',
    'Liga Rsaldos', 'Seg. Pre', 'Dom. Pref.', 'Empresa', 'Seg. Proy',
    'Paterno', 'Liga Titular', 'Instituto', 'Trabajador', 'Entidad',
    'Medios Dig.', 'Apertura', 'No. Hijos', '+65', 'Menores',
    'CM1', 'NH1', 'LH1', 'CM2', 'NH2', 'LH2',
    'CM3', 'NH3', 'LH3', 'CM4', 'NH4', 'LH4',
    'CM5', 'NH5', 'LH5', 'CM6', 'NH6', 'LH6',
    'Perfil', 'Hijos', 'Est. Exp', 'Sucursal', 'Dom. Suc.', 'Fecha',
    ...(showStatus ? ['Estatus', 'Detalle'] : [])
  ]]
  const body = params.registrosPET.map(r => ([
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
    r.perfil, r.hijos, r.estatusExp, r.sucursal, r.domSucursal, r.fecha,
    ...(showStatus ? [r.estatus ?? '', r.detalle ?? ''] : [])
  ].map(v => String(v ?? ''))))
  return { head, body }
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
    ? 'Lineas de contacto (CL)'
    : 'Extension de perfil (PET)'
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

  const { head, body } = buildHeadAndBody(params)

  const bodyFontSize = isPET ? 5.5 : 8
  const cellPad = isPET ? 1 : 1.8

  autoTable(doc, {
    startY: 47,
    head,
    body,
    margin: { top: 30, left: 10, right: 10, bottom: 14 },
    headStyles: {
      fillColor: brandBlue,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: bodyFontSize,
      halign: 'left',
      valign: 'middle'
    },
    bodyStyles: {
      font: 'helvetica',
      fontSize: bodyFontSize,
      textColor: [30, 41, 59]
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    styles: {
      lineColor: [226, 232, 240],
      lineWidth: 0.15,
      cellPadding: cellPad,
      overflow: 'linebreak'
    },
    ...(isPET ? {
      horizontalPageBreak: true,
      horizontalPageBreakRepeat: [0, 1]
    } : {}),
    didDrawPage: () => {
      drawPageFrame()
      doc.setTextColor(...grayText)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)
      const current = doc.getCurrentPageInfo().pageNumber
      const total = doc.getNumberOfPages()
      doc.text(`Pagina ${current} de ${total}`, pageW - 38, pageH - 6)
    }
  })

  doc.save(`reporte-${params.tipo}-${params.scope}-${new Date().toISOString().split('T')[0]}.pdf`)
}