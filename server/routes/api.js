// routes/index.js
const express                  = require("express");
const router                   = express.Router();
const path                     = require("path");

// Controllers
const authController           = require("../controllers/authController");
const profileController        = require("../controllers/profileController");
const restaurantController     = require("../controllers/restaurantController");
const bookingController        = require("../controllers/bookingController");
const menuController           = require("../controllers/menuController");
const reviewController         = require("../controllers/reviewController");
const notificationController   = require("../controllers/notificationController");

// Auth middleware
const { authenticateToken, authorizeRoles } = require("../middlewares/auth");
// Multer for uploads
const upload = require("../config/multer");

// Simple logger
const logRequest = (req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
};

// ——————————————
// Booking validation middleware
// ——————————————
const validateBookingPayload = (req, res, next) => {
  const { table_id, table_ids } = req.body;

  // Must supply either single table_id or array table_ids
  const singleOK = table_id && typeof table_id === "number";
  const multiOK  = Array.isArray(table_ids) && table_ids.length > 0;
  if (!singleOK && !multiOK) {
    return res.status(400).json({
      message: "You must supply either a numeric table_id or a non-empty table_ids array."
    });
  }
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
// List all restaurants
router.get("/restaurants", logRequest, restaurantController.getAllRestaurants);
// Get one restaurant
router.get("/restaurants/:id", logRequest, restaurantController.getRestaurant);
// Get available tables (public)
router.get(
  "/restaurants/:id/available-tables",
  logRequest,
  restaurantController.getAvailableTables
);

// Reviews for a restaurant
router.get(
  "/restaurants/:restaurantId/reviews",
  logRequest,
  reviewController.getReviews
);
router.post(
  "/restaurants/:restaurantId/reviews",
  logRequest,
  authenticateToken,
  authorizeRoles(["customer"]),
  reviewController.addReview
);

// Seller creates a restaurant
router.post(
  "/sellers/restaurants",
  logRequest,
  authenticateToken,
  authorizeRoles(["seller"]),
  upload.single("cover_image"),
  restaurantController.createRestaurant
);
// Seller updates their restaurant
router.put(
  "/sellers/restaurants/:id",
  logRequest,
  authenticateToken,
  authorizeRoles(["seller"]),
  upload.single("cover_image"),
  restaurantController.updateRestaurantDetails
);

/** MENU ITEMS **/
// Public: list menu
router.get("/restaurants/:id/menu", logRequest, menuController.getMenu);
// Seller-only: add menu item
router.post(
  "/restaurants/:id/menu",
  logRequest,
  authenticateToken,
  authorizeRoles(["seller"]),
  upload.single("image"),
  menuController.addMenuItem
);
// Seller-only: update menu item
router.put(
  "/restaurants/:id/menu/:itemId",
  logRequest,
  authenticateToken,
  authorizeRoles(["seller"]),
  upload.single("image"),
  menuController.updateMenuItem
);
// Seller-only: delete menu item
router.delete(
  "/restaurants/:id/menu/:itemId",
  logRequest,
  authenticateToken,
  authorizeRoles(["seller"]),
  menuController.deleteMenuItem
);

/** TABLES (seller‐only) **/
router.get(
  "/sellers/restaurants/:id/tables",
  logRequest,
  authenticateToken,
  authorizeRoles(["seller"]),
  restaurantController.getRestaurantTables
);
router.post(
  "/sellers/restaurants/:id/tables",
  logRequest,
  authenticateToken,
  authorizeRoles(["seller"]),
  restaurantController.addRestaurantTable
);
router.delete(
  "/sellers/restaurants/:id/tables/:tableId",
  logRequest,
  authenticateToken,
  authorizeRoles(["seller"]),
  restaurantController.deleteRestaurantTable
);

/** BOOKINGS **/
// Create booking (customer)
router.post(
  "/bookings",
  logRequest,
  authenticateToken,
  authorizeRoles(["customer"]),
  validateBookingPayload,
  bookingController.createBooking
);

// Customer can view their bookings
router.get(
  "/customers/bookings",
  logRequest,
  authenticateToken,
  authorizeRoles(["customer"]),
  bookingController.getUserBookings
);

// Seller can view all bookings for their restaurants
router.get(
  "/seller/bookings",
  logRequest,
  authenticateToken,
  authorizeRoles(["seller"]),
  bookingController.getUserBookings
);

// Update booking status (seller)
router.put(
  "/bookings/:id/status",
  logRequest,
  authenticateToken,
  authorizeRoles(["seller"]),
  bookingController.updateBookingStatus
);

// Delete booking (customer or seller)
router.delete(
  "/bookings/:id",
  logRequest,
  authenticateToken,
  authorizeRoles(["customer", "seller"]),
  bookingController.deleteBooking
);

/** NOTIFICATIONS **/
// List notifications for current user
router.get(
  "/notifications",
  logRequest,
  authenticateToken,
  notificationController.getNotifications
);
// Mark a notification as read
router.put(
  "/notifications/:id/read",
  logRequest,
  authenticateToken,
  notificationController.markRead
);

module.exports = router;