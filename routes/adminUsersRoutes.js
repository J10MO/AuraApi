const express = require("express")
const router = express.Router()
const adminUsersController = require("../controllers/adminController")
const { authenticateJWT, isAdmin } = require("../middleware/auth")

// All routes require admin authentication
router.use(authenticateJWT, isAdmin)

// Admin routes - User management
router.get("/stats", adminUsersController.getUsersStats)
router.get("/", adminUsersController.getUsers)
router.get("/:userId", adminUsersController.getUserById)
router.put("/:userId", adminUsersController.updateUser)
router.delete("/:userId", adminUsersController.deleteUser)

module.exports = router
