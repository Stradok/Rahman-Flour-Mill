import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

const KEY_LENGTH = 64;
const SALT_BYTES = 16;

/** Format: "<hex salt>:<hex scrypt hash>" — a unique random salt per password. */
export function hashPassword(password: string): string {
  const salt = randomBytes(SALT_BYTES).toString("hex");
  const hash = scryptSync(password, salt, KEY_LENGTH).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  try {
    if (!stored.includes(":")) {
      // Legacy format from early builds: scrypt with a fixed salt and no
      // separator. Still verifiable so accounts created before the upgrade
      // keep working.
      const legacy = scryptSync(password, "salt", 32);
      const storedBuf = Buffer.from(stored, "hex");
      return storedBuf.length === legacy.length && timingSafeEqual(storedBuf, legacy);
    }
    const [salt, hashHex] = stored.split(":");
    const expected = Buffer.from(hashHex, "hex");
    const actual = scryptSync(password, salt, expected.length);
    return timingSafeEqual(expected, actual);
  } catch {
    return false;
  }
}
