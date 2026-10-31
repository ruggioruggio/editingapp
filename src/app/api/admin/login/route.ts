import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE, adminConfigured, checkPassword, clearFailures, isAdminSession, newSessionValue, recordFailure, tooManyAttempts } from "@/lib/admin/session";
import { getServiceSupabase } from "@/lib/supabase/service";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({ ok: await isAdminSession(), configured: adminConfigured(), database: !!getServiceSupabase() });
}

export async function POST(req: NextRequest) {
  if (!adminConfigured()) return NextResponse.json({ error: "Pannello admin non configurato sul server" }, { status: 503 });
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (tooManyAttempts(ip)) return NextResponse.json({ error: "Troppi tentativi. Riprova tra 15 minuti." }, { status: 429 });
  const body = (await req.json().catch(() => ({}))) as { password?: unknown };
  const password = typeof body.password === "string" ? body.password : "";
  if (!password || password.length > 200 || !checkPassword(password)) {
    recordFailure(ip);
    return NextResponse.json({ error: "Password sbagliata" }, { status: 401 });
  }
  clearFailures(ip);
  const { value, maxAge } = newSessionValue();
  const res = NextResponse.json({ ok: true, database: !!getServiceSupabase() });
  res.cookies.set(ADMIN_COOKIE, value, { httpOnly: true, sameSite: "strict", secure: process.env.NODE_ENV === "production", path: "/api/admin", maxAge });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, "", { path: "/api/admin", maxAge: 0 });
  return res;
}
