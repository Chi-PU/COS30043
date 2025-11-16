<template>
  <div class="ibm-layout">
    <!-- HERO SECTION -->
    <div class="hero-section">
      <!-- LEFT TEXT -->
      <div class="hero-left">
        <h1 class="hero-title">Welcome to Our Web Application</h1>

        <p class="hero-subtext">
          Discover the latest news, trends, and insights in web development. Our
          platform brings you curated content to help you stay updated with the
          ever-evolving world of technology and design.
        </p>

        <div class="hero-buttons">
          <button class="primary-btn">Explore Modern Development →</button>
          <button class="outline-btn">Learn About Creative Design →</button>
        </div>
      </div>

      <!-- CENTER IMAGE -->
      <div class="hero-center">
        <img
          src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1600"
          alt="Hero Illustration"
          class="hero-image"
        />
      </div>

      <!-- RIGHT SIDEBAR -->
      <div class="hero-right">
        <h4 class="sidebar-title">Latest News</h4>

        <div class="sidebar-item">
          <a href="#" class="sidebar-link">
            Modern Development Trends in 2025
          </a>
          <div class="arrow">→</div>
        </div>

        <div class="sidebar-item">
          <a href="#" class="sidebar-link">
            UI/UX Evolutions and New Patterns
          </a>
          <div class="arrow">→</div>
        </div>

        <div class="sidebar-item">
          <a href="#" class="sidebar-link"> Understanding AI & Automation </a>
          <div class="arrow">→</div>
        </div>

        <div class="sidebar-pagination">
          <span class="active">1</span>
          <span>2</span>
          <span>3</span>
          <span>4</span>
        </div>
      </div>
    </div>

    <!-- Recommended Section -->
    <h4 class="recommended-title">Recommended for you</h4>

    <!-- 2 CARDS -->
    <div class="cards-row">
      <div class="card-item">
        <div class="card shadow-sm h-100">
          <img
            src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800"
            class="card-img-top"
            alt="Tech"
          />
          <div class="card-body">
            <h5 class="card-title">Modern Development</h5>
            <p class="card-text">
              Explore cutting-edge technologies and frameworks shaping the
              future of development.
            </p>
          </div>
        </div>
      </div>

      <div class="card-item">
        <div class="card shadow-sm h-100">
          <img
            src="https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=800"
            class="card-img-top"
            alt="Design"
          />
          <div class="card-body">
            <h5 class="card-title">Creative Design</h5>
            <p class="card-text">
              Learn about design principles, user experience, and creating
              responsive interfaces.
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Alert -->
    <div class="bottom-alert">
      <h4>Stay Connected!</h4>
      <p>
        Check out our News section for the latest updates and visit the About
        page to learn more about our platform.
      </p>
    </div>
  </div>
</template>

<script>
export default {
  name: "Home",
};
</script>

<style scoped>
/* ------------------------- */
/* HERO LAYOUT (IBM STYLE) */
/* ------------------------- */

.ibm-layout {
  padding: 2rem 3rem;
  font-family: "IBM Plex Sans", sans-serif;
}

.hero-section {
  display: grid;
  grid-template-columns: 1.2fr 1.5fr 0.8fr;
  gap: 2.5rem;
  align-items: center;
}

/* LEFT COLUMN */
.hero-title {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 1rem;
  background: linear-gradient(90deg, #3a47d5, #6d5dfc);
  -webkit-background-clip: text;
  color: transparent;
}

.hero-subtext {
  font-size: 1.15rem;
  color: #444;
  margin-bottom: 1.5rem;
  max-width: 90%;
}

.hero-buttons {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.primary-btn {
  background: #0f62fe;
  color: white;
  padding: 0.75rem 1.2rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.outline-btn {
  padding: 0.75rem 1.2rem;
  border: 2px solid #0f62fe;
  color: #0f62fe;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
}

/* CENTER IMAGE */
.hero-image {
  width: 100%;
  border-radius: 10px;
  object-fit: cover;
  max-height: 420px;
}

/* RIGHT SIDEBAR */
.hero-right {
  border-left: 1px solid #eaeaea;
  padding-left: 1.5rem;
}

.sidebar-title {
  font-weight: 700;
  margin-bottom: 1.5rem;
}

.sidebar-item {
  padding: 1rem 0;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sidebar-link {
  text-decoration: none;
  color: #0f62fe;
  font-weight: 500;
}

.arrow {
  color: #0f62fe;
  font-size: 1.2rem;
}

.sidebar-pagination {
  margin-top: 1rem;
  display: flex;
  gap: 1rem;
}

.sidebar-pagination span {
  cursor: pointer;
}

.sidebar-pagination .active {
  color: #0f62fe;
  font-weight: bold;
}

/* ------------------------- */
/* RECOMMENDED SECTION */
/* ------------------------- */

.recommended-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-top: 3rem;
  margin-bottom: 1.5rem;
}

/* CARDS */
.cards-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
}

.card-img-top {
  height: 250px;
  object-fit: cover;
}

/* ------------------------- */
/* BOTTOM ALERT */
/* ------------------------- */

.bottom-alert {
  margin-top: 3rem;
  background: #e8f4ff;
  padding: 1.8rem;
  border-radius: 8px;
  text-align: center;
}

.bottom-alert h4 {
  font-weight: 600;
  margin-bottom: 0.5rem;
}

/* Responsive */
@media (max-width: 992px) {
  .hero-section {
    grid-template-columns: 1fr;
  }

  .hero-right {
    border: none;
    padding: 0;
  }

  .hero-image {
    max-height: 300px;
  }
}
</style>
