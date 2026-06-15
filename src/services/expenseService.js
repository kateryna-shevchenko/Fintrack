import getApiBaseUrl from "../config/api.js";

const API_URL = getApiBaseUrl();

// Get all expenses with optional filtering
export const getExpenses = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    if (filters.month !== undefined && filters.month !== null) {
      params.append("month", filters.month);
    }
    if (filters.year) {
      params.append("year", filters.year);
    }
    if (filters.category) {
      params.append("category", filters.category);
    }

    const url = `${API_URL}/api/expenses${
      params.toString() ? `?${params.toString()}` : ""
    }`;

    const response = await fetch(url, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.json();
      const errorMessage = error.error || "Failed to fetch expenses";
      const errorObj = new Error(errorMessage);
      errorObj.status = response.status;
      throw errorObj;
    }

    const data = await response.json();
    return data.expenses;
  } catch (error) {
    console.error("Error fetching expenses:", error);
    throw error;
  }
};

// Get expense statistics grouped by category
export const getExpenseStats = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    if (filters.month !== undefined && filters.month !== null) {
      params.append("month", filters.month);
    }
    if (filters.year) {
      params.append("year", filters.year);
    }

    const url = `${API_URL}/api/expenses/stats${
      params.toString() ? `?${params.toString()}` : ""
    }`;

    const response = await fetch(url, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.json();
      const errorMessage = error.error || "Failed to fetch expense stats";
      const errorObj = new Error(errorMessage);
      errorObj.status = response.status;
      throw errorObj;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching expense stats:", error);
    throw error;
  }
};

// Get available months that have expenses
export const getAvailableMonths = async () => {
  try {
    const response = await fetch(`${API_URL}/api/expenses/available-months`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.json();
      const errorMessage = error.error || "Failed to fetch available months";
      const errorObj = new Error(errorMessage);
      errorObj.status = response.status;
      throw errorObj;
    }

    const data = await response.json();
    return data.months;
  } catch (error) {
    console.error("Error fetching available months:", error);
    throw error;
  }
};
