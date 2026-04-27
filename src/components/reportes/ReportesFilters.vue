<script setup lang="ts">
import { computed } from 'vue'
import { Search, RotateCcw, FileText, File } from 'lucide-vue-next'
import type { FiltroIndividualCL, FiltroIndividualPET } from '@/types/reportes/reporte'

interface Option {
  label: string
  value: number
}

const props = defineProps<{
  scope: string
  tipo?: string
  idLineaNegocio: number | ''
  idCampana: number | ''
  cl: FiltroIndividualCL
  pet: FiltroIndividualPET
  lineasCatalogo: Option[]
  campanasCatalogo: Option[]
  isLoading: boolean
  exportLoading: boolean
  hasResults: boolean
  formErrors: Record<string, string>
}>()

const emit = defineEmits<{
  (e: 'update:idLineaNegocio', value: number | ''): void
  (e: 'update:idCampana', value: number | ''): void
  (e: 'update-cl', field: keyof FiltroIndividualCL, value: string): void
  (e: 'update-pet', field: keyof FiltroIndividualPET, value: string): void
  (e: 'consultar'): void
  (e: 'clear'): void
  (e: 'export-csv'): void
  (e: 'export-pdf'): void
}>()

function onSelectChange(e: Event, emitFn: (v: number | '') => void) {
  const val = (e.target as HTMLSelectElement).value
  emitFn(val === '' ? '' : Number(val))
}

const todayISO = computed(() => {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${dd}`
})

const inputClass = 'w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:ring-2 focus:ring-[#00357F] focus:border-[#00357F]'
</script>

<template>
  <div class="bg-white border border-slate-200 rounded-xl p-4 space-y-4">

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      <div>
        <label class="block text-xs font-semibold text-slate-600 mb-1">Línea de negocio</label>
        <select :value="idLineaNegocio" @change="onSelectChange($event, v => emit('update:idLineaNegocio', v))" :class="inputClass">
          <option value="">Selecciona una línea</option>
          <option v-for="opt in lineasCatalogo" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
        </select>
        <p v-if="formErrors.idLineaNegocio" class="text-xs text-red-500 mt-1">{{ formErrors.idLineaNegocio }}</p>
      </div>
      <div v-if="scope === 'campana'">
        <label class="block text-xs font-semibold text-slate-600 mb-1">Campaña <span class="text-red-500">*</span></label>
        <select :value="idCampana" @change="onSelectChange($event, v => emit('update:idCampana', v))" :class="inputClass">
          <option value="">Selecciona una campaña</option>
          <option v-for="opt in campanasCatalogo" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
        </select>
        <p v-if="formErrors.idCampana" class="text-xs text-red-500 mt-1">{{ formErrors.idCampana }}</p>
      </div>
    </div>

    <template v-if="scope === 'linea'">
      <p class="text-xs font-semibold text-slate-500 uppercase tracking-wide">Filtros CL</p>
      <p v-if="formErrors.clAtLeastOne" class="text-xs text-blue-500">{{ formErrors.clAtLeastOne }}</p>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div v-if="tipo === 'envio'">
          <label class="block text-xs font-semibold text-slate-600 mb-1">RIID <span class="text-blue-600">*</span></label>
          <input :value="cl.riid" @input="emit('update-cl', 'riid', ($event.target as HTMLInputElement).value)" :class="inputClass" placeholder="RIID" />
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1">Nombre</label>
          <input :value="cl.nombre" @input="emit('update-cl', 'nombre', ($event.target as HTMLInputElement).value)" :class="inputClass" placeholder="Nombre" />
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1">Apellido Paterno</label>
          <input :value="cl.apellidoPaterno" @input="emit('update-cl', 'apellidoPaterno', ($event.target as HTMLInputElement).value)" :class="inputClass" placeholder="Apellido Paterno" />
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1">Correo <span class="text-blue-600">*</span></label>
          <input :value="cl.correo" @input="emit('update-cl', 'correo', ($event.target as HTMLInputElement).value)" :class="inputClass" placeholder="Correo" />
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1">Teléfono <span class="text-blue-600">*</span></label>
          <input :value="cl.telefono" @input="emit('update-cl', 'telefono', ($event.target as HTMLInputElement).value)" :class="inputClass" placeholder="Teléfono" />
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1">Número de Cuenta <span class="text-blue-600">*</span></label>
          <input :value="cl.noCuenta" @input="emit('update-cl', 'noCuenta', ($event.target as HTMLInputElement).value)" :class="inputClass" placeholder="Número de Cuenta" />
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1">NSS <span class="text-blue-600">*</span></label>
          <input :value="cl.nss" @input="emit('update-cl', 'nss', ($event.target as HTMLInputElement).value)" :class="inputClass" placeholder="NSS" />
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1">CURP <span class="text-blue-600">*</span></label>
          <input :value="cl.curp" @input="emit('update-cl', 'curp', ($event.target as HTMLInputElement).value)" :class="inputClass" placeholder="CURP" />
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1">RFC <span class="text-blue-600">*</span></label>
          <input :value="cl.rfc" @input="emit('update-cl', 'rfc', ($event.target as HTMLInputElement).value)" :class="inputClass" placeholder="RFC" />
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1">Póliza <span class="text-blue-600">*</span></label>
          <input :value="cl.poliza" @input="emit('update-cl', 'poliza', ($event.target as HTMLInputElement).value)" :class="inputClass" placeholder="Póliza" />
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1">Fecha inicio <span class="text-red-500">*</span></label>
          <input type="date" :value="cl.fechaInicio" :max="todayISO" @input="emit('update-cl', 'fechaInicio', ($event.target as HTMLInputElement).value)" :class="inputClass" />
          <p v-if="formErrors.fechaInicio" class="text-xs text-red-500 mt-1">{{ formErrors.fechaInicio }}</p>
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1">Fecha fin <span class="text-red-500">*</span></label>
          <input type="date" :value="cl.fechaFin" :max="todayISO" @input="emit('update-cl', 'fechaFin', ($event.target as HTMLInputElement).value)" :class="inputClass" />
          <p v-if="formErrors.fechaFin" class="text-xs text-red-500 mt-1">{{ formErrors.fechaFin }}</p>
        </div>
      </div>
      <p class="text-[11px] text-slate-400"><span class="text-blue-600">*</span> Llenar al menos uno &nbsp; <span class="text-red-500">*</span> Obligatorio</p>
    </template>

    <template v-else>
      <p class="text-xs font-semibold text-slate-500 uppercase tracking-wide">Filtros PET</p>
      <p v-if="formErrors.petAtLeastOne" class="text-xs text-red-500">{{ formErrors.petAtLeastOne }}</p>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1">Número de Lote</label>
          <input :value="pet.noLote" @input="emit('update-pet', 'noLote', ($event.target as HTMLInputElement).value)" :class="inputClass" placeholder="Número de Lote" />
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1">ID Cliente <span class="text-blue-600">*</span></label>
          <input :value="pet.idCliente" @input="emit('update-pet', 'idCliente', ($event.target as HTMLInputElement).value)" :class="inputClass" placeholder="ID Cliente" />
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1">ID Afore <span class="text-blue-600">*</span></label>
          <input :value="pet.idAfore" @input="emit('update-pet', 'idAfore', ($event.target as HTMLInputElement).value)" :class="inputClass" placeholder="ID Afore" />
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1">ID Cliente Ahorrador <span class="text-blue-600">*</span></label>
          <input :value="pet.idClienteAhorrador" @input="emit('update-pet', 'idClienteAhorrador', ($event.target as HTMLInputElement).value)" :class="inputClass" placeholder="ID Cliente Ahorrador" />
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1">ID Préstamo Pensionado <span class="text-blue-600">*</span></label>
          <input :value="pet.idPrestamoPensionado" @input="emit('update-pet', 'idPrestamoPensionado', ($event.target as HTMLInputElement).value)" :class="inputClass" placeholder="ID Préstamo Pensionado" />
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1">ID Susceptible Préstamo <span class="text-blue-600">*</span></label>
          <input :value="pet.idSusceptiblePrestamo" @input="emit('update-pet', 'idSusceptiblePrestamo', ($event.target as HTMLInputElement).value)" :class="inputClass" placeholder="ID Susceptible Préstamo" />
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1">ID Baja/Cambio <span class="text-blue-600">*</span></label>
          <input :value="pet.idBajaCambio" @input="emit('update-pet', 'idBajaCambio', ($event.target as HTMLInputElement).value)" :class="inputClass" placeholder="ID Baja/Cambio" />
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1">ID Comunicación <span class="text-blue-600">*</span></label>
          <input :value="pet.idComunicacion" @input="emit('update-pet', 'idComunicacion', ($event.target as HTMLInputElement).value)" :class="inputClass" placeholder="ID Comunicación" />
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1">ID Persona <span class="text-blue-600">*</span></label>
          <input :value="pet.idPersona" @input="emit('update-pet', 'idPersona', ($event.target as HTMLInputElement).value)" :class="inputClass" placeholder="ID Persona" />
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1">Nombre</label>
          <input :value="pet.nombre" @input="emit('update-pet', 'nombre', ($event.target as HTMLInputElement).value)" :class="inputClass" placeholder="Nombre" />
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1">Apellido</label>
          <input :value="pet.apellido" @input="emit('update-pet', 'apellido', ($event.target as HTMLInputElement).value)" :class="inputClass" placeholder="Apellido" />
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1">Correo <span class="text-blue-600">*</span></label>
          <input :value="pet.correo" @input="emit('update-pet', 'correo', ($event.target as HTMLInputElement).value)" :class="inputClass" placeholder="Correo" />
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1">Teléfono <span class="text-blue-600">*</span></label>
          <input :value="pet.telefono" @input="emit('update-pet', 'telefono', ($event.target as HTMLInputElement).value)" :class="inputClass" placeholder="Teléfono" />
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1">Fecha inicial <span class="text-red-500">*</span></label>
          <input type="date" :value="pet.fechaInicio" :max="todayISO" @input="emit('update-pet', 'fechaInicio', ($event.target as HTMLInputElement).value)" :class="inputClass" />
          <p v-if="formErrors.fechaInicio" class="text-xs text-red-500 mt-1">{{ formErrors.fechaInicio }}</p>
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1">Fecha final <span class="text-red-500">*</span></label>
          <input type="date" :value="pet.fechaFin" :max="todayISO" @input="emit('update-pet', 'fechaFin', ($event.target as HTMLInputElement).value)" :class="inputClass" />
          <p v-if="formErrors.fechaFin" class="text-xs text-red-500 mt-1">{{ formErrors.fechaFin }}</p>
        </div>
      </div>
      <p class="text-[11px] text-slate-400"><span class="text-blue-600">*</span> Llenar al menos uno &nbsp; <span class="text-red-500">*</span> Obligatorio</p>
    </template>

    <div class="flex flex-wrap items-center gap-2 pt-1">
      <button
        @click="emit('consultar')"
        :disabled="isLoading"
        class="flex items-center gap-2 px-4 py-2 bg-[#FFD100] hover:bg-yellow-400 text-[#00357F] text-sm font-bold rounded-lg shadow-sm hover:shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Search class="w-4 h-4" />
        Consultar
      </button>

      <button
        @click="emit('clear')"
        :disabled="isLoading"
        class="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-50"
      >
        <RotateCcw class="w-4 h-4" />
        Limpiar
      </button>

      <div v-if="hasResults" class="flex items-center gap-2 ml-auto">
        <button
          @click="emit('export-csv')"
          :disabled="exportLoading"
          class="flex items-center gap-2 px-3 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
        >
          <FileText class="w-4 h-4" />
          CSV
        </button>
        <button
          @click="emit('export-pdf')"
          :disabled="exportLoading"
          class="flex items-center gap-2 px-3 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
        >
          <File class="w-4 h-4" />
          PDF
        </button>
      </div>
    </div>
  </div>
</template>
