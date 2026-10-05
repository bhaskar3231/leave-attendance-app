import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getSession } from "@/lib/session";
import { AUTH_USERS } from "@/lib/mockData";

const MIN_LENGTH = 8;
const PASSWORD_RE = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).{8,}$/;

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    }

    const body = await req.json() as {
      currentPassword?: unknown;
      newPassword?: unknown;
    };

    const currentPassword = typeof body.currentPassword === "string" ? body.currentPassword : "";
    const newPassword     = typeof body.newPassword     === "string" ? body.newPassword     : "";

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Both fields are required." }, { status: 400 });
    }

    if (newPassword.length < MIN_LENGTH || !PASSWORD_RE.test(newPassword)) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters and include an uppercase letter, a number, and a special character." },
        { status: 400 }
      );
    }

    const user = AUTH_USERS.find((u) => u.id === session.sub);
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const currentValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!currentValid) {
      return NextResponse.json({ error: "Current password is incorrect." }, { status: 400 });
    }

    // Update in-memory store (replace with DB write in production)
    user.passwordHash = await bcrypt.hash(newPassword, 12);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
