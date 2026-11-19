import { Clapperboard, Code2, ExternalLink, Music } from "lucide-react";
import { REPOS, RUNNING } from "./data";

function Icon({ src, name, size = "size-10" }: { src?: string; name: string; size?: string }) {
  return src ? (
    <img src={src} alt="" className={`${size} shrink-0 rounded-xl object-contain`} />
  ) : (
    <div className={`${size} grid shrink-0 place-items-center rounded-xl border border-line bg-gradient-to-br from-fg/15 to-fg/[0.02] font-bold`}>{name[0]}</div>
  );
}

function Glyph({ kind }: { kind: "music" | "movies" }) {
  const G = kind === "music" ? Music : Clapperboard;
  return (
    <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-[linear-gradient(160deg,var(--primary),var(--tertiary))] text-[var(--on-primary)] shadow-sm">
      <G className="size-[18px]" strokeWidth={2.4} />
    </div>
  );
}

export default function Projects() {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 [&>*]:min-w-0">
        {RUNNING.map((r) => (
          <a key={r.name} href={r.href} target="_blank" rel="noreferrer" className="panel group flex items-center gap-4 p-4 transition hover:-translate-y-0.5">
            <Icon src={r.icon} name={r.name} size="size-12" />
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2 text-lg font-bold">
                {r.name}
                <span className="rounded-md bg-fg/[0.07] px-1.5 py-0.5 text-[11px] font-semibold text-soft">{r.role}</span>
              </p>
              <p className="truncate text-sm text-dim">{r.blurb ?? new URL(r.href!).host}</p>
            </div>
            <span className="sq size-10 group-hover:-translate-y-[15%] group-hover:scale-110 group-hover:bg-fg/10">
              <ExternalLink className="size-4" />
            </span>
          </a>
        ))}
      </div>

      <div className="panel p-5">
        <p className="label">api / lib repos</p>
        <ul className="mt-2 divide-y divide-line">
          {REPOS.map((r) => (
            <li key={r.name} className="flex items-center gap-3 py-3">
              {r.glyph ? <Glyph kind={r.glyph} /> : <Icon src={r.icon} name={r.name} size="size-9" />}
              <div className="min-w-0 flex-1">
                <p className="font-semibold">
                  {r.name} <span className="font-mono text-xs font-normal text-dim">{r.tag}</span>
                </p>
                <p className="truncate text-sm text-dim">{r.blurb}</p>
              </div>
              <a href={r.href} target="_blank" rel="noreferrer" aria-label={`${r.name} source`} title="source" className="sq size-9">
                <Code2 className="size-4" />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
