import type {
  MonitorScope,
  TareaMonitorCampanaData,
  TareaMonitorData,
  TareaMonitorLineaData
} from '@/types/tareas/monitor'
import { api } from '@/services/api'
import {
  normalizeRealRows,
  pickCurrentRowsByMapeo,
  sortByStageIndex
} from '@/services/tareas/monitor/tareaMonitorRealRows'
import { tareaMonitorMockService } from '@/services/tareas/monitor/tareaMonitorMockService'

function parseEnvBoolean(value: unknown): boolean | undefined {
  if (value === undefined || value === null || value === '') return undefined
  const normalized = String(value).trim().toLowerCase()
  if (normalized === 'true' || normalized === '1' || normalized === 'yes') return true
  if (normalized === 'false' || normalized === '0' || normalized === 'no') return false
  return undefined
}

function shouldUseMockScope(scope: MonitorScope): boolean {
  const envObj = import.meta.env as Record<string, unknown>
  const key = scope === 'linea' ? 'VITE_MS_MONITOR_LINEA_USE_MOCK' : 'VITE_MS_MONITOR_CAMPANA_USE_MOCK'
  const specific = parseEnvBoolean(envObj[key])
  if (specific !== undefined) return specific
  return parseEnvBoolean(envObj.VITE_USE_MOCK) ?? false
}

const realRowsByScope: Record<MonitorScope, TareaMonitorData[]> = {
  linea: [],
  campana: []
}

async function fetchRealRows(scope: MonitorScope): Promise<TareaMonitorData[]> {
  const response = scope === 'linea'
    ? await api.getTareasMonitorLinea()
    : await api.getTareasMonitorCampana()

  const rows = normalizeRealRows(scope, response)
  realRowsByScope[scope] = rows
  return rows
}

function getCachedDetails(scope: MonitorScope, pipelineId: string): TareaMonitorData[] {
  const rows = (realRowsByScope[scope] ?? []).filter(row => row.pipelineId === pipelineId)
  return sortByStageIndex(rows)
}

export const tareaMonitorService = {
  resetSimulation() {
    tareaMonitorMockService.resetSimulation()
    realRowsByScope.linea = []
    realRowsByScope.campana = []
  },

  async getLinea() {
    if (shouldUseMockScope('linea')) {
      return tareaMonitorMockService.getLinea()
    }

    const rows = await fetchRealRows('linea')
    return pickCurrentRowsByMapeo(rows) as TareaMonitorLineaData[]
  },

  async getCampana() {
    if (shouldUseMockScope('campana')) {
      return tareaMonitorMockService.getCampana()
    }

    const rows = await fetchRealRows('campana')
    return pickCurrentRowsByMapeo(rows) as TareaMonitorCampanaData[]
  },

  async getPipelineDetalle(scope: MonitorScope, pipelineId: string) {
    if (shouldUseMockScope(scope)) {
      return tareaMonitorMockService.getPipelineDetalle(scope, pipelineId)
    }

    if (!realRowsByScope[scope].length) {
      await fetchRealRows(scope)
    }

    return getCachedDetails(scope, pipelineId)
  },

  async refreshScopeData(scope: MonitorScope) {
    if (shouldUseMockScope(scope)) return
    await fetchRealRows(scope)
  },

  async approveEjecucion(scope: MonitorScope, pipelineId: string, stageIndex: number) {
    if (shouldUseMockScope(scope)) {
      return tareaMonitorMockService.approveEjecucion(scope, pipelineId, stageIndex)
    }

    void pipelineId
    void stageIndex
    return null
  },

  async dictaminar(scope: MonitorScope, pipelineId: string, stageIndex: number) {
    if (shouldUseMockScope(scope)) {
      return tareaMonitorMockService.dictaminar(scope, pipelineId, stageIndex)
    }

    void pipelineId
    void stageIndex
    return null
  }
}