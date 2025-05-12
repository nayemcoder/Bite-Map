require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mysql = require('mysql2');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 8080;

// Constants
const UPLOADS_DIR = path.join(__dirname, 'uploads');
const DEFAULT_PROFILE_IMAGE = '/uploads/cat.png';

// Create uploads directory if it doesn't exist
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  exposedHeaders: ['Content-Type']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use('/uploads', express.static(UPLOADS_DIR, {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.png') || filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) {
      res.setHeader('Content-Type', 'image/jpeg');
    }
  }
}));

// Database connection
const db = mysql.createConnection({
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '1234',
  database: process.env.DB_NAME || 'Restaurant',
});

db.connect((err) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Connected to MySQL database');
  }
});

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Helper functions
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'No token provided' });

  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
}

function constructImageUrl(req, imagePath) {
  if (!imagePath) return `${req.protocol}://${req.get('host')}${DEFAULT_PROFILE_IMAGE}`;
  return `${req.protocol}://${req.get('host')}/uploads/${path.basename(imagePath)}`;
}

// Routes
app.post('/signup', upload.single('profilePic'), async (req, res) => {
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
});

app.post('/login', async (req, res) => {
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
});

app.get('/profile', authenticateToken, (req, res) => {
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
});

app.put('/update-profile', authenticateToken, upload.single('profilePic'), async (req, res) => {
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
          const oldImagePath = path.join(UPLOADS_DIR, currentProfile.profile_image);
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
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Upload directory: ${UPLOADS_DIR}`);
});