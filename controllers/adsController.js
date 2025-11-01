// // const { pool } = require('../config/database');

// // // إنشاء إعلان جديد
// // const createAd = async (req, res) => {
// //   try {
// //     const {
// //       product_id,
// //       title,
// //       title_ar,
// //       description,
// //       description_ar,
// //       image_url,
// //       start_date,
// //       end_date,
// //       position = 'home_banner',
// //       priority = 0
// //     } = req.body;

// //     // التحقق من وجود المنتج
// //     const productCheck = await pool.query(
// //       'SELECT id FROM products WHERE id = $1',
// //       [product_id]
// //     );

// //     if (productCheck.rows.length === 0) {
// //       return res.status(404).json({ error: 'المنتج غير موجود' });
// //     }

// //     const result = await pool.query(
// //       `INSERT INTO ads (
// //         product_id, title, title_ar, description, description_ar, 
// //         image_url, start_date, end_date, position, priority
// //       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
// //       RETURNING *`,
// //       [
// //         product_id, title, title_ar, description, description_ar,
// //         image_url, start_date, end_date, position, priority
// //       ]
// //     );

// //     res.status(201).json({
// //       success: true,
// //       message: 'تم إنشاء الإعلان بنجاح',
// //       ad: result.rows[0]
// //     });
// //   } catch (error) {
// //     console.error('Error creating ad:', error);
// //     res.status(500).json({ error: 'فشل في إنشاء الإعلان' });
// //   }
// // };

// // // الحصول على جميع الإعلانات
// // const getAllAds = async (req, res) => {
// //   try {
// //     const { active_only, position } = req.query;

// //     let query = `
// //       SELECT 
// //         ads.*,
// //         products.name as product_name,
// //         products.name_ar as product_name_ar,
// //         products.price as product_price,
// //         products.image_url as product_image
// //       FROM ads 
// //       LEFT JOIN products ON ads.product_id = products.id
// //     `;
    
// //     const params = [];
// //     let conditions = [];

// //     if (active_only === 'true') {
// //       conditions.push('ads.is_active = true AND ads.start_date <= NOW() AND ads.end_date >= NOW()');
// //     }

// //     if (position) {
// //       conditions.push('ads.position = $1');
// //       params.push(position);
// //     }

// //     if (conditions.length > 0) {
// //       query += ' WHERE ' + conditions.join(' AND ');
// //     }

// //     query += ' ORDER BY ads.priority DESC, ads.created_at DESC';

// //     const result = await pool.query(query, params);

// //     res.json({
// //       success: true,
// //       ads: result.rows
// //     });
// //   } catch (error) {
// //     console.error('Error fetching ads:', error);
// //     res.status(500).json({ error: 'فشل في جلب الإعلانات' });
// //   }
// // };

// // // الحصول على إعلان بواسطة ID
// // const getAdById = async (req, res) => {
// //   try {
// //     const { id } = req.params;

// //     const result = await pool.query(
// //       `SELECT 
// //         ads.*,
// //         products.name as product_name,
// //         products.name_ar as product_name_ar,
// //         products.price as product_price,
// //         products.image_url as product_image,
// //         products.description as product_description,
// //         products.description_ar as product_description_ar
// //       FROM ads 
// //       LEFT JOIN products ON ads.product_id = products.id
// //       WHERE ads.id = $1`,
// //       [id]
// //     );

// //     if (result.rows.length === 0) {
// //       return res.status(404).json({ error: 'الإعلان غير موجود' });
// //     }

// //     res.json({
// //       success: true,
// //       ad: result.rows[0]
// //     });
// //   } catch (error) {
// //     console.error('Error fetching ad:', error);
// //     res.status(500).json({ error: 'فشل في جلب الإعلان' });
// //   }
// // };

// // // تحديث إعلان
// // const updateAd = async (req, res) => {
// //   try {
// //     const { id } = req.params;
// //     const {
// //       product_id,
// //       title,
// //       title_ar,
// //       description,
// //       description_ar,
// //       image_url,
// //       start_date,
// //       end_date,
// //       is_active,
// //       position,
// //       priority
// //     } = req.body;

// //     // التحقق من وجود الإعلان
// //     const adCheck = await pool.query('SELECT id FROM ads WHERE id = $1', [id]);
// //     if (adCheck.rows.length === 0) {
// //       return res.status(404).json({ error: 'الإعلان غير موجود' });
// //     }

// //     // التحقق من وجود المنتج إذا تم تحديث product_id
// //     if (product_id) {
// //       const productCheck = await pool.query(
// //         'SELECT id FROM products WHERE id = $1',
// //         [product_id]
// //       );
// //       if (productCheck.rows.length === 0) {
// //         return res.status(404).json({ error: 'المنتج غير موجود' });
// //       }
// //     }

// //     const result = await pool.query(
// //       `UPDATE ads SET 
// //         product_id = COALESCE($1, product_id),
// //         title = COALESCE($2, title),
// //         title_ar = COALESCE($3, title_ar),
// //         description = COALESCE($4, description),
// //         description_ar = COALESCE($5, description_ar),
// //         image_url = COALESCE($6, image_url),
// //         start_date = COALESCE($7, start_date),
// //         end_date = COALESCE($8, end_date),
// //         is_active = COALESCE($9, is_active),
// //         position = COALESCE($10, position),
// //         priority = COALESCE($11, priority),
// //         updated_at = CURRENT_TIMESTAMP
// //       WHERE id = $12
// //       RETURNING *`,
// //       [
// //         product_id, title, title_ar, description, description_ar,
// //         image_url, start_date, end_date, is_active, position,
// //         priority, id
// //       ]
// //     );

// //     res.json({
// //       success: true,
// //       message: 'تم تحديث الإعلان بنجاح',
// //       ad: result.rows[0]
// //     });
// //   } catch (error) {
// //     console.error('Error updating ad:', error);
// //     res.status(500).json({ error: 'فشل في تحديث الإعلان' });
// //   }
// // };

// // // حذف إعلان
// // const deleteAd = async (req, res) => {
// //   try {
// //     const { id } = req.params;

// //     const result = await pool.query(
// //       'DELETE FROM ads WHERE id = $1 RETURNING *',
// //       [id]
// //     );

// //     if (result.rows.length === 0) {
// //       return res.status(404).json({ error: 'الإعلان غير موجود' });
// //     }

// //     res.json({
// //       success: true,
// //       message: 'تم حذف الإعلان بنجاح'
// //     });
// //   } catch (error) {
// //     console.error('Error deleting ad:', error);
// //     res.status(500).json({ error: 'فشل في حذف الإعلان' });
// //   }
// // };

// // // زيادة عداد المشاهدات
// // const incrementViewCount = async (req, res) => {
// //   try {
// //     const { id } = req.params;

// //     await pool.query(
// //       'UPDATE ads SET view_count = view_count + 1 WHERE id = $1',
// //       [id]
// //     );

// //     res.json({ success: true, message: 'تم تحديث عداد المشاهدات' });
// //   } catch (error) {
// //     console.error('Error incrementing view count:', error);
// //     res.status(500).json({ error: 'فشل في تحديث العداد' });
// //   }
// // };

// // // زيادة عداد النقرات
// // const incrementClickCount = async (req, res) => {
// //   try {
// //     const { id } = req.params;

// //     await pool.query(
// //       'UPDATE ads SET click_count = click_count + 1 WHERE id = $1',
// //       [id]
// //     );

// //     res.json({ success: true, message: 'تم تحديث عداد النقرات' });
// //   } catch (error) {
// //     console.error('Error incrementing click count:', error);
// //     res.status(500).json({ error: 'فشل في تحديث العداد' });
// //   }
// // };

// // // الحصول على إعلانات الصفحة الرئيسية
// // const getHomepageAds = async (req, res) => {
// //   try {
// //     const result = await pool.query(
// //       `SELECT 
// //         ads.*,
// //         products.name as product_name,
// //         products.name_ar as product_name_ar,
// //         products.price as product_price,
// //         products.original_price as product_original_price,
// //         products.image_url as product_image,
// //         products.discount as product_discount
// //       FROM ads 
// //       LEFT JOIN products ON ads.product_id = products.id
// //       WHERE ads.is_active = true 
// //         AND ads.start_date <= NOW() 
// //         AND ads.end_date >= NOW()
// //         AND ads.position = 'home_banner'
// //       ORDER BY ads.priority DESC, ads.created_at DESC
// //       LIMIT 10`
// //     );

// //     res.json({
// //       success: true,
// //       ads: result.rows
// //     });
// //   } catch (error) {
// //     console.error('Error fetching homepage ads:', error);
// //     res.status(500).json({ error: 'فشل في جلب إعلانات الصفحة الرئيسية' });
// //   }
// // };

// // module.exports = {
// //   createAd,
// //   getAllAds,
// //   getAdById,
// //   updateAd,
// //   deleteAd,
// //   incrementViewCount,
// //   incrementClickCount,
// //   getHomepageAds
// // };








// const { pool } = require("../config/database")

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

//     return hasValidExtension || pathname.includes("/images/") || pathname.includes("/ads/")
//   } catch (err) {
//     return false
//   }
// }

// // إنشاء إعلان جديد
// const createAd = async (req, res) => {
//   try {
//     console.log("[v0] Creating ad - req.body:", req.body)
//     console.log("[v0] Creating ad - req.file:", req.file)

//     const {
//       product_id,
//       title,
//       title_ar,
//       description,
//       description_ar,
//       image_url,
//       start_date,
//       end_date,
//       position = "home_banner",
//       priority = 0,
//     } = req.body

//     // التحقق من وجود المنتج
//     const productCheck = await pool.query("SELECT id FROM products WHERE id = $1", [product_id])

//     if (productCheck.rows.length === 0) {
//       return res.status(404).json({
//         error: "المنتج غير موجود",
//         message: "Product not found",
//       })
//     }

//     let finalImageUrl = null
//     const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5001}`

//     if (req.file) {
//       // File was uploaded - save full URL
//       finalImageUrl = `${baseUrl}/uploads/ads/${req.file.filename}`
//       console.log("[v0] Using uploaded file:", finalImageUrl)
//     } else if (image_url) {
//       // External URL provided
//       if (!isValidImageUrl(image_url)) {
//         return res.status(400).json({
//           error: "رابط الصورة غير صالح",
//           message: "Invalid image URL",
//         })
//       }
//       finalImageUrl = image_url
//       console.log("[v0] Using external URL:", finalImageUrl)
//     }

//     const result = await pool.query(
//       `INSERT INTO ads (
//         product_id, title, title_ar, description, description_ar, 
//         image_url, start_date, end_date, position, priority
//       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
//       RETURNING *`,
//       [
//         product_id,
//         title,
//         title_ar,
//         description,
//         description_ar,
//         finalImageUrl,
//         start_date,
//         end_date,
//         position,
//         priority,
//       ],
//     )

//     res.status(201).json({
//       success: true,
//       message: "تم إنشاء الإعلان بنجاح",
//       message_en: "Ad created successfully",
//       ad: result.rows[0],
//     })
//   } catch (error) {
//     console.error("Error creating ad:", error)
//     res.status(500).json({
//       error: "فشل في إنشاء الإعلان",
//       message: "Failed to create ad",
//     })
//   }
// }

// // الحصول على جميع الإعلانات
// const getAllAds = async (req, res) => {
//   try {
//     const { active_only, position } = req.query

//     let query = `SELECT 
//       ads.*,
//       products.name as product_name,
//       products.name_ar as product_name_ar,
//       products.price as product_price,
//       products.image_url as product_image
//     FROM ads 
//     LEFT JOIN products ON ads.product_id = products.id`

//     const params = []
//     const conditions = []

//     if (active_only === "true") {
//       conditions.push("ads.is_active = true AND ads.start_date <= NOW() AND ads.end_date >= NOW()")
//     }

//     if (position) {
//       conditions.push("ads.position = $1")
//       params.push(position)
//     }

//     if (conditions.length > 0) {
//       query += " WHERE " + conditions.join(" AND ")
//     }

//     query += " ORDER BY ads.priority DESC, ads.created_at DESC"

//     const result = await pool.query(query, params)

//     res.json({
//       success: true,
//       ads: result.rows,
//     })
//   } catch (error) {
//     console.error("Error fetching ads:", error)
//     res.status(500).json({ error: "فشل في جلب الإعلانات" })
//   }
// }

// // الحصول على إعلان بواسطة ID
// const getAdById = async (req, res) => {
//   try {
//     const { id } = req.params

//     const result = await pool.query(
//       `SELECT 
//         ads.*,
//         products.name as product_name,
//         products.name_ar as product_name_ar,
//         products.price as product_price,
//         products.image_url as product_image,
//         products.description as product_description,
//         products.description_ar as product_description_ar
//       FROM ads 
//       LEFT JOIN products ON ads.product_id = products.id
//       WHERE ads.id = $1`,
//       [id],
//     )

//     if (result.rows.length === 0) {
//       return res.status(404).json({ error: "الإعلان غير موجود" })
//     }

//     res.json({
//       success: true,
//       ad: result.rows[0],
//     })
//   } catch (error) {
//     console.error("Error fetching ad:", error)
//     res.status(500).json({ error: "فشل في جلب الإعلان" })
//   }
// }

// // تحديث إعلان
// const updateAd = async (req, res) => {
//   try {
//     const { id } = req.params
//     const {
//       product_id,
//       title,
//       title_ar,
//       description,
//       description_ar,
//       image_url,
//       start_date,
//       end_date,
//       is_active,
//       position,
//       priority,
//     } = req.body

//     // التحقق من وجود الإعلان
//     const adCheck = await pool.query("SELECT id FROM ads WHERE id = $1", [id])
//     if (adCheck.rows.length === 0) {
//       return res.status(404).json({
//         error: "الإعلان غير موجود",
//         message: "Ad not found",
//       })
//     }

//     // التحقق من وجود المنتج إذا تم تحديث product_id
//     if (product_id) {
//       const productCheck = await pool.query("SELECT id FROM products WHERE id = $1", [product_id])
//       if (productCheck.rows.length === 0) {
//         return res.status(404).json({
//           error: "المنتج غير موجود",
//           message: "Product not found",
//         })
//       }
//     }

//     let finalImageUrl = undefined
//     const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5001}`

//     if (req.file) {
//       // File was uploaded - save full URL
//       finalImageUrl = `${baseUrl}/uploads/ads/${req.file.filename}`
//       console.log("[v0] Using uploaded file:", finalImageUrl)
//     } else if (image_url !== undefined) {
//       // External URL provided (or null to clear)
//       if (image_url && !isValidImageUrl(image_url)) {
//         return res.status(400).json({
//           error: "رابط الصورة غير صالح",
//           message: "Invalid image URL",
//         })
//       }
//       finalImageUrl = image_url
//       console.log("[v0] Using external URL:", finalImageUrl)
//     }

//     const query = `UPDATE ads SET 
//       product_id = COALESCE($1, product_id),
//       title = COALESCE($2, title),
//       title_ar = COALESCE($3, title_ar),
//       description = COALESCE($4, description),
//       description_ar = COALESCE($5, description_ar)
//       ${finalImageUrl !== undefined ? ", image_url = $6" : ""},
//       start_date = COALESCE($${finalImageUrl !== undefined ? "7" : "6"}, start_date),
//       end_date = COALESCE($${finalImageUrl !== undefined ? "8" : "7"}, end_date),
//       is_active = COALESCE($${finalImageUrl !== undefined ? "9" : "8"}, is_active),
//       position = COALESCE($${finalImageUrl !== undefined ? "10" : "9"}, position),
//       priority = COALESCE($${finalImageUrl !== undefined ? "11" : "10"}, priority),
//       updated_at = CURRENT_TIMESTAMP
//     WHERE id = $${finalImageUrl !== undefined ? "12" : "11"}
//     RETURNING *`

//     const params = [product_id, title, title_ar, description, description_ar]

//     if (finalImageUrl !== undefined) {
//       params.push(finalImageUrl)
//     }

//     params.push(start_date, end_date, is_active, position, priority, id)

//     const result = await pool.query(query, params)

//     res.json({
//       success: true,
//       message: "تم تحديث الإعلان بنجاح",
//       message_en: "Ad updated successfully",
//       ad: result.rows[0],
//     })
//   } catch (error) {
//     console.error("Error updating ad:", error)
//     res.status(500).json({
//       error: "فشل في تحديث الإعلان",
//       message: "Failed to update ad",
//     })
//   }
// }

// // حذف إعلان
// const deleteAd = async (req, res) => {
//   try {
//     const { id } = req.params

//     const result = await pool.query("DELETE FROM ads WHERE id = $1 RETURNING *", [id])

//     if (result.rows.length === 0) {
//       return res.status(404).json({ error: "الإعلان غير موجود" })
//     }

//     res.json({
//       success: true,
//       message: "تم حذف الإعلان بنجاح",
//     })
//   } catch (error) {
//     console.error("Error deleting ad:", error)
//     res.status(500).json({ error: "فشل في حذف الإعلان" })
//   }
// }

// // زيادة عداد المشاهدات
// const incrementViewCount = async (req, res) => {
//   try {
//     const { id } = req.params

//     await pool.query("UPDATE ads SET view_count = view_count + 1 WHERE id = $1", [id])

//     res.json({ success: true, message: "تم تحديث عداد المشاهدات" })
//   } catch (error) {
//     console.error("Error incrementing view count:", error)
//     res.status(500).json({ error: "فشل في تحديث العداد" })
//   }
// }

// // زيادة عداد النقرات
// const incrementClickCount = async (req, res) => {
//   try {
//     const { id } = req.params

//     await pool.query("UPDATE ads SET click_count = click_count + 1 WHERE id = $1", [id])

//     res.json({ success: true, message: "تم تحديث عداد النقرات" })
//   } catch (error) {
//     console.error("Error incrementing click count:", error)
//     res.status(500).json({ error: "فشل في تحديث العداد" })
//   }
// }

// // الحصول على إعلانات الصفحة الرئيسية
// const getHomepageAds = async (req, res) => {
//   try {
//     const result = await pool.query(
//       `SELECT 
//         ads.*,
//         products.name as product_name,
//         products.name_ar as product_name_ar,
//         products.price as product_price,
//         products.original_price as product_original_price,
//         products.image_url as product_image,
//         products.discount as product_discount
//       FROM ads 
//       LEFT JOIN products ON ads.product_id = products.id
//       WHERE ads.is_active = true 
//         AND ads.start_date <= NOW() 
//         AND ads.end_date >= NOW()
//         AND ads.position = 'home_banner'
//       ORDER BY ads.priority DESC, ads.created_at DESC
//       LIMIT 10`,
//     )

//     res.json({
//       success: true,
//       ads: result.rows,
//     })
//   } catch (error) {
//     console.error("Error fetching homepage ads:", error)
//     res.status(500).json({ error: "فشل في جلب إعلانات الصفحة الرئيسية" })
//   }
// }

// module.exports = {
//   createAd,
//   getAllAds,
//   getAdById,
//   updateAd,
//   deleteAd,
//   incrementViewCount,
//   incrementClickCount,
//   getHomepageAds,
// }







const { pool } = require("../config/database")
const { uploadToBlob, deleteFromBlob } = require("../config/blob")

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

    return hasValidExtension || pathname.includes("/images/") || pathname.includes("/ads/")
  } catch (err) {
    return false
  }
}

// إنشاء إعلان جديد
const createAd = async (req, res) => {
  try {
    console.log("[v0] Creating ad - req.body:", req.body)
    console.log("[v0] Creating ad - req.file:", req.file)

    const {
      product_id,
      title,
      title_ar,
      description,
      description_ar,
      image_url,
      start_date,
      end_date,
      position = "home_banner",
      priority = 0,
    } = req.body

    // التحقق من وجود المنتج
    const productCheck = await pool.query("SELECT id FROM products WHERE id = $1", [product_id])

    if (productCheck.rows.length === 0) {
      return res.status(404).json({
        error: "المنتج غير موجود",
        message: "Product not found",
      })
    }

    let finalImageUrl = null

    if (req.file) {
      try {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
        const ext = req.file.originalname.split(".").pop()
        const filename = `ad-${uniqueSuffix}.${ext}`

        finalImageUrl = await uploadToBlob(req.file.buffer, filename, "ads")
        console.log("[v0] Uploaded to Blob:", finalImageUrl)
      } catch (error) {
        console.error("[v0] Blob upload error:", error)
        return res.status(500).json({
          error: "فشل رفع الصورة",
          message: "Failed to upload image",
        })
      }
    } else if (image_url) {
      // External URL provided
      if (!isValidImageUrl(image_url)) {
        return res.status(400).json({
          error: "رابط الصورة غير صالح",
          message: "Invalid image URL",
        })
      }
      finalImageUrl = image_url
      console.log("[v0] Using external URL:", finalImageUrl)
    }

    const result = await pool.query(
      `INSERT INTO ads (
        product_id, title, title_ar, description, description_ar, 
        image_url, start_date, end_date, position, priority
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
      RETURNING *`,
      [
        product_id,
        title,
        title_ar,
        description,
        description_ar,
        finalImageUrl,
        start_date,
        end_date,
        position,
        priority,
      ],
    )

    res.status(201).json({
      success: true,
      message: "تم إنشاء الإعلان بنجاح",
      message_en: "Ad created successfully",
      ad: result.rows[0],
    })
  } catch (error) {
    console.error("Error creating ad:", error)
    res.status(500).json({
      error: "فشل في إنشاء الإعلان",
      message: "Failed to create ad",
    })
  }
}

// الحصول على جميع الإعلانات
const getAllAds = async (req, res) => {
  try {
    const { active_only, position } = req.query

    let query = `SELECT 
      ads.*,
      products.name as product_name,
      products.name_ar as product_name_ar,
      products.price as product_price,
      products.image_url as product_image
    FROM ads 
    LEFT JOIN products ON ads.product_id = products.id`

    const params = []
    const conditions = []

    if (active_only === "true") {
      conditions.push("ads.is_active = true AND ads.start_date <= NOW() AND ads.end_date >= NOW()")
    }

    if (position) {
      conditions.push("ads.position = $1")
      params.push(position)
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ")
    }

    query += " ORDER BY ads.priority DESC, ads.created_at DESC"

    const result = await pool.query(query, params)

    res.json({
      success: true,
      ads: result.rows,
    })
  } catch (error) {
    console.error("Error fetching ads:", error)
    res.status(500).json({ error: "فشل في جلب الإعلانات" })
  }
}

// الحصول على إعلان بواسطة ID
const getAdById = async (req, res) => {
  try {
    const { id } = req.params

    const result = await pool.query(
      `SELECT 
        ads.*,
        products.name as product_name,
        products.name_ar as product_name_ar,
        products.price as product_price,
        products.image_url as product_image,
        products.description as product_description,
        products.description_ar as product_description_ar
      FROM ads 
      LEFT JOIN products ON ads.product_id = products.id
      WHERE ads.id = $1`,
      [id],
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "الإعلان غير موجود" })
    }

    res.json({
      success: true,
      ad: result.rows[0],
    })
  } catch (error) {
    console.error("Error fetching ad:", error)
    res.status(500).json({ error: "فشل في جلب الإعلان" })
  }
}

// تحديث إعلان
const updateAd = async (req, res) => {
  try {
    const { id } = req.params
    const {
      product_id,
      title,
      title_ar,
      description,
      description_ar,
      image_url,
      start_date,
      end_date,
      is_active,
      position,
      priority,
    } = req.body

    // التحقق من وجود الإعلان
    const adCheck = await pool.query("SELECT image_url FROM ads WHERE id = $1", [id])
    if (adCheck.rows.length === 0) {
      return res.status(404).json({
        error: "الإعلان غير موجود",
        message: "Ad not found",
      })
    }

    const oldImageUrl = adCheck.rows[0]?.image_url

    // التحقق من وجود المنتج إذا تم تحديث product_id
    if (product_id) {
      const productCheck = await pool.query("SELECT id FROM products WHERE id = $1", [product_id])
      if (productCheck.rows.length === 0) {
        return res.status(404).json({
          error: "المنتج غير موجود",
          message: "Product not found",
        })
      }
    }

    let finalImageUrl = undefined

    if (req.file) {
      try {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
        const ext = req.file.originalname.split(".").pop()
        const filename = `ad-${uniqueSuffix}.${ext}`

        finalImageUrl = await uploadToBlob(req.file.buffer, filename, "ads")
        console.log("[v0] Uploaded to Blob:", finalImageUrl)

        // Delete old image if it was a blob URL
        if (oldImageUrl) {
          await deleteFromBlob(oldImageUrl)
        }
      } catch (error) {
        console.error("[v0] Blob upload error:", error)
        return res.status(500).json({
          error: "فشل رفع الصورة",
          message: "Failed to upload image",
        })
      }
    } else if (image_url !== undefined) {
      // External URL provided (or null to clear)
      if (image_url && !isValidImageUrl(image_url)) {
        return res.status(400).json({
          error: "رابط الصورة غير صالح",
          message: "Invalid image URL",
        })
      }
      finalImageUrl = image_url

      // If clearing the image, delete old blob image
      if (!image_url && oldImageUrl) {
        await deleteFromBlob(oldImageUrl)
      }
      console.log("[v0] Using external URL:", finalImageUrl)
    }

    const query = `UPDATE ads SET 
      product_id = COALESCE($1, product_id),
      title = COALESCE($2, title),
      title_ar = COALESCE($3, title_ar),
      description = COALESCE($4, description),
      description_ar = COALESCE($5, description_ar)
      ${finalImageUrl !== undefined ? ", image_url = $6" : ""},
      start_date = COALESCE($${finalImageUrl !== undefined ? "7" : "6"}, start_date),
      end_date = COALESCE($${finalImageUrl !== undefined ? "8" : "7"}, end_date),
      is_active = COALESCE($${finalImageUrl !== undefined ? "9" : "8"}, is_active),
      position = COALESCE($${finalImageUrl !== undefined ? "10" : "9"}, position),
      priority = COALESCE($${finalImageUrl !== undefined ? "11" : "10"}, priority),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $${finalImageUrl !== undefined ? "12" : "11"}
    RETURNING *`

    const params = [product_id, title, title_ar, description, description_ar]

    if (finalImageUrl !== undefined) {
      params.push(finalImageUrl)
    }

    params.push(start_date, end_date, is_active, position, priority, id)

    const result = await pool.query(query, params)

    res.json({
      success: true,
      message: "تم تحديث الإعلان بنجاح",
      message_en: "Ad updated successfully",
      ad: result.rows[0],
    })
  } catch (error) {
    console.error("Error updating ad:", error)
    res.status(500).json({
      error: "فشل في تحديث الإعلان",
      message: "Failed to update ad",
    })
  }
}

// حذف إعلان
const deleteAd = async (req, res) => {
  try {
    const { id } = req.params

    const result = await pool.query("DELETE FROM ads WHERE id = $1 RETURNING *", [id])

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "الإعلان غير موجود" })
    }

    res.json({
      success: true,
      message: "تم حذف الإعلان بنجاح",
    })
  } catch (error) {
    console.error("Error deleting ad:", error)
    res.status(500).json({ error: "فشل في حذف الإعلان" })
  }
}

// زيادة عداد المشاهدات
const incrementViewCount = async (req, res) => {
  try {
    const { id } = req.params

    await pool.query("UPDATE ads SET view_count = view_count + 1 WHERE id = $1", [id])

    res.json({ success: true, message: "تم تحديث عداد المشاهدات" })
  } catch (error) {
    console.error("Error incrementing view count:", error)
    res.status(500).json({ error: "فشل في تحديث العداد" })
  }
}

// زيادة عداد النقرات
const incrementClickCount = async (req, res) => {
  try {
    const { id } = req.params

    await pool.query("UPDATE ads SET click_count = click_count + 1 WHERE id = $1", [id])

    res.json({ success: true, message: "تم تحديث عداد النقرات" })
  } catch (error) {
    console.error("Error incrementing click count:", error)
    res.status(500).json({ error: "فشل في تحديث العداد" })
  }
}

// الحصول على إعلانات الصفحة الرئيسية
const getHomepageAds = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        ads.*,
        products.name as product_name,
        products.name_ar as product_name_ar,
        products.price as product_price,
        products.original_price as product_original_price,
        products.image_url as product_image,
        products.discount as product_discount
      FROM ads 
      LEFT JOIN products ON ads.product_id = products.id
      WHERE ads.is_active = true 
        AND ads.start_date <= NOW() 
        AND ads.end_date >= NOW()
        AND ads.position = 'home_banner'
      ORDER BY ads.priority DESC, ads.created_at DESC
      LIMIT 10`,
    )

    res.json({
      success: true,
      ads: result.rows,
    })
  } catch (error) {
    console.error("Error fetching homepage ads:", error)
    res.status(500).json({ error: "فشل في جلب إعلانات الصفحة الرئيسية" })
  }
}

module.exports = {
  createAd,
  getAllAds,
  getAdById,
  updateAd,
  deleteAd,
  incrementViewCount,
  incrementClickCount,
  getHomepageAds,
}
