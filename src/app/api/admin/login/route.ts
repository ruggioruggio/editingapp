import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE, adminConfigured, checkPassword, clearFailures, clientIp, hashIp, isAdminSession, newSessionValue, recordFailure, tooManyAttempts } from "@/lib/admin/session";
import { getServiceSupabase } from "@/lib/supabase/service";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({ ok: await isAdminSession(), configured: adminConfigured(), database: !!getServiceSupabase() });
}

export async function POST(req: NextRequest) {
  if (!adminConfigured()) return NextResponse.json({ error: "Pannello admin non configurato sul server" }, { status: 503 });
  const ip = clientIp(req.headers);
  // security events go to the audit log with a pseudonymized IP only
  const audit = (action: string) => getServiceSupabase()?.from("admin_log").insert({ action, actor: "admin_panel", ip_hash: hashIp(ip), details: {} });
  if (tooManyAttempts(ip)) {
    await audit("admin_login_blocked");
    return NextResponse.json({ error: "Troppi tentativi. Riprova tra 15 minuti." }, { status: 429 });
  }
  const body = (await req.json().catch(() => ({}))) as { password?: unknown };
  const password = typeof body.password === "string" ? body.password : "";
  if (!password || password.length > 200 || !checkPassword(password)) {
    recordFailure(ip);
    await audit("admin_login_failed");
    return NextResponse.json({ error: "Password sbagliata" }, { status: 401 });
  }
  clearFailures(ip);
  await audit("admin_login");
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
