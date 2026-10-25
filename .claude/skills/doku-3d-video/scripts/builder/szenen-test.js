      const SHOTS = ["gesicht1", "gesicht2", "autos", "stadt", "berge", "zivil", "militaer", "tiere1", "tiere2", "wasser", "zimmer"].map((id, i) => ({ id, t0: i, t1: i + 1 })); const DUR = SHOTS.length;
      // ===== Gesichter =====
      (function () {
        const s = new THREE.Scene(); const him = himmelShader(s, { zeit: "tag", wolken: 0.4, sonne: [0.3, 0.5, 0.8] });
        s.add(new THREE.HemisphereLight(0xeef4ff, 0x6a6458, 0.35)); const d = sun(s, 0xfff2e0, 2.0, [8, 14, 18], 6); umgebung(s, him);
        box(40, 0.1, 40, M(0x8a8a86, { roughness: 0.9, map: texPflaster() }), 0, -0.05, 0, s); box(40, 6, 0.3, M(0xb8b0a4, { roughness: 0.9 }), 0, 3, -3, s);
        const defs = [["europaeisch", "m", { bart: "dreitage", unrein: true }], ["afrikanisch", "f", { schmuck: true }], ["asiatisch", "m", {}], ["arabisch", "f", { kopftuch: true }], ["suedasiatisch", "m", { bart: "vollbart" }], ["lateinamerikanisch", "f", { sommersprossen: false }], ["europaeisch", "f", { sommersprossen: true, alter: "alt" }], ["arabisch", "m", { stil: "traditionell" }]];
        const L = defs.map(([h, k, o], i) => { const p = person(1000 + i * 3, Object.assign({ herkunft: h, kind: k, alter: "mittel", jacke: false }, o)); p.position.set((i % 4) * 0.42 - 0.63, 0, Math.floor(i / 4) * -2.2); p.rotation.y = 0; s.add(p); return p; });
        [0, 1].forEach((j) => { const c = cam(); c.fov = 34; c.updateProjectionMatrix(); W["gesicht" + (j + 1)] = { scene: s, camera: c, update(t, T) { const z = j * -2.2; c.position.set(0, 1.66, z + 1.75); c.lookAt(0, 1.6, z); him.update(T); L.forEach((p, k) => idle(p, T + k)); } }; });
      })();
      // ===== Autos: alle Bauformen auf dem Parkplatz =====
      (function () {
        const s = new THREE.Scene(); const him = himmelShader(s, { zeit: "abend", wolken: 0.35, sonne: [-0.7, 0.18, -0.4] });
        s.add(new THREE.HemisphereLight(0xffe8d0, 0x4a4038, 0.35)); const d = sun(s, 0xffc890, 2.4, [-30, 9, -18], 20); d.shadow.mapSize.set(4096, 4096); umgebung(s, him);
        const t = texAsphalt().clone(); t.needsUpdate = true; t.repeat.set(6, 6); box(80, 0.1, 80, M(0xffffff, { map: t, roughness: 0.85 }), 0, -0.05, 0, s);
        const typen = Object.keys(KAROSSEN), felgen = ["speichen5", "vielspeichen", "doppelspeichen", "stahl", "turbine", "offroad"], cars = [];
        typen.forEach((ty, i) => { const c = fahrzeug(20 + i, ty, { felge: ty === "gelaende" ? "offroad" : felgen[i % 5] }); const row = i % 2, col = Math.floor(i / 2); c.position.set(-6 + col * 2.6, 0, row ? -4 : 2.5); c.rotation.y = row ? 0 : Math.PI; if (ty === "stretch") { c.position.set(4, 0, -9.5); c.rotation.y = Math.PI / 2; } s.add(c); cars.push(c);
          box(0.1, 0.01, 5, M(0xf2f2f0, PO), c.position.x + 1.3, 0.003, c.position.z, s); });
        const abg = abgas(cars[0], 3, { staerke: 0.4 });
        const c = cam(); W.autos = { scene: s, camera: c, update(tt, T) { c.position.set(9, 4.2, 10); c.lookAt(-1, 0.6, -1); him.update(T); cars.forEach((k, i) => fahren(k, T + i, 0)); abg.update(T); } };
      })();
      // ===== Stadt: Ampeln, Schilder, Müll, Schäden, Leute aller Herkunft, fahrende Autos mit Abgas, Morgennebel =====
      (function () {
        const s = new THREE.Scene(); const him = himmelShader(s, { zeit: "dunst", wolken: 0.6, sonne: [0.5, 0.25, -0.6] }); nebel(s, 0xc4c8cc, 0.008);
        s.add(new THREE.HemisphereLight(0xdde4ea, 0x5a5650, 0.5)); const d = sun(s, 0xfff0d8, 1.6, [20, 12, -26], 30); umgebung(s, him);
        box(400, 0.1, 400, M(0x3a3c3e, { roughness: 0.95 }), 0, -0.12, -100, s); strasse(s, 120, { zebraZ: -14 }); strassenSchaeden(s, 110, 4);
        let z = 6, i = 0; while (z > -110) { const w = 10 + (i % 3) * 2; const h = altbau(800 + i, w, 5, {}); h.rotation.y = Math.PI / 2; h.position.set(-7.5, 0, z - w / 2); s.add(h); z -= w; i++; }
        z = 6; i = 0; while (z > -110) { const w = 16; const h = hochhaus(900 + i, { typ: ["platte", "beton", "ziegel"][i % 3], w, d: 12, etagen: 7 + (i % 3) * 2 }); h.rotation.y = -Math.PI / 2; h.position.set(7.6 + 6, 0, z - w / 2); s.add(h); z -= w + 1; i++; }
        const amps = [ampel(s, -3.9, -12.2, 0, { phase: 0 }), ampel(s, 3.9, -15.8, Math.PI, { phase: 7 })];
        verkehrsschild(s, -4.1, -3, "stop", 0, { schief: 1 }); verkehrsschild(s, 4.1, -22, "vorfahrt", Math.PI); verkehrsschild(s, -4.1, -26, "tempo30", 0, { schief: -1 }); verkehrsschild(s, 4.1, -32, "parkverbot", Math.PI); verkehrsschild(s, -4.1, -40, "einbahn", 0); verkehrsschild(s, 4.1, -8, "fussgaenger", Math.PI); verkehrsschild(s, -4.1, -48, "baustelle", 0);
        [[-5.6, -6, 1], [5.4, -10, 0.3], [-5.8, -19, 0.95], [5.5, -27, 0.6], [-5.5, -33, 0.1]].forEach(([x, z2, f], k) => muelltonne(s, x, z2, { fuell: f, seed: k + 3 }));
        muell(s, -5.4, -9, 3, 40, 7); muell(s, 5.2, -18, 3, 30, 8); muell(s, 0, -10, 6, 25, 9, 0.002);
        for (let k = 0; k < 4; k++) schief(laterne(s, -4.0, -6 - k * 20, -1, false), k, 1.2);
        const HK = ["europaeisch", "afrikanisch", "asiatisch", "arabisch", "suedasiatisch", "lateinamerikanisch", "europaeisch", "europaeisch"];
        const ppl = HK.map((h, k) => { const p = person(1200 + k, { herkunft: h, stil: k === 2 ? "business" : k === 5 ? "sport" : "alltag", alter: k === 7 ? "alt" : undefined }); p.position.set(k % 2 ? 5.4 : -5.4, 0.14, -4 - k * 2.5); p.rotation.y = k % 2 ? 0 : Math.PI; s.add(p); return p; });
        const cars = [["kombi", -1.75, 0], ["suv", 1.75, Math.PI], ["steilheck", -1.75, 0], ["minivan", 1.75, Math.PI]].map(([ty, x, ry], k) => { const c = autoPlus(fahrzeug(60 + k, ty), { licht: true, spot: false, seed: k }); c.position.set(x, 0, -8 - k * 12); c.rotation.y = ry; s.add(c); return { c, abg: abgas(c, k + 1, { staerke: 0.45 }) }; });
        const nb = nebelSchwaden(s, { x: 0, z: -60, breite: 30, tiefe: 80, y: 0.5, hoehe: 3, dichte: 0.18, groesse: 10 });
        const c = cam(); W.stadt = { scene: s, camera: c, update(t, T) { c.position.set(4.4, 1.65, 3); c.lookAt(-0.5, 2.0, -30); him.update(T); amps.forEach((a) => a.update(T));
          ppl.forEach((p, k) => { const v = 1.2, base = -4 - k * 2.5; p.position.z = k % 2 ? base + ((T * v) % 6) : base - ((T * v) % 6); walk(p, T + k * 0.37, 1); });
          cars.forEach(({ c: car, abg }, k) => { const strecke = T * 6, zz = -6 - ((k * 12 + strecke) % 70); car.position.z = k % 2 ? -76 - zz - 6 : zz; fahren(car, T, strecke); abg.update(T); }); nb.update(T); } };
      })();
      // ===== Berge, Nebel, Weide mit Tieren =====
      (function () {
        const s = new THREE.Scene(); const him = himmelShader(s, { zeit: "tag", wolken: 0.5, sonne: [0.4, 0.45, -0.7] }); s.fog = new THREE.Fog(0xb8c8d8, 120, 1600);
        s.add(new THREE.HemisphereLight(0xe0ecff, 0x5a6a3a, 0.45)); const d = sun(s, 0xfff2da, 2.2, [40, 50, -60], 40); umgebung(s, him);
        const ber = berge(s, { z: -520, breite: 1500, tiefe: 600, hoehe: 260, seed: 5, baeume: 2500 }); bergkette(s, { z: -700, abstand: 300, schritt: 300, hoehe: 160, lagen: 3, seed: 3 });
        const ter = gelaende(s, 160, 160, 3, { z: -60, amp: 0.6 }); grasAufGelaende(s, ter, -20, -30, 40, 30, 20000, 2, { h: 0.2 });
        const bn = bodenNebel(s, { x: 0, z: -260, breite: 900, tiefe: 400, y: 8, hoehe: 30, dichte: 0.4, schichten: 5 });
        const tiere = [["kuh", -4, -22], ["kuh", 2, -26], ["pferd", 6, -20], ["reh", -9, -30], ["fuchs", 0, -16]].map(([a, x, z2], k) => { const t = saeugetier(70 + k, a, {}); t.position.set(x, ter.h(x, z2), z2); t.rotation.y = 0.6 + k; s.add(t); return t; });
        const adler = vogel(3, "adler", { bewegung: "gleiten" }); adler.position.set(-3, 14, -40); s.add(adler);
        const c = camFar(4000); W.berge = { scene: s, camera: c, update(t, T) { c.position.set(0, 2.2, -4); c.lookAt(0, 18, -300); him.update(T); bn.update(T); tiere.forEach((k) => k.userData.anim(T)); adler.userData.anim(T); adler.position.x = -3 + Math.sin(T * 0.3) * 8; adler.rotation.z = Math.cos(T * 0.3) * 0.3; } };
      })();
      // ===== Flugzeuge: zivil und militärisch auf dem Vorfeld =====
      (function () {
        const s = new THREE.Scene(); const him = himmelShader(s, { zeit: "tag", wolken: 0.35, sonne: [0.5, 0.5, 0.6] }); s.fog = new THREE.Fog(0xb8c8dc, 200, 2400);
        s.add(new THREE.HemisphereLight(0xe8f0ff, 0x6a6a64, 0.45)); const d = sun(s, 0xfff2e0, 2.4, [80, 90, 70], 90); d.shadow.camera.far = 400; d.shadow.mapSize.set(4096, 4096); umgebung(s, him);
        box(2000, 0.1, 2000, M(0x9a9a96, { roughness: 0.9, map: texNoise("beton", "#a4a4a0", "#9a9a96", "#b0b0ac", 4000, 3) }), 0, -0.05, 0, s);
        const zivil = [["a350", 0, 0], ["a320", -55, 15], ["atr72", 48, 20], ["bizjet", 30, 55], ["cessna", 10, 62], ["segler", -12, 64], ["ul", -24, 60], ["b747f", -110, -20]];
        const mil = [["eurofighter", 400, 40], ["f35", 425, 40], ["b2", 412, -10], ["a400m", 370, -40], ["awacs", 455, -40], ["x15", 412, 60]];
        const flz = [...zivil, ...mil].map(([ty, x, z], k) => { const f = flugzeug(ty, { seed: k, fahrwerk: true, nachbrenner: ty === "eurofighter" }); const F = FLUG[ty]; f.position.set(x, F.nurfluegel ? 0.6 : F.R * 1.35 + Math.max(0.2, F.R * 0.3) + 0.05, z); f.rotation.y = Math.PI * 0.85; s.add(f); return f; });
        const himmelsJet = flugzeug("a350", { seed: 9, kondens: true, kondensLaenge: 500 }); himmelsJet.position.set(-100, 260, -600); himmelsJet.rotation.y = Math.PI / 2; s.add(himmelsJet);
        const c1 = camFar(4000), c2 = camFar(4000);
        function upd(T) { him.update(T); flz.forEach((f) => flugzeugUpdate(f, T)); himmelsJet.position.x = -100 + T * 40; }
        W.zivil = { scene: s, camera: c1, update(t, T) { c1.position.set(30, 7, 120); c1.lookAt(-10, 10, 0); upd(T); } };
        W.militaer = { scene: s, camera: c2, update(t, T) { c2.position.set(440, 6, 110); c2.lookAt(410, 4, 0); upd(T); } };
      })();
      // ===== Tiere: alle Klassen =====
      (function () {
        const s = new THREE.Scene(); const him = himmelShader(s, { zeit: "tag", wolken: 0.4, sonne: [0.3, 0.6, 0.7] });
        s.add(new THREE.HemisphereLight(0xeef6ff, 0x5a6a3a, 0.45)); const d = sun(s, 0xfff2da, 2.2, [10, 20, 14], 12); umgebung(s, him);
        const ter = gelaende(s, 60, 60, 8, { amp: 0.1, kiesFlecken: true }); grasAufGelaende(s, ter, -8, -8, 16, 12, 9000, 4, { h: 0.12 });
        const A = []; const setz = (t, x, z, ry = 0.4) => { t.position.set(x, ter.h(x, z) + (t.userData.schwebt ?? 0), z); t.rotation.y = ry; s.add(t); A.push(t); return t; };
        // Reihe 1: Vögel + Säuger
        setz(vogel(1, "spatz", { groesse: 2 }), -1.4, -1.5); setz(vogel(2, "rabe"), -0.9, -1.6); setz(vogel(3, "moewe"), -0.3, -1.7); setz(vogel(4, "ente"), 0.3, -1.6); setz(vogel(5, "pinguin"), 0.95, -1.7); setz(vogel(6, "adler"), 1.7, -1.9, -0.3);
        setz(hund(7, { rasse: "beagle" }), -1.8, -3.2); setz(katze(8, { fell: "getigert" }), -0.9, -3.1); setz(saeugetier(9, "fuchs"), 0.2, -3.3); setz(saeugetier(10, "baer", {}), 2.2, -4.5, -0.5);
        const ele = setz(saeugetier(11, "elefant"), -3.5, -9, 0.7);
        // Kleintiere vergrößert (Test), Reptilien, Amphibien, Wirbellose
        const kl = [[reptil(1, "eidechse"), -1.2, 0.2, 3], [reptil(2, "schlange"), -0.4, 0.4, 1.4], [reptil(3, "schildkroete"), 0.4, 0.2, 2], [amphibie(4, "frosch"), 1.1, 0.4, 3], [amphibie(5, "molch"), 1.6, 0.1, 3],
          [insekt(6, "kaefer"), -1.4, 1.1, 8], [insekt(7, "ameise"), -0.9, 1.15, 14], [insekt(8, "biene"), -0.4, 1.1, 10], [insekt(9, "libelle"), 0.2, 1.1, 2.5], [spinnentier(10, "spinne"), 0.8, 1.1, 6], [spinnentier(11, "skorpion"), 1.4, 1.1, 3], [weichtier(12, "schnecke"), 1.9, 1.15, 3]];
        kl.forEach(([t, x, z, gr]) => { t.scale.setScalar(gr); setz(t, x, z, 0.2); });
        setz(reptil(13, "krokodil"), 3.5, -1.5, -1.2);
        const w2 = new THREE.Scene(); w2.background = new THREE.Color(0x0e3a5a); w2.fog = new THREE.FogExp2(0x0e4a6a, 0.09); w2.add(new THREE.HemisphereLight(0x8ad0ff, 0x2a3a2a, 0.9)); const dw = sun(w2, 0xc8f0ff, 1.4, [3, 12, 4], 8);
        box(60, 0.1, 60, M(0xd8c8a0, { roughness: 1, map: texNoise("sand", "#d8c8a0", "#c8b890", "#e8dcc0", 5000, 2) }), 0, -0.05, 0, w2); for (let i = 0; i < 30; i++) { const st = new THREE.Mesh(new THREE.DodecahedronGeometry(0.1 + (i % 4) * 0.08, 0), M(0x6a6a5a)); st.position.set(-3 + (i * 37 % 60) / 10, 0.05, -2 + (i * 53 % 40) / 10); w2.add(st); }
        for (let i = 0; i < 12; i++) { const sg = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.03, 0.8 + (i % 3) * 0.4, 6), M(0x3a7a3a, { roughness: 0.6 })); sg.position.set(-2.5 + i * 0.45, 0.4, -1.5 + (i % 3) * 0.3); sg.rotation.z = Math.sin(i) * 0.2; w2.add(sg); }
        const WA = []; [[fisch(1, "forelle", { groesse: 2 }), -0.9, 0.9, 0.6], [fisch(2, "goldfisch", { groesse: 3 }), 0.6, 1.3, 0.8], [fisch(3, "thunfisch", { groesse: 0.6 }), 0.2, 2.1, -1.0], [fisch(4, "hai", { groesse: 0.6 }), -0.8, 2.8, -2.4], [weichtier(5, "tintenfisch"), 0.9, 0.05, 0.2], [qualle(6), -0.5, 1.6, 1.0], [qualle(7, { farbe: 0xe8a0c0 }), 1.0, 2.2, -0.2]].forEach(([t, x, y, z]) => { t.position.set(x, y, z); t.rotation.y = 1.2; w2.add(t); WA.push(t); });
        const wal1 = saeugetier(8, "wal"); wal1.position.set(-6, 6, -16); wal1.rotation.y = 1.4; w2.add(wal1); WA.push(wal1);
        const c3 = cam(); W.wasser = { scene: w2, camera: c3, update(t, T) { c3.position.set(0.3, 1.2, 4.2); c3.lookAt(0, 1.4, 0); WA.forEach((a) => a.userData.anim(T)); } };
        const c1 = cam(), c2 = cam();
        function upd(T) { him.update(T); A.forEach((t) => t.userData.anim ? t.userData.anim(T) : tierIdle(t, T)); }
        W.tiere1 = { scene: s, camera: c1, update(t, T) { c1.position.set(0.3, 1.5, 3.2); c1.lookAt(0, 0.4, -3); upd(T); } };
        W.tiere2 = { scene: s, camera: c2, update(t, T) { c2.position.set(0.3, 1.3, 4.6); c2.lookAt(0.2, 0.35, 0.9); upd(T); } };
      })();
      // ===== Wohnzimmer am Abend =====
      (function () {
        const s = new THREE.Scene(); s.background = new THREE.Color(0x101418); s.add(new THREE.HemisphereLight(0x8aa0c0, 0x2a2420, 0.25)); const d = sun(s, 0x8ab0e8, 0.6, [20, 8, 4], 6);
        const z = zimmer(s, 5, { art: "wohnzimmer", licht: true, tv: true });
        const p = person(1500, { kind: "f", herkunft: "asiatisch" }); p.position.set(-0.6, -0.2, -1.5); s.add(p); p.userData.hipL.rotation.x = -1.4; p.userData.hipR.rotation.x = -1.4; p.userData.kneeL.rotation.x = 1.4; p.userData.kneeR.rotation.x = 1.4;
        const kat = katze(3, { fell: "rot" }); kat.position.set(0.2, 0.52, -1.9); tierSitzen(kat); s.add(kat);
        const c = cam(); W.zimmer = { scene: s, camera: c, update(t, T) { c.position.set(1.9, 1.5, 0.9); c.lookAt(-0.5, 0.8, -1.5); idle(p, T); const u = p.userData; u.hipL.rotation.x = u.hipR.rotation.x = -1.45; u.kneeL.rotation.x = u.kneeR.rotation.x = 1.5; } };
      })();
