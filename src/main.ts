import { createApp } from 'vue'
import { OktaAuth } from '@okta/okta-auth-js'
import OktaVue from '@okta/okta-vue'
import App from './App.vue'

import router from './router' 
import './assets/style.css'

function getRequiredEnv(name: keyof ImportMetaEnv): string {
	const value = import.meta.env[name]
	if (!value) {
		throw new Error(`Missing required env var: ${name}`)
	}
	return value
}

const oktaAuth = new OktaAuth({
	issuer: getRequiredEnv('VITE_OKTA_ISSUER'),
	clientId: getRequiredEnv('VITE_OKTA_CLIENT_ID'),
	redirectUri: getRequiredEnv('VITE_OKTA_REDIRECT_URI'),
	scopes: ['openid', 'profile', 'email'],
	pkce: true
})

const app = createApp(App)

app.provide('oktaAuth', oktaAuth)
app.use(OktaVue, {
	oktaAuth,
	onAuthRequired: () => {
		router.push('/login')
	},
	onAuthResume: () => {
		router.push('/mapeo')
	}
})

app.use(router) 

app.mount('#app')


// import { createApp } from 'vue'
// import { OktaAuth } from '@okta/okta-auth-js'
// import OktaVue from '@okta/okta-vue'
// import App from './App.vue'
// import router from './router'

// const oktaAuth = new OktaAuth({
//     issuer:import.meta.env.VITE_OKTA_ISSUER,
//     clientId:import.meta.env.VITE_OKTA_CLIENT_ID,
//     redirectUri:import.meta.env.VITE_OKTA_REDIRECT_URI,
//     scopes: ['openid', 'profile', 'email'],
//     pkce: true
// })

// const app = createApp(App)
// app.provide('oktaAuth', oktaAuth)
// app.use(OktaVue, { 
//   oktaAuth,
//   onAuthRequired: () => router.push('/login'),
//   onAuthResume: () => router.push('/')
// })
// app.use(router)
// app.mount('#app')
