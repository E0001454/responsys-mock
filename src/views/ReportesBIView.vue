<script setup lang="ts">
import ReportesHeader from '@/components/reportes/ReportesHeader.vue'
import ReportesFilters from '@/components/reportes/ReportesFilters.vue'
import ReportesIndividualTable from '@/components/reportes/ReportesIndividualTable.vue'
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
  handleScopeChange,
  handleConsultar,
  handleClear,
  handleExportCsv,
  handleExportPdf,
  prevPage,
  nextPage
} = useReportesViewModel('carga')

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
        title="Reportes BI"
        subtitle="Consulta y exportación de reportes de carga."
        @tab-change="handleScopeChange"
      />

      <ReportesFilters
        :scope="form.scope"
        :id-linea="form.idLinea"
        :id-campana="form.idCampana"
        :cl="form.cl"
        :pet="form.pet"
        :lineas-catalogo="lineasCatalogo"
        :campanas-catalogo="campanasCatalogo"
        :is-loading="isLoading"
        :export-loading="exportLoading"
        :has-results="resultCount > 0"
        :form-errors="formErrors"
        @update:id-linea="form.idLinea = $event"
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
  </div>
</template>
