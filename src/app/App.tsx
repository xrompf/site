import { hexFromArgb, sourceColorFromImage } from "@material/material-color-utilities";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { palette, type SchemeName, type ShapeName } from "../render";
import { SEEDS } from "./editors";
import { DICTS, type Dict } from "./i18n";
import { normalizeRoute, type MornyeRoute } from "./mornye-nav";
import { DocsSearchDialog, MornyeFooter, MornyeHomeView, MornyeDocsView } from "./MornyeViews";
import { bouncy, Button, Glyph, IconButton, Morph, Section, spring, useCycle } from "./ui";

type Theme = "system" | "light" | "dark";
const CYCLE: ShapeName[] = ["cookie", "clover", "sunny", "flower", "gem", "soft", "cookie12"];

function read<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, v: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(v));
  } catch {}
}

function useDark(theme: Theme) {
  const [sys, setSys] = useState(() => matchMedia("(prefers-color-scheme: dark)").matches);
  useEffect(() => {
    const m = matchMedia("(prefers-color-scheme: dark)");
    const on = () => setSys(m.matches);
    m.addEventListener("change", on);
    return () => m.removeEventListener("change", on);
  }, []);
  return theme === "system" ? sys : theme === "dark";
}

function useWide() {
  const [wide, setWide] = useState(() => innerWidth >= 1100);
  useEffect(() => {
    const on = () => setWide(innerWidth >= 1100);
    addEventListener("resize", on);
    return () => removeEventListener("resize", on);
  }, []);
  return wide;
}

const kebab = (s: string) => s.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase());

export default function App() {
  const t: Dict = DICTS.en;
  const [route, setRoute] = useState<MornyeRoute>(() => normalizeRoute(window.location.pathname));
  const [activeHash, setActiveHash] = useState<string>(() => window.location.hash.replace(/^#/, ""));
  const [seed, setSeed] = useState<string>(() => read<string>("ep:seed", "#FF5CA8"));
  const [scheme, setScheme] = useState<SchemeName>(() => {
    const saved = read<string>("ep:scheme:v2", "tonalSpot");
    return Object.prototype.hasOwnProperty.call(t.schemes, saved) ? (saved as SchemeName) : "tonalSpot";
  });
  const [theme, setTheme] = useState<Theme>(() => read<Theme>("ep:theme", "system"));
  const dark = useDark(theme);
  const wide = useWide();
  const [styleOpen, setStyleOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => write("ep:seed", seed), [seed]);
  useEffect(() => write("ep:scheme:v2", scheme), [scheme]);
  useEffect(() => write("ep:theme", theme), [theme]);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(id);
  }, [toast]);

  const p = useMemo(() => palette(seed, scheme, dark), [seed, scheme, dark]);
  useEffect(() => {
    const root = document.documentElement;
    for (const [k, v] of Object.entries(p)) root.style.setProperty(`--${kebab(k)}`, v);
    root.style.colorScheme = dark ? "dark" : "light";
    root.dataset.theme = dark ? "dark" : "light";
  }, [p, dark]);

  useEffect(() => {
    const onPop = () => {
      setRoute(normalizeRoute(window.location.pathname));
      setActiveHash(window.location.hash.replace(/^#/, ""));
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setStyleOpen(false);
        setSearchOpen(false);
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((v) => !v);
      } else if (e.key === "/" && !["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName ?? "")) {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const navigate = useCallback((next: MornyeRoute, hash?: string) => {
    const url = hash ? `${next}#${hash}` : next;
    if (window.location.pathname + window.location.hash !== url) {
      history.pushState(null, "", url);
    }
    setRoute(next);
    setActiveHash(hash ?? "");

    requestAnimationFrame(() => {
      if (hash) {
        const target = document.getElementById(hash);
        if (target) {
          target.scrollIntoView({ behavior: "smooth", block: "start" });
          return;
        }
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }, []);

  const fromImage = async (f: File) => {
    const url = URL.createObjectURL(f);
    try {
      const img = new Image();
      img.src = url;
      await img.decode();
      const argb = await sourceColorFromImage(img);
      setSeed(hexFromArgb(argb).toUpperCase());
    } catch {
      setToast(t.failed);
    } finally {
      URL.revokeObjectURL(url);
    }
  };

  const navItems: { id: string; label: string; route: MornyeRoute; hash?: string }[] = [
    { id: "home", label: "Home", route: "/" },
    { id: "features", label: "Features", route: "/", hash: "features" },
    { id: "profile", label: "Profile", route: "/", hash: "profile" },
    { id: "docs", label: "Docs", route: "/docs" },
  ];

  const activeNavId =
    route === "/docs"
      ? "docs"
      : activeHash === "features"
        ? "features"
        : activeHash === "profile"
          ? "profile"
          : "home";

  return (
    <div className="app">
      <Backdrop />

      <header className="topbar">
        <a
          href="/"
          className="logo"
          style={{ textDecoration: "none" }}
          onClick={(e) => {
            e.preventDefault();
            navigate("/", "top");
          }}
        >
          <Logo />
        </a>

        <nav className="nav-pill" aria-label="Main navigation">
          {navItems.map((item) => {
            const on = activeNavId === item.id;
            return (
              <a
                key={item.id}
                href={item.hash ? `${item.route}#${item.hash}` : item.route}
                className={`nav-item${on ? " on" : ""}`}
                onClick={(e) => {
                  e.preventDefault();
                  navigate(item.route, item.hash);
                }}
              >
                {on && <motion.span layoutId="nav-pill-bg" className="nav-item-bg" transition={spring} />}
                <span className="nav-item-label">{item.label}</span>
              </a>
            );
          })}
        </nav>

        <div className="actions">
          <IconButton icon="search" title="Search docs (Ctrl+K)" onClick={() => setSearchOpen(true)} />
          <IconButton icon="palette" title={t.style} onClick={() => setStyleOpen((v) => !v)} active={styleOpen} />
          <IconButton
            icon={theme === "dark" ? "dark_mode" : theme === "light" ? "light_mode" : "contrast"}
            title={`${t.theme}: ${t[theme]}`}
            onClick={() => setTheme(theme === "system" ? (dark ? "light" : "dark") : theme === "dark" ? "light" : "system")}
          />
        </div>
      </header>

      <div className="mornye-body">
        {route === "/docs" ? (
          <MornyeDocsView onNavigate={navigate} onOpenSearch={() => setSearchOpen(true)} />
        ) : (
          <MornyeHomeView onNavigate={navigate} />
        )}
        <MornyeFooter onNavigate={navigate} />
      </div>

      <AnimatePresence>
        {styleOpen && (
          <Sheet key="style-sheet" wide={wide} title={t.style} onClose={() => setStyleOpen(false)} t={t}>
            <Section title={t.seed}>
              <div className="swatches">
                {SEEDS.map((s) => (
                  <motion.button
                    key={s}
                    type="button"
                    className={`swatch${seed.toUpperCase() === s ? " on" : ""}`}
                    style={{ background: s }}
                    onClick={() => setSeed(s)}
                    whileTap={{ scale: 0.85 }}
                    whileHover={{ scale: 1.1 }}
                    transition={bouncy}
                    aria-label={s}
                  >
                    {seed.toUpperCase() === s && <Glyph name="check" size={20} />}
                  </motion.button>
                ))}
                <label
                  className={`swatch custom${!SEEDS.includes(seed.toUpperCase()) ? " on" : ""}`}
                  title={t.custom}
                  style={{ background: seed }}
                >
                  <Glyph name="palette" size={20} />
                  <input type="color" value={seed} onChange={(e) => setSeed(e.target.value.toUpperCase())} />
                </label>
              </div>
              <label className="from-avatar file">
                <Glyph name="add_photo_alternate" size={22} />
                {t.fromImage}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) fromImage(f);
                    e.target.value = "";
                  }}
                />
              </label>
            </Section>

            <Section title={t.scheme}>
              <div className="chips-wrap">
                {(Object.keys(t.schemes) as SchemeName[]).map((s) => (
                  <motion.button
                    key={s}
                    type="button"
                    layout
                    className={`filter-chip${scheme === s ? " on" : ""}`}
                    onClick={() => setScheme(s)}
                    whileTap={{ scale: 0.92 }}
                    transition={bouncy}
                  >
                    {scheme === s && <Glyph name="check" size={18} />}
                    {t.schemes[s]}
                  </motion.button>
                ))}
              </div>
            </Section>

            <Section>
              <Button
                kind="text"
                icon="restart_alt"
                onClick={() => {
                  setSeed("#FF5CA8");
                  setScheme("tonalSpot");
                  setTheme("system");
                }}
              >
                {t.reset}
              </Button>
            </Section>
          </Sheet>
        )}
      </AnimatePresence>

      <DocsSearchDialog
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelect={(heading) => navigate("/docs", heading.id)}
      />

      <AnimatePresence>
        {toast && (
          <motion.div className="toast" role="status" initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }} transition={bouncy}>
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Logo() {
  const shape = useCycle(CYCLE, 2600);
  return (
    <>
      <motion.span className="logo-mark" whileHover={{ rotate: 90, scale: 1.1 }} transition={bouncy}>
        <Morph shape={shape} size={34} />
      </motion.span>
      <span className="logo-text">xrompf</span>
    </>
  );
}

function Backdrop() {
  const a = useCycle(CYCLE, 5200);
  const b = useCycle([...CYCLE].reverse(), 6100);
  return (
    <div className="backdrop" aria-hidden="true">
      <Morph shape={a} size={620} className="bd bd-a" />
      <Morph shape={b} size={420} className="bd bd-b" />
    </div>
  );
}

function Sheet({ title, children, onClose, wide, t }: { title: string; children: ReactNode; onClose: () => void; wide: boolean; t: Dict }) {
  const from = wide ? { x: 480, opacity: 0.4 } : { y: "100%" };
  return (
    <>
      {!wide && <motion.div className="scrim sheet-scrim" onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />}
      <motion.aside className={`sheet${wide ? " side" : " bottom"}`} initial={from} animate={{ x: 0, y: 0, opacity: 1 }} exit={from} transition={spring}>
        <div className="sheet-head">
          <h2>{title}</h2>
          <IconButton icon="close" title={t.close} onClick={onClose} />
        </div>
        <div className="sheet-body">{children}</div>
      </motion.aside>
    </>
  );
}
