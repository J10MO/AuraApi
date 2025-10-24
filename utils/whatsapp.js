const axios = require("axios")

/**
 * Format phone number to international format without + prefix
 * @param {string} phone - Phone number (can be local or international format)
 * @param {string} defaultCountryCode - Default country code if not provided (e.g., '964' for Iraq)
 * @returns {string} Formatted phone number without + prefix (e.g., 9647717288459)
 */
function formatPhoneNumber(phone, defaultCountryCode = "964") {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, "")

  // If starts with 00, remove it
  if (cleaned.startsWith("00")) {
    return cleaned.substring(2)
  }

  // If starts with 0 (local format), remove it and add country code
  if (cleaned.startsWith("0")) {
    return `${defaultCountryCode}${cleaned.substring(1)}`
  }

  // If no country code, add it
  if (!cleaned.startsWith(defaultCountryCode)) {
    return `${defaultCountryCode}${cleaned}`
  }

  // Already has country code
  return cleaned
}

/**
 * Send OTP via WhatsApp using OTPIQ API
 * @param {string} phone - Phone number (will be auto-formatted to international format)
 * @param {string} code - OTP code to send
 * @returns {Promise<Object>} Response from OTPIQ API
 */
async function sendWhatsAppOTP(phone, code) {
  try {
    const apiKey = process.env.OTPIQ_API_KEY
    const countryCode = process.env.DEFAULT_COUNTRY_CODE || "964"

    if (!apiKey) {
      console.error("❌ OTPIQ_API_KEY not configured in .env file")
      throw new Error("OTPIQ API key not configured")
    }

    const finalPhone = formatPhoneNumber(phone, countryCode)

    console.log(`[v0] 📱 Sending WhatsApp OTP to: ${finalPhone}`)
    console.log(`[v0] 🔑 OTP Code: ${code}`)
    console.log(`[v0] 🔐 API Key: ${apiKey.substring(0, 10)}...`)

    const response = await axios.post(
      "https://api.otpiq.com/api/sms",
      {
        phoneNumber: finalPhone,
        smsType: "verification",
        provider: "whatsapp-sms",
        verificationCode: code,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      },
    )

    console.log(`[v0] ✅ WhatsApp OTP sent successfully`)
    console.log(`[v0] 📊 Response:`, JSON.stringify(response.data, null, 2))

    return {
      success: true,
      data: response.data,
    }
  } catch (error) {
    console.error(`[v0] ❌ Failed to send WhatsApp OTP`)
    console.error(`[v0] 📛 Error message:`, error.message)

    if (error.response) {
      console.error(`[v0] 📛 Response status:`, error.response.status)
      console.error(`[v0] 📛 Response data:`, JSON.stringify(error.response.data, null, 2))
    }

    return {
      success: false,
      error: error.response?.data?.message || error.message,
      errorCode: error.response?.status,
      details: error.response?.data,
    }
  }
}

/**
 * Send custom WhatsApp message using OTPIQ
 * @param {string} phone - Phone number (will be auto-formatted to international format)
 * @param {string} message - Message to send
 * @returns {Promise<Object>} Response from OTPIQ API
 */
async function sendWhatsAppMessage(phone, message) {
  try {
    const apiKey = process.env.OTPIQ_API_KEY
    const countryCode = process.env.DEFAULT_COUNTRY_CODE || "964"

    if (!apiKey) {
      throw new Error("OTPIQ API key not configured")
    }

    const finalPhone = formatPhoneNumber(phone, countryCode)

    console.log(`[v0] 📱 Sending WhatsApp message to: ${finalPhone}`)

    const response = await axios.post(
      "https://api.otpiq.com/api/sms",
      {
        phoneNumber: finalPhone,
        smsType: "notification",
        provider: "whatsapp-sms",
        message: message,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      },
    )

    console.log(`[v0] ✅ WhatsApp message sent successfully`)
    return {
      success: true,
      data: response.data,
    }
  } catch (error) {
    console.error(`[v0] ❌ Failed to send WhatsApp message:`, error.message)
    console.error(`[v0] 📛 Error details:`, error.response?.data)

    return {
      success: false,
      error: error.response?.data?.message || error.message,
    }
  }
}

module.exports = {
  sendWhatsAppOTP,
  sendWhatsAppMessage,
  formatPhoneNumber,
}
