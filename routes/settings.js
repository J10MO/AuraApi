const express = require("express")
const router = express.Router()
const settingsController = require("../controllers/settingsController")
const { authenticateJWT, isAdmin } = require("../middleware/auth")

// Public route - Get delivery price
router.get("/delivery-price", settingsController.getDeliveryPrice)

// Admin routes
router.get("/", authenticateJWT, isAdmin, settingsController.getAllSettings)
router.put("/delivery-price", authenticateJWT, isAdmin, settingsController.updateDeliveryPrice)
router.put("/", authenticateJWT, isAdmin, settingsController.updateSetting)

module.exports = router
