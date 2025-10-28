const { updateAdsStatus } = require("../../config/database")

module.exports = async (req, res) => {
  // Verify the request is from Vercel Cron
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: "Unauthorized" })
  }

  try {
    await updateAdsStatus()
    res.status(200).json({ success: true, message: "Ads status updated successfully" })
  } catch (error) {
    console.error("Error updating ads status:", error)
    res.status(500).json({ error: "Failed to update ads status" })
  }
}
