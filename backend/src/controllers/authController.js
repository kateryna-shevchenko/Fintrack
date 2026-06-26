const User = require("../models/User");
const { getPool } = require("../config/database");
const crypto = require("crypto");
const { sendPasswordResetEmail } = require("../services/emailService");

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        error: "All fields are required",
        details: "Name, email, and password must be provided",
      });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: "Invalid email format",
      });
    }

    // Password strength validation
    if (password.length < 6) {
      return res.status(400).json({
        error: "Password must be at least 6 characters long",
      });
    }

    // Check password complexity
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(
      password,
    );

    if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
      return res.status(400).json({
        error:
          "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
        details:
          "Required: A-Z, a-z, 0-9, and special characters (!@#$%^&* etc.)",
      });
    }

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        error: "User already exists",
        details: "An account with this email address already exists",
      });
    }

    // Create new user
    const newUser = await User.create({
      name,
      email,
      password,
    });

    console.log("User registered successfully:", {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
    });

    // Create default categories for new user
    try {
      const db = getPool();
      const defaultCategories = [
        // Expense categories
        [newUser.id, "Food & Dining", "#e74c3c", "utensils", "expense"],
        [newUser.id, "Transportation", "#3498db", "car", "expense"],
        [newUser.id, "Shopping", "#9b59b6", "shopping-bag", "expense"],
        [newUser.id, "Entertainment", "#f39c12", "film", "expense"],
        [
          newUser.id,
          "Bills & Utilities",
          "#34495e",
          "receipt-percent",
          "expense",
        ],
        [newUser.id, "Health & Medical", "#e67e22", "heart", "expense"],
        [newUser.id, "Education", "#27ae60", "academic-cap", "expense"],
        [newUser.id, "Travel", "#16a085", "airplane", "expense"],
        [newUser.id, "Personal Care", "#8e44ad", "sparkles", "expense"],
        [newUser.id, "Other", "#95a5a6", "ellipsis-horizontal", "expense"],
        // Goal categories
        [newUser.id, "Emergency Fund", "#e74c3c", "shield-check", "goal"],
        [newUser.id, "Vacation", "#3498db", "airplane", "goal"],
        [newUser.id, "Home", "#27ae60", "home", "goal"],
        [newUser.id, "Car", "#f39c12", "car", "goal"],
        [newUser.id, "Education", "#9b59b6", "academic-cap", "goal"],
        [newUser.id, "Investment", "#34495e", "chart-bar", "goal"],
        [newUser.id, "Health", "#e67e22", "heart", "goal"],
        [newUser.id, "Technology", "#16a085", "computer-desktop", "goal"],
        [newUser.id, "Other", "#95a5a6", "star", "goal"],
      ];

      await db.query(
        "INSERT INTO categories (user_id, name, color, icon, type) VALUES ?",
        [defaultCategories],
      );

      console.log("Default categories created for user:", newUser.id);
    } catch (categoryError) {
      console.error("Error creating default categories:", categoryError);
    
    }

    console.log("Email verification would be sent to:", email);

    res.status(201).json({
      message: "User registered successfully",
      user: newUser.toJSON(),
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      error: "Registration failed",
      details: "An internal server error occurred",
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required",
      });
    }

    // Find user by email
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        error: "Invalid credentials",
        details: "Email or password is incorrect",
      });
    }

    // Validate password
    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: "Invalid credentials",
        details: "Email or password is incorrect",
      });
    }

    // Update last login
    await user.updateLastLogin();

    // Set session
    req.session.userId = user.id;
    req.session.user = user.toJSON();

    console.log("User logged in successfully:", {
      id: user.id,
      name: user.name,
      email: user.email,
    });

    res.json({
      message: "Login successful",
      user: user.toJSON(),
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      error: "Login failed",
      details: "An internal server error occurred",
    });
  }
};

const logout = async (req, res) => {
  try {
    req.session.destroy((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({
          error: "Logout failed",
          details: "Could not destroy session",
        });
      }

      res.clearCookie("connect.sid");
      res.json({
        message: "Logout successful",
      });
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      error: "Logout failed",
      details: "An internal server error occurred",
    });
  }
};

const getCurrentUser = async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({
        error: "Not authenticated",
        details: "No active session found",
      });
    }

    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(404).json({
        error: "User not found",
        details: "User associated with session no longer exists",
      });
    }

    res.json({
      user: user.toJSON(),
    });
  } catch (error) {
    console.error("Get current user error:", error);
    res.status(500).json({
      error: "Failed to get user",
      details: "An internal server error occurred",
    });
  }
};

// Request password reset
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const user = await User.findByEmail(email);
    if (!user) {
   
      return res.json({
        message:
          "If an account with that email exists, a reset link has been sent.",
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    // Save token to database
    await User.setResetToken(user.id, resetToken, resetExpires);

    
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const resetLink = `${frontendUrl}/reset-password/${resetToken}`;

    // Send email using MailHog
    await sendPasswordResetEmail(user.email, resetLink, user.name);

    res.json({
      message:
        "If an account with that email exists, a reset link has been sent.",
      emailSent: true,
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ error: "Failed to process request" });
  }
};

// Reset password
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    if (!password || !confirmPassword) {
      return res
        .status(400)
        .json({ error: "Password and confirmation are required" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters" });
    }

    // Find user by reset token
    const user = await User.findByResetToken(token);
    if (!user) {
      return res.status(400).json({ error: "Invalid or expired reset token" });
    }

    // Update password and clear reset token
    await User.resetPassword(user.id, password);

    res.json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ error: "Failed to reset password" });
  }
};

module.exports = {
  register,
  login,
  logout,
  getCurrentUser,
  forgotPassword,
  resetPassword,
};
