const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const fs = require('fs');
const { constructImageUrl } = require('../utils/helpers');
const { validationResult } = require('express-validator');

const deleteFile = async (path) => {
  try {
    await fs.promises.unlink(path);
  } catch (err) {
    console.error('Failed to delete file:', err);
  }
};

const authController = {
  signup: async (req, res) => {
    // Validate incoming request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      if (req.file) await deleteFile(req.file.path);
      return res.status(400).json({ errors: errors.array() });
    }

    const connection = await db.getConnection();

    try {
      const { name, email, phone, password, user_type, description } = req.body;
      const profilePic = req.file ? req.file.filename : null;
      const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      await connection.beginTransaction();

      try {
        // Insert new user
        const [userResult] = await connection.query(
          `INSERT INTO users (name, email, phone, password_hash, user_type, profile_image) VALUES (?, ?, ?, ?, ?, ?)`,
          [name, email, phone, hashedPassword, user_type, profilePic]
        );

        const userId = userResult.insertId;

        // If seller, create default restaurant
        if (user_type === 'seller') {
          await connection.query(
            `INSERT INTO restaurants (owner_id, name, description, address, contact_phone) VALUES (?, ?, ?, ?, ?)`,
            [
              userId,
              `${name}'s Restaurant`,
              description || `This is the official restaurant of seller ${name}.`,
              'Default Address',
              phone,
            ]
          );
        }

        await connection.commit();

        res.status(201).json({
          message: 'Account created successfully!',
          user: {
            id: userId,
            name,
            email,
            phone,
            role: user_type,   // consistent naming: role instead of user_type
            profileImage: constructImageUrl(req, profilePic),
          },
        });
      } catch (err) {
        await connection.rollback();
        if (req.file) await deleteFile(req.file.path);

        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(409).json({ message: 'Email already in use' });
        }

        console.error('Signup error:', err);
        return res.status(500).json({ message: 'Signup error. Please try again.' });
      }
    } catch (err) {
      if (req.file) await deleteFile(req.file.path);
      console.error('Server error during signup:', err);
      return res.status(500).json({ message: 'Server error during signup.' });
    } finally {
      connection.release();
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      const [rows] = await db.query(
        `SELECT id, name, email, phone, password_hash, user_type as role, profile_image FROM users WHERE email = ?`,
        [email]
      );

      if (rows.length === 0) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const user = rows[0];
      const isMatch = await bcrypt.compare(password, user.password_hash);

      if (!isMatch) {
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
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          profileImage: constructImageUrl(req, user.profile_image),
        },
      });
    } catch (err) {
      console.error('Server error during login:', err);
      res.status(500).json({ message: 'Server error during login.' });
    }
  },
};

module.exports = authController;
