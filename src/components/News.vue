<template>
  <div class="news-page py-5">
    <div class="container">
      <h1 class="text-center mb-4 fw-bold">Latest News</h1>

      <!-- Search Filters Card -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="card shadow-sm border-0">
            <div class="card-body">
              <h5 class="card-title fw-bold mb-3">
                <span class="me-2">🔍</span>Search & Filter News
              </h5>
              <div class="row g-3">
                <div class="col-12 col-sm-6 col-lg-3">
                  <label class="form-label small fw-semibold">Date</label>
                  <input
                    v-model="filters.date"
                    type="date"
                    class="form-control"
                  />
                </div>
                <div class="col-12 col-sm-6 col-lg-3">
                  <label class="form-label small fw-semibold">Title</label>
                  <input
                    v-model="filters.title"
                    type="text"
                    class="form-control"
                    placeholder="Search title..."
                  />
                </div>
                <div class="col-12 col-sm-6 col-lg-3">
                  <label class="form-label small fw-semibold">Content</label>
                  <input
                    v-model="filters.content"
                    type="text"
                    class="form-control"
                    placeholder="Search content..."
                  />
                </div>
                <div class="col-12 col-sm-6 col-lg-3">
                  <label class="form-label small fw-semibold">Category</label>
                  <select v-model="filters.category" class="form-select">
                    <option value="">All Categories</option>
                    <option v-for="cat in categories" :key="cat" :value="cat">
                      {{ cat }}
                    </option>
                  </select>
                </div>
              </div>
              <div class="mt-3">
                <button @click="resetFilters" class="btn btn-secondary btn-sm">
                  <span class="me-1">↻</span> Reset Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Results Summary -->
      <div class="row mb-3">
        <div class="col-12">
          <div
            class="d-flex justify-content-between align-items-center flex-wrap gap-2"
          >
            <p class="text-muted mb-0">
              <strong>{{ filteredNews.length }}</strong> news items found
              <span v-if="hasActiveFilters" class="badge bg-info ms-2"
                >Filtered</span
              >
            </p>
            <p class="text-muted mb-0 small">
              Page <strong>{{ currentPage }}</strong> of
              <strong>{{ totalPages }}</strong>
            </p>
          </div>
        </div>
      </div>

      <!-- News Table - Desktop View (≥992px) -->
      <div class="row d-none d-lg-block">
        <div class="col-12">
          <div class="card shadow-sm border-0">
            <div class="table-responsive">
              <table class="table table-hover align-middle mb-0">
                <thead class="table-light">
                  <tr>
                    <th scope="col" class="text-center" style="width: 8%">#</th>
                    <th scope="col" style="width: 12%">Date</th>
                    <th scope="col" style="width: 25%">Title</th>
                    <th scope="col" style="width: 43%">Content</th>
                    <th scope="col" style="width: 12%">Category</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, index) in paginatedNews" :key="item.id">
                    <td class="text-center">
                      <span class="badge bg-secondary">{{
                        getItemNumber(index)
                      }}</span>
                    </td>
                    <td>
                      <small class="text-muted">{{
                        formatDate(item.date)
                      }}</small>
                    </td>
                    <td>
                      <strong class="text-primary">{{ item.title }}</strong>
                    </td>
                    <td>
                      <small class="text-muted">{{ item.content }}</small>
                    </td>
                    <td>
                      <span
                        class="badge"
                        :class="getCategoryClass(item.category)"
                      >
                        {{ item.category }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- News Cards - Tablet View (768px - 991px) -->
      <div class="row g-3 d-none d-md-flex d-lg-none">
        <div
          v-for="(item, index) in paginatedNews"
          :key="item.id"
          class="col-12 col-md-6"
        >
          <div class="card shadow-sm border-0 h-100 news-card">
            <div class="card-body">
              <div
                class="d-flex justify-content-between align-items-start mb-2"
              >
                <span class="badge" :class="getCategoryClass(item.category)">
                  {{ item.category }}
                </span>
                <small class="text-muted">{{ formatDate(item.date) }}</small>
              </div>
              <h6 class="card-title text-primary fw-bold mb-2">
                {{ item.title }}
              </h6>
              <p class="card-text small text-muted mb-2">{{ item.content }}</p>
              <div class="text-end">
                <span class="badge bg-secondary small">{{
                  getItemNumber(index)
                }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- News Cards - Mobile View (<768px) -->
      <div class="row g-3 d-md-none">
        <div
          v-for="(item, index) in paginatedNews"
          :key="item.id"
          class="col-12"
        >
          <div class="card shadow-sm border-0 news-card">
            <div class="card-body">
              <div
                class="d-flex justify-content-between align-items-center mb-2"
              >
                <span class="badge bg-secondary small">{{
                  getItemNumber(index)
                }}</span>
                <small class="text-muted">{{ formatDate(item.date) }}</small>
              </div>
              <h6 class="card-title text-primary fw-bold mb-2">
                {{ item.title }}
              </h6>
              <p class="card-text small text-muted mb-2">{{ item.content }}</p>
              <div class="text-end">
                <span class="badge" :class="getCategoryClass(item.category)">
                  {{ item.category }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- No Results Message -->
      <div v-if="filteredNews.length === 0" class="row mt-4">
        <div class="col-12">
          <div
            class="alert alert-warning text-center border-0 shadow-sm"
            role="alert"
          >
            <h5 class="alert-heading fw-bold">
              <span class="me-2">⚠️</span>No News Found
            </h5>
            <p class="mb-0 small">
              No news items match your search criteria. Try adjusting your
              filters.
            </p>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="filteredNews.length > 0" class="row mt-4">
        <div class="col-12">
          <nav aria-label="News pagination">
            <ul class="pagination justify-content-center flex-wrap mb-0">
              <li class="page-item" :class="{ disabled: currentPage === 1 }">
                <a
                  class="page-link"
                  href="#"
                  @click.prevent="goToPage(currentPage - 1)"
                  aria-label="Previous"
                >
                  <span aria-hidden="true">«</span>
                </a>
              </li>

              <li
                v-for="page in visiblePages"
                :key="page"
                class="page-item"
                :class="{ active: currentPage === page }"
              >
                <a class="page-link" href="#" @click.prevent="goToPage(page)">
                  {{ page }}
                </a>
              </li>

              <li
                class="page-item"
                :class="{ disabled: currentPage === totalPages }"
              >
                <a
                  class="page-link"
                  href="#"
                  @click.prevent="goToPage(currentPage + 1)"
                  aria-label="Next"
                >
                  <span aria-hidden="true">»</span>
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "News",
  data() {
    return {
      newsItems: [],
      filters: {
        date: "",
        title: "",
        content: "",
        category: "",
      },
      currentPage: 1,
      itemsPerPage: 6,
    };
  },
  computed: {
    categories() {
      const cats = [...new Set(this.newsItems.map((item) => item.category))];
      return cats.sort();
    },
    filteredNews() {
      return this.newsItems.filter((item) => {
        const matchDate = !this.filters.date || item.date === this.filters.date;
        const matchTitle =
          !this.filters.title ||
          item.title.toLowerCase().includes(this.filters.title.toLowerCase());
        const matchContent =
          !this.filters.content ||
          item.content
            .toLowerCase()
            .includes(this.filters.content.toLowerCase());
        const matchCategory =
          !this.filters.category || item.category === this.filters.category;

        return matchDate && matchTitle && matchContent && matchCategory;
      });
    },
    totalPages() {
      return Math.ceil(this.filteredNews.length / this.itemsPerPage);
    },
    paginatedNews() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.filteredNews.slice(start, end);
    },
    visiblePages() {
      const pages = [];
      const maxVisible = 5;
      let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
      let end = Math.min(this.totalPages, start + maxVisible - 1);

      if (end - start < maxVisible - 1) {
        start = Math.max(1, end - maxVisible + 1);
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      return pages;
    },
    hasActiveFilters() {
      return (
        this.filters.date ||
        this.filters.title ||
        this.filters.content ||
        this.filters.category
      );
    },
  },
  methods: {
    async loadNews() {
      try {
        const response = await fetch("/news-data.json");
        if (!response.ok) throw new Error("Failed to load news");
        this.newsItems = await response.json();
      } catch (error) {
        console.warn("Loading demo data:", error);
        this.newsItems = this.getDemoData();
      }
    },
    formatDate(dateString) {
      const options = { year: "numeric", month: "short", day: "numeric" };
      return new Date(dateString).toLocaleDateString("en-US", options);
    },
    resetFilters() {
      this.filters = {
        date: "",
        title: "",
        content: "",
        category: "",
      };
      this.currentPage = 1;
    },
    goToPage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    },
    getItemNumber(index) {
      return (this.currentPage - 1) * this.itemsPerPage + index + 1;
    },
    getCategoryClass(category) {
      const classes = {
        Technology: "bg-primary",
        Design: "bg-success",
        Programming: "bg-info",
        Development: "bg-warning text-dark",
      };
      return classes[category] || "bg-secondary";
    },
    getDemoData() {
      return [
        {
          id: 1,
          date: "2024-11-05",
          title: "Vue 3 Composition API Best Practices",
          content:
            "Learn the best practices for using Vue 3's Composition API to build scalable and maintainable applications.",
          category: "Technology",
        },
        {
          id: 2,
          date: "2024-11-04",
          title: "Bootstrap 5 Grid System Updates",
          content:
            "Discover the latest improvements in Bootstrap 5's grid system and create responsive layouts efficiently.",
          category: "Design",
        },
        {
          id: 3,
          date: "2024-11-03",
          title: "Modern JavaScript Features in 2024",
          content:
            "Explore the newest JavaScript features revolutionizing web development and making code elegant.",
          category: "Programming",
        },
        {
          id: 4,
          date: "2024-11-02",
          title: "Responsive Web Design Principles",
          content:
            "Master fundamental principles of responsive web design for all devices and screen sizes.",
          category: "Design",
        },
        {
          id: 5,
          date: "2024-11-01",
          title: "Vue Router Navigation Guards",
          content:
            "Understanding Vue Router's navigation guards for authentication and authorization.",
          category: "Technology",
        },
        {
          id: 6,
          date: "2024-10-31",
          title: "CSS Flexbox vs Grid Layout",
          content:
            "Comprehensive comparison between CSS Flexbox and Grid Layout systems.",
          category: "Design",
        },
        {
          id: 7,
          date: "2024-10-30",
          title: "TypeScript for Vue Developers",
          content:
            "Why TypeScript is essential for Vue.js developers and integration strategies.",
          category: "Programming",
        },
        {
          id: 8,
          date: "2024-10-29",
          title: "Web Performance Optimization",
          content:
            "Essential techniques for optimizing web application performance.",
          category: "Technology",
        },
        {
          id: 9,
          date: "2024-10-28",
          title: "Accessibility in Modern Web Apps",
          content:
            "Making web applications accessible following WCAG guidelines.",
          category: "Development",
        },
        {
          id: 10,
          date: "2024-10-27",
          title: "State Management with Pinia",
          content:
            "Managing application state effectively using Pinia for Vue 3.",
          category: "Technology",
        },
        {
          id: 11,
          date: "2024-10-26",
          title: "Mobile-First Design Strategy",
          content: "Why mobile-first design leads to better user experiences.",
          category: "Design",
        },
        {
          id: 12,
          date: "2024-10-25",
          title: "RESTful API Design Patterns",
          content:
            "Best practices for designing clean and scalable RESTful APIs.",
          category: "Development",
        },
        {
          id: 13,
          date: "2024-10-24",
          title: "Git Workflow for Teams",
          content: "Effective Git workflows improving team collaboration.",
          category: "Development",
        },
        {
          id: 14,
          date: "2024-10-23",
          title: "Testing Vue Components",
          content: "Complete guide to testing Vue components using Vitest.",
          category: "Programming",
        },
        {
          id: 15,
          date: "2024-10-22",
          title: "Deploying Vue Apps",
          content: "Step-by-step guide for deploying Vue.js applications.",
          category: "Technology",
        },
        {
          id: 16,
          date: "2024-10-21",
          title: "CSS Animation Techniques",
          content: "Creating smooth and performant CSS animations.",
          category: "Design",
        },
        {
          id: 17,
          date: "2024-10-20",
          title: "Web Security Best Practices",
          content: "Essential security measures for protecting applications.",
          category: "Development",
        },
        {
          id: 18,
          date: "2024-10-19",
          title: "Progressive Web Apps with Vue",
          content: "Building Progressive Web Apps using Vue.js framework.",
          category: "Technology",
        },
      ];
    },
  },
  watch: {
    filters: {
      deep: true,
      handler() {
        this.currentPage = 1;
      },
    },
  },
  mounted() {
    this.loadNews();
  },
};
</script>

<style scoped>
.news-page {
  min-height: calc(100vh - 200px);
  background-color: #f8f9fa;
}

h1 {
  color: #2c3e50;
}

/* Card Styles */
.card {
  border-radius: 0.5rem;
  background: white;
}

/* Table Styles */
.table {
  font-size: 0.95rem;
}

.table thead th {
  font-weight: 600;
  color: #495057;
  background-color: #f8f9fa;
  border-bottom: 2px solid #dee2e6;
  padding: 1rem 0.75rem;
  white-space: nowrap;
}

.table tbody td {
  padding: 1rem 0.75rem;
  vertical-align: middle;
}

.table tbody tr {
  transition: background-color 0.2s ease;
}

.table tbody tr:hover {
  background-color: #f8f9fa;
}

/* News Card Styles */
.news-card {
  transition: all 0.2s ease;
}

.news-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
}

.card-title {
  font-size: 1rem;
  line-height: 1.4;
}

.card-text {
  line-height: 1.5;
}

/* Badge Styles */
.badge {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.35em 0.65em;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

/* Pagination */
.pagination {
  gap: 0.25rem;
}

.page-link {
  color: #0d6efd;
  border: 1px solid #dee2e6;
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
  transition: all 0.2s ease;
  font-weight: 500;
}

.page-link:hover {
  background-color: #e7f1ff;
  border-color: #0d6efd;
}

.page-item.active .page-link {
  background-color: #0d6efd;
  border-color: #0d6efd;
  font-weight: 600;
}

.page-item.disabled .page-link {
  color: #6c757d;
  pointer-events: none;
  background-color: #fff;
  border-color: #dee2e6;
}

/* Form Styles */
.form-label {
  color: #495057;
  margin-bottom: 0.375rem;
}

.form-control,
.form-select {
  border: 1px solid #ced4da;
  border-radius: 0.375rem;
  padding: 0.5rem 0.75rem;
  font-size: 0.95rem;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

.form-control:focus,
.form-select:focus {
  border-color: #0d6efd;
  box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
  outline: 0;
}

/* Responsive Design */
@media (max-width: 991px) {
  h1 {
    font-size: 1.75rem;
  }
}

@media (max-width: 768px) {
  h1 {
    font-size: 1.5rem;
  }

  .card-body {
    padding: 1rem;
  }
}

@media (max-width: 576px) {
  .pagination .page-link {
    padding: 0.375rem 0.6rem;
    font-size: 0.875rem;
  }

  .badge {
    font-size: 0.7rem;
    padding: 0.25em 0.5em;
  }

  .form-control,
  .form-select {
    font-size: 0.9rem;
  }
}
</style>
