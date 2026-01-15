<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <aside class="sidebar">
    <div class="logo">
      <h2>Admin ABC Responsys</h2>
    </div>
    <nav>
      <p class="p-label">Configuraciones</p>
      <ul>
        <li>
          <RouterLink to="/mapeo" active-class="active">Mapeos</RouterLink>
        </li>
        <li>
          <RouterLink to="/campana" active-class="active">Columnas</RouterLink>
        </li>
        <li>
          <RouterLink to="/actividades" active-class="active">Actividades</RouterLink>
        </li>
      </ul>
      <p class="p-label">Monitoreo</p>
      <ul>
        <li>
          <RouterLink to="/tareas" active-class="active">Tareas</RouterLink>
        </li>
      </ul>
      <p class="p-label">Reportes</p>
      <ul>
        <li>
          <RouterLink to="/reportes/BI" active-class="active">BI</RouterLink>
        </li>
        <li>
          <RouterLink to="/reportes/BI" active-class="active">ABC</RouterLink>
        </li>
        <li>
          <RouterLink to="/reportes/BI" active-class="active">Responsys</RouterLink>
        </li>
      </ul>

    </nav>
  </aside>
</template>

<style scoped>
.sidebar {
  width: 250px;
  background-color: #2c3e50;
  color: white;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.logo {
  padding: 20px;
  background-color: #1a252f;
  text-align: center;
}

.logo h2 { margin: 0; font-size: 1.2rem; }
.logo p { margin: 5px 0 0; font-size: 0.8rem; color: #bdc3c7; }

nav ul { list-style: none; padding: 0; margin: 0; }
nav li { border-bottom: 1px solid #34495e; }

a {
  display: block;
  padding: 15px 20px;
  color: #ecf0f1;
  text-decoration: none;
  transition: background 0.3s;
}

a:hover, a.active {
  background-color: #3498db;
}
</style>