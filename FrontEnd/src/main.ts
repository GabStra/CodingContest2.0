import { createApp } from "vue";
import App from "./App.vue";
import Antd from "ant-design-vue";
import "ant-design-vue/dist/antd.less";
import "./style.css";
import { router, Routes } from "./scripts/router";
import { createPinia } from "pinia";
import axios from "axios";
import VueAxios from "vue-axios";
import VueCodemirror from "vue-codemirror";
import { minimalSetup } from "codemirror";

import test from "../"
const app = createApp(App);
app.use(Antd);
app.use(router);
app.use(createPinia());
app.use(VueAxios, axios);

app.use(VueCodemirror, {
  // keep the global default extensions empty
  extensions: [minimalSetup],
});
app.mount("#app");
