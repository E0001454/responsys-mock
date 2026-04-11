<script setup lang="ts">
import { Search, RotateCcw, FileText, File } from 'lucide-vue-next'
import type { FiltroIndividualCL, FiltroIndividualPET } from '@/types/reportes/reporte'

interface Option {
  label: string
  value: number
}

const props = defineProps<{
  scope: string
  idLinea: number | ''
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
  (e: 'update:idLinea', value: number | ''): void
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

const inputClass = 'w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:ring-2 focus:ring-[#00357F] focus:border-[#00357F]'
</script>

<template>
  <div class="bg-white border border-slate-200 rounded-xl p-4 space-y-4">

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      <div>
        <label class="block text-xs font-semibold text-slate-600 mb-1">Línea de contacto</label>
        <select :value="idLinea" @change="onSelectChange($event, v => emit('update:idLinea', v))" :class="inputClass">
          <option value="">Selecciona una línea</option>
          <option v-for="opt in lineasCatalogo" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
        </select>
        <p v-if="formErrors.idLinea" class="text-xs text-red-500 mt-1">{{ formErrors.idLinea }}</p>
      </div>
      <div v-if="scope === 'campana'">
        <label class="block text-xs font-semibold text-slate-600 mb-1">Extensión de perfil</label>
        <select :value="idCampana" @change="onSelectChange($event, v => emit('update:idCampana', v))" :class="inputClass">
          <option value="">Selecciona una extensión</option>
          <option v-for="opt in campanasCatalogo" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
        </select>
        <p v-if="formErrors.idCampana" class="text-xs text-red-500 mt-1">{{ formErrors.idCampana }}</p>
      </div>
    </div>

    <template v-if="scope === 'linea'">
      <p class="text-xs font-semibold text-slate-500 uppercase tracking-wide">Filtros CL</p>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1">RIID <span class="text-red-500">*</span></label>
          <input :value="cl.riid" @input="emit('update-cl', 'riid', ($event.target as HTMLInputElement).value)" :class="inputClass" placeholder="RIID" />
          <p v-if="formErrors.riid" class="text-xs text-red-500 mt-1">{{ formErrors.riid }}</p>
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1">Nombre <span class="text-red-500">*</span></label>
          <input :value="cl.nombre" @input="emit('update-cl', 'nombre', ($event.target as HTMLInputElement).value)" :class="inputClass" placeholder="Nombre" />
          <p v-if="formErrors.clNombre" class="text-xs text-red-500 mt-1">{{ formErrors.clNombre }}</p>
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1">Apellido Paterno <span class="text-red-500">*</span></label>
          <input :value="cl.apellidoPaterno" @input="emit('update-cl', 'apellidoPaterno', ($event.target as HTMLInputElement).value)" :class="inputClass" placeholder="Apellido Paterno" />
          <p v-if="formErrors.apellidoPaterno" class="text-xs text-red-500 mt-1">{{ formErrors.apellidoPaterno }}</p>
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1">Correo <span class="text-red-500">*</span></label>
          <input :value="cl.correo" @input="emit('update-cl', 'correo', ($event.target as HTMLInputElement).value)" :class="inputClass" placeholder="Correo" />
          <p v-if="formErrors.clCorreo" class="text-xs text-red-500 mt-1">{{ formErrors.clCorreo }}</p>
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1">Teléfono <span class="text-red-500">*</span></label>
          <input :value="cl.telefono" @input="emit('update-cl', 'telefono', ($event.target as HTMLInputElement).value)" :class="inputClass" placeholder="Teléfono" />
          <p v-if="formErrors.clTelefono" class="text-xs text-red-500 mt-1">{{ formErrors.clTelefono }}</p>
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1">No. Cuenta <span class="text-red-500">*</span></label>
          <input :value="cl.noCuenta" @input="emit('update-cl', 'noCuenta', ($event.target as HTMLInputElement).value)" :class="inputClass" placeholder="No. Cuenta" />
          <p v-if="formErrors.noCuenta" class="text-xs text-red-500 mt-1">{{ formErrors.noCuenta }}</p>
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1">NSS <span class="text-red-500">*</span></label>
          <input :value="cl.nss" @input="emit('update-cl', 'nss', ($event.target as HTMLInputElement).value)" :class="inputClass" placeholder="NSS" />
          <p v-if="formErrors.nss" class="text-xs text-red-500 mt-1">{{ formErrors.nss }}</p>
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1">CURP <span class="text-red-500">*</span></label>
          <input :value="cl.curp" @input="emit('update-cl', 'curp', ($event.target as HTMLInputElement).value)" :class="inputClass" placeholder="CURP" />
          <p v-if="formErrors.curp" class="text-xs text-red-500 mt-1">{{ formErrors.curp }}</p>
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1">RFC <span class="text-red-500">*</span></label>
          <input :value="cl.rfc" @input="emit('update-cl', 'rfc', ($event.target as HTMLInputElement).value)" :class="inputClass" placeholder="RFC" />
          <p v-if="formErrors.rfc" class="text-xs text-red-500 mt-1">{{ formErrors.rfc }}</p>
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1">Póliza <span class="text-red-500">*</span></label>
          <input :value="cl.poliza" @input="emit('update-cl', 'poliza', ($event.target as HTMLInputElement).value)" :class="inputClass" placeholder="Póliza" />
          <p v-if="formErrors.poliza" class="text-xs text-red-500 mt-1">{{ formErrors.poliza }}</p>
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1">Fecha inicio</label>
          <input type="date" :value="cl.fechaInicio" @input="emit('update-cl', 'fechaInicio', ($event.target as HTMLInputElement).value)" :class="inputClass" />
          <p v-if="formErrors.fechaInicio" class="text-xs text-red-500 mt-1">{{ formErrors.fechaInicio }}</p>
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1">Fecha fin</label>
          <input type="date" :value="cl.fechaFin" @input="emit('update-cl', 'fechaFin', ($event.target as HTMLInputElement).value)" :class="inputClass" />
          <p v-if="formErrors.fechaFin" class="text-xs text-red-500 mt-1">{{ formErrors.fechaFin }}</p>
        </div>
      </div>
    </template>

    <template v-else>
      <p class="text-xs font-semibold text-slate-500 uppercase tracking-wide">Filtros PET</p>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1">No. Lote <span class="text-red-500">*</span></label>
          <input :value="pet.noLote" @input="emit('update-pet', 'noLote', ($event.target as HTMLInputElement).value)" :class="inputClass" placeholder="No. Lote" />
          <p v-if="formErrors.noLote" class="text-xs text-red-500 mt-1">{{ formErrors.noLote }}</p>
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1">ID Cliente <span class="text-red-500">*</span></label>
          <input :value="pet.idCliente" @input="emit('update-pet', 'idCliente', ($event.target as HTMLInputElement).value)" :class="inputClass" placeholder="ID Cliente" />
          <p v-if="formErrors.idCliente" class="text-xs text-red-500 mt-1">{{ formErrors.idCliente }}</p>
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1">ID Afore <span class="text-red-500">*</span></label>
          <input :value="pet.idAfore" @input="emit('update-pet', 'idAfore', ($event.target as HTMLInputElement).value)" :class="inputClass" placeholder="ID Afore" />
          <p v-if="formErrors.idAfore" class="text-xs text-red-500 mt-1">{{ formErrors.idAfore }}</p>
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1">ID Cli. Ahorrador <span class="text-red-500">*</span></label>
          <input :value="pet.idClienteAhorrador" @input="emit('update-pet', 'idClienteAhorrador', ($event.target as HTMLInputElement).value)" :class="inputClass" placeholder="ID Cli. Ahorrador" />
          <p v-if="formErrors.idClienteAhorrador" class="text-xs text-red-500 mt-1">{{ formErrors.idClienteAhorrador }}</p>
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1">ID Prést. Pens. <span class="text-red-500">*</span></label>
          <input :value="pet.idPrestamoPensionado" @input="emit('update-pet', 'idPrestamoPensionado', ($event.target as HTMLInputElement).value)" :class="inputClass" placeholder="ID Prést. Pens." />
          <p v-if="formErrors.idPrestamoPensionado" class="text-xs text-red-500 mt-1">{{ formErrors.idPrestamoPensionado }}</p>
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1">ID Susc. Prést. <span class="text-red-500">*</span></label>
          <input :value="pet.idSusceptiblePrestamo" @input="emit('update-pet', 'idSusceptiblePrestamo', ($event.target as HTMLInputElement).value)" :class="inputClass" placeholder="ID Susc. Prést." />
          <p v-if="formErrors.idSusceptiblePrestamo" class="text-xs text-red-500 mt-1">{{ formErrors.idSusceptiblePrestamo }}</p>
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1">ID Baja/Cambio <span class="text-red-500">*</span></label>
          <input :value="pet.idBajaCambio" @input="emit('update-pet', 'idBajaCambio', ($event.target as HTMLInputElement).value)" :class="inputClass" placeholder="ID Baja/Cambio" />
          <p v-if="formErrors.idBajaCambio" class="text-xs text-red-500 mt-1">{{ formErrors.idBajaCambio }}</p>
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1">ID Comunicación <span class="text-red-500">*</span></label>
          <input :value="pet.idComunicacion" @input="emit('update-pet', 'idComunicacion', ($event.target as HTMLInputElement).value)" :class="inputClass" placeholder="ID Comunicación" />
          <p v-if="formErrors.idComunicacion" class="text-xs text-red-500 mt-1">{{ formErrors.idComunicacion }}</p>
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1">ID Persona <span class="text-red-500">*</span></label>
          <input :value="pet.idPersona" @input="emit('update-pet', 'idPersona', ($event.target as HTMLInputElement).value)" :class="inputClass" placeholder="ID Persona" />
          <p v-if="formErrors.idPersona" class="text-xs text-red-500 mt-1">{{ formErrors.idPersona }}</p>
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1">Nombre <span class="text-red-500">*</span></label>
          <input :value="pet.nombre" @input="emit('update-pet', 'nombre', ($event.target as HTMLInputElement).value)" :class="inputClass" placeholder="Nombre" />
          <p v-if="formErrors.petNombre" class="text-xs text-red-500 mt-1">{{ formErrors.petNombre }}</p>
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1">Apellido <span class="text-red-500">*</span></label>
          <input :value="pet.apellido" @input="emit('update-pet', 'apellido', ($event.target as HTMLInputElement).value)" :class="inputClass" placeholder="Apellido" />
          <p v-if="formErrors.apellido" class="text-xs text-red-500 mt-1">{{ formErrors.apellido }}</p>
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1">Correo <span class="text-red-500">*</span></label>
          <input :value="pet.correo" @input="emit('update-pet', 'correo', ($event.target as HTMLInputElement).value)" :class="inputClass" placeholder="Correo" />
          <p v-if="formErrors.petCorreo" class="text-xs text-red-500 mt-1">{{ formErrors.petCorreo }}</p>
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1">Teléfono <span class="text-red-500">*</span></label>
          <input :value="pet.telefono" @input="emit('update-pet', 'telefono', ($event.target as HTMLInputElement).value)" :class="inputClass" placeholder="Teléfono" />
          <p v-if="formErrors.petTelefono" class="text-xs text-red-500 mt-1">{{ formErrors.petTelefono }}</p>
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1">Fecha inicial</label>
          <input type="date" :value="pet.fechaInicial" @input="emit('update-pet', 'fechaInicial', ($event.target as HTMLInputElement).value)" :class="inputClass" />
          <p v-if="formErrors.fechaInicial" class="text-xs text-red-500 mt-1">{{ formErrors.fechaInicial }}</p>
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1">Fecha final</label>
          <input type="date" :value="pet.fechaFinal" @input="emit('update-pet', 'fechaFinal', ($event.target as HTMLInputElement).value)" :class="inputClass" />
          <p v-if="formErrors.fechaFinal" class="text-xs text-red-500 mt-1">{{ formErrors.fechaFinal }}</p>
        </div>
      </div>
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
