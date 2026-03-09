<script setup lang="ts">
import { computed } from 'vue'
import { Edit3, Search, Eye, Columns, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import FilterDropdown from '@/components/FilterDropdown.vue'
import TableSearch from '@/components/TableSearch.vue'
import type { MapeoLineaData } from '@/types/mapeos/linea'
import { useFirstRowNewGlow } from '@/composables/shared/useFirstRowNewGlow'

interface Option {
  label: string
  value: number
}

interface SelectedFilters {
  lineas: number[]
  status: boolean[]
}

interface Props {
  lineasDisponibles: Option[]
  selectedFilters: SelectedFilters
  openFilter: string | null
  filteredMapeos: MapeoLineaData[]
  totalMapeos: number
  currentPage: number
  totalPages: number
  canPrevPage: boolean
  canNextPage: boolean
  isLoading: boolean
  getLineaLabel: (id?: number) => string
}

interface Emits {
  (e: 'toggleFilter', column: string): void
  (e: 'viewDetails', item: MapeoLineaData): void
  (e: 'viewColumnas', item: MapeoLineaData): void
  (e: 'toggleStatus', item: MapeoLineaData): void
  (e: 'edit', item: MapeoLineaData): void
  (e: 'selectAllLineas'): void
  (e: 'prevPage'): void
  (e: 'nextPage'): void
  (e: 'search', query: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const selectedLineas = computed({
  get: () => props.selectedFilters.lineas,
  set: value => {
    props.selectedFilters.lineas = value
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
  () => props.filteredMapeos,
  row => Number(row.idABCConfigMapeoLinea ?? 0),
  { isLoading: () => props.isLoading }
)

const thClass = 'px-4 py-3'
const thSmallClass = 'px-4 py-3'

function getMapeoStageVisual(configured: boolean) {
  return {
    configured,
    label: configured ? '' : '',
    containerClass: configured
      ? 'bg-emerald-50/80 border-emerald-200 text-emerald-700'
      : 'bg-rose-50/70 border-rose-200 text-rose-700',
    iconWrapClass: configured
      ? 'bg-emerald-100 text-emerald-700'
      : 'bg-rose-100 text-rose-700'
  }
}

function getDictaminarVisual(configured: boolean) {
  return {
    configured,
    label: configured ? '' : '',
    containerClass: configured
      ? 'bg-emerald-50 border-emerald-200 text-[#00357F]'
      : 'bg-rose-50 border-rose-200 text-rose-700',
    iconWrapClass: configured
      ? 'bg-emerald-100 text-[#00357F]'
      : 'bg-rose-100 text-rose-700'
  }
}

function formatPorcentajeError(value?: number | null) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '-'
  return `${Number(value)}%`
}
</script>

<template>
  <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-visible flex flex-col min-h-[320px] h-[70dvh] md:min-h-[400px] md:h-[87vh] max-h-[calc(100dvh-8rem)] md:max-h-[calc(100vh-2rem)] max-[650px]:h-auto max-[650px]:max-h-none">
    <div v-if="props.totalPages > 1" class="hidden max-[650px]:flex px-4 py-3 border-b border-slate-200 bg-slate-50 text-xs text-slate-500 flex-col items-center gap-2 rounded-t-xl">
      <span class="text-center">Mostrando {{ props.filteredMapeos.length }} de {{ props.totalMapeos }} registros</span>
      <div class="flex gap-2 items-center justify-center">
        <button
          class="h-[42px] px-4 inline-flex items-center gap-1.5 rounded-lg text-slate-600 bg-white border border-slate-200 hover:text-[#00357F] hover:border-[#00357F]/30 hover:bg-slate-50 transition disabled:opacity-40 disabled:cursor-not-allowed"
          :disabled="!props.canPrevPage"
          @click="emit('prevPage')"
        >
          <ChevronLeft class="w-4 h-4" />
          Anterior
        </button>
        <span class="h-[42px] min-w-[74px] inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600">{{ props.currentPage }} / {{ props.totalPages }}</span>
        <button
          class="h-[42px] px-4 inline-flex items-center gap-1.5 rounded-lg text-slate-600 bg-white border border-slate-200 hover:text-[#00357F] hover:border-[#00357F]/30 hover:bg-slate-50 transition disabled:opacity-40 disabled:cursor-not-allowed"
          :disabled="!props.canNextPage"
          @click="emit('nextPage')"
        >
          Siguiente
          <ChevronRight class="w-4 h-4" />
        </button>
      </div>
    </div>

    <div class="max-[650px]:hidden overflow-x-auto flex-1 min-h-0">
      <table class="w-full min-w-[1120px] text-left border-collapse table-fixed">
        <colgroup>
          <col class="w-[14%]" />
          <col class="w-[22%]" />
          <col class="w-[10%]" />
          <col class="w-[8%]" />
          <col class="w-[8%]" />
          <col class="w-[10%]" />
          <col class="w-[8%]" />
          <col class="w-[10%]" />
          <col class="w-[10%]" />
        </colgroup>
        <thead>
          <tr class="border-b border-slate-200 bg-slate-50/50 text-xs text-slate-500 font-semibold tracking-wider">
            <th :class="thClass + ' relative'">
              <FilterDropdown
                label="Linea"
                header-label="Filtrar por linea"
                :options="props.lineasDisponibles"
                v-model="selectedLineas"
                :open="props.openFilter === 'linea'"
                :is-filtered="selectedLineas.length < props.lineasDisponibles.length"
                @toggle="emit('toggleFilter', 'linea')"
                @select-all="emit('selectAllLineas')"
              />
            </th>

            <th :class="thClass + ' text-left relative'">
              <div class="flex items-center gap-2">
                <span class="font-semibold">Nombre de ingesta</span>
                <button
                  @click.stop="emit('toggleFilter', 'search')"
                  :class="props.openFilter === 'search'
                    ? 'p-1.5 text-[#00357F] bg-blue-50 rounded-md transition-colors'
                    : 'p-1.5 text-slate-400 hover:text-[#00357F] hover:bg-blue-50 rounded-md transition-colors'"
                  aria-label="Buscar en tabla"
                  title="Buscar"
                >
                  <Search class="w-4 h-4" />
                </button>
              </div>

              <TableSearch
                :open="props.openFilter === 'search'"
                @search="query => emit('search', query)"
                @toggle="emit('toggleFilter', 'search')"
              />
            </th>

            <th :class="thClass">Columnas</th>
            <th :class="thSmallClass + ' text-center'">Validar</th>
            <th :class="thSmallClass + ' text-center'">Enviar</th>
            <th :class="thSmallClass + ' text-center'">Dictaminar</th>
            <th :class="thSmallClass + ' text-center'">% Error</th>
            <th :class="thSmallClass + ' relative'">
              <FilterDropdown
                label="Estado"
                header-label="Estado"
                :options="statusOptions"
                v-model="selectedStatus"
                :open="props.openFilter === 'status'"
                :is-filtered="selectedStatus.length < 2"
                :show-select-all="false"
                menu-width="w-48"
                align="right"
                @toggle="emit('toggleFilter', 'status')"
              />
            </th>
            <th :class="thClass + ' text-right'">Acciones</th>
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

          <tr v-else-if="props.filteredMapeos.length === 0">
            <td colspan="100%" class="px-4 py-12">
              <div class="flex flex-col items-center justify-center text-slate-400">
                <Search class="w-8 h-8 mb-2 opacity-50" />
                <span class="text-sm">No hay registros.</span>
              </div>
            </td>
          </tr>

          <template v-else v-for="(m, index) in props.filteredMapeos" :key="m.idABCConfigMapeoLinea">
            <tr :class="['hover:bg-blue-50/30 transition-colors text-sm', { 'row-new-record-glow': isRowGlowing(m, index) }]">
              <td class="px-4 py-2.5" @dblclick="emit('viewDetails', m)">
                <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                  {{ props.getLineaLabel(m.linea?.id) }}
                </span>
              </td>

              <td class="px-4 py-2.5 font-semibold text-slate-700" @dblclick="emit('viewDetails', m)">{{ m.nombre }}</td>

              <td class="px-4 py-2.5" @dblclick="emit('viewDetails', m)">
                <button @click.stop.prevent="emit('viewColumnas', m)" class="inline-flex items-center px-2 py-0.5 rounded text-sm font-medium bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200 cursor-pointer transition-colors">
                  <Columns class="w-4 h-4 mr-1" />
                  {{ typeof (m as any).columnas === 'number' ? (m as any).columnas : (Array.isArray((m as any).columnas) ? (m as any).columnas.length : 0) }}
                </button>
              </td>

              <td class="px-4 py-2.5 text-center">
                <template v-for="stage in [getMapeoStageVisual(Boolean((m as any).validar ?? false))]" :key="`validar-${m.idABCConfigMapeoLinea}`">
                  <div class="inline-flex items-center px-2.5 py-1 rounded-lg border text-[11px] font-semibold" :class="stage.containerClass">
                    <span class="h-5 w-5 rounded-full inline-flex items-center justify-center" :class="stage.iconWrapClass">
                      <svg v-if="stage.configured" class="w-3 h-3" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
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

              <td class="px-4 py-2.5 text-center">
                <template v-for="stage in [getMapeoStageVisual(Boolean((m as any).enviar ?? (m as any).envio ?? false))]" :key="`enviar-${m.idABCConfigMapeoLinea}`">
                  <div class="inline-flex items-center px-2.5 py-1 rounded-lg border text-[11px] font-semibold" :class="stage.containerClass">
                    <span class="h-5 w-5 rounded-full inline-flex items-center justify-center" :class="stage.iconWrapClass">
                      <svg v-if="stage.configured" class="w-3 h-3" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
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

              <td class="px-4 py-2.5 text-center">
                <template v-for="dictaminarStage in [getDictaminarVisual(Boolean(m.dictaminar ?? m.bolDictaminacion ?? false))]" :key="`dictaminar-${m.idABCConfigMapeoLinea}`">
                  <div class="inline-flex items-center px-2.5 py-1 rounded-lg border text-[11px] font-semibold" :class="dictaminarStage.containerClass">
                    <span class="h-5 w-5 rounded-full inline-flex items-center justify-center" :class="dictaminarStage.iconWrapClass">
                      <svg v-if="dictaminarStage.configured" class="w-3 h-3" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
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

              <td class="px-4 py-2.5 text-center text-slate-700 font-semibold" @dblclick="emit('viewDetails', m)">
                {{ formatPorcentajeError(m.porcentajeError) }}
              </td>

              <td class="px-4 py-2.5" @dblclick="emit('viewDetails', m)">
                <label
                  class="inline-flex items-center gap-2 px-3 py-1 rounded-full border transition-all duration-200 cursor-pointer group select-none"
                  :class="m.bolActivo
                    ? 'bg-blue-50 border-blue-200 hover:border-blue-300'
                    : 'bg-slate-50 border-slate-200 hover:border-slate-300'"
                >
                  <input
                    type="checkbox"
                    :checked="m.bolActivo"
                    @change="emit('toggleStatus', m)"
                    class="sr-only peer"
                  >

                  <span
                    class="h-2 w-2 rounded-full transition-colors duration-200 shadow-sm"
                    :class="m.bolActivo ? 'bg-[#00357F]' : 'bg-[#AD0A0A]'"
                  ></span>

                  <span
                    class="text-xs font-semibold transition-colors duration-200"
                    :class="m.bolActivo ? 'text-[#00357F]' : 'text-slate-500'"
                  >
                    {{ m.bolActivo ? 'Activo' : 'Inactivo' }}
                  </span>
                </label>
              </td>
              <td class="px-4 py-2.5 text-right">
                <div class="inline-flex items-center justify-end gap-2">
                  <button
                    @click.stop="emit('viewDetails', m)"
                    @dblclick.stop
                    class="relative p-1.5 text-slate-400 hover:text-[#00357F] hover:bg-blue-50 rounded-md transition-colors cursor-pointer group"
                    aria-label="Ver detalles"
                  >
                    <Eye class="w-4 h-4" />
                    <span class="absolute whitespace-nowrap -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">Ver detalles</span>
                  </button>

                  <button
                    @click.stop="emit('edit', m)"
                    @dblclick.stop
                    class="relative p-1.5 text-slate-400 hover:text-[#00357F] hover:bg-blue-50 rounded-md transition-colors cursor-pointer group"
                    aria-label="Editar registro"
                  >
                    <Edit3 class="w-4 h-4" />
                    <span class="absolute whitespace-nowrap -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">Modificar</span>
                  </button>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>

   <div class="hidden max-[650px]:block p-3 space-y-3 bg-slate-50/30">
      <div class="relative z-0 flex flex-wrap items-center gap-2 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
        <div class="relative shrink-0">
          <FilterDropdown
            label="Línea"
            header-label="Filtrar por línea"
            :options="props.lineasDisponibles"
            v-model="selectedLineas"
            :open="props.openFilter === 'linea'"
            :is-filtered="selectedLineas.length < props.lineasDisponibles.length"
            @toggle="emit('toggleFilter', 'linea')"
            @select-all="emit('selectAllLineas')"
          />
        </div>
        <div class="relative shrink-0">
          <FilterDropdown
            label="Estado"
            header-label="Estado"
            :options="statusOptions"
            v-model="selectedStatus"
            :open="props.openFilter === 'status'"
            :is-filtered="selectedStatus.length < 2"
            :show-select-all="false"
            menu-width="w-48"
            align="right"
            @toggle="emit('toggleFilter', 'status')"
          />
        </div>
        <button
          @click.stop="emit('toggleFilter', 'search')"
          :class="props.openFilter === 'search'
            ? 'p-2 text-[#00357F] bg-blue-50 rounded-lg transition-colors border border-blue-100'
            : 'p-2 text-slate-400 hover:text-[#00357F] hover:bg-blue-50 rounded-lg transition-colors border border-transparent'"
          aria-label="Buscar en tabla"
        >
          <Search class="w-4 h-4" />
        </button>

        <div class="w-full mt-1" v-if="props.openFilter === 'search'">
          <TableSearch
            :open="props.openFilter === 'search'"
            @search="query => emit('search', query)"
            @toggle="emit('toggleFilter', 'search')"
          />
        </div>
      </div>

      <div v-if="props.isLoading" class="py-12 flex flex-col items-center justify-center text-slate-500 bg-white rounded-xl border border-slate-200">
        <div class="w-6 h-6 border-2 border-[#00357F] border-t-transparent rounded-full animate-spin mb-2"></div>
        <span class="text-sm font-medium">Cargando datos...</span>
      </div>

      <div v-else-if="props.filteredMapeos.length === 0" class="py-12 flex flex-col items-center justify-center text-slate-400 bg-white rounded-xl border border-slate-200">
        <Search class="w-8 h-8 mb-2 opacity-50" />
        <span class="text-sm">No hay registros.</span>
      </div>

      <template v-else>
        <div class="space-y-3">
          <article
            v-for="(m, index) in props.filteredMapeos"
            :key="m.idABCConfigMapeoLinea"
            :class="[
              'rounded-xl border border-slate-200 bg-white shadow-sm flex flex-col transition-all overflow-hidden',
              { 'row-new-record-glow': isRowGlowing(m, index) }
            ]"
          >
            <div class="px-3 pt-3 pb-2 flex items-start justify-between gap-2">
              <h3 class="text-[13px] font-semibold text-slate-800 leading-tight line-clamp-2 min-w-0 flex-1">{{ m.nombre }}</h3>
              <div class="shrink-0 inline-flex items-center gap-2">
                <span class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                  {{ props.getLineaLabel(m.linea?.id) }}
                </span>
                <button 
                  @click.stop="emit('toggleStatus', m)"
                  class="inline-flex items-center gap-1 text-[10px] font-semibold transition-colors px-1.5 py-0.5 rounded-full border"
                  :class="m.bolActivo 
                    ? 'bg-blue-50/50 border-blue-100 text-[#00357F]' 
                    : 'bg-slate-50 border-slate-100 text-slate-500'"
                >
                  <span class="h-1.5 w-1.5 rounded-full" :class="m.bolActivo ? 'bg-[#00357F]' : 'bg-[#AD0A0A]'"></span>
                  {{ m.bolActivo ? 'Activo' : 'Inactivo' }}
                </button>
              </div>
            </div>

            <div class="mx-3 mb-3 bg-slate-50/80 rounded-lg border border-slate-100 p-2 grid grid-cols-4 divide-x divide-slate-200/60">
              
              <div class="flex flex-col items-center justify-center gap-1 px-1">
                <span class="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Validación</span>
                <template v-for="stage in [getMapeoStageVisual(Boolean((m as any).validar ?? false))]" :key="`val-${m.idABCConfigMapeoLinea}`">
                  <span class="h-4 w-4 rounded-full inline-flex items-center justify-center" :class="stage.iconWrapClass">
                    <svg v-if="stage.configured" class="w-2.5 h-2.5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.704 5.29a1 1 0 010 1.414l-7.25 7.25a1 1 0 01-1.414 0l-3-3a1 1 0 111.414-1.414l2.293 2.293 6.543-6.543a1 1 0 011.414 0z" clip-rule="evenodd" /></svg>
                    <svg v-else class="w-2.5 h-2.5" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><circle cx="10" cy="10" r="6.5"></circle><path d="M10 6.7V10.3"></path><circle cx="10" cy="13.3" r="1" fill="currentColor" stroke="none"></circle></svg>
                  </span>
                </template>
              </div>

              <div class="flex flex-col items-center justify-center gap-1 px-1">
                <span class="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Envío</span>
                <template v-for="stage in [getMapeoStageVisual(Boolean((m as any).enviar ?? (m as any).envio ?? false))]" :key="`env-${m.idABCConfigMapeoLinea}`">
                  <span class="h-4 w-4 rounded-full inline-flex items-center justify-center" :class="stage.iconWrapClass">
                    <svg v-if="stage.configured" class="w-2.5 h-2.5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.704 5.29a1 1 0 010 1.414l-7.25 7.25a1 1 0 01-1.414 0l-3-3a1 1 0 111.414-1.414l2.293 2.293 6.543-6.543a1 1 0 011.414 0z" clip-rule="evenodd" /></svg>
                    <svg v-else class="w-2.5 h-2.5" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><circle cx="10" cy="10" r="6.5"></circle><path d="M10 6.7V10.3"></path><circle cx="10" cy="13.3" r="1" fill="currentColor" stroke="none"></circle></svg>
                  </span>
                </template>
              </div>

              <div class="flex flex-col items-center justify-center gap-1 px-1">
                <span class="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Dictaminar</span>
                <template v-for="stage in [getDictaminarVisual(Boolean(m.dictaminar ?? m.bolDictaminacion ?? false))]" :key="`dic-${m.idABCConfigMapeoLinea}`">
                  <span class="h-4 w-4 rounded-full inline-flex items-center justify-center" :class="stage.iconWrapClass">
                    <svg v-if="stage.configured" class="w-2.5 h-2.5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.704 5.29a1 1 0 010 1.414l-7.25 7.25a1 1 0 01-1.414 0l-3-3a1 1 0 111.414-1.414l2.293 2.293 6.543-6.543a1 1 0 011.414 0z" clip-rule="evenodd" /></svg>
                    <svg v-else class="w-2.5 h-2.5" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><circle cx="10" cy="10" r="6.5"></circle><path d="M10 6.7V10.3"></path><circle cx="10" cy="13.3" r="1" fill="currentColor" stroke="none"></circle></svg>
                  </span>
                </template>
              </div>

              <div class="flex flex-col items-center justify-center gap-0.5 px-1">
                <span class="text-[9px] font-bold text-slate-400 uppercase tracking-wide">% Error</span>
                <span class="text-[11px] font-bold text-slate-700">{{ formatPorcentajeError(m.porcentajeError) }}</span>
              </div>
            </div>

            <div class="px-3 py-2 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between mt-auto">
              <button
                @click.stop.prevent="emit('viewColumnas', m)"
                class="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-white text-slate-600 text-[11px] font-medium border border-slate-200 shadow-sm hover:text-[#00357F] hover:border-blue-200 transition-colors"
              >
                <Columns class="w-3 h-3 text-slate-400" />
                <span>Columnas: <strong class="text-slate-700">{{ typeof (m as any).columnas === 'number' ? (m as any).columnas : (Array.isArray((m as any).columnas) ? (m as any).columnas.length : 0) }}</strong></span>
              </button>

              <div class="flex items-center gap-1">
                <button
                  @click.stop="emit('viewDetails', m)"
                  class="p-1.5 text-slate-400 hover:text-[#00357F] hover:bg-blue-50 rounded-md transition-colors"
                  aria-label="Ver detalles"
                >
                  <Eye class="w-4 h-4" />
                </button>
                <div class="w-px h-4 bg-slate-200 mx-1"></div>
                <button
                  @click.stop="emit('edit', m)"
                  class="p-1.5 text-slate-400 hover:text-[#00357F] hover:bg-blue-50 rounded-md transition-colors"
                  aria-label="Editar registro"
                >
                  <Edit3 class="w-4 h-4" />
                </button>
              </div>
            </div>
          </article>
        </div>
      </template>
    </div>

    <div class="px-4 py-3 border-t border-slate-200 bg-slate-50 text-xs text-slate-500 flex flex-col items-center gap-2 rounded-b-xl min-[651px]:flex-row min-[651px]:justify-between min-[651px]:items-center">
      <span class="text-center min-[651px]:text-left">Mostrando {{ props.filteredMapeos.length }} de {{ props.totalMapeos }} registros</span>
      <div class="flex gap-2 items-center justify-center">
        <button
          class="h-[42px] px-4 inline-flex items-center gap-1.5 rounded-lg text-slate-600 bg-white border border-slate-200 hover:text-[#00357F] hover:border-[#00357F]/30 hover:bg-slate-50 transition disabled:opacity-40 disabled:cursor-not-allowed min-[651px]:h-auto min-[651px]:px-0 min-[651px]:bg-transparent min-[651px]:border-0 min-[651px]:rounded-none min-[651px]:hover:bg-transparent"
          :disabled="!props.canPrevPage"
          @click="emit('prevPage')"
        >
          <ChevronLeft class="w-4 h-4 min-[651px]:hidden" />
          Anterior
        </button>
        <span class="h-[42px] min-w-[74px] inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 min-[651px]:h-auto min-[651px]:min-w-0 min-[651px]:border-0 min-[651px]:bg-transparent min-[651px]:px-0 min-[651px]:text-[11px] min-[651px]:font-medium min-[651px]:text-slate-400">{{ props.currentPage }} / {{ props.totalPages }}</span>
        <button
          class="h-[42px] px-4 inline-flex items-center gap-1.5 rounded-lg text-slate-600 bg-white border border-slate-200 hover:text-[#00357F] hover:border-[#00357F]/30 hover:bg-slate-50 transition disabled:opacity-40 disabled:cursor-not-allowed min-[651px]:h-auto min-[651px]:px-0 min-[651px]:bg-transparent min-[651px]:border-0 min-[651px]:rounded-none min-[651px]:hover:bg-transparent"
          :disabled="!props.canNextPage"
          @click="emit('nextPage')"
        >
          Siguiente
          <ChevronRight class="w-4 h-4 min-[651px]:hidden" />
        </button>
      </div>
    </div>
  </div>
</template>
