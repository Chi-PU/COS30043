import { createApp } from "vue";
import "bootstrap/dist/css/bootstrap.min.css";
import "./assets/style.css";
import App from "./App.vue";
import router from "./router"; // ✅ Import centralized router

const app = createApp(App);
app.use(router);
app.mount("#app");
