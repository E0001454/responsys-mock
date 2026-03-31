<script setup lang="ts">
import { computed } from 'vue'
import BaseModalShell from '@/components/shared/modal/BaseModalShell.vue'
import BaseModalActions from '@/components/shared/modal/BaseModalActions.vue'
import type { TareaMonitorData } from '@/types/tareas/monitor'

const props = defineProps<{
  show: boolean
  item: TareaMonitorData | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const parsedErrorDetails = computed(() => {
  const raw = String(props.item?.error?.detalle ?? '').trim()
  if (!raw) return [] as string[]

  const bySemicolon = raw
    .split(';')
    .map(chunk => chunk.trim())
    .filter(Boolean)

  if (bySemicolon.length > 1) return bySemicolon

  const byLine = raw
    .split(/\r?\n/)
    .map(chunk => chunk.trim())
    .filter(Boolean)

  return byLine.length > 1 ? byLine : [raw]
})
</script>

<template>
  <BaseModalShell
    :show="props.show"
    title="Detalle de Error"
    :mobile-bottom-sheet="true"
    max-width-class="max-w-lg max-[640px]:max-w-none"
    panel-class="rounded-2xl max-[640px]:rounded-t-2xl max-[640px]:rounded-b-none"
    body-class="p-4 sm:p-6 overflow-y-auto custom-scrollbar bg-slate-50 flex-1 min-h-0"
    @close="emit('close')"
  >
    <template #body>
      <div v-if="!props.item || !props.item.error" class="text-sm text-slate-500">
        Sin información de error disponible.
      </div>

      <div v-else class="space-y-4 text-sm">
        <div class="bg-red-50 border border-red-200 rounded-xl p-5 space-y-4">
          <div>
            <p class="mt-1 font-semibold text-red-800 text-base">{{ props.item.error.nombre }}</p>
          </div>

          <div>
            <ul v-if="parsedErrorDetails.length > 1" class="mt-2 space-y-2 list-disc pl-5 text-red-800 leading-relaxed">
              <li v-for="(detail, index) in parsedErrorDetails" :key="`${index}-${detail}`">{{ detail }}</li>
            </ul>
            <p v-else class="mt-1 text-red-800 leading-relaxed">{{ parsedErrorDetails[0] ?? '-' }}</p>
          </div>
        </div>

        <div class="bg-slate-100 border border-slate-200 rounded-lg px-4 py-3 text-xs text-slate-600 space-y-1">
          <p><span class="font-semibold">Actividad:</span> {{ props.item.actividad.nombre }}</p>
          <p><span class="font-semibold">Ingesta:</span> {{ props.item.nombreMapeo }}</p>
        </div>
      </div>
    </template>

    <template #footer>
      <BaseModalActions
        confirm-text="Cerrar"
        :show-cancel="false"
        @confirm="emit('close')"
      />
    </template>
  </BaseModalShell>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
</style>
