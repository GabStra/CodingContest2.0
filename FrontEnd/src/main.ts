import { createApp } from "vue";
import App from "./App.vue";
import Antd from "ant-design-vue";
import "ant-design-vue/dist/antd.dark.less";
import "./style.css";

import { createPinia } from "pinia";
import { router } from "./scripts/router";
import axios from "axios";
import VueAxios from "vue-axios";
import VueCodemirror from "vue-codemirror";
import { minimalSetup } from "codemirror";
import { Api } from "./scripts/api";
import piniaPluginPersistedState from "pinia-plugin-persistedstate";

declare module "vue" {
  interface ComponentCustomProperties {
    $api: Api;
  }
}

const app = createApp(App);
const pinia = createPinia();
pinia.use(piniaPluginPersistedState);
app.use(Antd);
app.use(pinia);
app.use(router);

app.use(VueAxios, axios);

app.use(VueCodemirror, {
  // keep the global default extensions empty
  extensions: [minimalSetup],
});
app.config.globalProperties.$api = new Api();

app.mount("#app");
