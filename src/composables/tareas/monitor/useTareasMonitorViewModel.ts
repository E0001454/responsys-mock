import { computed, onMounted, ref, watch } from 'vue'
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
import { mapCatalogByNumericId, mapCatalogNumericIdToCodigo } from '@/utils/tareas/monitor/tareasMonitorData.utils'
import { getStatusClassByCode } from '@/utils/tareas/monitor/tareasMonitorFormat.utils'
import { canApproveStageByRules, canDictaminarStageByRules } from '@/utils/tareas/monitor/monitorStatusRules.utils'
import { useTareasMonitorReport } from '@/composables/tareas/monitor/useTareasMonitorReport'

export const tabs = [
  { key: 'campana', label: 'Campañas' },
  { key: 'linea', label: 'Líneas de negocio' }
] as const

export type TabKey = typeof tabs[number]['key']

type FilterOption = {
  label: string
  value: string
}

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
  const showErrorModal = ref(false)
  const errorItem = ref<TareaMonitorData | null>(null)

  const tareasMonitorLinea = ref<TareaMonitorLineaData[]>([])
  const tareasMonitorCampana = ref<TareaMonitorCampanaData[]>([])
  const lineaLabelById = ref(new Map<number, string>())
  const campanaLabelById = ref(new Map<number, string>())
  const diaLabelById = ref(new Map<number, string>())
  const horaLabelById = ref(new Map<number, string>())
  const lineaCodigoById = ref(new Map<number, string>())
  const campanaCodigoById = ref(new Map<number, string>())

  const selectedLineas = ref<string[]>([])
  const selectedCampanas = ref<string[]>([])
  const selectedActividades = ref<string[]>([])
  const selectedEstatus = ref<string[]>([])
  const selectedFecha = ref('')
  const filtersInitialized = ref(false)

  const currentRows = computed<TareaMonitorData[]>(() =>
    activeTab.value === 'linea' ? tareasMonitorLinea.value : tareasMonitorCampana.value
  )

  const lineasOptions = computed<FilterOption[]>(() => {
    const map = new Map<string, string>()
    currentRows.value.forEach(row => {
      const id = Number(row.idABCCatLineaNegocio ?? 0)
      if (!id) return
      const codigo = lineaCodigoById.value.get(id) ?? ''
      if (!codigo) return
      map.set(codigo, lineaLabelById.value.get(id) ?? `Linea ${id}`)
    })

    return Array.from(map.entries())
      .sort((a, b) => a[1].localeCompare(b[1]))
      .map(([value, label]) => ({ value, label }))
  })

  const campanasOptions = computed<FilterOption[]>(() => {
    if (activeTab.value !== 'campana') return []

    const map = new Map<string, string>()
    currentRows.value.forEach(row => {
      if (row.scope !== 'campana') return
      const id = Number(row.idABCCatCampana ?? 0)
      if (!id) return
      const codigo = campanaCodigoById.value.get(id) ?? ''
      if (!codigo) return
      map.set(codigo, campanaLabelById.value.get(id) ?? `Campana ${id}`)
    })

    return Array.from(map.entries())
      .sort((a, b) => a[1].localeCompare(b[1]))
      .map(([value, label]) => ({ value, label }))
  })

  const actividadOptions = computed<FilterOption[]>(() => {
    const map = new Map<string, string>()
    currentRows.value.forEach(row => {
      const codigo = String(row.actividad?.codigo ?? '').toUpperCase()
      if (!codigo) return
      map.set(codigo, row.actividad?.nombre ?? codigo)
    })

    return Array.from(map.entries())
      .sort((a, b) => a[1].localeCompare(b[1]))
      .map(([value, label]) => ({ value, label }))
  })

  const estatusOptions = computed<FilterOption[]>(() => {
    const map = new Map<string, string>()
    currentRows.value.forEach(row => {
      const codigo = String(row.estatus?.codigo ?? '').toUpperCase()
      if (!codigo) return
      map.set(codigo, row.estatus?.nombre ?? codigo)
    })

    return Array.from(map.entries())
      .sort((a, b) => a[1].localeCompare(b[1]))
      .map(([value, label]) => ({ value, label }))
  })

  function reconcileSelection<T>(selected: T[], options: T[], fallbackToAll = true): T[] {
    const allowed = new Set(options)
    const cleaned = selected.filter(item => allowed.has(item))
    if (fallbackToAll && cleaned.length === 0) return [...options]
    return cleaned
  }

  function initializeFilters(force = false) {
    const lineaValues = lineasOptions.value.map(opt => opt.value)
    const campanaValues = campanasOptions.value.map(opt => opt.value)
    const actividadValues = actividadOptions.value.map(opt => opt.value)
    const estatusValues = estatusOptions.value.map(opt => opt.value)

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
        const lineaCodigo = lineaCodigoById.value.get(Number(row.idABCCatLineaNegocio ?? 0)) ?? ''
        const campanaCodigo = campanaCodigoById.value.get(Number((row as TareaMonitorCampanaData).idABCCatCampana ?? 0)) ?? ''
        const actividadCodigo = String(row.actividad?.codigo ?? '').toUpperCase()
        const estatusCodigo = String(row.estatus?.codigo ?? '').toUpperCase()

        const matchSearch = searchQuery.value.trim()
          ? matchesSearchContains(row.nombreMapeo, searchQuery.value)
          : true

        const matchLinea = selectedLineas.value.length
          ? selectedLineas.value.includes(lineaCodigo)
          : true

        const matchCampana = activeTab.value === 'campana'
          ? (selectedCampanas.value.length ? selectedCampanas.value.includes(campanaCodigo) : true)
          : true

        const matchActividad = selectedActividades.value.length
          ? selectedActividades.value.includes(actividadCodigo)
          : true

        const matchEstatus = selectedEstatus.value.length
          ? selectedEstatus.value.includes(estatusCodigo)
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

        const statusOrder: Record<string, number> = { EJC: 1, PLN: 2, APB: 3, CMP: 4, DCT: 5, ERR: 6 }
        const pa = statusOrder[String(a.estatus.codigo).toUpperCase()] ?? 5
        const pb = statusOrder[String(b.estatus.codigo).toUpperCase()] ?? 5
        if (pa !== pb) return pa - pb

        const actOrder: Record<string, number> = { CARGA: 1, VALIDACION: 2, ENVIO: 3 }
        const aa = actOrder[String(a.actividad.codigo).toUpperCase()] ?? 9
        const ab = actOrder[String(b.actividad.codigo).toUpperCase()] ?? 9
        if (aa !== ab) return aa - ab

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
    return canApproveStageByRules(detailsItem.value)
  })

  const detailsShowApprove = computed(() => {
    if (!detailsItem.value) return false
    return detailsItem.value.ejecucion.modo !== 'AUTOMATICA'
  })

  const detailsCanDictaminar = computed(() => {
    if (!detailsItem.value) return false
    return canDictaminarStageByRules(detailsItem.value)
  })

  const detailsShowDictaminar = computed(() => {
    if (!detailsItem.value) return false
    const item = detailsItem.value
    return item.actividad.codigo === 'VALIDACION' && item.dictaminacionRequerida
  })

  function canApproveFor(item: TareaMonitorData) {
    return canApproveStageByRules(item)
  }

  function showApproveFor(item: TareaMonitorData) {
    return item.ejecucion.modo !== 'AUTOMATICA'
  }

  function canDictaminarFor(item: TareaMonitorData) {
    return canDictaminarStageByRules(item)
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
    lineaLabelById.value = mapCatalogByNumericId(catalogos, 'LNN')
    campanaLabelById.value = mapCatalogByNumericId(catalogos, 'CMP')
    diaLabelById.value = mapCatalogByNumericId(catalogos, 'DIA')
    horaLabelById.value = mapCatalogByNumericId(catalogos, 'HRS')
    lineaCodigoById.value = mapCatalogNumericIdToCodigo(catalogos, 'LNN')
    campanaCodigoById.value = mapCatalogNumericIdToCodigo(catalogos, 'CMP')
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

  async function refreshMonitorData() {
    isLoading.value = true
    error.value = null
    try {
      await fetchMonitorData()
    } catch (err: any) {
      error.value = err?.message ?? 'No fue posible actualizar el monitoreo de tareas.'
    } finally {
      isLoading.value = false
    }
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

  function formatCatalogHourLabel(label: string) {
    const raw = String(label ?? '').trim()
    if (!raw) return ''

    const normalized = raw.toLowerCase()
    if (normalized.includes('am') || normalized.includes('pm')) {
      const compact = normalized.replace(/\s+/g, '')
      const richMatch = compact.match(/^(\d{1,2})(?::(\d{2}))?(am|pm)$/)
      if (richMatch) {
        const hour = String(Number(richMatch[1]) || 0)
        const minute = richMatch[2] ?? '00'
        const suffix = richMatch[3]
        return `${hour}:${minute} ${suffix}`
      }
      return raw
    }

    const hourMatch = normalized.match(/\b([01]?\d|2[0-3])\b/)
    if (!hourMatch) return raw

    const hour24 = Number(hourMatch[1])
    if (!Number.isFinite(hour24)) return raw
    const suffix = hour24 >= 12 ? 'pm' : 'am'
    const hour12 = hour24 % 12 || 12
    return `${hour12}:00 ${suffix}`
  }

  function getHorarioLabel(row: TareaMonitorData) {
    const dia = Number(row.horarioDiaId ?? 0)
    const hora = Number(row.horarioHoraId ?? 0)
    const diaNombre = dia > 0 ? (diaLabelById.value.get(dia) ?? '') : ''
    const horaNombreRaw = hora > 0 ? (horaLabelById.value.get(hora) ?? '') : ''
    const horaNombre = formatCatalogHourLabel(horaNombreRaw)

    if (diaNombre && horaNombre) return `${diaNombre} ${horaNombre}`
    if (diaNombre) return diaNombre
    if (horaNombre) return horaNombre
    return ''
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

  const { reportDownloadLoading, downloadReport } = useTareasMonitorReport({
    activeTab,
    filteredRows,
    getScopeFromTab,
    getLineaLabel,
    getCampanaLabel,
    getActividadLabel,
    getStatusLabel,
    getHorarioLabel,
    showDictaminarFor,
    canDictaminarFor,
    closeReportModal,
    onError: (err) => {
      error.value = (err as { message?: string } | null)?.message ?? 'No fue posible descargar el reporte.'
    }
  })

  onMounted(async () => {
    isLoading.value = true
    error.value = null
    try {
      tareaMonitorService.resetSimulation()
      await Promise.all([fetchCatalogos(), fetchMonitorData()])
      initializeFilters(true)
    } catch (err: any) {
      error.value = err?.message ?? 'No fue posible cargar el monitoreo de tareas.'
    } finally {
      isLoading.value = false
    }
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
    getHorarioLabel,
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
    refreshMonitorData,
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
