import { useEffect, useState } from "react";
import { avatar, COUNTER } from "../data";
import { paletteFromPixels } from "../../../scripts/button/palette.mjs";
import type { Spotify } from "./lanyard";

export function useNow(every = 1000): number {
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), every);
    return () => clearInterval(id);
  }, [every]);
  return now;
}

// counts this visit once per tab session so refreshes don't inflate it
export function useViewCount(): number | null {
  const [count, setCount] = useState<number | null>(null);
  useEffect(() => {
    let alive = true;
    let counted = false;
    try {
      counted = sessionStorage.getItem("xrompf:counted") === "1";
      sessionStorage.setItem("xrompf:counted", "1");
    } catch {}
    fetch(`${COUNTER}/${counted ? "" : "up"}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => alive && typeof j?.count === "number" && setCount(j.count))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);
  return count;
}

export type DiscordProfile = {
  banner: string | null;
  theme: [string, string] | null;
  pronouns: string;
  badges: { label: string; icon: string }[];
};

export function isLight(hexColor: string): boolean {
  const n = parseInt(hexColor.slice(1), 16);
  const [r, g, b] = [n >> 16, (n >> 8) & 255, n & 255];
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.6;
}

const hex = (n: number) => `#${n.toString(16).padStart(6, "0")}`;
let profileReq: Promise<DiscordProfile | null> | null = null;

async function pfpTheme(): Promise<[string, string] | null> {
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.src = avatar(64);
  try {
    await img.decode();
  } catch {
    return null;
  }
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const ctx = c.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(img, 0, 0, 64, 64);
  return paletteFromPixels(ctx.getImageData(0, 0, 64, 64).data, 64);
}

export function useDiscordProfile(id: string): DiscordProfile | null {
  const [profile, setProfile] = useState<DiscordProfile | null>(null);
  useEffect(() => {
    let alive = true;
    profileReq ??= fetch(`https://dcdn.dstn.to/profile/${id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then(async (j) => {
        if (!j?.user) return null;
        const hash: string | undefined = j.user_profile?.banner ?? j.user.banner;
        const tc: number[] | undefined = j.user_profile?.theme_colors;
        return {
          banner: hash ? `https://cdn.discordapp.com/banners/${id}/${hash}.${hash.startsWith("a_") ? "gif" : "png"}?size=600` : null,
          theme: tc?.length === 2 ? [hex(tc[0]), hex(tc[1])] : await pfpTheme(),
          pronouns: j.user_profile?.pronouns ?? "",
          badges: (j.badges ?? []).map((b: { description: string; icon: string }) => ({
            label: b.description,
            icon: `https://cdn.discordapp.com/badge-icons/${b.icon}.png`,
          })),
        } satisfies DiscordProfile;
      })
      .catch(() => null);
    profileReq.then((p) => alive && setProfile(p));
    return () => {
      alive = false;
    };
  }, [id]);
  return profile;
}

export type LyricLine = { t: number; text: string };

function parseLrc(lrc: string): LyricLine[] {
  const out: LyricLine[] = [];
  const re = /\[(\d{1,2}):(\d{2})(?:\.(\d{1,3}))?\]/g;
  for (const raw of lrc.split("\n")) {
    const text = raw.replace(re, "").trim();
    re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(raw))) {
      const frac = m[3] ? parseInt(m[3].padEnd(3, "0"), 10) / 1000 : 0;
      out.push({ t: parseInt(m[1], 10) * 60 + parseInt(m[2], 10) + frac, text });
    }
  }
  return out.filter((l) => l.text).sort((a, b) => a.t - b.t);
}

export function useLyrics(sp: Spotify | null): LyricLine[] {
  const [lines, setLines] = useState<{ id: string; lines: LyricLine[] }>({ id: "", lines: [] });
  const id = sp?.trackId ?? "";
  useEffect(() => {
    if (!sp) return;
    let alive = true;
    const artist = sp.artist.split(";")[0].trim();
    const secs = Math.max(1, Math.round((sp.end - sp.start) / 1000));
    const exact = new URLSearchParams({ artist_name: artist, track_name: sp.song, album_name: sp.album, duration: String(secs) });
    const loose = new URLSearchParams({ artist_name: artist, track_name: sp.song });

    (async () => {
      const hit = await fetch(`https://lrclib.net/api/get?${exact}`).then((r) => (r.ok ? r.json() : null));
      let synced: string | null = hit?.syncedLyrics ?? null;
      if (!synced) {
        const found: { duration: number; syncedLyrics: string | null }[] = await fetch(`https://lrclib.net/api/search?${loose}`).then((r) => (r.ok ? r.json() : []));
        synced =
          found
            .filter((f) => f.syncedLyrics && Math.abs(f.duration - secs) <= 3)
            .sort((a, b) => Math.abs(a.duration - secs) - Math.abs(b.duration - secs))[0]?.syncedLyrics ?? null;
      }
      if (alive) setLines({ id: sp.trackId, lines: synced ? parseLrc(synced) : [] });
    })().catch(() => {});
    return () => {
      alive = false;
    };
  }, [id]);
  return lines.id === id ? lines.lines : [];
}

export function clock(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(s / 3600);
  const mm = String(Math.floor((s % 3600) / 60)).padStart(h ? 2 : 1, "0");
  const ss = String(s % 60).padStart(2, "0");
  return h ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}
