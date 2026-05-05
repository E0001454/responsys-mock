<script setup lang="ts">
import { computed } from 'vue'
import { Eye, Edit3, Search, Plus } from 'lucide-vue-next'
import FilterDropdown from '@/components/FilterDropdown.vue'
import type { ColumnaLineaModel } from '@/models/columnas/linea/columnaLinea.model'
import { useFirstRowNewGlow } from '@/composables/shared/useFirstRowNewGlow'

interface Option {
  label: string
  value: string | number
}

interface SelectedFilters {
  columnas: (string | number)[]
  status: boolean[]
}

const props = defineProps<{
  columnas: ColumnaLineaModel[]
  columnasCatalogo: Option[]
  selectedFilters: SelectedFilters
  openFilter: string | null
  isLoading: boolean
  currentPage: number
  totalPages: number
  totalColumnas: number
}>()

const emit = defineEmits<{
  (e: 'toggle', item: ColumnaLineaModel): void
  (e: 'toggleObligatorio', item: ColumnaLineaModel): void
  (e: 'edit', item: ColumnaLineaModel): void
  (e: 'details', item: ColumnaLineaModel): void
  (e: 'add'): void
  (e: 'toggleFilter', column: string): void
  (e: 'selectAllColumnas'): void
  (e: 'prev'): void
  (e: 'next'): void
}>()

function getColumnaLabel(id?: number | string) {
  if (!id) return '-'
  return props.columnasCatalogo.find(c => c.value === String(id))?.label ?? `Columna ${id}`
}

const selectedColumnas = computed({
  get: () => props.selectedFilters.columnas,
  set: v => (props.selectedFilters.columnas = v)
})

const selectedStatus = computed({
  get: () => props.selectedFilters.status,
  set: v => (props.selectedFilters.status = v)
})

const statusOptions = [
  { label: 'Activos', value: true },
  { label: 'Inactivos', value: false }
]

const { isRowGlowing } = useFirstRowNewGlow(
  () => props.columnas,
  row => `${Number(row.mapeoId ?? 0)}-${Number(row.columnaId ?? 0)}`,
  {
    isLoading: () => props.isLoading,
    getRowChangeToken: row => {
      const item = row as ColumnaLineaModel
      return `${Number(item.mapeoId ?? 0)}-${Number(item.columnaId ?? 0)}-${item.fechaUltimaModificacion ?? item.fechaCreacion ?? ''}`
    }
  }
)

function getRequiredVisual(required: boolean) {
  return {
    required,
    label: required ? '' : '',
    containerClass: required
      ? 'bg-emerald-50 border-emerald-200 text-[#00357F]'
      : 'bg-rose-50 border-rose-200 text-rose-600',
    iconWrapClass: required
      ? 'bg-emerald-100 text-[#00357F]'
      : 'bg-rose-200 text-rose-600'
  }
}
</script>

<template>
  <div class="w-full flex-col">
    <div class="w-full justify-end justify-items-end flex mb-3">
      <button
        @click="emit('add')"
        class="flex items-center gap-2 bg-[#FFD100] hover:bg-yellow-400 text-[#00357F] text-sm font-bold py-2 px-4 rounded-lg shadow-sm hover:shadow transition-all cursor-pointer"
      >
        <Plus class="w-4 h-4" />
        <span>Nueva</span>
      </button>
    </div>
    <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-visible flex flex-col min-h-[72dvh] h-[calc(100dvh-11rem)] max-h-[calc(100dvh-8rem)] max-[650px]:h-[78dvh] max-[650px]:min-h-[68dvh] max-[650px]:max-h-none">
      <div class="overflow-y-auto overflow-x-hidden max-[1024px]:overflow-x-auto flex-1 min-h-0">
        <table class="w-full max-[1024px]:min-w-[920px] max-[650px]:min-w-[620px] text-left border-collapse table-fixed">
          <colgroup>
            <col class="w-[45%]" />
            <col class="w-[15%]" />
            <col class="w-[20%]" />
            <col class="w-[20%]" />
          </colgroup>
  
          <thead>
            <tr
              class="border-b border-slate-200 bg-slate-50/50 text-xs text-slate-500 font-semibold tracking-wider"
            >
              <th class="px-2.5 py-2.5 sm:px-4 sm:py-3 relative">
                <FilterDropdown
                  label="Columnas"
                  header-label="Filtrar por columna"
                  :options="columnasCatalogo"
                  v-model="selectedColumnas"
                  :open="openFilter === 'columna'"
                  :is-filtered="selectedColumnas.length < columnasCatalogo.length"
                  @toggle="emit('toggleFilter', 'columna')"
                  @select-all="emit('selectAllColumnas')"
                />
              </th>
  
              <th class="px-2.5 py-2.5 sm:px-4 sm:py-3 relative text-center">
                <FilterDropdown
                  label="Estado"
                  header-label="Estado"
                  :options="statusOptions"
                  v-model="selectedStatus"
                  :open="openFilter === 'status'"
                  :is-filtered="selectedStatus.length < 2"
                  :show-select-all="false"
                  menu-width="w-48"
                  @toggle="emit('toggleFilter', 'status')"
                />
              </th>
  
              <th class="px-2.5 py-2.5 sm:px-4 sm:py-3 relative text-center">
                Requerido
              </th>
  
              <th class="px-2.5 py-2.5 sm:px-4 sm:py-3 text-right">
                Acciones
              </th>
            </tr>
          </thead>
  
          <tbody class="divide-y divide-slate-100">
            <tr v-if="isLoading">
              <td colspan="100%" class="px-4 py-12">
                <div class="flex flex-col items-center justify-center text-slate-500">
                  <div
                    class="w-6 h-6 border-2 border-[#00357F] border-t-transparent rounded-full animate-spin mb-2"
                  ></div>
                  <span class="text-sm font-medium">Cargando datos...</span>
                </div>
              </td>
            </tr>
  
            <tr v-else-if="!columnas.length">
              <td colspan="100%" class="px-4 py-12">
                <div class="sticky left-0 mx-auto flex w-fit flex-col items-center justify-center text-slate-400">
                  <Search class="w-8 h-8 mb-2 opacity-50" />
                  <span class="text-sm">No hay registros.</span>
                </div>
              </td>
            </tr>
  
            <template v-else>
              <tr
                v-for="(c, index) in columnas"
                :key="`${c.mapeoId}-${c.columnaId}`"
                :class="[index % 2 === 0 ? 'bg-white' : 'bg-slate-200/60', 'hover:bg-blue-50/30 transition-colors text-sm', { 'row-new-record-glow': isRowGlowing(c, index) }]"
                @dblclick="emit('details', c)"
              >
                <td class="px-2.5 py-2 sm:px-4 sm:py-2.5 text-slate-600">
                  {{ getColumnaLabel(c.columna?.tipo?.idABCCatColumna ?? c.columna?.tipo?.id ?? c.columnaId) }}
                </td>
  
                <td class="px-2.5 py-2 sm:px-4 sm:py-2.5 text-center">
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
  
                <td class="px-2.5 py-2 sm:px-4 sm:py-2.5 text-center">
                  <template v-for="requiredStage in [getRequiredVisual(Boolean(c.esRequerido ?? c.obligatorio ?? c.columna?.esRequerido ?? c.columna?.obligatorio))]" :key="`obligatorio-${c.mapeoId}-${c.columnaId}`">
                    <div class="inline-flex items-center px-2.5 py-1 rounded-lg border text-[11px] font-semibold" :class="requiredStage.containerClass">
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

                    </div>
                  </template>
                </td>
  
                <td class="px-2.5 py-2 sm:px-4 sm:py-2.5 text-right">
                  <div class="inline-flex items-center justify-end gap-2">
                    <button
                      @click="emit('details', c)"
                      title="Ver detalle"
                      class="relative p-1.5 text-slate-400 hover:text-[#00357F] hover:bg-blue-50 rounded-md transition-colors group"
                    >
                      <Eye class="w-4 h-4" />
                    </button>
  
                    <button
                      @click.stop.prevent="emit('edit', c)"
                      title="Modificar"
                      class="relative p-1.5 text-slate-400 hover:text-[#00357F] hover:bg-blue-50 rounded-md transition-colors group"
                    >
                      <Edit3 class="w-4 h-4" />
                    </button>
                  </div>
                </td>
  
              </tr>
  
              <tr>
                <td colspan="4" class="px-4 py-3">
                  
                </td>
              </tr>
            </template>
          </tbody>
        </table>
  
      </div>

      <div
        class="px-4 py-3 border-t border-slate-200 bg-slate-50 text-xs text-slate-500 flex justify-between items-center rounded-b-xl shrink-0"
      >
        <span>
          Mostrando {{ columnas.length }} de {{ totalColumnas }} registros
        </span>

        <div class="flex gap-2 items-center">
          <button
            class="hover:text-[#00357F] disabled:opacity-50"
            :disabled="currentPage <= 1"
            @click="emit('prev')"
          >
            Anterior
          </button>

          <span class="text-[11px] text-slate-400">
            {{ currentPage }} / {{ totalPages }}
          </span>

          <button
            class="hover:text-[#00357F] disabled:opacity-50 "
            :disabled="currentPage >= totalPages"
            @click="emit('next')"
          >
            Siguiente
          </button>
        </div>
      </div>

    </div>
  </div>
</template>