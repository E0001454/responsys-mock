import type {
  MonitorExecutionMode,
  MonitorRawRecord,
  MonitorRawStatusEvent,
  MonitorRawTarea,
  MonitorScope,
  MonitorStatusCode,
  MonitorStatusHistoryItem,
  TareaMonitorData
} from '@/types/tareas/monitor'

const monitorActivityById: Record<number, { codigo: 'CARGA' | 'VALIDACION' | 'ENVIO'; nombre: string }> = {
  1: { codigo: 'CARGA', nombre: 'Carga' },
  2: { codigo: 'VALIDACION', nombre: 'Validacion' },
  3: { codigo: 'ENVIO', nombre: 'Envio' }
}

const monitorExecutionById: Record<number, { codigo: string; nombre: string; modo: MonitorExecutionMode }> = {
  1: { codigo: 'AUT', nombre: 'Automatica', modo: 'AUTOMATICA' },
  2: { codigo: 'MNL', nombre: 'Manual', modo: 'MANUAL' },
  3: { codigo: 'HIB', nombre: 'Hibrida', modo: 'HIBRIDA' }
}

const monitorStatusById: Record<number, { codigo: MonitorStatusCode; nombre: string }> = {
  1: { codigo: 'PLN', nombre: 'Planificada' },
  2: { codigo: 'EJC', nombre: 'En ejecución' },
  3: { codigo: 'APB', nombre: 'Aprobada' },
  4: { codigo: 'CMP', nombre: 'Completada ' },
  5: { codigo: 'ERR', nombre: 'Error ' },
  6: { codigo: 'DCT', nombre: 'Dictaminada' }
}

const activityOrder: Record<string, number> = {
  CARGA: 1,
  VALIDACION: 2,
  ENVIO: 3
}

const currentPriority: Record<string, number> = {
  EJC: 1,
  PLN: 2,
  APB: 3,
  CMP: 4,
  DCT: 5,
  ERR: 6,
  BLQ: 7,
  CNC: 8
}

function parseDateLike(value: unknown): string {
  if (value === undefined || value === null || value === '') return ''
  const raw = String(value).trim()
  if (!raw) return ''

  if (/^\d+$/.test(raw)) {
    const numeric = Number(raw)
    if (Number.isFinite(numeric) && numeric > 0) {
      return new Date(numeric).toISOString()
    }
  }

  const parsed = Date.parse(raw)
  if (Number.isFinite(parsed)) return new Date(parsed).toISOString()
  return ''
}

function resolveScheduleDayId(tareaEntry: MonitorRawTarea | null, item: MonitorRawRecord): number {
  return Number(
    tareaEntry?.dia?.id
    ?? tareaEntry?.diaId
    ?? (tareaEntry as any)?.idABCCatDia
    ?? item?.dia?.id
    ?? item?.diaId
    ?? (item as any)?.idABCCatDia
    ?? 0
  )
}

function resolveScheduleHourId(tareaEntry: MonitorRawTarea | null, item: MonitorRawRecord): number {
  return Number(
    (tareaEntry as any)?.dia?.hora?.id
    ?? tareaEntry?.hora?.id
    ?? tareaEntry?.horaId
    ?? (tareaEntry as any)?.idABCCatHora
    ?? (item as any)?.dia?.hora?.id
    ?? item?.hora?.id
    ?? item?.horaId
    ?? (item as any)?.idABCCatHora
    ?? 0
  )
}

function extractArrayResponse(raw: unknown): any[] {
  if (Array.isArray(raw)) return raw
  const source = (raw as Record<string, unknown> | null | undefined) ?? {}
  const candidates = [
    source.data,
    source.items,
    source.rows,
    source.result,
    source.results,
    source.content,
    (source.data as Record<string, unknown> | undefined)?.items,
    (source.data as Record<string, unknown> | undefined)?.rows,
    (source.data as Record<string, unknown> | undefined)?.result,
    (source.data as Record<string, unknown> | undefined)?.results,
    (source.data as Record<string, unknown> | undefined)?.content
  ]

  for (const value of candidates) {
    if (Array.isArray(value)) return value
  }

  return []
}

export function normalizeRealRows(scope: MonitorScope, raw: unknown): TareaMonitorData[] {
  const list = extractArrayResponse(raw)
  if (!list.length) return []

  type DraftRow = {
    base: TareaMonitorData
    pipelineId: string
    activityRank: number
    scheduleTs: number
  }

  const drafts: DraftRow[] = list.flatMap((item: MonitorRawRecord) => {
    const tareaEntries = Array.isArray(item?.tarea) ? item.tarea.filter(Boolean) : []
    const taskEntries = (tareaEntries.length ? tareaEntries : [null]) as Array<MonitorRawTarea | null>

    return taskEntries.map((tareaEntry) => {
      const lineaId = Number(item?.linea?.id ?? item?.idABCCatLineaNegocio ?? 0)
      const campanaId = Number(item?.linea?.campana?.id ?? item?.campana?.id ?? item?.idABCCatCampana ?? 0)
      const mapeoId = Number(item?.mapeo?.id ?? item?.idABCConfigMapeo ?? item?.idABCConfigMapeoLinea ?? item?.idABCConfigMapeoCampana ?? 0)
      const mapeoNombre = String(item?.mapeo?.nombre ?? item?.nombreMapeo ?? '').trim() || `Mapeo ${mapeoId || '-'}`

      const actividadId = Number(tareaEntry?.actividad?.id ?? item?.actividad?.id ?? item?.actividadId ?? 0)
      const actividadMeta = monitorActivityById[actividadId] ?? { codigo: 'CARGA', nombre: 'Carga' }

      const rawStatus = tareaEntry?.estatus
      const statusEventsRaw: MonitorRawStatusEvent[] = Array.isArray(rawStatus)
        ? rawStatus
        : (rawStatus && typeof rawStatus === 'object' ? [rawStatus as MonitorRawStatusEvent] : [])

      const statusEventsOrdered = statusEventsRaw
        .map((event, index) => {
          const normalizedDate = parseDateLike(event?.fechaCreacion)
          return {
            id: Number(event?.id ?? 0),
            detalle: event?.detalle ?? null,
            fechaCreacion: normalizedDate,
            timestamp: normalizedDate ? Date.parse(normalizedDate) : Number.NaN,
            index
          }
        })
        .filter(event => event.id > 0)
        .sort((a, b) => {
          const aTs = Number.isFinite(a.timestamp) ? a.timestamp : Number.MIN_SAFE_INTEGER
          const bTs = Number.isFinite(b.timestamp) ? b.timestamp : Number.MIN_SAFE_INTEGER
          if (aTs !== bTs) return aTs - bTs
          return a.index - b.index
        })

      const firstStatusDate = statusEventsOrdered[0]?.fechaCreacion ?? ''
      const latestStatusEvent = statusEventsOrdered[statusEventsOrdered.length - 1]
      const latestStatusDate = latestStatusEvent?.fechaCreacion ?? ''
      const latestStatusId = Number(latestStatusEvent?.id ?? 0)

      const approvedEvent = statusEventsOrdered
        .slice()
        .reverse()
        .find(event => Number(event.id) === 3)
      const dictaminatedEvent = statusEventsOrdered
        .slice()
        .reverse()
        .find(event => Number(event.id) === 6)

      const statusHistory: MonitorStatusHistoryItem[] = statusEventsOrdered
        .slice()
        .sort((a, b) => {
          const aTs = Number.isFinite(a.timestamp) ? a.timestamp : Number.MIN_SAFE_INTEGER
          const bTs = Number.isFinite(b.timestamp) ? b.timestamp : Number.MIN_SAFE_INTEGER
          return bTs - aTs
        })
        .map(event => {
          const statusMeta = monitorStatusById[event.id] ?? { codigo: 'ERR' as MonitorStatusCode, nombre: 'Con error' }
          return {
            id: event.id || undefined,
            codigo: statusMeta.codigo,
            nombre: statusMeta.nombre,
            fechaCreacion: event.fechaCreacion,
            detalle: event.detalle
          }
        })

      const estatusId = Number(
        latestStatusId
        || (rawStatus && !Array.isArray(rawStatus) ? (rawStatus as { id?: number }).id : 0)
        || item?.estatus?.id
        || (item as any)?.status?.id
        || (item as any)?.estatusId
        || (item as any)?.statusId
        || 0
      )
      const estatusMeta = monitorStatusById[estatusId] ?? { codigo: 'ERR', nombre: 'Con error' }

      const ejecucionId = Number(tareaEntry?.ejecucion?.id ?? (item as any)?.ejecucion?.id ?? (item as any)?.ejecucionId ?? 1)
      const ejecucionMeta: { codigo: string; nombre: string; modo: MonitorExecutionMode } =
        monitorExecutionById[ejecucionId]
        ?? monitorExecutionById[1]
        ?? { codigo: 'AUT', nombre: 'Automatica', modo: 'AUTOMATICA' }

      const fechaInicioBase = parseDateLike(tareaEntry?.fechaInicio ?? tareaEntry?.fechaInico ?? (item as any)?.fechaInicio ?? (item as any)?.fechaInico ?? (item as any)?.fecInicio)
      const horarioProgramadoBase = parseDateLike((item as any)?.horarioProgramado ?? (item as any)?.fechaProgramada ?? tareaEntry?.fechaInicio ?? tareaEntry?.fechaInico ?? (item as any)?.fechaInico ?? (item as any)?.fechaInicio)
      const fechaFinBase = parseDateLike(tareaEntry?.fechaFin ?? (item as any)?.fechaFin ?? (item as any)?.fecFin)
      const fechaCreacion = parseDateLike(tareaEntry?.fechaCreacion ?? (tareaEntry as any)?.fecCreacion ?? (item as any)?.fechaCreacion ?? (item as any)?.fecCreacion)
      const fechaUltimaModificacionBase = parseDateLike((item as any)?.fechaUltimaModificacion ?? (item as any)?.fecUltModificacion ?? (item as any)?.fechaUltModificacion)

      const hasFinalStatus = ['CMP', 'DCT', 'BLQ', 'CNC', 'ERR'].includes(String(estatusMeta.codigo).toUpperCase())
      const fechaInicio = fechaInicioBase || firstStatusDate || latestStatusDate
      const horarioProgramado = horarioProgramadoBase || firstStatusDate || fechaInicio || fechaCreacion
      const fechaFin = fechaFinBase || (hasFinalStatus ? latestStatusDate : '')
      const fechaUltimaModificacion = fechaUltimaModificacionBase || latestStatusDate || fechaFin || fechaInicio || horarioProgramado || fechaCreacion
      const fechaAprobada = approvedEvent?.fechaCreacion || ''
      const fechaDictaminacion = dictaminatedEvent?.fechaCreacion || ''

      const numeroRegistros = Number((tareaEntry as any)?.registros ?? (tareaEntry as any)?.numeroRegistros ?? (tareaEntry as any)?.totalRegistros ?? (item as any)?.registros ?? (item as any)?.numeroRegistros ?? (item as any)?.totalRegistros ?? 0)
      const numeroRegistrosProcesados = Number((tareaEntry as any)?.procesados ?? (tareaEntry as any)?.numeroRegistrosProcesados ?? (tareaEntry as any)?.registrosProcesados ?? (item as any)?.procesados ?? (item as any)?.numeroRegistrosProcesados ?? (item as any)?.registrosProcesados ?? 0)
      const horarioDiaId = resolveScheduleDayId(tareaEntry, item)
      const horarioHoraId = resolveScheduleHourId(tareaEntry, item)
      const scheduleTs = Date.parse(horarioProgramado || fechaInicio || fechaCreacion || '')

      const pipelineId = scope === 'campana'
        ? `CP-L${lineaId}-C${campanaId}-M${mapeoId}`
        : `LN-L${lineaId}-M${mapeoId}`

      const base: TareaMonitorData = {
        id: Number((tareaEntry as any)?.id ?? (item as any)?.id ?? 0),
        scope,
        pipelineId,
        idABCCatLineaNegocio: lineaId,
        ...(scope === 'campana' ? { idABCCatCampana: campanaId } : {}),
        idABCConfigMapeo: mapeoId,
        nombreMapeo: mapeoNombre,
        actividad: {
          id: actividadId || undefined,
          codigo: actividadMeta.codigo,
          nombre: actividadMeta.nombre
        },
        estatus: {
          id: estatusId || undefined,
          codigo: estatusMeta.codigo,
          nombre: estatusMeta.nombre
        },
        estatusHistorial: statusHistory,
        ejecucion: {
          id: ejecucionId || undefined,
          codigo: ejecucionMeta.codigo,
          nombre: ejecucionMeta.nombre,
          modo: ejecucionMeta.modo
        },
        etapaIndex: 0,
        horarioDiaId: horarioDiaId || undefined,
        horarioHoraId: horarioHoraId || undefined,
        horarioProgramado: horarioProgramado || fechaInicio || fechaCreacion,
        fechaCreacion: fechaCreacion || horarioProgramado || fechaInicio,
        fechaInicio,
        fechaFin,
        fechaAprobada,
        fechaDictaminacion,
        fechaUltimaModificacion: fechaUltimaModificacion || fechaFin || fechaInicio || horarioProgramado || fechaCreacion,
        numeroRegistros: Number.isFinite(numeroRegistros) ? numeroRegistros : 0,
        numeroRegistrosProcesados: Number.isFinite(numeroRegistrosProcesados) ? numeroRegistrosProcesados : 0,
        dictaminacionRequerida: Boolean((tareaEntry as any)?.dictaminar ?? (tareaEntry as any)?.dictaminacionRequerida ?? (item as any)?.dictaminar ?? (item as any)?.dictaminacionRequerida ?? (actividadMeta.codigo === 'VALIDACION')),
        dictaminado: Boolean(dictaminatedEvent),
        ...(String(estatusMeta.codigo).toUpperCase() === 'ERR' && latestStatusEvent?.detalle
          ? {
              error: {
                nombre: 'Error de ejecucion',
                codigo: `ERR-${String(mapeoId || 0).padStart(3, '0')}`,
                detalle: String(latestStatusEvent.detalle)
              }
            }
          : {})
      } as TareaMonitorData

      return {
        base,
        pipelineId,
        activityRank: activityOrder[actividadMeta.codigo] ?? 99,
        scheduleTs: Number.isFinite(scheduleTs) ? scheduleTs : 0
      }
    })
  })

  const byPipeline = new Map<string, DraftRow[]>()
  drafts.forEach(draft => {
    const arr = byPipeline.get(draft.pipelineId) ?? []
    arr.push(draft)
    byPipeline.set(draft.pipelineId, arr)
  })

  const rows: TareaMonitorData[] = []
  byPipeline.forEach(items => {
    const ordered = items.slice().sort((a, b) => {
      if (a.scheduleTs !== b.scheduleTs) return a.scheduleTs - b.scheduleTs
      if (a.activityRank !== b.activityRank) return a.activityRank - b.activityRank
      return Number(a.base.id ?? 0) - Number(b.base.id ?? 0)
    })

    ordered.forEach((item, index) => {
      rows.push({ ...item.base, etapaIndex: index })
    })
  })

  return rows
}

export function pickCurrentRowsByMapeo(rows: TareaMonitorData[]): TareaMonitorData[] {
  const byMapeo = new Map<string, TareaMonitorData[]>()
  rows.forEach(row => {
    const key = row.scope === 'campana'
      ? `${row.scope}|${row.idABCCatLineaNegocio}|${row.idABCCatCampana ?? 0}|${row.idABCConfigMapeo}`
      : `${row.scope}|${row.idABCCatLineaNegocio}|${row.idABCConfigMapeo}`
    const arr = byMapeo.get(key) ?? []
    arr.push(row)
    byMapeo.set(key, arr)
  })

  const selected: TareaMonitorData[] = []
  byMapeo.forEach(items => {
    const chosen = items.slice().sort((a, b) => {
      const aHasVolume = Number(a.numeroRegistros ?? 0) > 0 || Number(a.numeroRegistrosProcesados ?? 0) > 0
      const bHasVolume = Number(b.numeroRegistros ?? 0) > 0 || Number(b.numeroRegistrosProcesados ?? 0) > 0
      if (aHasVolume !== bHasVolume) return aHasVolume ? -1 : 1

      const pa = currentPriority[String(a.estatus.codigo).toUpperCase()] ?? 99
      const pb = currentPriority[String(b.estatus.codigo).toUpperCase()] ?? 99
      if (pa !== pb) return pa - pb

      const aProcessed = Number(a.numeroRegistrosProcesados ?? 0)
      const bProcessed = Number(b.numeroRegistrosProcesados ?? 0)
      if (aProcessed !== bProcessed) return bProcessed - aProcessed

      const aTotal = Number(a.numeroRegistros ?? 0)
      const bTotal = Number(b.numeroRegistros ?? 0)
      if (aTotal !== bTotal) return bTotal - aTotal

      const ta = Date.parse(a.horarioProgramado || a.fechaInicio || a.fechaCreacion || '')
      const tb = Date.parse(b.horarioProgramado || b.fechaInicio || b.fechaCreacion || '')
      if (Number.isFinite(ta) && Number.isFinite(tb) && ta !== tb) return tb - ta

      return Number(b.etapaIndex ?? 0) - Number(a.etapaIndex ?? 0)
    })[0]

    if (chosen) selected.push(chosen)
  })

  return selected
}

export function sortByStageIndex(rows: TareaMonitorData[]): TareaMonitorData[] {
  return rows.slice().sort((a, b) => Number(a.etapaIndex ?? 0) - Number(b.etapaIndex ?? 0))
}
