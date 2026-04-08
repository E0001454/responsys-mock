<script setup lang="ts">
import { ClipboardCheck, Layers, Megaphone, Plus } from 'lucide-vue-next'

interface TabItem {
  key: 'linea' | 'campana'
  label: string
}

defineProps<{
  tabs: readonly TabItem[]
  activeTab: 'linea' | 'campana'
}>()

const emit = defineEmits<{
  (e: 'tab-change', tab: 'linea' | 'campana'): void
  (e: 'add'): void
}>()

function resolveIcon(tab: 'linea' | 'campana') {
  return tab === 'linea' ? Layers : Megaphone
}
</script>

<template>
  <div class="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-3 sm:gap-4">
    <div class="pl-12 lg:pl-0 min-h-10 flex flex-col justify-center">
      <h1 class="text-xl sm:text-2xl font-bold text-[#00357F] tracking-tight flex items-center gap-2">
        <ClipboardCheck class="w-6 h-6" />
        Gestión de Actividades
      </h1>
      <p class="text-sm text-slate-500 mt-1">
        Administra la configuración de actividades para líneas y campañas.
      </p>
    </div>

    <div class="w-full lg:w-auto flex items-center gap-2 sm:gap-3 overflow-x-auto pb-1 max-[430px]:flex-col max-[430px]:items-stretch max-[430px]:overflow-visible">
      <div class="bg-white p-1 rounded-lg border border-slate-200 shadow-sm flex shrink-0 min-w-[280px] max-[430px]:w-full max-[430px]:min-w-0">
        <button
          v-for="t in tabs"
          :key="t.key"
          @click="emit('tab-change', t.key)"
          class="flex items-center gap-2 px-3 sm:px-4 py-1.5 text-sm font-medium rounded-md transition-all duration-200 whitespace-nowrap max-[430px]:flex-1 max-[430px]:justify-center"
          :class="activeTab === t.key
            ? 'bg-[#00357F] text-white shadow-sm cursor-pointer'
            : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100 cursor-pointer'"
        >
          <component :is="resolveIcon(t.key)" class="w-4 h-4" />
          {{ t.label }}
        </button>
      </div>
      <button
        @click="emit('add')"
        class="shrink-0 justify-center flex items-center gap-2 bg-[#FFD100] hover:bg-yellow-400 text-[#00357F] text-sm font-bold py-2 px-4 rounded-lg shadow-sm hover:shadow transition-all cursor-pointer max-[430px]:w-full"
      >
        <Plus class="w-4 h-4" />
        <span>Nuevo</span>
      </button>
    </div>
  </div>
</template>
