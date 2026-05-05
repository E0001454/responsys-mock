export function parseDateValue(value: unknown): Date | null {
  if (value === null || value === undefined || value === '') return null

  const raw = String(value).trim()
  if (!raw) return null

  if (/^\d+$/.test(raw)) {
    const ms = Number(raw)
    if (Number.isFinite(ms) && ms > 0) {
      const d = new Date(ms)
      if (!Number.isNaN(d.getTime())) return d
    }
    return null
  }

  const ms = Date.parse(raw)
  if (Number.isFinite(ms)) return new Date(ms)

  return null
}

export function toSafeDateTimestamp(value: unknown): number {
  const d = parseDateValue(value)
  return d ? d.getTime() : -1
}

export function formatDateTimeEs(value: unknown, fallback = ''): string {
  const d = parseDateValue(value)
  if (!d) return fallback
  return new Intl.DateTimeFormat('es-MX', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(d)
}

export function formatDateEs(value: unknown, fallback = ''): string {
  const d = parseDateValue(value)
  if (!d) return fallback
  return d.toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'short',
    day: '2-digit'
  })
}

export function formatTimeEs(value: unknown, fallback = '--:--'): string {
  const d = parseDateValue(value)
  if (!d) return fallback
  return d.toLocaleTimeString('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  })
}
