<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <aside class="h-screen w-72 bg-gradient-to-b from-[#00357F] to-[#002559] text-white flex flex-col shadow-2xl font-sans relative overflow-hidden">
    
    <div class="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>

    <div class="relative z-10 px-8 py-10 flex items-center gap-3">
      <div>
        <h2 class="text-xl font-extrabold tracking-tight leading-none text-white">
          ABC Responsys
        </h2>
        <p class="text-[10px] text-blue-200 uppercase tracking-widest font-medium mt-1">Panel de administración</p>
      </div>
    </div>

    <nav class="flex-1 overflow-y-auto px-4 pb-6 space-y-8 scrollbar-hide">
      
      <div>
        <p class="px-4 text-[11px] font-bold text-blue-300/80 uppercase tracking-[0.2em] mb-3">
          Configuración
        </p>
        <ul class="space-y-2">
          <li>
            <RouterLink to="/mapeo" class="group flex items-center gap-3 px-4 py-3.5 text-sm font-medium rounded-xl transition-all duration-300 hover:bg-white/10 hover:translate-x-1" active-class="!bg-[#FFD100] !text-[#002559] shadow-lg shadow-yellow-500/20 font-bold scale-[1.02]">
              <svg class="w-5 h-5 opacity-70 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
              <span>Mapeos</span>
            </RouterLink>
          </li>
          <li>
            <RouterLink to="/campana" class="group flex items-center gap-3 px-4 py-3.5 text-sm font-medium rounded-xl transition-all duration-300 hover:bg-white/10 hover:translate-x-1" active-class="!bg-[#FFD100] !text-[#002559] shadow-lg shadow-yellow-500/20 font-bold scale-[1.02]">
              <svg class="w-5 h-5 opacity-70 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
              <span>Columnas</span>
            </RouterLink>
          </li>
          <li>
            <RouterLink to="/actividades" class="group flex items-center gap-3 px-4 py-3.5 text-sm font-medium rounded-xl transition-all duration-300 hover:bg-white/10 hover:translate-x-1" active-class="!bg-[#FFD100] !text-[#002559] shadow-lg shadow-yellow-500/20 font-bold scale-[1.02]">
              <svg class="w-5 h-5 opacity-70 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              <span>Actividades</span>
            </RouterLink>
          </li>
        </ul>
      </div>

      <div>
        <p class="px-4 text-[11px] font-bold text-blue-300/80 uppercase tracking-[0.2em] mb-3">
          Monitoreo
        </p>
        <ul class="space-y-2">
          <li>
            <RouterLink to="/tareas" class="group flex items-center gap-3 px-4 py-3.5 text-sm font-medium rounded-xl transition-all duration-300 hover:bg-white/10 hover:translate-x-1" active-class="!bg-[#FFD100] !text-[#002559] shadow-lg shadow-yellow-500/20 font-bold scale-[1.02]">
              <svg class="w-5 h-5 opacity-70 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
              <span>Tareas</span>
              <span class="ml-auto bg-blue-500 text-white text-[10px] py-0.5 px-2 rounded-full shadow-sm">3</span>
            </RouterLink>
          </li>
        </ul>
      </div>

      <div>
        <p class="px-4 text-[11px] font-bold text-blue-300/80 uppercase tracking-[0.2em] mb-3">
          Reportes
        </p>
        <ul class="space-y-2">
          <li>
            <RouterLink to="/reportes/BI" class="group flex items-center gap-3 px-4 py-3.5 text-sm font-medium rounded-xl transition-all duration-300 hover:bg-white/10 hover:translate-x-1" active-class="!bg-[#FFD100] !text-[#002559] shadow-lg shadow-yellow-500/20 font-bold scale-[1.02]">
              <svg class="w-5 h-5 opacity-70 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              <span>Business Intel</span>
            </RouterLink>
          </li>
          <li>
            <RouterLink to="/reportes/ABC" class="group flex items-center gap-3 px-4 py-3.5 text-sm font-medium rounded-xl transition-all duration-300 hover:bg-white/10 hover:translate-x-1" active-class="!bg-[#FFD100] !text-[#002559] shadow-lg shadow-yellow-500/20 font-bold scale-[1.02]">
               <svg class="w-5 h-5 opacity-70 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              <span>ABC Report</span>
            </RouterLink>
          </li>
          <li>
            <RouterLink to="/reportes/Responsys" class="group flex items-center gap-3 px-4 py-3.5 text-sm font-medium rounded-xl transition-all duration-300 hover:bg-white/10 hover:translate-x-1" active-class="!bg-[#FFD100] !text-[#002559] shadow-lg shadow-yellow-500/20 font-bold scale-[1.02]">
              <svg class="w-5 h-5 opacity-70 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" /></svg>
              <span>Responsys</span>
            </RouterLink>
          </li>
        </ul>
      </div>

    </nav>

    <div class="p-4 bg-[#001f4d]">
      <div class="flex items-center gap-3 p-2 rounded-xl bg-white/5 hover:bg-white/10 cursor-pointer transition-colors">
        <div class="w-8 h-8 rounded-full bg-blue-400 flex items-center justify-center text-[#002559] font-bold text-xs">
          AR
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-white truncate">Admin User</p>
          <p class="text-xs text-blue-300 truncate">admin@abc.com</p>
        </div>
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