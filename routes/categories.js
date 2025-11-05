// // const express = require("express")
// // const router = express.Router()
// // const categoryController = require("../controllers/categoryController")
// // const { authenticateJWT, isAdmin } = require("../middleware/auth")

// // // Public routes - Categories (NO authentication required)
// // router.get("/", categoryController.getCategories)
// // router.get("/:id", categoryController.getCategory)
// // router.get("/:id/products", categoryController.getCategoryProducts)

// // // Admin routes - Categories (authentication + admin role required)
// // router.post("/", authenticateJWT, isAdmin, categoryController.createCategory)
// // router.put("/:id", authenticateJWT, isAdmin, categoryController.updateCategory)
// // router.delete("/:id", authenticateJWT, isAdmin, categoryController.deleteCategory)

// // module.exports = router
// // //op



// // const express = require("express")
// // const router = express.Router()
// // const categoryController = require("../controllers/categoryController")
// // const { authenticateJWT, isAdmin } = require("../middleware/auth")

// // // Public routes - Categories (NO authentication required)
// // router.get("/", categoryController.getCategories)
// // router.get("/:id", categoryController.getCategory)
// // router.get("/:id/products", categoryController.getCategoryProducts)

// // // Admin routes - Categories (authentication + admin role required)
// // router.post("/", authenticateJWT, isAdmin, categoryController.createCategory)
// // router.put("/:id", authenticateJWT, isAdmin, categoryController.updateCategory)
// // router.delete("/:id", authenticateJWT, isAdmin, categoryController.deleteCategory)

// // module.exports = router
// // //op

// const express = require("express")
// const router = express.Router()
// const categoryController = require("../controllers/categoryController")
// const { authenticateJWT, isAdmin } = require("../middleware/auth")
// const { upload, handleMulterError } = require("../config/multer")

// // Public routes - Categories (NO authentication required)
// router.get("/", categoryController.getCategories)
// router.get("/:id", categoryController.getCategory)
// router.get("/:id/products", categoryController.getCategoryProducts)

// // Admin routes - Categories (authentication + admin role required)
// router.post("/", authenticateJWT, isAdmin, upload.single("image"), handleMulterError, categoryController.createCategory)
// router.put(
//   "/:id",
//   authenticateJWT,
//   isAdmin,
//   upload.single("image"),
//   handleMulterError,
//   categoryController.updateCategory,
// )
// router.delete("/:id", authenticateJWT, isAdmin, categoryController.deleteCategory)

// module.exports = router


const express = require("express")
const router = express.Router()
const categoryController = require("../controllers/categoryController")
const { authenticateJWT, isAdmin } = require("../middleware/auth")
const { upload, handleMulterError } = require("../config/multer")
const { compressImage } = require("../middleware/imageCompression")

// Public routes - Categories (NO authentication required)
router.get("/", categoryController.getCategories)
router.get("/:id", categoryController.getCategory)
router.get("/:id/products", categoryController.getCategoryProducts)

// Admin routes - Categories (authentication + admin role required)
router.post(
  "/",
  authenticateJWT,
  isAdmin,
  upload.single("image"),
  compressImage,
  handleMulterError,
  categoryController.createCategory,
)
router.put(
  "/:id",
  authenticateJWT,
  isAdmin,
  upload.single("image"),
  compressImage,
  handleMulterError,
  categoryController.updateCategory,
)
router.delete("/:id", authenticateJWT, isAdmin, categoryController.deleteCategory)

module.exports = router
