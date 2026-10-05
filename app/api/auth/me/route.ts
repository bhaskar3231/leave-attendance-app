import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { AUTH_USERS } from "@/lib/mockData";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  // Re-fetch from store so profile changes are reflected
  const user = AUTH_USERS.find((u) => u.id === session.sub);
  if (!user || !user.isActive) {
    return NextResponse.json({ error: "User not found or inactive." }, { status: 401 });
  }

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
}
