const express = require("express")
const router = express.Router()
const authController = require("../controllers/authController")
const { authenticateJWT, isAdmin } = require("../middleware/auth")
const { authLimiter } = require("../middleware/rateLimit")

// Public routes - Authentication (with rate limiting)
router.post("/send-otp", authLimiter, authController.sendOTP)
router.post("/verify-otp", authLimiter, authController.verifyOTP)
router.post("/resend-otp", authLimiter, authController.resendOTP)

// Protected routes - Profile (authentication required)
router.get("/profile", authenticateJWT, authController.getProfile)
router.put("/profile", authenticateJWT, authController.updateProfile)

// These routes are now in the admin routes file:
// - POST /admin/users/promote (was /auth/promote-to-admin)
// - PUT /admin/users/:userId/role (was /auth/change-role)

module.exports = router
