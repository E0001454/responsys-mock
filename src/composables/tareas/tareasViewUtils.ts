export type StageKey = 'carga' | 'validacion' | 'envio'

export const stageTypeByKey: Record<StageKey, number> = {
  carga: 1,
  validacion: 2,
  envio: 3
}

export const stageKeys = Object.keys(stageTypeByKey) as StageKey[]

export function resolveMapeoDisplayName(mapeo: { nombre?: string; descripcion?: string } | undefined): string {
  const nombre = String(mapeo?.nombre ?? '').trim()
  if (nombre) return nombre
  const descripcion = String(mapeo?.descripcion ?? '').trim()
  if (descripcion) return descripcion
  return ''
}

export function resolveTareaMapeoId(item: any): number {
  return Number(
    item?.tareasPorTipo?.carga?.mapeo?.id
    ?? item?.tareasPorTipo?.validacion?.mapeo?.id
    ?? item?.tareasPorTipo?.envio?.mapeo?.id
    ?? item?.tarea?.mapeo?.id
    ?? item?.asignacion?.mapeo?.id
    ?? item?.mapeo?.id
    ?? item?.idABCConfigMapeoCampana
    ?? item?.idABCConfigMapeoLinea
    ?? 0
  )
}

export function enrichTareaWithMapeoName<T extends { ingesta?: string }>(
  item: T,
  mapeos: Array<{ idABCConfigMapeoLinea: number; nombre?: string; descripcion?: string }>
): T {
  const mapeoId = resolveTareaMapeoId(item)
  if (!mapeoId) return item

  const mapeo = mapeos.find(m => Number(m.idABCConfigMapeoLinea ?? 0) === mapeoId)
  const mapeoName = resolveMapeoDisplayName(mapeo)
  if (!mapeoName) return item

  return {
    ...item,
    ingesta: mapeoName
  }
}

export function mapCatalogosToOptions(items: { id: number; nombre: string; bolActivo: boolean }[]) {
  return items
    .filter(item => item.bolActivo !== false)
    .map(item => ({ label: item.nombre, value: item.id }))
}
