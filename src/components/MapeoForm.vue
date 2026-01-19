<script setup lang="ts">
import { ref, watch } from 'vue'
import type { FieldsConfig } from '../types/mapeo'

interface Props {
  title: string
  fieldsConfig: FieldsConfig
  initialData?: Record<string, any>
  isLoading?: boolean
}

interface Emits {
  (e: 'save', data: Record<string, any>): void
  (e: 'close'): void
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false
})

const emit = defineEmits<Emits>()

const formData = ref<Record<string, any>>(initializeFormData())

watch(() => props.initialData, () => {
  formData.value = initializeFormData()
})

function initializeFormData() {
  if (props.initialData) {
    return { ...props.initialData }
  }

  const data: Record<string, any> = {}
  Object.keys(props.fieldsConfig).forEach((key) => {
    const config = props.fieldsConfig[key]
    if (config && config.type === 'toggle') {
      data[key] = 0
    } else {
      data[key] = ''
    }
  })
  return data
}

function handleSave() {
  emit('save', formData.value)
}

function capitalize(str: string) {
  return str
    .replace(/_/g, ' ')
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function getFieldType(config: FieldsConfig[keyof FieldsConfig]) {
  return config?.type || 'text'
}
</script>

<template>
  <div class="modal-overlay">
    <div class="modal-content">
      <div class="modal-header">
        <h3>{{ title }}</h3>
        <button
          class="close-btn"
          @click="$emit('close')"
          :disabled="isLoading"
        >
          ×
        </button>
      </div>

      <div class="modal-body">
        <form @submit.prevent="handleSave">
          <div
            v-for="(fieldConfig, fieldName) in fieldsConfig"
            :key="fieldName"
            class="form-group"
          >
            <label :for="`field-${fieldName}`" class="form-label">
              {{ capitalize(fieldName) }}
              <span v-if="fieldConfig.required" class="required">*</span>
            </label>

            <select
              v-if="getFieldType(fieldConfig) === 'select'"
              :id="`field-${fieldName}`"
              v-model="formData[fieldName]"
              class="form-control"
              :required="fieldConfig.required"
            >
              <option value="">
                {{ fieldConfig.placeholder || 'Seleccione una opción' }}
              </option>
              <option
                v-for="opt in fieldConfig.options"
                :key="typeof opt === 'string' ? opt : opt.value"
                :value="typeof opt === 'string' ? opt : opt.value"
              >
                {{ typeof opt === 'string' ? opt : opt.label }}
              </option>
            </select>

            <textarea
              v-else-if="getFieldType(fieldConfig) === 'textarea'"
              :id="`field-${fieldName}`"
              v-model="formData[fieldName]"
              class="form-control textarea"
              :placeholder="fieldConfig.placeholder"
              :required="fieldConfig.required"
              :rows="fieldConfig.rows || 3"
            />

            <div
              v-else-if="getFieldType(fieldConfig) === 'toggle'"
              class="toggle-switch"
            >
              <input
                :id="`field-${fieldName}`"
                v-model="formData[fieldName]"
                type="checkbox"
                class="toggle-checkbox"
                :true-value="1"
                :false-value="0"
              />
              <label :for="`field-${fieldName}`" class="toggle-label">
                <span class="toggle-inner">
                  {{ formData[fieldName] === 1 ? 'Activo' : 'Inactivo' }}
                </span>
              </label>
            </div>

            <input
              v-else
              :id="`field-${fieldName}`"
              v-model="formData[fieldName]"
              :type="getFieldType(fieldConfig)"
              class="form-control"
              :placeholder="fieldConfig.placeholder"
              :required="fieldConfig.required"
            />
          </div>

          <div class="modal-footer">
            <button
              type="button"
              class="btn-cancel"
              @click="$emit('close')"
              :disabled="isLoading"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="btn-save"
              :disabled="isLoading"
            >
              {{ isLoading ? 'Guardando...' : 'Guardar' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.3rem;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #999;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: #333;
}

.close-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.modal-body {
  padding: 20px;
}

.form-group {
  margin-bottom: 15px;
}

.form-label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  color: #333;
  font-size: 0.9rem;
}

.required {
  color: #e74c3c;
  margin-left: 3px;
}

.form-control {
  width: 100%;
  padding: 10px 0;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  font-family: inherit;
}

.form-control:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.1);
}

.form-control:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.textarea {
  resize: vertical;
  min-height: 60px;
}

/* Toggle Switch */
.toggle-switch {
  display: flex;
  align-items: center;
}

.toggle-checkbox {
  display: none;
}

.toggle-label {
  position: relative;
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
}

.toggle-inner {
  display: inline-block;
  width: 50px;
  height: 26px;
  background: #ddd;
  border-radius: 13px;
  position: relative;
  transition: all 0.3s;
  padding: 0 5px;
  line-height: 26px;
  font-size: 0.75rem;
  font-weight: 600;
  color: #666;
}

.toggle-checkbox:checked + .toggle-label .toggle-inner {
  background: #27ae60;
  color: white;
}

.modal-footer {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  padding: 20px;
  border-top: 1px solid #eee;
}

.btn-cancel,
.btn-save {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s;
}

.btn-cancel {
  background: #ecf0f1;
  color: #333;
}

.btn-cancel:hover {
  background: #bdc3c7;
}

.btn-cancel:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-save {
  background: #27ae60;
  color: white;
}

.btn-save:hover {
  background: #229954;
}

.btn-save:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>