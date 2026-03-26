import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { LoginCallback, navigationGuard } from '@okta/okta-vue'

import MapeoView from '../views/MapeoView.vue'
import ColumnasView from '../views/ColumnasView.vue'
import TareasView from '../views/TareasView.vue'
import TareasMonitorView from '../views/TareasMonitorView.vue'
import LoginView from '../components/auth/login.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/login',
    name: 'login',
    component: LoginView
  },
  {
    path: '/login/callback',
    name: 'login-callback',
    component: LoginCallback
  },
  {
    path: '/',
    redirect: '/mapeo',
    meta: { requiresAuth: true }
  },
  {
    path: '/mapeo',
    name: 'mapeo',
    component: MapeoView,
    meta: { requiresAuth: true }
  },
  {
    path: '/columnas',
    name: 'columnas',
    component: ColumnasView,
    meta: { requiresAuth: true }
  },
  {
    path: '/tareas',
    name: 'tareas',
    component: TareasView,
    meta: { requiresAuth: true }
  },
  {
    path: '/tareas-monitor',
    name: 'tareas-monitor',
    component: TareasMonitorView,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

router.beforeEach(navigationGuard)

export default router


// import { createRouter, createWebHistory } from 'vue-router'
// import { LoginCallback, navigationGuard } from '@okta/okta-vue'

// const routes=[
//     {path:'/', component: () => import('../views/HomeView.vue')},
//     {path:'/login/callback', component: LoginCallback},
//     {
//         path: '/dashboard',
//         component:() => import('../views/DashboardView.vue'),
//         meta: { requiresAuth: true }
//     }
// ]

// const router = createRouter({
//     history: createWebHistory(),
//     routes
// })

// router.beforeEach(navigationGuard)
// export default router