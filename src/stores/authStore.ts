import { ref, computed } from 'vue'

interface AuthUser {
  firstName: string
  lastName: string
  email: string
}

const user = ref<AuthUser | null>(null)
const isLoggingIn = ref(false)
const isLoggingOut = ref(false)
const showSuccessOverlay = ref(false)

const userDisplayName = computed(() => {
  if (!user.value) return ''
  const full = `${user.value.firstName} ${user.value.lastName}`.trim()
  return full || user.value.email
})

const userInitials = computed(() => {
  if (!user.value) return '?'
  const f = user.value.firstName?.[0] ?? ''
  const l = user.value.lastName?.[0] ?? ''
  return (f + l).toUpperCase() || (user.value.email[0] ?? '?').toUpperCase()
})

function setUser(data: { given_name?: string; family_name?: string; name?: string; email: string }) {
  const firstName = data.given_name || data.name?.split(' ')[0] || ''
  const lastName = data.family_name || data.name?.split(' ').slice(1).join(' ') || ''
  user.value = { firstName, lastName, email: data.email }
}

function clearUser() {
  user.value = null
}

export function useAuthStore() {
  return {
    user,
    isLoggingIn,
    isLoggingOut,
    showSuccessOverlay,
    userDisplayName,
    userInitials,
    setUser,
    clearUser
  }
}
