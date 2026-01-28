/**
 * Encryption utilities using Web Crypto API
 * Provides AES-GCM encryption with password-based key derivation (PBKDF2)
 */

const ALGORITHM = 'AES-GCM'
const KEY_LENGTH = 256
const ITERATIONS = 100000
const SALT_LENGTH = 16
const IV_LENGTH = 12

export interface EncryptedData {
  encrypted: true
  version: string
  salt: string
  iv: string
  data: string
}

/**
 * Check if the Web Crypto API is available
 */
export function isCryptoAvailable(): boolean {
  return typeof crypto !== 'undefined' && typeof crypto.subtle !== 'undefined'
}

/**
 * Derives a cryptographic key from a password using PBKDF2
 */
async function deriveKey(password: string, salt: BufferSource): Promise<CryptoKey> {
  if (!isCryptoAvailable()) {
    throw new Error('Web Crypto API is not available')
  }

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
      salt,
      iterations: ITERATIONS,
      hash: 'SHA-256',
    },
    passwordKey,
    { name: ALGORITHM, length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt']
  )
}

/**
 * Convert Uint8Array to base64 string (chunked for large arrays)
 */
function arrayToBase64(array: Uint8Array): string {
  const CHUNK_SIZE = 0x8000 // 32KB chunks
  let binary = ''
  for (let i = 0; i < array.length; i += CHUNK_SIZE) {
    const chunk = array.subarray(i, Math.min(i + CHUNK_SIZE, array.length))
    binary += String.fromCharCode(...chunk)
  }
  return btoa(binary)
}

/**
 * Convert base64 string to Uint8Array
 */
function base64ToArray(base64: string): Uint8Array {
  const binary = atob(base64)
  return Uint8Array.from(binary, (c) => c.charCodeAt(0))
}

/**
 * Encrypts data with a password
 * @param data - Data to encrypt (will be JSON stringified)
 * @param password - Password for encryption
 * @returns Encrypted data as JSON string
 */
export async function encrypt(data: unknown, password: string): Promise<string> {
  if (!isCryptoAvailable()) {
    throw new Error('Web Crypto API is not available')
  }

  if (!password) {
    throw new Error('Password is required for encryption')
  }

  try {
    // Generate random salt and IV
    const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH))
    const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH))

    // Derive key from password
    const key = await deriveKey(password, salt)

    // Convert data to string and then to array buffer
    const encoder = new TextEncoder()
    const dataString = JSON.stringify(data)
    const dataBuffer = encoder.encode(dataString)

    // Encrypt the data
    const encryptedBuffer = await crypto.subtle.encrypt(
      {
        name: ALGORITHM,
        iv,
      },
      key,
      dataBuffer
    )

    // Package encrypted data
    const encryptedData: EncryptedData = {
      encrypted: true,
      version: '1.0',
      salt: arrayToBase64(salt),
      iv: arrayToBase64(iv),
      data: arrayToBase64(new Uint8Array(encryptedBuffer)),
    }

    return JSON.stringify(encryptedData)
  } catch (error) {
    throw new Error(
      `Encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

/**
 * Decrypts data with a password
 * @param encryptedString - Encrypted data as JSON string
 * @param password - Password for decryption
 * @returns Decrypted data
 */
export async function decrypt(encryptedString: string, password: string): Promise<unknown> {
  if (!isCryptoAvailable()) {
    throw new Error('Web Crypto API is not available')
  }

  if (!password) {
    throw new Error('Password is required for decryption')
  }

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
    const salt = base64ToArray(encryptedData.salt)
    const iv = base64ToArray(encryptedData.iv)
    const encryptedBuffer = base64ToArray(encryptedData.data)

    // Derive key from password
    const key = await deriveKey(password, salt as BufferSource)

    // Decrypt the data
    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: ALGORITHM,
        iv: iv as BufferSource,
      },
      key,
      encryptedBuffer as BufferSource
    )

    // Convert buffer back to string and parse JSON
    const decoder = new TextDecoder()
    const decryptedString = decoder.decode(decryptedBuffer)
    return JSON.parse(decryptedString)
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('OperationError') || error.name === 'OperationError') {
        throw new Error('Incorrect password')
      }
      throw new Error(`Decryption failed: ${error.message}`)
    }
    throw new Error('Decryption failed: Unknown error')
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

/**
 * Generate a random password
 */
export function generatePassword(length: number = 16): string {
  if (!isCryptoAvailable()) {
    // Fallback to Math.random if crypto is not available
    console.warn('Web Crypto API not available, using less secure Math.random() fallback')
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
    let password = ''
    for (let i = 0; i < length; i++) {
      password += charset[Math.floor(Math.random() * charset.length)]
    }
    return password
  }

  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
  const array = new Uint8Array(length)
  crypto.getRandomValues(array)

  let password = ''
  for (let i = 0; i < length; i++) {
    password += charset[array[i] % charset.length]
  }

  return password
}
