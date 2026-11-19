import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import content from "./mornye-content.json";
import { extractDocHeadings, searchDocs, type DocHeading, type MornyeRoute } from "./mornye-nav";
import { Button, Glyph, IconButton, spring } from "./ui";
import X8rSection from "../x8r/X8rSection";

const SVG_NS = "http://www.w3.org/2000/svg";

function hydrateShapes(root: HTMLElement) {
  const shapes = content.shapes as Record<string, string>;
  root.querySelectorAll<SVGSVGElement>("svg[data-shape]").forEach((svg) => {
    const name = svg.dataset.shape;
    if (!name || !shapes[name]) return;
    if (svg.querySelector("path")) return;
    const path = document.createElementNS(SVG_NS, "path");
    path.setAttribute("d", shapes[name]);
    svg.appendChild(path);
  });
}

function handleSpaNavigation(
  e: MouseEvent,
  onNavigate: (route: MornyeRoute, hash?: string) => void,
) {
  const a = (e.target as HTMLElement | null)?.closest<HTMLAnchorElement>("a");
  if (!a) return;
  const href = a.getAttribute("href");
  if (!href) return;
  if (href.startsWith("http") || href.startsWith("mailto:")) return;
  if (href.startsWith("#")) {
    e.preventDefault();
    onNavigate(window.location.pathname === "/docs" ? "/docs" : "/", href.slice(1));
    return;
  }
  if (href === "/" || href.startsWith("/#") || href === "/docs" || href.startsWith("/docs#")) {
    e.preventDefault();
    const [path, hash] = href.split("#");
    onNavigate(path === "/docs" ? "/docs" : "/", hash);
  }
}

export function MornyeHomeView({ onNavigate }: { onNavigate: (route: MornyeRoute, hash?: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    hydrateShapes(el);
    el.querySelectorAll<HTMLImageElement>('.rail img[loading="lazy"]').forEach((img) => {
      img.loading = "eager";
    });

    const onClick = (e: MouseEvent) => handleSpaNavigation(e, onNavigate);
    el.addEventListener("click", onClick);
    return () => el.removeEventListener("click", onClick);
  }, [onNavigate]);

  return (
    <div ref={ref} className="mornye-home">
      <div dangerouslySetInnerHTML={{ __html: content.homeMain }} />
      <X8rSection />
    </div>
  );
}

export function MornyeDocsView({ onNavigate, onOpenSearch }: { onNavigate: (route: MornyeRoute, hash?: string) => void; onOpenSearch: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [tocOpen, setTocOpen] = useState(false);
  const [activeId, setActiveId] = useState<string>("");

  const headings = useMemo(() => extractDocHeadings(content.docsBody), []);
  const topHeadings = useMemo(() => headings.filter((h) => h.level === 2), [headings]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Populate "On this page" outline inside static docs shell
    const onPage = el.querySelector<HTMLElement>("#onPage");
    if (onPage && !onPage.hasChildNodes()) {
      const ul = document.createElement("ul");
      ul.className = "onpage-list";
      topHeadings.forEach((h) => {
        const li = document.createElement("li");
        const a = document.createElement("a");
        a.className = "onpage-link";
        a.href = `#${h.id}`;
        a.textContent = h.title;
        li.appendChild(a);
        ul.appendChild(li);
      });
      onPage.appendChild(ul);
    }

    // Enhance code blocks with copy button once per mount
    el.querySelectorAll<HTMLPreElement>("article.prose pre").forEach((pre) => {
      if (pre.parentElement?.classList.contains("code-wrap")) return;
      const wrap = document.createElement("div");
      wrap.className = "code-wrap";
      pre.parentNode?.insertBefore(wrap, pre);
      wrap.appendChild(pre);

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "copy-btn";
      btn.textContent = "Copy";
      btn.addEventListener("click", () => {
        const text = pre.textContent ?? "";
        navigator.clipboard?.writeText(text).then(
          () => {
            btn.textContent = "Copied";
            setTimeout(() => {
              btn.textContent = "Copy";
            }, 1500);
          },
          () => {
            btn.textContent = "Copy";
          },
        );
      });
      wrap.appendChild(btn);
    });

    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement | null)?.closest<HTMLAnchorElement>("a");
      if (a && (a.classList.contains("section-link") || a.getAttribute("href")?.startsWith("#"))) {
        setTocOpen(false);
      }
      handleSpaNavigation(e, onNavigate);
    };
    el.addEventListener("click", onClick);

    const nodes = Array.from(el.querySelectorAll<HTMLElement>("article.prose h2[id], article.prose h3[id]"));
    const onScroll = () => {
      let current = nodes[0]?.id ?? "";
      for (const h of nodes) {
        if (h.getBoundingClientRect().top <= 130) current = h.id;
        else break;
      }
      setActiveId(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("click", onClick);
      window.removeEventListener("scroll", onScroll);
    };
  }, [onNavigate, topHeadings]);

  useEffect(() => {
    const el = ref.current;
    if (!el || !activeId) return;
    el.querySelectorAll<HTMLAnchorElement>(".section-link, .onpage-link").forEach((a) => {
      const target = a.getAttribute("href")?.slice(1);
      a.classList.toggle("active", target === activeId);
    });
  }, [activeId]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const side = el.querySelector<HTMLElement>("#tocPanel");
    if (side) side.classList.toggle("open", tocOpen);
  }, [tocOpen]);

  return (
    <div ref={ref} className="docs-view">
      <div className="wrap docs-mobile-bar">
        <Button kind="tonal" icon={tocOpen ? "close" : "book_2"} onClick={() => setTocOpen((v) => !v)}>
          {tocOpen ? "Close sections" : "Sections"}
        </Button>
        <Button kind="outlined" icon="search" onClick={onOpenSearch}>
          Search docs
        </Button>
      </div>
      <div dangerouslySetInnerHTML={{ __html: content.docsBody }} />
    </div>
  );
}

export function MornyeFooter({ onNavigate }: { onNavigate: (route: MornyeRoute, hash?: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onClick = (e: MouseEvent) => handleSpaNavigation(e, onNavigate);
    el.addEventListener("click", onClick);
    return () => el.removeEventListener("click", onClick);
  }, [onNavigate]);

  return (
    <div ref={ref}>
      <svg width="0" height="0" style={{ position: "absolute", pointerEvents: "none" }} aria-hidden="true">
        <defs>
          <symbol id="sf-logo" viewBox="0 0 100 100">
            <path
              fill="currentColor"
              d="M50 8C26.8 8 8 26.8 8 50s18.8 42 42 42 42-18.8 42-42S73.2 8 50 8Zm15.4 25.4v29.4a11.5 11.5 0 1 1-7-10.6V39.8L41 44.2v22.6a11.5 11.5 0 1 1-7-10.6V34.6c0-2.6 1.7-4.9 4.2-5.6l21-6c3.2-.9 6.2 1.5 6.2 4.8v5.6Z"
            />
          </symbol>
        </defs>
      </svg>
      <div dangerouslySetInnerHTML={{ __html: content.footer }} />
    </div>
  );
}

export function DocsSearchDialog({
  open,
  onClose,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (heading: DocHeading) => void;
}) {
  const [query, setQuery] = useState("");
  const headings = useMemo(() => extractDocHeadings(content.docsBody), []);
  const results = useMemo(() => searchDocs(headings, query), [headings, query]);

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="scrim" onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div
            className="dialog"
            role="dialog"
            aria-modal="true"
            aria-label="Search documentation"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={spring}
          >
            <div className="picker-head" style={{ marginBottom: 14 }}>
              <label className="search">
                <Glyph name="search" size={20} />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search extension docs..."
                  aria-label="Search extension docs"
                />
              </label>
              <IconButton icon="close" title="Close" onClick={onClose} />
            </div>
            <div className="docs-search-results">
              {results.length === 0 ? (
                <p className="note" style={{ padding: "18px 8px", textAlign: "center" }}>
                  No matching documentation sections found.
                </p>
              ) : (
                results.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className="docs-search-hit"
                    onClick={() => {
                      onSelect(item);
                      onClose();
                    }}
                  >
                    <span>{item.title}</span>
                    <small>{item.level === 2 ? "Section" : "Subsection"}</small>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
