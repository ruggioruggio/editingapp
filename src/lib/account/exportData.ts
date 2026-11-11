import type { SupabaseClient, User } from "@supabase/supabase-js";

export const EXPORT_FORMAT_VERSION = 1;

type Row = Record<string, unknown>;

// Runs with the user's own session: row-level security guarantees it can only ever read that user's data.
export async function collectUserData(sb: SupabaseClient, user: User) {
  const me = user.id;
  const pick = async <T = Row[]>(p: PromiseLike<{ data: unknown; error: unknown }>): Promise<T | null> => {
    const { data, error } = await p;
    return error ? null : (data as T);
  };

  const [reactions, pacts] = await Promise.all([
    pick(sb.from("message_reactions").select("message_id, emoji, created_at").eq("user_id", me)),
    pick(sb.from("streak_pacts").select("status, started_on, created_at")),
  ]);
  const [profile, progress, friendships, sent, received, followers, following, activity, daily, avatarReview] = await Promise.all([
    pick<Row>(sb.from("profiles").select("*").eq("id", me).maybeSingle()),
    pick<Row>(sb.from("progress").select("data, updated_at").eq("user_id", me).maybeSingle()),
    pick(sb.from("friendships").select("id, status, created_at, requester_id, addressee_id, requester:profiles!friendships_requester_id_fkey(username), addressee:profiles!friendships_addressee_id_fkey(username)")),
    pick(sb.from("messages").select("*, recipient:profiles!messages_recipient_id_fkey(username)").eq("sender_id", me).order("created_at")),
    pick(sb.from("messages").select("*, sender:profiles!messages_sender_id_fkey(username)").eq("recipient_id", me).order("created_at")),
    pick(sb.from("follows").select("created_at, follower_id").eq("following_id", me)),
    pick(sb.from("follows").select("created_at, following_id").eq("follower_id", me)),
    pick(sb.from("activity_events").select("kind, data, created_at").eq("user_id", me).order("created_at")),
    pick(sb.from("daily_activity").select("*").eq("user_id", me)),
    pick<Row>(sb.from("avatar_reviews").select("avatar_url, status, created_at, reviewed_at").eq("user_id", me).maybeSingle()),
  ]);

  return {
    format: "squeakedit-personal-data",
    version: EXPORT_FORMAT_VERSION,
    exported_at: new Date().toISOString(),
    notes: "Esportazione dei tuoi dati personali (GDPR art. 15 e 20). I messaggi ricevuti includono solo il nome utente del mittente.",
    account: {
      id: user.id,
      email: user.email ?? null,
      created_at: user.created_at,
      last_sign_in_at: user.last_sign_in_at ?? null,
      sign_in_providers: user.app_metadata?.providers ?? [user.app_metadata?.provider].filter(Boolean),
      consents: (user.user_metadata as Row | undefined)?.consents ?? null,
    },
    profile,
    progress,
    social: {
      friendships: (friendships ?? []).map((f) => {
        const mine = f.requester_id === me;
        return {
          status: f.status,
          created_at: f.created_at,
          direction: mine ? "inviata" : "ricevuta",
          other_user: ((mine ? f.addressee : f.requester) as { username?: string } | null)?.username ?? null,
        };
      }),
      followers_count: followers?.length ?? 0,
      following_count: following?.length ?? 0,
      messages_sent: sent ?? [],
      messages_received: received ?? [],
      // photos and voice notes are referenced by media_path; they stay in your private chat storage
      reactions: reactions ?? [],
      shared_streaks: pacts ?? [],
    },
    activity: { events: activity ?? [], daily: daily ?? [] },
    avatar_review: avatarReview,
  };
}

export const exportFileName = () => `squeakedit-dati-personali-${new Date().toISOString().slice(0, 10)}.json`;
