# OTPIQ WhatsApp OTP Setup Guide

## Overview
This application uses OTPIQ API for sending OTP codes via WhatsApp and SMS.

## Configuration

### Environment Variables
Add these to your `.env` file:

\`\`\`env
OTPIQ_API_KEY=sk_live_1b44fa8f730d54aa41aa69c6b09d87f788a849d7
OTPIQ_API_URL=https://api.otpiq.com/api/sms
\`\`\`

## Features

### 1. Send OTP via WhatsApp
\`\`\`javascript
const { sendWhatsAppOTP } = require('./utils/whatsapp');

// Send OTP code
const result = await sendWhatsAppOTP('07717288459', '123456');
\`\`\`

### 2. Send Custom WhatsApp Message
\`\`\`javascript
const { sendWhatsAppMessage } = require('./utils/whatsapp');

// Send custom message
const result = await sendWhatsAppMessage('07717288459', 'Your custom message');
\`\`\`

## Phone Number Format

The system automatically formats phone numbers:
- **Input**: `07717288459` or `+9647717288459` or `9647717288459`
- **Output**: `9647717288459` (without + prefix)

Local numbers starting with 0 are automatically converted to international format with Iraq country code (964).

## API Request Format

\`\`\`javascript
{
  "phoneNumber": "9647717288459",
  "smsType": "verification",
  "provider": "whatsapp-sms",
  "verificationCode": "123456"
}
\`\`\`

## Response Format

### Success Response
\`\`\`javascript
{
  success: true,
  data: {
    // OTPIQ API response data
  }
}
\`\`\`

### Error Response
\`\`\`javascript
{
  success: false,
  error: "Error message",
  errorCode: 400
}
\`\`\`

## Testing

### Test OTP Sending
\`\`\`bash
curl -X POST https://api.otpiq.com/api/sms \
  -H "Authorization: Bearer sk_live_1b44fa8f730d54aa41aa69c6b09d87f788a849d7" \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "9647717288459",
    "smsType": "verification",
    "provider": "whatsapp-sms",
    "verificationCode": "123456"
  }'
\`\`\`

## Advantages of OTPIQ

1. **Simple API** - No templates required, direct OTP sending
2. **Multiple Providers** - Supports WhatsApp, SMS, and more
3. **No Whitelist** - Works with any phone number in production
4. **Fast Setup** - No approval process needed
5. **Reliable** - Built specifically for OTP delivery

## Troubleshooting

### Issue: API Key Invalid
**Solution**: Check that your API key is correct in `.env` file

### Issue: Phone Number Format Error
**Solution**: The system auto-formats numbers, but ensure they're valid Iraqi numbers

### Issue: Message Not Received
**Solution**: 
1. Check API key is valid
2. Verify phone number is correct
3. Check OTPIQ dashboard for delivery status
4. Ensure you have sufficient credits

## Support

For OTPIQ API support, visit: https://otpiq.com/docs
\`\`\`

```typescriptreact file="WHATSAPP_SETUP.md" isDeleted="true"
...deleted...
