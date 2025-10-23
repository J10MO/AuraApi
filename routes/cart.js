const express = require("express")
const router = express.Router()
const cartController = require("../controllers/cartController")
const { authenticateJWT, isAdmin } = require("../middleware/auth")

// Protected routes - Cart (authentication required)
router.get("/", authenticateJWT, cartController.getCart)
router.post("/", authenticateJWT, cartController.addToCart)
router.put("/:product_id", authenticateJWT, cartController.updateCartItem)
router.delete("/:product_id", authenticateJWT, cartController.removeFromCart)
router.delete("/", authenticateJWT, cartController.clearCart)

router.get("/admin/all", authenticateJWT, isAdmin, cartController.getAllCarts)
router.get("/admin/customer/:userId", authenticateJWT, isAdmin, cartController.getCustomerCart)
router.delete(
  "/admin/customer/:userId/product/:productId",
  authenticateJWT,
  isAdmin,
  cartController.deleteCustomerCartItem,
)
router.delete("/admin/customer/:userId", authenticateJWT, isAdmin, cartController.clearCustomerCart)

module.exports = router
