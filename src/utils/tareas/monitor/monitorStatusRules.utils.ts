import type { MonitorExecutionMode, MonitorStatusCode, TareaMonitorData } from '@/types/tareas/monitor'

type RuleStage = Pick<
  TareaMonitorData,
  'actividad' | 'dictaminacionRequerida' | 'dictaminado' | 'estatus' | 'fechaFin' | 'horarioProgramado' | 'ejecucion'
>

const FINAL_STATUS = new Set<MonitorStatusCode>(['CMP', 'DCT', 'CNC', 'BLQ', 'ERR'])

export function canApproveStageByRules(stage: RuleStage, nowTs = Date.now()): boolean {
  const isPlanned = String(stage.estatus.codigo).toUpperCase() === 'PLN'
  if (!isPlanned) return false

  const mode = String(stage.ejecucion.modo).toUpperCase() as MonitorExecutionMode
  if (mode === 'AUTOMATICA') return false

  if (mode === 'MANUAL') {
    const scheduleTs = Date.parse(stage.horarioProgramado)
    const reachedSchedule = Number.isFinite(scheduleTs) ? nowTs >= scheduleTs : false
    return reachedSchedule
  }

  if (mode === 'HIBRIDA') {
    return true
  }

  return false
}

export function canDictaminarStageByRules(stage: RuleStage): boolean {
  const actividadCode = String(stage.actividad.codigo).toUpperCase()
  const statusCode = String(stage.estatus.codigo).toUpperCase()
  const isValidationCompleted = actividadCode === 'VALIDACION' && statusCode === 'CMP' && Boolean(stage.fechaFin)

  return isValidationCompleted && stage.dictaminacionRequerida && !stage.dictaminado
}

export function shouldCancelEnvioByRules(input: {
  envioStatusCode?: string
  dictaminacionRequerida: boolean
  validationDictaminated: boolean
}) {
  const envioStatus = String(input.envioStatusCode ?? '').toUpperCase() as MonitorStatusCode
  const envioCompleted = FINAL_STATUS.has(envioStatus)
  if (!envioCompleted) return false
  if (!input.dictaminacionRequerida) return false
  return !input.validationDictaminated
}
