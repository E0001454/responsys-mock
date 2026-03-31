import { OktaAuth } from '@okta/okta-auth-js'

function getRequiredEnv(name: string): string {
  const value = (import.meta.env as Record<string, string>)[name]
  if (!value) {
    throw new Error(`Missing required env var: ${name}`)
  }
  return value
}

export const oktaAuth = new OktaAuth({
  issuer: getRequiredEnv('VITE_OKTA_ISSUER'),
  clientId: getRequiredEnv('VITE_OKTA_CLIENT_ID'),
  redirectUri: getRequiredEnv('VITE_OKTA_REDIRECT_URI'),
  scopes: ['openid', 'profile', 'email'],
  pkce: true
})
