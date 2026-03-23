import type { ColumnaCampanaModel } from '@/models/columnas/campana/columnaCampana.model'
import type { ColumnaCampanaData } from '@/types/columnas/columna'

export interface CampanaColumnaLookupEntry {
  mapeoId?: number | null
  columnaId?: number | null
  bolActivo?: boolean
  regex?: string | null
  obligatorio?: boolean | null
  esRequerido?: boolean | null
  valor?: unknown
}

export interface AdaptColumnaCampanaOptions {
  fallbackMapeoId?: number | null
  lookupByColumnaId?: Map<number, CampanaColumnaLookupEntry>
}

function asRecord(v: unknown): Record<string, unknown> {
  return typeof v === 'object' && v !== null ? v as Record<string, unknown> : {}
}

function toNumber(v: unknown): number | null {
  if (v === null || v === undefined) return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

function normalizeRegex(v: unknown): string | null {
  return typeof v === 'string' && v.trim() !== '' ? v : null
}

function toBoolean(v: unknown): boolean {
  return Boolean(v)
}

function normalizeObligatorio(v: unknown): boolean | null {
  if (typeof v === 'boolean') return v
  if (v === 1 || v === 0) return Boolean(v)
  return null
}

function adaptValor(raw: unknown) {
  const r = asRecord(raw)
  if (Object.keys(r).length === 0) return null

  const tipoId = toNumber((r.tipo as Record<string, unknown>)?.id ?? (r.tipo as Record<string, unknown>)?.idABCCatColumna ?? r.id)
  const tipo = tipoId !== null ? { id: tipoId } : null

  const cadenaRaw = r.cadena as Record<string, unknown> | undefined
  const numeroRaw = r.numero as Record<string, unknown> | undefined
  const fechaRaw = r.fecha as Record<string, unknown> | undefined

  const cadena = cadenaRaw ? {
    tipo: ((): { id: number } | null => {
      const id = toNumber((cadenaRaw.tipo as Record<string, unknown>)?.id ?? (cadenaRaw.tipo as Record<string, unknown>)?.idABCCatColumna ?? cadenaRaw.id)
      return id !== null ? { id } : null
    })(),
    minimo: toNumber(cadenaRaw.minimo) ?? null,
    maximo: toNumber(cadenaRaw.maximo) ?? null
  } : null

  const numero = numeroRaw ? {
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

export function adaptColumnaCampana(
  raw: ColumnaCampanaData,
  options: AdaptColumnaCampanaOptions = {}
): ColumnaCampanaModel {
  const r = asRecord(raw)
  const columnaRec = asRecord(r.columna)
  const llave = asRecord(r.llaveMapeoCampanaColumna)
  const tipoRecRoot = asRecord(r.tipo)
  const tipoRecLegacy = asRecord(columnaRec.tipo)
  const lookupByColumnaId = options.lookupByColumnaId

  const rawColumnaId = toNumber(
    tipoRecRoot.id
    ?? tipoRecRoot.idABCCatColumna
    ?? tipoRecLegacy.id
    ?? tipoRecLegacy.idABCCatColumna
    ?? llave.idABCCatColumna
    ?? r.idABCCatColumna
    ?? r.id
  )

  const lookup = rawColumnaId !== null ? lookupByColumnaId?.get(rawColumnaId) : undefined

  const mapeoId = toNumber(
    columnaRec.idABCConfigMapeoCampana
    ?? llave.idABCConfigMapeoCampana
    ?? r.idABCConfigMapeoCampana
    ?? lookup?.mapeoId
    ?? options.fallbackMapeoId
  ) ?? 0

  const columnaId = toNumber(rawColumnaId ?? lookup?.columnaId) ?? 0

  const valor = adaptValor(r.valor ?? columnaRec.valor ?? lookup?.valor ?? null)
  const esRequerido = normalizeObligatorio(
    r.esRequerido
    ?? r.obligatorio
    ?? columnaRec.esRequerido
    ?? columnaRec.obligatorio
    ?? columnaRec.obligatoria
    ?? lookup?.esRequerido
    ?? lookup?.obligatorio
    ?? null
  )
  const bolActivo = toBoolean(
    r.activo
    ?? r.bolActivo
    ?? columnaRec.activo
    ?? columnaRec.bolActivo
    ?? lookup?.bolActivo
    ?? false
  )
  const regex = normalizeRegex(r.regex ?? columnaRec.regex ?? lookup?.regex ?? null)

  return {
    tipo: 'campana',
    mapeoId,
    columnaId,
    bolActivo,
    regex,
    obligatorio: esRequerido,
    esRequerido,
    valor: valor,
    idUsuario: toNumber(r.idUsuario ?? columnaRec.idUsuario ?? null),
    columna: {
      tipo: { id: columnaId ?? undefined, idABCCatColumna: columnaId ?? undefined },
      bolActivo,
      obligatorio: esRequerido,
      esRequerido,
      regex,
      valor: valor
    },
    fechaCreacion: typeof columnaRec.fechaCreacion === 'string' ? columnaRec.fechaCreacion : (typeof r.fechaCreacion === 'string' ? r.fechaCreacion : undefined),
    fechaUltimaModificacion: typeof columnaRec.fechaUltimaModificacion === 'string' ? columnaRec.fechaUltimaModificacion : (typeof r.fechaUltimaModificacion === 'string' ? r.fechaUltimaModificacion : undefined)
  }
}
