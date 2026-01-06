const crypto = require('crypto');

function sendJson(res, statusCode, body) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}

function base64UrlDecodeToString(input) {
  const normalized = String(input)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  const pad = normalized.length % 4;
  const padded = pad ? normalized + '='.repeat(4 - pad) : normalized;
  return Buffer.from(padded, 'base64').toString('utf8');
}

function base64UrlEncode(input) {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(input, 'utf8');
  return buf
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function verifyToken(token, secret) {
  const parts = String(token || '').split('.');
  if (parts.length !== 3) return { ok: false, error: 'malformed-token' };

  const [encodedHeader, encodedPayload, encodedSig] = parts;
  const signingInput = `${encodedHeader}.${encodedPayload}`;
  const expectedSig = crypto.createHmac('sha256', secret).update(signingInput).digest();
  const expectedSigEncoded = base64UrlEncode(expectedSig);

  // timing-safe compare of strings
  const a = Buffer.from(expectedSigEncoded, 'utf8');
  const b = Buffer.from(encodedSig, 'utf8');
  if (a.length !== b.length) return { ok: false, error: 'bad-signature' };
  if (!crypto.timingSafeEqual(a, b)) return { ok: false, error: 'bad-signature' };

  let payload;
  try {
    payload = JSON.parse(base64UrlDecodeToString(encodedPayload));
  } catch {
    return { ok: false, error: 'bad-payload' };
  }

  const now = Math.floor(Date.now() / 1000);
  if (!payload?.exp || now >= payload.exp) return { ok: false, error: 'expired' };
  if (payload?.sub !== 'admin-dashboard') return { ok: false, error: 'wrong-subject' };

  return { ok: true, payload };
}

module.exports = function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return sendJson(res, 405, { error: 'method-not-allowed' });
  }

  const jwtSecret = process.env.ADMIN_JWT_SECRET;
  if (!jwtSecret) {
    return sendJson(res, 500, {
      error: 'admin-config-missing',
      message: 'Missing ADMIN_JWT_SECRET env var.'
    });
  }

  let raw = '';
  req.on('data', (chunk) => {
    raw += chunk;
    if (raw.length > 10_000) {
      raw = '';
      req.destroy();
    }
  });

  req.on('end', () => {
    try {
      const body = raw ? JSON.parse(raw) : {};
      const token = body?.token;
      const result = verifyToken(token, jwtSecret);
      if (!result.ok) return sendJson(res, 401, { error: result.error });
      return sendJson(res, 200, { ok: true });
    } catch {
      return sendJson(res, 400, { error: 'invalid-json' });
    }
  });
};
