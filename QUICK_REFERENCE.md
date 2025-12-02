# Quick Reference - Appointment System

## ⚡ 30-Second Setup for Demo Mode

```bash
# 1. Add this to .env.local
NEXT_PUBLIC_MOCK_PAYMENT=true

# 2. Restart dev server
npm run dev

# 3. Test at http://localhost:3000/doctor-page
```

## 🎯 What Happens When You Book an Appointment

1. **Select Doctor** → Choose from available doctors
2. **Pick Date & Time** → Select appointment slot  
3. **Enter Phone** → E.g., `0712345678` or `0112345678`
4. **Click Pay Now** → Payment processing starts
5. **In Demo Mode**: ✅ Simulates success after 3 seconds
6. **Appointment Saved** → Goes to Firestore immediately
7. **Show Buttons** → See "Request Appointment" & "Copy Link"
8. **Join Call** → Start video consultation

---

## 🗂️ Key Files

| File | Purpose |
|------|---------|
| `lib/appointments.ts` | Firestore database operations |
| `components/DoctorCard.tsx` | Appointment UI & payment flow |
| `.env.local` | Configuration (MOCK_PAYMENT=true for demo) |
| `DEMO_MODE_SETUP.md` | Detailed setup instructions |
| `IMPLEMENTATION_SUMMARY.md` | Complete feature overview |

---

## 🔐 Environment Variables Needed

```bash
# Minimum for Demo Mode
NEXT_PUBLIC_MOCK_PAYMENT=true
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_STREAM_API_KEY=your_stream_key
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
CLERK_SECRET_KEY=your_secret
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

---

## ✅ Firestore Data Saved

When appointment is booked, this is saved to `appointments` collection:

```
{
  patientId: "user_123",
  doctorId: "doc_1", 
  doctorName: "Dr. Jane Smith",
  doctorSpecialty: "Cardiology",
  appointmentDate: Dec 10, 2024 @ 2:30 PM,
  paymentStatus: "pending",  // or "completed"
  status: "scheduled",
  meetingLink: "https://...",
  createdAt: Dec 2, 2024 @ 10:00 AM
}
```

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Payment button not working | Check `NEXT_PUBLIC_MOCK_PAYMENT=true` in `.env.local` |
| No appointment in Firestore | Verify Firebase credentials in `.env.local` |
| Can't enter payment phone | Make sure phone format is `07XXXXXXXX` or `01XXXXXXXX` |
| App keeps crashing | Clear browser cache and reload |
| Get 403 Forbidden (real mode) | This is expected - use demo mode (`NEXT_PUBLIC_MOCK_PAYMENT=true`) |

---

## 📋 Testing Workflow

```
1. Open /doctor-page
2. Click doctor card
3. Select appointment date
4. Pick time slot
5. Enter phone number
6. Click "Pay Now"
7. Wait 3 seconds (demo payment)
8. See success message
9. Click "Request Appointment Now"
10. Join video call
```

---

## 🚀 When M-Pesa Works

Switch from demo to real payments:

```bash
# Change this in .env.local
NEXT_PUBLIC_MOCK_PAYMENT=false

# Make sure real M-Pesa credentials are set
NEXT_PUBLIC_MPESA_CONSUMER_KEY=your_real_key
NEXT_PUBLIC_MPESA_CONSUMER_SECRET=your_real_secret
# ... etc
```

Then restart server and real payments will work.

---

## 📞 M-Pesa Support

**If you want real payments:**
- Email: developer@safaricom.co.ke
- Request: IP whitelisting
- Your IP: 154.159.237.154
- ETA: 1-3 business days

**Until then:** Use demo mode!

---

## ✨ Features Working Right Now

✅ Schedule appointments  
✅ Pay with demo mode  
✅ Save to Firestore  
✅ Video calls  
✅ WhatsApp notifications  
✅ Meeting links  
✅ Error handling  

---

**Start now**: `npm run dev` → `/doctor-page` → Book an appointment! 🎉
