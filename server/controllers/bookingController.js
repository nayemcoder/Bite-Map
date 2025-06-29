// controllers/bookingController.js
const db                    = require("../config/db");
const { constructImageUrl } = require("../utils/helpers");

/**
 * POST /bookings
 * Customer creates one or more bookings (pending status) and notifies the seller.
 */
exports.createBooking = async (req, res) => {
  const customer_id = req.user.id;
  const {
    restaurant_id,
    table_id,
    table_ids,
    booking_date,
    booking_time,
    booking_end_time,
    number_of_people,
    special_requests = null,
    menu_items = []    // [{ id, quantity }]
  } = req.body;

  try {
    // 1) Normalize table IDs
    const tablesRequested = Array.isArray(table_ids) && table_ids.length
      ? table_ids.map(Number)
      : table_id
        ? [Number(table_id)]
        : [];

    // 2) Basic validations
    if (
      !restaurant_id ||
      !booking_date ||
      !booking_time ||
      !booking_end_time ||
      !tablesRequested.length
    ) {
      return res.status(400).json({
        message: "restaurant_id, date/time & ≥1 table_id are required."
      });
    }
    if (booking_end_time <= booking_time) {
      return res.status(400).json({ message: "booking_end_time must be after booking_time." });
    }
    if (!Number.isInteger(number_of_people) || number_of_people < 1) {
      return res.status(400).json({ message: "number_of_people must be a positive integer." });
    }

    // 3) Verify table ownership & capacity
    const [validTables] = await db.query(
      `SELECT id, capacity
         FROM restaurant_tables
        WHERE id IN (?) AND restaurant_id = ?`,
      [tablesRequested, restaurant_id]
    );
    if (validTables.length !== tablesRequested.length) {
      return res.status(404).json({ message: "One or more table IDs invalid." });
    }
    const totalSeats = validTables.reduce((sum, t) => sum + t.capacity, 0);
    if (totalSeats < number_of_people) {
      return res.status(400).json({
        message: `Not enough seats (${totalSeats}) for party of ${number_of_people}.`
      });
    }

    // 4) Conflict check
    const [conflicts] = await db.query(
      `SELECT DISTINCT table_id
         FROM bookings
        WHERE table_id IN (?)
          AND status = 'confirmed'
          AND booking_date = ?
          AND NOT (
               booking_end_time <= ?
            OR booking_time     >= ?
          )`,
      [tablesRequested, booking_date, booking_time, booking_end_time]
    );
    if (conflicts.length) {
      return res.status(409).json({
        message: `Table(s) already booked: ${conflicts.map(r => r.table_id).join(", ")}.`
      });
    }

    // 5) Validate menu_items
    if (!Array.isArray(menu_items)) {
      return res.status(400).json({ message: "menu_items must be an array." });
    }
    const menuIds = menu_items.map(mi => mi.id);
    if (menuIds.length) {
      const [validMenu] = await db.query(
        `SELECT id FROM menu_items
           WHERE id IN (?) AND restaurant_id = ?`,
        [menuIds, restaurant_id]
      );
      if (validMenu.length !== menuIds.length) {
        return res.status(404).json({ message: "Invalid menu_item IDs." });
      }
      for (const { id, quantity } of menu_items) {
        if (!Number.isInteger(quantity) || quantity < 1) {
          return res.status(400).json({ message: `Invalid quantity for menu_item ${id}.` });
        }
      }
    }

    // 6) Lookup restaurant owner
    const [[{ owner_id }]] = await db.query(
      `SELECT owner_id FROM restaurants WHERE id = ?`,
      [restaurant_id]
    );
    if (!owner_id) {
      return res.status(500).json({ message: "Restaurant owner not found." });
    }

    // 7) Insert bookings & notify seller
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      for (const tid of tablesRequested) {
        await conn.query(
          `INSERT INTO bookings
            (customer_id, restaurant_id, table_id,
             booking_date, booking_time, booking_end_time,
             number_of_people, special_requests,
             menu_items, status)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
          [
            customer_id,
            restaurant_id,
            tid,
            booking_date,
            booking_time,
            booking_end_time,
            number_of_people,
            special_requests,
            JSON.stringify(menu_items)
          ]
        );
      }

      await conn.query(
        `INSERT INTO notifications (user_id, message, link)
         VALUES (?, ?, ?)`,
        [
          owner_id,
          `New booking request on ${booking_date} @ ${booking_time}.`,
          "/seller/bookings"
        ]
      );

      await conn.commit();
      res.status(201).json({
        message: "Booking request created (pending).",
        tablesBooked: tablesRequested.length,
        totalSeats
      });
    } catch (err) {
      await conn.rollback();
      console.error("[createBooking] transaction error:", err);
      res.status(500).json({
        message: "Database error while creating booking.",
        error: err.message
      });
    } finally {
      conn.release();
    }
  } catch (err) {
    console.error("[createBooking] Error:", err);
    res.status(500).json({
      message: "Internal server error while creating booking.",
      error: err.message
    });
  }
};


/**
 * GET /customers/bookings  (customer)
 * GET /seller/bookings     (seller)
 * Returns bookings with:
 *  - restaurant_image, restaurant_address, cuisineType
 *  - menu_items: [ {id,name,price,imageUrl,quantity}, … ]
 *  - (for seller) customer_imageUrl
 */
exports.getUserBookings = async (req, res) => {
  try {
    const userId = req.user.id;
    const role   = req.user.role; // 'customer' | 'seller'

    // 1) Fetch raw booking rows, include restaurant metadata
    let sql, params;
    if (role === "customer") {
      sql = `
        SELECT
          b.*,
          r.name            AS restaurant_name,
          r.cover_image     AS restaurant_cover_image,
          r.address         AS restaurant_address,
          r.cuisine_type    AS restaurant_cuisine,
          t.table_number,
          t.capacity
        FROM bookings b
        JOIN restaurants r ON b.restaurant_id = r.id
        JOIN restaurant_tables t ON b.table_id = t.id
        WHERE b.customer_id = ?
        ORDER BY b.created_at DESC
      `;
      params = [userId];
    } else {
      sql = `
        SELECT
          b.*,
          r.name            AS restaurant_name,
          r.cover_image     AS restaurant_cover_image,
          r.address         AS restaurant_address,
          r.cuisine_type    AS restaurant_cuisine,
          u.name            AS customer_name,
          u.email           AS customer_email,
          u.phone           AS customer_phone,
          u.profile_image   AS customer_profile_image,
          t.table_number,
          t.capacity
        FROM bookings b
        JOIN restaurants r ON b.restaurant_id = r.id
        JOIN users u       ON b.customer_id   = u.id
        JOIN restaurant_tables t ON b.table_id = t.id
        WHERE r.owner_id = ?
        ORDER BY b.created_at DESC
      `;
      params = [userId];
    }
    const [rows] = await db.query(sql, params);

    // 2) Enrich each booking
    const enriched = await Promise.all(rows.map(async b => {
      // restaurant image
      const restaurant_image = b.restaurant_cover_image
        ? constructImageUrl(req, b.restaurant_cover_image, "restaurant")
        : null;

      // customer image (for seller)
      let customer_imageUrl = null;
      if (role === "seller" && b.customer_profile_image) {
        customer_imageUrl = constructImageUrl(
          req,
          b.customer_profile_image,
          "user"
        );
      }

      // parse menu_items JSON
      let items = [];
      if (b.menu_items) {
        try {
          items = typeof b.menu_items === "string"
            ? JSON.parse(b.menu_items)
            : b.menu_items;
        } catch {
          items = [];
        }
      }

      // fetch detailed menu item data
      let fullItems = [];
      if (items.length) {
        const ids = items.map(i => i.id);
        const [menuRows] = await db.query(
          `SELECT id, name, price, image_url FROM menu_items WHERE id IN (?)`,
          [ids]
        );
        fullItems = menuRows.map(mi => {
          const { quantity } = items.find(i => i.id === mi.id) || {};
          return {
            id:       mi.id,
            name:     mi.name,
            price:    mi.price,
            quantity: quantity || 0,
            imageUrl: constructImageUrl(req, mi.image_url, "restaurant")
          };
        });
      }

      return {
        ...b,
        restaurant_image,
        restaurant_address: b.restaurant_address,
        cuisineType:        b.restaurant_cuisine,
        customer_imageUrl,
        menu_items: fullItems
      };
    }));

    res.json({ data: enriched });
  } catch (err) {
    console.error("[getUserBookings] Error:", err);
    res.status(500).json({
      message: "Internal server error while fetching bookings."
    });
  }
};


/**
 * PUT /bookings/:id/status
 * Seller updates status; if 'confirmed', notifies customer.
 */
exports.updateBookingStatus = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const { status } = req.body;
    const ownerId   = req.user.id;
    const allowed   = ["pending", "confirmed", "canceled", "completed"];

    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid status." });
    }

    // verify ownership + fetch customer/time
    const [chk] = await db.query(
      `SELECT b.customer_id, b.booking_date, b.booking_time, r.owner_id
         FROM bookings b
         JOIN restaurants r ON b.restaurant_id = r.id
        WHERE b.id = ?`,
      [bookingId]
    );
    if (!chk.length || chk[0].owner_id !== ownerId) {
      return res.status(403).json({ message: "Not authorized." });
    }
    const { customer_id, booking_date, booking_time } = chk[0];

    // cancel => delete
    if (status === "canceled") {
      await db.query(`DELETE FROM bookings WHERE id = ?`, [bookingId]);
      return res.json({ message: "Booking canceled." });
    }

    // update status
    await db.query(
      `UPDATE bookings SET status = ? WHERE id = ?`,
      [status, bookingId]
    );

    // confirmed => notify
    if (status === "confirmed") {
      await db.query(
        `INSERT INTO notifications (user_id, message, link)
         VALUES (?, ?, ?)`,
        [
          customer_id,
          `Your booking on ${booking_date} @ ${booking_time} has been confirmed!`,
          "/profile"
        ]
      );
    }

    res.json({ message: `Booking status updated to ${status}.` });
  } catch (err) {
    console.error("[updateBookingStatus] Error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};


/**
 * DELETE /bookings/:id
 * Customer or seller may delete.
 */
exports.deleteBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const userId    = req.user.id;
    const role      = req.user.role;
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
    if (!result.affectedRows) {
      return res.status(404).json({
        message: "Booking not found or not authorized."
      });
    }
    res.json({ message: "Booking deleted successfully." });
  } catch (err) {
    console.error("[deleteBooking] Error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};