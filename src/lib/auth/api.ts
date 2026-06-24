import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/supabase/server";

export async function requireApiAuth() {
  if (process.env.DEMO_MODE === "true") {
    return { id: "demo-user" };
  }

  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return user;
}
