import { NextResponse, type NextRequest } from "next/server";
import { isAdminSession } from "@/lib/admin/session";
import { getServiceSupabase } from "@/lib/supabase/service";

export const runtime = "nodejs";

// Azioni del pannello admin. Ogni chiamata verifica il cookie di sessione e
// solo dopo usa la chiave service_role; ogni modifica finisce nel registro.

const FOREVER = "9999-12-31T00:00:00Z";
const until = (days: unknown) => (typeof days === "number" && days > 0 ? new Date(Date.now() + days * 86_400_000).toISOString() : FOREVER);
const str = (v: unknown, max = 200) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export async function POST(req: NextRequest) {
  if (!(await isAdminSession())) return NextResponse.json({ error: "Sessione admin scaduta: inserisci di nuovo la password" }, { status: 401 });
  const sb = getServiceSupabase();
  if (!sb) return NextResponse.json({ error: "Manca SUPABASE_SERVICE_ROLE_KEY nel server: le azioni sugli utenti non sono disponibili" }, { status: 503 });
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const action = str(body.action, 40);
  const log = (target: string | null, details: Record<string, unknown> = {}) => sb.from("admin_log").insert({ action, target, details });
  const idOf = async (username: string) => {
    const { data } = await sb.from("profiles").select("id").eq("username", username.toLowerCase().replace(/^@/, "")).maybeSingle<{ id: string }>();
    return data?.id ?? null;
  };
  const userId = str(body.userId, 64);

  try {
    switch (action) {
      case "stats": {
        const now = new Date().toISOString();
        const [users, banned, pro, msgs] = await Promise.all([
          sb.from("profiles").select("id", { count: "exact", head: true }),
          sb.from("profiles").select("id", { count: "exact", head: true }).gt("banned_until", now),
          sb.from("profiles").select("id", { count: "exact", head: true }).gt("pro_until", now),
          sb.from("messages").select("id", { count: "exact", head: true }),
        ]);
        return NextResponse.json({ users: users.count ?? 0, banned: banned.count ?? 0, pro: pro.count ?? 0, messages: msgs.count ?? 0 });
      }
      case "search": {
        const q = str(body.q, 40).replace(/^@/, "").replace(/[%_,()]/g, "");
        let query = sb.from("profiles").select("id, username, display_name, plan, xp, streak_count, pro_until, banned_until, ban_reason, created_at").order("created_at", { ascending: false }).limit(40);
        if (q) query = query.ilike("username", `%${q}%`);
        const { data, error } = await query;
        if (error) throw error;
        return NextResponse.json({ users: data });
      }
      case "grantPro": {
        const { error } = await sb.from("profiles").update({ pro_until: until(body.days) }).eq("id", userId);
        if (error) throw error;
        await log(userId, { days: body.days ?? "per sempre" });
        return NextResponse.json({ ok: true });
      }
      case "revokePro": {
        const { error } = await sb.from("profiles").update({ pro_until: null }).eq("id", userId);
        if (error) throw error;
        await log(userId);
        return NextResponse.json({ ok: true });
      }
      case "ban": {
        const reason = str(body.reason) || "Violazione delle regole della community";
        const { error } = await sb.from("profiles").update({ banned_until: until(body.days), ban_reason: reason }).eq("id", userId);
        if (error) throw error;
        await log(userId, { days: body.days ?? "per sempre", reason });
        return NextResponse.json({ ok: true });
      }
      case "banByName": {
        const id = await idOf(str(body.username, 30));
        if (!id) return NextResponse.json({ error: "Utente non trovato" }, { status: 404 });
        const reason = str(body.reason) || "Violazione delle regole della community";
        const { error } = await sb.from("profiles").update({ banned_until: until(body.days), ban_reason: reason }).eq("id", id);
        if (error) throw error;
        await log(id, { days: body.days ?? "per sempre", reason });
        return NextResponse.json({ ok: true });
      }
      case "unban": {
        const { error } = await sb.from("profiles").update({ banned_until: null, ban_reason: null }).eq("id", userId);
        if (error) throw error;
        await log(userId);
        return NextResponse.json({ ok: true });
      }
      case "forceFriend":
      case "unfriend": {
        const a = await idOf(str(body.a, 30));
        const b = await idOf(str(body.b, 30));
        if (!a || !b) return NextResponse.json({ error: "Uno dei due utenti non esiste" }, { status: 404 });
        if (a === b) return NextResponse.json({ error: "Servono due utenti diversi" }, { status: 400 });
        await sb.from("friendships").delete().or(`and(requester_id.eq.${a},addressee_id.eq.${b}),and(requester_id.eq.${b},addressee_id.eq.${a})`);
        if (action === "forceFriend") {
          const { error } = await sb.from("friendships").insert({ requester_id: a, addressee_id: b, status: "accepted" });
          if (error) throw error;
        }
        await log(`${str(body.a, 30)} ↔ ${str(body.b, 30)}`);
        return NextResponse.json({ ok: true });
      }
      case "setStats": {
        const patch: Record<string, number> = {};
        if (typeof body.xp === "number" && body.xp >= 0) patch.xp = Math.round(body.xp);
        if (typeof body.streak === "number" && body.streak >= 0) patch.streak_count = Math.round(body.streak);
        const { error } = await sb.from("profiles").update({ ...patch, ...(patch.streak_count !== undefined ? { streak_last_day: new Date().toISOString().slice(0, 10) } : {}) }).eq("id", userId);
        if (error) throw error;
        // anche nei progressi salvati, altrimenti il prossimo salvataggio del client li riporterebbe indietro
        const { data: row } = await sb.from("progress").select("data").eq("user_id", userId).maybeSingle<{ data: Record<string, unknown> }>();
        if (row?.data) {
          const d = { ...row.data };
          if (patch.xp !== undefined) d.xp = patch.xp;
          if (patch.streak_count !== undefined) d.streak = { count: patch.streak_count, lastDay: new Date().toISOString().slice(0, 10) };
          await sb.from("progress").update({ data: d, updated_at: new Date().toISOString() }).eq("user_id", userId);
        }
        await log(userId, patch);
        return NextResponse.json({ ok: true });
      }
      case "clearMessages": {
        const { error } = await sb.from("messages").delete().eq("sender_id", userId);
        if (error) throw error;
        await log(userId);
        return NextResponse.json({ ok: true });
      }
      case "announce": {
        const text = str(body.text, 280);
        const tone = ["info", "success", "warning"].includes(str(body.tone, 10)) ? str(body.tone, 10) : "info";
        const res = text ? await sb.from("app_settings").upsert({ key: "announcement", value: { text, tone, at: new Date().toISOString() }, updated_at: new Date().toISOString() }) : await sb.from("app_settings").delete().eq("key", "announcement");
        if (res.error) throw res.error;
        await log(null, { text, tone });
        return NextResponse.json({ ok: true });
      }
      case "log": {
        const { data, error } = await sb.from("admin_log").select("id, action, target, details, created_at").order("created_at", { ascending: false }).limit(60);
        if (error) throw error;
        return NextResponse.json({ log: data });
      }
      default:
        return NextResponse.json({ error: "Azione sconosciuta" }, { status: 400 });
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : (e as { message?: string })?.message ?? "Errore";
    // tabelle o colonne mancanti: il file 0003_admin.sql non è stato ancora eseguito
    const hint = /column|relation|does not exist|schema cache/i.test(msg) ? " (esegui supabase/migrations/0003_admin.sql nel SQL Editor di Supabase)" : "";
    return NextResponse.json({ error: msg + hint }, { status: 500 });
  }
}
