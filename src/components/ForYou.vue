<template>
  <div class="content-wrapper">
    <!-- Main Content -->
    <main class="main-content">
      <div class="top-deal-header">
        <div class="title">
          <span class="icon">✨</span>
          <span class="label">FOR YOU</span> •
          <span class="sub-label">PERSONALIZED</span>
        </div>
        <div class="header-actions">
          <span
            v-if="!loading && recommendations.length > 0"
            class="product-count"
          >
            Total {{ recommendations.length }} products
          </span>

          <!-- Retrain Model Button (visible when logged in) -->
          <button
            v-if="!loading && isLoggedIn"
            @click="retrainModel"
            class="btn-retrain"
            :disabled="retraining"
            title="Retrain model to include your latest ratings"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              :class="{ spinning: retraining }"
            >
              <path
                d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"
              />
            </svg>
            {{ retraining ? "Refreshing..." : "Refresh" }}
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading-message">
        <div class="skeleton-grid">
          <div v-for="n in 8" :key="n" class="skeleton-card"></div>
        </div>
      </div>

      <!-- Not Logged In State -->
      <div v-else-if="!isLoggedIn" class="status-message">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="64"
          height="64"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="status-icon"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <p class="status-title">
          Please log in to see personalized recommendations
        </p>
        <p class="status-hint">
          Sign in to get product suggestions tailored just for you
        </p>
        <button @click="fetchRecommendations()" class="btn-action">
          Try Again
        </button>
      </div>

      <!-- Not Enough Data State (Logged In) -->
      <div
        v-else-if="isLoggedIn && recommendations.length === 0 && !error"
        class="status-message"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="64"
          height="64"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="status-icon tag-icon"
        >
          <path
            d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"
          />
          <line x1="7" y1="7" x2="7.01" y2="7" />
        </svg>
        <p class="status-title">No recommendations available yet</p>
        <p class="status-hint">
          Rate at least 10 products, then click "Refresh" above to get
          personalized suggestions!
        </p>
      </div>

      <!-- Error State (Other errors) -->
      <div v-else-if="error && isLoggedIn" class="status-message">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="64"
          height="64"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="status-icon tag-icon"
        >
          <path
            d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"
          />
          <line x1="7" y1="7" x2="7.01" y2="7" />
        </svg>
        <p class="status-title">{{ error }}</p>
        <p class="status-hint">
          Try retraining the model above to get fresh recommendations
        </p>
      </div>

      <!-- For You Product Section -->
      <section v-else-if="recommendations.length > 0" class="top-deal-section">
        <!-- Virtual Scroller -->
        <RecycleScroller
          class="scroller"
          :items="productRows"
          :item-size="450"
          key-field="rowIndex"
          v-slot="{ item }"
        >
          <div class="products-row">
            <div
              v-for="product in item.products"
              :key="product.id"
              class="product-card"
              @click="$emit('view-product', product)"
            >
              <!-- Product Image -->
              <div class="product-image">
                <img
                  :src="product.image_url || 'https://via.placeholder.com/200'"
                  :alt="product.name"
                  loading="lazy"
                />
                <span v-if="product.discount > 0" class="badge discount">
                  -{{ product.discount }}%
                </span>
                <span class="badge recommended">Recommended</span>
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
                  <svg
                    v-for="n in 5"
                    :key="n"
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
                <span class="current-price">
                  ${{ formatPrice(getDiscountedPrice(product)) }}
                </span>
                <span v-if="product.discount > 0" class="old-price">
                  ${{ formatPrice(product.price) }}
                </span>
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
        </RecycleScroller>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { RecycleScroller } from "vue-virtual-scroller";
import "vue-virtual-scroller/dist/vue-virtual-scroller.css";
import { recommendationsAPI, cartAPI } from "../services/api";

// Emits
const emit = defineEmits(["view-product", "cart-updated", "show-auth"]);

// State
const recommendations = ref([]);
const loading = ref(false);
const retraining = ref(false);
const error = ref(null);
const currentLimit = ref(8);
const addingToCart = ref({});
const isLoggedIn = ref(false);

// Computed Properties
const productRows = computed(() => {
  const rows = [];
  const productsPerRow = 5;
  const products = recommendations.value;

  for (let i = 0; i < products.length; i += productsPerRow) {
    rows.push({
      rowIndex: i,
      products: products.slice(i, i + productsPerRow),
    });
  }

  return rows;
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
  if (!product.number_of_ratings || product.number_of_ratings === 0) return 0;
  return product.total_rating_score / product.number_of_ratings;
};

const addToCart = async (product) => {
  addingToCart.value[product.id] = true;

  try {
    await cartAPI.addToCart({
      product_id: product.id,
      quantity: 1,
    });

    alert("Added to cart successfully!");
    emit("cart-updated");
  } catch (error) {
    console.error("Add to cart error:", error);

    if (error.response?.status === 401) {
      alert("Please login to add items to cart");
      emit("show-auth");
    } else {
      alert(
        error.response?.data?.error ||
          "Failed to add to cart. Please try again."
      );
    }
  } finally {
    addingToCart.value[product.id] = false;
  }
};

const fetchRecommendations = async (limit = 8) => {
  loading.value = true;
  error.value = null;

  try {
    const response = await recommendationsAPI.getForYou(limit);
    recommendations.value = response.data.recommendations || [];
    isLoggedIn.value = true;
  } catch (err) {
    console.error("Failed to fetch recommendations:", err);

    if (err.response?.status === 401) {
      isLoggedIn.value = false;
      recommendations.value = [];
    } else if (err.response?.status === 404) {
      isLoggedIn.value = true;
      recommendations.value = [];
      error.value = null; // Clear error for "not enough data" case
    } else {
      isLoggedIn.value = true;
      error.value = "Failed to load recommendations. Please try again later.";
    }
  } finally {
    loading.value = false;
  }
};

const retrainModel = async () => {
  retraining.value = true;
  error.value = null;

  try {
    await recommendationsAPI.manualRetrain();
    await new Promise((resolve) => setTimeout(resolve, 1500));
    await fetchRecommendations(currentLimit.value);
  } catch (err) {
    console.error("Failed to retrain model:", err);
    error.value =
      err.response?.data?.error || "Failed to retrain model. Please try again.";
  } finally {
    retraining.value = false;
  }
};

// Lifecycle
onMounted(() => {
  fetchRecommendations(currentLimit.value);
});
</script>

<style scoped>
/* Status Messages (replaces loading, error, empty states) */
.status-message {
  text-align: center;
  padding: 80px 40px;

  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  margin: 20px 0;
}

.status-icon {
  color: #cbd5e0;
  margin-bottom: 24px;
  filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.05));
}

.status-icon.tag-icon {
  color: #007dff;
}

.status-title {
  font-size: 20px;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 12px;
  letter-spacing: -0.3px;
}

.status-hint {
  color: #718096;
  margin: 0 auto 28px;
  font-size: 15px;
  line-height: 1.6;
  max-width: 500px;
}

.btn-action {
  padding: 14px 32px;
  background: #007dff;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 15px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-action:active {
  transform: translateY(0);
}

.loading-message {
  padding: 20px 0;
}

.skeleton-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16px;
  padding: 20px;
}

.skeleton-card {
  height: 460px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 10px;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* Main Layout */
.content-wrapper {
  display: flex;
  padding: 25px 20px 40px 20px;
  gap: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 18px;
  min-width: 0;
}

/* For You Section */
.top-deal-section {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  user-select: none;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
}

.top-deal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.product-count {
  font-size: 14px;
  color: #666;
  font-weight: 500;
  padding: 8px 16px;
  background: #f8f9fa;
  border-radius: 6px;
}

.title {
  display: flex;
  align-items: center;
  font-weight: 700;
  font-size: 17px;
  color: #007dff;
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

/* Retrain Model Button */
.btn-retrain {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: #007dff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  color: white;
}

.btn-retrain:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.btn-retrain svg {
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Virtual Scroller */
.scroller {
  height: 70vh;
  min-height: 600px;
  overflow-y: auto;
}

.products-row {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16px;
  width: 100%;
  padding: 8px 0;
  box-sizing: border-box;
}

/* Product Card */
.product-card {
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 10px;
  padding: 12px;
  box-sizing: border-box;
  position: relative;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition: all 0.3s ease;
  height: 420px;
}

.product-card:hover {
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
  transform: translateY(-4px);
  border-color: #007dff;
}

.product-image {
  width: 100%;
  height: 180px;
  margin-bottom: 12px;
  overflow: hidden;
  flex-shrink: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  background: #fafafa;
  border-radius: 8px;
}

.product-image img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  user-select: none;
}

.badge {
  position: absolute;
  font-size: 11px;
  font-weight: 700;
  padding: 5px 8px;
  border-radius: 4px;
  color: #fff;
  z-index: 1;
}

.badge.discount {
  top: 8px;
  right: 8px;
  background: #ff5722;
}

.badge.recommended {
  top: 8px;
  left: 8px;
  background: #007dff;
}

.product-title {
  font-size: 13px;
  font-weight: 600;
  line-height: 1.4;
  height: 40px;
  overflow: hidden;
  color: #212529;
  margin: 0 0 10px 0;
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
  gap: 2px;
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
  margin-bottom: 8px;
}

.current-price {
  font-weight: 700;
  font-size: 18px;
  color: #f94545;
  white-space: nowrap;
}

.old-price {
  text-decoration: line-through;
  color: #999;
  font-size: 14px;
  font-weight: 400;
}

.delivery-info {
  font-weight: 600;
  font-size: 12px;
  color: #007dff;
  margin-top: auto;
  margin-bottom: 10px;
  user-select: none;
}

.out-of-stock {
  color: #f94545;
  font-weight: 700;
}

.btn-add-cart {
  width: 100%;
  padding: 11px;
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
  opacity: 0.6;
}

/* Responsive Design */
@media (max-width: 1300px) {
  .products-row {
    grid-template-columns: repeat(4, 1fr);
  }

  .skeleton-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 1100px) {
  .products-row {
    grid-template-columns: repeat(3, 1fr);
  }

  .skeleton-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 970px) {
  .content-wrapper {
    flex-direction: column;
    padding: 15px 10px 40px 10px;
  }

  .products-row {
    grid-template-columns: repeat(2, 1fr);
  }

  .skeleton-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .scroller {
    height: 60vh;
    min-height: 500px;
  }

  .top-deal-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .header-actions {
    width: 100%;
    justify-content: space-between;
  }

  .status-message {
    padding: 60px 30px;
  }
}

@media (max-width: 600px) {
  .products-row {
    grid-template-columns: 1fr;
  }

  .skeleton-grid {
    grid-template-columns: 1fr;
  }

  .product-card {
    height: auto;
  }

  .header-actions {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    width: 100%;
  }

  .product-count {
    width: 100%;
  }

  .btn-retrain {
    width: 100%;
    justify-content: center;
  }

  .status-message {
    padding: 50px 20px;
  }

  .status-title {
    font-size: 18px;
  }

  .status-hint {
    font-size: 14px;
  }
}
</style>
