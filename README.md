# 🏥 Telemedical App

A comprehensive telemedicine platform built with Next.js, enabling seamless virtual healthcare consultations with integrated video calling, appointment booking, prescription management, and M-Pesa payment processing.

## ✨ Features

### 👥 For Patients
- **Secure Authentication** - Sign up and sign in with Clerk authentication
- **Doctor Discovery** - Browse and select from available doctors by specialty
- **Appointment Booking** - Schedule consultations with preferred doctors
- **M-Pesa Integration** - Pay for appointments via STK Push
- **Video Consultations** - High-quality video calls powered by Stream Video SDK
- **Prescription Management** - Receive and view digital prescriptions
- **Appointment History** - Track upcoming and previous appointments
- **WhatsApp Notifications** - Get meeting links via WhatsApp

### 👨‍⚕️ For Doctors
- **Personal Dashboard** - Manage appointments and schedules
- **Doctor Notes Panel** - Document patient consultations in real-time
- **Prescription Creation** - Write and send digital prescriptions during calls
- **Patient History** - Access previous appointment records

### 🔧 Admin Features
- **Doctor Management** - Add, edit, and remove doctor profiles
- **Appointment Oversight** - View and manage all appointments
- **Financial Dashboard** - Track payments and revenue
- **Analytics** - Monitor platform usage and performance

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: [Clerk](https://clerk.com/)
- **Video SDK**: [Stream Video React SDK](https://getstream.io/video/)
- **Database**: [Firebase Firestore](https://firebase.google.com/docs/firestore)
- **Payment**: M-Pesa API (Safaricom)
- **Notifications**: Twilio (WhatsApp Business API)
- **UI Components**: Radix UI, Lucide Icons
- **PDF Generation**: jsPDF
- **Animation**: Framer Motion

## 📋 Prerequisites

Before you begin, ensure you have the following:

- **Node.js** 20.x or higher
- **npm** or **yarn** package manager
- **Firebase Account** - [Create one here](https://firebase.google.com/)
- **Clerk Account** - [Sign up here](https://clerk.com/)
- **Stream Account** - [Get API key here](https://getstream.io/)
- **M-Pesa Developer Account** (Optional for testing) - [Safaricom Developer Portal](https://developer.safaricom.co.ke/)
- **Twilio Account** (Optional) - For WhatsApp notifications

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/Math3wsl3vi/telemedical-app.git
cd telemedical-app
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Stream Video SDK
NEXT_PUBLIC_STREAM_API_KEY=your_stream_api_key
STREAM_SECRET_KEY=your_stream_secret_key

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# M-Pesa Configuration (For Production)
NEXT_PUBLIC_MPESA_CONSUMER_KEY=your_mpesa_consumer_key
NEXT_PUBLIC_MPESA_CONSUMER_SECRET=your_mpesa_consumer_secret
NEXT_PUBLIC_MPESA_SHORTCODE=your_business_shortcode
NEXT_PUBLIC_MPESA_PASSKEY=your_passkey
NEXT_PUBLIC_MPESA_BASE_URL=https://sandbox.safaricom.co.ke

# Payment Mode (Demo/Production)
NEXT_PUBLIC_MOCK_PAYMENT=true  # Set to false for real M-Pesa payments

# Application Base URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# WhatsApp Business API (Optional)
WHATSAPP_API_KEY=your_whatsapp_api_key
WHATSAPP_PHONE_ID=your_phone_id
```

> 📝 **Note**: See [ENV_CONFIGURATION.md](ENV_CONFIGURATION.md) for detailed environment variable documentation.

### 4. Firebase Setup

1. Create a new Firebase project
2. Enable Firestore Database
3. Create the following collections:
   - `appointments`
   - `doctors`
   - `prescriptions`
4. Set up Firebase security rules (see [FIREBASE_SETUP.md](FIREBASE_SETUP.md))

### 5. Run the Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🧪 Demo Mode

For development and testing without real M-Pesa payments:

1. Set `NEXT_PUBLIC_MOCK_PAYMENT=true` in `.env.local`
2. The app will simulate successful payments after 3 seconds
3. Appointments will be saved to Firestore with `paymentStatus: 'pending'`

See [DEMO_MODE_SETUP.md](DEMO_MODE_SETUP.md) for more details.

## 📁 Project Structure

```
telemedical-app/
├── app/
│   ├── (auth)/              # Authentication pages
│   │   ├── sign-in/
│   │   └── sign-up/
│   ├── (root)/              # Main application
│   │   ├── (home)/          # Patient-facing pages
│   │   │   ├── doctor/      # Doctor profiles
│   │   │   ├── medicationConfirm/
│   │   │   ├── paymentConfirm/
│   │   │   └── personal-room/
│   │   ├── admin/           # Admin dashboard
│   │   └── meeting/         # Video call pages
│   └── api/                 # API routes
│       ├── mpesa/           # M-Pesa integration
│       ├── prescriptions/   # Prescription handling
│       └── send-whatsapp/   # WhatsApp notifications
├── components/
│   ├── admin/               # Admin components
│   └── ui/                  # Reusable UI components
├── lib/
│   ├── appointments.ts      # Appointment management
│   ├── firebase.ts          # Firebase configuration
│   ├── mpesa.ts             # M-Pesa integration
│   └── utils.ts             # Utility functions
├── hooks/                   # Custom React hooks
├── actions/                 # Server actions
├── providers/               # Context providers
└── constants/               # App constants
```

## 🔒 Authentication

The app uses Clerk for authentication with the following features:

- Email/Password authentication
- Social login support (configurable)
- Protected routes via middleware
- Role-based access control (Patient, Doctor, Admin)

## 💳 Payment Integration

### M-Pesa STK Push Flow

1. Patient selects a doctor and appointment time
2. Enters M-Pesa phone number
3. Receives STK push prompt on phone
4. Enters M-Pesa PIN
5. Payment confirmation
6. Appointment saved to Firestore
7. Meeting link generated

### Payment Status Tracking

- Real-time payment verification
- Automatic retry mechanism
- 2-minute timeout with graceful fallback
- Rate limiting to respect API limits (5 requests/minute)

## 🎥 Video Calling

Powered by Stream Video React SDK:

- HD video quality
- Screen sharing
- Real-time chat
- Recording capabilities
- Virtual backgrounds
- Device settings control

## 📊 Database Schema

### Appointments Collection

```typescript
{
  patientId: string;
  patientName: string;
  patientEmail: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  appointmentDate: Timestamp;
  meetingId: string;
  meetingLink: string;
  description: string;
  paymentStatus: 'pending' | 'completed' | 'failed';
  status: 'scheduled' | 'completed' | 'cancelled';
  createdAt: Timestamp;
  phoneNumber?: string;
  amount?: number;
}
```

### Doctors Collection

```typescript
{
  id: string;
  name: string;
  specialty: string;
  image: string;
  rating: number;
  experience: string;
  availability: string[];
  consultationFee: number;
}
```

## 🛠️ Available Scripts

```bash
# Development
npm run dev          # Start development server

# Production
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
```

## 📱 Responsive Design

The app is fully responsive and works seamlessly across:

- 📱 Mobile devices (iOS & Android)
- 💻 Tablets
- 🖥️ Desktop browsers

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Import project to [Vercel](https://vercel.com)
3. Configure environment variables in Vercel dashboard
4. Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Math3wsl3vi/telemedical-app)

### Environment Variables for Production

Ensure all environment variables are set in your deployment platform:
- Set `NEXT_PUBLIC_MOCK_PAYMENT=false` for real payments
- Update `NEXT_PUBLIC_BASE_URL` to your production URL
- Use production M-Pesa credentials

## 🐛 Troubleshooting

### M-Pesa Error 2001
If you encounter M-Pesa authentication issues, see [MPESA_ERROR_2001_SOLUTION.md](MPESA_ERROR_2001_SOLUTION.md).

### Common Issues

1. **Payment timeout**: Check M-Pesa credentials and network connectivity
2. **Firebase permissions**: Verify Firestore security rules
3. **Video call not starting**: Ensure Stream API key is correct
4. **Authentication errors**: Check Clerk configuration

## 📚 Documentation

- [Complete Implementation Summary](IMPLEMENTATION_SUMMARY.md)
- [Environment Configuration Guide](ENV_CONFIGURATION.md)
- [Firebase Setup Instructions](FIREBASE_SETUP.md)
- [Demo Mode Setup](DEMO_MODE_SETUP.md)
- [Quick Reference Guide](QUICK_REFERENCE.md)

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Author

**Math3wsl3vi**

- GitHub: [@Math3wsl3vi](https://github.com/Math3wsl3vi)

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing framework
- [Stream](https://getstream.io/) for video SDK
- [Clerk](https://clerk.com/) for authentication
- [Firebase](https://firebase.google.com/) for database
- [Safaricom](https://developer.safaricom.co.ke/) for M-Pesa API
- [Radix UI](https://www.radix-ui.com/) for accessible components
- [Tailwind CSS](https://tailwindcss.com/) for styling

## 📞 Support

For support, email your-email@example.com or open an issue in the repository.

---

**Built with ❤️ for better healthcare access**
