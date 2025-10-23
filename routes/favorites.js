const express = require("express")
const router = express.Router()
const favoriteController = require("../controllers/favoriteController")
const { authenticateJWT } = require("../middleware/auth")

// Protected routes - Favorites (authentication required)
router.get("/", authenticateJWT, favoriteController.getFavorites)
router.get("/count", authenticateJWT, favoriteController.getFavoritesCount)
router.get("/check/:productId", authenticateJWT, favoriteController.checkFavorite)
router.post("/:productId", authenticateJWT, favoriteController.addToFavorites)
router.delete("/:productId", authenticateJWT, favoriteController.removeFromFavorites)

module.exports = router
