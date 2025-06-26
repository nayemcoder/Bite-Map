// controllers/bookingController.js
const db = require("../config/db");

// Create Booking (customer only)
exports.createBooking = async (req, res) => {
  try {
    const {
      restaurant_id,
      table_id,
      booking_date,
      booking_time,
      booking_end_time,
      number_of_people,
      special_requests = null
    } = req.body;
    const customer_id = req.user.id;

    if (
      !restaurant_id ||
      !table_id ||
      !booking_date ||
      !booking_time ||
      !booking_end_time
    ) {
      return res.status(400).json({
        message:
          "restaurant_id, table_id, booking_date, booking_time & booking_end_time are required."
      });
    }
    if (booking_end_time <= booking_time) {
      return res.status(400).json({
        message: "booking_end_time must be after booking_time."
      });
    }

    // Verify the table exists and belongs to the restaurant
    const [tableChk] = await db.query(
      `SELECT 1
         FROM restaurant_tables t
        WHERE t.id = ? AND t.restaurant_id = ?`,
      [table_id, restaurant_id]
    );
    if (!tableChk.length) {
      return res.status(404).json({
        message: "Table not found in that restaurant."
      });
    }

    // Conflict check (same table/date, status=confirmed, overlapping)
    const [conflicts] = await db.query(
      `SELECT 1
         FROM bookings b
        WHERE b.table_id     = ?
          AND b.booking_date = ?
          AND b.status       = 'confirmed'
          AND NOT (
               b.booking_end_time <= ?
            OR b.booking_time     >= ?
          )`,
      [table_id, booking_date, booking_time, booking_end_time]
    );
    if (conflicts.length) {
      return res.status(409).json({
        message: "That table is already booked for the requested date/time."
      });
    }

    // Insert booking as pending
    const [result] = await db.query(
      `INSERT INTO bookings
        (customer_id, restaurant_id, table_id,
         booking_date, booking_time, booking_end_time,
         number_of_people, special_requests)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        customer_id,
        restaurant_id,
        table_id,
        booking_date,
        booking_time,
        booking_end_time,
        number_of_people,
        special_requests
      ]
    );

    res.status(201).json({
      message: "Booking created successfully",
      bookingId: result.insertId
    });
  } catch (err) {
    console.error("[createBooking] Error:", err);
    res.status(500).json({
      message: "Internal server error while creating booking."
    });
  }
};

// Get bookings for current user (customer or seller)
exports.getUserBookings = async (req, res) => {
  try {
    const userId = req.user.id;
    const role   = req.user.role; // 'customer'|'seller'
    let sql, params;

    if (role === "customer") {
      sql = `
        SELECT
          b.id,
          b.restaurant_id,
          b.booking_date,
          b.booking_time,
          b.booking_end_time,
          b.number_of_people,
          b.special_requests,
          b.status,
          r.name   AS restaurant_name,
          t.table_number,
          t.capacity
        FROM bookings b
        JOIN restaurants       r ON b.restaurant_id = r.id
        JOIN restaurant_tables t ON b.table_id      = t.id
        WHERE b.customer_id = ?
        ORDER BY b.created_at DESC
      `;
      params = [userId];
    } else {
      sql = `
        SELECT
          b.id,
          b.restaurant_id,
          b.booking_date,
          b.booking_time,
          b.booking_end_time,
          b.number_of_people,
          b.special_requests,
          b.status,
          u.name   AS customer_name,
          u.email  AS customer_email,
          u.phone  AS customer_phone,
          t.table_number,
          t.capacity
        FROM bookings b
        JOIN restaurants       r ON b.restaurant_id = r.id
        JOIN users             u ON b.customer_id   = u.id
        JOIN restaurant_tables t ON b.table_id      = t.id
        WHERE r.owner_id = ?
        ORDER BY b.created_at DESC
      `;
      params = [userId];
    }

    const [rows] = await db.query(sql, params);
    res.json({ data: rows });
  } catch (err) {
    console.error("[getUserBookings] Error:", err);
    res.status(500).json({
      message: "Internal server error while fetching bookings."
    });
  }
};

// Update booking status (seller only)
exports.updateBookingStatus = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const { status } = req.body;
    const ownerId   = req.user.id;
    const allowed   = ["pending", "confirmed", "canceled", "completed"];

    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid status." });
    }

    // Verify ownership
    const [chk] = await db.query(
      `SELECT 1
         FROM bookings b
         JOIN restaurants r ON b.restaurant_id = r.id
        WHERE b.id = ? AND r.owner_id = ?`,
      [bookingId, ownerId]
    );
    if (!chk.length) {
      return res.status(403).json({ message: "Not authorized." });
    }

    // If canceling, delete
    if (status === "canceled") {
      await db.query(`DELETE FROM bookings WHERE id = ?`, [bookingId]);
      return res.json({ message: "Booking canceled and deleted." });
    }

    // Otherwise update status
    await db.query(
      `UPDATE bookings SET status = ? WHERE id = ?`,
      [status, bookingId]
    );
    res.json({ message: "Booking status updated." });
  } catch (err) {
    console.error("[updateBookingStatus] Error:", err);
    res.status(500).json({
      message: "Internal server error while updating booking status."
    });
  }
};

// Delete a booking (customer or seller)
exports.deleteBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const userId    = req.user.id;
    const role      = req.user.role; // 'customer'|'seller'
    let sql, params;

    if (role === "customer") {
      sql    = `DELETE FROM bookings WHERE id = ? AND customer_id = ?`;
      params = [bookingId, userId];
    } else {
      sql = `
        DELETE b
          FROM bookings b
          JOIN restaurants r ON b.restaurant_id = r.id
        WHERE b.id = ? AND r.owner_id = ?
      `;
      params = [bookingId, userId];
    }

    const [result] = await db.query(sql, params);
    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Booking not found or you are not authorized to delete it."
      });
    }

    res.json({ message: "Booking deleted successfully." });
  } catch (err) {
    console.error("[deleteBooking] Error:", err);
    res.status(500).json({
      message: "Internal server error while deleting booking."
    });
  }
};