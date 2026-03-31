import { createApp } from 'vue'
import OktaVue from '@okta/okta-vue'
import App from './App.vue'
import { oktaAuth } from './lib/okta'

import router from './router' 
import './assets/style.css'

const app = createApp(App)

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

