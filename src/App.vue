<script setup>
import Sidebar from './components/Sidebar.vue'
import { RouterView } from 'vue-router'
</script>

<template>
  <div class="layout">
    <Sidebar />
    <main class="content">
      <RouterView />
    </main>
  </div>
</template>

<style>
/* Estilos globales básicos */
body { margin: 0; font-family: 'Segoe UI', sans-serif; background-color: #ecf0f1; }
.layout { display: flex; min-height: 100vh; }
.content { flex: 1; padding: 40px; overflow-y: auto; }
</style>