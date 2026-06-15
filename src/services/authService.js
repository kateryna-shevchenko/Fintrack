import getApiBaseUrl from "../config/api.js";

const API_BASE_URL = getApiBaseUrl();

class AuthService {
  async register(userData) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(userData),
      });

      // Check if response has content
      const contentType = response.headers.get("content-type");
      let data;

      if (contentType && contentType.includes("application/json")) {
        const text = await response.text();
        data = text ? JSON.parse(text) : {};
      } else {
        data = {};
      }

      if (!response.ok) {
        throw new Error(data.error || data.details || "Registration failed");
      }

      return data;
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  }

  async login(credentials) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(credentials),
      });

      // Check if response has content
      const contentType = response.headers.get("content-type");
      let data;

      if (contentType && contentType.includes("application/json")) {
        const text = await response.text();
        data = text ? JSON.parse(text) : {};
      } else {
        data = {};
      }

      if (!response.ok) {
        throw new Error(data.error || data.details || "Login failed");
      }

      return data;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  }

  async logout() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });

      // Check if response has content
      const contentType = response.headers.get("content-type");
      let data;

      if (contentType && contentType.includes("application/json")) {
        const text = await response.text();
        data = text ? JSON.parse(text) : {};
      } else {
        data = {};
      }

      if (!response.ok) {
        throw new Error(data.error || data.details || "Logout failed");
      }

      return data;
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  }

  async getCurrentUser() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        return null; // User not authenticated
      }

      // Check if response has content
      const contentType = response.headers.get("content-type");
      let data;

      if (contentType && contentType.includes("application/json")) {
        const text = await response.text();
        data = text ? JSON.parse(text) : {};
      } else {
        return null;
      }

      return data.user;
    } catch (error) {
      console.error("Get current user error:", error);
      return null;
    }
  }
}

export default new AuthService();
