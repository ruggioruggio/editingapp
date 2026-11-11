import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";
import { getServiceSupabase } from "@/lib/supabase/service";

export const runtime = "nodejs";

// Destructive action: only accept requests coming from our own pages (defence in depth on top of SameSite cookies).
function sameOrigin(req: NextRequest) {
  const origin = req.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).host === req.headers.get("host");
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "Richiesta non valida" }, { status: 403 });
  const body = (await req.json().catch(() => ({}))) as { confirm?: string };
  if (body.confirm !== "ELIMINA") return NextResponse.json({ error: "Conferma mancante" }, { status: 400 });
  const sb = await createSupabaseServer();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "Accedi di nuovo per eliminare l'account" }, { status: 401 });
  const service = getServiceSupabase();
  if (!service) return NextResponse.json({ error: "Eliminazione non disponibile: manca la configurazione del server" }, { status: 503 });

  // GDPR erasure: the database rows go with the user (ON DELETE CASCADE), stored files must be removed explicitly
  const { data: files } = await service.storage.from("avatars").list("", { search: user.id });
  const own = (files ?? []).map((f) => f.name).filter((n) => n.startsWith(`${user.id}.`));
  if (own.length) await service.storage.from("avatars").remove(own);
  // chat photos and voice notes the user sent live under chat-media/<user>/<recipient>/
  const { data: folders } = await service.storage.from("chat-media").list(user.id, { limit: 1000 });
  for (const folder of folders ?? []) {
    const { data: items } = await service.storage.from("chat-media").list(`${user.id}/${folder.name}`, { limit: 1000 });
    const paths = (items ?? []).map((f) => `${user.id}/${folder.name}/${f.name}`);
    if (paths.length) await service.storage.from("chat-media").remove(paths);
  }

  const { error } = await service.auth.admin.deleteUser(user.id);
  if (error) {
    console.error("[account/delete]", error.message);
    return NextResponse.json({ error: "Eliminazione non riuscita, riprova o scrivi al supporto" }, { status: 500 });
  }
  await sb.auth.signOut().catch(() => undefined);
  return NextResponse.json({ ok: true });
}
