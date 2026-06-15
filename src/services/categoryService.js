import getApiBaseUrl from "../config/api.js";

const API_BASE_URL = getApiBaseUrl();

// Cache keys for localStorage
const CACHE_KEYS = {
  EXPENSE_CATEGORIES: "fintrack_expense_categories",
  GOAL_CATEGORIES: "fintrack_goal_categories",
  LAST_UPDATED: "fintrack_categories_last_updated",
};

// Cache expiration time (5 minutes)
const CACHE_EXPIRY = 5 * 60 * 1000;

class CategoryService {
  // Check if cache is valid
  static isCacheValid() {
    const lastUpdated = localStorage.getItem(CACHE_KEYS.LAST_UPDATED);
    if (!lastUpdated) return false;

    const now = Date.now();
    return now - parseInt(lastUpdated) < CACHE_EXPIRY;
  }

  // Get categories from cache
  static getCachedCategories(type) {
    if (!this.isCacheValid()) return null;

    const cacheKey =
      type === "expense"
        ? CACHE_KEYS.EXPENSE_CATEGORIES
        : CACHE_KEYS.GOAL_CATEGORIES;
    const cached = localStorage.getItem(cacheKey);

    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (error) {
        console.error("Error parsing cached categories:", error);
        return null;
      }
    }
    return null;
  }

  // Cache categories in localStorage
  static cacheCategories(categories) {
    const expenseCategories = categories.filter(
      (cat) => cat.type === "expense",
    );
    const goalCategories = categories.filter((cat) => cat.type === "goal");

    localStorage.setItem(
      CACHE_KEYS.EXPENSE_CATEGORIES,
      JSON.stringify(expenseCategories),
    );
    localStorage.setItem(
      CACHE_KEYS.GOAL_CATEGORIES,
      JSON.stringify(goalCategories),
    );
    localStorage.setItem(CACHE_KEYS.LAST_UPDATED, Date.now().toString());
  }

  // Clear cache
  static clearCache() {
    localStorage.removeItem(CACHE_KEYS.EXPENSE_CATEGORIES);
    localStorage.removeItem(CACHE_KEYS.GOAL_CATEGORIES);
    localStorage.removeItem(CACHE_KEYS.LAST_UPDATED);
  }

  // Make authenticated API request
  static async apiRequest(url, options = {}) {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ error: "Network error" }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Get all categories for user with cache-first approach + background revalidation
  static async getCategories(type = null) {
    try {
      // If type is specified, try cache first
      if (type) {
        const cached = this.getCachedCategories(type);
        if (cached) {
          // Return cached data immediately, but revalidate in background
          this.revalidateCategories();
          return cached;
        }
      }

      // No cache or cache invalid, fetch from API
      const url = type ? `/api/categories?type=${type}` : "/api/categories";
      const response = await this.apiRequest(url);

      // Cache the results
      this.cacheCategories(response.categories);

      // Return requested type or all
      if (type) {
        return response.categories.filter((cat) => cat.type === type);
      }
      return response.categories;
    } catch (error) {
      console.error("Error fetching categories:", error);

      // Fallback to cache even if expired
      if (type) {
        const cached = this.getCachedCategories(type);
        if (cached) {
          console.warn("Using expired cache due to API error");
          return cached;
        }
      }

      throw error;
    }
  }

  // Background revalidation (doesn't block UI)
  static async revalidateCategories() {
    try {
      const response = await this.apiRequest("/api/categories");
      this.cacheCategories(response.categories);
    } catch (error) {
      console.error("Background revalidation failed:", error);
    }
  }

  // Get expense categories with cache + revalidation
  static async getExpenseCategories() {
    return this.getCategories("expense");
  }

  // Get goal categories with cache + revalidation
  static async getGoalCategories() {
    return this.getCategories("goal");
  }

  // Create new category
  static async createCategory(categoryData) {
    try {
      const response = await this.apiRequest("/api/categories", {
        method: "POST",
        body: JSON.stringify(categoryData),
      });

      // Clear cache to force refresh
      this.clearCache();

      return response.category;
    } catch (error) {
      console.error("Error creating category:", error);
      throw error;
    }
  }

  // Update category
  static async updateCategory(categoryId, updates) {
    try {
      const response = await this.apiRequest(`/api/categories/${categoryId}`, {
        method: "PUT",
        body: JSON.stringify(updates),
      });

      // Clear cache to force refresh
      this.clearCache();

      return response.category;
    } catch (error) {
      console.error("Error updating category:", error);
      throw error;
    }
  }

  // Delete category
  static async deleteCategory(categoryId) {
    try {
      await this.apiRequest(`/api/categories/${categoryId}`, {
        method: "DELETE",
      });

      // Clear cache to force refresh
      this.clearCache();

      return true;
    } catch (error) {
      console.error("Error deleting category:", error);
      throw error;
    }
  }

  // Get category by ID (searches cache first)
  static async getCategoryById(categoryId, type = null) {
    try {
      // Try to find in cache first
      if (type) {
        const cached = this.getCachedCategories(type);
        if (cached) {
          const category = cached.find((cat) => cat.id === categoryId);
          if (category) return category;
        }
      }

      // Not in cache, get all categories and search
      const allCategories = await this.getCategories();
      return allCategories.find((cat) => cat.id === categoryId);
    } catch (error) {
      console.error("Error getting category by ID:", error);
      throw error;
    }
  }

  // Initialize default categories for new users
  static async initializeDefaultCategories() {
    try {
      const response = await this.apiRequest("/api/categories/initialize", {
        method: "POST",
        body: JSON.stringify({}),
      });

      // Cache the new categories
      this.cacheCategories(response.categories);

      return response.categories;
    } catch (error) {
      console.error("Error initializing categories:", error);
      throw error;
    }
  }

  // Prepare categories for UI components (map to expected format)
  static formatCategoriesForUI(categories) {
    return categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      icon: cat.icon,
      color: cat.color,
      type: cat.type,
      // Legacy support for existing code
      iconName: cat.icon,
    }));
  }

  // Group categories (for dropdowns/selection)
  static groupCategories(categories) {
    const grouped = {};

    categories.forEach((category) => {
      const type = category.type === "expense" ? "Expenses" : "Goals";
      if (!grouped[type]) {
        grouped[type] = [];
      }
      grouped[type].push(category);
    });

    return grouped;
  }
}

export default CategoryService;
