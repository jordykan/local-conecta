/**
 * Web Push Protocol implementation for Deno
 * Based on RFC 8291 (Message Encryption) and RFC 8292 (VAPID)
 */

// Convert base64url to Uint8Array
export function base64UrlToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

// Convert Uint8Array to base64url
export function uint8ArrayToBase64Url(buffer: Uint8Array): string {
  const base64 = btoa(String.fromCharCode(...buffer))
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

// Create VAPID JWT token
export async function createVapidAuthToken(
  vapidPublicKey: string,
  vapidPrivateKey: string,
  audience: string
): Promise<string> {
  // JWT header
  const header = {
    typ: 'JWT',
    alg: 'ES256'
  }

  // JWT payload
  const payload = {
    aud: audience,
    exp: Math.floor(Date.now() / 1000) + 12 * 60 * 60, // 12 hours
    sub: 'mailto:noreply@localconecta.com'
  }

  // Encode header and payload
  const encoder = new TextEncoder()
  const headerB64 = uint8ArrayToBase64Url(encoder.encode(JSON.stringify(header)))
  const payloadB64 = uint8ArrayToBase64Url(encoder.encode(JSON.stringify(payload)))
  const unsignedToken = `${headerB64}.${payloadB64}`

  // Import private key for signing
  // VAPID keys: private is 32 bytes, public is 65 bytes (0x04 + x + y)
  const privateKeyBytes = base64UrlToUint8Array(vapidPrivateKey)
  const publicKeyBytes = base64UrlToUint8Array(vapidPublicKey)

  // Extract x and y coordinates from uncompressed public key
  // Format: 0x04 + x (32 bytes) + y (32 bytes)
  const x = publicKeyBytes.slice(1, 33)
  const y = publicKeyBytes.slice(33, 65)

  // Convert to JWK format for importKey
  const jwk = {
    kty: 'EC',
    crv: 'P-256',
    d: uint8ArrayToBase64Url(privateKeyBytes),
    x: uint8ArrayToBase64Url(x),
    y: uint8ArrayToBase64Url(y),
    ext: true
  }

  const cryptoKey = await crypto.subtle.importKey(
    'jwk',
    jwk,
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['sign']
  )

  // Sign the token
  const signature = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    cryptoKey,
    encoder.encode(unsignedToken)
  )

  const signatureB64 = uint8ArrayToBase64Url(new Uint8Array(signature))
  return `${unsignedToken}.${signatureB64}`
}

// Generate encryption keys for the message
export async function generateEncryptionKeys() {
  return await crypto.subtle.generateKey(
    { name: 'ECDH', namedCurve: 'P-256' },
    true,
    ['deriveBits']
  )
}

// Derive shared secret using ECDH
export async function deriveSharedSecret(
  localPrivateKey: CryptoKey,
  remotePublicKey: Uint8Array
): Promise<ArrayBuffer> {
  const publicKey = await crypto.subtle.importKey(
    'raw',
    remotePublicKey,
    { name: 'ECDH', namedCurve: 'P-256' },
    false,
    []
  )

  return await crypto.subtle.deriveBits(
    { name: 'ECDH', public: publicKey },
    localPrivateKey,
    256
  )
}

// HKDF implementation for key derivation
export async function hkdf(
  salt: Uint8Array,
  ikm: Uint8Array,
  info: Uint8Array,
  length: number
): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    'raw',
    ikm,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )

  const prk = new Uint8Array(
    await crypto.subtle.sign('HMAC', key, salt)
  )

  const prkKey = await crypto.subtle.importKey(
    'raw',
    prk,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )

  const infoAndCounter = new Uint8Array(info.length + 1)
  infoAndCounter.set(info)
  infoAndCounter[info.length] = 1

  const okm = new Uint8Array(
    await crypto.subtle.sign('HMAC', prkKey, infoAndCounter)
  )

  return okm.slice(0, length)
}

// Encrypt the push message payload
export async function encryptPayload(
  payload: string,
  userPublicKey: string,
  userAuth: string
): Promise<{ ciphertext: Uint8Array; salt: Uint8Array; publicKey: Uint8Array }> {
  const encoder = new TextEncoder()
  const plaintext = encoder.encode(payload)

  // Generate local key pair
  const localKeyPair = await generateEncryptionKeys()

  // Export local public key
  const rawLocalPublicKey = await crypto.subtle.exportKey('raw', localKeyPair.publicKey)
  const localPublicKey = new Uint8Array(rawLocalPublicKey)

  // Decode user keys
  const remotePublicKey = base64UrlToUint8Array(userPublicKey)
  const authSecret = base64UrlToUint8Array(userAuth)

  // Derive shared secret
  const sharedSecret = await deriveSharedSecret(localKeyPair.privateKey, remotePublicKey)

  // Generate random salt
  const salt = crypto.getRandomValues(new Uint8Array(16))

  // Create info strings for key derivation
  const keyInfo = encoder.encode('WebPush: info\0')
  const nonceInfo = encoder.encode('Content-Encoding: nonce\0')

  // Combine auth secret and shared secret
  const ikm = new Uint8Array(authSecret.length + sharedSecret.byteLength)
  ikm.set(authSecret)
  ikm.set(new Uint8Array(sharedSecret), authSecret.length)

  // Derive content encryption key and nonce
  const contentEncryptionKey = await hkdf(salt, ikm, keyInfo, 16)
  const nonce = await hkdf(salt, ikm, nonceInfo, 12)

  // Add padding to plaintext (at least 2 bytes)
  const paddingLength = 2
  const paddedPlaintext = new Uint8Array(plaintext.length + paddingLength)
  paddedPlaintext.set(plaintext)
  paddedPlaintext[plaintext.length] = 2 // Padding delimiter

  // Import key for AES-GCM encryption
  const encryptionKey = await crypto.subtle.importKey(
    'raw',
    contentEncryptionKey,
    { name: 'AES-GCM' },
    false,
    ['encrypt']
  )

  // Encrypt the message
  const ciphertext = new Uint8Array(
    await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: nonce },
      encryptionKey,
      paddedPlaintext
    )
  )

  return { ciphertext, salt, publicKey: localPublicKey }
}

// Send push notification
export interface PushSubscription {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}

export interface PushMessage {
  title: string
  body: string
  url: string
  tag?: string
  icon?: string
}

export async function sendPushNotification(
  subscription: PushSubscription,
  message: PushMessage,
  vapidPublicKey: string,
  vapidPrivateKey: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // ✅ iOS-compatible payload: FLAT structure, NO wrappers
    // Only include defined fields to ensure clean JSON
    const cleanPayload: Record<string, string> = {
      title: message.title,
      body: message.body,
      url: message.url
    }

    // Add optional fields only if defined
    if (message.tag) cleanPayload.tag = message.tag
    if (message.icon) cleanPayload.icon = message.icon

    const payload = JSON.stringify(cleanPayload)

    // 🔍 DEBUG: Log final payload structure (temporary)
    console.log('[Web Push] FINAL PUSH PAYLOAD:', payload)
    console.log('[Web Push] Endpoint type:', subscription.endpoint.includes('apple') ? 'iOS' : 'Other')

    // Encrypt the message payload
    const { ciphertext, salt, publicKey } = await encryptPayload(
      payload,
      subscription.keys.p256dh,
      subscription.keys.auth
    )

    // Extract audience from endpoint
    const url = new URL(subscription.endpoint)
    const audience = `${url.protocol}//${url.host}`

    // Create VAPID authentication token
    const vapidToken = await createVapidAuthToken(
      vapidPublicKey,
      vapidPrivateKey,
      audience
    )

    // Build the request body
    const body = ciphertext

    // Build headers
    const headers = new Headers({
      'Content-Type': 'application/octet-stream',
      'Content-Encoding': 'aes128gcm',
      'Content-Length': body.length.toString(),
      'TTL': '86400', // 24 hours
      'Authorization': `vapid t=${vapidToken}, k=${vapidPublicKey}`,
      'Crypto-Key': `dh=${uint8ArrayToBase64Url(publicKey)}`,
      'Encryption': `salt=${uint8ArrayToBase64Url(salt)}`
    })

    // Send the request
    const response = await fetch(subscription.endpoint, {
      method: 'POST',
      headers,
      body
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[Web Push] Failed to send:', response.status, errorText)
      return { success: false, error: `${response.status}: ${errorText}` }
    }

    return { success: true }
  } catch (error) {
    console.error('[Web Push] Error:', error)
    return { success: false, error: error.message }
  }
}
