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

async function setToCache(key, data, expiry = 3600) {
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

// دالة للتحقق من صحة URL الصورة
function isValidImageUrl(url) {
  if (!url) return true

  try {
    const parsedUrl = new URL(url)
    const allowedProtocols = ["http:", "https:"]
    const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg", ".bmp", ".avif"]

    if (!allowedProtocols.includes(parsedUrl.protocol)) {
      return false
    }

    const pathname = parsedUrl.pathname.toLowerCase()
    const hasValidExtension = allowedExtensions.some((ext) => pathname.endsWith(ext))

    return hasValidExtension || pathname.includes("/images/") || pathname.includes("/products/")
  } catch (err) {
    return false
  }
}

const productController = {
  // Create new product (Admin only)
  async createProduct(req, res) {
    const {
      name,
      name_ar,
      brand,
      price,
      original_price,
      description,
      description_ar,
      category_id,
      emoji_icon,
      in_stock = true,
      discount = 0,
      badge,
      image_url,
      stock_quantity = 0,
    } = req.body

    // Validation
    if (!name || !name_ar || !price || !category_id) {
      return res.status(400).json({
        error: "Missing required fields",
        message: "يجب إدخال جميع الحقول المطلوبة (الاسم، الاسم العربي، السعر، التصنيف)",
      })
    }

    if (price < 0) {
      return res.status(400).json({
        error: "Invalid price",
        message: "السعر يجب أن يكون رقم موجب",
      })
    }

    if (discount < 0 || discount > 100) {
      return res.status(400).json({
        error: "Invalid discount",
        message: "الخصم يجب أن يكون بين 0 و 100",
      })
    }

    // التحقق من صحة رابط الصورة إذا تم تقديمه
    if (image_url && !isValidImageUrl(image_url)) {
      return res.status(400).json({
        error: "Invalid image URL",
        message: "رابط الصورة غير صالح",
      })
    }

    try {
      // Check if category exists
      const categoryCheck = await pool.query("SELECT id, name FROM categories WHERE id = $1", [category_id])

      if (categoryCheck.rows.length === 0) {
        return res.status(400).json({
          error: "Category not found",
          message: "التصنيف غير موجود",
        })
      }

      // Calculate sale price if discount is provided
      const salePrice = discount > 0 ? price * (1 - discount / 100) : null

      const result = await pool.query(
        `INSERT INTO products (
          name, name_ar, brand, price, original_price, description, 
          description_ar, category_id, image_url, emoji_icon, 
          in_stock, discount, badge, stock_quantity, sale_price
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        RETURNING *`,
        [
          name,
          name_ar,
          brand,
          Number.parseFloat(price),
          original_price ? Number.parseFloat(original_price) : null,
          description,
          description_ar,
          Number.parseInt(category_id),
          image_url,
          emoji_icon,
          Boolean(in_stock),
          Number.parseFloat(discount),
          badge,
          Number.parseInt(stock_quantity),
          salePrice,
        ],
      )

      // Update category product count
      await pool.query("UPDATE categories SET product_count = product_count + 1 WHERE id = $1", [category_id])

      // Clear relevant caches
      await deleteFromCache("categories:all")
      await deleteFromCache("products:all")
      await deleteFromCache("products:featured")
      await deleteFromCache("products:sale")

      res.status(201).json({
        message: "Product created successfully",
        message_ar: "تم إنشاء المنتج بنجاح",
        product: result.rows[0],
        category: categoryCheck.rows[0],
      })
    } catch (err) {
      console.error("Error creating product:", err)

      // Handle specific errors
      if (err.code === "23503") {
        return res.status(400).json({
          error: "Invalid category",
          message: "التصنيف غير صحيح",
        })
      }

      if (err.code === "23505") {
        return res.status(400).json({
          error: "Product already exists",
          message: "المنتج موجود مسبقاً",
        })
      }

      res.status(500).json({ error: "Server error" })
    }
  },

  // Update product (Admin only)
  async updateProduct(req, res) {
    const { id } = req.params
    const {
      name,
      name_ar,
      brand,
      price,
      original_price,
      description,
      description_ar,
      category_id,
      emoji_icon,
      in_stock,
      discount,
      badge,
      image_url,
      stock_quantity,
    } = req.body

    try {
      // التحقق من صحة رابط الصورة إذا تم تقديمه
      if (image_url && !isValidImageUrl(image_url)) {
        return res.status(400).json({
          error: "Invalid image URL",
          message: "رابط الصورة غير صالح",
        })
      }

      // Calculate sale price if discount is provided
      const salePrice = discount > 0 ? price * (1 - discount / 100) : null

      const query = `
        UPDATE products SET 
          name = COALESCE($1, name),
          name_ar = COALESCE($2, name_ar),
          brand = COALESCE($3, brand),
          price = COALESCE($4, price),
          original_price = COALESCE($5, original_price),
          description = COALESCE($6, description),
          description_ar = COALESCE($7, description_ar),
          category_id = COALESCE($8, category_id),
          emoji_icon = COALESCE($9, emoji_icon),
          in_stock = COALESCE($10, in_stock),
          discount = COALESCE($11, discount),
          badge = COALESCE($12, badge),
          image_url = COALESCE($13, image_url),
          stock_quantity = COALESCE($14, stock_quantity),
          sale_price = $15,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $16 
        RETURNING *
      `

      const params = [
        name,
        name_ar,
        brand,
        price,
        original_price,
        description,
        description_ar,
        category_id,
        emoji_icon,
        in_stock,
        discount,
        badge,
        image_url,
        stock_quantity,
        salePrice,
        id,
      ]

      const result = await pool.query(query, params)

      if (result.rows.length === 0) {
        return res.status(404).json({
          error: "Product not found",
          message: "المنتج غير موجود",
        })
      }

      // Clear caches
      await deleteFromCache(`product:${id}`)
      await deleteFromCache("products:all")
      await deleteFromCache("products:featured")
      await deleteFromCache("products:sale")
      await deleteFromCache("categories:all")

      res.json({
        message: "Product updated successfully",
        message_ar: "تم تحديث المنتج بنجاح",
        product: result.rows[0],
      })
    } catch (err) {
      console.error("Error updating product:", err)
      res.status(500).json({ error: "Server error" })
    }
  },

  // Delete product (Admin only)
  async deleteProduct(req, res) {
    const { id } = req.params

    try {
      console.log("[v0] Attempting to delete product:", id)

      // Get product info before deletion for category update
      const productResult = await pool.query("SELECT category_id, name FROM products WHERE id = $1", [id])

      if (productResult.rows.length === 0) {
        return res.status(404).json({
          error: "Product not found",
          message: "المنتج غير موجود",
        })
      }

      const { category_id, name } = productResult.rows[0]
      console.log("[v0] Product found:", name, "Category:", category_id)

      // Delete from cart_items
      const cartDelete = await pool.query("DELETE FROM cart_items WHERE product_id = $1", [id])
      console.log("[v0] Deleted cart items:", cartDelete.rowCount)

      // Delete from favorites
      const favDelete = await pool.query("DELETE FROM favorites WHERE product_id = $1", [id])
      console.log("[v0] Deleted favorites:", favDelete.rowCount)

      // Note: We don't delete order_items as they are historical records
      // Instead, we just delete the product and let the order history remain

      // Delete the product
      const result = await pool.query("DELETE FROM products WHERE id = $1 RETURNING *", [id])
      console.log("[v0] Product deleted successfully")

      // Update category product count
      await pool.query("UPDATE categories SET product_count = GREATEST(0, product_count - 1) WHERE id = $1", [
        category_id,
      ])

      // Clear caches
      await deleteFromCache(`product:${id}`)
      await deleteFromCache("products:all")
      await deleteFromCache("products:featured")
      await deleteFromCache("products:sale")
      await deleteFromCache("categories:all")

      res.json({
        message: "Product deleted successfully",
        message_ar: "تم حذف المنتج بنجاح",
        product: result.rows[0],
      })
    } catch (err) {
      console.error("[v0] Error deleting product:", err)
      console.error("[v0] Error code:", err.code)
      console.error("[v0] Error detail:", err.detail)

      if (err.code === "23503") {
        return res.status(400).json({
          error: "Cannot delete product",
          message: "لا يمكن حذف المنتج لأنه مرتبط بطلبات موجودة",
          detail: "Product is referenced in existing orders",
        })
      }

      res.status(500).json({
        error: "Server error",
        message: "حدث خطأ في الخادم",
        detail: err.message,
      })
    }
  },

  // Get all products with filters
  async getProducts(req, res) {
    const { category, search, inStock, minPrice, maxPrice, sortBy, page = 1, limit = 20 } = req.query
    const offset = (page - 1) * limit

    try {
      let query = `
        SELECT p.*, c.name as category_name, c.name_ar as category_name_ar 
        FROM products p 
        LEFT JOIN categories c ON p.category_id = c.id 
        WHERE 1=1
      `
      const params = []
      let paramCount = 0

      if (category) {
        params.push(category)
        query += ` AND p.category_id = $${++paramCount}`
      }

      if (search) {
        params.push(`%${search}%`)
        query += ` AND (p.name ILIKE $${++paramCount} OR p.name_ar ILIKE $${paramCount} OR p.brand ILIKE $${paramCount})`
      }

      if (inStock === "true") {
        query += " AND p.in_stock = true"
      }

      if (minPrice) {
        params.push(minPrice)
        query += ` AND p.price >= $${++paramCount}`
      }

      if (maxPrice) {
        params.push(maxPrice)
        query += ` AND p.price <= $${++paramCount}`
      }

      // Sorting
      switch (sortBy) {
        case "price_asc":
          query += " ORDER BY p.price ASC"
          break
        case "price_desc":
          query += " ORDER BY p.price DESC"
          break
        case "rating":
          query += " ORDER BY p.rating DESC"
          break
        case "newest":
          query += " ORDER BY p.created_at DESC"
          break
        case "discount":
          query += " ORDER BY p.discount DESC NULLS LAST"
          break
        case "popular":
          query += " ORDER BY p.rating DESC, p.reviews_count DESC"
          break
        default:
          query += " ORDER BY p.created_at DESC"
      }

      params.push(Number.parseInt(limit), offset)
      query += ` LIMIT $${++paramCount} OFFSET $${++paramCount}`

      const result = await pool.query(query, params)

      // Get total count for pagination
      let countQuery = "SELECT COUNT(*) FROM products p WHERE 1=1"
      const countParams = []
      let countParamCount = 0

      if (category) {
        countParams.push(category)
        countQuery += ` AND p.category_id = $${++countParamCount}`
      }

      if (search) {
        countParams.push(`%${search}%`)
        countQuery += ` AND (p.name ILIKE $${++countParamCount} OR p.name_ar ILIKE $${countParamCount} OR p.brand ILIKE $${countParamCount})`
      }

      if (inStock === "true") {
        countQuery += " AND p.in_stock = true"
      }

      const countResult = await pool.query(countQuery, countParams)
      const totalCount = Number.parseInt(countResult.rows[0].count)

      const response = {
        products: result.rows,
        pagination: {
          total: totalCount,
          page: Number.parseInt(page),
          limit: Number.parseInt(limit),
          totalPages: Math.ceil(totalCount / limit),
        },
      }

      res.json(response)
    } catch (err) {
      console.error("Error fetching products:", err)
      res.status(500).json({ error: "Server error" })
    }
  },

  // Get single product
  async getProduct(req, res) {
    const { id } = req.params

    try {
      const cacheKey = `product:${id}`

      const cached = await getFromCache(cacheKey)
      if (cached) {
        return res.json(cached)
      }

      const result = await pool.query(
        `SELECT p.*, c.name as category_name, c.name_ar as category_name_ar
         FROM products p 
         LEFT JOIN categories c ON p.category_id = c.id 
         WHERE p.id = $1`,
        [id],
      )

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Product not found" })
      }

      const product = result.rows[0]

      // Get related products
      const relatedResult = await pool.query(
        `SELECT p.* 
         FROM products p 
         WHERE p.category_id = $1 AND p.id != $2 AND p.in_stock = true 
         ORDER BY p.rating DESC 
         LIMIT 6`,
        [product.category_id, id],
      )

      product.related_products = relatedResult.rows

      await setToCache(cacheKey, product, 1800)

      res.json(product)
    } catch (err) {
      console.error("Error fetching product:", err)
      res.status(500).json({ error: "Server error" })
    }
  },

  // Get featured products
  async getFeaturedProducts(req, res) {
    try {
      const cacheKey = "products:featured"

      const cached = await getFromCache(cacheKey)
      if (cached) {
        return res.json(cached)
      }

      const result = await pool.query(`
        SELECT p.*, c.name as category_name, c.name_ar as category_name_ar
        FROM products p 
        LEFT JOIN categories c ON p.category_id = c.id 
        WHERE p.in_stock = true AND p.featured = true
        ORDER BY p.rating DESC, p.discount DESC, p.created_at DESC 
        LIMIT 12
      `)

      await setToCache(cacheKey, result.rows, 1800)

      res.json(result.rows)
    } catch (err) {
      console.error("Error fetching featured products:", err)
      res.status(500).json({ error: "Server error" })
    }
  },

  // Get products on sale
  async getProductsOnSale(req, res) {
    const { page = 1, limit = 20 } = req.query
    const offset = (page - 1) * limit

    try {
      const cacheKey = `products:sale:page_${page}_limit_${limit}`

      const cached = await getFromCache(cacheKey)
      if (cached) {
        return res.json(cached)
      }

      const result = await pool.query(
        `
        SELECT p.*, c.name as category_name, c.name_ar as category_name_ar
        FROM products p 
        LEFT JOIN categories c ON p.category_id = c.id 
        WHERE p.discount > 0 AND p.in_stock = true 
        ORDER BY p.discount DESC 
        LIMIT $1 OFFSET $2
      `,
        [Number.parseInt(limit), offset],
      )

      const countResult = await pool.query("SELECT COUNT(*) FROM products WHERE discount > 0 AND in_stock = true")
      const totalCount = Number.parseInt(countResult.rows[0].count)

      const response = {
        products: result.rows,
        pagination: {
          total: totalCount,
          page: Number.parseInt(page),
          limit: Number.parseInt(limit),
          totalPages: Math.ceil(totalCount / limit),
        },
      }

      await setToCache(cacheKey, response, 1800)

      res.json(response)
    } catch (err) {
      console.error("Error fetching products on sale:", err)
      res.status(500).json({ error: "Server error" })
    }
  },

  // Search products
  async searchProducts(req, res) {
    const { q, category, minPrice, maxPrice, inStock, sortBy, page = 1, limit = 20 } = req.query
    const offset = (page - 1) * limit

    if (!q) {
      return res.status(400).json({ error: "Search query is required" })
    }

    try {
      let query = `
        SELECT p.*, c.name as category_name, c.name_ar as category_name_ar
        FROM products p 
        LEFT JOIN categories c ON p.category_id = c.id 
        WHERE (p.name ILIKE $1 OR p.name_ar ILIKE $1 OR p.brand ILIKE $1 OR p.description ILIKE $1)
      `
      const params = [`%${q}%`]
      let paramCount = 1

      if (category) {
        params.push(category)
        query += ` AND p.category_id = $${++paramCount}`
      }

      if (minPrice) {
        params.push(minPrice)
        query += ` AND p.price >= $${++paramCount}`
      }

      if (maxPrice) {
        params.push(maxPrice)
        query += ` AND p.price <= $${++paramCount}`
      }

      if (inStock === "true") {
        query += " AND p.in_stock = true"
      }

      // Sorting
      switch (sortBy) {
        case "price_asc":
          query += " ORDER BY p.price ASC"
          break
        case "price_desc":
          query += " ORDER BY p.price DESC"
          break
        case "rating":
          query += " ORDER BY p.rating DESC"
          break
        case "relevance":
        default:
          query += " ORDER BY p.rating DESC, p.created_at DESC"
      }

      params.push(Number.parseInt(limit), offset)
      query += ` LIMIT $${++paramCount} OFFSET $${++paramCount}`

      const result = await pool.query(query, params)

      // Count query
      let countQuery = `
        SELECT COUNT(*) 
        FROM products p
        WHERE (p.name ILIKE $1 OR p.name_ar ILIKE $1 OR p.brand ILIKE $1 OR p.description ILIKE $1)
      `
      const countParams = [`%${q}%`]

      if (category) {
        countParams.push(category)
        countQuery += ` AND p.category_id = $2`
      }

      const countResult = await pool.query(countQuery, countParams)
      const totalCount = Number.parseInt(countResult.rows[0].count)

      const response = {
        query: q,
        products: result.rows,
        pagination: {
          total: totalCount,
          page: Number.parseInt(page),
          limit: Number.parseInt(limit),
          totalPages: Math.ceil(totalCount / limit),
        },
      }

      res.json(response)
    } catch (err) {
      console.error("Error searching products:", err)
      res.status(500).json({ error: "Server error" })
    }
  },

  // Get products by category
  async getProductsByCategory(req, res) {
    const { categoryId } = req.params
    const { page = 1, limit = 20, sortBy } = req.query
    const offset = (page - 1) * limit

    try {
      // Verify category exists
      const categoryCheck = await pool.query("SELECT id, name, name_ar FROM categories WHERE id = $1", [categoryId])

      if (categoryCheck.rows.length === 0) {
        return res.status(404).json({ error: "Category not found" })
      }

      let query = `
        SELECT p.* 
        FROM products p 
        WHERE p.category_id = $1 AND p.in_stock = true
      `
      const params = [categoryId]

      // Sorting
      switch (sortBy) {
        case "price_asc":
          query += " ORDER BY p.price ASC"
          break
        case "price_desc":
          query += " ORDER BY p.price DESC"
          break
        case "rating":
          query += " ORDER BY p.rating DESC"
          break
        case "newest":
          query += " ORDER BY p.created_at DESC"
          break
        case "discount":
          query += " ORDER BY p.discount DESC NULLS LAST"
          break
        default:
          query += " ORDER BY p.created_at DESC"
      }

      query += ` LIMIT $2 OFFSET $3`
      params.push(Number.parseInt(limit), offset)

      const result = await pool.query(query, params)

      // Get total count
      const countResult = await pool.query("SELECT COUNT(*) FROM products WHERE category_id = $1 AND in_stock = true", [
        categoryId,
      ])
      const totalCount = Number.parseInt(countResult.rows[0].count)

      res.json({
        category: categoryCheck.rows[0],
        products: result.rows,
        pagination: {
          total: totalCount,
          page: Number.parseInt(page),
          limit: Number.parseInt(limit),
          totalPages: Math.ceil(totalCount / limit),
        },
      })
    } catch (err) {
      console.error("Error fetching category products:", err)
      res.status(500).json({ error: "Server error" })
    }
  },
}

module.exports = productController
