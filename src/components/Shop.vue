<template>
  <div class="shop-homepage">
    <!-- Header Component -->
    <ShopHeader
      :user="user"
      :cartCount="cartCount"
      @show-auth="showPopup = true"
      @view-cart="viewCart"
      @logout="handleLogout"
    />

    <!-- Hero Section - First Layer (Full Width) -->
    <Hero />

    <!-- Second Layer - Content with Sidebar and Products -->
    <div class="content-wrapper">
      <!-- Left Sidebar Categories -->
      <aside class="sidebar">
        <nav class="categories">
          <ul>
            <li
              @click="filterByCategory('all')"
              :class="{ active: selectedCategory === 'all' }"
            >
              <img
                src="https://img.icons8.com/ios/50/000000/home.png"
                alt="all"
              />
              <span>All Products</span>
            </li>
            <li
              @click="filterByCategory('Electronics')"
              :class="{ active: selectedCategory === 'Electronics' }"
            >
              <img
                src="https://img.icons8.com/ios/50/000000/smartphone.png"
                alt="electronics"
              />
              <span>Electronics</span>
            </li>
            <li
              @click="filterByCategory('Accessories')"
              :class="{ active: selectedCategory === 'Accessories' }"
            >
              <img
                src="https://img.icons8.com/ios/50/000000/headphones.png"
                alt="accessories"
              />
              <span>Accessories</span>
            </li>
            <li
              @click="filterByCategory('Books')"
              :class="{ active: selectedCategory === 'Books' }"
            >
              <img
                src="https://img.icons8.com/ios/50/000000/open-book--v1.png"
                alt="books"
              />
              <span>Books</span>
            </li>
          </ul>
        </nav>
      </aside>

      <!-- Main Content -->
      <main class="main-content">
        <!-- Loading State -->
        <div v-if="loading" class="loading-message">
          <p>Loading products...</p>
        </div>

        <!-- Error State -->
        <div v-if="error" class="error-message">
          <p>{{ error }}</p>
          <button @click="fetchProducts">Try Again</button>
        </div>

        <!-- Top Deal Product Section -->
        <section v-if="!loading && !error" class="top-deal-section">
          <div class="top-deal-header">
            <div class="title">
              <span class="icon">👍</span>
              <span class="label">TOP DEALS</span> •
              <span class="sub-label">SUPER SALE</span>
            </div>
            <a href="#" class="view-all">View All</a>
          </div>

          <div class="products-wrapper">
            <div
              v-for="product in displayedProducts"
              :key="product.id"
              class="product-card"
              @click="viewProductDetail(product)"
            >
              <!-- Top Badges -->
              <div class="badges">
                <span class="badge official">AUTHENTIC</span>
                <span v-if="product.stock < 10" class="badge red"
                  >LOW STOCK</span
                >
                <span v-if="product.discount > 0" class="badge discount"
                  >-{{ product.discount }}%</span
                >
                <span v-if="product.category" class="badge category">{{
                  product.category
                }}</span>
              </div>

              <!-- Product Image -->
              <div class="product-image">
                <img
                  :src="product.image_url || 'https://via.placeholder.com/200'"
                  :alt="product.name"
                />
              </div>

              <!-- Product Title -->
              <h3 class="product-title" :title="product.name">
                {{ product.name }}
              </h3>

              <!-- Star Rating -->
              <div class="rating-container">
                <div
                  class="star-rating"
                  :title="`${getAverageRating(product).toFixed(
                    1
                  )} out of 5 stars`"
                >
                  <template v-for="n in 5" :key="n">
                    <svg
                      class="star-icon"
                      xmlns="http://www.w3.org/2000/svg"
                      :fill="
                        n <= Math.round(getAverageRating(product))
                          ? '#FFD500'
                          : '#E0E0E0'
                      "
                      viewBox="0 0 24 24"
                      width="14"
                      height="14"
                    >
                      <path
                        d="M12 .587l3.668 7.431L24 9.751l-6 5.843 1.416 8.274L12 18.897l-7.416 3.971L6 15.594 0 9.751l8.332-1.733z"
                      />
                    </svg>
                  </template>
                </div>
                <span class="rating-text">
                  {{ getAverageRating(product).toFixed(1) }}
                  <span class="rating-count"
                    >({{ product.number_of_ratings }})</span
                  >
                </span>
              </div>

              <!-- Price -->
              <div class="price-section">
                <span class="current-price"
                  >${{ formatPrice(getDiscountedPrice(product)) }}</span
                >
                <div v-if="product.discount > 0" class="discount-section">
                  <span class="old-price"
                    >${{ formatPrice(product.price) }}</span
                  >
                </div>
              </div>

              <!-- Stock Info -->
              <div class="delivery-info">
                <span v-if="product.stock > 0"
                  >{{ product.stock }} in stock</span
                >
                <span v-else class="out-of-stock">Out of Stock</span>
              </div>

              <!-- Add to Cart Button -->
              <button
                v-if="product.stock > 0"
                @click.stop="addToCart(product)"
                class="btn-add-cart"
                :disabled="addingToCart[product.id]"
              >
                {{ addingToCart[product.id] ? "Adding..." : "Add to Cart" }}
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>

    <!--Auth Popup-->
    <AuthPopup
      :isOpen="showPopup"
      initialTab="login"
      @close="showPopup = false"
      @login-success="handleLoginSuccess"
    />

    <!-- Floating Buttons -->
    <div class="floating-buttons">
      <button class="btn-helper">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="#0080FF"
          viewBox="0 0 24 24"
          width="24"
          height="24"
        >
          <path
            d="M12 3a9 9 0 019 9 9 9 0 11-18 0 9 9 0 019-9zm.75 13.5h-1.5v-1.5h1.5v1.5zm0-3h-1.5V7.5h1.5v6z"
          />
        </svg>
        Support
      </button>
      <button class="btn-helper">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="#0080FF"
          viewBox="0 0 24 24"
          width="24"
          height="24"
        >
          <path
            d="M12 3.88l9 5.18v7.88L12 20.12 3 16.94V9.06l9-5.18zM12 5.9l-6.7 3.86v5.37l6.7 2.64 6.7-2.64v-5.37L12 5.9z"
          />
        </svg>
        News
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import ShopHeader from "./ShopHeader.vue";
import AuthPopup from "./AuthPopup.vue";
import Hero from "./Hero.vue";
import { productsAPI, cartAPI, authAPI } from "../services/api";

const router = useRouter();

// State
const loading = ref(true);
const error = ref(null);
const products = ref([]);
const user = ref(null);
const cartCount = ref(0);
const addingToCart = ref({});
const selectedCategory = ref("all");
const showPopup = ref(false);

// Computed
const displayedProducts = computed(() => {
  if (selectedCategory.value === "all") {
    return products.value;
  }
  return products.value.filter((p) => p.category === selectedCategory.value);
});

// Functions
const formatPrice = (price) => {
  return parseFloat(price).toFixed(2);
};

const getDiscountedPrice = (product) => {
  if (product.discount > 0) {
    return product.price * (1 - product.discount / 100);
  }
  return product.price;
};

const getAverageRating = (product) => {
  if (product.number_of_ratings === 0) return 0;
  return product.total_rating_score / product.number_of_ratings;
};

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

const addToCart = async (product) => {
  if (!user.value) {
    alert("Please login to add items to cart");
    showPopup.value = true;
    return;
  }

  try {
    addingToCart.value[product.id] = true;
    await cartAPI.addToCart({
      product_id: product.id,
      quantity: 1,
    });
    cartCount.value++;
    alert(`${product.name} has been added to your cart!`);
  } catch (err) {
    console.error("Error adding to cart:", err);
    alert("Unable to add to cart. Please try again.");
  } finally {
    addingToCart.value[product.id] = false;
  }
};

const viewCart = () => {
  if (!user.value) {
    alert("Please login to view your cart");
    showPopup.value = true;
    return;
  }
  alert("View Cart - Coming soon!");
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

const filterByCategory = (category) => {
  selectedCategory.value = category;
};

// Lifecycle
onMounted(() => {
  console.log("🚀 Shop component mounted");
  fetchProducts();
  checkAuth();
});
</script>

<style scoped>
/* [All the existing styles remain the same] */
.shop-homepage {
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  background: #fff;
  color: #333;
  user-select: none;
}

.loading-message,
.error-message {
  text-align: center;
  padding: 40px;
  font-size: 16px;
}

.error-message button {
  margin-top: 10px;
  padding: 10px 20px;
  background: #007dff;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
}

.error-message button:hover {
  background: #0066cc;
}

.top-deal-section {
  background-color: #fff;
  padding: 12px 20px 20px 20px;
  max-width: 1000px;
  user-select: none;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
}

.top-deal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.title {
  display: flex;
  align-items: center;
  font-weight: 700;
  font-size: 17px;
  color: #f94545;
  gap: 6px;
}

.icon {
  font-size: 20px;
}

.label {
  text-transform: uppercase;
}

.sub-label {
  font-weight: 500;
}

.view-all {
  font-size: 14px;
  color: #1671f0;
  font-weight: 600;
  cursor: pointer;
  user-select: none;
  text-decoration: none;
}
.view-all:hover {
  text-decoration: underline;
}

.products-wrapper {
  display: flex;
  gap: 14px;
  overflow-x: auto;
  padding-bottom: 5px;
  scroll-behavior: smooth;
}
.products-wrapper::-webkit-scrollbar {
  height: 7px;
}
.products-wrapper::-webkit-scrollbar-thumb {
  background-color: #ccc;
  border-radius: 10px;
}

.product-card {
  flex: 0 0 180px;
  background: #fff;
  border: 1px solid #f0f0f2;
  border-radius: 10px;
  padding: 10px;
  box-sizing: border-box;
  position: relative;
  display: flex;
  flex-direction: column;
  min-width: 180px;
  cursor: pointer;
  transition: box-shadow 0.2s, transform 0.2s;
}

.product-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.badges {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  margin-bottom: 5px;
  min-height: 20px;
}

.badge {
  font-size: 9px;
  font-weight: 700;
  line-height: 1;
  padding: 3px 5px;
  border-radius: 4px;
  white-space: nowrap;
  user-select: none;
  color: #fff;
  font-family: Arial, Helvetica, sans-serif;
}
.badge.red {
  background: #f94545;
}
.badge.official {
  background: #0088ff;
}
.badge.discount {
  background: #ff5722;
}
.badge.category {
  background: #10a3ff;
  font-size: 8px;
}

.product-image {
  width: 160px;
  height: 160px;
  margin: 0 auto 8px auto;
  overflow: hidden;
  flex-shrink: 0;
  display: flex;
  justify-content: center;
  align-items: center;
}
.product-image img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  user-select: none;
}

.product-title {
  font-size: 13px;
  font-weight: 600;
  line-height: 1.3;
  height: 40px;
  overflow: hidden;
  color: #212529;
  margin: 0 0 8px 0;
  cursor: pointer;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.rating-container {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 10px;
}

.star-rating {
  display: flex;
  gap: 1px;
}
.star-icon {
  pointer-events: none;
  user-select: none;
}

.rating-text {
  font-size: 12px;
  font-weight: 600;
  color: #333;
}

.rating-count {
  color: #888;
  font-weight: 400;
}

.price-section {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
  font-size: 16px;
  color: #f94545;
  margin-bottom: 6px;
}

.current-price {
  white-space: nowrap;
}

.discount-section {
  display: flex;
  gap: 6px;
}

.old-price {
  text-decoration: line-through;
  color: #999;
  font-size: 13px;
  font-weight: 400;
}

.delivery-info {
  font-weight: 600;
  font-size: 12px;
  color: #007dff;
  margin-top: auto;
  margin-bottom: 8px;
  user-select: none;
}

.out-of-stock {
  color: #f94545;
  font-weight: 700;
}

.btn-add-cart {
  width: 100%;
  padding: 10px;
  background: #007dff;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s;
  font-size: 13px;
}

.btn-add-cart:hover:not(:disabled) {
  background: #0066cc;
}

.btn-add-cart:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.content-wrapper {
  display: flex;
  padding: 25px 20px 40px 20px;
  gap: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.sidebar {
  min-width: 220px;
  border-radius: 4px;
  background: #f4f4f6;
  box-shadow: 0 1px 4px hsla(0, 0%, 0%, 0.12);
  padding: 16px 0;
  user-select: none;
  height: fit-content;
}

.categories ul {
  list-style-type: none;
  margin: 0;
  padding: 0 10px;
}
.categories li {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  color: #3b3b3b;
  transition: background-color 0.25s ease;
}
.categories li:hover {
  background-color: rgba(0, 125, 255, 0.1);
}
.categories li.active {
  background-color: rgba(0, 125, 255, 0.2);
  font-weight: 700;
}
.categories li img {
  height: 24px;
  width: 24px;
  object-fit: contain;
  user-select: none;
}
.categories li span {
  white-space: nowrap;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 18px;
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

@media (max-width: 970px) {
  .content-wrapper {
    flex-direction: column;
    padding: 15px 10px 40px 10px;
  }
  .sidebar {
    min-width: 100%;
    margin-bottom: 20px;
  }
}
</style>
