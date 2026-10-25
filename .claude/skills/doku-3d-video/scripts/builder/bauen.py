import sys
# Baut compositions/welt.html aus allen Vorlagen + einer Szenen-Datei.
# Aufruf im Projektordner: python3 <skill>/scripts/builder/bauen.py <szenen.js>
S = None
B = "/home/user/kambax-tiktok/.claude/skills/doku-3d-video/scripts/builder/"
T = "/home/user/kambax-tiktok/.claude/skills/doku-3d-video/templates/"
rd = lambda p: open(p).read()
base = rd(B + "base-helpers.js"); a = base.index("      // Gliederpuppen-Figur"); b = base.index("      function sun("); base = base[:a] + base[b:]
fig = rd(T + "figuren.js")
extra = "\n".join(rd(T + f) for f in ["fahrzeuge.js", "stadt2.js", "natur2.js", "flugzeuge.js", "tiere2.js"])
lib = base + "\n" + rd(B + "fx-helpers.js") + "\n" + fig + "\n" + rd(T + "bausteine.js") + "\n" + "\n".join(rd(T + f) for f in ["render.js", "fassaden.js", "effekte.js", "tiere.js"]) + "\n" + extra
head = rd("/home/user/kambax-tiktok/projekte/asteroid/compositions/welt.html").split("      // ---------- Zeitplan")[0]
szenen = rd(sys.argv[1])
tail = '''
      function renderAt(T) { let sh = SHOTS[SHOTS.length - 1]; for (const x of SHOTS) if (T >= x.t0 && T < x.t1) { sh = x; break; } const w = W[sh.id]; w.update(T - sh.t0, T); POST.render(w.scene, w.camera); }
      const clock = { t: 0 }; const tl = gsap.timeline({ paused: true });
      tl.fromTo(clock, { t: 0 }, { t: DUR, duration: DUR, ease: "none", onUpdate: () => renderAt(clock.t) }, 0);
      window.addEventListener("hf-seek", (e) => renderAt(e.detail.time)); renderAt(0); window.__timelines["welt"] = tl;
    })();
  </script>
</template>
'''
open("compositions/welt.html", "w").write(head + lib + "\n      const POST = nachbearbeitung(renderer, { bloom: 0.5 });\n" + szenen + tail); print("ok")
