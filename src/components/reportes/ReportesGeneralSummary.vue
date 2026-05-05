<script setup lang="ts">
import { computed } from 'vue'
import { BarChart3, Calendar, CheckCircle2, XCircle, Users, Upload, Clock, RefreshCw } from 'lucide-vue-next'

interface SummarySlice {
  label: string
  count: number
  color: string
}

interface SummaryData {
  total: number
  cargas: number
  fechaMin: string
  fechaMax: string
  lineaSlices: SummarySlice[]
  aprobados: number
  rechazados: number
  pendientes?: number
  actualizaciones?: number
}

const props = defineProps<{
  summary: SummaryData | null
  tipo: 'carga' | 'validacion' | 'envio'
}>()

const cargaLabel = computed(() => {
  if (!props.summary) return 'Cargas'
  if (props.tipo === 'validacion') return 'Validaciones'
  if (props.tipo === 'envio') return 'Envíos'
  return 'Cargas'
})

const pieGradient = computed(() => {
  if (!props.summary) return ''
  const slices = props.tipo === 'validacion' && (props.summary.aprobados || props.summary.rechazados)
    ? (() => {
        const pend = props.summary!.pendientes ?? 0
        const otros = props.summary!.total - props.summary!.aprobados - props.summary!.rechazados - pend
        return [
          { label: 'Aprobados', count: props.summary!.aprobados, color: '#10B981' },
          { label: 'Rechazados', count: props.summary!.rechazados, color: '#EF4444' },
          ...(pend > 0 ? [{ label: 'Pendientes', count: pend, color: '#F59E0B' }] : []),
          ...(otros > 0 ? [{ label: 'Otros', count: otros, color: '#CBD5E1' }] : [])
        ].filter(s => s.count > 0)
      })()
    : props.summary.lineaSlices

  const total = slices.reduce((s, sl) => s + sl.count, 0)
  if (!total) return ''
  const segments: string[] = []
  let acc = 0
  for (const s of slices) {
    const start = (acc / total) * 100
    acc += s.count
    const end = (acc / total) * 100
    segments.push(`${s.color} ${start}% ${end}%`)
  }
  return `conic-gradient(${segments.join(', ')})`
})

const legendItems = computed(() => {
  if (!props.summary) return []
  if (props.tipo === 'validacion' && (props.summary.aprobados || props.summary.rechazados)) {
    const pend = props.summary.pendientes ?? 0
    const otros = props.summary.total - props.summary.aprobados - props.summary.rechazados - pend
    return [
      { label: 'Aprobados', count: props.summary.aprobados, color: '#10B981' },
      { label: 'Rechazados', count: props.summary.rechazados, color: '#EF4444' },
      ...(pend > 0 ? [{ label: 'Pendientes', count: pend, color: '#F59E0B' }] : []),
      ...(otros > 0 ? [{ label: 'Sin estatus', count: otros, color: '#CBD5E1' }] : [])
    ]
  }
  return props.summary.lineaSlices
})
</script>

<template>
  <div v-if="summary" class="bg-white border border-slate-200 rounded-xl p-4 space-y-4">
    <div class="flex flex-col lg:flex-row gap-4">
      <div class="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div class="bg-slate-50 rounded-lg p-3 flex items-center gap-3">
          <div class="flex-shrink-0 h-9 w-9 rounded-full bg-blue-100 text-[#00357F] flex items-center justify-center">
            <Users class="w-4.5 h-4.5" />
          </div>
          <div>
            <p class="text-[11px] text-slate-500 font-medium uppercase tracking-wide">Total registros</p>
            <p class="text-lg font-bold text-slate-800 tabular-nums">{{ summary.total.toLocaleString() }}</p>
          </div>
        </div>

        <div class="bg-slate-50 rounded-lg p-3 flex items-center gap-3">
          <div class="flex-shrink-0 h-9 w-9 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
            <BarChart3 class="w-4.5 h-4.5" />
          </div>
          <div>
            <p class="text-[11px] text-slate-500 font-medium uppercase tracking-wide">Líneas</p>
            <p class="text-lg font-bold text-slate-800 tabular-nums">{{ summary.lineaSlices.length }}</p>
          </div>
        </div>

        <div class="bg-slate-50 rounded-lg p-3 flex items-center gap-3">
          <div class="flex-shrink-0 h-9 w-9 rounded-full bg-cyan-100 text-cyan-600 flex items-center justify-center">
            <Upload class="w-4.5 h-4.5" />
          </div>
          <div>
            <p class="text-[11px] text-slate-500 font-medium uppercase tracking-wide">{{ cargaLabel }}</p>
            <p class="text-lg font-bold text-slate-800 tabular-nums">{{ summary.cargas.toLocaleString() }}</p>
          </div>
        </div>

        <div class="bg-slate-50 rounded-lg p-3 flex items-center gap-3">
          <div class="flex-shrink-0 h-9 w-9 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
            <Calendar class="w-4.5 h-4.5" />
          </div>
          <div>
            <p class="text-[11px] text-slate-500 font-medium uppercase tracking-wide">Rango fechas</p>
            <p class="text-xs font-semibold text-slate-700">{{ summary.fechaMin }} - {{ summary.fechaMax }}</p>
          </div>
        </div>

        <template v-if="tipo === 'validacion'">
          <div class="bg-emerald-50 rounded-lg p-3 flex items-center gap-3">
            <div class="flex-shrink-0 h-9 w-9 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 class="w-4.5 h-4.5" />
            </div>
            <div>
              <p class="text-[11px] text-emerald-600 font-medium uppercase tracking-wide">Aprobados</p>
              <p class="text-lg font-bold text-emerald-700 tabular-nums">{{ summary.aprobados.toLocaleString() }}</p>
            </div>
          </div>

          <div class="bg-red-50 rounded-lg p-3 flex items-center gap-3">
            <div class="flex-shrink-0 h-9 w-9 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
              <XCircle class="w-4.5 h-4.5" />
            </div>
            <div>
              <p class="text-[11px] text-red-600 font-medium uppercase tracking-wide">Rechazados</p>
              <p class="text-lg font-bold text-red-700 tabular-nums">{{ summary.rechazados.toLocaleString() }}</p>
            </div>
          </div>

          <div v-if="summary.pendientes !== undefined" class="bg-amber-50 rounded-lg p-3 flex items-center gap-3">
            <div class="flex-shrink-0 h-9 w-9 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
              <Clock class="w-4.5 h-4.5" />
            </div>
            <div>
              <p class="text-[11px] text-amber-600 font-medium uppercase tracking-wide">Pendientes</p>
              <p class="text-lg font-bold text-amber-700 tabular-nums">{{ summary.pendientes.toLocaleString() }}</p>
            </div>
          </div>
        </template>

        <div v-if="tipo === 'carga' && summary.actualizaciones !== undefined" class="bg-sky-50 rounded-lg p-3 flex items-center gap-3">
          <div class="flex-shrink-0 h-9 w-9 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center">
            <RefreshCw class="w-4.5 h-4.5" />
          </div>
          <div>
            <p class="text-[11px] text-sky-600 font-medium uppercase tracking-wide">Actualizaciones</p>
            <p class="text-lg font-bold text-sky-700 tabular-nums">{{ summary.actualizaciones.toLocaleString() }}</p>
          </div>
        </div>
      </div>

      <div class="flex-shrink-0 flex flex-col items-center gap-3 lg:w-56">
        <div
          class="w-36 h-36 rounded-full shadow-inner"
          :style="{ background: pieGradient }"
        >
          <div class="w-full h-full flex items-center justify-center">
            <div class="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-sm">
              <span class="text-sm font-bold text-slate-700 tabular-nums">{{ summary.total }}</span>
            </div>
          </div>
        </div>
        <div class="flex flex-wrap justify-center gap-x-3 gap-y-1">
          <div v-for="item in legendItems" :key="item.label" class="flex items-center gap-1.5 text-xs">
            <span class="w-2.5 h-2.5 rounded-full flex-shrink-0" :style="{ backgroundColor: item.color }"></span>
            <span class="text-slate-600">{{ item.label }}</span>
            <span class="text-slate-400 font-medium tabular-nums">({{ item.count }})</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
