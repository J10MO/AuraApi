const express = require("express")
const router = express.Router()
const {
  createAd,
  getAllAds,
  getAdById,
  updateAd,
  deleteAd,
  incrementViewCount,
  incrementClickCount,
  getHomepageAds,
} = require("../controllers/adsController")
const { authenticateJWT, isAdmin } = require("../middleware/auth")

// Public routes - Ads (NO authentication required)
router.get("/homepage", getHomepageAds)
router.get("/", getAllAds)
router.get("/:id", getAdById)
router.patch("/:id/view", incrementViewCount)
router.patch("/:id/click", incrementClickCount)

// Admin routes - Ad management (authentication + admin role required)
router.post("/", authenticateJWT, isAdmin, createAd)
router.put("/:id", authenticateJWT, isAdmin, updateAd)
router.delete("/:id", authenticateJWT, isAdmin, deleteAd)

module.exports = router
