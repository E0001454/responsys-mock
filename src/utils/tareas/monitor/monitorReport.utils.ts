import type {
  MonitorScope,
  TareaMonitorCampanaData,
  TareaMonitorData
} from '@/types/tareas/monitor'

export async function resolveMonitorReportRows(
  contentType: 'all' | 'en-curso',
  filteredRows: TareaMonitorData[],
  activeTab: 'linea' | 'campana',
  getPipelineDetalle: (scope: MonitorScope, pipelineId: string) => Promise<TareaMonitorData[]>
): Promise<TareaMonitorData[]> {
  if (contentType === 'en-curso') {
    return filteredRows.filter(row => String(row.estatus.codigo).toUpperCase() === 'EJC')
  }

  const tableRows = filteredRows.slice()
  const uniquePipelineKeys = Array.from(new Set(tableRows.map(row => `${row.scope}|${row.pipelineId}`)))
  if (!uniquePipelineKeys.length) return tableRows

  const details = await Promise.all(
    uniquePipelineKeys.map(async key => {
      const [scope, pipelineId] = key.split('|')
      if (!pipelineId || (scope !== 'linea' && scope !== 'campana')) return [] as TareaMonitorData[]
      return getPipelineDetalle(scope as MonitorScope, pipelineId)
    })
  )

  const merged = details.flat()
  if (!merged.length) return tableRows

  const dedup = new Map<string, TareaMonitorData>()
  merged.forEach(row => {
    dedup.set(`${row.scope}|${row.pipelineId}|${row.etapaIndex}|${row.id}`, row)
  })

  return Array.from(dedup.values()).sort((a, b) => {
    const lineaA = Number(a.idABCCatLineaNegocio ?? 0)
    const lineaB = Number(b.idABCCatLineaNegocio ?? 0)
    if (lineaA !== lineaB) return lineaA - lineaB

    if (activeTab === 'campana') {
      const campanaA = Number((a as TareaMonitorCampanaData).idABCCatCampana ?? 0)
      const campanaB = Number((b as TareaMonitorCampanaData).idABCCatCampana ?? 0)
      if (campanaA !== campanaB) return campanaA - campanaB
    }

    const mapeoA = String(a.nombreMapeo ?? '')
    const mapeoB = String(b.nombreMapeo ?? '')
    const mapeoCompare = mapeoA.localeCompare(mapeoB)
    if (mapeoCompare !== 0) return mapeoCompare

    return Number(a.etapaIndex ?? 0) - Number(b.etapaIndex ?? 0)
  })
}
