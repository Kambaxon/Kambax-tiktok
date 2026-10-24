#!/usr/bin/env python3
"""titel.json -> compositions/titel.html: Dachzeile / grosser Countdown-Titel / Unterzeile oben links.

titel.json: [{"start":0,"end":5,"kicker":"26. DEZEMBER 2004, ≈ 10:00 UHR","titel":"Noch 30 Min.","sub":"DAS MEER ZIEHT SICH ZURÜCK","farbe":"#fff"}, ...]
  python3 titel.py titel.json compositions/titel.html
"""
import html, json, sys
T = json.load(open(sys.argv[1], encoding="utf-8"))
blocks = []
for i, t in enumerate(T):
    col = t.get("farbe", "#ffffff")
    blocks.append(f'''    <div id="ti-{i}" class="clip ti" data-start="{t["start"]}" data-duration="{round(t["end"] - t["start"], 3)}" data-track-index="1">
      <div class="k">{html.escape(t.get("kicker", ""))}</div>
      <div class="h" style="color:{col}">{html.escape(t["titel"])}</div>
      <div class="s">{html.escape(t.get("sub", ""))}</div>
    </div>''')
doc = f"""<template>
  <style>
    @font-face {{ font-family: "Open Sans Doku"; src: url("assets/fonts/open-sans-latin-700-normal.woff2") format("woff2"); font-weight: 700; }}
    @font-face {{ font-family: "Open Sans Doku"; src: url("assets/fonts/open-sans-latin-600-normal.woff2") format("woff2"); font-weight: 600; }}
    #root {{ position: absolute; inset: 0; pointer-events: none; }}
    .ti {{ position: absolute; left: 72px; top: 228px; width: 940px; color: #fff; font-family: "Open Sans Doku", sans-serif;
           text-shadow: 0 2px 16px rgba(0,0,0,.55), 0 1px 3px rgba(0,0,0,.5); }}
    .ti .k, .ti .s {{ font-weight: 600; font-size: 32px; letter-spacing: .13em; text-transform: uppercase; line-height: 1.2; }}
    .ti .h {{ font-weight: 700; font-size: 132px; letter-spacing: -0.01em; line-height: 1.08; margin: 6px 0 8px -4px; }}
  </style>
  <div id="root" data-composition-id="titel" data-width="1080" data-height="1920">
{chr(10).join(blocks)}
  </div>
  <script>
    const tl = gsap.timeline({{ paused: true }});
    document.querySelectorAll(".ti").forEach((b) => {{
      const s = parseFloat(b.dataset.start);
      const [k, h, sub] = b.children;
      tl.fromTo(k, {{ opacity: 0 }}, {{ opacity: 1, duration: 0.2 }}, s);
      tl.fromTo(h, {{ opacity: 0, filter: "blur(8px)" }}, {{ opacity: 1, filter: "blur(0px)", duration: 0.2, ease: "power2.out" }}, s + 0.04);
      tl.fromTo(sub, {{ opacity: 0 }}, {{ opacity: 1, duration: 0.2 }}, s + 0.1);
    }});
    window.__timelines["titel"] = tl;
  </script>
</template>
"""
open(sys.argv[2], "w", encoding="utf-8").write(doc); print(f"{len(T)} Titel -> {sys.argv[2]}")
