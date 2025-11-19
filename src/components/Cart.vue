<template>
  <div class="cart-container">
    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <p>Loading your cart...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
      <button @click="fetchCart" class="retry-btn">Try Again</button>
    </div>

    <!-- Empty Cart -->
    <div v-else-if="cartItems.length === 0" class="empty-cart">
      <p>Your cart is empty</p>
      <button @click="goToShop" class="shop-btn">Continue Shopping</button>
    </div>

    <!-- Cart Content -->
    <template v-else>
      <!-- Left: Cart Items -->
      <div class="cart-left">
        <h2 class="cart-title">SHOPPING CART</h2>

        <!-- Select All -->
        <div class="select-all">
          <input
            type="checkbox"
            v-model="selectAll"
            @change="toggleSelectAll"
          />
          <span>All ({{ cartItems.length }} products)</span>
          <span class="headers">
            <span>Unit Price</span>
            <span>Quantity</span>
            <span>Total</span>
            <span></span>
          </span>
        </div>

        <!-- Cart Items -->
        <div class="shop-block">
          <div class="shop-header">
            <input
              type="checkbox"
              v-model="shopSelected"
              @change="updateShopSelection"
            />
            <span class="shop-icon">🏪</span>
            <span class="shop-name">Your Cart</span>
          </div>

          <!-- Product List -->
          <div v-for="item in cartItems" :key="item.id" class="item-row">
            <div class="item-check">
              <input
                type="checkbox"
                v-model="item.selected"
                @change="updateItemSelection"
              />
            </div>

            <img
              :src="item.product.image_url || 'https://via.placeholder.com/200'"
              class="item-img"
              :alt="item.product.name"
            />

            <div class="item-info">
              <div class="item-title">{{ item.product.name }}</div>
              <div class="item-sub">🚚 Delivery tomorrow</div>
              <div class="item-sub" v-if="item.product.stock > 0">
                {{ item.product.stock }} in stock
              </div>
            </div>

            <div class="price">
              <div class="current">
                {{ format(getDiscountedPrice(item.product)) }}
              </div>
              <div class="old" v-if="item.product.discount > 0">
                {{ format(item.product.price) }}
              </div>
              <div class="discount" v-if="item.product.discount > 0">
                ↓ Save {{ item.product.discount }}%
              </div>
            </div>

            <div class="qty-box">
              <button
                @click="updateQuantity(item, item.quantity - 1)"
                :disabled="item.quantity <= 1 || updatingItem[item.id]"
              >
                −
              </button>
              <input
                type="number"
                :value="item.quantity"
                @change="handleQuantityInput(item, $event)"
                min="1"
                :max="item.product.stock"
                :disabled="updatingItem[item.id]"
              />
              <button
                @click="updateQuantity(item, item.quantity + 1)"
                :disabled="
                  item.quantity >= item.product.stock || updatingItem[item.id]
                "
              >
                +
              </button>
            </div>

            <div class="total">
              {{ format(getDiscountedPrice(item.product) * item.quantity) }}
            </div>

            <button
              class="delete-btn"
              @click="removeItem(item)"
              :disabled="removingItem[item.id]"
            >
              🗑
            </button>
          </div>

          <!-- Freeship info -->
          <div class="freeship-info">
            <span class="truck-icon">🚚</span>
            Free shipping on orders over $10
            <span class="info-icon">ⓘ</span>
          </div>
        </div>
      </div>

      <!-- Right: Summary -->
      <div class="cart-right">
        <!-- Delivery Section -->
        <div class="delivery-box">
          <div class="delivery-header">
            <span>Deliver to</span>
            <a href="#" class="change-link">Change</a>
          </div>
          <div class="delivery-info">
            <strong>{{ user?.name || "Customer" }}</strong>
          </div>
          <div>
            <span>154 WashingTon Street</span>
          </div>
          <div class="delivery-note">
            <span class="note-icon">💡</span>
            Note: Please ensure your delivery address is correct
          </div>
        </div>

        <!-- Summary Section -->
        <div class="summary-box">
          <div class="total-line">
            <span>Total goods</span>
            <span>{{ format(totalPrice) }}</span>
          </div>

          <div class="discount-line">
            <span>Direct discount</span>
            <span class="discount-amount">-{{ format(totalDiscount) }}</span>
          </div>

          <div class="pay-total">
            <span>Total payment</span>
            <span class="pay">{{ format(finalTotal) }}</span>
          </div>

          <div class="vat-note">(VAT included if applicable)</div>

          <button
            class="buy-btn"
            @click="handleCheckout"
            :disabled="totalSelectedItems === 0"
          >
            Buy Now ({{ totalSelectedItems }})
          </button>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { cartAPI, authAPI } from "../services/api";

const router = useRouter();

// State
const loading = ref(true);
const error = ref(null);
const cartItems = ref([]);
const user = ref(null);
const selectAll = ref(true);
const shopSelected = ref(true);
const updatingItem = ref({});
const removingItem = ref({});

// Computed
const totalSelectedItems = computed(() => {
  return cartItems.value
    .filter((item) => item.selected)
    .reduce((sum, item) => sum + item.quantity, 0);
});

const totalPrice = computed(() => {
  return cartItems.value
    .filter((item) => item.selected)
    .reduce((sum, item) => {
      const price = getDiscountedPrice(item.product);
      return sum + price * item.quantity;
    }, 0);
});

const totalDiscount = computed(() => {
  return cartItems.value
    .filter((item) => item.selected && item.product.discount > 0)
    .reduce((sum, item) => {
      const discount = item.product.price - getDiscountedPrice(item.product);
      return sum + discount * item.quantity;
    }, 0);
});

const finalTotal = computed(() => totalPrice.value);

// Functions
const format = (value) => {
  return "$" + value.toFixed(2);
};

const getDiscountedPrice = (product) => {
  if (product.discount > 0) {
    return product.price * (1 - product.discount / 100);
  }
  return product.price;
};

const fetchCart = async () => {
  try {
    loading.value = true;
    error.value = null;

    const response = await cartAPI.getCart();
    cartItems.value = response.data.cart.map((item) => ({
      ...item,
      selected: true,
    }));

    console.log("✅ Cart items loaded:", cartItems.value);
  } catch (err) {
    console.error("Error fetching cart:", err);
    error.value = "Unable to load cart. Please try again.";
  } finally {
    loading.value = false;
  }
};

const fetchUser = async () => {
  try {
    const response = await authAPI.getMe();
    user.value = response.data.user;
  } catch (err) {
    console.log("User not logged in");
  }
};

const toggleSelectAll = () => {
  cartItems.value.forEach((item) => {
    item.selected = selectAll.value;
  });
  shopSelected.value = selectAll.value;
};

const updateShopSelection = () => {
  cartItems.value.forEach((item) => {
    item.selected = shopSelected.value;
  });
  updateSelectAll();
};

const updateItemSelection = () => {
  updateSelectAll();
};

const updateSelectAll = () => {
  const allSelected = cartItems.value.every((item) => item.selected);
  selectAll.value = allSelected;
  shopSelected.value = allSelected;
};

const updateQuantity = async (item, newQuantity) => {
  if (newQuantity < 1 || newQuantity > item.product.stock) {
    return;
  }

  try {
    updatingItem.value[item.id] = true;

    await cartAPI.updateCart(item.id, {
      quantity: newQuantity,
    });

    item.quantity = newQuantity;
    console.log("✅ Quantity updated:", item.product.name, "->", newQuantity);
  } catch (err) {
    console.error("Error updating quantity:", err);
    alert("Unable to update quantity. Please try again.");
  } finally {
    updatingItem.value[item.id] = false;
  }
};

const handleQuantityInput = (item, event) => {
  const value = parseInt(event.target.value);
  if (!isNaN(value) && value > 0 && value <= item.product.stock) {
    updateQuantity(item, value);
  } else {
    event.target.value = item.quantity;
  }
};

const removeItem = async (item) => {
  if (!confirm(`Remove "${item.product.name}" from cart?`)) {
    return;
  }

  try {
    removingItem.value[item.id] = true;

    await cartAPI.removeFromCart(item.id);

    const index = cartItems.value.findIndex((i) => i.id === item.id);
    if (index > -1) {
      cartItems.value.splice(index, 1);
    }

    console.log("✅ Item removed from cart");

    if (cartItems.value.length === 0) {
      selectAll.value = false;
      shopSelected.value = false;
    }
  } catch (err) {
    console.error("Error removing item:", err);
    alert("Unable to remove item. Please try again.");
  } finally {
    removingItem.value[item.id] = false;
  }
};

const handleCheckout = () => {
  const selectedItems = cartItems.value.filter((item) => item.selected);

  if (selectedItems.length === 0) {
    alert("Please select items to checkout");
    return;
  }

  // TODO: Implement checkout
  alert(
    `Checking out ${selectedItems.length} items. Total: ${format(
      finalTotal.value
    )}`
  );
};

const goToShop = () => {
  router.push("/");
};

// Lifecycle
onMounted(() => {
  console.log("🛒 Cart component mounted");
  fetchUser();
  fetchCart();
});
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.cart-container {
  display: flex;
  gap: 20px;
  padding: 20px;

  background: #f5f5f7;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
    Ubuntu, Cantarell, sans-serif;
  min-height: calc(100vh - 100px);
}

/* Loading and Error States */
.loading-state,
.error-state,
.empty-cart {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  background: white;
  border-radius: 12px;
  margin: 40px auto;
  max-width: 500px;
}

.loading-state p,
.error-state p,
.empty-cart p {
  font-size: 18px;
  color: #666;
  margin-bottom: 20px;
}

.retry-btn,
.shop-btn {
  padding: 12px 32px;
  background: #007dff;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.retry-btn:hover,
.shop-btn:hover {
  background: #0066cc;
}

/* LEFT */
.cart-left {
  flex: 1;
  max-width: 900px;
  margin-left: 5%;
}

.cart-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 20px;
}

.select-all {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: white;
  border-radius: 8px;
  margin-bottom: 12px;
  font-size: 14px;
}

.select-all .headers {
  display: flex;
  margin-left: auto;
  gap: 100px;
  color: #999;
  font-size: 13px;
}

.shop-block {
  background: white;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
}

.shop-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.shop-icon {
  font-size: 18px;
}

.shop-name {
  font-weight: 600;
  font-size: 15px;
}

.item-row {
  display: grid;
  grid-template-columns: 40px 90px 2fr 140px 140px 120px 40px;
  align-items: center;
  gap: 16px;
  padding: 16px 0;
  border-bottom: 1px solid #f0f0f0;
}

.item-row:last-child {
  border-bottom: none;
}

.item-img {
  width: 80px;
  height: 100px;
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid #eee;
}

.item-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.item-title {
  font-weight: 500;
  font-size: 14px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.item-sub {
  font-size: 12px;
  color: #808089;
  display: flex;
  align-items: center;
  gap: 4px;
}

.price {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.price .current {
  color: #ff424e;
  font-weight: 600;
  font-size: 16px;
}

.price .old {
  font-size: 13px;
  text-decoration: line-through;
  color: #808089;
}

.price .discount {
  font-size: 12px;
  color: #00ab56;
}

.qty-box {
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 2px;
  width: fit-content;
}

.qty-box button {
  width: 28px;
  height: 28px;
  background: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  color: #333;
  display: flex;
  align-items: center;
  justify-content: center;
}

.qty-box button:hover:not(:disabled) {
  background: #f5f5f5;
}

.qty-box button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.qty-box input {
  width: 40px;
  text-align: center;
  border: none;
  font-size: 14px;
  font-weight: 500;
}

.qty-box input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.qty-box input::-webkit-inner-spin-button,
.qty-box input::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.total {
  font-weight: 600;
  color: #27272a;
  font-size: 16px;
}

.delete-btn {
  border: none;
  background: none;
  cursor: pointer;
  font-size: 18px;
  opacity: 0.6;
  padding: 4px;
}

.delete-btn:hover:not(:disabled) {
  opacity: 1;
}

.delete-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.freeship-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: #f0f8ff;
  border-radius: 6px;
  margin-top: 12px;
  font-size: 13px;
  color: #333;
}

.truck-icon {
  font-size: 16px;
}

.info-icon {
  margin-left: auto;
  color: #999;
  cursor: pointer;
}

/* RIGHT */
.cart-right {
  width: 360px;
  flex-shrink: 0;
}

.delivery-box {
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  margin-bottom: 16px;
}

.delivery-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-size: 14px;
  font-weight: 500;
}

.change-link {
  color: #1a94ff;
  text-decoration: none;
  font-size: 14px;
}

.change-link:hover {
  text-decoration: underline;
}

.delivery-info {
  margin: 10px 0;
  font-size: 14px;
}

.delivery-note {
  background: #fffbea;
  padding: 10px;
  border-radius: 6px;
  font-size: 12px;
  color: #856404;
  margin-top: 12px;
  display: flex;
  align-items: flex-start;
  gap: 6px;
}

.note-icon {
  font-size: 14px;
  flex-shrink: 0;
}

.summary-box {
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.total-line,
.discount-line {
  display: flex;
  justify-content: space-between;
  margin: 12px 0;
  font-size: 14px;
  color: #333;
}

.discount-amount {
  color: #00ab56;
}

.pay-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 16px 0 8px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.pay-total span:first-child {
  font-size: 14px;
  color: #666;
}

.pay {
  color: #ff424e;
  font-weight: 700;
  font-size: 24px;
}

.vat-note {
  font-size: 11px;
  color: #999;
  text-align: right;
  margin-bottom: 12px;
}

.buy-btn {
  margin-top: 16px;
  width: 100%;
  padding: 14px;
  background: #ff424e;
  color: white;
  font-size: 16px;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.buy-btn:hover:not(:disabled) {
  background: #e63946;
}

.buy-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #1a94ff;
}

@media (max-width: 1024px) {
  .cart-container {
    flex-direction: column;
  }

  .cart-right {
    width: 100%;
    max-width: 900px;
  }

  .item-row {
    grid-template-columns: 40px 70px 1fr 100px 100px 80px 40px;
    gap: 10px;
  }

  .select-all .headers {
    gap: 60px;
    font-size: 12px;
  }
}
</style>
