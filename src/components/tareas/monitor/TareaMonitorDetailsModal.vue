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
  showErrorFor: (item: TareaMonitorData) => boolean
  canErrorFor: (item: TareaMonitorData) => boolean
  getLineaLabel: (row: TareaMonitorData) => string
  getCampanaLabel: (row: TareaMonitorData) => string
  getStatusClass: (row: TareaMonitorData) => string
  getHorarioLabel: (row: TareaMonitorData) => string
  formatDateLabel: (value?: string) => string
  formatTimeLabel: (value?: string) => string
  formatNumber: (value?: number) => string
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'approve', item: TareaMonitorData): void
  (e: 'dictaminar', item: TareaMonitorData): void
  (e: 'view-error', item: TareaMonitorData): void
}>()

type ConfirmAction = 'approve' | 'dictaminar' | null

const confirmAction = ref<ConfirmAction>(null)
const confirmItem = ref<TareaMonitorData | null>(null)

const showConfirm = computed(() => confirmAction.value !== null)

const confirmTitle = computed(() => {
  if (confirmAction.value === 'approve') return 'Confirmar aprobación'
  if (confirmAction.value === 'dictaminar') return 'Confirmar dictaminación'
  return ''
})

const confirmMessage = computed(() => {
  if (confirmAction.value === 'approve') return '¿Deseas aprobar esta ejecución?'
  if (confirmAction.value === 'dictaminar') return '¿Deseas dictaminar este registro?'
  return ''
})

const confirmText = computed(() => {
  return 'Aceptar'
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

function formattedDateTime(value?: string) {
  if (!value) return '-'
  return `${props.formatDateLabel(value)} ${props.formatTimeLabel(value)}`
}

function shouldShowApprovedBadge(stage: TareaMonitorData) {
  const status = String(stage.estatus.codigo ?? '').toUpperCase()
  if (status === 'APB' || Boolean(stage.fechaAprobada)) return true

  const isValidation = String(stage.actividad.codigo).toUpperCase() === 'VALIDACION'
  const mode = String(stage.ejecucion.modo).toUpperCase()
  const isManualOrHybrid = mode === 'MANUAL' || mode === 'HIBRIDA'
  return isValidation && isManualOrHybrid && Boolean(stage.fechaInicio)
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

const groupedActivities = computed(() => {
  const groups = new Map<string, { key: string; label: string; items: TareaMonitorData[] }>()

  orderedStages.value.forEach(stage => {
    const key = `${String(stage.actividad.codigo ?? '')}-${String(stage.actividad.id ?? '')}`
    const label = String(stage.actividad.nombre ?? stage.actividad.codigo ?? 'Actividad')

    if (!groups.has(key)) {
      groups.set(key, { key, label, items: [] })
    }

    groups.get(key)!.items.push(stage)
  })

  return Array.from(groups.values()).map(group => {
    const items = group.items.slice().sort((a, b) => {
      const da = a.horarioProgramado ? Date.parse(a.horarioProgramado) : 0
      const db = b.horarioProgramado ? Date.parse(b.horarioProgramado) : 0
      if (da !== db) return da - db
      return Number(a.etapaIndex ?? 0) - Number(b.etapaIndex ?? 0)
    })
    return {
      ...group,
      items,
      representative: resolveGroupRepresentative(items)
    }
  })
})

function resolveGroupRepresentative(items: TareaMonitorData[]): TareaMonitorData {
  const priority: Record<string, number> = { EJC: 1, PLN: 2, ERR: 3, CMP: 4, BLQ: 5, CNC: 6 }
  return (items.slice().sort((a, b) => {
    const pa = priority[String(a.estatus.codigo).toUpperCase()] ?? 99
    const pb = priority[String(b.estatus.codigo).toUpperCase()] ?? 99
    return pa - pb
  })[0] ?? items[0]) as TareaMonitorData
}

function formatExecutionMode(mode?: string) {
  const normalized = String(mode ?? '').toUpperCase()
  if (normalized === 'HIBRIDA') return 'Hibrida'
  if (normalized === 'MANUAL') return 'Manual'
  if (normalized === 'AUTOMATICA') return 'Automatica'
  return '-'
}

</script>

<template>
  <BaseModalShell
    :show="show"
    title="Detalle de Monitoreo"
    :mobile-bottom-sheet="true"
    max-width-class="max-w-6xl max-[640px]:max-w-none"
    panel-class="rounded-2xl max-[640px]:rounded-t-2xl max-[640px]:rounded-b-none"
    body-class="p-3 sm:p-4 overflow-y-auto custom-scrollbar bg-slate-50 flex-1 min-h-0"
    @close="emit('close')"
  >
    <template #body>
      <div v-if="!item" class="text-sm text-slate-500">
        Sin información para mostrar.
      </div>

      <div v-else class="space-y-5 text-sm">
        <div v-if="item.scope === 'campana'" class="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div class="bg-slate-50 rounded-lg p-4 border border-slate-200 flex flex-col md:col-span-1">
            <span class="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Línea de negocio</span>
            <p class="mt-1 font-semibold text-slate-700">{{ getLineaLabel(item) }}</p>
          </div>
          <div class="bg-slate-50 rounded-lg p-4 border border-slate-200 flex flex-col md:col-span-1">
            <span class="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Campaña</span>
            <p class="mt-1 font-semibold text-slate-700">{{ getCampanaLabel(item) }}</p>
          </div>
          <div class="bg-slate-50 rounded-lg p-4 border border-slate-200 flex flex-col md:col-span-2">
            <span class="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Nombre de ingesta</span>
            <p class="mt-1 font-semibold text-slate-700">{{ item.nombreMapeo }}</p>
          </div>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div class="bg-slate-50 rounded-lg p-4 border border-slate-200 flex flex-col">
            <span class="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Línea de negocio</span>
            <p class="mt-1 font-semibold text-slate-700">{{ getLineaLabel(item) }}</p>
          </div>
          <div class="bg-slate-50 rounded-lg p-4 border border-slate-200 flex flex-col">
            <span class="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Nombre de ingesta</span>
            <p class="mt-1 font-semibold text-slate-700">{{ item.nombreMapeo }}</p>
          </div>
        </div>

        <div class="space-y-2">
          <h3 class="text-xs font-bold uppercase tracking-widest text-slate-400 px-1">Actividades y horarios</h3>
          <div class="overflow-x-auto">
            <div class="min-w-[1400px] space-y-2">
              <div
                v-for="group in groupedActivities"
                :key="group.key"
                class="bg-white border border-slate-200 rounded-xl overflow-visible shadow-sm"
              >
                <div class="w-full flex items-center justify-between gap-3 px-4 py-2.5 bg-slate-50/70">
                  <div class="flex items-center gap-2 min-w-0">
                    <span class="text-sm font-bold text-slate-800 truncate">{{ group.label }}</span>
                    <span class="text-[11px] px-2 py-0.5 rounded-full bg-slate-200 text-slate-600 font-semibold">{{ group.items.length }} horario{{ group.items.length === 1 ? '' : 's' }}</span>
                    <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                      {{ formatExecutionMode(group.representative.ejecucion.modo) }}
                    </span>
                  </div>
                </div>

                <table class="w-full table-fixed text-xs border-collapse whitespace-nowrap">
                <thead>
                  <tr class="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px]">
                    <th class="px-2.5 py-2 text-left">Horario</th>
                    <th class="px-2.5 py-2 text-left">Fecha inicio</th>
                    <th class="px-2.5 py-2 text-left">Fecha fin</th>
                    <th class="px-2.5 py-2 text-left">Fecha planificación</th>
                    <th class="px-2.5 py-2 text-center"></th>
                    <th class="px-2.5 py-2 text-left">Fecha ejecución</th>
                    <th class="px-2.5 py-2 text-center"></th>
                    <th class="px-2.5 py-2 text-left">Fecha dictaminación</th>
                    <th class="px-2.5 py-2 text-left">Fecha completada</th>
                    <th class="px-2.5 py-2 text-right">Núm. registros</th>
                  </tr>
                </thead>
                <tbody>
                  <template v-for="stage in group.items" :key="`${stage.pipelineId}-${stage.etapaIndex}`">
                    <tr class="border-t border-slate-100 align-top">
                      <td class="px-2.5 py-2 text-slate-700">{{ getHorarioLabel(stage) || formatTimeLabel(stage.horarioProgramado) || '-' }}</td>
                      <td class="px-2.5 py-2 text-slate-700 tabular-nums">{{ formattedDateTime(stage.fechaInicio) }}</td>
                      <td class="px-2.5 py-2 text-slate-700 tabular-nums">{{ formattedDateTime(stage.fechaFin) }}</td>
                      <td class="px-2.5 py-2 font-semibold text-slate-700 tabular-nums">{{ formattedDateTime(stage.fechaCreacion) }}</td>
                      <td class="px-2.5 py-2 text-center">
                        <template v-if="props.showApproveFor(stage)">
                          <span
                            v-if="shouldShowApprovedBadge(stage)"
                            class="inline-flex items-center px-2 py-1 rounded-lg text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200"
                          >
                            Aprobado
                          </span>
                          <button
                            v-else
                            type="button"
                            class="px-2 py-1 rounded-lg text-[11px] font-semibold transition-colors"
                            :class="props.canApproveFor(stage)
                              ? 'bg-[#00357F] text-white hover:bg-[#002A64]'
                              : 'bg-transparent text-slate-400 cursor-not-allowed border border-slate-200'"
                            :disabled="loading || !props.canApproveFor(stage)"
                            @click="openApproveConfirm(stage)"
                          >
                            Aceptar
                          </button>
                        </template>
                      </td>
                      <td class="px-2.5 py-2 text-slate-700 tabular-nums">{{ formattedDateTime(stage.fechaInicio) }}</td>
                      <td class="px-2.5 py-2 text-center">
                        <template v-if="props.showDictaminarFor(stage)">
                          <button
                            v-if="!stage.dictaminado"
                            type="button"
                            class="px-2 py-1 rounded-lg text-[11px] font-semibold transition-colors"
                            :class="props.canDictaminarFor(stage)
                              ? 'bg-[#00357F] text-white hover:bg-[#002A64]'
                              : 'bg-transparent text-slate-400 cursor-not-allowed border border-slate-200'"
                            :disabled="loading || !props.canDictaminarFor(stage)"
                            @click="openDictaminarConfirm(stage)"
                          >
                            Aceptar
                          </button>
                          <span v-else class="inline-flex items-center px-2 py-1 rounded-lg text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Dictaminado
                          </span>
                        </template>
                      </td>
                      <td class="px-2.5 py-2 text-slate-700 tabular-nums">{{ formattedDateTime(stage.fechaDictaminacion) }}</td>
                      <td class="px-2.5 py-2">
                        <div class="flex max-w-full flex-col items-start gap-1">
                          <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold" :class="getStatusClass(stage)">
                            {{ stage.estatus.nombre }}
                          </span>
                          <button
                            v-if="props.showErrorFor(stage)"
                            type="button"
                            class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold border transition-colors"
                            :class="props.canErrorFor(stage)
                              ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                              : 'bg-transparent text-slate-400 border-slate-200 cursor-not-allowed'"
                            :disabled="loading || !props.canErrorFor(stage)"
                            title="Abrir detalle del error"
                            aria-label="Abrir detalle del error"
                            @click="emit('view-error', stage)"
                          >
                            <span aria-hidden="true">!</span>
                            Ver detalle del error
                          </button>
                          <span class="text-slate-700 tabular-nums text-[11px] leading-tight whitespace-normal break-words">{{ formattedDateTime(stage.fechaFin) }}</span>
                        </div>
                      </td>
                      <td class="px-2.5 py-2 text-right tabular-nums font-semibold text-slate-700">{{ formatNumber(stage.numeroRegistrosProcesados) }} / {{ formatNumber(stage.numeroRegistros) }}</td>
                    </tr>
                  </template>
                </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <template #footer>
      <BaseModalActions
        confirm-text="Aceptar"
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
