const { getPool } = require("../config/database");

class Goal {
  // Get all goals for a specific user
  static async findByUserId(userId) {
    const db = getPool();
    const [rows] = await db.query(
      `SELECT 
        id,
        user_id as userId,
        title as name,
        description,
        target_amount as target,
        current_amount as current,
        target_date as targetDate,
        icon,
        color,
        category_name as categoryName,
        status,
        created_at as createdAt,
        updated_at as updatedAt
      FROM goals 
      WHERE user_id = ? 
      ORDER BY created_at DESC`,
      [userId]
    );
    return rows;
  }

  // Get a single goal by ID
  static async findById(goalId, userId) {
    const db = getPool();
    const [rows] = await db.query(
      `SELECT 
        id,
        user_id as userId,
        title as name,
        description,
        target_amount as target,
        current_amount as current,
        target_date as targetDate,
        icon,
        color,
        category_name as categoryName,
        status,
        created_at as createdAt,
        updated_at as updatedAt
      FROM goals 
      WHERE id = ? AND user_id = ?`,
      [goalId, userId]
    );
    return rows[0];
  }

  // Create a new goal
  static async create(goalData) {
    const db = getPool();
    const {
      userId,
      name,
      description,
      target,
      targetDate,
      icon,
      color,
      categoryName,
      status = "active",
    } = goalData;

    const normalizedIcon =
      typeof icon === "string" && icon.trim() !== "" ? icon.trim() : null;

    const [result] = await db.query(
      `INSERT INTO goals 
        (user_id, title, description, target_amount, target_date, icon, color, category_name, status) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        name,
        description || null,
        target,
        targetDate || null,
        normalizedIcon,
        color || "#a682ff",
        categoryName || null,
        status,
      ]
    );

    return this.findById(result.insertId, userId);
  }

  // Update a goal
  static async update(goalId, userId, updateData) {
    const db = getPool();
    const allowedFields = [
      "title",
      "description",
      "target_amount",
      "current_amount",
      "target_date",
      "icon",
      "color",
      "category_name",
      "status",
    ];

    const updates = [];
    const values = [];

    // Map frontend field names to database column names
    const fieldMap = {
      name: "title",
      target: "target_amount",
      current: "current_amount",
      targetDate: "target_date",
      categoryName: "category_name",
    };

    Object.keys(updateData).forEach((key) => {
      const dbField = fieldMap[key] || key;
      if (allowedFields.includes(dbField)) {
        updates.push(`${dbField} = ?`);
        values.push(updateData[key]);
      }
    });

    if (updates.length === 0) {
      return this.findById(goalId, userId);
    }

    values.push(goalId, userId);

    await db.query(
      `UPDATE goals SET ${updates.join(", ")} WHERE id = ? AND user_id = ?`,
      values
    );

    return this.findById(goalId, userId);
  }

  // Delete a goal
  static async delete(goalId, userId) {
    const db = getPool();
    const [result] = await db.query(
      "DELETE FROM goals WHERE id = ? AND user_id = ?",
      [goalId, userId]
    );
    return result.affectedRows > 0;
  }

  // Add amount to goal's current amount
  static async addAmount(goalId, userId, amount) {
    const db = getPool();
    await db.query(
      `UPDATE goals 
       SET current_amount = current_amount + ? 
       WHERE id = ? AND user_id = ?`,
      [amount, goalId, userId]
    );

    return this.findById(goalId, userId);
  }
}

module.exports = Goal;
