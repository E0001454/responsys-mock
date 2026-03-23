import type {
  TareaMonitorData,
  TareaMonitorCampanaData,
  TareaMonitorLineaData,
  MonitorExecutionMode,
  MonitorScope,
  MonitorStatusCode,
  MonitorStatusHistoryItem
} from '@/types/tareas/monitor'
import {
  canApproveStageByRules,
  shouldCancelEnvioByRules
} from '@/utils/tareas/monitor/monitorStatusRules.utils'
type StageSeed = {
  activityId: 1 | 2 | 3
  activityCode: 'CARGA' | 'VALIDACION' | 'ENVIO'
  executionMode: MonitorExecutionMode
  executionId: number
  executionCode: string
  executionName: string
  scheduleOffsetMs: number
  durationMs: number
}

type PipelineSeed = {
  pipelineId: string
  scope: MonitorScope
  lineaId: number
  campanaId?: number
  mapeoId: number
  mapeoNombre: string
  createdAtOffsetMs: number
  totalRegistros: number
  dictaminacionRequerida: boolean
  stages: StageSeed[]
}

type StageBlueprint = {
  activityId: 1 | 2 | 3
  mode: MonitorExecutionMode
  offsetMin: number
}

type PipelineBlueprint = {
  pipelineId: string
  scope: MonitorScope
  lineaId: number
  campanaId?: number
  mapeoId: number
  mapeoNombre: string
  createdAtOffsetMin: number
  totalRegistros: number
  dictaminacionRequerida: boolean
  stages: StageBlueprint[]
}

type StageRuntime = {
  approvalAt?: number
  completedStatus: MonitorStatusCode
  completedAt?: number
}

type PipelineRuntime = {
  seed: PipelineSeed
  stageRuntime: StageRuntime[]
  currentIndex: number
}

type StageState = {
  stageIndex: number
  stage: StageSeed
  status: MonitorStatusCode
  scheduleAt: number
  startAt: number | ''
  endAt: number | ''
  processed: number
}

const MIN_STAGE_DURATION_MS = 3 * 60 * 1000
const STAGE_GAP_MS = 12 * 1000
const COMPLETION_OUTCOMES: MonitorStatusCode[] = ['CMP', 'CMP', 'CMP', 'ERR']

let simulationStartedAt = 0
let lineaPipelines: PipelineRuntime[] = []
let campanaPipelines: PipelineRuntime[] = []
const dictaminados = new Map<string, number>()

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function nowIso(ts: number) {
  return new Date(ts).toISOString()
}

function makeStage(
  activityId: 1 | 2 | 3,
  executionMode: MonitorExecutionMode,
  scheduleOffsetMs: number
): StageSeed {
  const activityCode = activityId === 1 ? 'CARGA' : activityId === 2 ? 'VALIDACION' : 'ENVIO'
  const executionName = executionMode === 'AUTOMATICA' ? 'Automática' : executionMode === 'MANUAL' ? 'Manual' : 'Híbrida'
  return {
    activityId,
    activityCode,
    executionMode,
    executionId: executionMode === 'AUTOMATICA' ? 1 : executionMode === 'MANUAL' ? 2 : 3,
    executionCode: executionMode === 'AUTOMATICA' ? 'AUT' : executionMode === 'MANUAL' ? 'MNL' : 'HIB',
    executionName,
    scheduleOffsetMs,
    durationMs: MIN_STAGE_DURATION_MS + randomInt(0, 110000)
  }
}

function pickCompletionStatus(): MonitorStatusCode {
  const index = randomInt(0, COMPLETION_OUTCOMES.length - 1)
  return COMPLETION_OUTCOMES[index] ?? 'CMP'
}

function toMsFromMinutes(minutes: number) {
  return minutes * 60 * 1000
}

function withMinuteJitter(baseMinutes: number, jitterRange = 2) {
  return toMsFromMinutes(baseMinutes) + randomInt(-jitterRange, jitterRange) * 60 * 1000
}

function buildPipelineFromBlueprint(blueprint: PipelineBlueprint): PipelineSeed {
  return {
    pipelineId: blueprint.pipelineId,
    scope: blueprint.scope,
    lineaId: blueprint.lineaId,
    campanaId: blueprint.campanaId,
    mapeoId: blueprint.mapeoId,
    mapeoNombre: blueprint.mapeoNombre,
    createdAtOffsetMs: toMsFromMinutes(blueprint.createdAtOffsetMin),
    totalRegistros: blueprint.totalRegistros,
    dictaminacionRequerida: blueprint.dictaminacionRequerida,
    stages: blueprint.stages.map(stage =>
      makeStage(stage.activityId, stage.mode, withMinuteJitter(stage.offsetMin))
    )
  }
}

function buildBaseSeeds(): PipelineSeed[] {
  const blueprints: PipelineBlueprint[] = [
    {
      pipelineId: 'LN-1-8',
      scope: 'linea',
      lineaId: 1,
      mapeoId: 8,
      mapeoNombre: 'Clientes Activos Diario',
      createdAtOffsetMin: -85,
      totalRegistros: 125000,
      dictaminacionRequerida: true,
      stages: [
        { activityId: 1, mode: 'AUTOMATICA', offsetMin: -65 },
        { activityId: 2, mode: 'MANUAL', offsetMin: -46 },
        { activityId: 3, mode: 'HIBRIDA', offsetMin: -18 }
      ]
    },
    {
      pipelineId: 'LN-2-14',
      scope: 'linea',
      lineaId: 2,
      mapeoId: 14,
      mapeoNombre: 'Movimientos de Cartera',
      createdAtOffsetMin: -62,
      totalRegistros: 82000,
      dictaminacionRequerida: true,
      stages: [
        { activityId: 1, mode: 'HIBRIDA', offsetMin: -36 },
        { activityId: 2, mode: 'AUTOMATICA', offsetMin: -11 },
        { activityId: 2, mode: 'MANUAL', offsetMin: 2 },
        { activityId: 3, mode: 'AUTOMATICA', offsetMin: 16 }
      ]
    },
    {
      pipelineId: 'CP-1-3',
      scope: 'campana',
      lineaId: 1,
      campanaId: 1,
      mapeoId: 3,
      mapeoNombre: 'Campana Bienvenida Q1',
      createdAtOffsetMin: -64,
      totalRegistros: 21000,
      dictaminacionRequerida: true,
      stages: [
        { activityId: 2, mode: 'MANUAL', offsetMin: -36 },
        { activityId: 3, mode: 'AUTOMATICA', offsetMin: -9 }
      ]
    },
    {
      pipelineId: 'CP-2-4',
      scope: 'campana',
      lineaId: 1,
      campanaId: 2,
      mapeoId: 4,
      mapeoNombre: 'Campana Reactivacion Plus',
      createdAtOffsetMin: -43,
      totalRegistros: 33000,
      dictaminacionRequerida: true,
      stages: [
        { activityId: 2, mode: 'HIBRIDA', offsetMin: -17 },
        { activityId: 2, mode: 'AUTOMATICA', offsetMin: -3 },
        { activityId: 3, mode: 'AUTOMATICA', offsetMin: 11 }
      ]
    }
  ]

  return blueprints.map(buildPipelineFromBlueprint)
}

function buildRuntime(seed: PipelineSeed): PipelineRuntime {
  return {
    seed,
    currentIndex: 0,
    stageRuntime: seed.stages.map(() => ({
      completedStatus: pickCompletionStatus()
    }))
  }
}

function resetSimulationState() {
  simulationStartedAt = Date.now()
  dictaminados.clear()
  const allSeeds = buildBaseSeeds()
  lineaPipelines = allSeeds.filter(seed => seed.scope === 'linea').map(buildRuntime)
  campanaPipelines = allSeeds.filter(seed => seed.scope === 'campana').map(buildRuntime)
}

function ensureSimulationStarted() {
  if (simulationStartedAt > 0 && lineaPipelines.length && campanaPipelines.length) return
  resetSimulationState()
}

function getStatusMeta(code: MonitorStatusCode) {
  if (code === 'PLN') return { id: 1, code: 'PLN', name: 'Planificada' }
  if (code === 'EJC') return { id: 2, code: 'EJC', name: 'En ejecución' }
  if (code === 'APB') return { id: 3, code: 'APB', name: 'Aprobada' }
  if (code === 'CMP') return { id: 4, code: 'CMP', name: 'Completada ' }
  if (code === 'ERR') return { id: 5, code: 'ERR', name: 'Error ' }
  if (code === 'DCT') return { id: 6, code: 'DCT', name: 'Dictaminada' }
  return { id: 5, code: 'ERR', name: 'Error ' }
}

function getActivityMeta(activityId: 1 | 2 | 3) {
  if (activityId === 1) return { id: 1, code: 'CARGA', name: 'Carga' }
  if (activityId === 2) return { id: 2, code: 'VALIDACION', name: 'Validación' }
  return { id: 3, code: 'ENVIO', name: 'Envío' }
}

function isValidationDictaminated(pipeline: PipelineRuntime): boolean {
  return pipeline.seed.stages.some((stage, index) =>
    stage.activityId === 2 && dictaminados.has(`${pipeline.seed.pipelineId}:s${index}`)
  )
}

function buildMockStatusHistory(params: {
  statusCode: MonitorStatusCode
  scheduleAt: number
  startAt: number | ''
  endAt: number | ''
  approvalAt?: number
  dictaminacionAt?: number
  executionMode: MonitorExecutionMode
}): MonitorStatusHistoryItem[] {
  const events: Array<{ code: MonitorStatusCode; at?: number }> = [
    { code: 'PLN', at: params.scheduleAt }
  ]

  if (params.approvalAt && params.executionMode !== 'AUTOMATICA') {
    events.push({ code: 'APB', at: params.approvalAt })
  }

  if (params.startAt) {
    events.push({ code: 'EJC', at: Number(params.startAt) })
  }

  if (params.endAt && params.statusCode !== 'PLN' && params.statusCode !== 'EJC') {
    events.push({ code: params.statusCode, at: Number(params.endAt) })
  }

  if (params.dictaminacionAt) {
    events.push({ code: 'DCT', at: params.dictaminacionAt })
  }

  return events
    .filter(event => Number.isFinite(event.at))
    .sort((a, b) => Number(b.at) - Number(a.at))
    .map(event => {
      const meta = getStatusMeta(event.code)
      return {
        id: meta.id,
        codigo: meta.code,
        nombre: meta.name,
        fechaCreacion: nowIso(Number(event.at))
      }
    })
}

function pickDisplayStage(states: StageState[]): StageState | undefined {
  if (!states.length) return undefined

  const orderedByIndex = states.slice().sort((a, b) => a.stageIndex - b.stageIndex)
  const running = orderedByIndex.find(state => state.status === 'EJC')
  if (running) return running

  const planned = orderedByIndex.find(state => state.status === 'PLN')
  if (planned) return planned

  
  return orderedByIndex[orderedByIndex.length - 1]
}

function resolveStageState(
  pipeline: PipelineRuntime,
  stageIndex: number,
  now: number
): StageState {
  const stage = pipeline.seed.stages[stageIndex]
  const runtime = pipeline.stageRuntime[stageIndex]
  if (!stage || !runtime) {
    return {
      stageIndex,
      stage: makeStage(1, 'AUTOMATICA', 0),
      status: 'ERR',
      scheduleAt: now,
      startAt: '',
      endAt: '',
      processed: 0
    }
  }

  const scheduleAt = simulationStartedAt + stage.scheduleOffsetMs

  if (runtime.completedAt && now >= runtime.completedAt) {
    return {
      stageIndex,
      stage,
      status: runtime.completedStatus,
      scheduleAt,
      startAt: runtime.approvalAt ?? scheduleAt,
      endAt: runtime.completedAt,
      processed: pipeline.seed.totalRegistros
    }
  }

  const startAt = runtime.approvalAt ?? scheduleAt

  if (now < scheduleAt && !(stage.executionMode === 'HIBRIDA' && runtime.approvalAt)) {
    return {
      stageIndex,
      stage,
      status: 'PLN' as MonitorStatusCode,
      scheduleAt,
      startAt: '',
      endAt: '',
      processed: 0
    }
  }

  if ((stage.executionMode === 'MANUAL' || stage.executionMode === 'HIBRIDA') && !runtime.approvalAt) {
    return {
      stageIndex,
      stage,
      status: 'PLN' as MonitorStatusCode,
      scheduleAt,
      startAt: '',
      endAt: '',
      processed: 0
    }
  }

  const elapsed = Math.max(0, now - Number(startAt))
  if (elapsed < stage.durationMs) {
    const ratio = elapsed / stage.durationMs
    return {
      stageIndex,
      stage,
      status: 'EJC' as MonitorStatusCode,
      scheduleAt,
      startAt,
      endAt: '',
      processed: Math.min(pipeline.seed.totalRegistros, Math.floor(pipeline.seed.totalRegistros * ratio))
    }
  }

  const completedAt = Number(startAt) + stage.durationMs
  runtime.completedAt = completedAt
  return {
    stageIndex,
    stage,
    status: runtime.completedStatus,
    scheduleAt,
    startAt,
    endAt: completedAt,
    processed: pipeline.seed.totalRegistros
  }
}

function advancePipelineCursor(pipeline: PipelineRuntime, now: number) {
  while (pipeline.currentIndex < pipeline.seed.stages.length - 1) {
    const state = resolveStageState(pipeline, pipeline.currentIndex, now)
    if (!state.endAt) break

    const canAdvanceAt = Number(state.endAt) + STAGE_GAP_MS
    if (now < canAdvanceAt) break
    pipeline.currentIndex += 1
  }
}

function toMonitorRow(pipeline: PipelineRuntime, now: number): TareaMonitorData {
  advancePipelineCursor(pipeline, now)

  if (!pipeline.seed.stages.length) {
    const base = {
      id: Number(`${pipeline.seed.scope === 'linea' ? 1 : 2}${String(pipeline.seed.pipelineId).replace(/\D/g, '').slice(-5)}0`),
      scope: pipeline.seed.scope,
      pipelineId: pipeline.seed.pipelineId,
      idABCCatLineaNegocio: pipeline.seed.lineaId,
      idABCConfigMapeo: pipeline.seed.mapeoId,
      nombreMapeo: pipeline.seed.mapeoNombre,
      actividad: { id: 1, codigo: 'CARGA', nombre: 'Carga' },
      estatus: { id: 7, codigo: 'ERR', nombre: 'Con error' },
      ejecucion: { id: 1, codigo: 'AUT', nombre: 'Automática', modo: 'AUTOMATICA' as const },
      etapaIndex: 0,
      horarioProgramado: nowIso(now),
      fechaCreacion: nowIso(simulationStartedAt + pipeline.seed.createdAtOffsetMs),
      fechaInicio: '',
      fechaFin: '',
      fechaUltimaModificacion: nowIso(now),
      numeroRegistros: pipeline.seed.totalRegistros,
      numeroRegistrosProcesados: 0,
      dictaminacionRequerida: pipeline.seed.dictaminacionRequerida,
      dictaminado: false
    }

    if (pipeline.seed.scope === 'campana') {
      return {
        ...base,
        scope: 'campana',
        idABCCatCampana: Number(pipeline.seed.campanaId ?? 0)
      } as TareaMonitorCampanaData
    }

    return {
      ...base,
      scope: 'linea'
    } as TareaMonitorLineaData
  }

  const states = pipeline.seed.stages.map((_, idx) => resolveStageState(pipeline, idx, now))
  const currentState = pickDisplayStage(states) ?? states[pipeline.currentIndex] ?? states[0]
  if (!currentState) {
    return {
      id: Number(`${pipeline.seed.scope === 'linea' ? 1 : 2}${String(pipeline.seed.pipelineId).replace(/\D/g, '').slice(-5)}0`),
      scope: pipeline.seed.scope,
      pipelineId: pipeline.seed.pipelineId,
      idABCCatLineaNegocio: pipeline.seed.lineaId,
      idABCConfigMapeo: pipeline.seed.mapeoId,
      nombreMapeo: pipeline.seed.mapeoNombre,
      actividad: { id: 1, codigo: 'CARGA', nombre: 'Carga' },
      estatus: { id: 7, codigo: 'ERR', nombre: 'Con error' },
      ejecucion: { id: 1, codigo: 'AUT', nombre: 'Automática', modo: 'AUTOMATICA' },
      etapaIndex: 0,
      horarioProgramado: nowIso(now),
      fechaCreacion: nowIso(simulationStartedAt + pipeline.seed.createdAtOffsetMs),
      fechaInicio: '',
      fechaFin: '',
      fechaUltimaModificacion: nowIso(now),
      numeroRegistros: pipeline.seed.totalRegistros,
      numeroRegistrosProcesados: 0,
      dictaminacionRequerida: pipeline.seed.dictaminacionRequerida,
      dictaminado: false
    } as TareaMonitorData
  }

  const actividad = getActivityMeta(currentState.stage.activityId)
  const resolvedStatusCode: MonitorStatusCode = shouldCancelEnvioByRules({
    envioStatusCode: currentState.status,
    dictaminacionRequerida: pipeline.seed.dictaminacionRequerida,
    validationDictaminated: isValidationDictaminated(pipeline)
  }) && currentState.stage.activityId === 3
    ? 'CNC'
    : currentState.status
  const estatus = getStatusMeta(resolvedStatusCode)
  const dictamenKey = `${pipeline.seed.pipelineId}:s${currentState.stageIndex}`
  const stageRuntime = pipeline.stageRuntime[currentState.stageIndex]
  const fechaAprobada = stageRuntime?.approvalAt && currentState.stage.executionMode !== 'AUTOMATICA'
    ? nowIso(stageRuntime.approvalAt) : ''
  const dictaminacionAt = dictaminados.get(dictamenKey)
  const fechaDictaminacion = dictaminacionAt ? nowIso(dictaminacionAt) : ''
  const stageError = resolvedStatusCode === 'ERR'
    ? { nombre: 'Error de procesamiento', codigo: `ERR-${pipeline.seed.pipelineId.replace(/[^0-9]/g, '').slice(-3).padStart(3, '0')}`, detalle: `Se produjo un error al procesar los registros en la etapa de ${actividad.name.toLowerCase()}. Verifique la configuración e intente nuevamente.` }
    : undefined
  const statusHistory = buildMockStatusHistory({
    statusCode: resolvedStatusCode,
    scheduleAt: currentState.scheduleAt,
    startAt: currentState.startAt,
    endAt: currentState.endAt,
    approvalAt: stageRuntime?.approvalAt,
    dictaminacionAt,
    executionMode: currentState.stage.executionMode
  })

  const base = {
    id: Number(`${pipeline.seed.scope === 'linea' ? 1 : 2}${String(pipeline.seed.pipelineId).replace(/\D/g, '').slice(-5)}${currentState.stageIndex}`),
    scope: pipeline.seed.scope,
    pipelineId: pipeline.seed.pipelineId,
    idABCCatLineaNegocio: pipeline.seed.lineaId,
    idABCConfigMapeo: pipeline.seed.mapeoId,
    nombreMapeo: pipeline.seed.mapeoNombre,
    actividad: {
      id: actividad.id,
      codigo: actividad.code,
      nombre: actividad.name
    },
    estatus: {
      id: estatus.id,
      codigo: estatus.code,
      nombre: estatus.name
    },
    estatusHistorial: statusHistory,
    ejecucion: {
      id: currentState.stage.executionId,
      codigo: currentState.stage.executionCode,
      nombre: currentState.stage.executionName,
      modo: currentState.stage.executionMode
    },
    etapaIndex: currentState.stageIndex,
    horarioProgramado: nowIso(currentState.scheduleAt),
    fechaCreacion: nowIso(simulationStartedAt + pipeline.seed.createdAtOffsetMs),
    fechaInicio: currentState.startAt ? nowIso(Number(currentState.startAt)) : '',
    fechaFin: currentState.endAt ? nowIso(Number(currentState.endAt)) : '',
    fechaUltimaModificacion: nowIso(now),
    numeroRegistros: pipeline.seed.totalRegistros,
    numeroRegistrosProcesados: currentState.processed,
    dictaminacionRequerida: pipeline.seed.dictaminacionRequerida,
    dictaminado: dictaminados.has(dictamenKey),
    fechaAprobada,
    fechaDictaminacion,
    error: stageError
  }

  if (pipeline.seed.scope === 'campana') {
    return {
      ...base,
      scope: 'campana',
      idABCCatCampana: Number(pipeline.seed.campanaId ?? 0)
    } as TareaMonitorCampanaData
  }

  return {
    ...base,
    scope: 'linea'
  } as TareaMonitorLineaData
}

function toMonitorRowByStage(
  pipeline: PipelineRuntime,
  stageState: StageState,
  now: number
): TareaMonitorData {
  const actividad = getActivityMeta(stageState.stage.activityId)
  const resolvedStatusCode: MonitorStatusCode = shouldCancelEnvioByRules({
    envioStatusCode: stageState.status,
    dictaminacionRequerida: pipeline.seed.dictaminacionRequerida,
    validationDictaminated: isValidationDictaminated(pipeline)
  }) && stageState.stage.activityId === 3
    ? 'CNC'
    : stageState.status
  const estatus = getStatusMeta(resolvedStatusCode)
  const dictamenKey = `${pipeline.seed.pipelineId}:s${stageState.stageIndex}`
  const stageRuntime = pipeline.stageRuntime[stageState.stageIndex]
  const fechaAprobada = stageRuntime?.approvalAt && stageState.stage.executionMode !== 'AUTOMATICA'
    ? nowIso(stageRuntime.approvalAt) : ''
  const dictaminacionAt = dictaminados.get(dictamenKey)
  const fechaDictaminacion = dictaminacionAt ? nowIso(dictaminacionAt) : ''
  const stageError = resolvedStatusCode === 'ERR'
    ? { nombre: 'Error de procesamiento', codigo: `ERR-${pipeline.seed.pipelineId.replace(/[^0-9]/g, '').slice(-3).padStart(3, '0')}`, detalle: `Se produjo un error al procesar los registros en la etapa de ${actividad.name.toLowerCase()}. Verifique la configuración e intente nuevamente.` }
    : undefined
  const statusHistory = buildMockStatusHistory({
    statusCode: resolvedStatusCode,
    scheduleAt: stageState.scheduleAt,
    startAt: stageState.startAt,
    endAt: stageState.endAt,
    approvalAt: stageRuntime?.approvalAt,
    dictaminacionAt,
    executionMode: stageState.stage.executionMode
  })

  const base = {
    id: Number(`${pipeline.seed.scope === 'linea' ? 1 : 2}${String(pipeline.seed.pipelineId).replace(/\D/g, '').slice(-5)}${stageState.stageIndex}`),
    scope: pipeline.seed.scope,
    pipelineId: pipeline.seed.pipelineId,
    idABCCatLineaNegocio: pipeline.seed.lineaId,
    idABCConfigMapeo: pipeline.seed.mapeoId,
    nombreMapeo: pipeline.seed.mapeoNombre,
    actividad: {
      id: actividad.id,
      codigo: actividad.code,
      nombre: actividad.name
    },
    estatus: {
      id: estatus.id,
      codigo: estatus.code,
      nombre: estatus.name
    },
    estatusHistorial: statusHistory,
    ejecucion: {
      id: stageState.stage.executionId,
      codigo: stageState.stage.executionCode,
      nombre: stageState.stage.executionName,
      modo: stageState.stage.executionMode
    },
    etapaIndex: stageState.stageIndex,
    horarioProgramado: nowIso(stageState.scheduleAt),
    fechaCreacion: nowIso(simulationStartedAt + pipeline.seed.createdAtOffsetMs),
    fechaInicio: stageState.startAt ? nowIso(Number(stageState.startAt)) : '',
    fechaFin: stageState.endAt ? nowIso(Number(stageState.endAt)) : '',
    fechaUltimaModificacion: nowIso(now),
    numeroRegistros: pipeline.seed.totalRegistros,
    numeroRegistrosProcesados: stageState.processed,
    dictaminacionRequerida: pipeline.seed.dictaminacionRequerida,
    dictaminado: dictaminados.has(dictamenKey),
    fechaAprobada,
    fechaDictaminacion,
    error: stageError
  }

  if (pipeline.seed.scope === 'campana') {
    return {
      ...base,
      scope: 'campana',
      idABCCatCampana: Number(pipeline.seed.campanaId ?? 0)
    } as TareaMonitorCampanaData
  }

  return {
    ...base,
    scope: 'linea'
  } as TareaMonitorLineaData
}

function getRows(scope: MonitorScope) {
  ensureSimulationStarted()
  const now = Date.now()
  const source = scope === 'linea' ? lineaPipelines : campanaPipelines
  return source.map(pipeline => toMonitorRow(pipeline, now))
}

function findPipeline(scope: MonitorScope, pipelineId: string) {
  const source = scope === 'linea' ? lineaPipelines : campanaPipelines
  return source.find(item => item.seed.pipelineId === pipelineId)
}

function findStageState(scope: MonitorScope, pipelineId: string, stageIndex: number) {
  const pipeline = findPipeline(scope, pipelineId)
  if (!pipeline) return null
  const now = Date.now()
  return resolveStageState(pipeline, stageIndex, now)
}

export const tareaMonitorMockService = {
  resetSimulation() {
    resetSimulationState()
  },

  async getLinea() {
    return getRows('linea') as TareaMonitorLineaData[]
  },

  async getCampana() {
    return getRows('campana') as TareaMonitorCampanaData[]
  },

  async getPipelineDetalle(scope: MonitorScope, pipelineId: string) {
    ensureSimulationStarted()
    const pipeline = findPipeline(scope, pipelineId)
    if (!pipeline) return [] as TareaMonitorData[]
    const now = Date.now()
    const states = pipeline.seed.stages
      .map((_, idx) => resolveStageState(pipeline, idx, now))
      .sort((a, b) => a.stageIndex - b.stageIndex)
    return states.map(state => toMonitorRowByStage(pipeline, state, now))
  },

  async approveEjecucion(scope: MonitorScope, pipelineId: string, stageIndex: number) {
    const pipeline = findPipeline(scope, pipelineId)
    if (!pipeline) return null

    const stage = pipeline.seed.stages[stageIndex]
    if (!stage) return null
    if (stage.executionMode === 'AUTOMATICA') return null

    const state = findStageState(scope, pipelineId, stageIndex)
    if (!state) return null
    if (state.status !== 'PLN') return null

    const previewRow = toMonitorRowByStage(pipeline, state, Date.now())
    if (!canApproveStageByRules(previewRow)) return null

    const runtime = pipeline.stageRuntime[stageIndex]
    if (!runtime) return null
    runtime.approvalAt = Date.now()
    return toMonitorRow(pipeline, Date.now())
  },

  async dictaminar(scope: MonitorScope, pipelineId: string, stageIndex: number) {
    const row = (await (scope === 'linea' ? this.getLinea() : this.getCampana()))
      .find(item => item.pipelineId === pipelineId && item.etapaIndex === stageIndex)
    if (!row) return null
    if (row.actividad.codigo !== 'VALIDACION') return null
    if (!row.dictaminacionRequerida) return null
    if (row.estatus.codigo !== 'CMP') return null

    dictaminados.set(`${pipelineId}:s${stageIndex}`, Date.now())
    return row
  }
}
