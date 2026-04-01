<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { catalogosService } from '@/services/catalogos/catalogosService'
import { columnaService } from '@/services/columnas/columnaService'
import SearchableSelect from '@/components/forms/SearchableSelect.vue'
import ModalActionConfirmOverlay from '@/components/shared/ModalActionConfirmOverlay.vue'
import BaseModalActions from '@/components/shared/modal/BaseModalActions.vue'
import BaseModalShell from '@/components/shared/modal/BaseModalShell.vue'
import MissingRequiredLabelsAlert from '@/components/columnas/shared/MissingRequiredLabelsAlert.vue'
import type { ColumnaLineaModel } from '@/models/columnas/linea/columnaLinea.model'

interface Option {
	label: string
	value: string | number
	isRequired?: boolean
}

const props = defineProps<{
	show: boolean
	mode: 'add' | 'edit'
	initialData: ColumnaLineaModel | null
	isLoading: boolean
	mapeos: Option[]
	columnas: Option[]
	lineas?: Option[]
	existingItems: ColumnaLineaModel[]
	selectedMapeoId?: number | string | null
	selectedLineaId?: number | string | null
	selectedMapeoNombre?: string | null
	selectedLineaNombre?: string | null
}>()

const emit = defineEmits(['close', 'saved'])

const form = ref<any>({
	idABCConfigMapeoLinea: 0,
	lineaId: null,
	idABCCatColumna: 0,
	regex: '',
	esRequerido: true,
	valor: {
		tipoSel: null,
		tipoId: null,
		cadena: {
			tipoId: null,
			minimo: null,
			maximo: null
		},
		numero: {
			tipoId: null,
			enteros: null,
			decimales: null
		},
		fecha: {
			tipoId: null
		}
	}
})
const initialFormSnapshot = ref('')
const showActionConfirm = ref(false)
const pendingAction = ref<'save' | 'cancel' | null>(null)
const attemptedSave = ref(false)
const touchedNumericFields = ref({
	cadenaMinimo: false,
	cadenaMaximo: false,
	numeroEnteros: false,
	numeroDecimales: false
})

const valOptions = ref<Option[]>([])
const cdnOptions = ref<Option[]>([])
const nmrOptions = ref<Option[]>([])
const fchOptions = ref<Option[]>([])
const valItems = ref<any[]>([])

async function fetchTipoOptions() {
	try {
		const catalogos = await catalogosService.getCatalogosAgrupados()
		const nmr = catalogos.find(group => group.codigo === 'NMR')?.registros ?? []
		const cdn = catalogos.find(group => group.codigo === 'CDN')?.registros ?? []
		const fch = catalogos.find(group => group.codigo === 'FCH')?.registros ?? []
		const val = catalogos.find(group => group.codigo === 'VAL')?.registros ?? []
		valItems.value = val || []
		valOptions.value = (valItems.value || []).map(i => ({ label: i.nombre, value: String(i.id) }))
		cdnOptions.value = (cdn || []).map(i => ({ label: i.nombre, value: String(i.id) }))
		nmrOptions.value = (nmr || []).map(i => ({ label: i.nombre, value: String(i.id) }))
		fchOptions.value = (fch || []).map(i => ({ label: i.nombre, value: String(i.id) }))
	} catch (e) {
		valOptions.value = []
		cdnOptions.value = []
		nmrOptions.value = []
		fchOptions.value = []
	}
}

watch(
	() => props.show,
	(isOpen) => {
		if (isOpen) {
			fetchTipoOptions()
		}
	},
	{ immediate: true }
)

const isEditing = computed(() => props.mode === 'edit')
const isDirty = computed(() => serializeFormState(form.value) !== initialFormSnapshot.value)
const confirmTitle = computed(() => (pendingAction.value === 'save' ? 'Confirmar guardado' : 'Descartar cambios'))
const confirmMessage = computed(() =>
	pendingAction.value === 'save'
		? '¿Estás seguro de guardar los cambios de este registro?'
		: 'Se detectaron cambios sin guardar. ¿Deseas cancelar y descartar la información modificada?'
)
const confirmText = computed(() => (pendingAction.value === 'save' ? 'Aceptar' : 'Aceptar'))
const confirmCancelText = computed(() => (pendingAction.value === 'save' ? 'Cancelar' : 'Cancelar'))

const selectedVal = computed(() => {
	const id = Number(form.value.valor.tipoSel ?? 0)
	if (!id) return null
	return valItems.value.find((i: any) => i.id === id) ?? null
})
const selectedValorTipoId = computed(() => Number(form.value.valor.tipoSel ?? 0) || 0)
const selectedNumeroTipoId = computed(() => Number(form.value.valor.numero.tipoId ?? 0) || 0)

const isCadena = computed(() => {
	const s = selectedVal.value
	if (!s) return false
	const code = String(s.codigo || s.nombre || '').toUpperCase()
	return code.includes('CDN') || code.includes('CADENA')
})

const isNumero = computed(() => {
	const s = selectedVal.value
	if (!s) return false
	const code = String(s.codigo || s.nombre || '').toUpperCase()
	return code.includes('NMR') || code.includes('NUMER')
})

const isFecha = computed(() => {
	const s = selectedVal.value
	if (!s) return false
	const code = String(s.codigo || s.nombre || '').toUpperCase()
	return code.includes('FCH') || code.includes('FECHA')
})

const normalizeNumericValue = (value: unknown): number | null => {
	if (value === null || value === undefined || value === '') return null
	const numericValue = Number(value)
	return Number.isFinite(numericValue) ? numericValue : null
}

const cadenaMinimoValue = computed(() => normalizeNumericValue(form.value.valor.cadena.minimo))
const cadenaMaximoValue = computed(() => normalizeNumericValue(form.value.valor.cadena.maximo))
const numeroEnterosValue = computed(() => normalizeNumericValue(form.value.valor.numero.enteros))
const numeroDecimalesValue = computed(() => normalizeNumericValue(form.value.valor.numero.decimales))

const cadenaMinimoError = computed(() => {
	if (!isCadena.value) return ''
	if (cadenaMinimoValue.value === null) return 'El mínimo es obligatorio.'
	if (!Number.isInteger(cadenaMinimoValue.value) || cadenaMinimoValue.value < 1 || cadenaMinimoValue.value > 4000) {
		return 'El mínimo debe ser un entero entre 1 y 4000.'
	}
	return ''
})

const cadenaMaximoError = computed(() => {
	if (!isCadena.value) return ''
	if (cadenaMaximoValue.value === null) return 'El máximo es obligatorio.'
	if (!Number.isInteger(cadenaMaximoValue.value) || cadenaMaximoValue.value < 1 || cadenaMaximoValue.value > 4000) {
		return 'El máximo debe ser un entero entre 1 y 4000.'
	}
	if (
		cadenaMinimoValue.value !== null
		&& Number.isInteger(cadenaMinimoValue.value)
		&& cadenaMaximoValue.value < cadenaMinimoValue.value
	) {
		return 'El máximo debe ser mayor o igual al mínimo.'
	}
	return ''
})

const numeroEnterosError = computed(() => {
	if (!isNumero.value) return ''
	if (numeroEnterosValue.value === null) return 'Los enteros son obligatorios.'
	if (!Number.isInteger(numeroEnterosValue.value) || numeroEnterosValue.value < 1 || numeroEnterosValue.value > 4000) {
		return 'Los enteros deben estar entre 1 y 4000.'
	}
	return ''
})

const numeroDecimalesError = computed(() => {
	if (!isNumero.value || selectedNumeroTipoId.value !== 2) return ''
	if (numeroDecimalesValue.value === null) return 'Los decimales son obligatorios.'
	if (!Number.isInteger(numeroDecimalesValue.value) || numeroDecimalesValue.value < 0 || numeroDecimalesValue.value > 4) {
		return 'Los decimales deben estar entre 0 y 4.'
	}
	return ''
})

const columnaRequiredError = computed(() => Number(form.value.idABCCatColumna ?? 0) > 0 ? '' : 'Selecciona una columna.')
const tipoValorRequiredError = computed(() => selectedValorTipoId.value > 0 ? '' : 'Selecciona un tipo de valor.')
const subtipoCadenaRequiredError = computed(() => {
	if (!isCadena.value) return ''
	return Number(form.value.valor.cadena.tipoId ?? 0) > 0 ? '' : 'Selecciona un subtipo de cadena.'
})
const subtipoNumeroRequiredError = computed(() => {
	if (!isNumero.value) return ''
	return selectedNumeroTipoId.value > 0 ? '' : 'Selecciona un subtipo de número.'
})
const subtipoFechaRequiredError = computed(() => {
	if (!isFecha.value) return ''
	return Number(form.value.valor.fecha.tipoId ?? 0) > 0 ? '' : 'Selecciona un subtipo de fecha.'
})

const hasNumericValidationError = computed(() => Boolean(
	columnaRequiredError.value
	|| tipoValorRequiredError.value
	|| subtipoCadenaRequiredError.value
	|| subtipoNumeroRequiredError.value
	|| subtipoFechaRequiredError.value
	|| 
	cadenaMinimoError.value
	|| cadenaMaximoError.value
	|| numeroEnterosError.value
	|| numeroDecimalesError.value
))
const showCadenaMinimoError = computed(() => touchedNumericFields.value.cadenaMinimo && Boolean(cadenaMinimoError.value))
const showCadenaMaximoError = computed(() => touchedNumericFields.value.cadenaMaximo && Boolean(cadenaMaximoError.value))
const showNumeroEnterosError = computed(() => touchedNumericFields.value.numeroEnteros && Boolean(numeroEnterosError.value))
const showNumeroDecimalesError = computed(() => touchedNumericFields.value.numeroDecimales && Boolean(numeroDecimalesError.value))

const lineaOptions = computed<Option[]>(() => {
	const base = (props.lineas || []) as Option[]
	const selectedId = props.selectedLineaId ?? form.value.lineaId ?? null
	if (selectedId === null || selectedId === undefined) return base
	if (base.some(l => l.value == selectedId)) return base
	return [
		{
			label: props.selectedLineaNombre ?? base.find(l => l.value == selectedId)?.label ?? `Línea ${selectedId}`,
			value: Number(selectedId)
		},
		...base
	]
})

const mapeoOptions = computed<Option[]>(() => {
	const base = props.mapeos as Option[]
	const selectedId = props.selectedMapeoId ?? form.value.idABCConfigMapeoLinea ?? null
	if (selectedId === null || selectedId === undefined) return base
	if (base.some(m => m.value == selectedId)) return base
	return [
		{
			label: props.selectedMapeoNombre ?? base.find(m => m.value == selectedId)?.label ?? `Mapeo ${selectedId}`,
			value: String(selectedId)
		},
		...base
	]
})

const availableColumnas = computed(() => {
	const selectedMapeo = form.value.idABCConfigMapeoLinea
	if (!selectedMapeo) return props.columnas

	const taken = new Set(
		props.existingItems
			.filter(item => String(item.mapeoId ?? '') === String(selectedMapeo))
			.map(item => String(item.columnaId ?? ''))
	)

	return props.columnas.filter(option => {
		if (isEditing.value && option.value === String(form.value.idABCCatColumna)) return true
		return !taken.has(String(option.value))
	})
})

const selectedColumnaOption = computed<Option | undefined>(() =>
	(props.columnas as Option[]).find(option => Number(option.value) === Number(form.value.idABCCatColumna ?? 0))
)

const missingRequiredOptions = computed<Option[]>(() => {
	const selectedMapeo = String(form.value.idABCConfigMapeoLinea ?? '')
	if (!selectedMapeo) return []

	const requiredOptions = (props.columnas as Option[]).filter(option => Boolean(option.isRequired))
	if (!requiredOptions.length) return []

	const configuredIds = new Set(
		props.existingItems
			.filter(item => String(item.mapeoId ?? '') === selectedMapeo)
			.map(item => String(item.columnaId ?? ''))
	)

	return requiredOptions.filter(option => !configuredIds.has(String(option.value)))
})
function resetForm() {
	attemptedSave.value = false
	form.value = {
		idABCConfigMapeoLinea: props.selectedMapeoId ?? 0,
		lineaId: props.selectedLineaId ?? null,
		idABCCatColumna: 0,
		regex: '',
		esRequerido: true,
		valor: {
			tipoSel: null,
			tipoId: null,
			cadena: { tipoId: null, minimo: null, maximo: null },
			numero: { tipoId: null, enteros: null, decimales: null },
			fecha: { tipoId: null }
		}
	}
}

const serializeFormState = (value: any) => JSON.stringify(value)

const restoreInitialInformation = () => {
	if (!props.initialData) return
	attemptedSave.value = false

	form.value.idABCConfigMapeoLinea = props.initialData.mapeoId
	form.value.lineaId = props.selectedLineaId ?? form.value.lineaId
	form.value.idABCCatColumna = props.initialData.columnaId
	form.value.regex = props.initialData.regex ?? ''
	form.value.esRequerido = props.initialData.esRequerido ?? props.initialData.obligatorio ?? props.initialData.columna?.esRequerido ?? props.initialData.columna?.obligatorio ?? null
	const v = props.initialData.valor ?? props.initialData.columna?.valor ?? null
	if (v) {
		form.value.valor.tipoSel = v.tipo?.id ?? null
		form.value.valor.tipoId = v.tipo?.id ?? null
		form.value.valor.cadena.tipoId = v.cadena?.tipo?.id ?? null
		form.value.valor.cadena.minimo = v.cadena?.minimo ?? null
		form.value.valor.cadena.maximo = v.cadena?.maximo ?? null
		form.value.valor.numero.tipoId = v.numero?.tipo?.id ?? null
		form.value.valor.numero.enteros = v.numero?.enteros ?? null
		form.value.valor.numero.decimales = v.numero?.decimales ?? null
		form.value.valor.fecha.tipoId = v.fecha?.tipo?.id ?? null
	} else {
		form.value.valor = {
			tipoSel: null,
			tipoId: null,
			cadena: { tipoId: null, minimo: null, maximo: null },
			numero: { tipoId: null, enteros: null, decimales: null },
			fecha: { tipoId: null }
		}
	}
}

const closeActionConfirm = () => {
	showActionConfirm.value = false
	pendingAction.value = null
}

const requestSave = async () => {
	if (isEditing.value) {
		pendingAction.value = 'save'
		showActionConfirm.value = true
		return
	}

	attemptedSave.value = true
	if (hasNumericValidationError.value) {
		touchedNumericFields.value = {
			cadenaMinimo: isCadena.value,
			cadenaMaximo: isCadena.value,
			numeroEnteros: isNumero.value,
			numeroDecimales: isNumero.value && selectedNumeroTipoId.value === 2
		}
		return
	}

	await save()
}

const requestCancel = () => {
	if (isEditing.value && isDirty.value) {
		pendingAction.value = 'cancel'
		showActionConfirm.value = true
		return
	}

	emit('close')
}

const confirmAction = async () => {
	if (pendingAction.value === 'save') {
		attemptedSave.value = true
		if (hasNumericValidationError.value) {
			touchedNumericFields.value = {
				cadenaMinimo: isCadena.value,
				cadenaMaximo: isCadena.value,
				numeroEnteros: isNumero.value,
				numeroDecimales: isNumero.value && selectedNumeroTipoId.value === 2
			}
			closeActionConfirm()
			return
		}

		try {
			await save()
		} finally {
			closeActionConfirm()
		}
		return
	} else if (pendingAction.value === 'cancel') {
		emit('close')
	}

	closeActionConfirm()
}

watch(
	() => props.selectedMapeoId,
	(v) => {
		if (v !== undefined && v !== null && !isEditing.value) {
			form.value.idABCConfigMapeoLinea = v
		}
	}
)

watch(
    () => props.selectedLineaId,
    (v) => {
        if (v !== undefined && v !== null) {
            form.value.lineaId = v
        }
    }
)

watch(
	[
		() => props.show,
		() => props.mode,
		() => props.initialData
	],
	(
		[show, mode, initialData]: [
			boolean,
			'add' | 'edit',
			ColumnaLineaModel | null
		]
	) => {
		if (!show) return

		if (mode === 'add') {
			resetForm()
			initialFormSnapshot.value = serializeFormState(form.value)
			attemptedSave.value = false
			return
		}

		if (mode === 'edit' && initialData) {
			form.value.idABCConfigMapeoLinea = initialData.mapeoId
			form.value.lineaId = props.selectedLineaId ?? form.value.lineaId
			form.value.idABCCatColumna = initialData.columnaId
			form.value.regex = initialData.regex ?? ''
			form.value.esRequerido = initialData.esRequerido ?? initialData.obligatorio ?? initialData.columna?.esRequerido ?? initialData.columna?.obligatorio ?? null
			const v = initialData.valor ?? initialData.columna?.valor ?? null
			if (v) {

				form.value.valor.tipoSel = v.tipo?.id ?? null
					form.value.valor.tipoId = v.tipo?.id ?? null
				form.value.valor.cadena.tipoId = v.cadena?.tipo?.id ?? null
				form.value.valor.cadena.minimo = v.cadena?.minimo ?? null
				form.value.valor.cadena.maximo = v.cadena?.maximo ?? null
				form.value.valor.numero.tipoId = v.numero?.tipo?.id ?? null
				form.value.valor.numero.enteros = v.numero?.enteros ?? null
				form.value.valor.numero.decimales = v.numero?.decimales ?? null
				form.value.valor.fecha.tipoId = v.fecha?.tipo?.id ?? null
			} else {
				form.value.valor = {
					tipoSel: null,
					tipoId: null,
					cadena: { tipoId: null, minimo: null, maximo: null },
					numero: { tipoId: null, enteros: null, decimales: null },
					fecha: { tipoId: null }
				}
			}
		}

		initialFormSnapshot.value = serializeFormState(form.value)
		attemptedSave.value = false
	},
	{ immediate: true }
)

watch(
	() => form.value.idABCConfigMapeoLinea,
	() => {
		if (!form.value.idABCCatColumna) return
		const stillAvailable = availableColumnas.value.some(
			c => c.value === form.value.idABCCatColumna
		)
		if (!stillAvailable) {
			form.value.idABCCatColumna = 0
		}
	}
)

watch(
	() => form.value.idABCCatColumna,
	() => {
		const selected = selectedColumnaOption.value
		if (selected?.isRequired) {
			form.value.esRequerido = true
		}
	}
)

watch(
	() => form.value.valor.tipoSel,
	() => {
		touchedNumericFields.value = {
			cadenaMinimo: false,
			cadenaMaximo: false,
			numeroEnteros: false,
			numeroDecimales: false
		}
	}
)

async function save() {
	const tipoValorId = selectedValorTipoId.value || null
	const subtipoCadenaId = tipoValorId === 2 ? (Number(form.value.valor.cadena.tipoId ?? 0) || null) : null
	const subtipoNumeroId = tipoValorId === 1 ? (selectedNumeroTipoId.value || null) : null
	
	const valorPayload: any = {
		tipo: { id: tipoValorId },
		cadena: {
			tipo: { id: subtipoCadenaId },
			minimo: tipoValorId === 2 ? (form.value.valor.cadena.minimo ?? null) : null,
			maximo: tipoValorId === 2 ? (form.value.valor.cadena.maximo ?? null) : null
		},
		numero: {
			tipo: { id: subtipoNumeroId },
			enteros: tipoValorId === 1 ? (form.value.valor.numero.enteros ?? null) : null,
			decimales: tipoValorId === 1 && selectedNumeroTipoId.value === 2
				? (form.value.valor.numero.decimales ?? null)
				: null
		},
		fecha: {
			tipo: {
				id: tipoValorId === 3 ? (Number(form.value.valor.fecha.tipoId ?? 0) || null) : null
			}
		}
	}

	const columnaPayload: any = {
		tipo: { id: form.value.idABCCatColumna ?? null },
		esRequerido: Boolean(form.value.esRequerido),
		valor: valorPayload
	}

	if (props.mode === 'edit') {
		columnaPayload.regex = form.value.regex || null
	}

	const payload = {
		columna: columnaPayload,
		idUsuario: (props.initialData as any)?.idUsuario ?? 1
	}

	if (props.mode === 'add') {
		await columnaService.createColumnaLinea(form.value.idABCConfigMapeoLinea, payload)
	} else {
		await columnaService.updateColumnaLinea(form.value.idABCConfigMapeoLinea, payload)
	}

	emit('saved')
	emit('close')
}

</script>

<template>
	<BaseModalShell
		:show="show"
		title="Agregar columna"
		:mobile-bottom-sheet="true"
		max-width-class="max-w-2xl max-[640px]:max-w-none"
		panel-class="rounded-2xl max-[640px]:rounded-t-2xl max-[640px]:rounded-b-none"
		body-class="p-3 sm:p-4 overflow-y-auto custom-scrollbar bg-slate-50 flex-1 min-h-0"
		@close="requestCancel"
	>
		<template #body>
			<form @submit.prevent="requestSave" class="flex flex-col min-h-0 flex-1 h-full">
				<div class="bg-white p-4 sm:p-5 rounded-xl shadow-sm border border-gray-200 space-y-5">

					<div v-if="lineas && lineas.length">
						<label class="block text-[10px] font-bold text-gray-500 uppercase mb-1">Línea</label>
						<SearchableSelect
							v-model="form.lineaId"
							:options="lineaOptions"
							:disabled="true"
							placeholder="Seleccione una opción"
						/>
					</div>
					<div>
						<label class="block text-[10px] font-bold text-gray-500 uppercase mb-1">Mapeo</label>
						<SearchableSelect
							v-model="form.idABCConfigMapeoLinea"
							:options="mapeoOptions"
							:disabled="true"
							placeholder="Seleccione una opción"
						/>
					</div>

					<div>
						<label class="block text-[10px] font-bold text-gray-500 uppercase mb-1">
							Columna <span class="text-red-500 ml-1">*</span>
						</label>
						<div class="relative">
							<SearchableSelect
								v-model="form.idABCCatColumna"
								:options="availableColumnas"
								:disabled="isEditing"
								placeholder="Seleccione una opción"
							/>
							
							<p v-if="attemptedSave && columnaRequiredError" class="text-xs text-red-500 mt-1">{{ columnaRequiredError }}</p>
							<MissingRequiredLabelsAlert class="mt-2" :items="missingRequiredOptions" />
						</div>
					</div>

					<div>
						
						<div class="flex items-center gap-3">
							<label class="inline-flex items-center gap-2">
								<span class="block text-[10px] font-bold text-gray-500 uppercase mb-1">Obligatorio</span>
								<input type="checkbox" v-model="form.esRequerido" class="h-4 w-4 accent-[#00357F]" />
							</label>
						</div>
					</div>

					<div>
						<div>
							<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
								<div>
									<label class="block text-[10px] font-bold text-gray-500 uppercase mb-1">Tipo valor</label>
									<SearchableSelect
										v-model="form.valor.tipoSel"
										:options="valOptions"
										placeholder="Seleccione una opción"
									/>
									<p v-if="attemptedSave && tipoValorRequiredError" class="text-xs text-red-500 mt-1">{{ tipoValorRequiredError }}</p>
								</div>
								<div>
									<div v-if="isCadena">
										<label class="block text-[10px] font-bold text-gray-500 uppercase mb-1">Subtipo cadena</label>
										<SearchableSelect
											v-model="form.valor.cadena.tipoId"
											:options="cdnOptions"
											placeholder="Seleccione una opción"
										/>
										<p v-if="attemptedSave && subtipoCadenaRequiredError" class="text-xs text-red-500 mt-1">{{ subtipoCadenaRequiredError }}</p>
									</div>
									<div v-else-if="isNumero">
										<label class="block text-[10px] font-bold text-gray-500 uppercase mb-1">Subtipo número</label>
										<SearchableSelect
											v-model="form.valor.numero.tipoId"
											:options="nmrOptions"
											placeholder="Seleccione una opción"
										/>
										<p v-if="attemptedSave && subtipoNumeroRequiredError" class="text-xs text-red-500 mt-1">{{ subtipoNumeroRequiredError }}</p>
										</div>
										<div v-else-if="isFecha">
											<label class="block text-[10px] font-bold text-gray-500 uppercase mb-1">Subtipo fecha</label>
											<SearchableSelect
												v-model="form.valor.fecha.tipoId"
												:options="fchOptions"
												placeholder="Seleccione una opción"
											/>
											<p v-if="attemptedSave && subtipoFechaRequiredError" class="text-xs text-red-500 mt-1">{{ subtipoFechaRequiredError }}</p>
									</div>
									<div v-else>
										<label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Subtipo </label>
										<div  class="flex items-start justify-start text-sm text-slate-400 bg-gray-50 border border-gray-200 rounded-lg p-2">
											Elige un tipo
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>

					<div class="grid grid-cols-1 sm:grid-cols-2 gap-4" v-if="selectedValorTipoId === 2">
						<div>
							<label class="block text-[10px] font-bold text-gray-500 uppercase mb-1">Mínimo (cadena)</label>
							<input type="number" min="1" max="4000" step="1" maxlength="4" size="4" placeholder="Ej. 1" v-model.number="form.valor.cadena.minimo" class="w-full px-4 py-2.5 bg-gray-50 border rounded-lg text-sm focus:ring-2 focus:ring-[#00357F]" :class="showCadenaMinimoError ? 'border-red-400 focus:ring-red-200' : 'border-gray-300'" @blur="touchedNumericFields.cadenaMinimo = true" />
							<p v-if="showCadenaMinimoError" class="text-xs text-red-500 mt-1">{{ cadenaMinimoError }}</p>
						</div>

						<div>
							<label class="block text-[10px] font-bold text-gray-500 uppercase mb-1">Máximo (cadena)</label>
							<input type="number" min="1" max="4000" step="1" maxlength="4" size="4" placeholder="Ej. 10" v-model.number="form.valor.cadena.maximo" class="w-full px-4 py-2.5 bg-gray-50 border rounded-lg text-sm focus:ring-2 focus:ring-[#00357F]" :class="showCadenaMaximoError ? 'border-red-400 focus:ring-red-200' : 'border-gray-300'" @blur="touchedNumericFields.cadenaMaximo = true" />
							<p v-if="showCadenaMaximoError" class="text-xs text-red-500 mt-1">{{ cadenaMaximoError }}</p>
						</div>
					</div>

					<div class="grid grid-cols-1 sm:grid-cols-2 gap-4" v-if="selectedValorTipoId === 1">
						<div>
							<label class="block text-[10px] font-bold text-gray-500 uppercase mb-1">Enteros (número)</label>
							<input type="number" min="1" max="4000" step="1" placeholder="Ej. 3" v-model.number="form.valor.numero.enteros" class="w-full px-4 py-2.5 bg-gray-50 border rounded-lg text-sm focus:ring-2 focus:ring-[#00357F]" :class="showNumeroEnterosError ? 'border-red-400 focus:ring-red-200' : 'border-gray-300'" @blur="touchedNumericFields.numeroEnteros = true" />
							<p v-if="showNumeroEnterosError" class="text-xs text-red-500 mt-1">{{ numeroEnterosError }}</p>
						</div>

						<div v-if="selectedNumeroTipoId === 2">
							<label class="block text-[10px] font-bold text-gray-500 uppercase mb-1">Decimales (número)</label>
							<input type="number" min="0" max="4" step="1" placeholder="Ej. 2" v-model.number="form.valor.numero.decimales" class="w-full px-4 py-2.5 bg-gray-50 border rounded-lg text-sm focus:ring-2 focus:ring-[#00357F]" :class="showNumeroDecimalesError ? 'border-red-400 focus:ring-red-200' : 'border-gray-300'" @blur="touchedNumericFields.numeroDecimales = true" />
							<p v-if="showNumeroDecimalesError" class="text-xs text-red-500 mt-1">{{ numeroDecimalesError }}</p>
						</div>
					</div>

                    

					

					<div v-if="mode === 'edit'" class="flex justify-end">
						<button
							type="button"
							title="Restaurar información"
							aria-label="Restaurar información"
							class="group relative h-[42px] w-[42px] inline-flex items-center justify-center rounded-lg text-slate-500 bg-white border border-slate-200 hover:text-[#00357F] hover:border-[#00357F]/30 hover:bg-slate-50 transition disabled:opacity-40 disabled:cursor-not-allowed"
							:disabled="isLoading || showActionConfirm"
							@click="restoreInitialInformation"
						>
							<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h5M20 20v-5h-5M19 9a7 7 0 00-12-3M5 15a7 7 0 0012 3" />
							</svg>
							<span class="pointer-events-none absolute right-0 -top-9 whitespace-nowrap rounded-md bg-[#00357F] px-2 py-1 text-[11px] font-semibold text-white opacity-0 shadow-sm transition-opacity duration-150 group-hover:opacity-100">Restaurar información</span>
						</button>
					</div>

					</div>
			</form>
		</template>
		<template #footer>
			<BaseModalActions
				confirm-type="submit"
				:loading="isLoading"
				:disabled-cancel="Boolean(isLoading || showActionConfirm)"
				:disabled-confirm="Boolean(isLoading || showActionConfirm)"
				@cancel="requestCancel"
				@confirm="requestSave"
			>
				<template #left>
					<button
						v-if="mode === 'add'"
						type="button"
						title="Restaurar todo"
						aria-label="Restaurar todo"
						class="h-[42px] w-[42px] inline-flex items-center justify-center rounded-lg text-slate-500 bg-white border border-slate-200 hover:text-[#00357F] hover:border-[#00357F]/30 hover:bg-slate-50 transition disabled:opacity-40 disabled:cursor-not-allowed"
						:disabled="isLoading || showActionConfirm"
						@click="resetForm"
					>
						<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h5M20 20v-5h-5M19 9a7 7 0 00-12-3M5 15a7 7 0 0012 3" />
						</svg>
					</button>
				</template>
			</BaseModalActions>
		</template>
		<template #overlay>
			<ModalActionConfirmOverlay
				:show="showActionConfirm"
				:title="confirmTitle"
				:message="confirmMessage"
				:confirm-text="confirmText"
				:cancel-text="confirmCancelText"
				:is-loading="isLoading"
				@confirm="confirmAction"
				@cancel="closeActionConfirm"
			/>
		</template>
	</BaseModalShell>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
	width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
	background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
	background: #cbd5e1;
	border-radius: 10px;
}
</style>