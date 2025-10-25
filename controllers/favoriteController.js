// const { pool } = require("../config/database")
// const { redisClient } = require("../config/redis")

// // Helper functions for cache
// async function getFromCache(key) {
//   if (!redisClient) return null
//   try {
//     const cached = await redisClient.get(key)
//     return cached ? JSON.parse(cached) : null
//   } catch (err) {
//     console.error("Redis get error:", err)
//     return null
//   }
// }

// async function setToCache(key, data, expiry = 1800) {
//   if (!redisClient) return
//   try {
//     await redisClient.setEx(key, expiry, JSON.stringify(data))
//   } catch (err) {
//     console.error("Redis set error:", err)
//   }
// }

// async function deleteFromCache(key) {
//   if (!redisClient) return
//   try {
//     await redisClient.del(key)
//   } catch (err) {
//     console.error("Redis delete error:", err)
//   }
// }

// const favoriteController = {
//   // إضافة منتج إلى المفضلة
//   async addToFavorites(req, res) {
//     const { productId } = req.params
//     const userId = req.user.id

//     try {
//       // التحقق من وجود المنتج
//       const productCheck = await pool.query(
//         "SELECT id, name, name_ar, image_url, price, discount FROM products WHERE id = $1 AND in_stock = true",
//         [productId],
//       )

//       if (productCheck.rows.length === 0) {
//         return res.status(404).json({
//           error: "Product not found",
//           message: "المنتج غير موجود أو غير متوفر",
//         })
//       }

//       // التحقق من عدم وجود المنتج في المفضلة مسبقاً
//       const existingFavorite = await pool.query("SELECT id FROM favorites WHERE user_id = $1 AND product_id = $2", [
//         userId,
//         productId,
//       ])

//       if (existingFavorite.rows.length > 0) {
//         return res.status(400).json({
//           error: "Product already in favorites",
//           message: "المنتج موجود بالفعل في المفضلة",
//         })
//       }

//       // إضافة المنتج إلى المفضلة
//       const result = await pool.query(
//         `INSERT INTO favorites (user_id, product_id) 
//          VALUES ($1, $2) 
//          RETURNING *`,
//         [userId, productId],
//       )

//       // مسح الكاش الخاص بقائمة مفضلات المستخدم
//       await deleteFromCache(`favorites:user:${userId}`)
//       await deleteFromCache(`favorites:count:${userId}`)

//       res.status(201).json({
//         message: "Product added to favorites",
//         message_ar: "تم إضافة المنتج إلى المفضلة",
//         favorite: result.rows[0],
//         product: productCheck.rows[0],
//       })
//     } catch (err) {
//       console.error("Error adding to favorites:", err)

//       if (err.code === "23503") {
//         return res.status(400).json({
//           error: "Invalid product",
//           message: "المنتج غير صحيح",
//         })
//       }

//       res.status(500).json({
//         error: "Server error",
//         message: "حدث خطأ في الخادم",
//       })
//     }
//   },

//   // إزالة منتج من المفضلة
//   async removeFromFavorites(req, res) {
//     const { productId } = req.params
//     const userId = req.user.id

//     try {
//       const result = await pool.query(
//         `DELETE FROM favorites 
//          WHERE user_id = $1 AND product_id = $2 
//          RETURNING *`,
//         [userId, productId],
//       )

//       if (result.rows.length === 0) {
//         return res.status(404).json({
//           error: "Favorite not found",
//           message: "المنتج غير موجود في المفضلة",
//         })
//       }

//       // مسح الكاش الخاص بقائمة مفضلات المستخدم
//       await deleteFromCache(`favorites:user:${userId}`)
//       await deleteFromCache(`favorites:count:${userId}`)

//       res.json({
//         message: "Product removed from favorites",
//         message_ar: "تم إزالة المنتج من المفضلة",
//         favorite: result.rows[0],
//       })
//     } catch (err) {
//       console.error("Error removing from favorites:", err)
//       res.status(500).json({
//         error: "Server error",
//         message: "حدث خطأ في الخادم",
//       })
//     }
//   },

//   // الحصول على قائمة المفضلات للمستخدم
//   async getFavorites(req, res) {
//     const userId = req.user.id
//     const { page = 1, limit = 20 } = req.query
//     const offset = (page - 1) * limit

//     try {
//       const cacheKey = `favorites:user:${userId}:page_${page}_limit_${limit}`

//       // محاولة جلب البيانات من الكاش
//       const cached = await getFromCache(cacheKey)
//       if (cached) {
//         return res.json(cached)
//       }

//       // جلب عدد المنتجات في المفضلة
//       const countResult = await pool.query("SELECT COUNT(*) FROM favorites WHERE user_id = $1", [userId])
//       const totalCount = Number.parseInt(countResult.rows[0].count)

//       // جلب المنتجات المفضلة مع معلومات المنتج
//       const result = await pool.query(
//         `SELECT 
//            p.*,
//            f.created_at as favorited_at,
//            c.name as category_name,
//            c.name_ar as category_name_ar
//          FROM favorites f
//          JOIN products p ON f.product_id = p.id
//          LEFT JOIN categories c ON p.category_id = c.id
//          WHERE f.user_id = $1 AND p.in_stock = true
//          ORDER BY f.created_at DESC
//          LIMIT $2 OFFSET $3`,
//         [userId, Number.parseInt(limit), offset],
//       )

//       const response = {
//         favorites: result.rows,
//         pagination: {
//           total: totalCount,
//           page: Number.parseInt(page),
//           limit: Number.parseInt(limit),
//           totalPages: Math.ceil(totalCount / limit),
//         },
//       }

//       // حفظ في الكاش
//       await setToCache(cacheKey, response, 1800)

//       res.json(response)
//     } catch (err) {
//       console.error("Error fetching favorites:", err)
//       res.status(500).json({
//         error: "Server error",
//         message: "حدث خطأ في الخادم",
//       })
//     }
//   },

//   // التحقق مما إذا كان المنتج في المفضلة
//   async checkFavorite(req, res) {
//     const { productId } = req.params
//     const userId = req.user.id

//     try {
//       const result = await pool.query(
//         `SELECT f.id, f.created_at, p.name, p.name_ar 
//          FROM favorites f
//          JOIN products p ON f.product_id = p.id
//          WHERE f.user_id = $1 AND f.product_id = $2`,
//         [userId, productId],
//       )

//       const isFavorite = result.rows.length > 0

//       res.json({
//         isFavorite,
//         favorite: isFavorite ? result.rows[0] : null,
//       })
//     } catch (err) {
//       console.error("Error checking favorite:", err)
//       res.status(500).json({
//         error: "Server error",
//         message: "حدث خطأ في الخادم",
//       })
//     }
//   },

//   // الحصول على عدد المنتجات في المفضلة
//   async getFavoritesCount(req, res) {
//     const userId = req.user.id

//     try {
//       const cacheKey = `favorites:count:${userId}`

//       const cached = await getFromCache(cacheKey)
//       if (cached) {
//         return res.json(cached)
//       }

//       const result = await pool.query("SELECT COUNT(*) FROM favorites WHERE user_id = $1", [userId])

//       const count = Number.parseInt(result.rows[0].count)

//       const response = { count }

//       await setToCache(cacheKey, response, 1800)

//       res.json(response)
//     } catch (err) {
//       console.error("Error fetching favorites count:", err)
//       res.status(500).json({
//         error: "Server error",
//         message: "حدث خطأ في الخادم",
//       })
//     }
//   },

//   // Admin: Get specific customer favorites
//   async getCustomerFavorites(req, res) {
//     const { userId } = req.params
//     const { page = 1, limit = 20 } = req.query
//     const offset = (page - 1) * limit

//     try {
//       const countResult = await pool.query("SELECT COUNT(*) FROM favorites WHERE user_id = $1", [userId])
//       const totalCount = Number.parseInt(countResult.rows[0].count)

//       const result = await pool.query(
//         `SELECT 
//            p.*,
//            f.created_at as favorited_at,
//            c.name as category_name,
//            c.name_ar as category_name_ar,
//            u.name as customer_name,
//            u.email as customer_email
//          FROM favorites f
//          JOIN products p ON f.product_id = p.id
//          JOIN users u ON f.user_id = u.id
//          LEFT JOIN categories c ON p.category_id = c.id
//          WHERE f.user_id = $1
//          ORDER BY f.created_at DESC
//          LIMIT $2 OFFSET $3`,
//         [userId, Number.parseInt(limit), offset],
//       )

//       res.json({
//         success: true,
//         favorites: result.rows,
//         pagination: {
//           total: totalCount,
//           page: Number.parseInt(page),
//           limit: Number.parseInt(limit),
//           totalPages: Math.ceil(totalCount / limit),
//         },
//       })
//     } catch (err) {
//       console.error("Error fetching customer favorites:", err)
//       res.status(500).json({
//         error: "Server error",
//         message: "حدث خطأ في الخادم",
//       })
//     }
//   },

//   // Admin: Get all favorites from all customers
//   async getAllFavorites(req, res) {
//     const { page = 1, limit = 50 } = req.query
//     const offset = (page - 1) * limit

//     try {
//       const countResult = await pool.query("SELECT COUNT(*) FROM favorites")
//       const totalCount = Number.parseInt(countResult.rows[0].count)

//       const result = await pool.query(
//         `SELECT 
//            f.*,
//            p.name as product_name,
//            p.name_ar as product_name_ar,
//            p.price,
//            p.image_url,
//            u.name as customer_name,
//            u.email as customer_email
//          FROM favorites f
//          JOIN products p ON f.product_id = p.id
//          JOIN users u ON f.user_id = u.id
//          ORDER BY f.created_at DESC
//          LIMIT $1 OFFSET $2`,
//         [Number.parseInt(limit), offset],
//       )

//       res.json({
//         success: true,
//         favorites: result.rows,
//         pagination: {
//           total: totalCount,
//           page: Number.parseInt(page),
//           limit: Number.parseInt(limit),
//           totalPages: Math.ceil(totalCount / limit),
//         },
//       })
//     } catch (err) {
//       console.error("Error fetching all favorites:", err)
//       res.status(500).json({
//         error: "Server error",
//         message: "حدث خطأ في الخادم",
//       })
//     }
//   },

//   // Admin: Delete customer favorite
//   async deleteCustomerFavorite(req, res) {
//     const { userId, productId } = req.params

//     try {
//       const result = await pool.query(
//         `DELETE FROM favorites 
//          WHERE user_id = $1 AND product_id = $2 
//          RETURNING *`,
//         [userId, productId],
//       )

//       if (result.rows.length === 0) {
//         return res.status(404).json({
//           error: "Favorite not found",
//           message: "المفضلة غير موجودة",
//         })
//       }

//       await deleteFromCache(`favorites:user:${userId}`)
//       await deleteFromCache(`favorites:count:${userId}`)

//       res.json({
//         success: true,
//         message: "Customer favorite deleted successfully",
//         message_ar: "تم حذف المفضلة بنجاح",
//         deleted_favorite: result.rows[0],
//       })
//     } catch (err) {
//       console.error("Error deleting customer favorite:", err)
//       res.status(500).json({
//         error: "Server error",
//         message: "حدث خطأ في الخادم",
//       })
//     }
//   },

//   // Admin: Clear all customer favorites
//   async clearCustomerFavorites(req, res) {
//     const { userId } = req.params

//     try {
//       const result = await pool.query(
//         `DELETE FROM favorites 
//          WHERE user_id = $1 
//          RETURNING *`,
//         [userId],
//       )

//       await deleteFromCache(`favorites:user:${userId}`)
//       await deleteFromCache(`favorites:count:${userId}`)

//       res.json({
//         success: true,
//         message: "All customer favorites cleared successfully",
//         message_ar: "تم مسح جميع المفضلات بنجاح",
//         deleted_count: result.rows.length,
//       })
//     } catch (err) {
//       console.error("Error clearing customer favorites:", err)
//       res.status(500).json({
//         error: "Server error",
//         message: "حدث خطأ في الخادم",
//       })
//     }
//   },
// }

// module.exports = favoriteController




const { pool } = require("../config/database")
const { redisClient } = require("../config/redis")

// Helper functions for cache
async function getFromCache(key) {
  if (!redisClient) return null
  try {
    const cached = await redisClient.get(key)
    return cached ? JSON.parse(cached) : null
  } catch (err) {
    console.error("Redis get error:", err)
    return null
  }
}

async function setToCache(key, data, expiry = 1800) {
  if (!redisClient) return
  try {
    await redisClient.setEx(key, expiry, JSON.stringify(data))
  } catch (err) {
    console.error("Redis set error:", err)
  }
}

async function deleteFromCache(key) {
  if (!redisClient) return
  try {
    await redisClient.del(key)
  } catch (err) {
    console.error("Redis delete error:", err)
  }
}

const favoriteController = {
  // إضافة منتج إلى المفضلة
  async addToFavorites(req, res) {
    const { productId } = req.params
    const userId = req.user.id

    try {
      // التحقق من وجود المنتج
      const productCheck = await pool.query(
        "SELECT id, name, name_ar, image_url, price, discount FROM products WHERE id = $1 AND in_stock = true",
        [productId],
      )

      if (productCheck.rows.length === 0) {
        return res.status(404).json({
          error: "Product not found",
          message: "المنتج غير موجود أو غير متوفر",
        })
      }

      // التحقق من عدم وجود المنتج في المفضلة مسبقاً
      const existingFavorite = await pool.query("SELECT id FROM favorites WHERE user_id = $1 AND product_id = $2", [
        userId,
        productId,
      ])

      if (existingFavorite.rows.length > 0) {
        return res.status(400).json({
          error: "Product already in favorites",
          message: "المنتج موجود بالفعل في المفضلة",
        })
      }

      // إضافة المنتج إلى المفضلة
      const result = await pool.query(
        `INSERT INTO favorites (user_id, product_id) 
         VALUES ($1, $2) 
         RETURNING *`,
        [userId, productId],
      )

      // مسح الكاش الخاص بقائمة مفضلات المستخدم
      await deleteFromCache(`favorites:user:${userId}`)
      await deleteFromCache(`favorites:count:${userId}`)

      res.status(201).json({
        message: "Product added to favorites",
        message_ar: "تم إضافة المنتج إلى المفضلة",
        favorite: result.rows[0],
        product: productCheck.rows[0],
      })
    } catch (err) {
      console.error("Error adding to favorites:", err)

      if (err.code === "23503") {
        return res.status(400).json({
          error: "Invalid product",
          message: "المنتج غير صحيح",
        })
      }

      res.status(500).json({
        error: "Server error",
        message: "��دث خطأ في الخادم",
      })
    }
  },

  // إزالة منتج من المفضلة
  async removeFromFavorites(req, res) {
    const { productId } = req.params
    const userId = req.user.id

    try {
      const result = await pool.query(
        `DELETE FROM favorites 
         WHERE user_id = $1 AND product_id = $2 
         RETURNING *`,
        [userId, productId],
      )

      if (result.rows.length === 0) {
        return res.status(404).json({
          error: "Favorite not found",
          message: "المنتج غير موجود في المفضلة",
        })
      }

      // مسح الكاش الخاص بقائمة مفضلات المستخدم
      await deleteFromCache(`favorites:user:${userId}`)
      await deleteFromCache(`favorites:count:${userId}`)

      res.json({
        message: "Product removed from favorites",
        message_ar: "تم إزالة المنتج من المفضلة",
        favorite: result.rows[0],
      })
    } catch (err) {
      console.error("Error removing from favorites:", err)
      res.status(500).json({
        error: "Server error",
        message: "حدث خطأ في الخادم",
      })
    }
  },

  // الحصول على قائمة المفضلات للمستخدم
  async getFavorites(req, res) {
    const userId = req.user.id
    const { page = 1, limit = 20 } = req.query
    const offset = (page - 1) * limit

    try {
      const cacheKey = `favorites:user:${userId}:page_${page}_limit_${limit}`

      // محاولة جلب البيانات من الكاش
      const cached = await getFromCache(cacheKey)
      if (cached) {
        return res.json(cached)
      }

      // جلب عدد المنتجات في المفضلة
      const countResult = await pool.query("SELECT COUNT(*) FROM favorites WHERE user_id = $1", [userId])
      const totalCount = Number.parseInt(countResult.rows[0].count)

      // جلب المنتجات المفضلة مع معلومات المنتج
      const result = await pool.query(
        `SELECT 
           p.*,
           f.created_at as favorited_at,
           c.name as category_name,
           c.name_ar as category_name_ar
         FROM favorites f
         JOIN products p ON f.product_id = p.id
         LEFT JOIN categories c ON p.category_id = c.id
         WHERE f.user_id = $1 AND p.in_stock = true
         ORDER BY f.created_at DESC
         LIMIT $2 OFFSET $3`,
        [userId, Number.parseInt(limit), offset],
      )

      const response = {
        favorites: result.rows,
        pagination: {
          total: totalCount,
          page: Number.parseInt(page),
          limit: Number.parseInt(limit),
          totalPages: Math.ceil(totalCount / limit),
        },
      }

      // حفظ في الكاش
      await setToCache(cacheKey, response, 1800)

      res.json(response)
    } catch (err) {
      console.error("Error fetching favorites:", err)
      res.status(500).json({
        error: "Server error",
        message: "حدث خطأ في الخادم",
      })
    }
  },

  // التحقق مما إذا كان المنتج في المفضلة
  async checkFavorite(req, res) {
    const { productId } = req.params
    const userId = req.user.id

    try {
      const result = await pool.query(
        `SELECT f.id, f.created_at, p.name, p.name_ar 
         FROM favorites f
         JOIN products p ON f.product_id = p.id
         WHERE f.user_id = $1 AND f.product_id = $2`,
        [userId, productId],
      )

      const isFavorite = result.rows.length > 0

      res.json({
        isFavorite,
        favorite: isFavorite ? result.rows[0] : null,
      })
    } catch (err) {
      console.error("Error checking favorite:", err)
      res.status(500).json({
        error: "Server error",
        message: "حدث خطأ في الخادم",
      })
    }
  },

  // الحصول على عدد المنتجات في المفضلة
  async getFavoritesCount(req, res) {
    const userId = req.user.id

    try {
      const cacheKey = `favorites:count:${userId}`

      const cached = await getFromCache(cacheKey)
      if (cached) {
        return res.json(cached)
      }

      const result = await pool.query("SELECT COUNT(*) FROM favorites WHERE user_id = $1", [userId])

      const count = Number.parseInt(result.rows[0].count)

      const response = { count }

      await setToCache(cacheKey, response, 1800)

      res.json(response)
    } catch (err) {
      console.error("Error fetching favorites count:", err)
      res.status(500).json({
        error: "Server error",
        message: "حدث خطأ في الخادم",
      })
    }
  },

  // Admin: Get specific customer favorites
  async getCustomerFavorites(req, res) {
    const { userId } = req.params
    const { page = 1, limit = 20 } = req.query
    const offset = (page - 1) * limit

    try {
      const countResult = await pool.query("SELECT COUNT(*) FROM favorites WHERE user_id = $1", [userId])
      const totalCount = Number.parseInt(countResult.rows[0].count)

      const result = await pool.query(
        `SELECT 
           p.*,
           f.created_at as favorited_at,
           c.name as category_name,
           c.name_ar as category_name_ar,
           u.name as customer_name,
           u.email as customer_email
         FROM favorites f
         JOIN products p ON f.product_id = p.id
         JOIN users u ON f.user_id = u.id
         LEFT JOIN categories c ON p.category_id = c.id
         WHERE f.user_id = $1
         ORDER BY f.created_at DESC
         LIMIT $2 OFFSET $3`,
        [userId, Number.parseInt(limit), offset],
      )

      res.json({
        success: true,
        favorites: result.rows,
        pagination: {
          total: totalCount,
          page: Number.parseInt(page),
          limit: Number.parseInt(limit),
          totalPages: Math.ceil(totalCount / limit),
        },
      })
    } catch (err) {
      console.error("Error fetching customer favorites:", err)
      res.status(500).json({
        error: "Server error",
        message: "حدث خطأ في الخادم",
      })
    }
  },

  // Admin: Get all favorites from all customers
  async getAllFavorites(req, res) {
    const { page = 1, limit = 50 } = req.query
    const offset = (page - 1) * limit

    try {
      const countResult = await pool.query("SELECT COUNT(*) FROM favorites")
      const totalCount = Number.parseInt(countResult.rows[0].count)

      const result = await pool.query(
        `SELECT 
           f.*,
           p.name as product_name,
           p.name_ar as product_name_ar,
           p.price,
           p.image_url,
           u.name as customer_name,
           u.email as customer_email
         FROM favorites f
         JOIN products p ON f.product_id = p.id
         JOIN users u ON f.user_id = u.id
         ORDER BY f.created_at DESC
         LIMIT $1 OFFSET $2`,
        [Number.parseInt(limit), offset],
      )

      res.json({
        success: true,
        favorites: result.rows,
        pagination: {
          total: totalCount,
          page: Number.parseInt(page),
          limit: Number.parseInt(limit),
          totalPages: Math.ceil(totalCount / limit),
        },
      })
    } catch (err) {
      console.error("Error fetching all favorites:", err)
      res.status(500).json({
        error: "Server error",
        message: "حدث خطأ في الخادم",
      })
    }
  },

  // Admin: Delete customer favorite
  async deleteCustomerFavorite(req, res) {
    const { userId, productId } = req.params

    try {
      const result = await pool.query(
        `DELETE FROM favorites 
         WHERE user_id = $1 AND product_id = $2 
         RETURNING *`,
        [userId, productId],
      )

      if (result.rows.length === 0) {
        return res.status(404).json({
          error: "Favorite not found",
          message: "المفضلة غير موجودة",
        })
      }

      await deleteFromCache(`favorites:user:${userId}`)
      await deleteFromCache(`favorites:count:${userId}`)

      res.json({
        success: true,
        message: "Customer favorite deleted successfully",
        message_ar: "تم حذف المفضلة بنجاح",
        deleted_favorite: result.rows[0],
      })
    } catch (err) {
      console.error("Error deleting customer favorite:", err)
      res.status(500).json({
        error: "Server error",
        message: "حدث خطأ في الخادم",
      })
    }
  },

  // Admin: Clear all customer favorites
  async clearCustomerFavorites(req, res) {
    const { userId } = req.params

    try {
      const result = await pool.query(
        `DELETE FROM favorites 
         WHERE user_id = $1 
         RETURNING *`,
        [userId],
      )

      await deleteFromCache(`favorites:user:${userId}`)
      await deleteFromCache(`favorites:count:${userId}`)

      res.json({
        success: true,
        message: "All customer favorites cleared successfully",
        message_ar: "تم مسح جميع المفضلات بنجاح",
        deleted_count: result.rows.length,
      })
    } catch (err) {
      console.error("Error clearing customer favorites:", err)
      res.status(500).json({
        error: "Server error",
        message: "حدث خطأ في الخادم",
      })
    }
  },
}

module.exports = favoriteController
