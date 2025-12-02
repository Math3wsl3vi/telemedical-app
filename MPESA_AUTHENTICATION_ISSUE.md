# M-Pesa Authentication Issue & Resolution

## Problem
The M-Pesa sandbox API is returning **403 Forbidden** errors when attempting to authenticate for payment processing. The requests are being blocked by **Incapsula WAF (Web Application Firewall)**.

### Error Details
```
M-Pesa Token Error: {
  status: 403,
  statusText: 'Forbidden',
  message: 'Request failed with status code 403'
}
```

### Root Cause
Safaricom's M-Pesa sandbox environment uses Incapsula WAF protection which:
- Blocks requests from certain IP ranges
- Requires proper authentication headers
- May have strict rate limiting policies
- Could have expired or misconfigured credentials

## Current Implementation
✅ **Appointment saving is now resilient** - The system has been updated to:
1. Attempt M-Pesa payment integration
2. Continue with appointment booking even if payment verification fails
3. Save appointments to Firestore with `paymentStatus: 'pending'` if M-Pesa verification times out
4. Allow users to proceed to the video call while payment is being verified

## Files Modified
- **components/DoctorCard.tsx**: 
  - Updated `startRoom()` to wrap Firestore save in try-catch
  - Updated `startPolling()` to gracefully handle M-Pesa API errors
  - Users can now continue even if payment verification fails

## Solutions to Try

### Option 1: IP Whitelisting (Recommended)
Contact Safaricom M-Pesa developer support:
1. Request your server IP to be whitelisted
2. Provide server IP: **154.159.237.154** (from error logs)
3. Request: IP whitelisting for M-Pesa sandbox

**Contact**: developer@safaricom.co.ke

### Option 2: Verify Credentials
Ensure your M-Pesa sandbox credentials are up to date:
- Check `.env.local` for:
  - `NEXT_PUBLIC_MPESA_CONSUMER_KEY`
  - `NEXT_PUBLIC_MPESA_CONSUMER_SECRET`
  - `NEXT_PUBLIC_MPESA_SHORTCODE`
  - `NEXT_PUBLIC_MPESA_PASSKEY`
- Regenerate credentials if they've expired
- Login to: https://sandbox.safaricom.co.ke/

### Option 3: Switch Payment Gateway
If M-Pesa sandbox remains inaccessible, consider alternatives:
- **Pesapal**: https://pesapal.com/ (supports M-Pesa)
- **Flutterwave**: https://flutterwave.com/ (supports M-Pesa)
- **Stripe**: https://stripe.com/ (Kenya support)

## Testing Appointment Saving
The appointment saving functionality is now fully operational and can be tested:

1. **Navigate** to doctor selection page
2. **Select** a doctor and schedule appointment
3. **Enter** phone number for payment
4. **Click** "Pay Now" button
5. **Expected behavior**:
   - Payment prompt will be shown
   - If M-Pesa fails, you'll see a connectivity warning
   - Appointment will still be saved to Firestore with `paymentStatus: 'pending'`
   - User can proceed to video call

### Verifying Firestore Saves
Check your Firestore `appointments` collection:
```
appointments/
├── [appointmentId1]/
│   ├── patientId: "user_xxx"
│   ├── patientName: "John Doe"
│   ├── doctorId: "doc_1"
│   ├── doctorName: "Dr. Jane Smith"
│   ├── appointmentDate: Timestamp
│   ├── paymentStatus: "pending" (if M-Pesa failed) OR "completed" (if payment succeeded)
│   ├── status: "scheduled"
│   └── ...
```

## Next Steps
1. Try Option 1 (IP Whitelisting) with Safaricom support
2. Once M-Pesa authentication is fixed, payment verification will work normally
3. For production, integrate a more reliable payment gateway with fallback options

## Current Status
- ✅ Appointment saving to Firestore: **WORKING**
- ✅ Error handling: **ROBUST**
- ⚠️ M-Pesa API access: **BLOCKED BY INCAPSULA**
- 🚀 User flow: **FUNCTIONAL (with fallback)**

---
**Last Updated**: December 2, 2025
**Developer**: Copilot
