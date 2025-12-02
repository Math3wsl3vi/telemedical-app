# Firebase Setup Guide

This project has been migrated from Supabase to Firebase. Follow these steps to set up Firebase:

## Prerequisites

1. Create a Firebase project at [https://console.firebase.google.com](https://console.firebase.google.com)
2. Make sure you have Node.js installed

## Configuration Steps

### 1. Get Firebase Credentials

1. Go to **Firebase Console** → Select your project
2. Click on **Settings** (gear icon) → **Project settings**
3. Go to the **General** tab
4. Scroll down to find your **Web API Key**
5. Copy the following values:
   - `apiKey` → `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `authDomain` → `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `projectId` → `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `storageBucket` → `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `messagingSenderId` → `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `appId` → `NEXT_PUBLIC_FIREBASE_APP_ID`

### 2. Create .env.local File

Create a `.env.local` file in the root directory with the following content:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 3. Set Up Firestore Database

1. In Firebase Console → **Firestore Database**
2. Click **Create database**
3. Start in **Production mode**
4. Choose your preferred region

### 4. Create Collections

Create the following collections in Firestore:

#### `doctors` collection
Fields:
- `name` (string) - Doctor's name
- `specialty` (string) - Medical specialty
- `email` (string) - Email address
- `license_url` (string, optional) - Link to license file
- `is_verified` (boolean) - Verification status
- `created_at` (timestamp) - Creation date

#### `appointments` collection
Fields:
- `doctor_id` (string) - Reference to doctor
- `patient_name` (string) - Patient name
- `appointment_date` (string) - Date/time of appointment
- `amount` (number) - Consultation fee
- `status` (string) - Appointment status (pending, completed, cancelled)
- `doctor_name` (string) - Doctor's name (denormalized for easy querying)

#### `prescriptions` collection (optional)
Fields:
- `appointment_id` (string) - Reference to appointment
- `medication_name` (string) - Name of medication
- `dosage` (string) - Dosage information
- `frequency` (string) - How often to take
- `duration` (string) - How long to take for
- `notes` (string, optional) - Special instructions
- `created_at` (timestamp) - Creation date

### 5. Set Up Firebase Storage

1. In Firebase Console → **Storage**
2. Click **Get started**
3. Accept the default security rules
4. Choose your preferred region

### 6. Configure Security Rules

#### Firestore Rules

```rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow reading doctors
    match /doctors/{document=**} {
      allow read: if true;
      allow write: if false; // Restrict doctor creation to admin
    }
    
    // Allow reading appointments
    match /appointments/{document=**} {
      allow read: if true;
      allow write: if false; // Restrict appointment creation
    }
    
    // Allow reading and writing prescriptions
    match /prescriptions/{document=**} {
      allow read: if true;
      allow write: if true; // Consider restricting based on auth
    }
  }
}
```

#### Storage Rules

```rules
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /licenses/{allPaths=**} {
      allow read, write: if true; // Consider restricting based on auth
    }
  }
}
```

## Updated Files

The following files have been updated to use Firebase:

- `lib/firebase.ts` - Firebase configuration (new file)
- `app/api/upload/route.ts` - Updated to use Firebase Storage
- `components/admin/AppointmentTable.tsx` - Updated to fetch from Firestore
- `components/admin/DoctorForm.tsx` - Updated to save to Firestore
- `app/(root)/admin/doctors/page.tsx` - Updated to use Firestore

## Removed Files

- `lib/supabase.ts` - Removed (no longer needed)

## Testing

1. Install dependencies: `npm install`
2. Create `.env.local` with your Firebase credentials
3. Run development server: `npm run dev`
4. Visit `http://localhost:3000`

## Migration from Supabase

If you had existing data in Supabase:
1. Export your data from Supabase
2. Write a script to import it into Firestore using the Firebase Admin SDK
3. Verify data integrity after import

## Troubleshooting

### "Firebase configuration error"
- Ensure all environment variables in `.env.local` are correctly set
- Make sure `NEXT_PUBLIC_` prefix is present for client-side variables

### "Permission denied" errors
- Check your Firestore security rules
- Ensure you're using the correct collection names
- Verify your Firebase project has the collections created

### "File upload fails"
- Check Firebase Storage is enabled in your project
- Verify storage security rules allow uploads
- Ensure the file type is PDF

## Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Firebase Storage Documentation](https://firebase.google.com/docs/storage)
- [Next.js Firebase Integration](https://nextjs.org/docs/guides/using-firebase)
