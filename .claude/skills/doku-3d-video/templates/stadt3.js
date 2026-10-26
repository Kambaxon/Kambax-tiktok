      // ===== Stadt & Wasser v1 (aus Projekt Hudson): instanzierte Großstadt, Art-déco-Turm, Hängebrücke, Fähre, Flugzeugkabine, sitzende Figuren =====
      // stadt(s, seed, { x0, x1, dx, dz, z0, z1, y, h: (x, z, r) => Höhe, luecke: (x, z) => bool, leer }) – Tausende Gebäude in wenigen Draw Calls; Dächer einfarbig gegen Flimmern
      // stufenTurm(s, x, z, h, mat) · haengebruecke(s, z) -> { g, DECK, update(T) } · faehre(s, seed)
      // kabine(jet) -> { g, sitze, Z0, L } (Fenster als echte Ausschnitte, Raureif-Rahmen) · sitzend(parent, seed, x, y, z, o) -> { piv, p, setze(vor 0..1 Brace, T) } · silhouette(parent, seed, x, y, z)
      // gelaendeDetail(mat, detailTex, maßstab1, maßstab2): feines Detail mit eigenem UV-Maßstab auf großen Flächen (z. B. Schnee/Gras über km)
      // ---------- Stadt als instanzierte Blöcke (billig: wenige Draw Calls, keine Schatten) ----------
      const STADT_M = ["#8a96a4", "#b8b2a6", "#8a5a48", "#d2c6b0", "#5e646c", "#a8b4be"].map((wand, i) => {
        const tex = windowsTex(6, 14, wand, "#ffd9a0", 400 + i, 0.03); tex.anisotropy = 4;
        return new THREE.MeshStandardMaterial({ color: 0xffffff, map: tex, roughness: i === 0 || i === 5 ? 0.35 : 0.85, metalness: i === 0 || i === 5 ? 0.45 : 0 }); });
      const BOX1 = new THREE.BoxGeometry(1, 1, 1); BOX1.translate(0, 0.5, 0);
      const STADT_DACH = ["#6e737a", "#8e8a82", "#5e4a40", "#9a9488", "#4a4e54", "#7c848c"].map((c) => M(new THREE.Color(c).getHex(), { roughness: 0.9 }));
      function stadt(s, seed, o) { const r = rng(seed), proMat = STADT_M.map(() => []); o.dz = o.dz ?? o.dx * 0.7;
        for (let x = o.x0; x < o.x1; x += o.dx) for (let z = o.z0; z < o.z1; z += o.dz) { if (o.luecke && o.luecke(x, z)) continue; if (r() < (o.leer ?? 0.08)) continue;
          const h = o.h(x, z, r), w = o.dx * (0.55 + r() * 0.35), d = o.dz * (0.55 + r() * 0.35); const mi = h > 120 ? (r() < 0.6 ? (r() < 0.5 ? 0 : 5) : 4) : Math.floor(r() * 4) + 1;
          proMat[mi].push([x + (r() - 0.5) * o.dx * 0.2, o.y ?? 6, z + (r() - 0.5) * o.dz * 0.2, w, h, d]); }
        const m4 = new THREE.Matrix4(), q = new THREE.Quaternion();
        proMat.forEach((liste, mi) => { if (!liste.length) return; const wandM = STADT_M[mi], dachM = STADT_DACH[mi]; const im = new THREE.InstancedMesh(BOX1, [wandM, wandM, dachM, dachM, wandM, wandM], liste.length); // Dächer ohne Fenster (sonst Moiré-Flimmern im Überflug)
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

      function gelaendeDetail(mat, tex, m1 = 1800, m2 = 190) { mat.onBeforeCompile = (sh) => { sh.uniforms.tDetail = { value: tex }; sh.fragmentShader = sh.fragmentShader.replace("void main() {", "uniform sampler2D tDetail;\nvoid main() {").replace("#include <map_fragment>", "#include <map_fragment>\n diffuseColor.rgb *= mix(vec3(1.0), texture2D(tDetail, vUv * " + m1.toFixed(1) + ").rgb * 1.18, 0.55) * mix(vec3(1.0), texture2D(tDetail, vUv * " + m2.toFixed(1) + ").rgb * 1.12, 0.35);"); }; return mat; }
