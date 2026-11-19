export type MornyeRoute = "/" | "/docs";

export interface DocHeading {
  id: string;
  title: string;
  level: 2 | 3;
}

export function normalizeRoute(pathname: string): MornyeRoute {
  const clean = pathname.replace(/\/+$/, "") || "/";
  return clean === "/docs" ? "/docs" : "/";
}

function decodeHtml(s: string): string {
  return s
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/\s*#\s*$/, "")
    .trim();
}

export function extractDocHeadings(docsHtml: string): DocHeading[] {
  const out: DocHeading[] = [];
  const re = /<h([23])\s+id="([^"]+)">([\s\S]*?)<\/h\1>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(docsHtml))) {
    const level = Number(m[1]) as 2 | 3;
    const id = m[2];
    const title = decodeHtml(m[3]);
    if (title) out.push({ id, title, level });
  }
  return out;
}

export function searchDocs(headings: DocHeading[], query: string): DocHeading[] {
  const q = query.trim().toLowerCase();
  if (!q) return headings.slice(0, 24);
  return headings.filter((h) => h.title.toLowerCase().includes(q) || h.id.toLowerCase().includes(q)).slice(0, 32);
}
