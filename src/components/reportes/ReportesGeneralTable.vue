<script setup lang="ts">
import { computed } from 'vue'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { Search } from 'lucide-vue-next'
import type { RegistroGeneral, ReporteGeneralTipo } from '@/types/reportes/reporte'
import { formatTimestamp } from '@/utils/reportes/reporteFormat.utils'

const props = defineProps<{
  rows: RegistroGeneral[]
  totalRows: number
  currentPage: number
  totalPages: number
  canPrevPage: boolean
  canNextPage: boolean
  isLoading: boolean
  scope: 'linea' | 'campana'
  tipo: ReporteGeneralTipo
}>()

const emit = defineEmits<{
  (e: 'prev-page'): void
  (e: 'next-page'): void
}>()

const showAprobados = computed(() => props.tipo === 'validacion')
const hasRows = computed(() => props.rows.length > 0)
const isPET = computed(() => props.scope === 'campana')
const hideMapeo = computed(() => isPET.value && props.tipo === 'carga')

const emptyMessage = computed(() => {
  if (props.tipo === 'carga') return 'No hay información disponible actualmente con los filtros proporcionados.'
  if (props.tipo === 'validacion') return 'No hay información disponible actualmente con los filtros proporcionados. Favor de revisar el proceso de Carga (BI).'
  return 'No hay información disponible actualmente con los filtros proporcionados. Favor de revisar el proceso de Validación (ABC).'
})
</script>

<template>
  <div class="bg-white border border-slate-200 rounded-xl overflow-hidden">
    <div v-if="isLoading" class="flex items-center justify-center py-16">
      <div class="flex flex-col items-center gap-3">
        <svg class="animate-spin h-8 w-8 text-[#00357F]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p class="text-sm text-slate-500">Cargando resultados...</p>
      </div>
    </div>

    <div v-else-if="!hasRows" class="flex items-center justify-center py-16">
      <div class="text-center">
        <Search class="w-8 h-8 mx-auto mb-2 text-slate-300" />
        <p class="text-sm font-semibold text-slate-500">Sin resultados</p>
        <p class="text-xs text-slate-400 mt-1 max-w-xs">{{ emptyMessage }}</p>
      </div>
    </div>

    <template v-else>
      <div class="overflow-x-auto">
        <table class="w-full text-sm text-left">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-200">
              <th class="px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">Línea de Negocio</th>
              <th v-if="isPET" class="px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">Campaña</th>
              <th v-if="!hideMapeo" class="px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">Mapeo</th>
              <th class="px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">Fecha</th>
              <th class="px-4 py-3 font-semibold text-slate-600 whitespace-nowrap text-right">Registros</th>
              <th v-if="showAprobados" class="px-4 py-3 font-semibold text-slate-600 whitespace-nowrap text-right">Aprobados</th>
              <th v-if="showAprobados" class="px-4 py-3 font-semibold text-slate-600 whitespace-nowrap text-right">Rechazados</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, i) in rows" :key="i" class="border-b border-slate-100 hover:bg-slate-50 transition-colors">
              <td class="px-4 py-3 whitespace-nowrap text-slate-700">{{ row.lineaNegocio }}</td>
              <td v-if="isPET" class="px-4 py-3 whitespace-nowrap text-slate-700">{{ row.campana }}</td>
              <td v-if="!hideMapeo" class="px-4 py-3 whitespace-nowrap text-slate-700">{{ row.mapeo }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-slate-500 text-xs">{{ formatTimestamp(row.fecha) }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-slate-700 text-right font-medium tabular-nums">{{ row.registros.toLocaleString() }}</td>
              <td v-if="showAprobados" class="px-4 py-3 whitespace-nowrap text-right font-medium tabular-nums">
                <span class="text-emerald-700 font-bold">{{ (row.aprobados ?? 0).toLocaleString() }}</span>
              </td>
              <td v-if="showAprobados" class="px-4 py-3 whitespace-nowrap text-right font-medium tabular-nums">
                <span class="text-red-700 font-bold">{{ (row.rechazados ?? 0).toLocaleString() }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50">
        <p class="text-xs text-slate-500">
          {{ totalRows }} resultado{{ totalRows !== 1 ? 's' : '' }}
        </p>
        <div class="flex items-center gap-2">
          <button
            :disabled="!canPrevPage"
            @click="emit('prev-page')"
            class="p-1.5 rounded-md border border-slate-200 text-slate-500 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft class="w-4 h-4" />
          </button>
          <span class="text-xs text-slate-600 tabular-nums">{{ currentPage }} / {{ totalPages }}</span>
          <button
            :disabled="!canNextPage"
            @click="emit('next-page')"
            class="p-1.5 rounded-md border border-slate-200 text-slate-500 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight class="w-4 h-4" />
          </button>
        </div>
      </div>
    </template>
  </div>
</template>
