      const SHOTS = [{ id: "feld", t0: 0, t1: 4 }]; const DUR = 4;
      (function () {
        const s = new THREE.Scene(); const him = himmelShader(s, { zeit: "tag", wolken: 0.95, wolkenTyp: "stratus", sonne: [-0.3, 0.35, -0.8] }); s.fog = new THREE.Fog(0xa8b0b4, 30, 160);
        s.add(new THREE.HemisphereLight(0xc8d0d8, 0x5a5444, 1.1)); const d = sun(s, 0xf0ece4, 1.2, [-20, 30, -30], 30); d.shadow.mapSize.set(2048, 2048); d.shadow.camera.far = 120; umgebung(s, him);
        const ter = feld(s, { breite: 120, tiefe: 120, seed: 4, matsch: [[0, -6, 4], [3, -12, 3]], spuren: [[-30, 2, 20, -40]] });
        halme(s, ter, { x: 0, z: -4, breite: 24, tiefe: 20, n: 40000, hoehe: 0.3 });
        unkraut(s, ter, -0.9, 3.4, { hoehe: 1.0 }); unkraut(s, ter, 1.2, 3.0, { hoehe: 0.8, seed: 3 });
        kahlerBaum(s, -9, -22, { hoehe: 10 }); kahlerBaum(s, 12, -30, { hoehe: 8, seed: 5 });
        zaun(s, ter, [[-12, -9], [-2, -10], [9, -9]]);
        for (let i = 0; i < 4; i++) { const h = einfamilienhaus ? einfamilienhaus(80 + i, {}) : null; if (h) { h.position.set(-30 + i * 16, ter.h(-30 + i * 16, -60), -60); s.add(h); } }
        const menge = menge3d(s, 14, { x: 0, z: -14, breite: 10, tiefe: 4, ziel: [0, -40] }); menge.liste.forEach((m) => (m.g.position.y = ter.h(m.g.position.x, m.g.position.z)));
        const typen = ["mann", "frau", "arbeiter"].map((typ, i) => mensch3d(s, { typ, x: -1.5 + i * 1.5, z: -3, ry: Math.PI, anim: "walk", rand: 0.5, seed: i + 1 }));
        const c = cam(); c.far = 400; c.updateProjectionMatrix();
        W.feld = { scene: s, camera: c, look: "tagDoku", post: {}, update(t, T) { c.position.set(0.4, 0.9, 4.6); c.lookAt(0, 1.2, -10); c.fov = 40; c.updateProjectionMatrix();
          menge.update(T); typen.forEach((m, i) => { m.update(T); m.g.position.z = -3 - T * 1.2; m.g.position.y = ter.h(m.g.position.x, m.g.position.z); }); } };
      })();
