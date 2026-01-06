const crypto = require('crypto');

function sendJson(res, statusCode, body) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}

function safeEqual(a, b) {
  const aBuf = Buffer.from(String(a ?? ''), 'utf8');
  const bBuf = Buffer.from(String(b ?? ''), 'utf8');
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
}

function base64UrlEncode(input) {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(input, 'utf8');
  return buf
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function signToken(payload, secret) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signingInput = `${encodedHeader}.${encodedPayload}`;
  const signature = crypto
    .createHmac('sha256', secret)
    .update(signingInput)
    .digest();
  const encodedSig = base64UrlEncode(signature);
  return `${signingInput}.${encodedSig}`;
}

module.exports = function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return sendJson(res, 405, { error: 'method-not-allowed' });
  }

  const expectedUser = process.env.ADMIN_DASH_USERNAME;
  const expectedPass = process.env.ADMIN_DASH_PASSWORD;
  const jwtSecret = process.env.ADMIN_JWT_SECRET;

  if (!expectedUser || !expectedPass || !jwtSecret) {
    return sendJson(res, 500, {
      error: 'admin-config-missing',
      message: 'Missing ADMIN_DASH_USERNAME, ADMIN_DASH_PASSWORD, or ADMIN_JWT_SECRET env vars.'
    });
  }

  let raw = '';
  req.on('data', (chunk) => {
    raw += chunk;
    if (raw.length > 10_000) {
      // prevent abuse
      raw = '';
      req.destroy();
    }
  });

  req.on('end', () => {
    try {
      const body = raw ? JSON.parse(raw) : {};
      const { username, password } = body || {};

      const okUser = safeEqual(username, expectedUser);
      const okPass = safeEqual(password, expectedPass);

      if (!okUser || !okPass) {
        return sendJson(res, 401, { error: 'invalid-credentials' });
      }

      const now = Math.floor(Date.now() / 1000);
      const exp = now + 60 * 60 * 24 * 7; // 7 days
      const token = signToken({ sub: 'admin-dashboard', iat: now, exp }, jwtSecret);

      return sendJson(res, 200, { token, exp });
    } catch (e) {
      return sendJson(res, 400, { error: 'invalid-json' });
    }
  });
};
