<script setup lang="ts">
import ReportesHeader from '@/components/reportes/ReportesHeader.vue'
import ReportesFilters from '@/components/reportes/ReportesFilters.vue'
import ReportesIndividualTable from '@/components/reportes/ReportesIndividualTable.vue'
import ReportesGeneralFilters from '@/components/reportes/ReportesGeneralFilters.vue'
import ReportesGeneralSummary from '@/components/reportes/ReportesGeneralSummary.vue'
import ReportesGeneralTable from '@/components/reportes/ReportesGeneralTable.vue'
import { useReportesViewModel } from '@/composables/reportes/useReportesViewModel'

const {
  tipo,
  form,
  formErrors,
  isLoading,
  error,
  hasQueried,
  exportLoading,
  lineasCatalogo,
  campanasCatalogo,
  paginatedCL,
  paginatedPET,
  resultCount,
  currentPage,
  totalPages,
  canPrevPage,
  canNextPage,
  scopeTabs,
  consultaMode,
  consultaModeTabs,
  handleScopeChange,
  handleConsultar,
  handleClear,
  handleExportCsv,
  handleExportPdf,
  prevPage,
  nextPage,
  supportsGeneral,
  generalTipo,
  generalForm,
  generalFormErrors,
  generalIsLoading,
  generalError,
  generalHasQueried,
  generalResultCount,
  generalCurrentPage,
  generalTotalPages,
  generalCanPrevPage,
  generalCanNextPage,
  paginatedGeneralRows,
  generalSummary,
  handleGeneralConsultar,
  handleGeneralClear,
  handleGeneralExportCsv,
  handleGeneralExportPdf,
  generalExportLoading,
  generalPrevPage,
  generalNextPage
} = useReportesViewModel('envio')

function updateCL(field: string, value: string) {
  ;(form.cl as any)[field] = value
}
function updatePET(field: string, value: string) {
  ;(form.pet as any)[field] = value
}
</script>

<template>
  <div class="p-3 sm:p-4 lg:p-6 bg-slate-50 min-h-full font-sans text-slate-800">
    <div class="max-w-7xl mx-auto space-y-4">
      <ReportesHeader
        :tabs="scopeTabs"
        :active-tab="form.scope"
        title="Reportes Responsys"
        subtitle="Consulta y exportación de reportes de envío."
        @tab-change="handleScopeChange"
      />

      <div v-if="supportsGeneral" class="bg-white p-1 rounded-lg border border-slate-200 flex w-full sm:w-auto sm:inline-flex">
        <button
          v-for="t in consultaModeTabs"
          :key="t.key"
          @click="consultaMode = t.key"
          class="flex-1 sm:flex-none sm:min-w-[160px] px-4 py-1.5 text-sm font-medium rounded-md transition-all duration-200 cursor-pointer"
          :class="consultaMode === t.key
            ? 'bg-[#00357F] text-white'
            : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'"
        >
          {{ t.label }}
        </button>
      </div>

      <div v-if="consultaMode === 'individual'" class="space-y-2">
        <ReportesFilters
          :scope="form.scope"
          :id-linea-negocio="form.idLineaNegocio"
          :id-campana="form.idCampana"
          :cl="form.cl"
          :pet="form.pet"
          :lineas-catalogo="lineasCatalogo"
          :campanas-catalogo="campanasCatalogo"
          :is-loading="isLoading"
          :export-loading="exportLoading"
          :has-results="resultCount > 0"
          :form-errors="formErrors"
          @update:id-linea-negocio="form.idLineaNegocio = $event"
          @update:id-campana="form.idCampana = $event"
          @update-cl="updateCL"
          @update-pet="updatePET"
          @consultar="handleConsultar"
          @clear="handleClear"
          @export-csv="handleExportCsv"
          @export-pdf="handleExportPdf"
        />

        <div v-if="error" class="bg-red-50 border border-red-200 rounded-xl p-4">
          <p class="text-sm font-semibold text-red-700">Error al consultar el reporte</p>
          <p class="text-xs text-red-600 mt-1">{{ error }}</p>
        </div>

        <ReportesIndividualTable
          v-if="hasQueried && !error"
          :registros-c-l="paginatedCL"
          :registros-p-e-t="paginatedPET"
          :total-rows="resultCount"
          :current-page="currentPage"
          :total-pages="totalPages"
          :can-prev-page="canPrevPage"
          :can-next-page="canNextPage"
          :is-loading="isLoading"
          :scope="form.scope"
          :tipo="tipo"
          @prev-page="prevPage"
          @next-page="nextPage"
        />

        <div v-else-if="!hasQueried && !isLoading" class="bg-white border border-slate-200 rounded-xl p-12 text-center">
          <p class="text-sm text-slate-400">Selecciona los filtros y presiona <strong>Consultar</strong> para ver resultados.</p>
        </div>
      </div>

      <div v-if="consultaMode === 'general' && supportsGeneral" class="space-y-2">
        <ReportesGeneralFilters
          :scope="generalForm.scope"
          :id-linea-negocio="generalForm.idLineaNegocio"
          :id-campana="generalForm.idCampana"
          :cl="generalForm.cl"
          :pet="generalForm.pet"
          :lineas-catalogo="lineasCatalogo"
          :campanas-catalogo="campanasCatalogo"
          :is-loading="generalIsLoading"
          :export-loading="generalExportLoading"
          :has-results="generalResultCount > 0"
          :form-errors="generalFormErrors"
          @update:id-linea-negocio="generalForm.idLineaNegocio = $event"
          @update:id-campana="generalForm.idCampana = $event"
          @update-cl="(f, v) => { (generalForm.cl as any)[f] = v }"
          @update-pet="(f, v) => { (generalForm.pet as any)[f] = v }"
          @consultar="handleGeneralConsultar"
          @clear="handleGeneralClear"
          @export-csv="handleGeneralExportCsv"
          @export-pdf="(opts: any) => handleGeneralExportPdf(opts)"
        />

        <div v-if="generalError" class="bg-red-50 border border-red-200 rounded-xl p-4">
          <p class="text-sm font-semibold text-red-700">Error al consultar el reporte general</p>
          <p class="text-xs text-red-600 mt-1">{{ generalError }}</p>
        </div>

        <template v-if="generalHasQueried && !generalError">
          <ReportesGeneralSummary :summary="generalSummary" :tipo="generalTipo" />

          <ReportesGeneralTable
            :rows="paginatedGeneralRows"
            :total-rows="generalResultCount"
            :current-page="generalCurrentPage"
            :total-pages="generalTotalPages"
            :can-prev-page="generalCanPrevPage"
            :can-next-page="generalCanNextPage"
            :is-loading="generalIsLoading"
            :scope="generalForm.scope"
            :tipo="generalTipo"
            @prev-page="generalPrevPage"
            @next-page="generalNextPage"
          />
        </template>

        <div v-else-if="!generalHasQueried && !generalIsLoading" class="bg-white border border-slate-200 rounded-xl p-12 text-center">
          <p class="text-sm text-slate-400">Selecciona las fechas y presiona <strong>Consultar</strong> para ver resultados generales.</p>
        </div>
      </div>
    </div>
  </div>
</template>
