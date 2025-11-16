<template>
  <div class="cart-container">
    <!-- Cart Header -->
    <h2>SHOPPING CART</h2>

    <!-- Select All -->
    <div class="select-all-row">
      <input
        type="checkbox"
        id="selectAll"
        v-model="selectAll"
        @change="toggleSelectAll"
      />
      <label for="selectAll">Select All ({{ totalProducts }} products)</label>
      <div class="table-headers">
        <span class="price-header">Unit Price</span>
        <span class="qty-header">Quantity</span>
        <span class="total-header">Total Price</span>
        <span class="delete-header"></span>
      </div>
    </div>

    <!-- Shop Sections -->
    <div v-for="(shop, sIndex) in shops" :key="shop.id" class="shop-section">
      <div class="shop-header">
        <input
          type="checkbox"
          :id="'shop-' + shop.id"
          v-model="shop.selected"
          @change="toggleShopSelection(sIndex)"
        />
        <label :for="'shop-' + shop.id">
          <span class="shop-icon">🏬</span> {{ shop.name }}
          <span v-if="shop.subtext" class="shop-subtext"> &gt; </span>
        </label>
      </div>

      <!-- Promotion Info -->
      <div v-if="shop.promo" class="shop-promo">
        {{ shop.promo.text }}
        <a href="#" class="choose-products">Choose products</a>
      </div>

      <!-- Products -->
      <div
        v-for="(product, pIndex) in shop.products"
        :key="product.id"
        :class="['product-row', { disabled: product.outOfStock }]"
      >
        <div class="product-select">
          <input
            type="checkbox"
            :id="'product-' + product.id"
            v-model="product.selected"
            :disabled="product.outOfStock"
            @change="updateSelectAllStatus"
          />
          <label :for="'product-' + product.id" class="product-info">
            <img :src="product.image" alt="" class="product-image" />
            <div class="product-text">
              <p class="product-name">{{ product.name }}</p>
              <p class="delivery">
                <span class="icon">🚚</span> Delivery tomorrow
              </p>
              <p class="bookcare" v-if="product.bookCare">
                Can be wrapped with Bookcare
              </p>
              <p class="color-storage" v-if="product.colorStorage">
                {{ product.colorStorage }}
              </p>
            </div>
          </label>
        </div>

        <!-- Price -->
        <div class="price-info">
          <template v-if="!product.outOfStock">
            <span class="discount-price">{{
              formatPrice(product.discountPrice)
            }}</span>
            <span class="original-price">{{
              formatPrice(product.originalPrice)
            }}</span>
            <span class="discount-percent"
              >Save {{ product.discountPercent }}%</span
            >
          </template>
          <template v-else>
            <span class="out-of-stock">Out of Stock</span>
            <span class="price-note">Price not applicable for promotion</span>
          </template>
        </div>

        <!-- Quantity -->
        <div class="quantity-control" v-if="!product.outOfStock">
          <button
            @click="decreaseQuantity(sIndex, pIndex)"
            :disabled="product.quantity <= 1"
          >
            -
          </button>
          <input type="number" v-model.number="product.quantity" min="1" />
          <button @click="increaseQuantity(sIndex, pIndex)">+</button>
        </div>

        <!-- Total Price -->
        <div class="item-total-price" v-if="!product.outOfStock">
          {{ formatPrice(product.discountPrice * product.quantity) }}
        </div>

        <!-- Delete -->
        <div class="delete-button" @click="removeProduct(sIndex, pIndex)">
          🗑️
        </div>
      </div>
    </div>

    <!-- Add Shop Promo Codes -->
    <div class="shop-promo-link">
      <a href="#">Add Shop Promo Codes</a>
    </div>

    <!-- Free Shipping Info -->
    <div class="free-shipping-info">
      🚚 Free shipping 10k for orders from 45k, Free shipping 25k for orders
      from 100k
      <span class="info-icon">i</span>
    </div>

    <!-- Delivery Address -->
    <div class="delivery-info-box">
      <div class="delivery-header">
        <span>Deliver to</span>
        <a href="#" class="change-link">Change</a>
      </div>
      <div class="receiver-info">
        <strong>{{ delivery.name }}</strong> | {{ delivery.phone }}
        <div class="address-line">
          <span class="home-label">Home</span> {{ delivery.address }}
        </div>
      </div>
      <div class="delivery-note">
        Note: Use previous delivery address before restocking
      </div>
    </div>

    <!-- Tiki Promotions -->
    <div class="tiki-promo-box">
      <div class="tiki-promo-header">
        <span>Tiki Promotions</span>
        <span class="can-select">Can select up to 2</span>
      </div>
      <div
        v-for="(promo, index) in promos"
        :key="promo.id"
        :class="['promo-item', { selected: promo.selected }]"
      >
        <div class="promo-icon">{{ promo.icon }}</div>
        <div class="promo-desc">{{ promo.description }}</div>
        <button
          v-if="promo.selected"
          @click="removePromo(index)"
          class="remove-promo-btn"
        >
          Remove
        </button>
        <button v-else @click="selectPromo(index)" class="select-promo-btn">
          Select
        </button>
      </div>
      <a href="#" class="more-promos-link">
        Shop more to get free shipping 100k on...
      </a>
    </div>

    <!-- Price Summary -->
    <div class="price-summary">
      <div class="summary-row">
        <span>Subtotal</span>
        <span>{{ formatPrice(subtotal) }}</span>
      </div>
      <div class="summary-row discount-row">
        <span>Direct Discount</span>
        <span class="discount-amount">-{{ formatPrice(discount) }}</span>
      </div>
      <div class="summary-row total-row">
        <strong>Total Payment</strong>
        <strong class="total-payment">{{
          formatPrice(subtotal - discount)
        }}</strong>
      </div>
      <div class="savings-note">You save {{ formatPrice(discount) }}</div>
      <div class="vat-note">(Including VAT if applicable)</div>
      <button class="checkout-btn">Checkout ({{ totalSelected }})</button>
    </div>
  </div>
</template>

<script>
export default {
  name: "ShoppingCart",
  data() {
    return {
      selectAll: false,
      shops: [
        {
          id: 1,
          name: "Tiki Trading",
          selected: true,
          promo: {
            text: "Buy 2 get 5% off",
          },
          products: [
            {
              id: 101,
              name: "The Sunwarming Book: Volume 2 of Sweet Orange Tree",
              image:
                "https://salt.tikicdn.com/cache/w100/ts/product/78/72/f9/fabd9b2e61db2181673bc4db75bdcd3b.jpg",
              selected: true,
              originalPrice: 160000,
              discountPrice: 108800,
              discountPercent: 9,
              quantity: 1,
              outOfStock: false,
              bookCare: true,
              colorStorage: "",
            },
            {
              id: 102,
              name: "Never Stay Away From Me (Reprint)",
              image:
                "https://salt.tikicdn.com/cache/w100/ts/product/6d/07/e9/e978bfe9da1f68adbdb39f11747533e8.jpg",
              selected: true,
              originalPrice: 159000,
              discountPrice: 127200,
              discountPercent: 1,
              quantity: 1,
              outOfStock: false,
              bookCare: true,
              colorStorage: "",
            },
            {
              id: 103,
              name: "Apple iPhone 14 128GB Green",
              image:
                "https://salt.tikicdn.com/cache/w100/ts/product/1f/8f/cb/aa799ba0ea3f676f8bb30d04e34d0606.PNG",
              selected: false,
              originalPrice: 17990000,
              discountPrice: 17990000,
              discountPercent: 0,
              quantity: 1,
              outOfStock: true,
              bookCare: false,
              colorStorage: "Green, 128GB",
            },
          ],
        },
        {
          id: 2,
          name: "Laptop Minh Ha",
          selected: false,
          promo: null,
          products: [
            {
              id: 201,
              name: "Laptop model example product",
              image: "https://salt.tikicdn.com/cache/w100/ts/product/xxx.jpg",
              selected: false,
              originalPrice: 6500000,
              discountPrice: 6500000,
              discountPercent: 0,
              quantity: 1,
              outOfStock: false,
              bookCare: false,
              colorStorage: "",
            },
          ],
        },
      ],
      promos: [
        {
          id: 1,
          description: "Discount 25K",
          icon: "🚛",
          selected: true,
        },
      ],
      delivery: {
        name: "Dang Chi",
        phone: "0848257045",
        address:
          "54/19 Street 10, Cat Lai Ward, Thu Duc City, Ho Chi Minh City",
      },
    };
  },
  computed: {
    totalProducts() {
      return this.shops.reduce((acc, shop) => acc + shop.products.length, 0);
    },
    subtotal() {
      return this.shops.reduce((acc, shop) => {
        return (
          acc +
          shop.products.reduce((sum, p) => {
            return p.selected && !p.outOfStock
              ? sum + p.discountPrice * p.quantity
              : sum;
          }, 0)
        );
      }, 0);
    },
    discount() {
      // hardcoded discount for now - adjust as needed
      return 83000;
    },
    totalSelected() {
      return this.shops.reduce((acc, shop) => {
        return (
          acc + shop.products.filter((p) => p.selected && !p.outOfStock).length
        );
      }, 0);
    },
  },
  watch: {
    shops: {
      handler() {
        this.updateSelectAllStatus();
      },
      deep: true,
      immediate: true,
    },
  },
  methods: {
    formatPrice(val) {
      return val.toLocaleString("en-US", {
        style: "currency",
        currency: "VND",
      });
    },
    toggleSelectAll() {
      this.shops.forEach((shop) => {
        shop.selected = this.selectAll;
        shop.products.forEach((product) => {
          if (!product.outOfStock) product.selected = this.selectAll;
        });
      });
    },
    toggleShopSelection(shopIndex) {
      const shop = this.shops[shopIndex];
      shop.products.forEach((product) => {
        if (!product.outOfStock) product.selected = shop.selected;
      });
      this.updateSelectAllStatus();
    },
    updateSelectAllStatus() {
      const allSelected = this.shops.every((shop) => {
        return (
          shop.selected &&
          shop.products.every(
            (product) => product.selected || product.outOfStock
          )
        );
      });
      this.selectAll = allSelected;
    },
    decreaseQuantity(shopIndex, pIndex) {
      const product = this.shops[shopIndex].products[pIndex];
      if (product.quantity > 1) {
        product.quantity--;
      }
    },
    increaseQuantity(shopIndex, pIndex) {
      const product = this.shops[shopIndex].products[pIndex];
      product.quantity++;
    },
    removeProduct(shopIndex, pIndex) {
      this.shops[shopIndex].products.splice(pIndex, 1);
      if (this.shops[shopIndex].products.length === 0) {
        this.shops.splice(shopIndex, 1);
      }
      this.updateSelectAllStatus();
    },
    selectPromo(index) {
      if (this.promoSelectedCount < 2) {
        this.promos[index].selected = true;
      }
    },
    removePromo(index) {
      this.promos[index].selected = false;
    },
  },
  computed: {
    promoSelectedCount() {
      return this.promos.filter((p) => p.selected).length;
    },
  },
};
</script>

<style scoped>
.cart-container {
  max-width: 900px;
  margin: 0 auto;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
    Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
  color: #333;
  background-color: white;
  padding: 1rem;
}

h2 {
  margin-bottom: 1rem;
  font-weight: 600;
  font-size: 1.5rem;
}

.select-all-row {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
  position: relative;
}

.select-all-row input[type="checkbox"] {
  margin-right: 0.5rem;
  width: 18px;
  height: 18px;
}

.select-all-row label {
  font-weight: 600;
  font-size: 1rem;
}

.table-headers {
  display: flex;
  margin-left: auto;
  gap: 4rem;
  font-size: 0.9rem;
  font-weight: 600;
  color: #757575;
  width: 420px;
  justify-content: flex-end;
}

.price-header,
.qty-header,
.total-header,
.delete-header {
  width: 70px;
  text-align: right;
}

.shop-section {
  background: #fdf7ef;
  margin-bottom: 1rem;
  padding: 0.5rem;
  border-radius: 6px;
}

.shop-header {
  display: flex;
  align-items: center;
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.3rem;
}

.shop-header input[type="checkbox"] {
  margin-right: 0.5rem;
  width: 18px;
  height: 18px;
}

.shop-icon {
  margin-right: 0.3rem;
}

.shop-promo {
  background-color: #ffdcb1;
  padding: 0.3rem 0.6rem;
  margin-bottom: 0.6rem;
  font-size: 0.9rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.choose-products {
  color: #007aff;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.9rem;
}

.product-row {
  background: white;
  display: grid;
  grid-template-columns: 3.5fr 1fr 1fr 1fr 0.5fr;
  gap: 0.5rem;
  align-items: center;
  padding: 0.5rem;
  border-bottom: 1px solid #eee;
  font-size: 0.9rem;
}

.product-row.disabled {
  opacity: 0.4;
  pointer-events: none;
}

.product-select {
  display: flex;
  align-items: center;
}

.product-select input[type="checkbox"] {
  width: 16px;
  height: 16px;
  margin-right: 0.5rem;
}

.product-info {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.product-image {
  width: 60px;
  height: 60px;
  object-fit: contain;
  margin-right: 0.7rem;
}

.product-text {
  display: flex;
  flex-direction: column;
}

.product-name {
  font-weight: 600;
  margin: 0;
  margin-bottom: 3px;
}

.delivery {
  color: #555;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.bookcare {
  font-size: 0.8rem;
  color: #888;
}

.color-storage {
  font-size: 0.8rem;
  color: #888;
  margin-top: 4px;
}

.price-info {
  text-align: right;
  font-size: 0.9rem;
  color: #555;
}

.discount-price {
  color: #ff3b3b;
  font-weight: 600;
  margin-right: 0.3rem;
}

.original-price {
  text-decoration: line-through;
  color: #a0a0a0;
}

.discount-percent {
  color: green;
  font-weight: 600;
  font-size: 0.8rem;
  display: block;
}

.out-of-stock {
  color: #f47777;
  font-weight: 600;
  font-size: 0.9rem;
}

.price-note {
  font-size: 0.8rem;
  color: #bbb;
}

.quantity-control {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.3rem;
}

.quantity-control button {
  background-color: white;
  border: 1px solid #ccc;
  width: 24px;
  height: 24px;
  font-size: 18px;
  text-align: center;
  cursor: pointer;
  user-select: none;
}

.quantity-control button:disabled {
  color: #ccc;
  cursor: default;
}

.quantity-control input {
  width: 40px;
  text-align: center;
  border: 1px solid #ccc;
  height: 28px;
  font-size: 0.9rem;
  border-radius: 3px;
}

.item-total-price {
  color: #ff3b3b;
  font-weight: 600;
  text-align: right;
}

.delete-button {
  text-align: center;
  font-size: 1.2rem;
  cursor: pointer;
  color: #a00;
  user-select: none;
}

.delete-button:hover {
  color: #ff3b3b;
}

.shop-promo-link,
.free-shipping-info {
  margin: 1rem 0;
  font-size: 0.9rem;
  color: #555;
  cursor: pointer;
}

.free-shipping-info {
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.info-icon {
  font-size: 0.95rem;
  border: 1px solid #ccc;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  text-align: center;
  line-height: 14px;
  color: #555;
  user-select: none;
}

.delivery-info-box {
  background-color: #fff8dc;
  border-radius: 6px;
  padding: 0.8rem;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.delivery-header {
  display: flex;
  justify-content: space-between;
  font-weight: 600;
  margin-bottom: 0.3rem;
}

.change-link {
  text-decoration: none;
  color: #007aff;
  font-weight: 600;
}

.receiver-info {
  margin-bottom: 0.3rem;
}

.address-line {
  font-size: 0.85rem;
  margin-top: 2px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.home-label {
  background-color: #b8e994;
  border-radius: 8px;
  padding: 2px 6px;
  font-size: 0.75rem;
  color: #2a7f62;
  font-weight: 700;
}

.delivery-note {
  background-color: #ffeaaa;
  color: #8a6d00;
  padding: 0.4rem;
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: 600;
}

.tiki-promo-box {
  margin-bottom: 1rem;
  border: 1px solid #ddd;
  padding: 0.8rem;
  border-radius: 6px;
}

.tiki-promo-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-weight: 600;
  font-size: 1rem;
}

.can-select {
  font-weight: 400;
  color: #666;
  font-size: 0.85rem;
}

.promo-item {
  display: flex;
  align-items: center;
  border: 1px solid #bbb;
  border-radius: 8px;
  padding: 0.4rem 0.8rem;
  margin-bottom: 0.5rem;
  justify-content: space-between;
  gap: 0.5rem;
}

.promo-item.selected {
  border-color: #007aff;
  background-color: #e8f0ff;
}

.promo-icon {
  font-size: 1.5rem;
}

.promo-desc {
  flex-grow: 1;
  font-weight: 600;
}

.remove-promo-btn,
.select-promo-btn {
  background-color: #007aff;
  border: none;
  color: white;
  font-size: 0.85rem;
  padding: 4px 10px;
  border-radius: 4px;
  cursor: pointer;
}

.remove-promo-btn {
  background-color: #ff4d4d;
}

.more-promos-link {
  color: #007aff;
  font-weight: 600;
  font-size: 0.9rem;
  text-decoration: none;
  display: block;
  margin-top: 0.3rem;
}

.price-summary {
  border-top: 1px solid #ddd;
  padding: 1rem 0;
  font-size: 1rem;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.3rem;
}

.discount-row {
  color: green;
}

.discount-amount {
  color: green;
}

.total-row {
  font-weight: 700;
  font-size: 1.2rem;
  margin-top: 0.5rem;
}

.savings-note {
  color: green;
  font-weight: 600;
  margin-top: 0.3rem;
}

.vat-note {
  color: #666;
  font-size: 0.8rem;
  margin-top: 0.1rem;
}

.checkout-btn {
  margin-top: 0.8rem;
  width: 100%;
  padding: 0.8rem 0;
  background-color: #ff3b3b;
  color: white;
  font-weight: 700;
  font-size: 1.1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.checkout-btn:hover {
  background-color: #d83232;
}
</style>
