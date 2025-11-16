import axios from "axios";

// Create axios instance with base URL
const api = axios.create({
  baseURL: "http://localhost:8080/api",
  withCredentials: true, // Important for sessions/cookies
  headers: {
    "Content-Type": "application/json",
  },
});

// Auth API calls
export const authAPI = {
  register: (userData) => api.post("/auth/register", userData),
  login: (credentials) => api.post("/auth/login", credentials),
  logout: () => api.post("/auth/logout"),
  getMe: () => api.get("/auth/me"),
};

// Products API calls
export const productsAPI = {
  getAll: () => api.get("/products"),
  getById: (id) => api.get(`/products/${id}`),
  create: (productData) => api.post("/products", productData),
  update: (id, productData) => api.put(`/products/${id}`, productData),
  delete: (id) => api.delete(`/products/${id}`),
};

// Cart API calls
export const cartAPI = {
  getCart: () => api.get("/cart"),
  addToCart: (item) => api.post("/cart", item),
  removeFromCart: (id) => api.delete(`/cart/${id}`),
};

// Orders API calls
export const ordersAPI = {
  createOrder: (orderData) => api.post("/orders", orderData),
  getOrders: () => api.get("/orders"),
};

// News API calls
export const newsAPI = {
  getAll: () => api.get("/news"),
  getById: (id) => api.get(`/news/${id}`),
};

export default api;
