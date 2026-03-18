import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { matchesSearchContains } from '@/composables/shared/listViewUtils'
import { useFirstRowNewGlow } from '@/composables/shared/useFirstRowNewGlow'
import { catalogosService } from '@/services/catalogos/catalogosService'
import { tareaMonitorService } from '@/services/tareas/monitor/tareaMonitorService'
import type {
  MonitorScope,
  TareaMonitorCampanaData,
  TareaMonitorData,
  TareaMonitorLineaData
} from '@/types/tareas/monitor'
import { mapCatalogIdToLabel } from '@/utils/tareas/monitor/tareasMonitorData.utils'
import { getStatusClassByCode } from '@/utils/tareas/monitor/tareasMonitorFormat.utils'

export const tabs = [
  { key: 'campana', label: 'Campanas' },
  { key: 'linea', label: 'Lineas de negocio' }
] as const

export type TabKey = typeof tabs[number]['key']

type NumericOption = {
  label: string
  value: number
}

const REFRESH_MS = 1000

export function useTareasMonitorViewModel() {
  const activeTab = ref<TabKey>('campana')
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const openFilter = ref<string | null>(null)
  const searchQuery = ref('')
  const pageSize = ref(10)
  const currentPage = ref(1)
  const showDetailsModal = ref(false)
  const detailsItem = ref<TareaMonitorData | null>(null)
  const detailsStages = ref<TareaMonitorData[]>([])
  const detailsActionLoading = ref(false)
  const showReportModal = ref(false)
  const reportDownloadLoading = ref(false)
  const showErrorModal = ref(false)
  const errorItem = ref<TareaMonitorData | null>(null)

  const tareasMonitorLinea = ref<TareaMonitorLineaData[]>([])
  const tareasMonitorCampana = ref<TareaMonitorCampanaData[]>([])
  const lineaLabelById = ref(new Map<number, string>())
  const campanaLabelById = ref(new Map<number, string>())

  const selectedLineas = ref<number[]>([])
  const selectedCampanas = ref<number[]>([])
  const selectedActividades = ref<number[]>([])
  const selectedEstatus = ref<number[]>([])
  const selectedFecha = ref('')
  const filtersInitialized = ref(false)

  let refreshTimer: ReturnType<typeof setInterval> | null = null

  const currentRows = computed<TareaMonitorData[]>(() =>
    activeTab.value === 'linea' ? tareasMonitorLinea.value : tareasMonitorCampana.value
  )

  const lineasOptions = computed<NumericOption[]>(() => {
    const map = new Map<number, string>()
    currentRows.value.forEach(row => {
      const id = Number(row.idABCCatLineaNegocio ?? 0)
      if (!id) return
      map.set(id, lineaLabelById.value.get(id) ?? `Linea ${id}`)
    })

    return Array.from(map.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([value, label]) => ({ value, label }))
  })

  const campanasOptions = computed<NumericOption[]>(() => {
    if (activeTab.value !== 'campana') return []

    const map = new Map<number, string>()
    currentRows.value.forEach(row => {
      if (row.scope !== 'campana') return
      const id = Number(row.idABCCatCampana ?? 0)
      if (!id) return
      map.set(id, campanaLabelById.value.get(id) ?? `Campana ${id}`)
    })

    return Array.from(map.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([value, label]) => ({ value, label }))
  })

  const actividadOptions = computed<NumericOption[]>(() => {
    const map = new Map<number, string>()
    currentRows.value.forEach(row => {
      const id = Number(row.actividad?.id ?? 0)
      if (!id) return
      map.set(id, row.actividad?.nombre ?? row.actividad?.codigo ?? `Actividad ${id}`)
    })

    return Array.from(map.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([value, label]) => ({ value, label }))
  })

  const estatusOptions = computed<NumericOption[]>(() => {
    const map = new Map<number, string>()
    currentRows.value.forEach(row => {
      const id = Number(row.estatus?.id ?? 0)
      if (!id) return
      map.set(id, row.estatus?.nombre ?? row.estatus?.codigo ?? `Estatus ${id}`)
    })

    return Array.from(map.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([value, label]) => ({ value, label }))
  })

  function reconcileSelection<T>(selected: T[], options: T[], fallbackToAll = true): T[] {
    const allowed = new Set(options)
    const cleaned = selected.filter(item => allowed.has(item))
    if (fallbackToAll && cleaned.length === 0) return [...options]
    return cleaned
  }

  function initializeFilters(force = false) {
    const lineaValues = lineasOptions.value.map(opt => Number(opt.value))
    const campanaValues = campanasOptions.value.map(opt => Number(opt.value))
    const actividadValues = actividadOptions.value.map(opt => Number(opt.value))
    const estatusValues = estatusOptions.value.map(opt => Number(opt.value))

    if (force || !filtersInitialized.value) {
      selectedLineas.value = [...lineaValues]
      selectedCampanas.value = [...campanaValues]
      selectedActividades.value = [...actividadValues]
      selectedEstatus.value = [...estatusValues]
      filtersInitialized.value = true
      return
    }

    selectedLineas.value = reconcileSelection(selectedLineas.value, lineaValues)
    selectedCampanas.value = reconcileSelection(selectedCampanas.value, campanaValues)
    selectedActividades.value = reconcileSelection(selectedActividades.value, actividadValues)
    selectedEstatus.value = reconcileSelection(selectedEstatus.value, estatusValues)
  }

  const filteredRows = computed<TareaMonitorData[]>(() => {
    return currentRows.value
      .filter(row => {
        const campanaId = Number((row as TareaMonitorCampanaData).idABCCatCampana ?? 0)
        const statusId = Number(row.estatus?.id ?? 0)
        const actividadId = Number(row.actividad?.id ?? 0)

        const matchSearch = searchQuery.value.trim()
          ? matchesSearchContains(row.nombreMapeo, searchQuery.value)
          : true

        const matchLinea = selectedLineas.value.length
          ? selectedLineas.value.includes(Number(row.idABCCatLineaNegocio ?? 0))
          : true

        const matchCampana = activeTab.value === 'campana'
          ? (selectedCampanas.value.length ? selectedCampanas.value.includes(campanaId) : true)
          : true

        const matchActividad = selectedActividades.value.length
          ? selectedActividades.value.includes(actividadId)
          : true

        const matchEstatus = selectedEstatus.value.length
          ? selectedEstatus.value.includes(statusId)
          : true

        const rowFecha = formatDateForFilter(row.horarioProgramado)
        const matchFecha = selectedFecha.value
          ? rowFecha === selectedFecha.value
          : true

        return matchSearch && matchLinea && matchCampana && matchActividad && matchEstatus && matchFecha
      })
      .slice()
      .sort((a, b) => {
        const lineaA = Number(a.idABCCatLineaNegocio ?? 0)
        const lineaB = Number(b.idABCCatLineaNegocio ?? 0)
        if (lineaA !== lineaB) return lineaA - lineaB

        if (activeTab.value === 'campana') {
          const campanaA = Number((a as TareaMonitorCampanaData).idABCCatCampana ?? 0)
          const campanaB = Number((b as TareaMonitorCampanaData).idABCCatCampana ?? 0)
          if (campanaA !== campanaB) return campanaA - campanaB
        }

        const mapeoCompare = String(a.nombreMapeo ?? '').localeCompare(String(b.nombreMapeo ?? ''))
        if (mapeoCompare !== 0) return mapeoCompare

        const statusOrder: Record<string, number> = { EJC: 1, PLN: 2, CMP: 3, ERR: 4 }
        const pa = statusOrder[String(a.estatus.codigo).toUpperCase()] ?? 5
        const pb = statusOrder[String(b.estatus.codigo).toUpperCase()] ?? 5
        if (pa !== pb) return pa - pb

        const dateA = a.horarioProgramado ? Date.parse(a.horarioProgramado) : 0
        const dateB = b.horarioProgramado ? Date.parse(b.horarioProgramado) : 0
        return dateB - dateA
      })
  })

  const totalPages = computed(() =>
    Math.max(1, Math.ceil(filteredRows.value.length / pageSize.value))
  )

  const paginatedRows = computed<TareaMonitorData[]>(() => {
    const start = (currentPage.value - 1) * pageSize.value
    return filteredRows.value.slice(start, start + pageSize.value)
  })

  const canPrevPage = computed(() => currentPage.value > 1)
  const canNextPage = computed(() => currentPage.value < totalPages.value)

  const { isRowGlowing } = useFirstRowNewGlow(
    () => paginatedRows.value,
    row => `${activeTab.value}-${row.pipelineId}-${row.etapaIndex}`,
    {
      isLoading: () => isLoading.value,
      getRowChangeToken: row => {
        const item = row as TareaMonitorData
        return `${item.pipelineId}-${item.etapaIndex}-${item.numeroRegistrosProcesados}-${item.estatus.codigo}`
      }
    }
  )

  const totals = computed(() => {
    const rows = filteredRows.value
    const totalRegistros = rows.reduce((acc, row) => acc + Number(row.numeroRegistros ?? 0), 0)
    const totalProcesados = rows.reduce((acc, row) => acc + Number(row.numeroRegistrosProcesados ?? 0), 0)
    const enEjecucion = rows.filter(row => String(row.estatus.codigo).toUpperCase() === 'EJC').length

    return {
      tareas: rows.length,
      totalRegistros,
      totalProcesados,
      enEjecucion
    }
  })

  const maxFechaHoy = computed(() => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  })

  function formatDateForFilter(value?: string) {
    if (!value) return ''
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return ''
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const detailsCanApprove = computed(() => {
    if (!detailsItem.value) return false
    const item = detailsItem.value
    const mode = item.ejecucion.modo
    const isPlanned = item.estatus.codigo === 'PLN'
    const scheduleTs = Date.parse(item.horarioProgramado)
    const reachedSchedule = Number.isFinite(scheduleTs) ? Date.now() >= scheduleTs : false

    if (mode === 'AUTOMATICA') return false
    if (mode === 'MANUAL') return isPlanned && reachedSchedule
    if (mode === 'HIBRIDA') return isPlanned && !reachedSchedule
    return false
  })

  const detailsShowApprove = computed(() => {
    if (!detailsItem.value) return false
    return detailsItem.value.ejecucion.modo !== 'AUTOMATICA'
  })

  const detailsCanDictaminar = computed(() => {
    if (!detailsItem.value) return false
    const item = detailsItem.value
    return item.actividad.codigo === 'VALIDACION'
      && item.dictaminacionRequerida
      && item.estatus.codigo === 'CMP'
      && !item.dictaminado
  })

  const detailsShowDictaminar = computed(() => {
    if (!detailsItem.value) return false
    const item = detailsItem.value
    return item.actividad.codigo === 'VALIDACION' && item.dictaminacionRequerida
  })

  function canApproveFor(item: TareaMonitorData) {
    const mode = item.ejecucion.modo
    const isPlanned = item.estatus.codigo === 'PLN'
    const scheduleTs = Date.parse(item.horarioProgramado)
    const reachedSchedule = Number.isFinite(scheduleTs) ? Date.now() >= scheduleTs : false

    if (mode === 'AUTOMATICA') return false
    if (mode === 'MANUAL') return isPlanned && reachedSchedule
    if (mode === 'HIBRIDA') return isPlanned && !reachedSchedule
    return false
  }

  function showApproveFor(item: TareaMonitorData) {
    return item.ejecucion.modo !== 'AUTOMATICA'
  }

  function canDictaminarFor(item: TareaMonitorData) {
    return item.actividad.codigo === 'VALIDACION'
      && item.dictaminacionRequerida
      && item.estatus.codigo === 'CMP'
      && !item.dictaminado
  }

  function showDictaminarFor(item: TareaMonitorData) {
    return item.actividad.codigo === 'VALIDACION' && item.dictaminacionRequerida
  }

  function showErrorFor(item: TareaMonitorData) {
    return String(item.estatus.codigo).toUpperCase() === 'ERR'
  }

  function canErrorFor(_item: TareaMonitorData) {
    return true
  }

  async function refreshDetailsStages(reference?: TareaMonitorData | null) {
    const target = reference ?? detailsItem.value
    if (!target) {
      detailsStages.value = []
      return
    }

    const stages = await tareaMonitorService.getPipelineDetalle(target.scope, target.pipelineId)
    detailsStages.value = stages

    const sameStage = stages.find(stage =>
      stage.pipelineId === target.pipelineId && stage.etapaIndex === target.etapaIndex
    )
    detailsItem.value = sameStage ?? stages[0] ?? target
  }

  async function fetchCatalogos() {
    const catalogos = await catalogosService.getCatalogosAgrupados()
    lineaLabelById.value = mapCatalogIdToLabel(catalogos, 'LNN')
    campanaLabelById.value = mapCatalogIdToLabel(catalogos, 'CMP')
  }

  async function fetchMonitorData() {
    const [linea, campana] = await Promise.all([
      tareaMonitorService.getLinea(),
      tareaMonitorService.getCampana()
    ])
    tareasMonitorLinea.value = linea
    tareasMonitorCampana.value = campana

    if (detailsItem.value) {
      await refreshDetailsStages(detailsItem.value)
    }

    initializeFilters()
  }

  function getScopeFromTab(tab: TabKey): MonitorScope {
    return tab === 'linea' ? 'linea' : 'campana'
  }

  function getLineaLabel(row: TareaMonitorData) {
    return lineaLabelById.value.get(Number(row.idABCCatLineaNegocio)) ?? `Linea ${row.idABCCatLineaNegocio}`
  }

  function getCampanaLabel(row: TareaMonitorData) {
    if (row.scope !== 'campana') return '-'
    return campanaLabelById.value.get(Number(row.idABCCatCampana)) ?? `Campana ${row.idABCCatCampana}`
  }

  function getActividadLabel(row: TareaMonitorData) {
    return row.actividad.nombre ?? row.actividad.codigo
  }

  function getStatusLabel(row: TareaMonitorData) {
    return row.estatus.nombre ?? row.estatus.codigo
  }

  function getStatusClass(row: TareaMonitorData) {
    return getStatusClassByCode(String(row.estatus.codigo).toUpperCase())
  }

  function toggleFilter(key: string) {
    openFilter.value = openFilter.value === key ? null : key
  }

  function closeFilter() {
    openFilter.value = null
  }

  function handleTabChange(tab: TabKey) {
    if (activeTab.value === tab) return
    activeTab.value = tab
    currentPage.value = 1
    closeFilter()
    showDetailsModal.value = false
    detailsItem.value = null
    initializeFilters(true)
  }

  function handleSearch(value: string) {
    searchQuery.value = value
    currentPage.value = 1
  }

  function prevPage() {
    if (!canPrevPage.value) return
    currentPage.value -= 1
  }

  function nextPage() {
    if (!canNextPage.value) return
    currentPage.value += 1
  }

  function openDetails(row: TareaMonitorData) {
    detailsItem.value = row
    refreshDetailsStages(row).catch(() => {
      detailsStages.value = [row]
    })
    showDetailsModal.value = true
  }

  function closeDetails() {
    if (detailsActionLoading.value) return
    showDetailsModal.value = false
    detailsItem.value = null
    detailsStages.value = []
  }

  function openErrorModal(item: TareaMonitorData) {
    errorItem.value = item
    showErrorModal.value = true
  }

  function closeErrorModal() {
    showErrorModal.value = false
    errorItem.value = null
  }

  async function approveCurrentEjecucion() {
    if (!detailsItem.value || !detailsCanApprove.value) return
    detailsActionLoading.value = true
    try {
      await tareaMonitorService.approveEjecucion(
        detailsItem.value.scope,
        detailsItem.value.pipelineId,
        detailsItem.value.etapaIndex
      )
      await fetchMonitorData()
    } finally {
      detailsActionLoading.value = false
    }
  }

  async function dictaminarCurrent() {
    if (!detailsItem.value || !detailsCanDictaminar.value) return
    detailsActionLoading.value = true
    try {
      await tareaMonitorService.dictaminar(
        detailsItem.value.scope,
        detailsItem.value.pipelineId,
        detailsItem.value.etapaIndex
      )
      await fetchMonitorData()
    } finally {
      detailsActionLoading.value = false
    }
  }

  async function approveStage(item: TareaMonitorData) {
    if (!canApproveFor(item)) return
    detailsActionLoading.value = true
    try {
      await tareaMonitorService.approveEjecucion(item.scope, item.pipelineId, item.etapaIndex)
      await fetchMonitorData()
    } finally {
      detailsActionLoading.value = false
    }
  }

  async function dictaminarStage(item: TareaMonitorData) {
    if (!canDictaminarFor(item)) return
    detailsActionLoading.value = true
    try {
      await tareaMonitorService.dictaminar(item.scope, item.pipelineId, item.etapaIndex)
      await fetchMonitorData()
    } finally {
      detailsActionLoading.value = false
    }
  }

  function openReportModal() {
    showReportModal.value = true
  }

  function closeReportModal() {
    showReportModal.value = false
  }

  async function downloadReport(options: { format: 'csv' | 'xlsx' | 'pdf'; includeDetails: boolean; contentType: 'all' | 'en-curso' }) {
    reportDownloadLoading.value = true
    try {
      if (options.format === 'csv') {
        downloadCsvReport(options.includeDetails, options.contentType)
      } else if (options.format === 'xlsx') {
        downloadXlsxReport(options.includeDetails, options.contentType)
      } else {
        await downloadPdfReport(options.includeDetails, options.contentType)
      }
      closeReportModal()
    } catch (err: any) {
      console.error('Error descargando reporte:', err)
    } finally {
      reportDownloadLoading.value = false
    }
  }

  function escapeXmlValue(str: string): string {
    return String(str ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .normalize('NFC')
  }

  function buildXlsxSheet(name: string, headers: string[], rows: string[][]): string {
    const hCells = headers.map(h =>
      `<Cell ss:StyleID="H"><Data ss:Type="String">${escapeXmlValue(h)}</Data></Cell>`
    ).join('')
    const dRows = rows.map(r =>
      `<Row>${r.map(c => `<Cell><Data ss:Type="String">${escapeXmlValue(c)}</Data></Cell>`).join('')}</Row>`
    ).join('\n')
    return `<Worksheet ss:Name="${escapeXmlValue(name)}"><Table><Row>${hCells}</Row>\n${dRows}</Table></Worksheet>`
  }

  function downloadXlsxFile(sheets: string[], fileName: string) {
    const xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"><Styles><Style ss:ID="H"><Font ss:Bold="1"/><Interior ss:Color="#DBEAFE" ss:Pattern="Solid"/></Style></Styles>${sheets.join('')}</Workbook>`
    const blob = new Blob([xml], { type: 'application/vnd.ms-excel;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', fileName)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  function downloadXlsxReport(includeDetails: boolean, contentType: 'all' | 'en-curso' = 'all') {
    const sourceRows = contentType === 'en-curso'
      ? filteredRows.value.filter(row => String(row.estatus.codigo).toUpperCase() === 'EJC')
      : filteredRows.value
    const hasCampana = activeTab.value === 'campana'
    const summaryHeaders = [
      'Línea',
      ...(hasCampana ? ['Campaña'] : []),
      'Nombre de ingesta',
      'Actividad',
      'Estatus',
      'Fecha',
      'Registros procesados',
      'Total registros'
    ]
    const summaryRows = sourceRows.map(row => [
      getLineaLabel(row),
      ...(hasCampana ? [getCampanaLabel(row)] : []),
      String(row.nombreMapeo ?? ''),
      getActividadLabel(row),
      getStatusLabel(row),
      row.horarioProgramado ? new Date(row.horarioProgramado).toLocaleString() : '-',
      String(row.numeroRegistrosProcesados),
      String(row.numeroRegistros)
    ])
    const sheetName = hasCampana ? 'Campañas' : 'Líneas'
    const sheets = [buildXlsxSheet(sheetName, summaryHeaders, summaryRows)]

    if (includeDetails && detailsStages.value.length > 0) {
      const dHeaders = ['Actividad', 'Estatus', 'Ejecución', 'Registros', 'Horario', 'Inicio', 'Fin', 'Fecha aprobada', 'Fecha dictaminación']
      const dRows = detailsStages.value.map(stage => [
        String(stage.actividad.nombre ?? ''),
        String(stage.estatus.nombre ?? ''),
        String(stage.ejecucion.nombre ?? ''),
        `${stage.numeroRegistrosProcesados}/${stage.numeroRegistros}`,
        stage.horarioProgramado ? new Date(stage.horarioProgramado).toLocaleString() : '-',
        stage.fechaInicio ? new Date(stage.fechaInicio).toLocaleString() : '-',
        stage.fechaFin ? new Date(stage.fechaFin).toLocaleString() : '-',
        stage.fechaAprobada ? new Date(stage.fechaAprobada).toLocaleString() : '-',
        stage.fechaDictaminacion ? new Date(stage.fechaDictaminacion).toLocaleString() : '-'
      ])
      sheets.push(buildXlsxSheet('Detalle', dHeaders, dRows))
    }

    const fileName = `reporte-monitoreo-${activeTab.value}-${new Date().toISOString().split('T')[0]}.xls`
    downloadXlsxFile(sheets, fileName)
  }

  function downloadCsvReport(includeDetails: boolean, contentType: 'all' | 'en-curso' = 'all') {
    const sourceRows = contentType === 'en-curso'
      ? filteredRows.value.filter(row => String(row.estatus.codigo).toUpperCase() === 'EJC')
      : filteredRows.value
    const summaryData = sourceRows.map(row => ({
      Linea: getLineaLabel(row),
      ...(activeTab.value === 'campana' && { Campana: getCampanaLabel(row) }),
      'Nombre de ingesta': row.nombreMapeo,
      Actividad: getActividadLabel(row),
      Estatus: getStatusLabel(row),
      Fecha: row.horarioProgramado ? new Date(row.horarioProgramado).toLocaleString() : '-',
      'Registros procesados': row.numeroRegistrosProcesados,
      'Total registros': row.numeroRegistros
    }))

    let csvContent = convertToCSV(summaryData)

    if (includeDetails && detailsStages.value.length > 0) {
      const detailsData = detailsStages.value.map(stage => ({
        Actividad: stage.actividad.nombre,
        Estatus: stage.estatus.nombre,
        Ejecucion: stage.ejecucion.nombre,
        'Registros procesados': stage.numeroRegistrosProcesados,
        'Total registros': stage.numeroRegistros,
        'Horario programado': stage.horarioProgramado ? new Date(stage.horarioProgramado).toLocaleString() : '-',
        'Fecha inicio': stage.fechaInicio ? new Date(stage.fechaInicio).toLocaleString() : '-',
        'Fecha fin': stage.fechaFin ? new Date(stage.fechaFin).toLocaleString() : '-'
      }))

      csvContent += '\n\n--- DETALLE DE ACTIVIDADES ---\n'
      csvContent += convertToCSV(detailsData)
    }

    const fileName = `reporte-monitoreo-${activeTab.value}-${new Date().toISOString().split('T')[0]}.csv`
    downloadCSV(csvContent, fileName)
  }

  function convertToCSV(data: any[]): string {
    if (data.length === 0) return ''

    const headers = Object.keys(data[0])
    const csvHeaders = headers.map(h => `"${String(h).normalize('NFC').replace(/"/g, '""')}"`).join(',')

    const csvRows = data.map(row =>
      headers.map(header => {
        const value = row[header] ?? ''
        const stringValue = String(value).normalize('NFC')
        return `"${stringValue.replace(/"/g, '""')}"`
      }).join(',')
    )

    return [csvHeaders, ...csvRows].join('\n')
  }

  function downloadCSV(csvContent: string, fileName: string) {
    const utf8Bom = '\uFEFF'
    const blob = new Blob([utf8Bom, csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)

    link.setAttribute('href', url)
    link.setAttribute('download', fileName)
    link.style.visibility = 'hidden'

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    URL.revokeObjectURL(url)
  }

  async function downloadPdfReport(includeDetails: boolean, contentType: 'all' | 'en-curso' = 'all') {
    const sourceRows = contentType === 'en-curso'
      ? filteredRows.value.filter(row => String(row.estatus.codigo).toUpperCase() === 'EJC')
      : filteredRows.value
    const [{ jsPDF }, autoTableModule] = await Promise.all([
      import('jspdf'),
      import('jspdf-autotable')
    ])
    const autoTable = autoTableModule.default
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })

    const title = `Reporte de Monitoreo de Tareas - ${activeTab.value === 'linea' ? 'Lineas de Negocio' : 'Campanas'}`
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(13)
    doc.text(title.normalize('NFC'), 14, 14)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.text(`Total de tareas: ${totals.value.tareas}`, 14, 22)
    doc.text(`Total registros: ${totals.value.totalRegistros}`, 14, 27)
    doc.text(`Registros procesados: ${totals.value.totalProcesados}`, 14, 32)
    doc.text(`En ejecucion: ${totals.value.enEjecucion}`, 14, 37)
    doc.text(`Generado: ${new Date().toLocaleString()}`.normalize('NFC'), 14, 42)

    const summaryHead = [[
      'Linea',
      ...(activeTab.value === 'campana' ? ['Campana'] : []),
      'Nombre de ingesta',
      'Actividad',
      'Estatus',
      'Fecha',
      'Registros'
    ]]

    const summaryBody = sourceRows.map(row => ([
      getLineaLabel(row).normalize('NFC'),
      ...(activeTab.value === 'campana' ? [getCampanaLabel(row).normalize('NFC')] : []),
      String(row.nombreMapeo ?? '').normalize('NFC'),
      getActividadLabel(row).normalize('NFC'),
      getStatusLabel(row).normalize('NFC'),
      row.horarioProgramado ? new Date(row.horarioProgramado).toLocaleString().normalize('NFC') : '-',
      `${row.numeroRegistrosProcesados}/${row.numeroRegistros}`
    ]))

    autoTable(doc, {
      startY: 48,
      head: summaryHead,
      body: summaryBody,
      styles: { font: 'helvetica', fontSize: 8 }
    })

    if (includeDetails && detailsStages.value.length > 0) {
      const detailsHead = [[
        'Actividad',
        'Estatus',
        'Ejecucion',
        'Registros',
        'Horario programado',
        'Inicio',
        'Fin'
      ]]

      const detailsBody = detailsStages.value.map(stage => ([
        String(stage.actividad.nombre ?? '').normalize('NFC'),
        String(stage.estatus.nombre ?? '').normalize('NFC'),
        String(stage.ejecucion.nombre ?? '').normalize('NFC'),
        `${stage.numeroRegistrosProcesados}/${stage.numeroRegistros}`,
        stage.horarioProgramado ? new Date(stage.horarioProgramado).toLocaleString().normalize('NFC') : '-',
        stage.fechaInicio ? new Date(stage.fechaInicio).toLocaleString().normalize('NFC') : '-',
        stage.fechaFin ? new Date(stage.fechaFin).toLocaleString().normalize('NFC') : '-'
      ]))

      const finalY = (doc as any).lastAutoTable?.finalY ?? 48
      doc.setFont('helvetica', 'bold')
      doc.text('Detalle de Actividades', 14, finalY + 8)
      autoTable(doc, {
        startY: finalY + 11,
        head: detailsHead,
        body: detailsBody,
        styles: { font: 'helvetica', fontSize: 8 }
      })
    }

    const fileName = `reporte-monitoreo-${activeTab.value}-${new Date().toISOString().split('T')[0]}.pdf`
    doc.save(fileName)
  }

  function startRefreshLoop() {
    if (refreshTimer) clearInterval(refreshTimer)
    refreshTimer = setInterval(() => {
      fetchMonitorData().catch(() => {
      })
    }, REFRESH_MS)
  }

  function stopRefreshLoop() {
    if (!refreshTimer) return
    clearInterval(refreshTimer)
    refreshTimer = null
  }

  onMounted(async () => {
    isLoading.value = true
    error.value = null
    try {
      tareaMonitorService.resetSimulation()
      await Promise.all([fetchCatalogos(), fetchMonitorData()])
      initializeFilters(true)
      startRefreshLoop()
    } catch (err: any) {
      error.value = err?.message ?? 'No fue posible cargar el monitoreo de tareas.'
    } finally {
      isLoading.value = false
    }
  })

  onUnmounted(() => {
    stopRefreshLoop()
  })

  watch(
    [selectedLineas, selectedCampanas, selectedActividades, selectedEstatus, selectedFecha],
    () => {
      currentPage.value = 1
    },
    { deep: true }
  )

  watch(
    [lineasOptions, campanasOptions, actividadOptions, estatusOptions],
    () => {
      if (!isLoading.value) initializeFilters()
    },
    { deep: true }
  )

  watch(filteredRows, () => {
    if (currentPage.value > totalPages.value) {
      currentPage.value = totalPages.value
    }
  })

  return {
    activeTab,
    actividadOptions,
    canNextPage,
    canPrevPage,
    campanasOptions,
    closeFilter,
    closeReportModal,
    currentPage,
    detailsActionLoading,
    detailsCanApprove,
    detailsCanDictaminar,
    detailsItem,
    detailsStages,
    detailsShowApprove,
    detailsShowDictaminar,
    downloadReport,
    error,
    estatusOptions,
    filteredRows,
    getActividadLabel,
    getCampanaLabel,
    getLineaLabel,
    getScopeFromTab,
    getStatusClass,
    getStatusLabel,
    showApproveFor,
    canApproveFor,
    showDictaminarFor,
    canDictaminarFor,
    showErrorFor,
    canErrorFor,
    showErrorModal,
    errorItem,
    openErrorModal,
    closeErrorModal,
    handleSearch,
    handleTabChange,
    isLoading,
    isRowGlowing,
    lineasOptions,
    nextPage,
    openDetails,
    openFilter,
    openReportModal,
    paginatedRows,
    prevPage,
    reportDownloadLoading,
    selectedActividades,
    selectedCampanas,
    selectedEstatus,
    selectedFecha,
    selectedLineas,
    showDetailsModal,
    showReportModal,
    maxFechaHoy,
    closeDetails,
    approveCurrentEjecucion,
    dictaminarCurrent,
    approveStage,
    dictaminarStage,
    tabs,
    toggleFilter,
    totalPages,
    totals
  }
}
