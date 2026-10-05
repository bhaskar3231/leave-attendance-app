import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { AUTH_USERS } from "@/lib/mockData";
import { createSession } from "@/lib/session";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { email?: unknown; password?: unknown };

    // ─── Input validation ───────────────────────────────────────────────────
    const email    = typeof body.email    === "string" ? body.email.trim().toLowerCase()    : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    // ─── Look up user ───────────────────────────────────────────────────────
    // Constant-time lookup to prevent user enumeration timing attacks
    const user = AUTH_USERS.find((u) => u.email.toLowerCase() === email);

    // Always run bcrypt.compare even when user is not found (dummy hash)
    // This prevents timing-based user enumeration.
    const dummyHash = "$2b$12$invalidhashusedtopreventtimingattacks00000000000000000000";
    const hashToCompare = user ? user.passwordHash : dummyHash;
    const passwordValid = await bcrypt.compare(password, hashToCompare);

    if (!user || !passwordValid || !user.isActive) {
      // Generic message — never reveal whether email or password was wrong
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    // ─── Create session ─────────────────────────────────────────────────────
    await createSession({
      sub:        user.id,
      email:      user.email,
      name:       user.name,
      role:       user.role,
      employeeId: user.id,
    });

    // Return public user info only — never the hash
    return NextResponse.json({
      user: {
        id:         user.id,
        name:       user.name,
        email:      user.email,
        role:       user.role,
        department: user.department,
        position:   user.position,
        avatar:     user.avatar,
      },
    });
  } catch {
    // Never expose internal error detail
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
