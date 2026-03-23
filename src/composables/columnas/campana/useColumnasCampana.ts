import { ref } from 'vue'
import { columnaService } from '@/services/columnas/columnaService'
import { adaptColumnaCampana } from '@/adapters/columnas/campana/columnaCampana.adapter'
import type { ColumnaCampanaModel } from '@/models/columnas/campana/columnaCampana.model'

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null ? value as Record<string, unknown> : {}
}

function toNumber(value: unknown): number | null {
  if (value === null || value === undefined) return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function toBoolean(value: unknown): boolean {
  return Boolean(value)
}

function normalizeList(raw: unknown): any[] {
  if (Array.isArray(raw)) return raw
  if (raw && typeof raw === 'object') {
    const rec = raw as Record<string, unknown>
    if (Array.isArray(rec.data)) return rec.data
    if (Array.isArray(rec.items)) return rec.items
    return [raw]
  }
  return []
}

function hasResolvableColumnaId(item: unknown): boolean {
  const rec = asRecord(item)
  const columnaRec = asRecord(rec.columna)
  const tipoRec = asRecord(rec.tipo)
  const tipoLegacy = asRecord(columnaRec.tipo)
  const llaveLinea = asRecord(rec.llaveMapeoLineaColumna)
  const llaveCampana = asRecord(rec.llaveMapeoCampanaColumna)

  const columnaId = toNumber(
    tipoRec.id
    ?? tipoRec.idABCCatColumna
    ?? tipoLegacy.id
    ?? tipoLegacy.idABCCatColumna
    ?? llaveLinea.idABCCatColumna
    ?? llaveCampana.idABCCatColumna
    ?? rec.idABCCatColumna
    ?? rec.id
  )

  return columnaId !== null
}

function buildLookupByColumnaId(raw: unknown) {
  const lookup = new Map<number, {
    mapeoId?: number | null
    columnaId?: number | null
    bolActivo?: boolean
    regex?: string | null
    obligatorio?: boolean | null
    esRequerido?: boolean | null
    valor?: unknown
  }>()

  for (const item of normalizeList(raw)) {
    const rec = asRecord(item)
    const columnaRec = asRecord(rec.columna)
    const tipoRec = asRecord(rec.tipo)
    const tipoLegacy = asRecord(columnaRec.tipo)
    const llaveLinea = asRecord(rec.llaveMapeoLineaColumna)
    const llaveCampana = asRecord(rec.llaveMapeoCampanaColumna)

    const columnaId = toNumber(
      tipoRec.id
      ?? tipoRec.idABCCatColumna
      ?? tipoLegacy.id
      ?? tipoLegacy.idABCCatColumna
      ?? llaveLinea.idABCCatColumna
      ?? llaveCampana.idABCCatColumna
      ?? rec.idABCCatColumna
      ?? rec.id
    )

    if (columnaId === null) continue

    const mapeoId = toNumber(
      columnaRec.idABCConfigMapeoCampana
      ?? columnaRec.idABCConfigMapeoLinea
      ?? llaveCampana.idABCConfigMapeoCampana
      ?? llaveLinea.idABCConfigMapeoLinea
      ?? rec.idABCConfigMapeoCampana
      ?? rec.idABCConfigMapeoLinea
    )

    lookup.set(columnaId, {
      mapeoId,
      columnaId,
      bolActivo: toBoolean(rec.activo ?? rec.bolActivo ?? columnaRec.activo ?? columnaRec.bolActivo ?? false),
      regex: typeof (rec.regex ?? columnaRec.regex) === 'string' ? String(rec.regex ?? columnaRec.regex) : null,
      obligatorio: (() => {
        const required = rec.esRequerido ?? rec.obligatorio ?? columnaRec.esRequerido ?? columnaRec.obligatorio ?? null
        if (required === 0 || required === 1) return Boolean(required)
        return typeof required === 'boolean' ? required : null
      })(),
      esRequerido: (() => {
        const required = rec.esRequerido ?? rec.obligatorio ?? columnaRec.esRequerido ?? columnaRec.obligatorio ?? null
        if (required === 0 || required === 1) return Boolean(required)
        return typeof required === 'boolean' ? required : null
      })(),
      valor: rec.valor ?? columnaRec.valor ?? null
    })
  }

  return lookup
}

export function useColumnasCampana() {
  const items = ref<ColumnaCampanaModel[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const currentMapeo = ref<string | number | null>(null)
  const rawResponse = ref<any>(null)

  async function fetchAll(mapeoId?: string | number | null) {
    loading.value = true
    error.value = null
    try {
      let raw
      if (mapeoId !== undefined && mapeoId !== null) {
        currentMapeo.value = mapeoId
        raw = await columnaService.getColumnasCampanaByMapeo(mapeoId)
      } else if (currentMapeo.value !== null) {
        raw = await columnaService.getColumnasCampanaByMapeo(currentMapeo.value)
      } else {
        raw = await columnaService.getColumnasCampana()
      }

      rawResponse.value = raw

      const list = normalizeList(raw)
      const normalizedMapeoId = toNumber(mapeoId ?? currentMapeo.value)
      let lookupByColumnaId: Map<number, {
        mapeoId?: number | null
        columnaId?: number | null
        bolActivo?: boolean
        regex?: string | null
        obligatorio?: boolean | null
        esRequerido?: boolean | null
        valor?: unknown
      }> | undefined

      const requiresLookup = list.length > 0 && list.some(item => !hasResolvableColumnaId(item))

      if (normalizedMapeoId !== null && requiresLookup) {
        const rawMapeoColumnas = await columnaService.getColumnasByMapeo(normalizedMapeoId)
        lookupByColumnaId = buildLookupByColumnaId(rawMapeoColumnas)
      }

      items.value = list.map(item => adaptColumnaCampana(item, {
        fallbackMapeoId: normalizedMapeoId,
        lookupByColumnaId
      }))
    } catch (e: any) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  async function toggle(item: ColumnaCampanaModel) {
    loading.value = true
    try {
      const wasActive = item.bolActivo
      const fn = wasActive
        ? columnaService.patchDesactivarColumnaCampana
        : columnaService.patchActivarColumnaCampana

      const mapeoCandidates = Array.from(new Set([
        Number((item as any)?.mapeoId ?? 0),
        Number((item as any)?.idABCConfigMapeoCampana ?? 0),
        Number((item as any)?.idABCConfigMapeoLinea ?? 0),
        Number(currentMapeo.value ?? 0)
      ].filter((id) => Number.isFinite(id) && id >= 0)))

      let patched = false
      let lastError: any = null

      for (const mapeoId of mapeoCandidates) {
        try {
          await fn(mapeoId, { columna: { tipo: { id: item.columnaId } }, idUsuario: 1 })
          patched = true
          break
        } catch (e: any) {
          lastError = e
          if (Number(e?.status ?? 0) !== 404) throw e
        }
      }

      if (!patched && lastError) {
        throw lastError
      }

      await fetchAll(currentMapeo.value)
    } finally {
      loading.value = false
    }
  }

  async function create(payload: {
    idABCConfigMapeoCampana: number
    idABCCatColumna: number
    regex: string
  }) {
    loading.value = true
    try {
      await columnaService.createColumnaCampanaGlobal({
        idUsuario: 1,
        columna: {
          tipo: { id: payload.idABCCatColumna },
          regex: payload.regex ?? null
        }
      })
      await fetchAll()
    } finally {
      loading.value = false
    }
  }

  async function update(payload: {
    idABCConfigMapeoCampana: number
    idABCCatColumna: number
    regex: string
  }) {
    loading.value = true
    try {
      await columnaService.updateColumnaCampana(payload.idABCConfigMapeoCampana, {
        idUsuario: 1,
        columna: {
          tipo: { id: payload.idABCCatColumna },
          regex: payload.regex
        }
      })
      await fetchAll()
    } finally {
      loading.value = false
    }
  }


  return {
    items,
    loading,
    error,
    fetchAll,
    toggle,
    create,
    update,
    rawResponse
  }
}
