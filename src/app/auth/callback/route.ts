import { NextResponse, type NextRequest } from "next/server";
import { safeNext } from "@/lib/supabase/config";
import { createSupabaseServer } from "@/lib/supabase/server";

// Ritorno da Google/Apple, dal link di conferma email e dal reset password.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeNext(searchParams.get("next"));

  if (code) {
    const supabase = await createSupabaseServer();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${next}`);
  }
  return NextResponse.redirect(`${origin}/login?error=auth`);
}
