<script setup lang="ts">
import BaseModalActions from '@/components/shared/modal/BaseModalActions.vue'
import BaseModalShell from '@/components/shared/modal/BaseModalShell.vue'
import type { MapeoLineaData } from '@/types/mapeos/linea'

interface Props {
  show: boolean
  item?: MapeoLineaData | null
  getLineaLabel: (id?: number) => string
  getCampanaLabel?: (id?: number) => string
}

interface Emits {
  (e: 'close'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// function isCampanaItem(item?: MapeoData | MapeoCampanaData | null): item is MapeoCampanaData {
//   return !!item && Object.prototype.hasOwnProperty.call(item, 'idABCCatCampana')
// }

function formatTimestamp(value?: string) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('es-MX', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(date)
}

function getMapeoStageVisual(configured: boolean) {
  return {
    configured,
    label: configured ? '' : '',
    containerClass: configured
      ? 'bg-emerald-50/80 border-emerald-200 text-emerald-700'
      : 'bg-rose-50/70 border-rose-200 text-rose-700',
    iconWrapClass: configured
      ? 'bg-emerald-100 text-emerald-700'
      : 'bg-rose-100 text-rose-700'
  }
}

function getDictaminarVisual(configured: boolean) {
  return {
    configured,
    label: configured ? '' : '',
    containerClass: configured
      ? 'bg-emerald-50 border-emerald-200 text-[#00357F]'
      : 'bg-rose-50 border-rose-200 text-rose-700',
    iconWrapClass: configured
      ? 'bg-emerald-100 text-[#00357F]'
      : 'bg-rose-100 text-rose-700'
  }
}
</script>

<template>
  <BaseModalShell
    :show="show"
    title="Detalle de Mapeo"
    :mobile-bottom-sheet="true"
    max-width-class="max-w-lg max-[640px]:max-w-none"
    panel-class="rounded-2xl max-[640px]:rounded-t-2xl max-[640px]:rounded-b-none"
    body-class="p-3 sm:p-4 overflow-y-auto custom-scrollbar bg-slate-50 flex-1 min-h-0"
    @close="emit('close')"
  >
    <template #body>
      <div v-if="!item" class="text-sm text-slate-500">
          Sin informacion para mostrar.
      </div>

      <div v-else class="space-y-4 text-sm">
          <div class="bg-slate-50 rounded-lg p-2 border border-slate-200">
            <span class="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Linea</span>
            <p class="mt-1 font-semibold text-slate-700">{{ props.getLineaLabel(item.linea?.id) }}</p>
          </div>
          <div class="bg-slate-50 rounded-lg p-2 border border-slate-200">
            <span class="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Mapeo</span>
            <p class="mt-1 font-semibold text-slate-700">{{ item.nombre }}</p>
          </div>

          <div class="bg-slate-50 rounded-lg p-4 border border-slate-200">
            <span class="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Descripcion</span>
            <p class="mt-1 text-slate-600 whitespace-pre-wrap">{{ item.descripcion }}</p>
          </div>

          <div class="grid grid-cols-3 gap-2 sm:gap-3">
            <div class="bg-slate-50 rounded-lg p-2 border border-slate-200">
              <span class="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Estatus</span>
              <span
                class="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full border transition-all duration-200"
                :class="item.bolActivo
                  ? 'bg-blue-50 border-blue-200'
                  : 'bg-slate-50 border-slate-200'"
              >
                <span
                  class="h-2 w-2 rounded-full"
                  :class="item.bolActivo ? 'bg-[#00357F]' : 'bg-[#AD0A0A]'"
                ></span>
                <span
                  class="text-xs font-semibold"
                  :class="item.bolActivo ? 'text-[#00357F]' : 'text-slate-500'"
                >
                  {{ item.bolActivo ? 'Activo' : 'Inactivo' }}
                </span>
              </span>
            </div>

            <div class="bg-slate-50 rounded-lg p-2 border border-slate-200 flex flex-col items-start">
              <span class="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Validar</span>
              <template v-for="stage in [getMapeoStageVisual(Boolean(item.validar ?? false))]" :key="`validar-detail-${item.idABCConfigMapeoLinea}`">
                <div class="inline-flex items-center justify-center w-28 gap-2 px-2.5 py-1 mt-2 rounded-lg border text-[11px] font-semibold" :class="stage.containerClass">
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
                  <span>{{ stage.label }}</span>
                </div>
              </template>
            </div>
            <div class="bg-slate-50 rounded-lg p-2 border border-slate-200 flex flex-col items-start">
              <span class="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Enviar</span>
              <template v-for="stage in [getMapeoStageVisual(Boolean((item as any).enviar ?? (item as any).envio ?? false))]" :key="`enviar-detail-${item.idABCConfigMapeoLinea}`">
                <div class="inline-flex items-center justify-center w-28 gap-2 px-2.5 py-1 mt-2 rounded-lg border text-[11px] font-semibold" :class="stage.containerClass">
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
                  <span>{{ stage.label }}</span>
                </div>
              </template>
            </div>
          </div>

          <div class="bg-slate-50 rounded-lg p-2 border border-slate-200">
            <span class="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Porcentaje de Error permitido</span>
            <p class="mt-1 font-semibold text-slate-700">
              {{ item.porcentajeError === null || item.porcentajeError === undefined ? '-' : `${item.porcentajeError}%` }}
            </p>
          </div>
          
          <div class="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div class="bg-slate-50 rounded-lg p-2 border border-slate-200 flex flex-col">
              <span class="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Dictaminar</span>
              <template v-for="dictaminarStage in [getDictaminarVisual(Boolean(item.dictaminar ?? item.bolDictaminacion ?? false))]" :key="`dictaminar-detail-${item.idABCConfigMapeoLinea}`">
                <div class="inline-flex items-center justify-center w-28 gap-2 px-2.5 py-1 mt-2 rounded-lg border text-[11px] font-semibold" :class="dictaminarStage.containerClass">
                  <span class="h-5 w-5 rounded-full inline-flex items-center justify-center" :class="dictaminarStage.iconWrapClass">
                    <svg v-if="dictaminarStage.configured" class="w-3 h-3" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fill-rule="evenodd" d="M16.704 5.29a1 1 0 010 1.414l-7.25 7.25a1 1 0 01-1.414 0l-3-3a1 1 0 111.414-1.414l2.293 2.293 6.543-6.543a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                    <svg v-else class="w-3 h-3" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
                      <circle cx="10" cy="10" r="6.5"></circle>
                      <path d="M10 6.7V10.3"></path>
                      <circle cx="10" cy="13.3" r="0.8" fill="currentColor" stroke="none"></circle>
                    </svg>
                  </span>
                  <span>{{ dictaminarStage.label }}</span>
                </div>
              </template>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div class="bg-slate-50 rounded-lg p-2 border border-slate-200">
              <span class="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Creado</span>
              <p class="mt-1 text-slate-600">{{ formatTimestamp(item.fechaCreacion) }}</p>
            </div>
            <div class="bg-slate-50 rounded-lg p-2 border border-slate-200">
              <span class="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Modificado</span>
              <p class="mt-1 text-slate-600">{{ formatTimestamp(item.fechaUltimaModificacion) }}</p>
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
