export interface WatermarkOptions {
  alpha?: number
  width?: number
  minHeight?: number
}

const watermarkCache = new Map<string, Promise<string | null>>()

export function getImageWatermarkDataUrl(source: string, options: WatermarkOptions = {}): Promise<string | null> {
  const cacheKey = `${source}|${options.alpha ?? 0.28}|${options.width ?? 1200}|${options.minHeight ?? 220}`
  const cached = watermarkCache.get(cacheKey)
  if (cached) return cached

  const task = new Promise<string | null>((resolve) => {
    if (typeof document === 'undefined') {
      resolve(null)
      return
    }

    const image = new Image()
    image.crossOrigin = 'anonymous'

    image.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        const width = options.width ?? 1200
        const ratio = image.naturalWidth > 0 ? image.naturalHeight / image.naturalWidth : 0.25
        const height = Math.max(options.minHeight ?? 220, Math.round(width * ratio))
        const ctx = canvas.getContext('2d')

        if (!ctx) {
          resolve(null)
          return
        }

        canvas.width = width
        canvas.height = height
        ctx.clearRect(0, 0, width, height)
        ctx.globalAlpha = options.alpha ?? 0.28
        ctx.drawImage(image, 0, 0, width, height)
        resolve(canvas.toDataURL('image/png'))
      } catch {
        resolve(null)
      }
    }

    image.onerror = () => resolve(null)
    image.src = source
  })

  watermarkCache.set(cacheKey, task)
  return task
}
