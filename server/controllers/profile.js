const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const db = require('../config/db');
const { constructImageUrl } = require('../utils/helpers');

const profileController = {
  getProfile: (req, res) => {
    const query = `
      SELECT id, name, email, phone, user_type, profile_image 
      FROM users 
      WHERE id = ?
    `;
    
    db.query(query, [req.user.id], (err, results) => {
      if (err) return res.status(500).json({ message: 'Database error' });
      if (results.length === 0) return res.status(404).json({ message: 'User not found' });

      const user = results[0];
      res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        user_type: user.user_type,
        profileImage: constructImageUrl(req, user.profile_image)
      });
    });
  },

  updateProfile: async (req, res) => {
    try {
      const userId = req.user.id;
      const { name, email, phone, password } = req.body;
      const profilePic = req.file ? req.file.filename : null;

      const getQuery = 'SELECT profile_image FROM users WHERE id = ?';
      db.query(getQuery, [userId], async (err, results) => {
        if (err) {
          if (req.file) fs.unlinkSync(req.file.path);
          return res.status(500).json({ message: 'Database error' });
        }

        const currentProfile = results[0];
        let updateFields = [];
        let values = [];

        if (name) { updateFields.push('name = ?'); values.push(name); }
        if (email) { updateFields.push('email = ?'); values.push(email); }
        if (phone) { updateFields.push('phone = ?'); values.push(phone); }
        if (password) {
          const hashedPassword = await bcrypt.hash(password, 10);
          updateFields.push('password_hash = ?');
          values.push(hashedPassword);
        }
        if (profilePic) { updateFields.push('profile_image = ?'); values.push(profilePic); }

        if (updateFields.length === 0) {
          if (req.file) fs.unlinkSync(req.file.path);
          return res.status(400).json({ message: 'No fields to update' });
        }

        const updateQuery = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`;
        values.push(userId);

        db.query(updateQuery, values, (err, result) => {
          if (err) {
            if (req.file) fs.unlinkSync(req.file.path);
            return res.status(500).json({ message: 'Database error' });
          }

          // Delete old profile image if it was replaced
          if (profilePic && currentProfile.profile_image) {
            const oldImagePath = path.join(__dirname, '../uploads', currentProfile.profile_image);
            if (fs.existsSync(oldImagePath)) {
              fs.unlinkSync(oldImagePath);
            }
          }

          res.json({
            message: 'Profile updated successfully',
            profileImage: constructImageUrl(req, profilePic || currentProfile.profile_image)
          });
        });
      });
    } catch (err) {
      console.error('Update error:', err);
      if (req.file) fs.unlinkSync(req.file.path);
      res.status(500).json({ message: 'Server error during update' });
    }
  }
};

module.exports = profileController;