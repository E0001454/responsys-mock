<script setup lang="ts">
import { ref, computed } from 'vue'
import { Download, FileText, File } from 'lucide-vue-next'
import BaseModalShell from '@/components/shared/modal/BaseModalShell.vue'
import BaseModalActions from '@/components/shared/modal/BaseModalActions.vue'

interface Props {
  show: boolean
  loading: boolean
}

interface Emits {
  (e: 'close'): void
  (e: 'download', options: { format: 'csv' | 'pdf'; includeDetails: boolean; contentType: 'all' | 'en-curso' }): void
}

defineProps<Props>()
defineEmits<Emits>()

const selectedFormat = ref<'csv' | 'pdf'>('csv')
const includeDetails = ref(false)
const contentType = ref<'all' | 'en-curso'>('en-curso')

const formatLabel = computed(() => {
  if (selectedFormat.value === 'csv') return 'CSV'
  return 'PDF'
})
</script>

<template>
  <BaseModalShell
    :show="show"
    title="Descargar Reporte"
    :mobile-bottom-sheet="true"
    max-width-class="max-w-md max-[640px]:max-w-none"
    panel-class="rounded-2xl max-[640px]:rounded-t-2xl max-[640px]:rounded-b-none"
    body-class="p-4 sm:p-6 overflow-y-auto custom-scrollbar bg-slate-50 flex-1 min-h-0"
    @close="$emit('close')"
  >
    <template #body>
      <div class="space-y-6">
        <div class="space-y-3">
          <h3 class="text-sm font-semibold text-slate-700">Formato de descarga</h3>
          <div class="flex gap-2">
            <button
              type="button"
              @click="selectedFormat = 'csv'"
              :class="[
                'flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold text-sm transition-all duration-200 border-2',
                selectedFormat === 'csv'
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-emerald-300'
              ]"
            >
              <FileText class="w-4 h-4" />
              CSV
            </button>
            <button
              type="button"
              @click="selectedFormat = 'pdf'"
              :class="[
                'flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold text-sm transition-all duration-200 border-2',
                selectedFormat === 'pdf'
                  ? 'bg-red-50 border-red-500 text-red-700'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-red-300'
              ]"
            >
              <File class="w-4 h-4" />
              PDF
            </button>
          </div>
        </div>

        <div class="space-y-3">
          <h3 class="text-sm font-semibold text-slate-700">Contenido del reporte</h3>
          <div class="bg-white border border-slate-200 rounded-lg p-4 space-y-3">
            <label class="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                v-model="contentType"
                value="en-curso"
                class="w-4 h-4 text-[#00357F] focus:ring-2 focus:ring-[#00357F]"
              />
              <div class="flex-1">
                <p class="text-sm font-semibold text-slate-700">Solo tareas en curso</p>
                <p class="text-xs text-slate-500 mt-0.5">Incluye exactamente las tareas visibles en la tabla principal (segun filtros actuales)</p>
              </div>
            </label>
            <label class="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                v-model="contentType"
                value="all"
                class="w-4 h-4 text-[#00357F] focus:ring-2 focus:ring-[#00357F]"
              />
              <div class="flex-1">
                <p class="text-sm font-semibold text-slate-700">Todas las tareas</p>
                <p class="text-xs text-slate-500 mt-0.5">Incluye también las históricas (Carga, Validación y Envío) por mapeo</p>
              </div>
            </label>
          </div>

          <div class="bg-white border border-slate-200 rounded-lg p-4">
            <label class="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                v-model="includeDetails"
                class="w-4 h-4 text-[#00357F] rounded focus:ring-2 focus:ring-[#00357F]"
              />
              <div class="flex-1">
                <p class="text-sm font-semibold text-slate-700">Incluir detalle de actividades</p>
                <p class="text-xs text-slate-500 mt-1">
                  {{ includeDetails
                    ? 'Se incluirá el detalle completo con todas las actividades y horarios'
                    : 'Se descargarán solo los datos mostrados en la tabla de monitoreo'
                  }}
                </p>
              </div>
            </label>
          </div>
        </div>

        <div class="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2">
          <p class="text-xs font-semibold text-blue-900">Resumen de descarga:</p>
          <ul class="text-xs text-blue-800 space-y-1">
            <li>• Formato: <span class="font-semibold">{{ formatLabel }}</span></li>
            <li>• Contenido: <span class="font-semibold">{{ contentType === 'en-curso' ? 'Solo tareas en curso' : 'Todas las tareas' }}</span></li>
            <li>• Detalle: <span class="font-semibold">{{ includeDetails ? 'Con detalle' : 'Sin detalle' }}</span></li>
            
          </ul>
        </div>
      </div>
    </template>

    <template #footer>
      <BaseModalActions
        :confirm-text="`Descargar como ${formatLabel}`"
        cancel-text="Cancelar"
        :loading="loading"
        @confirm="$emit('download', { format: selectedFormat, includeDetails, contentType })"
        @cancel="$emit('close')"
      >
        <Download class="w-4 h-4" />
      </BaseModalActions>
    </template>
  </BaseModalShell>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}
</style>
