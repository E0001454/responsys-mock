import { ref, type ComputedRef, type Ref } from 'vue'
import { tareaMonitorService } from '@/services/tareas/monitor/tareaMonitorService'
import type {
  MonitorScope,
  TareaMonitorCampanaData,
  TareaMonitorData
} from '@/types/tareas/monitor'
import { formatTimeLabel } from '@/utils/tareas/monitor/tareasMonitorFormat.utils'
import { canApproveStageByRules } from '@/utils/tareas/monitor/monitorStatusRules.utils'
import { convertRowsToCSV, downloadCsvFile } from '@/utils/reports/csvExport'
import { downloadTareasMonitorPdfReport } from '@/utils/reports/tareasMonitorPdfReport'

export type MonitorTabKey = 'linea' | 'campana'

interface DownloadReportOptions {
  format: 'csv' | 'pdf'
  includeDetails: boolean
  contentType: 'all' | 'en-curso'
}

interface UseTareasMonitorReportDeps {
  activeTab: Ref<MonitorTabKey>
  filteredRows: ComputedRef<TareaMonitorData[]>
  getScopeFromTab: (tab: MonitorTabKey) => MonitorScope
  getLineaLabel: (row: TareaMonitorData) => string
  getCampanaLabel: (row: TareaMonitorData) => string
  getActividadLabel: (row: TareaMonitorData) => string
  getStatusLabel: (row: TareaMonitorData) => string
  getHorarioLabel: (row: TareaMonitorData) => string
  showDictaminarFor: (row: TareaMonitorData) => boolean
  canDictaminarFor: (row: TareaMonitorData) => boolean
  closeReportModal: () => void
  onError?: (error: unknown) => void
}

export function useTareasMonitorReport(deps: UseTareasMonitorReportDeps) {
  const reportDownloadLoading = ref(false)

  function getApproveExportState(stage: TareaMonitorData) {
    const isValidation = String(stage.actividad.codigo).toUpperCase() === 'VALIDACION'
    const mode = String(stage.ejecucion.modo).toUpperCase()
    const isManualOrHybrid = mode === 'MANUAL' || mode === 'HIBRIDA'
    if (isValidation && isManualOrHybrid && stage.fechaInicio) return 'Aprobado'
    return canApproveStageByRules(stage) ? 'Disponible' : 'Pendiente'
  }

  function getDictamenExportState(stage: TareaMonitorData) {
    if (!deps.showDictaminarFor(stage)) return 'No aplica'
    if (stage.dictaminado) return 'Dictaminado'
    return deps.canDictaminarFor(stage) ? 'Disponible' : 'Pendiente'
  }

  async function resolveReportDetailRows(baseRows: TareaMonitorData[], includeAllPipelineRows: boolean): Promise<TareaMonitorData[]> {
    const uniqueKeys = Array.from(new Set(baseRows.map(row => `${row.scope}|${row.pipelineId}`)))
    if (!uniqueKeys.length) return []

    const detailsByPipeline = new Map<string, TareaMonitorData[]>()

    await Promise.all(
      uniqueKeys.map(async key => {
        const [scope, pipelineId] = key.split('|')
        if (!pipelineId || (scope !== 'linea' && scope !== 'campana')) {
          detailsByPipeline.set(key, [])
          return
        }
        try {
          const details = await tareaMonitorService.getPipelineDetalle(scope as MonitorScope, pipelineId)
          detailsByPipeline.set(key, details)
        } catch {
          detailsByPipeline.set(key, [])
        }
      })
    )

    if (includeAllPipelineRows) {
      const dedupAll = new Map<string, TareaMonitorData>()

      for (const baseRow of baseRows) {
        const key = `${baseRow.scope}|${baseRow.pipelineId}`
        const details = detailsByPipeline.get(key) ?? []

        if (details.length > 0) {
          details.forEach(row => {
            dedupAll.set(`${row.scope}|${row.pipelineId}|${row.etapaIndex}|${row.id}`, row)
          })
        } else {
          dedupAll.set(`${baseRow.scope}|${baseRow.pipelineId}|${baseRow.etapaIndex}|${baseRow.id}`, baseRow)
        }
      }

      return Array.from(dedupAll.values()).sort((a, b) => {
        const lineaA = Number(a.idABCCatLineaNegocio ?? 0)
        const lineaB = Number(b.idABCCatLineaNegocio ?? 0)
        if (lineaA !== lineaB) return lineaA - lineaB

        if (deps.activeTab.value === 'campana') {
          const campanaA = Number((a as TareaMonitorCampanaData).idABCCatCampana ?? 0)
          const campanaB = Number((b as TareaMonitorCampanaData).idABCCatCampana ?? 0)
          if (campanaA !== campanaB) return campanaA - campanaB
        }

        const mapeoCompare = String(a.nombreMapeo ?? '').localeCompare(String(b.nombreMapeo ?? ''))
        if (mapeoCompare !== 0) return mapeoCompare
        return Number(a.etapaIndex ?? 0) - Number(b.etapaIndex ?? 0)
      })
    }

    return baseRows.map(baseRow => {
      const key = `${baseRow.scope}|${baseRow.pipelineId}`
      const candidates = detailsByPipeline.get(key) ?? []
      const exactId = candidates.find(row => Number(row.id ?? 0) === Number(baseRow.id ?? 0))
      if (exactId) return exactId

      const sameStageAndActivity = candidates.find(row =>
        Number(row.etapaIndex ?? -1) === Number(baseRow.etapaIndex ?? -1)
        && String(row.actividad.codigo ?? '').toUpperCase() === String(baseRow.actividad.codigo ?? '').toUpperCase()
      )
      if (sameStageAndActivity) return sameStageAndActivity

      const sameStage = candidates.find(row => Number(row.etapaIndex ?? -1) === Number(baseRow.etapaIndex ?? -1))
      if (sameStage) return sameStage

      return baseRow
    })
  }

  async function resolveReportBaseRows(contentType: 'all' | 'en-curso'): Promise<TareaMonitorData[]> {
    try {
      await tareaMonitorService.refreshScopeData(deps.getScopeFromTab(deps.activeTab.value))
    } catch {
    }

    const rows = deps.filteredRows.value.slice()
    if (contentType === 'en-curso') return rows

    const allDetailRows = await resolveReportDetailRows(rows, true)
    return allDetailRows.length ? allDetailRows : rows
  }

  async function downloadCsvReport(baseRows: TareaMonitorData[], detailRows: TareaMonitorData[], includeDetails: boolean) {
    const detailsData = (detailRows.length ? detailRows : baseRows).map(stage => ({
      Linea: deps.getLineaLabel(stage),
      ...(deps.activeTab.value === 'campana' && { Campana: deps.getCampanaLabel(stage) }),
      'Nombre de ingesta': stage.nombreMapeo,
      Pipeline: stage.pipelineId,
      Etapa: Number(stage.etapaIndex ?? 0) + 1,
      Actividad: stage.actividad.nombre,
      Estatus: stage.estatus.nombre,
      'Fecha inicio': stage.fechaInicio ? new Date(stage.fechaInicio).toLocaleString() : '-',
      'Fecha fin': stage.fechaFin ? new Date(stage.fechaFin).toLocaleString() : '-',
      'Fecha planificacion': stage.fechaCreacion ? new Date(stage.fechaCreacion).toLocaleString() : '-',
      Horario: deps.getHorarioLabel(stage) || (stage.horarioProgramado ? formatTimeLabel(stage.horarioProgramado) : '-'),
      Aprobacion: getApproveExportState(stage),
      'Fecha ejecucion': stage.fechaInicio ? new Date(stage.fechaInicio).toLocaleString() : '-',
      Dictaminacion: getDictamenExportState(stage),
      'Fecha dictaminacion': stage.fechaDictaminacion ? new Date(stage.fechaDictaminacion).toLocaleString() : '-',
      'Fecha completada': stage.fechaFin ? new Date(stage.fechaFin).toLocaleString() : '-',
      'Num registros': `${Number(stage.numeroRegistrosProcesados ?? 0)}/${Number(stage.numeroRegistros ?? 0)}`
    }))

    const summaryData = baseRows.map(row => ({
      Linea: deps.getLineaLabel(row),
      ...(deps.activeTab.value === 'campana' && { Campana: deps.getCampanaLabel(row) }),
      'Nombre de ingesta': row.nombreMapeo,
      Actividad: deps.getActividadLabel(row),
      Estatus: deps.getStatusLabel(row),
      Fecha: row.horarioProgramado ? new Date(row.horarioProgramado).toLocaleString() : '-',
      'Num registros': `${Number(row.numeroRegistrosProcesados ?? 0)}/${Number(row.numeroRegistros ?? 0)}`
    }))

    const csvContent = includeDetails
      ? convertRowsToCSV(detailsData)
      : convertRowsToCSV(summaryData)

    const fileName = `reporte-monitoreo-${deps.activeTab.value}-${new Date().toISOString().split('T')[0]}.csv`
    downloadCsvFile(csvContent, fileName)
  }

  async function downloadReport(options: DownloadReportOptions) {
    reportDownloadLoading.value = true
    try {
      const baseRows = await resolveReportBaseRows(options.contentType)
      const detailRows = options.includeDetails
        ? (options.contentType === 'all' ? baseRows : await resolveReportDetailRows(baseRows, false))
        : []

      if (options.format === 'csv') {
        await downloadCsvReport(baseRows, detailRows, options.includeDetails)
      } else {
        await downloadTareasMonitorPdfReport({
          activeTab: deps.activeTab.value,
          baseRows,
          detailRows,
          includeDetails: options.includeDetails,
          getLineaLabel: deps.getLineaLabel,
          getCampanaLabel: deps.getCampanaLabel,
          getActividadLabel: deps.getActividadLabel,
          getStatusLabel: deps.getStatusLabel,
          getHorarioLabel: deps.getHorarioLabel,
          getApproveExportState,
          getDictamenExportState
        })
      }

      deps.closeReportModal()
    } catch (error) {
      deps.onError?.(error)
    } finally {
      reportDownloadLoading.value = false
    }
  }

  return {
    reportDownloadLoading,
    downloadReport
  }
}
