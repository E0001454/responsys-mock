<script setup lang="ts">
import { computed } from 'vue'
import { Search, Eye } from 'lucide-vue-next'
import FilterDropdown from '@/components/FilterDropdown.vue'
import TableSearch from '@/components/TableSearch.vue'
import type { TareaMonitorData } from '@/types/tareas/monitor'

type NumericOption = {
  label: string
  value: number
}

const props = defineProps<{
  activeTab: 'linea' | 'campana'
  isLoading: boolean
  error: string | null
  openFilter: string | null
  lineasOptions: NumericOption[]
  campanasOptions: NumericOption[]
  actividadOptions: NumericOption[]
  estatusOptions: NumericOption[]
  selectedLineas: number[]
  selectedCampanas: number[]
  selectedActividades: number[]
  selectedEstatus: number[]
  paginatedRows: TareaMonitorData[]
  filteredRows: TareaMonitorData[]
  currentPage: number
  totalPages: number
  canPrevPage: boolean
  canNextPage: boolean
  isRowGlowing: (row: TareaMonitorData, index: number) => boolean
  getLineaLabel: (row: TareaMonitorData) => string
  getCampanaLabel: (row: TareaMonitorData) => string
  getActividadLabel: (row: TareaMonitorData) => string
  getStatusLabel: (row: TareaMonitorData) => string
  getStatusClass: (row: TareaMonitorData) => string
  formatDateLabel: (value?: string) => string
  formatTimeLabel: (value?: string) => string
  formatNumber: (value?: number) => string
}>()

const emit = defineEmits<{
  (e: 'toggle-filter', value: string): void
  (e: 'update:selectedLineas', value: number[]): void
  (e: 'update:selectedCampanas', value: number[]): void
  (e: 'update:selectedActividades', value: number[]): void
  (e: 'update:selectedEstatus', value: number[]): void
  (e: 'search', value: string): void
  (e: 'prev-page'): void
  (e: 'next-page'): void
  (e: 'view-details', row: TareaMonitorData): void
}>()

const modelLineas = computed({
  get: () => props.selectedLineas,
  set: (value: number[]) => emit('update:selectedLineas', value)
})

const modelCampanas = computed({
  get: () => props.selectedCampanas,
  set: (value: number[]) => emit('update:selectedCampanas', value)
})

const modelActividades = computed({
  get: () => props.selectedActividades,
  set: (value: number[]) => emit('update:selectedActividades', value)
})

const modelEstatus = computed({
  get: () => props.selectedEstatus,
  set: (value: number[]) => emit('update:selectedEstatus', value)
})

function getProcessedRatio(row: TareaMonitorData) {
  const total = Number(row.numeroRegistros ?? 0)
  const procesados = Number(row.numeroRegistrosProcesados ?? 0)
  if (!Number.isFinite(total) || total <= 0) return 0
  if (!Number.isFinite(procesados) || procesados <= 0) return 0
  return Math.min(1, Math.max(0, procesados / total))
}

function getProcessedTrackClass(row: TareaMonitorData) {
  const ratio = getProcessedRatio(row)
  if (ratio >= 1) return 'bg-emerald-500'
  if (ratio >= 0.8) return 'bg-lime-500'
  if (ratio >= 0.55) return 'bg-sky-500'
  if (ratio >= 0.3) return 'bg-amber-500'
  if (ratio > 0) return 'bg-orange-500'
  return 'bg-slate-300'
}

function getProcessedWrapClass(row: TareaMonitorData) {
  const ratio = getProcessedRatio(row)
  if (ratio >= 1) return 'border-emerald-200 bg-emerald-50/70'
  if (ratio >= 0.8) return 'border-lime-200 bg-lime-50/70'
  if (ratio >= 0.55) return 'border-sky-200 bg-sky-50/70'
  if (ratio >= 0.3) return 'border-amber-200 bg-amber-50/70'
  if (ratio > 0) return 'border-orange-200 bg-orange-50/70'
  return 'border-slate-200 bg-slate-50'
}

function getProcessedTextClass(row: TareaMonitorData) {
  const ratio = getProcessedRatio(row)
  if (ratio >= 1) return 'text-emerald-700'
  if (ratio >= 0.8) return 'text-lime-700'
  if (ratio >= 0.55) return 'text-sky-700'
  if (ratio >= 0.3) return 'text-amber-700'
  if (ratio > 0) return 'text-orange-700'
  return 'text-slate-700'
}
</script>

<template>
  <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-visible flex flex-col min-h-[72dvh] h-[calc(100dvh-11rem)] max-h-[calc(100dvh-8rem)] max-[650px]:h-[78dvh] max-[650px]:min-h-[68dvh] max-[650px]:max-h-none">
    <div v-if="isLoading" class="p-6 text-sm text-slate-500">Cargando monitoreo...</div>

    <div v-else-if="error" class="p-6 text-sm text-red-600">{{ error }}</div>

    <div v-else class="flex flex-col flex-1 min-h-0">
      <div class="overflow-y-auto overflow-x-hidden max-[1320px]:overflow-x-auto flex-1 min-h-0">
        <table class="w-full max-[1320px]:min-w-[1240px] text-left border-collapse text-sm">
          <thead>
            <tr class="border-b border-slate-200 bg-slate-50/50 text-xs text-slate-500 font-semibold tracking-wider">
              <th class="px-4 py-3 relative">
                <FilterDropdown
                  label="Linea"
                  header-label="Filtrar por linea"
                  :options="lineasOptions"
                  v-model="modelLineas"
                  :open="openFilter === 'linea'"
                  :is-filtered="selectedLineas.length < lineasOptions.length"
                  @toggle="emit('toggle-filter', 'linea')"
                  @select-all="emit('update:selectedLineas', lineasOptions.map(o => Number(o.value)))"
                />
              </th>

              <th v-if="activeTab === 'campana'" class="px-4 py-3 relative">
                <FilterDropdown
                  label="Campana"
                  header-label="Filtrar por campana"
                  :options="campanasOptions"
                  v-model="modelCampanas"
                  :open="openFilter === 'campana'"
                  :is-filtered="selectedCampanas.length < campanasOptions.length"
                  @toggle="emit('toggle-filter', 'campana')"
                  @select-all="emit('update:selectedCampanas', campanasOptions.map(o => Number(o.value)))"
                />
              </th>

              <th class="px-4 py-3 relative">
                <div class="flex items-center gap-2">
                  <span class="font-semibold">Nombre de ingesta</span>
                  <button
                    type="button"
                    @click.stop="emit('toggle-filter', 'search')"
                    :class="openFilter === 'search'
                      ? 'p-2 bg-[#00357F] text-white rounded-md shadow-sm transition-colors border border-[#00357F]'
                      : 'p-2 bg-white text-slate-400 border border-slate-200 rounded-md hover:bg-slate-50 hover:text-[#00357F] transition-colors'"
                    aria-label="Buscar en la ingesta"
                    title="Buscar en la ingesta"
                  >
                    <Search class="w-4 h-4" :class="openFilter === 'search' ? 'text-white' : 'text-[#00357F]'" />
                  </button>
                </div>
                <TableSearch
                  :open="openFilter === 'search'"
                  @search="emit('search', $event)"
                  @toggle="emit('toggle-filter', 'search')"
                />
              </th>

              <th class="px-4 py-3 relative">
                <FilterDropdown
                  label="Actividad"
                  header-label="Filtrar por actividad"
                  :options="actividadOptions"
                  v-model="modelActividades"
                  :open="openFilter === 'actividad'"
                  :is-filtered="selectedActividades.length < actividadOptions.length"
                  @toggle="emit('toggle-filter', 'actividad')"
                  @select-all="emit('update:selectedActividades', actividadOptions.map(o => Number(o.value)))"
                />
              </th>

              <th class="px-4 py-3 relative">
                <FilterDropdown
                  label="Estatus"
                  header-label="Filtrar por estatus"
                  :options="estatusOptions"
                  v-model="modelEstatus"
                  :open="openFilter === 'estatus'"
                  :is-filtered="selectedEstatus.length < estatusOptions.length"
                  @toggle="emit('toggle-filter', 'estatus')"
                  @select-all="emit('update:selectedEstatus', estatusOptions.map(o => Number(o.value)))"
                />
              </th>

              <th class="px-4 py-3">Fecha creacion</th>
              <th class="px-4 py-3 text-right">Num registros</th>
              <th class="px-4 py-3 text-center">Detalles</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="(row, index) in paginatedRows"
              :key="`${activeTab}-${row.pipelineId}-${row.etapaIndex}`"
              :class="[
                index % 2 === 0 ? 'bg-white' : 'bg-slate-200/60',
                'hover:bg-blue-50/30 transition-colors',
                { 'row-new-record-glow': isRowGlowing(row, index) }
              ]"
              @dblclick="emit('view-details', row)"
            >
              <td class="px-4 py-2.5 text-slate-700 font-medium">{{ getLineaLabel(row) }}</td>
              <td v-if="activeTab === 'campana'" class="px-4 py-2.5 text-slate-700">{{ getCampanaLabel(row) }}</td>
              <td class="px-4 py-2.5 text-slate-800 font-semibold">{{ row.nombreMapeo }}</td>
              <td class="px-4 py-2.5 text-slate-700">{{ getActividadLabel(row) }}</td>
              <td class="px-4 py-2.5">
                <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold" :class="getStatusClass(row)">
                  {{ getStatusLabel(row) }}
                </span>
              </td>
              <td class="px-4 py-2.5 text-slate-600 min-w-[130px]">
                <div class="inline-flex flex-col rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 leading-tight">
                  <span class="text-xs font-semibold text-slate-700 tabular-nums">{{ formatDateLabel(row.fechaCreacion) }}</span>
                  <span class="text-[11px] text-slate-500 tabular-nums">{{ formatTimeLabel(row.fechaCreacion) }}</span>
                </div>
              </td>
              <td class="px-4 py-2.5 text-right tabular-nums">
                <div class="inline-flex min-w-[150px] flex-col items-end gap-1.5 rounded-lg border px-2.5 py-1.5" :class="getProcessedWrapClass(row)">
                  <span class="text-sm font-semibold" :class="getProcessedTextClass(row)">
                    {{ formatNumber(row.numeroRegistrosProcesados) }} / {{ formatNumber(row.numeroRegistros) }}
                  </span>
                  <div class="h-1.5 w-full rounded-full bg-white/85">
                    <div
                      class="h-1.5 rounded-full transition-all duration-500"
                      :class="getProcessedTrackClass(row)"
                      :style="{ width: `${Math.round(getProcessedRatio(row) * 100)}%` }"
                    ></div>
                  </div>
                </div>
              </td>
              <td class="px-4 py-2.5 text-center">
                <button
                  type="button"
                  class="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100 hover:text-[#00357F] transition-colors"
                  title="Ver detalles"
                  aria-label="Ver detalles"
                  @click="emit('view-details', row)"
                >
                  <Eye class="w-4 h-4" />
                </button>
              </td>
            </tr>

            <tr v-if="!filteredRows.length">
              <td :colspan="activeTab === 'campana' ? 9 : 8" class="px-4 py-12">
                <div class="sticky left-0 mx-auto flex w-fit flex-col items-center justify-center text-slate-400">
                  <Search class="w-8 h-8 mb-2 opacity-50" />
                  <span class="text-sm">No hay registros.</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="px-4 py-3 border-t border-slate-200 bg-slate-50 text-xs text-slate-500 flex justify-between items-center rounded-b-xl shrink-0">
        <span>Mostrando {{ paginatedRows.length }} de {{ filteredRows.length }} registros</span>
        <div class="flex gap-2 items-center">
          <button class="hover:text-[#00357F] disabled:opacity-50" :disabled="!canPrevPage" @click="emit('prev-page')">
            Anterior
          </button>
          <span class="text-[11px] text-slate-400">{{ currentPage }} / {{ totalPages }}</span>
          <button class="hover:text-[#00357F] disabled:opacity-50" :disabled="!canNextPage" @click="emit('next-page')">
            Siguiente
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
