/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL_REAL?: string
  readonly VITE_API_URL_MOCK?: string
  readonly VITE_USE_MOCK?: string

  readonly VITE_MS_CATALOGOS_REAL?: string
  readonly VITE_MS_CATALOGOS_MOCK?: string
  readonly VITE_MS_CATALOGOS_USE_MOCK?: string
  readonly VITE_MS_MAPEOS_LINEA_REAL?: string
  readonly VITE_MS_MAPEOS_LINEA_MOCK?: string
  readonly VITE_MS_MAPEOS_LINEA_USE_MOCK?: string
  readonly VITE_MS_MAPEOS_CAMPANA_REAL?: string
  readonly VITE_MS_MAPEOS_CAMPANA_MOCK?: string
  readonly VITE_MS_MAPEOS_CAMPANA_USE_MOCK?: string
  readonly VITE_MS_TAREAS_LINEA_REAL?: string
  readonly VITE_MS_TAREAS_LINEA_MOCK?: string
  readonly VITE_MS_TAREAS_LINEA_USE_MOCK?: string
  readonly VITE_MS_TAREAS_CAMPANA_REAL?: string
  readonly VITE_MS_TAREAS_CAMPANA_MOCK?: string
  readonly VITE_MS_TAREAS_CAMPANA_USE_MOCK?: string
  readonly VITE_MS_COLUMNAS_LINEA_REAL?: string
  readonly VITE_MS_COLUMNAS_LINEA_MOCK?: string
  readonly VITE_MS_COLUMNAS_LINEA_USE_MOCK?: string
  readonly VITE_MS_COLUMNAS_CAMPANA_REAL?: string
  readonly VITE_MS_COLUMNAS_CAMPANA_MOCK?: string
  readonly VITE_MS_COLUMNAS_CAMPANA_USE_MOCK?: string
  readonly VITE_MS_BITACORA_REAL?: string
  readonly VITE_MS_BITACORA_MOCK?: string
  readonly VITE_MS_BITACORA_USE_MOCK?: string
  readonly VITE_MS_HORARIOS_LINEA_REAL?: string
  readonly VITE_MS_HORARIOS_LINEA_MOCK?: string
  readonly VITE_MS_HORARIOS_LINEA_USE_MOCK?: string
  readonly VITE_MS_HORARIOS_CAMPANA_REAL?: string
  readonly VITE_MS_HORARIOS_CAMPANA_MOCK?: string
  readonly VITE_MS_HORARIOS_CAMPANA_USE_MOCK?: string
  readonly VITE_MS_MONITOR_LINEA_REAL?: string
  readonly VITE_MS_MONITOR_LINEA_MOCK?: string
  readonly VITE_MS_MONITOR_LINEA_USE_MOCK?: string
  readonly VITE_MS_MONITOR_CAMPANA_REAL?: string
  readonly VITE_MS_MONITOR_CAMPANA_MOCK?: string
  readonly VITE_MS_MONITOR_CAMPANA_USE_MOCK?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module 'jspdf-autotable' {
  const autoTable: any
  export default autoTable
}
