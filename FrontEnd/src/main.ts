import { createApp } from "vue";
import App from "./App.vue";
import Antd from "ant-design-vue";
import "ant-design-vue/dist/antd.css";
import "./style.css";
import { router, Routes } from "./scripts/router";
import { createPinia } from "pinia";

const app = createApp(App);
app.use(Antd);
app.use(router);
app.use(createPinia());

app.mount("#app");
