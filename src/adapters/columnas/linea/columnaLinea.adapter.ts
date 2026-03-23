import type { ColumnaLineaModel, ColumnaValor, ColumnaValorCadena, ColumnaValorNumero } from '@/models/columnas/linea/columnaLinea.model'

export interface AdaptColumnasLineaOptions {
  fallbackMapeoId?: number | null
}

function asRecord(v: unknown): Record<string, unknown> {
  return typeof v === 'object' && v !== null ? v as Record<string, unknown> : {}
}

function toNumber(v: unknown): number | null {
  if (v === null || v === undefined) return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

function toBoolean(v: unknown): boolean {
  return Boolean(v)
}

function normalizeRegex(v: unknown): string | null {
  return typeof v === 'string' && v.trim() !== '' ? v : null
}

function normalizeObligatorio(v: unknown): boolean | null {
  if (typeof v === 'boolean') return v
  if (v === 1 || v === 0) return Boolean(v)
  return null
}

function normalizeList(raw: unknown): unknown[] {
  if (Array.isArray(raw)) return raw
  const rec = asRecord(raw)
  if (Array.isArray(rec.data)) return rec.data as unknown[]
  if (Array.isArray(rec.items)) return rec.items as unknown[]
  return Object.keys(rec).length ? [raw] : []
}

function adaptValor(raw: unknown): ColumnaValor | null {
  const r = asRecord(raw)
  if (Object.keys(r).length === 0) return null

  const tipoId = toNumber((r.tipo as Record<string, unknown>)?.id ?? (r.tipo as Record<string, unknown>)?.idABCCatColumna ?? r.id)
  const tipo = tipoId !== null ? { id: tipoId } : null

  const cadenaRaw = r.cadena as Record<string, unknown> | undefined
  const numeroRaw = r.numero as Record<string, unknown> | undefined
  const fechaRaw = r.fecha as Record<string, unknown> | undefined

  const cadena: ColumnaValorCadena | null = cadenaRaw ? {
    tipo: ((): { id: number } | null => {
      const id = toNumber((cadenaRaw.tipo as Record<string, unknown>)?.id ?? (cadenaRaw.tipo as Record<string, unknown>)?.idABCCatColumna ?? cadenaRaw.id)
      return id !== null ? { id } : null
    })(),
    minimo: toNumber(cadenaRaw.minimo) ?? null,
    maximo: toNumber(cadenaRaw.maximo) ?? null
  } : null

  const numero: ColumnaValorNumero | null = numeroRaw ? {
    tipo: ((): { id: number } | null => {
      const id = toNumber((numeroRaw.tipo as Record<string, unknown>)?.id ?? (numeroRaw.tipo as Record<string, unknown>)?.idABCCatColumna ?? numeroRaw.id)
      return id !== null ? { id } : null
    })(),
    enteros: toNumber(numeroRaw.enteros) ?? null,
    decimales: toNumber(numeroRaw.decimales) ?? null
  } : null

  const fecha = fechaRaw ? {
    tipo: ((): { id: number } | null => {
      const id = toNumber((fechaRaw.tipo as Record<string, unknown>)?.id ?? (fechaRaw.tipo as Record<string, unknown>)?.idABCCatColumna ?? fechaRaw.id)
      return id !== null ? { id } : null
    })()
  } : null

  return {
    tipo,
    cadena,
    numero,
    fecha
  }
}

export function adaptColumnasLinea(raw: unknown, options: AdaptColumnasLineaOptions = {}): ColumnaLineaModel[] {
  const list = normalizeList(raw)
  if (!list.length) return []

  const out: ColumnaLineaModel[] = []
  const fallbackMapeoId = toNumber(options.fallbackMapeoId)

  for (const item of list) {
    const rec = asRecord(item)

    const columnaRec = asRecord(rec.columna)
    const llaveRec = asRecord(rec.llaveMapeoLineaColumna)
    const tipoRecRoot = asRecord(rec.tipo)
    const tipoRecLegacy = asRecord(columnaRec.tipo)
    const valorRec = rec.valor ?? columnaRec.valor ?? null

    const mapeoId = toNumber(columnaRec.idABCConfigMapeoLinea ?? llaveRec.idABCConfigMapeoLinea ?? rec.idABCConfigMapeoLinea ?? fallbackMapeoId)
    const columnaId = toNumber(tipoRecRoot.id ?? tipoRecRoot.idABCCatColumna ?? tipoRecLegacy.id ?? tipoRecLegacy.idABCCatColumna ?? llaveRec.idABCCatColumna ?? rec.idABCCatColumna ?? rec.id)

    if (mapeoId === null || columnaId === null) continue

    const bolActivo = toBoolean(rec.activo ?? rec.bolActivo ?? columnaRec.activo ?? columnaRec.bolActivo ?? false)
    const regex = normalizeRegex(rec.regex ?? columnaRec.regex ?? null)
    const obligatorio = normalizeObligatorio(rec.esRequerido ?? rec.obligatorio ?? columnaRec.esRequerido ?? columnaRec.obligatorio ?? columnaRec.obligatoria ?? null)
    const valor = adaptValor(valorRec)

    out.push({
      tipo: 'linea',
      mapeoId,
      columnaId,
      bolActivo,
      regex,
      obligatorio,
      esRequerido: obligatorio,
      valor,
      idUsuario: toNumber(rec.idUsuario ?? columnaRec.idUsuario ?? null),
      columna: {
        tipo: { id: columnaId ?? undefined, idABCCatColumna: columnaId ?? undefined },
        bolActivo,
        obligatorio,
        esRequerido: obligatorio,
        regex,
        valor: valor
      },
      fechaCreacion: typeof columnaRec.fechaCreacion === 'string' ? columnaRec.fechaCreacion : (typeof rec.fechaCreacion === 'string' ? rec.fechaCreacion : undefined),
      fechaUltimaModificacion: typeof columnaRec.fechaUltimaModificacion === 'string' ? columnaRec.fechaUltimaModificacion : (typeof rec.fechaUltimaModificacion === 'string' ? rec.fechaUltimaModificacion : undefined)
    })
  }

  return out
}
