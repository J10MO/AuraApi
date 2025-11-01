// // // const { pool } = require("../config/database")
// // // const { redisClient } = require("../config/redis")

// // // // Helper functions for cache
// // // async function getFromCache(key) {
// // //   if (!redisClient) return null
// // //   try {
// // //     const cached = await redisClient.get(key)
// // //     return cached ? JSON.parse(cached) : null
// // //   } catch (err) {
// // //     console.error("Redis get error:", err)
// // //     return null
// // //   }
// // // }

// // // async function setToCache(key, data, expiry = 3600) {
// // //   if (!redisClient) return
// // //   try {
// // //     await redisClient.setEx(key, expiry, JSON.stringify(data))
// // //   } catch (err) {
// // //     console.error("Redis set error:", err)
// // //   }
// // // }

// // // async function deleteFromCache(key) {
// // //   if (!redisClient) return
// // //   try {
// // //     await redisClient.del(key)
// // //   } catch (err) {
// // //     console.error("Redis delete error:", err)
// // //   }
// // // }

// // // // دالة للتحقق من صحة URL الصورة
// // // function isValidImageUrl(url) {
// // //   if (!url) return true

// // //   try {
// // //     const parsedUrl = new URL(url)
// // //     const allowedProtocols = ["http:", "https:"]
// // //     const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg", ".bmp", ".avif"]

// // //     if (!allowedProtocols.includes(parsedUrl.protocol)) {
// // //       return false
// // //     }

// // //     const pathname = parsedUrl.pathname.toLowerCase()
// // //     const hasValidExtension = allowedExtensions.some((ext) => pathname.endsWith(ext))

// // //     return hasValidExtension || pathname.includes("/images/") || pathname.includes("/products/")
// // //   } catch (err) {
// // //     return false
// // //   }
// // // }

// // // const productController = {
// // //   // Create new product (Admin only)
// // //   async createProduct(req, res) {
// // //     const {
// // //       name,
// // //       name_ar,
// // //       brand,
// // //       price,
// // //       original_price,
// // //       description,
// // //       description_ar,
// // //       category_id,
// // //       emoji_icon,
// // //       in_stock = true,
// // //       discount = 0,
// // //       badge,
// // //       image_url,
// // //       stock_quantity = 0,
// // //     } = req.body

// // //     // Validation
// // //     if (!name || !name_ar || !price || !category_id) {
// // //       return res.status(400).json({
// // //         error: "Missing required fields",
// // //         message: "يجب إدخال جميع الحقول المطلوبة (الاسم، الاسم العربي، السعر، التصنيف)",
// // //       })
// // //     }

// // //     if (price < 0) {
// // //       return res.status(400).json({
// // //         error: "Invalid price",
// // //         message: "السعر يجب أن يكون رقم موجب",
// // //       })
// // //     }

// // //     if (discount < 0 || discount > 100) {
// // //       return res.status(400).json({
// // //         error: "Invalid discount",
// // //         message: "الخصم يجب أن يكون بين 0 و 100",
// // //       })
// // //     }

// // //     // التحقق من صحة رابط الصورة إذا تم تقديمه
// // //     if (image_url && !isValidImageUrl(image_url)) {
// // //       return res.status(400).json({
// // //         error: "Invalid image URL",
// // //         message: "رابط الصورة غير صالح",
// // //       })
// // //     }

// // //     try {
// // //       // Check if category exists
// // //       const categoryCheck = await pool.query("SELECT id, name FROM categories WHERE id = $1", [category_id])

// // //       if (categoryCheck.rows.length === 0) {
// // //         return res.status(400).json({
// // //           error: "Category not found",
// // //           message: "التصنيف غير موجود",
// // //         })
// // //       }

// // //       // Calculate sale price if discount is provided
// // //       const salePrice = discount > 0 ? price * (1 - discount / 100) : null

// // //       const result = await pool.query(
// // //         `INSERT INTO products (
// // //           name, name_ar, brand, price, original_price, description, 
// // //           description_ar, category_id, image_url, emoji_icon, 
// // //           in_stock, discount, badge, stock_quantity, sale_price
// // //         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
// // //         RETURNING *`,
// // //         [
// // //           name,
// // //           name_ar,
// // //           brand,
// // //           Number.parseFloat(price),
// // //           original_price ? Number.parseFloat(original_price) : null,
// // //           description,
// // //           description_ar,
// // //           Number.parseInt(category_id),
// // //           image_url,
// // //           emoji_icon,
// // //           Boolean(in_stock),
// // //           Number.parseFloat(discount),
// // //           badge,
// // //           Number.parseInt(stock_quantity),
// // //           salePrice,
// // //         ],
// // //       )

// // //       // Update category product count
// // //       await pool.query("UPDATE categories SET product_count = product_count + 1 WHERE id = $1", [category_id])

// // //       // Clear relevant caches
// // //       await deleteFromCache("categories:all")
// // //       await deleteFromCache("products:all")
// // //       await deleteFromCache("products:featured")
// // //       await deleteFromCache("products:sale")

// // //       res.status(201).json({
// // //         message: "Product created successfully",
// // //         message_ar: "تم إنشاء المنتج بنجاح",
// // //         product: result.rows[0],
// // //         category: categoryCheck.rows[0],
// // //       })
// // //     } catch (err) {
// // //       console.error("Error creating product:", err)

// // //       // Handle specific errors
// // //       if (err.code === "23503") {
// // //         return res.status(400).json({
// // //           error: "Invalid category",
// // //           message: "التصنيف غير صحيح",
// // //         })
// // //       }

// // //       if (err.code === "23505") {
// // //         return res.status(400).json({
// // //           error: "Product already exists",
// // //           message: "المنتج موجود مسبقاً",
// // //         })
// // //       }

// // //       res.status(500).json({ error: "Server error" })
// // //     }
// // //   },

// // //   // Update product (Admin only)
// // //   async updateProduct(req, res) {
// // //     const { id } = req.params
// // //     const {
// // //       name,
// // //       name_ar,
// // //       brand,
// // //       price,
// // //       original_price,
// // //       description,
// // //       description_ar,
// // //       category_id,
// // //       emoji_icon,
// // //       in_stock,
// // //       discount,
// // //       badge,
// // //       image_url,
// // //       stock_quantity,
// // //     } = req.body

// // //     try {
// // //       // التحقق من صحة رابط الصورة إذا تم تقديمه
// // //       if (image_url && !isValidImageUrl(image_url)) {
// // //         return res.status(400).json({
// // //           error: "Invalid image URL",
// // //           message: "رابط الصورة غير صالح",
// // //         })
// // //       }

// // //       // Calculate sale price if discount is provided
// // //       const salePrice = discount > 0 ? price * (1 - discount / 100) : null

// // //       const query = `
// // //         UPDATE products SET 
// // //           name = COALESCE($1, name),
// // //           name_ar = COALESCE($2, name_ar),
// // //           brand = COALESCE($3, brand),
// // //           price = COALESCE($4, price),
// // //           original_price = COALESCE($5, original_price),
// // //           description = COALESCE($6, description),
// // //           description_ar = COALESCE($7, description_ar),
// // //           category_id = COALESCE($8, category_id),
// // //           emoji_icon = COALESCE($9, emoji_icon),
// // //           in_stock = COALESCE($10, in_stock),
// // //           discount = COALESCE($11, discount),
// // //           badge = COALESCE($12, badge),
// // //           image_url = COALESCE($13, image_url),
// // //           stock_quantity = COALESCE($14, stock_quantity),
// // //           sale_price = $15,
// // //           updated_at = CURRENT_TIMESTAMP
// // //         WHERE id = $16 
// // //         RETURNING *
// // //       `

// // //       const params = [
// // //         name,
// // //         name_ar,
// // //         brand,
// // //         price,
// // //         original_price,
// // //         description,
// // //         description_ar,
// // //         category_id,
// // //         emoji_icon,
// // //         in_stock,
// // //         discount,
// // //         badge,
// // //         image_url,
// // //         stock_quantity,
// // //         salePrice,
// // //         id,
// // //       ]

// // //       const result = await pool.query(query, params)

// // //       if (result.rows.length === 0) {
// // //         return res.status(404).json({
// // //           error: "Product not found",
// // //           message: "المنتج غير موجود",
// // //         })
// // //       }

// // //       // Clear caches
// // //       await deleteFromCache(`product:${id}`)
// // //       await deleteFromCache("products:all")
// // //       await deleteFromCache("products:featured")
// // //       await deleteFromCache("products:sale")
// // //       await deleteFromCache("categories:all")

// // //       res.json({
// // //         message: "Product updated successfully",
// // //         message_ar: "تم تحديث المنتج بنجاح",
// // //         product: result.rows[0],
// // //       })
// // //     } catch (err) {
// // //       console.error("Error updating product:", err)
// // //       res.status(500).json({ error: "Server error" })
// // //     }
// // //   },

// // //   // Delete product (Admin only)
// // //   async deleteProduct(req, res) {
// // //     const { id } = req.params

// // //     try {
// // //       console.log("[v0] Attempting to delete product:", id)

// // //       // Get product info before deletion for category update
// // //       const productResult = await pool.query("SELECT category_id, name FROM products WHERE id = $1", [id])

// // //       if (productResult.rows.length === 0) {
// // //         return res.status(404).json({
// // //           error: "Product not found",
// // //           message: "المنتج غير موجود",
// // //         })
// // //       }

// // //       const { category_id, name } = productResult.rows[0]
// // //       console.log("[v0] Product found:", name, "Category:", category_id)

// // //       // Delete from cart_items
// // //       const cartDelete = await pool.query("DELETE FROM cart_items WHERE product_id = $1", [id])
// // //       console.log("[v0] Deleted cart items:", cartDelete.rowCount)

// // //       // Delete from favorites
// // //       const favDelete = await pool.query("DELETE FROM favorites WHERE product_id = $1", [id])
// // //       console.log("[v0] Deleted favorites:", favDelete.rowCount)

// // //       // Note: We don't delete order_items as they are historical records
// // //       // Instead, we just delete the product and let the order history remain

// // //       // Delete the product
// // //       const result = await pool.query("DELETE FROM products WHERE id = $1 RETURNING *", [id])
// // //       console.log("[v0] Product deleted successfully")

// // //       // Update category product count
// // //       await pool.query("UPDATE categories SET product_count = GREATEST(0, product_count - 1) WHERE id = $1", [
// // //         category_id,
// // //       ])

// // //       // Clear caches
// // //       await deleteFromCache(`product:${id}`)
// // //       await deleteFromCache("products:all")
// // //       await deleteFromCache("products:featured")
// // //       await deleteFromCache("products:sale")
// // //       await deleteFromCache("categories:all")

// // //       res.json({
// // //         message: "Product deleted successfully",
// // //         message_ar: "تم حذف المنتج بنجاح",
// // //         product: result.rows[0],
// // //       })
// // //     } catch (err) {
// // //       console.error("[v0] Error deleting product:", err)
// // //       console.error("[v0] Error code:", err.code)
// // //       console.error("[v0] Error detail:", err.detail)

// // //       if (err.code === "23503") {
// // //         return res.status(400).json({
// // //           error: "Cannot delete product",
// // //           message: "لا يمكن حذف المنتج لأنه مرتبط بطلبات موجودة",
// // //           detail: "Product is referenced in existing orders",
// // //         })
// // //       }

// // //       res.status(500).json({
// // //         error: "Server error",
// // //         message: "حدث خطأ في الخادم",
// // //         detail: err.message,
// // //       })
// // //     }
// // //   },

// // //   // Get all products with filters
// // //   async getProducts(req, res) {
// // //     const { category, search, inStock, minPrice, maxPrice, sortBy, page = 1, limit = 20 } = req.query
// // //     const offset = (page - 1) * limit

// // //     try {
// // //       let query = `
// // //         SELECT p.*, c.name as category_name, c.name_ar as category_name_ar 
// // //         FROM products p 
// // //         LEFT JOIN categories c ON p.category_id = c.id 
// // //         WHERE 1=1
// // //       `
// // //       const params = []
// // //       let paramCount = 0

// // //       if (category) {
// // //         params.push(category)
// // //         query += ` AND p.category_id = $${++paramCount}`
// // //       }

// // //       if (search) {
// // //         params.push(`%${search}%`)
// // //         query += ` AND (p.name ILIKE $${++paramCount} OR p.name_ar ILIKE $${paramCount} OR p.brand ILIKE $${paramCount})`
// // //       }

// // //       if (inStock === "true") {
// // //         query += " AND p.in_stock = true"
// // //       }

// // //       if (minPrice) {
// // //         params.push(minPrice)
// // //         query += ` AND p.price >= $${++paramCount}`
// // //       }

// // //       if (maxPrice) {
// // //         params.push(maxPrice)
// // //         query += ` AND p.price <= $${++paramCount}`
// // //       }

// // //       // Sorting
// // //       switch (sortBy) {
// // //         case "price_asc":
// // //           query += " ORDER BY p.price ASC"
// // //           break
// // //         case "price_desc":
// // //           query += " ORDER BY p.price DESC"
// // //           break
// // //         case "rating":
// // //           query += " ORDER BY p.rating DESC"
// // //           break
// // //         case "newest":
// // //           query += " ORDER BY p.created_at DESC"
// // //           break
// // //         case "discount":
// // //           query += " ORDER BY p.discount DESC NULLS LAST"
// // //           break
// // //         case "popular":
// // //           query += " ORDER BY p.rating DESC, p.reviews_count DESC"
// // //           break
// // //         default:
// // //           query += " ORDER BY p.created_at DESC"
// // //       }

// // //       params.push(Number.parseInt(limit), offset)
// // //       query += ` LIMIT $${++paramCount} OFFSET $${++paramCount}`

// // //       const result = await pool.query(query, params)

// // //       // Get total count for pagination
// // //       let countQuery = "SELECT COUNT(*) FROM products p WHERE 1=1"
// // //       const countParams = []
// // //       let countParamCount = 0

// // //       if (category) {
// // //         countParams.push(category)
// // //         countQuery += ` AND p.category_id = $${++countParamCount}`
// // //       }

// // //       if (search) {
// // //         countParams.push(`%${search}%`)
// // //         countQuery += ` AND (p.name ILIKE $${++countParamCount} OR p.name_ar ILIKE $${countParamCount} OR p.brand ILIKE $${countParamCount})`
// // //       }

// // //       if (inStock === "true") {
// // //         countQuery += " AND p.in_stock = true"
// // //       }

// // //       const countResult = await pool.query(countQuery, countParams)
// // //       const totalCount = Number.parseInt(countResult.rows[0].count)

// // //       const response = {
// // //         products: result.rows,
// // //         pagination: {
// // //           total: totalCount,
// // //           page: Number.parseInt(page),
// // //           limit: Number.parseInt(limit),
// // //           totalPages: Math.ceil(totalCount / limit),
// // //         },
// // //       }

// // //       res.json(response)
// // //     } catch (err) {
// // //       console.error("Error fetching products:", err)
// // //       res.status(500).json({ error: "Server error" })
// // //     }
// // //   },

// // //   // Get single product
// // //   async getProduct(req, res) {
// // //     const { id } = req.params

// // //     try {
// // //       const cacheKey = `product:${id}`

// // //       const cached = await getFromCache(cacheKey)
// // //       if (cached) {
// // //         return res.json(cached)
// // //       }

// // //       const result = await pool.query(
// // //         `SELECT p.*, c.name as category_name, c.name_ar as category_name_ar
// // //          FROM products p 
// // //          LEFT JOIN categories c ON p.category_id = c.id 
// // //          WHERE p.id = $1`,
// // //         [id],
// // //       )

// // //       if (result.rows.length === 0) {
// // //         return res.status(404).json({ error: "Product not found" })
// // //       }

// // //       const product = result.rows[0]

// // //       // Get related products
// // //       const relatedResult = await pool.query(
// // //         `SELECT p.* 
// // //          FROM products p 
// // //          WHERE p.category_id = $1 AND p.id != $2 AND p.in_stock = true 
// // //          ORDER BY p.rating DESC 
// // //          LIMIT 6`,
// // //         [product.category_id, id],
// // //       )

// // //       product.related_products = relatedResult.rows

// // //       await setToCache(cacheKey, product, 1800)

// // //       res.json(product)
// // //     } catch (err) {
// // //       console.error("Error fetching product:", err)
// // //       res.status(500).json({ error: "Server error" })
// // //     }
// // //   },

// // //   // Get featured products
// // //   async getFeaturedProducts(req, res) {
// // //     try {
// // //       const cacheKey = "products:featured"

// // //       const cached = await getFromCache(cacheKey)
// // //       if (cached) {
// // //         return res.json(cached)
// // //       }

// // //       const result = await pool.query(`
// // //         SELECT p.*, c.name as category_name, c.name_ar as category_name_ar
// // //         FROM products p 
// // //         LEFT JOIN categories c ON p.category_id = c.id 
// // //         WHERE p.in_stock = true AND p.featured = true
// // //         ORDER BY p.rating DESC, p.discount DESC, p.created_at DESC 
// // //         LIMIT 12
// // //       `)

// // //       await setToCache(cacheKey, result.rows, 1800)

// // //       res.json(result.rows)
// // //     } catch (err) {
// // //       console.error("Error fetching featured products:", err)
// // //       res.status(500).json({ error: "Server error" })
// // //     }
// // //   },

// // //   // Get products on sale
// // //   async getProductsOnSale(req, res) {
// // //     const { page = 1, limit = 20 } = req.query
// // //     const offset = (page - 1) * limit

// // //     try {
// // //       const cacheKey = `products:sale:page_${page}_limit_${limit}`

// // //       const cached = await getFromCache(cacheKey)
// // //       if (cached) {
// // //         return res.json(cached)
// // //       }

// // //       const result = await pool.query(
// // //         `
// // //         SELECT p.*, c.name as category_name, c.name_ar as category_name_ar
// // //         FROM products p 
// // //         LEFT JOIN categories c ON p.category_id = c.id 
// // //         WHERE p.discount > 0 AND p.in_stock = true 
// // //         ORDER BY p.discount DESC 
// // //         LIMIT $1 OFFSET $2
// // //       `,
// // //         [Number.parseInt(limit), offset],
// // //       )

// // //       const countResult = await pool.query("SELECT COUNT(*) FROM products WHERE discount > 0 AND in_stock = true")
// // //       const totalCount = Number.parseInt(countResult.rows[0].count)

// // //       const response = {
// // //         products: result.rows,
// // //         pagination: {
// // //           total: totalCount,
// // //           page: Number.parseInt(page),
// // //           limit: Number.parseInt(limit),
// // //           totalPages: Math.ceil(totalCount / limit),
// // //         },
// // //       }

// // //       await setToCache(cacheKey, response, 1800)

// // //       res.json(response)
// // //     } catch (err) {
// // //       console.error("Error fetching products on sale:", err)
// // //       res.status(500).json({ error: "Server error" })
// // //     }
// // //   },

// // //   // Search products
// // //   async searchProducts(req, res) {
// // //     const { q, category, minPrice, maxPrice, inStock, sortBy, page = 1, limit = 20 } = req.query
// // //     const offset = (page - 1) * limit

// // //     if (!q) {
// // //       return res.status(400).json({ error: "Search query is required" })
// // //     }

// // //     try {
// // //       let query = `
// // //         SELECT p.*, c.name as category_name, c.name_ar as category_name_ar
// // //         FROM products p 
// // //         LEFT JOIN categories c ON p.category_id = c.id 
// // //         WHERE (p.name ILIKE $1 OR p.name_ar ILIKE $1 OR p.brand ILIKE $1 OR p.description ILIKE $1)
// // //       `
// // //       const params = [`%${q}%`]
// // //       let paramCount = 1

// // //       if (category) {
// // //         params.push(category)
// // //         query += ` AND p.category_id = $${++paramCount}`
// // //       }

// // //       if (minPrice) {
// // //         params.push(minPrice)
// // //         query += ` AND p.price >= $${++paramCount}`
// // //       }

// // //       if (maxPrice) {
// // //         params.push(maxPrice)
// // //         query += ` AND p.price <= $${++paramCount}`
// // //       }

// // //       if (inStock === "true") {
// // //         query += " AND p.in_stock = true"
// // //       }

// // //       // Sorting
// // //       switch (sortBy) {
// // //         case "price_asc":
// // //           query += " ORDER BY p.price ASC"
// // //           break
// // //         case "price_desc":
// // //           query += " ORDER BY p.price DESC"
// // //           break
// // //         case "rating":
// // //           query += " ORDER BY p.rating DESC"
// // //           break
// // //         case "relevance":
// // //         default:
// // //           query += " ORDER BY p.rating DESC, p.created_at DESC"
// // //       }

// // //       params.push(Number.parseInt(limit), offset)
// // //       query += ` LIMIT $${++paramCount} OFFSET $${++paramCount}`

// // //       const result = await pool.query(query, params)

// // //       // Count query
// // //       let countQuery = `
// // //         SELECT COUNT(*) 
// // //         FROM products p
// // //         WHERE (p.name ILIKE $1 OR p.name_ar ILIKE $1 OR p.brand ILIKE $1 OR p.description ILIKE $1)
// // //       `
// // //       const countParams = [`%${q}%`]

// // //       if (category) {
// // //         countParams.push(category)
// // //         countQuery += ` AND p.category_id = $2`
// // //       }

// // //       const countResult = await pool.query(countQuery, countParams)
// // //       const totalCount = Number.parseInt(countResult.rows[0].count)

// // //       const response = {
// // //         query: q,
// // //         products: result.rows,
// // //         pagination: {
// // //           total: totalCount,
// // //           page: Number.parseInt(page),
// // //           limit: Number.parseInt(limit),
// // //           totalPages: Math.ceil(totalCount / limit),
// // //         },
// // //       }

// // //       res.json(response)
// // //     } catch (err) {
// // //       console.error("Error searching products:", err)
// // //       res.status(500).json({ error: "Server error" })
// // //     }
// // //   },

// // //   // Get products by category
// // //   async getProductsByCategory(req, res) {
// // //     const { categoryId } = req.params
// // //     const { page = 1, limit = 20, sortBy } = req.query
// // //     const offset = (page - 1) * limit

// // //     try {
// // //       // Verify category exists
// // //       const categoryCheck = await pool.query("SELECT id, name, name_ar FROM categories WHERE id = $1", [categoryId])

// // //       if (categoryCheck.rows.length === 0) {
// // //         return res.status(404).json({ error: "Category not found" })
// // //       }

// // //       let query = `
// // //         SELECT p.* 
// // //         FROM products p 
// // //         WHERE p.category_id = $1 AND p.in_stock = true
// // //       `
// // //       const params = [categoryId]

// // //       // Sorting
// // //       switch (sortBy) {
// // //         case "price_asc":
// // //           query += " ORDER BY p.price ASC"
// // //           break
// // //         case "price_desc":
// // //           query += " ORDER BY p.price DESC"
// // //           break
// // //         case "rating":
// // //           query += " ORDER BY p.rating DESC"
// // //           break
// // //         case "newest":
// // //           query += " ORDER BY p.created_at DESC"
// // //           break
// // //         case "discount":
// // //           query += " ORDER BY p.discount DESC NULLS LAST"
// // //           break
// // //         default:
// // //           query += " ORDER BY p.created_at DESC"
// // //       }

// // //       query += ` LIMIT $2 OFFSET $3`
// // //       params.push(Number.parseInt(limit), offset)

// // //       const result = await pool.query(query, params)

// // //       // Get total count
// // //       const countResult = await pool.query("SELECT COUNT(*) FROM products WHERE category_id = $1 AND in_stock = true", [
// // //         categoryId,
// // //       ])
// // //       const totalCount = Number.parseInt(countResult.rows[0].count)

// // //       res.json({
// // //         category: categoryCheck.rows[0],
// // //         products: result.rows,
// // //         pagination: {
// // //           total: totalCount,
// // //           page: Number.parseInt(page),
// // //           limit: Number.parseInt(limit),
// // //           totalPages: Math.ceil(totalCount / limit),
// // //         },
// // //       })
// // //     } catch (err) {
// // //       console.error("Error fetching category products:", err)
// // //       res.status(500).json({ error: "Server error" })
// // //     }
// // //   },
// // // }

// // // module.exports = productController




// // const { pool } = require("../config/database")
// // const { redisClient } = require("../config/redis")

// // // Helper functions for cache
// // async function getFromCache(key) {
// //   if (!redisClient) return null
// //   try {
// //     const cached = await redisClient.get(key)
// //     return cached ? JSON.parse(cached) : null
// //   } catch (err) {
// //     console.error("Redis get error:", err)
// //     return null
// //   }
// // }

// // async function setToCache(key, data, expiry = 3600) {
// //   if (!redisClient) return
// //   try {
// //     await redisClient.setEx(key, expiry, JSON.stringify(data))
// //   } catch (err) {
// //     console.error("Redis set error:", err)
// //   }
// // }

// // async function deleteFromCache(key) {
// //   if (!redisClient) return
// //   try {
// //     await redisClient.del(key)
// //   } catch (err) {
// //     console.error("Redis delete error:", err)
// //   }
// // }

// // // دالة للتحقق من صحة URL الصورة
// // function isValidImageUrl(url) {
// //   if (!url) return true

// //   try {
// //     const parsedUrl = new URL(url)
// //     const allowedProtocols = ["http:", "https:"]
// //     const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg", ".bmp", ".avif"]

// //     if (!allowedProtocols.includes(parsedUrl.protocol)) {
// //       return false
// //     }

// //     const pathname = parsedUrl.pathname.toLowerCase()
// //     const hasValidExtension = allowedExtensions.some((ext) => pathname.endsWith(ext))

// //     return hasValidExtension || pathname.includes("/images/") || pathname.includes("/products/")
// //   } catch (err) {
// //     return false
// //   }
// // }

// // const productController = {
// //   // Create new product (Admin only)
// //   async createProduct(req, res) {
// //     const {
// //       name,
// //       name_ar,
// //       brand,
// //       price,
// //       original_price,
// //       description,
// //       description_ar,
// //       category_id,
// //       emoji_icon,
// //       in_stock = true,
// //       discount = 0,
// //       badge,
// //       image_url,
// //       stock_quantity = 0,
// //     } = req.body

// //     // Validation
// //     if (!name || !name_ar || !price || !category_id) {
// //       return res.status(400).json({
// //         error: "Missing required fields",
// //         message: "يجب إدخال جميع الحقول المطلوبة (الاسم، الاسم العربي، السعر، التصنيف)",
// //       })
// //     }

// //     if (price < 0) {
// //       return res.status(400).json({
// //         error: "Invalid price",
// //         message: "السعر يجب أن يكون رقم موجب",
// //       })
// //     }

// //     if (discount < 0 || discount > 100) {
// //       return res.status(400).json({
// //         error: "Invalid discount",
// //         message: "الخصم يجب أن يكون بين 0 و 100",
// //       })
// //     }

// //     // التحقق من صحة رابط الصورة إذا تم تقديمه
// //     if (image_url && !isValidImageUrl(image_url)) {
// //       return res.status(400).json({
// //         error: "Invalid image URL",
// //         message: "رابط الصورة غير صالح",
// //       })
// //     }

// //     try {
// //       // Check if category exists
// //       const categoryCheck = await pool.query("SELECT id, name FROM categories WHERE id = $1", [category_id])

// //       if (categoryCheck.rows.length === 0) {
// //         return res.status(400).json({
// //           error: "Category not found",
// //           message: "التصنيف غير موجود",
// //         })
// //       }

// //       // Calculate sale price if discount is provided
// //       const salePrice = discount > 0 ? price * (1 - discount / 100) : null

// //       const finalInStock = Number.parseInt(stock_quantity) > 0 ? Boolean(in_stock) : false

// //       const result = await pool.query(
// //         `INSERT INTO products (
// //           name, name_ar, brand, price, original_price, description, 
// //           description_ar, category_id, image_url, emoji_icon, 
// //           in_stock, discount, badge, stock_quantity, sale_price
// //         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
// //         RETURNING *`,
// //         [
// //           name,
// //           name_ar,
// //           brand,
// //           Number.parseFloat(price),
// //           original_price ? Number.parseFloat(original_price) : null,
// //           description,
// //           description_ar,
// //           Number.parseInt(category_id),
// //           image_url,
// //           emoji_icon,
// //           finalInStock,
// //           Number.parseFloat(discount),
// //           badge,
// //           Number.parseInt(stock_quantity),
// //           salePrice,
// //         ],
// //       )

// //       // Update category product count
// //       await pool.query("UPDATE categories SET product_count = product_count + 1 WHERE id = $1", [category_id])

// //       // Clear relevant caches
// //       await deleteFromCache("categories:all")
// //       await deleteFromCache("products:all")
// //       await deleteFromCache("products:featured")
// //       await deleteFromCache("products:sale")

// //       res.status(201).json({
// //         message: "Product created successfully",
// //         message_ar: "تم إنشاء المنتج بنجاح",
// //         product: result.rows[0],
// //         category: categoryCheck.rows[0],
// //       })
// //     } catch (err) {
// //       console.error("Error creating product:", err)

// //       // Handle specific errors
// //       if (err.code === "23503") {
// //         return res.status(400).json({
// //           error: "Invalid category",
// //           message: "التصنيف غير صحيح",
// //         })
// //       }

// //       if (err.code === "23505") {
// //         return res.status(400).json({
// //           error: "Product already exists",
// //           message: "المنتج موجود مسبقاً",
// //         })
// //       }

// //       res.status(500).json({ error: "Server error" })
// //     }
// //   },

// //   // Update product (Admin only)
// //   async updateProduct(req, res) {
// //     const { id } = req.params
// //     const {
// //       name,
// //       name_ar,
// //       brand,
// //       price,
// //       original_price,
// //       description,
// //       description_ar,
// //       category_id,
// //       emoji_icon,
// //       in_stock,
// //       discount,
// //       badge,
// //       image_url,
// //       stock_quantity,
// //     } = req.body

// //     try {
// //       // التحقق من صحة رابط الصورة إذا تم تقديمه
// //       if (image_url && !isValidImageUrl(image_url)) {
// //         return res.status(400).json({
// //           error: "Invalid image URL",
// //           message: "رابط الصورة غير صالح",
// //         })
// //       }

// //       // Calculate sale price if discount is provided
// //       const salePrice = discount > 0 ? price * (1 - discount / 100) : null

// //       let finalInStock = in_stock
// //       if (stock_quantity !== undefined && Number.parseInt(stock_quantity) === 0) {
// //         finalInStock = false
// //       }

// //       const query = `
// //         UPDATE products SET 
// //           name = COALESCE($1, name),
// //           name_ar = COALESCE($2, name_ar),
// //           brand = COALESCE($3, brand),
// //           price = COALESCE($4, price),
// //           original_price = COALESCE($5, original_price),
// //           description = COALESCE($6, description),
// //           description_ar = COALESCE($7, description_ar),
// //           category_id = COALESCE($8, category_id),
// //           emoji_icon = COALESCE($9, emoji_icon),
// //           in_stock = COALESCE($10, in_stock),
// //           discount = COALESCE($11, discount),
// //           badge = COALESCE($12, badge),
// //           image_url = COALESCE($13, image_url),
// //           stock_quantity = COALESCE($14, stock_quantity),
// //           sale_price = $15,
// //           updated_at = CURRENT_TIMESTAMP
// //         WHERE id = $16 
// //         RETURNING *
// //       `

// //       const params = [
// //         name,
// //         name_ar,
// //         brand,
// //         price,
// //         original_price,
// //         description,
// //         description_ar,
// //         category_id,
// //         emoji_icon,
// //         finalInStock,
// //         discount,
// //         badge,
// //         image_url,
// //         stock_quantity,
// //         salePrice,
// //         id,
// //       ]

// //       const result = await pool.query(query, params)

// //       if (result.rows.length === 0) {
// //         return res.status(404).json({
// //           error: "Product not found",
// //           message: "المنتج غير موجود",
// //         })
// //       }

// //       // Clear caches
// //       await deleteFromCache(`product:${id}`)
// //       await deleteFromCache("products:all")
// //       await deleteFromCache("products:featured")
// //       await deleteFromCache("products:sale")
// //       await deleteFromCache("categories:all")

// //       res.json({
// //         message: "Product updated successfully",
// //         message_ar: "تم تحديث المنتج بنجاح",
// //         product: result.rows[0],
// //       })
// //     } catch (err) {
// //       console.error("Error updating product:", err)
// //       res.status(500).json({ error: "Server error" })
// //     }
// //   },

// //   // Delete product (Admin only)
// //   async deleteProduct(req, res) {
// //     const { id } = req.params

// //     try {
// //       // Get product info before deletion for category update
// //       const productResult = await pool.query("SELECT category_id FROM products WHERE id = $1", [id])

// //       if (productResult.rows.length === 0) {
// //         return res.status(404).json({
// //           error: "Product not found",
// //           message: "المنتج غير موجود",
// //         })
// //       }

// //       const category_id = productResult.rows[0].category_id

// //       // Delete the product
// //       const result = await pool.query("DELETE FROM products WHERE id = $1 RETURNING *", [id])

// //       // Update category product count
// //       await pool.query("UPDATE categories SET product_count = GREATEST(0, product_count - 1) WHERE id = $1", [
// //         category_id,
// //       ])

// //       // Clear caches
// //       await deleteFromCache(`product:${id}`)
// //       await deleteFromCache("products:all")
// //       await deleteFromCache("products:featured")
// //       await deleteFromCache("products:sale")
// //       await deleteFromCache("categories:all")

// //       res.json({
// //         message: "Product deleted successfully",
// //         message_ar: "تم حذف المنتج بنجاح",
// //         product: result.rows[0],
// //       })
// //     } catch (err) {
// //       console.error("Error deleting product:", err)
// //       res.status(500).json({ error: "Server error" })
// //     }
// //   },

// //   // Get all products with filters
// //   async getProducts(req, res) {
// //     const { category, search, inStock, minPrice, maxPrice, sortBy, page = 1, limit = 20 } = req.query
// //     const offset = (page - 1) * limit

// //     try {
// //       let query = `
// //         SELECT p.*, c.name as category_name, c.name_ar as category_name_ar 
// //         FROM products p 
// //         LEFT JOIN categories c ON p.category_id = c.id 
// //         WHERE 1=1
// //       `
// //       const params = []
// //       let paramCount = 0

// //       if (category) {
// //         params.push(category)
// //         query += ` AND p.category_id = $${++paramCount}`
// //       }

// //       if (search) {
// //         params.push(`%${search}%`)
// //         query += ` AND (p.name ILIKE $${++paramCount} OR p.name_ar ILIKE $${paramCount} OR p.brand ILIKE $${paramCount})`
// //       }

// //       if (inStock === "true") {
// //         query += " AND p.in_stock = true"
// //       }

// //       if (minPrice) {
// //         params.push(minPrice)
// //         query += ` AND p.price >= $${++paramCount}`
// //       }

// //       if (maxPrice) {
// //         params.push(maxPrice)
// //         query += ` AND p.price <= $${++paramCount}`
// //       }

// //       // Sorting
// //       switch (sortBy) {
// //         case "price_asc":
// //           query += " ORDER BY p.price ASC"
// //           break
// //         case "price_desc":
// //           query += " ORDER BY p.price DESC"
// //           break
// //         case "rating":
// //           query += " ORDER BY p.rating DESC"
// //           break
// //         case "newest":
// //           query += " ORDER BY p.created_at DESC"
// //           break
// //         case "discount":
// //           query += " ORDER BY p.discount DESC NULLS LAST"
// //           break
// //         case "popular":
// //           query += " ORDER BY p.rating DESC, p.reviews_count DESC"
// //           break
// //         default:
// //           query += " ORDER BY p.created_at DESC"
// //       }

// //       params.push(Number.parseInt(limit), offset)
// //       query += ` LIMIT $${++paramCount} OFFSET $${++paramCount}`

// //       const result = await pool.query(query, params)

// //       // Get total count for pagination
// //       let countQuery = "SELECT COUNT(*) FROM products p WHERE 1=1"
// //       const countParams = []
// //       let countParamCount = 0

// //       if (category) {
// //         countParams.push(category)
// //         countQuery += ` AND p.category_id = $${++countParamCount}`
// //       }

// //       if (search) {
// //         countParams.push(`%${search}%`)
// //         countQuery += ` AND (p.name ILIKE $${++countParamCount} OR p.name_ar ILIKE $${countParamCount} OR p.brand ILIKE $${countParamCount})`
// //       }

// //       if (inStock === "true") {
// //         countQuery += " AND p.in_stock = true"
// //       }

// //       const countResult = await pool.query(countQuery, countParams)
// //       const totalCount = Number.parseInt(countResult.rows[0].count)

// //       const response = {
// //         products: result.rows,
// //         pagination: {
// //           total: totalCount,
// //           page: Number.parseInt(page),
// //           limit: Number.parseInt(limit),
// //           totalPages: Math.ceil(totalCount / limit),
// //         },
// //       }

// //       res.json(response)
// //     } catch (err) {
// //       console.error("Error fetching products:", err)
// //       res.status(500).json({ error: "Server error" })
// //     }
// //   },

// //   // Get single product
// //   async getProduct(req, res) {
// //     const { id } = req.params

// //     try {
// //       const cacheKey = `product:${id}`

// //       const cached = await getFromCache(cacheKey)
// //       if (cached) {
// //         return res.json(cached)
// //       }

// //       const result = await pool.query(
// //         `SELECT p.*, c.name as category_name, c.name_ar as category_name_ar
// //          FROM products p 
// //          LEFT JOIN categories c ON p.category_id = c.id 
// //          WHERE p.id = $1`,
// //         [id],
// //       )

// //       if (result.rows.length === 0) {
// //         return res.status(404).json({ error: "Product not found" })
// //       }

// //       const product = result.rows[0]

// //       // Get related products
// //       const relatedResult = await pool.query(
// //         `SELECT p.* 
// //          FROM products p 
// //          WHERE p.category_id = $1 AND p.id != $2 AND p.in_stock = true 
// //          ORDER BY p.rating DESC 
// //          LIMIT 6`,
// //         [product.category_id, id],
// //       )

// //       product.related_products = relatedResult.rows

// //       await setToCache(cacheKey, product, 1800)

// //       res.json(product)
// //     } catch (err) {
// //       console.error("Error fetching product:", err)
// //       res.status(500).json({ error: "Server error" })
// //     }
// //   },

// //   // Get featured products
// //   async getFeaturedProducts(req, res) {
// //     try {
// //       const cacheKey = "products:featured"

// //       const cached = await getFromCache(cacheKey)
// //       if (cached) {
// //         return res.json(cached)
// //       }

// //       const result = await pool.query(`
// //         SELECT p.*, c.name as category_name, c.name_ar as category_name_ar
// //         FROM products p 
// //         LEFT JOIN categories c ON p.category_id = c.id 
// //         WHERE p.in_stock = true AND p.featured = true
// //         ORDER BY p.rating DESC, p.discount DESC, p.created_at DESC 
// //         LIMIT 12
// //       `)

// //       await setToCache(cacheKey, result.rows, 1800)

// //       res.json(result.rows)
// //     } catch (err) {
// //       console.error("Error fetching featured products:", err)
// //       res.status(500).json({ error: "Server error" })
// //     }
// //   },

// //   // Get products on sale
// //   async getProductsOnSale(req, res) {
// //     const { page = 1, limit = 20 } = req.query
// //     const offset = (page - 1) * limit

// //     try {
// //       const cacheKey = `products:sale:page_${page}_limit_${limit}`

// //       const cached = await getFromCache(cacheKey)
// //       if (cached) {
// //         return res.json(cached)
// //       }

// //       const result = await pool.query(
// //         `
// //         SELECT p.*, c.name as category_name, c.name_ar as category_name_ar
// //         FROM products p 
// //         LEFT JOIN categories c ON p.category_id = c.id 
// //         WHERE p.discount > 0 AND p.in_stock = true 
// //         ORDER BY p.discount DESC 
// //         LIMIT $1 OFFSET $2
// //       `,
// //         [Number.parseInt(limit), offset],
// //       )

// //       const countResult = await pool.query("SELECT COUNT(*) FROM products WHERE discount > 0 AND in_stock = true")
// //       const totalCount = Number.parseInt(countResult.rows[0].count)

// //       const response = {
// //         products: result.rows,
// //         pagination: {
// //           total: totalCount,
// //           page: Number.parseInt(page),
// //           limit: Number.parseInt(limit),
// //           totalPages: Math.ceil(totalCount / limit),
// //         },
// //       }

// //       await setToCache(cacheKey, response, 1800)

// //       res.json(response)
// //     } catch (err) {
// //       console.error("Error fetching products on sale:", err)
// //       res.status(500).json({ error: "Server error" })
// //     }
// //   },

// //   // Search products
// //   async searchProducts(req, res) {
// //     const { q, category, minPrice, maxPrice, inStock, sortBy, page = 1, limit = 20 } = req.query
// //     const offset = (page - 1) * limit

// //     if (!q) {
// //       return res.status(400).json({ error: "Search query is required" })
// //     }

// //     try {
// //       let query = `
// //         SELECT p.*, c.name as category_name, c.name_ar as category_name_ar
// //         FROM products p 
// //         LEFT JOIN categories c ON p.category_id = c.id 
// //         WHERE (p.name ILIKE $1 OR p.name_ar ILIKE $1 OR p.brand ILIKE $1 OR p.description ILIKE $1)
// //       `
// //       const params = [`%${q}%`]
// //       let paramCount = 1

// //       if (category) {
// //         params.push(category)
// //         query += ` AND p.category_id = $${++paramCount}`
// //       }

// //       if (minPrice) {
// //         params.push(minPrice)
// //         query += ` AND p.price >= $${++paramCount}`
// //       }

// //       if (maxPrice) {
// //         params.push(maxPrice)
// //         query += ` AND p.price <= $${++paramCount}`
// //       }

// //       if (inStock === "true") {
// //         query += " AND p.in_stock = true"
// //       }

// //       // Sorting
// //       switch (sortBy) {
// //         case "price_asc":
// //           query += " ORDER BY p.price ASC"
// //           break
// //         case "price_desc":
// //           query += " ORDER BY p.price DESC"
// //           break
// //         case "rating":
// //           query += " ORDER BY p.rating DESC"
// //           break
// //         case "relevance":
// //         default:
// //           query += " ORDER BY p.rating DESC, p.created_at DESC"
// //       }

// //       params.push(Number.parseInt(limit), offset)
// //       query += ` LIMIT $${++paramCount} OFFSET $${++paramCount}`

// //       const result = await pool.query(query, params)

// //       // Count query
// //       let countQuery = `
// //         SELECT COUNT(*) 
// //         FROM products p
// //         WHERE (p.name ILIKE $1 OR p.name_ar ILIKE $1 OR p.brand ILIKE $1 OR p.description ILIKE $1)
// //       `
// //       const countParams = [`%${q}%`]

// //       if (category) {
// //         countParams.push(category)
// //         countQuery += ` AND p.category_id = $2`
// //       }

// //       const countResult = await pool.query(countQuery, countParams)
// //       const totalCount = Number.parseInt(countResult.rows[0].count)

// //       const response = {
// //         query: q,
// //         products: result.rows,
// //         pagination: {
// //           total: totalCount,
// //           page: Number.parseInt(page),
// //           limit: Number.parseInt(limit),
// //           totalPages: Math.ceil(totalCount / limit),
// //         },
// //       }

// //       res.json(response)
// //     } catch (err) {
// //       console.error("Error searching products:", err)
// //       res.status(500).json({ error: "Server error" })
// //     }
// //   },

// //   // Get products by category
// //   async getProductsByCategory(req, res) {
// //     const { categoryId } = req.params
// //     const { page = 1, limit = 20, sortBy } = req.query
// //     const offset = (page - 1) * limit

// //     try {
// //       // Verify category exists
// //       const categoryCheck = await pool.query("SELECT id, name, name_ar FROM categories WHERE id = $1", [categoryId])

// //       if (categoryCheck.rows.length === 0) {
// //         return res.status(404).json({ error: "Category not found" })
// //       }

// //       let query = `
// //         SELECT p.* 
// //         FROM products p 
// //         WHERE p.category_id = $1 AND p.in_stock = true
// //       `
// //       const params = [categoryId]

// //       // Sorting
// //       switch (sortBy) {
// //         case "price_asc":
// //           query += " ORDER BY p.price ASC"
// //           break
// //         case "price_desc":
// //           query += " ORDER BY p.price DESC"
// //           break
// //         case "rating":
// //           query += " ORDER BY p.rating DESC"
// //           break
// //         case "newest":
// //           query += " ORDER BY p.created_at DESC"
// //           break
// //         case "discount":
// //           query += " ORDER BY p.discount DESC NULLS LAST"
// //           break
// //         default:
// //           query += " ORDER BY p.created_at DESC"
// //       }

// //       query += ` LIMIT $2 OFFSET $3`
// //       params.push(Number.parseInt(limit), offset)

// //       const result = await pool.query(query, params)

// //       // Get total count
// //       const countResult = await pool.query("SELECT COUNT(*) FROM products WHERE category_id = $1 AND in_stock = true", [
// //         categoryId,
// //       ])
// //       const totalCount = Number.parseInt(countResult.rows[0].count)

// //       res.json({
// //         category: categoryCheck.rows[0],
// //         products: result.rows,
// //         pagination: {
// //           total: totalCount,
// //           page: Number.parseInt(page),
// //           limit: Number.parseInt(limit),
// //           totalPages: Math.ceil(totalCount / limit),
// //         },
// //       })
// //     } catch (err) {
// //       console.error("Error fetching category products:", err)
// //       res.status(500).json({ error: "Server error" })
// //     }
// //   },

// //   async rateProduct(req, res) {
// //     const { id } = req.params
// //     const { rating, comment } = req.body
// //     const userId = req.user.id

// //     // Validation
// //     if (!rating || rating < 1 || rating > 5) {
// //       return res.status(400).json({
// //         error: "Invalid rating",
// //         message: "التقييم يجب أن يكون بين 1 و 5",
// //         message_en: "Rating must be between 1 and 5",
// //       })
// //     }

// //     try {
// //       // Check if product exists
// //       const productCheck = await pool.query("SELECT id, name, name_ar FROM products WHERE id = $1", [id])

// //       if (productCheck.rows.length === 0) {
// //         return res.status(404).json({
// //           error: "Product not found",
// //           message: "المنتج غير موجود",
// //           message_en: "Product not found",
// //         })
// //       }

// //       // Check if user already rated this product
// //       const existingRating = await pool.query("SELECT id FROM reviews WHERE user_id = $1 AND product_id = $2", [
// //         userId,
// //         id,
// //       ])

// //       if (existingRating.rows.length > 0) {
// //         // Update existing rating
// //         await pool.query(
// //           "UPDATE reviews SET rating = $1, comment = $2, created_at = CURRENT_TIMESTAMP WHERE user_id = $3 AND product_id = $4",
// //           [rating, comment, userId, id],
// //         )
// //       } else {
// //         // Insert new rating
// //         await pool.query("INSERT INTO reviews (user_id, product_id, rating, comment) VALUES ($1, $2, $3, $4)", [
// //           userId,
// //           id,
// //           rating,
// //           comment,
// //         ])
// //       }

// //       // Calculate new average rating and update product
// //       const ratingStats = await pool.query(
// //         "SELECT AVG(rating)::DECIMAL(3,2) as avg_rating, COUNT(*) as review_count FROM reviews WHERE product_id = $1",
// //         [id],
// //       )

// //       const avgRating = Number.parseFloat(ratingStats.rows[0].avg_rating) || 0
// //       const reviewCount = Number.parseInt(ratingStats.rows[0].review_count) || 0

// //       await pool.query("UPDATE products SET rating = $1, reviews_count = $2 WHERE id = $3", [
// //         avgRating,
// //         reviewCount,
// //         id,
// //       ])

// //       // Clear product cache
// //       await deleteFromCache(`product:${id}`)
// //       await deleteFromCache("products:all")
// //       await deleteFromCache("products:featured")

// //       res.json({
// //         success: true,
// //         message: "تم إضافة التقييم بنجاح",
// //         message_en: "Rating added successfully",
// //         rating: {
// //           user_rating: rating,
// //           comment: comment,
// //           product_avg_rating: avgRating,
// //           total_reviews: reviewCount,
// //         },
// //       })
// //     } catch (err) {
// //       console.error("Error rating product:", err)
// //       res.status(500).json({
// //         error: "Server error",
// //         message: "حدث خطأ في الخادم",
// //         message_en: "Server error occurred",
// //       })
// //     }
// //   },

// //   async getProductRatings(req, res) {
// //     const { id } = req.params
// //     const { page = 1, limit = 10 } = req.query
// //     const offset = (page - 1) * limit

// //     try {
// //       // Get ratings with user info
// //       const result = await pool.query(
// //         `SELECT r.*, u.name as user_name, u.phone as user_phone
// //          FROM reviews r
// //          JOIN users u ON r.user_id = u.id
// //          WHERE r.product_id = $1
// //          ORDER BY r.created_at DESC
// //          LIMIT $2 OFFSET $3`,
// //         [id, Number.parseInt(limit), offset],
// //       )

// //       // Get total count
// //       const countResult = await pool.query("SELECT COUNT(*) FROM reviews WHERE product_id = $1", [id])
// //       const totalCount = Number.parseInt(countResult.rows[0].count)

// //       // Get rating distribution
// //       const distributionResult = await pool.query(
// //         `SELECT rating, COUNT(*) as count
// //          FROM reviews
// //          WHERE product_id = $1
// //          GROUP BY rating
// //          ORDER BY rating DESC`,
// //         [id],
// //       )

// //       res.json({
// //         reviews: result.rows,
// //         distribution: distributionResult.rows,
// //         pagination: {
// //           total: totalCount,
// //           page: Number.parseInt(page),
// //           limit: Number.parseInt(limit),
// //           totalPages: Math.ceil(totalCount / limit),
// //         },
// //       })
// //     } catch (err) {
// //       console.error("Error fetching product ratings:", err)
// //       res.status(500).json({
// //         error: "Server error",
// //         message: "حدث خطأ في الخادم",
// //         message_en: "Server error occurred",
// //       })
// //     }
// //   },
// // }

// // module.exports = productController







// const { pool } = require("../config/database")
// const { redisClient } = require("../config/redis")
// const { upload } = require("../config/multer") // Assuming multer is used for file upload

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

// async function setToCache(key, data, expiry = 3600) {
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

// // دالة للتحقق من صحة URL الصورة
// function isValidImageUrl(url) {
//   if (!url) return true

//   try {
//     const parsedUrl = new URL(url)
//     const allowedProtocols = ["http:", "https:"]
//     const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg", ".bmp", ".avif"]

//     if (!allowedProtocols.includes(parsedUrl.protocol)) {
//       return false
//     }

//     const pathname = parsedUrl.pathname.toLowerCase()
//     const hasValidExtension = allowedExtensions.some((ext) => pathname.endsWith(ext))

//     return hasValidExtension || pathname.includes("/images/") || pathname.includes("/products/")
//   } catch (err) {
//     return false
//   }
// }

// const productController = {
//   // Create new product (Admin only)
//   async createProduct(req, res) {
//     console.log("[v0] Create product request body:", req.body)
//     console.log("[v0] Create product file:", req.file)

//     const {
//       name,
//       name_ar,
//       brand,
//       price,
//       original_price,
//       description,
//       description_ar,
//       category_id,
//       emoji_icon,
//       in_stock = true,
//       discount = 0,
//       badge,
//       image_url,
//       stock_quantity = 0,
//     } = req.body

//     // Validation
//     if (!name || !name_ar || !price || !category_id) {
//       console.log("[v0] Validation failed - missing fields:", { name, name_ar, price, category_id })
//       return res.status(400).json({
//         error: "Missing required fields",
//         message: "يجب إدخال جميع الحقول المطلوبة (الاسم، الاسم العربي، السعر، التصنيف)",
//       })
//     }

//     if (price < 0) {
//       return res.status(400).json({
//         error: "Invalid price",
//         message: "السعر يجب أن يكون رقم موجب",
//       })
//     }

//     if (discount < 0 || discount > 100) {
//       return res.status(400).json({
//         error: "Invalid discount",
//         message: "الخصم يجب أن يكون بين 0 و 100",
//       })
//     }

//     let finalImageUrl = null

//     const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5001}`

//     if (req.file) {
//       // File was uploaded - save full URL
//       finalImageUrl = `${baseUrl}/uploads/products/${req.file.filename}`
//     } else if (image_url) {
//       // External URL provided
//       if (!isValidImageUrl(image_url)) {
//         return res.status(400).json({
//           error: "Invalid image URL",
//           message: "رابط الصورة غير صالح",
//         })
//       }
//       finalImageUrl = image_url
//     }

//     try {
//       const categoryCheck = await pool.query("SELECT id, name FROM categories WHERE id = $1", [category_id])

//       if (categoryCheck.rows.length === 0) {
//         return res.status(400).json({
//           error: "Category not found",
//           message: "التصنيف غير موجود",
//         })
//       }

//       const salePrice = discount > 0 ? price * (1 - discount / 100) : null
//       const finalInStock = Number.parseInt(stock_quantity) > 0 ? Boolean(in_stock) : false

//       const result = await pool.query(
//         `INSERT INTO products (
//           name, name_ar, brand, price, original_price, description, 
//           description_ar, category_id, image_url, emoji_icon, 
//           in_stock, discount, badge, stock_quantity, sale_price
//         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
//         RETURNING *`,
//         [
//           name,
//           name_ar,
//           brand,
//           Number.parseFloat(price),
//           original_price ? Number.parseFloat(original_price) : null,
//           description,
//           description_ar,
//           Number.parseInt(category_id),
//           finalImageUrl,
//           emoji_icon,
//           finalInStock,
//           Number.parseFloat(discount),
//           badge,
//           Number.parseInt(stock_quantity),
//           salePrice,
//         ],
//       )

//       await pool.query("UPDATE categories SET product_count = product_count + 1 WHERE id = $1", [category_id])

//       await deleteFromCache("categories:all")
//       await deleteFromCache("products:all")
//       await deleteFromCache("products:featured")
//       await deleteFromCache("products:sale")

//       res.status(201).json({
//         message: "Product created successfully",
//         message_ar: "تم إنشاء المنتج بنجاح",
//         product: result.rows[0],
//         category: categoryCheck.rows[0],
//       })
//     } catch (err) {
//       console.error("Error creating product:", err)

//       if (err.code === "23503") {
//         return res.status(400).json({
//           error: "Invalid category",
//           message: "التصنيف غير صحيح",
//         })
//       }

//       if (err.code === "23505") {
//         return res.status(400).json({
//           error: "Product already exists",
//           message: "المنتج موجود مسبقاً",
//         })
//       }

//       res.status(500).json({ error: "Server error" })
//     }
//   },

//   // Update product (Admin only)
//   async updateProduct(req, res) {
//     const { id } = req.params
//     const {
//       name,
//       name_ar,
//       brand,
//       price,
//       original_price,
//       description,
//       description_ar,
//       category_id,
//       emoji_icon,
//       in_stock,
//       discount,
//       badge,
//       image_url,
//       stock_quantity,
//     } = req.body

//     try {
//       let finalImageUrl = undefined

//       const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5001}`

//       if (req.file) {
//         // File was uploaded - save full URL
//         finalImageUrl = `${baseUrl}/uploads/products/${req.file.filename}`
//       } else if (image_url !== undefined) {
//         // External URL provided (or null to clear)
//         if (image_url && !isValidImageUrl(image_url)) {
//           return res.status(400).json({
//             error: "Invalid image URL",
//             message: "رابط الصورة غير صالح",
//           })
//         }
//         finalImageUrl = image_url
//       }

//       const salePrice = discount > 0 ? price * (1 - discount / 100) : null

//       let finalInStock = in_stock
//       if (stock_quantity !== undefined && Number.parseInt(stock_quantity) === 0) {
//         finalInStock = false
//       }

//       const query = `
//         UPDATE products SET 
//           name = COALESCE($1, name),
//           name_ar = COALESCE($2, name_ar),
//           brand = COALESCE($3, brand),
//           price = COALESCE($4, price),
//           original_price = COALESCE($5, original_price),
//           description = COALESCE($6, description),
//           description_ar = COALESCE($7, description_ar),
//           category_id = COALESCE($8, category_id),
//           emoji_icon = COALESCE($9, emoji_icon),
//           in_stock = COALESCE($10, in_stock),
//           discount = COALESCE($11, discount),
//           badge = COALESCE($12, badge)
//           ${finalImageUrl !== undefined ? ", image_url = $13" : ""},
//           stock_quantity = COALESCE($${finalImageUrl !== undefined ? "14" : "13"}, stock_quantity),
//           sale_price = $${finalImageUrl !== undefined ? "15" : "14"},
//           updated_at = CURRENT_TIMESTAMP
//         WHERE id = $${finalImageUrl !== undefined ? "16" : "15"}
//         RETURNING *
//       `

//       const params = [
//         name,
//         name_ar,
//         brand,
//         price,
//         original_price,
//         description,
//         description_ar,
//         category_id,
//         emoji_icon,
//         finalInStock,
//         discount,
//         badge,
//       ]

//       if (finalImageUrl !== undefined) {
//         params.push(finalImageUrl)
//       }

//       params.push(stock_quantity, salePrice, id)

//       const result = await pool.query(query, params)

//       if (result.rows.length === 0) {
//         return res.status(404).json({
//           error: "Product not found",
//           message: "المنتج غير موجود",
//         })
//       }

//       await deleteFromCache(`product:${id}`)
//       await deleteFromCache("products:all")
//       await deleteFromCache("products:featured")
//       await deleteFromCache("products:sale")
//       await deleteFromCache("categories:all")

//       res.json({
//         message: "Product updated successfully",
//         message_ar: "تم تحديث المنتج بنجاح",
//         product: result.rows[0],
//       })
//     } catch (err) {
//       console.error("Error updating product:", err)
//       res.status(500).json({ error: "Server error" })
//     }
//   },

//   // Delete product (Admin only)
//   async deleteProduct(req, res) {
//     const { id } = req.params

//     try {
//       // Get product info before deletion for category update
//       const productResult = await pool.query("SELECT category_id FROM products WHERE id = $1", [id])

//       if (productResult.rows.length === 0) {
//         return res.status(404).json({
//           error: "Product not found",
//           message: "المنتج غير موجود",
//         })
//       }

//       const category_id = productResult.rows[0].category_id

//       // Delete the product
//       const result = await pool.query("DELETE FROM products WHERE id = $1 RETURNING *", [id])

//       // Update category product count
//       await pool.query("UPDATE categories SET product_count = GREATEST(0, product_count - 1) WHERE id = $1", [
//         category_id,
//       ])

//       // Clear caches
//       await deleteFromCache(`product:${id}`)
//       await deleteFromCache("products:all")
//       await deleteFromCache("products:featured")
//       await deleteFromCache("products:sale")
//       await deleteFromCache("categories:all")

//       res.json({
//         message: "Product deleted successfully",
//         message_ar: "تم حذف المنتج بنجاح",
//         product: result.rows[0],
//       })
//     } catch (err) {
//       console.error("Error deleting product:", err)
//       res.status(500).json({ error: "Server error" })
//     }
//   },

//   // Get all products with filters
//   async getProducts(req, res) {
//     const { category, search, inStock, minPrice, maxPrice, sortBy, page = 1, limit = 20 } = req.query
//     const offset = (page - 1) * limit

//     try {
//       let query = `
//         SELECT p.*, c.name as category_name, c.name_ar as category_name_ar 
//         FROM products p 
//         LEFT JOIN categories c ON p.category_id = c.id 
//         WHERE 1=1
//       `
//       const params = []
//       let paramCount = 0

//       if (category) {
//         params.push(category)
//         query += ` AND p.category_id = $${++paramCount}`
//       }

//       if (search) {
//         params.push(`%${search}%`)
//         query += ` AND (p.name ILIKE $${++paramCount} OR p.name_ar ILIKE $${paramCount} OR p.brand ILIKE $${paramCount})`
//       }

//       if (inStock === "true") {
//         query += " AND p.in_stock = true"
//       }

//       if (minPrice) {
//         params.push(minPrice)
//         query += ` AND p.price >= $${++paramCount}`
//       }

//       if (maxPrice) {
//         params.push(maxPrice)
//         query += ` AND p.price <= $${++paramCount}`
//       }

//       // Sorting
//       switch (sortBy) {
//         case "price_asc":
//           query += " ORDER BY p.price ASC"
//           break
//         case "price_desc":
//           query += " ORDER BY p.price DESC"
//           break
//         case "rating":
//           query += " ORDER BY p.rating DESC"
//           break
//         case "newest":
//           query += " ORDER BY p.created_at DESC"
//           break
//         case "discount":
//           query += " ORDER BY p.discount DESC NULLS LAST"
//           break
//         case "popular":
//           query += " ORDER BY p.rating DESC, p.reviews_count DESC"
//           break
//         default:
//           query += " ORDER BY p.created_at DESC"
//       }

//       params.push(Number.parseInt(limit), offset)
//       query += ` LIMIT $${++paramCount} OFFSET $${++paramCount}`

//       const result = await pool.query(query, params)

//       // Get total count for pagination
//       let countQuery = "SELECT COUNT(*) FROM products p WHERE 1=1"
//       const countParams = []
//       let countParamCount = 0

//       if (category) {
//         countParams.push(category)
//         countQuery += ` AND p.category_id = $${++countParamCount}`
//       }

//       if (search) {
//         countParams.push(`%${search}%`)
//         countQuery += ` AND (p.name ILIKE $${++countParamCount} OR p.name_ar ILIKE $${countParamCount} OR p.brand ILIKE $${countParamCount})`
//       }

//       if (inStock === "true") {
//         countQuery += " AND p.in_stock = true"
//       }

//       const countResult = await pool.query(countQuery, countParams)
//       const totalCount = Number.parseInt(countResult.rows[0].count)

//       const response = {
//         products: result.rows,
//         pagination: {
//           total: totalCount,
//           page: Number.parseInt(page),
//           limit: Number.parseInt(limit),
//           totalPages: Math.ceil(totalCount / limit),
//         },
//       }

//       res.json(response)
//     } catch (err) {
//       console.error("Error fetching products:", err)
//       res.status(500).json({ error: "Server error" })
//     }
//   },

//   // Get single product
//   async getProduct(req, res) {
//     const { id } = req.params

//     try {
//       const cacheKey = `product:${id}`

//       const cached = await getFromCache(cacheKey)
//       if (cached) {
//         return res.json(cached)
//       }

//       const result = await pool.query(
//         `SELECT p.*, c.name as category_name, c.name_ar as category_name_ar
//          FROM products p 
//          LEFT JOIN categories c ON p.category_id = c.id 
//          WHERE p.id = $1`,
//         [id],
//       )

//       if (result.rows.length === 0) {
//         return res.status(404).json({ error: "Product not found" })
//       }

//       const product = result.rows[0]

//       // Get related products
//       const relatedResult = await pool.query(
//         `SELECT p.* 
//          FROM products p 
//          WHERE p.category_id = $1 AND p.id != $2 AND p.in_stock = true 
//          ORDER BY p.rating DESC 
//          LIMIT 6`,
//         [product.category_id, id],
//       )

//       product.related_products = relatedResult.rows

//       await setToCache(cacheKey, product, 1800)

//       res.json(product)
//     } catch (err) {
//       console.error("Error fetching product:", err)
//       res.status(500).json({ error: "Server error" })
//     }
//   },

//   // Get featured products
//   async getFeaturedProducts(req, res) {
//     try {
//       const cacheKey = "products:featured"

//       const cached = await getFromCache(cacheKey)
//       if (cached) {
//         return res.json(cached)
//       }

//       const result = await pool.query(`
//         SELECT p.*, c.name as category_name, c.name_ar as category_name_ar
//         FROM products p 
//         LEFT JOIN categories c ON p.category_id = c.id 
//         WHERE p.in_stock = true AND p.featured = true
//         ORDER BY p.rating DESC, p.discount DESC, p.created_at DESC 
//         LIMIT 12
//       `)

//       await setToCache(cacheKey, result.rows, 1800)

//       res.json(result.rows)
//     } catch (err) {
//       console.error("Error fetching featured products:", err)
//       res.status(500).json({ error: "Server error" })
//     }
//   },

//   // Get products on sale
//   async getProductsOnSale(req, res) {
//     const { page = 1, limit = 20 } = req.query
//     const offset = (page - 1) * limit

//     try {
//       const cacheKey = `products:sale:page_${page}_limit_${limit}`

//       const cached = await getFromCache(cacheKey)
//       if (cached) {
//         return res.json(cached)
//       }

//       const result = await pool.query(
//         `
//         SELECT p.*, c.name as category_name, c.name_ar as category_name_ar
//         FROM products p 
//         LEFT JOIN categories c ON p.category_id = c.id 
//         WHERE p.discount > 0 AND p.in_stock = true 
//         ORDER BY p.discount DESC 
//         LIMIT $1 OFFSET $2
//       `,
//         [Number.parseInt(limit), offset],
//       )

//       const countResult = await pool.query("SELECT COUNT(*) FROM products WHERE discount > 0 AND in_stock = true")
//       const totalCount = Number.parseInt(countResult.rows[0].count)

//       const response = {
//         products: result.rows,
//         pagination: {
//           total: totalCount,
//           page: Number.parseInt(page),
//           limit: Number.parseInt(limit),
//           totalPages: Math.ceil(totalCount / limit),
//         },
//       }

//       await setToCache(cacheKey, response, 1800)

//       res.json(response)
//     } catch (err) {
//       console.error("Error fetching products on sale:", err)
//       res.status(500).json({ error: "Server error" })
//     }
//   },

//   // Search products
//   async searchProducts(req, res) {
//     const { q, category, minPrice, maxPrice, inStock, sortBy, page = 1, limit = 20 } = req.query
//     const offset = (page - 1) * limit

//     if (!q) {
//       return res.status(400).json({ error: "Search query is required" })
//     }

//     try {
//       let query = `
//         SELECT p.*, c.name as category_name, c.name_ar as category_name_ar
//         FROM products p 
//         LEFT JOIN categories c ON p.category_id = c.id 
//         WHERE (p.name ILIKE $1 OR p.name_ar ILIKE $1 OR p.brand ILIKE $1 OR p.description ILIKE $1)
//       `
//       const params = [`%${q}%`]
//       let paramCount = 1

//       if (category) {
//         params.push(category)
//         query += ` AND p.category_id = $${++paramCount}`
//       }

//       if (minPrice) {
//         params.push(minPrice)
//         query += ` AND p.price >= $${++paramCount}`
//       }

//       if (maxPrice) {
//         params.push(maxPrice)
//         query += ` AND p.price <= $${++paramCount}`
//       }

//       if (inStock === "true") {
//         query += " AND p.in_stock = true"
//       }

//       // Sorting
//       switch (sortBy) {
//         case "price_asc":
//           query += " ORDER BY p.price ASC"
//           break
//         case "price_desc":
//           query += " ORDER BY p.price DESC"
//           break
//         case "rating":
//           query += " ORDER BY p.rating DESC"
//           break
//         case "relevance":
//         default:
//           query += " ORDER BY p.rating DESC, p.created_at DESC"
//       }

//       params.push(Number.parseInt(limit), offset)
//       query += ` LIMIT $${++paramCount} OFFSET $${++paramCount}`

//       const result = await pool.query(query, params)

//       // Count query
//       let countQuery = `
//         SELECT COUNT(*) 
//         FROM products p
//         WHERE (p.name ILIKE $1 OR p.name_ar ILIKE $1 OR p.brand ILIKE $1 OR p.description ILIKE $1)
//       `
//       const countParams = [`%${q}%`]

//       if (category) {
//         countParams.push(category)
//         countQuery += ` AND p.category_id = $2`
//       }

//       const countResult = await pool.query(countQuery, countParams)
//       const totalCount = Number.parseInt(countResult.rows[0].count)

//       const response = {
//         query: q,
//         products: result.rows,
//         pagination: {
//           total: totalCount,
//           page: Number.parseInt(page),
//           limit: Number.parseInt(limit),
//           totalPages: Math.ceil(totalCount / limit),
//         },
//       }

//       res.json(response)
//     } catch (err) {
//       console.error("Error searching products:", err)
//       res.status(500).json({ error: "Server error" })
//     }
//   },

//   // Get products by category
//   async getProductsByCategory(req, res) {
//     const { categoryId } = req.params
//     const { page = 1, limit = 20, sortBy } = req.query
//     const offset = (page - 1) * limit

//     try {
//       // Verify category exists
//       const categoryCheck = await pool.query("SELECT id, name, name_ar FROM categories WHERE id = $1", [categoryId])

//       if (categoryCheck.rows.length === 0) {
//         return res.status(404).json({ error: "Category not found" })
//       }

//       let query = `
//         SELECT p.* 
//         FROM products p 
//         WHERE p.category_id = $1 AND p.in_stock = true
//       `
//       const params = [categoryId]

//       // Sorting
//       switch (sortBy) {
//         case "price_asc":
//           query += " ORDER BY p.price ASC"
//           break
//         case "price_desc":
//           query += " ORDER BY p.price DESC"
//           break
//         case "rating":
//           query += " ORDER BY p.rating DESC"
//           break
//         case "newest":
//           query += " ORDER BY p.created_at DESC"
//           break
//         case "discount":
//           query += " ORDER BY p.discount DESC NULLS LAST"
//           break
//         default:
//           query += " ORDER BY p.created_at DESC"
//       }

//       query += ` LIMIT $2 OFFSET $3`
//       params.push(Number.parseInt(limit), offset)

//       const result = await pool.query(query, params)

//       // Get total count
//       const countResult = await pool.query("SELECT COUNT(*) FROM products WHERE category_id = $1 AND in_stock = true", [
//         categoryId,
//       ])
//       const totalCount = Number.parseInt(countResult.rows[0].count)

//       res.json({
//         category: categoryCheck.rows[0],
//         products: result.rows,
//         pagination: {
//           total: totalCount,
//           page: Number.parseInt(page),
//           limit: Number.parseInt(limit),
//           totalPages: Math.ceil(totalCount / limit),
//         },
//       })
//     } catch (err) {
//       console.error("Error fetching category products:", err)
//       res.status(500).json({ error: "Server error" })
//     }
//   },

//   async rateProduct(req, res) {
//     const { id } = req.params
//     const { rating, comment } = req.body
//     const userId = req.user.id

//     // Validation
//     if (!rating || rating < 1 || rating > 5) {
//       return res.status(400).json({
//         error: "Invalid rating",
//         message: "التقييم يجب أن يكون بين 1 و 5",
//         message_en: "Rating must be between 1 and 5",
//       })
//     }

//     try {
//       // Check if product exists
//       const productCheck = await pool.query("SELECT id, name, name_ar FROM products WHERE id = $1", [id])

//       if (productCheck.rows.length === 0) {
//         return res.status(404).json({
//           error: "Product not found",
//           message: "المنتج غير موجود",
//           message_en: "Product not found",
//         })
//       }

//       // Check if user already rated this product
//       const existingRating = await pool.query("SELECT id FROM reviews WHERE user_id = $1 AND product_id = $2", [
//         userId,
//         id,
//       ])

//       if (existingRating.rows.length > 0) {
//         // Update existing rating
//         await pool.query(
//           "UPDATE reviews SET rating = $1, comment = $2, created_at = CURRENT_TIMESTAMP WHERE user_id = $3 AND product_id = $4",
//           [rating, comment, userId, id],
//         )
//       } else {
//         // Insert new rating
//         await pool.query("INSERT INTO reviews (user_id, product_id, rating, comment) VALUES ($1, $2, $3, $4)", [
//           userId,
//           id,
//           rating,
//           comment,
//         ])
//       }

//       // Calculate new average rating and update product
//       const ratingStats = await pool.query(
//         "SELECT AVG(rating)::DECIMAL(3,2) as avg_rating, COUNT(*) as review_count FROM reviews WHERE product_id = $1",
//         [id],
//       )

//       const avgRating = Number.parseFloat(ratingStats.rows[0].avg_rating) || 0
//       const reviewCount = Number.parseInt(ratingStats.rows[0].review_count) || 0

//       await pool.query("UPDATE products SET rating = $1, reviews_count = $2 WHERE id = $3", [
//         avgRating,
//         reviewCount,
//         id,
//       ])

//       // Clear product cache
//       await deleteFromCache(`product:${id}`)
//       await deleteFromCache("products:all")
//       await deleteFromCache("products:featured")

//       res.json({
//         success: true,
//         message: "تم إضافة التقييم بنجاح",
//         message_en: "Rating added successfully",
//         rating: {
//           user_rating: rating,
//           comment: comment,
//           product_avg_rating: avgRating,
//           total_reviews: reviewCount,
//         },
//       })
//     } catch (err) {
//       console.error("Error rating product:", err)
//       res.status(500).json({
//         error: "Server error",
//         message: "حدث خطأ في الخادم",
//         message_en: "Server error occurred",
//       })
//     }
//   },

//   async getProductRatings(req, res) {
//     const { id } = req.params
//     const { page = 1, limit = 10 } = req.query
//     const offset = (page - 1) * limit

//     try {
//       // Get ratings with user info
//       const result = await pool.query(
//         `SELECT r.*, u.name as user_name, u.phone as user_phone
//          FROM reviews r
//          JOIN users u ON r.user_id = u.id
//          WHERE r.product_id = $1
//          ORDER BY r.created_at DESC
//          LIMIT $2 OFFSET $3`,
//         [id, Number.parseInt(limit), offset],
//       )

//       // Get total count
//       const countResult = await pool.query("SELECT COUNT(*) FROM reviews WHERE product_id = $1", [id])
//       const totalCount = Number.parseInt(countResult.rows[0].count)

//       // Get rating distribution
//       const distributionResult = await pool.query(
//         `SELECT rating, COUNT(*) as count
//          FROM reviews
//          WHERE product_id = $1
//          GROUP BY rating
//          ORDER BY rating DESC`,
//         [id],
//       )

//       res.json({
//         reviews: result.rows,
//         distribution: distributionResult.rows,
//         pagination: {
//           total: totalCount,
//           page: Number.parseInt(page),
//           limit: Number.parseInt(limit),
//           totalPages: Math.ceil(totalCount / limit),
//         },
//       })
//     } catch (err) {
//       console.error("Error fetching product ratings:", err)
//       res.status(500).json({
//         error: "Server error",
//         message: "حدث خطأ في الخادم",
//         message_en: "Server error occurred",
//       })
//     }
//   },
// }

// module.exports = productController











const { pool } = require("../config/database")
const { redisClient } = require("../config/redis")
const { upload } = require("../config/multer")
const { uploadToBlob, deleteFromBlob } = require("../config/blob")

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
    console.log("[v0] Create product request body:", req.body)
    console.log("[v0] Create product file:", req.file)

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
      console.log("[v0] Validation failed - missing fields:", { name, name_ar, price, category_id })
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

    let finalImageUrl = null

    if (req.file) {
      try {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
        const ext = req.file.originalname.split(".").pop()
        const filename = `product-${uniqueSuffix}.${ext}`

        finalImageUrl = await uploadToBlob(req.file.buffer, filename, "products")
        console.log("[v0] Uploaded to Blob:", finalImageUrl)
      } catch (error) {
        console.error("[v0] Blob upload error:", error)
        return res.status(500).json({
          error: "File upload failed",
          message: "فشل رفع الصورة",
        })
      }
    } else if (image_url) {
      // External URL provided
      if (!isValidImageUrl(image_url)) {
        return res.status(400).json({
          error: "Invalid image URL",
          message: "رابط الصورة غير صالح",
        })
      }
      finalImageUrl = image_url
    }

    try {
      const categoryCheck = await pool.query("SELECT id, name FROM categories WHERE id = $1", [category_id])

      if (categoryCheck.rows.length === 0) {
        return res.status(400).json({
          error: "Category not found",
          message: "التصنيف غير موجود",
        })
      }

      const salePrice = discount > 0 ? price * (1 - discount / 100) : null
      const finalInStock = Number.parseInt(stock_quantity) > 0 ? Boolean(in_stock) : false

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
          finalImageUrl,
          emoji_icon,
          finalInStock,
          Number.parseFloat(discount),
          badge,
          Number.parseInt(stock_quantity),
          salePrice,
        ],
      )

      await pool.query("UPDATE categories SET product_count = product_count + 1 WHERE id = $1", [category_id])

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
      const oldProduct = await pool.query("SELECT image_url FROM products WHERE id = $1", [id])
      const oldImageUrl = oldProduct.rows[0]?.image_url

      let finalImageUrl = undefined

      if (req.file) {
        try {
          const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
          const ext = req.file.originalname.split(".").pop()
          const filename = `product-${uniqueSuffix}.${ext}`

          finalImageUrl = await uploadToBlob(req.file.buffer, filename, "products")
          console.log("[v0] Uploaded to Blob:", finalImageUrl)

          // Delete old image if it was a blob URL
          if (oldImageUrl) {
            await deleteFromBlob(oldImageUrl)
          }
        } catch (error) {
          console.error("[v0] Blob upload error:", error)
          return res.status(500).json({
            error: "File upload failed",
            message: "فشل رفع الصورة",
          })
        }
      } else if (image_url !== undefined) {
        // External URL provided (or null to clear)
        if (image_url && !isValidImageUrl(image_url)) {
          return res.status(400).json({
            error: "Invalid image URL",
            message: "رابط الصورة غير صالح",
          })
        }
        finalImageUrl = image_url

        // If clearing the image, delete old blob image
        if (!image_url && oldImageUrl) {
          await deleteFromBlob(oldImageUrl)
        }
      }

      const salePrice = discount > 0 ? price * (1 - discount / 100) : null

      let finalInStock = in_stock
      if (stock_quantity !== undefined && Number.parseInt(stock_quantity) === 0) {
        finalInStock = false
      }

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
          badge = COALESCE($12, badge)
          ${finalImageUrl !== undefined ? ", image_url = $13" : ""},
          stock_quantity = COALESCE($${finalImageUrl !== undefined ? "14" : "13"}, stock_quantity),
          sale_price = $${finalImageUrl !== undefined ? "15" : "14"},
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $${finalImageUrl !== undefined ? "16" : "15"}
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
        finalInStock,
        discount,
        badge,
      ]

      if (finalImageUrl !== undefined) {
        params.push(finalImageUrl)
      }

      params.push(stock_quantity, salePrice, id)

      const result = await pool.query(query, params)

      if (result.rows.length === 0) {
        return res.status(404).json({
          error: "Product not found",
          message: "المنتج غير موجود",
        })
      }

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
      // Get product info before deletion for category update
      const productResult = await pool.query("SELECT category_id, image_url FROM products WHERE id = $1", [id])

      if (productResult.rows.length === 0) {
        return res.status(404).json({
          error: "Product not found",
          message: "المنتج غير موجود",
        })
      }

      const category_id = productResult.rows[0].category_id
      const imageUrl = productResult.rows[0].image_url

      // Delete image from blob storage if it's a blob URL
      if (imageUrl && imageUrl.startsWith(process.env.BLOB_STORAGE_URL)) {
        await deleteFromBlob(imageUrl)
      }

      // Delete the product
      const result = await pool.query("DELETE FROM products WHERE id = $1 RETURNING *", [id])

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
      console.error("Error deleting product:", err)
      res.status(500).json({ error: "Server error" })
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

  async rateProduct(req, res) {
    const { id } = req.params
    const { rating, comment } = req.body
    const userId = req.user.id

    // Validation
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        error: "Invalid rating",
        message: "التقييم يجب أن يكون بين 1 و 5",
        message_en: "Rating must be between 1 and 5",
      })
    }

    try {
      // Check if product exists
      const productCheck = await pool.query("SELECT id, name, name_ar FROM products WHERE id = $1", [id])

      if (productCheck.rows.length === 0) {
        return res.status(404).json({
          error: "Product not found",
          message: "المنتج غير موجود",
          message_en: "Product not found",
        })
      }

      // Check if user already rated this product
      const existingRating = await pool.query("SELECT id FROM reviews WHERE user_id = $1 AND product_id = $2", [
        userId,
        id,
      ])

      if (existingRating.rows.length > 0) {
        // Update existing rating
        await pool.query(
          "UPDATE reviews SET rating = $1, comment = $2, created_at = CURRENT_TIMESTAMP WHERE user_id = $3 AND product_id = $4",
          [rating, comment, userId, id],
        )
      } else {
        // Insert new rating
        await pool.query("INSERT INTO reviews (user_id, product_id, rating, comment) VALUES ($1, $2, $3, $4)", [
          userId,
          id,
          rating,
          comment,
        ])
      }

      // Calculate new average rating and update product
      const ratingStats = await pool.query(
        "SELECT AVG(rating)::DECIMAL(3,2) as avg_rating, COUNT(*) as review_count FROM reviews WHERE product_id = $1",
        [id],
      )

      const avgRating = Number.parseFloat(ratingStats.rows[0].avg_rating) || 0
      const reviewCount = Number.parseInt(ratingStats.rows[0].review_count) || 0

      await pool.query("UPDATE products SET rating = $1, reviews_count = $2 WHERE id = $3", [
        avgRating,
        reviewCount,
        id,
      ])

      // Clear product cache
      await deleteFromCache(`product:${id}`)
      await deleteFromCache("products:all")
      await deleteFromCache("products:featured")

      res.json({
        success: true,
        message: "تم إضافة التقييم بنجاح",
        message_en: "Rating added successfully",
        rating: {
          user_rating: rating,
          comment: comment,
          product_avg_rating: avgRating,
          total_reviews: reviewCount,
        },
      })
    } catch (err) {
      console.error("Error rating product:", err)
      res.status(500).json({
        error: "Server error",
        message: "حدث خطأ في الخادم",
        message_en: "Server error occurred",
      })
    }
  },

  async getProductRatings(req, res) {
    const { id } = req.params
    const { page = 1, limit = 10 } = req.query
    const offset = (page - 1) * limit

    try {
      // Get ratings with user info
      const result = await pool.query(
        `SELECT r.*, u.name as user_name, u.phone as user_phone
         FROM reviews r
         JOIN users u ON r.user_id = u.id
         WHERE r.product_id = $1
         ORDER BY r.created_at DESC
         LIMIT $2 OFFSET $3`,
        [id, Number.parseInt(limit), offset],
      )

      // Get total count
      const countResult = await pool.query("SELECT COUNT(*) FROM reviews WHERE product_id = $1", [id])
      const totalCount = Number.parseInt(countResult.rows[0].count)

      // Get rating distribution
      const distributionResult = await pool.query(
        `SELECT rating, COUNT(*) as count
         FROM reviews
         WHERE product_id = $1
         GROUP BY rating
         ORDER BY rating DESC`,
        [id],
      )

      res.json({
        reviews: result.rows,
        distribution: distributionResult.rows,
        pagination: {
          total: totalCount,
          page: Number.parseInt(page),
          limit: Number.parseInt(limit),
          totalPages: Math.ceil(totalCount / limit),
        },
      })
    } catch (err) {
      console.error("Error fetching product ratings:", err)
      res.status(500).json({
        error: "Server error",
        message: "حدث خطأ في الخادم",
        message_en: "Server error occurred",
      })
    }
  },
}

module.exports = productController
