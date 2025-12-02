# Environment Variables Configuration

This file documents all environment variables needed for the Telemedical App.

## M-Pesa Payment Integration

### Production Mode (Real M-Pesa Payments)
```bash
# M-Pesa Credentials (from Safaricom Developer Portal)
NEXT_PUBLIC_MPESA_CONSUMER_KEY=your_consumer_key
NEXT_PUBLIC_MPESA_CONSUMER_SECRET=your_consumer_secret
NEXT_PUBLIC_MPESA_SHORTCODE=your_shortcode
NEXT_PUBLIC_MPESA_PASSKEY=your_passkey

# Production/Sandbox Base URL
NEXT_PUBLIC_MPESA_BASE_URL=https://sandbox.safaricom.co.ke

# Disable demo mode
NEXT_PUBLIC_MOCK_PAYMENT=false
```

### Demo/Testing Mode (Without Real M-Pesa)
When M-Pesa API is unavailable (Incapsula blocking, authentication issues, etc.), use demo mode:

```bash
# Enable mock payment for testing
NEXT_PUBLIC_MOCK_PAYMENT=true

# M-Pesa credentials are still required but won't be used in demo mode
NEXT_PUBLIC_MPESA_CONSUMER_KEY=demo_key
NEXT_PUBLIC_MPESA_CONSUMER_SECRET=demo_secret
NEXT_PUBLIC_MPESA_SHORTCODE=123456
NEXT_PUBLIC_MPESA_PASSKEY=demo_passkey
NEXT_PUBLIC_MPESA_BASE_URL=https://sandbox.safaricom.co.ke
```

## Firebase Configuration

```bash
# Firebase Config (from Firebase Console)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## Stream Video SDK

```bash
# Stream Video API Key
NEXT_PUBLIC_STREAM_API_KEY=your_stream_api_key
```

## Clerk Authentication

```bash
# Clerk API Keys (from Clerk Dashboard)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
CLERK_SECRET_KEY=your_clerk_secret
```

## WhatsApp Integration

```bash
# WhatsApp Business API (if configured)
WHATSAPP_API_KEY=your_whatsapp_api_key
WHATSAPP_PHONE_ID=your_phone_id
```

## Application Base URL

```bash
# Used for generating meeting links
NEXT_PUBLIC_BASE_URL=http://localhost:3000  # For development
NEXT_PUBLIC_BASE_URL=https://your-domain.com  # For production
```

---

## Using Demo Mode

When developing or testing without M-Pesa access:

1. Set `NEXT_PUBLIC_MOCK_PAYMENT=true` in `.env.local`
2. Fill other M-Pesa variables with dummy values
3. The app will simulate payment successfully after 3 seconds
4. Appointments will be saved to Firestore with `paymentStatus: 'pending'`

This allows you to:
- ✅ Test appointment booking flow
- ✅ Verify Firestore saves
- ✅ Test video call integration
- ✅ Develop UI/UX features

When M-Pesa authentication is fixed:
1. Set `NEXT_PUBLIC_MOCK_PAYMENT=false`
2. Ensure real M-Pesa credentials are in place
3. System will use actual payment processing

---

## Current Status

- **M-Pesa Real Payments**: ⚠️ Blocked by Incapsula (403 Forbidden)
- **Demo Mode**: ✅ Available for development/testing
- **Appointment Saving**: ✅ Working with both modes
- **Firebase Integration**: ✅ Fully functional

## Troubleshooting

### M-Pesa Returns 403 Forbidden
- Incapsula WAF is blocking requests
- **Solution**: Contact Safaricom (developer@safaricom.co.ke) to whitelist your IP
- **Temporary**: Use `NEXT_PUBLIC_MOCK_PAYMENT=true` for development

### Appointments Not Saving
- Check Firebase credentials
- Ensure Firestore `appointments` collection exists
- Check browser console for errors

### WhatsApp Messages Not Sending
- Verify WhatsApp API credentials
- Ensure doctor phone numbers are in valid format
- Check WhatsApp Business account is active
