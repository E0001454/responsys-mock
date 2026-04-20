<script setup lang="ts">
import { computed, ref } from 'vue'
import { Search, RotateCcw, FileText, File } from 'lucide-vue-next'
import type { FiltroGeneralCL, FiltroGeneralPET } from '@/types/reportes/reporte'

interface Option {
  label: string
  value: number
}

const props = defineProps<{
  scope: string
  idLineaNegocio: number | ''
  idCampana: number | ''
  cl: FiltroGeneralCL
  pet: FiltroGeneralPET
  lineasCatalogo: Option[]
  campanasCatalogo: Option[]
  isLoading: boolean
  exportLoading: boolean
  hasResults: boolean
  formErrors: Record<string, string>
}>()

const emit = defineEmits<{
  (e: 'update:idLineaNegocio', value: number | ''): void
  (e: 'update:idCampana', value: number | ''): void
  (e: 'update-cl', field: keyof FiltroGeneralCL, value: string): void
  (e: 'update-pet', field: keyof FiltroGeneralPET, value: string): void
  (e: 'consultar'): void
  (e: 'clear'): void
  (e: 'export-csv'): void
  (e: 'export-pdf', options: { includeChart: boolean }): void
}>()

function onSelectChange(e: Event, emitFn: (v: number | '') => void) {
  const val = (e.target as HTMLSelectElement).value
  emitFn(val === '' ? '' : Number(val))
}

const todayISO = computed(() => {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${dd}`
})

const inputClass = 'w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:ring-2 focus:ring-[#00357F] focus:border-[#00357F]'

const includeChart = ref(true)
</script>

<template>
  <div class="bg-white border border-slate-200 rounded-xl p-4 space-y-4">

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      <div>
        <label class="block text-xs font-semibold text-slate-600 mb-1">Línea de negocio</label>
        <select :value="idLineaNegocio" @change="onSelectChange($event, v => emit('update:idLineaNegocio', v))" :class="inputClass">
          <option value="">Selecciona una línea</option>
          <option v-for="opt in lineasCatalogo" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
        </select>
      </div>
      <div v-if="scope === 'campana'">
        <label class="block text-xs font-semibold text-slate-600 mb-1">Campaña</label>
        <select :value="idCampana" @change="onSelectChange($event, v => emit('update:idCampana', v))" :class="inputClass">
          <option value="">Selecciona una campaña</option>
          <option v-for="opt in campanasCatalogo" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
        </select>
      </div>
    </div>

    <template v-if="scope === 'linea'">
      <p class="text-xs font-semibold text-slate-500 uppercase tracking-wide">Filtros generales CL</p>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1">Fecha inicio <span class="text-red-500">*</span></label>
          <input type="date" :value="cl.fechaInicio" :max="todayISO" @input="emit('update-cl', 'fechaInicio', ($event.target as HTMLInputElement).value)" :class="inputClass" />
          <p v-if="formErrors.gFechaInicio" class="text-xs text-red-500 mt-1">{{ formErrors.gFechaInicio }}</p>
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1">Fecha fin <span class="text-red-500">*</span></label>
          <input type="date" :value="cl.fechaFin" :max="todayISO" @input="emit('update-cl', 'fechaFin', ($event.target as HTMLInputElement).value)" :class="inputClass" />
          <p v-if="formErrors.gFechaFin" class="text-xs text-red-500 mt-1">{{ formErrors.gFechaFin }}</p>
        </div>
      </div>
      <p class="text-[11px] text-slate-400"><span class="text-red-500">*</span> Obligatorio</p>
    </template>

    <template v-else>
      <p class="text-xs font-semibold text-slate-500 uppercase tracking-wide">Filtros generales PET</p>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1">Fecha inicial <span class="text-red-500">*</span></label>
          <input type="date" :value="pet.fechaInicio" :max="todayISO" @input="emit('update-pet', 'fechaInicio', ($event.target as HTMLInputElement).value)" :class="inputClass" />
          <p v-if="formErrors.gFechaInicio" class="text-xs text-red-500 mt-1">{{ formErrors.gFechaInicio }}</p>
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1">Fecha final <span class="text-red-500">*</span></label>
          <input type="date" :value="pet.fechaFin" :max="todayISO" @input="emit('update-pet', 'fechaFin', ($event.target as HTMLInputElement).value)" :class="inputClass" />
          <p v-if="formErrors.gFechaFin" class="text-xs text-red-500 mt-1">{{ formErrors.gFechaFin }}</p>
        </div>
      </div>
      <p class="text-[11px] text-slate-400"><span class="text-red-500">*</span> Obligatorio</p>
    </template>

    <div class="flex flex-wrap items-center gap-2 pt-1">
      <button
        @click="emit('consultar')"
        :disabled="isLoading"
        class="flex items-center gap-2 px-4 py-2 bg-[#FFD100] hover:bg-yellow-400 text-[#00357F] text-sm font-bold rounded-lg shadow-sm hover:shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Search class="w-4 h-4" />
        Consultar
      </button>
      <button
        @click="emit('clear')"
        :disabled="isLoading"
        class="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-600 text-sm font-semibold rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <RotateCcw class="w-4 h-4" />
        Limpiar
      </button>

      <div v-if="hasResults" class="flex items-center gap-2 ml-auto">
        <label class="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer select-none">
          <input type="checkbox" v-model="includeChart" class="accent-[#00357F] w-3.5 h-3.5" />
          Incluir gráfica en PDF
        </label>
        <button
          @click="emit('export-csv')"
          :disabled="exportLoading"
          class="flex items-center gap-2 px-3 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
        >
          <FileText class="w-4 h-4" />
          Excel
        </button>
        <button
          @click="emit('export-pdf', { includeChart: includeChart })"
          :disabled="exportLoading"
          class="flex items-center gap-2 px-3 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
        >
          <File class="w-4 h-4" />
          PDF
        </button>
      </div>
    </div>
  </div>
</template>
