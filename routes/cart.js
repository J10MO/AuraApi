const express = require("express")
const router = express.Router()
const cartController = require("../controllers/cartController")
const { authenticateJWT } = require("../middleware/auth")

// Protected routes - Cart (authentication required)
router.get("/", authenticateJWT, cartController.getCart)
router.post("/", authenticateJWT, cartController.addToCart)
router.put("/:product_id", authenticateJWT, cartController.updateCartItem)
router.delete("/:product_id", authenticateJWT, cartController.removeFromCart)
router.delete("/", authenticateJWT, cartController.clearCart)

module.exports = router
