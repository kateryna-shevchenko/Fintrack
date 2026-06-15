import getApiBaseUrl from "../config/api.js";

const API_URL = getApiBaseUrl();

// Get current balance for logged-in user
export const getBalance = async () => {
  try {
    const response = await fetch(`${API_URL}/api/balance`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to fetch balance");
    }

    const data = await response.json();
    return data.balance;
  } catch (error) {
    console.error("Error fetching balance:", error);
    throw error;
  }
};
