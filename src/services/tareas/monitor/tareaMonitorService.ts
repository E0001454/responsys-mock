import type {
  TareaMonitorData,
  TareaMonitorCampanaData,
  TareaMonitorLineaData,
  MonitorExecutionMode,
  MonitorScope,
  MonitorStatusCode
} from '@/types/tareas/monitor'
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
const MANUAL_AUTO_START_GRACE_MS = 25 * 1000
const COMPLETION_OUTCOMES: MonitorStatusCode[] = ['CMP', 'CMP', 'CMP', 'BLQ', 'CNC', 'ERR']

let simulationStartedAt = 0
let lineaPipelines: PipelineRuntime[] = []
let campanaPipelines: PipelineRuntime[] = []
const dictaminados = new Set<string>()

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
  const lineaBlueprints: PipelineBlueprint[] = [
    {
      pipelineId: 'LN-1-8',
      scope: 'linea',
      lineaId: 1,
      mapeoId: 8,
      mapeoNombre: 'Ingesta Clientes',
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
      mapeoNombre: 'Ingesta Transacciones',
      createdAtOffsetMin: -62,
      totalRegistros: 82000,
      dictaminacionRequerida: true,
      stages: [
        { activityId: 1, mode: 'HIBRIDA', offsetMin: -36 },
        { activityId: 2, mode: 'AUTOMATICA', offsetMin: -11 },
        { activityId: 3, mode: 'AUTOMATICA', offsetMin: 16 }
      ]
    },
    {
      pipelineId: 'LN-3-12',
      scope: 'linea',
      lineaId: 3,
      mapeoId: 12,
      mapeoNombre: 'Ingesta Ventas',
      createdAtOffsetMin: -44,
      totalRegistros: 56400,
      dictaminacionRequerida: false,
      stages: [
        { activityId: 1, mode: 'MANUAL', offsetMin: -22 },
        { activityId: 2, mode: 'HIBRIDA', offsetMin: 6 },
        { activityId: 3, mode: 'AUTOMATICA', offsetMin: 31 }
      ]
    },
    {
      pipelineId: 'LN-4-25',
      scope: 'linea',
      lineaId: 4,
      mapeoId: 25,
      mapeoNombre: 'Ingesta Cobranza',
      createdAtOffsetMin: -130,
      totalRegistros: 153400,
      dictaminacionRequerida: true,
      stages: [
        { activityId: 1, mode: 'AUTOMATICA', offsetMin: -105 },
        { activityId: 2, mode: 'MANUAL', offsetMin: -76 },
        { activityId: 3, mode: 'AUTOMATICA', offsetMin: -49 }
      ]
    },
    {
      pipelineId: 'LN-5-19',
      scope: 'linea',
      lineaId: 5,
      mapeoId: 19,
      mapeoNombre: 'Ingesta Prospectos',
      createdAtOffsetMin: -72,
      totalRegistros: 70300,
      dictaminacionRequerida: true,
      stages: [
        { activityId: 1, mode: 'HIBRIDA', offsetMin: -53 },
        { activityId: 2, mode: 'AUTOMATICA', offsetMin: -27 },
        { activityId: 3, mode: 'HIBRIDA', offsetMin: -2 }
      ]
    },
    {
      pipelineId: 'LN-6-31',
      scope: 'linea',
      lineaId: 6,
      mapeoId: 31,
      mapeoNombre: 'Ingesta Operaciones',
      createdAtOffsetMin: -38,
      totalRegistros: 48600,
      dictaminacionRequerida: false,
      stages: [
        { activityId: 1, mode: 'MANUAL', offsetMin: -12 },
        { activityId: 2, mode: 'MANUAL', offsetMin: 14 },
        { activityId: 3, mode: 'AUTOMATICA', offsetMin: 42 }
      ]
    },
    {
      pipelineId: 'LN-7-27',
      scope: 'linea',
      lineaId: 7,
      mapeoId: 27,
      mapeoNombre: 'Ingesta Riesgo',
      createdAtOffsetMin: -97,
      totalRegistros: 99800,
      dictaminacionRequerida: true,
      stages: [
        { activityId: 1, mode: 'AUTOMATICA', offsetMin: -78 },
        { activityId: 2, mode: 'AUTOMATICA', offsetMin: -52 },
        { activityId: 3, mode: 'HIBRIDA', offsetMin: -24 }
      ]
    },
    {
      pipelineId: 'LN-8-42',
      scope: 'linea',
      lineaId: 8,
      mapeoId: 42,
      mapeoNombre: 'Ingesta Sucursales',
      createdAtOffsetMin: -29,
      totalRegistros: 35800,
      dictaminacionRequerida: false,
      stages: [
        { activityId: 1, mode: 'HIBRIDA', offsetMin: 2 },
        { activityId: 2, mode: 'AUTOMATICA', offsetMin: 27 },
        { activityId: 3, mode: 'AUTOMATICA', offsetMin: 51 }
      ]
    },
    {
      pipelineId: 'LN-9-37',
      scope: 'linea',
      lineaId: 9,
      mapeoId: 37,
      mapeoNombre: 'Ingesta Nómina',
      createdAtOffsetMin: -55,
      totalRegistros: 61400,
      dictaminacionRequerida: true,
      stages: [
        { activityId: 1, mode: 'AUTOMATICA', offsetMin: -35 },
        { activityId: 2, mode: 'MANUAL', offsetMin: -8 },
        { activityId: 3, mode: 'AUTOMATICA', offsetMin: 18 }
      ]
    },
    {
      pipelineId: 'LN-10-53',
      scope: 'linea',
      lineaId: 10,
      mapeoId: 53,
      mapeoNombre: 'Ingesta Cumplimiento',
      createdAtOffsetMin: -145,
      totalRegistros: 184700,
      dictaminacionRequerida: true,
      stages: [
        { activityId: 1, mode: 'AUTOMATICA', offsetMin: -122 },
        { activityId: 2, mode: 'HIBRIDA', offsetMin: -95 },
        { activityId: 3, mode: 'AUTOMATICA', offsetMin: -68 }
      ]
    }
  ]

  const campanaBlueprints: PipelineBlueprint[] = [
    {
      pipelineId: 'CP-1-3',
      scope: 'campana',
      lineaId: 1,
      campanaId: 1,
      mapeoId: 3,
      mapeoNombre: 'Campana Apertura',
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
      mapeoNombre: 'Campana Fidelizacion',
      createdAtOffsetMin: -43,
      totalRegistros: 33000,
      dictaminacionRequerida: true,
      stages: [
        { activityId: 2, mode: 'HIBRIDA', offsetMin: -17 },
        { activityId: 3, mode: 'AUTOMATICA', offsetMin: 11 }
      ]
    },
    {
      pipelineId: 'CP-3-7',
      scope: 'campana',
      lineaId: 2,
      campanaId: 3,
      mapeoId: 7,
      mapeoNombre: 'Campana Referidos',
      createdAtOffsetMin: -35,
      totalRegistros: 27800,
      dictaminacionRequerida: false,
      stages: [
        { activityId: 2, mode: 'AUTOMATICA', offsetMin: 1 },
        { activityId: 3, mode: 'HIBRIDA', offsetMin: 26 }
      ]
    },
    {
      pipelineId: 'CP-4-11',
      scope: 'campana',
      lineaId: 3,
      campanaId: 4,
      mapeoId: 11,
      mapeoNombre: 'Campana Reactivacion',
      createdAtOffsetMin: -92,
      totalRegistros: 46700,
      dictaminacionRequerida: true,
      stages: [
        { activityId: 2, mode: 'MANUAL', offsetMin: -63 },
        { activityId: 3, mode: 'AUTOMATICA', offsetMin: -34 }
      ]
    },
    {
      pipelineId: 'CP-5-13',
      scope: 'campana',
      lineaId: 4,
      campanaId: 5,
      mapeoId: 13,
      mapeoNombre: 'Campana Lealtad',
      createdAtOffsetMin: -52,
      totalRegistros: 39100,
      dictaminacionRequerida: true,
      stages: [
        { activityId: 2, mode: 'AUTOMATICA', offsetMin: -25 },
        { activityId: 3, mode: 'HIBRIDA', offsetMin: 3 }
      ]
    },
    {
      pipelineId: 'CP-6-18',
      scope: 'campana',
      lineaId: 5,
      campanaId: 6,
      mapeoId: 18,
      mapeoNombre: 'Campana Masivos',
      createdAtOffsetMin: -27,
      totalRegistros: 22400,
      dictaminacionRequerida: false,
      stages: [
        { activityId: 2, mode: 'HIBRIDA', offsetMin: 9 },
        { activityId: 3, mode: 'AUTOMATICA', offsetMin: 32 }
      ]
    },
    {
      pipelineId: 'CP-7-21',
      scope: 'campana',
      lineaId: 6,
      campanaId: 7,
      mapeoId: 21,
      mapeoNombre: 'Campana Temporada',
      createdAtOffsetMin: -118,
      totalRegistros: 55400,
      dictaminacionRequerida: true,
      stages: [
        { activityId: 2, mode: 'MANUAL', offsetMin: -88 },
        { activityId: 3, mode: 'AUTOMATICA', offsetMin: -58 }
      ]
    },
    {
      pipelineId: 'CP-8-26',
      scope: 'campana',
      lineaId: 7,
      campanaId: 8,
      mapeoId: 26,
      mapeoNombre: 'Campana Renovacion',
      createdAtOffsetMin: -70,
      totalRegistros: 31200,
      dictaminacionRequerida: true,
      stages: [
        { activityId: 2, mode: 'AUTOMATICA', offsetMin: -41 },
        { activityId: 3, mode: 'HIBRIDA', offsetMin: -14 }
      ]
    },
    {
      pipelineId: 'CP-9-30',
      scope: 'campana',
      lineaId: 8,
      campanaId: 9,
      mapeoId: 30,
      mapeoNombre: 'Campana Digital',
      createdAtOffsetMin: -46,
      totalRegistros: 28900,
      dictaminacionRequerida: false,
      stages: [
        { activityId: 2, mode: 'AUTOMATICA', offsetMin: -12 },
        { activityId: 3, mode: 'AUTOMATICA', offsetMin: 15 }
      ]
    },
    {
      pipelineId: 'CP-10-34',
      scope: 'campana',
      lineaId: 9,
      campanaId: 10,
      mapeoId: 34,
      mapeoNombre: 'Campana Cierre',
      createdAtOffsetMin: -140,
      totalRegistros: 73300,
      dictaminacionRequerida: true,
      stages: [
        { activityId: 2, mode: 'MANUAL', offsetMin: -109 },
        { activityId: 3, mode: 'AUTOMATICA', offsetMin: -80 }
      ]
    }
  ]

  return [...lineaBlueprints, ...campanaBlueprints].map(buildPipelineFromBlueprint)
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
  if (code === 'EJC') return { id: 1, code: 'EJC', name: 'En ejecución' }
  if (code === 'PLN') return { id: 2, code: 'PLN', name: 'Planificada' }
  if (code === 'CMP') return { id: 4, code: 'CMP', name: 'Completada' }
  if (code === 'BLQ') return { id: 5, code: 'BLQ', name: 'Bloqueada' }
  if (code === 'CNC') return { id: 6, code: 'CNC', name: 'Cancelada' }
  return { id: 7, code: 'ERR', name: 'Con error' }
}

function getActivityMeta(activityId: 1 | 2 | 3) {
  if (activityId === 1) return { id: 1, code: 'CARGA', name: 'Carga' }
  if (activityId === 2) return { id: 2, code: 'VALIDACION', name: 'Validación' }
  return { id: 3, code: 'ENVIO', name: 'Envío' }
}

function statusPriority(code: MonitorStatusCode) {
  if (code === 'EJC') return 1
  if (code === 'PLN') return 2
  if (code === 'CMP') return 3
  if (code === 'BLQ') return 4
  return 5
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

  let startAt = runtime.approvalAt ?? scheduleAt
  if (stage.executionMode === 'MANUAL' && !runtime.approvalAt && now >= scheduleAt + MANUAL_AUTO_START_GRACE_MS) {
    runtime.approvalAt = scheduleAt + MANUAL_AUTO_START_GRACE_MS
    startAt = runtime.approvalAt
  }

  if (now < scheduleAt) {
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

  if (stage.executionMode === 'MANUAL' && !runtime.approvalAt) {
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
  const preferred = states
    .slice()
    .sort((a, b) => {
      const byPriority = statusPriority(a.status) - statusPriority(b.status)
      if (byPriority !== 0) return byPriority
      return a.stageIndex - b.stageIndex
    })[0]

  const currentState = preferred ?? states[pipeline.currentIndex] ?? states[0]
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
  const estatus = getStatusMeta(currentState.status)
  const dictamenKey = `${pipeline.seed.pipelineId}:s${currentState.stageIndex}`

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
    dictaminado: dictaminados.has(dictamenKey)
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

export const tareaMonitorService = {
  resetSimulation() {
    resetSimulationState()
  },

  async getLinea() {
    return getRows('linea') as TareaMonitorLineaData[]
  },

  async getCampana() {
    return getRows('campana') as TareaMonitorCampanaData[]
  },

  async approveEjecucion(scope: MonitorScope, pipelineId: string, stageIndex: number) {
    const pipeline = findPipeline(scope, pipelineId)
    if (!pipeline) return null

    const stage = pipeline.seed.stages[stageIndex]
    if (!stage) return null
    if (stage.executionMode === 'AUTOMATICA') return null

    const state = findStageState(scope, pipelineId, stageIndex)
    if (!state) return null
    if (Date.now() < Number(state.scheduleAt)) return null
    if (state.status !== 'PLN') return null

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

    dictaminados.add(`${pipelineId}:s${stageIndex}`)
    return row
  }
}
