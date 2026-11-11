import { NextResponse, type NextRequest } from "next/server";
import { collectUserData, exportFileName } from "@/lib/account/exportData";
import { createSupabaseServer } from "@/lib/supabase/server";

export const runtime = "nodejs";

const WINDOW_MS = 60 * 60_000;
const MAX_PER_WINDOW = 5;
const recent = new Map<string, number[]>();

function limited(userId: string) {
  const now = Date.now();
  const hits = (recent.get(userId) ?? []).filter((t) => now - t < WINDOW_MS);
  hits.push(now);
  recent.set(userId, hits);
  return hits.length > MAX_PER_WINDOW;
}

// GDPR art. 15/20: the signed-in user downloads everything we hold about them, as JSON.
export async function GET(req: NextRequest) {
  const fetchSite = req.headers.get("sec-fetch-site");
  if (fetchSite && fetchSite !== "same-origin" && fetchSite !== "none") return NextResponse.json({ error: "Richiesta non valida" }, { status: 403 });
  const sb = await createSupabaseServer();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "Accedi per scaricare i tuoi dati" }, { status: 401 });
  if (limited(user.id)) return NextResponse.json({ error: "Hai già scaricato i dati più volte: riprova tra un'ora" }, { status: 429 });

  const data = await collectUserData(sb, user);
  return new NextResponse(JSON.stringify(data, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="${exportFileName()}"`,
      "Cache-Control": "no-store",
    },
  });
}
