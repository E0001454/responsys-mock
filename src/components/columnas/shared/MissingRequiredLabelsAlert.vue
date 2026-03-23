<script setup lang="ts">
import { computed, ref } from 'vue'

interface MissingItem {
  label: string
  value: number | string
}

const props = defineProps<{
  items: MissingItem[]
}>()

const showDetails = ref(false)

const total = computed(() => props.items.length)

const displayItems = computed(() =>
  props.items.map(item => {
    const normalized = String(item.label ?? '')
      .replace(/_+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()

    const pretty = normalized
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase())

    return {
      ...item,
      displayLabel: pretty || String(item.label ?? '')
    }
  })
)
</script>

<template>
  <div v-if="total > 0" class="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
    <div class="flex items-center justify-between gap-2">
      <div class="min-w-0">
        <p class="truncate text-[12px] font-semibold tracking-tight">
          Faltan {{ total }} columnas obligatorias
        </p>
        <p class="text-[10px] text-amber-700/80">Completa estas columnas para cerrar correctamente el mapeo.</p>
      </div>
      <div class="inline-flex items-center gap-2">
       
        <button
          type="button"
          class="inline-flex items-center rounded-md border border-amber-300 bg-white px-2 py-0.5 text-[10px] font-semibold text-amber-800 hover:bg-amber-50 transition-colors"
          @click="showDetails = !showDetails"
        >
          {{ showDetails ? 'Ocultar detalle' : 'Ver detalle' }}
        </button>
      </div>
    </div>

    <div v-if="showDetails" class="mt-2 max-h-24 overflow-y-auto rounded-md border border-slate-200 bg-white p-2">
      <div class="flex flex-wrap content-start gap-1.5">
        <span
          v-for="option in displayItems"
          :key="`missing-required-${option.value}`"
          class="inline-flex max-w-full items-center rounded-sm border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-700 transition-colors hover:bg-slate-100"
          :title="option.label"
        >
          <span class="truncate">{{ option.displayLabel }}</span>
        </span>
      </div>
    </div>
  </div>
</template>
