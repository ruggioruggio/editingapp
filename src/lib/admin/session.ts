import "server-only";
import { createHmac, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "sq_admin";
const SESSION_HOURS = 6;

export function adminConfigured() {
  return Boolean(process.env.ADMIN_PASSWORD_HASH && process.env.ADMIN_SESSION_SECRET);
}

export function checkPassword(password: string): boolean {
  const stored = process.env.ADMIN_PASSWORD_HASH ?? "";
  const [algo, saltHex, hashHex] = stored.split(":");
  if (algo !== "scrypt" || !saltHex || !hashHex) return false;
  const expected = Buffer.from(hashHex, "hex");
  const got = scryptSync(password, Buffer.from(saltHex, "hex"), expected.length);
  return timingSafeEqual(got, expected);
}

const sign = (payload: string) => createHmac("sha256", process.env.ADMIN_SESSION_SECRET ?? "").update(payload).digest("hex");

export function newSessionValue() {
  const exp = String(Date.now() + SESSION_HOURS * 3600_000);
  return { value: `${exp}.${sign(exp)}`, maxAge: SESSION_HOURS * 3600 };
}

export async function isAdminSession(): Promise<boolean> {
  if (!adminConfigured()) return false;
  const raw = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!raw) return false;
  const [exp, sig] = raw.split(".");
  if (!exp || !sig || Number(exp) < Date.now()) return false;
  const want = Buffer.from(sign(exp), "hex");
  const have = Buffer.from(sig, "hex");
  return want.length === have.length && timingSafeEqual(want, have);
}

// Per-IP limit plus a global one: X-Forwarded-For can be forged or rotated, the global cap cannot.
const WINDOW_MS = 15 * 60_000;
const PER_IP = 5;
const GLOBAL = 25;
const attempts = new Map<string, { n: number; until: number }>();
let globalFails: number[] = [];

export function tooManyAttempts(ip: string) {
  const now = Date.now();
  globalFails = globalFails.filter((t) => now - t < WINDOW_MS);
  if (globalFails.length >= GLOBAL) return true;
  const a = attempts.get(ip);
  return !!a && a.n >= PER_IP && a.until > now;
}
export function recordFailure(ip: string) {
  const now = Date.now();
  globalFails.push(now);
  if (attempts.size > 5000) for (const [k, v] of attempts) if (v.until < now) attempts.delete(k);
  const a = attempts.get(ip);
  const fresh = !a || a.until < now;
  attempts.set(ip, { n: fresh ? 1 : a!.n + 1, until: now + WINDOW_MS });
}
export const clearFailures = (ip: string) => attempts.delete(ip);
