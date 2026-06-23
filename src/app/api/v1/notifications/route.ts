import { NextResponse } from "next/server";
import { getNotifications, markNotificationsRead } from "@/lib/services/proposals/repository";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const unreadOnly = searchParams.get("unread") === "true";
  return NextResponse.json({ notifications: getNotifications(unreadOnly) });
}

export async function PATCH(request: Request) {
  const body = await request.json().catch(() => ({}));
  markNotificationsRead(body.ids);
  return NextResponse.json({ success: true });
}
