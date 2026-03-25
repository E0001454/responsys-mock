import { createApp } from 'vue'
import App from './App.vue'

import router from './router' 
import './assets/style.css'
const app = createApp(App)

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
