import { computed, onMounted, reactive, ref } from 'vue'
import { catalogosService } from '@/services/catalogos/catalogosService'
import { reporteService } from '@/services/reportes/reporteService'
import type { CatalogoItem } from '@/types/catalogos/catalogos'
import type {
  RegistroCL,
  RegistroPET,
  ReporteTipo,
  ReporteScope,
  ReporteGeneralTipo
} from '@/types/reportes/reporte'
import {
  createEmptyReporteFilterForm,
  validateReporteFilterForm,
  buildCLBody,
  buildPETBody,
  createEmptyGeneralFilterForm,
  validateGeneralFilterForm,
  buildGeneralCLBody,
  buildGeneralPETBody,
  type ReporteFilterFormModel,
  type ReporteGeneralFilterFormModel
} from '@/models/reportes/reporteFilters.model'
import { addToast } from '@/stores/toastStore'
import { convertRowsToCSV, downloadCsvFile } from '@/utils/reports/csvExport'
import { buildCLCsvRows, buildPETCsvRows } from '@/utils/reportes/reporteFormat.utils'
import { downloadReportePdfReport } from '@/utils/reportes/reportePdf.utils'

interface Option {
  label: string
  value: number
}

export const scopeTabs = [
  { key: 'linea' as const, label: 'Líneas de contacto (CL)' },
  { key: 'campana' as const, label: 'Extensión de perfil (PET)' }
]

export type ConsultaMode = 'individual' | 'general'

export const consultaModeTabs = [
  { key: 'individual' as const, label: 'Consulta individual' },
  { key: 'general' as const, label: 'Consulta general' }
]

export function useReportesViewModel(tipo: ReporteTipo) {
  const consultaMode = ref<ConsultaMode>('individual')
  const form = reactive<ReporteFilterFormModel>(createEmptyReporteFilterForm())
  const formErrors = ref<Record<string, string>>({})

  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const hasQueried = ref(false)

  const registrosCL = ref<RegistroCL[]>([])
  const registrosPET = ref<RegistroPET[]>([])

  const lineasCatalogo = ref<Option[]>([])
  const campanasCatalogo = ref<Option[]>([])

  const exportLoading = ref(false)

  const pageSize = ref(10)
  const currentPage = ref(1)

  const resultCount = computed(() =>
    form.scope === 'linea' ? registrosCL.value.length : registrosPET.value.length
  )

  const totalPages = computed(() => Math.max(1, Math.ceil(resultCount.value / pageSize.value)))
  const canPrevPage = computed(() => currentPage.value > 1)
  const canNextPage = computed(() => currentPage.value < totalPages.value)

  const paginatedCL = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    return registrosCL.value.slice(start, start + pageSize.value)
  })

  const paginatedPET = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    return registrosPET.value.slice(start, start + pageSize.value)
  })

  async function loadCatalogos() {
    try {
      const grupos = await catalogosService.getCatalogosAgrupados()
      const lineas = grupos.find(g => g.codigo === 'LNN')?.registros ?? []
      const campanas = grupos.find(g => g.codigo === 'CMP')?.registros ?? []

      lineasCatalogo.value = lineas
        .filter((c: CatalogoItem) => c.bolActivo)
        .map((c: CatalogoItem) => ({ label: c.nombre, value: c.id }))

      campanasCatalogo.value = campanas
        .filter((c: CatalogoItem) => c.bolActivo)
        .map((c: CatalogoItem) => ({ label: c.nombre, value: c.id }))
    } catch {
    }
  }

  function handleScopeChange(scope: ReporteScope) {
    form.scope = scope
    form.idCampana = ''
    resetResults()
    generalForm.scope = scope
    generalForm.idCampana = ''
    resetGeneralResults()
  }

  function resetResults() {
    hasQueried.value = false
    registrosCL.value = []
    registrosPET.value = []
    error.value = null
    currentPage.value = 1
    formErrors.value = {}
  }

  function handleClear() {
    Object.assign(form, createEmptyReporteFilterForm())
    resetResults()
  }

  async function handleConsultar() {
    const validation = validateReporteFilterForm(form)
    formErrors.value = validation.errors
    if (!validation.valid) return

    isLoading.value = true
    error.value = null
    hasQueried.value = true
    currentPage.value = 1

    try {
      if (form.scope === 'linea') {
        const filtros = buildCLBody(form)
        registrosCL.value = await reporteService.getCL(tipo, filtros)
        registrosPET.value = []
      } else {
        const filtros = buildPETBody(form)
        registrosPET.value = await reporteService.getPET(tipo, filtros)
        registrosCL.value = []
      }
    } catch (e: any) {
      error.value = e.message ?? 'Error al consultar el reporte'
    } finally {
      isLoading.value = false
    }
  }

  async function handleExportCsv() {
    if (!resultCount.value) {
      addToast('No hay datos para exportar', 'warning')
      return
    }
    exportLoading.value = true
    try {
      const csvRows = form.scope === 'linea'
        ? buildCLCsvRows(registrosCL.value, tipo)
        : buildPETCsvRows(registrosPET.value, tipo)
      const csv = convertRowsToCSV(csvRows)
      downloadCsvFile(csv, `reporte-${tipo}-${form.scope}-${new Date().toISOString().split('T')[0]}.csv`)
      addToast('Reporte CSV descargado correctamente', 'success')
    } catch {
      addToast('Error al generar el archivo CSV', 'error')
    } finally {
      exportLoading.value = false
    }
  }

  async function handleExportPdf() {
    if (!resultCount.value) {
      addToast('No hay datos para exportar', 'warning')
      return
    }
    exportLoading.value = true
    try {
      await downloadReportePdfReport({
        scope: form.scope,
        tipo,
        registrosCL: registrosCL.value,
        registrosPET: registrosPET.value
      })
      addToast('Reporte PDF descargado correctamente', 'success')
    } catch {
      addToast('Error al generar el archivo PDF', 'error')
    } finally {
      exportLoading.value = false
    }
  }

  function prevPage() {
    if (canPrevPage.value) currentPage.value--
  }

  function nextPage() {
    if (canNextPage.value) currentPage.value++
  }

  const supportsGeneral = computed(() => tipo === 'carga' || tipo === 'validacion')
  const generalTipo = tipo as ReporteGeneralTipo

  const generalForm = reactive<ReporteGeneralFilterFormModel>(createEmptyGeneralFilterForm())
  const generalFormErrors = ref<Record<string, string>>({})
  const generalIsLoading = ref(false)
  const generalError = ref<string | null>(null)
  const generalHasQueried = ref(false)

  const generalRowsCL = ref<RegistroCL[]>([])
  const generalRowsPET = ref<RegistroPET[]>([])

  const generalPageSize = ref(10)
  const generalCurrentPage = ref(1)

  const generalResultCount = computed(() =>
    generalForm.scope === 'linea' ? generalRowsCL.value.length : generalRowsPET.value.length
  )
  const generalTotalPages = computed(() => Math.max(1, Math.ceil(generalResultCount.value / generalPageSize.value)))
  const generalCanPrevPage = computed(() => generalCurrentPage.value > 1)
  const generalCanNextPage = computed(() => generalCurrentPage.value < generalTotalPages.value)

  const paginatedGeneralCL = computed(() => {
    const start = (generalCurrentPage.value - 1) * generalPageSize.value
    return generalRowsCL.value.slice(start, start + generalPageSize.value)
  })
  const paginatedGeneralPET = computed(() => {
    const start = (generalCurrentPage.value - 1) * generalPageSize.value
    return generalRowsPET.value.slice(start, start + generalPageSize.value)
  })

  interface SummarySlice { label: string; count: number; color: string }

  const PIE_COLORS = ['#00357F', '#0EA5E9', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316', '#6366F1']

  const generalSummary = computed(() => {
    const rows = generalForm.scope === 'linea' ? generalRowsCL.value : generalRowsPET.value
    const total = rows.length
    if (!total) return null

    const dates = rows.map(r => r.fecha).filter(Boolean)
    const fechaMin = dates.length ? dates.reduce((a, b) => a < b ? a : b) : ''
    const fechaMax = dates.length ? dates.reduce((a, b) => a > b ? a : b) : ''

    const lineaKey = generalForm.scope === 'linea' ? 'lineaNegocio' : 'lineaDeNegocio'
    const byLinea: Record<string, number> = {}
    for (const r of rows) {
      const ln = (r as any)[lineaKey] || 'Sin línea'
      byLinea[ln] = (byLinea[ln] || 0) + 1
    }

    const lineaSlices: SummarySlice[] = Object.entries(byLinea)
      .sort((a, b) => b[1] - a[1])
      .map(([label, count], i) => ({ label, count, color: PIE_COLORS[i % PIE_COLORS.length]! }))

    let aprobados = 0
    let rechazados = 0
    if (tipo === 'validacion') {
      for (const r of rows) {
        const e = String(r.estatus ?? '').toUpperCase()
        if (e === 'ACEPTADO' || e === 'EXITOSO' || e === 'OK') aprobados++
        else if (e === 'RECHAZADO' || e === 'ERROR') rechazados++
      }
    }

    return { total, fechaMin, fechaMax, lineaSlices, aprobados, rechazados }
  })

  function resetGeneralResults() {
    generalHasQueried.value = false
    generalRowsCL.value = []
    generalRowsPET.value = []
    generalError.value = null
    generalCurrentPage.value = 1
    generalFormErrors.value = {}
  }

  function handleGeneralClear() {
    Object.assign(generalForm, createEmptyGeneralFilterForm())
    generalForm.scope = form.scope
    resetGeneralResults()
  }

  async function handleGeneralConsultar() {
    const validation = validateGeneralFilterForm(generalForm)
    generalFormErrors.value = validation.errors
    if (!validation.valid) return

    generalIsLoading.value = true
    generalError.value = null
    generalHasQueried.value = true
    generalCurrentPage.value = 1

    try {
      if (generalForm.scope === 'linea') {
        const filtros = buildGeneralCLBody(generalForm)
        generalRowsCL.value = await reporteService.getGeneralCL(generalTipo, filtros)
        generalRowsPET.value = []
      } else {
        const filtros = buildGeneralPETBody(generalForm)
        generalRowsPET.value = await reporteService.getGeneralPET(generalTipo, filtros)
        generalRowsCL.value = []
      }
    } catch (e: any) {
      generalError.value = e.message ?? 'Error al consultar el reporte general'
    } finally {
      generalIsLoading.value = false
    }
  }

  function generalPrevPage() {
    if (generalCanPrevPage.value) generalCurrentPage.value--
  }
  function generalNextPage() {
    if (generalCanNextPage.value) generalCurrentPage.value++
  }

  onMounted(loadCatalogos)

  return {
    tipo,
    form,
    formErrors,
    isLoading,
    error,
    hasQueried,
    exportLoading,

    lineasCatalogo,
    campanasCatalogo,

    registrosCL,
    registrosPET,
    paginatedCL,
    paginatedPET,
    resultCount,
    currentPage,
    totalPages,
    canPrevPage,
    canNextPage,

    scopeTabs,
    consultaMode,
    consultaModeTabs,

    handleScopeChange,
    handleConsultar,
    handleClear,
    handleExportCsv,
    handleExportPdf,
    prevPage,
    nextPage,

    supportsGeneral,
    generalTipo,
    generalForm,
    generalFormErrors,
    generalIsLoading,
    generalError,
    generalHasQueried,
    generalResultCount,
    generalCurrentPage,
    generalTotalPages,
    generalCanPrevPage,
    generalCanNextPage,
    paginatedGeneralCL,
    paginatedGeneralPET,
    generalSummary,
    handleGeneralConsultar,
    handleGeneralClear,
    generalPrevPage,
    generalNextPage
  }
}