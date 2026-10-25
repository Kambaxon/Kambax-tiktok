      // ===== Tiere v1: Hunde (Rassen), Katzen, Tauben (braucht: rng, canvasTex, M) =====
      // hund(seed, { rasse: "labrador"|"schaeferhund"|"dackel"|"mops"|"husky"|"pudel"|"beagle", leine: bool })
      // katze(seed, { fell: "rot"|"grau"|"schwarz"|"getigert"|"weiss" }), taube(seed)
      // Animation: tierLaufen(t, T, tempo), tierIdle(t, T), tierSitzen(t), taubePicken(t, T), taubeFliegen(t, T)
      const FELL = {};
      function texFell(art = "kurz", seed = 1) {
        const key = art + seed; if (FELL[key]) return FELL[key];
        const t = canvasTex(256, 256, (g) => { const q = rng(seed * 11 + art.length); g.fillStyle = "#e8e8e8"; g.fillRect(0, 0, 256, 256);
          const n = art === "lang" ? 2600 : 4200, l = art === "lang" ? 14 : 6;
          for (let i = 0; i < n; i++) { const x = q() * 256, y = q() * 256, a = Math.PI / 2 + (q() - 0.5) * 0.6; g.strokeStyle = q() < 0.5 ? `rgba(255,255,255,${0.2 + q() * 0.3})` : `rgba(0,0,0,${0.08 + q() * 0.12})`; g.lineWidth = 1; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke(); }
          if (art === "tiger") { g.fillStyle = "rgba(40,20,8,.55)"; for (let y = 0; y < 256; y += 22) { g.beginPath(); g.moveTo(0, y); for (let x = 0; x <= 256; x += 16) g.lineTo(x, y + Math.sin(x * 0.05 + y) * 5 + (q() - 0.5) * 3); for (let x = 256; x >= 0; x -= 16) g.lineTo(x, y + 7 + Math.sin(x * 0.05 + y) * 5); g.fill(); } }
          if (art === "locken") for (let i = 0; i < 900; i++) { g.strokeStyle = `rgba(0,0,0,${0.06 + q() * 0.08})`; g.beginPath(); g.arc(q() * 256, q() * 256, 2 + q() * 3, 0, 5); g.stroke(); } });
        t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(2, 2); FELL[key] = t; return t;
      }
      const RASSEN = {
        labrador:     { legH: 0.34, bodyL: 0.42, bodyR: 0.15, headR: 0.1, snout: 0.11, ohr: "schlapp", rute: "rute", fell: [0xd8b070, 0x2a2420, 0x6a4024], bauch: null, art: "kurz" },
        schaeferhund: { legH: 0.38, bodyL: 0.46, bodyR: 0.14, headR: 0.095, snout: 0.13, ohr: "steh", rute: "buschig", fell: [0xb07838], ruecken: 0x1e1814, bauch: 0xc89858, art: "kurz" },
        dackel:       { legH: 0.1, bodyL: 0.38, bodyR: 0.085, headR: 0.07, snout: 0.09, ohr: "schlapp", rute: "rute", fell: [0x7a3a18, 0x2a1a12], bauch: null, art: "kurz" },
        mops:         { legH: 0.16, bodyL: 0.18, bodyR: 0.11, headR: 0.085, snout: 0.025, ohr: "knick", rute: "ringel", fell: [0xd8c098], bauch: null, art: "kurz", ohrFarbe: 0x3a302a },
        husky:        { legH: 0.34, bodyL: 0.4, bodyR: 0.14, headR: 0.095, snout: 0.1, ohr: "steh", rute: "buschig", fell: [0x6a6a70, 0x3a3634], bauch: 0xf2f0ec, maske: 0xf2f0ec, art: "lang", augen: 0x6ab0e8 },
        pudel:        { legH: 0.3, bodyL: 0.3, bodyR: 0.12, headR: 0.085, snout: 0.1, ohr: "schlapp", rute: "kurz", fell: [0xf2ece0, 0x2a2626, 0xb88a5a], bauch: null, art: "locken" },
        beagle:       { legH: 0.22, bodyL: 0.3, bodyR: 0.12, headR: 0.085, snout: 0.09, ohr: "schlapp", rute: "rute", fell: [0xb8743a], ruecken: 0x1e1a18, bauch: 0xf2f0ea, art: "kurz" },
      };
      function vierbeiner(seed, R, o = {}) {
        const r = rng(seed * 97 + 3), g = new THREE.Group(), pick = (a) => a[Math.floor(r() * a.length)];
        const fellC = o.farbe ?? pick(R.fell), map = texFell(R.art, seed % 3 + (R.art === "tiger" ? 10 : 0));
        const F = (c, rough = 0.85) => new THREE.MeshStandardMaterial({ color: c, roughness: rough, map });
        const fell = F(fellC), bauchM = R.bauch ? F(R.bauch) : fell, rueckenM = R.ruecken ? F(R.ruecken) : fell, maskeM = R.maske ? F(R.maske) : fell;
        const mk = (geo, m, x, y, z, p = g) => { const ms = new THREE.Mesh(geo, m); ms.position.set(x, y, z); ms.castShadow = ms.receiveShadow = true; p.add(ms); return ms; };
        const { legH, bodyL, bodyR, headR } = R, bodyY = legH + bodyR * 0.85;
        // Rumpf: Kapsel + Brust + Bauch-/Sattel-Färbung
        const rumpf = mk(new THREE.CapsuleGeometry(bodyR, bodyL, 8, 24), fell, 0, bodyY, 0); rumpf.rotation.x = Math.PI / 2;
        mk(new THREE.SphereGeometry(bodyR * 1.08, 24, 16), fell, 0, bodyY - bodyR * 0.05, bodyL * 0.42).scale.set(1, 1.05, 1);
        if (R.bauch) { const b = mk(new THREE.CapsuleGeometry(bodyR * 0.82, bodyL * 0.9, 6, 20), bauchM, 0, bodyY - bodyR * 0.24, 0.02); b.rotation.x = Math.PI / 2; }
        if (R.ruecken) { const s = mk(new THREE.CapsuleGeometry(bodyR * 0.9, bodyL * 0.75, 6, 20), rueckenM, 0, bodyY + bodyR * 0.16, -bodyL * 0.05); s.rotation.x = Math.PI / 2; s.scale.set(1.06, 1, 0.85); }
        // Hals + Kopf
        const kopf = new THREE.Group(); kopf.position.set(0, bodyY + bodyR * 0.75 + headR * 0.4, bodyL / 2 + bodyR * 0.85); g.add(kopf);
        const hals = mk(new THREE.CylinderGeometry(headR * 0.7, bodyR * 0.8, bodyR * 1.3, 18), fell, 0, bodyY + bodyR * 0.45, bodyL / 2 + bodyR * 0.5); hals.rotation.x = 0.7;
        const schaedel = mk(new THREE.SphereGeometry(headR, 24, 18), maskeM === fell || R.maske === R.bauch ? fell : fell, 0, 0, 0, kopf); schaedel.scale.set(0.95, 0.92, 1.05);
        const sn = R.snout, schnauzeM = R.maske ? maskeM : fell;
        if (sn > 0.04) { const s = mk(new THREE.CapsuleGeometry(headR * 0.45, sn, 6, 16), schnauzeM, 0, -headR * 0.3, headR * 0.6 + sn * 0.4, kopf); s.rotation.x = Math.PI / 2 + 0.12; s.scale.set(1, 1, 0.85); }
        else mk(new THREE.SphereGeometry(headR * 0.55, 18, 12), schnauzeM, 0, -headR * 0.25, headR * 0.72, kopf).scale.set(1.2, 0.8, 0.6);
        const nase = mk(new THREE.SphereGeometry(headR * 0.17, 14, 10), M(0x111010, { roughness: 0.25 }), 0, -headR * 0.18, headR * 0.72 + sn * 0.95 + 0.02, kopf); nase.scale.set(1.3, 0.9, 0.8);
        box(headR * 0.5, 0.004, 0.004, M(0x1a1210), 0, -headR * 0.55, headR * 0.6 + sn * 0.7, kopf); // Maulspalte
        const zunge = mk(new THREE.SphereGeometry(headR * 0.18, 12, 8), M(0xd85a6a, { roughness: 0.4 }), 0, -headR * 0.62, headR * 0.65 + sn * 0.55, kopf); zunge.scale.set(1, 0.4, 1.4); zunge.visible = !!o.hecheln;
        // Augen mit Iris + Lichtpunkt
        const augeM = M(R.augen ?? 0x3a2412, { roughness: 0.1 }), glanz = new THREE.MeshBasicMaterial({ color: 0xffffff });
        for (const sx of [-1, 1]) { const a = mk(new THREE.SphereGeometry(headR * 0.15, 14, 10), augeM, sx * headR * 0.42, headR * 0.15, headR * 0.82, kopf);
          mk(new THREE.SphereGeometry(headR * 0.08, 8, 6), M(0x050505, { roughness: 0.1 }), sx * headR * 0.44, headR * 0.15, headR * 0.93, kopf);
          mk(new THREE.SphereGeometry(headR * 0.03, 6, 4), glanz, sx * headR * 0.4, headR * 0.2, headR * 0.96, kopf); }
        // Ohren
        const ohrM = (o.ohrFarbe ?? R.ohrFarbe) ? F(o.ohrFarbe ?? R.ohrFarbe) : rueckenM;
        for (const sx of [-1, 1]) {
          if (R.ohr === "steh") { const e = mk(new THREE.ConeGeometry(headR * 0.36, headR * 0.9, 4), ohrM, sx * headR * 0.5, headR * 0.95, -headR * 0.1, kopf); e.rotation.z = -sx * 0.25; e.scale.z = 0.4; }
          else if (R.ohr === "knick") { const e = mk(new THREE.SphereGeometry(headR * 0.32, 12, 8), R.maske ? maskeM : ohrM, sx * headR * 0.72, headR * 0.6, 0, kopf); e.scale.set(0.35, 0.8, 1); e.rotation.z = sx * 0.6; }
          else { const e = mk(new THREE.SphereGeometry(headR * 0.42, 16, 10), ohrM, sx * headR * 0.92, -headR * 0.2, -headR * 0.05, kopf); e.scale.set(0.28, 1.25 * (R.legH < 0.12 ? 1.2 : 1), 0.75); e.rotation.z = sx * 0.18; }
        }
        if (R.art === "locken") mk(new THREE.SphereGeometry(headR * 0.55, 14, 10), fell, 0, headR * 0.8, 0, kopf); // Pudel-Haube
        // Halsband mit Marke
        const hb = new THREE.Mesh(new THREE.TorusGeometry(headR * 0.78, 0.012, 8, 24), M(o.halsband ?? pick([0xc43a2b, 0x2a5a9a, 0x2a8a4a, 0x1a1a1a]), { roughness: 0.5 })); hb.position.set(0, bodyY + bodyR * 0.7, bodyL / 2 + bodyR * 0.7); hb.rotation.x = Math.PI / 2 + 0.7; g.add(hb);
        mk(new THREE.CylinderGeometry(0.014, 0.014, 0.004, 12), M(0xd8b04a, { metalness: 0.9, roughness: 0.3 }), 0, bodyY + bodyR * 0.25, bodyL / 2 + bodyR * 1.05).rotation.x = Math.PI / 2;
        // Beine (Hüfte -> Knie -> Pfote), Hinterbeine mit kräftigem Oberschenkel
        const beine = [];
        for (const [sx, sz, hinten] of [[-1, 1, 0], [1, 1, 0], [-1, -1, 1], [1, -1, 1]]) {
          const hp = new THREE.Group(); hp.position.set(sx * bodyR * 0.55, legH + bodyR * 0.3, sz * bodyL * (hinten ? 0.45 : 0.42)); g.add(hp);
          const dick = bodyR * (R.legH < 0.12 ? 0.42 : 0.3);
          if (hinten) mk(new THREE.SphereGeometry(bodyR * 0.5, 16, 12), fell, 0, -bodyR * 0.05, 0, hp).scale.set(0.8, 1.2, 1.1);
          const ob = mk(new THREE.CylinderGeometry(dick, dick * 0.8, legH * 0.55 + bodyR * 0.3, 14), fell, 0, -(legH * 0.55 + bodyR * 0.3) / 2, 0, hp);
          const kn = new THREE.Group(); kn.position.y = -(legH * 0.55 + bodyR * 0.3); hp.add(kn);
          mk(new THREE.SphereGeometry(dick * 0.8, 12, 8), fell, 0, 0, 0, kn);
          mk(new THREE.CylinderGeometry(dick * 0.75, dick * 0.65, legH * 0.45, 12), R.bauch && R.art !== "kurz" ? bauchM : fell, 0, -legH * 0.22, 0, kn);
          const pfote = mk(new THREE.SphereGeometry(dick * 0.95, 14, 10), R.bauch && R.art !== "kurz" ? bauchM : fell, 0, -legH * 0.45 + dick * 0.35, dick * 0.4, kn); pfote.scale.set(1, 0.55, 1.4);
          beine.push({ hp, kn, sx, sz });
        }
        // Rute / Schwanz als Gliederkette
        const schwanz = new THREE.Group(); schwanz.position.set(0, bodyY + bodyR * 0.45, -bodyL / 2 - bodyR * 0.75); g.add(schwanz);
        let p = schwanz; const glieder = [], n = R.rute === "kurz" ? 2 : R.rute === "ringel" ? 6 : 7;
        const seg = (R.rute === "lang" ? 0.055 : R.rute === "ringel" ? 0.022 : 0.04) * (bodyL / 0.42 + 0.3) * (R.rute === "buschig" ? 1.15 : 1);
        for (let i = 0; i < n; i++) { const k = new THREE.Group(); k.position.y = i ? seg : 0; p.add(k); const rr = (R.rute === "buschig" ? 0.035 : 0.017) * (1 - i / n * 0.5) * (bodyR / 0.15 + 0.3);
          mk(new THREE.CylinderGeometry(rr * 0.85, rr, seg * 1.15, 10), R.rute === "buschig" && i > n - 3 && R.bauch ? bauchM : fell, 0, seg / 2, 0, k); if (R.rute === "buschig") mk(new THREE.SphereGeometry(rr * 1.1, 10, 8), fell, 0, seg, 0, k);
          k.rotation.x = R.rute === "ringel" ? -0.9 : (i === 0 ? (R.rute === "buschig" ? -2.3 : -0.7) : (R.rute === "buschig" ? 0.12 : -0.12)); glieder.push(k); p = k; }
        if (R.art === "locken") mk(new THREE.SphereGeometry(0.05, 12, 8), fell, 0, seg, 0, p); // Pudel-Puschel
        g.userData = { kopf, beine, glieder, schwanz, bodyY, R, phase: r() * 6.28, zunge };
        return g;
      }
      function hund(seed, o = {}) { const r = rng(seed * 5 + 1); const rasse = o.rasse ?? Object.keys(RASSEN)[Math.floor(r() * 7)]; const d = vierbeiner(seed, RASSEN[rasse], o); d.userData.rasse = rasse; if (o.groesse) d.scale.setScalar(o.groesse); return d; }
      const KATZEN = { rot: [0xd8843a, "tiger"], grau: [0x8a8a8e, "tiger"], schwarz: [0x1e1c1c, "kurz"], getigert: [0x9a7a5a, "tiger"], weiss: [0xf0ece6, "kurz"] };
      function katze(seed, o = {}) {
        const r = rng(seed * 3 + 7), fell = o.fell ?? Object.keys(KATZEN)[Math.floor(r() * 5)], [c, art] = KATZEN[fell];
        const k = vierbeiner(seed, { legH: 0.17, bodyL: 0.24, bodyR: 0.075, headR: 0.06, snout: 0.03, ohr: "steh", rute: "lang", fell: [c], bauch: r() < 0.5 ? 0xf2efe8 : null, art, augen: [0x9ac84a, 0xd8b02a, 0x6aa8c8][Math.floor(r() * 3)] }, Object.assign({ halsband: r() < 0.5 ? 0xc43a2b : 0x2a5a9a }, o));
        // Katzenkopf runder, Ohren spitzer, Schnurrhaare, Schlitzpupillen
        const u = k.userData; u.kopf.scale.set(1.1, 1, 0.95);
        const sh = new THREE.BufferGeometry(), pts = []; for (const sx of [-1, 1]) for (let i = 0; i < 3; i++) { pts.push(sx * 0.012, -0.02, 0.085, sx * 0.08, -0.02 + (i - 1) * 0.012, 0.07); }
        sh.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3)); u.kopf.add(new THREE.LineSegments(sh, new THREE.LineBasicMaterial({ color: 0xf2f2ee, transparent: true, opacity: 0.8 })));
        u.glieder.forEach((g, i) => (g.rotation.x = i === 0 ? -0.5 : -0.16)); // Schwanz geschwungen nach oben
        k.userData.katze = true; return k;
      }
      function tierIdle(t, T) { const u = t.userData, k = T + u.phase; u.kopf.rotation.y = Math.sin(k * 0.6) * 0.35; u.kopf.rotation.z = Math.sin(k * 0.37) * 0.12; u.kopf.rotation.x = Math.sin(k * 0.5) * 0.08;
        u.schwanz.rotation.z = Math.sin(k * (u.katze ? 1.5 : 9)) * (u.katze ? 0.25 : 0.55); t.children[0].scale.x = 1 + Math.sin(k * (u.zunge.visible ? 9 : 2.4)) * 0.025; }
      function tierLaufen(t, T, tempo = 1) { const u = t.userData, k = T * 7 * tempo + u.phase;
        u.beine.forEach((b, i) => { const ph = (i === 0 || i === 3) ? 0 : Math.PI, s = Math.sin(k + ph); b.hp.rotation.x = s * 0.45; b.kn.rotation.x = b.sz > 0 ? Math.max(0, -Math.cos(k + ph)) * -0.7 : Math.max(0, Math.cos(k + ph)) * 0.6; });
        t.position.y = Math.abs(Math.sin(k)) * 0.012; u.kopf.rotation.x = Math.sin(k * 2) * 0.05; u.schwanz.rotation.z = Math.sin(k * 1.3) * 0.4; }
      function tierSitzen(t) { const u = t.userData; t.rotation.x = -0.45; u.beine.forEach((b) => { if (b.sz < 0) { b.hp.rotation.x = -1.1; b.kn.rotation.x = 1.9; } else b.hp.rotation.x = 0.45; }); u.kopf.rotation.x = 0.4; }

      // Taube: Iris-Hals, Flügelbinden, rote Füße
      function taube(seed, o = {}) {
        const r = rng(seed * 41 + 2), g = new THREE.Group(), grau = [0x7a808a, 0x5e626c, 0x8a8680, 0x4e4a46, 0x9a9890][Math.floor(r() * 5)];
        const mk = (geo, m, x, y, z, p = g) => { const ms = new THREE.Mesh(geo, m); ms.position.set(x, y, z); ms.castShadow = true; p.add(ms); return ms; };
        const koerper = M(grau, { roughness: 0.8, map: texFell("kurz", 5) }), dunkel = M(new THREE.Color(grau).offsetHSL(0, 0, -0.18).getHex(), { roughness: 0.8 });
        mk(new THREE.SphereGeometry(0.075, 20, 14), koerper, 0, 0.17, 0).scale.set(0.95, 0.9, 1.45);
        mk(new THREE.SphereGeometry(0.06, 18, 12), M([0x4a6a5a, 0x6a4a7a, 0x4a5e6e, 0x5a6a4a][Math.floor(r() * 4)], { roughness: 0.3, metalness: 0.5 }), 0, 0.22, 0.07).scale.set(0.9, 1, 0.9); // schillernder Hals (grün/violett/blau)
        const kopf = new THREE.Group(); kopf.position.set(0, 0.27, 0.1); g.add(kopf);
        mk(new THREE.SphereGeometry(0.034, 16, 12), dunkel, 0, 0, 0, kopf);
        const sch = mk(new THREE.ConeGeometry(0.008, 0.03, 8), M(0x2a2624, { roughness: 0.5 }), 0, -0.004, 0.044, kopf); sch.rotation.x = Math.PI / 2;
        mk(new THREE.SphereGeometry(0.007, 8, 6), M(0xf2f0ea), 0, 0.006, 0.032, kopf); // Wachshaut
        for (const sx of [-1, 1]) { mk(new THREE.SphereGeometry(0.008, 8, 6), M(0xd86a1a, { roughness: 0.2 }), sx * 0.026, 0.008, 0.016, kopf); mk(new THREE.SphereGeometry(0.004, 6, 4), M(0x050505), sx * 0.031, 0.008, 0.018, kopf); }
        const fluegel = []; for (const sx of [-1, 1]) { const f = new THREE.Group(); f.position.set(sx * 0.055, 0.2, 0.02); g.add(f);
          mk(new THREE.SphereGeometry(0.06, 16, 10), koerper, sx * 0.01, -0.01, -0.04, f).scale.set(0.25, 0.6, 1.6);
          mk(new THREE.SphereGeometry(0.04, 12, 8), M(0x2e2e34, { roughness: 0.8 }), sx * 0.008, -0.004, -0.11, f).scale.set(0.3, 0.45, 1.2); // dunkle Handschwingen
          fluegel.push(f); }
        const muster = o.muster ?? ["einfarbig", "binden", "gehaemmert", "gescheckt"][Math.floor(r() * 4)], bindenM = M(0x2a2a2e, { roughness: 0.85 }), weissM = M(0xeeeae2, { roughness: 0.85 }); // Gefieder-Varianten
        fluegel.forEach((f, i) => { const sx = i ? 1 : -1;
          if (muster === "binden") for (const z of [-0.03, -0.065]) mk(new THREE.SphereGeometry(0.03, 10, 6), bindenM, sx * 0.024, 0.002, z, f).scale.set(0.35, 0.18, 0.5);
          if (muster === "gehaemmert") for (let k = 0; k < 5; k++) mk(new THREE.SphereGeometry(0.012, 8, 6), bindenM, sx * 0.024, -0.01 + (k % 2) * 0.016, -0.01 - k * 0.022, f).scale.set(0.4, 0.6, 1);
          if (muster === "gescheckt" && r() < 0.8) mk(new THREE.SphereGeometry(0.03, 10, 6), weissM, sx * 0.022, -0.005, -0.03 - r() * 0.04, f).scale.set(0.4, 0.7, 1); });
        if (muster === "gescheckt") mk(new THREE.SphereGeometry(0.04, 12, 8), weissM, 0, 0.15, 0.02).scale.set(1, 0.6, 1.2);
        const schwanz = mk(new THREE.BoxGeometry(0.07, 0.012, 0.09), dunkel, 0, 0.16, -0.14); schwanz.rotation.x = 0.25; // Schwanzfächer
        const fussM = M(0xc84a4a, { roughness: 0.6 }); for (const sx of [-1, 1]) { cyl(0.004, 0.004, 0.07, fussM, sx * 0.022, 0.05, 0.01, g, 6); for (const a of [-0.5, 0, 0.5]) { const z = box(0.004, 0.003, 0.03, fussM, sx * 0.022 + Math.sin(a) * 0.012, 0.015, 0.02 + Math.cos(a) * 0.012, g); z.rotation.y = a; } }
        g.userData = { kopf, fluegel, schwanz, rumpf: g.children[0], phase: r() * 6.28, muster }; g.scale.setScalar((o.groesse ?? 1) * (0.9 + r() * 0.2)); return g;
      }
      function taubePicken(t, T) { const u = t.userData, k = T * 3 + u.phase, pick = Math.max(0, Math.sin(k * 2)) ** 4; u.kopf.position.set(0, 0.27 - pick * 0.17, 0.1 + pick * 0.08 + Math.sin(k * 4) * 0.008); u.kopf.rotation.x = pick * 1.1;
        const blick = Math.sin(k * 0.37) * 0.45 + Math.sin(k * 1.13) * 0.2; u.kopf.rotation.y = blick * (1 - pick); u.kopf.rotation.z = Math.sin(k * 0.61) * 0.12 * (1 - pick); // Umschauen, Kopf schräg legen
        if (u.schwanz) u.schwanz.rotation.x = 0.25 + Math.sin(k * 1.7) * 0.06 + pick * 0.15; if (u.rumpf) u.rumpf.scale.set(0.95, 0.9 + Math.sin(T * 5 + u.phase) * 0.012, 1.45); // Schwanzwippen, Atmen
        u.fluegel.forEach((f, i) => (f.rotation.z = (i ? 1 : -1) * Math.max(0, Math.sin(k * 0.23 + 1)) ** 12 * 0.25)); } // gelegentliches Flügelschütteln
      function taubeFliegen(t, T) { const u = t.userData, k = T * 22 + u.phase; u.fluegel.forEach((f, i) => { const s = i ? 1 : -1; f.rotation.z = s * (0.3 + Math.sin(k) * 1.1); f.scale.set(1, 1, 1); f.children[0].scale.set(1.6, 0.25, 1.4); }); }
