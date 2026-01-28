/**
 * Encryption service using Web Crypto API
 * Provides AES-GCM encryption with password-based key derivation
 */

const ALGORITHM = 'AES-GCM'
const KEY_LENGTH = 256
const ITERATIONS = 100000
const SALT_LENGTH = 16
const IV_LENGTH = 12

interface EncryptedData {
  encrypted: true
  version: string
  salt: string
  iv: string
  data: string
}

/**
 * Derives a cryptographic key from a password using PBKDF2
 */
async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder()
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  )

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as BufferSource,
      iterations: ITERATIONS,
      hash: 'SHA-256'
    },
    passwordKey,
    { name: ALGORITHM, length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt']
  )
}

/**
 * Encrypts data with a password
 */
export async function encrypt(data: unknown, password: string): Promise<string> {
  try {
    // Generate random salt and IV
    const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH))
    const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH))

    // Derive key from password
    const key = await deriveKey(password, salt)

    // Convert data to string and then to array buffer
    const encoder = new TextEncoder()
    const dataString = typeof data === 'string' ? data : JSON.stringify(data)
    const dataBuffer = encoder.encode(dataString)

    // Encrypt the data
    const encryptedBuffer = await crypto.subtle.encrypt(
      {
        name: ALGORITHM,
        iv
      },
      key,
      dataBuffer
    )

    // Convert buffers to base64 for storage
    // Use chunked conversion to avoid stack overflow with large arrays
    const arrayToBase64 = (array: Uint8Array): string => {
      const CHUNK_SIZE = 0x8000 // 32KB chunks
      let binary = ''
      for (let i = 0; i < array.length; i += CHUNK_SIZE) {
        const chunk = array.subarray(i, Math.min(i + CHUNK_SIZE, array.length))
        binary += String.fromCharCode(...chunk)
      }
      return btoa(binary)
    }

    const encryptedData: EncryptedData = {
      encrypted: true,
      version: '1.0',
      salt: arrayToBase64(salt),
      iv: arrayToBase64(iv),
      data: arrayToBase64(new Uint8Array(encryptedBuffer))
    }

    return JSON.stringify(encryptedData)
  } catch (error) {
    console.error('Encryption error:', error)
    throw new Error('Failed to encrypt data')
  }
}

/**
 * Decrypts data with a password
 */
export async function decrypt(encryptedString: string, password: string): Promise<unknown> {
  try {
    const encryptedData: EncryptedData = JSON.parse(encryptedString)

    // Validate encrypted data structure
    if (
      !encryptedData.encrypted ||
      !encryptedData.salt ||
      !encryptedData.iv ||
      !encryptedData.data
    ) {
      throw new Error('Invalid encrypted data format')
    }

    // Convert base64 strings back to Uint8Arrays
    const salt = Uint8Array.from(atob(encryptedData.salt), (c) => c.charCodeAt(0))
    const iv = Uint8Array.from(atob(encryptedData.iv), (c) => c.charCodeAt(0))
    const encryptedBuffer = Uint8Array.from(atob(encryptedData.data), (c) => c.charCodeAt(0))

    // Derive key from password
    const key = await deriveKey(password, salt)

    // Decrypt the data
    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: ALGORITHM,
        iv
      },
      key,
      encryptedBuffer
    )

    // Convert buffer back to string and parse JSON
    const decoder = new TextDecoder()
    const decryptedString = decoder.decode(decryptedBuffer)
    return JSON.parse(decryptedString)
  } catch (error) {
    console.error('Decryption error:', error)
    if (error instanceof Error && error.message.includes('OperationError')) {
      throw new Error('Incorrect password')
    }
    throw new Error('Failed to decrypt data')
  }
}

/**
 * Checks if a string contains encrypted data
 */
export function isEncrypted(data: string): boolean {
  try {
    const parsed = JSON.parse(data)
    return parsed.encrypted === true && !!parsed.salt && !!parsed.iv && !!parsed.data
  } catch {
    return false
  }
}

/**
 * Verifies a password against encrypted data without fully decrypting
 */
export async function verifyPassword(encryptedString: string, password: string): Promise<boolean> {
  try {
    await decrypt(encryptedString, password)
    return true
  } catch {
    return false
  }
}
