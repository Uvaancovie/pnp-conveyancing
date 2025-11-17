# PnP Conveyancing Server

Express REST API for conveyancing calculations using Firebase Admin.

## Setup

1. Install dependencies:
```bash
cd server
npm install
```

2. Configure Firebase Admin credentials:

**Option A: Service Account JSON (recommended for local dev)**
```bash
# Set the JSON content directly as an environment variable
set FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"your-project",...}
```

**Option B: Service Account Key File**
```bash
# Download service account key from Firebase Console
# Set path to the key file
set GOOGLE_APPLICATION_CREDENTIALS=path\to\serviceAccountKey.json
```

3. Start the server:
```bash
npm start
# or for development with auto-reload
npm run dev
```

Server runs on `http://localhost:3001`

## API Endpoints

### POST /v1/calculate

Calculate conveyancing costs.

**Transfer Calculation:**
```bash
curl -X POST http://localhost:3001/v1/calculate \
  -H "Content-Type: application/json" \
  -d "{\"type\":\"transfer\",\"inputs\":{\"price\":2500000}}"
```

**Bond Calculation:**
```bash
curl -X POST http://localhost:3001/v1/calculate \
  -H "Content-Type: application/json" \
  -d "{\"type\":\"bond\",\"inputs\":{\"bondAmount\":2000000}}"
```

**Repayment Calculation:**
```bash
curl -X POST http://localhost:3001/v1/calculate \
  -H "Content-Type: application/json" \
  -d "{\"type\":\"repayment\",\"inputs\":{\"principal\":2000000,\"annualRatePct\":11.5,\"years\":20}}"
```

### POST /v1/leads

Save a lead to Firestore.

```bash
curl -X POST http://localhost:3001/v1/leads \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"John Doe\",\"phone\":\"+27123456789\",\"calculationType\":\"transfer\",\"amount\":2500000}"
```

## Environment Variables

- `PORT` - Server port (default: 3001)
- `FIREBASE_SERVICE_ACCOUNT_JSON` - Firebase service account JSON (option A)
- `GOOGLE_APPLICATION_CREDENTIALS` - Path to service account key file (option B)

## Deploy

Deploy to your preferred platform:

- **Heroku**: `git push heroku main`
- **Railway**: Connect GitHub repo
- **Google Cloud Run**: `gcloud run deploy`
- **Vercel**: Add as serverless functions
