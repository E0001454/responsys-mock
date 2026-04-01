import logoProfuturo from '@/assets/img/logo_blue.webp'
import { getImageWatermarkDataUrl } from '@/utils/reports/pdfWatermark'
import { formatTimeLabel } from '@/utils/tareas/monitor/tareasMonitorFormat.utils'
import type { TareaMonitorData } from '@/types/tareas/monitor'

export interface DownloadTareasMonitorPdfReportParams {
  activeTab: 'linea' | 'campana'
  baseRows: TareaMonitorData[]
  detailRows: TareaMonitorData[]
  includeDetails: boolean
  getLineaLabel: (row: TareaMonitorData) => string
  getCampanaLabel: (row: TareaMonitorData) => string
  getActividadLabel: (row: TareaMonitorData) => string
  getStatusLabel: (row: TareaMonitorData) => string
  getHorarioLabel: (row: TareaMonitorData) => string
  getApproveExportState: (row: TareaMonitorData) => string
  getDictamenExportState: (row: TareaMonitorData) => string
}

export async function downloadTareasMonitorPdfReport(params: DownloadTareasMonitorPdfReportParams) {
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
  const generatedAt = new Date().toLocaleString('es-MX', { hour12: false }).normalize('NFC')

  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()

  const formatDateTime = (value?: string) => {
    if (!value) return '-'
    const ts = Date.parse(value)
    if (!Number.isFinite(ts)) return '-'
    return new Date(ts).toLocaleString('es-MX', { hour12: false }).normalize('NFC')
  }

  const summaryRows = params.baseRows
  const summaryTotals = {
    tareas: summaryRows.length,
    totalRegistros: summaryRows.reduce((acc, row) => acc + Number(row.numeroRegistros ?? 0), 0),
    totalProcesados: summaryRows.reduce((acc, row) => acc + Number(row.numeroRegistrosProcesados ?? 0), 0),
    enEjecucion: summaryRows.filter(row => String(row.estatus.codigo).toUpperCase() === 'EJC').length
  }

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
    doc.text('Reporte de Monitoreo de Tareas'.normalize('NFC'), 16, 15)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(...grayText)
    doc.text(`${params.activeTab === 'linea' ? 'Líneas de Negocio' : 'Campañas'}`.normalize('NFC'), 16, 20.2)
    doc.text(`Generado: ${generatedAt}`.normalize('NFC'), 16, 24.5)
  }

  drawPageFrame()

  doc.setFillColor(...brandBlueLight)
  doc.roundedRect(10, 31, pageW - 20, 15, 1.8, 1.8, 'F')
  doc.setTextColor(...brandBlue)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9.5)
  doc.text(`Total tareas: ${summaryTotals.tareas}`, 14, 37)
  doc.text(`Total registros: ${summaryTotals.totalRegistros}`, 67, 37)
  doc.text(`Procesados: ${summaryTotals.totalProcesados}`, 127, 37)
  doc.text(`En ejecución: ${summaryTotals.enEjecucion}`, 179, 37)

  if (!summaryRows.length) {
    doc.setTextColor(...grayText)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.text('No hay datos para exportar con los filtros seleccionados.'.normalize('NFC'), 14, 57)
    const fileNameEmpty = `reporte-monitoreo-${params.activeTab}-${new Date().toISOString().split('T')[0]}.pdf`
    doc.save(fileNameEmpty)
    return
  }

  let sectionY = 50
  if (!params.includeDetails) {
    const summaryHead = [[
      'Línea',
      ...(params.activeTab === 'campana' ? ['Campaña'] : []),
      'Nombre de ingesta',
      'Actividad',
      'Estatus',
      'Fecha',
      'Núm. registros'
    ]]

    const summaryBody = summaryRows.map(row => ([
      params.getLineaLabel(row).normalize('NFC'),
      ...(params.activeTab === 'campana' ? [params.getCampanaLabel(row).normalize('NFC')] : []),
      String(row.nombreMapeo ?? '').normalize('NFC'),
      params.getActividadLabel(row).normalize('NFC'),
      params.getStatusLabel(row).normalize('NFC'),
      formatDateTime(row.horarioProgramado),
      `${Number(row.numeroRegistrosProcesados ?? 0)}/${Number(row.numeroRegistros ?? 0)}`
    ]))

    autoTable(doc, {
      startY: 50,
      head: summaryHead,
      body: summaryBody,
      margin: { top: 30, left: 10, right: 10, bottom: 14 },
      headStyles: {
        fillColor: brandBlue,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'left',
        valign: 'middle'
      },
      bodyStyles: {
        font: 'helvetica',
        fontSize: 8,
        textColor: [30, 41, 59]
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      },
      styles: {
        lineColor: [226, 232, 240],
        lineWidth: 0.15,
        cellPadding: 1.8,
        overflow: 'linebreak'
      },
      columnStyles: {
        2: { cellWidth: 58 }
      },
      didDrawPage: () => {
        drawPageFrame()
        doc.setTextColor(...grayText)
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(8)
        const current = doc.getCurrentPageInfo().pageNumber
        const total = doc.getNumberOfPages()
        doc.text(`Pagina ${current} de ${total}`.normalize('NFC'), pageW - 38, pageH - 6)
      }
    })

    const finalY = (doc as any).lastAutoTable?.finalY ?? 50
    sectionY = Math.min(finalY + 10, pageH - 40)
  }

  const detailSourceRows = params.detailRows.length ? params.detailRows : params.baseRows
  if (params.includeDetails && detailSourceRows.length > 0) {
    doc.setTextColor(...brandBlue)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10.5)
    doc.text(''.normalize('NFC'), 10, sectionY)

    const detailsHead = [[
      'Línea',
      ...(params.activeTab === 'campana' ? ['Campaña'] : []),
      'Ingesta',
      'Actividad',
      'Inicio',
      'Fin',
      'Planificación',
      'Horario',
      'Aprobación',
      'Ejecución',
      'Dictaminación',
      'F. Dictaminación',
      'F. Completada',
      'Núm. registros'
    ]]

    const detailsBody = detailSourceRows.map(stage => ([
      params.getLineaLabel(stage).normalize('NFC'),
      ...(params.activeTab === 'campana' ? [params.getCampanaLabel(stage).normalize('NFC')] : []),
      String(stage.nombreMapeo ?? '').normalize('NFC'),
      String(stage.actividad.nombre ?? '').normalize('NFC'),
      formatDateTime(stage.fechaInicio),
      formatDateTime(stage.fechaFin),
      formatDateTime(stage.fechaCreacion),
      params.getHorarioLabel(stage) || formatTimeLabel(stage.horarioProgramado) || '-',
      params.getApproveExportState(stage),
      formatDateTime(stage.fechaInicio),
      params.getDictamenExportState(stage),
      formatDateTime(stage.fechaDictaminacion),
      formatDateTime(stage.fechaFin),
      `${Number(stage.numeroRegistrosProcesados ?? 0)}/${Number(stage.numeroRegistros ?? 0)}`
    ]))

    autoTable(doc, {
      startY: sectionY + 3.5,
      head: detailsHead,
      body: detailsBody,
      margin: { top: 30, left: 10, right: 10, bottom: 14 },
      headStyles: {
        fillColor: brandBlue,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'left',
        valign: 'middle'
      },
      bodyStyles: {
        font: 'helvetica',
        fontSize: 7.2,
        textColor: [30, 41, 59]
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      },
      styles: {
        lineColor: [226, 232, 240],
        lineWidth: 0.15,
        cellPadding: 1.3,
        overflow: 'linebreak'
      },
      didDrawPage: () => {
        drawPageFrame()
        doc.setTextColor(...grayText)
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(8)
        const current = doc.getCurrentPageInfo().pageNumber
        const total = doc.getNumberOfPages()
        doc.text(`Pagina ${current} de ${total}`.normalize('NFC'), pageW - 38, pageH - 6)
      }
    })
  }

  const fileName = `reporte-monitoreo-${params.activeTab}-${new Date().toISOString().split('T')[0]}.pdf`
  doc.save(fileName)
}
