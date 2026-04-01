<script setup lang="ts">
import { Edit3, Search, Eye, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import FilterDropdown from '@/components/FilterDropdown.vue'
import TableSearch from '@/components/TableSearch.vue'
import { useTareaCampanaTable } from '@/composables/tareas/campana/useTareaCampanaTable'

interface HorarioItem {
  tipoHorario?: {
    id?: number
    nombre?: string
  }
  dia?: {
    id?: number
    nombre?: string
    hora?: {
      id?: number
      nombre?: string
    }
  }
  hora?: {
    id?: number
    nombre?: string
  }
}

export interface TareaCampanaRow {
  idABCConfigTareaCampana: number
  idABCCatLineaNegocio: number
  idABCCatCampana: number
  ingesta?: string
  bolActivo: boolean
  carga?: {
    ejecucionId?: number
    ejecucion?: string
    dia?: string
    hora?: string
    configurada?: boolean
  }
  validacion?: {
    ejecucionId?: number
    ejecucion?: string
    dia?: string
    hora?: string
    configurada?: boolean
  }
  envio?: {
    ejecucionId?: number
    ejecucion?: string
    dia?: string
    hora?: string
    configurada?: boolean
  }
  horarios?: HorarioItem[]
  tarea?: {
    tipo?: { nombre?: string }
    ejecucion?: { nombre?: string }
  }
}

interface Option {
  label: string
  value: string | number
}

interface SelectedFilters {
  lineas: number[]
  campanas: number[]
  status: boolean[]
}

interface Props {
  lineasDisponibles: Option[]
  campanasDisponibles: Option[]
  selectedFilters: SelectedFilters
  openFilter: string | null
  filteredTareas: TareaCampanaRow[]
  totalTareas: number
  currentPage: number
  totalPages: number
  canPrevPage: boolean
  canNextPage: boolean
  isLoading: boolean
  getLineaLabel: (id?: number) => string
  getCampanaLabel: (id?: number) => string
}

interface Emits {
  (e: 'toggleFilter', column: string): void
  (e: 'viewDetails', item: TareaCampanaRow): void
  (e: 'toggleStatus', item: TareaCampanaRow): void
  (e: 'edit', item: TareaCampanaRow): void
  (e: 'selectAllLineas'): void
  (e: 'selectAllCampanas'): void
  (e: 'prevPage'): void
  (e: 'nextPage'): void
  (e: 'search', query: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const {
  getStageVisual,
  isRowGlowing,
  selectedCampanas,
  selectedLineas,
  selectedStatus,
  statusOptions,
  thClass,
  thSmallClass
} = useTareaCampanaTable(props)
</script>

<template>
  <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-visible flex flex-col min-h-[72dvh] h-[calc(100dvh-11rem)] max-h-[calc(100dvh-8rem)] max-[650px]:h-[78dvh] max-[650px]:min-h-[68dvh] max-[650px]:max-h-none">
    <div class="overflow-y-auto overflow-x-hidden max-[1140px]:overflow-x-auto flex-1 min-h-0">
      <table class="w-full max-[1140px]:min-w-[1080px] text-left border-collapse table-fixed">
        <colgroup>
          <col class="w-[14%]" />
          <col class="w-[16%]" />
          <col class="w-[24%]" />
          <col class="w-[14%]" />
          <col class="w-[14%]" />
          <col class="w-[8%]" />
          <col class="w-[10%]" />
        </colgroup>
        <thead>
          <tr class="border-b border-slate-200 bg-slate-50/50 text-xs text-slate-500 font-semibold tracking-wider">
            <th :class="thClass + ' relative'">
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
            </th>
            <th :class="thClass + ' relative'">
              <FilterDropdown
                label="Campaña"
                header-label="Filtrar por campaña"
                :options="props.campanasDisponibles"
                v-model="selectedCampanas"
                :open="props.openFilter === 'campana'"
                :is-filtered="selectedCampanas.length < props.campanasDisponibles.length"
                @toggle="emit('toggleFilter', 'campana')"
                @select-all="emit('selectAllCampanas')"
              />
            </th>

            <th :class="thClass + ' text-left relative'">
              <div class="flex items-center gap-2">
                <span class="font-semibold">Nombre de ingesta</span>
                <button
                  @click.stop="emit('toggleFilter', 'search')"
                  :class="props.openFilter === 'search' ? 'p-2 bg-[#00357F] text-white rounded-md shadow-sm transition-colors' : 'p-2 bg-white text-slate-400 border border-slate-200 rounded-md hover:bg-slate-50 hover:text-[#00357F] transition-colors'"
                  aria-label="Buscar en tabla"
                  title="Buscar"
                >
                  <Search class="w-4 h-4 text-[#00357F]" :class="props.openFilter === 'search' ? 'text-white' : 'text-[#00357F]'" />
                </button>
              </div>

              <TableSearch
                :open="props.openFilter === 'search'"
                @search="query => emit('search', query)"
                @toggle="emit('toggleFilter', 'search')"
              />
            </th>

            <th :class="thSmallClass + ' text-left'">Validación</th>

            <th :class="thSmallClass + ' text-left'">Envío</th>

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

          <tr v-else-if="props.filteredTareas.length === 0">
            <td colspan="100%" class="px-4 py-12">
              <div class="sticky left-0 mx-auto flex w-fit flex-col items-center justify-center text-slate-400">
                <Search class="w-8 h-8 mb-2 opacity-50" />
                <span class="text-sm">No hay registros.</span>
              </div>
            </td>
          </tr>

          <template v-else v-for="(t, index) in props.filteredTareas" :key="t.idABCConfigTareaCampana">
            <tr :class="[index % 2 === 0 ? 'bg-white' : 'bg-slate-200/60', 'hover:bg-blue-50/30 transition-colors text-sm', { 'row-new-record-glow': isRowGlowing(t, index) }]">
              <td class="px-4 py-2.5" @dblclick="emit('viewDetails', t)">
                <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                  {{ props.getLineaLabel(t.idABCCatLineaNegocio) }}
                </span>
              </td>

              <td class="px-4 py-2.5 text-slate-600" @dblclick="emit('viewDetails', t)">
                {{ props.getCampanaLabel(t.idABCCatCampana) }}
              </td>

              <td class="px-4 py-2.5 text-slate-600" @dblclick="emit('viewDetails', t)">
                {{ t.ingesta || '-' }}
              </td>

              <td class="px-4 py-2.5" @dblclick="emit('viewDetails', t)">
                <template v-for="stage in [getStageVisual(t, 2)]" :key="`validar-${t.idABCConfigTareaCampana}`">
                  <div class="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg border text-[11px] font-semibold" :class="stage.containerClass">
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

              <td class="px-4 py-2.5" @dblclick="emit('viewDetails', t)">
                <template v-for="stage in [getStageVisual(t, 3)]" :key="`enviar-${t.idABCConfigTareaCampana}`">
                  <div class="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg border text-[11px] font-semibold" :class="stage.containerClass">
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

              <td class="px-4 py-2.5" @dblclick="emit('viewDetails', t)">
                <label
                  class="inline-flex items-center gap-2 px-3 py-1 rounded-full border transition-all duration-200 cursor-pointer group select-none"
                  :class="t.bolActivo
                    ? 'bg-blue-50 border-blue-200 hover:border-blue-300'
                    : 'bg-slate-50 border-slate-200 hover:border-slate-300'"
                >
                  <input
                    type="checkbox"
                    :checked="t.bolActivo"
                    @change="emit('toggleStatus', t)"
                    class="sr-only peer"
                  >

                  <span
                    class="h-2 w-2 rounded-full transition-colors duration-200 shadow-sm"
                    :class="t.bolActivo ? 'bg-[#00357F]' : 'bg-[#AD0A0A]'"
                  ></span>

                  <span
                    class="text-xs font-semibold transition-colors duration-200"
                    :class="t.bolActivo ? 'text-[#00357F]' : 'text-slate-500'"
                  >
                    {{ t.bolActivo ? 'Activo' : 'Inactivo' }}
                  </span>
                </label>
              </td>
              <td class="px-4 py-2.5 text-right">
                <div class="inline-flex items-center justify-end gap-2">
                  <button
                    @click.stop="emit('viewDetails', t)"
                    @dblclick.stop
                    class="relative p-1.5 text-slate-400 hover:text-[#00357F] hover:bg-blue-50 rounded-md transition-colors cursor-pointer group"
                    aria-label="Ver detalles"
                  >
                    <Eye class="w-4 h-4" />
                    <span class="absolute whitespace-nowrap -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">Ver detalles</span>
                  </button>

                  <button
                    @click.stop="emit('edit', t)"
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

    <div class="px-4 py-3 border-t border-slate-200 bg-slate-50 text-xs text-slate-500 flex flex-col items-center gap-2 rounded-b-xl shrink-0">
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
      <span class="text-center">Mostrando {{ props.filteredTareas.length }} de {{ props.totalTareas }} registros</span>
    </div>
  </div>
</template>
