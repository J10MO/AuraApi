const { pool } = require("../config/database")

const deliveryController = {
  // Create delivery for an order
  async createDelivery(req, res) {
    const {
      order_id,
      delivery_name,
      delivery_phone,
      delivery_address,
      delivery_city,
      delivery_district,
      delivery_postal_code,
      delivery_notes,
      delivery_fee,
      estimated_delivery_date,
      latitude,
      longitude,
    } = req.body

    try {
      // Validate required fields
      if (!order_id || !delivery_name || !delivery_phone || !delivery_address) {
        return res.status(400).json({
          error: "Missing required fields",
          message: "يجب إدخال رقم الطلب، الاسم، الهاتف، والعنوان",
        })
      }

      // Check if order exists
      const orderResult = await pool.query("SELECT * FROM orders WHERE id = $1", [order_id])

      if (orderResult.rows.length === 0) {
        return res.status(404).json({
          error: "Order not found",
          message: "الطلب غير موجود",
        })
      }

      const order = orderResult.rows[0]

      // Check if delivery already exists for this order
      const existingDelivery = await pool.query("SELECT * FROM deliveries WHERE order_id = $1", [order_id])

      if (existingDelivery.rows.length > 0) {
        return res.status(400).json({
          error: "Delivery already exists",
          message: "يوجد معلومات توصيل لهذا الطلب بالفعل",
        })
      }

      // Generate tracking number
      const tracking_number = "TRK-" + Date.now() + "-" + Math.floor(Math.random() * 1000)

      // Create delivery
      const result = await pool.query(
        `INSERT INTO deliveries (
          order_id, user_id, delivery_name, delivery_phone, delivery_address,
          delivery_city, delivery_district, delivery_postal_code, delivery_notes,
          delivery_fee, estimated_delivery_date, tracking_number, latitude, longitude
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        RETURNING *`,
        [
          order_id,
          order.user_id,
          delivery_name,
          delivery_phone,
          delivery_address,
          delivery_city,
          delivery_district,
          delivery_postal_code,
          delivery_notes,
          delivery_fee || 0,
          estimated_delivery_date,
          tracking_number,
          latitude,
          longitude,
        ],
      )

      // Create notification for user
      await pool.query(
        `INSERT INTO notifications (user_id, title, message, type)
         VALUES ($1, $2, $3, $4)`,
        [
          order.user_id,
          "تم إنشاء معلومات التوصيل",
          `تم إنشاء معلومات التوصيل للطلب رقم ${order.order_number}. رقم التتبع: ${tracking_number}`,
          "delivery_created",
        ],
      )

      res.status(201).json({
        success: true,
        message: "Delivery created successfully",
        messageAr: "تم إنشاء معلومات التوصيل بنجاح",
        delivery: result.rows[0],
      })
    } catch (err) {
      console.error("Error creating delivery:", err)
      res.status(500).json({
        error: "Server error",
        message: "حدث خطأ في الخادم",
        detail: err.message,
      })
    }
  },

  // Get delivery by order ID
  async getDeliveryByOrderId(req, res) {
    const { orderId } = req.params

    try {
      const result = await pool.query(
        `SELECT d.*, o.order_number, o.status as order_status, u.name as user_name, u.phone as user_phone
         FROM deliveries d
         JOIN orders o ON d.order_id = o.id
         LEFT JOIN users u ON d.user_id = u.id
         WHERE d.order_id = $1`,
        [orderId],
      )

      if (result.rows.length === 0) {
        return res.status(404).json({
          error: "Delivery not found",
          message: "معلومات التوصيل غير موجودة",
        })
      }

      res.json({
        success: true,
        delivery: result.rows[0],
      })
    } catch (err) {
      console.error("Error fetching delivery:", err)
      res.status(500).json({
        error: "Server error",
        message: "حدث خطأ في الخادم",
      })
    }
  },

  // Get delivery by tracking number
  async getDeliveryByTracking(req, res) {
    const { trackingNumber } = req.params

    try {
      const result = await pool.query(
        `SELECT d.*, o.order_number, o.status as order_status, o.total_amount,
         u.name as user_name, u.phone as user_phone
         FROM deliveries d
         JOIN orders o ON d.order_id = o.id
         LEFT JOIN users u ON d.user_id = u.id
         WHERE d.tracking_number = $1`,
        [trackingNumber],
      )

      if (result.rows.length === 0) {
        return res.status(404).json({
          error: "Delivery not found",
          message: "رقم التتبع غير صحيح",
        })
      }

      res.json({
        success: true,
        delivery: result.rows[0],
      })
    } catch (err) {
      console.error("Error fetching delivery:", err)
      res.status(500).json({
        error: "Server error",
        message: "حدث خطأ في الخادم",
      })
    }
  },

  // Get all deliveries (admin) or user's deliveries
  async getDeliveries(req, res) {
    const { status, page = 1, limit = 10 } = req.query
    const offset = (page - 1) * limit

    try {
      let query = `
        SELECT d.*, o.order_number, o.status as order_status, o.total_amount,
        u.name as user_name, u.phone as user_phone
        FROM deliveries d
        JOIN orders o ON d.order_id = o.id
        LEFT JOIN users u ON d.user_id = u.id
      `
      let countQuery = "SELECT COUNT(*) FROM deliveries d"
      const params = []
      const countParams = []

      // If not admin, only show user's deliveries
      if (req.user.role !== "admin") {
        query += " WHERE d.user_id = $1"
        countQuery += " WHERE d.user_id = $1"
        params.push(req.user.id)
        countParams.push(req.user.id)
      }

      // Add status filter if provided
      if (status) {
        const statusCondition = `delivery_status = $${params.length + 1}`
        if (params.length === 0) {
          query += " WHERE " + statusCondition
          countQuery += " WHERE " + statusCondition
        } else {
          query += " AND " + statusCondition
          countQuery += " AND " + statusCondition
        }
        params.push(status)
        countParams.push(status)
      }

      // Add ordering and pagination
      query += ` ORDER BY d.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`
      params.push(Number.parseInt(limit), offset)

      const result = await pool.query(query, params)
      const countResult = await pool.query(countQuery, countParams)
      const totalCount = Number.parseInt(countResult.rows[0].count)
      const totalPages = Math.ceil(totalCount / limit)

      res.json({
        success: true,
        deliveries: result.rows,
        pagination: {
          currentPage: Number.parseInt(page),
          totalPages: totalPages,
          totalDeliveries: totalCount,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      })
    } catch (err) {
      console.error("Error fetching deliveries:", err)
      res.status(500).json({
        error: "Server error",
        message: "حدث خطأ في الخادم",
      })
    }
  },

  // Update delivery status and details (Admin only)
  async updateDelivery(req, res) {
    const { deliveryId } = req.params
    const {
      delivery_status,
      estimated_delivery_date,
      actual_delivery_date,
      driver_name,
      driver_phone,
      delivery_fee,
      delivery_notes,
      latitude,
      longitude,
    } = req.body

    try {
      // Check if delivery exists
      const deliveryResult = await pool.query(
        `SELECT d.*, o.order_number, o.user_id 
         FROM deliveries d 
         JOIN orders o ON d.order_id = o.id 
         WHERE d.id = $1`,
        [deliveryId],
      )

      if (deliveryResult.rows.length === 0) {
        return res.status(404).json({
          error: "Delivery not found",
          message: "معلومات التوصيل غير موجودة",
        })
      }

      const delivery = deliveryResult.rows[0]
      const oldStatus = delivery.delivery_status

      // Build dynamic update query
      const updateFields = []
      const updateValues = []
      let paramCount = 1

      if (delivery_status !== undefined) {
        const validStatuses = [
          "pending",
          "confirmed",
          "picked_up",
          "in_transit",
          "out_for_delivery",
          "delivered",
          "failed",
          "cancelled",
        ]
        if (!validStatuses.includes(delivery_status)) {
          return res.status(400).json({
            error: "Invalid delivery status",
            message: "حالة التوصيل غير صحيحة",
            validStatuses,
          })
        }
        updateFields.push(`delivery_status = $${paramCount}`)
        updateValues.push(delivery_status)
        paramCount++
      }

      if (estimated_delivery_date !== undefined) {
        updateFields.push(`estimated_delivery_date = $${paramCount}`)
        updateValues.push(estimated_delivery_date)
        paramCount++
      }

      if (actual_delivery_date !== undefined) {
        updateFields.push(`actual_delivery_date = $${paramCount}`)
        updateValues.push(actual_delivery_date)
        paramCount++
      }

      if (driver_name !== undefined) {
        updateFields.push(`driver_name = $${paramCount}`)
        updateValues.push(driver_name)
        paramCount++
      }

      if (driver_phone !== undefined) {
        updateFields.push(`driver_phone = $${paramCount}`)
        updateValues.push(driver_phone)
        paramCount++
      }

      if (delivery_fee !== undefined) {
        updateFields.push(`delivery_fee = $${paramCount}`)
        updateValues.push(Number.parseFloat(delivery_fee))
        paramCount++
      }

      if (delivery_notes !== undefined) {
        updateFields.push(`delivery_notes = $${paramCount}`)
        updateValues.push(delivery_notes)
        paramCount++
      }

      if (latitude !== undefined) {
        updateFields.push(`latitude = $${paramCount}`)
        updateValues.push(latitude)
        paramCount++
      }

      if (longitude !== undefined) {
        updateFields.push(`longitude = $${paramCount}`)
        updateValues.push(longitude)
        paramCount++
      }

      if (updateFields.length === 0) {
        return res.status(400).json({
          error: "No fields to update",
          message: "لا توجد بيانات للتحديث",
        })
      }

      updateFields.push("updated_at = CURRENT_TIMESTAMP")
      updateValues.push(deliveryId)

      const updateQuery = `
        UPDATE deliveries 
        SET ${updateFields.join(", ")}
        WHERE id = $${paramCount}
        RETURNING *
      `

      const updateResult = await pool.query(updateQuery, updateValues)
      const updatedDelivery = updateResult.rows[0]

      // Create notification if status changed
      if (delivery_status && oldStatus !== delivery_status) {
        let notificationTitle, notificationMessage

        switch (delivery_status) {
          case "confirmed":
            notificationTitle = "تم تأكيد التوصيل"
            notificationMessage = `تم تأكيد طلب التوصيل للطلب رقم ${delivery.order_number}`
            break
          case "picked_up":
            notificationTitle = "تم استلام الطلب"
            notificationMessage = `تم استلام طلبك رقم ${delivery.order_number} من المستودع`
            break
          case "in_transit":
            notificationTitle = "الطلب في الطريق"
            notificationMessage = `طلبك رقم ${delivery.order_number} في الطريق إليك`
            break
          case "out_for_delivery":
            notificationTitle = "الطلب خارج للتوصيل"
            notificationMessage = `طلبك رقم ${delivery.order_number} مع المندوب وسيصل قريباً`
            break
          case "delivered":
            notificationTitle = "تم التوصيل"
            notificationMessage = `تم توصيل طلبك رقم ${delivery.order_number} بنجاح`
            // Update order status to delivered
            await pool.query("UPDATE orders SET status = 'delivered' WHERE id = $1", [delivery.order_id])
            break
          case "failed":
            notificationTitle = "فشل التوصيل"
            notificationMessage = `فشل توصيل طلبك رقم ${delivery.order_number}. سنتواصل معك قريباً`
            break
          case "cancelled":
            notificationTitle = "تم إلغاء التوصيل"
            notificationMessage = `تم إلغاء توصيل طلبك رقم ${delivery.order_number}`
            break
          default:
            notificationTitle = "تحديث على التوصيل"
            notificationMessage = `تم تحديث حالة توصيل طلبك رقم ${delivery.order_number}`
        }

        await pool.query(
          `INSERT INTO notifications (user_id, title, message, type)
           VALUES ($1, $2, $3, $4)`,
          [delivery.user_id, notificationTitle, notificationMessage, "delivery_updated"],
        )
      }

      res.json({
        success: true,
        message: "Delivery updated successfully",
        messageAr: "تم تحديث معلومات التوصيل بنجاح",
        delivery: updatedDelivery,
      })
    } catch (err) {
      console.error("Error updating delivery:", err)
      res.status(500).json({
        error: "Server error",
        message: "حدث خطأ في الخادم",
        detail: err.message,
      })
    }
  },

  // Delete delivery (Admin only)
  async deleteDelivery(req, res) {
    const { deliveryId } = req.params

    try {
      const result = await pool.query("DELETE FROM deliveries WHERE id = $1 RETURNING *", [deliveryId])

      if (result.rows.length === 0) {
        return res.status(404).json({
          error: "Delivery not found",
          message: "معلومات التوصيل غير موجودة",
        })
      }

      res.json({
        success: true,
        message: "Delivery deleted successfully",
        messageAr: "تم حذف معلومات التوصيل بنجاح",
        deletedDelivery: result.rows[0],
      })
    } catch (err) {
      console.error("Error deleting delivery:", err)
      res.status(500).json({
        error: "Server error",
        message: "حدث خطأ في الخادم",
      })
    }
  },
}

module.exports = deliveryController
