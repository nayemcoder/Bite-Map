// controllers/authController.js
const bcrypt             = require('bcryptjs');
const jwt                = require('jsonwebtoken');
const db                 = require('../config/db');
const fs                 = require('fs');
const { constructImageUrl } = require('../utils/helpers');
const { validationResult }  = require('express-validator');

// helper to delete uploaded files on error
const deleteFile = async (path) => {
  try { await fs.promises.unlink(path); }
  catch (err) { console.error('Failed to delete file:', err); }
};

const authController = {
  signup: async (req, res) => {
    // 1) Validate inputs
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      if (req.file) await deleteFile(req.file.path);
      return res.status(400).json({ errors: errors.array() });
    }

    // 2) Destructure user + restaurant fields
    const {
      name,
      email,
      phone,
      address,
      password,
      user_type,
      restaurantName,
      restaurantDescription,
      restaurantAddress,
      restaurantContact,
      restaurantCuisine
    } = req.body;
    const profilePic     = req.file ? req.file.filename : null;

    let conn;
    try {
      conn = await db.getConnection();
      await conn.beginTransaction();

      // 3) Hash password
      const saltRounds     = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10;
      const password_hash  = await bcrypt.hash(password, saltRounds);

      // 4) Insert user
      const [userResult] = await conn.query(
        `INSERT INTO users
           (name, email, phone, address, password_hash, user_type, profile_image)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [name, email, phone, address, password_hash, user_type, profilePic]
      );
      const userId = userResult.insertId;

      // 5) If seller, insert their restaurant
      if (user_type === 'seller') {
        // note: you could upload a separate file field for cover_image via multer
        const coverFile = req.body.restaurantCoverFile || null;

        await conn.query(
          `INSERT INTO restaurants
             (owner_id, name, description, address,
              contact_phone, email, cuisine_type, cover_image)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            userId,
            restaurantName,
            restaurantDescription,
            restaurantAddress,
            restaurantContact,
            email,
            restaurantCuisine,
            coverFile
          ]
        );
      }

      await conn.commit();

      // 6) Issue JWT
      const token = jwt.sign(
        { id: userId, email, role: user_type },
        process.env.JWT_SECRET_KEY,
        { expiresIn: '1d' }
      );

      // 7) Respond
      res.status(201).json({
        message: 'Account created successfully!',
        token,
        user: {
          id:           userId,
          name,
          email,
          phone,
          address,
          role:         user_type,
          profileImage: constructImageUrl(req, profilePic)
        }
      });
    }
    catch (err) {
      // rollback + cleanup
      if (conn) {
        await conn.rollback();
        conn.release();
      }
      if (req.file) await deleteFile(req.file.path);

      // duplicate email?
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ message: 'Email already in use' });
      }
      console.error('Signup error:', err);
      res.status(500).json({ message: 'Signup error. Please try again.' });
    }
    finally {
      if (conn) conn.release();
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      const [rows] = await db.query(
        `SELECT id, name, email, phone, address, password_hash, user_type AS role, profile_image
           FROM users WHERE email = ?`,
        [email]
      );
      if (rows.length === 0) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const user = rows[0];
      const match = await bcrypt.compare(password, user.password_hash);
      if (!match) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET_KEY,
        { expiresIn: '1d' }
      );

      res.json({
        message: 'Login successful',
        token,
        user: {
          id:           user.id,
          name:         user.name,
          email:        user.email,
          phone:        user.phone,
          address:      user.address,
          role:         user.role,
          profileImage: constructImageUrl(req, user.profile_image)
        }
      });
    } catch (err) {
      console.error('Server error during login:', err);
      res.status(500).json({ message: 'Server error during login.' });
    }
  }
};

module.exports = authController;