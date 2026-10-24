#!/usr/bin/env python3
"""words.json -> compositions/untertitel.html (ein Wort pro Einblendung, Referenz-Stil).

  python3 captions.py assets/audio/words.json compositions/untertitel.html --duration 29 --y 1400
"""
import argparse, json, html
ap = argparse.ArgumentParser()
ap.add_argument("words"); ap.add_argument("out")
ap.add_argument("--duration", type=float, required=True)
ap.add_argument("--y", type=int, default=1400, help="vertikale Mitte der Untertitel (px)")
ap.add_argument("--size", type=int, default=68)
a = ap.parse_args()
W = json.load(open(a.words, encoding="utf-8"))["words"]
items = []
for i, w in enumerate(W):
    s = max(0.05, w["start"] - 0.03)
    nxt = W[i + 1] if i + 1 < len(W) else None
    if nxt and nxt["line"] == w["line"]:
        e = nxt["start"] - 0.03
    elif nxt:
        e = min(w["end"] + 0.28, nxt["start"] - 0.05)
    else:
        e = w["end"] + 0.6
    e = max(e, s + 0.12)
    items.append((w["id"], html.escape(w["text"]), round(s, 3), round(e - s, 3)))
divs = "\n".join(
    f'    <div id="cap-{i}" class="clip cap" data-start="{s}" data-duration="{d}" data-track-index="1"><span>{t}</span></div>'
    for i, t, s, d in items)
doc = f"""<template>
  <style>
    @font-face {{ font-family: "Montserrat Black"; src: url("assets/fonts/montserrat-900.woff2") format("woff2"); font-weight: 900; }}
    #root {{ position: absolute; inset: 0; pointer-events: none; }}
    .cap {{ position: absolute; left: 0; width: 100%; top: {a.y - a.size}px; height: {a.size * 2}px;
            display: flex; align-items: center; justify-content: center; overflow: visible; }}
    .cap span {{ display: inline-block; font-family: "Montserrat Black", "Montserrat", sans-serif; font-weight: 900;
                 font-size: {a.size}px; letter-spacing: 0.01em; color: #fff; line-height: 1;
                 text-shadow: 0 4px 0 rgba(0,0,0,.55), 0 0 14px rgba(0,0,0,.55), 0 0 3px rgba(0,0,0,.9); }}
  </style>
  <div id="root" data-composition-id="untertitel" data-width="1080" data-height="1920" data-layout-allow-caption-zone>
{divs}
  </div>
  <script>
    const tl = gsap.timeline({{ paused: true }});
    document.querySelectorAll(".cap").forEach((el) => {{
      const s = parseFloat(el.dataset.start);
      tl.fromTo(el.firstElementChild, {{ scale: 0.82, opacity: 0.4 }}, {{ scale: 1, opacity: 1, duration: 0.09, ease: "back.out(3)" }}, s);
    }});
    window.__timelines["untertitel"] = tl;
  </script>
</template>
"""
open(a.out, "w", encoding="utf-8").write(doc)
print(f"{len(items)} Untertitel -> {a.out}")
