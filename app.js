// // // require("dotenv").config()
// // // const express = require("express")
// // // const cors = require("cors")
// // // const bodyParser = require("body-parser")
// // // const path = require("path")
// // // const compression = require("compression")
// // // const helmet = require("helmet")

// // // const { initDatabase } = require("./config/database")
// // // const { initRedis } = require("./config/redis")
// // // const { apiLimiter } = require("./middleware/rateLimit")
// // // const errorHandler = require("./middleware/errorHandler")

// // // // Import routes
// // // const adsRoutes = require("./routes/ads")
// // // const adminUsersRoutes = require("./routes/adminUsersRoutes")
// // // const authRoutes = require("./routes/auth")
// // // const cartRoutes = require("./routes/cart")
// // // const categoryRoutes = require("./routes/categories") // Added categories routes
// // // const favoritesRoutes = require("./routes/favorites") // Added favorites routes
// // // const orderRoutes = require("./routes/orders")
// // // const productRoutes = require("./routes/products")

// // // const app = express()

// // // // Initialize services
// // // initDatabase()
// // // initRedis()

// // // app.use(
// // //   helmet({
// // //     crossOriginResourcePolicy: { policy: "cross-origin" },
// // //   }),
// // // )
// // // app.use(compression())

// // // app.use(
// // //   cors({
// // //     origin: (origin, callback) => {
// // //       const allowedOrigins = [
// // //         process.env.CLIENT_URL || "http://localhost:5173",
// // //         "http://localhost:5173",
// // //         "http://localhost:3000",
// // //       ]

// // //       // Allow requests with no origin (like mobile apps or curl requests)
// // //       if (!origin) return callback(null, true)

// // //       if (allowedOrigins.indexOf(origin) !== -1) {
// // //         callback(null, true)
// // //       } else {
// // //         callback(new Error("Not allowed by CORS"))
// // //       }
// // //     },
// // //     credentials: true,
// // //     methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
// // //     allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
// // //     exposedHeaders: ["Content-Range", "X-Content-Range"],
// // //     maxAge: 86400, // 24 hours
// // //   }),
// // // )

// // // app.use(bodyParser.json({ limit: "10mb" }))
// // // app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }))

// // // app.use(
// // //   "/uploads",
// // //   express.static(path.join(__dirname, "uploads"), {
// // //     maxAge: "1d",
// // //     etag: true,
// // //   }),
// // // )

// // // app.use("/api", apiLimiter)

// // // // Public & Protected routes
// // // app.use("/api/ads", adsRoutes)
// // // app.use("/api/auth", authRoutes)
// // // app.use("/api/cart", cartRoutes)
// // // app.use("/api/categories", categoryRoutes)
// // // app.use("/api/favorites", favoritesRoutes)
// // // app.use("/api/orders", orderRoutes)
// // // app.use("/api/products", productRoutes)

// // // // Admin routes
// // // app.use("/api/admin/users", adminUsersRoutes)

// // // app.get("/health", (req, res) => {
// // //   res.json({
// // //     status: "OK",
// // //     timestamp: new Date().toISOString(),
// // //     uptime: process.uptime(),
// // //     environment: process.env.NODE_ENV || "development",
// // //   })
// // // })

// // // app.use("*", (req, res) => {
// // //   res.status(404).json({
// // //     success: false,
// // //     message: "Route not found",
// // //     path: req.originalUrl,
// // //   })
// // // })

// // // app.use(errorHandler)

// // // module.exports = app




// // require("dotenv").config()
// // const express = require("express")
// // const cors = require("cors")
// // const bodyParser = require("body-parser")
// // const path = require("path")
// // const compression = require("compression")
// // const helmet = require("helmet")

// // const { initDatabase } = require("./config/database")
// // const { initRedis } = require("./config/redis")
// // const { apiLimiter } = require("./middleware/rateLimit")
// // const errorHandler = require("./middleware/errorHandler")

// // // Import routes
// // const adsRoutes = require("./routes/ads")
// // const adminUsersRoutes = require("./routes/adminUsersRoutes")
// // const authRoutes = require("./routes/auth")
// // const cartRoutes = require("./routes/cart")
// // const categoryRoutes = require("./routes/categories") // Added categories routes
// // const favoritesRoutes = require("./routes/favorites") // Added favorites routes
// // const orderRoutes = require("./routes/orders")
// // const productRoutes = require("./routes/products")

// // const app = express()

// // // Initialize services
// // initDatabase()
// // initRedis()

// // app.use(
// //   helmet({
// //     crossOriginResourcePolicy: { policy: "cross-origin" },
// //   }),
// // )
// // app.use(compression())

// // // CORS configuration using environment variables
// // app.use(
// //   cors({
// //     origin: (origin, callback) => {
// //       // Parse ALLOWED_ORIGINS from environment variable
// //       const allowedOrigins = process.env.ALLOWED_ORIGINS 
// //         ? process.env.ALLOWED_ORIGINS.split(',') 
// //         : [
// //           "https://www.auraiq.site",
// //             "http://localhost:5173",
// //             "http://localhost:3000",
// //             "https://aura-dashbuard.vercel.app"
// //           ];

// //       // Add individual environment variables if needed
// //       if (process.env.DASHBOARD_URL && !allowedOrigins.includes(process.env.DASHBOARD_URL)) {
// //         allowedOrigins.push(process.env.DASHBOARD_URL);
// //       }
      
// //       if (process.env.WEBSITE_URL && !allowedOrigins.includes(process.env.WEBSITE_URL)) {
// //         allowedOrigins.push(process.env.WEBSITE_URL);
// //       }

// //       // Allow requests with no origin (like mobile apps or curl requests)
// //       if (!origin) return callback(null, true);

// //       if (allowedOrigins.includes(origin)) {
// //         callback(null, true);
// //       } else {
// //         console.log(`CORS blocked for origin: ${origin}. Allowed: ${allowedOrigins.join(', ')}`);
// //         callback(new Error("Not allowed by CORS"));
// //       }
// //     },
// //     credentials: true,
// //     methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
// //     allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
// //     exposedHeaders: ["Content-Range", "X-Content-Range"],
// //     maxAge: 86400,
// //   }),
// // );

// // app.use(bodyParser.json({ limit: "10mb" }))
// // app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }))

// // app.use(
// //   "/uploads",
// //   express.static(path.join(__dirname, "uploads"), {
// //     maxAge: "1d",
// //     etag: true,
// //   }),
// // )

// // app.use("/api", apiLimiter)

// // app.get("/", (req, res) => {
// //   res.json({
// //     success: true,
// //     message: "Beauty Shop API",
// //     version: "1.0.0",
// //     endpoints: {
// //       auth: "/api/auth",
// //       products: "/api/products",
// //       categories: "/api/categories",
// //       cart: "/api/cart",
// //       orders: "/api/orders",
// //       favorites: "/api/favorites",
// //       ads: "/api/ads",
// //       admin: "/api/admin/users",
// //     },
// //     health: "/health",
// //     documentation: "https://github.com/J10MO/AuraApi",
// //   })
// // })

// // // Public & Protected routes
// // app.use("/api/ads", adsRoutes)
// // app.use("/api/auth", authRoutes)
// // app.use("/api/cart", cartRoutes)
// // app.use("/api/categories", categoryRoutes)
// // app.use("/api/favorites", favoritesRoutes)
// // app.use("/api/orders", orderRoutes)
// // app.use("/api/products", productRoutes)

// // // Admin routes
// // app.use("/api/admin/users", adminUsersRoutes)

// // app.get("/health", (req, res) => {
// //   res.json({
// //     status: "OK",
// //     timestamp: new Date().toISOString(),
// //     uptime: process.uptime(),
// //     environment: process.env.NODE_ENV || "development",
// //   })
// // })

// // app.use("*", (req, res) => {
// //   res.status(404).json({
// //     success: false,
// //     message: "Route not found",
// //     path: req.originalUrl,
// //   })
// // })

// // app.use(errorHandler)

// // module.exports = app






// require("dotenv").config()
// const express = require("express")
// const cors = require("cors")
// const bodyParser = require("body-parser")
// const path = require("path")
// const compression = require("compression")
// const helmet = require("helmet")

// const { initDatabase } = require("./config/database")
// const { initRedis } = require("./config/redis")
// const { apiLimiter } = require("./middleware/rateLimit")
// const errorHandler = require("./middleware/errorHandler")

// // Import routes
// const adsRoutes = require("./routes/ads")
// const adminUsersRoutes = require("./routes/adminUsersRoutes")
// const authRoutes = require("./routes/auth")
// const cartRoutes = require("./routes/cart")
// const categoryRoutes = require("./routes/categories")
// const favoritesRoutes = require("./routes/favorites")
// const orderRoutes = require("./routes/orders")
// const productRoutes = require("./routes/products")

// const app = express()

// // Initialize services
// initDatabase()
// initRedis()

// app.use(
//   helmet({
//     crossOriginResourcePolicy: { policy: "cross-origin" },
//   }),
// )
// app.use(compression())

// // Enhanced CORS configuration with better debugging
// app.use(
//   cors({
//     origin: (origin, callback) => {
//       // Parse ALLOWED_ORIGINS from environment variable
//       const allowedOrigins = process.env.ALLOWED_ORIGINS 
//         ? process.env.ALLOWED_ORIGINS.split(',').map(url => url.trim())
//         : [];

//       // Add individual environment variables (remove trailing slashes)
//       const dashboardUrl = process.env.DASHBOARD_URL ? process.env.DASHBOARD_URL.replace(/\/$/, "") : null;
//       const websiteUrl = process.env.WEBSITE_URL ? process.env.WEBSITE_URL.replace(/\/$/, "") : null;

//       if (dashboardUrl && !allowedOrigins.includes(dashboardUrl)) {
//         allowedOrigins.push(dashboardUrl);
//       }
      
//       if (websiteUrl && !allowedOrigins.includes(websiteUrl)) {
//         allowedOrigins.push(websiteUrl);
//       }

//       // Fallback to default origins if none specified
//       if (allowedOrigins.length === 0) {
//         allowedOrigins.push(
//           "https://www.auraiq.site",
//           "http://localhost:5173",
//           "http://localhost:3000",
//           "https://aura-dashbuard.vercel.app"
//         );
//       }

//       console.log('Allowed origins:', allowedOrigins);
//       console.log('Request origin:', origin);

//       // Allow requests with no origin (like mobile apps or curl requests)
//       if (!origin) {
//         console.log('No origin - allowing request');
//         return callback(null, true);
//       }

//       // Check if origin is in allowed list
//       if (allowedOrigins.includes(origin)) {
//         console.log('Origin allowed:', origin);
//         callback(null, true);
//       } else {
//         console.log(`CORS blocked for origin: ${origin}. Allowed: ${allowedOrigins.join(', ')}`);
//         callback(new Error("Not allowed by CORS"));
//       }
//     },
//     credentials: true,
//     methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
//     allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
//     exposedHeaders: ["Content-Range", "X-Content-Range"],
//     maxAge: 86400,
//   }),
// );

// app.use(bodyParser.json({ limit: "10mb" }))
// app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }))

// app.use(
//   "/uploads",
//   express.static(path.join(__dirname, "uploads"), {
//     maxAge: "1d",
//     etag: true,
//   }),
// )

// app.use("/api", apiLimiter)

// // Test route to check CORS
// app.options('*', cors()) // Enable pre-flight for all routes

// app.get("/", (req, res) => {
//   res.json({
//     success: true,
//     message: "Beauty Shop API",
//     version: "1.0.0",
//     endpoints: {
//       auth: "/api/auth",
//       products: "/api/products",
//       categories: "/api/categories",
//       cart: "/api/cart",
//       orders: "/api/orders",
//       favorites: "/api/favorites",
//       ads: "/api/ads",
//       admin: "/api/admin/users",
//     },
//     health: "/health",
//     documentation: "https://github.com/J10MO/AuraApi",
//   })
// })

// // Public & Protected routes
// app.use("/api/ads", adsRoutes)
// app.use("/api/auth", authRoutes)
// app.use("/api/cart", cartRoutes)
// app.use("/api/categories", categoryRoutes)
// app.use("/api/favorites", favoritesRoutes)
// app.use("/api/orders", orderRoutes)
// app.use("/api/products", productRoutes)

// // Admin routes
// app.use("/api/admin/users", adminUsersRoutes)

// app.get("/health", (req, res) => {
//   res.json({
//     status: "OK",
//     timestamp: new Date().toISOString(),
//     uptime: process.uptime(),
//     environment: process.env.NODE_ENV || "development",
//   })
// })

// app.use("*", (req, res) => {
//   res.status(404).json({
//     success: false,
//     message: "Route not found",
//     path: req.originalUrl,
//   })
// })

// app.use(errorHandler)

// module.exports = app






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
const categoryRoutes = require("./routes/categories")
const favoritesRoutes = require("./routes/favorites")
const orderRoutes = require("./routes/orders")
const productRoutes = require("./routes/products")

const app = express()

let initialized = false
async function initialize() {
  if (!initialized) {
    await initDatabase()
    await initRedis()
    initialized = true
  }
}

// Initialize on first request
app.use(async (req, res, next) => {
  await initialize()
  next()
})

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
)
app.use(compression())

// Enhanced CORS configuration with better debugging
app.use(
  cors({
    origin: (origin, callback) => {
      // Parse ALLOWED_ORIGINS from environment variable
      const allowedOrigins = process.env.ALLOWED_ORIGINS
        ? process.env.ALLOWED_ORIGINS.split(",").map((url) => url.trim())
        : []

      // Add individual environment variables (remove trailing slashes)
      const dashboardUrl = process.env.DASHBOARD_URL ? process.env.DASHBOARD_URL.replace(/\/$/, "") : null
      const websiteUrl = process.env.WEBSITE_URL ? process.env.WEBSITE_URL.replace(/\/$/, "") : null

      if (dashboardUrl && !allowedOrigins.includes(dashboardUrl)) {
        allowedOrigins.push(dashboardUrl)
      }

      if (websiteUrl && !allowedOrigins.includes(websiteUrl)) {
        allowedOrigins.push(websiteUrl)
      }

      // Fallback to default origins if none specified
      if (allowedOrigins.length === 0) {
        allowedOrigins.push(
          "https://www.auraiq.site",
          "http://localhost:5173",
          "http://localhost:3000",
          "https://aura-dashbuard.vercel.app",
        )
      }

      console.log("Allowed origins:", allowedOrigins)
      console.log("Request origin:", origin)

      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) {
        console.log("No origin - allowing request")
        return callback(null, true)
      }

      // Check if origin is in allowed list
      if (allowedOrigins.includes(origin)) {
        console.log("Origin allowed:", origin)
        callback(null, true)
      } else {
        console.log(`CORS blocked for origin: ${origin}. Allowed: ${allowedOrigins.join(", ")}`)
        callback(new Error("Not allowed by CORS"))
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    exposedHeaders: ["Content-Range", "X-Content-Range"],
    maxAge: 86400,
  }),
)

app.use(bodyParser.json({ limit: "10mb" }))
app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }))

const uploadsPath = process.env.VERCEL === "1" ? "/tmp/uploads" : path.join(__dirname, "uploads")
app.use(
  "/uploads",
  express.static(uploadsPath, {
    maxAge: "1d",
    etag: true,
  }),
)

app.use("/api", apiLimiter)

// Test route to check CORS
app.options("*", cors()) // Enable pre-flight for all routes

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Beauty Shop API",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      products: "/api/products",
      categories: "/api/categories",
      cart: "/api/cart",
      orders: "/api/orders",
      favorites: "/api/favorites",
      ads: "/api/ads",
      admin: "/api/admin/users",
    },
    health: "/health",
    documentation: "https://github.com/J10MO/AuraApi",
  })
})

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
