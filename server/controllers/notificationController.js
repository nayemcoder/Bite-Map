const db = require("../config/db");

// GET /notifications
exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await db.query(
      `SELECT id, message, link, is_read, created_at
         FROM notifications
        WHERE user_id = ?
        ORDER BY created_at DESC`,
      [userId]
    );
    res.json({ data: rows });
  } catch (err) {
    console.error("[getNotifications] Error:", err);
    res.status(500).json({ message: "Failed to load notifications." });
  }
};

// PUT /notifications/:id/read
exports.markRead = async (req, res) => {
  try {
    const userId  = req.user.id;
    const notifId = req.params.id;
    await db.query(
      `UPDATE notifications
          SET is_read = TRUE
        WHERE id = ? AND user_id = ?`,
      [notifId, userId]
    );
    res.json({ message: "Notification marked read." });
  } catch (err) {
    console.error("[markRead] Error:", err);
    res.status(500).json({ message: "Failed to mark notification as read." });
  }
};