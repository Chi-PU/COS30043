import { createRouter, createWebHistory } from "vue-router";
import Home from "../components/Home.vue";
import News from "../components/News.vue";
import About from "../components/About.vue";
import Shop from "../components/Shop.vue";
import Item from "../components/Item.vue";

const routes = [
  { path: "/", name: "Home", component: Home },
  { path: "/news", name: "News", component: News },
  { path: "/about", name: "About", component: About },

  {
    path: "/shop",
    name: "Shop",
    component: Shop,
    meta: {
      title: "Shop - Browse Products",
    },
  },
  {
    path: "/product/:id",
    name: "ProductDetail",
    component: Item,
    props: true,
    meta: {
      title: "Product Details",
    },
  },
  // 404 Not Found - catch all route
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    redirect: "/shop",
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // If user clicks back/forward button, restore scroll position
    if (savedPosition) {
      return savedPosition;
    }
    // If navigating to a hash (e.g., #section), scroll to it
    else if (to.hash) {
      return {
        el: to.hash,
        behavior: "smooth",
      };
    }
    // Otherwise, scroll to top
    else {
      return { top: 0, behavior: "smooth" };
    }
  },
});

// Navigation guard to update page title
router.beforeEach((to, from, next) => {
  // Update document title
  document.title = to.meta.title || "E-Commerce Shop";
  next();
});

// Global error handler for navigation failures
router.onError((error) => {
  console.error("Router error:", error);
});

export default router;
