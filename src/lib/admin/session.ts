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

const attempts = new Map<string, { n: number; until: number }>();
export function tooManyAttempts(ip: string) {
  const a = attempts.get(ip);
  return !!a && a.n >= 5 && a.until > Date.now();
}
export function recordFailure(ip: string) {
  const a = attempts.get(ip);
  const fresh = !a || a.until < Date.now();
  attempts.set(ip, { n: fresh ? 1 : a!.n + 1, until: Date.now() + 15 * 60_000 });
}
export const clearFailures = (ip: string) => attempts.delete(ip);
