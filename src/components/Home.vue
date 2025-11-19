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
    </div>

    <!-- Recommended Section updated -->
    <h4 class="recommended-title">Recommended for you</h4>
    <div class="recommended-row">
      <div
        class="recommended-card"
        v-for="(item, idx) in recommendedItems"
        :key="idx"
      >
        <img :src="item.image" alt="item.title" class="recommended-image" />
        <div class="recommended-content">
          <div class="recommended-category">{{ item.category }}</div>
          <div class="recommended-text">{{ item.text }}</div>
          <div class="recommended-arrow">→</div>
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
  data() {
    return {
      recommendedItems: [
        {
          image:
            "https://1.cms.s81c.com/sites/default/files/2023-06/accelerate_resolution.png",
          category: "Guide",
          text: "Accelerate resolution, strengthen reliability and optimize performance",
        },
        {
          image:
            "https://1.cms.s81c.com/sites/default/files/2023-06/add_synthetic_monitoring_to_ci_cd_image.png",
          category: "News",
          text: "Add synthetic monitoring to your CI/CD to bring production-grade tests to preprod",
        },
        {
          image:
            "https://1.cms.s81c.com/sites/default/files/2023-06/explore_smart_business.png",
          category: "Insight",
          text: "Explore what makes a smarter business and how to become one",
        },
        {
          image:
            "https://1.cms.s81c.com/sites/default/files/2023-06/generative_ai_journey.png",
          category: "Resources",
          text: "Get started on your generative AI journey with self-guided workshops and more",
        },
      ],
    };
  },
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
  margin-bottom: 1rem;
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
  margin-bottom: 1rem;
}

/* Layout similar to design: horizontal row */
.recommended-row {
  display: flex;
  gap: 24px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  overflow: hidden;
  user-select: none;
}

/* Each card styled as white panel with subtle border and spacing */
.recommended-card {
  background: #fff;
  flex: 1 1 0;
  display: flex;
  padding: 16px 12px;
  align-items: flex-start;
  cursor: pointer;
  transition: background-color 0.25s ease;
  border-left: 1px solid #e0e0e0;
  position: relative;
}

.recommended-card:first-child {
  border-left: none;
}

/* Image container */
.recommended-image {
  width: 120px;
  height: 120px;
  background: #f8f8f8;
  object-fit: contain;
  margin-right: 16px;
}

/* Content area */
.recommended-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
}

.recommended-category {
  font-weight: 600;
  font-size: 0.85rem;
  color: #6f6f6f;
  margin-bottom: 6px;
}

.recommended-text {
  font-size: 1rem;
  color: #222;
  line-height: 1.3;
  min-height: 68px; /* roughly 3 lines */
}

/* Arrow positioned bottom right */
.recommended-arrow {
  position: absolute;
  bottom: 0;
  right: 0;
  font-weight: 900;
  font-size: 1.5rem;
  color: #0f62fe;
  user-select: none;
}

/* Hover effect on card */
.recommended-card:hover {
  background-color: #e6f0ff;
}

/* Responsive behavior */
@media (max-width: 768px) {
  .recommended-row {
    flex-direction: column;
  }
  .recommended-card {
    border-left: none !important;
    border-top: 1px solid #e0e0e0;
    padding: 12px 18px;
  }
  .recommended-card:first-child {
    border-top: none !important;
  }
  .recommended-image {
    width: 100%;
    height: auto;
    max-height: 200px;
    margin-bottom: 12px;
  }
  .recommended-content {
    position: static;
  }
  .recommended-arrow {
    position: static;
    font-size: 1.25rem;
    margin-top: 6px;
    align-self: flex-start;
  }
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
