import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

// Importación de las vistas
import MapeoView from '../views/MapeoView.vue'
import CampanaView from '../views/CampanaView.vue'
import TareasView from '../views/TareasView.vue'
import ReportesView from '../views/ReportesView.vue'

// Definición de rutas con tipado
const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/mapeo'
  },
  {
    path: '/mapeo',
    name: 'mapeo',
    component: MapeoView
  },
  {
    path: '/campana',
    name: 'campana',
    component: CampanaView
  },
  {
    path: '/tareas',
    name: 'tareas',
    component: TareasView
  },
  {
    path: '/reportes',
    name: 'reportes',
    component: ReportesView
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router