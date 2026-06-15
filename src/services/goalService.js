import getApiBaseUrl from "../config/api.js";

const API_URL = getApiBaseUrl();

// Get all goals for the logged-in user
export const getGoals = async () => {
  try {
    const response = await fetch(`${API_URL}/api/goals`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.json();
      const errorMessage = error.error || "Failed to fetch goals";
      const errorObj = new Error(errorMessage);
      errorObj.status = response.status;
      throw errorObj;
    }

    const data = await response.json();
    return data.goals;
  } catch (error) {
    console.error("Error fetching goals:", error);
    throw error;
  }
};

// Get a single goal by ID
export const getGoalById = async (id) => {
  try {
    const response = await fetch(`${API_URL}/api/goals/${id}`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.json();
      const errorMessage = error.error || "Failed to fetch goal";
      const errorObj = new Error(errorMessage);
      errorObj.status = response.status;
      throw errorObj;
    }

    const data = await response.json();
    return data.goal;
  } catch (error) {
    console.error("Error fetching goal:", error);
    throw error;
  }
};

// Create a new goal
export const createGoal = async (goalData) => {
  try {
    const response = await fetch(`${API_URL}/api/goals`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(goalData),
    });

    if (!response.ok) {
      const error = await response.json();
      const errorMessage = error.error || "Failed to create goal";
      const errorObj = new Error(errorMessage);
      errorObj.status = response.status;
      throw errorObj;
    }

    const data = await response.json();
    return data.goal;
  } catch (error) {
    console.error("Error creating goal:", error);
    throw error;
  }
};

// Update a goal
export const updateGoal = async (id, updateData) => {
  try {
    const response = await fetch(`${API_URL}/api/goals/${id}`, {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      const error = await response.json();
      const errorMessage = error.error || "Failed to update goal";
      const errorObj = new Error(errorMessage);
      errorObj.status = response.status;
      throw errorObj;
    }

    const data = await response.json();
    return data.goal;
  } catch (error) {
    console.error("Error updating goal:", error);
    throw error;
  }
};

// Add amount to a goal
export const addAmountToGoal = async (id, amount) => {
  try {
    const response = await fetch(`${API_URL}/api/goals/${id}/add-amount`, {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ amount }),
    });

    if (!response.ok) {
      const error = await response.json();
      const errorMessage = error.error || "Failed to add amount to goal";
      const errorObj = new Error(errorMessage);
      errorObj.status = response.status;
      throw errorObj;
    }

    const data = await response.json();
    return data.goal;
  } catch (error) {
    console.error("Error adding amount to goal:", error);
    throw error;
  }
};

// Delete a goal
export const deleteGoal = async (id) => {
  try {
    const response = await fetch(`${API_URL}/api/goals/${id}`, {
      method: "DELETE",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.json();
      const errorMessage = error.error || "Failed to delete goal";
      const errorObj = new Error(errorMessage);
      errorObj.status = response.status;
      throw errorObj;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error deleting goal:", error);
    throw error;
  }
};
