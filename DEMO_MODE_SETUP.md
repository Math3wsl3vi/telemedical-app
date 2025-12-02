# Quick Start Guide - Demo Mode Setup

## Problem
M-Pesa sandbox API is returning 403 Forbidden errors due to Incapsula WAF protection. This blocks payment testing but doesn't prevent appointment feature development.

## Solution
Enable **Demo Mode** to simulate payments and test the complete appointment booking flow.

---

## How to Enable Demo Mode

### Step 1: Update `.env.local`
Add or modify this line in your `.env.local` file:

```bash
NEXT_PUBLIC_MOCK_PAYMENT=true
```

Your `.env.local` should look like:
```bash
# M-Pesa (demo credentials can be anything)
NEXT_PUBLIC_MPESA_CONSUMER_KEY=demo
NEXT_PUBLIC_MPESA_CONSUMER_SECRET=demo
NEXT_PUBLIC_MPESA_SHORTCODE=123456
NEXT_PUBLIC_MPESA_PASSKEY=demo
NEXT_PUBLIC_MPESA_BASE_URL=https://sandbox.safaricom.co.ke

# Demo Mode Enable
NEXT_PUBLIC_MOCK_PAYMENT=true

# Other configurations...
NEXT_PUBLIC_FIREBASE_API_KEY=your_actual_key
# ... rest of your env vars
```

### Step 2: Restart Development Server
```bash
npm run dev
```

### Step 3: Test the Payment Flow

1. Navigate to `/doctor-page`
2. Select a doctor
3. Book an appointment (choose date & time)
4. Enter any phone number (e.g., `0712345678`)
5. Click **"Pay Now"** button
6. You'll see: `🔧 DEMO MODE: Simulating payment...`
7. After 3 seconds: `✅ Demo Payment Successful`
8. Now you can see the appointment buttons:
   - "Request Appointment Now"
   - "Copy Invite Link"

### Step 4: Verify Firestore Save
Check your Firebase console:
1. Go to Firestore Database
2. Open `appointments` collection
3. Look for newly created documents with:
   - `paymentStatus: "pending"` (demo mode)
   - `patientId`, `doctorName`, `appointmentDate`, etc.

---

## What Works in Demo Mode

✅ **Appointment Creation**
- Schedule appointments for any date/time
- Save to Firestore
- Generate meeting links

✅ **Payment Simulation**
- 3-second fake payment processing
- Shows success message
- Marks appointment as `paymentStatus: pending`

✅ **Video Calls**
- Join scheduled meetings
- Stream video with doctor
- Share invite links

✅ **WhatsApp Notifications**
- Sends doctor notification via WhatsApp
- Contains meeting link

---

## What Doesn't Work in Demo Mode

❌ **Real M-Pesa Payments**
- Won't actually charge money
- Payments are simulated
- Good for development/testing

❌ **Actual STK Push**
- Won't show prompt on phone
- Use real mode when M-Pesa is fixed

---

## Switching Back to Real Mode

When M-Pesa API is accessible again:

```bash
NEXT_PUBLIC_MOCK_PAYMENT=false
```

Then ensure your M-Pesa credentials are correct and restart the server.

---

## Troubleshooting

### Demo mode not working?
1. Clear browser cache (`Ctrl+Shift+Delete`)
2. Restart dev server (`npm run dev`)
3. Check console for errors
4. Verify `NEXT_PUBLIC_MOCK_PAYMENT=true` in `.env.local`

### Payment button shows error?
- Check if `NEXT_PUBLIC_MOCK_PAYMENT` is set to `true`
- Look at console for any TypeScript errors
- Try hard refresh (`Ctrl+F5`)

### Appointments not saving?
- Verify Firebase credentials in `.env.local`
- Check Firestore is accessible in Firebase console
- Look for errors in browser console

---

## Next Steps

Once M-Pesa authentication is fixed:

1. **Get IP whitelisted** with Safaricom:
   - Email: developer@safaricom.co.ke
   - Your server IP: `154.159.237.154`
   
2. **Switch to real mode**:
   - Set `NEXT_PUBLIC_MOCK_PAYMENT=false`
   - Keep real M-Pesa credentials
   - Test with real payments

3. **Deploy to production**:
   - Use real M-Pesa credentials
   - Set `NEXT_PUBLIC_MOCK_PAYMENT=false`
   - Monitor payment transactions

---

## Questions?

- Check `MPESA_AUTHENTICATION_ISSUE.md` for detailed M-Pesa troubleshooting
- Check `ENV_CONFIGURATION.md` for all environment variables
- Review appointment saving logic in `lib/appointments.ts`
