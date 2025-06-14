// controllers/bookingController.js
const db = require("../config/db");

// Create Booking (customer only)
exports.createBooking = async (req, res) => {
  try {
    const {
      restaurant_id,
      booking_date,
      booking_time,
      number_of_people,
      special_requests = null
    } = req.body;
    const customer_id = req.user.id;

    // verify restaurant exists
    const [chk] = await db.query(
      `SELECT id FROM restaurants WHERE id = ?`,
      [restaurant_id]
    );
    if (!chk.length) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    const [result] = await db.query(
      `INSERT INTO bookings
         (customer_id, restaurant_id, booking_date, booking_time, number_of_people, special_requests)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        customer_id,
        restaurant_id,
        booking_date,
        booking_time,
        number_of_people,
        special_requests
      ]
    );

    res.status(201).json({
      message: "Booking created successfully",
      bookingId: result.insertId
    });
  } catch (err) {
    console.error("Error creating booking:", err);
    res.status(500).json({
      message: "Internal server error while creating booking"
    });
  }
};

// Get current user's bookings (customer or seller)
exports.getUserBookings = async (req, res) => {
  const userId = req.user.id;
  const role   = req.user.role; // 'customer' or 'seller'

  try {
    let sql, params;
    if (role === "customer") {
      sql = `
        SELECT
          b.id,
          b.booking_date,
          b.booking_time,
          b.number_of_people,
          b.special_requests,
          b.status,
          r.name   AS restaurant_name,
          r.address AS restaurant_address
        FROM bookings b
        JOIN restaurants r ON b.restaurant_id = r.id
        WHERE b.customer_id = ?
        ORDER BY b.created_at DESC
      `;
      params = [userId];
    } else {
      // seller sees bookings for their one restaurant
      sql = `
        SELECT
          b.id,
          b.booking_date,
          b.booking_time,
          b.number_of_people,
          b.special_requests,
          b.status,
          u.name  AS customer_name,
          u.email AS customer_email,
          u.phone AS customer_phone
        FROM bookings b
        JOIN restaurants r ON b.restaurant_id = r.id
        JOIN users u       ON b.customer_id = u.id
        WHERE r.owner_id = ?
        ORDER BY b.created_at DESC
      `;
      params = [userId];
    }

    const [rows] = await db.query(sql, params);
    res.json({ data: rows });
  } catch (err) {
    console.error("Error fetching bookings:", err);
    res.status(500).json({
      message: "Internal server error while fetching bookings"
    });
  }
};

// Seller-only: get bookings for their single restaurant
exports.getMyRestaurantBookings = exports.getUserBookings;

// Update booking status (seller only)
exports.updateBookingStatus = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const { status } = req.body; // expected 'pending'|'confirmed'|'canceled'|'completed'
    const ownerId    = req.user.id;

    // ensure this booking belongs to this seller
    const [chk] = await db.query(
      `SELECT b.id
         FROM bookings b
         JOIN restaurants r ON b.restaurant_id = r.id
        WHERE b.id = ? AND r.owner_id = ?`,
      [bookingId, ownerId]
    );
    if (!chk.length) {
      return res.status(403).json({
        message: "Unauthorized to update this booking"
      });
    }

    await db.query(
      `UPDATE bookings SET status = ? WHERE id = ?`,
      [status, bookingId]
    );

    res.json({ message: "Booking status updated successfully" });
  } catch (err) {
    console.error("Error updating booking status:", err);
    res.status(500).json({
      message: "Internal server error while updating booking status"
    });
  }
};