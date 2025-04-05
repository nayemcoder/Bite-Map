const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const mysql = require('mysql2');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');  // To hash passwords for secure storage

const app = express();
const PORT = 8080;

// Enable CORS
app.use(cors());

// MySQL database connection setup
const db = mysql.createConnection({
  host: '127.0.0.1',
  user: 'root',
  password: '',
  database: 'Restaurant',
});

// Connect to MySQL
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
    cb(null, 'uploads/');  // The directory to save uploaded files
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Filename with timestamp
  },
});

const upload = multer({ storage });

// Middleware to handle JSON and form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Handle sign-up route
app.post('/signup', upload.single('profilePic'), async (req, res) => {
  const { name, email, phone, password, role } = req.body;
  const profilePic = req.file ? req.file.path : null;

  // Hash the password before storing it
  const hashedPassword = await bcrypt.hash(password, 10);

  // Insert user data into MySQL database
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

// Handle login route
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Check if user exists in the database
  const query = 'SELECT user_id, email, password_hash, user_type FROM users WHERE email = ?';
  db.query(query, [email], async (err, results) => {
    if (err) {
      console.error('Database error during login:', err);
      return res.status(500).json({ message: 'Server error' });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = results[0];

    // Compare the hashed password using bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user.user_id, email: user.email, role: user.user_type }, 'your_secret_key', {
      expiresIn: '1d',  // Token expiry in 1 day
    });

    res.json({
      message: 'Login successful',
      token, // Send back the JWT token
    });
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
