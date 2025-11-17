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

  {
    path: "/product/:id",
    name: "ProductDetail",
    component: Item,
    props: true,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0 };
    }
  },
});

const app = createApp(App);
app.use(router);
app.mount("#app");
