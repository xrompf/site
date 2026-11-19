import { useRef } from "react";
import { motion } from "motion/react";
import { SpotifyIcon } from "./components/Icons";
import { clock, useLyrics, useNow } from "./lib/hooks";
import type { Spotify } from "./lib/lanyard";

function Equalizer() {
  return (
    <span className="eq flex h-3 items-end gap-[2px]" aria-hidden="true">
      {[0, 1, 2, 3].map((i) => (
        <span key={i} className="h-full w-[2px] rounded-full bg-bar" style={{ animationDelay: `${i * 0.17}s` }} />
      ))}
    </span>
  );
}

function Lyrics({ sp, now }: { sp: Spotify; now: number }) {
  const lines = useLyrics(sp);
  const refs = useRef<(HTMLElement | null)[]>([]);
  if (lines.length === 0) return null;

  const pos = (now - sp.start) / 1000 + 0.25;
  let idx = -1;
  for (let k = 0; k < lines.length && lines[k].t <= pos; k++) idx = k;

  const intro = idx === -1;
  const el = refs.current[idx];
  const offset = el ? el.offsetTop - 30 : 0;

  return (
    <div className="relative mt-4 h-[11.5rem] overflow-hidden rounded-xl border border-line bg-inset">
      <div className="h-full [mask-image:linear-gradient(transparent,#000_10%,#000_78%,transparent)]">
        <motion.div
          className="px-4 pt-3.5 pb-24"
          animate={{ y: -offset }}
          transition={{ type: "spring", stiffness: 110, damping: 20, mass: 0.9 }}
        >
          <div className={`flex h-9 items-center gap-1.5 transition-opacity duration-500 ${intro ? "opacity-100" : "opacity-0"}`} aria-hidden="true">
            {[0, 1, 2].map((d) => (
              <span key={d} className="breathe size-2 rounded-full bg-fg" style={{ animationDelay: `${d * 0.2}s` }} />
            ))}
          </div>
          {lines.map((line, k) => {
            const dist = k - idx;
            const cur = dist === 0;
            const gap = (lines[k + 1]?.t ?? line.t + 4) - line.t;
            const len = Math.min(gap, Math.max(0.8, line.text.length * 0.075 + 0.35));
            return (
              <p
                key={k}
                ref={(n) => {
                  refs.current[k] = n;
                }}
                className="lyric origin-left py-1.5 text-[19px] font-bold leading-snug"
                data-state={cur ? "current" : dist < 0 ? "past" : "next"}
                style={{
                  opacity: cur ? 1 : dist === 1 ? 0.62 : dist < 0 ? 0.3 : 0.42,
                  filter: cur || dist === 1 ? "none" : `blur(${Math.min(1.2, (Math.abs(dist) - 1) * 0.5)}px)`,
                  scale: cur ? 1 : 0.96,
                  transitionDelay: cur ? `0s, 0s, 0s, ${-(pos - line.t)}s` : undefined,
                  transitionDuration: cur ? `0.6s, 0.6s, 0.6s, ${len}s` : undefined,
                }}
              >
                {line.text}
              </p>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}

export function SpotifyCard({ sp }: { sp: Spotify | null }) {
  const now = useNow(250);

  if (!sp) {
    return (
      <div className="panel flex items-center gap-4 p-5">
        <div className="grid size-14 shrink-0 place-items-center rounded-xl border border-line bg-inset">
          <SpotifyIcon className="size-6 text-faint" />
        </div>
        <div>
          <p className="label">spotify</p>
          <p className="mt-1 text-sm text-dim">not listening to anything right now</p>
        </div>
      </div>
    );
  }

  const total = Math.max(1, sp.end - sp.start);
  const elapsed = Math.min(total, Math.max(0, now - sp.start));
  const link = `https://open.spotify.com/track/${sp.trackId}`;

  return (
    <div className="panel relative overflow-hidden p-5">
      <img key={sp.art} src={sp.art} alt="" className="absolute inset-0 -z-0 size-full scale-150 object-cover opacity-20 blur-3xl" />
      <div className="relative">
        <div className="flex items-center justify-between">
          <p className="label flex items-center gap-2">
            <Equalizer /> listening to spotify
          </p>
          <a href={link} target="_blank" rel="noreferrer" aria-label="open in spotify" className="sq size-8 border-0">
            <SpotifyIcon className="size-4" />
          </a>
        </div>

        <div className="mt-3 flex gap-4">
          <a href={link} target="_blank" rel="noreferrer" className="shrink-0">
            <img src={sp.art} alt={sp.album} className="size-24 rounded-xl object-cover shadow-lg shadow-black/30 transition duration-300 ease-bounce hover:scale-105" />
          </a>
          <div className="flex min-w-0 flex-1 flex-col justify-center">
            <a href={link} target="_blank" rel="noreferrer" className="truncate text-lg font-bold hover:underline">
              {sp.song}
            </a>
            <p className="truncate text-sm text-soft">{sp.artist.replaceAll(";", ",")}</p>
            <p className="truncate text-sm text-dim">{sp.album}</p>
            <div className="mt-3 flex items-center gap-2 font-mono text-[11px] text-dim">
              <span>{clock(elapsed)}</span>
              <div className="h-1 flex-1 overflow-hidden rounded-full bg-fg/10">
                <div className="h-full rounded-full bg-[var(--primary)]" style={{ width: `${(elapsed / total) * 100}%` }} />
              </div>
              <span>{clock(total)}</span>
            </div>
          </div>
        </div>

        <Lyrics key={sp.trackId} sp={sp} now={now} />
      </div>
    </div>
  );
}
