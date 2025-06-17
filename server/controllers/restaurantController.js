// controllers/restaurantController.js
const db = require("../config/db");
const { constructImageUrl } = require("../utils/helpers");

// GET all restaurants
exports.getAllRestaurants = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT
         r.id, r.name, r.description, r.address,
         r.contact_phone, r.email, r.cover_image,
         r.cuisine_type, u.name AS seller_name
       FROM restaurants r
       JOIN users u ON r.owner_id = u.id`
    );

    const data = rows.map(r => ({
      id:           r.id,
      name:         r.name,
      description:  r.description,
      address:      r.address,
      contactPhone: r.contact_phone,
      email:        r.email,
      coverImage:   constructImageUrl(req, r.cover_image, "restaurant"),
      cuisineType:  r.cuisine_type,
      sellerName:   r.seller_name
    }));
    res.json(data);
  } catch (err) {
    console.error("Error fetching restaurants:", err);
    res.status(500).json({ message: "Database error", error: err.message });
  }
};

// GET single restaurant
exports.getRestaurant = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query(
      `SELECT
         r.id, r.name, r.description, r.address,
         r.contact_phone, r.email, r.cover_image,
         r.cuisine_type, u.name AS seller_name
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
      coverImage:   constructImageUrl(req, r.cover_image, "restaurant"),
      cuisineType:  r.cuisine_type,
      sellerName:   r.seller_name
    });
  } catch (err) {
    console.error("Error fetching restaurant:", err);
    res.status(500).json({ message: "Database error", error: err.message });
  }
};

// CREATE restaurant
exports.createRestaurant = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const {
      name, description, address,
      contact_phone, email, cuisine_type
    } = req.body;

    const cover = req.file?.filename || null;

    const [result] = await db.query(
      `INSERT INTO restaurants
        (owner_id, name, description, address,
         contact_phone, email, cover_image, cuisine_type)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [ownerId, name, description, address, contact_phone, email, cover, cuisine_type]
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

// UPDATE restaurant (seller only)
exports.updateRestaurantDetails = async (req, res) => {
  try {
    const { id }  = req.params;
    const ownerId = req.user.id;

    // 1) verify ownership
    const [chk] = await db.query(
      "SELECT id FROM restaurants WHERE id = ? AND owner_id = ?",
      [id, ownerId]
    );
    if (!chk.length) {
      return res.status(403).json({ message: "Not authorized to edit this restaurant" });
    }

    // 2) build dynamic SET clause
    const { name, description, address, contact_phone, email, cuisine_type } = req.body;
    const fields = [], vals = [];

    if (name)          { fields.push("name = ?");           vals.push(name); }
    if (description)   { fields.push("description = ?");    vals.push(description); }
    if (address)       { fields.push("address = ?");        vals.push(address); }
    if (contact_phone) { fields.push("contact_phone = ?");  vals.push(contact_phone); }
    if (email)         { fields.push("email = ?");          vals.push(email); }
    if (cuisine_type)  { fields.push("cuisine_type = ?");   vals.push(cuisine_type); }
    if (req.file) {                                     
      fields.push("cover_image = ?");
      vals.push(req.file.filename);
    }

    if (!fields.length) {
      return res.status(400).json({ message: "No data to update" });
    }

    // execute update
    vals.push(id);
    await db.query(
      `UPDATE restaurants SET ${fields.join(", ")} WHERE id = ?`,
      vals
    );

    // 3) return updated record
    const [rows] = await db.query(
      "SELECT * FROM restaurants WHERE id = ?", [id]
    );
    const u = rows[0];
    res.json({
      message: "Restaurant updated successfully",
      restaurant: {
        id:           u.id,
        name:         u.name,
        description:  u.description,
        address:      u.address,
        contactPhone: u.contact_phone,
        email:        u.email,
        coverImage:   constructImageUrl(req, u.cover_image, "restaurant"),
        cuisineType:  u.cuisine_type
      }
    });
  } catch (err) {
    console.error("Error updating restaurant:", err);
    res.status(500).json({ message: "Database error", error: err.message });
  }
};