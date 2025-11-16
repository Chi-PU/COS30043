<template>
  <div class="product-detail">
    <!-- Left: Product Images -->
    <div class="left-column">
      <div class="main-image">
        <img :src="selectedImage" :alt="book.title" />
      </div>
      <div class="thumbnail-list">
        <button
          v-for="(img, index) in book.images"
          :key="index"
          :class="{ active: selectedImage === img }"
          @click="selectedImage = img"
          class="thumbnail-btn"
          :aria-label="'Select image ' + (index + 1)"
        >
          <img :src="img" :alt="'Thumbnail ' + (index + 1)" />
        </button>
      </div>
      <button class="summary-btn" @click="toggleSummary">
        <span>Xem thêm Tóm tắt nội dung sách</span>
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
      <div v-if="showSummary" class="book-summary">
        <!-- Placeholder for summary content -->
        <p>Nội dung sách được tóm tắt ở đây...</p>
      </div>
    </div>

    <!-- Middle: Product Details -->
    <div class="middle-column">
      <div class="badges">
        <span class="badge-11-11">11·11</span>
        <span class="badge-top-deal">TOP DEAL</span>
        <span class="badge-return">30 NGÀY ĐỔI TRẢ</span>
        <span class="badge-authentic">CHÍNH HÃNG</span>
      </div>

      <h1 class="book-title">
        Sách Hồi Ức, Giấc Mơ, Suy Ngẫm - Hành Trình Vào Nội Tâm Của Carl Jung –
        Nơi Ký Ức, Giấc Mơ Và Triết Lý Giao Thoa
      </h1>

      <p class="author">
        Tác giả:
        <a href="#" class="author-link">Carl Gustav Jung</a>
      </p>

      <div class="rating-sales">
        <div class="rating">
          <span class="rating-score">5.0</span>
          <span class="stars">
            <svg v-for="i in 5" :key="i" class="star-icon" viewBox="0 0 20 20">
              <path
                d="M10 1.5l2.9 6.3 6.9 1-5 4.9 1.2 6.9-6-3.1-6 3.1 1.2-6.9-5-4.9 6.9-1L10 1.5z"
                fill="#fbc02d"
              />
            </svg>
          </span>
          <span class="rating-count">(29)</span>
        </div>
        <div class="sold-count">| Đã bán 846</div>
      </div>

      <div class="price-section">
        <div class="current-price">244.150<span class="currency">₫</span></div>
        <div class="discount-info">
          <span class="discount-percent">-29%</span>
          <del class="original-price">345.000₫</del>
          <button class="info-btn" aria-label="More info on price">i</button>
        </div>
        <p class="price-note">Giá sau áp dụng mã khuyến mãi</p>
        <ul class="promotions">
          <li>
            <span class="icon">🔖</span> Giảm 12.850₫ từ mã khuyến mãi của nhà
            bán
          </li>
          <li>
            <span class="icon">🔖</span> Giảm 8.000₫ từ mã khuyến mãi của Tiki
          </li>
        </ul>
      </div>

      <div class="shipping-info">
        <h2>Thông tin vận chuyển</h2>
        <p>
          Giao đến Q. 1, P. Bến Nghé, Hồ Chí Minh
          <button class="change-btn">Đổi</button>
        </p>

        <ul>
          <li>
            <b class="now-text">NOW</b> Giao siêu tốc 2h<br />
            <span class="free-text"
              >Trước 18h hôm nay: Miễn phí <del>35.000₫</del></span
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
            Giao đúng sáng Thứ Sáu<br />
            <span class="free-text"
              >8h - 12h, 14/11: Miễn phí <del>16.500₫</del></span
            >
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
            Freeship 10k đơn từ 45k, Freeship 25k đơn từ 100k
          </li>
        </ul>
      </div>

      <div class="other-discounts">
        <h3>Ưu đãi khác</h3>
        <div class="discount-codes">
          <button class="discount-btn">Giảm 5%</button>
          <button class="discount-btn">Giảm 8K</button>
          <button class="more-btn">›</button>
        </div>
      </div>
    </div>

    <!-- Right: Purchase Section -->
    <div class="right-column">
      <div class="seller-info">
        <div class="seller-name">
          <img
            src="https://frontend.tikicdn.com/_desktop-next/static/img/favicon.ico"
            alt="Tiki logo"
            class="tiki-logo"
          />
          Tiki Trading
          <span class="official-badge">OFFICIAL</span>
        </div>
        <div class="rating-summary">
          <span class="score">4.7</span>
          <span class="star">&#9733;</span>
          <span class="reviews">(5.5tr+ đánh giá)</span>
        </div>
      </div>

      <div class="quantity-selector">
        <label for="quantity">Số Lượng</label>
        <div class="qty-controls">
          <button @click="decrementQty" aria-label="Decrease quantity">
            -
          </button>
          <input
            id="quantity"
            type="number"
            v-model.number="quantity"
            min="1"
          />
          <button @click="incrementQty" aria-label="Increase quantity">
            +
          </button>
        </div>
      </div>

      <div class="subtotal">
        <label>Tạm tính</label>
        <div class="subtotal-price">{{ formattedSubtotal }}₫</div>
      </div>

      <button class="buy-now-btn">Mua ngay</button>
      <button class="add-to-cart-btn">Thêm vào giỏ</button>
      <button class="buy-later-btn">Mua trước trả sau</button>

      <div class="compare-sellers">
        <a href="#">So sánh 6 nhà bán khác (Giá từ 282.900₫)</a>
      </div>

      <div class="promo-banner">
        <div class="promo-text">Điện Thoại Hiệu DƯỚI 5 TRIỆU</div>
        <div class="promo-subtext">Giao nhanh 2h</div>
        <div class="promo-images">
          <img
            src="https://cdn.tgdd.vn/Products/Images/42/262986/oppo-a57-blue-200x200.jpg"
            alt="OPPO A57"
          />
          <img
            src="https://cdn.tgdd.vn/Products/Images/42/247639/samsung-galaxy-a13-200x200.jpg"
            alt="Samsung A13"
          />
          <img
            src="https://cdn.tgdd.vn/Products/Images/42/297450/xiaomi-redmi-note-11-200x200.jpg"
            alt="Xiaomi Redmi Note 11"
          />
          <img
            src="https://cdn.tgdd.vn/Products/Images/42/261124/samsung-galaxy-a33-200x200.jpg"
            alt="Samsung A33"
          />
          <img
            src="https://cdn.tgdd.vn/Products/Images/42/256097/xiaomi-redmi-note-10s-200x200.jpg"
            alt="Xiaomi Redmi Note 10S"
          />
        </div>
      </div>

      <div class="chat-buttons">
        <button class="help-btn">Trợ lý</button>
        <button class="news-btn">Tin mới</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "BookDetail",
  data() {
    return {
      selectedImage:
        "https://cdn1.tikicdn.com/ts/product/a7/c4/fd/1a77d7908bfca2d720323d755f038060.jpg",
      quantity: 1,
      book: {
        title: "Sách Hồi Ức, Giấc Mơ, Suy Ngẫm",
        images: [
          "https://cdn1.tikicdn.com/ts/product/a7/c4/fd/1a77d7908bfca2d720323d755f038060.jpg",
          "https://cdn1.tikicdn.com/ts/product/a7/c4/fd/1a77d7908bfca2d720323d755f038060.jpg",
          "https://cdn1.tikicdn.com/ts/product/a7/c4/fd/1a77d7908bfca2d720323d755f038060.jpg",
        ],
        unitPrice: 244150,
      },
      showSummary: false,
    };
  },
  computed: {
    subtotal() {
      return this.book.unitPrice * this.quantity;
    },
    formattedSubtotal() {
      return this.subtotal.toLocaleString("vi-VN");
    },
  },
  methods: {
    incrementQty() {
      this.quantity++;
    },
    decrementQty() {
      if (this.quantity > 1) this.quantity--;
    },
    toggleSummary() {
      this.showSummary = !this.showSummary;
    },
  },
};
</script>

<style scoped>
.product-detail {
  display: flex;
  gap: 20px;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  color: #222;
  padding: 20px;
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
}

.main-image img {
  width: 100%;
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

.thumbnail-btn img {
  max-width: 100%;
  max-height: 100%;
  user-select: none;
}

.thumbnail-btn.active {
  border-color: #006bc6;
  box-shadow: 0 0 6px #0d75d0;
}

.summary-btn {
  margin-top: 12px;
  align-self: stretch;
  border: none;
  background: #f4f6f8;
  color: #222;
  font-weight: 600;
  padding: 10px 12px;
  font-size: 14px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.summary-btn svg {
  margin-left: 8px;
  fill: #222;
}

.book-summary {
  background: #f4f6f8;
  padding: 12px;
  font-size: 14px;
  line-height: 1.5;
  margin-top: 10px;
  border-radius: 6px;
}

/* Middle column */
.middle-column {
  flex: 2;
  max-width: 580px;
}

.badges {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}

.badge-11-11,
.badge-top-deal,
.badge-return,
.badge-authentic {
  text-transform: uppercase;
  font-weight: 700;
  font-size: 12px;
  color: #222;
  padding: 4px 8px;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
}

.badge-11-11 {
  background-color: #e92425;
  color: #fff;
}

.badge-top-deal {
  background-color: #ff5c5c;
  color: #fff;
}

.badge-return {
  background-color: #007aff;
  color: white;
}

.badge-authentic {
  background-color: #007aff;
  color: white;
}

.book-title {
  font-size: 20px;
  font-weight: 700;
  line-height: 1.3;
  margin-bottom: 6px;
  letter-spacing: 0.02em;
}

.author {
  font-size: 14px;
  margin-bottom: 10px;
}

.author-link {
  color: #007aff;
  text-decoration: none;
  font-weight: 600;
}

.author-link:hover {
  text-decoration: underline;
}

.rating-sales {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #555;
  gap: 6px;
  margin-bottom: 10px;
}

.rating {
  display: flex;
  align-items: center;
  gap: 4px;
}

.rating-score {
  font-weight: 700;
  color: #000;
}

.stars {
  display: flex;
  gap: 2px;
}

.star-icon {
  width: 14px;
  height: 14px;
}

.rating-count {
  color: #999;
}

.sold-count {
  color: #999;
}

.price-section {
  margin-bottom: 20px;
}

.current-price {
  font-size: 28px;
  font-weight: 700;
  color: #ff424e;
  margin-bottom: 4px;
}

.currency {
  font-size: 20px;
  font-weight: 700;
  vertical-align: top;
}

.discount-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.discount-percent {
  color: #ff424e;
  font-weight: 700;
}

.original-price {
  color: #999;
  font-size: 14px;
}

.info-btn {
  border: none;
  background: transparent;
  font-weight: 700;
  color: #999;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  cursor: pointer;
  line-height: 18px;
  text-align: center;
}

.price-note {
  font-size: 13px;
  color: #555;
  margin-bottom: 10px;
}

.promotions {
  list-style: none;
  padding-left: 0;
  font-size: 14px;
  color: #007aff;
}

.promotions li {
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.promotions .icon {
  font-size: 18px;
  user-select: none;
}

.shipping-info h2 {
  font-size: 18px;
  margin-bottom: 8px;
  font-weight: 700;
}

.shipping-info p {
  font-size: 14px;
  margin-bottom: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.change-btn {
  border: none;
  background: transparent;
  color: #007aff;
  font-weight: 700;
  cursor: pointer;
}

.shipping-info ul {
  list-style: none;
  padding-left: 0;
  font-size: 14px;
  color: #555;
}

.shipping-info ul li {
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.now-text {
  color: #dc3545;
  font-weight: 700;
  margin-right: 6px;
}

.free-text {
  color: #28a745;
  font-weight: 600;
}

.free-text del {
  color: #999;
  margin-left: 4px;
}

.icon-sun,
.icon-truck {
  flex-shrink: 0;
  color: #007aff;
}

.other-discounts {
  margin-top: 20px;
}

.other-discounts h3 {
  font-weight: 700;
  font-size: 16px;
  margin-bottom: 8px;
}

.discount-codes {
  display: flex;
  align-items: center;
  gap: 8px;
}

.discount-btn {
  padding: 4px 10px;
  border: 1px solid #007aff;
  background: white;
  color: #007aff;
  border-radius: 12px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
}

.more-btn {
  background: transparent;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #007aff;
  padding: 0 6px;
}

/* Right column */
.right-column {
  flex: 1;
  max-width: 320px;
  border: 1px solid #e3e3e3;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.seller-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.seller-name {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 700;
  font-size: 16px;
}

.tiki-logo {
  width: 28px;
  height: 28px;
}

.official-badge {
  background: #eee;
  color: #007aff;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  padding: 2px 6px;
  border-radius: 12px;
}

.rating-summary {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: #222;
}

.score {
  font-weight: 700;
}

.star {
  color: #ffb800;
}

.reviews {
  color: #999999;
  font-size: 13px;
}

.quantity-selector {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.qty-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.qty-controls button {
  border: 1.5px solid #e5e5e5;
  background: white;
  cursor: pointer;
  font-weight: 700;
  font-size: 18px;
  width: 36px;
  height: 36px;
  border-radius: 6px;
  line-height: 1;
  user-select: none;
  display: flex;
  justify-content: center;
  align-items: center;
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

.subtotal {
  display: flex;
  flex-direction: column;
  font-weight: 700;
}

.subtotal label {
  font-size: 16px;
  margin-bottom: 4px;
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
  padding: 12px;
  font-size: 16px;
  cursor: pointer;
  width: 100%;
  transition: background-color 0.3s ease;
}

.buy-now-btn:hover {
  background-color: #d13f3f;
}

.add-to-cart-btn,
.buy-later-btn {
  border: 1.5px solid #006bc6;
  background: transparent;
  color: #006bc6;
  font-weight: 700;
  border-radius: 8px;
  padding: 12px;
  font-size: 16px;
  cursor: pointer;
  width: 100%;
  transition: background-color 0.3s ease;
}

.add-to-cart-btn:hover,
.buy-later-btn:hover {
  background-color: #e6f0ff;
}

.compare-sellers {
  margin-top: 12px;
  font-size: 12px;
  text-align: center;
}

.compare-sellers a {
  color: #007aff;
  text-decoration: none;
  font-weight: 600;
}

.compare-sellers a:hover {
  text-decoration: underline;
}

.promo-banner {
  background: linear-gradient(270deg, #837eff, #683de6);
  border-radius: 12px;
  padding: 12px;
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
  margin-bottom: 8px;
  font-weight: 500;
}

.promo-images {
  display: flex;
  justify-content: center;
  gap: 8px;
}

.promo-images img {
  width: 40px;
  height: 40px;
  object-fit: contain;
  border-radius: 6px;
  background: white;
  padding: 2px;
}

.chat-buttons {
  position: fixed;
  bottom: 24px;
  right: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.help-btn,
.news-btn {
  background-color: #1777ff;
  border: none;
  color: white;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  padding: 10px;
  border-radius: 12px;
  width: 88px;
  box-shadow: 0 4px 6px rgba(23, 119, 255, 0.4);
  transition: background-color 0.3s ease;
}

.help-btn:hover,
.news-btn:hover {
  background-color: #125dc1;
}
</style>
