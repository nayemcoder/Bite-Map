// controllers/profileController.js
const db = require("../config/db");
const { constructImageUrl } = require("../utils/helpers");

exports.getSellerProfile = async (req, res) => {
  try {
    const sellerId = req.user.id;
    const [uRows] = await db.query("SELECT * FROM users WHERE id = ?", [sellerId]);
    if (!uRows.length) return res.status(404).json({ message: "Seller not found" });

    const user = uRows[0];
    const [rRows] = await db.query("SELECT * FROM restaurants WHERE owner_id = ?", [sellerId]);
    const restaurant = rRows[0] || null;

    res.json({
      user: {
        id:           user.id,
        name:         user.name,
        email:        user.email,
        phone:        user.phone,
        role:         user.user_type,
        profileImage: constructImageUrl(req, user.profile_image)
      },
      restaurant: restaurant && {
        id:           restaurant.id,
        name:         restaurant.name,
        description:  restaurant.description,
        address:      restaurant.address,
        contactPhone: restaurant.contact_phone,
        coverImage:   constructImageUrl(req, restaurant.cover_image, "restaurant"),
        cuisineType:  restaurant.cuisine_type
      }
    });
  } catch (err) {
    console.error("Error fetching seller profile:", err);
    res.status(500).json({ message: "Database error", error: err.message });
  }
};

exports.getCustomerProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await db.query("SELECT id,name,email,phone,user_type AS role,profile_image FROM users WHERE id = ?", [userId]);
    if (!rows.length) return res.status(404).json({ message: "User not found" });
    const u = rows[0];
    res.json({
      id:           u.id,
      name:         u.name,
      email:        u.email,
      phone:        u.phone,
      role:         u.role,
      profileImage: constructImageUrl(req, u.profile_image)
    });
  } catch (err) {
    console.error("Error fetching customer profile:", err);
    res.status(500).json({ message: "Database error", error: err.message });
  }
};

exports.updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email, password } = req.body;
    let fields = [], vals = [];

    if (name)  { fields.push("name = ?");  vals.push(name); }
    if (email) { fields.push("email = ?"); vals.push(email); }
    if (req.file) {
      fields.push("profile_image = ?");
      vals.push(req.file.filename);
    }
    // handle password hashing if needed (omitted for brevity)

    if (!fields.length) return res.status(400).json({ message: "No data to update" });

    vals.push(userId);
    await db.query(`UPDATE users SET ${fields.join(", ")} WHERE id = ?`, vals);
    res.json({ message: "Profile updated successfully" });
  } catch (err) {
    console.error("Error updating profile:", err);
    res.status(500).json({ message: "Database error", error: err.message });
  }
};