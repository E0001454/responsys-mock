<script setup lang="ts">
import { ref } from 'vue'
import ColumnasHeader from '@/components/columnas/ColumnasHeader.vue'
import ColumnaLineaCrud from '@/components/columnas/linea/ColumnaLineaCrud.vue'
import ColumnaCampanaCrud from '@/components/columnas/campana/ColumnaCampanaCrud.vue'

type TabKey = 'linea' | 'campana'

const activeTab = ref<TabKey>('campana')

const lineaRef = ref<InstanceType<typeof ColumnaLineaCrud> | null>(null)
const campanaRef = ref<InstanceType<typeof ColumnaCampanaCrud> | null>(null)

function handleAdd() {
	if (activeTab.value === 'campana') {
		campanaRef.value?.openAdd()
	} else {
		lineaRef.value?.openAdd()
	}
}
</script>

<template>
	<div class="p-3 sm:p-4 lg:p-6 bg-slate-50 min-h-full font-sans text-slate-800">
    <div class="max-w-7xl mx-auto space-y-4">
		<ColumnasHeader
			v-model:activeTab="activeTab"
			@add="handleAdd"
		/>

		<Transition name="tab-fade" mode="out-in" appear>
			<ColumnaCampanaCrud ref="campanaRef" v-if="activeTab === 'campana'" key="columnas-campana" />
			<ColumnaLineaCrud ref="lineaRef" v-else key="columnas-linea" />
		</Transition>
    </div>
  </div>
</template>