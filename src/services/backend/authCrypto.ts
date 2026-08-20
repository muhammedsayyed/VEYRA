/**
 * Production Password Hashing & Session Token Security Module
 * Uses Web Crypto API (PBKDF2 with SHA-256 and salt) for secure password hashing.
 * Supports both Browser, Vercel Serverless (Node.js), and Edge runtimes.
 */

function getCrypto(): any {
  if (typeof globalThis.crypto !== 'undefined' && globalThis.crypto.subtle) {
    return globalThis.crypto;
  }
  try {
    const nodeCrypto = require('node:crypto');
    return nodeCrypto.webcrypto || nodeCrypto;
  } catch (e) {
    return globalThis.crypto;
  }
}

export async function hashPassword(password: string, saltHex?: string): Promise<{ hashHex: string; saltHex: string }> {
  const enc = new TextEncoder();
  const c = getCrypto();
  
  // Generate or parse 16-byte salt
  let salt: Uint8Array;
  if (saltHex) {
    salt = new Uint8Array(saltHex.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) || []);
  } else {
    salt = c.getRandomValues(new Uint8Array(16));
  }

  const keyMaterial = await c.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );

  const key = await c.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as unknown as BufferSource,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'HMAC', hash: 'SHA-256', length: 256 },
    true,
    ['sign', 'verify']
  );

  const exportedKey = await c.subtle.exportKey('raw', key);
  const hashArray = Array.from(new Uint8Array(exportedKey));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  const finalSaltHex = Array.from(salt).map((b) => b.toString(16).padStart(2, '0')).join('');

  return { hashHex, saltHex: finalSaltHex };
}

export async function verifyPassword(password: string, storedHashHex: string): Promise<boolean> {
  if (!storedHashHex || !storedHashHex.includes(':')) {
    return false;
  }
  const [saltHex, originalHashHex] = storedHashHex.split(':');
  const { hashHex } = await hashPassword(password, saltHex);
  return hashHex === originalHashHex;
}

export async function generateSessionToken(userId: string): Promise<string> {
  const payload = {
    userId,
    iat: Date.now(),
    exp: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
  };
  const enc = new TextEncoder();
  const c = getCrypto();
  const data = enc.encode(JSON.stringify(payload));
  const base64Payload = typeof Buffer !== 'undefined' ? Buffer.from(data).toString('base64') : btoa(String.fromCharCode(...new Uint8Array(data)));

  // HMAC Signature
  const secretKey = process.env.AUTH_SECRET || 'veyra_production_shared_auth_secret_key_2026';
  const key = await c.subtle.importKey(
    'raw',
    enc.encode(secretKey),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await c.subtle.sign('HMAC', key, enc.encode(base64Payload));
  const sigHex = Array.from(new Uint8Array(signature)).map((b) => b.toString(16).padStart(2, '0')).join('');

  return `${base64Payload}.${sigHex}`;
}

export async function verifySessionToken(token: string): Promise<string | null> {
  if (!token || !token.includes('.')) return null;

  try {
    const [base64Payload, sigHex] = token.split('.');
    const enc = new TextEncoder();
    const c = getCrypto();

    const secretKey = process.env.AUTH_SECRET || 'veyra_production_shared_auth_secret_key_2026';
    const key = await c.subtle.importKey(
      'raw',
      enc.encode(secretKey),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const sigBytes = new Uint8Array(sigHex.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) || []);
    const isValid = await c.subtle.verify('HMAC', key, sigBytes, enc.encode(base64Payload));

    if (!isValid) return null;

    const decodedString = typeof Buffer !== 'undefined' ? Buffer.from(base64Payload, 'base64').toString('utf8') : atob(base64Payload);
    const payloadJson = JSON.parse(decodedString);
    if (payloadJson.exp < Date.now()) return null;

    return payloadJson.userId || null;
  } catch {
    return null;
  }
}
