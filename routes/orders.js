const express = require("express")
const router = express.Router()
const orderController = require("../controllers/orderController")
const { authenticateJWT, isAdmin } = require("../middleware/auth")

// User routes - Orders (authentication required)
router.post("/", authenticateJWT, orderController.createOrder)
router.get("/", authenticateJWT, orderController.getOrders)
router.get("/:orderId", authenticateJWT, orderController.getOrderById)
router.put("/:orderId/cancel", authenticateJWT, orderController.cancelOrder)

// Admin routes - Order management (authentication + admin role required)
router.put("/:orderId/status", authenticateJWT, isAdmin, orderController.updateOrderStatus)
router.put("/:orderId", authenticateJWT, isAdmin, orderController.updateOrder)
router.delete("/:orderId", authenticateJWT, isAdmin, orderController.deleteOrder)

module.exports = router
