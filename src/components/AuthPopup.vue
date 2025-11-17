<template>
  <Teleport to="body">
    <div v-if="isOpen" class="popup-overlay" @click.self="closePopup">
      <div class="auth-popup">
        <div class="header">
          <h2>Welcome</h2>
          <button class="close-btn" @click="closePopup">×</button>
        </div>
        <div class="tabs">
          <button
            :class="{ active: activeTab === 'login' }"
            @click="activeTab = 'login'"
            class="tab-btn"
          >
            Log in
          </button>
          <button
            :class="{ active: activeTab === 'signup' }"
            @click="activeTab = 'signup'"
            class="tab-btn"
          >
            Sign up
          </button>
        </div>

        <!-- Error Message -->
        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>

        <!-- Success Message -->
        <div v-if="successMessage" class="success-message">
          {{ successMessage }}
        </div>

        <form @submit.prevent="handleSubmit">
          <!-- Login Form -->
          <div v-if="activeTab === 'login'" class="tab-content">
            <input
              type="email"
              v-model="loginEmail"
              placeholder="Please enter your email"
              required
              class="input-field"
              :disabled="isLoading"
            />
            <div class="password-input">
              <input
                :type="loginPasswordVisible ? 'text' : 'password'"
                v-model="loginPassword"
                placeholder="Please enter your password"
                required
                class="input-field"
                :disabled="isLoading"
              />
              <button
                type="button"
                class="toggle-password"
                @click="loginPasswordVisible = !loginPasswordVisible"
              >
                <span v-if="loginPasswordVisible">🙈</span>
                <span v-else>👁️</span>
              </button>
            </div>
            <label class="checkbox-label">
              <input
                type="checkbox"
                v-model="rememberMe"
                :disabled="isLoading"
              />
              Remember me
            </label>

            <button
              type="submit"
              class="submit-btn orange-btn"
              :disabled="isLoading"
            >
              {{ isLoading ? "LOGGING IN..." : "LOGIN" }}
            </button>

            <p class="switch-text">
              Don't have an account?
              <a href="#" @click.prevent="switchTab('signup')">Sign up</a>
            </p>
          </div>

          <!-- Sign Up Form -->
          <div v-if="activeTab === 'signup'" class="tab-content">
            <input
              type="text"
              v-model="signupName"
              placeholder="Please enter your full name"
              required
              class="input-field"
              :disabled="isLoading"
            />
            <input
              type="email"
              v-model="signupEmail"
              placeholder="Please enter your email"
              required
              class="input-field"
              :disabled="isLoading"
            />
            <div class="password-input">
              <input
                :type="signupPasswordVisible ? 'text' : 'password'"
                v-model="signupPassword"
                placeholder="Please enter your password (min 8 characters)"
                minlength="8"
                required
                class="input-field"
                :disabled="isLoading"
              />
              <button
                type="button"
                class="toggle-password"
                @click="signupPasswordVisible = !signupPasswordVisible"
              >
                <span v-if="signupPasswordVisible">🙈</span>
                <span v-else>👁️</span>
              </button>
            </div>
            <label class="checkbox-label terms">
              <input
                type="checkbox"
                v-model="agreeTerms"
                required
                :disabled="isLoading"
              />
              By creating and/or using your account, you agree to our
              <a href="#" target="_blank" rel="noopener">Terms of Use</a> and
              <a href="#" target="_blank" rel="noopener">Privacy Policy</a>.
            </label>

            <button
              type="submit"
              class="submit-btn orange-btn"
              :disabled="isLoading"
            >
              {{ isLoading ? "SIGNING UP..." : "SIGN UP" }}
            </button>

            <p class="switch-text">
              Already have an account?
              <a href="#" @click.prevent="switchTab('login')">Log in Now</a>
            </p>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<script>
import { authAPI } from "../services/api";

export default {
  name: "AuthPopup",
  props: {
    isOpen: {
      type: Boolean,
      default: false,
    },
    initialTab: {
      type: String,
      default: "login",
    },
  },
  emits: ["close", "login-success", "signup-success"],
  data() {
    return {
      activeTab: this.initialTab,
      loginEmail: "",
      loginPassword: "",
      loginPasswordVisible: false,
      rememberMe: true,
      signupName: "",
      signupEmail: "",
      signupPassword: "",
      signupPasswordVisible: false,
      agreeTerms: false,
      isLoading: false,
      errorMessage: "",
      successMessage: "",
    };
  },
  watch: {
    initialTab(newVal) {
      this.activeTab = newVal;
    },
    isOpen(newVal) {
      if (newVal) {
        document.body.style.overflow = "hidden";
        // Reset messages when popup opens
        this.errorMessage = "";
        this.successMessage = "";
      } else {
        document.body.style.overflow = "";
      }
    },
    activeTab() {
      // Clear messages when switching tabs
      this.errorMessage = "";
      this.successMessage = "";
    },
  },
  beforeUnmount() {
    document.body.style.overflow = "";
  },
  methods: {
    closePopup() {
      this.$emit("close");
      // Reset form fields
      this.resetForm();
    },

    resetForm() {
      this.loginEmail = "";
      this.loginPassword = "";
      this.signupName = "";
      this.signupEmail = "";
      this.signupPassword = "";
      this.agreeTerms = false;
      this.errorMessage = "";
      this.successMessage = "";
      this.isLoading = false;
    },

    switchTab(tab) {
      this.activeTab = tab;
      this.errorMessage = "";
      this.successMessage = "";
    },

    async handleSubmit() {
      if (this.activeTab === "login") {
        await this.handleLogin();
      } else {
        await this.handleSignup();
      }
    },

    async handleLogin() {
      this.isLoading = true;
      this.errorMessage = "";
      this.successMessage = "";

      try {
        const response = await authAPI.login({
          email: this.loginEmail,
          password: this.loginPassword,
        });

        // Login successful
        this.successMessage = "Login successful! Welcome back!";

        // Emit success event with user data
        this.$emit("login-success", response.data.user);

        // Close popup after short delay
        setTimeout(() => {
          this.closePopup();
        }, 1000);
      } catch (error) {
        console.error("Login error:", error);

        // Handle different error scenarios
        if (error.response) {
          // Server responded with error
          if (error.response.status === 401) {
            this.errorMessage = "Invalid email or password. Please try again.";
          } else if (error.response.status === 500) {
            this.errorMessage = "Server error. Please try again later.";
          } else {
            this.errorMessage =
              error.response.data.error || "Login failed. Please try again.";
          }
        } else if (error.request) {
          // Request made but no response
          this.errorMessage =
            "Cannot connect to server. Please check your connection.";
        } else {
          // Something else happened
          this.errorMessage = "An unexpected error occurred. Please try again.";
        }
      } finally {
        this.isLoading = false;
      }
    },

    async handleSignup() {
      // Validate password length
      if (this.signupPassword.length < 8) {
        this.errorMessage = "Password must be at least 8 characters long.";
        return;
      }

      // Validate terms agreement
      if (!this.agreeTerms) {
        this.errorMessage =
          "Please agree to the Terms of Use and Privacy Policy.";
        return;
      }

      this.isLoading = true;
      this.errorMessage = "";
      this.successMessage = "";

      try {
        const response = await authAPI.register({
          email: this.signupEmail,
          password: this.signupPassword,
          name: this.signupName,
        });

        // Signup successful
        this.successMessage =
          "Account created successfully! You can now log in.";

        // Emit success event
        this.$emit("signup-success", response.data.user);

        // Switch to login tab after delay
        setTimeout(() => {
          this.activeTab = "login";
          this.loginEmail = this.signupEmail;
          this.successMessage = "Please log in with your new account.";
        }, 1500);
      } catch (error) {
        console.error("Signup error:", error);

        // Handle different error scenarios
        if (error.response) {
          if (error.response.status === 400) {
            this.errorMessage =
              error.response.data.error ||
              "User already exists with this email.";
          } else if (error.response.status === 500) {
            this.errorMessage = "Server error. Please try again later.";
          } else {
            this.errorMessage =
              error.response.data.error || "Signup failed. Please try again.";
          }
        } else if (error.request) {
          this.errorMessage =
            "Cannot connect to server. Please check your connection.";
        } else {
          this.errorMessage = "An unexpected error occurred. Please try again.";
        }
      } finally {
        this.isLoading = false;
      }
    },

    handleGoogleLogin() {
      // Google OAuth is not implemented in backend yet
      this.errorMessage = "Google login is coming soon!";
      console.log("Google login clicked - Not implemented yet");
    },
  },
};
</script>

<style scoped>
.popup-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  padding: 16px;
}

.auth-popup {
  width: 480px;
  max-width: 100%;
  background: #fff;
  border-radius: 20px;
  padding: 24px 32px 32px;
  font-family: Arial, sans-serif;
  color: #111827;
  box-shadow: 0px 4px 20px rgba(207, 207, 214, 0.75);
  position: relative;
  max-height: 90vh;
  overflow-y: auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header h2 {
  margin: 0;
  font-weight: 700;
  font-size: 24px;
  line-height: 32px;
}

.close-btn {
  background: transparent;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #6b7280;
  font-weight: 700;
  line-height: 10px;
  transition: color 0.2s;
}

.close-btn:hover {
  color: #111827;
}

.tabs {
  display: flex;
  margin-top: 20px;
  border-bottom: 1px solid #d1d5db;
}

.tab-btn {
  flex: 1;
  padding: 12px 0;
  background: none;
  border: none;
  font-weight: 400;
  font-size: 14px;
  color: #9ca3af;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.3s ease;
}

.tab-btn.active {
  font-weight: 600;
  color: #111827;
  border-bottom-color: #f97316;
}

/* Error and Success Messages */
.error-message,
.success-message {
  margin-top: 16px;
  padding: 12px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  text-align: center;
}

.error-message {
  background-color: #fee2e2;
  color: #dc2626;
  border: 1px solid #fecaca;
}

.success-message {
  background-color: #d1fae5;
  color: #059669;
  border: 1px solid #a7f3d0;
}

form {
  margin-top: 20px;
}

.input-field {
  width: 100%;
  padding: 12px 16px;
  margin-bottom: 12px;
  font-weight: 400;
  font-size: 14px;
  color: #6b7280;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.2s;
}

.input-field:focus {
  border-color: #f97316;
}

.input-field:disabled {
  background-color: #f3f4f6;
  cursor: not-allowed;
  opacity: 0.6;
}

.password-input {
  position: relative;
  margin-bottom: 12px;
}

.password-input .input-field {
  margin-bottom: 0;
  padding-right: 45px;
}

.toggle-password {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 16px;
  color: #9ca3af;
  transition: color 0.2s;
}

.toggle-password:hover {
  color: #6b7280;
}

.checkbox-label {
  display: flex;
  align-items: center;
  font-weight: 400;
  font-size: 14px;
  color: #374151;
  margin-bottom: 20px;
  user-select: none;
}

.checkbox-label input[type="checkbox"] {
  margin-right: 8px;
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: #2563eb;
}

.checkbox-label input[type="checkbox"]:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.checkbox-label.terms {
  font-size: 12px;
  color: #6b7280;
  align-items: flex-start;
}

.checkbox-label.terms input[type="checkbox"] {
  margin-top: 2px;
  flex-shrink: 0;
}

.checkbox-label.terms a {
  color: #2563eb;
  text-decoration: none;
}

.checkbox-label.terms a:hover {
  text-decoration: underline;
}

.submit-btn {
  width: 100%;
  padding: 14px 0;
  border-radius: 12px;
  border: none;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  letter-spacing: 0.04em;
  transition: background-color 0.2s, opacity 0.2s;
}

.submit-btn:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.orange-btn {
  background-color: #f97316;
  color: white;
}

.orange-btn:hover:not(:disabled) {
  background-color: #ea580c;
}

.switch-text {
  text-align: center;
  font-weight: 400;
  font-size: 12px;
  color: #6b7280;
  margin-top: 12px;
}

.switch-text a {
  color: #2563eb;
  cursor: pointer;
  text-decoration: none;
  font-weight: 600;
}

.switch-text a:hover {
  text-decoration: underline;
}

.or-separator {
  margin: 24px 0 16px;
  font-size: 12px;
  font-weight: 500;
  color: #9ca3af;
  text-align: center;
  position: relative;
}

.or-separator::before,
.or-separator::after {
  content: "";
  position: absolute;
  top: 50%;
  width: 40%;
  height: 1px;
  background: #e5e7eb;
}

.or-separator::before {
  left: 0;
}

.or-separator::after {
  right: 0;
}

.google-btn {
  width: 100%;
  padding: 8px 0;
  border-radius: 10px;
  border: 1px solid #d1d5db;
  background: white;
  font-weight: 600;
  font-size: 14px;
  color: #6366f1;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  box-sizing: border-box;
  transition: background-color 0.2s;
}

.google-btn:hover {
  background-color: #f9fafb;
}

.google-logo {
  height: 18px;
  width: 18px;
}

@media (max-width: 480px) {
  .auth-popup {
    padding: 20px 24px 24px;
  }
}
</style>
