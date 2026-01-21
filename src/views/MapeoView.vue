<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue'
import { mapeoService } from '../services/mapeoService'
import type { MapeoData, FieldsConfig } from '../types/mapeo'
import MapeoForm from '@/components/MapeoForm.vue'

const tabs = ['linea', 'campana'] as const
const activeTab = ref<typeof tabs[number]>('linea')

const lineasDisponibles = [
  { label: 'Afore', value: 0 },
  { label: 'Sofom', value: 1 },
  { label: 'Pensiones', value: 2 }
]

const campanasDisponibles = [
  { label: 'Campaña 0', value: 0 },
  { label: 'Campaña 1', value: 1 },
  { label: 'Campaña 2', value: 2 }
]

const allMapeos = ref<MapeoData[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)

const openFilter = ref<string | null>(null)

const selectedFilters = reactive({
  lineas: [] as number[],
  campanas: [] as number[],
  status: [] as number[]
})

async function fetchAllMapeos() {
  isLoading.value = true
  error.value = null
  try {
    const data = await mapeoService.getAllMapeos()
    allMapeos.value = data
    
    if (selectedFilters.lineas.length === 0) {
      selectedFilters.lineas = lineasDisponibles.map(x => x.value)
      selectedFilters.campanas = campanasDisponibles.map(x => x.value)
      selectedFilters.status = [0, 1]
    }
  } catch (e: any) {
    error.value = e.message
  } finally {
    isLoading.value = false
  }
}

const filteredMapeos = computed(() => {
  return allMapeos.value.filter(item => {
    const isCampanaItem = item.idABCConfigMapeoCampana !== undefined && item.idABCConfigMapeoCampana !== null

    if (activeTab.value === 'linea' && isCampanaItem) return false
    if (activeTab.value === 'campana' && !isCampanaItem) return false

    const matchCampana = activeTab.value === 'campana' && item.idABCConfigMapeoCampana !== undefined
      ? selectedFilters.campanas.includes(item.idABCConfigMapeoCampana)
      : true

    const matchStatus = item.bolActivo !== undefined
      ? selectedFilters.status.includes(item.bolActivo)
      : true

    return matchCampana && matchStatus
  })
})

const getLineaLabel = (id?: number) => lineasDisponibles.find(x => x.value === id)?.label || 'N/A'
const getCampanaLabel = (id?: number) => campanasDisponibles.find(x => x.value === id)?.label || 'N/A'

const showModal = ref(false)
const modalMode = ref<'add' | 'edit'>('add')
const selectedItem = ref<MapeoData | null>(null)

const fieldsLinea: FieldsConfig = {
  nombre: { type: 'text', required: true },
  linea_negocio: { type: 'select', required: true },
  descripcion: { type: 'textarea', required: true, rows: 3 }
}
const fieldsCampana: FieldsConfig = { ...fieldsLinea }
const fieldsConfig = computed(() => activeTab.value === 'linea' ? fieldsLinea : fieldsCampana)

function openAddModal() {
  modalMode.value = 'add'
  selectedItem.value = null
  showModal.value = true
}

function openEditModal(item: MapeoData) {
  modalMode.value = 'edit'
  selectedItem.value = item
  showModal.value = true
}

async function handleSave(formData: any) {
  isLoading.value = true
  try {
    const lineaId = selectedFilters.lineas[0] || 0
    const campanaId = activeTab.value === 'campana' ? (selectedFilters.campanas[0] || 0) : undefined

    if (modalMode.value === 'add') {
      await mapeoService.createMapeo(
        lineaId,
        {
          mapeo: {
            nombre: formData.nombre,
            descripcion: formData.descripcion
          },
          idABCUsuario: 1
        },
        campanaId
      )
    } else if (selectedItem.value) {
      await mapeoService.updateMapeo({
        mapeos: {
          
          idABCCatLineaNegocio: selectedItem.value.idABCCatLineaNegocio,
          idABCConfigMapeoLinea: selectedItem.value.idABCConfigMapeoLinea,
          nombre: formData.nombre,
          descripcion: formData.descripcion
        },
        idABCUsuario: 1
      })
    }
    showModal.value = false
    await fetchAllMapeos()
  } catch (e: any) {
    error.value = e.message
  } finally {
    isLoading.value = false
  }
}

async function handleDelete(item: MapeoData) {
  if(!confirm('¿Estás seguro de eliminar este elemento?')) return;
  isLoading.value = true
  try {
    await mapeoService.deleteMapeo(
      item.idABCCatLineaNegocio!,
    
      item.idABCConfigMapeoLinea
    )
    await fetchAllMapeos()
  } catch (e: any) {
    error.value = e.message
  } finally {
    isLoading.value = false
  }
}

async function toggleStatus(item: MapeoData) {
  isLoading.value = true
  try {
    if (activeTab.value === 'linea') {
      if (item.bolActivo === 1) {
        await mapeoService.patchDesactivarMapeoLinea(Number(item.idABCConfigMapeoLinea), 1)
      } else {
        await mapeoService.patchActivarMapeoLinea(Number(item.idABCConfigMapeoLinea), 1)
      }
    } else {
      if (item.bolActivo === 1) {
        await mapeoService.patchDesactivarMapeoCampana(Number(item.idABCConfigMapeoLinea), 1)
      } else {
        await mapeoService.patchActivarMapeoCampana(Number(item.idABCConfigMapeoLinea), 1)
      }
    }
    await fetchAllMapeos()
  } catch (e: any) {
    error.value = e.message
  } finally {
    isLoading.value = false
  }
}

const toggleFilterMenu = (column: string) => {
  if (openFilter.value === column) {
    openFilter.value = null
  } else {
    openFilter.value = column
  }
}

onMounted(fetchAllMapeos)
</script>

<template>
  <div class="p-8 bg-gray-50 min-h-screen font-sans" @click.self="openFilter = null">
    <div class="bg-white rounded-2xl shadow-xl border border-blue-100 overflow-visible">
      <div class="flex border-b border-gray-200 ">
        <button
          v-for="t in tabs"
          :key="t"
          @click="activeTab = t"
          class="flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-all duration-300 relative overflow-hidden group cursor-pointer"
          :class="activeTab === t ? 'bg-[#00357F] text-white' : 'bg-gray-50 text-gray-500 hover:bg-blue-50 cursor-pointer'"
        >
          {{ t === 'linea' ? 'Línea de Negocio' : 'Campaña' }}
        </button>
      </div>

      <div class="p-6 md:p-8">
        <div class="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <h1 class="text-2xl font-extrabold text-[#00357F] tracking-tight">
              Listado de Mapeos
              <span class="text-sm font-normal text-gray-500 ml-2">({{ filteredMapeos.length }} registros)</span>
            </h1>
            <button 
              @click="openAddModal" 
              class="flex items-center gap-2 bg-[#FFD100] hover:bg-yellow-400 text-[#00357F] font-bold py-2.5 px-6 rounded-lg shadow-md transition-all cursor-pointer"
            >
              Nuevo Registro
            </button>
        </div>

        <div class="overflow-visible rounded-xl border border-gray-200 shadow-sm min-h-[400px]">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-[#00357F] text-white">
              <tr>
                <th class="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">ID</th>
                
                <th class="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider relative group">
                  <div class="flex items-center gap-2 cursor-pointer" @click.stop="toggleFilterMenu('linea')">
                    <span>Línea</span>
                    <svg class="w-4 h-4 text-blue-200 hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
                  </div>
                  <div v-if="openFilter === 'linea'" class="absolute top-full left-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-50 p-2 text-gray-700">
                    <div class="text-xs font-bold text-gray-400 mb-2 px-2">Filtrar por línea</div>
                    <div v-for="l in lineasDisponibles" :key="l.value" class="flex items-center px-2 py-1 hover:bg-gray-50 rounded">
                      <input type="checkbox" :value="l.value" v-model="selectedFilters.lineas" class="rounded text-[#00357F] focus:ring-[#00357F]">
                      <span class="ml-2 text-sm">{{ l.label }}</span>
                    </div>
                  </div>
                </th>

                <th v-if="activeTab === 'campana'" class="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider relative">
                   <div class="flex items-center gap-2 cursor-pointer" @click.stop="toggleFilterMenu('campana')">
                    <span>Campaña</span>
                    <svg class="w-4 h-4 text-blue-200 hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
                  </div>
                  <div v-if="openFilter === 'campana'" class="absolute top-full left-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-50 p-2 text-gray-700">
                    <div v-for="c in campanasDisponibles" :key="c.value" class="flex items-center px-2 py-1 hover:bg-gray-50 rounded">
                      <input type="checkbox" :value="c.value" v-model="selectedFilters.campanas" class="rounded text-[#00357F] focus:ring-[#00357F]">
                      <span class="ml-2 text-sm">{{ c.label }}</span>
                    </div>
                  </div>
                </th>

                <th class="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Nombre</th>
                <th class="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Descripción</th>
                
                <th class="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider relative">
                   <div class="flex items-center gap-2 cursor-pointer" @click.stop="toggleFilterMenu('status')">
                    <span>Status</span>
                    <svg class="w-4 h-4 text-blue-200 hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
                  </div>
                   <div v-if="openFilter === 'status'" class="absolute top-full right-0 mt-2 w-40 bg-white rounded-lg shadow-xl border border-gray-200 z-50 p-2 text-gray-700">
                    <div class="flex items-center px-2 py-1 hover:bg-gray-50 rounded">
                      <input type="checkbox" :value="1" v-model="selectedFilters.status" class="rounded text-[#00357F]">
                      <span class="ml-2 text-sm">Activado</span>
                    </div>
                    <div class="flex items-center px-2 py-1 hover:bg-gray-50 rounded">
                      <input type="checkbox" :value="0" v-model="selectedFilters.status" class="rounded text-[#00357F]">
                      <span class="ml-2 text-sm">Desactivado</span>
                    </div>
                  </div>
                </th>
                
                <th class="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>

            <tbody class="bg-white divide-y divide-gray-100">
              <tr v-if="isLoading">
                <td colspan="100%" class="py-10 text-center text-blue-800">Cargando datos...</td>
              </tr>
              
              <tr v-else-if="filteredMapeos.length === 0">
                <td colspan="100%" class="py-10 text-center text-gray-500">
                  No hay registros con los filtros seleccionados
                </td>
              </tr>

              <tr v-else v-for="m in filteredMapeos" :key="m.idABCConfigMapeoLinea" class="hover:bg-blue-50/50 transition-colors">
                <td class="px-6 py-4 text-sm text-gray-500">#{{ m.idABCConfigMapeoLinea }}</td>
                
                <td class="px-6 py-4 text-sm text-gray-700 font-medium">
                  {{ getLineaLabel(m.idABCCatLineaNegocio) }}
                </td>

                <td v-if="activeTab === 'campana'" class="px-6 py-4 text-sm text-gray-700">
                  {{ getCampanaLabel(m.idABCConfigMapeoCampana) }}
                </td>

                <td class="px-6 py-4 text-sm font-bold text-[#00357F]">{{ m.nombre }}</td>
                <td class="px-6 py-4 text-sm text-gray-600 truncate max-w-xs" :title="m.descripcion">{{ m.descripcion }}</td>
                
                <td class="px-6 py-4 whitespace-nowrap">
                    <label class="inline-flex items-center gap-2 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        :checked="m.bolActivo === 1" 
                        @change="toggleStatus(m)" 
                        class="sr-only peer"
                      >
                      <span 
                        class="h-2.5 w-2.5 rounded-full transition-colors duration-200"
                        :class="m.bolActivo === 1 ? 'bg-blue-500' : 'bg-red-500'"
                      ></span>
                      <span class="text-sm font-medium text-gray-700 group-hover:text-gray-900 select-none">
                        {{ m.bolActivo === 1 ? 'Activado' : 'Desactivado' }}
                      </span>
                    </label>
                </td>

                <td class="px-6 py-4 whitespace-nowrap text-right">
                   <div class="flex items-center justify-end gap-2">
                      <button @click="openEditModal(m)" class="p-2 text-[#00357F] bg-blue-100/50 rounded-lg hover:bg-[#FFD100] cursor-pointer">
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                      </button>
                      <!-- <button @click="handleDelete(m)" class="p-2 text-red-600 bg-red-100/50 rounded-lg hover:bg-red-500 hover:text-white cursor-pointer">
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button> -->
                   </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    
    <MapeoForm v-if="showModal" :fields-config="fieldsConfig" :initial-data="selectedItem" @save="handleSave" @close="showModal = false" />
  </div>
</template>