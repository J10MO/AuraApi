const { cleanExpiredOTPs } = require("../../config/database")

module.exports = async (req, res) => {
  // Verify the request is from Vercel Cron
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: "Unauthorized" })
  }

  try {
    await cleanExpiredOTPs()
    res.status(200).json({ success: true, message: "OTPs cleaned successfully" })
  } catch (error) {
    console.error("Error cleaning OTPs:", error)
    res.status(500).json({ error: "Failed to clean OTPs" })
  }
}
