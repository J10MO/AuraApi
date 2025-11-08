const { pool } = require("../config/database")

const settingsController = {
  // Get all settings (Admin only)
  async getAllSettings(req, res) {
    try {
      const result = await pool.query("SELECT * FROM settings ORDER BY key")

      res.json({
        success: true,
        settings: result.rows,
      })
    } catch (err) {
      console.error("Error fetching settings:", err)
      res.status(500).json({
        error: "Server error",
        message: "حدث خطأ في الخادم",
      })
    }
  },

  // Get delivery price (Public)
  async getDeliveryPrice(req, res) {
    try {
      const result = await pool.query("SELECT value FROM settings WHERE key = 'delivery_price'")

      if (result.rows.length === 0) {
        return res.json({
          success: true,
          delivery_price: 5.0, // Default value
        })
      }

      res.json({
        success: true,
        delivery_price: Number.parseFloat(result.rows[0].value),
      })
    } catch (err) {
      console.error("Error fetching delivery price:", err)
      res.status(500).json({
        error: "Server error",
        message: "حدث خطأ في الخادم",
      })
    }
  },

  // Update delivery price (Admin only)
  async updateDeliveryPrice(req, res) {
    const { delivery_price } = req.body

    if (!delivery_price || isNaN(delivery_price) || delivery_price < 0) {
      return res.status(400).json({
        error: "Invalid delivery price",
        message: "يجب إدخال سعر توصيل صحيح",
      })
    }

    try {
      const result = await pool.query(
        `INSERT INTO settings (key, value, description, updated_at)
         VALUES ('delivery_price', $1, 'Default delivery price for orders', CURRENT_TIMESTAMP)
         ON CONFLICT (key) 
         DO UPDATE SET value = $1, updated_at = CURRENT_TIMESTAMP
         RETURNING *`,
        [delivery_price.toString()],
      )

      res.json({
        success: true,
        message: "Delivery price updated successfully",
        messageAr: "تم تحديث سعر التوصيل بنجاح",
        setting: result.rows[0],
      })
    } catch (err) {
      console.error("Error updating delivery price:", err)
      res.status(500).json({
        error: "Server error",
        message: "حدث خطأ في الخادم",
      })
    }
  },

  // Update any setting (Admin only)
  async updateSetting(req, res) {
    const { key, value, description } = req.body

    if (!key || !value) {
      return res.status(400).json({
        error: "Missing required fields",
        message: "يجب إدخال المفتاح والقيمة",
      })
    }

    try {
      const result = await pool.query(
        `INSERT INTO settings (key, value, description, updated_at)
         VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
         ON CONFLICT (key) 
         DO UPDATE SET value = $2, description = $3, updated_at = CURRENT_TIMESTAMP
         RETURNING *`,
        [key, value, description || null],
      )

      res.json({
        success: true,
        message: "Setting updated successfully",
        messageAr: "تم تحديث الإعداد بنجاح",
        setting: result.rows[0],
      })
    } catch (err) {
      console.error("Error updating setting:", err)
      res.status(500).json({
        error: "Server error",
        message: "حدث خطأ في الخادم",
      })
    }
  },
}

module.exports = settingsController
