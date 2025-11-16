<template>
  <div class="container my-5">
    <div class="row">
      <div class="col-12 col-lg-10 offset-lg-1">
        <h1 class="text-center mb-4">About Our Application</h1>

        <div class="card shadow-sm mb-4">
          <div class="card-body">
            <p class="lead">
              Welcome to our Web Application Platform! This project is built
              using Vue.js 3 and Bootstrap 5, demonstrating modern web
              development practices and responsive design principles. Our goal
              is to provide a seamless user experience across all devices while
              showcasing the power of component-based architecture.
            </p>
            <p>
              This application features a news aggregation system with advanced
              filtering capabilities, allowing users to quickly find relevant
              content based on their interests. Whether you're browsing on a
              desktop, tablet, or mobile device, our responsive design ensures
              optimal viewing and interaction.
            </p>
          </div>
        </div>

        <!-- Center Card -->
        <div class="row justify-content-center">
          <div class="col-12 col-md-8 col-lg-6">
            <div class="card shadow">
              <div class="card-body text-center">
                <!-- Welcome Message -->
                <h5 class="card-title mb-3" v-if="firstName">
                  Welcome {{ firstName }} {{ lastName }}!
                </h5>
                <h5 class="card-title mb-3 text-muted" v-else>
                  Welcome Guest!
                </h5>

                <p class="text-muted mb-3">What is your name?</p>

                <!-- Name Input Fields -->
                <div class="mb-3">
                  <label for="firstName1" class="form-label text-start d-block"
                    >First Name</label
                  >
                  <input
                    v-model="firstName"
                    type="text"
                    class="form-control"
                    id="firstName1"
                    placeholder="Smith"
                  />
                </div>

                <div class="mb-3">
                  <label for="lastName1" class="form-label text-start d-block"
                    >Last Name</label
                  >
                  <input
                    v-model="lastName"
                    type="text"
                    class="form-control"
                    id="lastName1"
                    placeholder="Smith"
                  />
                </div>

                <!-- Radio Buttons -->
                <div class="mb-3">
                  <div class="form-check">
                    <input
                      v-model="selectedImage"
                      class="form-check-input"
                      type="radio"
                      name="imageChoice"
                      id="mountain"
                      value="mountain"
                    />
                    <label class="form-check-label" for="mountain">
                      Mountain
                    </label>
                  </div>
                  <div class="form-check">
                    <input
                      v-model="selectedImage"
                      class="form-check-input"
                      type="radio"
                      name="imageChoice"
                      id="ocean"
                      value="ocean"
                    />
                    <label class="form-check-label" for="ocean"> Ocean </label>
                  </div>
                </div>

                <!-- Image Display -->
                <div
                  v-if="selectedImage === 'mountain'"
                  class="image-container"
                >
                  <transition name="fade">
                    <img
                      src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800"
                      alt="Mountain view"
                      class="img-fluid rounded"
                      key="mountain"
                    />
                  </transition>
                </div>
                <div
                  v-else-if="selectedImage === 'ocean'"
                  class="image-container"
                >
                  <transition name="fade">
                    <img
                      src="https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=800"
                      alt="Ocean view"
                      class="img-fluid rounded"
                      key="ocean"
                    />
                  </transition>
                </div>
                <div v-else class="placeholder-box">
                  <p class="text-muted mb-0">Select an option to view image</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Additional Info -->
        <div class="text-center mt-4">
          <p class="text-muted">Built with Vue.js 3 + Bootstrap 5</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "About",
  data() {
    return {
      firstName: "",
      lastName: "",
      selectedImage: "",
    };
  },
};
</script>

<style scoped>
.card {
  border: 1px solid #dee2e6;
}

.image-container {
  margin-top: 1rem;
  min-height: 200px;
}

.image-container img {
  width: 100%;
  max-height: 300px;
  object-fit: cover;
  border: 2px solid #dee2e6;
}

.placeholder-box {
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8f9fa;
  border: 2px dashed #dee2e6;
  border-radius: 0.375rem;
  margin-top: 1rem;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.form-check {
  text-align: left;
  padding-left: 1.5rem;
}

.form-check-input {
  margin-top: 0.25rem;
}

.card-title {
  font-weight: 600;
  color: #333;
}

.form-label {
  font-weight: 500;
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
}

.form-control {
  border: 1px solid #ced4da;
  padding: 0.5rem 0.75rem;
}

.form-control:focus {
  border-color: #0d6efd;
  box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
}

@media (max-width: 768px) {
  .image-container img {
    max-height: 200px;
  }

  .placeholder-box {
    min-height: 150px;
  }

  h1 {
    font-size: 1.75rem;
  }
}

@media (max-width: 576px) {
  .image-container img {
    max-height: 180px;
  }

  h1 {
    font-size: 1.5rem;
  }

  .card-body {
    padding: 1rem;
  }
}
</style>
