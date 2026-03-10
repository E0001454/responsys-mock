<script setup lang="ts">
import { ref, watch, nextTick, onBeforeUnmount, onMounted } from 'vue'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{
  (e: 'search', query: string): void
  (e: 'toggle'): void
}>()

const query = ref('')
const rootRef = ref<HTMLElement | null>(null)
const panelRef = ref<HTMLElement | null>(null)
const inputRef = ref<HTMLInputElement | null>(null)
const panelAlign = ref<'left' | 'right'>('left')
const isMobileViewport = ref(false)

function updateViewport() {
  if (typeof window === 'undefined') {
    isMobileViewport.value = false
    return
  }
  isMobileViewport.value = window.innerWidth < 640
}

function resolvePanelAlignment() {
  const root = rootRef.value
  if (!root) return

  const rect = root.getBoundingClientRect()
  const panelWidth = panelRef.value?.offsetWidth ?? Math.min(window.innerWidth * 0.92, 608)
  const spaceRight = window.innerWidth - rect.left - 8
  const spaceLeft = rect.right - 8

  if (panelWidth <= spaceRight) {
    panelAlign.value = 'left'
    return
  }
  if (panelWidth <= spaceLeft) {
    panelAlign.value = 'right'
    return
  }
  panelAlign.value = spaceRight >= spaceLeft ? 'left' : 'right'
}

function onWindowChange() {
  updateViewport()
  if (props.open) resolvePanelAlignment()
}

watch(query, (v) => {
  if (v === '') {
    emit('search', '')
  }
})

watch(() => props.open, async (v) => {
  if (v) {
    await nextTick()
    inputRef.value?.focus()
    resolvePanelAlignment()
  }
})

onMounted(() => {
  updateViewport()
  window.addEventListener('resize', onWindowChange)
  window.addEventListener('scroll', onWindowChange, true)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', onWindowChange)
  window.removeEventListener('scroll', onWindowChange, true)
})

const submit = () => {
  const normalized = query.value.trim()
  try {
    emit('search', normalized)
  } finally {
    emit('toggle')
  }
}
</script>

<template>
  <template v-if="props.open">
    <div
      v-if="isMobileViewport"
      class="fixed inset-0 z-[75] bg-black/45 px-3 pt-20 pb-4"
      @click.self="emit('toggle')"
    >
      <div ref="panelRef" class="mx-auto w-full max-w-md bg-white border border-slate-200 rounded-xl shadow-xl p-3">
        <div class="mb-2 flex items-center justify-between">
          <p class="text-xs font-semibold text-slate-500 uppercase tracking-wide">Buscar en tabla</p>
          <button
            type="button"
            class="h-8 w-8 inline-flex items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:text-[#00357F] hover:bg-slate-50"
            aria-label="Cerrar búsqueda"
            title="Cerrar"
            @click="emit('toggle')"
          >
            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="space-y-2">
          <input
            ref="inputRef"
            v-model="query"
            @keydown.enter.prevent="submit"
            class="w-full px-3 py-2 border rounded text-sm font-medium"
            placeholder="Buscar nombre de ingesta..."
          />
          <div class="flex gap-2">
            <button type="button" @click="submit" class="px-3 py-2 bg-[#00357F] text-white rounded text-sm font-medium">Buscar</button>
            <button type="button" @click="() => { query = ''; emit('search', '') }" :disabled="!query" class="px-3 py-2 bg-gray-200 text-slate-700 rounded text-sm font-medium disabled:opacity-50">Limpiar</button>
          </div>
        </div>
      </div>
    </div>

    <div
      v-else
      ref="rootRef"
      class="absolute top-full mt-2 z-[35]"
      :class="panelAlign === 'right' ? 'right-0' : 'left-0'"
    >
      <div ref="panelRef" class="bg-white border border-slate-200 rounded shadow-md p-3 w-[min(92vw,38rem)]">
        <div class="flex gap-2">
        <input
          ref="inputRef"
          v-model="query"
          @keydown.enter.prevent="submit"
          class="flex-1 px-3 py-2 border rounded text-sm font-medium"
          placeholder="Buscar nombre de ingesta..."
        />
        <button type="button" @click="submit" class="px-3 py-2 bg-[#00357F] text-white rounded text-sm font-medium">Buscar</button>
        <button type="button" @click="() => { query = ''; emit('search', '') }" :disabled="!query" class="px-3 py-2 bg-gray-200 text-slate-700 rounded text-sm font-medium disabled:opacity-50">Limpiar</button>
        </div>
      </div>
    </div>
  </template>
</template>
