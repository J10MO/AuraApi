const { pool } = require("../config/database")
const { generateToken, generateVerificationCode } = require("../utils/helpers")
const { getIO } = require("../utils/socket")
const { sendWhatsAppOTP } = require("../utils/whatsapp")

const authController = {
  // إرسال رمز التحقق إلى رقم الهاتف
  async sendOTP(req, res) {
    const { phone, role = "customer" } = req.body

    if (!phone) {
      return res.status(400).json({ error: "رقم الهاتف مطلوب" })
    }

    // التحقق من صحة رقم الهاتف
    const phoneRegex = /^\+?[\d\s\-$$$$]{10,}$/
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ error: "صيغة رقم الهاتف غير صالحة" })
    }

    // التحقق من صحة الدور
    const validRoles = ["customer", "admin", "manager"]
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: "الدور غير صالح" })
    }

    try {
      // التحقق من وجود المستخدم
      const userResult = await pool.query("SELECT id, name, is_verified, role FROM users WHERE phone = $1", [phone])

      const userExists = userResult.rows.length > 0
      const currentUser = userExists ? userResult.rows[0] : null

      // ✅ الإصلاح: استخدام دور المستخدم الحالي إذا كان موجوداً
      const finalRole = userExists ? currentUser.role : role

      const verificationCode = generateVerificationCode()
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

      if (userExists) {
        // تحديث المستخدم الحالي برمز تحقق جديد - استخدام الدور الحالي
        await pool.query("UPDATE users SET verification_code = $1, code_expires_at = $2 WHERE phone = $3", [
          verificationCode,
          expiresAt,
          phone,
        ])
      } else {
        // إنشاء مستخدم جديد مع الدور المحدد
        await pool.query(
          `INSERT INTO users (phone, verification_code, code_expires_at, is_verified, role) 
           VALUES ($1, $2, $3, false, $4)`,
          [phone, verificationCode, expiresAt, finalRole],
        )
      }

      const whatsappResult = await sendWhatsAppOTP(phone, verificationCode)

      if (!whatsappResult.success) {
        console.error("⚠️ WhatsApp sending failed, falling back to console log")
        console.log(`📱 رمز التحقق لـ ${phone}: ${verificationCode}`)
      }

      console.log(`👤 الدور: ${finalRole}`)
      console.log(`⏰ ينتهي في: ${expiresAt.toLocaleTimeString()}`)

      res.json({
        success: true,
        exists: userExists,
        role: finalRole,
        message: whatsappResult.success
          ? "تم إرسال رمز التحقق عبر واتساب بنجاح"
          : "تم إنشاء رمز التحقق (فشل إرسال واتساب)",
        ...(process.env.NODE_ENV === "development" && {
          otp: verificationCode,
          expiresAt: expiresAt,
          debugInfo: "هذا للاختبار فقط - إزالة في الإنتاج",
        }),
      })
    } catch (err) {
      console.error("خطأ في إرسال رمز التحقق:", err)

      if (err.code === "23505") {
        res.status(400).json({ error: "رقم الهاتف موجود بالفعل" })
      } else {
        res.status(500).json({ error: "فشل في إرسال رمز التحقق" })
      }
    }
  },

  // التحقق من رمز التحقق وتسجيل الدخول/التسجيل
  async verifyOTP(req, res) {
    const { phone, code, userData } = req.body

    console.log("🔍 البيانات المستلمة:", userData)

    if (!phone || !code) {
      return res.status(400).json({ error: "رقم الهاتف ورمز التحقق مطلوبان" })
    }

    try {
      // التحقق من صحة رمز التحقق وعدم انتهاء صلاحيته
      const result = await pool.query(
        `SELECT * FROM users 
         WHERE phone = $1 AND verification_code = $2 
         AND code_expires_at > NOW()`,
        [phone, code],
      )

      if (result.rows.length === 0) {
        return res.status(400).json({ error: "رمز التحقق غير صالح أو منتهي الصلاحية" })
      }

      const user = result.rows[0]
      let finalUser = user

      // إذا لم يكن المستخدم موثقاً بعد ولدينا userData، أكمل التسجيل
      if (!user.is_verified && userData) {
        console.log("📝 إكمال التسجيل بالبيانات:", userData)

        const updateResult = await pool.query(
          `UPDATE users SET 
            name = $1, 
            email = $2, 
            address_street = $3, 
            address_city = $4, 
            address_district = $5, 
            address_postal_code = $6,
            is_verified = true,
            verification_code = NULL,
            code_expires_at = NULL,
            updated_at = CURRENT_TIMESTAMP
           WHERE id = $7 RETURNING *`,
          [
            userData.name,
            userData.email,
            userData.address?.street || null,
            userData.address?.city || null,
            userData.address?.district || null,
            userData.address?.postalCode || null,
            user.id,
          ],
        )
        finalUser = updateResult.rows[0]
      } else if (!user.is_verified) {
        // وضع علامة كمستخدم موثق ولكن لا تحديث الملف الشخصي
        const updateResult = await pool.query(
          `UPDATE users SET 
            is_verified = true,
            verification_code = NULL,
            code_expires_at = NULL,
            updated_at = CURRENT_TIMESTAMP
           WHERE id = $1 RETURNING *`,
          [user.id],
        )
        finalUser = updateResult.rows[0]
      } else {
        // مسح بيانات OTP للمستخدم الموثق الموجود
        await pool.query("UPDATE users SET verification_code = NULL, code_expires_at = NULL WHERE id = $1", [user.id])
      }

      // إنشاء رمز JWT
      const token = generateToken(finalUser)

      console.log(`✅ تم التحقق بنجاح للمستخدم: ${finalUser.name || phone}`)
      console.log(`👤 الدور: ${finalUser.role}`)
      console.log(`🆔 معرّف المستخدم: ${finalUser.id}`)

      // إرسال حدث socket إذا كان متاحاً
      try {
        const io = getIO()
        if (io) {
          io.emit("user_logged_in", {
            userId: finalUser.id,
            name: finalUser.name || "مستخدم",
            phone: finalUser.phone,
            role: finalUser.role,
          })
        }
      } catch (socketError) {
        console.log("⚠️ Socket.io غير متاح - المتابعة بدون إرسال الأحداث")
      }

      res.json({
        success: true,
        token,
        user: {
          id: finalUser.id,
          name: finalUser.name,
          phone: finalUser.phone,
          email: finalUser.email,
          role: finalUser.role,
          membershipLevel: finalUser.membership_level,
          points: finalUser.points,
          totalOrders: finalUser.total_orders,
          isVerified: finalUser.is_verified,
          address: {
            street: finalUser.address_street,
            city: finalUser.address_city,
            district: finalUser.address_district,
            postalCode: finalUser.address_postal_code,
          },
        },
      })
    } catch (err) {
      console.error("خطأ في التحقق من رمز التحقق:", err)
      res.status(500).json({ error: "فشل في التحقق من رمز التحقق" })
    }
  },

  // إعادة إرسال رمز التحقق
  async resendOTP(req, res) {
    const { phone } = req.body

    if (!phone) {
      return res.status(400).json({ error: "رقم الهاتف مطلوب" })
    }

    try {
      // التحقق من وجود المستخدم
      const userResult = await pool.query("SELECT id, role FROM users WHERE phone = $1", [phone])

      if (userResult.rows.length === 0) {
        return res.status(404).json({ error: "رقم الهاتف غير موجود" })
      }

      const verificationCode = generateVerificationCode()
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

      await pool.query("UPDATE users SET verification_code = $1, code_expires_at = $2 WHERE phone = $3", [
        verificationCode,
        expiresAt,
        phone,
      ])

      console.log(`📱 تم إعادة إرسال رمز التحقق لـ ${phone}: ${verificationCode}`)
      console.log(`👤 الدور: ${userResult.rows[0].role}`)

      res.json({
        success: true,
        message: "تم إعادة إرسال رمز التحقق بنجاح",
        otp: verificationCode,
        expiresAt: expiresAt,
        debugInfo: "هذا للاختبار فقط - إزالة في الإنتاج",
      })
    } catch (err) {
      console.error("خطأ في إعادة إرسال رمز التحقق:", err)
      res.status(500).json({ error: "فشل في إعادة إرسال رمز التحقق" })
    }
  },

  // الحصول على الملف الشخصي للمستخدم
  async getProfile(req, res) {
    try {
      const result = await pool.query("SELECT * FROM users WHERE id = $1", [req.user.id])

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "المستخدم غير موجود" })
      }

      const user = result.rows[0]

      console.log(`👤 تم طلب الملف الشخصي للمستخدم: ${user.name || user.phone}`)

      res.json({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          phone: user.phone,
          email: user.email,
          role: user.role,
          membershipLevel: user.membership_level,
          points: user.points,
          totalOrders: user.total_orders,
          isVerified: user.is_verified,
          address: {
            street: user.address_street,
            city: user.address_city,
            district: user.address_district,
            postalCode: user.address_postal_code,
          },
          createdAt: user.created_at,
        },
      })
    } catch (err) {
      console.error("خطأ في الحصول على الملف الشخصي:", err)
      res.status(500).json({ error: "فشل في الحصول على الملف الشخصي" })
    }
  },

  // تحديث الملف الشخصي للمستخدم
  async updateProfile(req, res) {
    const { name, email, address } = req.body

    try {
      const result = await pool.query(
        `UPDATE users SET 
          name = $1, 
          email = $2, 
          address_street = $3, 
          address_city = $4, 
          address_district = $5, 
          address_postal_code = $6,
          updated_at = CURRENT_TIMESTAMP
         WHERE id = $7 RETURNING *`,
        [name, email, address?.street, address?.city, address?.district, address?.postalCode, req.user.id],
      )

      const updatedUser = result.rows[0]

      console.log(`✏️ تم تحديث الملف الشخصي للمستخدم: ${updatedUser.name}`)

      res.json({
        success: true,
        message: "تم تحديث الملف الشخصي بنجاح",
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          address: {
            street: updatedUser.address_street,
            city: updatedUser.address_city,
            district: updatedUser.address_district,
            postalCode: updatedUser.address_postal_code,
          },
        },
      })
    } catch (err) {
      console.error("خطأ في تحديث الملف الشخصي:", err)
      res.status(500).json({ error: "فشل في تحديث الملف الشخصي" })
    }
  },

  // دالة لترقية مستخدم إلى admin (للاستخدام الداخلي)
  async promoteToAdmin(req, res) {
    const { phone } = req.body

    if (!phone) {
      return res.status(400).json({ error: "رقم الهاتف مطلوب" })
    }

    try {
      const result = await pool.query("UPDATE users SET role = $1 WHERE phone = $2 RETURNING *", ["admin", phone])

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "المستخدم غير موجود" })
      }

      const updatedUser = result.rows[0]

      console.log(`⬆️ تم ترقية المستخدم إلى admin: ${updatedUser.phone}`)

      res.json({
        success: true,
        message: "تم ترقية المستخدم إلى admin بنجاح",
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          phone: updatedUser.phone,
          role: updatedUser.role,
        },
      })
    } catch (err) {
      console.error("خطأ في ترقية المستخدم:", err)
      res.status(500).json({ error: "فشل في ترقية المستخدم" })
    }
  },

  // ✅ دالة جديدة: تغيير دور المستخدم (للمشرفين فقط)
  async changeUserRole(req, res) {
    const { phone, newRole } = req.body

    if (!phone || !newRole) {
      return res.status(400).json({ error: "رقم الهاتف والدور الجديد مطلوبان" })
    }

    // التحقق من صحة الدور الجديد
    const validRoles = ["customer", "admin", "manager"]
    if (!validRoles.includes(newRole)) {
      return res.status(400).json({ error: "الدور غير صالح" })
    }

    try {
      const result = await pool.query("UPDATE users SET role = $1 WHERE phone = $2 RETURNING *", [newRole, phone])

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "المستخدم غير موجود" })
      }

      const updatedUser = result.rows[0]

      console.log(`🔄 تم تغيير دور المستخدم ${phone} إلى: ${newRole}`)

      res.json({
        success: true,
        message: `تم تغيير دور المستخدم إلى ${newRole} بنجاح`,
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          phone: updatedUser.phone,
          role: updatedUser.role,
        },
      })
    } catch (err) {
      console.error("خطأ في تغيير دور المستخدم:", err)
      res.status(500).json({ error: "فشل في تغيير دور المستخدم" })
    }
  },
}

module.exports = authController
