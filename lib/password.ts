import { scryptSync } from "crypto";

export function hashPassword(password: string): string {
  return scryptSync(password, "salt", 32).toString("hex");
}
