<script setup lang="ts">
import SearchableSelect from '@/components/forms/SearchableSelect.vue'
import ModalActionConfirmOverlay from '@/components/shared/ModalActionConfirmOverlay.vue'
import BaseModalActions from '@/components/shared/modal/BaseModalActions.vue'
import BaseModalShell from '@/components/shared/modal/BaseModalShell.vue'
import {
  useMapeoLineaModal,
  type MapeoLineaFormData,
  type UseMapeoLineaModalProps
} from '@/composables/mapeos/linea/useMapeoLineaModal'

interface Emits {
  (e: 'save', data: MapeoLineaFormData): void
  (e: 'close'): void
}

const props = withDefaults(defineProps<UseMapeoLineaModalProps>(), {
  isLoading: false
})

const emit = defineEmits<Emits>()

const {
  formData,
  touchedFields,
  isEditing,
  isDuplicateName,
  showNombreLengthError,
  showDescripcionLengthError,
  showPorcentajeErrorValidation,
  nombreLengthError,
  descripcionLengthError,
  porcentajeErrorValidationMessage,
  showActionConfirm,
  confirmTitle,
  confirmMessage,
  confirmText,
  confirmCancelText,
  restoreInitialInformation,
  requestCancel,
  handleSave,
  confirmAction,
  closeActionConfirm
} = useMapeoLineaModal(props, emit)
</script>
<template>
  <BaseModalShell
    :show="show"
    :title="mode === 'add' ? 'Nuevo Registro' : 'Editar Registro'"
    :mobile-bottom-sheet="true"
    max-width-class="max-w-2xl max-[640px]:max-w-none"
    panel-class="rounded-2xl max-[640px]:rounded-t-2xl max-[640px]:rounded-b-none"
    body-class="p-3 sm:p-4 overflow-y-auto custom-scrollbar bg-slate-50 flex-1 min-h-0"
    @close="requestCancel"
  >
    <template #body>
      <div class="bg-white p-3 sm:p-5 rounded-xl shadow-sm border border-gray-200 space-y-4 sm:space-y-5">
          <div>
            <label for="field-linea" class="block text-[10px] font-bold text-gray-500 uppercase mb-1">
              Linea de negocio <span class="text-red-500 ml-1">*</span>
            </label>
            <SearchableSelect
              :model-value="formData.idABCCatLineaNegocio ?? null"
              @update:model-value="(v) => (formData.idABCCatLineaNegocio = Number(v))"
              :options="lineasDisponibles"
              placeholder="Seleccione una opcion"
              :disabled="isEditing"
              :required="true"
            />
          </div>

          <div>
            <label for="field-nombre" class="block text-[10px] font-bold text-gray-500 uppercase mb-1">
              Nombre <span class="text-red-500 ml-1">*</span>
            </label>
            <input
              id="field-nombre"
              v-model="formData.nombre"
              placeholder="Escribe aqui..."
              type="text"
              minlength="3"
              maxlength="30"
              required
              class="w-full px-4 py-2.5 border rounded-lg text-gray-700 text-sm focus:ring-2 focus:ring-[#00357F] focus:border-[#00357F] transition-shadow outline-none placeholder-gray-400 bg-gray-50"
              :class="(isDuplicateName || showNombreLengthError) ? 'border-red-400 focus:ring-red-200 focus:border-red-400' : 'border-gray-300'"
              @blur="touchedFields.nombre = true"
            />
            <p v-if="isDuplicateName" class="text-xs text-red-500 mt-1">Ya existe un mapeo con este nombre.</p>
            <p v-else-if="showNombreLengthError" class="text-xs text-red-500 mt-1">{{ nombreLengthError }}</p>
          </div>

          <div>
            <label for="field-descripcion" class="block text-[10px] font-bold text-gray-500 uppercase mb-1">
              Descripcion <span class="text-red-500 ml-1">*</span>
            </label>
            <textarea
              id="field-descripcion"
              v-model="formData.descripcion"
              placeholder="Escribe aqui..."
              minlength="3"
              maxlength="100"
              class="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-700 text-sm focus:ring-2 focus:ring-[#00357F] focus:border-[#00357F] transition-shadow outline-none placeholder-gray-400 resize-none"
              :class="showDescripcionLengthError ? 'border-red-400 focus:ring-red-200 focus:border-red-400' : 'border-gray-300'"
              required
              rows="3"
              @blur="touchedFields.descripcion = true"
            />
            <p v-if="showDescripcionLengthError" class="text-xs text-red-500 mt-1">{{ descripcionLengthError }}</p>
          </div>

          <div class="flex flex-wrap gap-3 sm:gap-4 items-center">
            <label class="flex items-center gap-2">
              <input type="checkbox" v-model="formData.validar" class="w-4 h-4" />
              <span class="text-sm font-medium text-gray-700">Validar</span>
            </label>

            <label class="flex items-center gap-2">
              <input type="checkbox" v-model="formData.enviar" class="w-4 h-4" />
              <span class="text-sm font-medium text-gray-700">Enviar</span>
            </label>
          </div>

          <div>
            <label for="field-porcentaje-error" class="block text-[10px] font-bold text-gray-500 uppercase mb-1">
              Porcentaje de error permitido
            </label>
            <input
              id="field-porcentaje-error"
              v-model.number="formData.porcentajeError"
              type="number"
              min="0"
              max="100"
              step="1"
              placeholder="0 - 100"
              class="w-full px-4 py-2.5 border rounded-lg text-gray-700 text-sm focus:ring-2 focus:ring-[#00357F] focus:border-[#00357F] transition-shadow outline-none placeholder-gray-400 bg-gray-50"
              :class="showPorcentajeErrorValidation ? 'border-red-400 focus:ring-red-200 focus:border-red-400' : 'border-gray-300'"
              @blur="touchedFields.porcentajeError = true"
            />
            <p v-if="showPorcentajeErrorValidation" class="text-xs text-red-500 mt-1">{{ porcentajeErrorValidationMessage }}</p>
          </div>
          
          <label class="inline-flex items-center gap-2 mt-1">
            <input type="checkbox" v-model="formData.dictaminar" class="w-4 h-4" />
            <span class="text-sm font-medium text-gray-700">Dictaminar</span>
          </label>
          

          <div v-if="mode === 'edit'" class="flex justify-end">
            <button
              type="button"
              title="Restaurar información"
              aria-label="Restaurar información"
              class="group relative h-[42px] w-[42px] inline-flex items-center justify-center rounded-lg text-slate-500 bg-white border border-slate-200 hover:text-[#00357F] hover:border-[#00357F]/30 hover:bg-slate-50 transition disabled:opacity-40 disabled:cursor-not-allowed"
              :disabled="isLoading || showActionConfirm"
              @click="restoreInitialInformation"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h5M20 20v-5h-5M19 9a7 7 0 00-12-3M5 15a7 7 0 0012 3" />
              </svg>
              <span class="pointer-events-none absolute right-0 -top-9 whitespace-nowrap rounded-md bg-[#00357F] px-2 py-1 text-[11px] font-semibold text-white opacity-0 shadow-sm transition-opacity duration-150 group-hover:opacity-100">Restaurar información</span>
            </button>
          </div>
        </div>
    </template>

    <template #footer>
      <BaseModalActions
        :loading="isLoading"
        :disabled-cancel="Boolean(isLoading || showActionConfirm)"
        :disabled-confirm="Boolean(isLoading || showActionConfirm)"
        @cancel="requestCancel"
        @confirm="handleSave"
      />
    </template>

    <template #overlay>
      <ModalActionConfirmOverlay
        :show="showActionConfirm"
        :title="confirmTitle"
        :message="confirmMessage"
        :confirm-text="confirmText"
        :cancel-text="confirmCancelText"
        :is-loading="isLoading"
        @confirm="confirmAction"
        @cancel="closeActionConfirm"
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
