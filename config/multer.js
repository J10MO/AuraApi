const multer = require("multer")
const path = require("path")
const fs = require("fs")

const isVercel = process.env.VERCEL === "1"
const baseUploadPath = isVercel ? "/tmp/uploads" : path.join(__dirname, "../uploads")

// إنشاء مجلدات التحميلات إذا لم تكن موجودة
const createUploadsDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true })
  }
}

// مجلدات مختلفة للملفات
const productsDir = path.join(baseUploadPath, "products")
const categoriesDir = path.join(baseUploadPath, "categories")
const adsDir = path.join(baseUploadPath, "ads")

// إنشاء المجلدات
createUploadsDir(productsDir)
createUploadsDir(categoriesDir)
createUploadsDir(adsDir)

const storage = isVercel
  ? multer.memoryStorage()
  : multer.diskStorage({
      destination: (req, file, cb) => {
        let uploadPath = productsDir // الافتراضي

        // تحديد مجلد الوجهة بناءً على نوع الطلب
        if (req.originalUrl.includes("/categories")) {
          uploadPath = categoriesDir
        } else if (req.originalUrl.includes("/ads")) {
          uploadPath = adsDir
        } else if (req.originalUrl.includes("/products")) {
          uploadPath = productsDir
        }

        cb(null, uploadPath)
      },
      filename: (req, file, cb) => {
        // إنشاء اسم فريد للملف
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
        const ext = path.extname(file.originalname)

        let prefix = "file"
        if (req.originalUrl.includes("/categories")) {
          prefix = "category"
        } else if (req.originalUrl.includes("/ads")) {
          prefix = "ad"
        } else if (req.originalUrl.includes("/products")) {
          prefix = "product"
        }

        cb(null, prefix + "-" + uniqueSuffix + ext)
      },
    })

const fileFilter = (req, file, cb) => {
  // التحقق من نوع الملف
  const allowedMimes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"]

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error("Invalid file type. Only JPEG, PNG, WebP and GIF images are allowed."), false)
  }
}

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
})

const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        error: "File too large",
        message: "حجم الملف كبير جداً. الحد الأقصى 5MB",
      })
    }
    if (err.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({
        error: "Unexpected field",
        message: "حقل غير متوقع",
      })
    }
  } else if (err) {
    return res.status(400).json({
      error: "File upload error",
      message: err.message,
    })
  }
  next()
}

module.exports = { upload, handleMulterError }
