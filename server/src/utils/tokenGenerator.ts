import crypto from 'crypto';

/**
 * Generates a cryptographically secure random token
 * @param length The length of the token (default: 32 bytes = 64 hex characters)
 * @returns A hex-encoded random token
 */
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Generates a URL-safe random token
 * @param length The length of the token in bytes (default: 32)
 * @returns A base64url-encoded random token
 */
export function generateUrlSafeToken(length: number = 32): string {
  return crypto
    .randomBytes(length)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Calculates token expiry date
 * @param days Number of days until expiry (default: 30)
 * @returns Date object representing the expiry time
 */
export function getTokenExpiry(days: number = 30): Date {
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + days);
  return expiry;
}
