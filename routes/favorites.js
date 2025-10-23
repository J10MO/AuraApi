const express = require("express")
const router = express.Router()
const favoriteController = require("../controllers/favoriteController")
const { authenticateJWT, isAdmin } = require("../middleware/auth")

// Protected routes - Favorites (authentication required)
router.get("/", authenticateJWT, favoriteController.getFavorites)
router.get("/count", authenticateJWT, favoriteController.getFavoritesCount)
router.get("/check/:productId", authenticateJWT, favoriteController.checkFavorite)
router.post("/:productId", authenticateJWT, favoriteController.addToFavorites)
router.delete("/:productId", authenticateJWT, favoriteController.removeFromFavorites)

router.get("/admin/all", authenticateJWT, isAdmin, favoriteController.getAllFavorites)
router.get("/admin/customer/:userId", authenticateJWT, isAdmin, favoriteController.getCustomerFavorites)
router.delete(
  "/admin/customer/:userId/product/:productId",
  authenticateJWT,
  isAdmin,
  favoriteController.deleteCustomerFavorite,
)
router.delete("/admin/customer/:userId", authenticateJWT, isAdmin, favoriteController.clearCustomerFavorites)

module.exports = router
