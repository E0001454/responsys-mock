import { computed, onMounted, reactive, ref } from 'vue'
import { catalogosService } from '@/services/catalogos/catalogosService'
import { reporteService } from '@/services/reportes/reporteService'
import type { CatalogoItem } from '@/types/catalogos/catalogos'
import type {
  RegistroCL,
  RegistroPET,
  ReporteTipo,
  ReporteScope
} from '@/types/reportes/reporte'
import {
  createEmptyReporteFilterForm,
  validateReporteFilterForm,
  buildCLBody,
  buildPETBody,
  type ReporteFilterFormModel
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

export function useReportesViewModel(tipo: ReporteTipo) {
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

    handleScopeChange,
    handleConsultar,
    handleClear,
    handleExportCsv,
    handleExportPdf,
    prevPage,
    nextPage
  }
}
