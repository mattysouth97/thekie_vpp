// 1. Libraries
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "@vue-flow/core/dist/style.css";
import "@vue-flow/core/dist/theme-default.css";
import { createApp } from "vue";
import { createPinia } from "pinia";

// 2. Assets
import "@/assets/scss/main.scss";

// 3. App & Router
import App from "@/App.vue";
import router from "@/router";

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);
app.mount("#app");
