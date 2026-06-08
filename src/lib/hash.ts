import { createHash } from "node:crypto";

export function stableHash(value: unknown) {
  return `0x${createHash("sha256").update(JSON.stringify(value)).digest("hex")}`;
}
