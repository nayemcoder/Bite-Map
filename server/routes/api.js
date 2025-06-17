// routes/api.js
const express  = require("express");
const router   = express.Router();
const path     = require("path");

// Controllers
const authController       = require("../controllers/authController");
const profileController    = require("../controllers/profileController");
const restaurantController = require("../controllers/restaurantController");
const bookingController    = require("../controllers/bookingController");

// Auth middleware
const { authenticateToken, authorizeRoles } = require("../middlewares/auth");
// Multer for uploads
const upload = require("../config/multer");
// Simple logger
const logRequest = (req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
};

/** AUTH **/
router.post("/auth/signup", logRequest, authController.signup);
router.post("/auth/login",  logRequest, authController.login);

/** CUSTOMER PROFILE **/
router.get(
  "/customers/profile",
  logRequest,
  authenticateToken,
  authorizeRoles(["customer"]),
  profileController.getCustomerProfile
);
router.put(
  "/customers/profile",
  logRequest,
  authenticateToken,
  authorizeRoles(["customer"]),
  upload.single("profileImage"),
  profileController.updateUserProfile
);

/** SELLER PROFILE **/
router.get(
  "/sellers/profile",
  logRequest,
  authenticateToken,
  authorizeRoles(["seller"]),
  profileController.getSellerProfile
);
router.put(
  "/sellers/profile",
  logRequest,
  authenticateToken,
  authorizeRoles(["seller"]),
  upload.single("profileImage"),
  profileController.updateUserProfile
);

/** RESTAURANTS **/
router.get("/restaurants", logRequest, restaurantController.getAllRestaurants);
router.get("/restaurants/:id", logRequest, restaurantController.getRestaurant);

router.post(
  "/sellers/restaurants",
  logRequest,
  authenticateToken,
  authorizeRoles(["seller"]),
  upload.single("cover_image"),
  restaurantController.createRestaurant
);

router.put(
  "/sellers/restaurants/:id",
  logRequest,
  authenticateToken,
  authorizeRoles(["seller"]),
  // only single cover image, no gallery
  upload.single("cover_image"),
  restaurantController.updateRestaurantDetails
);

/** BOOKINGS **/
router.post(
  "/bookings",
  logRequest,
  authenticateToken,
  authorizeRoles(["customer"]),
  bookingController.createBooking
);
router.get(
  "/customers/bookings",
  logRequest,
  authenticateToken,
  authorizeRoles(["customer"]),
  bookingController.getUserBookings
);
router.get(
  "/bookings",
  logRequest,
  authenticateToken,
  authorizeRoles(["seller"]),
  bookingController.getMyRestaurantBookings
);
router.put(
  "/bookings/:id/status",
  logRequest,
  authenticateToken,
  authorizeRoles(["seller"]),
  bookingController.updateBookingStatus
);

module.exports = router;