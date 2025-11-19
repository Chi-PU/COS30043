<template>
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
            @click="filterByCategory('home')"
            :class="{ active: selectedCategory === 'home' }"
          >
            <img
              src="https://img.icons8.com/ios/50/000000/interior.png"
              alt="home"
            />
            <span>Home</span>
          </li>
          <li
            @click="filterByCategory('beauty')"
            :class="{ active: selectedCategory === 'beauty' }"
          >
            <img
              src="https://img.icons8.com/ios/50/000000/cosmetic-brush.png"
              alt="beauty"
            />
            <span>Beauty</span>
          </li>
          <li
            @click="filterByCategory('health')"
            :class="{ active: selectedCategory === 'health' }"
          >
            <img
              src="https://img.icons8.com/ios/50/000000/health-book.png"
              alt="health"
            />
            <span>Health</span>
          </li>
          <li
            @click="filterByCategory('food')"
            :class="{ active: selectedCategory === 'food' }"
          >
            <img
              src="https://img.icons8.com/ios/50/000000/restaurant.png"
              alt="food"
            />
            <span>Food</span>
          </li>
          <li
            @click="filterByCategory('clothing')"
            :class="{ active: selectedCategory === 'clothing' }"
          >
            <img
              src="https://img.icons8.com/ios/50/000000/t-shirt.png"
              alt="clothing"
            />
            <span>Clothing</span>
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
        <button @click="$emit('retry')">Try Again</button>
      </div>

      <!-- Top Deal Product Section -->
      <section v-if="!loading && !error" class="top-deal-section">
        <div class="top-deal-header">
          <div class="title">
            <span class="icon">👍</span>
            <span class="label">TOP DEALS</span> •
            <span class="sub-label">SUPER SALE</span>
          </div>
          <a>Total {{ displayedProducts.length }} products</a>
        </div>

        <div class="products-grid">
          <div
            v-for="product in displayedProducts"
            :key="product.id"
            class="product-card"
            @click="$emit('view-product', product)"
          >
            <!-- Product Image -->
            <div class="product-image">
              <img
                :src="product.image_url || 'https://via.placeholder.com/200'"
                :alt="product.name"
              />
              <span v-if="product.discount > 0" class="badge discount"
                >-{{ product.discount }}%</span
              >
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
                <span class="old-price">${{ formatPrice(product.price) }}</span>
              </div>
            </div>

            <!-- Stock Info -->
            <div class="delivery-info">
              <span v-if="product.stock > 0">{{ product.stock }} in stock</span>
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
</template>

<script setup>
import { ref, computed } from "vue";

// Props
const props = defineProps({
  products: {
    type: Array,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  error: {
    type: String,
    default: null,
  },
});

// Emits
const emit = defineEmits(["view-product", "retry", "cart-updated"]);

// State
const selectedCategory = ref("all");
const addingToCart = ref({});

// Computed
const displayedProducts = computed(() => {
  if (selectedCategory.value === "all") {
    return props.products;
  }

  return props.products.filter((p) => {
    if (!p.category) return false;

    // Handle category as array
    if (Array.isArray(p.category)) {
      return p.category.some((cat) =>
        cat.toLowerCase().includes(selectedCategory.value.toLowerCase())
      );
    }

    // Handle category as string
    if (typeof p.category === "string") {
      return p.category
        .toLowerCase()
        .includes(selectedCategory.value.toLowerCase());
    }

    return false;
  });
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

const filterByCategory = (category) => {
  selectedCategory.value = category;
};

const addToCart = async (product) => {
  // Set loading state for this product
  addingToCart.value[product.id] = true;

  try {
    const response = await fetch("http://localhost:8080/api/cart", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Important for sending session cookies
      body: JSON.stringify({
        product_id: product.id,
        quantity: 1,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      if (response.status === 401) {
        alert("Please login to add items to cart");
      } else {
        throw new Error(errorData.error || "Failed to add to cart");
      }
    } else {
      const data = await response.json();
      alert("Added to cart successfully!");
      // Emit event to parent to refresh cart
      emit("cart-updated");
    }
  } catch (error) {
    console.error("Add to cart error:", error);
    alert("Failed to add to cart. Please try again.");
  } finally {
    // Remove loading state
    addingToCart.value[product.id] = false;
  }
};
</script>

<style scoped>
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
  max-width: 100%;
  user-select: none;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
}

.top-deal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
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

.products-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16px;
  width: 100%;
}

.product-card {
  background: #fff;
  border: 1px solid #f0f0f2;
  border-radius: 10px;
  padding: 10px;
  box-sizing: border-box;
  position: relative;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition: box-shadow 0.2s, transform 0.2s;
}

.product-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.product-image {
  width: 100%;
  height: 180px;
  margin: 0 auto 8px auto;
  overflow: hidden;
  flex-shrink: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

.product-image img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  user-select: none;
}

.badge.discount {
  position: absolute;
  top: 8px;
  right: 8px;
  font-size: 11px;
  font-weight: 700;
  padding: 4px 8px;
  border-radius: 4px;
  background: #ff5722;
  color: #fff;
  font-family: Arial, Helvetica, sans-serif;
  z-index: 1;
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
  max-width: 1400px;
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

@media (max-width: 1300px) {
  .products-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 1100px) {
  .products-grid {
    grid-template-columns: repeat(3, 1fr);
  }
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
  .products-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 600px) {
  .products-grid {
    grid-template-columns: 1fr;
  }
}
</style>
