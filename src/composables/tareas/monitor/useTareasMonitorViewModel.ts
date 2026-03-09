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

type BooleanOption = {
  label: string
  value: boolean
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
  const detailsActionLoading = ref(false)

  const tareasMonitorLinea = ref<TareaMonitorLineaData[]>([])
  const tareasMonitorCampana = ref<TareaMonitorCampanaData[]>([])
  const lineaLabelById = ref(new Map<number, string>())
  const campanaLabelById = ref(new Map<number, string>())

  const selectedLineas = ref<number[]>([])
  const selectedCampanas = ref<number[]>([])
  const selectedActividades = ref<number[]>([])
  const selectedEstatus = ref<number[]>([])
  const selectedDictaminar = ref<boolean[]>([true, false])
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

  const dictaminarOptions: BooleanOption[] = [
    { label: 'Pendientes', value: false },
    { label: 'Aprobados', value: true }
  ]

  function isValidacionRow(row: TareaMonitorData) {
    const actividadId = Number(row?.actividad?.id ?? 0)
    const actividadCode = String(row?.actividad?.codigo ?? '').trim().toUpperCase()
    return actividadId === 2 || actividadCode === 'VALIDACION' || actividadCode === 'VALIDACION'
  }

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
      selectedDictaminar.value = [true, false]
      filtersInitialized.value = true
      return
    }

    selectedLineas.value = reconcileSelection(selectedLineas.value, lineaValues)
    selectedCampanas.value = reconcileSelection(selectedCampanas.value, campanaValues)
    selectedActividades.value = reconcileSelection(selectedActividades.value, actividadValues)
    selectedEstatus.value = reconcileSelection(selectedEstatus.value, estatusValues)
    selectedDictaminar.value = reconcileSelection(selectedDictaminar.value, [true, false], false)
    if (selectedDictaminar.value.length === 0) selectedDictaminar.value = [true, false]
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

        const matchDictaminar = !isValidacionRow(row) || !row.dictaminacionRequerida
          ? true
          : selectedDictaminar.value.length
            ? selectedDictaminar.value.includes(Boolean(row.dictaminado))
            : true

        return matchSearch && matchLinea && matchCampana && matchActividad && matchEstatus && matchDictaminar
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

        return String(a.nombreMapeo ?? '').localeCompare(String(b.nombreMapeo ?? ''))
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
      const source = detailsItem.value.scope === 'linea' ? linea : campana
      const refreshed = source.find(item =>
        item.pipelineId === detailsItem.value?.pipelineId && item.etapaIndex === detailsItem.value?.etapaIndex
      )
      if (refreshed) detailsItem.value = refreshed
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
    showDetailsModal.value = true
  }

  function closeDetails() {
    if (detailsActionLoading.value) return
    showDetailsModal.value = false
    detailsItem.value = null
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

  function startRefreshLoop() {
    if (refreshTimer) clearInterval(refreshTimer)
    refreshTimer = setInterval(() => {
      fetchMonitorData().catch(() => {
        // Keep loop alive even if one refresh fails.
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
    [selectedLineas, selectedCampanas, selectedActividades, selectedEstatus, selectedDictaminar],
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
    currentPage,
    detailsActionLoading,
    detailsCanApprove,
    detailsCanDictaminar,
    detailsItem,
    detailsShowApprove,
    detailsShowDictaminar,
    dictaminarOptions,
    error,
    estatusOptions,
    filteredRows,
    getActividadLabel,
    getCampanaLabel,
    getLineaLabel,
    getScopeFromTab,
    getStatusClass,
    getStatusLabel,
    handleSearch,
    handleTabChange,
    isLoading,
    isRowGlowing,
    lineasOptions,
    nextPage,
    openDetails,
    openFilter,
    paginatedRows,
    prevPage,
    selectedActividades,
    selectedCampanas,
    selectedDictaminar,
    selectedEstatus,
    selectedLineas,
    showDetailsModal,
    closeDetails,
    approveCurrentEjecucion,
    dictaminarCurrent,
    tabs,
    toggleFilter,
    totalPages,
    totals
  }
}
