      const SHOTS = ["stadt", "fenster", "land", "gesichter", "autoinnen", "wohnung", "nacht", "gewitter", "schnee", "himmel", "typo"].map((id, i) => ({ id, t0: i * 2, t1: i * 2 + 2 })); const DUR = SHOTS.length * 2;
      const P = (o) => Object.assign({}, POST_AUS, o);
      // ===== 1+2: Urbane Straßenschlucht am Tag (Mehrfamilienhäuser, Klinker, Glas, Loft, Mixed-Use) =====
      (function () {
        const s = new THREE.Scene(); const him = himmelShader(s, { zeit: "tag", wolken: 0.5, wolkenTyp: "cumulus", sonne: [-0.35, 0.55, -0.75] }); s.fog = new THREE.Fog(0xb8cce0, 90, 380);
        s.add(new THREE.HemisphereLight(0xdde8ff, 0x9a9a90, 0.95)); const d = sun(s, 0xfff0d8, 2.6, [-30, 50, -65], 50); d.shadow.mapSize.set(4096, 4096); d.shadow.camera.far = 220; d.target.position.set(0, 0, -25); umgebung(s, him);
        box(600, 0.1, 600, material("asphalt", { wiederholen: [60, 60] }), 0, -0.12, -100, s); strasse(s, 150, { zebraZ: -16 }); strassenSchaeden(s, 140, 3);
        const links = [["mfh", "putz"], ["mfh", "klinker"], ["loft"], ["mfh", "vhf"], ["mfh", "putz"]], rechts = [["mfh", "klinker"], ["reihen"], ["mfh", "putz"], ["mfh", "vhf"]];
        let z = 4; links.forEach(([t, f], i) => { const h = t === "loft" ? loft(40 + i, {}) : mehrfamilienhaus(40 + i, { fassade: f, etagen: 4 + (i % 3) }); h.rotation.y = Math.PI / 2; const w = h.userData.w; h.position.set(-7.6, 0, z - w / 2); s.add(h); z -= w + 0.3; });
        z = 4; rechts.forEach(([t, f], i) => { const h = t === "reihen" ? reihenhaeuser(60 + i, { anzahl: 4 }) : mehrfamilienhaus(60 + i, { fassade: f, etagen: 5 + (i % 2) }); h.rotation.y = -Math.PI / 2; const w = h.userData.w; h.position.set(t === "reihen" ? 7.6 + 3.2 : 7.6, 0, z - w / 2); s.add(h); z -= w + 0.3; });
        const mt = mixedTower(5, {}); mt.position.set(-40, 0, -175); s.add(mt); const hh = hochhaus(77, { typ: "glas", w: 26, d: 22, etagen: 30 }); hh.position.set(30, 0, -190); s.add(hh);
        for (let k = 0; k < 4; k++) schief(laterne(s, -4.0, -6 - k * 22, -1, false), k);
        ampel(s, -3.9, -14.4, 0, { phase: 3 }); verkehrsschild(s, 4.1, -10, "tempo30", Math.PI); verkehrsschild(s, -4.1, -30, "einbahn", 0, { schief: 1 }); muelltonne(s, -5.4, -8, { fuell: 0.95, seed: 4 }); muelltonne(s, 5.5, -19, { fuell: 0.2, seed: 5 }); muell(s, 0, -12, 8, 30, 9, 0.002);
        const parken = [["stufenheck", -2.6, -24, 0, 0x8ac8b0, "uni"], ["kombi", 2.6, -32, Math.PI, null, "metallic"], ["suv", -2.6, -38, 0, 0x1a1a1c, "matt"]].map(([ty, x, z2, ry, f, la], k) => { const c = fahrzeug(30 + k, ty, { farbe: f ?? undefined, lackArt: la }); c.position.set(x, 0, z2); c.rotation.y = ry; s.add(c); return c; });
        const fahrt = fahrzeug(39, "coupe", { farbe: 0xc8202a, lackArt: "metallic" }); s.add(fahrt); const abg = abgas(fahrt, 2, { staerke: 0.3 });
        const HK = ["europaeisch", "afrikanisch", "asiatisch", "arabisch", "suedasiatisch", "europaeisch"]; const ppl = HK.map((h, k) => { const p = person(2000 + k, { herkunft: h, stil: k === 2 ? "business" : "alltag" }); p.position.set(k % 2 ? 5.3 : -5.3, 0.14, -6 - k * 3); p.rotation.y = k % 2 ? 0 : Math.PI; s.add(p); return p; });
        const hund1 = hund(5, { rasse: "schaeferhund" }); hund1.position.set(-4.6, 0.14, -8); hund1.rotation.y = Math.PI; s.add(hund1);
        const tauben = []; for (let k = 0; k < 7; k++) { const t = taube(40 + k); t.position.set(-1 + (k % 4) * 0.35, 0.0, -3.5 - Math.floor(k / 4) * 0.5); t.rotation.y = k; s.add(t); tauben.push(t); } const flucht = taubenFlucht(tauben, 1.0);
        const dm = dampf(s, 1.6, 0.02, -21, { wind: 0.2 }); const tuete = papierTuete(s, [-3, 0, -6], [3.5, 0, -2], { dauer: 6 }); const laub = laubWind(s, -6.5, -12, 13, 4, 30, { y: 0.0 }); const ws = wolkenSchatten(s, { licht: d, n: 5, bereich: 110, groesse: 16 });
        const c1 = cam(), c2 = cam(); const K1 = { art: "dollyIn", von: [1.5, 1.6, 8], nach: [0.8, 1.7, 2], blick: [-1, 8, -60], dauer: 2, hand: 0.6, fov: 50 };
        function upd(T, t) { him.update(T); ws.update(T); ppl.forEach((p, k) => { const base = -6 - k * 3; p.position.z = k % 2 ? base + ((T * 1.2) % 5) : base - ((T * 1.2) % 5); walk(p, T + k * 0.3, 1); }); hund1.position.z = -8 - ((T * 1.2) % 5); tierLaufen(hund1, T, 1.2);
          const sx = -40 + t * 14; fahrt.position.set(1.75, 0, sx * -1 - 10); fahrt.rotation.y = 0; fahren(fahrt, T, t * 14); abg.update(T); flucht.update(t); dm.update(T); tuete.update(T); laub.update(T); }
        W.stadt = { scene: s, camera: c1, post: P({ uStrahlen: 0.5, uFlare: 0.25 }), update(t, T) { kamera(c1, t, K1); upd(T, t); } };
        W.fenster = { scene: s, camera: c2, post: P({}), update(t, T) { kamera(c2, t, { art: "seitlich", von: [1.5, 2.4, -6], nach: [1.5, 2.7, -14], blickVersatz: [6, 1.4, -2.5], dauer: 2, hand: 0.3, fov: 42 }); upd(T, t); } };
      })();
      // ===== 3: Ländliche Landschaft (Bauernhof Fachwerk, Einfamilienhaus, Bungalow, Bäume, Felder) =====
      (function () {
        const s = new THREE.Scene(); const him = himmelShader(s, { zeit: "abend", wolken: 0.55, wolkenTyp: "altocumulus", sonne: [0.75, 0.22, -0.6] }); s.fog = new THREE.Fog(0xe8c8a8, 80, 700);
        s.add(new THREE.HemisphereLight(0xffe8d0, 0x4a5a2a, 0.4)); const d = sun(s, 0xffc890, 2.6, [70, 22, -60], 60); d.shadow.mapSize.set(4096, 4096); d.shadow.camera.far = 250; umgebung(s, him);
        const ter = gelaende(s, 400, 400, 5, { z: -80, amp: 0.8 }); bergkette(s, { z: -200, abstand: 250, schritt: 200, hoehe: 70, lagen: 3, seed: 8, nah: 0x6a7a5a, fern: 0xc8b0a0, schnee: false });
        const weg = new THREE.Mesh(new THREE.PlaneGeometry(4.5, 300, 4, 60), material("asphalt", { wiederholen: [1, 60] })); weg.rotation.x = -Math.PI / 2; const wp = weg.geometry.attributes.position; for (let i = 0; i < wp.count; i++) { const zz = -wp.getY(i); wp.setX(i, wp.getX(i) + Math.sin(zz * 0.03) * 8); wp.setZ(i, ter.h(wp.getX(i), zz - 80) + 0.04); } weg.geometry.computeVertexNormals(); weg.position.z = -80; weg.receiveShadow = true; s.add(weg);
        const hof = bauernhof(3, {}); hof.position.set(-22, ter.h(-22, -45), -45); hof.rotation.y = 0.5; s.add(hof); const rauch = schornsteinRauch(s, -22 + 1.4, ter.h(-22, -45) + 11.6, -45 - 5.6, { wind: 0.6 });
        const efh = einfamilienhaus2(4, { stil: "fachwerk" }); efh.position.set(18, ter.h(18, -40), -40); efh.rotation.y = -0.5; s.add(efh); const efh2 = einfamilienhaus2(5, { stil: "modern" }); efh2.position.set(30, ter.h(30, -75), -75); efh2.rotation.y = -0.3; s.add(efh2);
        const bung = bungalow(6, {}); bung.position.set(-40, ter.h(-40, -95), -95); bung.rotation.y = 0.3; s.add(bung);
        [["eiche", -6, -18], ["birke", 9, -20], ["kiefer", -12, -60], ["kirsche", 10, -28], ["weide", -9, -30], ["olive", 9, -12], ["zypresse", 12, -55], ["linde", -30, -20], ["eiche", 22, -18]].forEach(([a, x, z2], k) => baum(s, x, z2, a, { y: ter.h(x, z2) - 0.05, seed: k + 2 }));
        hecke(s, -5, -24, 10, { y: ter.h(-5, -24), seed: 2 }); bewuchs(s, -14, -14, 10, 8, 1200, "wildblumen", { hfn: (x, z2) => ter.h(x, z2) }); bewuchs(s, 6, -26, 14, 10, 9000, "weizen", { hfn: (x, z2) => ter.h(x, z2), seed: 4 }); bewuchs(s, -26, -32, 8, 6, 60, "lavendel", { hfn: (x, z2) => ter.h(x, z2) });
        bewuchs(s, -4, -6, 8, 3, 900, "wildblumen", { hfn: (x, z2) => ter.h(x, z2), seed: 7 }); grasAufGelaende(s, ter, -16, -16, 32, 14, 14000, 3, { h: 0.2 });
        const kuehe = [[-14, -40], [-10, -42]].map(([x, z2], k) => { const t = saeugetier(20 + k, "kuh"); t.position.set(x, ter.h(x, z2), z2); t.rotation.y = k * 2; s.add(t); return t; }); const hofhund = hund(9, { rasse: "labrador" }); hofhund.position.set(-17, ter.h(-17, -36), -36); s.add(hofhund);
        const v = vogelFormation(s, -80, 40, -160, 9, { groesse: 0.8, tempo: 7 }); const pb = pusteblumen(s, -3, ter.h(-3, -6) + 0.6, -6, 30);
        const c = cam(); W.land = { scene: s, camera: c, post: P({ uStrahlen: 0.7, uFlare: 0.2 }), update(t, T) { kamera(c, t, { art: "fahrt", weg: [[0, 3.2, 6], [1.5, 2.6, 0], [2.5, 2.4, -6]], blick: [-4, 4, -60], dauer: 2, hand: 0.4, fov: 52 }); him.update(T); rauch.update(T); kuehe.forEach((k) => k.userData.anim(T)); tierIdle(hofhund, T); kopfHeben(hofhund, T, 4 + 1.0); v.update(T); pb.update(T); } };
      })();
      // ===== 4: Gesichter Mann/Frau mit Tiefenschärfe =====
      (function () {
        const s = new THREE.Scene(); const him = himmelShader(s, { zeit: "tag", wolken: 0.4, sonne: [0.5, 0.45, 0.75] }); s.add(new THREE.HemisphereLight(0xeef4ff, 0x6a6458, 0.3)); const d = sun(s, 0xfff0e0, 2.2, [10, 12, 16], 6); umgebung(s, him);
        box(60, 0.1, 60, material("verbundpflaster", { wiederholen: [30, 30] }), 0, -0.05, 0, s); const bg = mehrfamilienhaus(9, { fassade: "klinker" }); bg.position.set(0, 0, -10); s.add(bg); baum(s, -4, -6, "birke", { seed: 3 }); baum(s, 4, -7, "linde", { seed: 4 });
        const L = [["europaeisch", "m", { bart: "dreitage" }], ["europaeisch", "f", {}], ["afrikanisch", "m", {}], ["asiatisch", "f", { schmuck: true }]].map(([h, k, o], i) => { const p = person(3000 + i * 5, Object.assign({ herkunft: h, kind: k, alter: "mittel", jacke: false }, o)); p.position.set((i % 2) * 0.42 - 0.21, 0, Math.floor(i / 2) * -1.2); s.add(p); return p; });
        const c = cam(); W.gesichter = { scene: s, camera: c, post: P({ uDof: 1, uUnscharfAn: 1, uFokus: 1.65, uBlende: 0.35 }), update(t, T) { kamera(c, t, { art: "dollyIn", von: [0.05, 1.67, 2.0], nach: [0.0, 1.66, 1.6], blick: [0, 1.62, 0], dauer: 2, fov: 32, hand: 0.25 }); him.update(T); L.forEach((p, k) => idle(p, T + k)); } };
      })();
      // ===== 5: Auto-Innenraum (Leder, Ambiente-LED, OLED, Panoramadach) am Abend =====
      (function () {
        const s = new THREE.Scene(); const him = himmelShader(s, { zeit: "abend", wolken: 0.3, wolkenTyp: "cirrus", sonne: [-0.6, 0.12, -0.8] }); s.add(new THREE.HemisphereLight(0xffd8c0, 0x3a3030, 0.3)); const d = sun(s, 0xffb070, 2.0, [-40, 8, -50], 12); umgebung(s, him); const innenLicht = new THREE.PointLight(0xffd8b0, 2.0, 3.5, 2); innenLicht.position.set(0, 1.3, -0.2); s.add(innenLicht);
        box(200, 0.1, 200, material("asphalt", { wiederholen: [40, 40] }), 0, -0.05, 0, s); const car = fahrzeug(7, "stufenheck", { farbe: 0x1e2a44, lackArt: "metallic", innen: "leder", innenFarbe: 0x5a3a24, ambiente: 0xff7a3a, holz: true, panorama: true }); s.add(car);
        const fahrer = person(3100, { kind: "f", herkunft: "lateinamerikanisch" }); fahrer.position.set(-0.4, -0.2, 0.25); fahrer.scale.multiplyScalar(1); car.add(fahrer); const u = fahrer.userData;
        const c = cam(); W.autoinnen = { scene: s, camera: c, post: P({ uAnamorph: 0.5 }), update(t, T) { kamera(c, t, { art: "dollyIn", von: [0.0, 1.3, -1.0], nach: [0.0, 1.27, -0.7], blick: [-0.25, 1.0, 1.2], dauer: 2, fov: 70, hand: 0.4 }); him.update(T);
          u.hipL.rotation.x = u.hipR.rotation.x = -1.35; u.kneeL.rotation.x = u.kneeR.rotation.x = 1.25; u.shL.rotation.x = u.shR.rotation.x = -0.9; u.elL.rotation.x = u.elR.rotation.x = -0.5; idle(fahrer, T); u.shL.rotation.x = u.shR.rotation.x = -0.95; } };
      })();
      // ===== 6: Moderne Wohnung mit Sonnenstrahlen und Staub im Licht =====
      (function () {
        const s = new THREE.Scene(); const him = himmelShader(s, { zeit: "tag", wolken: 0.3, sonne: [0.8, 0.35, 0.2] }); s.add(new THREE.HemisphereLight(0xf2f0ea, 0x8a7a6a, 0.3)); const d = sun(s, 0xfff0d8, 2.4, [16, 7, 4], 8); umgebung(s, him);
        const wg = wohnung(s, 3, { art: "wohnen", licht: true, boden: "holzbrett" }); const st = staubLicht(s, 0, 3.4, 0.2, 2.6, -2.5, 2.5, 300, { hell: 1.2, groesse: 0.012 });
        const p = person(3200, { kind: "m", herkunft: "suedasiatisch", stil: "alltag" }); p.position.set(-0.6, -0.31, -2.35); s.add(p); const kat = katze(4, { fell: "grau" }); kat.position.set(0.6, 0, -1.2); s.add(kat);
        const c = cam(); W.wohnung = { scene: s, camera: c, post: P({ uStrahlen: 0.0 }), update(t, T) { kamera(c, t, { art: "orbit", mitte: [-0.3, 0, -1.5], radius: 4.2, hoehe: 1.55, start: 0.5, grad: 0.25, blick: [-0.4, 0.9, -1.6], dauer: 2, fov: 55, hand: 0.3 }); st.update(T); idle(p, T); const u = p.userData; u.hipL.rotation.x = u.hipR.rotation.x = -1.45; u.kneeL.rotation.x = u.kneeR.rotation.x = 1.5; tierIdle(kat, T); } };
      })();
      // ===== 7: Nacht, Regen, Neon, anamorphe Lichtstreifen, Tropfen auf der Scheibe =====
      (function () {
        const s = new THREE.Scene(); const him = himmelShader(s, { zeit: "nacht", wolken: 0.7, wolkenTyp: "stratus", sonne: [0.3, 0.6, -0.7], stadtLicht: 0.8 }); s.fog = new THREE.FogExp2(0x0a0e18, 0.02);
        s.add(new THREE.HemisphereLight(0x2a3a5a, 0x0a0a0e, 0.12)); umgebung(s, him); box(400, 0.1, 400, material("asphaltnass", { wiederholen: [40, 40] }), 0, -0.12, -100, s); strasse(s, 100, { zebraZ: -12 });
        s.traverse((m) => { if (m.isMesh && m.geometry.type === "BoxGeometry" && Math.abs(m.position.y) < 0.1 && m.geometry.parameters.height <= 0.16) nass(m.material, 0.9); });
        let z = 4; for (let i = 0; i < 5; i++) { const h = mehrfamilienhaus(80 + i, { fassade: ["putz", "klinker", "vhf"][i % 3], licht: true, etagen: 5 }); h.rotation.y = Math.PI / 2; h.position.set(-7.6, 0, z - h.userData.w / 2); s.add(h); z -= h.userData.w + 0.3; }
        z = 4; for (let i = 0; i < 5; i++) { const h = mehrfamilienhaus(90 + i, { fassade: ["klinker", "putz"][i % 2], licht: true, etagen: 6 }); h.rotation.y = -Math.PI / 2; h.position.set(7.6, 0, z - h.userData.w / 2); s.add(h); z -= h.userData.w + 0.3; }
        for (let k = 0; k < 4; k++) { laterne(s, -4.0, -4 - k * 20, -1, true); laterne(s, 4.0, -14 - k * 20, 1, true); } [[-1.2, -8], [2, -15], [-0.4, -25]].forEach(([x, z2], k) => pfuetze(s, x, z2, 1 + k * 0.3));
        const neon = text3d(s, "BAR", { x: 7.5, y: 4.2, z: -18, ry: -Math.PI / 2, hoehe: 0.9, neon: 0xff2a8a }); const neon2 = text3d(s, "24/7", { x: -7.5, y: 3.8, z: -30, ry: Math.PI / 2, hoehe: 0.8, neon: 0x2ad8ff });
        const autos = [["fliessheck", -1.75, 0], ["suv", 1.75, Math.PI]].map(([ty, x, ry], k) => { const c = autoPlus(fahrzeug(70 + k, ty, { unterboden: k ? null : 0x3a6aff }), { licht: true, seed: k, spot: k === 0 }); c.position.set(x, 0, -10 - k * 14); c.rotation.y = ry; s.add(c); return { c, sp: reifenSpritzer(c, { seed: k }) }; });
        const rain = regen(s, -8, 8, -40, 6, 14, 5000, 4); const spr = regenSpritzer(s, -6, 6, -30, 6, 220, 5, 0.03); const leute = [0, 1].map((k) => { const p = person(3300 + k, { jacke: true }); p.position.set(k ? 5.4 : -5.4, 0.14, -8 - k * 6); p.rotation.y = k ? 0 : Math.PI; regenschirm(p, k ? 0xc82a2a : 0x2a2a2e); s.add(p); return p; });
        const c = cam(); const scheibe = fensterTropfen(c, 0.9, 1.6, { n: 50 }); scheibe.m.position.set(0, 0, -0.5); s.add(c);
        W.nacht = { scene: s, camera: c, post: P({ uAnamorph: 1.0 }), update(t, T) { kamera(c, t, { art: "dollyIn", von: [0.6, 1.4, 6], nach: [0.3, 1.45, 3], blick: [-0.5, 2.5, -40], dauer: 2, hand: 0.5, fov: 50 }); him.update(T); rain.update(T); spr.update(T); scheibe.update(T); neon.update(T, { flackern: true }); neon2.update(T);
          autos.forEach(({ c: car, sp }, k) => { const st = T * 7; car.position.z = k ? -36 + (st % 40) : -10 - (st % 40); fahren(car, T, st); sp.update(T); }); leute.forEach((p, k) => { walk(p, T + k, 0.8); pose(p, T); }); } };
      })();
      // ===== 8: Gewitter über der Landstraße (Cumulonimbus, Nieselregen, Bäume im Sturm) =====
      (function () {
        const s = new THREE.Scene(); const him = himmelShader(s, { zeit: "gewitter", wolken: 0.9, sonne: [0.2, 0.4, -0.9] }); s.fog = new THREE.Fog(0x2a2c32, 30, 300);
        s.add(new THREE.HemisphereLight(0x5a6070, 0x1a1c1e, 0.35)); const d = sun(s, 0x9aa0b0, 0.5, [10, 30, -40], 30); umgebung(s, him);
        const ter = gelaende(s, 300, 300, 9, { z: -60, amp: 0.6 }); grasAufGelaende(s, ter, -14, -30, 28, 30, 12000, 5, { h: 0.25 });
        const weg = new THREE.Mesh(new THREE.PlaneGeometry(4.5, 200), material("asphaltnass", { wiederholen: [1, 40] })); weg.rotation.x = -Math.PI / 2; weg.position.set(0, ter.h(0, -60) + 0.05, -60); s.add(weg);
        const hof = einfamilienhaus2(12, { stil: "fachwerk", licht: true }); hof.position.set(-12, ter.h(-12, -30), -30); hof.rotation.y = 0.6; s.add(hof);
        [["eiche", 7, -18], ["birke", -6, -12], ["linde", 9, -34], ["kiefer", -18, -45]].forEach(([a, x, z2], k) => baum(s, x, z2, a, { y: ter.h(x, z2), seed: k + 8 }));
        const lp = laterne(s, 3, -10, 1, true); const ns = niesel(s, -10, 10, -30, 6, 14, 7000); const blitz = new THREE.DirectionalLight(0xc8d8ff, 0); blitz.position.set(0, 50, -60); s.add(blitz);
        const c = cam(); W.gewitter = { scene: s, camera: c, post: P({}), update(t, T) { WIND.staerke.value = 3.5; kamera(c, t, { art: "dollyOut", von: [1.5, 1.7, 2], nach: [1.8, 1.9, 6], blick: [-2, 4, -60], dauer: 2, hand: 0.8, fov: 55 });
          him.update(T); ns.update(T); const bl = (t > 1.1 && t < 1.18) || (t > 1.26 && t < 1.3); blitz.intensity = bl ? 6 : 0; him.mat.uniforms.uZen.value.set(bl ? 0.5 : 0.06, bl ? 0.5 : 0.07, bl ? 0.6 : 0.1); } , };
      })();
      // ===== 9: Winterdorf: Schnee, tiefe Wintersonne, Atem in der Kälte =====
      (function () {
        const s = new THREE.Scene(); const him = himmelShader(s, { zeit: "tag", wolken: 0.25, wolkenTyp: "cirrus", sonne: [0.6, 0.12, -0.75] }); s.fog = new THREE.Fog(0xd8e0ea, 60, 400);
        s.add(new THREE.HemisphereLight(0xe0ecff, 0xc8d0e0, 0.55)); const d = sun(s, 0xffd8b0, 2.4, [60, 12, -70], 40); d.shadow.mapSize.set(4096, 4096); umgebung(s, him);
        box(400, 0.1, 400, material("schnee", { wiederholen: [50, 50] }), 0, -0.05, -100, s); const pfad = box(3, 0.02, 200, material("gestreut", { wiederholen: [1, 50] }), 0, 0.01, -80, s);
        const H = [einfamilienhaus2(21, { stil: "fachwerk", licht: true }), einfamilienhaus2(22, { stil: "klassisch", licht: true }), bungalow(23, { licht: true })]; [[-12, -16, 0.5], [12, -22, -0.5], [-14, -45, 0.3]].forEach(([x, z2, ry], i) => { H[i].position.set(x, 0, z2); H[i].rotation.y = ry; s.add(H[i]); });
        const schneeM = material("schnee", { wiederholen: [4, 4] }); H.forEach((h) => h.traverse((m) => { if (!m.isMesh) return; if (m.geometry.type === "ExtrudeGeometry" || m.geometry.type === "ConeGeometry" || (m.material.map && m.material.map.image === matTex("rasen").t.image)) m.material = schneeM; })); // Dächer und Gärten verschneit
        [["kiefer", -4, -26], ["kiefer", 6, -34], ["kiefer", 5, -12], ["zypresse", -6, -9]].forEach(([a, x, z2], k) => baum(s, x, z2, a, { seed: k + 20 }));
        const sn = schnee(s, -15, 15, -40, 6, 14, 4000); const lps = [laterne(s, 2, -6, 1, false)];
        const leute = [person(3400, { kind: "f", jacke: true, herkunft: "europaeisch" }), person(3401, { kind: "m", jacke: true, herkunft: "afrikanisch" })]; leute.forEach((p, k) => { p.position.set(-0.6 + k * 1.1, 0, -4 - k); p.rotation.y = Math.PI * 0.9; s.add(p); }); const atm = leute.map((p) => atem(p));
        const ch = schornsteinRauch(s, -12 + 2.6 * Math.cos(0.5) - 5 * Math.sin(0.5), 13.5, -16 - 5 * Math.cos(0.5) - 2.6 * Math.sin(0.5), { farbe: 0xc8ccd4, wind: 0.3 });
        const c = cam(); W.schnee = { scene: s, camera: c, post: P({ uStrahlen: 0.6 }), update(t, T) { WIND.staerke.value = 0.6; kamera(c, t, { art: "kran", von: [3, 6, 8], nach: [2.4, 1.7, 4], blick: [-2, 2.5, -24], dauer: 2, fov: 55, hand: 0.3 }); him.update(T); sn.update(T); atm.forEach((a) => a.update(T)); leute.forEach((p, k) => walk(p, T + k, 0.6)); ch.update(T); } };
      })();
      // ===== 10: Himmel: Cirrus mit Halo und Kondensstreifen über Feld =====
      (function () {
        const s = new THREE.Scene(); const him = himmelShader(s, { zeit: "tag", wolken: 0.45, wolkenTyp: "cirrus", halo: 1, sonne: [0.25, 0.55, -0.8] }); s.fog = new THREE.Fog(0xa8c0dc, 150, 900); s.add(new THREE.HemisphereLight(0xe8f0ff, 0x5a6a3a, 0.4)); const d = sun(s, 0xfff2e0, 2.2, [10, 60, -80], 30); umgebung(s, him);
        const ter = gelaende(s, 300, 300, 4, { z: -60, amp: 0.5 }); bewuchs(s, -20, -30, 40, 28, 16000, "weizen", { hfn: (x, z2) => ter.h(x, z2), seed: 9 }); baum(s, 8, -40, "eiche", { y: ter.h(8, -40), seed: 4 });
        const jet = flugzeug("a350", { seed: 5, kondens: true, kondensLaenge: 700 }); jet.position.set(-150, 300, -500); jet.rotation.y = Math.PI / 2 - 0.2; s.add(jet);
        const c = camFar(4000); W.himmel = { scene: s, camera: c, post: P({ uFlare: 0.12 }), update(t, T) { WIND.staerke.value = 1; kamera(c, t, { art: "schwenk", pos: [0, 1.4, 4], blickVon: [-0.3, 2.2, -2], blickNach: [0.3, 3.0, -2], dauer: 2, fov: 70 }); him.update(T); jet.position.x = -150 + T * 30; flugzeugUpdate(jet, T); } };
      })();
      // ===== 11: 3D-Typografie in der Straße (wirft Schatten, steht im Raum) =====
      (function () {
        const s = new THREE.Scene(); const him = himmelShader(s, { zeit: "abend", wolken: 0.4, sonne: [-0.5, 0.25, -0.8] }); s.add(new THREE.HemisphereLight(0xffe0c8, 0x4a4038, 0.35)); const d = sun(s, 0xffc890, 2.6, [-40, 18, -60], 25); d.shadow.mapSize.set(4096, 4096); umgebung(s, him);
        box(300, 0.1, 300, material("betonplatten", { wiederholen: [60, 60] }), 0, -0.05, -50, s); const w1 = box(30, 14, 1, material("sichtbeton", { wiederholen: [10, 5] }), 0, 7, -14, s);
        const t1 = text3d(s, "WAS WÄRE", { x: 0, y: 3.4, z: -6, hoehe: 1.1, farbe: 0xf6f2ea, tiefe: 0.18 }), t2 = text3d(s, "WENN?", { x: 0, y: 2.0, z: -6, hoehe: 1.4, farbe: 0x3a8ae8, tiefe: 0.2, metall: 0.3 });
        const c = cam(); W.typo = { scene: s, camera: c, post: P({ uDof: 1, uUnscharfAn: 1, uFokus: 13, uBlende: 0.8 }), update(t, T) { kamera(c, t, { art: "orbit", mitte: [0, 0, -6], radius: 13, hoehe: 2.0, start: -0.3, grad: 0.4, blick: [0, 2.7, -6], dauer: 2, fov: 42, hand: 0.2 }); him.update(T); t1.update(t, { start: 0.1, dauer: 0.7 }); t2.update(t, { start: 0.45, dauer: 0.7 }); } };
      })();
