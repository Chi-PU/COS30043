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
      <div class="top-deal-header">
        <div class="title">
          <span class="icon">👍</span>
          <span class="label">TOP DEALS</span> •
          <span class="sub-label">SUPER SALE</span>
        </div>
        <span> Total {{ displayedProducts.length }} products</span>
      </div>
      <!-- Loading State -->
      <div v-if="loading" class="loading-message">
        <p>Loading products...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error-message">
        <p>{{ error }}</p>
        <button @click="$emit('retry')">Try Again</button>
      </div>

      <!-- Top Deal Product Section -->
      <section v-else class="top-deal-section">
        <!-- Virtual Scroller -->
        <RecycleScroller
          v-if="productRows.length > 0"
          class="scroller"
          :items="productRows"
          :item-size="400"
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

        <!-- Empty State -->
        <div v-else class="empty-state">
          <p>No products found in this category</p>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { RecycleScroller } from "vue-virtual-scroller";
import "vue-virtual-scroller/dist/vue-virtual-scroller.css";

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

// Computed Properties
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

// Create rows of products for virtual scrolling (5 per row)
const productRows = computed(() => {
  const rows = [];
  const productsPerRow = 5;
  const products = displayedProducts.value;

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

const filterByCategory = (category) => {
  selectedCategory.value = category;
};

const addToCart = async (product) => {
  addingToCart.value[product.id] = true;

  try {
    const response = await fetch("http://localhost:8080/api/cart", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        product_id: product.id,
        quantity: 1,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      if (response.status === 401) {
        alert("Please login to add items to cart");
        emit("show-auth");
      } else {
        throw new Error(errorData.error || "Failed to add to cart");
      }
    } else {
      alert("Added to cart successfully!");
      emit("cart-updated");
    }
  } catch (error) {
    console.error("Add to cart error:", error);
    alert("Failed to add to cart. Please try again.");
  } finally {
    addingToCart.value[product.id] = false;
  }
};
</script>

<style scoped>
/* Loading and Error States */
.loading-message,
.error-message,
.empty-state {
  text-align: center;
  padding: 60px 40px;
  font-size: 16px;
  color: #666;
}

.error-message button {
  margin-top: 16px;
  padding: 12px 24px;
  background: #007dff;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  transition: background 0.3s;
}

.error-message button:hover {
  background: #0066cc;
}

/* Main Layout */
.content-wrapper {
  display: flex;
  padding: 25px 20px 40px 20px;
  gap: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

/* Sidebar */
.sidebar {
  min-width: 220px;
  border-radius: 8px;
  background: #f4f4f6;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  padding: 16px 0;
  user-select: none;
  height: fit-content;
  position: sticky;
  top: 20px;
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
  padding: 12px 14px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  color: #3b3b3b;
  transition: all 0.2s ease;
}

.categories li:hover {
  background-color: rgba(0, 125, 255, 0.1);
}

.categories li.active {
  background-color: rgba(0, 125, 255, 0.2);
  font-weight: 700;
  color: #007dff;
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

/* Main Content */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 18px;
  min-width: 0;
}

/* Top Deal Section */
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
  height: 360px;
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

.badge.discount {
  position: absolute;
  top: 8px;
  right: 8px;
  font-size: 11px;
  font-weight: 700;
  padding: 5px 8px;
  border-radius: 4px;
  background: #ff5722;
  color: #fff;
  z-index: 1;
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

/* Rating */
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

/* Price */
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

/* Delivery Info */
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

/* Add to Cart Button */
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
}

@media (max-width: 1100px) {
  .products-row {
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
    position: static;
  }

  .products-row {
    grid-template-columns: repeat(2, 1fr);
  }

  .scroller {
    height: 60vh;
    min-height: 500px;
  }
}

@media (max-width: 600px) {
  .products-row {
    grid-template-columns: 1fr;
  }

  .product-card {
    height: auto;
  }

  .top-deal-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>
