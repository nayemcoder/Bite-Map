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
// List all restaurants
router.get(
  "/restaurants",
  logRequest,
  restaurantController.getAllRestaurants
);
// Get one restaurant
router.get(
  "/restaurants/:id",
  logRequest,
  restaurantController.getRestaurant
);
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
router.get(
  "/restaurants/:id/menu",
  logRequest,
  menuController.getMenu
);
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
  bookingController.getUserBookings
);
router.put(
  "/bookings/:id/status",
  logRequest,
  authenticateToken,
  authorizeRoles(["seller"]),
  bookingController.updateBookingStatus
);
router.delete(
  "/bookings/:id",
  logRequest,
  authenticateToken,
  authorizeRoles(["customer", "seller"]),
  bookingController.deleteBooking
);

module.exports = router;