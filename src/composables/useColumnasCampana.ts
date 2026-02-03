import { ref } from 'vue'
import { columnaService } from '@/services/columnaService'
import { adaptColumnaCampana } from '@/adapters/columnaCampana.adapter'
import type { ColumnaCampanaModel } from '@/models/columnaCampana.model'

export function useColumnasCampana() {
    const items = ref<ColumnaCampanaModel[]>([])
	const loading = ref(false)
	const error = ref<string | null>(null)
    const currentMapeo = ref<string | number | null>(null)

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
			items.value = raw.map(adaptColumnaCampana)
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
			await columnaService[
				wasActive
					? 'patchDesactivarColumnaCampana'
					: 'patchActivarColumnaCampana'
			](
				{ columna: { tipo: { id: item.columnaId } }, idUsuario: 1 }
			)
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
            ...payload,
            idUsuario: 1
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
			await columnaService.updateColumnaCampana({
				idUsuario: 1,
				columna: {
					idABCConfigMapeoCampana: payload.idABCConfigMapeoCampana,
					idABCCatColumna: payload.idABCCatColumna,
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
        update
	}
}