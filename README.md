# P&P Conveyancing Companion

A mobile app for conveyancing cost calculations built with Expo and Tamagui.

## Features

- **Transfer Cost Calculator**: Calculate transfer duty, attorney fees, and disbursements
- **Bond Cost Calculator**: Calculate bond registration costs
- **Bond Repayment Calculator**: Calculate monthly payments and total interest
- **Lead Capture**: Send inquiries via WhatsApp
- **Firebase Integration**: Firebase Firestore for lead management
- **Express API Server**: Optional REST API for server-side calculations (see `server/` folder)

## Quick Start

```bash
# Install dependencies
npm install

# Start the development server
npx expo start

# Run on Android
npx expo start --android

# Run on iOS
npx expo start --ios

# Run on web
npx expo start --web
```

## Firebase Setup

1. Create a Firebase project at https://console.firebase.google.com
2. Enable Firestore Database
3. Copy your Firebase config and update `.env` file
4. (Optional) For server-side lead storage, set up Firebase Admin in the Express server (see `server/README.md`)

## Environment Variables

Copy `.env.example` to `.env` and update with your Firebase credentials:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=your-api-key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
EXPO_PUBLIC_FIREBASE_APP_ID=your-app-id
```

## Build for Production

```bash
# Install EAS CLI
npm install -g eas-cli

# Build Android APK
eas build -p android --profile preview

# Build for production
eas build -p android --profile release
```

## Testing Calculations

- **Transfer @ R2,000,000** should show **~R81,397.50** total
- **Bond @ R4,000,000** should show **~R69,464.00** total
- **Repayment @ R6,000,000, 10.5%, 20 years** should show **~R59,902.79** monthly

## Project Structure

```
├── app/                # Expo Router screens
├── components/         # Reusable UI components
├── config/            # Configuration JSON files
├── lib/               # Business logic and utilities
├── server/            # Express REST API (optional)
├── utils/             # Helper utilities (Firebase client)
└── assets/            # Images and fonts
```

## Express API Server

For server-side calculations and secure lead storage:

```bash
cd server
npm install
# Set Firebase Admin credentials (see server/README.md)
npm start
```

The server runs on `http://localhost:3001` with endpoints:
- `POST /v1/calculate` - Server-side calculations
- `POST /v1/leads` - Save leads to Firestore

## GitHub Actions CI

There is a basic GitHub Actions workflow at `.github/workflows/ci.yml` that:

- Installs dependencies with caching
- Runs TypeScript checks (`npx tsc --noEmit`)
- Runs Jest tests (if you add them to `package.json`)
- Optionally installs and validates the `server/` dependencies
- Optionally runs a web prebuild when `EXPO_TOKEN` is set as a repo secret

Secrets to add to your repository (if you want to run server tests or Expo builds):

- `FIREBASE_SERVICE_ACCOUNT_JSON` — JSON string of the service account (for server tests that use Firebase Admin)
- `EXPO_TOKEN` — Expo token for prebuild or EAS builds from CI

To enable builds you will need to configure your environment in GitHub settings and optionally add a test script to `package.json`.