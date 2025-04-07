require('dotenv').config();  // This loads the .env file

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const mysql = require('mysql2');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = 8080;

// Enable CORS
app.use(cors());

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Middleware to handle JSON and form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MySQL database connection
const db = mysql.createConnection({
  host: '127.0.0.1',
  user: 'root',
  password: '',
  database: 'Restaurant',
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
  } else {
    console.log('Connected to MySQL database');
  }
});

// Configure multer storage for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// JWT authentication middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    console.log('No token provided');
    return res.status(401).json({ message: 'No token provided' });
  }

  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, user) => {
    if (err) {
      console.log('Invalid token');
      return res.status(403).json({ message: 'Invalid token' });
    }

    req.user = user;
    next();
  });
}

// Sign-up route
app.post('/signup', upload.single('profilePic'), async (req, res) => {
  const { name, email, phone, password, role } = req.body;
  const profilePic = req.file ? req.file.path : null;
  const hashedPassword = await bcrypt.hash(password, 10);

  const query =
    'INSERT INTO users (full_name, email, phone, password_hash, user_type, profile_image) VALUES (?, ?, ?, ?, ?, ?)';
  const values = [name, email, phone, hashedPassword, role, profilePic];

  db.query(query, values, (err, result) => {
    if (err) {
      console.error('Error inserting data into MySQL:', err);
      return res.status(500).json({ message: 'Database error' });
    }
    res.status(200).json({
      message: 'Account created successfully!',
      data: { name, email, phone, role, profilePic },
    });
  });
});

// Login route
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const query = 'SELECT user_id, email, password_hash, user_type, profile_image FROM users WHERE email = ?';
  db.query(query, [email], async (err, results) => {
    if (err) {
      console.error('Database error during login:', err);
      return res.status(500).json({ message: 'Server error' });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = results[0];
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.user_id, email: user.email, role: user.user_type },
      process.env.JWT_SECRET_KEY,
      { expiresIn: '1d' }
    );

    res.json({
      message: 'Login successful',
      token,
    });
  });
});

// Profile route
app.get('/profile', authenticateToken, (req, res) => {
  const userId = req.user.id;

  const query = 'SELECT full_name, email, user_type, profile_image FROM users WHERE user_id = ?';
  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error('❌ Error fetching profile:', err);
      return res.status(500).json({ message: 'Server error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = results[0];
    const profilePicUrl = user.profile_image && typeof user.profile_image === 'string'
      ? `http://localhost:${PORT}/${user.profile_image.replace(/\\/g, '/')}`
      : 'http://localhost:8080/uploads/cat.png';

    console.log('Generating Profile Image URL for:', user.full_name);
    console.log('Profile Image URL:', profilePicUrl);

    res.json({
      name: user.full_name,
      email: user.email,
      role: user.user_type,
      avatar: profilePicUrl,
    });
  });
});

// Update profile route
app.put('/update-profile', authenticateToken, upload.single('profilePic'), async (req, res) => {
  const userId = req.user.id;
  const { name, email, password } = req.body;
  const profilePic = req.file ? req.file.path : null;

  let updateFields = [];
  let values = [];

  if (name) {
    updateFields.push('full_name = ?');
    values.push(name);
  }
  if (email) {
    updateFields.push('email = ?');
    values.push(email);
  }
  if (password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    updateFields.push('password_hash = ?');
    values.push(hashedPassword);
  }
  if (profilePic) {
    updateFields.push('profile_image = ?');
    values.push(profilePic);
  }

  if (updateFields.length === 0) {
    return res.status(400).json({ message: 'No fields to update' });
  }

  const query = `UPDATE users SET ${updateFields.join(', ')} WHERE user_id = ?`;
  values.push(userId);

  db.query(query, values, (err, result) => {
    if (err) {
      console.error('❌ Error updating profile:', err);
      return res.status(500).json({ message: 'Server error' });
    }

    res.json({ message: 'Profile updated successfully' });
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
