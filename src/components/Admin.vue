<template>
  <div class="admin-dashboard">
    <header class="admin-header">
      <h1>Admin Dashboard</h1>
      <button @click="logout" class="btn-logout">Logout</button>
    </header>

    <main class="admin-content">
      <!-- Search and Filter Section -->
      <div class="admin-controls">
        <div class="search-bar">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search products by name..."
            @input="filterProducts"
          />
        </div>
        <div class="filter-section">
          <select v-model="selectedCategory" @change="filterProducts">
            <option value="">All Categories</option>
            <option value="Home">Home</option>
            <option value="Beauty">Beauty</option>
            <option value="Health">Health</option>
            <option value="Food">Food</option>
            <option value="Clothing">Clothing</option>
          </select>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading-message">
        <p>Loading products...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error-message">
        <p>{{ error }}</p>
        <button @click="fetchProducts">Try Again</button>
      </div>

      <!-- Product Table -->
      <div v-else class="products-table-container">
        <table class="products-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Image</th>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Discount</th>
              <th>Stock</th>
              <th>Rating</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="product in displayedProducts" :key="product.id">
              <td>{{ product.id }}</td>
              <td>
                <img
                  :src="product.image_url || 'https://via.placeholder.com/50'"
                  :alt="product.name"
                  class="product-thumbnail"
                />
              </td>
              <td class="product-name">{{ product.name }}</td>
              <td>{{ product.category }}</td>
              <td>${{ formatPrice(product.price) }}</td>
              <td>{{ product.discount }}%</td>
              <td>{{ product.stock }}</td>
              <td>
                {{ getAverageRating(product).toFixed(1) }}
                ({{ product.number_of_ratings }})
              </td>
              <td class="actions-cell">
                <button
                  @click="openEditModal(product)"
                  class="btn-edit"
                  title="Edit Product"
                >
                  ✏️
                </button>
                <button
                  @click="confirmDelete(product)"
                  class="btn-delete"
                  title="Delete Product"
                >
                  🗑️
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Empty State -->
        <div v-if="displayedProducts.length === 0" class="empty-state">
          <p>No products found</p>
        </div>
      </div>

      <!-- Pagination Info -->
      <div v-if="displayedProducts.length > 0" class="pagination-info">
        Showing {{ displayedProducts.length }} of {{ allProducts.length }}
        products
      </div>
    </main>

    <!-- Edit Modal -->
    <div v-if="showEditModal" class="modal-overlay" @click="closeEditModal">
      <div class="modal-content" @click.stop>
        <h2>Edit Product</h2>
        <form @submit.prevent="updateProduct">
          <div class="form-group">
            <label>Product Name</label>
            <input
              v-model="editForm.name"
              type="text"
              required
              placeholder="Product name"
            />
          </div>

          <div class="form-group">
            <label>Description</label>
            <textarea
              v-model="editForm.description"
              rows="3"
              placeholder="Product description"
            ></textarea>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Price ($)</label>
              <input
                v-model.number="editForm.price"
                type="number"
                step="0.01"
                required
                min="0"
              />
            </div>

            <div class="form-group">
              <label>Discount (%)</label>
              <input
                v-model.number="editForm.discount"
                type="number"
                min="0"
                max="100"
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Stock</label>
              <input
                v-model.number="editForm.stock"
                type="number"
                required
                min="0"
              />
            </div>
          </div>

          <div class="form-group">
            <label>Image URL</label>
            <input
              v-model="editForm.image_url"
              type="url"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div class="modal-actions">
            <button type="button" @click="closeEditModal" class="btn-cancel">
              Cancel
            </button>
            <button type="submit" class="btn-save" :disabled="updating">
              {{ updating ? "Updating..." : "Update Product" }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-overlay" @click="closeDeleteModal">
      <div class="modal-content delete-modal" @click.stop>
        <h2>Confirm Delete</h2>
        <p>
          Are you sure you want to delete
          <strong>{{ productToDelete?.name }}</strong
          >?
        </p>
        <p class="warning-text">This action cannot be undone.</p>
        <div class="modal-actions">
          <button @click="closeDeleteModal" class="btn-cancel">Cancel</button>
          <button
            @click="deleteProduct"
            class="btn-delete-confirm"
            :disabled="deleting"
          >
            {{ deleting ? "Deleting..." : "Delete" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { productsAPI, authAPI } from "../services/api";

export default {
  name: "AdminDashboard",
  data() {
    return {
      allProducts: [],
      displayedProducts: [],
      searchQuery: "",
      selectedCategory: "",
      loading: false,
      error: null,
      showEditModal: false,
      showDeleteModal: false,
      productToDelete: null,
      editForm: {
        id: null,
        name: "",
        description: "",
        price: 0,
        discount: 0,
        stock: 0,
        category: "",
        image_url: "",
      },
      updating: false,
      deleting: false,
    };
  },
  async mounted() {
    await this.checkAdminAccess();
    this.fetchProducts();
  },
  methods: {
    async checkAdminAccess() {
      try {
        const response = await authAPI.getMe();

        // Debug: Log the entire response
        console.log("Full response:", response);
        console.log("Response data:", response.data);

        // The user data might be nested in response.data.user
        const user = response.data.user || response.data;

        console.log("Current user data:", user);
        console.log("is_admin value:", user?.is_admin);
        console.log("is_admin type:", typeof user?.is_admin);

        // Check if user is admin
        if (!user || !user.is_admin) {
          alert("Access denied. Admin privileges required.");
          this.$router.push("/shop");
          return;
        }

        console.log("✅ Admin access granted");
      } catch (err) {
        console.error("Auth check failed:", err);
        alert("Please login to access admin dashboard.");
        this.$router.push("/shop");
      }
    },

    async fetchProducts() {
      this.loading = true;
      this.error = null;
      try {
        const response = await productsAPI.getAll();
        // Handle different response structures
        const data = response.data;
        if (Array.isArray(data)) {
          this.allProducts = data;
        } else if (data.products && Array.isArray(data.products)) {
          this.allProducts = data.products;
        } else {
          this.allProducts = [];
        }
        this.displayedProducts = [...this.allProducts];
      } catch (err) {
        this.error = "Failed to load products. Please try again.";
        console.error("Error fetching products:", err);
        this.allProducts = [];
        this.displayedProducts = [];
      } finally {
        this.loading = false;
      }
    },

    filterProducts() {
      let filtered = [...this.allProducts];

      // Filter by search query
      if (this.searchQuery.trim()) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter((product) =>
          product.name.toLowerCase().includes(query)
        );
      }

      // Filter by category
      if (this.selectedCategory) {
        filtered = filtered.filter(
          (product) => product.category === this.selectedCategory
        );
      }

      this.displayedProducts = filtered;
    },

    openEditModal(product) {
      this.editForm = {
        id: product.id,
        name: product.name,
        description: product.description || "",
        price: product.price,
        discount: product.discount || 0,
        stock: product.stock,
        category: product.category,
        image_url: product.image_url || "",
      };
      this.showEditModal = true;
    },

    closeEditModal() {
      this.showEditModal = false;
      this.editForm = {
        id: null,
        name: "",
        description: "",
        price: 0,
        discount: 0,
        stock: 0,
        image_url: "",
      };
    },

    async updateProduct() {
      this.updating = true;
      try {
        await productsAPI.update(this.editForm.id, this.editForm);

        // Update local data
        const index = this.allProducts.findIndex(
          (p) => p.id === this.editForm.id
        );
        if (index !== -1) {
          this.allProducts[index] = {
            ...this.allProducts[index],
            ...this.editForm,
          };
        }

        this.filterProducts();
        this.closeEditModal();
        alert("Product updated successfully!");
      } catch (err) {
        alert("Failed to update product. Please try again.");
        console.error("Error updating product:", err);
      } finally {
        this.updating = false;
      }
    },

    confirmDelete(product) {
      this.productToDelete = product;
      this.showDeleteModal = true;
    },

    closeDeleteModal() {
      this.showDeleteModal = false;
      this.productToDelete = null;
    },

    async deleteProduct() {
      if (!this.productToDelete) return;

      this.deleting = true;
      try {
        await productsAPI.delete(this.productToDelete.id);

        // Remove from local data
        this.allProducts = this.allProducts.filter(
          (p) => p.id !== this.productToDelete.id
        );

        this.filterProducts();
        this.closeDeleteModal();
        alert("Product deleted successfully!");
      } catch (err) {
        alert("Failed to delete product. Please try again.");
        console.error("Error deleting product:", err);
      } finally {
        this.deleting = false;
      }
    },

    getAverageRating(product) {
      if (product.number_of_ratings === 0) return 0;
      return product.total_rating_score / product.number_of_ratings;
    },

    formatPrice(price) {
      return parseFloat(price).toFixed(2);
    },

    async logout() {
      try {
        await authAPI.logout();
        this.$router.push("/login");
      } catch (err) {
        console.error("Logout error:", err);
      }
    },
  },
};
</script>

<style scoped>
.admin-dashboard {
  min-height: 100vh;
  background: #f5f7fa;
}

.admin-header {
  background: #2c3e50;
  color: white;
  padding: 1.5rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.admin-header h1 {
  margin: 0;
  font-size: 1.75rem;
}

.btn-logout {
  background: #e74c3c;
  color: white;
  border: none;
  padding: 0.5rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background 0.3s;
}

.btn-logout:hover {
  background: #c0392b;
}

.admin-content {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.admin-controls {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.search-bar {
  flex: 1;
  min-width: 250px;
}

.search-bar input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.filter-section select {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  min-width: 200px;
}

.loading-message,
.error-message {
  text-align: center;
  padding: 3rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.error-message button {
  margin-top: 1rem;
  padding: 0.5rem 1.5rem;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.products-table-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow-x: auto;
}

.products-table {
  width: 100%;
  border-collapse: collapse;
}

.products-table thead {
  background: #34495e;
  color: white;
}

.products-table th,
.products-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #ecf0f1;
}

.products-table th {
  font-weight: 600;
  white-space: nowrap;
}

.products-table tbody tr:hover {
  background: #f8f9fa;
}

.product-thumbnail {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 4px;
}

.product-name {
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.actions-cell {
  display: flex;
  gap: 0.5rem;
}

.btn-edit,
.btn-delete {
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  transition: transform 0.2s;
}

.btn-edit:hover,
.btn-delete:hover {
  transform: scale(1.2);
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #7f8c8d;
}

.pagination-info {
  text-align: center;
  margin-top: 1rem;
  color: #7f8c8d;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-content h2 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  color: #2c3e50;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #34495e;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
}

.btn-cancel,
.btn-save,
.btn-delete-confirm {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.3s;
}

.btn-cancel {
  background: #95a5a6;
  color: white;
}

.btn-cancel:hover {
  background: #7f8c8d;
}

.btn-save {
  background: #27ae60;
  color: white;
}

.btn-save:hover {
  background: #229954;
}

.btn-save:disabled,
.btn-delete-confirm:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.delete-modal {
  max-width: 400px;
}

.delete-modal p {
  margin: 1rem 0;
}

.warning-text {
  color: #e74c3c;
  font-size: 0.9rem;
}

.btn-delete-confirm {
  background: #e74c3c;
  color: white;
}

.btn-delete-confirm:hover {
  background: #c0392b;
}
</style>
