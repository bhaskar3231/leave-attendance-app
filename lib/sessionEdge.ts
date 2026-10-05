// Edge-compatible JWT verify — no Node.js-only APIs.
// Uses the universal jose build (works in both Edge and Node runtimes).

import { jwtVerify } from "jose";
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
