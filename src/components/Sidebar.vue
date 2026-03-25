<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useAuth } from '@/composables/okta/useAuth'
import logo from '../assets/img/logo.webp'
import { 
  LayoutGrid, 
  Activity, 
  ClipboardCheck, 
  Database, 
  ArrowRightLeft, 
  Mail,
  UserCircle,
  LogOut,
} from 'lucide-vue-next'

interface Props {
  isOpenMobile?: boolean
}

interface Emits {
  (e: 'close-mobile'): void
}

const props = withDefaults(defineProps<Props>(), {
  isOpenMobile: false
})

const emit = defineEmits<Emits>()

const logoUrl = logo


const { oktaAuth } = useAuth()

const logout = async () => {
  await oktaAuth.signOut()
}
</script>

<template>
  <aside
    class="fixed inset-y-0 left-0 z-[55] h-screen w-64 bg-[#00357F] text-white flex flex-col border-r border-blue-900 shadow-xl font-sans transform transition-transform duration-300 ease-in-out lg:static lg:translate-x-0"
    :class="props.isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'"
  >
    
    <div class="h-20 flex items-center justify-center px-6 border-b border-white/10 bg-[#002a66]">
      <img 
        :src="logoUrl" 
        alt="ABC Logo" 
        class="h-7 w-auto object-contain"
      />
    </div>

    <nav class="flex-1 overflow-y-auto px-3 py-6 space-y-8 scrollbar-hide">
      
      <div>
        <h1 class="px-2 text-[18px] font-bold mb-4">Sistema ABC</h1>
        <p class="px-3 text-[10px] font-bold text-blue-200/60 uppercase tracking-widest mb-2">
          Configuración
        </p>
        <ul class="space-y-1">
          <li>
            <RouterLink 
              to="/mapeo" 
              class="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 group text-blue-100 hover:text-white hover:bg-white/10"
              active-class="!bg-[#FFD100] !text-[#00357F] font-bold shadow-md"
              @click="emit('close-mobile')"
            >
              <LayoutGrid class="w-4 h-4" />
              <span>Mapeos</span>
            </RouterLink>
          </li>

          <li>
            <RouterLink 
              to="/tareas" 
              class="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 group text-blue-100 hover:text-white hover:bg-white/10"
              active-class="!bg-[#FFD100] !text-[#00357F] font-bold shadow-md"
              @click="emit('close-mobile')"
            >
              <ClipboardCheck class="w-4 h-4" />
              <span>Tareas</span>
            </RouterLink>
          </li>
           
        </ul>
      </div>

      <div>
        <p class="px-3 text-[10px] font-bold text-blue-200/60 uppercase tracking-widest mb-2">
          Monitoreo
        </p>
        <ul class="space-y-1">
          <li>
            <RouterLink 
              to="/tareas-monitor" 
              class="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 group text-blue-100 hover:text-white hover:bg-white/10"
              active-class="!bg-[#FFD100] !text-[#00357F] font-bold shadow-md"
              @click="emit('close-mobile')"
            >
              <Activity class="w-4 h-4" />
              <span class="flex-1">Tareas</span>
              <span class="bg-blue-600/50 group-hover:bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full transition-colors">
                3
              </span>
            </RouterLink>
          </li>
        </ul>
      </div>

      <div>
        <p class="px-3 text-[10px] font-bold text-blue-200/60 uppercase tracking-widest mb-2">
            Reportes
        </p>
        <ul class="space-y-1">
          <li>
            <RouterLink 
              to="/" 
              class="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 group text-blue-100 hover:text-white hover:bg-white/10"
              active-class="!bg-[#FFD100] !text-[#00357F] font-bold shadow-md"
              @click="emit('close-mobile')"
            >
              <Database class="w-4 h-4" />
              <span>BI</span>
            </RouterLink>
          </li>
          <li>
            <RouterLink 
              to="/" 
              class="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 group text-blue-100 hover:text-white hover:bg-white/10"
              active-class="!bg-[#FFD100] !text-[#00357F] font-bold shadow-md"
              @click="emit('close-mobile')"
            >
              <ArrowRightLeft class="w-4 h-4" />
              <span>ABC</span>
            </RouterLink>
          </li>
          <li>
            <RouterLink 
              to="/" 
              class="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 group text-blue-100 hover:text-white hover:bg-white/10"
              active-class="!bg-[#FFD100] !text-[#00357F] font-bold shadow-md"
              @click="emit('close-mobile')"
            >
              <Mail class="w-4 h-4" />
              <span>Responsys</span>
            </RouterLink>
          </li>
        </ul>
      </div>

    </nav>

    <div class="p-4 border-t border-white/10 bg-[#002a66]">
      <div class="flex items-center gap-3 group cursor-pointer">
        <div class="w-9 h-9 rounded-full bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-200 group-hover:bg-[#FFD100] group-hover:text-[#00357F] transition-colors">
          <UserCircle class="w-5 h-5" />
        </div>
        
        <div class="flex-1 min-w-0">
          <p class="text-sm font-semibold text-white truncate group-hover:text-[#FFD100] transition-colors">
            Admin User
          </p>
          <p class="text-[11px] text-blue-300 truncate">
            admin@abc.com
          </p>
        </div>

        <button class="text-blue-300 hover:text-red-400 transition-colors" title="Cerrar sesión" @click="logout">
            <LogOut class="w-4 h-4" />
        </button>
      </div>
    </div>

  </aside>
</template>

<style scoped>

.scrollbar-hide::-webkit-scrollbar {
    display: none;
}
.scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
}
</style>