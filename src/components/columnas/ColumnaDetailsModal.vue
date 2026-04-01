<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import BaseModalActions from '@/components/shared/modal/BaseModalActions.vue'
import BaseModalShell from '@/components/shared/modal/BaseModalShell.vue'
import { catalogosService } from '@/services/catalogos/catalogosService'

interface Option {
	label: string
	value: string | number
}

interface ColumnaDetailsItem {
	mapeoId?: number
	columnaId?: number
	bolActivo?: boolean
	obligatorio?: boolean | null
	valor?: any
	regex?: string | null
	fechaCreacion?: string
	fechaUltimaModificacion?: string
	columna?: any
	lineaId?: number
	campanaId?: number
}

const props = defineProps<{
	show: boolean
	item: ColumnaDetailsItem | null
	mapeos?: Option[]
	rawMapeos?: any[]
	columnas?: Option[]
	getMapeoLabel?: (id?: number) => string
	getColumnaLabel?: (id?: number) => string
    lineas?: Option[]
    campanas?: Option[]
    selectedLineaId?: number | string | null
    selectedLineaNombre?: string | null
    selectedCampanaId?: number | string | null
    selectedCampanaNombre?: string | null
	selectedMapeoId?: number | string | null
	selectedMapeoNombre?: string | null
}>()

const emit = defineEmits<{
	(e: 'close'): void
}>()

function formatDate(date?: string) {
	if (!date) return '—'
	const d = new Date(date)
	if (isNaN(d.getTime())) return '—'
	return d.toLocaleString('es-MX', {
		year: 'numeric',
		month: 'short',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit'
	})
}

const mapeoLabel = computed(() => {
	const item = props.item as ColumnaDetailsItem | null
	if (!item) return ''
	const selectedName = props.selectedMapeoNombre
	if (selectedName) return selectedName
	const mapeoId = props.selectedMapeoId ?? (item.mapeoId ?? item.columna?.idABCConfigMapeoLinea ?? item.columna?.idABCConfigMapeoCampana)
	if (props.getMapeoLabel) return props.getMapeoLabel(mapeoId as number | undefined)
	return (
		props.mapeos?.find(m => Number(m.value) === Number(mapeoId))?.label ??
		props.rawMapeos?.find?.((r: any) => Number(r.id ?? r.idABCConfigMapeoCampana ?? r.idABCConfigMapeoLinea ?? r.id_mapeo) === Number(mapeoId))?.nombre ??
		props.rawMapeos?.find?.((r: any) => Number(r.id ?? r.idABCConfigMapeoCampana ?? r.idABCConfigMapeoLinea ?? r.id_mapeo) === Number(mapeoId))?.descripcion ??
		`Mapeo ${mapeoId ?? ''}`
	)
})

const columnaLabel = computed(() => {
	const item = props.item as ColumnaDetailsItem | null
	if (!item) return ''
	const tipoId = item.columna?.tipo?.id ?? item.columnaId
	if (props.getColumnaLabel) return props.getColumnaLabel(tipoId as number | undefined)
	return (
		props.columnas?.find(c => c.value === tipoId)?.label ??
		`Columna ${tipoId ?? ''}`
	)
})

const lineaLabel = computed(() => {
	const item = props.item as ColumnaDetailsItem | null
	if (!item) return ''
	const id = (props.selectedLineaId ?? (item.columna?.lineaId ?? undefined)) as number | string | undefined
	if (props.selectedLineaNombre) return props.selectedLineaNombre
	return (
		props.lineas?.find(l => l.value == id)?.label ?? `Línea ${id ?? ''}`
	)
})

const campanaLabel = computed(() => {
	const item = props.item as ColumnaDetailsItem | null
	if (!item) return ''
	const id = (props.selectedCampanaId ?? (item.columna?.campanaId ?? undefined)) as number | string | undefined
	if (props.selectedCampanaNombre) return props.selectedCampanaNombre
	return (
		props.campanas?.find(c => c.value == id)?.label ?? `Campaña ${id ?? ''}`
	)
})

const hasLinea = computed(() => {
	const item = props.item as ColumnaDetailsItem | null
	const id = (props.selectedLineaId ?? (item?.columna?.lineaId ?? item?.lineaId ?? null)) as number | null
	return id !== undefined && id !== null
})

const hasCampana = computed(() => {
	const item = props.item as ColumnaDetailsItem | null
	const id = (props.selectedCampanaId ?? (item?.columna?.campanaId ?? item?.campanaId ?? null)) as number | null
	return id !== undefined && id !== null
})

const statusIsActive = computed(() => {
	const item = props.item as ColumnaDetailsItem | null
	if (!item) return false
	if (item.bolActivo !== undefined && item.bolActivo !== null) return Boolean(item.bolActivo)
	return Boolean(item.columna?.bolActivo)
})

function getRequiredVisual(required: boolean) {
	return {
		required,
		label: required ? '' : '',
		containerClass: required
			? 'bg-emerald-50/80 border-emerald-200 text-emerald-700'
			: 'bg-rose-50/70 border-rose-200 text-rose-700',
		iconWrapClass: required
			? 'bg-emerald-100 text-emerald-700'
			: 'bg-rose-100 text-rose-700'
	}
}


function getValor(item: ColumnaDetailsItem | null) {
	const valor = item?.columna?.valor ?? item?.valor ?? null
	if (!valor) return null
	const cadenaTipoId = Number(valor?.cadena?.tipo?.id ?? valor?.cadena?.tipoId ?? 0) || null
	const numeroTipoId = Number(valor?.numero?.tipo?.id ?? valor?.numero?.tipoId ?? 0) || null
	const fechaTipoId = Number(valor?.fecha?.tipo?.id ?? valor?.fecha?.tipoId ?? 0) || null
	const explicitTipoId = Number(valor?.tipo?.id ?? valor?.tipoId ?? 0) || null
	const inferredTipoId = explicitTipoId
		?? (numeroTipoId !== null ? 1 : null)
		?? (cadenaTipoId !== null ? 2 : null)
		?? (fechaTipoId !== null ? 3 : null)
	return {
		tipoId: inferredTipoId,
		cadena: {
			tipoId: cadenaTipoId,
			minimo: valor?.cadena?.minimo ?? null,
			maximo: valor?.cadena?.maximo ?? null
		},
		numero: {
			tipoId: numeroTipoId,
			enteros: valor?.numero?.enteros ?? null,
			decimales: valor?.numero?.decimales ?? null
		},
		fecha: {
			tipoId: fechaTipoId
		}
	}
}

const valor = computed(() => getValor(props.item))

const valMap = ref<Record<number, string>>({})
const cdnMap = ref<Record<number, string>>({})
const nmrMap = ref<Record<number, string>>({})
const fchMap = ref<Record<number, string>>({})

async function fetchValorCatalogs() {
	try {
		const catalogos = await catalogosService.getCatalogosAgrupados()
		const nmr = catalogos.find(group => group.codigo === 'NMR')?.registros ?? []
		const cdn = catalogos.find(group => group.codigo === 'CDN')?.registros ?? []
		const fch = catalogos.find(group => group.codigo === 'FCH')?.registros ?? []
		const val = catalogos.find(group => group.codigo === 'VAL')?.registros ?? []
		valMap.value = (val || []).reduce((acc: any, it: any) => ({ ...acc, [it.id]: it.nombre }), {})
		cdnMap.value = (cdn || []).reduce((acc: any, it: any) => ({ ...acc, [it.id]: it.nombre }), {})
		nmrMap.value = (nmr || []).reduce((acc: any, it: any) => ({ ...acc, [it.id]: it.nombre }), {})
		fchMap.value = (fch || []).reduce((acc: any, it: any) => ({ ...acc, [it.id]: it.nombre }), {})
	} catch (e) {
		valMap.value = {}
		cdnMap.value = {}
		nmrMap.value = {}
		fchMap.value = {}
	}
}

watch(
	() => props.show,
	(isOpen) => {
		if (isOpen) {
			fetchValorCatalogs()
		}
	},
	{ immediate: true }
)

function mapTipoName(id: number | null | undefined) {
	if (id === null || id === undefined) return '(Sin configuración)'
	return (valMap.value[id] ?? cdnMap.value[id] ?? nmrMap.value[id] ?? String(id))
}

function mapCadenaTipoName(id: number | null | undefined) {
	if (id === null || id === undefined) return '(Sin configuración)'
	return (cdnMap.value[id] ?? String(id))
}

function mapNumeroTipoName(id: number | null | undefined) {
	if (id === null || id === undefined) return '(Sin configuración)'
	return (nmrMap.value[id] ?? String(id))
}

function mapFechaTipoName(id: number | null | undefined) {
	if (id === null || id === undefined) return '(Sin configuración)'
	return (fchMap.value[id] ?? String(id))
}
</script>

<template>
	<BaseModalShell
		:show="props.show"
		title="Detalle de Columna"
		:mobile-bottom-sheet="true"
		max-width-class="max-w-lg max-[640px]:max-w-none"
		panel-class="rounded-2xl max-[640px]:rounded-t-2xl max-[640px]:rounded-b-none"
		body-class="p-3 sm:p-4 overflow-y-auto custom-scrollbar bg-slate-50 flex-1 min-h-0"
		@close="emit('close')"
	>
		<template #body>
			<div>
				<div v-if="!props.item" class="text-sm text-slate-500">
					Sin información para mostrar.
				</div>

				<div v-else class="space-y-4 text-sm">
					<div v-if="hasLinea" class="bg-slate-50 rounded-lg p-2 border border-slate-200">
						<span class="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
							Línea
						</span>
						<p class="mt-1 font-semibold text-slate-700">
							{{ lineaLabel }}
						</p>
					</div>

					<div v-if="hasCampana" class="bg-slate-50 rounded-lg p-2 border border-slate-200">
						<span class="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
							Campaña
						</span>
						<p class="mt-1 font-semibold text-slate-700">
							{{ campanaLabel }}
						</p>
					</div>
					<div class="bg-slate-50 rounded-lg p-2 border border-slate-200">
						<span class="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
							Mapeo
						</span>
						<p class="mt-1 font-semibold text-slate-700">
							{{ mapeoLabel }}
						</p>
					</div>

					<div class="bg-slate-50 rounded-lg p-2 border border-slate-200">
						<span class="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
							Columna
						</span>
						<p class="mt-1 font-semibold text-slate-700">
							{{ columnaLabel }}
						</p>
						
					</div>
					<div class="grid grid-cols-2 sm:grid-cols-3 gap-3">

						<div class="bg-slate-50 rounded-lg p-2 border border-slate-200 flex flex-col items-start">
							<span class="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Estatus</span>
							<span
								class="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full border transition-all duration-200"
								:class="statusIsActive
									? 'bg-blue-50 border-blue-200'
									: 'bg-slate-50 border-slate-200'"
							>
								<span
									class="h-2 w-2 rounded-full"
									:class="statusIsActive ? 'bg-[#00357F]' : 'bg-[#AD0A0A]'"
								></span>
								<span
									class="text-xs font-semibold"
									:class="statusIsActive ? 'text-[#00357F]' : 'text-slate-500'"
								>
									{{ statusIsActive ? 'Activo' : 'Inactivo' }}
								</span>
							</span>
						</div>

						<div class="bg-slate-50 rounded-lg p-2 border border-slate-200 flex flex-col items-start">
							<span class="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Requerido</span>
							<template v-for="requiredStage in [getRequiredVisual(Boolean(props.item.columna?.esRequerido ?? props.item.columna?.obligatorio ?? props.item.columna.esRequerido ?? props.item.obligatorio))]" :key="`obligatorio-detalle-${requiredStage.label}`">
								<div class="inline-flex items-center justify-center w-full max-w-full min-w-0 gap-2 px-2.5 py-1.5 mt-3 rounded-lg border text-xs font-semibold" :class="requiredStage.containerClass">
									<span class="h-5 w-5 rounded-full inline-flex items-center justify-center" :class="requiredStage.iconWrapClass">
										<svg v-if="requiredStage.required" class="w-3 h-3" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
											<path fill-rule="evenodd" d="M16.704 5.29a1 1 0 010 1.414l-7.25 7.25a1 1 0 01-1.414 0l-3-3a1 1 0 111.414-1.414l2.293 2.293 6.543-6.543a1 1 0 011.414 0z" clip-rule="evenodd" />
										</svg>
										<svg v-else class="w-3 h-3" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
											<circle cx="10" cy="10" r="6.5"></circle>
											<path d="M10 6.7V10.3"></path>
											<circle cx="10" cy="13.3" r="0.8" fill="currentColor" stroke="none"></circle>
										</svg>
									</span>
									<span>{{ requiredStage.label }}</span>
								</div>
							</template>
						</div>

						<div v-if="(props.item.columna?.regex ?? props.item.regex)" class="col-span-2 sm:col-span-1 bg-slate-50 rounded-lg p-2 border border-slate-200 flex flex-col items-start">
							<span class="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
								Regex
							</span>
							<p class="mt-3 text-slate-600 whitespace-pre-wrap font-mono text-xs">
								{{ props.item.columna?.regex ?? props.item.regex }}
							</p>
						</div>
						
					</div>

					<div class="bg-slate-50 rounded-lg p-2 border border-slate-200">
						
						<div class="p-2">
							<div class="grid grid-cols-1 gap-4">
								<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
									<div class="flex items-center gap-2 pb-2 border-b border-slate-100 ">
										<div class=" bg-gray-50 text-gray-600 rounded-md">
											<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
											</svg>
										</div>
									<div>
									<div class="text-sm font-semibold text-slate-700">
										<p class="text-[10px] text-slate-400 uppercase font-bold leading-none">Tipo de valor</p>
										<p class="text-sm font-semibold text-slate-700 mt-1">
											{{ mapTipoName(valor?.tipoId) }}
										</p>
									</div>
								</div>
								</div>
								<div class="flex items-center gap-2 pb-2 border-b border-slate-100" v-if="valor?.tipoId === 2" >
									<div class=" bg-gray-50 text-gray-600 rounded-md">
										<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h18M3 12h18m-7 7h7" />
										</svg>
									</div>
									<div>
										<p class="text-[10px] text-slate-400 uppercase font-bold leading-none">Subtipo de Cadena</p>
										<p class="text-sm font-semibold text-slate-700 mt-1">{{ mapCadenaTipoName(valor?.cadena?.tipoId) }}</p>
									</div>
								</div>

								<div class="flex items-center gap-2 pb-2 border-b border-slate-100" v-if="valor?.tipoId === 1">
									<div class=" bg-gray-50 text-gray-600 rounded-md">
										<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
										</svg>
									</div>
									<div>
										<p class="text-[10px] text-slate-400 uppercase font-bold leading-none">Subtipo de Número</p>
										<p class="text-sm font-semibold text-slate-700 mt-1">{{ mapNumeroTipoName(valor?.numero?.tipoId) }}</p>
									</div>
								</div>

									<div class="flex items-center gap-2 pb-2 border-b border-slate-100" v-if="valor?.tipoId === 3">
										<div class=" bg-gray-50 text-gray-600 rounded-md">
											<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10m-11 9h12a2 2 0 002-2V7a2 2 0 00-2-2H6a2 2 0 00-2 2v11a2 2 0 002 2z" />
											</svg>
										</div>
										<div>
											<p class="text-[10px] text-slate-400 uppercase font-bold leading-none">Subtipo de Fecha</p>
											<p class="text-sm font-semibold text-slate-700 mt-1">{{ mapFechaTipoName(valor?.fecha?.tipoId) }}</p>
										</div>
									</div>
							</div>

							<div v-if="valor?.tipoId === 2" class="space-y-3">

								<div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
								<div class=" p-2 rounded-lg border border-slate-100 shadow-sm">
									<span class="block text-[10px] text-slate-400 uppercase font-medium"> Mínimo</span>
									<span class="text-sm font-mono font-semibold text-slate-600">{{ valor?.cadena?.minimo ?? '—' }}</span>
								</div>
								<div class=" p-2 rounded-lg border border-slate-100 shadow-sm">
									<span class="block text-[10px] text-slate-400 uppercase font-medium"> Máximo</span>
									<span class="text-sm font-mono font-semibold text-slate-600">{{ valor?.cadena?.maximo ?? '—' }}</span>
								</div>
								</div>
							</div>

							<div v-if="valor?.tipoId === 1" class="space-y-3">

								<div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
								<div class=" p-2 rounded-lg border border-slate-100 shadow-sm">
									<span class="block text-[10px] text-slate-400 uppercase font-medium">Enteros</span>
									<span class="text-sm font-mono font-semibold text-slate-600">{{ valor?.numero?.enteros ?? '0' }}</span>
								</div>
								<div class=" p-2 rounded-lg border border-slate-100 shadow-sm" v-if="valor?.numero?.tipoId === 2">
									<span class="block text-[10px] text-slate-400 uppercase font-medium">Decimales</span>
									<span class="text-sm font-mono font-semibold text-slate-600">{{ valor?.numero?.decimales ?? '0' }}</span>
								</div>
								</div>
							</div>

							</div>
						</div>
						</div>

					<div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
						<div class="bg-slate-50 rounded-lg p-2 border border-slate-200">
							<span class="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
								Creado
							</span>
							<p class="mt-1 font-semibold text-slate-700">
								{{ formatDate(props.item.fechaCreacion ?? props.item.columna?.fechaCreacion) }}
							</p>
						</div>

						<div class="bg-slate-50 rounded-lg p-2 border border-slate-200">
							<span class="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
								Última modificación
							</span>
							<p class="mt-1 font-semibold text-slate-700">
								{{ formatDate(props.item.fechaUltimaModificacion ?? props.item.columna?.fechaUltimaModificacion) }}
							</p>
						</div>
					</div>
				</div>
			</div>
		</template>
		<template #footer>
			<BaseModalActions
				confirm-text="Aceptar"
				:show-cancel="false"
				@confirm="emit('close')"
			/>
		</template>
	</BaseModalShell>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
	width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
	background: #cbd5e1;
	border-radius: 10px;
}
</style>