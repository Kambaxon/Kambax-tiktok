      // ===== Flugzeuge v1 (braucht: rng, box, cyl, M, canvasTex, glanzPunkt, lichtKegel) =====
      // flugzeug(typ, { seed, farbe (Leitwerk/Streifen), fahrwerk, kondens, nachbrenner })
      //   Zivil: "a320" (Kurz-/Mittelstrecke), "a350" (Langstrecke), "b747f" (Fracht), "bizjet", "atr72" (Turboprop), "cessna", "segler", "ul"
      //   Militär: "eurofighter", "f35", "b2", "a400m", "awacs" (Aufklärer)   Forschung: "x15" (Raketenflugzeug)
      // Nase zeigt nach +z, Rumpfmitte im Ursprung, echte Meter. flugzeugUpdate(f, T) für Propeller, Blinklichter, Flammen.
      const FLUG = {
        a320:       { L: 37, R: 2.0, span: 34, chord: [6.5, 1.6], sweep: 0.45, flH: -0.6, tw: "fan", twR: 0.95, tw2: [[5.8, -1.6, 2.5]], fin: [6, 4.2, 0.7], stab: [12.5, 3.2], fenster: true, lack: "zivil" },
        a350:       { L: 65, R: 3.0, span: 64, chord: [11, 2.4], sweep: 0.55, flH: -1.0, tw: "fan", twR: 1.65, tw2: [[10, -2.6, 4]], fin: [9.5, 7, 0.75], stab: [19, 5], fenster: true, lack: "zivil", winglet: true },
        b747f:      { L: 70, R: 3.2, span: 64, chord: [12, 2.6], sweep: 0.62, flH: -1.1, tw: "fan", twR: 1.35, tw2: [[9, -2.4, 5], [20, -1.8, 1.5]], fin: [10, 8, 0.75], stab: [21, 5.5], fenster: false, buckel: true, lack: "fracht" },
        bizjet:     { L: 20, R: 1.05, span: 19, chord: [3.4, 1.0], sweep: 0.5, flH: -0.5, tw: "heck", twR: 0.55, fin: [3.6, 2.6, 0.8], stab: [6.5, 1.5], ttail: true, fenster: true, oval: true, lack: "privat", winglet: true },
        atr72:      { L: 27, R: 1.45, span: 27, chord: [2.6, 1.4], sweep: 0.03, flH: 1.25, tw: "prop", twR: 0.6, tw2: [[4.1, 0.8, 3]], blaetter: 6, propR: 1.95, fin: [5, 3.8, 0.55], stab: [7.5, 1.6], ttail: true, fenster: true, lack: "zivil" },
        cessna:     { L: 8.3, R: 0.62, span: 11, chord: [1.6, 1.1], sweep: 0, flH: 0.75, tw: "nase", blaetter: 2, propR: 0.95, fin: [1.6, 1.4, 0.5], stab: [3.4, 0.9], fenster: true, streben: true, lack: "klein", fahrwerkFest: true },
        segler:     { L: 7.2, R: 0.38, span: 18, chord: [0.95, 0.35], sweep: 0, flH: 0.15, tw: null, fin: [1.2, 0.9, 0.3], stab: [2.6, 0.5], ttail: true, haube: true, lack: "segler", schlank: true },
        ul:         { L: 6.2, R: 0.5, span: 9.5, chord: [1.4, 1.2], sweep: 0, flH: 0.65, tw: "nase", blaetter: 3, propR: 0.85, fin: [1.2, 1.0, 0.4], stab: [2.6, 0.7], haube: true, streben: true, lack: "klein", schlank: true, fahrwerkFest: true },
        eurofighter:{ L: 16, R: 0.9, span: 11, chord: [8.5, 1.0], sweep: 0.95, flH: -0.2, delta: true, canard: true, tw: "duese2", fin: [3.2, 3.6, 1.1], haube: true, lack: "militaer", spitz: true },
        f35:        { L: 15.7, R: 1.1, span: 10.7, chord: [5.5, 1.6], sweep: 0.6, flH: 0, tw: "duese1", fin2: true, stab: [6.8, 2.2], haube: true, lack: "stealth", spitz: true, flach: true },
        b2:         { L: 21, R: 1.4, span: 52, lack: "stealth", nurfluegel: true },
        a400m:      { L: 43, R: 2.8, span: 42, chord: [5.5, 2.4], sweep: 0.1, flH: 2.2, tw: "prop", twR: 0.9, tw2: [[6.5, 1.4, 2.2], [12.5, 1.6, 1.8]], blaetter: 8, propR: 2.6, fin: [10, 6.5, 0.6], stab: [19, 4], ttail: true, fenster: false, lack: "militaer", rampe: true },
        awacs:      { L: 46, R: 2.0, span: 44, chord: [8, 2], sweep: 0.55, flH: -0.7, tw: "fan", twR: 0.9, tw2: [[7, -1.6, 3], [14, -1.2, 0]], fin: [7, 5, 0.7], stab: [14, 3.5], fenster: false, lack: "militaer", radar: true },
        x15:        { L: 15.5, R: 0.7, span: 6.8, chord: [3.2, 1.2], sweep: 0.45, flH: 0, tw: "rakete", fin: [2.4, 3.2, 0.9], finUnten: true, stab: [5.4, 1.6], haube: true, lack: "x15", spitz: true },
      };
      function rumpfGeo(L, R, o = {}) { // Lathe-Rumpf entlang z (Nase +z)
        const pts = [], n = 48; for (let i = 0; i <= n; i++) { const t = i / n; let rr;
          const nase = o.spitz ? 0.28 : o.schlank ? 0.22 : 0.12, heck = o.spitz ? 0.12 : 0.3;
          if (t > 1 - nase) { const k = (1 - t) / nase; rr = R * (o.spitz ? Math.pow(k, 0.7) : Math.sqrt(Math.max(0, 1 - (1 - k) ** 2))); }
          else if (t < heck) { const k = t / heck; rr = R * (o.spitz ? 0.75 + 0.25 * k : o.schlank ? 0.25 + 0.75 * Math.pow(k, 0.6) : 0.18 + 0.82 * Math.sqrt(k)); }
          else rr = R; pts.push(new THREE.Vector2(Math.max(0.001, rr), -L / 2 + t * L)); }
        const g = new THREE.LatheGeometry(pts, 40); g.rotateX(Math.PI / 2); return g; }
      function fluegelGeo(spanHalb, c0, c1, sweep, dicke, delta) { // Halbflügel in xz-Ebene, Vorderkante bei z=0 an der Wurzel
        const sh = new THREE.Shape(); const pfeil = spanHalb * Math.tan(sweep * (delta ? 1 : 0.75));
        sh.moveTo(0, 0); sh.lineTo(spanHalb, -pfeil); sh.lineTo(spanHalb, -pfeil - c1); sh.lineTo(0, -c0); sh.closePath();
        const g = new THREE.ExtrudeGeometry(sh, { depth: dicke, bevelEnabled: true, bevelThickness: dicke * 0.45, bevelSize: Math.min(c1 * 0.25, dicke * 1.2), bevelSegments: 3 }); g.rotateX(Math.PI / 2); g.translate(0, dicke / 2, 0); return g; }
      function livery(F, farbe, typ) {
        return canvasTex(1024, 512, (g) => { const lk = F.lack; const W = 1024, H = 512;
          const basis = lk === "militaer" ? "#7a8288" : lk === "stealth" ? "#4a4e54" : lk === "x15" ? "#1a1a1c" : "#f4f6f8"; g.fillStyle = basis; g.fillRect(0, 0, W, H);
          const q = rng(7); for (let i = 0; i < 3000; i++) { g.fillStyle = `rgba(0,0,0,${q() * 0.04})`; g.fillRect(q() * W, q() * H, 3, 3); } // Patina
          if (lk === "militaer") for (let i = 0; i < 40; i++) { g.fillStyle = q() < 0.5 ? "rgba(90,98,104,.6)" : "rgba(110,118,122,.5)"; g.beginPath(); g.ellipse(q() * W, q() * H, 40 + q() * 80, 20 + q() * 40, q() * 3, 0, 7); g.fill(); }
          if (lk === "zivil" || lk === "fracht" || lk === "privat") { g.fillStyle = "#c8ccd0"; g.fillRect(0, 0, W * 0.08, H); g.fillRect(W * 0.92, 0, W * 0.08, H); // Bauch grau
            const c = "#" + new THREE.Color(farbe).getHexString(); g.fillStyle = c; for (const u of [0.36, 0.64]) g.fillRect(u * W - 10, H * 0.05, 20, H * 0.8); }
          if (lk === "klein" || lk === "segler") { const c = "#" + new THREE.Color(farbe).getHexString(); g.fillStyle = c; for (const u of [0.27, 0.73]) g.fillRect(u * W - 8, H * 0.1, 16, H * 0.75); }
          // Seitenfenster in Reihen (u=0.29 / 0.71), Cockpitfenster vorne oben
          if (F.fenster) for (const u of [0.3, 0.7]) { const n = Math.round(F.L * (F.oval ? 0.4 : 1.25)); for (let i = 0; i < n; i++) { const y = H * (0.2 + 0.58 * i / n); g.fillStyle = "#1a2430"; if (F.oval) { g.beginPath(); g.ellipse(u * W, y, 7, 10, 0, 0, 7); g.fill(); } else g.fillRect(u * W - 5, y, 10, H * 0.58 / n * 0.55); } }
          if (lk !== "stealth" && !F.haube) for (const u of [0.4, 0.6]) { g.fillStyle = "#121a22"; g.fillRect(u * W - 26, H * 0.045, 52, 18); }
          if (F.fenster) { g.fillStyle = "#3a3a3e"; for (const u of [0.25, 0.75]) g.fillRect(u * W - 12, H * 0.25, 24, 34); } // Tür
          if (lk === "militaer" || lk === "stealth") { g.fillStyle = "rgba(30,30,32,.7)"; g.font = "bold 30px sans-serif"; g.fillText("54+12", W * 0.24, H * 0.7); }
        });
      }
      function flugzeug(typ = "a320", o = {}) {
        const F = FLUG[typ], r = rng(o.seed ?? 1), g = new THREE.Group(); const farbe = o.farbe ?? [0x1e3a8a, 0xc8202a, 0x0a6a5a, 0x2a2a2e, 0xe0a020][Math.floor(r() * 5)];
        const tex = livery(F, farbe, typ), haut = new THREE.MeshPhysicalMaterial({ map: tex, metalness: F.lack === "stealth" ? 0.2 : 0.4, roughness: F.lack === "militaer" || F.lack === "stealth" ? 0.6 : 0.3, clearcoat: F.lack === "zivil" || F.lack === "privat" ? 0.6 : 0, clearcoatRoughness: 0.15 });
        const grau = new THREE.MeshPhysicalMaterial({ color: F.lack === "militaer" ? 0x7a8288 : F.lack === "stealth" ? 0x4a4e54 : F.lack === "x15" ? 0x1a1a1c : 0xe8eaee, metalness: 0.4, roughness: F.lack === "militaer" || F.lack === "stealth" ? 0.6 : 0.3 });
        const akzent = M(farbe, { roughness: 0.35, metalness: 0.3 }), dunkel = M(0x1a1c1e, { roughness: 0.5, metalness: 0.5 }), metall = M(0xa8acb0, { metalness: 0.9, roughness: 0.3 });
        const add = (geo, mat, x = 0, y = 0, z = 0) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; g.add(m); return m; };
        const lichter = [], props = [], flammen = [];
        if (F.nurfluegel) { // B-2: Nurflügler mit Sägezahn-Hinterkante
          const s2 = F.span / 2, sh = new THREE.Shape(); sh.moveTo(0, 10.5); sh.lineTo(s2, -5); sh.lineTo(s2 - 3, -7); sh.lineTo(s2 * 0.62, -4.5); sh.lineTo(s2 * 0.45, -8); sh.lineTo(s2 * 0.2, -5); sh.lineTo(0, -8.5); sh.lineTo(-s2 * 0.2, -5); sh.lineTo(-s2 * 0.45, -8); sh.lineTo(-s2 * 0.62, -4.5); sh.lineTo(-(s2 - 3), -7); sh.lineTo(-s2, -5); sh.closePath();
          const geo = new THREE.ExtrudeGeometry(sh, { depth: 0.6, bevelEnabled: true, bevelThickness: 0.6, bevelSize: 1.2, bevelSegments: 4 }); geo.rotateX(Math.PI / 2); geo.translate(0, 0.3, 0); add(geo, grau);
          const kanzel = add(new THREE.SphereGeometry(2.4, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), grau, 0, 0.6, 3); kanzel.scale.set(1.2, 0.55, 3);
          for (const sx of [-1, 1]) { const ein = add(new THREE.SphereGeometry(1.4, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), grau, sx * 4, 0.6, -0.5); ein.scale.set(1, 0.4, 2.2); add(new THREE.BoxGeometry(1.6, 0.25, 0.4), dunkel, sx * 4, 1.05, 2.5); }
          for (const sx of [-1, 1]) { const w = add(new THREE.PlaneGeometry(0.8, 0.5), new THREE.MeshStandardMaterial({ color: 0x0a1018, roughness: 0.05, metalness: 0.8 }), sx * 0.7, 1.7, 5.2); w.rotation.x = -1.1; w.rotation.y = sx * 0.3; }
        } else {
          const rg = rumpfGeo(F.L, F.R, F); const rumpf = add(rg, haut); if (F.flach) rumpf.scale.set(1.5, 0.65, 1); if (F.schlank) rumpf.scale.set(0.9, 1.1, 1);
          if (F.buckel) { const b = add(new THREE.SphereGeometry(F.R * 0.85, 28, 18), haut, 0, F.R * 0.62, F.L * 0.28); b.scale.set(0.95, 0.75, 4.6); }
          // Flügel
          const s2 = F.span / 2, c0 = F.chord[0], c1 = F.chord[1], dicke = Math.max(0.05, c0 * (F.delta ? 0.04 : 0.09)), wz = F.delta ? -F.L * 0.05 : F.L * 0.12;
          for (const sx of [-1, 1]) { const fg = add(fluegelGeo(s2, c0, c1, F.sweep, dicke, F.delta), grau, 0, F.flH, wz + c0 * (F.delta ? 0.3 : 0.5)); if (sx < 0) fg.scale.x = -1; fg.rotation.z = sx * (F.flH > 0 ? -0.02 : 0.05);
            const pf = s2 * Math.tan(F.sweep * (F.delta ? 1 : 0.75)); const tipZ = wz + c0 * (F.delta ? 0.3 : 0.5) - pf;
            if (F.winglet) { const wl = add(new THREE.BoxGeometry(0.12, s2 * 0.08, c1 * 0.8), akzent, sx * s2, F.flH + s2 * 0.04 + s2 * 0.05 * 0.05, tipZ - c1 * 0.5); wl.rotation.z = -sx * 0.25; }
            const nav = glanzPunkt(sx < 0 ? 0xff2010 : 0x20ff40, F.L * 0.04 + 0.3); nav.position.set(sx * s2, F.flH + 0.1, tipZ - c1 * 0.3); g.add(nav); lichter.push({ m: nav, art: "nav" });
            if (F.streben) { const st = add(new THREE.CylinderGeometry(0.03, 0.03, Math.hypot(s2 * 0.45, F.flH + F.R * 0.6), 6), metall, sx * s2 * 0.22, (F.flH - F.R * 0.6) / 2, wz + c0 * 0.2); st.rotation.z = sx * Math.atan2(s2 * 0.45, F.flH + F.R * 0.6); }
          }
          if (F.canard) for (const sx of [-1, 1]) { const cn = add(fluegelGeo(1.6, 1.4, 0.4, 0.8, 0.05, true), grau, 0, 0.2, F.L * 0.3); if (sx < 0) cn.scale.x = -1; }
          // Leitwerk
          if (F.fin) { const [fh, fc, fsw] = F.fin; const sh = new THREE.Shape(); sh.moveTo(0, 0); sh.lineTo(fc, 0); sh.lineTo(fc * 0.95 - fh * fsw * 0.2, fh); sh.lineTo(fc * 0.55 - fh * fsw * 0.6 + fc * 0.15, fh); sh.closePath();
            const fgeo = new THREE.ExtrudeGeometry(sh, { depth: Math.max(0.06, fc * 0.05), bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.08, bevelSegments: 2 }); fgeo.rotateY(Math.PI / 2); fgeo.translate(0, 0, 0);
            const fin = add(fgeo, F.lack === "zivil" || F.lack === "privat" ? akzent : grau, -Math.max(0.06, fc * 0.05) / 2, F.R * (F.flach ? 0.55 : 0.75), -F.L / 2 + fc * 0.15); fin.position.z = -F.L / 2 + fc + 0.2;
            if (F.finUnten) { const fu = add(fgeo.clone(), grau, -Math.max(0.06, fc * 0.05) / 2, -F.R * 0.7, -F.L / 2 + fc + 0.2); fu.scale.set(1, -0.8, 1); }
            const beacon = glanzPunkt(0xff2010, F.L * 0.03 + 0.25); beacon.position.set(0, F.R + 0.1, 0); g.add(beacon); lichter.push({ m: beacon, art: "blitz" });
            if (F.stab) { const [ss, sc] = F.stab, yH = F.ttail ? F.R * 0.75 + fh : F.R * 0.2; for (const sx of [-1, 1]) { const st = add(fluegelGeo(ss / 2, sc, sc * 0.45, 0.5, Math.max(0.05, sc * 0.06), false), grau, 0, yH, -F.L / 2 + sc + (F.ttail ? fc * 0.15 - fh * fsw * 0.2 : 0.4)); if (sx < 0) st.scale.x = -1; } } }
          if (F.fin2) for (const sx of [-1, 1]) { const sh = new THREE.Shape(); sh.moveTo(0, 0); sh.lineTo(2.6, 0); sh.lineTo(2.0, 2.2); sh.lineTo(1.0, 2.2); sh.closePath(); const fgeo = new THREE.ExtrudeGeometry(sh, { depth: 0.08, bevelEnabled: false }); fgeo.rotateY(-Math.PI / 2); const f2 = add(fgeo, grau, sx * 1.2, 0.5, -F.L / 2 + 0.5); f2.rotation.z = -sx * 0.4;
            const st = add(fluegelGeo(3.2, 2.2, 1.0, 0.6, 0.06, false), grau, 0, 0.1, -F.L / 2 + 2.6); if (sx < 0) st.scale.x = -1; }
          if (F.stab && !F.fin) { /* nicht genutzt */ }
          // Kanzel / Cockpit
          if (F.haube) { const hb = add(new THREE.SphereGeometry(F.R * 0.75, 24, 14, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshPhysicalMaterial({ color: F.lack === "stealth" ? 0xc8a050 : 0x8ab0c8, roughness: 0.02, metalness: 0.6, transparent: true, opacity: 0.6, envMapIntensity: 2 }), 0, F.R * (F.flach ? 0.45 : 0.6), F.L * (F.spitz ? 0.2 : 0.15)); hb.scale.set(0.8, 0.8, F.schlank ? 2.6 : 3.2); }
          // Triebwerke
          const fan = (x, y, z, R) => { const gondel = add(new THREE.CylinderGeometry(R, R * 0.82, R * 3.6, 32, 1, true), grau, x, y, z); gondel.rotation.x = Math.PI / 2; gondel.material = new THREE.MeshPhysicalMaterial({ color: 0xd8dadc, metalness: 0.5, roughness: 0.3, side: THREE.DoubleSide });
            const lip = new THREE.Mesh(new THREE.TorusGeometry(R * 0.96, R * 0.08, 10, 32), metall); lip.position.set(x, y, z + R * 1.8); g.add(lip);
            const scheibe = add(new THREE.CircleGeometry(R * 0.92, 32), dunkel, x, y, z + R * 1.3); for (let k = 0; k < 18; k++) { const bl = add(new THREE.BoxGeometry(0.04, R * 0.8, 0.02), M(0x5a5e62, { metalness: 0.9, roughness: 0.3 }), x, y, z + R * 1.32); bl.geometry.translate(0, R * 0.45, 0); bl.rotation.z = k / 18 * Math.PI * 2; bl.rotation.y = 0.4; props.push({ m: bl, v: 0, fan: true }); }
            const spinner = add(new THREE.ConeGeometry(R * 0.28, R * 0.6, 20), metall, x, y, z + R * 1.6); spinner.rotation.x = Math.PI / 2;
            const duese = add(new THREE.ConeGeometry(R * 0.5, R * 1.4, 20), dunkel, x, y, z - R * 2.2); duese.rotation.x = -Math.PI / 2;
            const pylon = add(new THREE.BoxGeometry(R * 0.2, Math.abs(F.flH - y) + 0.2, R * 2.4), grau, x, (F.flH + y) / 2, z + R * 0.2); return { x, y, z: z - R * 2.6 }; };
          const prop = (x, y, z, R, nB, laengs = 0) => { const gondel = add(new THREE.CapsuleGeometry(R, R * 4, 8, 20), grau, x, y, z); gondel.rotation.x = Math.PI / 2;
            const hub = new THREE.Group(); hub.position.set(x, y, z + R * 3.1 + laengs); g.add(hub); const sp = new THREE.Mesh(new THREE.ConeGeometry(R * 0.55, R * 1.2, 20), F.lack === "militaer" ? dunkel : metall); sp.rotation.x = Math.PI / 2; hub.add(sp);
            for (let k = 0; k < nB; k++) { const bl = new THREE.Mesh(new THREE.BoxGeometry(F.propR * 0.16, F.propR, 0.05), dunkel); bl.geometry.translate(0, F.propR / 2, 0); bl.rotation.z = k / nB * Math.PI * 2; bl.rotation.y = 0.35; const blg = new THREE.Group(); blg.add(bl); hub.add(blg); }
            const scheibe = new THREE.Mesh(new THREE.CircleGeometry(F.propR, 40), new THREE.MeshBasicMaterial({ color: 0x222222, transparent: true, opacity: 0.0, depthWrite: false })); hub.add(scheibe); props.push({ m: hub, v: 1, scheibe }); return hub; };
          const auspuff = [];
          if (F.tw === "fan") F.tw2.forEach(([xx, yy, zz]) => { for (const sx of [-1, 1]) auspuff.push(fan(sx * xx, F.flH + yy, wz + zz, F.twR)); });
          if (F.tw === "heck") for (const sx of [-1, 1]) auspuff.push(fan(sx * (F.R + F.twR * 0.9), F.R * 0.35, -F.L * 0.28, F.twR));
          if (F.tw === "prop") F.tw2.forEach(([xx, yy, zz]) => { for (const sx of [-1, 1]) prop(sx * xx, F.flH - F.twR * 0.3 + (yy - yy), wz + zz * 0.3, F.twR, F.blaetter); });
          if (F.tw === "nase") { const hub = new THREE.Group(); hub.position.set(0, 0, F.L / 2 + 0.08); g.add(hub); const sp = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.4, 16), metall); sp.rotation.x = Math.PI / 2; hub.add(sp); for (let k = 0; k < F.blaetter; k++) { const bl = new THREE.Mesh(new THREE.BoxGeometry(0.1, F.propR, 0.03), dunkel); bl.geometry.translate(0, F.propR / 2, 0); bl.rotation.z = k / F.blaetter * Math.PI * 2; hub.add(bl); } props.push({ m: hub, v: 1 }); }
          if (F.tw === "duese1" || F.tw === "duese2" || F.tw === "rakete") { const n = F.tw === "duese2" ? [-0.5, 0.5] : [0]; n.forEach((xx) => { const d2 = add(new THREE.CylinderGeometry(0.5, 0.45, 1.2, 24, 1, true), M(0x3a3a3c, { metalness: 0.8, roughness: 0.4, side: THREE.DoubleSide }), xx, 0, -F.L / 2 - 0.3); d2.rotation.x = Math.PI / 2;
            if (o.nachbrenner || F.tw === "rakete") { const fl = lichtKegel(F.tw === "rakete" ? 9 : 5, 0.45, F.tw === "rakete" ? 0xffd8a0 : 0xff9a50, 0.9); fl.position.set(xx, 0, -F.L / 2 - 0.9); fl.rotation.x = Math.PI / 2; g.add(fl); flammen.push(fl); const k2 = glanzPunkt(0xffb070, 1.6); k2.position.set(xx, 0, -F.L / 2 - 1.0); g.add(k2); } });
            if (F.tw !== "rakete") for (const sx of [-1, 1]) add(new THREE.BoxGeometry(0.9, 0.9, 3), dunkel, sx * F.R * 0.9, -F.R * 0.35, F.L * 0.08); } // Lufteinläufe
          if (F.radar) { const dome = add(new THREE.CylinderGeometry(4.5, 4.5, 0.9, 40), M(0x5a5e62, { roughness: 0.5 }), 0, F.R + 3.2, -F.L * 0.15); const b1 = add(new THREE.CylinderGeometry(0.15, 0.25, 2.6, 8), grau, 0, F.R + 1.5, -F.L * 0.1); b1.rotation.x = 0.3; add(new THREE.BoxGeometry(9, 0.1, 0.4), M(0xe8e8e8), 0, F.R + 3.2, -F.L * 0.15); props.push({ m: dome, v: 0.05, achse: "y" }); }
          if (F.rampe) add(new THREE.BoxGeometry(F.R * 1.4, 0.05, 3), M(0x3a3e42), 0, -F.R * 0.25, -F.L / 2 + 6).rotation.x = 0.4;
          // Fahrwerk
          if (o.fahrwerk || F.fahrwerkFest) { const rad = (x, z, R) => { const st = add(new THREE.CylinderGeometry(R * 0.15, R * 0.15, F.R * 0.9, 8), metall, x, -F.R * 0.9, z); const w = add(new THREE.CylinderGeometry(R, R, R * 0.6, 20), M(0x111111, { roughness: 0.8 }), x, -F.R * 1.35, z); w.rotation.z = Math.PI / 2; };
            const R = Math.max(0.2, F.R * 0.3); rad(0, F.L * 0.35, R * 0.8); for (const sx of [-1, 1]) rad(sx * F.R * 0.9, F.L * 0.02, R); }
          g.userData.auspuff = auspuff;
        }
        // Kondensstreifen hinter den Triebwerken (weißer, verblassender Schweif)
        if (o.kondens) { const ziele = (g.userData.auspuff && g.userData.auspuff.length) ? g.userData.auspuff : [{ x: 0, y: 0, z: -F.L / 2 }];
          ziele.forEach((a) => { const len = o.kondensLaenge ?? F.L * 6; const geo = new THREE.CylinderGeometry(0.15, 1.6, len, 12, 1, true); geo.translate(0, -len / 2, 0); geo.rotateX(Math.PI / 2);
            const mat = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, uniforms: { uL: { value: len } }, vertexShader: `varying float vK; uniform float uL; void main(){ vK = clamp(-position.z / uL, 0.0, 1.0); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
              fragmentShader: `varying float vK; void main(){ gl_FragColor = vec4(vec3(1.0), (1.0 - vK) * smoothstep(0.0, 0.03, vK) * 0.75); }` });
            const tr = new THREE.Mesh(geo, mat); tr.position.set(a.x, a.y, a.z); tr.scale.set(1, 1, 1); g.add(tr); }); }
        g.userData.lichter = lichter; g.userData.props = props; g.userData.flammen = flammen; g.userData.typ = typ; g.userData.L = F.L;
        return g;
      }
      function flugzeugUpdate(f, T) { const u = f.userData;
        u.props.forEach((p) => { if (p.achse === "y") p.m.rotation.y = T * p.v * 6; else if (p.fan) {} else { p.m.rotation.z = T * 45; if (p.scheibe) p.scheibe.material.opacity = 0.12; } });
        u.lichter.forEach((L, i) => { if (L.art === "blitz") L.m.visible = (T * 1.1 + i * 0.3) % 1 < 0.12; });
        u.flammen.forEach((fl, i) => { fl.scale.set(1, 1, 0.85 + 0.15 * Math.sin(T * 37 + i)); });
      }
