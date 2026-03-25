import { inject } from 'vue'
import type { OktaAuth } from '@okta/okta-auth-js'

export const useAuth = () => {
  const oktaAuth = inject<OktaAuth | null>('oktaAuth', null)
  
  if (!oktaAuth) {
    throw new Error('oktaAuth is not provided. Make sure OktaVue plugin is registered.')
  }

  return { oktaAuth }
}
