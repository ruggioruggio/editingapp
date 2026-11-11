import type { RealtimeChannel, SupabaseClient } from "@supabase/supabase-js";

export type MessageKind = "text" | "image" | "audio" | "streak_invite";

export interface ChatMessage {
  id: number;
  sender_id: string;
  recipient_id: string;
  body: string;
  created_at: string;
  read_at: string | null;
  kind?: MessageKind;
  media_path?: string | null;
  meta?: { w?: number; h?: number; duration?: number; peaks?: number[]; pact_id?: number } | null;
  reply_to?: number | null;
}

const BASE_COLS = "id, sender_id, recipient_id, body, created_at, read_at";
const RICH_COLS = `${BASE_COLS}, kind, media_path, meta, reply_to`;
// until migration 017 runs the rich columns don't exist: fall back so the chat keeps working
let richChat = true;
const missingColumn = (e: { message?: string } | null) => !!e && /column|kind|media_path|reply_to|schema cache/i.test(e.message ?? "");

export const REACTIONS = ["❤️", "😂", "😮", "😢", "🔥", "👍"] as const;
export type Reaction = { message_id: number; user_id: string; emoji: string };

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
  const run = (cols: string) =>
    sb
      .from("messages")
      .select(cols)
      .or(`and(sender_id.eq.${me},recipient_id.eq.${friend}),and(sender_id.eq.${friend},recipient_id.eq.${me})`)
      .order("created_at", { ascending: false })
      .limit(100)
      .returns<ChatMessage[]>();
  let { data, error } = await run(richChat ? RICH_COLS : BASE_COLS);
  if (richChat && missingColumn(error)) {
    richChat = false;
    ({ data, error } = await run(BASE_COLS));
  }
  if (error) throw error;
  return (data ?? []).reverse();
}

export const richChatAvailable = () => richChat;

export async function sendMessage(
  sb: SupabaseClient,
  recipient: string,
  body: string,
  extra: Pick<ChatMessage, "kind" | "media_path" | "meta" | "reply_to"> = {},
): Promise<ChatMessage> {
  const rich = richChat ? Object.fromEntries(Object.entries(extra).filter(([, v]) => v !== undefined && v !== null)) : {};
  const { data, error } = await sb
    .from("messages")
    .insert({ recipient_id: recipient, body: body.slice(0, MAX_MESSAGE), ...rich })
    .select(richChat ? RICH_COLS : BASE_COLS)
    .single<ChatMessage>();
  if (error) throw error;
  return data;
}

// --- attachments (private bucket: only sender and recipient can read them) ---

export async function uploadChatMedia(sb: SupabaseClient, me: string, friend: string, file: Blob, ext: string, contentType: string) {
  const path = `${me}/${friend}/${crypto.randomUUID()}.${ext}`;
  const { error } = await sb.storage.from("chat-media").upload(path, file, { contentType, upsert: false });
  if (error) throw error;
  return path;
}

const signed = new Map<string, { url: string; until: number }>();
export async function chatMediaUrl(sb: SupabaseClient, path: string) {
  const hit = signed.get(path);
  if (hit && hit.until > Date.now()) return hit.url;
  const { data, error } = await sb.storage.from("chat-media").createSignedUrl(path, 3600);
  if (error || !data) throw error ?? new Error("url");
  signed.set(path, { url: data.signedUrl, until: Date.now() + 50 * 60_000 });
  return data.signedUrl;
}

// --- reactions ---

export async function loadReactions(sb: SupabaseClient, ids: number[]): Promise<Reaction[]> {
  if (!richChat || !ids.length) return [];
  const { data } = await sb.from("message_reactions").select("message_id, user_id, emoji").in("message_id", ids).returns<Reaction[]>();
  return data ?? [];
}

export async function setReaction(sb: SupabaseClient, me: string, messageId: number, emoji: string | null) {
  if (!emoji) return sb.from("message_reactions").delete().eq("message_id", messageId).eq("user_id", me);
  return sb.from("message_reactions").upsert({ message_id: messageId, user_id: me, emoji }, { onConflict: "message_id,user_id" });
}

// --- shared streak pacts ---

export type StreakPact = { id: number; status: "pending" | "active"; invited_by: string; started_on: string | null };

export async function loadPact(sb: SupabaseClient, me: string, friend: string): Promise<StreakPact | null> {
  const [a, b] = me < friend ? [me, friend] : [friend, me];
  const { data, error } = await sb.from("streak_pacts").select("id, status, invited_by, started_on").eq("user_a", a).eq("user_b", b).maybeSingle<StreakPact>();
  return error ? null : data;
}

export async function inviteStreak(sb: SupabaseClient, friend: string) {
  const { error } = await sb.rpc("invite_streak", { friend });
  if (error) throw error;
}

export async function acceptStreak(sb: SupabaseClient, pact: number) {
  const { error } = await sb.rpc("accept_streak", { pact });
  if (error) throw error;
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

export interface InboxThread {
  other: { id: string; username: string; avatar_url: string | null; xp: number; streak_count: number; streak_last_day: string | null; bio: string | null; display_name: string | null; role: string | null; created_at: string | null };
  last: ChatMessage;
  unread: number;
}

export async function loadInbox(sb: SupabaseClient, me: string): Promise<InboxThread[]> {
  const run = (cols: string) =>
    sb.from("messages").select(cols).or(`sender_id.eq.${me},recipient_id.eq.${me}`).order("created_at", { ascending: false }).limit(500).returns<ChatMessage[]>();
  let { data, error } = await run(richChat ? `${BASE_COLS}, kind` : BASE_COLS);
  if (richChat && missingColumn(error)) {
    richChat = false;
    ({ data, error } = await run(BASE_COLS));
  }
  if (error) throw error;
  const byOther = new Map<string, { last: ChatMessage; unread: number }>();
  for (const m of data ?? []) {
    const other = m.sender_id === me ? m.recipient_id : m.sender_id;
    const t = byOther.get(other) ?? { last: m, unread: 0 };
    if (m.recipient_id === me && !m.read_at) t.unread++;
    byOther.set(other, t);
  }
  if (!byOther.size) return [];
  const { data: profiles } = await sb
    .from("profiles")
    .select("id, username, display_name, bio, avatar_url, xp, streak_count, streak_last_day, role, created_at")
    .in("id", [...byOther.keys()])
    .returns<InboxThread["other"][]>();
  const map = new Map((profiles ?? []).map((p) => [p.id, p]));
  return [...byOther.entries()]
    .filter(([id]) => map.has(id))
    .map(([id, t]) => ({ other: map.get(id)!, ...t }));
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

let _readSeq = 0;
export function subscribeReadReceipts(sb: SupabaseClient, me: string, friendId: string, onRead: (id: number) => void): () => void {
  try {
    const channel: RealtimeChannel = sb
      .channel(`read-${me}-${friendId}-${++_readSeq}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "messages", filter: `sender_id=eq.${me}` }, (payload) => {
        const row = payload.new as ChatMessage;
        if (row.recipient_id === friendId && row.read_at) onRead(row.id);
      })
      .subscribe();
    return () => { void sb.removeChannel(channel); };
  } catch { return () => {}; }
}

let _presenceSeq = 0;
export function subscribeTyping(sb: SupabaseClient, me: string, friendId: string, onTyping: (typing: boolean) => void): { stop: () => void; sendTyping: () => void } {
  const noop = { stop: () => {}, sendTyping: () => {} };
  try {
    const channelName = [me, friendId].sort().join("-");
    const channel = sb.channel(`typing-${channelName}-${++_presenceSeq}`, { config: { presence: { key: me } } });
    let timeout: ReturnType<typeof setTimeout> | null = null;
    let joined = false;
    channel.on("presence", { event: "sync" }, () => {
      const state = channel.presenceState();
      const friendPresent = Object.keys(state).some((k) => k === friendId);
      onTyping(friendPresent);
    }).subscribe((status: string) => {
      if (status === "SUBSCRIBED") joined = true;
    });
    const sendTyping = () => {
      if (!joined) return;
      try { void channel.track({ typing: true }); } catch {}
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => { if (joined) try { void channel.untrack(); } catch {} }, 3000);
    };
    return {
      stop: () => { if (timeout) clearTimeout(timeout); try { void sb.removeChannel(channel); } catch {} },
      sendTyping,
    };
  } catch { return noop; }
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
