// controllers/profileController.js
const bcrypt = require('bcryptjs');
const db     = require('../config/db');
const { constructImageUrl } = require('../utils/helpers');

// GET customer profile
exports.getCustomerProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await db.query(
      `SELECT 
         id,
         name,
         email,
         phone,
         address,
         user_type AS role,
         profile_image 
       FROM users 
       WHERE id = ?`,
      [userId]
    );
    if (!rows.length) {
      return res.status(404).json({ message: 'User not found' });
    }
    const u = rows[0];
    res.json({
      id:           u.id,
      name:         u.name,
      email:        u.email,
      phone:        u.phone,
      address:      u.address,
      role:         u.role,
      profileImage: constructImageUrl(req, u.profile_image)
    });
  } catch (err) {
    console.error('Error fetching customer profile:', err);
    res.status(500).json({ message: 'Database error', error: err.message });
  }
};

// GET seller profile (including their restaurant)
exports.getSellerProfile = async (req, res) => {
  try {
    const sellerId = req.user.id;
    // fetch user row
    const [uRows] = await db.query(
      `SELECT 
         id, name, email, phone, address, user_type AS role, profile_image 
       FROM users 
       WHERE id = ?`,
      [sellerId]
    );
    if (!uRows.length) {
      return res.status(404).json({ message: 'Seller not found' });
    }
    const user = uRows[0];

    // fetch their restaurant
    const [rRows] = await db.query(
      `SELECT 
         id, name, description, address, contact_phone, cuisine_type, cover_image 
       FROM restaurants 
       WHERE owner_id = ?`,
      [sellerId]
    );
    const restaurant = rRows[0] || null;

    res.json({
      user: {
        id:           user.id,
        name:         user.name,
        email:        user.email,
        phone:        user.phone,
        address:      user.address,
        role:         user.role,
        profileImage: constructImageUrl(req, user.profile_image)
      },
      restaurant: restaurant && {
        id:           restaurant.id,
        name:         restaurant.name,
        description:  restaurant.description,
        address:      restaurant.address,
        contactPhone: restaurant.contact_phone,
        cuisineType:  restaurant.cuisine_type,
        coverImage:   constructImageUrl(req, restaurant.cover_image, 'restaurant')
      }
    });
  } catch (err) {
    console.error('Error fetching seller profile:', err);
    res.status(500).json({ message: 'Database error', error: err.message });
  }
};

// UPDATE user profile (customer or seller)
exports.updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email, phone, address, password } = req.body;
    const fields = [];
    const vals   = [];

    if (name)    { fields.push('name = ?');    vals.push(name); }
    if (email)   { fields.push('email = ?');   vals.push(email); }
    if (phone)   { fields.push('phone = ?');   vals.push(phone); }
    if (address) { fields.push('address = ?'); vals.push(address); }

    // handle new password
    if (password) {
      const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10;
      const hash       = await bcrypt.hash(password, saltRounds);
      fields.push('password_hash = ?');
      vals.push(hash);
    }

    // handle profile image upload
    if (req.file) {
      fields.push('profile_image = ?');
      vals.push(req.file.filename);
    }

    if (!fields.length) {
      return res.status(400).json({ message: 'No data to update' });
    }

    // build & run query
    vals.push(userId);
    await db.query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
      vals
    );

    // return updated user
    const [rows] = await db.query(
      `SELECT 
         id, name, email, phone, address, user_type AS role, profile_image
       FROM users 
       WHERE id = ?`,
      [userId]
    );
    const u = rows[0];
    res.json({
      id:           u.id,
      name:         u.name,
      email:        u.email,
      phone:        u.phone,
      address:      u.address,
      role:         u.role,
      profileImage: constructImageUrl(req, u.profile_image)
    });
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ message: 'Database error', error: err.message });
  }
};