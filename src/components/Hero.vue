<template>
  <!-- Hero Section-->
  <section class="hero-section">
    <button class="hero-arrow left" aria-label="Previous" @click="prevSlide">
      &#10094;
    </button>
    <img
      :src="slides[currentSlide]"
      :alt="`Slide ${currentSlide + 1}`"
      class="hero-image"
    />
    <button class="hero-arrow right" aria-label="Next" @click="nextSlide">
      &#10095;
    </button>
    <div class="hero-dots">
      <span
        v-for="index in slides.length"
        :key="index"
        :class="{ active: index - 1 === currentSlide }"
        @click="goToSlide(index - 1)"
      ></span>
    </div>
  </section>
</template>

<script setup>
import { ref } from "vue";
import Slide1 from "../assets/Slide1.png";
import Slide2 from "../assets/Slide2.png";
import Slide3 from "../assets/Slide3.png";
import Slide4 from "../assets/Slide4.png";

// Slides data
const slides = [Slide1, Slide2, Slide3, Slide4];

// State
const currentSlide = ref(0);

// Functions
const nextSlide = () => {
  currentSlide.value = (currentSlide.value + 1) % slides.length;
};

const prevSlide = () => {
  currentSlide.value = (currentSlide.value - 1 + slides.length) % slides.length;
};

const goToSlide = (index) => {
  currentSlide.value = index;
};
</script>

<style scoped>
/* Hero Section */
.hero-section {
  background: #121734;
  position: relative;
  border-radius: 0;
  margin: 0;
  width: 100vw;
  height: 400px;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-left: calc(-50vw + 50%);
}

.hero-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  user-select: none;
}

.hero-arrow {
  font-size: 32px;
  background: rgba(0, 0, 0, 0.5);
  border: none;
  color: white;
  cursor: pointer;
  user-select: none;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
  transition: background 0.3s, opacity 0.2s;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-arrow:hover {
  background: rgba(0, 0, 0, 0.7);
}

.hero-arrow.left {
  left: 20px;
}

.hero-arrow.right {
  right: 20px;
}

.hero-dots {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
  z-index: 10;
}

.hero-dots span {
  display: inline-block;
  width: 12px;
  height: 12px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 50%;
  cursor: pointer;
  transition: background 0.3s, transform 0.2s;
}

.hero-dots span:hover {
  background: rgba(255, 255, 255, 0.8);
  transform: scale(1.2);
}

.hero-dots span.active {
  background: white;
  transform: scale(1.3);
}

/* Responsive */
@media (max-width: 970px) {
  .hero-section {
    height: 300px;
  }

  .hero-arrow {
    width: 40px;
    height: 40px;
    font-size: 24px;
  }

  .hero-arrow.left {
    left: 15px;
  }

  .hero-arrow.right {
    right: 15px;
  }
}

@media (max-width: 640px) {
  .hero-section {
    height: 200px;
    margin: 0.5rem;
    width: calc(100% - 1rem);
  }

  .hero-arrow {
    width: 35px;
    height: 35px;
    font-size: 20px;
  }

  .hero-arrow.left {
    left: 10px;
  }

  .hero-arrow.right {
    right: 10px;
  }

  .hero-dots {
    bottom: 10px;
  }

  .hero-dots span {
    width: 8px;
    height: 8px;
  }
}
</style>
