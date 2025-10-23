require("dotenv").config()
const express = require("express")
const cors = require("cors")
const bodyParser = require("body-parser")
const path = require("path")
const compression = require("compression")
const helmet = require("helmet")

const { initDatabase } = require("./config/database")
const { initRedis } = require("./config/redis")
const { apiLimiter } = require("./middleware/rateLimit")
const errorHandler = require("./middleware/errorHandler")

// Import routes
const adsRoutes = require("./routes/ads")
const adminUsersRoutes = require("./routes/adminUsersRoutes")
const authRoutes = require("./routes/auth")
const cartRoutes = require("./routes/cart")
const categoryRoutes = require("./routes/categories") // Added categories routes
const favoritesRoutes = require("./routes/favorites") // Added favorites routes
const orderRoutes = require("./routes/orders")
const productRoutes = require("./routes/products")

const app = express()

// Initialize services
initDatabase()
initRedis()

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
)
app.use(compression())

app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        process.env.CLIENT_URL || "http://localhost:5173",
        "http://localhost:5173",
        "http://localhost:3000",
      ]

      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true)

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true)
      } else {
        callback(new Error("Not allowed by CORS"))
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    exposedHeaders: ["Content-Range", "X-Content-Range"],
    maxAge: 86400, // 24 hours
  }),
)

app.use(bodyParser.json({ limit: "10mb" }))
app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }))

app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"), {
    maxAge: "1d",
    etag: true,
  }),
)

app.use("/api", apiLimiter)

// Public & Protected routes
app.use("/api/ads", adsRoutes)
app.use("/api/auth", authRoutes)
app.use("/api/cart", cartRoutes)
app.use("/api/categories", categoryRoutes)
app.use("/api/favorites", favoritesRoutes)
app.use("/api/orders", orderRoutes)
app.use("/api/products", productRoutes)

// Admin routes
app.use("/api/admin/users", adminUsersRoutes)

app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
  })
})

app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.originalUrl,
  })
})

app.use(errorHandler)

module.exports = app
