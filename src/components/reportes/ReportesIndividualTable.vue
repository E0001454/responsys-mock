<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { ChevronLeft, ChevronRight, AlertCircle } from 'lucide-vue-next'
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

interface ColumnDef { key: string; label: string }

const clColumns: ColumnDef[] = [
  { key: 'lineaNegocio', label: 'Línea de Negocio' },
  { key: 'riid', label: 'RIID' },
  { key: 'nombre', label: 'Nombre' },
  { key: 'apellidoPaterno', label: 'Apellido Paterno' },
  { key: 'apellidoMaterno', label: 'Apellido Materno' },
  { key: 'correo', label: 'Correo' },
  { key: 'telefono1', label: 'Teléfono 1' },
  { key: 'telefono2', label: 'Teléfono 2' },
  { key: 'noCuenta', label: 'Número de Cuenta' },
  { key: 'nss', label: 'NSS' },
  { key: 'curp', label: 'CURP' },
  { key: 'rfc', label: 'RFC' },
  { key: 'poliza', label: 'Póliza' },
  { key: 'fechaNacimiento', label: 'Fecha de Nacimiento' },
  { key: 'cp', label: 'Código Postal' },
  { key: 'calle1', label: 'Calle 1' },
  { key: 'calle2', label: 'Calle 2' },
  { key: 'ciudad', label: 'Ciudad' },
  { key: 'estado', label: 'Estado' },
  { key: 'genero', label: 'Género' },
  { key: 'prueba', label: 'Prueba' },
  { key: 'suspension', label: 'Suspensión' },
  { key: 'fecha', label: 'Fecha' }
]

const petColumns: ColumnDef[] = [
  { key: 'lineaDeNegocio', label: 'Línea de Negocio' },
  { key: 'idCampana', label: 'Campaña' },
  { key: 'numLote', label: 'Número de Lote' },
  { key: 'customerId', label: 'ID Cliente' },
  { key: 'idAfore', label: 'ID Afore' },
  { key: 'descripcionDeAfore', label: 'Descripción de Afore' },
  { key: 'idClienteAhorrador', label: 'ID Cliente Ahorrador' },
  { key: 'idPrestamoPensionado', label: 'ID Préstamo Pensionado' },
  { key: 'idSusceptiblePrestamo', label: 'ID Susceptible Préstamo' },
  { key: 'idBajaCambio', label: 'ID Baja/Cambio' },
  { key: 'idComunicacion', label: 'ID Comunicación' },
  { key: 'idPersona', label: 'ID Persona' },
  { key: 'firstName', label: 'Nombre' },
  { key: 'lastName', label: 'Apellido' },
  { key: 'correo', label: 'Correo' },
  { key: 'telefono', label: 'Teléfono' },
  { key: 'siefore', label: 'Siefore' },
  { key: 'segmento', label: 'Segmento' },
  { key: 'regimen', label: 'Régimen' },
  { key: 'tipoPension', label: 'Tipo de Pensión' },
  { key: 'grupoPago', label: 'Grupo de Pago' },
  { key: 'fechaBajaCambio', label: 'Fecha de Baja/Cambio' },
  { key: 'regimenImss', label: 'Régimen IMSS' },
  { key: 'segmentoAfo', label: 'Segmento Afore' },
  { key: 'edad', label: 'Edad' },
  { key: 'genero', label: 'Género' },
  { key: 'ligaRsaldos', label: 'Liga Rsaldos' },
  { key: 'segmentoPre', label: 'Segmento Preferente' },
  { key: 'domicilioPreferente', label: 'Domicilio Preferente' },
  { key: 'empresa', label: 'Empresa' },
  { key: 'segmentoProy', label: 'Segmento Proyección' },
  { key: 'paterno', label: 'Paterno' },
  { key: 'ligaTitular', label: 'Liga Titular' },
  { key: 'instituto', label: 'Instituto' },
  { key: 'trabajador', label: 'Trabajador' },
  { key: 'entidad', label: 'Entidad' },
  { key: 'mediosDigitales', label: 'Medios Digitales' },
  { key: 'apertura', label: 'Apertura' },
  { key: 'numeroHijos', label: 'Número de Hijos' },
  { key: 'masy65', label: 'Mayores de 65' },
  { key: 'menores', label: 'Menores' },
  { key: 'cuentaMenor1', label: 'Cuenta Menor 1' },
  { key: 'nombreHijo1', label: 'Nombre Hijo 1' },
  { key: 'ligaHijo1', label: 'Liga Hijo 1' },
  { key: 'cuentaMenor2', label: 'Cuenta Menor 2' },
  { key: 'nombreHijo2', label: 'Nombre Hijo 2' },
  { key: 'ligaHijo2', label: 'Liga Hijo 2' },
  { key: 'cuentaMenor3', label: 'Cuenta Menor 3' },
  { key: 'nombreHijo3', label: 'Nombre Hijo 3' },
  { key: 'ligaHijo3', label: 'Liga Hijo 3' },
  { key: 'cuentaMenor4', label: 'Cuenta Menor 4' },
  { key: 'nombreHijo4', label: 'Nombre Hijo 4' },
  { key: 'ligaHijo4', label: 'Liga Hijo 4' },
  { key: 'cuentaMenor5', label: 'Cuenta Menor 5' },
  { key: 'nombreHijo5', label: 'Nombre Hijo 5' },
  { key: 'ligaHijo5', label: 'Liga Hijo 5' },
  { key: 'cuentaMenor6', label: 'Cuenta Menor 6' },
  { key: 'nombreHijo6', label: 'Nombre Hijo 6' },
  { key: 'ligaHijo6', label: 'Liga Hijo 6' },
  { key: 'perfil', label: 'Perfil' },
  { key: 'hijos', label: 'Hijos' },
  { key: 'estatusExp', label: 'Estatus Expediente' },
  { key: 'sucursal', label: 'Sucursal' },
  { key: 'domSucursal', label: 'Domicilio Sucursal' },
  { key: 'fecha', label: 'Fecha' }
]

const columns = computed(() => props.scope === 'linea' ? clColumns : petColumns)
const rows = computed(() =>
  props.scope === 'linea' ? props.registrosCL : props.registrosPET
)

interface DetalleError { columna?: string; atributo?: string; error?: string; err?: string }

function parseDetalle(text: string | undefined): DetalleError[] | null {
  if (!text) return null
  try {
    const parsed = JSON.parse(text)
    if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'object') return parsed
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return [parsed]
    return null
  } catch {
    return null
  }
}

function buildErrorMap(row: Record<string, unknown>): Map<string, string> {
  const det = parseDetalle(row.detalle as string | undefined)
  if (!det) return new Map()
  const map = new Map<string, string>()
  for (const d of det) {
    const key = (d.atributo ?? d.columna ?? '').toLowerCase()
    const msg = d.error || d.err || ''
    if (key && msg) map.set(key, msg)
  }
  return map
}

const errorMapCache = new WeakMap<object, Map<string, string>>()

function getErrorMap(row: any): Map<string, string> {
  let map = errorMapCache.get(row)
  if (map !== undefined) return map
  map = buildErrorMap(row)
  errorMapCache.set(row, map)
  return map
}

function hasRowErrors(row: any): boolean {
  return !!row.detalle && parseDetalle(row.detalle as string) !== null
}

function getRowTintClass(row: any): string {
  if (hasRowErrors(row)) return 'bg-red-50/60'
  const c = String((row as any).estatus ?? '').toUpperCase()
  if (c === 'ACEPTADO' || c === 'EXITOSO' || c === 'OK') return 'bg-emerald-50/40'
  return ''
}

const detallePopover = ref<{ x: number; y: number; errors: DetalleError[] } | null>(null)

function openCellDetalle(row: any, colKey: string, event: MouseEvent) {
  event.stopPropagation()
  const errorMap = getErrorMap(row)
  const msg = errorMap.get(colKey.toLowerCase())
  if (!msg) return

  const det = parseDetalle(row.detalle as string | undefined)
  const cellErrors = (det ?? []).filter(d => (d.atributo ?? d.columna ?? '').toLowerCase() === colKey.toLowerCase())
  if (!cellErrors.length) return

  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
  detallePopover.value = {
    x: Math.min(rect.left + window.scrollX, window.innerWidth - 340),
    y: rect.bottom + window.scrollY + 4,
    errors: cellErrors
  }
}

function closeDetalle() {
  detallePopover.value = null
}

onMounted(() => document.addEventListener('click', closeDetalle))
onUnmounted(() => document.removeEventListener('click', closeDetalle))
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
        <table class="w-full text-sm text-left">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-200">
              <th v-for="col in columns" :key="col.key" class="px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">{{ col.label }}</th>
              <th v-if="showEstatus" class="px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">Estatus</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="(row, i) in rows" :key="i">
              <tr class="border-b border-slate-100 transition-colors" :class="[showEstatus ? getRowTintClass(row) : '']">
                <td
                  v-for="col in columns"
                  :key="col.key"
                  class="px-4 py-3 whitespace-nowrap text-slate-700"
                  :class="{ 'bg-red-100/80': showEstatus && getErrorMap(row).has(col.key.toLowerCase()) }"
                >
                  <span class="inline-flex items-center gap-1">
                    {{ (row as any)[col.key] ?? '' }}
                    <button
                      v-if="showEstatus && getErrorMap(row).has(col.key.toLowerCase())"
                      @click.stop="openCellDetalle(row, col.key, $event)"
                      class="inline-flex items-center justify-center w-5 h-5 rounded-full hover:bg-red-200/60 transition-colors flex-shrink-0"
                      title="Ver detalle del error"
                    >
                      <AlertCircle class="w-3.5 h-3.5 text-red-500" />
                    </button>
                  </span>
                </td>
                <td v-if="showEstatus" class="px-4 py-3 whitespace-nowrap">
                  <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold" :class="getEstatusClass((row as any).estatus)">{{ (row as any).estatus }}</span>
                </td>
              </tr>
            </template>
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

    <Teleport to="body">
      <div
        v-if="detallePopover"
        class="fixed z-[9999] w-80 bg-white border border-red-200 rounded-xl shadow-2xl overflow-hidden"
        :style="{ left: detallePopover.x + 'px', top: detallePopover.y + 'px' }"
        @click.stop
      >
        <div class="bg-red-50 px-4 py-2 border-b border-red-200 flex items-center gap-2">
          <AlertCircle class="w-4 h-4 text-red-500" />
          <span class="text-sm font-semibold text-red-700">Detalle de errores</span>
        </div>
        <div class="divide-y divide-slate-100 max-h-64 overflow-y-auto">
          <div v-for="(err, idx) in detallePopover.errors" :key="idx" class="px-4 py-3 space-y-1 text-xs">
            <p><span class="font-semibold text-slate-500">Columna:</span> <span class="text-slate-700">{{ err.columna }}</span></p>
            <p><span class="font-semibold text-slate-500">Atributo:</span> <span class="text-slate-700">{{ err.atributo }}</span></p>
            <p><span class="font-semibold text-red-600">Error:</span> <span class="text-red-700">{{ err.error || err.err }}</span></p>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
