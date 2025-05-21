const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const upload = require('../config/multer');
const { constructImageUrl } = require('../utils/helpers');

const authController = {
  signup: async (req, res) => {
    try {
      const { name, email, phone, password, user_type } = req.body;
      const profilePic = req.file ? req.file.filename : null;
      const hashedPassword = await bcrypt.hash(password, 10);

      const query = `
        INSERT INTO users (name, email, phone, password_hash, user_type, profile_image) 
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      const values = [name, email, phone, hashedPassword, user_type, profilePic];

      db.query(query, values, (err, result) => {
        if (err) {
          if (req.file) fs.unlinkSync(req.file.path);
          console.error('Database error:', err);
          return res.status(500).json({ 
            message: err.code === 'ER_DUP_ENTRY' ? 'Email already exists' : 'Database error' 
          });
        }

        res.status(201).json({
          message: 'Account created successfully!',
          user: { 
            id: result.insertId,
            name,
            email,
            phone,
            user_type,
            profileImage: profilePic ? constructImageUrl(req, profilePic) : constructImageUrl(req, null)
          }
        });
      });
    } catch (err) {
      console.error('Signup error:', err);
      if (req.file) fs.unlinkSync(req.file.path);
      res.status(500).json({ message: 'Server error during signup' });
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      const query = `
        SELECT id, name, email, phone, password_hash, user_type, profile_image 
        FROM users 
        WHERE email = ?
      `;
      
      db.query(query, [email], async (err, results) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        if (results.length === 0) return res.status(401).json({ message: 'Invalid credentials' });

        const user = results[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

        const token = jwt.sign(
          { id: user.id, email: user.email, role: user.user_type },
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
            role: user.user_type,
            profileImage: constructImageUrl(req, user.profile_image)
          }
        });
      });
    } catch (err) {
      console.error('Login error:', err);
      res.status(500).json({ message: 'Server error during login' });
    }
  }
};

module.exports = authController;