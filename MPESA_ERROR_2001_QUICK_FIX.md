# M-Pesa Error 2001 - Quick Test & Fix

## What You're Seeing

```
✅ M-Pesa Status Response: {
  ResponseCode: '0',
  ResponseDescription: 'The service request has been accepted successfully',
  MerchantRequestID: 'eae2-4cab-ae5b-a778bcbbcb548270',
  CheckoutRequestID: 'ws_CO_02122025105112663111971600',
  ResultCode: '2001',
  ResultDesc: 'The initiator information is invalid.'
}
```

**Translation**: M-Pesa accepted your status query request (ResponseCode: 0), but the actual transaction check failed (ResultCode: 2001).

**Error 2001 means**: The credentials, shortcode, or phone number format used in the **initial STK push** was invalid.

---

## Immediate Actions

### 1. Check Your Phone Number Format ✅

The issue is likely here. M-Pesa requires phone numbers in format: **`254712345678`**

In `components/DoctorCard.tsx`, find where you're calling the payment:

```typescript
// You're probably doing something like:
await fetch('/api/mpesa/stkpush', {
  method: 'POST',
  body: JSON.stringify({
    phone: '0712345678',  // ❌ WRONG - Starts with 0
    amount: 100
  })
})

// Should be:
await fetch('/api/mpesa/stkpush', {
  method: 'POST',
  body: JSON.stringify({
    phone: '254712345678',  // ✅ CORRECT - Starts with 254
    amount: 100
  })
})
```

### 2. Test the Fixed Endpoint

The updated `/app/api/mpesa/stkpush/route.ts` now **automatically converts phone numbers**:

```typescript
// Before sending to M-Pesa:
// "0712345678" → "254712345678" ✅
// "712345678" → "254712345678" ✅
// "254712345678" → "254712345678" ✅
```

### 3. Verify with curl

```bash
# Test the STK push endpoint
curl -X POST http://localhost:3000/api/mpesa/stkpush \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "254712345678",
    "amount": 100
  }'

# Expected Success Response:
# {
#   "message": "STK push sent. Please approve on your phone.",
#   "MerchantRequestID": "xxx",
#   "CheckoutRequestID": "yyy"
# }

# Expected Error 2001 Response:
# {
#   "message": "STK push failed",
#   "ResponseCode": "0",
#   "ResponseDescription": "The service request has been accepted successfully"
# }
# (This means the request was formatted correctly but credentials are wrong)
```

---

## Root Cause Analysis

Error 2001 is a **credential/account configuration issue**, not a code bug. Here's what to check:

### Option A: Test Credentials Are Wrong

```env
# Current in .env.local
MPESA_SHORTCODE=174379
MPESA_PASSKEY=bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919
```

✅ These are **correct** test credentials for Safaricom sandbox.

### Option B: Test Account Not Configured

The shortcode `174379` needs to be enabled in your Safaricom developer account:

1. Go to [Safaricom Developer Portal](https://developer.safaricom.co.ke)
2. Login
3. Navigate to **My Applications** → Your App
4. Check **Sandbox Settings**
5. Verify **Business Shortcode**: `174379` is there
6. Verify **Lipa na M-Pesa Online** is **ENABLED**

### Option C: Wrong Phone Number Being Sent

If you're still calling with `0712345678`, that's error 2001:

**Find where you call `handlePayment()`** in `components/DoctorCard.tsx`:

```typescript
// Look for something like:
const handlePayment = async () => {
  // ... phone number extraction ...
  const response = await fetch('/api/mpesa/stkpush', {
    body: JSON.stringify({
      phone: phoneNumber,  // ← Check this format
      amount: appointmentCost
    })
  });
}
```

---

## Next Steps

### Step 1: Restart Dev Server
```bash
npm run dev
```

### Step 2: Test with Valid Phone
Use a real Kenyan phone number format:
- `254712345678` ✅
- `254798765432` ✅
- `254721234567` ✅

Do NOT use:
- `0712345678` ❌
- `712345678` ❌
- `+254712345678` ❌

### Step 3: Check Console Output

After testing, check your terminal output. You should see:

**If working:**
```
📤 STK Push Request: {
  BusinessShortCode: '174379',
  Timestamp: '20251202105112',
  PartyA: '254712345678',
  Amount: 100,
  CallBackURL: '...'
}
✅ STK Push Response: {
  ResponseCode: '0',
  ResponseDescription: 'The service request has been accepted successfully',
  MerchantRequestID: '...',
  CheckoutRequestID: '...'
}
```

**If still getting error 2001:**
```
⚠️ M-Pesa Status Query Failed: {
  ResultCode: '2001',
  ResultDesc: 'The initiator information is invalid.'
}
```

---

## Complete Solution Checklist

- [ ] **Updated** `/app/api/mpesa/stkpush/route.ts` with phone number validation
- [ ] **Updated** `/app/api/mpesa/status/route.ts` with better logging
- [ ] **Verified** credentials in `.env.local`:
  - `MPESA_SHORTCODE=174379`
  - `MPESA_PASSKEY=bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919`
- [ ] **Confirmed** shortcode `174379` is enabled in Safaricom sandbox account
- [ ] **Tested** with valid phone number format: `254xxxxxxxxx`
- [ ] **Checked** console logs for actual request format
- [ ] **Restarted** dev server after changes

---

## If Still Getting Error 2001

Contact Safaricom support with:

**Email**: developer@safaricom.co.ke

**Include**:
- Your API Consumer Key (last 4 chars): `...Vq5EWsvIm`
- Your Shortcode: `174379`
- Screenshot from Safaricom portal showing shortcode enabled
- MerchantRequestID from failed request
- Timestamp used
- Phone number tested

**Message**:
```
Hello,

I'm testing Lipa na M-Pesa Online (STK Push) on the sandbox environment.
My shortcode 174379 is configured but when I send an STK push request, 
the status query returns error code 2001 "The initiator information is invalid."

The credentials are correct and the request format matches your documentation.
Could you check if there's an issue with my account configuration?

MerchantRequestID: [from your logs]
Phone tested: 254712345678
Amount: 100

Thank you,
[Your Name]
```

---

## Demo Mode Alternative

Until M-Pesa is working, use demo mode:

```bash
# .env.local
NEXT_PUBLIC_MOCK_PAYMENT=true
```

This simulates payment without calling M-Pesa, letting you test the full flow.

---

## Files Updated

✅ `/app/api/mpesa/stkpush/route.ts` - Added phone validation
✅ `/app/api/mpesa/status/route.ts` - Added detailed logging
✅ Created `MPESA_ERROR_2001_FIX.md` - Comprehensive guide
✅ This file - Quick reference and testing guide

No code errors. Ready to test!
