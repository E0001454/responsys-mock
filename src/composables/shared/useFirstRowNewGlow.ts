import { onBeforeUnmount, ref, watch } from 'vue'

type RowKey = string | number

interface GlowOptions {
  durationMs?: number
  isLoading?: () => boolean
  getRowChangeToken?: (row: unknown, index: number) => RowKey
}

export function useFirstRowNewGlow<T>(
  rowsSource: () => T[],
  getRowKey: (row: T, index: number) => RowKey,
  options?: GlowOptions
) {
  const glowingRowKey = ref<RowKey | null>(null)
  const initialized = ref(false)
  const duration = Math.max(300, Number(options?.durationMs ?? 2200))
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  const getRowToken = (row: T, index: number): RowKey => {
    if (options?.getRowChangeToken) return options.getRowChangeToken(row as unknown, index)
    return getRowKey(row, index)
  }

  const clearGlowTimeout = () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
  }

  const triggerGlow = () => {
    const rows = rowsSource()
    if (!rows.length) return
    const firstRow = rows[0]
    if (!firstRow) return

    clearGlowTimeout()
    glowingRowKey.value = getRowKey(firstRow, 0)
    timeoutId = setTimeout(() => {
      glowingRowKey.value = null
      timeoutId = null
    }, duration)
  }

  watch(
    () => {
      const rows = rowsSource()
      const firstRow = rows[0]
      const rowKeys = rows.map((row, index) => getRowKey(row, index))
      return {
        length: rows.length,
        firstKey: firstRow ? getRowKey(firstRow, 0) : null,
        firstToken: firstRow ? getRowToken(firstRow, 0) : null,
        rowKeys,
        isLoading: Boolean(options?.isLoading?.())
      }
    },
    (current, previous) => {
      if (!initialized.value) {
        initialized.value = true
        return
      }

      if (current.isLoading) return

      if (current.length <= 0) {
        glowingRowKey.value = null
        return
      }

      const previousLength = Number(previous?.length ?? 0)
      const previousFirstKey = previous?.firstKey ?? null
      const previousFirstToken = previous?.firstToken ?? null
      const previousFirstStillPresent =
        previousFirstKey !== null
        && current.rowKeys.some(key => key === previousFirstKey)
      const loadingFinished = Boolean(previous?.isLoading) && !current.isLoading

      const isNewFirstRow =
        previousLength > 0
        && current.length > previousLength
        && current.firstKey !== null
        && current.firstKey !== previousFirstKey
        && previousFirstStillPresent

      const isUpdatedFirstRow =
        loadingFinished
        && previousLength > 0
        && current.length === previousLength
        && current.firstKey !== null
        && (
          current.firstKey === previousFirstKey
          || previousFirstStillPresent
        )
        && (
          current.firstKey !== previousFirstKey
          || current.firstToken !== previousFirstToken
        )

      if (isNewFirstRow || isUpdatedFirstRow) {
        triggerGlow()
      }
    },
    { immediate: true }
  )

  onBeforeUnmount(() => {
    clearGlowTimeout()
  })

  const isRowGlowing = (row: T, index: number) => {
    if (index !== 0 || glowingRowKey.value === null) return false
    return getRowKey(row, index) === glowingRowKey.value
  }

  return {
    isRowGlowing
  }
}
