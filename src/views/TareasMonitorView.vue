<script setup lang="ts">
import TareasMonitorHeader from '@/components/tareas/monitor/TareasMonitorHeader.vue'
import TareasMonitorSummaryCards from '@/components/tareas/monitor/TareasMonitorSummaryCards.vue'
import TareasMonitorTable from '@/components/tareas/monitor/TareasMonitorTable.vue'
import TareaMonitorDetailsModal from '@/components/tareas/monitor/TareaMonitorDetailsModal.vue'
import ReportDownloadModal from '@/components/tareas/monitor/ReportDownloadModal.vue'
import TareaMonitorErrorModal from '@/components/tareas/monitor/TareaMonitorErrorModal.vue'
import { useTareasMonitorViewModel } from '@/composables/tareas/monitor/useTareasMonitorViewModel'
import { formatDateLabel, formatNumber, formatTimeLabel } from '@/utils/tareas/monitor/tareasMonitorFormat.utils'

const {
  activeTab,
  actividadOptions,
  canNextPage,
  canPrevPage,
  campanasOptions,
  closeReportModal,
  currentPage,
  detailsActionLoading,
  detailsItem,
  detailsStages,
  downloadReport,
  error,
  estatusOptions,
  filteredRows,
  getActividadLabel,
  getCampanaLabel,
  getHorarioLabel,
  getLineaLabel,
  getStatusClass,
  getStatusLabel,
  canApproveFor,
  canDictaminarFor,
  showApproveFor,
  showDictaminarFor,
  showErrorFor,
  canErrorFor,
  showErrorModal,
  errorItem,
  openErrorModal,
  closeErrorModal,
  handleSearch,
  handleTabChange,
  isLoading,
  isRowGlowing,
  lineasOptions,
  nextPage,
  openFilter,
  openDetails,
  openReportModal,
  paginatedRows,
  prevPage,
  reportDownloadLoading,
  refreshMonitorData,
  selectedActividades,
  selectedCampanas,
  selectedFecha,
  selectedEstatus,
  selectedLineas,
  showDetailsModal,
  showReportModal,
  maxFechaHoy,
  toggleFilter,
  closeDetails,
  approveStage,
  dictaminarStage,
  tabs,
  totalPages,
  totals
} = useTareasMonitorViewModel()

function updateSelectedLineas(value: number[]) {
  selectedLineas.value = value
}

function updateSelectedCampanas(value: number[]) {
  selectedCampanas.value = value
}

function updateSelectedActividades(value: number[]) {
  selectedActividades.value = value
}

function updateSelectedEstatus(value: number[]) {
  selectedEstatus.value = value
}

function updateSelectedFecha(value: string) {
  selectedFecha.value = value
}

</script>

<template>
  <div class="p-3 sm:p-4 lg:p-6 bg-slate-50 min-h-full font-sans text-slate-800">
    <div class="max-w-7xl mx-auto space-y-4">
      <TareasMonitorHeader
        :tabs="tabs"
        :active-tab="activeTab"
        @tab-change="handleTabChange"
        @refresh="refreshMonitorData"
        @download-report="openReportModal"
      />

      <Transition name="tab-fade" mode="out-in" appear>
        <div :key="`monitor-${activeTab}`" class="space-y-4">
          <TareasMonitorSummaryCards
            :totals="totals"
            :format-number="formatNumber"
          />

          <TareasMonitorTable
            :active-tab="activeTab"
            :is-loading="isLoading"
            :error="error"
            :open-filter="openFilter"
            :lineas-options="lineasOptions"
            :campanas-options="campanasOptions"
            :actividad-options="actividadOptions"
            :estatus-options="estatusOptions"
            :selected-lineas="selectedLineas"
            :selected-campanas="selectedCampanas"
            :selected-actividades="selectedActividades"
            :selected-estatus="selectedEstatus"
            :selected-fecha="selectedFecha"
            :max-fecha-hoy="maxFechaHoy"
            :paginated-rows="paginatedRows"
            :filtered-rows="filteredRows"
            :current-page="currentPage"
            :total-pages="totalPages"
            :can-prev-page="canPrevPage"
            :can-next-page="canNextPage"
            :is-row-glowing="isRowGlowing"
            :get-linea-label="getLineaLabel"
            :get-campana-label="getCampanaLabel"
            :get-actividad-label="getActividadLabel"
            :get-status-label="getStatusLabel"
            :get-status-class="getStatusClass"
            :format-date-label="formatDateLabel"
            :format-time-label="formatTimeLabel"
            :format-number="formatNumber"
            @toggle-filter="toggleFilter"
            @update:selected-lineas="updateSelectedLineas"
            @update:selected-campanas="updateSelectedCampanas"
            @update:selected-actividades="updateSelectedActividades"
            @update:selected-estatus="updateSelectedEstatus"
            @update:selected-fecha="updateSelectedFecha"
            @search="handleSearch"
            @prev-page="prevPage"
            @next-page="nextPage"
            @view-details="openDetails"
          />
        </div>
      </Transition>

      <TareaMonitorDetailsModal
        :show="showDetailsModal"
        :item="detailsItem"
        :stages="detailsStages"
        :loading="detailsActionLoading"
        :can-approve-for="canApproveFor"
        :can-dictaminar-for="canDictaminarFor"
        :show-approve-for="showApproveFor"
        :show-dictaminar-for="showDictaminarFor"
        :show-error-for="showErrorFor"
        :can-error-for="canErrorFor"
        :get-linea-label="getLineaLabel"
        :get-campana-label="getCampanaLabel"
        :get-status-class="getStatusClass"
        :get-horario-label="getHorarioLabel"
        :format-date-label="formatDateLabel"
        :format-time-label="formatTimeLabel"
        :format-number="formatNumber"
        @close="closeDetails"
        @approve="approveStage"
        @dictaminar="dictaminarStage"
        @view-error="openErrorModal"
      />

      <ReportDownloadModal
        :show="showReportModal"
        :loading="reportDownloadLoading"
        @close="closeReportModal"
        @download="downloadReport"
      />

      <TareaMonitorErrorModal
        :show="showErrorModal"
        :item="errorItem"
        @close="closeErrorModal"
      />
    </div>
  </div>
</template>
