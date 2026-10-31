import type { RealtimeChannel, SupabaseClient } from "@supabase/supabase-js";

export interface ChatMessage {
  id: number;
  sender_id: string;
  recipient_id: string;
  body: string;
  created_at: string;
  read_at: string | null;
}

export type ActivityKind = "lesson_completed" | "achievement_unlocked" | "streak_milestone";

export interface ActivityEvent {
  id: number;
  user_id: string;
  kind: ActivityKind;
  data: { lessonId?: string; lessonTitle?: string; achievementId?: string; level?: number; days?: number };
  created_at: string;
  user?: { username: string } | null;
}

export const MAX_MESSAGE = 1000;

export async function loadConversation(sb: SupabaseClient, me: string, friend: string): Promise<ChatMessage[]> {
  const { data, error } = await sb
    .from("messages")
    .select("id, sender_id, recipient_id, body, created_at, read_at")
    .or(`and(sender_id.eq.${me},recipient_id.eq.${friend}),and(sender_id.eq.${friend},recipient_id.eq.${me})`)
    .order("created_at", { ascending: false })
    .limit(100)
    .returns<ChatMessage[]>();
  if (error) throw error;
  return (data ?? []).reverse();
}

export async function sendMessage(sb: SupabaseClient, recipient: string, body: string): Promise<ChatMessage> {
  const { data, error } = await sb
    .from("messages")
    .insert({ recipient_id: recipient, body: body.slice(0, MAX_MESSAGE) })
    .select("id, sender_id, recipient_id, body, created_at, read_at")
    .single<ChatMessage>();
  if (error) throw error;
  return data;
}

export async function markRead(sb: SupabaseClient, me: string, friend: string) {
  await sb
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("recipient_id", me)
    .eq("sender_id", friend)
    .is("read_at", null);
}

export async function loadUnread(sb: SupabaseClient, me: string): Promise<Record<string, number>> {
  const { data } = await sb.from("messages").select("sender_id").eq("recipient_id", me).is("read_at", null).returns<{ sender_id: string }[]>();
  const out: Record<string, number> = {};
  for (const row of data ?? []) out[row.sender_id] = (out[row.sender_id] ?? 0) + 1;
  return out;
}

let _inboxSeq = 0;
export function subscribeIncoming(sb: SupabaseClient, me: string, onMessage: (m: ChatMessage) => void): () => void {
  const channel: RealtimeChannel = sb
    .channel(`inbox-${me}-${++_inboxSeq}`)
    .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `recipient_id=eq.${me}` }, (payload) =>
      onMessage(payload.new as ChatMessage),
    )
    .subscribe();
  return () => {
    void sb.removeChannel(channel);
  };
}

export async function loadSharedStreaks(sb: SupabaseClient, today: string): Promise<Record<string, number>> {
  const { data } = await sb.rpc("shared_streaks", { today });
  const out: Record<string, number> = {};
  for (const row of (data ?? []) as { friend_id: string; streak: number }[]) out[row.friend_id] = row.streak;
  return out;
}

const EVENT_FIELDS = "id, user_id, kind, data, created_at, user:profiles!activity_events_user_id_fkey(username)";

export async function loadFeed(sb: SupabaseClient, me: string): Promise<ActivityEvent[]> {
  const { data } = await sb
    .from("activity_events")
    .select(EVENT_FIELDS)
    .neq("user_id", me)
    .order("created_at", { ascending: false })
    .limit(30)
    .returns<ActivityEvent[]>();
  return data ?? [];
}

export async function loadFriendAchievements(sb: SupabaseClient, friend: string): Promise<Record<string, number>> {
  const { data } = await sb
    .from("activity_events")
    .select("data")
    .eq("user_id", friend)
    .eq("kind", "achievement_unlocked")
    .limit(200)
    .returns<{ data: ActivityEvent["data"] }[]>();
  const out: Record<string, number> = {};
  for (const { data: d } of data ?? []) {
    if (d.achievementId && d.level) out[d.achievementId] = Math.max(out[d.achievementId] ?? 0, d.level);
  }
  return out;
}

export async function publishEvents(sb: SupabaseClient, events: Pick<ActivityEvent, "kind" | "data">[]) {
  if (events.length) await sb.from("activity_events").insert(events);
}

export async function saveDailyActivity(sb: SupabaseClient, me: string, day: string, lessons: number) {
  await sb.from("daily_activity").upsert({ user_id: me, day, lessons });
}
