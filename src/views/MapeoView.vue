<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { mapeoService } from '../services/mapeoService'
import type { MapeoData, FieldsConfig } from '../types/mapeo'
import MapeoForm from '../components/MapeoForm.vue'

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

const lineaId = ref<number>(0)
const campanaId = ref<number>(0)

const mapeos = ref<MapeoData[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)

const showModal = ref(false)
const modalMode = ref<'add' | 'edit'>('add')
const selectedItem = ref<MapeoData | null>(null)

const headers = ['id', 'nombre', 'descripcion', 'status']

const fieldsLinea: FieldsConfig = {
  nombre: { type: 'text', required: true },
  descripcion: { type: 'textarea', required: true, rows: 3 }
}

const fieldsCampana: FieldsConfig = {
  nombre: { type: 'text', required: true },
  descripcion: { type: 'textarea', required: true, rows: 3 }
}

const fieldsConfig = computed(() =>
  activeTab.value === 'linea' ? fieldsLinea : fieldsCampana
)

const titulo = computed(() =>
  activeTab.value === 'linea'
    ? 'Mapeos por Línea'
    : 'Mapeos por Línea y Campaña'
)

async function fetchMapeos() {
  isLoading.value = true
  error.value = null
  try {
    mapeos.value =
      activeTab.value === 'linea'
        ? await mapeoService.getMapeos(lineaId.value)
        : await mapeoService.getMapeos(lineaId.value, campanaId.value)
  } catch (e: any) {
    error.value = e.message
  } finally {
    isLoading.value = false
  }
}

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
    if (modalMode.value === 'add') {
      await mapeoService.createMapeo(
        lineaId.value,
        {
          mapeo: {
            nombre: formData.nombre,
            descripcion: formData.descripcion
          },
          idUsuario: 1
        },
        activeTab.value === 'campana' ? campanaId.value : undefined
      )
    } else if (selectedItem.value) {
      await mapeoService.updateMapeo({
        mapeos: {
          id: selectedItem.value.id!,
          id_linea: lineaId.value,
          id_campana:
            activeTab.value === 'campana' ? campanaId.value : undefined,
          nombre: formData.nombre,
          descripcion: formData.descripcion
        },
        idUsuario: 1
      })
    }
    showModal.value = false
    await fetchMapeos()
  } catch (e: any) {
    error.value = e.message
  } finally {
    isLoading.value = false
  }
}

async function handleDelete(item: MapeoData) {
  if(!confirm('¿Estás seguro de eliminar este elemento?')) return; // Agregué una confirmación visual simple
  isLoading.value = true
  try {
    await mapeoService.deleteMapeo(
      lineaId.value,
      item.id!,
      activeTab.value === 'campana' ? campanaId.value : undefined
    )
    await fetchMapeos()
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
      if (item.status === 1) {
        await mapeoService.patchDesactivarMapeoLinea(Number(item.id), 1)
      } else {
        await mapeoService.patchActivarMapeoLinea(Number(item.id), 1)
      }
    } else {
      if (item.status === 1) {
        await mapeoService.patchDesactivarMapeoCampana(Number(item.id), 1)
      } else {
        await mapeoService.patchActivarMapeoCampana(Number(item.id), 1)
      }
    }

    await fetchMapeos()
  } catch (e: any) {
    error.value = e.message
  } finally {
    isLoading.value = false
  }
}





watch([lineaId, campanaId, activeTab], fetchMapeos)
onMounted(fetchMapeos)
</script>

<template>
  <div class="page-container">
    <div class="card">
      
      <div class="tabs-container">
        <button
          v-for="t in tabs"
          :key="t"
          @click="activeTab = t"
          class="tab-btn"
          :class="{ active: activeTab === t }"
        >
          {{ t === 'linea' ? 'Linea de negocio' : 'Campaña' }}
        </button>
      </div>

      <div class="filters-bar">
        <div class="select-group">
          <label>Línea de negocio:</label>
          <select v-model="lineaId" class="styled-select">
            <option v-for="l in lineasDisponibles" :key="l.value" :value="l.value">
              {{ l.label }}
            </option>
          </select>
        </div>

        <div v-if="activeTab === 'campana'" class="select-group">
          <label>Campaña:</label>
          <select v-model="campanaId" class="styled-select">
            <option
              v-for="c in campanasDisponibles"
              :key="c.value"
              :value="c.value"
            >
              {{ c.label }}
            </option>
          </select>
        </div>
      </div>

      <div v-if="error" class="alert error">{{ error }}</div>
      
      <div v-if="isLoading" class="loading-state">
        <div class="spinner"></div>
        <p>Cargando datos...</p>
      </div>

      <div v-else>
        <div class="header-actions">
          <h1 class="page-title">{{ titulo }}</h1>
          <button @click="openAddModal" class="btn btn-primary">
            + Nuevo Registro
          </button>
        </div>

        <div class="table-responsive">
          <table v-if="mapeos.length" class="modern-table">
            <thead>
              <tr>
                <th v-for="h in headers" :key="h">{{ h.charAt(0).toUpperCase() + h.slice(1) }}</th>
                <th class="text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="m in mapeos" :key="m.id">
                <td class="id-col">#{{ m.id }}</td>
                <td class="font-bold">{{ m.nombre }}</td>
                <td class="desc-col">{{ m.descripcion }}</td>
               <td>
                  <label class="switch">
                    <input
                      type="checkbox"
                      :checked="m.status === 1"
                      @change="toggleStatus(m)"
                    />
                    <span class="slider"></span>
                  </label>

                </td>


                <td class="text-right actions-col">
                  <button @click="openEditModal(m)" class="btn-icon edit" title="Editar">
                    ✎
                  </button>
                  <button @click="handleDelete(m)" class="btn-icon delete" title="Eliminar">
                    ✕
                  </button>
                </td>
              </tr>
            </tbody>
          </table>

          <div v-else class="empty-state">
            <p>No se encontraron mapeos para esta selección.</p>
          </div>
        </div>
      </div>
    </div>

    <MapeoForm
      v-if="showModal"
      :title="modalMode === 'add' ? 'Nuevo Mapeo' : 'Editar Mapeo'"
      :fields-config="fieldsConfig"
      :initial-data="selectedItem"
      :is-loading="isLoading"
      @save="handleSave"
      @close="showModal = false"
    />
  </div>
</template>
