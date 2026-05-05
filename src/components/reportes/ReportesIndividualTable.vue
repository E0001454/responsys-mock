<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { ChevronLeft, ChevronRight, AlertCircle, CheckCircle2, XCircle, Circle, Search } from 'lucide-vue-next'
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

const showEstatus = computed(() => props.tipo === 'validacion')
const hasRows = computed(() => props.scope === 'linea' ? props.registrosCL.length > 0 : props.registrosPET.length > 0)

const emptyMessage = computed(() => {
  if (props.tipo === 'carga') return 'No hay información disponible actualmente con los filtros proporcionados.'
  if (props.tipo === 'validacion') return 'No hay información disponible actualmente con los filtros proporcionados. Favor de revisar el proceso de Carga (BI).'
  return 'No hay información disponible actualmente con los filtros proporcionados. Favor de revisar el motivo en el proceso de Validación (ABC).'
})

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
  { key: 'campana', label: 'Campaña' },
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

interface DetalleError { columna?: string; atributo?: string; error?: string | string[]; err?: string | string[] }

function repairDetalleJson(text: string): string {
  let t = text.trim()
  t = t.replace(/([^":,{\[])"\s*"([^":,}\]])/g, '$1, $2')
  t = t.replace(/\}\s*\{/g, '},{')
  if (t.startsWith('{')) t = `[${t}]`
  return t
}

const ATRIBUTO_TO_KEY: Record<string, string> = {
  afore: 'descripciondeafore', idcliente: 'customerid', nolote: 'numlote',
  campana: 'campana', idcampana: 'campana', nombre: 'firstname', apellido: 'lastname',
  lineanegocio: 'lineadenegocio', regimenimss: 'regimenimss'
}
const COLUMNA_TO_KEY: Record<string, string> = {
  email_address_: 'correo', mobile_number_: 'telefono', mobile_country_: 'telefono2',
  riid_: 'riid', nombre: 'nombre', apellido_paterno: 'apellidopaterno',
  apellido_materno: 'apellidomaterno', linea_de_negocio: 'lineanegocio',
  numero_de_cuenta: 'nocuenta', date_of_birth: 'fechanacimiento',
  postal_street_1_: 'calle1', postal_street_2_: 'calle2', city_: 'ciudad',
  state_: 'estado', postal_code_: 'cp', suspension_logica: 'suspension',
  'usuario prueba': 'prueba', id_afore: 'idafore', descripcion_de_afore: 'descripciondeafore',
  id_cliente_ahorrador: 'idclienteahorrador', id_prestamo_pensionado: 'idprestamopensionado',
  id_susceptible_prestamo: 'idsusceptibleprestamo', tipo_pension: 'tipopension',
  grupo_pago: 'grupopago', customer_id_: 'customerid', num_lote: 'numlote',
  nombre_campana: 'campana', id_campana: 'campana', idcampana: 'campana', id_baja_cambio: 'idbajacambio',
  fecha_baja_cambio: 'fechabajacambio', regimen_imss: 'regimenimss',
  segmento_afo: 'segmentoafo', liga_rsaldos: 'ligarsaldos', segmento_pre: 'segmentopre',
  first_name: 'firstname', last_name: 'lastname', id_comunicacion: 'idcomunicacion',
  domicilio_preferente: 'domiciliopreferente', segmento_proy: 'segmentoproy',
  idpersona: 'idpersona', liga_titular: 'ligatitular', medios_digitales: 'mediosdigitales',
  numero_hijos: 'numerohijos', cuenta_menor_1: 'cuentamenor1', nombre_hijo_1: 'nombrehijo1',
  liga_hijo_1: 'ligahijo1', cuenta_menor_2: 'cuentamenor2', nombre_hijo_2: 'nombrehijo2',
  liga_hijo_2: 'ligahijo2', cuenta_menor_3: 'cuentamenor3', nombre_hijo_3: 'nombrehijo3',
  liga_hijo_3: 'ligahijo3', cuenta_menor_4: 'cuentamenor4', nombre_hijo_4: 'nombrehijo4',
  liga_hijo_4: 'ligahijo4', cuenta_menor_5: 'cuentamenor5', nombre_hijo_5: 'nombrehijo5',
  liga_hijo_5: 'ligahijo5', cuenta_menor_6: 'cuentamenor6', nombre_hijo_6: 'nombrehijo6',
  liga_hijo_6: 'ligahijo6', estatus_exp: 'estatusexp', dom_sucursal: 'domsucursal'
}

function resolveColumnKeys(d: DetalleError): string[] {
  const attr = (d.atributo ?? '').toLowerCase().trim()
  const col = (d.columna ?? '').toLowerCase().trim()
  const keys = new Set<string>()
  if (attr) { keys.add(attr); if (ATRIBUTO_TO_KEY[attr]) keys.add(ATRIBUTO_TO_KEY[attr]) }
  if (col) { keys.add(col); if (COLUMNA_TO_KEY[col]) keys.add(COLUMNA_TO_KEY[col]) }
  return [...keys]
}

function parseDetalle(text: string | undefined): DetalleError[] | null {
  if (!text) return null
  try {
    const parsed = JSON.parse(repairDetalleJson(text))
    if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'object') return parsed
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return [parsed]
    return null
  } catch {
    return null
  }
}

function cleanMsg(v: unknown): string {
  if (Array.isArray(v)) return v.join(', ')
  let s = String(v ?? '')
  if (s.startsWith('[')) {
    try { const arr = JSON.parse(s); if (Array.isArray(arr)) return arr.join(', ') } catch {}
  }
  return s.replace(/^\[|\]$/g, '').replace(/"/g, '').trim()
}

function buildErrorMap(row: Record<string, unknown>): Map<string, string> {
  const det = parseDetalle(row.detalle as string | undefined)
  if (!det) return new Map()
  const map = new Map<string, string>()
  for (const d of det) {
    const keys = resolveColumnKeys(d)
    const msg = cleanMsg(d.error || d.err || '')
    for (const key of keys) {
      if (key) map.set(key, map.has(key) ? `${map.get(key)}, ${msg}` : msg)
    }
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
  if (props.tipo === 'envio') return 'bg-blue-100/80'
  if (props.tipo !== 'validacion') return ''
  if (hasRowErrors(row)) return 'bg-red-50/60'
  const c = String((row as any).estatus ?? '').toUpperCase()
  if (c === 'RECHAZADO' || c === 'ERROR') return 'bg-red-50/60'
  if (c === 'ACEPTADO' || c === 'APROBADO' || c === 'EXITOSO' || c === 'OK') return 'bg-emerald-50/60'
  return ''
}

function getEstatusIcon(row: any): 'check' | 'x' | 'circle' {
  if (hasRowErrors(row)) return 'x'
  const c = String((row as any).estatus ?? '').toUpperCase()
  if (c === 'RECHAZADO' || c === 'ERROR') return 'x'
  if (c === 'ACEPTADO' || c === 'APROBADO' || c === 'EXITOSO' || c === 'OK') return 'check'
  return 'circle'
}

const detallePopover = ref<{ x: number; y: number; errors: DetalleError[] } | null>(null)

function openCellDetalle(row: any, colKey: string, event: MouseEvent) {
  event.stopPropagation()
  const errorMap = getErrorMap(row)
  const msg = errorMap.get(colKey.toLowerCase())
  if (!msg) return

  const det = parseDetalle(row.detalle as string | undefined)
  const lowerKey = colKey.toLowerCase()
  const cellErrors = (det ?? []).filter(d => resolveColumnKeys(d).includes(lowerKey))
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
        <Search class="w-8 h-8 mx-auto mb-2 text-slate-300" />
        <p class="text-sm font-semibold text-slate-500">Sin resultados</p>
        <p class="text-xs text-slate-400 mt-1 max-w-xs">{{ emptyMessage }}</p>
      </div>
    </div>

    <template v-else>
      <div class="overflow-x-auto">
        <table class="w-full text-sm text-left">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-200">
              <th v-if="showEstatus" class="px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">Estatus</th>
              <th v-for="col in columns" :key="col.key" class="px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">{{ col.label }}</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="(row, i) in rows" :key="i">
              <tr class="border-b border-slate-100 transition-colors" :class="getRowTintClass(row)">
                <td v-if="showEstatus" class="px-4 py-3 whitespace-nowrap">
                  <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold" :class="getEstatusClass((row as any).estatus)">
                    <CheckCircle2 v-if="getEstatusIcon(row) === 'check'" class="w-3 h-3 flex-shrink-0" />
                    <XCircle v-else-if="getEstatusIcon(row) === 'x'" class="w-3 h-3 flex-shrink-0" />
                    <Circle v-else class="w-3 h-3 flex-shrink-0 opacity-60" />
                    {{ (row as any).estatus }}
                  </span>
                </td>
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
      <template v-if="detallePopover">
        <div class="fixed inset-0 z-[9998]" @click="closeDetalle" />
        <div
          class="fixed z-[9999] w-80 bg-white border border-red-200 rounded-xl shadow-2xl overflow-hidden"
          :style="{ left: detallePopover.x + 'px', top: detallePopover.y + 'px' }"
          @click.stop
        >
          <div class="bg-red-50 px-3 py-2 border-b border-red-200 flex items-center justify-between">
            <div class="flex items-center gap-1.5">
              <AlertCircle class="w-4 h-4 text-red-500" />
              <span class="text-sm font-semibold text-red-700">Detalle de errores</span>
            </div>
            <button @click="closeDetalle" class="p-0.5 rounded hover:bg-red-100 transition-colors text-red-400 hover:text-red-600">
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>
          <div class="max-h-64 overflow-y-auto">
            <div v-for="(err, idx) in detallePopover.errors" :key="idx" class="px-4 py-3 space-y-2" :class="{ 'border-t border-slate-100': idx > 0 }">
              <div class="flex flex-wrap gap-1.5">
                <span v-if="err.columna" class="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 text-[10px] font-medium text-slate-500">{{ err.columna }}</span>
                <span v-if="err.atributo" class="inline-flex items-center px-2 py-0.5 rounded-full bg-red-50 text-[10px] font-medium text-red-400">{{ err.atributo }}</span>
              </div>
              <p class="text-sm text-red-700 font-medium leading-snug">{{ cleanMsg(err.error || err.err || '') }}</p>
            </div>
          </div>
        </div>
      </template>
    </Teleport>
  </div>
</template>
