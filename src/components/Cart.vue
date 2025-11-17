<template>
  <div class="cart-container">
    <h2>Shopping Cart</h2>
    <!-- Select All -->
    <div class="select-all-row">
      <input
        type="checkbox"
        id="selectAll"
        v-model="selectAll"
        @change="toggleSelectAll"
      />
      <label for="selectAll"
        >Select All ({{ totalProductCount }} products)</label
      >
      <div class="table-headers">
        <span>Unit Price</span>
        <span>Quantity</span>
        <span>Total</span>
        <span class="icon-delete" title="Delete"></span>
      </div>
    </div>

    <!-- Shop Sections -->
    <div class="shop-section" v-for="(shop, sIndex) in shops" :key="shop.id">
      <div class="shop-header">
        <input
          type="checkbox"
          :id="'shop-' + shop.id"
          v-model="shop.selected"
          @change="toggleShopSelection(sIndex)"
        />
        <label :for="'shop-' + shop.id"
          >🏬 {{ shop.name }} <span>›</span></label
        >
      </div>

      <!-- Shop Promo -->
      <div v-if="shop.promoText" class="shop-promo">
        {{ shop.promoText }}
        <a href="#" class="choose-products">Choose products</a>
      </div>

      <!-- Products -->
      <div
        v-for="(product, pIndex) in shop.products"
        :key="product.id"
        :class="['product-row', { disabled: product.outOfStock }]"
      >
        <input
          type="checkbox"
          :id="'product-' + product.id"
          v-model="product.selected"
          :disabled="product.outOfStock"
          @change="updateSelectAllStatus"
        />
        <label :for="'product-' + product.id" class="product-info">
          <img class="product-image" :src="product.image" alt="product" />
          <div class="product-text">
            <p class="product-name">{{ product.name }}</p>
            <p class="delivery-info"><span>🚚</span> Delivery tomorrow</p>
            <p v-if="product.bookCare" class="bookcare">
              Can be wrapped with Bookcare
            </p>
            <p v-if="product.colorStorage" class="color-storage">
              {{ product.colorStorage }}
            </p>
          </div>
        </label>
        <div class="unit-price">
          <template v-if="!product.outOfStock">
            <span class="price-discounted">{{
              formatPrice(product.discountPrice)
            }}</span>
            <span class="price-original">{{
              formatPrice(product.originalPrice)
            }}</span>
            <span class="discount-percent"
              >Save {{ product.discountPercent }}%</span
            >
          </template>
          <template v-else>
            <span class="out-of-stock">Out of stock</span>
            <span class="no-promo-price"
              >Price not applicable for promotion</span
            >
          </template>
        </div>
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
        <div class="total-price" v-if="!product.outOfStock">
          {{ formatPrice(product.discountPrice * product.quantity) }}
        </div>
        <button
          class="delete-product"
          @click="removeProduct(sIndex, pIndex)"
          title="Delete product"
        >
          🗑️
        </button>
      </div>
    </div>

    <!-- Add shop promo -->
    <div class="add-shop-promo">
      <a href="#">Add shop promo codes</a>
    </div>

    <!-- Shipping promotion info -->
    <div class="shipping-promo-info">
      <span class="icon">🚚</span> Free shipping 10k on orders from 45k, Free
      shipping 25k on orders from 100k
      <span class="info-icon">ⓘ</span>
    </div>

    <!-- Delivery info -->
    <section class="delivery-info">
      <div class="delivery-header">
        <span>Deliver to</span>
        <button class="change-btn" @click.prevent="changeDelivery">
          Change
        </button>
      </div>
      <div class="receiver-info">
        <strong>{{ delivery.name }}</strong> | {{ delivery.phone }}
        <div class="address">
          <span class="home-label">Home</span> {{ delivery.address }}
        </div>
      </div>
      <p class="delivery-note">
        Note: Use previous delivery address before restocking
      </p>
    </section>

    <!-- Promotions -->
    <section class="promotions">
      <header>
        <h3>Tiki Promotions</h3>
        <small>Can select up to 2</small>
      </header>
      <div
        class="promo-item"
        v-for="(promo, i) in promos"
        :key="promo.id"
        :class="{ selected: promo.selected }"
      >
        <div class="promo-icon">{{ promo.icon }}</div>
        <div class="promo-desc">{{ promo.description }}</div>
        <button
          v-if="promo.selected"
          @click="removePromo(i)"
          class="btn-remove"
        >
          Remove
        </button>
        <button v-else @click="selectPromo(i)" class="btn-select">
          Select
        </button>
      </div>
      <a href="#" class="more-promos"
        >Shop more to get free shipping 100k on...</a
      >
    </section>

    <!-- Price Summary -->
    <section class="price-summary">
      <div class="price-row">
        <span>Subtotal</span>
        <span>{{ formatPrice(subtotal) }}</span>
      </div>
      <div class="price-row discount">
        <span>Direct discount</span>
        <span>-{{ formatPrice(discount) }}</span>
      </div>
      <div class="price-row total">
        <strong>Total Payment</strong>
        <strong class="total-payment">{{ formatPrice(totalPayment) }}</strong>
      </div>
      <div class="savings">Save {{ formatPrice(discount) }}</div>
      <div class="vat-note">(Including VAT if applicable)</div>
      <button class="checkout-btn" @click="checkout">
        Purchase ({{ selectedCount }})
      </button>
    </section>
  </div>
</template>

<script>
export default {
  name: "ShoppingCart",
  data() {
    return {
      selectAll: true,
      shops: [
        {
          id: 1,
          name: "Tiki Trading",
          selected: true,
          promoText: "Buy 2 more, get 5% off",
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
          promoText: "",
          products: [
            {
              id: 201,
              name: "Example Laptop Product",
              image: "",
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
      discount: 83000,
    };
  },
  computed: {
    totalProductCount() {
      return this.shops.reduce(
        (total, shop) =>
          total + shop.products.filter((product) => !product.outOfStock).length,
        0
      );
    },
    subtotal() {
      return this.shops.reduce((total, shop) => {
        return (
          total +
          shop.products.reduce((sum, product) => {
            return product.selected && !product.outOfStock
              ? sum + product.discountPrice * product.quantity
              : sum;
          }, 0)
        );
      }, 0);
    },
    totalPayment() {
      return this.subtotal - this.discount;
    },
    selectedCount() {
      let count = 0;
      this.shops.forEach((shop) => {
        count += shop.products.filter(
          (product) => product.selected && !product.outOfStock
        ).length;
      });
      return count;
    },
  },
  methods: {
    formatPrice(value) {
      return Number(value).toLocaleString("vi-VN", {
        style: "currency",
        currency: "VND",
        minimumFractionDigits: 0,
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
      this.selectAll = this.shops.every(
        (shop) =>
          shop.selected &&
          shop.products.every(
            (product) => product.selected || product.outOfStock
          )
      );
    },
    decreaseQuantity(shopIndex, productIndex) {
      const product = this.shops[shopIndex].products[productIndex];
      if (product.quantity > 1) product.quantity--;
    },
    increaseQuantity(shopIndex, productIndex) {
      const product = this.shops[shopIndex].products[productIndex];
      product.quantity++;
    },
    removeProduct(shopIndex, productIndex) {
      this.shops[shopIndex].products.splice(productIndex, 1);
      if (!this.shops[shopIndex].products.length) {
        this.shops.splice(shopIndex, 1);
      }
      this.updateSelectAllStatus();
    },
    removePromo(index) {
      this.promos[index].selected = false;
    },
    selectPromo(index) {
      const selectedCount = this.promos.filter((p) => p.selected).length;
      if (selectedCount >= 2) return;
      this.promos[index].selected = true;
    },
    changeDelivery() {
      alert("Change delivery info clicked");
    },
    checkout() {
      alert("Checkout clicked with " + this.selectedCount + " products");
    },
  },
  mounted() {
    this.updateSelectAllStatus();
  },
};
</script>

<style scoped>
.cart-container {
  max-width: 960px;
  margin: 24px auto;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  color: #222;
}

h2 {
  font-weight: 700;
  margin-bottom: 12px;
}

.select-all-row {
  display: flex;
  align-items: center;
  font-weight: 600;
  margin-bottom: 12px;
}

.select-all-row input[type="checkbox"] {
  margin-right: 8px;
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.select-all-row label {
  cursor: pointer;
}

.table-headers {
  flex-grow: 1;
  display: flex;
  justify-content: flex-end;
  gap: 140px;
  font-size: 13px;
  color: #787878;
  font-weight: 600;
  margin-left: 20px;
}

.icon-delete {
  width: 18px;
  height: 18px;
}

.shop-section {
  border: 1px solid #e6e6e6;
  margin-bottom: 14px;
  border-radius: 8px;
  padding: 8px 12px;
  background: #fff;
}

.shop-header {
  display: flex;
  align-items: center;
  font-size: 15px;
  color: #222;
  font-weight: 600;
  margin-bottom: 6px;
  user-select: none;
}

.shop-header input[type="checkbox"] {
  margin-right: 10px;
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.shop-header span {
  margin-left: 6px;
  font-weight: 400;
  color: #999;
  cursor: pointer;
}

.shop-promo {
  background-color: #ffebd9;
  padding: 8px 12px;
  font-weight: 600;
  font-size: 13px;
  color: #4e4e4e;
  border-radius: 6px 6px 0 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.choose-products {
  font-weight: 600;
  color: #0066c0;
  text-decoration: none;
}

.choose-products:hover {
  text-decoration: underline;
}

.product-row {
  display: grid;
  grid-template-columns: 3fr 1fr 1fr 1fr 0.4fr;
  align-items: center;
  gap: 8px;
  border-top: 1px solid #e6e6e6;
  padding: 12px 0;
}

.product-row.disabled {
  opacity: 0.35;
  pointer-events: none;
}

.product-row input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.product-info {
  display: flex;
  gap: 12px;
  cursor: pointer;
  align-items: center;
  user-select: none;
}

.product-image {
  width: 60px;
  height: 80px;
  object-fit: contain;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: #fff;
}

.product-text {
  display: flex;
  flex-direction: column;
  font-size: 12px;
  color: #222;
}

.product-name {
  font-weight: 600;
  margin-bottom: 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.delivery-info {
  color: #555;
  display: flex;
  gap: 6px;
  align-items: center;
}

.bookcare,
.color-storage {
  font-size: 11px;
  color: #888;
  font-style: italic;
  margin-top: 2px;
}

.unit-price {
  font-size: 13px;
  text-align: right;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.price-discounted {
  font-weight: 700;
  color: #ef4444;
  font-size: 14px;
}

.price-original {
  text-decoration: line-through;
  color: #999;
  font-size: 12px;
}

.discount-percent {
  color: #16a34a;
  font-weight: 600;
  font-size: 12px;
}

.out-of-stock {
  color: #fb923c;
  font-weight: 600;
  font-size: 13px;
}

.no-promo-price {
  font-size: 12px;
  color: #bbb;
}

.quantity-control {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
}

.quantity-control button {
  width: 28px;
  height: 28px;
  font-weight: 700;
  font-size: 18px;
  cursor: pointer;
  border: 1px solid #ccc;
  border-radius: 6px;
  background: white;
  user-select: none;
}

.quantity-control button:disabled {
  color: #ccc;
  border-color: #eee;
  cursor: default;
}

.quantity-control input {
  width: 48px;
  height: 28px;
  border: 1px solid #ccc;
  border-radius: 6px;
  text-align: center;
  font-weight: 600;
  font-size: 14px;
}

.total-price {
  font-weight: 700;
  color: #ef4444;
  font-size: 14px;
  text-align: right;
}

.delete-product {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #a00;
  user-select: none;
}

.delete-product:hover {
  color: #ef4444;
}

.add-shop-promo {
  margin: 10px 0;
}

.add-shop-promo a {
  color: #0066c0;
  font-weight: 600;
  text-decoration: none;
}

.add-shop-promo a:hover {
  text-decoration: underline;
}

.shipping-promo-info {
  display: flex;
  align-items: center;
  font-size: 13px;
  color: #555;
  gap: 6px;
  margin-bottom: 14px;
}

.shipping-promo-info .icon {
  font-size: 18px;
}

.shipping-promo-info .info-icon {
  font-size: 14px;
  background: #ccc;
  color: #444;
  width: 18px;
  height: 18px;
  line-height: 18px;
  text-align: center;
  border-radius: 50%;
  cursor: pointer;
}

.delivery-info {
  border: 1px solid #f0db95;
  background: #fff3cd;
  padding: 14px;
  border-radius: 8px;
  font-size: 13px;
  color: #222;
  margin-bottom: 14px;
}

.delivery-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  margin-bottom: 6px;
}

.change-btn {
  background: none;
  border: none;
  color: #0066c0;
  cursor: pointer;
  font-weight: 600;
}

.receiver-info strong {
  font-weight: 700;
}

.address {
  margin-top: 3px;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #444;
}

.home-label {
  background-color: #9be6a8;
  color: #216e25;
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: 700;
  font-size: 12px;
}

.delivery-note {
  background-color: #ffeeba;
  padding: 6px 12px;
  margin-top: 10px;
  border-radius: 4px;
  color: #856404;
  font-weight: 600;
  font-size: 12px;
}

.promotions {
  margin-bottom: 12px;
}

.promotions header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 700;
}

.promotions small {
  font-weight: 400;
  font-size: 12px;
  color: #666;
}

.promo-item {
  display: flex;
  align-items: center;
  border: 1px solid #ccc;
  border-radius: 12px;
  padding: 8px 12px;
  margin-top: 8px;
  gap: 12px;
}

.promo-item.selected {
  border-color: #0066c0;
  background: #bbd7ff;
}

.promo-icon {
  font-size: 28px;
}

.promo-desc {
  flex-grow: 1;
  font-weight: 600;
}

.btn-remove,
.btn-select {
  background: #0066c0;
  border: none;
  padding: 6px 14px;
  color: white;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
}

.btn-remove {
  background: #ef4444;
}

.btn-remove:hover {
  background: #ca2727;
}

.btn-select:hover {
  background: #004a99;
}

.more-promos {
  display: block;
  margin-top: 6px;
  color: #0066c0;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
}

.more-promos:hover {
  text-decoration: underline;
}

.price-summary {
  margin-top: 20px;
  border-top: 1px solid #ddd;
  padding-top: 20px;
  font-size: 15px;
  font-weight: 600;
}

.price-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.price-row.discount {
  color: #099a3e;
}

.price-row.total {
  font-size: 24px;
  font-weight: 900;
  color: #ef4444;
}

.savings {
  font-size: 14px;
  font-weight: 600;
  color: #099a3e;
  margin-top: 6px;
}

.vat-note {
  font-size: 12px;
  color: #666;
  margin-top: 2px;
}

.checkout-btn {
  margin-top: 10px;
  background-color: #ef4444;
  color: white;
  width: 100%;
  border: none;
  font-weight: 700;
  font-size: 18px;
  padding: 12px 0;
  border-radius: 10px;
  cursor: pointer;
  user-select: none;
  transition: background-color 0.3s ease;
}

.checkout-btn:hover {
  background-color: #c93b3b;
}
</style>
