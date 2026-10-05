// Edge-compatible JWT verify — imports only the jwt/verify subpath of jose
// which has no Node.js-only dependencies (no CompressionStream/DecompressionStream).

import { jwtVerify } from "jose/jwt/verify";
import type { SessionPayload } from "./authTypes";

function getEdgeSecret(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    return new TextEncoder().encode("dev-only-secret-change-in-prod-!!!");
  }
  return new TextEncoder().encode(secret);
}

export async function verifyTokenEdge(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getEdgeSecret(), {
      algorithms: ["HS256"],
    });
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}
