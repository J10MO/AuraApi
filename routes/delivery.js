const express = require("express")
const router = express.Router()
const deliveryController = require("../controllers/deliveryController")
const { authenticateJWT, isAdmin } = require("../middleware/auth")

// Public route - track delivery by tracking number
router.get("/track/:trackingNumber", deliveryController.getDeliveryByTracking)

// Protected routes - require authentication
router.get("/", authenticateJWT, deliveryController.getDeliveries)
router.get("/order/:orderId", authenticateJWT, deliveryController.getDeliveryByOrderId)

// Admin only routes
router.post("/", authenticateJWT, isAdmin, deliveryController.createDelivery)
router.put("/:deliveryId", authenticateJWT, isAdmin, deliveryController.updateDelivery)
router.delete("/:deliveryId", authenticateJWT, isAdmin, deliveryController.deleteDelivery)

module.exports = router
