      // ===== Stadt v2: Ampeln, Verkehrsschilder, Mülleimer, Müll & Schmutz, unebene Straßen, Möbel (braucht: rng, box, cyl, M, canvasTex, PO, glanzPunkt) =====
      // ampel(s, x, z, ry, { phase }) -> update(T) schaltet Rot/Gelb/Grün (Fußgängerampel optional)
      function ampel(s, x, z, ry = 0, o = {}) {
        const g = new THREE.Group(); g.position.set(x, 0.14, z); g.rotation.set((o.schief ?? 0) * 0.02, ry, (o.schief ?? 0) * 0.015); s.add(g);
        const mast = M(0x3a3e42, { metalness: 0.5, roughness: 0.5 }), gehaeuse = M(0x1a1c1e, { roughness: 0.6 });
        cyl(0.07, 0.09, 0.3, mast, 0, 0.15, 0, g, 16); cyl(0.055, 0.06, 3.4, mast, 0, 1.85, 0, g, 16);
        const kopf = new THREE.Group(); kopf.position.set(0, 2.9, 0.12); g.add(kopf);
        box(0.3, 0.9, 0.22, gehaeuse, 0, 0, 0, kopf); box(0.42, 1.02, 0.02, M(0xf2f2f0), 0, 0, -0.12, kopf); // Gehäuse + weiße Kontrasttafel
        const farben = [0xff2a1a, 0xffb020, 0x30ff6a], lampen = [];
        farben.forEach((f, i) => { const y = 0.28 - i * 0.28; const l = cyl(0.095, 0.095, 0.02, new THREE.MeshBasicMaterial({ color: 0x222222, toneMapped: false }), 0, y, 0.115, kopf, 24); l.rotation.x = Math.PI / 2;
          const schirm = cyl(0.11, 0.11, 0.14, gehaeuse, 0, y + 0.06, 0.17, kopf, 20, ); schirm.rotation.x = Math.PI / 2; schirm.scale.set(1, 1, 0.3); schirm.geometry = new THREE.CylinderGeometry(0.11, 0.11, 0.14, 20, 1, true, -Math.PI / 2, Math.PI);
          const glow = glanzPunkt(f, 0.55); glow.position.set(0, y, 0.15); glow.visible = false; kopf.add(glow); lampen.push({ l, glow, f }); });
        let fuss = null; if (o.fussgaenger !== false) { const fk = new THREE.Group(); fk.position.set(0, 2.0, 0.1); g.add(fk); box(0.22, 0.48, 0.16, gehaeuse, 0, 0, 0, fk);
          const rot = box(0.14, 0.17, 0.01, new THREE.MeshBasicMaterial({ color: 0x331010, toneMapped: false }), 0, 0.11, 0.085, fk), gruen = box(0.14, 0.17, 0.01, new THREE.MeshBasicMaterial({ color: 0x103318, toneMapped: false }), 0, -0.11, 0.085, fk); fuss = { rot, gruen };
          box(0.12, 0.16, 0.06, M(0xe8c020), 0, -0.6, 0.06, g); } // Anforderungstaster
        const zyklus = o.zyklus ?? 14, ph = o.phase ?? 0;
        function update(T) { const k = ((T + ph) % zyklus) / zyklus; const zustand = k < 0.45 ? 0 : k < 0.52 ? 1 : k < 0.95 ? 2 : 3; // 0 rot, 1 rot-gelb, 2 grün, 3 gelb
          const an = [zustand === 0 || zustand === 1, zustand === 1 || zustand === 3, zustand === 2];
          lampen.forEach((L, i) => { L.l.material.color.set(an[i] ? new THREE.Color(L.f).multiplyScalar(3) : new THREE.Color(L.f).multiplyScalar(0.08)); L.glow.visible = an[i]; });
          if (fuss) { const fg = zustand === 0; fuss.rot.material.color.set(fg ? 0x331010 : new THREE.Color(0xff2a1a).multiplyScalar(2.5)); fuss.gruen.material.color.set(fg ? new THREE.Color(0x30ff6a).multiplyScalar(2.5) : 0x103318); } }
        update(0); return { g, update };
      }
      // Verkehrsschilder: "stop"|"vorfahrt"|"vorfahrtAchten"|"einbahn"|"parkverbot"|"halteverbot"|"tempo30"|"tempo50"|"fussgaenger"|"baustelle"
      const SCHILD_TEX = {};
      function schildTex(typ) {
        if (SCHILD_TEX[typ]) return SCHILD_TEX[typ];
        const t = canvasTex(256, 256, (c) => { c.clearRect(0, 0, 256, 256); const ctr = () => { c.textAlign = "center"; c.textBaseline = "middle"; };
          const kreis = (fill, rand, rw) => { c.fillStyle = fill; c.beginPath(); c.arc(128, 128, 120, 0, 7); c.fill(); if (rand) { c.strokeStyle = rand; c.lineWidth = rw; c.beginPath(); c.arc(128, 128, 120 - rw / 2, 0, 7); c.stroke(); } };
          if (typ === "stop") { c.fillStyle = "#fff"; c.beginPath(); for (let i = 0; i < 8; i++) { const a = Math.PI / 8 + i * Math.PI / 4; c.lineTo(128 + Math.cos(a) * 124, 128 + Math.sin(a) * 124); } c.fill(); c.fillStyle = "#c8141e"; c.beginPath(); for (let i = 0; i < 8; i++) { const a = Math.PI / 8 + i * Math.PI / 4; c.lineTo(128 + Math.cos(a) * 112, 128 + Math.sin(a) * 112); } c.fill(); c.fillStyle = "#fff"; c.font = "bold 78px sans-serif"; ctr(); c.fillText("STOP", 128, 132); }
          else if (typ === "vorfahrt") { c.save(); c.translate(128, 128); c.rotate(Math.PI / 4); c.fillStyle = "#fff"; c.fillRect(-86, -86, 172, 172); c.fillStyle = "#f2c500"; c.fillRect(-62, -62, 124, 124); c.strokeStyle = "#222"; c.lineWidth = 3; c.strokeRect(-86, -86, 172, 172); c.restore(); }
          else if (typ === "vorfahrtAchten") { c.fillStyle = "#c8141e"; c.beginPath(); c.moveTo(128, 236); c.lineTo(12, 30); c.lineTo(244, 30); c.closePath(); c.fill(); c.fillStyle = "#fff"; c.beginPath(); c.moveTo(128, 196); c.lineTo(52, 54); c.lineTo(204, 54); c.closePath(); c.fill(); }
          else if (typ === "einbahn") { c.fillStyle = "#1e4fa0"; c.fillRect(8, 78, 240, 100); c.fillStyle = "#fff"; c.beginPath(); c.moveTo(30, 112); c.lineTo(170, 112); c.lineTo(170, 92); c.lineTo(226, 128); c.lineTo(170, 164); c.lineTo(170, 144); c.lineTo(30, 144); c.fill(); }
          else if (typ === "parkverbot" || typ === "halteverbot") { kreis("#1e4fa0", "#c8141e", 26); c.strokeStyle = "#c8141e"; c.lineWidth = 24; c.beginPath(); c.moveTo(48, 48); c.lineTo(208, 208); c.stroke(); if (typ === "halteverbot") { c.beginPath(); c.moveTo(208, 48); c.lineTo(48, 208); c.stroke(); } }
          else if (typ === "tempo30" || typ === "tempo50") { kreis("#fff", "#c8141e", 30); c.fillStyle = "#111"; c.font = "bold 104px sans-serif"; ctr(); c.fillText(typ.slice(5), 128, 136); }
          else if (typ === "fussgaenger") { c.fillStyle = "#1e4fa0"; c.fillRect(8, 8, 240, 240); c.fillStyle = "#fff"; c.beginPath(); c.moveTo(128, 30); c.lineTo(226, 214); c.lineTo(30, 214); c.closePath(); c.fill(); c.fillStyle = "#111"; c.beginPath(); c.arc(128, 96, 12, 0, 7); c.fill(); c.fillRect(120, 110, 16, 50); c.fillRect(100, 160, 16, 40); c.fillRect(140, 160, 16, 40); for (let i = 0; i < 4; i++) c.fillRect(60 + i * 36, 200, 22, 8); }
          else if (typ === "baustelle") { c.fillStyle = "#c8141e"; c.beginPath(); c.moveTo(128, 14); c.lineTo(244, 224); c.lineTo(12, 224); c.closePath(); c.fill(); c.fillStyle = "#fff"; c.beginPath(); c.moveTo(128, 54); c.lineTo(208, 200); c.lineTo(48, 200); c.closePath(); c.fill(); c.fillStyle = "#111"; c.beginPath(); c.arc(118, 120, 9, 0, 7); c.fill(); c.fillRect(104, 132, 24, 34); c.fillRect(132, 150, 30, 10); c.fillRect(96, 178, 70, 8); }
          // leichte Verwitterung
          const q = rng(typ.length * 13); for (let i = 0; i < 220; i++) { c.fillStyle = `rgba(80,70,60,${q() * 0.08})`; c.fillRect(q() * 256, q() * 256, 3, 3); } });
        SCHILD_TEX[typ] = t; return t;
      }
      function verkehrsschild(s, x, z, typ = "stop", ry = 0, o = {}) {
        const g = new THREE.Group(); g.position.set(x, 0.14, z); g.rotation.set((o.schief ?? 0) * 0.04, ry, (o.schief ?? 0) * 0.03); s.add(g);
        const pfahl = M(0x9aa0a6, { metalness: 0.7, roughness: 0.35 }); cyl(0.032, 0.032, 2.5, pfahl, 0, 1.25, 0, g, 12); cyl(0.04, 0.04, 0.02, M(0x6a6e72), 0, 2.5, 0, g, 12);
        const h = o.hoehe ?? 2.2, gr = typ === "einbahn" ? [0.8, 0.8] : [0.62, 0.62];
        const p = new THREE.Mesh(new THREE.PlaneGeometry(gr[0], gr[1]), new THREE.MeshStandardMaterial({ map: schildTex(typ), transparent: true, alphaTest: 0.5, roughness: 0.45, metalness: 0.1, side: THREE.FrontSide })); p.position.set(0, h, 0.045); p.castShadow = true; g.add(p);
        const rueck = new THREE.Mesh(new THREE.PlaneGeometry(gr[0], gr[1]), new THREE.MeshStandardMaterial({ map: schildTex(typ), color: 0x8a9096, transparent: true, alphaTest: 0.5, roughness: 0.6, metalness: 0.4 })); rueck.position.set(0, h, 0.04); rueck.rotation.y = Math.PI; g.add(rueck);
        for (const dy of [-0.18, 0.18]) box(0.08, 0.03, 0.04, pfahl, 0, h + dy, 0.02, g); // Schellen
        if (o.aufkleber) { const a = box(0.1, 0.07, 0.003, M(pick2([0xf2f2f0, 0x2a8a4a, 0xe8c020])), 0.02, 1.5, 0.034, g); }
        return g;
      }
      function pick2(a) { return a[(a.length * 7 + 3) % a.length]; }
      // Mülleimer: fuell 0..1 (voll = Müll quillt über), mit Tüte, Deckel, Aufkleber; daneben optional Müll
      function muelltonne(s, x, z, o = {}) {
        const r = rng(o.seed ?? Math.floor(x * 13 + z * 7)), g = new THREE.Group(); g.position.set(x, 0.14, z); g.rotation.y = r() * 6.28; s.add(g);
        const typ = o.typ ?? (r() < 0.5 ? "korb" : "tonne"), fuell = o.fuell ?? r();
        const farbe = o.farbe ?? [0xe86a1a, 0x2a5a3a, 0x3a3e44, 0x1e2a44][Math.floor(r() * 4)];
        if (typ === "korb") { // städtischer Abfallkorb am Pfahl
          cyl(0.04, 0.04, 1.1, M(0x5a5e62, { metalness: 0.5 }), 0.3, 0.55, 0, g, 10);
          const k = cyl(0.25, 0.22, 0.65, M(farbe, { roughness: 0.55, side: THREE.DoubleSide }), 0, 0.62, 0, g, 24); k.geometry = new THREE.CylinderGeometry(0.25, 0.22, 0.65, 24, 1, true);
          cyl(0.22, 0.22, 0.02, M(farbe), 0, 0.3, 0, g, 24); const rand = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.015, 6, 24), M(0x2a2a2a)); rand.rotation.x = Math.PI / 2; rand.position.y = 0.95; g.add(rand);
          box(0.12, 0.06, 0.003, M(0xf2f2f0), 0, 0.7, 0.245, g); // Hinweisschild
          const tuete = cyl(0.235, 0.21, 0.6 * Math.min(1, fuell + 0.1), M(0x1a1a1a, { roughness: 0.35 }), 0, 0.31 + 0.3 * Math.min(1, fuell + 0.1), 0, g, 18); }
        else { // Mülltonne mit Deckel (Hinterhof)
          box(0.58, 0.95, 0.62, M(farbe, { roughness: 0.5 }), 0, 0.5, 0, g); for (let i = 0; i < 4; i++) box(0.6, 0.02, 0.64, M(new THREE.Color(farbe).offsetHSL(0, 0, -0.06).getHex()), 0, 0.2 + i * 0.22, 0, g);
          const deckel = box(0.62, 0.05, 0.66, M(farbe, { roughness: 0.5 }), 0, 1.0, 0, g); if (fuell > 0.8) { deckel.rotation.x = -0.5; deckel.position.set(0, 1.08, -0.12); }
          for (const sx of [-1, 1]) { const rd2 = cyl(0.09, 0.09, 0.05, M(0x111111), sx * 0.25, 0.09, -0.3, g, 16); rd2.rotation.z = Math.PI / 2; } }
        if (fuell > 0.75) { const top = typ === "korb" ? 0.95 : 1.0; for (let i = 0; i < 6 + r() * 6; i++) { const art = r(); const m = art < 0.4 ? box(0.08 + r() * 0.1, 0.06, 0.1, M([0xf2f2ea, 0xc8b89a, 0xd83a2a, 0x3a6aa8][Math.floor(r() * 4)], { roughness: 0.8 }), (r() - 0.5) * 0.35, top + r() * 0.15, (r() - 0.5) * 0.35, g) :
          art < 0.7 ? cyl(0.03, 0.03, 0.11, M([0xc8c8cc, 0xd83a2a, 0x2a8a4a][Math.floor(r() * 3)], { metalness: 0.8, roughness: 0.3 }), (r() - 0.5) * 0.35, top + r() * 0.12, (r() - 0.5) * 0.35, g, 10) :
          new THREE.Mesh(new THREE.IcosahedronGeometry(0.08 + r() * 0.06, 1), M(r() < 0.5 ? 0x1a1a1a : 0xe8e4dc, { roughness: 0.35 })); if (!m.parent) { m.position.set((r() - 0.5) * 0.3, top + 0.05, (r() - 0.5) * 0.3); m.scale.y = 0.7; g.add(m); } m.rotation.set(r() * 3, r() * 3, r() * 3); } }
        if (fuell > 0.9 || o.muell) muell(s, x, z, 1.2, 10, Math.floor(r() * 1000));
        return g;
      }
      // Verstreuter Müll & Schmutz: Papier, Dosen, Flaschen, Kippen, Laub, Kaugummiflecken, Ölflecken
      function muell(s, x, z, radius = 3, n = 30, seed = 1, y = 0.142) {
        const r = rng(seed), grp = new THREE.Group(); s.add(grp);
        const mats = { papier: M(0xf2f0e6, { roughness: 0.9, side: THREE.DoubleSide }), karton: M(0xb89a6a, { roughness: 0.9 }), dose: M(0xc8c8cc, { metalness: 0.85, roughness: 0.3 }), doseRot: M(0xc82a1a, { metalness: 0.6, roughness: 0.35 }),
          flasche: new THREE.MeshPhysicalMaterial({ color: 0x3a6a3a, roughness: 0.05, transparent: true, opacity: 0.7 }), kippe: M(0xe8d8b0), laub: [M(0xb8742a, { side: THREE.DoubleSide }), M(0x8a5a1e, { side: THREE.DoubleSide }), M(0xc8a03a, { side: THREE.DoubleSide })], fleck: M(0x2a2a2a, Object.assign({ transparent: true, opacity: 0.35, roughness: 0.3 }, PO)) };
        for (let i = 0; i < n; i++) {
          const a = r() * Math.PI * 2, d = Math.sqrt(r()) * radius, px = x + Math.cos(a) * d, pz = z + Math.sin(a) * d, art = r(); let m;
          if (art < 0.2) { m = new THREE.Mesh(new THREE.PlaneGeometry(0.15 + r() * 0.1, 0.1 + r() * 0.1, 3, 3), mats.papier); const p = m.geometry.attributes.position; for (let k = 0; k < p.count; k++) p.setZ(k, (r() - 0.5) * 0.03); m.geometry.computeVertexNormals(); m.rotation.x = -Math.PI / 2 + (r() - 0.5) * 0.3; m.position.y = 0.01; }
          else if (art < 0.32) { m = new THREE.Mesh(new THREE.IcosahedronGeometry(0.035 + r() * 0.03, 1), mats.papier); m.scale.y = 0.7; } // zerknülltes Papier
          else if (art < 0.45) { m = cyl(0.032, 0.032, 0.115, r() < 0.5 ? mats.dose : mats.doseRot, 0, 0, 0, null, 14); m.rotation.z = Math.PI / 2; m.position.y = 0.03; if (r() < 0.4) m.scale.set(1, 0.7, 1); }
          else if (art < 0.52) { m = new THREE.Group(); cyl(0.035, 0.035, 0.2, mats.flasche, 0, 0, 0, m, 14); cyl(0.013, 0.02, 0.07, mats.flasche, 0, 0.13, 0, m, 10); m.rotation.z = Math.PI / 2; m.position.y = 0.035; }
          else if (art < 0.68) { m = cyl(0.0045, 0.0045, 0.025, mats.kippe, 0, 0, 0, null, 6); m.rotation.z = Math.PI / 2; m.position.y = 0.005; }
          else if (art < 0.86) { const blatt = new THREE.Shape(); blatt.moveTo(0, 0); blatt.quadraticCurveTo(0.04, 0.04, 0, 0.09); blatt.quadraticCurveTo(-0.04, 0.04, 0, 0); m = new THREE.Mesh(new THREE.ShapeGeometry(blatt), mats.laub[Math.floor(r() * 3)]); m.rotation.x = -Math.PI / 2 + (r() - 0.5) * 0.5; m.position.y = 0.006; m.scale.setScalar(0.8 + r()); }
          else if (art < 0.95) { m = new THREE.Mesh(new THREE.CircleGeometry(0.012 + r() * 0.01, 10), M(0x3a3a3c, Object.assign({ roughness: 0.6 }, PO))); m.rotation.x = -Math.PI / 2; m.position.y = 0.002; } // Kaugummi
          else { m = new THREE.Mesh(new THREE.CircleGeometry(0.2 + r() * 0.35, 20), mats.fleck); m.rotation.x = -Math.PI / 2; m.position.y = 0.003; m.scale.set(1, 0.6 + r() * 0.4, 1); } // Ölfleck
          m.position.x = px; m.position.z = pz; m.position.y += y; m.rotation.y = r() * 6.28; if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } grp.add(m);
        }
        return grp;
      }
      // Unebene Fahrbahn: Flickstellen, Schlaglöcher, Risse, abgesenkte Gullys, verblasste Markierung – auf einer vorhandenen strasse() legen
      function strassenSchaeden(s, len, seed = 1, o = {}) {
        const r = rng(seed), grp = new THREE.Group(); s.add(grp); const breite = o.breite ?? 7;
        for (let i = 0; i < (o.flicken ?? Math.round(len / 8)); i++) { const w = 0.8 + r() * 2.4, d = 0.6 + r() * 2, v = 40 + r() * 25;
          const f = new THREE.Mesh(new THREE.PlaneGeometry(w, d), M(new THREE.Color(`rgb(${v | 0},${v | 0},${(v + 3) | 0})`).getHex(), Object.assign({ roughness: 0.9 }, PO))); f.rotation.x = -Math.PI / 2; f.rotation.z = (r() - 0.5) * 0.2; f.position.set((r() - 0.5) * (breite - w), 0.004, -r() * len + 8); f.receiveShadow = true; grp.add(f); }
        for (let i = 0; i < (o.loecher ?? Math.round(len / 25)); i++) { const rr = 0.18 + r() * 0.3, x = (r() - 0.5) * (breite - 1), z = -r() * len + 8;
          const loch = new THREE.Mesh(new THREE.CircleGeometry(rr, 14), M(0x1e1e20, Object.assign({ roughness: 0.95 }, PO))); loch.rotation.x = -Math.PI / 2; loch.position.set(x, 0.005, z); loch.scale.set(1, 0.7 + r() * 0.4, 1); grp.add(loch);
          for (let k = 0; k < 6; k++) { const st = new THREE.Mesh(new THREE.DodecahedronGeometry(0.02 + r() * 0.025, 0), M(0x3a3a3c)); st.position.set(x + (r() - 0.5) * rr * 2.4, 0.012, z + (r() - 0.5) * rr * 2.4); st.castShadow = true; grp.add(st); } }
        const riss = new THREE.LineBasicMaterial({ color: 0x141416 });
        for (let i = 0; i < (o.risse ?? Math.round(len / 5)); i++) { const pts = []; let x = (r() - 0.5) * breite, z = -r() * len + 8; for (let k = 0; k < 8; k++) { pts.push(new THREE.Vector3(x, 0.006, z)); x += (r() - 0.5) * 0.5; z += (r() - 0.5) * 0.5; } grp.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), riss)); }
        return grp;
      }
      // Zufällige leichte Schieflage für Laternen, Schilder, Pfosten ("in der Stadt ist nicht alles gerade")
      function schief(obj, seed, staerke = 1) { const r = rng(seed); obj.rotation.x += (r() - 0.5) * 0.05 * staerke; obj.rotation.z += (r() - 0.5) * 0.05 * staerke; return obj; }

      // ---------- Möbel (Innenräume) ----------
      const HOLZ = [0x8a5a34, 0xb08050, 0x5a3a24, 0xd8b888, 0x3a2a1e, 0xe8dcc4];
      function texHolz(farbe) { const key = "holz" + farbe; if (SCHILD_TEX[key]) return SCHILD_TEX[key]; const c = new THREE.Color(farbe);
        const t = canvasTex(256, 256, (g) => { const q = rng(farbe % 991); g.fillStyle = "#" + c.getHexString(); g.fillRect(0, 0, 256, 256); for (let i = 0; i < 70; i++) { g.strokeStyle = `rgba(${q() < 0.5 ? "0,0,0" : "255,240,220"},${0.05 + q() * 0.08})`; g.lineWidth = 1 + q() * 2; g.beginPath(); let y = q() * 256; g.moveTo(0, y); for (let x = 0; x <= 256; x += 16) g.lineTo(x, y + Math.sin(x * 0.03 + i) * 3); g.stroke(); }
          for (let i = 0; i < 3; i++) { const x = q() * 256, y = q() * 256; g.strokeStyle = "rgba(40,20,10,.25)"; for (let k = 1; k < 5; k++) { g.beginPath(); g.ellipse(x, y, k * 5, k * 2, 0, 0, 7); g.stroke(); } } });
        t.wrapS = t.wrapT = THREE.RepeatWrapping; SCHILD_TEX[key] = t; return t; }
      const holzM = (f) => new THREE.MeshStandardMaterial({ color: 0xffffff, map: texHolz(f), roughness: 0.55 });
      function sofa(seed, o = {}) { const r = rng(seed), g = new THREE.Group(), w = o.breite ?? 2.0, st = M(o.farbe ?? [0x5a6a7a, 0x8a3a2a, 0x3a4a3a, 0xb8a888, 0x2a2a30][Math.floor(r() * 5)], { roughness: 0.9, map: texStoff("stoff") });
        box(w, 0.22, 0.85, st, 0, 0.3, 0, g); box(w, 0.5, 0.2, st, 0, 0.6, -0.33, g); for (const sx of [-1, 1]) box(0.18, 0.32, 0.85, st, sx * (w / 2 - 0.09), 0.5, 0, g);
        const n = Math.round(w / 0.7); for (let i = 0; i < n; i++) { const k = box((w - 0.36) / n - 0.02, 0.14, 0.62, st, -w / 2 + 0.18 + (i + 0.5) * (w - 0.36) / n, 0.48, 0.06, g); k.geometry = new THREE.BoxGeometry((w - 0.36) / n - 0.02, 0.14, 0.62, 2, 1, 2); const rk = box((w - 0.36) / n - 0.04, 0.42, 0.14, st, k.position.x, 0.72, -0.2, g); rk.rotation.x = -0.12; }
        for (let i = 0; i < 2; i++) { const z = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.36, 0.12), M([0xd8b030, 0xe8e4dc, 0x2a6a8a][Math.floor(r() * 3)], { roughness: 0.9 })); z.position.set((i ? 1 : -1) * (w / 2 - 0.4), 0.72, -0.12); z.rotation.set(-0.2, (i ? -1 : 1) * 0.3, (i ? 1 : -1) * 0.15); z.castShadow = true; g.add(z); }
        for (const sx of [-1, 1]) for (const sz of [-1, 1]) cyl(0.025, 0.018, 0.18, M(0x2a2a2a, { metalness: 0.5 }), sx * (w / 2 - 0.08), 0.09, sz * 0.36, g, 10); return g; }
      function tisch(seed, o = {}) { const r = rng(seed), g = new THREE.Group(), h = o.hoehe ?? 0.75, w = o.breite ?? 1.4, d = o.tiefe ?? 0.8, hm = holzM(o.holz ?? HOLZ[Math.floor(r() * 6)]);
        box(w, 0.04, d, hm, 0, h, 0, g); box(w - 0.08, 0.08, d - 0.08, hm, 0, h - 0.06, 0, g); for (const sx of [-1, 1]) for (const sz of [-1, 1]) box(0.05, h - 0.02, 0.05, hm, sx * (w / 2 - 0.06), (h - 0.02) / 2, sz * (d / 2 - 0.06), g);
        if (o.deko !== false && h > 0.6) { const v = cyl(0.05, 0.035, 0.16, new THREE.MeshPhysicalMaterial({ color: 0xc8e0e8, roughness: 0.05, transparent: true, opacity: 0.5 }), 0.2, h + 0.1, 0, g, 16); for (let i = 0; i < 5; i++) mk2(new THREE.SphereGeometry(0.03, 8, 6), M([0xd83a4a, 0xf2c83a, 0xffffff][i % 3]), 0.2 + (r() - 0.5) * 0.08, h + 0.24 + r() * 0.06, (r() - 0.5) * 0.08, g);
          const tasse = cyl(0.035, 0.03, 0.08, M(0xf2f2ee, { roughness: 0.3 }), -0.3, h + 0.06, 0.15, g, 16); const buch = box(0.18, 0.03, 0.24, M(0x2a4a8a), -0.1, h + 0.035, -0.15, g); buch.rotation.y = 0.3; }
        return g; }
      function mk2(geo, mat, x, y, z, p) { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; p.add(m); return m; }
      function stuhl(seed, o = {}) { const r = rng(seed), g = new THREE.Group(), hm = holzM(o.holz ?? HOLZ[Math.floor(r() * 6)]);
        box(0.44, 0.04, 0.42, hm, 0, 0.45, 0, g); for (const sx of [-1, 1]) for (const sz of [-1, 1]) box(0.035, sz < 0 ? 0.95 : 0.45, 0.035, hm, sx * 0.19, sz < 0 ? 0.475 : 0.225, sz * 0.18, g);
        for (let i = 0; i < 3; i++) box(0.38, 0.05, 0.02, hm, 0, 0.65 + i * 0.1, -0.18, g); if (r() < 0.5) box(0.4, 0.03, 0.38, M(0x8a3a2a, { roughness: 0.9 }), 0, 0.485, 0, g); return g; }
      function bett(seed, o = {}) { const r = rng(seed), g = new THREE.Group(), w = o.breite ?? 1.6, hm = holzM(o.holz ?? HOLZ[Math.floor(r() * 6)]);
        box(w + 0.08, 0.3, 2.1, hm, 0, 0.2, 0, g); box(w + 0.08, 0.9, 0.06, hm, 0, 0.55, -1.05, g); box(w, 0.22, 2.0, M(0xf2f0ea, { roughness: 0.9 }), 0, 0.46, 0, g);
        const decke = new THREE.Mesh(new THREE.BoxGeometry(w + 0.04, 0.1, 1.4, 8, 1, 8), M([0x6a8ab8, 0xd8c8a8, 0x8a4a5a, 0x4a6a4a, 0xe8e4dc][Math.floor(r() * 5)], { roughness: 0.95, map: texStoff("stoff") })); const p = decke.geometry.attributes.position; for (let k = 0; k < p.count; k++) if (p.getY(k) > 0) p.setY(k, p.getY(k) + Math.sin(p.getX(k) * 7 + p.getZ(k) * 5) * 0.02); decke.geometry.computeVertexNormals(); decke.position.set(0, 0.6, 0.28); decke.castShadow = true; g.add(decke);
        for (const sx of w > 1.2 ? [-1, 1] : [0]) { const k = new THREE.Mesh(new THREE.SphereGeometry(0.3, 16, 10), M(0xf6f4ee, { roughness: 0.9 })); k.scale.set(1, 0.3, 0.6); k.position.set(sx * w / 4, 0.64, -0.75); k.castShadow = true; g.add(k); } return g; }
      function regal(seed, o = {}) { const r = rng(seed), g = new THREE.Group(), w = o.breite ?? 1.0, h = o.hoehe ?? 1.9, hm = holzM(o.holz ?? HOLZ[Math.floor(r() * 6)]);
        box(0.03, h, 0.32, hm, -w / 2, h / 2, 0, g); box(0.03, h, 0.32, hm, w / 2, h / 2, 0, g); box(w, h, 0.01, hm, 0, h / 2, -0.16, g);
        for (let i = 0; i <= 5; i++) { const y = 0.05 + i * (h - 0.1) / 5; box(w, 0.025, 0.32, hm, 0, y, 0, g); if (i === 5) break; let x = -w / 2 + 0.04;
          while (x < w / 2 - 0.08) { if (r() < 0.12) { const pf = cyl(0.05, 0.04, 0.1, M(0xb8643a), x + 0.06, y + 0.06, 0, g, 12); mk2(new THREE.SphereGeometry(0.07, 10, 8), M(0x3a7a3a, { roughness: 0.9 }), x + 0.06, y + 0.16, 0, g); x += 0.14; continue; }
            const bh = 0.2 + r() * 0.12, bd = 0.02 + r() * 0.03; const bu = box(bd, bh, 0.22, M([0x8a2a2a, 0x2a4a8a, 0x2a6a3a, 0xd8c8a0, 0x1a1a1a, 0xc8a030, 0x6a3a6a][Math.floor(r() * 7)], { roughness: 0.7 }), x + bd / 2, y + 0.012 + bh / 2, 0.02, g); if (r() < 0.08) bu.rotation.z = 0.25; x += bd + 0.003; } }
        return g; }
      function schrank(seed, o = {}) { const r = rng(seed), g = new THREE.Group(), w = o.breite ?? 1.2, h = o.hoehe ?? 2.0, hm = holzM(o.holz ?? HOLZ[Math.floor(r() * 6)]);
        box(w, h, 0.6, hm, 0, h / 2, 0, g); box(0.006, h - 0.1, 0.01, M(0x2a1e14), 0, h / 2, 0.302, g); for (const sx of [-1, 1]) box(0.02, 0.18, 0.03, M(0xc8ccd0, { metalness: 0.9, roughness: 0.2 }), sx * 0.05, h / 2, 0.31, g); box(w + 0.04, 0.04, 0.64, hm, 0, h + 0.02, 0, g); return g; }
      function stehlampe(seed, an = false) { const g = new THREE.Group(); cyl(0.15, 0.15, 0.02, M(0x2a2a2a, { metalness: 0.6 }), 0, 0.01, 0, g, 20); cyl(0.012, 0.012, 1.5, M(0x2a2a2a, { metalness: 0.6 }), 0, 0.75, 0, g, 8);
        const schirm = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.22, 0.28, 24, 1, true), M(0xf2e8d0, { roughness: 0.9, side: THREE.DoubleSide, emissive: an ? 0xffc880 : 0, emissiveIntensity: an ? 0.8 : 0 })); schirm.position.y = 1.5; g.add(schirm);
        if (an) { const l = new THREE.PointLight(0xffc880, 1.6, 6, 2); l.position.y = 1.42; g.add(l); const gl = glanzPunkt(0xffc880, 0.5); gl.position.y = 1.4; g.add(gl); } return g; }
      function fernseher(an = true) { const g = new THREE.Group(); box(1.2, 0.7, 0.04, M(0x0a0a0c, { roughness: 0.2, metalness: 0.4 }), 0, 0.95, 0, g); const bild = box(1.14, 0.64, 0.005, new THREE.MeshBasicMaterial({ color: an ? new THREE.Color(0x4a7ac8).multiplyScalar(1.4) : 0x050506, toneMapped: !an }), 0, 0.95, 0.022, g);
        box(0.3, 0.02, 0.2, M(0x1a1a1a), 0, 0.58, 0, g); box(0.04, 0.05, 0.04, M(0x1a1a1a), 0, 0.6, 0, g); if (an) { const l = new THREE.PointLight(0x6a9ae8, 0.8, 4, 2); l.position.set(0, 0.95, 0.4); g.add(l); } return g; }
      function teppich(seed, w = 2.4, d = 1.7) { const r = rng(seed), c = [0x8a3a2a, 0x2a4a6a, 0xd8c8a8, 0x4a4a4a][Math.floor(r() * 4)];
        const t = canvasTex(256, 180, (g) => { g.fillStyle = "#" + new THREE.Color(c).getHexString(); g.fillRect(0, 0, 256, 180); g.strokeStyle = "rgba(255,240,210,.5)"; g.lineWidth = 6; g.strokeRect(14, 14, 228, 152); g.lineWidth = 2; g.strokeRect(26, 26, 204, 128); for (let i = 0; i < 6; i++) { g.beginPath(); g.ellipse(128, 90, 20 + i * 12, 12 + i * 8, 0, 0, 7); g.stroke(); } });
        const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshStandardMaterial({ map: t, roughness: 0.95, ...PO })); m.rotation.x = -Math.PI / 2; m.position.y = 0.005; m.receiveShadow = true; return m; }
      function zimmerpflanze(seed) { const r = rng(seed), g = new THREE.Group(); cyl(0.16, 0.12, 0.3, M([0xb8643a, 0xe8e4dc, 0x2a2a2a][Math.floor(r() * 3)], { roughness: 0.6 }), 0, 0.15, 0, g, 20);
        for (let i = 0; i < 14; i++) { const blatt = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 6), M(new THREE.Color(0x3a7a3a).offsetHSL(0, 0, (r() - 0.5) * 0.1).getHex(), { roughness: 0.7, side: THREE.DoubleSide })); const a = r() * 6.28, h = 0.4 + r() * 0.6; blatt.position.set(Math.cos(a) * 0.15 * h, 0.3 + h * 0.6, Math.sin(a) * 0.15 * h); blatt.scale.set(0.5, 0.12, 1.4); blatt.rotation.set(0.6, a, 0); blatt.castShadow = true; g.add(blatt);
          const stiel = cyl(0.006, 0.006, h * 0.6, M(0x2a5a2a), blatt.position.x * 0.5, 0.3 + h * 0.3, blatt.position.z * 0.5, g, 4); } return g; }
      function bild(seed, w = 0.6, h = 0.45) { const r = rng(seed), g = new THREE.Group(); box(w + 0.06, h + 0.06, 0.03, holzM(HOLZ[Math.floor(r() * 6)]), 0, 0, 0, g);
        const t = canvasTex(128, 96, (c) => { const gr = c.createLinearGradient(0, 0, 0, 96); gr.addColorStop(0, ["#8ab0d8", "#e8a060", "#3a5a8a"][Math.floor(r() * 3)]); gr.addColorStop(1, ["#4a6a3a", "#c8b080", "#1a2a3a"][Math.floor(r() * 3)]); c.fillStyle = gr; c.fillRect(0, 0, 128, 96); c.fillStyle = "rgba(40,50,40,.7)"; c.beginPath(); c.moveTo(0, 70); for (let x = 0; x <= 128; x += 16) c.lineTo(x, 50 + r() * 25); c.lineTo(128, 96); c.lineTo(0, 96); c.fill(); });
        const p = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: t, roughness: 0.6 })); p.position.z = 0.017; g.add(p); return g; }
      // Komplettes Zimmer: Boden (Parkett), Wände mit Fenster, Möbel je nach Art
      function zimmer(s, seed, o = {}) { const r = rng(seed), g = new THREE.Group(); s.add(g); const w = o.breite ?? 5, d = o.tiefe ?? 4.5, h = 2.6, art = o.art ?? "wohnzimmer";
        const parkett = texHolz(HOLZ[Math.floor(r() * 4)]).clone(); parkett.needsUpdate = true; parkett.repeat.set(w / 1.2, d / 1.2);
        box(w, 0.05, d, new THREE.MeshStandardMaterial({ map: parkett, roughness: 0.45 }), 0, -0.025, 0, g);
        const wandC = o.wand ?? [0xf2ece0, 0xe0e8ec, 0xece0d0, 0xd8e0d0, 0xf6f4f0][Math.floor(r() * 5)], wand = M(wandC, { roughness: 0.95, map: texStoff("stoff") });
        box(w, h, 0.1, wand, 0, h / 2, -d / 2, g); box(0.1, h, d, wand, -w / 2, h / 2, 0, g);
        const rw = new THREE.Group(); rw.position.set(w / 2, 0, 0); g.add(rw); box(0.1, 0.9, d, wand, 0, 0.45, 0, rw); box(0.1, 0.5, d, wand, 0, h - 0.25, 0, rw); box(0.1, 1.2, d * 0.2, wand, 0, 1.5, -d * 0.4, rw); box(0.1, 1.2, d * 0.2, wand, 0, 1.5, d * 0.4, rw);
        box(0.04, 1.2, d * 0.6, new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.02, transparent: true, opacity: 0.12 }), 0, 1.5, 0, rw); box(0.06, 0.05, d * 0.6, M(0xf2f2f0), 0, 1.5, 0, rw); box(0.06, 1.2, 0.05, M(0xf2f2f0), 0, 1.5, 0, rw); // Fenster
        for (const sz of [-1, 1]) { const v = new THREE.Mesh(new THREE.PlaneGeometry(d * 0.14, 1.9, 6, 1), M([0xe8dcc8, 0x8a3a3a, 0x3a4a6a][Math.floor(r() * 3)], { roughness: 0.95, side: THREE.DoubleSide })); const p = v.geometry.attributes.position; for (let k = 0; k < p.count; k++) p.setZ(k, Math.sin(p.getX(k) * 40) * 0.03); v.geometry.computeVertexNormals(); v.rotation.y = -Math.PI / 2; v.position.set(-0.1, 1.55, sz * d * 0.33); rw.add(v); }
        box(w, 0.08, 0.02, M(0xf6f6f2), 0, 0.04, -d / 2 + 0.06, g); // Fußleiste
        const setze = (obj, x, z, ry = 0) => { obj.position.set(x, 0, z); obj.rotation.y = ry; g.add(obj); return obj; };
        if (art === "wohnzimmer") { setze(sofa(seed), -0.3, -d / 2 + 0.55); setze(tisch(seed + 1, { hoehe: 0.42, breite: 1.0, tiefe: 0.6 }), -0.3, -d / 2 + 1.7); setze(teppich(seed), -0.3, -d / 2 + 1.6); setze(regal(seed + 2), -w / 2 + 0.25, 0.3, Math.PI / 2); setze(stehlampe(seed, !!o.licht), -w / 2 + 0.5, -d / 2 + 0.5);
          const tv = setze(fernseher(!!o.tv), -0.3, d / 2 - 0.4, Math.PI); box(1.6, 0.5, 0.4, holzM(HOLZ[0]), -0.3, 0.25, d / 2 - 0.35, g); setze(zimmerpflanze(seed), w / 2 - 0.5, -d / 2 + 0.5); const b2 = bild(seed); b2.position.set(-0.3, 1.7, -d / 2 + 0.07); g.add(b2); }
        if (art === "schlafzimmer") { setze(bett(seed), 0, -d / 2 + 1.1); setze(schrank(seed), -w / 2 + 0.35, 0.8, Math.PI / 2); setze(stehlampe(seed, !!o.licht), 1.2, -d / 2 + 0.4); setze(teppich(seed, 1.8, 1.2), 0, 0.6); const b2 = bild(seed); b2.position.set(0, 1.6, -d / 2 + 0.07); g.add(b2); }
        if (art === "kueche") { const front = M([0xf2f2f0, 0x3a4a5a, 0x8a9a7a][Math.floor(r() * 3)], { roughness: 0.4 }); box(w * 0.8, 0.88, 0.62, front, -w * 0.05, 0.44, -d / 2 + 0.36, g); box(w * 0.8, 0.04, 0.64, M(0x2a2a2c, { roughness: 0.25 }), -w * 0.05, 0.9, -d / 2 + 0.36, g);
          for (let i = 0; i < 6; i++) box(0.012, 0.8, 0.005, M(0x8a8a8a), -w * 0.45 + i * w * 0.14, 0.44, -d / 2 + 0.672, g); box(w * 0.8, 0.7, 0.35, front, -w * 0.05, 1.85, -d / 2 + 0.2, g);
          for (let i = 0; i < 4; i++) cyl(0.09, 0.09, 0.01, M(0x111111, { roughness: 0.3 }), 0.6 + (i % 2) * 0.25, 0.925, -d / 2 + 0.25 + Math.floor(i / 2) * 0.25, g, 20);
          box(0.7, 1.9, 0.65, M(0xd8dadc, { metalness: 0.6, roughness: 0.3 }), w / 2 - 0.45, 0.95, -d / 2 + 0.36, g); setze(tisch(seed + 3), 0, 0.6); setze(stuhl(seed), -0.45, 0.6, Math.PI / 2); setze(stuhl(seed + 1), 0.45, 0.6, -Math.PI / 2); }
        return g; }
