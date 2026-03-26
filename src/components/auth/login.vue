

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/okta/useAuth'
import logo from '@/assets/img/logo.webp'

const { oktaAuth } = useAuth()
const router = useRouter()
const isAuthenticated = ref(false)
const isLoading = ref(false)
const logoUrl = logo

onMounted(async () => {
  try {
    isAuthenticated.value = await oktaAuth.isAuthenticated()
    if (isAuthenticated.value) {
      router.replace('/mapeo')
    }
  } catch (error) {
    console.error('Error checking authentication:', error)
  }
})

const login = async () => {
  try {
    isLoading.value = true
    await oktaAuth.signInWithRedirect()
  } catch (error) {
    console.error('Error during login:', error)
  } finally {
    isLoading.value = false
  }
}

</script>

<template>
  <div class="relative h-screen w-screen overflow-hidden bg-[#eef1f6]">
    <div class="pointer-events-none absolute left-0 top-0 h-56 w-full bg-gradient-to-b from-[#00357F] to-[#00357F]/0"></div>
    <div class="pointer-events-none absolute -left-12 bottom-20 hidden h-40 w-40 grid-cols-6 gap-2 opacity-40 lg:grid">
      <span v-for="n in 36" :key="`left-dot-${n}`" class="h-1.5 w-1.5 rounded-full bg-[#f08d8e]"></span>
    </div>
    <div class="pointer-events-none absolute -right-8 top-24 hidden h-36 w-36 grid-cols-6 gap-2 opacity-40 lg:grid">
      <span v-for="n in 36" :key="`right-dot-${n}`" class="h-1.5 w-1.5 rounded-full bg-[#f08d8e]"></span>
    </div>

    <section class="relative z-10 mx-auto flex h-full w-full items-center justify-center px-4 py-4 sm:px-6 lg:px-10">
      <article class="w-full max-w-5xl rounded-3xl border border-slate-200 bg-white shadow-[0_24px_64px_rgba(15,23,42,0.12)]">
        <div class="grid lg:grid-cols-[1.05fr_1fr]">
          <div class="relative overflow-hidden rounded-t-3xl bg-[#00357F] p-7 sm:p-9 lg:rounded-l-3xl lg:rounded-tr-none lg:p-10">
            <div class="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#00357F] via-[#0055ca] to-[#FFD100]"></div>

            <div class="max-w-md">
              <p class="text-xs font-semibold uppercase tracking-[0.18em] text-white/75">Gestión de campañas</p>
              <h1 class="mt-3 text-3xl font-bold leading-tight text-white sm:text-4xl">ABC Responsys</h1>
              <div class="mt-4 h-1 w-24 rounded-full bg-white"></div>
              <!-- <p class="mt-6 text-sm leading-relaxed text-slate-600 sm:text-base">
                Plataforma institucional para acceso seguro con autenticacion centralizada.
              </p> -->
            </div>

            <div class="mt-10 grid grid-cols-2 gap-3 sm:gap-4">
              <!-- <div class="rounded-xl border border-slate-200 bg-white p-4">
                <p class="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Proteccion</p>
                <p class="mt-2 text-sm font-semibold text-slate-800">Sesion cifrada</p>
              </div>
              <div class="rounded-xl border border-slate-200 bg-white p-4">
                <p class="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Acceso</p>
                <p class="mt-2 text-sm font-semibold text-slate-800">Controlado por Okta</p>
              </div>
              <div class="rounded-xl border border-slate-200 bg-white p-4">
                <p class="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Disponibilidad</p>
                <p class="mt-2 text-sm font-semibold text-slate-800">Portal institucional</p>
              </div>
              <div class="rounded-xl border border-slate-200 bg-white p-4">
                <p class="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Integridad</p>
                <p class="mt-2 text-sm font-semibold text-slate-800">Flujo certificado</p>
              </div> -->
              <img :src="logoUrl" alt="ABC" class="h-20 w-auto object-contain sm:h-20" />
            </div>
          </div>

          <div class="relative rounded-b-3xl bg-white p-7 sm:p-9 lg:rounded-r-3xl lg:rounded-bl-none lg:p-10">
            <div class="mb-7 flex items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <p class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Acceso</p>
                <h2 class="mt-2 text-2xl font-bold tracking-tight text-slate-900">Inicio de sesion</h2>
              </div>
            </div>

            <div
              class="mb-5 inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em]"
              :class="isAuthenticated ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-blue-200 bg-blue-50 text-[#00357F]'"
            >
              {{ isAuthenticated ? 'Sesion activa' : 'Sin sesion activa' }}
            </div>

            <p class="text-sm leading-relaxed text-slate-600 sm:text-base">
              Ingresa con tu cuenta corporativa para continuar.
            </p>

            <button
              v-if="!isAuthenticated"
              @click="login"
              :disabled="isLoading"
              class="mt-7 inline-flex w-full items-center justify-center gap-3 rounded-xl bg-[#00357F] px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-900/20 transition hover:-translate-y-0.5 hover:bg-[#002a66] disabled:cursor-not-allowed disabled:opacity-75 disabled:hover:translate-y-0"
            >
              <span class="h-2.5 w-2.5 rounded-full bg-[#FFD100]"></span>
              {{ isLoading ? 'Redirigiendo...' : 'Iniciar sesion con Okta' }}
            </button>

            <div class="mt-6 rounded-lg bg-slate-50 px-4 py-3 text-xs text-slate-500 sm:text-sm">
              Acceso administrado por Okta.
            </div>
          </div>
        </div>
      </article>
    </section>
  </div>
</template>
