// server.js
const path = require('path');
const express = require('express');
require('dotenv').config();

const app = express();

// parse JSON bodies
app.use(express.json());

// serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// mount all routes at root
app.use('/', require('./routes/api'));

// catch-all 404
app.use((req, res) => {
  res.status(404).json({ message: 'Not found' });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`));