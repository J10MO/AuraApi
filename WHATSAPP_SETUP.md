# WhatsApp OTP Integration Guide - دليل تكامل واتساب

## Overview - نظرة عامة
This backend now supports sending OTP codes via WhatsApp using the Infobip Template API.

يدعم هذا النظام الآن إرسال رموز OTP عبر واتساب باستخدام Infobip Template API.

## Configuration - الإعدادات

### 1. Environment Variables - متغيرات البيئة
Add these to your `.env` file:

\`\`\`env
# Infobip WhatsApp API
INFOBIP_API_KEY=52910832451c5a7370324eaffcce889d-67ca8a1b-80cc-449f-aa09-00932c285570
INFOBIP_BASE_URL=51d53z.api.infobip.com
INFOBIP_SENDER=447860088970
INFOBIP_TEMPLATE_NAME=test_whatsapp_template_en

# Default country code for phone number formatting
DEFAULT_COUNTRY_CODE=964
\`\`\`

**Important - مهم:**
- `INFOBIP_SENDER` هو رقم WhatsApp Business المعتمد من Infobip (447860088970)
- `INFOBIP_TEMPLATE_NAME` هو اسم القالب المعتمد في حساب Infobip
- `DEFAULT_COUNTRY_CODE` رمز الدولة (العراق=964، السعودية=966، الإمارات=971)

### 2. Install Dependencies - تثبيت المكتبات
\`\`\`bash
npm install
\`\`\`

## How It Works - كيف يعمل

### Sending OTP - إرسال رمز التحقق
When a user requests an OTP via `POST /api/auth/send-otp`:

1. A 6-digit verification code is generated - يتم إنشاء رمز مكون من 6 أرقام
2. The code is saved to the database with 10-minute expiry - يتم حفظ الرمز في قاعدة البيانات لمدة 10 دقائق
3. The system sends the code via WhatsApp Template - يرسل النظام الرمز عبر قالب واتساب
4. If WhatsApp sending fails, the code is logged to console - في حالة الفشل، يتم طباعة الرمز في السجل

### WhatsApp Template Format - صيغة قالب واتساب

**يجب إنشاء قالب في حساب Infobip بالصيغة التالية:**

\`\`\`
مرحباً {{1}}،

رمز التحقق الخاص بك هو: {{2}}

الرمز صالح لمدة 10 دقائق.
\`\`\`

Where:
- `{{1}}` = اسم المستخدم (User name)
- `{{2}}` = رمز OTP (OTP code)

## API Endpoints

### Send OTP
\`\`\`http
POST /api/auth/send-otp
Content-Type: application/json

{
  "phone": "07717288459",
  "role": "customer"
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "exists": false,
  "role": "customer",
  "message": "تم إرسال رمز التحقق عبر واتساب بنجاح"
}
\`\`\`

### Verify OTP
\`\`\`http
POST /api/auth/verify-otp
Content-Type: application/json

{
  "phone": "07717288459",
  "code": "123456",
  "userData": {
    "name": "Ahmed",
    "email": "ahmed@example.com"
  }
}
\`\`\`

## Phone Number Format - صيغة رقم الهاتف

**النظام يحول الأرقام تلقائياً:**

**Accepted formats - الصيغ المقبولة:**
- `07717288459` → `9647717288459` (بدون +)
- `7717288459` → `9647717288459`
- `9647717288459` → `9647717288459`
- `+9647717288459` → `9647717288459` (يتم إزالة +)
- `009647717288459` → `9647717288459`

**ملاحظة مهمة:** Infobip Template API يتطلب الرقم بدون علامة + في البداية.

## Common Errors - الأخطاء الشائعة

### 1. Error: "REJECTED_SOURCE" (Code 375)

**السبب:**
- رقم المرسل (INFOBIP_SENDER) غير معتمد أو غير مفعل في حساب Infobip
- يجب استخدام رقم WhatsApp Business معتمد

**الحل:**
\`\`\`env
INFOBIP_SENDER=447860088970
\`\`\`
استخدم الرقم المعتمد من Infobip (447860088970 في مثالك)

### 2. Error: "REJECTED_PREFIX_MISSING" (Code 345)

**السبب:**
- صيغة رقم الهاتف غير صحيحة
- رقم الهاتف يحتاج إلى رمز الدولة

**الحل:**
\`\`\`env
DEFAULT_COUNTRY_CODE=964
\`\`\`
النظام سيحول الأرقام المحلية تلقائياً (07717288459 → 9647717288459)

### 3. Template Not Found

**السبب:**
- القالب غير موجود في حساب Infobip
- اسم القالب غير صحيح

**الحل:**
1. اذهب إلى Infobip Dashboard
2. أنشئ قالب جديد في قسم WhatsApp Templates
3. انتظر موافقة WhatsApp على القالب (قد يستغرق 24-48 ساعة)
4. استخدم اسم القالب الصحيح في `INFOBIP_TEMPLATE_NAME`

## Creating WhatsApp Template - إنشاء قالب واتساب

### خطوات إنشاء القالب في Infobip:

1. **Login to Infobip Dashboard**
   - اذهب إلى https://portal.infobip.com

2. **Navigate to WhatsApp Templates**
   - Channels → WhatsApp → Templates

3. **Create New Template**
   - اسم القالب: `test_whatsapp_template_en`
   - اللغة: English
   - الفئة: Authentication (OTP)

4. **Template Content:**
   \`\`\`
   Hello {{1}},
   
   Your verification code is: {{2}}
   
   Valid for 10 minutes.
   \`\`\`

5. **Submit for Approval**
   - أرسل القالب للموافقة من WhatsApp
   - الموافقة تستغرق 24-48 ساعة عادة

6. **Use Approved Template**
   - بعد الموافقة، استخدم اسم القالب في `.env`

## Testing - الاختبار

### Development Mode
\`\`\`json
{
  "success": true,
  "message": "تم إرسال رمز التحقق عبر واتساب بنجاح",
  "otp": "123456",
  "debugInfo": "هذا للاختبار فقط"
}
\`\`\`

### Production Mode
\`\`\`json
{
  "success": true,
  "message": "تم إرسال رمز التحقق عبر واتساب بنجاح"
}
\`\`\`

## Utility Functions

### `sendWhatsAppOTP(phone, code, userName)`
Sends an OTP code via WhatsApp Template.

\`\`\`javascript
const { sendWhatsAppOTP } = require('./utils/whatsapp');

const result = await sendWhatsAppOTP('07717288459', '123456', 'أحمد');
if (result.success) {
  console.log('OTP sent successfully');
}
\`\`\`

## Security Notes - ملاحظات الأمان

1. **Never expose API keys** - لا تكشف مفاتيح API
2. **Rate limit OTP requests** - حدد عدد طلبات OTP
3. **Use HTTPS** in production - استخدم HTTPS في الإنتاج
4. **Validate phone numbers** - تحقق من أرقام الهواتف
5. **Set appropriate OTP expiry** - حدد مدة صلاحية مناسبة (10 دقائق)

## Troubleshooting Checklist - قائمة التحقق

✅ **Check INFOBIP_SENDER:**
- هل الرقم معتمد في حساب Infobip؟
- هل الرقم بالصيغة الصحيحة؟ (447860088970)

✅ **Check Template:**
- هل القالب معتمد من WhatsApp؟
- هل اسم القالب صحيح في `.env`؟

✅ **Check Phone Format:**
- هل DEFAULT_COUNTRY_CODE صحيح؟ (964 للعراق)
- هل النظام يحول الأرقام بشكل صحيح؟

✅ **Check API Credentials:**
- هل INFOBIP_API_KEY صحيح؟
- هل INFOBIP_BASE_URL صحيح؟ (بدون https://)

## Support - الدعم

**Infobip Support:**
- Email: support@infobip.com
- Documentation: https://www.infobip.com/docs/whatsapp

**للمساعدة:**
- تحقق من سجلات الخادم (Server Logs)
- تأكد من جميع متغيرات البيئة
- تحقق من حالة القالب في Infobip Dashboard
