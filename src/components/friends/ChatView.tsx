"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";
import { ArrowUp, CornerUpLeft, ImagePlus, Mic, Pause, Play, Square, Trash2, X } from "lucide-react";
import { todayKey } from "@/lib/date";
import { flameTier, messagePreview } from "@/lib/gamification/streakFlame";
import { getSupabase } from "@/lib/supabase/client";
import type { FriendProfile } from "@/lib/supabase/friends";
import {
  REACTIONS,
  acceptStreak,
  chatMediaUrl,
  inviteStreak,
  loadConversation,
  loadPact,
  loadReactions,
  loadSharedStreaks,
  markRead,
  MAX_MESSAGE,
  richChatAvailable,
  sendMessage,
  setReaction,
  subscribeIncoming,
  subscribeReadReceipts,
  subscribeTyping,
  uploadChatMedia,
  type ChatMessage,
  type Reaction,
  type StreakPact,
} from "@/lib/supabase/social";
import { useT } from "@/lib/settings/i18n";
import { useSettings } from "@/lib/settings/store";
import { FlameIcon, StreakFlame } from "./StreakFlame";

const LOCALE_MAP: Record<string, string> = { it: "it-IT", en: "en-US", fr: "fr-FR", es: "es-ES", zh: "zh-CN" };
const MAX_VOICE_S = 60;
const MAX_UPLOAD = 5 * 1024 * 1024;
const fill = (s: string, v: Record<string, string | number>) => s.replace(/\{(\w+)\}/g, (_, k) => String(v[k] ?? ""));
const mmss = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

// --- media helpers ---

async function compressImage(file: File) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, w, h);
  const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", 0.85));
  if (!blob) throw new Error("image");
  return { blob, w, h };
}

function pickAudioType() {
  const options = [
    ["audio/webm;codecs=opus", "audio/webm", "webm"],
    ["audio/mp4", "audio/mp4", "m4a"],
    ["audio/ogg;codecs=opus", "audio/ogg", "ogg"],
  ] as const;
  for (const [probe, type, ext] of options) if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(probe)) return { probe, type, ext };
  return null;
}

function useMediaUrl(path: string | null | undefined) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    const sb = getSupabase();
    if (!sb || !path) return;
    let alive = true;
    chatMediaUrl(sb, path).then((u) => alive && setUrl(u)).catch(() => {});
    return () => {
      alive = false;
    };
  }, [path]);
  return url;
}

// --- bubbles ---

function ImageBubble({ m, onOpen }: { m: ChatMessage; onOpen: (url: string) => void }) {
  const url = useMediaUrl(m.media_path);
  const ratio = m.meta?.w && m.meta?.h ? m.meta.w / m.meta.h : 4 / 3;
  return (
    <button type="button" onClick={() => url && onOpen(url)} className="block overflow-hidden rounded-2xl bg-panel-3" style={{ width: 220, aspectRatio: String(Math.max(0.6, Math.min(1.8, ratio))) }}>
      {url ? <img src={url} alt="" className="h-full w-full object-cover" /> : <span className="block h-full w-full animate-pulse" />}
    </button>
  );
}

function AudioBubble({ m, mine }: { m: ChatMessage; mine: boolean }) {
  const url = useMediaUrl(m.media_path);
  const audio = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const peaks = m.meta?.peaks?.length ? m.meta.peaks : Array.from({ length: 32 }, (_, i) => 0.3 + 0.5 * Math.abs(Math.sin(i * 1.7)));
  const duration = m.meta?.duration ?? 0;
  return (
    <div className="flex items-center gap-2.5 py-0.5" style={{ width: 210 }}>
      <button
        type="button"
        disabled={!url}
        aria-label={playing ? "Pausa" : "Play"}
        onClick={() => {
          const a = audio.current;
          if (!a) return;
          if (a.paused) void a.play();
          else a.pause();
        }}
        className={clsx("grid h-9 w-9 shrink-0 place-items-center rounded-full", mine ? "bg-white/20" : "bg-accent text-white")}
      >
        {playing ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" className="translate-x-px" />}
      </button>
      <span className="flex h-8 flex-1 items-center gap-[2px]" aria-hidden>
        {peaks.map((p, i) => (
          <span key={i} className={clsx("w-[3px] rounded-full transition-colors", i / peaks.length <= progress ? (mine ? "bg-white" : "bg-accent") : mine ? "bg-white/40" : "bg-ink-mute/50")} style={{ height: `${Math.max(12, p * 100)}%` }} />
        ))}
      </span>
      <span className="w-9 shrink-0 text-right text-[11px] tabular-nums opacity-80">{mmss(playing ? progress * duration : duration)}</span>
      {url && (
        <audio
          ref={audio}
          src={url}
          preload="metadata"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => {
            setPlaying(false);
            setProgress(0);
          }}
          onTimeUpdate={(e) => {
            const a = e.currentTarget;
            const d = Number.isFinite(a.duration) && a.duration > 0 ? a.duration : duration || 1;
            setProgress(Math.min(1, a.currentTime / d));
          }}
        />
      )}
    </div>
  );
}

function InviteCard({ m, mine, friendName, pact, onAccept }: { m: ChatMessage; mine: boolean; friendName: string; pact: StreakPact | null; onAccept: () => void }) {
  const t = useT();
  const isThisPact = pact && pact.id === m.meta?.pact_id;
  const status = !isThisPact ? "expired" : pact.status;
  return (
    <div className="w-60 rounded-2xl border border-[#ff8a3d]/40 bg-gradient-to-br from-[#ff8a3d]/25 to-[#ff4d4d]/10 p-3 text-ink">
      <div className="flex items-center gap-2">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#ff8a3d]/20">
          <FlameIcon size={26} />
        </span>
        <p className="text-sm font-black leading-tight">{fill(mine ? t("streakInviteSent") : t("streakInviteReceived"), { user: mine ? `@${friendName}` : `@${friendName}` })}</p>
      </div>
      <p className="mt-2 text-[11px] leading-snug text-ink-dim">{t("streakExplain")}</p>
      {status === "active" ? (
        <p className="mt-2 text-center text-xs font-black text-success">✓ {t("streakActiveLabel")}</p>
      ) : status === "pending" && !mine ? (
        <button type="button" onClick={onAccept} className="btn-3d mt-2.5 w-full rounded-xl bg-[#ff8a3d] py-2 text-sm font-black text-[#3a1500]">
          {t("streakAccept")}
        </button>
      ) : status === "pending" ? (
        <p className="mt-2 text-center text-xs font-bold text-ink-mute">{t("streakPending")}</p>
      ) : null}
    </div>
  );
}

// --- main view ---

export function ChatView({ me, friend, onRead }: { me: string; friend: FriendProfile; onRead: () => void }) {
  const t = useT();
  const lang = useSettings((s) => s.lang);
  const locale = LOCALE_MAP[lang] ?? "en-US";
  const sb = getSupabase();
  const [messages, setMessages] = useState<ChatMessage[] | null>(null);
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [friendTyping, setFriendTyping] = useState(false);
  const [newIds, setNewIds] = useState<Set<number>>(new Set());
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
  const [menu, setMenu] = useState<ChatMessage | null>(null);
  const [burst, setBurst] = useState<number | null>(null);
  const [viewer, setViewer] = useState<string | null>(null);
  const [pact, setPact] = useState<StreakPact | null>(null);
  const [sharedDays, setSharedDays] = useState(0);
  const [busy, setBusy] = useState(false);
  const [rec, setRec] = useState<{ started: number; level: number } | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const typingRef = useRef<{ sendTyping: () => void } | null>(null);
  const bottom = useRef<HTMLDivElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const recorder = useRef<{ mr: MediaRecorder; stream: MediaStream; ctx: AudioContext; peaks: number[]; cancel: boolean; timer: number; type: { type: string; ext: string } } | null>(null);
  const press = useRef<number | null>(null);
  const rich = richChatAvailable();

  const refreshExtras = useCallback(
    async (list: ChatMessage[] | null) => {
      if (!sb) return;
      const [rs, p, streaks] = await Promise.all([
        loadReactions(sb, (list ?? []).map((m) => m.id)),
        loadPact(sb, me, friend.id),
        loadSharedStreaks(sb, todayKey()),
      ]);
      setReactions(rs);
      setPact(p);
      setSharedDays(streaks[friend.id] ?? 0);
    },
    [sb, me, friend.id],
  );

  useEffect(() => {
    const client = sb ?? getSupabase();
    if (!client) return;
    let alive = true;
    const load = () =>
      loadConversation(client, me, friend.id)
        .then((list) => {
          if (!alive) return;
          setMessages(list);
          void refreshExtras(list);
        })
        .catch(() => alive && setTimeout(() => alive && load(), 2000));
    load();
    void markRead(client, me, friend.id).then(onRead).catch(() => {});

    const stopIncoming = subscribeIncoming(client, me, (m) => {
      if (m.sender_id !== friend.id) return;
      setMessages((list) => (list && !list.some((x) => x.id === m.id) ? [...list, m] : list));
      setNewIds((s) => new Set(s).add(m.id));
      void markRead(client, me, friend.id).catch(() => {});
    });
    const stopRead = subscribeReadReceipts(client, me, friend.id, (id) => {
      setMessages((list) => list?.map((m) => (m.id === id ? { ...m, read_at: new Date().toISOString() } : m)) ?? null);
    });
    const { stop: stopTyping, sendTyping } = subscribeTyping(client, me, friend.id, setFriendTyping);
    typingRef.current = { sendTyping };
    // realtime can silently drop: a light poll keeps messages, reactions and the streak in sync
    const poll = setInterval(() => alive && load(), 5000);
    return () => {
      alive = false;
      clearInterval(poll);
      stopIncoming();
      stopRead();
      stopTyping();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sb, me, friend.id]);

  useEffect(() => {
    bottom.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [messages?.length, friendTyping]);

  const byId = useMemo(() => new Map((messages ?? []).map((m) => [m.id, m])), [messages]);
  const reactionsOf = (id: number) => reactions.filter((r) => r.message_id === id);
  const mineReaction = (id: number) => reactions.find((r) => r.message_id === id && r.user_id === me)?.emoji ?? null;
  const preview = (m: ChatMessage) => messagePreview(m.kind, m.body, { photo: t("chatPhoto"), voice: t("chatVoice"), invite: t("chatInviteLabel") });
  const time = (iso: string) => new Date(iso).toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });

  const react = async (m: ChatMessage, emoji: string) => {
    if (!sb) return;
    const next = mineReaction(m.id) === emoji ? null : emoji;
    setReactions((rs) => [...rs.filter((r) => !(r.message_id === m.id && r.user_id === me)), ...(next ? [{ message_id: m.id, user_id: me, emoji: next }] : [])]);
    if (next) {
      setBurst(m.id);
      setTimeout(() => setBurst(null), 700);
    }
    await setReaction(sb, me, m.id, next);
  };

  const push = (sent: ChatMessage) => {
    setMessages((list) => [...(list ?? []), sent]);
    setNewIds((s) => new Set(s).add(sent.id));
    setReplyTo(null);
    setError(null);
  };

  const send = async (e?: FormEvent) => {
    e?.preventDefault();
    const body = text.trim();
    if (!body || !sb) return;
    setText("");
    try {
      push(await sendMessage(sb, friend.id, body, { kind: "text", reply_to: replyTo?.id }));
    } catch {
      setText(body);
      setError(t("messageFailed"));
    }
  };

  const sendPhoto = async (file: File) => {
    if (!sb || !file.type.startsWith("image/")) return;
    setBusy(true);
    try {
      const { blob, w, h } = await compressImage(file);
      if (blob.size > MAX_UPLOAD) throw new Error(t("chatFileTooBig"));
      const path = await uploadChatMedia(sb, me, friend.id, blob, "jpg", "image/jpeg");
      push(await sendMessage(sb, friend.id, "", { kind: "image", media_path: path, meta: { w, h }, reply_to: replyTo?.id }));
    } catch (err) {
      setError(err instanceof Error && err.message.includes("5 MB") ? err.message : t("messageFailed"));
    }
    setBusy(false);
  };

  const startRecording = async () => {
    const type = pickAudioType();
    if (!type || !navigator.mediaDevices?.getUserMedia) return setError(t("chatMicDenied"));
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
    } catch {
      return setError(t("chatMicDenied"));
    }
    const ctx = new AudioContext();
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 512;
    ctx.createMediaStreamSource(stream).connect(analyser);
    const buf = new Uint8Array(analyser.fftSize);
    const peaks: number[] = [];
    const mr = new MediaRecorder(stream, { mimeType: type.probe });
    const chunks: Blob[] = [];
    mr.ondataavailable = (ev) => ev.data.size && chunks.push(ev.data);
    const started = performance.now();
    const timer = window.setInterval(() => {
      analyser.getByteTimeDomainData(buf);
      let sum = 0;
      for (const v of buf) sum += ((v - 128) / 128) ** 2;
      const level = Math.min(1, Math.sqrt(sum / buf.length) * 3.2);
      peaks.push(level);
      const s = (performance.now() - started) / 1000;
      setElapsed(s);
      setRec({ started, level });
      if (s >= MAX_VOICE_S) mr.stop();
    }, 100);
    mr.onstop = async () => {
      const r = recorder.current;
      recorder.current = null;
      clearInterval(timer);
      stream.getTracks().forEach((tr) => tr.stop());
      void ctx.close();
      setRec(null);
      const duration = (performance.now() - started) / 1000;
      if (!r || r.cancel || duration < 0.6 || !sb) return;
      // 32 bars summarise the loudness over time for the waveform
      const bars = Array.from({ length: 32 }, (_, i) => {
        const slice = peaks.slice(Math.floor((i * peaks.length) / 32), Math.floor(((i + 1) * peaks.length) / 32));
        return Number((slice.length ? Math.max(...slice) : 0.1).toFixed(2));
      });
      setBusy(true);
      try {
        const blob = new Blob(chunks, { type: type.type });
        if (blob.size > MAX_UPLOAD) throw new Error("big");
        const path = await uploadChatMedia(sb, me, friend.id, blob, type.ext, type.type);
        push(await sendMessage(sb, friend.id, "", { kind: "audio", media_path: path, meta: { duration: Number(duration.toFixed(1)), peaks: bars }, reply_to: replyTo?.id }));
      } catch {
        setError(t("messageFailed"));
      }
      setBusy(false);
    };
    recorder.current = { mr, stream, ctx, peaks, cancel: false, timer, type };
    mr.start(250);
    setElapsed(0);
    setRec({ started, level: 0 });
  };

  const stopRecording = (cancel: boolean) => {
    const r = recorder.current;
    if (!r) return;
    r.cancel = cancel;
    if (r.mr.state !== "inactive") r.mr.stop();
  };

  useEffect(() => () => stopRecording(true), []);

  const invite = async () => {
    if (!sb) return;
    try {
      await inviteStreak(sb, friend.id);
      const list = await loadConversation(sb, me, friend.id);
      setMessages(list);
      await refreshExtras(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("messageFailed"));
    }
  };

  const remove = async (m: ChatMessage) => {
    if (!sb) return;
    setMessages((list) => list?.filter((x) => x.id !== m.id) ?? null);
    await sb.from("messages").delete().eq("id", m.id);
    if (m.media_path) await sb.storage.from("chat-media").remove([m.media_path]);
  };

  const lastMine = messages ? [...messages].reverse().find((m) => m.sender_id === me) : null;
  const tier = flameTier(sharedDays);

  return (
    <>
      <style>{`
        @keyframes msgPop { 0%{transform:scale(.6);opacity:0} 55%{transform:scale(1.04)} 100%{transform:scale(1);opacity:1} }
        .msg-pop { animation: msgPop .32s cubic-bezier(.34,1.56,.64,1) both }
        @keyframes heartBurst { 0%{transform:translate(-50%,-50%) scale(.2);opacity:0} 35%{transform:translate(-50%,-50%) scale(1.25);opacity:1} 100%{transform:translate(-50%,-90%) scale(.9);opacity:0} }
        .heart-burst { animation: heartBurst .7s ease-out forwards }
        @keyframes dots { 0%,80%,100%{opacity:.3} 40%{opacity:1} }
        .dot1{animation:dots 1.2s infinite} .dot2{animation:dots 1.2s .2s infinite} .dot3{animation:dots 1.2s .4s infinite}
      `}</style>

      {rich && (
        <div className="flex items-center gap-2 border-b border-line px-4 py-2 text-xs font-bold">
          {pact?.status === "active" ? (
            <>
              <StreakFlame days={sharedDays} size={20} className="text-base" />
              <span className="text-ink-dim">{t("streakActiveLabel")}</span>
              {tier.next && <span className="ml-auto text-ink-mute">{fill(t("streakNext"), { n: tier.next.min })}</span>}
            </>
          ) : pact?.status === "pending" ? (
            <span className="flex items-center gap-1.5 text-ink-mute">
              <FlameIcon size={16} muted /> {t("streakPending")}
            </span>
          ) : (
            <button type="button" onClick={invite} className="flex items-center gap-1.5 rounded-full bg-[#ff8a3d]/15 px-3 py-1.5 text-[#ffb27a] hover:bg-[#ff8a3d]/25">
              <FlameIcon size={16} /> {t("streakInviteBtn")}
            </button>
          )}
        </div>
      )}

      <div className="flex-1 space-y-1.5 overflow-y-auto px-3 py-4" onClick={() => setMenu(null)}>
        {messages === null && !error && <div className="h-20 animate-pulse rounded-2xl bg-panel" />}
        {messages?.length === 0 && <p className="py-10 text-center text-sm text-ink-mute">{t("breakIce")} @{friend.username}</p>}
        {messages?.map((m, i) => {
          const mine = m.sender_id === me;
          const prev = messages[i - 1];
          const gap = !prev || new Date(m.created_at).getTime() - new Date(prev.created_at).getTime() > 15 * 60_000;
          const quoted = m.reply_to ? byId.get(m.reply_to) : null;
          const rs = reactionsOf(m.id);
          const bare = m.kind === "image" || m.kind === "streak_invite";
          return (
            <div key={m.id}>
              {gap && <p className="py-2 text-center text-[10px] font-bold uppercase tracking-wide text-ink-mute">{new Date(m.created_at).toLocaleString(locale, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</p>}
              <div className={clsx("group flex", mine ? "justify-end" : "justify-start", rs.length && "mb-3")}>
                <div
                  className={clsx("relative max-w-[78%] select-none", newIds.has(m.id) && "msg-pop")}
                  onDoubleClick={() => rich && react(m, "❤️")}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    if (rich) setMenu(m);
                  }}
                  onPointerDown={() => {
                    press.current = window.setTimeout(() => rich && setMenu(m), 450);
                  }}
                  onPointerUp={() => press.current && clearTimeout(press.current)}
                  onPointerLeave={() => press.current && clearTimeout(press.current)}
                >
                  {quoted && (
                    <div className={clsx("mb-0.5 rounded-xl border-l-2 px-2.5 py-1 text-[11px]", mine ? "ml-auto border-white/60 bg-accent/30 text-white/85" : "border-accent bg-panel text-ink-dim")}>
                      <span className="font-black">{quoted.sender_id === me ? t("you") : `@${friend.username}`}</span> · <span className="line-clamp-1">{preview(quoted)}</span>
                    </div>
                  )}
                  <div className={clsx(!bare && "rounded-2xl px-3.5 py-2", !bare && (mine ? "rounded-br-md bg-accent text-white" : "rounded-bl-md bg-panel-2 text-ink"))}>
                    {m.kind === "image" ? (
                      <ImageBubble m={m} onOpen={setViewer} />
                    ) : m.kind === "audio" ? (
                      <AudioBubble m={m} mine={mine} />
                    ) : m.kind === "streak_invite" ? (
                      <InviteCard
                        m={m}
                        mine={mine}
                        friendName={friend.username}
                        pact={pact}
                        onAccept={async () => {
                          if (!sb || !m.meta?.pact_id) return;
                          try {
                            await acceptStreak(sb, m.meta.pact_id);
                            await refreshExtras(messages);
                          } catch {
                            setError(t("messageFailed"));
                          }
                        }}
                      />
                    ) : (
                      <p className="whitespace-pre-wrap break-words">{m.body}</p>
                    )}
                    {!bare && <p className={clsx("mt-0.5 text-right text-[10px]", mine ? "text-white/70" : "text-ink-mute")}>{time(m.created_at)}</p>}
                  </div>
                  {burst === m.id && <span className="heart-burst pointer-events-none absolute left-1/2 top-1/2 text-4xl">❤️</span>}
                  {rs.length > 0 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenu(m);
                      }}
                      className={clsx("absolute -bottom-3 flex items-center gap-0.5 rounded-full border border-line bg-panel px-1.5 py-0.5 text-[12px] shadow", mine ? "right-2" : "left-2")}
                    >
                      {[...new Set(rs.map((r) => r.emoji))].join("")}
                      {rs.length > 1 && <span className="text-[10px] font-bold text-ink-mute">{rs.length}</span>}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {lastMine?.read_at && <p className="pr-1 text-right text-[10px] font-semibold text-accent/70">{t("seen")}</p>}
        {friendTyping && (
          <div className="flex">
            <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md bg-panel-2 px-4 py-2.5">
              <span className="dot1 inline-block h-2 w-2 rounded-full bg-ink-mute" />
              <span className="dot2 inline-block h-2 w-2 rounded-full bg-ink-mute" />
              <span className="dot3 inline-block h-2 w-2 rounded-full bg-ink-mute" />
            </div>
          </div>
        )}
        <div ref={bottom} />
      </div>

      {menu && (
        <div className="fixed inset-0 z-[95] grid place-items-center bg-black/50 p-6 backdrop-blur-[2px]" onPointerDown={(e) => e.target === e.currentTarget && setMenu(null)}>
          <div className="animate-pop w-full max-w-xs space-y-2">
            <div className="flex justify-between rounded-full border border-line bg-panel-2 px-3 py-2 shadow-2xl">
              {REACTIONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => {
                    void react(menu, emoji);
                    setMenu(null);
                  }}
                  className={clsx("grid h-10 w-10 place-items-center rounded-full text-2xl transition-transform hover:scale-125", mineReaction(menu.id) === emoji && "bg-accent/30")}
                >
                  {emoji}
                </button>
              ))}
            </div>
            <div className="overflow-hidden rounded-2xl border border-line bg-panel-2 shadow-2xl">
              <p className="line-clamp-2 border-b border-line px-4 py-2.5 text-sm text-ink-dim">{preview(menu)}</p>
              <button
                type="button"
                onClick={() => {
                  setReplyTo(menu);
                  setMenu(null);
                }}
                className="flex w-full items-center gap-2.5 px-4 py-3 text-sm font-bold hover:bg-panel-3"
              >
                <CornerUpLeft size={17} /> {t("chatReply")}
              </button>
              {menu.sender_id === me && (
                <button
                  type="button"
                  onClick={() => {
                    void remove(menu);
                    setMenu(null);
                  }}
                  className="flex w-full items-center gap-2.5 px-4 py-3 text-sm font-bold text-danger hover:bg-panel-3"
                >
                  <Trash2 size={17} /> {t("chatDelete")}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {viewer &&
        createPortal(
          <div className="fixed inset-0 z-[160] grid place-items-center bg-black/90 p-4" onClick={() => setViewer(null)}>
            <img src={viewer} alt="" className="max-h-full max-w-full rounded-xl object-contain" />
            <button type="button" aria-label={t("close")} className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white">
              <X size={22} />
            </button>
          </div>,
          document.body,
        )}

      {error && <p className="px-4 pb-1 text-sm font-semibold text-danger">{error}</p>}
      {replyTo && (
        <div className="flex items-center gap-2 border-t border-line bg-panel px-4 py-2 text-xs">
          <CornerUpLeft size={15} className="shrink-0 text-accent" />
          <span className="min-w-0 flex-1 truncate">
            <span className="font-black">{t("chatReplyingTo")} {replyTo.sender_id === me ? t("you") : `@${friend.username}`}</span> · <span className="text-ink-dim">{preview(replyTo)}</span>
          </span>
          <button type="button" aria-label={t("chatCancel")} onClick={() => setReplyTo(null)} className="text-ink-mute hover:text-ink">
            <X size={16} />
          </button>
        </div>
      )}

      {rec ? (
        <div className="flex items-center gap-3 border-t border-line p-3">
          <button type="button" aria-label={t("chatCancel")} onClick={() => stopRecording(true)} className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-panel-2 text-danger">
            <Trash2 size={18} />
          </button>
          <div className="flex min-w-0 flex-1 items-center gap-2.5 rounded-full bg-panel-2 px-4 py-2.5">
            <span className="h-2.5 w-2.5 shrink-0 animate-pulse rounded-full bg-danger" />
            <span className="text-sm font-bold">{t("chatRecording")}</span>
            <span className="ml-auto font-mono text-sm tabular-nums">{mmss(elapsed)} / {mmss(MAX_VOICE_S)}</span>
            <span className="h-6 w-1.5 rounded-full bg-accent transition-transform" style={{ transform: `scaleY(${0.25 + rec.level})` }} />
          </div>
          <button type="button" aria-label={t("chatSendVoice")} onClick={() => stopRecording(false)} className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-accent text-white">
            <Square size={16} fill="currentColor" />
          </button>
        </div>
      ) : (
        <form onSubmit={send} className="flex items-center gap-2 border-t border-line p-3">
          {rich && (
            <>
              <button type="button" aria-label={t("chatAddPhoto")} disabled={busy} onClick={() => fileInput.current?.click()} className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-panel-2 text-ink-dim hover:text-ink disabled:opacity-40">
                <ImagePlus size={20} />
              </button>
              <input
                ref={fileInput}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  e.target.value = "";
                  if (f) void sendPhoto(f);
                }}
              />
            </>
          )}
          <input
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              typingRef.current?.sendTyping();
            }}
            maxLength={MAX_MESSAGE}
            placeholder={`${t("writeTo")} @${friend.username}…`}
            className="min-w-0 flex-1 rounded-full border-2 border-line bg-panel-2 px-4 py-2.5 font-semibold outline-none focus:border-accent"
          />
          {text.trim() || !rich ? (
            <button type="submit" aria-label={t("send")} disabled={!text.trim()} className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-accent text-white disabled:opacity-40">
              <ArrowUp size={20} strokeWidth={3} />
            </button>
          ) : (
            <button type="button" aria-label={t("chatRecord")} disabled={busy} onClick={() => void startRecording()} className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-accent text-white disabled:opacity-40">
              <Mic size={20} />
            </button>
          )}
        </form>
      )}
    </>
  );
}
