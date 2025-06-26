const db = require("../config/db");

// ADD or UPDATE a review
exports.addReview = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const userId = req.user.id;
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ message: "Rating must be an integer between 1 and 5." });
    }

    // Insert new or update existing review
    await db.query(
      `INSERT INTO reviews (user_id, restaurant_id, rating, comment)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY
         UPDATE rating = VALUES(rating),
                comment = VALUES(comment),
                created_at = CURRENT_TIMESTAMP`,
      [userId, restaurantId, rating, comment]
    );

    res.status(201).json({ message: "Review submitted successfully." });
  } catch (err) {
    console.error("Error adding review:", err);
    res
      .status(500)
      .json({ message: "Database error", error: err.message });
  }
};

// GET reviews + summary (avg & count) for a restaurant
exports.getReviews = async (req, res) => {
  try {
    const { restaurantId } = req.params;

    // 1) Fetch aggregate stats
    const [[stats]] = await db.query(
      `SELECT
         COALESCE(ROUND(AVG(rating), 2), 0) AS avg_rating,
         COUNT(*)                       AS review_count
       FROM reviews
       WHERE restaurant_id = ?`,
      [restaurantId]
    );

    // 2) Fetch individual reviews
    const [reviews] = await db.query(
      `SELECT
         r.id,
         u.name      AS user_name,
         r.rating,
         r.comment,
         r.created_at
       FROM reviews r
       JOIN users   u ON r.user_id = u.id
       WHERE r.restaurant_id = ?
       ORDER BY r.created_at DESC`,
      [restaurantId]
    );

    // 3) Return combined payload
    res.json({
      summary: {
        avg_rating:   parseFloat(stats.avg_rating),
        review_count: stats.review_count,
      },
      reviews,
    });
  } catch (err) {
    console.error("Error fetching reviews:", err);
    res
      .status(500)
      .json({ message: "Database error", error: err.message });
  }
};