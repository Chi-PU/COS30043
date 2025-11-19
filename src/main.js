import { createApp } from "vue";
import "bootstrap/dist/css/bootstrap.min.css";
import "./assets/style.css";
import App from "./App.vue";
import router from "./router";
import { RecycleScroller } from "vue-virtual-scroller";
import "vue-virtual-scroller/dist/vue-virtual-scroller.css";

const app = createApp(App);
app.use(router);
app.mount("#app");
app.component("RecycleScroller", RecycleScroller);
