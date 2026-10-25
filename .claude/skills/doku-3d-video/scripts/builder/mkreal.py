# Aufruf aus dem Projektordner: python3 <skill>/scripts/builder/mkreal.py <skill>/scripts/builder
import sys
S = sys.argv[1]
base = open(S + "/base-helpers.js").read()
a = base.index("      // Gliederpuppen-Figur"); b = base.index("      function sun(")
base = base[:a] + base[b:]
T = "/home/user/kambax-tiktok/.claude/skills/doku-3d-video/templates/"
rd = lambda p: open(p).read()
fig = rd(T + "figuren.js"); bs = rd(T + "bausteine.js"); fx = rd(S + "/fx-helpers.js")
neu = "\n".join(rd(T + f) for f in ["render.js", "fassaden.js", "effekte.js", "tiere.js"])
src = rd("/home/user/kambax-tiktok/projekte/asteroid/compositions/welt.html")
head = src.split("      // ---------- Zeitplan")[0]
body = '''      const SHOTS = [{ id: "stadt", t0: 0, t1: 1 }, { id: "fassade", t0: 1, t1: 2 }, { id: "tiere", t0: 2, t1: 3 }, { id: "schuhe", t0: 3, t1: 4 }, { id: "nacht", t0: 4, t1: 5 }, { id: "feuer", t0: 5, t1: 6 }]; const DUR = 6;
''' + base + "\n" + fx + "\n" + fig + "\n" + bs + "\n" + neu + '''
      const POST = nachbearbeitung(renderer, { bloom: 0.6 });
      const TYPEN = ["glas", "modern", "ziegel", "beton", "platte", "glas"];
      function stadt(s, nacht) {
        const r = rng(nacht ? 77 : 33);
        box(600, 0.1, 600, M(0x3a3c3e, { roughness: 0.95 }), 0, -0.12, -100, s);
        strasse(s, 150, { zebraZ: -20 });
        const haeuser = [];
        for (const seite of [-1, 1]) { let z = 4, i = 0;
          while (z > -140) { const w = 16 + Math.floor(r() * 10), d = 14, typ = TYPEN[(i + (seite > 0 ? 3 : 0)) % TYPEN.length];
            const h = hochhaus(seite * 100 + i + (nacht ? 0 : 0), { typ, w, d, etagen: typ === "ziegel" ? 6 + Math.floor(r() * 3) : 10 + Math.floor(r() * 14), nacht, licht: nacht ? 0.45 : 0.3 });
            h.rotation.y = -seite * Math.PI / 2; h.position.set(seite * (7.6 + d / 2), 0, z - w / 2); s.add(h); haeuser.push(h); z -= w + 1.5; i++; } }
        const sky = skyline(s, 9, nacht ? 5 : 6, { nacht, licht: 0.4, aufl: 0.35, a0: -0.35, a1: 0.35, r0: 170, r1: 40, z: -20 });
        for (let k = 0; k < 4; k++) { laterne(s, -4.0, -4 - k * 22, -1, nacht); laterne(s, 4.0, -15 - k * 22, 1, nacht); }
        const cars = []; [["limo", -1.75, -9, 0, 0xc8302a], ["kleinwagen", 1.75, -20, Math.PI, 0x2a4a7a], ["transporter", 1.75, -34, Math.PI, 0xf2f2f0], ["limo", -1.75, -40, 0, 0x2a2a2c], ["bus", 1.75, -60, Math.PI, 0xd8a838]]
          .forEach(([t, x, z, ry, f], k) => { const c = autoPlus(auto(40 + k, t, f), { licht: nacht, seed: k, spot: nacht && k < 3 }); c.position.set(x, 0, z); c.rotation.y = ry; s.add(c); cars.push(c); });
        return { haeuser, sky, cars, update(T) { haeuser.forEach((h) => h.userData.update(T)); sky.update(T); } };
      }
      // ===== Tag =====
      (function () {
        const s = new THREE.Scene();
        const sonne = [-0.45, 0.62, 0.35]; const him = himmelShader(s, { zeit: "tag", wolken: 0.5, sonne }); s.fog = new THREE.Fog(0xa8c0dc, 80, 320);
        s.add(new THREE.HemisphereLight(0xdfeaff, 0x5a5a50, 0.35)); const d = sun(s, 0xfff2da, 2.6, [-45, 62, 35], 45); d.shadow.mapSize.set(4096, 4096); d.shadow.camera.far = 200; d.target.position.set(0, 0, -20);
        umgebung(s, him);
        const st = stadt(s, false);
        const ppl = [];
        [[801, { kind: "f", hair: "lang", top: "langarm", unten: "hose", schuhe: "sneaker" }, -5.4, -6, Math.PI], [802, { kind: "m", hair: "kurz", bart: "dreitage", top: "hoodie", unten: "hose" }, -6.2, -11, 0.3],
         [803, { kind: "m", hair: "seitenscheitel", top: "hemd", unten: "hose", schuhe: "halbschuh" }, 5.4, -8, Math.PI], [804, { kind: "f", hair: "bob", top: "pulli", unten: "rock", schuhe: "stiefel" }, 5.9, -14, 0]]
          .forEach(([sd, o, x, z, ry]) => { const p = person(sd, o); p.position.set(x, 0.14, z); p.rotation.y = ry; s.add(p); ppl.push(p); });
        // Tiere auf dem Gehweg
        const tiere = []; ["labrador", "schaeferhund", "dackel", "mops", "husky", "pudel", "beagle"].forEach((ra, k) => { const h = hund(10 + k, { rasse: ra, hecheln: k % 2 === 0 }); h.position.set(-6.4 + (k % 2) * 1.0, 0.14, -4.5 - k * 0.9); h.rotation.y = 0.9 + (k % 3) * 0.3; s.add(h); tiere.push(h); });
        const katzen = [0, 1, 2].map((k) => { const c = katze(20 + k, { fell: ["rot", "getigert", "schwarz"][k] }); c.position.set(-4.6 - k * 0.5, 0.14, -9.3 - k * 0.6); c.rotation.y = 1.4; s.add(c); return c; });
        if (katzen[2]) tierSitzen(katzen[2]);
        const tauben = []; for (let k = 0; k < 6; k++) { const t = taube(30 + k); t.position.set(-4.4 + (k % 3) * 0.35, 0.14, -6.2 - Math.floor(k / 3) * 0.4 - k * 0.12); t.rotation.y = k * 1.1; s.add(t); tauben.push(t); }
        // Schuh-Nahaufnahme: zwei stehende Figuren
        const f1 = person(860, { kind: "m", top: "tshirt", unten: "hose", schuhe: "sneaker", farbeUnten: 0x3a5a8a }), f2 = person(861, { kind: "f", top: "pulli", unten: "hose", schuhe: "halbschuh", farbeUnten: 0x2a2a2c });
        f1.position.set(5.2, 0.14, -2.6); f1.rotation.y = -0.5; f2.position.set(6.0, 0.14, -3.2); f2.rotation.y = -0.9; s.add(f1, f2);
        const c1 = cam(), c2 = cam(), c3 = cam(), c4 = cam();
        function upd(T) { him.update(T); st.update(T); ppl.forEach((p, k) => { if (k % 2 === 0) walk(p, T + k, 0.8); else idle(p, T + k); }); idle(f1, T); idle(f2, T + 1);
          tiere.forEach((h, k) => (k === 2 ? tierLaufen(h, T, 1.4) : tierIdle(h, T + k))); katzen.forEach((c, k) => k < 2 && tierIdle(c, T + k)); tauben.forEach((t, k) => taubePicken(t, T + k * 0.7)); }
        W.stadt = { scene: s, camera: c1, update(t, T) { c1.position.set(2.6, 1.7, 9); c1.lookAt(-1.5, 9, -45); upd(T); } };
        W.fassade = { scene: s, camera: c2, update(t, T) { c2.position.set(2.5, 1.6, -6); c2.lookAt(-14, 22, -22); upd(T); } };
        W.tiere = { scene: s, camera: c3, update(t, T) { c3.position.set(-2.6, 0.75, -3.4); c3.lookAt(-5.4, 0.3, -7.6); upd(T); } };
        W.schuhe = { scene: s, camera: c4, update(t, T) { c4.position.set(4.3, 0.45, -1.0); c4.lookAt(5.5, 0.25, -2.9); upd(T); } };
      })();
      // ===== Nacht, Regen, Feuer =====
      (function () {
        const s = new THREE.Scene();
        const mond = [0.35, 0.55, -0.75]; const him = himmelShader(s, { zeit: "nacht", wolken: 0.25, sonne: mond, stadtLicht: 0.6 }); s.fog = new THREE.Fog(0x0a0f1a, 40, 260);
        s.add(new THREE.HemisphereLight(0x2a3a5a, 0x0a0a0e, 0.18)); const d = sun(s, 0x8aa0d0, 0.25, [25, 40, -50], 40);
        umgebung(s, him);
        const st = stadt(s, true);
        s.traverse((m) => { if (m.isMesh && m.geometry.type === "BoxGeometry" && m.position.y < 0.1 && m.position.y > -0.1 && m.geometry.parameters.height <= 0.16) nass(m.material, 0.85); });
        [[-1.5, -6], [2.2, -11], [-2.4, -17], [1.0, -28], [-0.5, -40]].forEach(([x, z], k) => pfuetze(s, x, z, 0.9 + (k % 2) * 0.6));
        const ppl = [];
        const a1 = person(901, { kind: "f", hair: "lang", top: "langarm", jacke: true, unten: "hose" }); a1.position.set(-5.4, 0.14, -5); a1.rotation.y = Math.PI; regenschirm(a1, 0xc8302a); s.add(a1); ppl.push(a1);
        const a2 = person(902, { kind: "m", hair: "kurz", top: "hoodie", jacke: true }); a2.position.set(5.6, 0.14, -12); a2.rotation.y = Math.PI; regenschirm(a2, 0x1e2a44); s.add(a2); ppl.push(a2);
        const hd = hund(77, { rasse: "labrador" }); hd.position.set(-4.8, 0.14, -5.6); hd.rotation.y = Math.PI; s.add(hd);
        const rain = regen(s, -9, 9, -34, 8, 14, 5000, 99); const spr = regenSpritzer(s, -6, 6, -30, 6, 220, 4, 0.03);
        // Brennendes Autowrack + Mülltonne
        const wrack = auto(90, "kleinwagen", 0x1a1a1a); wrack.position.set(-1.8, 0, -52); wrack.rotation.y = 0.4; s.add(wrack);
        const f1 = feuer(s, -1.8, 1.1, -52, { breite: 3.2, hoehe: 3.4, seed: 2, licht: 6, glut: 120 }); const f2 = feuer(s, 3.8, 0.75, -49, { breite: 0.8, hoehe: 1.4, seed: 5, licht: 2, rauch: false });
        muelleimer(s, 3.8, -49);
        const zus = []; [[1.5, -46.5, -2.6], [2.5, -46, -2.9], [-4.8, -45.5, 2.6]].forEach(([x, z, ry], k) => { const p = person(950 + k, { jacke: true }); p.position.set(x, 0.14, z); p.rotation.y = ry; s.add(p); zus.push(p); });
        const c1 = cam(), c2 = cam();
        function upd(T) { him.update(T); st.update(T); ppl.forEach((p, k) => walk(p, T + k, 0.7)); tierLaufen(hd, T, 1.1); zus.forEach((p, k) => idle(p, T + k)); rain.update(T); spr.update(T); f1.update(T, W.cur); f2.update(T, W.cur); }
        W.nacht = { scene: s, camera: c1, update(t, T) { c1.position.set(-3.8, 1.6, 6); c1.lookAt(-0.5, 5, -45); W.cur = c1; upd(T); } };
        W.feuer = { scene: s, camera: c2, update(t, T) { c2.position.set(4.5, 1.7, -38); c2.lookAt(-0.5, 1.6, -52); W.cur = c2; upd(T); } };
      })();
      function renderAt(T) { let sh = SHOTS[SHOTS.length - 1]; for (const x of SHOTS) if (T >= x.t0 && T < x.t1) { sh = x; break; } const w = W[sh.id]; w.update(T - sh.t0, T); POST.render(w.scene, w.camera); }
      const clock = { t: 0 }; const tl = gsap.timeline({ paused: true });
      tl.fromTo(clock, { t: 0 }, { t: DUR, duration: DUR, ease: "none", onUpdate: () => renderAt(clock.t) }, 0);
      window.addEventListener("hf-seek", (e) => renderAt(e.detail.time)); renderAt(0); window.__timelines["welt"] = tl;
    })();
  </script>
</template>
'''
open("compositions/welt.html", "w").write(head + body); print("ok")
