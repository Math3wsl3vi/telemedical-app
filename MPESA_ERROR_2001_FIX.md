# M-Pesa Error 2001: The Initiator Information is Invalid

## Problem
When querying M-Pesa STK push status, receiving error code `2001` with message "The initiator information is invalid."

## Root Cause Analysis

Error 2001 typically indicates one of these issues:

1. **BusinessShortCode Mismatch** - The shortcode in the request doesn't match your registered account
2. **Password/Timestamp Mismatch** - The password encoding is incorrect or timestamp format is wrong
3. **Invalid Credentials** - Consumer key/secret are incorrect or expired
4. **Missing Required Fields** - The request is missing required fields for M-Pesa API
5. **Account Not Configured** - The shortcode is not properly registered for STK push on Safaricom

## Debugging Steps

### Step 1: Verify Your Credentials
Run this in your Node.js terminal to check your setup:

```javascript
const moment = require('moment');
const crypto = require('crypto');

const SHORTCODE = "174379";
const PASSKEY = "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919";

const timestamp = moment().format("YYYYMMDDHHmmss");
const password = Buffer.from(`${SHORTCODE}${PASSKEY}${timestamp}`).toString("base64");

console.log("Timestamp:", timestamp);
console.log("Password:", password);
console.log("Length of password:", password.length);
```

Expected:
- Timestamp: 14 digits (YYYYMMDDHHmmss)
- Password: Base64 encoded string (~88 characters)
- Both should be valid

### Step 2: Check Your Shortcode Registration

The shortcode `174379` is a **Safaricom test shortcode**. Verify:
- [ ] It's registered in Safaricom sandbox account
- [ ] It's configured for **STK Push (Lipa na M-Pesa Online)**
- [ ] Your test account has it linked

**Action Items:**
1. Go to [Safaricom Developer Portal](https://developer.safaricom.co.ke)
2. Login to your account
3. Under "My Applications", select your app
4. Check "Sandbox Settings" → Business Shortcode
5. Verify the shortcode matches `174379`
6. Check that "Lipa na M-Pesa Online" is enabled

### Step 3: Validate the STK Push Request

Before checking status, ensure the initial STK push request is correct.

**Current Implementation** (`/app/api/mpesa/stkpush/route.ts`):

```typescript
const response = await axios.post(
  "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
  {
    BusinessShortCode: process.env.MPESA_SHORTCODE,
    Password: password,
    Timestamp: timestamp,
    TransactionType: "CustomerPayBillOnline",
    Amount: amount,
    PartyA: phone,
    PartyB: process.env.MPESA_SHORTCODE,
    PhoneNumber: phone,
    CallBackURL: "https://yourdomain.com/api/mpesa/callback",
    AccountReference: "Order123",
    TransactionDesc: "Payment for order",
  }
);
```

**Issues Found:**
1. ✅ `CallBackURL` is hardcoded to `https://yourdomain.com/api/mpesa/callback` - This needs to be your actual domain
2. ✅ Missing `environment` variable specification
3. ⚠️ Phone number format - Must be in format `254712345678` (with 254 country code)

### Step 4: Fix the Implementation

Replace the STK push implementation with improved error handling and logging:

**File: `/app/api/mpesa/stkpush/route.ts`**

```typescript
import { NextResponse } from "next/server";
import axios from "axios";
import moment from "moment";

const getMpesaAccessToken = async (): Promise<string> => {
  const credentials = Buffer.from(
    `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`
  ).toString("base64");

  try {
    const response = await axios.get<{ access_token: string }>(
      "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
      { 
        headers: { 
          Authorization: `Basic ${credentials}`,
          "Content-Type": "application/json",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        },
        timeout: 15000
      }
    );
    return response.data.access_token;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error("M-Pesa Token Error:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        message: error.message,
      });
    }
    throw new Error("Failed to obtain M-Pesa access token");
  }
};

export async function POST(req: Request) {
  try {
    const { phone, amount } = await req.json();

    // Validate and format phone number
    let formattedPhone = phone.toString().trim();
    if (formattedPhone.startsWith("0")) {
      formattedPhone = "254" + formattedPhone.substring(1);
    } else if (!formattedPhone.startsWith("254")) {
      formattedPhone = "254" + formattedPhone;
    }

    // Validate phone format
    if (!/^254\d{9}$/.test(formattedPhone)) {
      return NextResponse.json(
        { message: "Invalid phone number format. Expected 254xxxxxxxxx" },
        { status: 400 }
      );
    }

    // Validate amount
    if (!amount || amount < 1) {
      return NextResponse.json(
        { message: "Invalid amount. Minimum is 1 KES" },
        { status: 400 }
      );
    }

    const accessToken = await getMpesaAccessToken();

    const timestamp = moment().format("YYYYMMDDHHmmss");
    const password = Buffer.from(
      `${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`
    ).toString("base64");

    const callbackURL = process.env.MPESA_CALLBACK_URL || 
      `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/mpesa/callback`;

    const requestBody = {
      BusinessShortCode: process.env.MPESA_SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: Math.floor(amount),
      PartyA: formattedPhone,
      PartyB: process.env.MPESA_SHORTCODE,
      PhoneNumber: formattedPhone,
      CallBackURL: callbackURL,
      AccountReference: `Order${Date.now()}`,
      TransactionDesc: "Telemedicine Appointment",
    };

    console.log("📤 STK Push Request:", {
      ...requestBody,
      Password: "***",
      Timestamp: timestamp,
    });

    const response = await axios.post<{
      MerchantRequestID: string;
      CheckoutRequestID: string;
      ResponseCode: string;
      ResponseDescription: string;
    }>(
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      requestBody,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        timeout: 15000,
      }
    );

    const data = response.data;
    console.log("✅ STK Push Response:", {
      ResponseCode: data.ResponseCode,
      ResponseDescription: data.ResponseDescription,
      MerchantRequestID: data.MerchantRequestID,
      CheckoutRequestID: data.CheckoutRequestID,
    });

    if (data.ResponseCode !== "0") {
      return NextResponse.json(
        {
          message: "STK push failed",
          ResponseCode: data.ResponseCode,
          ResponseDescription: data.ResponseDescription,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: "STK push sent. Please approve on your phone.",
      MerchantRequestID: data.MerchantRequestID,
      CheckoutRequestID: data.CheckoutRequestID,
    });
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error("❌ STK Push Error:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
      });
      return NextResponse.json(
        {
          message: "STK push failed",
          error: error.response?.data || error.message,
        },
        { status: 500 }
      );
    } else if (error instanceof Error) {
      console.error("❌ STK Push Error:", error.message);
    }

    return NextResponse.json(
      { message: "Failed to initiate STK push" },
      { status: 500 }
    );
  }
}
```

### Step 5: Fix the Status Query

The status query also needs the same improvements:

**File: `/app/api/mpesa/status/route.ts`**

Ensure the status endpoint properly logs what it's sending:

```typescript
console.log("📤 Status Query Request:", {
  BusinessShortCode: BusinessShortCode,
  Timestamp: Timestamp,
  CheckoutRequestID: checkoutRequestID,
  Password: "***",
});
```

## Common Solutions

### Solution 1: Use a Real Registered Shortcode
If you have a real registered shortcode from Safaricom:
1. Update `MPESA_SHORTCODE` in `.env.local`
2. Update the corresponding `MPESA_PASSKEY`
3. Restart the dev server

### Solution 2: Use Safaricom Test Credentials
The sandbox provides test credentials:

```bash
# Test Shortcode (for Lipa na M-Pesa Online)
MPESA_SHORTCODE=174379

# Test Passkey - Use this exact value
MPESA_PASSKEY=bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919

# Test Phone Numbers (for sandbox testing)
# 254712345678 - Use any valid format starting with 254
```

### Solution 3: Verify Test Account
1. Ensure your Safaricom developer account has shortcode `174379` configured
2. Go to [Safaricom Sandbox](https://sandbox.safaricom.co.ke)
3. Check "Lipa na M-Pesa Online" is enabled
4. Verify the Business Short Code settings

## Debugging With Curl

Test your endpoint directly:

```bash
# Test STK Push
curl -X POST http://localhost:3000/api/mpesa/stkpush \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "254712345678",
    "amount": 100
  }'

# Expected Response:
# {
#   "message": "STK push sent. Please approve on your phone.",
#   "MerchantRequestID": "...",
#   "CheckoutRequestID": "..."
# }

# Test Status Query
curl -X POST http://localhost:3000/api/mpesa/status \
  -H "Content-Type: application/json" \
  -d '{
    "checkoutRequestID": "ws_CO_02122025105112663111971600"
  }'
```

## Error Code Reference

| Code | Meaning | Solution |
|------|---------|----------|
| 0 | Success | ✅ Transaction initiated |
| 1032 | Pending user input | ⏳ User hasn't responded to STK prompt |
| 2001 | Initiator information invalid | ❌ Check shortcode, passkey, phone format |
| 2002 | Invalid transaction type | ❌ Use "CustomerPayBillOnline" |
| 9100 | Processing error | ⚠️ Try again, contact Safaricom |

## Next Steps

1. **Implement the fixed STK push route** above
2. **Test with valid phone number** in format `254712345678`
3. **Check console logs** for the actual request being sent
4. **Compare with Safaricom docs** at [M-Pesa API Documentation](https://developer.safaricom.co.ke/apis)
5. **If still failing**: Contact Safaricom support with your error logs and MerchantRequestID

## Verification Checklist

- [ ] Phone number formatted as `254xxxxxxxxx`
- [ ] Shortcode matches registered account (`174379`)
- [ ] Passkey is correct
- [ ] Consumer Key and Secret are valid
- [ ] Callback URL is accessible
- [ ] Transaction type is `CustomerPayBillOnline`
- [ ] Amount is valid (minimum 1 KES)
- [ ] Timestamp is in YYYYMMDDHHmmss format
- [ ] Password is properly Base64 encoded

## Support

If the error persists after implementing these fixes:

1. **Enable detailed logging** in both STK push and status endpoints
2. **Save the MerchantRequestID** from the STK push response
3. **Contact Safaricom** with:
   - MerchantRequestID
   - Timestamp used
   - Phone number tested
   - Error response
   - Your shortcode

Email: developer@safaricom.co.ke
