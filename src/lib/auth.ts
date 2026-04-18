import { createHash, randomUUID } from "crypto";

/**
 * Hash a password using SHA-256.
 * Simple MVP utility — not production-grade auth.
 */
export function hashPassword(password: string): string {
  return createHash("sha256").update(password).digest("hex");
}

/**
 * Verify a password against its SHA-256 hash.
 */
export function verifyPassword(password: string, hash: string): boolean {
  const computed = hashPassword(password);
  return computed === hash;
}

/**
 * Generate a random token using crypto.randomUUID().
 */
export function generateToken(): string {
  return randomUUID();
}
