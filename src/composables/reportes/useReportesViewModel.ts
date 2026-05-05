import { computed, onMounted, reactive, ref } from 'vue'
import { catalogosService } from '@/services/catalogos/catalogosService'
import { reporteService } from '@/services/reportes/reporteService'
import type { CatalogoItem } from '@/types/catalogos/catalogos'
import type {
  RegistroCL,
  RegistroPET,
  RegistroGeneral,
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
import { downloadReporteCsv, downloadGeneralCsv } from '@/utils/reportes/reporteCsv.utils'
import { downloadReportePdfReport, downloadReporteGeneralPdf } from '@/utils/reportes/reportePdf.utils'
import { api } from '@/services/api'

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
      downloadReporteCsv({
        scope: form.scope,
        tipo,
        registrosCL: registrosCL.value,
        registrosPET: registrosPET.value
      })
      addToast('Reporte CSV descargado correctamente', 'success')
      api.postBitacoraByContext('DOWNLOAD', `/reportes/${form.scope}/${tipo}`, {}, `Descarga CSV reporte ${tipo} ${form.scope}`).catch(() => {})
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
      api.postBitacoraByContext('DOWNLOAD', `/reportes/${form.scope}/${tipo}`, {}, `Descarga PDF reporte ${tipo} ${form.scope}`).catch(() => {})
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

  const supportsGeneral = computed(() => tipo === 'carga' || tipo === 'validacion' || tipo === 'envio')
  const generalTipo = tipo as ReporteGeneralTipo

  const generalForm = reactive<ReporteGeneralFilterFormModel>(createEmptyGeneralFilterForm())
  const generalFormErrors = ref<Record<string, string>>({})
  const generalIsLoading = ref(false)
  const generalError = ref<string | null>(null)
  const generalHasQueried = ref(false)

  const generalRows = ref<RegistroGeneral[]>([])

  const generalPageSize = ref(10)
  const generalCurrentPage = ref(1)

  const generalResultCount = computed(() => generalRows.value.length)
  const generalTotalPages = computed(() => Math.max(1, Math.ceil(generalResultCount.value / generalPageSize.value)))
  const generalCanPrevPage = computed(() => generalCurrentPage.value > 1)
  const generalCanNextPage = computed(() => generalCurrentPage.value < generalTotalPages.value)

  const paginatedGeneralRows = computed(() => {
    const start = (generalCurrentPage.value - 1) * generalPageSize.value
    return generalRows.value.slice(start, start + generalPageSize.value)
  })

  interface SummarySlice { label: string; count: number; color: string }

  const PIE_COLORS = ['#00357F', '#0EA5E9', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316', '#6366F1']

  const generalSummary = computed(() => {
    const rows = generalRows.value
    if (!rows.length) return null

    const total = rows.reduce((s, r) => s + r.registros, 0)
    const cargas = rows.length

    const dates = rows.map(r => r.fecha).filter(Boolean)
    const rawMin = dates.length ? dates.reduce((a, b) => a < b ? a : b) : ''
    const rawMax = dates.length ? dates.reduce((a, b) => a > b ? a : b) : ''
    const formatDateOnly = (val: string) => {
      const d = new Date(val)
      if (isNaN(d.getTime())) return val
      return d.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' })
    }
    const fechaMin = rawMin ? formatDateOnly(rawMin) : ''
    const fechaMax = rawMax ? formatDateOnly(rawMax) : ''

    const byLinea: Record<string, number> = {}
    for (const r of rows) {
      const ln = r.lineaNegocio || 'Sin línea'
      byLinea[ln] = (byLinea[ln] || 0) + r.registros
    }

    const lineaSlices: SummarySlice[] = Object.entries(byLinea)
      .sort((a, b) => b[1] - a[1])
      .map(([label, count], i) => ({ label, count, color: PIE_COLORS[i % PIE_COLORS.length]! }))

    let aprobados = 0
    let rechazados = 0
    for (const r of rows) {
      aprobados += r.aprobados ?? 0
      rechazados += r.rechazados ?? 0
    }

    const pendientes = (tipo === 'validacion' && form.scope === 'campana')
      ? rows.reduce((s, r) => s + (r.pendientes ?? 0), 0)
      : undefined

    const actualizaciones = (tipo === 'carga' && form.scope === 'linea')
      ? rows.reduce((s, r) => s + (r.actualizaciones ?? 0), 0)
      : undefined

    return { total, cargas, fechaMin, fechaMax, lineaSlices, aprobados, rechazados, pendientes, actualizaciones }
  })

  function resetGeneralResults() {
    generalHasQueried.value = false
    generalRows.value = []
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
      const sortDesc = (rows: RegistroGeneral[]) =>
        [...rows].sort((a, b) => new Date(b.fecha ?? 0).getTime() - new Date(a.fecha ?? 0).getTime())

      if (generalForm.scope === 'linea') {
        const filtros = buildGeneralCLBody(generalForm)
        generalRows.value = sortDesc(await reporteService.getGeneralCL(generalTipo, filtros))
      } else {
        const filtros = buildGeneralPETBody(generalForm)
        generalRows.value = sortDesc(await reporteService.getGeneralPET(generalTipo, filtros))
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

  const generalExportLoading = ref(false)

  async function handleGeneralExportCsv() {
    if (!generalResultCount.value) {
      addToast('No hay datos para exportar', 'warning')
      return
    }
    generalExportLoading.value = true
    try {
      downloadGeneralCsv({
        scope: generalForm.scope,
        tipo: generalTipo,
        rows: generalRows.value
      })
      addToast('Reporte CSV descargado correctamente', 'success')
      api.postBitacoraByContext('DOWNLOAD', `/reportes/general/${generalForm.scope}/${generalTipo}`, {}, `Descarga CSV reporte general ${generalTipo} ${generalForm.scope}`).catch(() => {})
    } catch {
      addToast('Error al generar el archivo CSV', 'error')
    } finally {
      generalExportLoading.value = false
    }
  }

  async function handleGeneralExportPdf(options?: { includeChart?: boolean }) {
    if (!generalResultCount.value) {
      addToast('No hay datos para exportar', 'warning')
      return
    }
    generalExportLoading.value = true
    try {
      await downloadReporteGeneralPdf({
        scope: generalForm.scope,
        tipo: generalTipo,
        rows: generalRows.value,
        includeChart: options?.includeChart ?? true,
        summary: generalSummary.value
      })
      addToast('Reporte PDF descargado correctamente', 'success')
      api.postBitacoraByContext('DOWNLOAD', `/reportes/general/${generalForm.scope}/${generalTipo}`, {}, `Descarga PDF reporte general ${generalTipo} ${generalForm.scope}`).catch(() => {})
    } catch {
      addToast('Error al generar el archivo PDF', 'error')
    } finally {
      generalExportLoading.value = false
    }
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
    paginatedGeneralRows,
    generalSummary,
    handleGeneralConsultar,
    handleGeneralClear,
    handleGeneralExportCsv,
    handleGeneralExportPdf,
    generalExportLoading,
    generalPrevPage,
    generalNextPage
  }
}
