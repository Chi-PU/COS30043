import { createApp } from "vue";
import { createRouter, createWebHistory } from "vue-router";
import "bootstrap/dist/css/bootstrap.min.css";
import "./assets/style.css";
import App from "./App.vue";
import Home from "./components/Home.vue";
import News from "./components/News.vue";
import About from "./components/About.vue";
import Shop from "./components/Shop.vue";
import Item from "./components/Item.vue";

const routes = [
  { path: "/", name: "Home", component: Home },
  { path: "/news", name: "News", component: News },
  { path: "/about", name: "About", component: About },
  { path: "/shop", name: "Shop", component: Shop },
  { path: "/item", name: "Item", component: Item },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

const app = createApp(App);
app.use(router);
app.mount("#app");
