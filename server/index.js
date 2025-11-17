const express = require('express');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin
function initFirebaseAdmin() {
  if (admin.apps.length) return admin.app();
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (serviceAccountJson) {
    const serviceAccount = JSON.parse(serviceAccountJson);
    return admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  }
  const keyFile = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (keyFile && fs.existsSync(keyFile)) {
    return admin.initializeApp({ credential: admin.credential.cert(require(keyFile)) });
  }
  console.warn('Firebase admin not initialized: set FIREBASE_SERVICE_ACCOUNT_JSON or GOOGLE_APPLICATION_CREDENTIALS');
  return null;
}

const duty = require('./lib/duty');
const fees = require('./lib/fees');
const repayment = require('./lib/repayment');

const app = express();
app.use(bodyParser.json());

const db = initFirebaseAdmin();

// load config JSONs from project folder
function loadConfig(name) {
  try {
    const p = path.join(__dirname, '..', 'config', name + '.json');
    return require(p);
  } catch (err) {
    return null;
  }
}

app.post('/v1/calculate', (req, res) => {
  const { type, inputs } = req.body || {};
  if (!type) return res.status(400).json({ error: 'type is required' });

  try {
    if (type === 'transfer') {
      const cfg = loadConfig('duty.za');
      const amount = Number(inputs?.price || 0);
      const brackets = cfg?.brackets || [];
      const dutyAmount = duty.calcTransferDuty(amount, brackets);
      return res.json({ type, duty: dutyAmount });
    }
    if (type === 'bond') {
      // Example: use tiered fee logic
      const cfg = loadConfig('fees.bond');
      const amount = Number(inputs?.bondAmount || 0);
      const fee = fees.tieredFee(amount, cfg?.tiers || []);
      return res.json({ type, fee });
    }
    if (type === 'repayment') {
      const principal = Number(inputs?.principal || 0);
      const rate = Number(inputs?.annualRatePct || 0);
      const years = Number(inputs?.years || 20);
      const result = repayment.monthlyRepayment(principal, rate, years);
      return res.json({ type, result });
    }
    return res.status(400).json({ error: 'unknown type' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'server error' });
  }
});

app.post('/v1/leads', async (req, res) => {
  const payload = req.body || {};
  if (!db) return res.status(500).json({ error: 'firebase admin not initialized' });
  try {
    const doc = await admin.firestore().collection('leads').add({ ...payload, createdAt: admin.firestore.FieldValue.serverTimestamp() });
    return res.json({ id: doc.id });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'failed to save lead' });
  }
});

const port = process.env.PORT || 3001;
app.listen(port, () => console.log('Server listening on', port));
