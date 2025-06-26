// controllers/restaurantController.js
const db = require("../config/db");
const { constructImageUrl } = require("../utils/helpers");

// ─── RESTAURANT CRUD ────────────────────────────────────────────────

// GET all restaurants, with dynamic avgRating & reviewCount
exports.getAllRestaurants = async (req, res) => {
  try {
    const [rows] = await db.query(
      `
      SELECT
        r.id,
        r.name,
        r.description,
        r.address,
        r.contact_phone,
        r.email,
        r.cover_image,
        r.cuisine_type,
        r.map            AS mapEmbedHtml,
        u.name           AS seller_name,
        COALESCE(stats.rev_avg,   0) AS avg_rating,
        COALESCE(stats.rev_count, 0) AS review_count
      FROM restaurants r
      JOIN users u 
        ON r.owner_id = u.id
      LEFT JOIN (
        SELECT
          restaurant_id,
          AVG(rating) AS rev_avg,
          COUNT(*)    AS rev_count
        FROM reviews
        GROUP BY restaurant_id
      ) stats
        ON stats.restaurant_id = r.id
      ORDER BY stats.rev_avg DESC, stats.rev_count DESC, r.name
      `
    );

    const data = rows.map(r => ({
      id:            r.id,
      name:          r.name,
      description:   r.description,
      address:       r.address,
      contactPhone:  r.contact_phone,
      email:         r.email,
      coverImage:    constructImageUrl(req, r.cover_image, "restaurant"),
      cuisineType:   r.cuisine_type,
      mapEmbedHtml:  r.mapEmbedHtml,
      sellerName:    r.seller_name,
      avgRating:     Number(r.avg_rating),   // e.g. 4.25
      reviewCount:   r.review_count          // e.g. 12
    }));

    res.json(data);
  } catch (err) {
    console.error("Error fetching restaurants:", err);
    res.status(500).json({ message: "Database error", error: err.message });
  }
};

// GET a single restaurant, including avgRating & reviewCount
exports.getRestaurant = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query(
      `
      SELECT
        r.id,
        r.name,
        r.description,
        r.address,
        r.contact_phone,
        r.email,
        r.cover_image,
        r.cuisine_type,
        r.map            AS mapEmbedHtml,
        u.name           AS seller_name,
        COALESCE(stats.rev_avg,   0) AS avg_rating,
        COALESCE(stats.rev_count, 0) AS review_count
      FROM restaurants r
      JOIN users u 
        ON r.owner_id = u.id
      LEFT JOIN (
        SELECT
          restaurant_id,
          AVG(rating) AS rev_avg,
          COUNT(*)    AS rev_count
        FROM reviews
        GROUP BY restaurant_id
      ) stats
        ON stats.restaurant_id = r.id
      WHERE r.id = ?
      `,
      [id]
    );
    if (!rows.length) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    const r = rows[0];
    res.json({
      id:           r.id,
      name:         r.name,
      description:  r.description,
      address:      r.address,
      contactPhone: r.contact_phone,
      email:        r.email,
      coverImage:   constructImageUrl(req, r.cover_image, "restaurant"),
      cuisineType:  r.cuisine_type,
      mapEmbedHtml: r.mapEmbedHtml,
      sellerName:   r.seller_name,
      avgRating:    Number(r.avg_rating),
      reviewCount:  r.review_count
    });
  } catch (err) {
    console.error("Error fetching restaurant:", err);
    res.status(500).json({ message: "Database error", error: err.message });
  }
};

// CREATE a restaurant (seller only)
exports.createRestaurant = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const {
      name,
      description,
      address,
      contact_phone,
      email,
      cuisine_type,
      map        // new embeddable map HTML
    } = req.body;
    const cover = req.file?.filename || null;

    const [result] = await db.query(
      `INSERT INTO restaurants
        (owner_id, name, description, address,
         contact_phone, email, cover_image, cuisine_type, map)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        ownerId,
        name,
        description,
        address,
        contact_phone,
        email,
        cover,
        cuisine_type,
        map || null
      ]
    );
    res.status(201).json({
      message:      "Restaurant created successfully",
      restaurantId: result.insertId
    });
  } catch (err) {
    console.error("Error creating restaurant:", err);
    res.status(500).json({ message: "Failed to create restaurant" });
  }
};

// UPDATE a restaurant (seller only)
exports.updateRestaurantDetails = async (req, res) => {
  try {
    const { id }   = req.params;
    const ownerId  = req.user.id;
    // verify ownership
    const [chk] = await db.query(
      "SELECT id FROM restaurants WHERE id = ? AND owner_id = ?",
      [id, ownerId]
    );
    if (!chk.length) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // build SET clauses dynamically
    const {
      name,
      description,
      address,
      contact_phone,
      email,
      cuisine_type,
      map      // new field
    } = req.body;
    const fields = [];
    const vals   = [];

    if (name)           { fields.push("name = ?");          vals.push(name); }
    if (description)    { fields.push("description = ?");   vals.push(description); }
    if (address)        { fields.push("address = ?");       vals.push(address); }
    if (contact_phone)  { fields.push("contact_phone = ?"); vals.push(contact_phone); }
    if (email)          { fields.push("email = ?");         vals.push(email); }
    if (cuisine_type)   { fields.push("cuisine_type = ?");  vals.push(cuisine_type); }
    if (map !== undefined) {
      fields.push("map = ?");
      vals.push(map);
    }
    if (req.file) {
      fields.push("cover_image = ?");
      vals.push(req.file.filename);
    }

    if (!fields.length) {
      return res.status(400).json({ message: "No data to update" });
    }

    // finalize & execute
    vals.push(id);
    await db.query(
      `UPDATE restaurants SET ${fields.join(", ")} WHERE id = ?`,
      vals
    );

    // fetch & return updated row
    const [rows2] = await db.query(
      `SELECT
         id,
         name,
         description,
         address,
         contact_phone,
         email,
         cover_image,
         cuisine_type,
         map
       FROM restaurants
       WHERE id = ?`,
      [id]
    );
    const u = rows2[0];
    res.json({
      message:    "Restaurant updated successfully",
      restaurant: {
        id:           u.id,
        name:         u.name,
        description:  u.description,
        address:      u.address,
        contactPhone: u.contact_phone,
        email:        u.email,
        coverImage:   constructImageUrl(req, u.cover_image, "restaurant"),
        cuisineType:  u.cuisine_type,
        mapEmbedHtml: u.map
      }
    });
  } catch (err) {
    console.error("Error updating restaurant:", err);
    res.status(500).json({ message: "Database error", error: err.message });
  }
};

// ─── TABLE MANAGEMENT (seller‐only) ──────────────────────────────────

// GET all tables for a restaurant
exports.getRestaurantTables = async (req, res) => {
  try {
    const restaurantId = req.params.id;
    const ownerId      = req.user.id;
    // verify ownership
    const [chk] = await db.query(
      "SELECT 1 FROM restaurants WHERE id = ? AND owner_id = ?",
      [restaurantId, ownerId]
    );
    if (!chk.length) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const [rows] = await db.query(
      `SELECT id, table_number, capacity
         FROM restaurant_tables
        WHERE restaurant_id = ?
        ORDER BY CAST(table_number AS UNSIGNED), table_number`,
      [restaurantId]
    );
    res.json({ data: rows });
  } catch (err) {
    console.error("Error fetching tables:", err);
    res.status(500).json({ message: "Database error", error: err.message });
  }
};

// POST a new table (seller only)
exports.addRestaurantTable = async (req, res) => {
  try {
    const restaurantId      = req.params.id;
    const ownerId           = req.user.id;
    const { table_number, capacity } = req.body;
    // verify ownership
    const [chk] = await db.query(
      "SELECT 1 FROM restaurants WHERE id = ? AND owner_id = ?",
      [restaurantId, ownerId]
    );
    if (!chk.length) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const [result] = await db.query(
      `INSERT INTO restaurant_tables
         (restaurant_id, table_number, capacity)
       VALUES (?, ?, ?)`,
      [restaurantId, table_number, capacity]
    );
    res.status(201).json({
      message: "Table added",
      tableId: result.insertId
    });
  } catch (err) {
    console.error("Error adding table:", err);
    res.status(500).json({ message: "Database error", error: err.message });
  }
};

// DELETE a table (seller only)
exports.deleteRestaurantTable = async (req, res) => {
  try {
    const restaurantId = req.params.id;
    const tableId      = req.params.tableId;
    const ownerId      = req.user.id;
    // verify ownership
    const [chk] = await db.query(
      "SELECT 1 FROM restaurants WHERE id = ? AND owner_id = ?",
      [restaurantId, ownerId]
    );
    if (!chk.length) {
      return res.status(403).json({ message: "Not authorized" });
    }
    // ensure no confirmed bookings for that table
    const [bk] = await db.query(
      `SELECT 1
         FROM bookings
        WHERE table_id = ? AND status = 'confirmed'`,
      [tableId]
    );
    if (bk.length) {
      return res.status(409).json({
        message: "Cannot delete: future confirmed bookings exist"
      });
    }

    await db.query(
      `DELETE FROM restaurant_tables
        WHERE id = ? AND restaurant_id = ?`,
      [tableId, restaurantId]
    );
    res.json({ message: "Table deleted" });
  } catch (err) {
    console.error("Error deleting table:", err);
    res.status(500).json({ message: "Database error", error: err.message });
  }
};

// ─── AVAILABLE TABLES ────────────────────────────────────────────────

// GET available tables for a timeslot
exports.getAvailableTables = async (req, res) => {
  try {
    const restaurantId = req.params.id;
    const {
      booking_date,
      booking_start_time,
      booking_end_time
    } = req.query;

    // validate inputs
    if (!booking_date || !booking_start_time || !booking_end_time) {
      return res.status(400).json({
        message:
          "booking_date, booking_start_time & booking_end_time are required"
      });
    }

    // select tables with no overlapping confirmed booking
    const [rows] = await db.query(
      `SELECT t.id, t.table_number, t.capacity
         FROM restaurant_tables t
        WHERE t.restaurant_id = ?
          AND NOT EXISTS (
            SELECT 1
              FROM bookings b
             WHERE b.table_id       = t.id
               AND b.status         = 'confirmed'
               AND b.booking_date   = ?
               AND b.booking_time   <  ?
               AND b.booking_end_time > ?
          )
        ORDER BY CAST(t.table_number AS UNSIGNED), t.table_number`,
      [
        restaurantId,
        booking_date,
        booking_end_time,   // b.booking_time   < new end
        booking_start_time  // b.booking_end_time > new start
      ]
    );

    res.json({ data: rows });
  } catch (err) {
    console.error("Error fetching available tables:", err);
    res.status(500).json({
      message: "Internal server error while fetching tables."
    });
  }
};