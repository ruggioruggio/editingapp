import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";
import { getServiceSupabase } from "@/lib/supabase/service";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as { confirm?: string };
  if (body.confirm !== "ELIMINA") return NextResponse.json({ error: "Conferma mancante" }, { status: 400 });
  const sb = await createSupabaseServer();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "Accedi di nuovo per eliminare l'account" }, { status: 401 });
  const service = getServiceSupabase();
  if (!service) return NextResponse.json({ error: "Eliminazione non disponibile: manca la configurazione del server" }, { status: 503 });
  const { error } = await service.auth.admin.deleteUser(user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  await sb.auth.signOut().catch(() => undefined);
  return NextResponse.json({ ok: true });
}
