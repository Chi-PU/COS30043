<template>
  <div id="app">
    <!-- Navigation Bar -->
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
      <div class="container">
        <router-link to="/" class="navbar-brand">
          <i class="bi bi-globe"></i> Web App
        </router-link>
        <button
          class="navbar-toggler"
          type="button"
          @click="toggleNav"
          aria-label="Toggle navigation"
        >
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" :class="{ show: showNav }">
          <ul class="navbar-nav ms-auto">
            <li class="nav-item">
              <router-link
                to="/"
                class="nav-link"
                @click="showNav = false"
                active-class="active"
              >
                Home
              </router-link>
            </li>
            <li class="nav-item">
              <router-link
                to="/news"
                class="nav-link"
                @click="showNav = false"
                active-class="active"
              >
                News
              </router-link>
            </li>
            <li class="nav-item">
              <router-link
                to="/about"
                class="nav-link"
                @click="showNav = false"
                active-class="active"
              >
                About
              </router-link>
            </li>
            <li class="nav-item">
              <router-link
                to="/shop"
                class="nav-link"
                @click="showNav = false"
                active-class="active"
              >
                Shop
              </router-link>
            </li>
            <li class="nav-item">
              <router-link
                to="/cart"
                class="nav-link"
                @click="showNav = false"
                active-class="active"
              >
                Cart
              </router-link>
            </li>
          </ul>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main>
      <router-view />
    </main>

    <!-- Footer -->
    <footer class="bg-dark text-white mt-5">
      <div class="container py-4">
        <div class="row">
          <div class="col-12 col-md-6 mb-3 mb-md-0">
            <h5>Vue.js Web Application</h5>
            <p class="mb-0 text-muted">Built with Vue 3 and Bootstrap 5</p>
          </div>
          <div class="col-12 col-md-6 text-md-end">
            <p class="mb-0 text-muted">&copy; 2024 - Stage 1 Project</p>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script>
export default {
  name: "App",
  data() {
    return {
      showNav: false,
    };
  },
  methods: {
    toggleNav() {
      this.showNav = !this.showNav;
    },
  },
  watch: {
    $route() {
      this.showNav = false;
    },
  },
};
</script>

<style>
/* Global Styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, sans-serif;
  line-height: 1.6;
  color: #333;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

main {
  flex: 1;
  padding-bottom: 2rem;
}

/* Navigation Styles */
.navbar-brand {
  font-weight: 600;
  font-size: 1.25rem;
}

.nav-link {
  font-weight: 500;
  transition: opacity 0.2s ease;
}

.nav-link:hover {
  opacity: 0.8;
}

.nav-link.active {
  font-weight: 600;
}

/* Responsive adjustments */
@media (max-width: 991.98px) {
  .navbar-collapse {
    background-color: rgba(13, 110, 253, 0.95);
    padding: 1rem;
    border-radius: 0.5rem;
    margin-top: 0.5rem;
  }
}

@media (max-width: 768px) {
  .container {
    padding-left: 1rem;
    padding-right: 1rem;
  }
}

@media (max-width: 576px) {
  .navbar-brand {
    font-size: 1.1rem;
  }

  footer h5 {
    font-size: 1rem;
  }

  footer p {
    font-size: 0.875rem;
  }
}

/* Utility Classes */
.shadow-sm {
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}

/* Loading animation */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

main > * {
  animation: fadeIn 0.3s ease;
}
</style>
