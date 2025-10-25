const rateLimit = require("express-rate-limit")

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 auth attempts per 15 minutes
  message: {
    success: false,
    message: "Too many authentication attempts, please try again later.",
    messageAr: "محاولات تسجيل دخول كثيرة جداً، يرجى المحاولة لاحقاً",
  },
  standardHeaders: true,
  legacyHeaders: false,
})

const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute window
  max: 1000, // 1000 requests per minute (very high limit)
  message: {
    success: false,
    message: "Too many requests, please slow down.",
    messageAr: "طلبات كثيرة جداً، يرجى التباطؤ",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    const isReadOnlyRoute =
      req.method === "GET" &&
      (req.path.includes("/products") || req.path.includes("/categories") || req.path.includes("/ads"))
    return isReadOnlyRoute
  },
})

const writeLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // 100 write operations per minute
  message: {
    success: false,
    message: "Too many requests, please try again later.",
    messageAr: "طلبات كثيرة جداً، يرجى المحاولة لاحقاً",
  },
  standardHeaders: true,
  legacyHeaders: false,
})

module.exports = { authLimiter, apiLimiter, writeLimiter }
