<script setup lang="ts">
import { computed, ref } from 'vue'
import BaseModalActions from '@/components/shared/modal/BaseModalActions.vue'
import BaseModalShell from '@/components/shared/modal/BaseModalShell.vue'
import ModalActionConfirmOverlay from '@/components/shared/ModalActionConfirmOverlay.vue'
import type { TareaMonitorData } from '@/types/tareas/monitor'

const props = defineProps<{
  show: boolean
  item: TareaMonitorData | null
  stages: TareaMonitorData[]
  loading: boolean
  canApproveFor: (item: TareaMonitorData) => boolean
  canDictaminarFor: (item: TareaMonitorData) => boolean
  showApproveFor: (item: TareaMonitorData) => boolean
  showDictaminarFor: (item: TareaMonitorData) => boolean
  getLineaLabel: (row: TareaMonitorData) => string
  getCampanaLabel: (row: TareaMonitorData) => string
  getStatusClass: (row: TareaMonitorData) => string
  formatDateLabel: (value?: string) => string
  formatTimeLabel: (value?: string) => string
  formatNumber: (value?: number) => string
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'approve', item: TareaMonitorData): void
  (e: 'dictaminar', item: TareaMonitorData): void
}>()

type ConfirmAction = 'approve' | 'dictaminar' | null

const confirmAction = ref<ConfirmAction>(null)
const confirmItem = ref<TareaMonitorData | null>(null)

const showConfirm = computed(() => confirmAction.value !== null)

const confirmTitle = computed(() => {
  if (confirmAction.value === 'approve') return 'Confirmar aprobacion'
  if (confirmAction.value === 'dictaminar') return 'Confirmar dictaminacion'
  return ''
})

const confirmMessage = computed(() => {
  if (confirmAction.value === 'approve') return 'Deseas aprobar esta ejecucion?'
  if (confirmAction.value === 'dictaminar') return 'Deseas dictaminar este registro?'
  return ''
})

const confirmText = computed(() => {
  if (confirmAction.value === 'approve') return 'Aprobar'
  if (confirmAction.value === 'dictaminar') return 'Dictaminar'
  return 'Confirmar'
})

function requestApprove() {
  if (!confirmItem.value || !props.canApproveFor(confirmItem.value) || props.loading) return
  confirmAction.value = 'approve'
}

function requestDictaminar() {
  if (!confirmItem.value || !props.canDictaminarFor(confirmItem.value) || props.loading) return
  confirmAction.value = 'dictaminar'
}

function openApproveConfirm(item: TareaMonitorData) {
  confirmItem.value = item
  requestApprove()
}

function openDictaminarConfirm(item: TareaMonitorData) {
  confirmItem.value = item
  requestDictaminar()
}

function closeConfirm() {
  confirmAction.value = null
  confirmItem.value = null
}

function confirmPendingAction() {
  if (!confirmItem.value) return
  if (confirmAction.value === 'approve') emit('approve', confirmItem.value)
  if (confirmAction.value === 'dictaminar') emit('dictaminar', confirmItem.value)
  closeConfirm()
}

function executionHelpText(item: TareaMonitorData) {
  if (item.ejecucion.modo === 'AUTOMATICA') {
    return 'Ejecucion automatica: no requiere aprobacion manual.'
  }
  if (item.ejecucion.modo === 'MANUAL') {
    return props.canApproveFor(item)
      ? 'Ejecucion manual: ya alcanzo su horario y puede aprobarse.'
      : 'Ejecucion manual: se habilita cuando llegue su horario configurado.'
  }
  return props.canApproveFor(item)
    ? 'Ejecucion hibrida: disponible para aprobar antes del horario automatico.'
    : 'Ejecucion hibrida: al llegar su horario se ejecuta automaticamente.'
}

const orderedStages = computed(() => {
  const source = props.stages?.length ? props.stages : (props.item ? [props.item] : [])
  const order: Record<string, number> = { CARGA: 1, VALIDACION: 2, ENVIO: 3 }
  return source.slice().sort((a, b) => {
    const oa = order[String(a.actividad.codigo ?? '').toUpperCase()] ?? 99
    const ob = order[String(b.actividad.codigo ?? '').toUpperCase()] ?? 99
    if (oa !== ob) return oa - ob
    return Number(a.etapaIndex ?? 0) - Number(b.etapaIndex ?? 0)
  })
})

function formattedDateTime(value?: string) {
  if (!value) return '-'
  return `${props.formatDateLabel(value)} ${props.formatTimeLabel(value)}`
}
</script>

<template>
  <BaseModalShell
    :show="show"
    title="Detalle de Monitoreo"
    :mobile-bottom-sheet="true"
    max-width-class="max-w-xl max-[640px]:max-w-none"
    panel-class="rounded-2xl max-[640px]:rounded-t-2xl max-[640px]:rounded-b-none"
    body-class="p-3 sm:p-4 overflow-y-auto custom-scrollbar bg-slate-50 flex-1 min-h-0"
    @close="emit('close')"
  >
    <template #body>
      <div v-if="!item" class="text-sm text-slate-500">
        Sin informacion para mostrar.
      </div>

      <div v-else class="space-y-5 text-sm">
        <div class="bg-slate-50 rounded-lg p-4 border border-slate-200 flex flex-col">
          <span class="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Linea de negocio</span>
          <p class="mt-1 font-semibold text-slate-700">{{ getLineaLabel(item) }}</p>
        </div>

        <div v-if="item.scope === 'campana'" class="bg-slate-50 rounded-lg p-4 border border-slate-200 flex flex-col">
          <span class="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Campana</span>
          <p class="mt-1 font-semibold text-slate-700">{{ getCampanaLabel(item) }}</p>
        </div>

        <div class="bg-slate-50 rounded-lg p-4 border border-slate-200 flex flex-col">
          <span class="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Nombre de ingesta</span>
          <p class="mt-1 font-semibold text-slate-700">{{ item.nombreMapeo }}</p>
        </div>

        <div class="space-y-4">
          <div
            v-for="stage in orderedStages"
            :key="`${stage.pipelineId}-${stage.etapaIndex}`"
            class="bg-white border border-slate-200 rounded-xl p-4 space-y-3"
          >
            <div class="flex items-center justify-between gap-3">
              <p class="text-sm font-bold text-slate-700">{{ stage.actividad.nombre }}</p>
              <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold" :class="getStatusClass(stage)">
                {{ stage.estatus.nombre }}
              </span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div class="bg-slate-50 rounded-lg p-3 border border-slate-200 flex flex-col">
                <span class="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Ejecucion</span>
                <p class="mt-1 font-semibold text-slate-700">{{ stage.ejecucion.nombre }}</p>
              </div>

              <div class="bg-slate-50 rounded-lg p-3 border border-slate-200 flex flex-col">
                <span class="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Num registros</span>
                <p class="mt-1 font-semibold text-slate-700">
                  {{ formatNumber(stage.numeroRegistrosProcesados) }} / {{ formatNumber(stage.numeroRegistros) }}
                </p>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div class="bg-slate-50 rounded-lg p-3 border border-slate-200 flex flex-col">
                <span class="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Horario</span>
                <p class="mt-1 text-slate-600">{{ formattedDateTime(stage.horarioProgramado) }}</p>
              </div>
              <div class="bg-slate-50 rounded-lg p-3 border border-slate-200 flex flex-col">
                <span class="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Fecha creacion</span>
                <p class="mt-1 text-slate-600">{{ formattedDateTime(stage.fechaCreacion) }}</p>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div class="bg-slate-50 rounded-lg p-3 border border-slate-200 flex flex-col">
                <span class="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Fecha inicio</span>
                <p class="mt-1 text-slate-600">{{ formattedDateTime(stage.fechaInicio) }}</p>
              </div>
              <div class="bg-slate-50 rounded-lg p-3 border border-slate-200 flex flex-col">
                <span class="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Fecha fin</span>
                <p class="mt-1 text-slate-600">{{ formattedDateTime(stage.fechaFin) }}</p>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3" v-if="props.showApproveFor(stage) || props.showDictaminarFor(stage)">
              <div v-if="props.showApproveFor(stage)" class="bg-white border border-slate-200 rounded-lg p-3 space-y-2 flex flex-col">
                <span class="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Aprobar</span>
                <button
                  type="button"
                  class="self-start px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                  :class="props.canApproveFor(stage)
                    ? 'bg-[#00357F] text-white hover:bg-[#002A64]'
                    : 'bg-slate-200 text-slate-500 cursor-not-allowed'"
                  :disabled="loading || !props.canApproveFor(stage)"
                  @click="openApproveConfirm(stage)"
                >
                  Aprobar
                </button>
                <p class="text-xs text-slate-500">{{ executionHelpText(stage) }}</p>
              </div>

              <div v-if="props.showDictaminarFor(stage)" class="bg-white border border-slate-200 rounded-lg p-3 space-y-2 flex flex-col">
                <span class="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Dictaminar</span>

                <button
                  v-if="!stage.dictaminado"
                  type="button"
                  class="self-start px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                  :class="props.canDictaminarFor(stage)
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                    : 'bg-slate-200 text-slate-500 cursor-not-allowed'"
                  :disabled="loading || !props.canDictaminarFor(stage)"
                  @click="openDictaminarConfirm(stage)"
                >
                  Pendiente
                </button>

                <span v-else class="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold border self-start bg-emerald-50 text-emerald-700 border-emerald-200">
                  Aprobado
                </span>
              </div>
            </div>
          </div>
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

    <template #overlay>
      <ModalActionConfirmOverlay
        :show="showConfirm"
        :title="confirmTitle"
        :message="confirmMessage"
        :confirm-text="confirmText"
        cancel-text="Cancelar"
        :is-loading="loading"
        @confirm="confirmPendingAction"
        @cancel="closeConfirm"
      />
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
