<template>
  <div class="shop-homepage">
    <!-- Header Component -->
    <ShopHeader
      :user="user"
      :cartCount="cartCount"
      @show-auth="showPopup = true"
      @view-cart="viewCart"
      @logout="handleLogout"
      @go-home="router.push('/shop')"
    />

    <!--Auth Popup-->
    <AuthPopup
      :isOpen="showPopup"
      initialTab="login"
      @close="showPopup = false"
      @login-success="handleLoginSuccess"
    />

    <!-- Hero Section - First Layer (Full Width) -->
    <Hero />

    <!-- Products Component with data passed as props -->
    <Products
      :products="products"
      :loading="loading"
      :error="error"
      @retry="fetchProducts"
      @view-product="viewProductDetail"
      @cart-updated="fetchCartCount"
    />
    <ForYou
      :user="user"
      @view-product="viewProductDetail"
      @cart-updated="fetchCartCount"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import ShopHeader from "./ShopHeader.vue";
import AuthPopup from "./AuthPopup.vue";
import Hero from "./Hero.vue";
import Products from "./Products.vue";
import { productsAPI, cartAPI, authAPI } from "../services/api";
import ForYou from "./ForYou.vue";

const router = useRouter();

// State
const loading = ref(true);
const error = ref(null);
const products = ref([]);
const user = ref(null);
const cartCount = ref(0);
const showPopup = ref(false);

// Functions
const fetchProducts = async () => {
  try {
    loading.value = true;
    error.value = null;
    const response = await productsAPI.getAll();
    products.value = response.data.products;
  } catch (err) {
    console.error("Error fetching products:", err);
    error.value = "Unable to load products. Please try again later.";
  } finally {
    loading.value = false;
  }
};

const checkAuth = async () => {
  try {
    const response = await authAPI.getMe();
    user.value = response.data.user;
    console.log("✅ User logged in:", user.value);
    await fetchCartCount();
  } catch (err) {
    console.log("ℹ️ User not logged in");
    user.value = null;
  }
};

const fetchCartCount = async () => {
  try {
    const response = await cartAPI.getCart();
    cartCount.value = response.data.cart.length;
    console.log("🛒 Cart count:", cartCount.value);
  } catch (err) {
    console.error("Error fetching cart:", err);
  }
};

const viewCart = () => {
  if (!user.value) {
    alert("Please login to view your cart");
    showPopup.value = true;
    return;
  }
  router.push("/cart");
};

const viewProductDetail = (product) => {
  // Navigate to product detail page
  router.push(`/product/${product.id}`);
};

const handleLoginSuccess = (userData) => {
  console.log("✅ Login successful, user data:", userData);
  user.value = userData;
  showPopup.value = false;
  fetchCartCount();
};

const handleLogout = async () => {
  console.log("🔴 Logout button clicked");

  try {
    console.log("📤 Sending logout request to backend...");
    const response = await authAPI.logout();
    console.log("✅ Backend logout response:", response.data);

    // Clear user state
    user.value = null;
    cartCount.value = 0;

    console.log("✅ User state cleared. User is now:", user.value);
    alert("You have been logged out successfully!");
  } catch (err) {
    console.error("❌ Logout error:", err);
    alert("Error logging out. Please try again.");
  }
};

// Lifecycle
onMounted(() => {
  console.log("🚀 Shop component mounted");
  fetchProducts();
  checkAuth();
});
</script>

<style scoped>
.shop-homepage {
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  background: #fff;
  color: #333;
  user-select: none;
}

.floating-buttons {
  position: fixed;
  bottom: 60px;
  right: 20px;
  display: flex;
  flex-direction: column;
  gap: 15px;
  user-select: none;
  z-index: 9999;
}

.btn-helper {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #007dff;
  color: white;
  padding: 10px 14px;
  border-radius: 28px;
  font-weight: 700;
  font-size: 14px;
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 8px rgba(0, 125, 255, 0.3);
  white-space: nowrap;
  user-select: none;
  transition: box-shadow 0.3s ease;
}

.btn-helper svg {
  flex-shrink: 0;
}

.btn-helper:hover {
  box-shadow: 0 6px 12px rgba(0, 125, 255, 0.6);
}
</style>
