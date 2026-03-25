<template>
  <div class="container">
    <div class="status-badge" :class="isAuthenticated ? 'authenticated' : 'not-authenticated'">
      <span v-if="isAuthenticated" class="status-text">✓ Logeado</span>
      <!-- <span v-else class="status-text">✗ No logeado</span> -->
    </div>

    <div v-if="!isAuthenticated" class="message">
      <p>Debes iniciar sesión para acceder a la aplicación</p>
    </div>

    <!-- <div v-if="isAuthenticated" class="user-info">
      <p>Bienvenido, estás autenticado</p>
    </div> -->

    <div class="buttons">
      <button v-if="!isAuthenticated" @click="login" class="btn btn-login">
        Iniciar Sesión
      </button>
      <!-- <button v-if="isAuthenticated" @click="logout" class="btn btn-logout">
        Cerrar Sesión
      </button> -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuth } from '@/composables/okta/useAuth'

const { oktaAuth } = useAuth()
const isAuthenticated = ref(false)

onMounted(async () => {
  try {
    isAuthenticated.value = await oktaAuth.isAuthenticated()
  } catch (error) {
    console.error('Error checking authentication:', error)
  }
})

const login = async () => {
  try {
    await oktaAuth.signInWithRedirect()
  } catch (error) {
    console.error('Error during login:', error)
  }
}

</script>

<style scoped>
.container {
  max-width: 600px;
  margin: 0 auto;
  padding: 40px 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}

.status-badge {
  display: inline-block;
  padding: 10px 20px;
  border-radius: 20px;
  margin-bottom: 30px;
  font-weight: 600;
  font-size: 16px;
  transition: all 0.3s ease;
}

.status-badge.authenticated {
  background-color: #4caf50;
  color: white;
}

.status-badge.not-authenticated {
  background-color: #f44336;
  color: white;
}

.status-text {
  display: flex;
  align-items: center;
  gap: 8px;
}

.message {
  background-color: #fff3cd;
  border: 1px solid #ffc107;
  border-radius: 8px;
  padding: 15px 20px;
  margin-bottom: 20px;
  color: #856404;
  font-size: 16px;
}

.user-info {
  background-color: #d4edda;
  border: 1px solid #28a745;
  border-radius: 8px;
  padding: 15px 20px;
  margin-bottom: 20px;
  color: #155724;
  font-size: 16px;
}

.buttons {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.btn {
  padding: 12px 30px;
  font-size: 16px;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.btn-login {
  background-color: #2196f3;
  color: white;
}

.btn-login:hover {
  background-color: #1976d2;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(33, 150, 243, 0.4);
}

.btn-logout {
  background-color: #f44336;
  color: white;
}

.btn-logout:hover {
  background-color: #da190b;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(244, 67, 54, 0.4);
}

.btn:active {
  transform: translateY(0);
}
</style>
