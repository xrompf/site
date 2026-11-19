import test from "node:test";
import assert from "node:assert/strict";
import { paletteFromPixels } from "../scripts/button/palette.mjs";
import { clock, isLight } from "../src/x8r/lib/hooks.ts";
import { extractDocHeadings, normalizeRoute, searchDocs } from "../src/app/mornye-nav.ts";
import { palette } from "../src/render/palette.ts";

test("paletteFromPixels extracts dominant and secondary tones inside circular avatar mask", () => {
  const size = 4;
  const px = new Uint8ClampedArray(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      const bright = x >= 2 && y === 2;
      px[i] = bright ? 240 : 16;
      px[i + 1] = bright ? 200 : 16;
      px[i + 2] = bright ? 220 : 24;
      px[i + 3] = 255;
    }
  }
  const [dom, other] = paletteFromPixels(px, size);
  assert.match(dom, /^#[0-9a-f]{6}$/);
  assert.match(other, /^#[0-9a-f]{6}$/);
  assert.notEqual(dom, other);
});

test("isLight and clock helpers format cleanly", () => {
  assert.equal(isLight("#ffffff"), true);
  assert.equal(isLight("#08080b"), false);
  assert.equal(clock(125_000), "2:05");
  assert.equal(clock(3665_000), "1:01:05");
});

test("normalizeRoute only preserves Home and Docs routes (no downloads/partners)", () => {
  assert.equal(normalizeRoute("/"), "/");
  assert.equal(normalizeRoute("/docs"), "/docs");
  assert.equal(normalizeRoute("/docs/"), "/docs");
  assert.equal(normalizeRoute("/downloads"), "/");
  assert.equal(normalizeRoute("/partners"), "/");
});

test("extractDocHeadings and searchDocs parse and filter documentation sections", () => {
  const sample = `
    <h2 id="intro">Introduction<a class="anchor" href="#intro">#</a></h2>
    <h3 id="http-api">HTTP &amp; API<a class="anchor" href="#http-api">#</a></h3>
  `;
  const headings = extractDocHeadings(sample);
  assert.equal(headings.length, 2);
  assert.equal(headings[0].title, "Introduction");
  assert.equal(headings[1].title, "HTTP & API");
  assert.equal(searchDocs(headings, "http").length, 1);
  assert.equal(searchDocs(headings, "http")[0].id, "http-api");
});

test("Material 3 palette generates light and dark tokens", () => {
  const light = palette("#FF5CA8", "expressive", false);
  const dark = palette("#FF5CA8", "expressive", true);
  assert.match(light.primary, /^#[0-9a-f]{6}$/i);
  assert.match(dark.surface, /^#[0-9a-f]{6}$/i);
  assert.notEqual(light.surface, dark.surface);
});
