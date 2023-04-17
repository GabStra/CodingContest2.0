import { createApp } from 'vue'
import App from './App.vue'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/antd.dark.less'
import './style.css'

import { createPinia } from 'pinia'
import { router, URL } from './scripts/router'
import axios from 'axios'
import VueAxios from 'vue-axios'
import VueCodemirror from 'vue-codemirror'
import { minimalSetup } from 'codemirror'
import { Api, api } from './scripts/api'
import piniaPluginPersistedState from 'pinia-plugin-persistedstate'
import { useSessionStore } from './scripts/store'
import { Popup, POPUP_TYPE } from './models/popup'
declare module 'vue' {
    interface ComponentCustomProperties {
        $api: Api
    }
}

const app = createApp(App)
const pinia = createPinia()
pinia.use(piniaPluginPersistedState)
app.use(Antd)
app.use(pinia)
app.use(router)

app.use(VueAxios, axios)

const sessionStore = useSessionStore()

axios.interceptors.response.use(
    (response) => {
        return response
    },
    (error) => {
        console.log(error.response)
        if (!!error.response) {
            if (error.response.status === 401) {
                let cookies = document.cookie.split(';')
                // set past expiry to all cookies
                for (var i = 0; i < cookies.length; i++) {
                    document.cookie =
                        cookies[i] + '=; expires=' + new Date(0).toUTCString()
                }
                sessionStore.popups.push({
                    type: POPUP_TYPE.ERROR,
                    message: 'Accesso negato',
                } as Popup)
                router.push({ path: URL.LOGIN })
            }
        } else {
            let cookies = document.cookie.split(';')
            // set past expiry to all cookies
            for (var i = 0; i < cookies.length; i++) {
                document.cookie =
                    cookies[i] + '=; expires=' + new Date(0).toUTCString()
            }
            router.push({ path: URL.OFFLINE })
        }
        return Promise.resolve(error.response)
    }
)

app.use(VueCodemirror, {
    // keep the global default extensions empty
    extensions: [minimalSetup],
})
app.config.globalProperties.$api = api

app.mount('#app')
