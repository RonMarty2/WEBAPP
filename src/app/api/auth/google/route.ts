import { NextResponse } from "next/server";
import { buildGoogleAuthUrl } from "@/lib/auth";

export async function GET(req: Request) {
  const host = req.headers.get("host") ?? "localhost:3000";
  const protocol = host.startsWith("localhost") ? "http" : "https";
  const redirectUri = `${protocol}://${host}/api/auth/callback/google`;
  return NextResponse.redirect(buildGoogleAuthUrl(redirectUri));
}
