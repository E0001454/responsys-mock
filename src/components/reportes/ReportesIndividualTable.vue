<script setup lang="ts">
import { computed, ref } from 'vue'
import { ChevronLeft, ChevronRight, Eye, X } from 'lucide-vue-next'
import type { RegistroCL, RegistroPET } from '@/types/reportes/reporte'
import { getEstatusClass } from '@/utils/reportes/reporteFormat.utils'

const props = defineProps<{
  registrosCL: RegistroCL[]
  registrosPET: RegistroPET[]
  totalRows: number
  currentPage: number
  totalPages: number
  canPrevPage: boolean
  canNextPage: boolean
  isLoading: boolean
  scope: 'linea' | 'campana'
  tipo: 'carga' | 'validacion' | 'envio'
}>()

const emit = defineEmits<{
  (e: 'prev-page'): void
  (e: 'next-page'): void
}>()

const showEstatus = computed(() => props.tipo !== 'carga')
const hasRows = computed(() => props.scope === 'linea' ? props.registrosCL.length > 0 : props.registrosPET.length > 0)

const detalleModalOpen = ref(false)
const detalleModalText = ref('')

function openDetalle(text: string | undefined) {
  detalleModalText.value = text ?? 'Sin detalle'
  detalleModalOpen.value = true
}
</script>

<template>
  <div class="bg-white border border-slate-200 rounded-xl overflow-hidden">
    <div v-if="isLoading" class="flex items-center justify-center py-16">
      <div class="flex flex-col items-center gap-3">
        <svg class="animate-spin h-8 w-8 text-[#00357F]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p class="text-sm text-slate-500">Cargando resultados...</p>
      </div>
    </div>

    <div v-else-if="!hasRows" class="flex items-center justify-center py-16">
      <div class="text-center">
        <p class="text-sm font-semibold text-slate-500">Sin resultados</p>
        <p class="text-xs text-slate-400 mt-1">No se encontraron datos con los filtros seleccionados.</p>
      </div>
    </div>

    <template v-else>
      <div class="overflow-x-auto">
        <table v-if="scope === 'linea'" class="w-full text-sm text-left">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-200">
              <th class="px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">Línea</th>
              <th class="px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">RIID</th>
              <th class="px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">Nombre</th>
              <th class="px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">Ap. Paterno</th>
              <th class="px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">Ap. Materno</th>
              <th class="px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">Correo</th>
              <th class="px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">Teléfono 1</th>
              <th class="px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">Teléfono 2</th>
              <th class="px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">No. Cuenta</th>
              <th class="px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">NSS</th>
              <th class="px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">CURP</th>
              <th class="px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">RFC</th>
              <th class="px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">Póliza</th>
              <th class="px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">Fec. Nac.</th>
              <th class="px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">CP</th>
              <th class="px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">Calle 1</th>
              <th class="px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">Calle 2</th>
              <th class="px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">Ciudad</th>
              <th class="px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">Estado</th>
              <th class="px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">Género</th>
              <th class="px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">Prueba</th>
              <th class="px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">Suspensión</th>
              <th class="px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">Fecha</th>
              <th v-if="showEstatus" class="px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">Estatus</th>
              <th v-if="showEstatus" class="px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">Detalle</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, i) in registrosCL" :key="i" class="border-b border-slate-100 hover:bg-slate-50 transition-colors">
              <td class="px-4 py-3 whitespace-nowrap text-slate-700">{{ row.lineaNegocio }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-slate-700">{{ row.riid }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-slate-700">{{ row.nombre }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-slate-700">{{ row.apellidoPaterno }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-slate-700">{{ row.apellidoMaterno }}</td>
              <td class="px-4 py-3 text-slate-700 max-w-[220px] truncate" :title="row.correo">{{ row.correo }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-slate-700">{{ row.telefono1 }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-slate-700">{{ row.telefono2 }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-slate-700">{{ row.noCuenta }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-slate-700">{{ row.nss }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-slate-700">{{ row.curp }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-slate-700">{{ row.rfc }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-slate-700">{{ row.poliza }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-slate-500 text-xs">{{ row.fechaNacimiento }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-slate-700">{{ row.cp }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-slate-700">{{ row.calle1 }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-slate-700">{{ row.calle2 }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-slate-700">{{ row.ciudad }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-slate-700">{{ row.estado }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-slate-700">{{ row.genero }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-slate-700">{{ row.prueba }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-slate-700">{{ row.suspension }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-slate-500 text-xs">{{ row.fecha }}</td>
              <td v-if="showEstatus" class="px-4 py-3 whitespace-nowrap">
                <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold" :class="getEstatusClass(row.estatus)">{{ row.estatus }}</span>
              </td>
              <td v-if="showEstatus" class="px-4 py-3 whitespace-nowrap">
                <button
                  v-if="row.detalle"
                  @click="openDetalle(row.detalle)"
                  class="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-[#00357F] bg-blue-50 hover:bg-blue-100 rounded-md transition-colors cursor-pointer"
                >
                  <Eye class="w-3.5 h-3.5" />
                  Ver
                </button>
                <span v-else class="text-xs text-slate-400">—</span>
              </td>
            </tr>
          </tbody>
        </table>

        <table v-else class="w-full text-sm text-left">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-200">
              <th class="px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">Línea</th>
              <th class="px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">Campaña</th>
              <th class="px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">Lote</th>
              <th class="px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">ID Cliente</th>
              <th class="px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">ID Afore</th>
              <th class="px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">Desc. Afore</th>
              <th class="px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">ID Cli. Ahorrador</th>
              <th class="px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">ID Prést. Pens.</th>
              <th class="px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">ID Susc. Prést.</th>
              <th class="px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">ID Baja/Cambio</th>
              <th class="px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">ID Comunicación</th>
              <th class="px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">ID Persona</th>
              <th class="px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">Nombre</th>
              <th class="px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">Apellido</th>
              <th class="px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">Correo</th>
              <th class="px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">Teléfono</th>
              <th class="px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">Siefore</th>
              <th class="px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">Segmento</th>
              <th class="px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">Régimen</th>
              <th class="px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">Tipo Pensión</th>
              <th class="px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">Grupo Pago</th>
              <th class="px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">Fec. Baja/Cambio</th>
              <th class="px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">Régimen IMSS</th>
              <th class="px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">Segmento Afo</th>
              <th class="px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">Edad</th>
              <th class="px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">Género</th>
              <th class="px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">Liga Rsaldos</th>
              <th class="px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">Segmento Pre</th>
              <th class="px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">Dom. Preferente</th>
              <th class="px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">Empresa</th>
              <th class="px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">Segmento Proy</th>
              <th class="px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">Paterno</th>
              <th class="px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">Liga Titular</th>
              <th class="px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">Instituto</th>
              <th class="px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">Trabajador</th>
              <th class="px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">Entidad</th>
              <th class="px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">Medios Digitales</th>
              <th class="px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">Apertura</th>
              <th class="px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">No. Hijos</th>
              <th class="px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">+65</th>
              <th class="px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">Menores</th>
              <th class="px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">Cta Menor 1</th>
              <th class="px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">Nombre Hijo 1</th>
              <th class="px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">Liga Hijo 1</th>
              <th class="px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">Cta Menor 2</th>
              <th class="px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">Nombre Hijo 2</th>
              <th class="px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">Liga Hijo 2</th>
              <th class="px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">Cta Menor 3</th>
              <th class="px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">Nombre Hijo 3</th>
              <th class="px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">Liga Hijo 3</th>
              <th class="px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">Cta Menor 4</th>
              <th class="px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">Nombre Hijo 4</th>
              <th class="px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">Liga Hijo 4</th>
              <th class="px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">Cta Menor 5</th>
              <th class="px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">Nombre Hijo 5</th>
              <th class="px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">Liga Hijo 5</th>
              <th class="px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">Cta Menor 6</th>
              <th class="px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">Nombre Hijo 6</th>
              <th class="px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">Liga Hijo 6</th>
              <th class="px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">Perfil</th>
              <th class="px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">Hijos</th>
              <th class="px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">Estatus Exp.</th>
              <th class="px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">Sucursal</th>
              <th class="px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">Dom. Sucursal</th>
              <th class="px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">Fecha</th>
              <th v-if="showEstatus" class="px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">Estatus</th>
              <th v-if="showEstatus" class="px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">Detalle</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, i) in registrosPET" :key="i" class="border-b border-slate-100 hover:bg-slate-50 transition-colors">
              <td class="px-4 py-3 whitespace-nowrap text-slate-700">{{ row.lineaDeNegocio }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-slate-700">{{ row.idCampana }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-slate-700">{{ row.numLote }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-slate-700">{{ row.customerId }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-slate-700">{{ row.idAfore }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-slate-700">{{ row.descripcionDeAfore }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-slate-700">{{ row.idClienteAhorrador }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-slate-700">{{ row.idPrestamoPensionado }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-slate-700">{{ row.idSusceptiblePrestamo }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-slate-700">{{ row.idBajaCambio }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-slate-700">{{ row.idComunicacion }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-slate-700">{{ row.idPersona }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-slate-700">{{ row.firstName }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-slate-700">{{ row.lastName }}</td>
              <td class="px-4 py-3 text-slate-700 max-w-[220px] truncate" :title="row.correo">{{ row.correo }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-slate-700">{{ row.telefono }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-slate-700">{{ row.siefore }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-slate-700">{{ row.segmento }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-slate-700">{{ row.regimen }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-slate-700">{{ row.tipoPension }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-slate-700">{{ row.grupoPago }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-slate-500 text-xs">{{ row.fechaBajaCambio }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-slate-700">{{ row.regimenImss }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-slate-700">{{ row.segmentoAfo }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-slate-700">{{ row.edad }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-slate-700">{{ row.genero }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-slate-700">{{ row.ligaRsaldos }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-slate-700">{{ row.segmentoPre }}</td>
              <td class="px-4 py-3 text-slate-700 max-w-[200px] truncate" :title="row.domicilioPreferente">{{ row.domicilioPreferente }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-slate-700">{{ row.empresa }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-slate-700">{{ row.segmentoProy }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-slate-700">{{ row.paterno }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-slate-700">{{ row.ligaTitular }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-slate-700">{{ row.instituto }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-slate-700">{{ row.trabajador }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-slate-700">{{ row.entidad }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-slate-700">{{ row.mediosDigitales }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-slate-500 text-xs">{{ row.apertura }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-slate-700">{{ row.numeroHijos }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-slate-700">{{ row.masy65 }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-slate-700">{{ row.menores }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-slate-700">{{ row.cuentaMenor1 }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-slate-700">{{ row.nombreHijo1 }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-slate-700">{{ row.ligaHijo1 }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-slate-700">{{ row.cuentaMenor2 }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-slate-700">{{ row.nombreHijo2 }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-slate-700">{{ row.ligaHijo2 }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-slate-700">{{ row.cuentaMenor3 }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-slate-700">{{ row.nombreHijo3 }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-slate-700">{{ row.ligaHijo3 }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-slate-700">{{ row.cuentaMenor4 }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-slate-700">{{ row.nombreHijo4 }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-slate-700">{{ row.ligaHijo4 }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-slate-700">{{ row.cuentaMenor5 }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-slate-700">{{ row.nombreHijo5 }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-slate-700">{{ row.ligaHijo5 }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-slate-700">{{ row.cuentaMenor6 }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-slate-700">{{ row.nombreHijo6 }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-slate-700">{{ row.ligaHijo6 }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-slate-700">{{ row.perfil }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-slate-700">{{ row.hijos }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-slate-700">{{ row.estatusExp }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-slate-700">{{ row.sucursal }}</td>
              <td class="px-4 py-3 text-slate-700 max-w-[200px] truncate" :title="row.domSucursal">{{ row.domSucursal }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-slate-500 text-xs">{{ row.fecha }}</td>
              <td v-if="showEstatus" class="px-4 py-3 whitespace-nowrap">
                <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold" :class="getEstatusClass(row.estatus)">{{ row.estatus }}</span>
              </td>
              <td v-if="showEstatus" class="px-4 py-3 whitespace-nowrap">
                <button
                  v-if="row.detalle"
                  @click="openDetalle(row.detalle)"
                  class="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-[#00357F] bg-blue-50 hover:bg-blue-100 rounded-md transition-colors cursor-pointer"
                >
                  <Eye class="w-3.5 h-3.5" />
                  Ver
                </button>
                <span v-else class="text-xs text-slate-400">—</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50">
        <p class="text-xs text-slate-500">
          {{ totalRows }} resultado{{ totalRows !== 1 ? 's' : '' }}
        </p>
        <div class="flex items-center gap-2">
          <button
            :disabled="!canPrevPage"
            @click="emit('prev-page')"
            class="p-1.5 rounded-md border border-slate-200 text-slate-500 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft class="w-4 h-4" />
          </button>
          <span class="text-xs text-slate-600 tabular-nums">{{ currentPage }} / {{ totalPages }}</span>
          <button
            :disabled="!canNextPage"
            @click="emit('next-page')"
            class="p-1.5 rounded-md border border-slate-200 text-slate-500 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight class="w-4 h-4" />
          </button>
        </div>
      </div>
    </template>
  </div>

  <Teleport to="body">
    <Transition name="fade">
      <div v-if="detalleModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/40" @click="detalleModalOpen = false"></div>
        <div class="relative bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[80vh] flex flex-col overflow-hidden">
          <div class="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50">
            <h3 class="text-sm font-bold text-[#00357F]">Detalle del registro</h3>
            <button @click="detalleModalOpen = false" class="p-1 rounded-md hover:bg-slate-200 text-slate-500 transition-colors cursor-pointer">
              <X class="w-4 h-4" />
            </button>
          </div>
          <div class="px-5 py-4 overflow-y-auto">
            <p class="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{{ detalleModalText }}</p>
          </div>
          <div class="flex justify-end px-5 py-3 border-t border-slate-200 bg-slate-50">
            <button @click="detalleModalOpen = false" class="px-4 py-1.5 text-sm font-semibold text-white bg-[#00357F] rounded-lg hover:bg-[#002a66] transition-colors cursor-pointer">
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
