import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { navigationGuard } from '@okta/okta-vue'
import LoginCallbackWrapper from '@/components/auth/LoginCallbackWrapper.vue'
import { oktaAuth } from '@/lib/okta'

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
    component: LoginCallbackWrapper
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
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/login'
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

router.beforeEach(navigationGuard)

router.beforeEach(async (to) => {
  if (to.meta.requiresAuth) {
    const isAuthenticated = await oktaAuth.isAuthenticated()
    if (!isAuthenticated) {
      return { path: '/login' }
    }
  }
  if (to.path === '/login') {
    const isAuthenticated = await oktaAuth.isAuthenticated()
    if (isAuthenticated) {
      return { path: '/mapeo' }
    }
  }
  return undefined
})

export default router

