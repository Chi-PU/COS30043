<template>
  <!-- Header -->
  <header class="header">
    <div class="header-left">
      <img class="logo" src="../assets/logo.png" alt="Shop logo" />
      <span class="shop-name">E Commerce</span>
    </div>

    <div class="header-right">
      <button
        @click="goHomepage"
        class="header-link account-link"
        title="Account"
      >
        <Home :size="18" />
        <span>Home</span>
      </button>

      <!-- Admin Button (only show if user is admin) -->
      <button
        v-if="user && user.is_admin"
        @click="goAdmin"
        class="header-link admin-link"
        title="Admin Dashboard"
      >
        <Shield :size="18" />
        <span>Admin</span>
      </button>

      <!-- Account Button with Dropdown -->
      <div class="account-wrapper">
        <button
          @click="toggleDropdown"
          class="header-link account-link"
          title="Account"
        >
          <User :size="18" />
          <span>{{ user ? user.name : "Account" }}</span>
          <ChevronDown :size="14" v-if="user" class="dropdown-icon" />
        </button>

        <!-- Dropdown Menu (only show when logged in) -->
        <div v-if="user && showDropdown" class="account-dropdown">
          <button @click="handleLogout" class="logout-button">
            <LogOut :size="18" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      <a href="#" class="header-link cart-link" title="Cart" @click="goCart">
        <ShoppingCart :size="18" />
        <span class="cart-badge" v-if="cartCount > 0">{{ cartCount }}</span>
      </a>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import {
  Home,
  User,
  ShoppingCart,
  ChevronDown,
  LogOut,
  Shield,
} from "lucide-vue-next";
import { useRouter } from "vue-router";

// Props
const props = defineProps({
  user: {
    type: Object,
    default: null,
  },
  cartCount: {
    type: Number,
    default: 0,
  },
});

// Router
const router = useRouter();

// Emits
const emit = defineEmits(["show-auth", "logout"]);

// State
const showDropdown = ref(false);

// Functions
const goHomepage = () => {
  router.push({ name: "Shop" });
};

const goAdmin = () => {
  router.push({ name: "Admin" });
};

const toggleDropdown = () => {
  if (props.user) {
    showDropdown.value = !showDropdown.value;
  } else {
    emit("show-auth");
  }
};

const goCart = () => {
  router.push({ name: "Cart" });
};

const handleLogout = () => {
  console.log("🔴 Logout clicked in ShopHeader");
  showDropdown.value = false; // Close dropdown
  emit("logout"); // Emit to parent component (Shop.vue)
  router.go();
};

// Close dropdown when clicking outside
const handleClickOutside = (event) => {
  const accountWrapper = document.querySelector(".account-wrapper");
  if (accountWrapper && !accountWrapper.contains(event.target)) {
    showDropdown.value = false;
  }
};

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>

<style scoped>
/* Header */
.shop-name {
  font-size: 20px;
  font-weight: 700;
  color: #007dff;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 23px 5px;
  border-bottom: 1px solid #e4e6e8;
  flex-wrap: wrap;
  background: #fff;
  position: relative;
  z-index: 100;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
  min-width: 280px;
}

.logo {
  height: 48px;
  width: auto;
  cursor: pointer;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 25px;
  font-size: 14px;
  color: #3b3b3b;
  flex-wrap: nowrap;
  white-space: nowrap;
  min-width: 280px;
}

.header-link {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #3b3b3b;
  font-weight: 600;
  cursor: pointer;
  user-select: none;
  text-decoration: none;
  background: none;
  border: none;
  font: inherit;
  transition: color 0.2s;
}

.header-link:hover {
  color: #007dff;
}

.header-link svg {
  flex-shrink: 0;
}

.home-link {
  color: #007dff;
}

.home-link:hover {
  color: #0066cc;
}

/* Admin Link Styling */
.admin-link {
  color: #8b5cf6;
}

.admin-link:hover {
  color: #7c3aed;
}

/* Account Dropdown */
.account-wrapper {
  position: relative;
  z-index: 1001;
}

.account-link {
  position: relative;
}

.dropdown-icon {
  transition: transform 0.2s;
}

.account-dropdown {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  background: white;
  border: 1px solid #e4e6e8;
  border-radius: 8px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  min-width: 180px;
  z-index: 10000;
  animation: slideDown 0.2s ease;
  overflow: hidden;
  padding: 8px;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Arrow pointer */
.account-dropdown::before {
  content: "";
  position: absolute;
  top: -8px;
  right: 20px;
  width: 0;
  height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-bottom: 8px solid white;
}

.logout-button {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: background 0.2s;
  color: #dc2626;
  font-size: 14px;
  font-weight: 600;
  border-radius: 6px;
  font-family: inherit;
}

.logout-button:hover {
  background: #fef2f2;
}

.logout-button svg {
  flex-shrink: 0;
}

.cart-link {
  position: relative;
}

.cart-badge {
  background: #ff424f;
  border-radius: 50%;
  color: #fff;
  font-size: 11px;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  position: absolute;
  top: -8px;
  right: -12px;
  text-align: center;
  line-height: 18px;
  user-select: none;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
}

@media (max-width: 640px) {
  .header {
    padding: 8px 12px;
  }
  .header-right {
    gap: 15px;
    font-size: 12px;
  }
  .logo {
    height: 36px;
  }

  .account-dropdown {
    right: -10px;
  }
}
</style>
