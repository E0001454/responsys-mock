<script setup lang="ts">
import BaseModalShell from '@/components/shared/modal/BaseModalShell.vue'
import { LogOut } from 'lucide-vue-next'

defineProps<{ modelValue: boolean }>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'confirm'): void
}>()

function cancel() {
  emit('update:modelValue', false)
}

function confirm() {
  emit('confirm')
}
</script>

<template>
  <BaseModalShell
    :show="modelValue"
    max-width-class="max-w-md"
    z-index-class="z-[70]"
    panel-class="rounded-2xl shadow-2xl"
    body-class="px-5 py-5 bg-white"
    footer-class="px-5 py-4 border-t border-gray-100 bg-white"
    :show-close-button="false"
    :close-on-backdrop="true"
    @close="cancel"
  >
    <template #header>
      <div class="px-5 py-3 bg-[#00357F] border-b border-white/10 flex justify-between items-center shrink-0 rounded-t-2xl">
        <h3 class="text-base font-semibold text-white/95 flex items-center gap-2 tracking-wide">
          Cerrar sesión
        </h3>
        <button
          type="button"
          class="h-8 w-8 inline-flex items-center justify-center rounded-md text-white/90 hover:bg-white/15 transition-colors"
          @click="cancel"
        >
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>
    </template>

    <template #body>
      <p class="text-sm leading-relaxed text-gray-600">
        ¿Estás seguro de que deseas cerrar sesión? Deberás volver a autenticarte para acceder al sistema.
      </p>
    </template>

    <template #footer>
      <div class="flex items-center justify-end gap-3">
        <button
          type="button"
          class="px-5 py-2.5 text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
          @click="cancel"
        >
          Cancelar
        </button>
        <button
          type="button"
          class="px-5 py-2.5 text-sm font-bold text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-300 flex items-center gap-2 shadow-md"
          @click="confirm"
        >
          <LogOut class="w-4 h-4" />
          Cerrar sesión
        </button>
      </div>
    </template>
  </BaseModalShell>
</template>