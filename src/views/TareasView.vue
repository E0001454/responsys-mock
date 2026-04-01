<script setup lang="ts">
import TareaLineaTable from '@/components/tareas/linea/TareaLineaTable.vue'
import TareaCampanaTable from '@/components/tareas/campana/TareaCampanaTable.vue'
import TareaLineaModal from '@/components/tareas/linea/TareaLineaModal.vue'
import TareaCampanaModal from '@/components/tareas/campana/TareaCampanaModal.vue'
import TareaLineaDetailsModal from '@/components/tareas/linea/TareaLineaDetailsModal.vue'
import TareaCampanaDetailsModal from '@/components/tareas/campana/TareaCampanaDetailsModal.vue'
import TareaSaveProgressOverlay from '@/components/tareas/shared/TareaSaveProgressOverlay.vue'
import TareasHeader from '@/components/tareas/shared/TareasHeader.vue'
import FormActionConfirmModal from '@/components/shared/FormActionConfirmModal.vue'
import { useTareasViewModel, type TareaLineaRow, type TareaCampanaRow } from '@/composables/tareas/useTareasViewModel'

const {
  tabs,
  activeTab,
  lineasDisponibles,
  campanasDisponibles,
  diasDisponibles,
  horasDisponibles,
  ejecucionesDisponibles,
  isLoadingLinea,
  isLoadingCampana,
  selectedFiltersLinea,
  selectedFiltersCampana,
  openFilterLinea,
  openFilterCampana,
  paginatedTareasLinea,
  paginatedTareasCampana,
  filteredTareasLinea,
  filteredTareasCampana,
  currentPageLinea,
  currentPageCampana,
  totalPagesLinea,
  totalPagesCampana,
  canPrevPageLinea,
  canNextPageLinea,
  canPrevPageCampana,
  canNextPageCampana,
  showModal,
  modalMode,
  modalTab,
  selectedItem,
  mapeosLineaForModal,
  mapeosCampanaForModal,
  showDetailsModal,
  detailTab,
  detailItem,
  isLoadingDetails,
  showSaveProgress,
  saveProgressAction,
  saveProgressCompleted,
  saveProgressTotal,
  showStatusConfirmModal,
  statusConfirmTitle,
  statusConfirmMessage,
  statusConfirmLoading,
  getLineaLabel,
  getCampanaLabel,
  handleTabChange,
  openAddModal,
  closeModal,
  handleSave,
  openDetails,
  closeDetailsModal,
  openEdit,
  requestStatusToggle,
  closeStatusConfirmModal,
  confirmStatusToggle,
  toggleFilterMenuLinea,
  toggleFilterMenuCampana,
  handleSearchLinea,
  handleSearchCampana,
  prevPageLinea,
  nextPageLinea,
  prevPageCampana,
  nextPageCampana
} = useTareasViewModel()
</script>

<template>
  <div class="p-3 sm:p-4 lg:p-6 bg-slate-50 min-h-full font-sans text-slate-800" @click.self="openFilterLinea = null; openFilterCampana = null">
    <div class="max-w-7xl mx-auto space-y-4">
      <TareasHeader
        :tabs="tabs"
        :active-tab="activeTab"
        @tab-change="handleTabChange"
        @add="openAddModal"
      />

      <Transition name="tab-fade" mode="out-in" appear>
        <TareaLineaTable
          v-if="activeTab === 'linea'"
          key="tareas-linea"
          :lineas-disponibles="lineasDisponibles"
          :selected-filters="selectedFiltersLinea"
          :open-filter="openFilterLinea"
          :filtered-tareas="paginatedTareasLinea"
          :total-tareas="filteredTareasLinea.length"
          :current-page="currentPageLinea"
          :total-pages="totalPagesLinea"
          :can-prev-page="canPrevPageLinea"
          :can-next-page="canNextPageLinea"
          :is-loading="isLoadingLinea"
          :get-linea-label="getLineaLabel"
          @toggle-filter="toggleFilterMenuLinea"
          @view-details="openDetails"
          @toggle-status="requestStatusToggle"
          @edit="openEdit"
          @select-all-lineas="selectedFiltersLinea.lineas = lineasDisponibles.map(x => x.value)"
          @prev-page="prevPageLinea"
          @next-page="nextPageLinea"
          @search="handleSearchLinea"
        />

        <TareaCampanaTable
          v-else
          key="tareas-campana"
          :lineas-disponibles="lineasDisponibles"
          :campanas-disponibles="campanasDisponibles"
          :selected-filters="selectedFiltersCampana"
          :open-filter="openFilterCampana"
          :filtered-tareas="paginatedTareasCampana"
          :total-tareas="filteredTareasCampana.length"
          :current-page="currentPageCampana"
          :total-pages="totalPagesCampana"
          :can-prev-page="canPrevPageCampana"
          :can-next-page="canNextPageCampana"
          :is-loading="isLoadingCampana"
          :get-linea-label="getLineaLabel"
          :get-campana-label="getCampanaLabel"
          @toggle-filter="toggleFilterMenuCampana"
          @view-details="openDetails"
          @toggle-status="requestStatusToggle"
          @edit="openEdit"
          @select-all-lineas="selectedFiltersCampana.lineas = lineasDisponibles.map(x => x.value)"
          @select-all-campanas="selectedFiltersCampana.campanas = campanasDisponibles.map(x => x.value)"
          @prev-page="prevPageCampana"
          @next-page="nextPageCampana"
          @search="handleSearchCampana"
        />
      </Transition>

      <TareaLineaModal
        v-if="modalTab === 'linea'"
        :show="showModal"
        :mode="modalMode"
        :lineas-disponibles="lineasDisponibles"
        :mapeos-linea="mapeosLineaForModal"
        :dias-disponibles="diasDisponibles"
        :horas-disponibles="horasDisponibles"
        :ejecuciones-disponibles="ejecucionesDisponibles"
        :initial-data="selectedItem"
        :is-loading="isLoadingLinea"
        @save="handleSave"
        @close="closeModal"
      />

      <TareaCampanaModal
        v-if="modalTab === 'campana'"
        :show="showModal"
        :mode="modalMode"
        :lineas-disponibles="lineasDisponibles"
        :campanas-disponibles="campanasDisponibles"
        :mapeos-campana="mapeosCampanaForModal"
        :dias-disponibles="diasDisponibles"
        :horas-disponibles="horasDisponibles"
        :ejecuciones-disponibles="ejecucionesDisponibles"
        :initial-data="selectedItem"
        :is-loading="isLoadingCampana"
        @save="handleSave"
        @close="closeModal"
      />

      <TareaLineaDetailsModal
        v-if="detailTab === 'linea'"
        :show="showDetailsModal"
        :is-loading="isLoadingDetails"
        :item="detailItem as TareaLineaRow | null"
        :get-linea-label="getLineaLabel"
        :ejecuciones-disponibles="ejecucionesDisponibles"
        :horas-disponibles="horasDisponibles"
        @close="closeDetailsModal"
      />

      <TareaCampanaDetailsModal
        v-if="detailTab === 'campana'"
        :show="showDetailsModal"
        :is-loading="isLoadingDetails"
        :item="detailItem as TareaCampanaRow | null"
        :get-linea-label="getLineaLabel"
        :get-campana-label="getCampanaLabel"
        :ejecuciones-disponibles="ejecucionesDisponibles"
        :horas-disponibles="horasDisponibles"
        @close="closeDetailsModal"
      />

      <TareaSaveProgressOverlay
        :show="showSaveProgress"
        title="Guardando configuración de tareas"
        :current-action="saveProgressAction"
        :completed="saveProgressCompleted"
        :total="saveProgressTotal"
      />

      <FormActionConfirmModal
        :show="showStatusConfirmModal"
        :title="statusConfirmTitle"
        :message="statusConfirmMessage"
        confirm-text="Aceptar"
        cancel-text="Cancelar"
        :is-loading="statusConfirmLoading"
        @confirm="confirmStatusToggle"
        @cancel="closeStatusConfirmModal"
      />
    </div>
  </div>
</template>
