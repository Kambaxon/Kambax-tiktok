      // ===== „Das Wunder vom Hudson“, 15. Januar 2009 – Flug 1549 =====
      // Schnitte aus den Wortzeiten der Jessica-Aufnahme (assets/audio/words.json)
      const SHOTS = [
        { id: "fenster", t0: 0, t1: 5.55 }, { id: "start", t0: 5.55, t1: 12.3 }, { id: "gaense", t0: 12.3, t1: 18.8 }, { id: "stille", t0: 18.8, t1: 23.55 },
        { id: "gleit", t0: 23.55, t1: 26.55 }, { id: "cockpit", t0: 26.55, t1: 32.2 }, { id: "hudson", t0: 32.2, t1: 34.75 }, { id: "bruecke", t0: 34.75, t1: 39.4 },
        { id: "brace", t0: 39.4, t1: 43.0 }, { id: "wasserung", t0: 43.0, t1: 48.4 }, { id: "rettung", t0: 48.4, t1: 55.1 }, { id: "leer", t0: 55.1, t1: 59.3, hold: true },
        { id: "warumBg", t0: 59.3, t1: 74.8, hold: true }, { id: "schluss", t0: 74.8, t1: 78.6 }];
      const DUR = 78.6;
      (function () {
      const KNALL = 16.66, AUFSETZEN = 46.6;
      const v3 = (x, y, z) => new THREE.Vector3(x, y, z);
      const ease = (k) => { k = clamp(k, 0, 1); return k * k * (3 - 2 * k); };
      function zielen(c, pos, ziel, fov) { c.position.copy(pos); c.lookAt(ziel); if (fov && c.fov !== fov) { c.fov = fov; c.updateProjectionMatrix(); } }
      function wackeln(c, T, staerke) { c.rotation.z += Math.sin(T * 23.1) * 0.004 * staerke + Math.sin(T * 37.7) * 0.002 * staerke; c.rotation.x += Math.sin(T * 29.3) * 0.003 * staerke; }

      // ---------- Stadt als instanzierte Blöcke (billig: wenige Draw Calls, keine Schatten) ----------
      const STADT_M = ["#8a96a4", "#b8b2a6", "#8a5a48", "#d2c6b0", "#5e646c", "#a8b4be"].map((wand, i) => {
        const tex = windowsTex(6, 14, wand, "#ffd9a0", 400 + i, 0.03); tex.anisotropy = 2;
        return new THREE.MeshStandardMaterial({ color: 0xffffff, map: tex, roughness: i === 0 || i === 5 ? 0.35 : 0.85, metalness: i === 0 || i === 5 ? 0.45 : 0 }); });
      const BOX1 = new THREE.BoxGeometry(1, 1, 1); BOX1.translate(0, 0.5, 0);
      function stadt(s, seed, o) { const r = rng(seed), proMat = STADT_M.map(() => []); o.dz = o.dz ?? o.dx * 0.7;
        for (let x = o.x0; x < o.x1; x += o.dx) for (let z = o.z0; z < o.z1; z += o.dz) { if (o.luecke && o.luecke(x, z)) continue; if (r() < (o.leer ?? 0.08)) continue;
          const h = o.h(x, z, r), w = o.dx * (0.55 + r() * 0.35), d = o.dz * (0.55 + r() * 0.35); const mi = h > 120 ? (r() < 0.6 ? (r() < 0.5 ? 0 : 5) : 4) : Math.floor(r() * 4) + 1;
          proMat[mi].push([x + (r() - 0.5) * o.dx * 0.2, o.y ?? 6, z + (r() - 0.5) * o.dz * 0.2, w, h, d]); }
        const m4 = new THREE.Matrix4(), q = new THREE.Quaternion();
        proMat.forEach((liste, mi) => { if (!liste.length) return; const im = new THREE.InstancedMesh(BOX1, STADT_M[mi], liste.length);
          liste.forEach(([x, y, z, w, h, d], i) => im.setMatrixAt(i, m4.compose(v3(x, y, z), q, v3(w, h, d)))); im.castShadow = false; im.receiveShadow = false; im.frustumCulled = false; s.add(im); }); }
      // markanter Art-déco-Turm mit Stufen und Spitze (fiktiv, nur Silhouette)
      function stufenTurm(s, x, z, h, mat) { const g = new THREE.Group(); g.position.set(x, 6, z); s.add(g); let y = 0, w = 60;
        [0.55, 0.2, 0.1, 0.06].forEach((k) => { const hh = h * k; box(w, hh, w * 0.8, mat, 0, y + hh / 2, 0, g); y += hh; w *= 0.7; });
        cyl(1.5, 4, h * 0.12, mat, 0, y + h * 0.06, 0, g, 8); return g; }

      // ---------- Hängebrücke (Silhouette der George-Washington-Brücke, vereinfacht) ----------
      function haengebruecke(s, z) { const g = new THREE.Group(); g.position.set(0, 0, z); s.add(g); const stahl = M(0x9aa2a8, { roughness: 0.55, metalness: 0.35 }), stahlDeck = stahl;
        const XT = 530, HT = 184, DECK = 65, cable = M(0x8a9298, { roughness: 0.5, metalness: 0.5 });
        for (const sx of [-1, 1]) { const tx = sx * XT;
          for (const sz of [-1, 1]) box(9, HT, 9, stahl, tx, HT / 2, sz * 20, g);
          for (let y = 30; y < HT; y += 32) { const b = box(6, 5, 42, stahl, tx, y, 0, g); const k1 = box(4, 40, 4, stahl, tx, y + 14, 0, g); k1.rotation.x = 0.85; const k2 = box(4, 40, 4, stahl, tx, y + 14, 0, g); k2.rotation.x = -0.85; }
          box(40, 8, 60, material("beton_verwittert", { wiederholen: [3, 0.6] }), tx, 4, 0, g); }
        box(2 * XT + 900, 9, 36, stahlDeck, 0, DECK, 0, g); box(2 * XT + 900, 2, 38, M(0x4a4a4c), 0, DECK + 5.5, 0, g);
        const sag = (x) => { const a = Math.abs(x); return a <= XT ? DECK + 12 + (HT - DECK - 12) * (x / XT) ** 2 : HT - (HT - DECK - 8) * Math.min(1, (a - XT) / 450); };
        for (const sz of [-1, 1]) { const pts = []; for (let x = -XT - 450; x <= XT + 450; x += 15) pts.push(v3(x, sag(x), sz * 19)); const tube = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 160, 0.9, 6), cable); g.add(tube);
          const n = Math.floor((2 * XT) / 12); const im = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.15, 0.15, 1, 4), cable, n); const m4 = new THREE.Matrix4(), q = new THREE.Quaternion();
          for (let i = 0; i < n; i++) { const x = -XT + i * 12 + 6, top = sag(x), h = top - DECK; im.setMatrixAt(i, m4.compose(v3(x, DECK + h / 2, sz * 19), q, v3(1, h, 1))); } im.frustumCulled = false; g.add(im); }
        const autos = []; for (let i = 0; i < 24; i++) { const c = box(4.4, 1.5, 1.9, M([0xd8d8d8, 0x2a2a2a, 0x8a2020, 0x2a3a6a, 0xe8e2d0][i % 5], { roughness: 0.4 }), 0, DECK + 7.3, (i % 4 - 1.5) * 3.6, g); autos.push([c, (i * 97) % 1800 - 900, i % 4 < 2 ? 1 : -1]); }
        return { g, DECK, update(T) { autos.forEach(([c, x0, dir]) => { c.position.x = ((x0 + dir * T * 22 + 900) % 1800 + 1800) % 1800 - 900; }); } }; }

      // ---------- Fähre (Pendlerfähre, fiktive Farben) ----------
      function faehre(s, seed) { const g = new THREE.Group(); s.add(g); const r = rng(seed); const weiss = M(0xf2f2ee, { roughness: 0.5 }), blau = M([0x1e4a8a, 0x2a6a9a, 0xd8641e][seed % 3], { roughness: 0.45 });
        const form = new THREE.Shape(); form.moveTo(-3.6, -12); form.lineTo(3.6, -12); form.lineTo(3.8, 6); form.quadraticCurveTo(3.6, 11, 0, 13.5); form.quadraticCurveTo(-3.6, 11, -3.8, 6); form.lineTo(-3.6, -12);
        const rumpf = new THREE.Mesh(new THREE.ExtrudeGeometry(form, { depth: 2.4, bevelEnabled: true, bevelSize: 0.3, bevelThickness: 0.3, bevelSegments: 2 }), blau); rumpf.rotation.x = -Math.PI / 2; rumpf.position.y = -0.6; g.add(rumpf);
        const deck = box(7.2, 2.4, 17, weiss, 0, 3.0, -1.5, g); const fTex = windowsTex(10, 1, "#f2f2ee", "#28343e", seed, 0.9);
        const fM = new THREE.MeshStandardMaterial({ map: fTex, roughness: 0.3 }); box(7.3, 1.2, 15, fM, 0, 3.3, -1.5, g); box(5.2, 2, 5, weiss, 0, 5.2, 1.5, g); box(5.3, 0.8, 5.1, fM, 0, 5.4, 1.5, g);
        box(0.2, 1.4, 0.2, M(0x2a2a2a), 0, 6.9, 1.5, g); const welle = new THREE.Mesh(new THREE.PlaneGeometry(10, 30), new THREE.MeshBasicMaterial({ map: SOFT, color: 0xffffff, transparent: true, opacity: 0.35, depthWrite: false })); welle.rotation.x = -Math.PI / 2; welle.position.set(0, 0.15, -16); g.add(welle);
        return g; }

      // ---------- Kabine (im Flugzeug-Koordinatensystem: Nase +z, Rumpfmitte 0) ----------
      function kabine(jet) { const g = new THREE.Group(); jet.add(g); const R = 1.86, L = 22, Z0 = 2;
        const form = new THREE.Shape(); form.moveTo(Z0 - L / 2, -0.78); form.lineTo(Z0 + L / 2, -0.78); form.lineTo(Z0 + L / 2, 1.05); form.lineTo(Z0 - L / 2, 1.05); form.lineTo(Z0 - L / 2, -0.78);
        const fensterZ = []; for (let zw = Z0 - L / 2 + 0.6; zw < Z0 + L / 2 - 0.6; zw += 0.81) { fensterZ.push(zw); const h = new THREE.Path(); h.absellipse(zw, 0.3, 0.12, 0.17, 0, Math.PI * 2, true); form.holes.push(h); }
        const wandM = M(0xbebcb6, { roughness: 0.75, side: THREE.DoubleSide }), rahmenM = (() => { const m = material("raureif", { farbe: 0xe2e6ea }).clone(); m.side = THREE.DoubleSide; m.metalnessMap = null; m.metalness = 0.15; return m; })(), wg = new THREE.ShapeGeometry(form, 10);
        const ring = new THREE.RingGeometry(1, 1.35, 28);
        for (const sx of [-1, 1]) { const w = new THREE.Mesh(wg, wandM); w.rotation.y = -Math.PI / 2; w.position.x = sx * 1.86; g.add(w);
          fensterZ.forEach((zw) => { const rg = new THREE.Mesh(ring, rahmenM); rg.rotation.y = -Math.PI / 2; rg.scale.set(0.12, 0.17, 1); rg.position.set(sx * 1.85, 0.3, zw); g.add(rg); }); }
        box(3.3, 0.06, L, M(0xeeece6, { roughness: 0.7 }), 0, 1.62, Z0, g);
        box(3.5, 0.08, L, material("kabinenteppich", { wiederholen: [1, 30] }), 0, -0.9, Z0, g);
        for (const sx of [-1, 1]) { const bin = box(0.62, 0.42, L, M(0xeeece6, { roughness: 0.6 }), sx * 1.18, 1.08, Z0, g); bin.rotation.z = sx * 0.35; box(0.08, 0.04, L, new THREE.MeshBasicMaterial({ color: new THREE.Color(1.6, 1.5, 1.3), toneMapped: false }), sx * 0.8, 1.3, Z0, g); }
        const sitzM = M(0x2a3a5e, { roughness: 0.9, map: texStoff("stoff") }), kopfM = M(0xe8e6e0, { roughness: 0.8 }), sitze = [];
        for (let row = 0; row < 22; row++) { const z = Z0 + L / 2 - 2.2 - row * 0.81; for (const sx of [-1, 1]) for (let k = 0; k < 3; k++) { const x = sx * (0.6 + k * 0.48);
          box(0.44, 0.12, 0.46, sitzM, x, -0.42, z, g); const lehne = box(0.44, 0.72, 0.1, sitzM, x, -0.02, z - 0.24, g); lehne.rotation.x = -0.12; box(0.4, 0.14, 0.11, kopfM, x, 0.36, z - 0.28, g); box(0.05, 0.05, 0.4, M(0x5a5e66), x + 0.25, -0.22, z, g);
          sitze.push({ x, y: -0.36, z, row, sx, k }); } }
        const licht = new THREE.PointLight(0xfff1dc, 0.5, 9, 2); licht.position.set(0, 1.2, Z0 + 6); g.add(licht); const l2 = licht.clone(); l2.position.z = Z0; g.add(l2); const l3 = licht.clone(); l3.position.z = Z0 - 6; g.add(l3);
        return { g, sitze, Z0, L }; }
      // Sitzende Figur (Pivot an der Hüfte); vor = Vorbeugen (Brace-Haltung 0..1)
      function sitzend(parent, seed, x, y, z, o = {}) { const piv = new THREE.Group(); piv.position.set(x, y + 0.1, z - 0.05); parent.add(piv); const p = person(seed, o); p.position.y = -0.9; piv.add(p);
        const setze = (vor, T) => { const u = p.userData, lean = vor * 0.95; piv.rotation.x = lean; u.hipL.rotation.x = u.hipR.rotation.x = -Math.PI / 2 - lean + 0.08; u.kneeL.rotation.x = u.kneeR.rotation.x = Math.PI / 2 - 0.05 + lean * 0.3;
          u.shL.rotation.x = u.shR.rotation.x = -0.5 * (1 - vor) - 0.75 * vor; u.elL.rotation.x = u.elR.rotation.x = -0.9 * (1 - vor) - 0.55 * vor; u.shL.rotation.z = -0.1 + vor * 0.12; u.shR.rotation.z = 0.1 - vor * 0.12;
          u.head.rotation.x = vor * 0.5 + Math.sin(T * 0.9 + u.phase) * 0.03 * (1 - vor); u.head.rotation.y = Math.sin(T * 0.5 + u.phase) * 0.2 * (1 - vor); const bl = ((T + u.phase) % 3.7) < 0.12; u.eyes.forEach((e) => (e.scale.y = bl ? 0.1 : 1)); };
        setze(0, 0); return { piv, p, setze }; }
      // einfache Silhouette für hintere Reihen (Kopf + Schultern)
      function silhouette(parent, seed, x, y, z) { const r = rng(seed), g = new THREE.Group(); g.position.set(x, y + 0.1, z); parent.add(g); const haut = M([0xe8c4a8, 0xc89a78, 0x8a5a3a, 0xf0d0b8][Math.floor(r() * 4)], { roughness: 0.6 });
        const ob = cyl(0.18, 0.2, 0.5, M([0x2a2a3a, 0x6a2a2a, 0x3a5a7a, 0x8a8a8a, 0x2a4a3a][Math.floor(r() * 5)], { roughness: 0.9 }), 0, 0.3, 0, g, 16); const k = new THREE.Mesh(new THREE.SphereGeometry(0.11, 16, 12), haut); k.position.y = 0.68; g.add(k);
        const haar = new THREE.Mesh(new THREE.SphereGeometry(0.115, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.55), M([0x2a1a10, 0x6a4a2a, 0x1a1a1a, 0xb8a888][Math.floor(r() * 4)], { roughness: 0.9 })); haar.position.y = 0.7; g.add(haar); return g; }

      // ---------- Cockpit (vereinfacht, Blick über die Schultern) ----------
      function cockpit(jet) { const g = new THREE.Group(); jet.add(g); const Z = 15.2;
        const dunkel = M(0x2a2e34, { roughness: 0.8 }), grau = M(0x5a6068, { roughness: 0.7 });
        box(3.0, 0.7, 0.9, dunkel, 0, -0.35, Z + 1.6, g); const schirm = box(3.0, 0.12, 0.6, M(0x1a1c20, { roughness: 0.9 }), 0, 0.08, Z + 1.55, g);
        const anzeige = (txt, farbe) => canvasTex(256, 256, (c) => { c.fillStyle = "#05080c"; c.fillRect(0, 0, 256, 256); const gr = c.createLinearGradient(0, 0, 0, 128); gr.addColorStop(0, "#2a6ad8"); gr.addColorStop(1, "#4a8ae8"); c.fillStyle = gr; c.fillRect(20, 20, 216, 108); c.fillStyle = "#8a5a2a"; c.fillRect(20, 128, 216, 108);
          c.strokeStyle = "#ffffff"; c.lineWidth = 3; c.beginPath(); c.moveTo(60, 128); c.lineTo(196, 128); c.stroke(); c.fillStyle = farbe; c.font = "bold 26px monospace"; c.fillText(txt, 30, 230); c.strokeStyle = "#f2d22a"; c.lineWidth = 6; c.beginPath(); c.moveTo(100, 128); c.lineTo(156, 128); c.stroke(); });
        [[-1.05, "ENG 1 FAIL", "#ffb020"], [-0.55, "ALT 2800", "#30ff60"], [0.55, "ENG 2 FAIL", "#ffb020"], [1.05, "SPD 210", "#30ff60"]].forEach(([x, t, f]) => { const sc = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.4), new THREE.MeshBasicMaterial({ map: anzeige(t, f), toneMapped: false, color: new THREE.Color(1.3, 1.3, 1.3) })); sc.position.set(x, -0.2, Z + 1.14); sc.rotation.x = -0.25; sc.rotation.y = Math.PI; g.add(sc); });
        const warn = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 0.06), new THREE.MeshBasicMaterial({ color: new THREE.Color(3, 0.6, 0.1), toneMapped: false })); warn.position.set(0, 0.16, Z + 1.24); warn.rotation.y = Math.PI; g.add(warn);
        box(0.5, 0.25, 1.2, (() => { const m = material("alu_eloxiert", { farbe: 0xb8bec6 }).clone(); m.metalness = 0.55; return m; })(), 0, -0.6, Z + 0.7, g); for (const sx of [-1, 1]) { box(0.12, 1.2, 0.12, dunkel, sx * 1.05, 0.75, Z + 1.95, g).rotation.z = sx * 0.35; box(0.1, 0.9, 0.1, dunkel, sx * 1.55, 0.55, Z + 1.2, g).rotation.z = sx * 0.6; }
        box(0.1, 1.0, 0.1, dunkel, 0, 0.75, Z + 2.05, g);
        const sitzM = M(0x2a2a2e, { roughness: 0.85 }); const piloten = [];
        [[-0.55, 7111, "halbglatze", 0xd8d8d4, "schnurrbart"], [0.55, 7112, "kurz", 0x6a4a2a, null]].forEach(([x, sd, fris, hf, bart], i) => { box(0.55, 0.15, 0.55, sitzM, x, -0.55, Z - 0.1, g); box(0.55, 1.0, 0.14, sitzM, x, -0.0, Z - 0.42, g);
          const s2 = sitzend(g, sd, x, -0.48, Z - 0.05, { kind: "m", herkunft: "europaeisch", alter: i ? "mittel" : "alt", hair: fris, hairColor: hf, bart: bart ?? "keiner", stil: "alltag", top: "hemd", farbeOben: 0xf4f4f2, farbeUnten: 0x1a1e2a, brille: false, uhr: true }); piloten.push(s2); });
        const kl = new THREE.PointLight(0xdfe8ff, 0.6, 5, 2); kl.position.set(0, 0.9, Z + 0.4); g.add(kl); return { g, piloten, warn }; }

      // ---------- Szene B: New York, echter Maßstab (Meter). Norden = −z, Hudson entlang z, Manhattan x > 0 ----------
      const B = new THREE.Scene(); const sonneDir = [-0.55, 0.3, 0.78];
      const himB = himmelShader(B, { zeit: "tag", wolken: 0.34, wolkenTyp: "altocumulus", sonne: sonneDir }); B.fog = new THREE.Fog(0xbccadb, 7000, 42000);
      B.add(new THREE.HemisphereLight(0xd6e4ff, 0x4a4e56, 0.62)); const sonneB = sun(B, 0xffe0b4, 2.4, [-550, 300, 780], 40); sonneB.castShadow = false; umgebung(B, himB);
      box(60000, 1, 60000, M(0x3a3e40, { roughness: 1 }), 0, -30, 0, B);
      const landM = M(0x8a8882, { roughness: 0.95, map: texStoff("stoff") }), parkM = M(0x5a6248, { roughness: 1 });
      box(3600, 12, 30000, landM, 700 + 1800, 0, -3000, B); box(5000, 12, 30000, landM, -700 - 2500, 0, -3000, B); for (const sx of [-1, 1]) box(12, 6.5, 30000, material("beton_verwittert", { wiederholen: [2500, 0.6] }), sx * 703, 3, -3000, B);
      const fels = box(60, 90, 13000, material("fels", { wiederholen: [2, 120] }), -730, 39, -9500, B); box(400, 80, 13000, parkM, -960, 40, -9500, B);
      for (let z = -6000; z < 4500; z += 260) box(26, 3, 180, material("beton_verwittert", { wiederholen: [14, 0.3] }), 715 - 70, 1.5, z, B);
      for (let z = 1500; z < 6000; z += 300) box(24, 3, 160, material("beton_verwittert", { wiederholen: [14, 0.3] }), -715 + 70, 1.5, z, B);
      stadt(B, 11, { x0: 760, x1: 3600, dx: 85, z0: -17000, z1: 9000, h: (x, z, r) => { const mid = Math.exp(-(((z - 900) / 2200) ** 2)), dt = Math.exp(-(((z - 7500) / 1500) ** 2)); const k = Math.max(mid, dt);
        return 18 + r() * 40 + k * (60 + r() * 230) * (r() < 0.75 ? 1 : 0.4) + (x < 900 ? -8 : 0); }, luecke: (x, z) => x > 1450 && x < 2300 && z > -4800 && z < -900 });
      box(850, 2, 3900, M(0x5e6a4a, { roughness: 1 }), 1875, 6.6, -2850, B);
      stadt(B, 12, { x0: -3900, x1: -800, dx: 95, z0: -3800, z1: 9000, h: (x, z, r) => 10 + r() * 25 + (z > 5000 ? Math.exp(-(((z - 6500) / 1200) ** 2)) * r() * 150 : 0), leer: 0.15 });
      stadt(B, 13, { x0: -3900, x1: -1000, dx: 110, z0: -18000, z1: -3800, y: 80, h: (x, z, r) => 8 + r() * 22, leer: 0.35 });
      stufenTurm(B, 1850, 1700, 380, M(0xb8b0a0, { roughness: 0.7 }));
      const wasserB = spiegelflaeche(B, 1400, 30000, { y: 0, z: -3000, maske: "voll", staerke: 0.85, rau: 0.18, aufl: 0.5, wasser: { farbe: 0x2c3e46, wellen: 0.4 } });
      const schollen = []; { const r = rng(77); const eisM = M(0xe8eef2, { roughness: 0.6 }); for (let i = 0; i < 70; i++) { const e = new THREE.Mesh(new THREE.CircleGeometry(2 + r() * 6, 7), eisM); e.rotation.x = -Math.PI / 2; e.position.set((r() - 0.5) * 1200, 0.08, -1200 + r() * 2600); e.scale.y = 0.6 + r() * 0.6; B.add(e); schollen.push(e); } }
      const wasserBillig = new THREE.Mesh(new THREE.PlaneGeometry(1400, 30000), M(0x3e5a68, { roughness: 0.12, metalness: 0.0 })); wasserBillig.rotation.x = -Math.PI / 2; wasserBillig.position.set(0, 0, -3000); B.add(wasserBillig);
      function spiegelAn(an) { wasserB.m.visible = an; wasserBillig.visible = !an; B.userData.spiegel = an ? [wasserB] : []; } // Kabine/Cockpit: billiges Glanzwasser statt zweitem Szenen-Render
      const bruecke = haengebruecke(B, -10500);
      // Flugzeug mit Kabine und Cockpit
      const jet = new THREE.Group(); B.add(jet); const a320 = flugzeug("a320", { seed: 1549, farbe: 0x1e3a6a }); jet.add(a320);
      const kab = kabine(jet), ck = cockpit(jet);
      const passagiere = []; kab.sitze.forEach((st, i) => { if (st.row < 4) passagiere.push(sitzend(kab.g, 9000 + i, st.x, st.y, st.z, { jacke: st.row % 2 === 0 })); else passagiere.push({ sil: silhouette(kab.g, 9100 + i, st.x, st.y, st.z) }); });
      const auspuff = a320.userData.auspuff || [];
      const rauch = auspuff.map((p, i) => particles(jet, 140, 50 + i, { x: [p.x - 0.3, p.x + 0.3], y: [p.y - 0.25, p.y + 0.25], z: [p.z - 0.5, p.z], v: [1.2, 0.8, 1.2], drift: [0, 0.8, -16], grav: 0, life: 2.0, color: 0x3c3c3e, size: 8, opacity: 0.6 }));
      const feuer = auspuff.map((p, i) => particles(jet, 60, 70 + i, { x: [p.x - 0.35, p.x + 0.35], y: [p.y - 0.35, p.y + 0.35], z: [p.z - 0.3, p.z + 0.4], v: [1.0, 1.0, 1.0], drift: [0, 0.3, -18], life: 0.45, color: 0xff7a1a, size: 2.4, opacity: 0.95 }));
      const federn = particles(jet, 120, 91, { x: [-7, 7], y: [-2.5, 0], z: [3, 6], v: [6, 4, 6], drift: [0, -2, -30], grav: -2, life: 1.2, color: 0x6a5a48, size: 0.25, opacity: 0.9 });
      const gaense = []; for (let i = 0; i < 26; i++) { const v = vogel(200 + i, "gans", { bewegung: "fliegen" }); v.scale.setScalar(2.2); B.add(v); gaense.push(v); }
      const faehren = [0, 1, 2, 3].map((i) => faehre(B, i)); const flosse = []; const leuteFluegel = [];
      for (let i = 0; i < 16; i++) { const p = person(9500 + i, { jacke: true, herkunft: i % 5 === 0 ? "afrikanisch" : i % 7 === 0 ? "asiatisch" : undefined }); jet.add(p); leuteFluegel.push(p); }
      { const raftM = M(0xf2c21e, { roughness: 0.6 }); for (const sx of [-1, 1]) { const rf = new THREE.Group(); const t = new THREE.Mesh(new THREE.TorusGeometry(2.2, 0.45, 12, 32), raftM); t.rotation.x = Math.PI / 2; t.scale.set(1.4, 1, 1); rf.add(t); const bd = new THREE.Mesh(new THREE.CircleGeometry(2.5, 24), raftM); bd.rotation.x = -Math.PI / 2; bd.scale.x = 1.35; bd.position.y = -0.2; rf.add(bd); rf.position.set(sx * 4.8, -1.6, 12.5); jet.add(rf); flosse.push(rf); } }
      const gischt = particles(B, 420, 33, { x: [-9, 9], y: [0, 2], z: [-6, 6], v: [12, 11, 10], drift: [0, 5, 8], grav: -9, life: 1.5, color: 0xf6f8fa, size: 9, opacity: 0.6 });
      const kielwasser = new THREE.Mesh(new THREE.PlaneGeometry(26, 1), new THREE.MeshBasicMaterial({ map: SOFT, color: 0xffffff, transparent: true, opacity: 0.55, depthWrite: false })); kielwasser.rotation.x = -Math.PI / 2; kielwasser.position.y = 0.2; B.add(kielwasser);
      jet.traverse((o) => { if (o.isMesh) { o.castShadow = false; } });
      const zeigen = (gruppe, an) => gruppe.forEach((x) => (x.visible = an));
      // Flugzeug-Zustand setzen: Position, Kurs (Rad, 0 = Nase nach +z), Nick, Rollen
      function setJet(pos, kurs, nick, rollen) { jet.position.copy(pos); jet.rotation.set(0, 0, 0); jet.rotation.order = "YXZ"; jet.rotation.y = kurs; jet.rotation.x = -nick; jet.rotation.z = rollen; jet.updateMatrixWorld(true); }
      function innenAn(an) { kab.g.visible = an; ck.g.visible = an; }
      function allesAus() { zeigen(gaense, false); zeigen(faehren, false); zeigen(flosse, false); zeigen(leuteFluegel, false); rauch.forEach((r) => (r.pts.visible = false)); feuer.forEach((r) => (r.pts.visible = false)); federn.pts.visible = false; gischt.pts.visible = false; kielwasser.visible = false; innenAn(false); }
      function fans(T, aus) { a320.userData.fanWinkel = aus ? KNALL * 1.6 + (T - KNALL) * 0.5 : T * 1.6; flugzeugUpdate(a320, T); }
      function basisB(T, spiegel = true) { POST.uniforms.uNebelFarbe.value.set(0.74, 0.8, 0.88); himB.update(T); wasserB.update(T); bruecke.update(T); spiegelAn(spiegel); }
      const KLAR = { uSSAA: 1, uBloom: 0.35, uHalation: 0.03, uChroma: 0, uSplit: 0.12, uSplitSchatten: [0.22, 0.42, 0.5], uBokehOval: 0.55, uBokeh: 0.4, uAnamorph: 0.06, uStrahlen: 0.25, uFlare: 0.05, uSchaerfe: 0.4, uKlarheit: 0.24, uRolloff: 0.2, uAO: 0, uKorn: 0, uVig: 0.3 };
      const LUFT = Object.assign({}, KLAR, { uNebel: 0.0022, uNebelHoehe: 90 }); // Höhennebel über dem Fluss (pro Meter, daher sehr klein)

      // ---------- Szene A: LaGuardia, Rollbahn entlang x, Bucht und Skyline im Süden (−z) ----------
      const A = new THREE.Scene(); const sonneA = [-0.35, 0.3, -0.89];
      const himA = himmelShader(A, { zeit: "tag", wolken: 0.15, wolkenTyp: "cirrus", sonne: sonneA }); A.fog = new THREE.Fog(0xc2cfdd, 3500, 30000);
      A.add(new THREE.HemisphereLight(0xd6e4ff, 0x8a8e96, 0.6)); const sA = sun(A, 0xffe2b8, 2.3, [-350, 300, -890], 120); sA.shadow.mapSize.set(2048, 2048); sA.target.position.set(0, 0, 0); umgebung(A, himA);
      box(16000, 1, 4600, material("schnee", { wiederholen: [400, 115], farbe: 0xc8d0d8 }), 0, -0.5, 2050, A);
      const bahnTex = canvasTex(64, 1024, (c) => { c.fillStyle = "#3a3c3e"; c.fillRect(0, 0, 64, 1024); c.fillStyle = "#e8e8e2"; c.fillRect(2, 0, 3, 1024); c.fillRect(59, 0, 3, 1024); for (let y = 0; y < 1024; y += 128) c.fillRect(30, y, 4, 64); }); bahnTex.wrapT = THREE.RepeatWrapping; bahnTex.repeat.set(1, 30); bahnTex.anisotropy = 4;
      const bahn = new THREE.Mesh(new THREE.PlaneGeometry(45, 3200), material("asphalt_spur", { wiederholen: [1, 50] })); bahn.rotation.x = -Math.PI / 2; bahn.rotation.z = Math.PI / 2; bahn.position.set(200, 0.03, 0); A.add(bahn);
      for (const sz of [-1, 1]) for (let x = -1300; x < 1700; x += 9) { const w = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 8), M(0xf4f6f8, { roughness: 0.7 })); w.scale.set(5.5, 0.7 + Math.sin(x * 0.13) * 0.25, 1.6); w.position.set(x, 0.2, sz * 31 + Math.sin(x * 0.07) * 0.8); A.add(w); }
      const kanten = []; for (const sz of [-1, 1]) for (let x = -1300; x < 1700; x += 60) { const g2 = glanzPunkt(0xfff4e0, 1.1); g2.position.set(x, 0.5, sz * 24); A.add(g2); kanten.push(g2); }
      box(16000, 1, 9000, M(0x5a7a8c, { roughness: 0.2, metalness: 0.0 }), 0, -1.5, -4800, A);
      box(300, 22, 80, material("glasfassade"), 900, 11, 380, A); box(260, 8, 120, M(0xb8bcc0, { roughness: 0.7 }), 600, 4, 400, A);
      cyl(5, 7, 50, M(0xc8c8c4, { roughness: 0.7 }), 420, 25, 300, A, 16); cyl(11, 9, 8, material("getoentglas"), 420, 54, 300, A, 16);
      stadt(A, 21, { x0: -9000, x1: -1500, dx: 160, z0: -11500, z1: -8800, y: 0, h: (x, z, r) => { const k = Math.exp(-(((x + 5000) / 1800) ** 2)); return 20 + r() * 50 + k * r() * 280; } });
      stufenTurm(A, -5200, -10400, 380, M(0xb8b0a0, { roughness: 0.7 }));
      const jetA = new THREE.Group(); A.add(jetA); const a320A = flugzeug("a320", { seed: 1549, farbe: 0x1e3a6a, fahrwerk: true }); jetA.add(a320A); const kabA = kabine(jetA);
      const nachbarn = []; kabA.sitze.forEach((st, i) => { if ((st.row === 17 || st.row === 19) && st.sx < 0) nachbarn.push(sitzend(kabA.g, 9300 + i, st.x, st.y, st.z, { jacke: true })); else if (st.row >= 12 && st.row <= 21 && (st.sx > 0 || st.row < 17)) silhouette(kabA.g, 9400 + i, st.x, st.y, st.z); });
      jetA.traverse((o) => { if (o.isMesh) o.castShadow = o.parent === a320A; });
      [a320, a320A].forEach((f) => f.traverse((o) => { if (o.isMesh && o.material && o.material.isMeshStandardMaterial) { o.material.envMapIntensity = 1.8; if (o.material.roughness < 0.5) o.material.roughness = Math.min(o.material.roughness, 0.22); } })); // glänzender Lack/Metall
      const abgasA = (a320A.userData.auspuff || []).map((p) => p);

      // ---------- Shots ----------
      const c = {}; ["fenster", "start", "gaense", "stille", "gleit", "cockpit", "hudson", "bruecke", "brace", "wasserung", "rettung", "schluss"].forEach((k) => { c[k] = camFar(45000); c[k].near = k === "cockpit" || k === "brace" || k === "fenster" ? 0.05 : 1.5; c[k].updateProjectionMatrix(); });
      function hitzeA(cam) { jetA.updateMatrixWorld(true); hitzePunkte(POST, cam, abgasA.map((p) => ({ pos: v3(p.x, p.y, p.z - 3).applyMatrix4(jetA.matrixWorld), radius: 0.07, staerke: 0.8 }))); }

      // 1) Am Fenster: Rollen zur Startbahn, Blick nach rechts über die Tragfläche zur Skyline
      W.fenster = { scene: A, camera: c.fenster, look: "tealOrange", post: Object.assign({}, KLAR, { uDof: 0, uUnscharfAn: 0, uSplit: 0.12, uSplitSchatten: [0.2, 0.4, 0.55] }),
        update(t, T) { himA.update(T); jetA.position.set(200 - t * 6, 2.6, 0); jetA.rotation.set(0, -Math.PI / 2, 0); jetA.updateMatrixWorld(true); a320A.userData.fanWinkel = T * 1.6; flugzeugUpdate(a320A, T);
          nachbarn.forEach((n, i) => n.setze(0, T + i)); const cam = c.fenster; const pz = kabA.Z0 + kabA.L / 2 - 2.2 - 18 * 0.81 - 0.1;
          const lokal = v3(-1.36, 0.36 + Math.sin(t * 0.7) * 0.004, pz + 0.04), ziel = v3(-5, 0.6, pz + 1.5 + t * 0.06); zielen(cam, lokal.applyMatrix4(jetA.matrixWorld), ziel.applyMatrix4(jetA.matrixWorld), 54); cam.rotation.z += Math.sin(t * 9) * 0.0015; } };
      // 2) Start: Abheben über der Bucht, Kamera am Rand der Bahn schwenkt mit
      W.start = { scene: A, camera: c.start, look: "tealOrange", post: Object.assign({}, KLAR, { uSplit: 0.12, uSplitSchatten: [0.2, 0.4, 0.55], uStrahlen: 0.15 }),
        update(t, T) { himA.update(T); const v = 30 + t * 22, x = -500 + 30 * t + 11 * t * t, roh = Math.max(0, t - 3.2), y = 2.6 + roh * roh * 4.5 + roh * 2, nick = Math.min(0.2, Math.max(0, t - 2.9) * 0.18);
          jetA.position.set(x, y, 0); jetA.rotation.set(0, Math.PI / 2, 0); jetA.rotation.order = "YXZ"; jetA.rotation.x = -nick; jetA.updateMatrixWorld(true); a320A.userData.fanWinkel = T * 1.6; flugzeugUpdate(a320A, T);
          const cam = c.start; zielen(cam, v3(-140 + t * 8, 1.6, 95), v3(x + 10, y + 3, 0), 40); hitzeA(cam); } };

      // Flugbahn in B: Vogelschlag nördlich, dann Linkskurve nach Süden über den Hudson, Wasserung bei z = 0
      // 3) Gänse: Kamera vor dem Flugzeug, der Schwarm kreuzt – Knall, Feuer, Stille
      W.gaense = { scene: B, camera: c.gaense, look: "tealOrange", post: Object.assign({}, LUFT, { uBewegung: 0, uSplit: 0.1, uSplitSchatten: [0.2, 0.4, 0.55] }),
        update(t, T) { basisB(T); allesAus(); const z = -14000 - t * 0, pos = v3(2600, 860 + t * 6, -15500 + t * 95); setJet(pos, 0, 0.12, 0.05); fans(T, T > KNALL);
          zeigen(gaense, true); gaense.forEach((g, i) => { const reihe = Math.floor(i / 2), sx = i % 2 ? 1 : -1, k = (T - KNALL) * 30; const p = v3(sx * reihe * 3.0 + Math.sin(i) * 1.5, 0.5 + Math.sin(i * 2.1) * 1.5, 4 + (KNALL - T) * 55 + reihe * 2.6); p.applyMatrix4(jet.matrixWorld); g.position.copy(p); g.rotation.y = jet.rotation.y + Math.PI * 0.95 + Math.sin(i) * 0.1; g.visible = T < KNALL + 0.12 && i !== 3; g.userData.anim(T + i * 0.13); });
          const nach = T - KNALL; rauch.forEach((r) => { r.pts.visible = nach > 0; r.update(T); r.mat.opacity = clamp(nach * 1.2, 0, 0.75); }); feuer.forEach((f) => { f.pts.visible = nach > 0 && nach < 1.6; f.update(T); f.mat.opacity = 0.95 * (1 - nach / 1.6); }); federn.pts.visible = nach > 0 && nach < 1.2; federn.update(nach);
          const cam = c.gaense, vorn = v3(-14 - t * 0.2, -3.5, -12 + t * 0.6).applyMatrix4(jet.matrixWorld), ziel = v3(2, -0.5, 40).applyMatrix4(jet.matrixWorld); zielen(cam, vorn, ziel, 50); if (nach > 0) wackeln(cam, T, Math.exp(-nach * 2.2) * 6); } };
      // 4) Stille: Gleitflug ohne Schub, dünner Rauch, Stadt unter dir
      W.stille = { scene: B, camera: c.stille, look: "tealOrange", post: Object.assign({}, LUFT, { uSplit: 0.12, uSplitSchatten: [0.2, 0.4, 0.55], uStrahlen: 0.12 }),
        update(t, T) { basisB(T); allesAus(); const pos = v3(1700 - t * 40, 800 - t * 9, -14300 + t * 110); setJet(pos, Math.atan2(-40, 110), 0.05, -0.12); fans(T, true);
          rauch.forEach((r) => { r.pts.visible = true; r.update(T); r.mat.opacity = 0.42; });
          const cam = c.stille, p = v3(-28 + t * 1.2, 9, -46 + t * 2).applyMatrix4(jet.matrixWorld), z2 = v3(2, -2, 10).applyMatrix4(jet.matrixWorld); zielen(cam, p, z2, 42); } };
      // 5) Totale: winziges Flugzeug über dem Fluss, Manhattan, Brücke im Norden
      W.gleit = { scene: B, camera: c.gleit, look: "tealOrange", post: Object.assign({}, LUFT, { uSplit: 0.12, uSplitSchatten: [0.2, 0.4, 0.55] }),
        update(t, T) { basisB(T); allesAus(); const pos = v3(250 - t * 25, 600 - t * 6, -11800 + t * 105); setJet(pos, Math.atan2(-25, 105), 0.04, -0.3); fans(T, true);
          const cam = c.gleit; zielen(cam, v3(pos.x + 14, pos.y + 22, pos.z - 105 + t * 3), v3(pos.x + 5, pos.y - 45, pos.z + 500), 44); } };
      // 6) Cockpit: Blick über die Schultern auf den Hudson, Warnlicht blinkt
      W.cockpit = { scene: B, camera: c.cockpit, look: "tealOrange", post: Object.assign({}, KLAR, { uBloom: 0.45, uSplit: 0.1, uSplitSchatten: [0.2, 0.4, 0.55] }),
        update(t, T) { basisB(T, false); allesAus(); innenAn(true); zeigen(passagiere.filter((p) => p.piv).map((p) => p.piv), false); const pos = v3(-80 - t * 6, 520 - t * 8, -10800 + t * 105); setJet(pos, Math.atan2(-6, 105), 0.03, -0.06 + Math.sin(t * 0.8) * 0.02); fans(T, true);
          ck.piloten.forEach((p, i) => { p.setze(0, T + i); const u = p.p.userData; u.shL.rotation.x = u.shR.rotation.x = 0.05; u.elL.rotation.x = u.elR.rotation.x = -1.35; u.shL.rotation.z = -0.08; u.shR.rotation.z = 0.08; p.p.userData.head.rotation.y = (i ? -0.25 : 0.15) * Math.sin(t * 0.6 + i); }); ck.warn.material.color.setScalar((T * 2) % 1 < 0.5 ? 3 : 0.3); ck.warn.material.color.g *= 0.2; ck.warn.material.color.b *= 0.05;
          const cam = c.cockpit, p = v3(0.0, 0.62 + Math.sin(t * 1.1) * 0.01, 13.25 + t * 0.03).applyMatrix4(jet.matrixWorld), z2 = v3(0, -0.6, 30).applyMatrix4(jet.matrixWorld); zielen(cam, p, z2, 64); cam.rotation.z += Math.sin(t * 2.3) * 0.004; } };
      // 7) „Wir landen im Hudson“: Kurve über dem Fluss, Untersicht
      W.hudson = { scene: B, camera: c.hudson, look: "tealOrange", post: Object.assign({}, LUFT, { uSplit: 0.12, uSplitSchatten: [0.2, 0.4, 0.55], uStrahlen: 0.2, uFlare: 0.08 }),
        update(t, T) { basisB(T); allesAus(); const a = 0.25 - t * 0.08, pos = v3(-150 + t * 30, 430 - t * 7, -10000 + t * 100); setJet(pos, Math.atan2(30, 100) + (a - 0.15) * 0.4, 0.04, 0.3 - t * 0.06); fans(T, true);
          const cam = c.hudson; zielen(cam, v3(pos.x + 210 - t * 8, pos.y + 70, pos.z + 260 - t * 25), v3(pos.x - 60, pos.y - 120, pos.z - 180), 42); } };
      // 8) Brücke: Kamera auf Fahrbahnhöhe, das Flugzeug gleitet knapp darüber
      W.bruecke = { scene: B, camera: c.bruecke, look: "tealOrange", post: Object.assign({}, LUFT, { uSSAA: 2, uSplit: 0.12, uSplitSchatten: [0.2, 0.4, 0.55], uStrahlen: 0.25 }),
        update(t, T) { basisB(T); allesAus(); const pos = v3(-60, 300 - t * 4, -10900 + t * 105); setJet(pos, 0, 0.04, 0.02); fans(T, true);
          const cam = c.bruecke, turm = v3(-530, 175, -10500), zp = turm.clone().lerp(v3(pos.x, pos.y, pos.z), 0.62); zielen(cam, v3(-610 + t * 4, bruecke.DECK + 9, -10420), zp, 62); } };
      // 9) Brace: Kabine von vorn, alle vorgebeugt, Fenster zeigen Wasser
      W.brace = { scene: B, camera: c.brace, look: "tealOrange", post: Object.assign({}, KLAR, { uBloom: 0.4, uVig: 0.45, uSplit: 0.12, uSplitSchatten: [0.2, 0.4, 0.55] }),
        update(t, T) { basisB(T, false); allesAus(); innenAn(true); const pos = v3(-50, 60 - t * 12, -1500 + t * 100); setJet(pos, 0, 0.06, 0.0); fans(T, true);
          const k = ease((t - 0.3) / 1.2); passagiere.forEach((p, i) => { if (p.piv) { p.piv.visible = true; p.setze(k * (0.85 + (i % 3) * 0.05), T + i); } else if (p.sil) { p.sil.rotation.x = k * 0.9; p.sil.position.y = -0.26 - k * 0.15; } });
          const zr = kab.Z0 + kab.L / 2 - 2.2 - 2 * 0.81, cam = c.brace, p = v3(0.25, 0.45, zr - 0.9 + t * 0.08).applyMatrix4(jet.matrixWorld), z2 = v3(-1.4, -0.15, zr + 0.5 + t * 0.08).applyMatrix4(jet.matrixWorld); zielen(cam, p, z2, 62); wackeln(cam, T, 1.4 + t * 0.6); } };
      // 10) Wasserung: tiefe Kamera über dem Wasser, Aufsetzen, Gischt
      W.wasserung = { scene: B, camera: c.wasserung, look: "tealOrange", post: Object.assign({}, LUFT, { uSplit: 0.12, uSplitSchatten: [0.2, 0.4, 0.55], uBewegung: 0 }),
        update(t, T) { basisB(T); allesAus(); const nach = T - AUFSETZEN, v = nach < 0 ? 64 : 64 * Math.exp(-nach * 0.75), weg = nach < 0 ? nach * 64 : (64 / 0.75) * (1 - Math.exp(-nach * 0.75));
          const y = nach < 0 ? 2.2 + Math.max(0, -nach) * 4.2 : 1.35 + 0.85 * Math.exp(-nach * 1.6); const pos = v3(-80, y, -300 + weg); setJet(pos, 0, nach < 0 ? 0.1 : 0.03 + 0.07 * Math.exp(-nach * 1.2), 0); fans(T, true);
          gischt.pts.visible = nach > 0; gischt.update(nach); gischt.pts.position.set(pos.x, 0, pos.z - 6); gischt.mat.opacity = clamp(0.6 * (1 - nach / 5) * Math.min(1, v / 20), 0, 0.6);
          kielwasser.visible = nach > 0; kielwasser.position.set(pos.x, 0.2, pos.z - 6 - Math.max(0, weg) / 2); kielwasser.scale.y = Math.max(1, weg); kielwasser.rotation.z = 0;
          const cam = c.wasserung; zielen(cam, v3(-80 - 70 + t * 2, 2.6, -300 + 30 + t * 17), v3(pos.x, pos.y + 1.5, pos.z + 4), 46); if (nach > 0) wackeln(cam, T, Math.exp(-nach * 1.5) * 4); } };
      // 11) Rettung: Menschen auf den Tragflächen, Rettungsinseln, Fähren kommen
      function treibend(T) { const pos = v3(-80, 1.3 + Math.sin(T * 0.5) * 0.03, -300 + 64 / 0.75 + (T - 48.4) * 0.3); setJet(pos, 0.08, 0.035 + Math.sin(T * 0.4) * 0.003, Math.sin(T * 0.35) * 0.004); return pos; }
      function rettungsBild(T, cam) { allesAus(); zeigen(flosse, true); zeigen(leuteFluegel, true); zeigen(faehren, true);
        leuteFluegel.forEach((p, i) => { const sx = i < 8 ? -1 : 1, k = i % 8; p.position.set(sx * (3.6 + k * 1.15), -0.12 + k * 0.015, -1.2 - k * 0.55 + (k % 2) * 0.5); p.rotation.y = sx * 1.6 + Math.sin(i) * 0.4; idle(p, T + i); });
        const pos = treibend(T); faehren.forEach((f, i) => { const w = [[-90, 60, -0.7], [130, -40, 2.2], [-60, -110, 0.4], [160, 120, -2.4]][i], k = Math.min(1, (T - 48.4) / 14); f.position.set(pos.x + w[0] * (1.3 - k * 0.5), 0.0 + Math.sin(T + i) * 0.05, pos.z + w[1] * (1.3 - k * 0.5)); f.rotation.y = w[2]; f.rotation.z = Math.sin(T * 0.8 + i) * 0.01; }); return pos; }
      W.rettung = { scene: B, camera: c.rettung, look: "tealOrange", post: Object.assign({}, LUFT, { uSplit: 0.12, uSplitSchatten: [0.2, 0.4, 0.55] }),
        update(t, T) { basisB(T); const cam = c.rettung; const pos = rettungsBild(T, cam); zielen(cam, v3(pos.x - 34 + t * 1.6, 7 + t * 0.4, pos.z - 30 + t * 1.2), v3(pos.x, 1.5, pos.z - 2), 40); } };
      // 12) Schluss: Kran über das treibende Flugzeug, Fähren, Skyline
      W.schluss = { scene: B, camera: c.schluss, look: "tealOrange", post: Object.assign({}, LUFT, { uSplit: 0.12, uSplitSchatten: [0.2, 0.4, 0.55], uStrahlen: 0.2 }),
        update(t, T) { basisB(T); const cam = c.schluss; const pos = rettungsBild(T, cam); zielen(cam, v3(pos.x - 120 - t * 10, 40 + t * 22, pos.z - 140 - t * 12), v3(pos.x + 160, 30, pos.z + 260), 44); } };
      // Unter Karte und Erklärung: ruhige Bilder, nur einmal gerendert (hold)
      W.leer = { scene: new THREE.Scene(), camera: cam(), look: "neutral", post: KLAR, update() {} };
      window.__hud = { rauch, feuer, federn, jet, a320, auspuff, a320A, kabA };
      W.warumBg = { scene: B, camera: c.schluss, look: "tealOrange", post: Object.assign({}, LUFT, { uSplit: 0.12, uSplitSchatten: [0.2, 0.4, 0.55] }), update(t, T) { W.schluss.update(1.5, 76.3); } };
      })();
