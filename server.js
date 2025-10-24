const app = require("./app")
const { healthCheck } = require("./config/database") // ✅ استيراد الدالة الصحيحة

const PORT = process.env.PORT || 5000

// دالة لتهيئة التطبيق قبل البدء
async function initializeServer() {
  try {
    console.log("🔄 جاري تهيئة الخادم...")

    // انتظر تهيئة قاعدة البيانات
    await new Promise((resolve) => setTimeout(resolve, 3000))

    // التحقق من صحة الاتصال بقاعدة البيانات باستخدام الدالة الصحيحة
    const dbHealthy = await healthCheck()
    console.log(`📊 حالة قاعدة البيانات: ${dbHealthy ? "✅ صحية" : "❌ غير صحية"}`)

    if (!dbHealthy) {
      console.warn("⚠️  قاعدة البيانات غير جاهزة، لكن الخادم سيبدأ...")
    }

    // بدء الخادم
    const server = app.listen(PORT, () => {
      console.log("=".repeat(50))
      console.log(`🚀 الخادم يعمل على PORT: ${PORT}`)
      console.log(`🌐 البيئة: ${process.env.NODE_ENV || "development"}`)
      console.log(`📊 قاعدة البيانات: ${process.env.SUPABASE_URL ? "Supabase" : "غير معروف"}`)
      console.log(`📈 حالة قاعدة البيانات: ${dbHealthy ? "✅ صحية" : "❌ مشكلة"}`)
      console.log(`⏰ وقت البدء: ${new Date().toLocaleString()}`)
      console.log("=".repeat(50))
    })

    // معالجة إغلاق الخادم بشكل أنيق
    process.on("SIGTERM", () => {
      console.log("🛑 استقبال إشارة SIGTERM، إغلاق الخادم...")
      server.close(() => {
        console.log("✅ تم إغلاق الخادم بنجاح")
        process.exit(0)
      })
    })

    process.on("SIGINT", () => {
      console.log("🛑 استقبال إشارة SIGINT، إغلاق الخادم...")
      server.close(() => {
        console.log("✅ تم إغل��ق الخادم بنجاح")
        process.exit(0)
      })
    })

    // معالجة الأخطاء غير المتوقعة
    process.on("uncaughtException", (error) => {
      console.error("❌ خطأ غير متوقع:", error)
      process.exit(1)
    })

    process.on("unhandledRejection", (reason, promise) => {
      console.error("❌ Promise مرفوض غير معالج:", reason)
      process.exit(1)
    })

    return server
  } catch (error) {
    console.error("❌ فشل في تهيئة الخادم:", error)
    process.exit(1)
  }
}

// بدء التطبيق
initializeServer()
  .then((server) => {
    console.log("✅ تم بدء الخادم بنجاح")
  })
  .catch((error) => {
    console.error("❌ فشل في بدء الخادم:", error)
    process.exit(1)
  })
