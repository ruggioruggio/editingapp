import type { SupabaseClient } from "@supabase/supabase-js";

export interface FriendProfile {
  id: string;
  username: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  xp: number;
  streak_count: number;
  streak_last_day: string | null;
  role: string | null;
  created_at: string | null;
}

export interface FriendLink {
  id: number;
  other: FriendProfile;
}

export interface FriendsData {
  friends: FriendLink[];
  incoming: FriendLink[];
  outgoing: FriendLink[];
}

const PROFILE_FIELDS = "id, username, display_name, bio, avatar_url, xp, streak_count, streak_last_day, role, created_at";

interface Row {
  id: number;
  status: "pending" | "accepted";
  requester_id: string;
  addressee_id: string;
  requester: FriendProfile;
  addressee: FriendProfile;
}

export async function loadFriends(sb: SupabaseClient, me: string): Promise<FriendsData> {
  const { data, error } = await sb
    .from("friendships")
    .select(
      `id, status, requester_id, addressee_id,
       requester:profiles!friendships_requester_id_fkey(${PROFILE_FIELDS}),
       addressee:profiles!friendships_addressee_id_fkey(${PROFILE_FIELDS})`,
    )
    .order("created_at", { ascending: false })
    .returns<Row[]>();
  if (error) throw error;

  const out: FriendsData = { friends: [], incoming: [], outgoing: [] };
  for (const row of data ?? []) {
    const sentByMe = row.requester_id === me;
    const link = { id: row.id, other: sentByMe ? row.addressee : row.requester };
    if (row.status === "accepted") out.friends.push(link);
    else (sentByMe ? out.outgoing : out.incoming).push(link);
  }
  return out;
}

export type SendResult = "sent" | "accepted" | "not_found" | "self" | "exists";

export async function sendFriendRequest(sb: SupabaseClient, me: string, username: string): Promise<SendResult> {
  const { data: target, error } = await sb
    .from("profiles")
    .select("id")
    .eq("username", username.toLowerCase())
    .maybeSingle<{ id: string }>();
  if (error) throw error;
  if (!target) return "not_found";
  if (target.id === me) return "self";

  const { data: existing } = await sb
    .from("friendships")
    .select("id, status, requester_id")
    .or(`and(requester_id.eq.${me},addressee_id.eq.${target.id}),and(requester_id.eq.${target.id},addressee_id.eq.${me})`)
    .maybeSingle<{ id: number; status: string; requester_id: string }>();

  if (existing) {
    if (existing.status === "pending" && existing.requester_id === target.id) {
      await acceptFriendRequest(sb, existing.id);
      return "accepted";
    }
    return "exists";
  }

  const { error: insertError } = await sb.from("friendships").insert({ requester_id: me, addressee_id: target.id });
  if (insertError) throw insertError;
  return "sent";
}

export type FriendRelation = "none" | "sent" | "incoming" | "friends";

export async function loadFriendRelation(sb: SupabaseClient, me: string, other: string): Promise<FriendRelation> {
  const { data, error } = await sb
    .from("friendships")
    .select("status, requester_id")
    .or(`and(requester_id.eq.${me},addressee_id.eq.${other}),and(requester_id.eq.${other},addressee_id.eq.${me})`)
    .maybeSingle<{ status: string; requester_id: string }>();
  if (error) throw error;
  if (!data) return "none";
  if (data.status === "accepted") return "friends";
  return data.requester_id === me ? "sent" : "incoming";
}

export async function acceptFriendRequest(sb: SupabaseClient, id: number) {
  const { error } = await sb.from("friendships").update({ status: "accepted" }).eq("id", id);
  if (error) throw error;
}

export async function removeFriendship(sb: SupabaseClient, id: number) {
  const { error } = await sb.from("friendships").delete().eq("id", id);
  if (error) throw error;
}
