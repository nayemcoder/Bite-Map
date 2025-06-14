// controllers/restaurantController.js
const fs   = require("fs");
const db   = require("../config/db");
const { constructImageUrl } = require("../utils/helpers");

// GET all restaurants (removed restaurant_images)
exports.getAllRestaurants = async (req, res) => {
  try {
    // Fetch base restaurant + owner
    const [rows] = await db.query(
      `SELECT
         r.id,
         r.name,
         r.description,
         r.address,
         r.contact_phone,
         r.email,
         r.cover_image,
         r.cuisine_type,
         u.name AS seller_name
       FROM restaurants r
       JOIN users u ON r.owner_id = u.id`
    );

    // Format response without image gallery
    const data = rows.map((r) => ({
      id:           r.id,
      name:         r.name,
      description:  r.description,
      address:      r.address,
      contactPhone: r.contact_phone,
      email:        r.email,
      coverImage:   constructImageUrl(req, r.cover_image), // Now using cover_image only
      cuisineType:  r.cuisine_type,
      sellerName:   r.seller_name
    }));

    res.json(data);
  } catch (err) {
    console.error("Error fetching restaurants:", err);
    res.status(500).json({
      message: "Database error",
      error: err.message
    });
  }
};

// GET single restaurant by ID (removed restaurant_images)
exports.getRestaurant = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch restaurant + owner
    const [rows] = await db.query(
      `SELECT
         r.id,
         r.name,
         r.description,
         r.address,
         r.contact_phone,
         r.email,
         r.cover_image,
         r.cuisine_type,
         u.name AS seller_name
       FROM restaurants r
       JOIN users u ON r.owner_id = u.id
       WHERE r.id = ?`,
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
      coverImage:   constructImageUrl(req, r.cover_image), // Now using cover_image only
      cuisineType:  r.cuisine_type,
      sellerName:   r.seller_name
    });
  } catch (err) {
    console.error("Error fetching restaurant:", err);
    res.status(500).json({
      message: "Database error",
      error: err.message
    });
  }
};

// CREATE restaurant (seller only)
exports.createRestaurant = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const {
      name,
      description,
      address,
      contact_phone,
      email,
      cuisine_type
    } = req.body;

    // Handle cover image upload
    const cover = req.file?.filename || null;

    // Insert restaurant details
    const [result] = await db.query(
      `INSERT INTO restaurants
        (owner_id, name, description, address,
         contact_phone, email, cover_image, cuisine_type)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        ownerId,
        name,
        description,
        address,
        contact_phone,
        email,
        cover,
        cuisine_type
      ]
    );

    res.status(201).json({
      message: "Restaurant created successfully",
      restaurantId: result.insertId
    });
  } catch (err) {
    console.error("Error creating restaurant:", err);
    res.status(500).json({ message: "Failed to create restaurant" });
  }
};

// UPDATE restaurant details (seller only)
exports.updateRestaurantDetails = async (req, res) => {
  try {
    const { id }  = req.params;
    const ownerId = req.user.id;
    const {
      name,
      description,
      address,
      contact_phone,
      email,
      cuisine_type
    } = req.body;

    // Validate restaurant ownership
    const [chk] = await db.query(
      "SELECT id FROM restaurants WHERE id = ? AND owner_id = ?",
      [id, ownerId]
    );

    if (!chk.length) {
      return res.status(403).json({
        message: "Unauthorized to edit this restaurant"
      });
    }

    // Build update query dynamically
    const fields = [];
    const vals   = [];

    if (name)           { fields.push("name = ?");           vals.push(name); }
    if (description)    { fields.push("description = ?");    vals.push(description); }
    if (address)        { fields.push("address = ?");        vals.push(address); }
    if (contact_phone)  { fields.push("contact_phone = ?");  vals.push(contact_phone); }
    if (email)          { fields.push("email = ?");          vals.push(email); }
    if (cuisine_type)   { fields.push("cuisine_type = ?");   vals.push(cuisine_type); }

    // Update cover image if uploaded
    if (req.file) {
      fields.push("cover_image = ?");
      vals.push(req.file.filename);
    }

    if (!fields.length) {
      return res.status(400).json({ message: "No data to update" });
    }

    vals.push(id);
    await db.query(
      `UPDATE restaurants SET ${fields.join(", ")} WHERE id = ?`,
      vals
    );

    res.json({ message: "Restaurant updated successfully" });
  } catch (err) {
    console.error("Error updating restaurant:", err);
    res.status(500).json({
      message: "Database error",
      error: err.message
    });
  }
};