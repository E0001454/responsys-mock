<script setup lang="ts">
interface Props {
  show: boolean
  title?: string
  maxWidthClass?: string
  zIndexClass?: string
  panelClass?: string
  overlayClass?: string
  mobileBottomSheet?: boolean
  closeOnBackdrop?: boolean
  showCloseButton?: boolean
  bodyClass?: string
  headerClass?: string
  footerClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  maxWidthClass: 'max-w-2xl',
  zIndexClass: 'z-[60]',
  panelClass: 'rounded-2xl shadow-2xl',
  overlayClass: 'bg-black/60 backdrop-blur-sm',
  mobileBottomSheet: false,
  closeOnBackdrop: true,
  showCloseButton: true,
  bodyClass: 'p-4 overflow-y-auto custom-scrollbar bg-slate-50 flex-1 min-h-0',
  headerClass: 'px-5 py-3 bg-[#00357F] border-b border-white/10 flex justify-between items-center shrink-0',
  footerClass: 'shrink-0 p-4 border-t border-gray-100 bg-white'
})

const emit = defineEmits<{
  (e: 'close'): void
}>()

const onBackdropClick = () => {
  if (!props.closeOnBackdrop) return
  emit('close')
}

const onClose = () => emit('close')
</script>

<template>
  <Transition name="modal-overlay">
    <div
      v-if="show"
      data-app-modal="true"
      class="fixed inset-0 flex transition-opacity"
      :class="[
        zIndexClass,
        overlayClass,
        mobileBottomSheet ? 'items-end justify-center p-0 pb-2 sm:items-center sm:p-4' : 'items-center justify-center p-4'
      ]"
      @click.self="onBackdropClick"
    >
      <Transition :name="mobileBottomSheet ? 'modal-sheet' : 'modal-panel'" appear>
        <div
          v-if="show"
          class="relative bg-white w-full overflow-hidden flex flex-col"
          :class="[maxWidthClass, panelClass, mobileBottomSheet ? 'min-h-[85dvh] max-h-[90dvh] sm:min-h-0 sm:max-h-[90vh]' : 'max-h-[90vh]']"
        >
      <slot name="header" :close="onClose">
        <div :class="headerClass">
          <h3 class="text-base font-semibold text-white/95 flex items-center gap-2 tracking-wide">
            {{ title }}
          </h3>
          <button
            v-if="showCloseButton"
            type="button"
            class="h-8 w-8 inline-flex items-center justify-center rounded-md text-white/90 hover:bg-white/15 transition-colors"
            @click="onClose"
          >
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
      </slot>

      <div :class="bodyClass">
        <slot name="body">
          <slot />
        </slot>
      </div>

      <div v-if="$slots.footer" :class="footerClass">
        <slot name="footer" :close="onClose" />
      </div>
        </div>
      </Transition>

      <slot name="overlay" :close="onClose" />
    </div>
  </Transition>
</template>

<style scoped>
.modal-overlay-enter-active,
.modal-overlay-leave-active {
  transition: opacity 180ms ease;
}

.modal-overlay-enter-from,
.modal-overlay-leave-to {
  opacity: 0;
}

.modal-panel-enter-active,
.modal-panel-leave-active {
  transition: transform 180ms ease, opacity 180ms ease;
}

.modal-panel-enter-from,
.modal-panel-leave-to {
  opacity: 0;
  transform: scale(0.98);
}

.modal-sheet-enter-active,
.modal-sheet-leave-active {
  transition: transform 260ms cubic-bezier(0.2, 0.8, 0.2, 1), opacity 220ms ease;
}

.modal-sheet-enter-from,
.modal-sheet-leave-to {
  opacity: 0.98;
  transform: translateY(100%);
}
</style>
