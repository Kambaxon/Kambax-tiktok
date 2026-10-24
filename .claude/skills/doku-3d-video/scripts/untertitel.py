#!/usr/bin/env python3
"""words.json -> compositions/untertitel.html im Doku-3D-Stil:
kursiv, Phrase fuer Phrase, Woerter leuchten beim Sprechen auf (vorher gedimmt), Schluesselwoerter blau.

  python3 untertitel.py assets/audio/words.json compositions/untertitel.html --blau "Arbeit,Bus,leer" --y 1210
"""
import argparse, html, json, re
ap = argparse.ArgumentParser()
ap.add_argument("words"); ap.add_argument("out")
ap.add_argument("--blau", default="", help="Schluesselwoerter (Komma-getrennt, ohne Satzzeichen)")
ap.add_argument("--y", type=int, default=1210); ap.add_argument("--size", type=int, default=54)
ap.add_argument("--max", type=int, default=5, help="max. Woerter pro Phrase")
a = ap.parse_args()
d = json.load(open(a.words, encoding="utf-8")); W = d["words"]
blau = {b.strip().lower() for b in a.blau.split(",") if b.strip()}
# Originalschreibweise + Satzzeichen aus den Zeilen holen (gleiche Reihenfolge wie words)
toks = []
for li, l in enumerate(d["lines"]):
    for t in l["text"].split():
        if re.sub(r"[^\wÄÖÜäöüß0-9€%]", "", t): toks.append((li, t))
assert len(toks) == len(W), (len(toks), len(W))
phrases, cur = [], []
for w, (li, t) in zip(W, toks):
    core = re.sub(r"[^\wÄÖÜäöüß0-9€%]", "", t)
    if core.upper() != w["text"]:  # Anzeige-Ueberschreibung aus dem Skript, z.B. sechsundvierzig{46}
        t = w["text"] + re.sub(r"^.*?([.,?!:;]*)$", r"\1", t)
    cur.append((w, t))
    if re.search(r"[.,?!:;]$", t) or len(cur) >= a.max:
        phrases.append(cur); cur = []
if cur: phrases.append(cur)
out = []
for i, ph in enumerate(phrases):
    s = ph[0][0]["start"] - 0.06
    nxt = phrases[i + 1][0][0]["start"] - 0.06 if i + 1 < len(phrases) else None
    e = ph[-1][0]["end"] + 0.35
    if nxt is not None: e = min(max(e, ph[-1][0]["end"] + 0.1), nxt) if nxt - ph[-1][0]["end"] < 0.6 else min(e, nxt)
    spans = []
    for w, t in ph:
        cls = "w b" if re.sub(r"[^\wÄÖÜäöüß]", "", t).lower() in blau else "w"
        spans.append(f'<span class="{cls}" data-t="{w["start"]}">{html.escape(t)}</span>')
    out.append(f'    <div id="ut-{i}" class="clip ut" data-start="{s:.3f}" data-duration="{e - s:.3f}" data-track-index="1"><p>{" ".join(spans)}</p></div>')
doc = f"""<template>
  <style>
    @font-face {{ font-family: "Open Sans Doku"; src: url("assets/fonts/open-sans-latin-700-italic.woff2") format("woff2"); font-weight: 700; font-style: italic; }}
    #root {{ position: absolute; inset: 0; pointer-events: none; }}
    .ut {{ position: absolute; left: 0; width: 100%; top: {a.y - 90}px; height: 180px; display: flex; align-items: center; justify-content: center; }}
    .ut p {{ width: 900px; text-align: center; font-family: "Open Sans Doku", sans-serif; font-style: italic; font-weight: 700;
             font-size: {a.size}px; line-height: 1.22; color: #fff; text-shadow: 0 3px 12px rgba(0,0,0,.55), 0 1px 2px rgba(0,0,0,.6); }}
    .ut .w {{ display: inline-block; }}
    .ut .b {{ color: #6cc0ff; }}
  </style>
  <div id="root" data-composition-id="untertitel" data-width="1080" data-height="1920" data-layout-allow-caption-zone>
{chr(10).join(out)}
  </div>
  <script>
    const tl = gsap.timeline({{ paused: true }});
    document.querySelectorAll(".ut").forEach((ph) => {{
      const s = parseFloat(ph.dataset.start);
      tl.fromTo(ph.firstElementChild, {{ opacity: 0, y: 8 }}, {{ opacity: 1, y: 0, duration: 0.14, ease: "power2.out" }}, s);
      ph.querySelectorAll(".w").forEach((w) => {{
        tl.fromTo(w, {{ opacity: 0.5 }}, {{ opacity: 1, duration: 0.08, ease: "none" }}, Math.max(s, parseFloat(w.dataset.t) - 0.02));
      }});
    }});
    window.__timelines["untertitel"] = tl;
  </script>
</template>
"""
open(a.out, "w", encoding="utf-8").write(doc); print(f"{len(phrases)} Phrasen -> {a.out}")
