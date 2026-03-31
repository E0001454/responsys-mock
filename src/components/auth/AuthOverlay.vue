<script setup lang="ts">
import { computed } from 'vue'
import { CheckCircle } from 'lucide-vue-next'

const props = defineProps<{
  state: 'logging-in' | 'logging-out' | 'success' | null
}>()

const isVisible = computed(() => props.state !== null)

const title = computed(() => {
  if (props.state === 'logging-in') return 'Iniciando sesión...'
  if (props.state === 'logging-out') return 'Cerrando sesión...'
  if (props.state === 'success') return '¡Sesión iniciada exitosamente!'
  return ''
})

const subtitle = computed(() => {
  if (props.state === 'logging-in') return 'Redirigiendo a Okta'
  if (props.state === 'logging-out') return 'Saliendo de tu cuenta'
  if (props.state === 'success') return 'Bienvenido al sistema'
  return ''
})
</script>

<template>
  <Transition
    enter-active-class="transition duration-100 ease-out"
    enter-from-class="opacity-0 scale-105"
    enter-to-class="opacity-100 scale-100"
    leave-active-class="transition duration-100 ease-in"
    leave-from-class="opacity-100 scale-100"
    leave-to-class="opacity-0 scale-105"
  >
    <div
      v-if="isVisible"
      class="fixed inset-0 z-[9999] flex items-center justify-center bg-[#00357F]/95 backdrop-blur-md"
    >
      <div class="flex flex-col items-center gap-6 text-white px-8 text-center">

        <div v-if="state === 'logging-in' || state === 'logging-out'" class="relative h-16 w-16">
          <div class="h-16 w-16 rounded-full border-4 border-white/20 border-t-[#FFD100] animate-spin"></div>
        </div>

        <div v-else-if="state === 'success'" class="h-16 w-16 rounded-full bg-[#FFD100] flex items-center justify-center shadow-lg shadow-yellow-400/30 animate-[bounceIn_0.4s_ease-out]">
          <CheckCircle class="w-8 h-8 text-[#00357F]" />
        </div>

        <div>
          <p class="text-xl font-bold tracking-tight">{{ title }}</p>
          <p class="mt-1.5 text-sm text-white/65">{{ subtitle }}</p>
        </div>

        <div v-if="state === 'success'" class="mt-1 h-0.5 w-40 rounded-full overflow-hidden bg-white/20">
          <div class="h-full bg-[#FFD100] animate-[progress_600ms_ease-in-out_forwards]" />
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
@keyframes bounceIn {
  0%   { transform: scale(0.3); opacity: 0; }
  50%  { transform: scale(1.1); }
  70%  { transform: scale(0.95); }
  100% { transform: scale(1); opacity: 1; }
}

@keyframes progress {
  from { width: 0%; }
  to   { width: 100%; }
}
</style>
