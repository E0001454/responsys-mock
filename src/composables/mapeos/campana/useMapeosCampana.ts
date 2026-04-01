import { ref } from 'vue'
import { mapeoCampanaService } from '@/services/mapeos/campana/mapeoCampanaService'
import type { MapeoCampanaData } from '@/types/mapeos/campana'

interface Option {
  label: string
  value: string
  bolActivo?: boolean
}

export function useMapeosCampana() {
  const mapeos = ref<Option[]>([])
  const rawMapeos = ref<any[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchAll() {
    loading.value = true
    error.value = null
    try {
      const list: MapeoCampanaData[] = await mapeoCampanaService.getMapeosCampana()
      rawMapeos.value = list

      mapeos.value = list.map(m => ({
        label: m.nombre || m.descripcion || `Mapeo ${m.idABCConfigMapeoLinea}`,
        value: String(m.idABCConfigMapeoLinea),
        bolActivo: Boolean(m.bolActivo)
      }))
    } catch (e: any) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  return { mapeos, rawMapeos, loading, error, fetchAll }
}
