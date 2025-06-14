const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/auth');
const bookingController = require('../controllers/bookingController');

// ✅ Customer creates a booking
router.post('/create', authenticateToken, bookingController.createBooking);

// ✅ Seller updates booking status
router.put('/update/:id', authenticateToken, bookingController.updateBooking);

// ✅ Get bookings for a customer
router.get('/customer', authenticateToken, bookingController.getCustomerBookings);

// ✅ Get bookings for a seller's restaurant
router.get('/seller', authenticateToken, bookingController.getSellerBookings);

module.exports = router;
