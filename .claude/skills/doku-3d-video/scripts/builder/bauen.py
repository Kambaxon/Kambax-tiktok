# Baut compositions/welt.html aus allen Vorlagen + einer Szenen-Datei.
# Aufruf im Projektordner: python3 <skill>/scripts/builder/bauen.py <szenen.js>
# Die Szenen-Datei definiert SHOTS, DUR und W.<id> = { scene, camera, post: P({...}), update(t, T) }.
import sys
B = "/home/user/kambax-tiktok/.claude/skills/doku-3d-video/scripts/builder/"
T = "/home/user/kambax-tiktok/.claude/skills/doku-3d-video/templates/"
rd = lambda p: open(p).read()
base = rd(B + "base-helpers.js"); a = base.index("      // Gliederpuppen-Figur"); b = base.index("      function sun("); base = base[:a] + base[b:]
libs = [B + "fx-helpers.js", T + "figuren.js", T + "bausteine.js", T + "render.js", T + "materialien.js", T + "fassaden.js", T + "effekte.js", T + "tiere.js",
        T + "fahrzeuge.js", T + "stadt2.js", T + "natur2.js", T + "flugzeuge.js", T + "tiere2.js", T + "gebaeude.js", T + "natur3.js", T + "leben.js", T + "innen2.js", T + "typo.js", T + "kamera.js"]
lib = base + "\n" + "\n".join(rd(p) for p in libs)
head = rd("/home/user/kambax-tiktok/projekte/asteroid/compositions/welt.html").split("      // ---------- Zeitplan")[0]
tail = '''
      function renderAt(T) { let sh = SHOTS[SHOTS.length - 1]; for (const x of SHOTS) if (T >= x.t0 && T < x.t1) { sh = x; break; } const w = W[sh.id]; wind(T); WIND.staerke.value = 1; if (w.post) Object.entries(w.post).forEach(([k, v]) => (POST.uniforms[k].value = v)); w.update(T - sh.t0, T); POST.render(w.scene, w.camera); }
      const clock = { t: 0 }; const tl = gsap.timeline({ paused: true });
      tl.fromTo(clock, { t: 0 }, { t: DUR, duration: DUR, ease: "none", onUpdate: () => renderAt(clock.t) }, 0);
      window.addEventListener("hf-seek", (e) => renderAt(e.detail.time)); renderAt(0); window.__timelines["welt"] = tl;
    })();
  </script>
</template>
'''
post = "\n      const POST = nachbearbeitung(renderer, { bloom: 0.5, tiefe: { fokus: 10, blende: 0.6 }, tiltshift: 0.0001 });\n      const POST_AUS = { uStrahlen: 0, uFlare: 0, uAnamorph: 0, uDof: 0, uTilt: 0, uUnscharfAn: 0 };\n"
open("compositions/welt.html", "w").write(head + lib + post + rd(sys.argv[1]) + tail); print("ok")
