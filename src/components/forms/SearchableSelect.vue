<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'

interface Option {
	label: string
	value: number | string
	isRequired?: boolean
}

const props = defineProps<{
	modelValue: number | string | null
	options: Option[]
	placeholder?: string
	disabled?: boolean
	required?: boolean
}>()

const emit = defineEmits<{
	(e: 'update:modelValue', value: number | string): void
}>()

const isOpen = ref(false)
const search = ref('')
const rootRef = ref<HTMLElement | null>(null)
const panelRef = ref<HTMLElement | null>(null)
const panelStyle = ref<Record<string, string>>({})
const openUpward = ref(false)
const optionsMaxHeight = ref(240)

const selectedLabel = computed(() =>
	props.options.find(opt => String(opt.value) === String(props.modelValue ?? ''))?.label ?? ''
)

const filteredOptions = computed(() => {
	const term = search.value.trim().toLowerCase()
	if (!term) return props.options
	return props.options.filter(opt => opt.label.toLowerCase().includes(term))
})

function toggleOpen() {
	if (props.disabled) return
	isOpen.value = !isOpen.value
}

function selectOption(option: Option) {
	emit('update:modelValue', option.value)
	isOpen.value = false
}

function updatePanelPosition() {
	if (!rootRef.value || !isOpen.value) return
	const rect = rootRef.value.getBoundingClientRect()
	const viewportHeight = window.innerHeight
	const spaceBelow = viewportHeight - rect.bottom - 12
	const spaceAbove = rect.top - 12
	openUpward.value = spaceBelow < 260 && spaceAbove > spaceBelow
	const availableSpace = openUpward.value ? spaceAbove : spaceBelow
	optionsMaxHeight.value = Math.max(120, Math.min(320, availableSpace - 56))

	panelStyle.value = {
		top: openUpward.value ? `${rect.top - 8}px` : `${rect.bottom + 8}px`,
		left: `${rect.left}px`,
		width: `${rect.width}px`
	}
}

function handleClickOutside(event: MouseEvent) {
	const target = event.target as HTMLElement
	if (rootRef.value?.contains(target) || panelRef.value?.contains(target)) {
		return
	}
	if (!target.closest('.searchable-select')) {
		isOpen.value = false
	}
}

watch(isOpen, async open => {
	if (open) {
		search.value = ''
		await nextTick()
		updatePanelPosition()
	}
})

onMounted(() => {
	document.addEventListener('click', handleClickOutside)
	window.addEventListener('resize', updatePanelPosition)
	window.addEventListener('scroll', updatePanelPosition, true)
})

onUnmounted(() => {
	document.removeEventListener('click', handleClickOutside)
	window.removeEventListener('resize', updatePanelPosition)
	window.removeEventListener('scroll', updatePanelPosition, true)
})
</script>

<template>
	<div ref="rootRef" class="relative searchable-select">
		<button
			type="button"
			class="relative w-full flex items-center pl-4 pr-10 py-2.5 border border-gray-300 rounded-lg text-gray-700 text-sm focus:ring-2 focus:ring-[#00357F] focus:border-[#00357F] transition-shadow appearance-none outline-none"
			:class="disabled ? 'bg-gray-100 cursor-not-allowed opacity-70' : 'bg-gray-50 cursor-pointer'"
			:disabled="disabled"
			@click.stop="toggleOpen"
		>
			<span class="truncate">
				{{ selectedLabel || placeholder || 'Seleccione una opción' }}
			</span>
			<span class="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none">
				<svg class="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
				</svg>
			</span>
		</button>
	</div>

	<Teleport to="body">
		<div
			v-if="isOpen"
			ref="panelRef"
			class="fixed bg-white rounded-xl shadow-xl ring-1 ring-black/5 z-[9999] overflow-hidden"
			:class="openUpward ? '-translate-y-full' : ''"
			:style="panelStyle"
		>
			<div class="p-2 border-b border-slate-100">
				<input
					v-model="search"
					type="text"
					placeholder="Buscar..."
					class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#00357F] focus:border-[#00357F] outline-none"
				/>
			</div>
			<div class="overflow-y-auto" :style="{ maxHeight: `${optionsMaxHeight}px` }">
				<button
					v-for="opt in filteredOptions"
					:key="opt.value"
					type="button"
					class="w-full text-left px-4 py-2 text-sm transition-colors flex items-center justify-between gap-2"
					:class="opt.isRequired ? 'bg-amber-50/60 text-amber-800 hover:bg-amber-100/60' : 'hover:bg-blue-50'"
					@click.stop="selectOption(opt)"
				>
					<span class="truncate">{{ opt.label }}</span>
					<span v-if="opt.isRequired" class="shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-700 border border-amber-200">Obligatoria</span>
				</button>
				<div v-if="filteredOptions.length === 0" class="px-4 py-3 text-xs text-slate-400">
					Sin resultados
				</div>
			</div>
		</div>
	</Teleport>
</template>