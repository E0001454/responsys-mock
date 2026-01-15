<script setup>
import CrudTable from '../components/CrudTable.vue'

const headers = ['Nombre Campaña', 'Tipo Mensaje', 'Fecha Ejecución', 'Segmento']
const data = [
  { nombre: 'Bienvenida', tipo: 'Email', fecha: '2026-02-01', segmento: 'Nuevos' },
  { nombre: 'Campaña 1', tipo: 'SMS', fecha: 'Inmediata', segmento: 'Todos' },
  { nombre: 'Campaña 2', tipo: 'Push', fecha: 'Automática', segmento: 'Todos' }
]
</script>

<template>
  <CrudTable titulo="1.2 Configurar columnas" :columnas="headers" :datos="data" />
</template>