// const express = require("express")
// const router = express.Router()
// const productController = require("../controllers/productController")
// const { authenticateJWT, isAdmin } = require("../middleware/auth")

// // Public routes - Products (NO authentication required)
// router.get("/", productController.getProducts)
// router.get("/featured", productController.getFeaturedProducts)
// router.get("/sale", productController.getProductsOnSale)
// router.get("/search", productController.searchProducts)
// router.get("/category/:categoryId", productController.getProductsByCategory)
// router.get("/:id", productController.getProduct)

// // Admin routes - Products (authentication + admin role required)
// router.post("/", authenticateJWT, isAdmin, productController.createProduct)
// router.put("/:id", authenticateJWT, isAdmin, productController.updateProduct)
// router.delete("/:id", authenticateJWT, isAdmin, productController.deleteProduct)

// module.exports = router




const express = require("express")
const router = express.Router()
const productController = require("../controllers/productController")
const { authenticateJWT, isAdmin } = require("../middleware/auth")

// Public routes - Products (NO authentication required)
router.get("/", productController.getProducts)
router.get("/featured", productController.getFeaturedProducts)
router.get("/sale", productController.getProductsOnSale)
router.get("/search", productController.searchProducts)
router.get("/category/:categoryId", productController.getProductsByCategory)
router.get("/:id", productController.getProduct)

router.get("/:id/ratings", productController.getProductRatings)
router.post("/:id/rate", authenticateJWT, productController.rateProduct)

// Admin routes - Products (authentication + admin role required)
router.post("/", authenticateJWT, isAdmin, productController.createProduct)
router.put("/:id", authenticateJWT, isAdmin, productController.updateProduct)
router.delete("/:id", authenticateJWT, isAdmin, productController.deleteProduct)

module.exports = router
