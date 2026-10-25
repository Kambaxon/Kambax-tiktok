# Baut compositions/welt.html aus allen Vorlagen + einer Szenen-Datei.
# Aufruf im Projektordner: python3 <skill>/scripts/builder/bauen.py <szenen.js>
# Szenen-Datei: SHOTS, DUR, W.<id> = { scene, camera, look, post: { uName: wert }, update(t, T) }.
import sys
B = "/home/user/kambax-tiktok/.claude/skills/doku-3d-video/scripts/builder/"
T = "/home/user/kambax-tiktok/.claude/skills/doku-3d-video/templates/"
rd = lambda p: open(p).read()
base = rd(B + "base-helpers.js"); a = base.index("      // Gliederpuppen-Figur"); b = base.index("      function sun("); base = base[:a] + base[b:]
libs = [B + "fx-helpers.js", T + "figuren.js", T + "bausteine.js", T + "render.js", T + "materialien.js", T + "fassaden.js", T + "effekte.js", T + "tiere.js",
        T + "fahrzeuge.js", T + "stadt2.js", T + "natur2.js", T + "flugzeuge.js", T + "tiere2.js", T + "gebaeude.js", T + "natur3.js", T + "leben.js", T + "innen2.js", T + "typo.js", T + "kamera.js", T + "effekte2.js"]
lib = base + "\n" + "\n".join(rd(p) for p in libs)
head = rd("/home/user/kambax-tiktok/projekte/asteroid/compositions/welt.html").split("      // ---------- Zeitplan")[0]
tail = '''
      const _vp = new THREE.Matrix4();
      function renderAt(T) { let sh = SHOTS[SHOTS.length - 1]; for (const x of SHOTS) if (T >= x.t0 && T < x.t1) { sh = x; break; } const w = W[sh.id]; WIND.staerke.value = 1;
        Object.entries(POST_STANDARD).forEach(([k, v]) => (POST.uniforms[k].value = v)); POST.look(w.look ?? "neutral"); Object.entries(w.post || {}).forEach(([k, v]) => (POST.uniforms[k].value = v));
        let vorher = null; if (POST.uniforms.uBewegung.value > 0) { wind(T - 1 / 30); w.update(T - sh.t0 - 1 / 30, T - 1 / 30); w.camera.updateMatrixWorld(); _vp.multiplyMatrices(w.camera.projectionMatrix, w.camera.matrixWorldInverse); vorher = _vp; }
        wind(T); w.update(T - sh.t0, T); w.camera.updateMatrixWorld(); POST.render(w.scene, w.camera, T, vorher); }
      const clock = { t: 0 }; const tl = gsap.timeline({ paused: true });
      tl.fromTo(clock, { t: 0 }, { t: DUR, duration: DUR, ease: "none", onUpdate: () => renderAt(clock.t) }, 0);
      window.addEventListener("hf-seek", (e) => renderAt(e.detail.time)); renderAt(0); window.__timelines["welt"] = tl;
    })();
  </script>
</template>
'''
post = "\n      const POST = nachbearbeitung(renderer, { bloom: 0.5 });\n      const POST_STANDARD = {}; Object.entries(POST.uniforms).forEach(([k, u]) => { if (typeof u.value === \"number\") POST_STANDARD[k] = u.value; });\n      const POST_AUS = {}; // (alt) – alle Effekte werden pro Shot automatisch auf Standard zurückgesetzt\n"
open("compositions/welt.html", "w").write(head + lib + post + rd(sys.argv[1]) + tail); print("ok")
