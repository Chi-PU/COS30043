<template>
  <div class="product-detail-page">
    <!-- Header Component -->
    <ShopHeader
      :user="user"
      :cartCount="cartCount"
      @show-auth="showPopup = true"
      @view-cart="viewCart"
      @logout="handleLogout"
    />

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <p>Loading product details...</p>
    </div>

    <!-- Error State -->
    <div v-if="error" class="error-container">
      <p>{{ error }}</p>
      <button @click="$router.push('/shop')" class="back-btn">
        Back to Shop
      </button>
    </div>

    <!-- Product Detail -->
    <div v-if="!loading && !error && product" class="product-detail">
      <!-- Left: Product Images -->
      <div class="left-column">
        <div class="main-image">
          <img :src="selectedImage || product.image_url" :alt="product.name" />
        </div>
        <div class="thumbnail-list">
          <button
            :class="{ active: selectedImage === product.image_url }"
            @click="selectedImage = product.image_url"
            class="thumbnail-btn"
            :aria-label="'Select image'"
          >
            <img :src="product.image_url" :alt="'Thumbnail'" />
          </button>
        </div>
        <button class="summary-btn" @click="toggleSummary">
          <span>View Product Description</span>
          <svg
            v-if="!showSummary"
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="12"
            fill="currentColor"
            viewBox="0 0 16 16"
          >
            <path fill-rule="evenodd" d="M1.5 5.5l6 6 6-6H1.5z" />
          </svg>
          <svg
            v-else
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="12"
            fill="currentColor"
            viewBox="0 0 16 16"
          >
            <path fill-rule="evenodd" d="M1.5 10.5l6-6 6 6H1.5z" />
          </svg>
        </button>
        <div v-if="showSummary" class="product-summary">
          <p>{{ product.description || "No description available." }}</p>
        </div>
      </div>

      <!-- Middle: Product Details -->
      <div class="middle-column">
        <div class="badges">
          <span class="badge-top-deal">TOP DEAL</span>
          <span class="badge-return">30 DAY RETURN</span>
          <span class="badge-authentic">AUTHENTIC</span>
          <span v-if="product.discount > 0" class="badge-discount"
            >-{{ product.discount }}%</span
          >
          <span v-if="product.category" class="badge-category">{{
            product.category
          }}</span>
        </div>

        <h1 class="product-title">{{ product.name }}</h1>

        <div class="rating-sales">
          <div class="rating">
            <span class="rating-score">{{
              getAverageRating().toFixed(1)
            }}</span>
            <span class="stars">
              <svg
                v-for="i in 5"
                :key="i"
                class="star-icon"
                viewBox="0 0 20 20"
              >
                <path
                  d="M10 1.5l2.9 6.3 6.9 1-5 4.9 1.2 6.9-6-3.1-6 3.1 1.2-6.9-5-4.9 6.9-1L10 1.5z"
                  :fill="
                    i <= Math.round(getAverageRating()) ? '#fbc02d' : '#e0e0e0'
                  "
                />
              </svg>
            </span>
            <span class="rating-count">({{ product.number_of_ratings }})</span>
          </div>
          <div class="sold-count">| Stock: {{ product.stock }}</div>
        </div>

        <div class="price-section">
          <div class="current-price">
            ${{ formatPrice(getDiscountedPrice()) }}
          </div>
          <div class="discount-info" v-if="product.discount > 0">
            <span class="discount-percent">-{{ product.discount }}%</span>
            <del class="original-price">${{ formatPrice(product.price) }}</del>
          </div>
          <p class="price-note">Price after discount applied</p>
          <ul class="promotions" v-if="product.discount > 0">
            <li>
              <span class="icon">🔖</span> Save ${{
                formatPrice(product.price - getDiscountedPrice())
              }}
              with discount
            </li>
            <li>
              <span class="icon">🔖</span> Free shipping on orders over $10
            </li>
          </ul>
        </div>

        <div class="shipping-info">
          <h2>Shipping Information</h2>
          <p>
            Deliver to Ho Chi Minh City, Vietnam
            <button class="change-btn">Change</button>
          </p>

          <ul>
            <li>
              <b class="now-text">EXPRESS</b> Super fast delivery 2h<br />
              <span class="free-text"
                >Before 6pm today: Free <del>$3.50</del></span
              >
            </li>
            <li>
              <svg
                class="icon-sun"
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                viewBox="0 0 16 16"
              >
                <path
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zm0 1a3 3 0 110 6 3 3 0 010-6z"
                />
              </svg>
              Standard delivery (2-3 days)<br />
              <span class="free-text">Free shipping <del>$1.65</del></span>
            </li>
            <li>
              <svg
                class="icon-truck"
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M1 3h15v13H1z" />
                <path d="M17 6h5l1 5h-6z" />
                <circle cx="5.5" cy="18.5" r="2.5" />
                <circle cx="18.5" cy="18.5" r="2.5" />
              </svg>
              Free shipping on orders from $10, Free shipping $2.50 on orders
              from $20
            </li>
          </ul>
        </div>

        <div class="other-discounts" v-if="product.discount > 0">
          <h3>Other Offers</h3>
          <div class="discount-codes">
            <button class="discount-btn">Save 5%</button>
            <button class="discount-btn">Save $0.80</button>
            <button class="more-btn">›</button>
          </div>
        </div>

        <!-- Rate Product Section -->
        <div class="rate-product">
          <h3>Rate This Product</h3>
          <div class="rating-input">
            <button
              v-for="star in 5"
              :key="star"
              @click="setRating(star)"
              class="star-btn"
              :class="{ active: star <= userRating }"
            >
              ★
            </button>
            <button
              @click="submitRating"
              class="submit-rating-btn"
              :disabled="!userRating || submittingRating"
            >
              {{ submittingRating ? "Submitting..." : "Submit Rating" }}
            </button>
          </div>
        </div>
      </div>

      <!-- Right: Purchase Section -->
      <div class="right-column">
        <div class="seller-info">
          <div class="seller-name">
            <img
              src="https://frontend.tikicdn.com/_desktop-next/static/img/favicon.ico"
              alt="Shop logo"
              class="shop-logo"
            />
            Official Store
            <span class="official-badge">VERIFIED</span>
          </div>
          <div class="rating-summary">
            <span class="score">{{ getAverageRating().toFixed(1) }}</span>
            <span class="star">★</span>
            <span class="reviews"
              >({{ product.number_of_ratings }} reviews)</span
            >
          </div>
        </div>

        <div class="quantity-selector">
          <label for="quantity">Quantity</label>
          <div class="qty-controls">
            <button
              @click="decrementQty"
              aria-label="Decrease quantity"
              :disabled="quantity <= 1"
            >
              -
            </button>
            <input
              id="quantity"
              type="number"
              v-model.number="quantity"
              min="1"
              :max="product.stock"
            />
            <button
              @click="incrementQty"
              aria-label="Increase quantity"
              :disabled="quantity >= product.stock"
            >
              +
            </button>
          </div>
          <p class="stock-info" v-if="product.stock > 0">
            {{ product.stock }} items available
          </p>
          <p class="stock-info out-of-stock" v-else>Out of Stock</p>
        </div>

        <div class="subtotal">
          <label>Subtotal</label>
          <div class="subtotal-price">${{ formattedSubtotal }}</div>
        </div>

        <button
          @click="handleAddToCart"
          class="add-to-cart-btn"
          :disabled="product.stock === 0 || addingToCart"
        >
          {{ addingToCart ? "Adding..." : "Add to Cart" }}
        </button>
      </div>
    </div>

    <!-- Auth Popup -->
    <AuthPopup
      :isOpen="showPopup"
      initialTab="login"
      @close="showPopup = false"
      @login-success="handleLoginSuccess"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import ShopHeader from "./ShopHeader.vue";
import AuthPopup from "./AuthPopup.vue";
import { productsAPI, cartAPI, authAPI } from "../services/api";

const route = useRoute();

// State
const loading = ref(true);
const error = ref(null);
const product = ref(null);
const user = ref(null);
const cartCount = ref(0);
const selectedImage = ref("");
const quantity = ref(1);
const showSummary = ref(false);
const showPopup = ref(false);
const addingToCart = ref(false);
const userRating = ref(0);
const submittingRating = ref(false);

// Computed
const subtotal = computed(() => {
  if (!product.value) return 0;
  return getDiscountedPrice() * quantity.value;
});

const formattedSubtotal = computed(() => {
  return formatPrice(subtotal.value);
});

// Functions
const formatPrice = (price) => {
  return parseFloat(price).toFixed(2);
};

const getDiscountedPrice = () => {
  if (!product.value) return 0;
  if (product.value.discount > 0) {
    return product.value.price * (1 - product.value.discount / 100);
  }
  return product.value.price;
};

const getAverageRating = () => {
  if (!product.value || product.value.number_of_ratings === 0) return 0;
  return product.value.total_rating_score / product.value.number_of_ratings;
};

const fetchProduct = async () => {
  try {
    loading.value = true;
    error.value = null;
    const productId = route.params.id;
    const response = await productsAPI.getById(productId);
    product.value = response.data.product;
    selectedImage.value = product.value.image_url;
  } catch (err) {
    console.error("Error fetching product:", err);
    error.value = "Unable to load product details. Product may not exist.";
  } finally {
    loading.value = false;
  }
};

const checkAuth = async () => {
  try {
    const response = await authAPI.getMe();
    user.value = response.data.user;
    await fetchCartCount();
  } catch (err) {
    user.value = null;
  }
};

const fetchCartCount = async () => {
  try {
    const response = await cartAPI.getCart();
    cartCount.value = response.data.cart.length;
  } catch (err) {
    console.error("Error fetching cart:", err);
  }
};

const handleAddToCart = async () => {
  if (!user.value) {
    alert("Please login to add items to cart");
    showPopup.value = true;
    return;
  }

  if (product.value.stock === 0) {
    alert("This product is out of stock");
    return;
  }

  if (quantity.value > product.value.stock) {
    alert(`Only ${product.value.stock} items available`);
    return;
  }

  try {
    addingToCart.value = true;
    await cartAPI.addToCart({
      product_id: product.value.id,
      quantity: quantity.value,
    });
    cartCount.value += quantity.value;
    alert(
      `${product.value.name} (x${quantity.value}) has been added to your cart!`
    );
    quantity.value = 1; // Reset quantity
  } catch (err) {
    console.error("Error adding to cart:", err);
    alert("Unable to add to cart. Please try again.");
  } finally {
    addingToCart.value = false;
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

const handleLoginSuccess = (userData) => {
  user.value = userData;
  showPopup.value = false;
  fetchCartCount();
};

const handleLogout = async () => {
  try {
    await authAPI.logout();
    user.value = null;
    cartCount.value = 0;
    alert("You have been logged out successfully!");
  } catch (err) {
    console.error("Logout error:", err);
    alert("Error logging out. Please try again.");
  }
};

const incrementQty = () => {
  if (quantity.value < product.value.stock) {
    quantity.value++;
  }
};

const decrementQty = () => {
  if (quantity.value > 1) {
    quantity.value--;
  }
};

const toggleSummary = () => {
  showSummary.value = !showSummary.value;
};

const setRating = (star) => {
  userRating.value = star;
};

const submitRating = async () => {
  if (!user.value) {
    alert("Please login to rate this product");
    showPopup.value = true;
    return;
  }

  if (!userRating.value) {
    alert("Please select a rating");
    return;
  }

  try {
    submittingRating.value = true;
    await productsAPI.addRating(product.value.id, userRating.value);

    // Refresh product data to get updated rating
    await fetchProduct();

    alert("Thank you for your rating!");
    userRating.value = 0;
  } catch (err) {
    console.error("Error submitting rating:", err);
    alert("Unable to submit rating. Please try again.");
  } finally {
    submittingRating.value = false;
  }
};

// Lifecycle
onMounted(() => {
  fetchProduct();
  checkAuth();
});
</script>

<style scoped>
.product-detail-page {
  background: #f5f5f5;
  min-height: 100vh;
}

.loading-container,
.error-container {
  text-align: center;
  padding: 60px 20px;
  font-size: 18px;
}

.back-btn {
  margin-top: 20px;
  padding: 12px 24px;
  background: #007dff;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
}

.back-btn:hover {
  background: #0066cc;
}

.product-detail {
  display: flex;
  gap: 20px;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  color: #222;
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

/* Left column */
.left-column {
  flex: 1.2;
  border: 1px solid #e3e3e3;
  border-radius: 10px;
  padding: 15px;
  max-width: 340px;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: white;
  height: fit-content;
}

.main-image img {
  width: 100%;
  max-height: 400px;
  border-radius: 12px;
  object-fit: contain;
}

.thumbnail-list {
  display: flex;
  margin-top: 10px;
  gap: 10px;
}

.thumbnail-btn {
  border: 2px solid transparent;
  padding: 3px;
  border-radius: 6px;
  background: #fff;
  cursor: pointer;
  width: 60px;
  height: 90px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.qty-controls button:hover:not(:disabled) {
  background: #f0f0f0;
}

.qty-controls button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.qty-controls input {
  border: 1.5px solid #e5e5e5;
  border-radius: 6px;
  font-size: 16px;
  width: 64px;
  height: 36px;
  padding: 0 8px;
  text-align: center;
  font-weight: 600;
}

.stock-info {
  font-size: 13px;
  color: #28a745;
  font-weight: 600;
  margin: 0;
}

.stock-info.out-of-stock {
  color: #dc3545;
}

.subtotal {
  display: flex;
  flex-direction: column;
  font-weight: 700;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.subtotal label {
  font-size: 14px;
  margin-bottom: 8px;
  color: #666;
}

.subtotal-price {
  font-size: 28px;
  color: #222;
}

.buy-now-btn {
  background-color: #ef4444;
  color: white;
  font-weight: 700;
  border: none;
  border-radius: 8px;
  padding: 14px;
  font-size: 16px;
  cursor: pointer;
  width: 100%;
  transition: background-color 0.3s ease;
}

.buy-now-btn:hover:not(:disabled) {
  background-color: #d13f3f;
}

.buy-now-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.add-to-cart-btn {
  border: 1.5px solid #006bc6;
  background: transparent;
  color: #006bc6;
  font-weight: 700;
  border-radius: 8px;
  padding: 14px;
  font-size: 16px;
  cursor: pointer;
  width: 100%;
  transition: background-color 0.3s ease;
}

.add-to-cart-btn:hover:not(:disabled) {
  background-color: #e6f0ff;
}

.add-to-cart-btn:disabled {
  border-color: #ccc;
  color: #ccc;
  cursor: not-allowed;
}

.back-to-shop-btn {
  border: 1.5px solid #999;
  background: white;
  color: #666;
  font-weight: 600;
  border-radius: 8px;
  padding: 12px;
  font-size: 14px;
  cursor: pointer;
  width: 100%;
  transition: all 0.3s ease;
}

.back-to-shop-btn:hover {
  background-color: #f5f5f5;
  border-color: #666;
}

.promo-banner {
  background: linear-gradient(270deg, #837eff, #683de6);
  border-radius: 12px;
  padding: 16px;
  color: white;
  text-align: center;
  font-weight: 700;
  font-size: 14px;
  user-select: none;
}

.promo-text {
  font-size: 16px;
  margin-bottom: 4px;
}

.promo-subtext {
  font-size: 12px;
  font-weight: 500;
}

.chat-buttons {
  position: fixed;
  bottom: 24px;
  right: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  z-index: 9999;
}

.help-btn,
.news-btn {
  background-color: #1777ff;
  border: none;
  color: white;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  padding: 12px 16px;
  border-radius: 12px;
  min-width: 88px;
  box-shadow: 0 4px 6px rgba(23, 119, 255, 0.4);
  transition: background-color 0.3s ease;
}

.help-btn:hover,
.news-btn:hover {
  background-color: #125dc1;
}

/* Responsive */
@media (max-width: 1024px) {
  .product-detail {
    flex-direction: column;
    align-items: center;
  }

  .left-column,
  .middle-column,
  .right-column {
    max-width: 100%;
    width: 100%;
  }

  .right-column {
    position: static;
  }
}

@media (max-width: 640px) {
  .product-detail {
    padding: 10px;
    gap: 15px;
  }

  .product-title {
    font-size: 20px;
  }

  .current-price {
    font-size: 28px;
  }

  .subtotal-price {
    font-size: 24px;
  }

  .chat-buttons {
    bottom: 16px;
    right: 16px;
  }
}
.product-detail {
  display: flex;
  gap: 32px;
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 20px;
  background: #fff;
  font-family: "Arial", sans-serif;
  color: #222;
  border-radius: 12px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.05);
}

/* Left column - images */
.left-column {
  flex: 0 0 280px;
  background: #fff;
  border: 1px solid #e1e1e1;
  border-radius: 16px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.main-image img {
  width: 260px;
  height: 320px;
  object-fit: contain;
  border-radius: 16px;
  box-shadow: 0 1px 6px rgb(0 0 0 / 0.1);
}

.thumbnail-list {
  display: flex;
  gap: 14px;
}

.thumbnail-btn {
  border: 2px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  padding: 4px;
  width: 60px;
  height: 80px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #fff;
  box-shadow: 0 1px 3px rgb(0 0 0 / 0.1);
  transition: border-color 0.2s ease;
}

.thumbnail-btn.active,
.thumbnail-btn:hover {
  border-color: #0066c0;
}

.thumbnail-btn img {
  max-width: 100%;
  max-height: 100%;
  border-radius: 6px;
  object-fit: contain;
}

/* Summary button */
.summary-btn {
  border: none;
  background: none;
  color: #0066c0;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0;
  margin-top: 12px;
  user-select: none;
}

.summary-btn svg {
  transition: transform 0.2s ease;
  fill: #0066c0;
}

.summary-btn:hover svg {
  fill: #004080;
}

.product-summary {
  margin-top: 8px;
  font-size: 13px;
  line-height: 1.4;
  color: #444;
  max-width: 270px;
  text-align: justify;
}

/* Middle column - details */
.middle-column {
  flex: 1.5;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.badges {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  font-size: 12px;
}

.badge-top-deal,
.badge-return,
.badge-authentic,
.badge-discount,
.badge-category {
  padding: 4px 10px;
  border-radius: 12px;
  font-weight: 600;
  color: white;
  user-select: none;
}

.badge-top-deal {
  background: #f44336;
}

.badge-return {
  background: #1976d2;
}

.badge-authentic {
  background: #0288d1;
}

.badge-discount {
  background: #f05753;
}

.badge-category {
  background: #9c27b0;
}

.product-title {
  font-weight: 700;
  font-size: 28px;
  line-height: 1.2;
  color: #222;
  margin: 0;
}

.rating-sales {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 14px;
  color: #444;
}

.rating {
  display: flex;
  align-items: center;
  gap: 6px;
}

.rating-score {
  font-weight: 700;
  font-size: 16px;
  color: #ffb400;
}

.stars svg {
  width: 20px;
  height: 20px;
}

.rating-count {
  font-size: 14px;
  color: #666;
}

.sold-count {
  color: #666;
  font-weight: 600;
}

/* Price section */
.price-section {
  margin-top: 8px;
}

.current-price {
  font-size: 26px;
  font-weight: 700;
  color: #d8000c; /* strong red */
  margin-bottom: 6px;
}

.discount-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.discount-percent {
  background: #e74c3c;
  color: #fff;
  font-weight: 700;
  font-size: 14px;
  padding: 4px 10px;
  border-radius: 12px;
  user-select: none;
}

.original-price {
  font-size: 16px;
  color: #a0a0a0;
  text-decoration: line-through;
}

.price-note {
  font-size: 12px;
  color: #666;
  margin-top: 4px;
}

.promotions {
  margin-top: 8px;
  padding-left: 18px;
  font-size: 13px;
  color: #444;
}

.promotions li {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
}

.promotions .icon {
  font-size: 16px;
  color: #1976d2;
}

/* Shipping Info */
.shipping-info {
  margin-top: 20px;
  border-top: 1px solid #eee;
  padding-top: 16px;
  font-size: 14px;
  color: #222;
}

.shipping-info h2 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 12px;
}

.shipping-info p {
  font-weight: 600;
  color: #444;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.shipping-info .change-btn {
  margin-left: auto;
  background: none;
  border: none;
  color: #0066c0;
  cursor: pointer;
  font-weight: 600;
  font-size: 13px;
  padding: 2px 6px;
  border-radius: 4px;
  transition: background-color 0.3s ease;
}

.shipping-info .change-btn:hover {
  background-color: #d6eaff;
}

.shipping-info ul {
  list-style: none;
  padding-left: 0;
  margin: 0;
  color: #555;
}

.shipping-info ul li {
  margin-bottom: 10px;
  line-height: 1.3;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.free-text {
  font-weight: 700;
  color: #329733;
  margin-left: 22px;
  font-size: 13px;
}

.now-text {
  color: #d8000c;
  font-weight: 700;
  margin-right: 6px;
}

/* Other Discounts */
.other-discounts {
  margin-top: 20px;
  border-top: 1px solid #eee;
  padding-top: 12px;
}

.other-discounts h3 {
  font-weight: 700;
  margin-bottom: 12px;
  font-size: 16px;
}

.discount-codes {
  display: flex;
  gap: 12px;
}

.discount-btn {
  border: 1.5px solid #0066c0;
  border-radius: 8px;
  background: transparent;
  color: #0066c0;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  padding: 6px 14px;
  transition: background-color 0.2s ease;
}

.discount-btn:hover {
  background-color: #e6f0ff;
}

.more-btn {
  font-weight: 700;
  font-size: 20px;
  cursor: pointer;
  color: #0066c0;
  border: none;
  background: none;
  padding: 0 10px;
  user-select: none;
}

/* Rate Product Section */
.rate-product {
  margin-top: 24px;
  border-top: 1px solid #eee;
  padding-top: 12px;
}

.rate-product h3 {
  font-weight: 700;
  margin-bottom: 14px;
  font-size: 16px;
}

.rating-input {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
}

.star-btn {
  font-size: 26px;
  background: none;
  border: none;
  color: #e0e0e0;
  cursor: pointer;
  user-select: none;
  transition: color 0.2s ease;
}

.star-btn.active {
  color: #fbc02d;
}

.submit-rating-btn {
  font-weight: 700;
  font-size: 14px;
  background-color: #0066c0;
  border: none;
  border-radius: 8px;
  padding: 8px 20px;
  color: #fff;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.submit-rating-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.submit-rating-btn:not(:disabled):hover {
  background-color: #004a99;
}

/* Right column - purchase */
.right-column {
  flex: 0 0 320px;
  background: #fff;
  border: 1px solid #e1e1e1;
  border-radius: 16px;
  padding: 24px 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: fit-content;
}

.seller-info {
  display: flex;
  flex-direction: column;
  gap: 10px;
  border-bottom: 1px solid #eee;
  padding-bottom: 12px;
  font-size: 14px;
}

.seller-name {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 700;
  font-size: 16px;
  color: #0066c0;
}

.shop-logo {
  width: 22px;
  height: 22px;
}

.official-badge {
  background-color: #0066c0;
  color: white;
  font-size: 11px;
  font-weight: 600;
  border-radius: 14px;
  padding: 2px 8px;
  user-select: none;
}

.rating-summary {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;
  font-size: 13px;
}

.rating-summary .score {
  font-weight: 700;
  color: #ffb400;
  font-size: 16px;
}

.rating-summary .star {
  color: #ffb400;
  font-size: 16px;
}

.rating-summary .reviews {
  font-size: 13px;
}

/* Quantity selector */
.quantity-selector {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-weight: 700;
  font-size: 14px;
  user-select: none;
}

.qty-controls {
  display: flex;
  gap: 8px;
  align-items: center;
}

.qty-controls button {
  width: 34px;
  height: 34px;
  font-size: 22px;
  border-radius: 6px;
  border: 1.5px solid #0066c0;
  color: #0066c0;
  background: transparent;
  cursor: pointer;
  user-select: none;
  transition: background-color 0.2s ease;
}

.qty-controls button:disabled {
  opacity: 0.4;
  cursor: default;
}

.qty-controls button:not(:disabled):hover {
  background-color: #e6f0ff;
}

.qty-controls input {
  border: 1.5px solid #ccc;
  border-radius: 6px;
  font-weight: 700;
  font-size: 16px;
  width: 70px;
  height: 34px;
  text-align: center;
}

/* Stock info */
.stock-info {
  color: #28a745;
  font-weight: 600;
  font-size: 13px;
  margin-top: 4px;
}

.stock-info.out-of-stock {
  color: #dc3545;
}

/* Subtotal */
.subtotal {
  font-weight: 700;
  font-size: 26px;
  color: #222;
  user-select: none;
}

/* Buttons */
.buy-now-btn {
  background-color: #ff4545;
  border: none;
  border-radius: 12px;
  color: white;
  font-weight: 700;
  font-size: 18px;
  padding: 14px 0;
  cursor: pointer;
  width: 100%;
  user-select: none;
  transition: background-color 0.3s ease;
}

.buy-now-btn:disabled {
  background-color: #f0a0a0;
  cursor: not-allowed;
}

.buy-now-btn:hover:not(:disabled) {
  background-color: #cc1f1f;
}

.add-to-cart-btn {
  border: 2px solid #0066c0;
  border-radius: 12px;
  background: transparent;
  color: #0066c0;
  font-weight: 700;
  font-size: 16px;
  padding: 14px 0;
  cursor: pointer;
  width: 100%;
  user-select: none;
  transition: background-color 0.3s ease, color 0.3s ease;
}

.add-to-cart-btn:disabled {
  border-color: #a0a0a0;
  color: #a0a0a0;
  cursor: not-allowed;
}

.add-to-cart-btn:hover:not(:disabled) {
  background-color: #e6f0ff;
  color: #004080;
}

.back-to-shop-btn {
  border: 1.5px solid #999;
  background: white;
  color: #444;
  padding: 12px 0;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 700;
  font-size: 14px;
  user-select: none;
  transition: background-color 0.3s ease, border-color 0.3s ease;
  width: 100%;
}

.back-to-shop-btn:hover {
  background-color: #f5f5f5;
  border-color: #666;
}

/* Promo banner */
.promo-banner {
  background: linear-gradient(270deg, #837eff, #683de6);
  border-radius: 20px;
  text-align: center;
  padding: 14px 0;
  font-weight: 700;
  font-size: 16px;
  color: white;
  user-select: none;
}

.promo-subtext {
  font-size: 12px;
  margin-top: 4px;
  font-weight: 500;
}

/* Chat buttons */
.chat-buttons {
  position: fixed;
  bottom: 24px;
  right: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  user-select: none;
  z-index: 9999;
}

.help-btn,
.news-btn {
  background-color: #1777ff;
  border: none;
  color: white;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  padding: 12px 16px;
  border-radius: 12px;
  min-width: 88px;
  box-shadow: 0 4px 6px rgba(23, 119, 255, 0.4);
  transition: background-color 0.3s ease;
}

.help-btn:hover,
.news-btn:hover {
  background-color: #125dc1;
}

/* Scrollbar hiding for thumbnails container for clean look */
.thumbnail-list::-webkit-scrollbar {
  display: none;
}

.thumbnail-list {
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
}
</style>
