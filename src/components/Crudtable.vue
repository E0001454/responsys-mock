<script setup>
import { ref } from 'vue'

const props = defineProps({
  titulo: String,
  columnas: Array,
  datos: Array,
  camposConfig: {
    type: Object,
    default: () => ({})
  }
})

const showModal = ref(false)
const isEditMode = ref(false)
const formData = ref({})

const openAddModal = () => {
  isEditMode.value = false
  showModal.value = true
  if (props.datos && props.datos.length > 0) {
    const keys = Object.keys(props.datos[0])
    formData.value = keys.reduce((acc, key) => {
      acc[key] = ''
      return acc
    }, {})
  } else {
    formData.value = {} 
  }
}

const openEditModal = (item) => {
  isEditMode.value = true
  showModal.value = true
  formData.value = { ...item }
}

const handleSave = () => {
  alert(`Datos ${isEditMode.value ? 'Editados' : 'Guardados'}:\n${JSON.stringify(formData.value, null, 2)}`)
  showModal.value = false
}

const capitalize = (s) => s && s[0].toUpperCase() + s.slice(1)
</script>

<template>
  <div class="crud-container">
    <header class="crud-header">
      <h1>{{ titulo }}</h1>
      <button class="btn-add" @click="openAddModal">+ Nuevo Registro</button>
    </header>

    <table class="crud-table">
      <thead>
        <tr>
          <th v-for="(col, index) in columnas" :key="index">{{ col }}</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in datos" :key="index">
          <td v-for="(value, key) in item" :key="key">
            {{ value }}
          </td>
          <td class="actions">
            <button class="btn-edit" @click="openEditModal(item)">✎</button>
            <button class="btn-delete">🗑</button>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-if="showModal" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ isEditMode ? 'Editar' : 'Nuevo' }}</h3>
          <button class="close-btn" @click="showModal = false">×</button>
        </div>
        
        <div class="modal-body">
          <form @submit.prevent="handleSave">
            <div v-for="(value, key) in formData" :key="key" class="form-group">
              <label>{{ capitalize(key) }}:</label>

              <select 
                v-if="camposConfig[key]?.type === 'select'" 
                v-model="formData[key]" 
                class="form-control"
              >
                <option value="" disabled>Seleccione una opción</option>
                <option 
                  v-for="opt in camposConfig[key].options" 
                  :key="opt" 
                  :value="opt"
                >
                  {{ opt }}
                </option>
              </select>

              <input 
                v-else
                v-model="formData[key]" 
                type="text" 
                class="form-control"
              >
            </div>
            
            <div class="modal-footer">
              <button type="button" class="btn-cancel" @click="showModal = false">Cancelar</button>
              <button type="submit" class="btn-save">Guardar</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

.crud-container {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  position: relative;
}
.crud-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.btn-add {
  background: #27ae60;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 5px;
  cursor: pointer;
}
.crud-table {
  width: 100%;
  border-collapse: collapse;
}
th, td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}
th { background-color: #f8f9fa; font-weight: bold; }
.actions button {
  margin-right: 5px;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 1.2rem;
}
.btn-edit { color: #f39c12; }
.btn-delete { color: #e74c3c; }

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.modal-content {
  background: white;
  padding: 25px;
  border-radius: 10px;
  width: 400px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.3);
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}
.modal-header h3 { margin: 0; color: #2c3e50; }
.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #7f8c8d;
}
.form-group { margin-bottom: 15px; }
.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 600;
  color: #34495e;
}
.form-control {
  width: 100%;
  padding: 8px;
  border: 1px solid #bdc3c7;
  border-radius: 4px;
  box-sizing: border-box;
  background-color: white;
}
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}
.btn-cancel {
  background: #95a5a6;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 4px;
  cursor: pointer;
}
.btn-save {
  background: #3498db;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 4px;
  cursor: pointer;
}
</style>