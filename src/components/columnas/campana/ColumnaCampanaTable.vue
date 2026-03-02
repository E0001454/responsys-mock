<script setup lang="ts">
import { computed } from 'vue'
import { Eye, Edit3, Search, Plus } from 'lucide-vue-next'
import FilterDropdown from '@/components/FilterDropdown.vue'
import type { ColumnaCampanaModel } from '@/models/columnas/campana/columnaCampana.model'
import { useFirstRowNewGlow } from '@/composables/shared/useFirstRowNewGlow'

interface Option {
	label: string
	value: number
}

interface SelectedFilters {
	columnas: number[]
	status: boolean[]
}

const props = defineProps<{
	columnas: ColumnaCampanaModel[]
	columnasCatalogo: Option[]
	selectedFilters: SelectedFilters
	openFilter: string | null
	isLoading: boolean
	currentPage: number
	totalPages: number
	totalColumnas: number
}>()

const emit = defineEmits<{
	(e: 'toggle', item: ColumnaCampanaModel): void
	(e: 'toggleObligatorio', item: ColumnaCampanaModel): void
	(e: 'edit', item: ColumnaCampanaModel): void
	(e: 'details', item: ColumnaCampanaModel): void
	(e: 'add'): void
	(e: 'toggleFilter', column: string): void
	(e: 'selectAllColumnas'): void
	(e: 'prev'): void
	(e: 'next'): void
}>()

function getColumnaLabel(id: number) {
	return props.columnasCatalogo.find(c => c.value === id)?.label ?? `Columna ${id}`
}

const selectedColumnas = computed({
	get: () => props.selectedFilters.columnas,
	set: value => {
		props.selectedFilters.columnas = value
	}
})

const selectedStatus = computed({
	get: () => props.selectedFilters.status,
	set: value => {
		props.selectedFilters.status = value
	}
})

const statusOptions = [
	{ label: 'Activos', value: true },
	{ label: 'Inactivos', value: false }
]

const { isRowGlowing } = useFirstRowNewGlow(
	() => props.columnas,
	row => `${Number(row.mapeoId ?? 0)}-${Number(row.columnaId ?? 0)}`,
	{ isLoading: () => props.isLoading }
)

function getRequiredVisual(required: boolean) {
	return {
		required,
		label: required ? 'Requerido' : 'No requerido',
		containerClass: required
			? 'bg-blue-50 border-blue-200 text-[#00357F]'
			: 'bg-slate-50 border-slate-200 text-slate-600',
		iconWrapClass: required
			? 'bg-blue-100 text-[#00357F]'
			: 'bg-slate-200 text-slate-600'
	}
}

</script>

<template>
	<div class="w-full flex-col ">
		<div class="w-full justify-end justify-items-end flex mb-3">
			<button
				@click="emit('add')"
				class="flex items-center gap-2 bg-[#FFD100] hover:bg-yellow-400 text-[#00357F] text-sm font-bold py-2 px-4 rounded-lg shadow-sm hover:shadow transition-all cursor-pointer"
			>
				<Plus class="w-4 h-4" />
                <span>Nueva</span>
			</button>
		</div>
		<div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-visible flex flex-col  min-h-[400px] ">
			<div class="overflow-y-auto overflow-x-hidden flex-1" style="height: 100%; display: flex; justify-content: space-between; flex-flow: column nowrap;">
					<table class="w-full text-left border-collapse table-fixed">
						<colgroup>
							<col class="w-[45%]" />
							<col class="w-[15%]" />
							<col class="w-[20%]" />
							<col class="w-[20%]" />
						</colgroup>
						<thead>
							<tr class="border-b border-slate-200 bg-slate-50/50 text-xs text-slate-500 font-semibold tracking-wider">
								<th class="px-4 py-3 relative">
									<FilterDropdown
										label="Columnas"
										header-label="Filtrar por columna"
										:options="props.columnasCatalogo"
										v-model="selectedColumnas"
										:open="props.openFilter === 'columna'"
										:is-filtered="selectedColumnas.length < props.columnasCatalogo.length"
										@toggle="emit('toggleFilter', 'columna')"
										@select-all="emit('selectAllColumnas')"
									/>
								</th>

								<th class="px-4 py-3 relative text-center">
									<FilterDropdown
										label="Estados"
										header-label="Estado"
										:options="statusOptions"
										v-model="selectedStatus"
										:open="props.openFilter === 'status'"
										:is-filtered="selectedStatus.length < 2"
										:show-select-all="false"
										menu-width="w-48"
										@toggle="emit('toggleFilter', 'status')"
									/>
								</th>
								<th class="px-4 py-3 relative text-center">Obligatorio</th>
								<th class="px-4 py-3 text-right">Acciones</th>
							</tr>
						</thead>

					<tbody class="divide-y divide-slate-100">
						<tr v-if="props.isLoading">
							<td colspan="100%" class="px-4 py-12">
								<div class="flex flex-col items-center justify-center text-slate-500">
									<div class="w-6 h-6 border-2 border-[#00357F] border-t-transparent rounded-full animate-spin mb-2"></div>
									<span class="text-sm font-medium">Cargando datos...</span>
								</div>
							</td>
						</tr>

						<tr v-else-if="props.columnas.length === 0">
							<td colspan="100%" class="px-4 py-12">
								<div class="flex flex-col items-center justify-center text-slate-400">
									<Search class="w-8 h-8 mb-2 opacity-50" />
									<span class="text-sm">No hay registros.</span>
								</div>
							</td>
						</tr>

						<template v-else>
							<tr
								v-for="(c, index) in props.columnas"
								:key="`${c.mapeoId}-${c.columnaId}`"
									:class="['hover:bg-blue-50/30 transition-colors text-sm', { 'row-new-record-glow': isRowGlowing(c, index) }]"
									@dblclick="emit('details', c)"
							>
								<td class="px-4 py-2.5 text-slate-600">
									{{ getColumnaLabel(c.columna?.tipo?.idABCCatColumna ?? c.columna?.tipo?.id ?? c.columnaId) }}
								</td>

								<td class="px-4 py-2.5 text-center">
									<label
										class="inline-flex items-center gap-2 px-3 py-1 rounded-full border transition-all duration-200 cursor-pointer group select-none"
										:class="(c.bolActivo ?? c.columna?.bolActivo)
											? 'bg-blue-50 border-blue-200 hover:border-blue-300'
											: 'bg-slate-50 border-slate-200 hover:border-slate-300'"
									>
										<input
											type="checkbox"
											class="sr-only peer"
											:checked="c.bolActivo ?? c.columna?.bolActivo"
											@change="emit('toggle', c)"
										/>

										<span
											class="h-2 w-2 rounded-full transition-colors duration-200 shadow-sm"
											:class="(c.bolActivo ?? c.columna?.bolActivo)
												? 'bg-[#00357F]'
												: 'bg-[#AD0A0A]'"
										></span>

										<span
											class="text-xs font-semibold transition-colors duration-200"
											:class="(c.bolActivo ?? c.columna?.bolActivo)
												? 'text-[#00357F]'
												: 'text-slate-500'"
										>
											{{ (c.bolActivo ?? c.columna?.bolActivo) ? 'Activo' : 'Inactivo' }}
										</span>
									</label>
								</td>

								<td class="px-4 py-2.5 text-center">
									<template v-for="requiredStage in [getRequiredVisual(Boolean(c.esRequerido ?? c.obligatorio ?? c.columna?.esRequerido ?? c.columna?.obligatorio))]" :key="`obligatorio-${c.mapeoId}-${c.columnaId}`">
										<div class="inline-flex items-center justify-center w-36 gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold whitespace-nowrap" :class="requiredStage.containerClass">
											<span class="h-5 w-5 rounded-full inline-flex items-center justify-center" :class="requiredStage.iconWrapClass">
												<svg v-if="requiredStage.required" class="w-3 h-3" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
													<path d="M10 3.5V16.5"></path>
													<path d="M4.2 6.8L15.8 13.2"></path>
													<path d="M15.8 6.8L4.2 13.2"></path>
												</svg>
												<svg v-else class="w-3 h-3" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
													<path d="M6 10H14"></path>
													<circle cx="10" cy="10" r="6.5"></circle>
												</svg>
											</span>
											<span>{{ requiredStage.label }}</span>
										</div>
									</template>
								</td>

								

								<td class="px-4 py-2.5 text-right">
									<div class="inline-flex items-center justify-end gap-2">
										<button
											@click="emit('details', c)"
											class="relative p-1.5 text-slate-400 hover:text-[#00357F] hover:bg-blue-50 rounded-md transition-colors group"
										>
											<Eye class="w-4 h-4" />
										</button>

										<button
											@click.stop.prevent="emit('edit', c)"
											class="relative p-1.5 text-slate-400 hover:text-[#00357F] hover:bg-blue-50 rounded-md transition-colors group"
										>
											<Edit3 class="w-4 h-4" />
										</button>
									</div>
								</td>
							</tr>
						</template>
					</tbody>
				</table>

				<div class="px-4 py-3 border-t border-slate-200 bg-slate-50">
					<div class="flex items-center justify-between">
						

						<div class="flex items-center gap-3">
							<button
								class="hover:text-[#00357F] disabled:opacity-50"
								:disabled="props.currentPage <= 1"
								@click="emit('prev')"
							>
								Anterior
							</button>

							<span class="text-sm text-slate-500">Página {{ props.currentPage }} / {{ props.totalPages }}</span>

							<button
								class="hover:text-[#00357F] disabled:opacity-50"
								:disabled="props.currentPage >= props.totalPages"
								@click="emit('next')"
							>
								Siguiente
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>