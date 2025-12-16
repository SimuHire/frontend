import { NextResponse } from "next/server";
import { auth0, getAccessToken } from "@/lib/auth0";

export async function GET() {
  const session = await auth0.getSession();
  if (!session) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  const token = await getAccessToken();
  return NextResponse.json({ accessToken: token });
}
