<script setup>
import { ref, computed } from 'vue'
import CrudTable from '../components/CrudTable.vue'

const activeTab = ref('general')

// --- DATOS MOCK PARA LOS SELECTS ---
const mockLineas = ['Línea Crédito', 'Línea Ahorro', 'Seguros', 'Inversiones']
const mockCampanas = ['Campaña Navidad', 'Campaña Verano', 'Black Friday', 'Promo Bienvenida']

// --- Pestaña 1: Lineas de Negocio ---
const headersGeneral = ['id_linea', 'nombre']
const dataGeneral = [
  { id_linea: '0001', nombre: 'Bienvenida' }, // Ojo: en tu ejemplo nombre era "Bienvenida"
  { id_linea: '0002', nombre: 'Campaña 1' },
  { id_linea: '0003', nombre: 'Campaña 2' }
]

// --- Pestaña 2: Campañas ---
const headersDetalle = ['id_linea', 'id_campaña', 'nombre']
const dataDetalle = [
  { id_linea: 'Línea Crédito', id_campaña: '0001', nombre: 'Bienvenida' },
  { id_linea: 'Seguros', id_campaña: '0001', nombre: 'Campaña 1' },
  { id_linea: 'Inversiones', id_campaña: '0001', nombre: 'Campaña 2' }
]

const currentInfo = computed(() => {
  if (activeTab.value === 'general') {
    return {
      titulo: '1.1 Configurar Mapeo - Lineas de negocios',
      headers: headersGeneral,
      data: dataGeneral,
      // Configuración de campos para el Modal
      config: {
        // En Lineas de negocio, 'nombre' será un select con las Lineas Mock
        nombre: { type: 'select', options: mockLineas }
      }
    }
  } else {
    return {
      titulo: '1.1 Configurar Mapeo - Campañas',
      headers: headersDetalle,
      data: dataDetalle,
      // Configuración de campos para el Modal
      config: {
        // En Campañas, seleccionas a qué Linea pertenece
        id_linea: { type: 'select', options: mockLineas },
        // Y seleccionas el nombre de la Campaña
        nombre: { type: 'select', options: mockCampanas }
      }
    }
  }
})
</script>

<template>
  <div class="mapeo-container">
    
    <div class="tabs">
      <button 
        :class="{ active: activeTab === 'general' }" 
        @click="activeTab = 'general'"
      >
        Lineas de negocio
      </button>
      <button 
        :class="{ active: activeTab === 'detalle' }" 
        @click="activeTab = 'detalle'"
      >
        Campañas
      </button>
    </div>

    <CrudTable 
      :titulo="currentInfo.titulo" 
      :columnas="currentInfo.headers" 
      :datos="currentInfo.data" 
      :campos-config="currentInfo.config"
    />
    
  </div>
</template>

<style scoped>
.mapeo-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Estilos de las pestañas */
.tabs {
  display: flex;
  gap: 10px;
  border-bottom: 2px solid #ddd;
  padding-bottom: 5px;
}

.tabs button {
  background: none;
  border: none;
  padding: 10px 20px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  color: #7f8c8d;
  border-bottom: 3px solid transparent;
  transition: all 0.3s ease;
}

.tabs button:hover {
  color: #3498db;
  background-color: rgba(52, 152, 219, 0.05);
}

/* Clase activa para la pestaña seleccionada */
.tabs button.active {
  color: #2c3e50;
  border-bottom: 3px solid #3498db;
  font-weight: bold;
}
</style>