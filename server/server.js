const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const mysql = require('mysql2');

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
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Middleware to handle JSON and form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Handle sign-up route
app.post('/signup', upload.single('profilePic'), (req, res) => {
  const { name, email, phone, password, role } = req.body;
  const profilePic = req.file ? req.file.path : null;

  // Insert user data into MySQL database
  const query =
    'INSERT INTO users (full_name, email, phone, password_hash, user_type, profile_image) VALUES (?, ?, ?, ?, ?, ?)';
  const values = [name, email, phone, password, role, profilePic];

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

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
