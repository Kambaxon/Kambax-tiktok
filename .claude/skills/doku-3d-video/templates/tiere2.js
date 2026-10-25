      // ===== Tiere v2: alle Klassen (braucht: tiere.js (vierbeiner, texFell, tierLaufen...), rng, box, cyl, M, canvasTex) =====
      // saeugetier(seed, "pferd"|"kuh"|"reh"|"baer"|"fuchs"|"elefant"|"wal")  vogel(seed, "spatz"|"adler"|"moewe"|"pinguin"|"rabe"|"ente")
      // reptil(seed, "eidechse"|"krokodil"|"schlange"|"schildkroete")  amphibie(seed, "frosch"|"molch")  fisch(seed, "hai"|"forelle"|"thunfisch"|"goldfisch")
      // insekt(seed, "kaefer"|"ameise"|"biene"|"libelle")  spinnentier(seed, "spinne"|"skorpion")  weichtier(seed, "schnecke"|"tintenfisch")  qualle(seed)
      // Jedes Tier hat userData.anim(T) – einfach in update() aufrufen (Laufen/Schwimmen/Flattern/Kriechen je nach Tier, o.bewegung wählt Variante).
      function texMuster(art, c1, c2) { const key = art + c1 + "_" + c2; if (FELL[key]) return FELL[key];
        const t = canvasTex(256, 256, (g) => { const q = rng(c1 % 997 + art.length); g.fillStyle = "#" + new THREE.Color(c1).getHexString(); g.fillRect(0, 0, 256, 256); const b = "#" + new THREE.Color(c2).getHexString();
          if (art === "flecken") { g.fillStyle = b; for (let i = 0; i < 9; i++) { g.beginPath(); const x = q() * 256, y = q() * 256; for (let k = 0; k < 10; k++) { const a = k / 10 * 6.28, rr = 22 + q() * 26; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr * 0.8); } g.fill(); } }
          if (art === "schuppen") { for (let y = 0; y < 256; y += 10) for (let x = (y / 10) % 2 * 6; x < 256; x += 12) { g.fillStyle = `rgba(0,0,0,${0.12 + q() * 0.12})`; g.beginPath(); g.arc(x, y, 6, 0, Math.PI); g.fill(); g.strokeStyle = `rgba(255,255,255,${0.08 + q() * 0.08})`; g.beginPath(); g.arc(x, y + 1, 5, Math.PI, 0); g.stroke(); } }
          if (art === "panzer") { g.strokeStyle = b; g.lineWidth = 5; for (let y = 0; y < 256; y += 64) for (let x = (y / 64) % 2 * 32; x < 256; x += 64) { g.beginPath(); for (let k = 0; k < 6; k++) { const a = k / 6 * 6.28; g.lineTo(x + Math.cos(a) * 30, y + Math.sin(a) * 30); } g.closePath(); g.stroke(); } }
          if (art === "streifen") { g.fillStyle = b; for (let x = 0; x < 256; x += 40) g.fillRect(x, 0, 14, 256); }
          if (art === "feder") { for (let i = 0; i < 900; i++) { const x = q() * 256, y = q() * 256; g.strokeStyle = q() < 0.5 ? `rgba(0,0,0,${0.1 + q() * 0.1})` : `rgba(255,255,255,${0.1 + q() * 0.1})`; g.beginPath(); g.arc(x, y, 5, 0.2, Math.PI - 0.2); g.stroke(); } }
          for (let i = 0; i < 2500; i++) { g.fillStyle = `rgba(0,0,0,${q() * 0.05})`; g.fillRect(q() * 256, q() * 256, 2, 2); } });
        t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(2, 2); FELL[key] = t; return t; }
      const mkT = (g) => (geo, m, x, y, z, p = g) => { const ms = new THREE.Mesh(geo, m); ms.position.set(x, y, z); ms.castShadow = ms.receiveShadow = true; p.add(ms); return ms; };
      function augenPaar(mk, p, x, y, z, rr, farbe = 0x1a0e06) { for (const sx of [-1, 1]) { mk(new THREE.SphereGeometry(rr, 12, 10), M(farbe, { roughness: 0.1 }), sx * x, y, z, p); mk(new THREE.SphereGeometry(rr * 0.3, 6, 4), new THREE.MeshBasicMaterial({ color: 0xffffff }), sx * x + sx * rr * 0.2, y + rr * 0.4, z + rr * 0.8, p); } }

      // ---------- Säugetiere ----------
      const SAEUGER = {
        pferd: { legH: 0.95, bodyL: 1.0, bodyR: 0.3, headR: 0.17, snout: 0.38, ohr: "steh", rute: "buschig", fell: [0x6a3a1e, 0x2a1a12, 0xd8c8b0, 0x8a5a34], bauch: null, art: "kurz" },
        kuh:   { legH: 0.72, bodyL: 1.15, bodyR: 0.4, headR: 0.18, snout: 0.22, ohr: "schlapp", rute: "rute", fell: [0xf2f0ea], bauch: null, art: "flecken" },
        reh:   { legH: 0.62, bodyL: 0.55, bodyR: 0.17, headR: 0.1, snout: 0.12, ohr: "steh", rute: "kurz", fell: [0x9a5a2a], bauch: 0xe8dcc8, art: "kurz" },
        baer:  { legH: 0.42, bodyL: 0.75, bodyR: 0.38, headR: 0.2, snout: 0.13, ohr: "knick", rute: "kurz", fell: [0x4a2e1a, 0x2a1a10], bauch: null, art: "lang" },
        fuchs: { legH: 0.26, bodyL: 0.42, bodyR: 0.11, headR: 0.085, snout: 0.12, ohr: "steh", rute: "buschig", fell: [0xc8641e], bauch: 0xf2ece0, art: "kurz" },
      };
      function saeugetier(seed, art = "pferd", o = {}) {
        const r = rng(seed * 13 + 3);
        if (art === "elefant") return elefant(seed, o); if (art === "wal") return wal(seed, o);
        const R = Object.assign({}, SAEUGER[art]); const t = vierbeiner(seed, R, Object.assign({ halsband: null }, o)); const u = t.userData, mk = mkT(t), fellC = R.fell[0];
        t.children.forEach((c) => { if (c.isMesh && c.geometry.type === "TorusGeometry") c.visible = false; }); // kein Halsband bei Wild-/Nutztieren
        t.traverse((c) => { if (c.isMesh && c.geometry.type === "CylinderGeometry" && c.geometry.parameters.height < 0.01) c.visible = false; }); // keine Hundemarke
        if (art === "kuh") { t.traverse((c) => { if (c.isMesh && c.material.map && c.material.map === texFell(R.art, seed % 3)) c.material = new THREE.MeshStandardMaterial({ color: 0xffffff, map: texMuster("flecken", 0xf2f0ea, 0x1e1a18), roughness: 0.85 }); });
          for (const sx of [-1, 1]) { const h = mk(new THREE.ConeGeometry(0.025, 0.14, 10), M(0xe8e0c8, { roughness: 0.5 }), sx * 0.12, 0.14, -0.02, u.kopf); h.rotation.z = -sx * 1.1; }
          mk(new THREE.SphereGeometry(0.12, 16, 12), M(0xe8a8a0, { roughness: 0.6 }), 0, R.legH + 0.05, -R.bodyL * 0.25).scale.set(1, 0.7, 1.1); // Euter
          const maul = mk(new THREE.SphereGeometry(0.09, 14, 10), M(0xd89a90, { roughness: 0.5 }), 0, -0.07, 0.34, u.kopf); maul.scale.set(1.1, 0.8, 0.7); }
        if (art === "pferd") { const mahne = M(new THREE.Color(fellC).multiplyScalar(0.4).getHex(), { roughness: 0.9 }); for (let i = 0; i < 9; i++) { const m = mk(new THREE.BoxGeometry(0.04, 0.16, 0.08), mahne, 0, R.legH + R.bodyR * 1.4 + i * 0.045, R.bodyL / 2 + 0.1 + i * 0.05); m.rotation.x = 0.6; }
          u.kopf.rotation.x = 0.5; for (const b of u.beine) { const huf = mk(new THREE.CylinderGeometry(0.055, 0.065, 0.06, 14), M(0x1a1410, { roughness: 0.6 }), 0, -R.legH * 0.45 + 0.03, 0.01, b.kn); } }
        if (art === "reh" && r() < 0.5) for (const sx of [-1, 1]) { const g2 = new THREE.Group(); g2.position.set(sx * 0.04, 0.09, -0.02); g2.rotation.z = -sx * 0.25; u.kopf.add(g2); cyl(0.008, 0.01, 0.16, M(0x6a4a2a), 0, 0.08, 0, g2, 6); for (const k of [0.06, 0.12]) { const e = cyl(0.006, 0.007, 0.07, M(0x6a4a2a), 0, k, 0.025, g2, 6); e.rotation.x = 0.7; } } // Geweih
        if (art === "baer") u.kopf.scale.set(1.15, 1, 1);
        t.userData.anim = (T) => (o.bewegung === "laufen" ? tierLaufen(t, T, art === "pferd" ? 0.8 : 1) : tierIdle(t, T)); t.userData.art = art; return t;
      }
      function elefant(seed, o = {}) { const g = new THREE.Group(), mk = mkT(g), haut = new THREE.MeshStandardMaterial({ color: 0x8a8682, roughness: 0.95, map: texMuster("schuppen", 0x8a8682, 0x6a6662) });
        const rumpf = mk(new THREE.SphereGeometry(1, 28, 20), haut, 0, 2.0, 0); rumpf.scale.set(1.0, 1.0, 1.5);
        const kopf = new THREE.Group(); kopf.position.set(0, 2.4, 1.55); g.add(kopf); mk(new THREE.SphereGeometry(0.62, 24, 18), haut, 0, 0, 0, kopf);
        const ruessel = []; let p = new THREE.Group(); p.position.set(0, -0.2, 0.5); kopf.add(p); for (let i = 0; i < 9; i++) { const s = new THREE.Group(); s.position.y = i ? -0.2 : 0; p.add(s); mk(new THREE.CylinderGeometry(0.17 - i * 0.012, 0.16 - i * 0.012, 0.22, 14), haut, 0, -0.1, 0, s); s.rotation.x = i ? 0.1 : 0.4; ruessel.push(s); p = s; }
        for (const sx of [-1, 1]) { const ohr = mk(new THREE.SphereGeometry(0.6, 18, 12), haut, sx * 0.55, 0.05, -0.1, kopf); ohr.scale.set(0.12, 1, 0.85); ohr.rotation.y = sx * 0.4; const sz = mk(new THREE.ConeGeometry(0.06, 0.7, 12), M(0xf2ece0, { roughness: 0.4 }), sx * 0.22, -0.45, 0.45, kopf); sz.rotation.x = -2.3; }
        augenPaar(mk, kopf, 0.38, 0.12, 0.42, 0.05);
        const beine = []; for (const [sx, sz] of [[-1, 1], [1, 1], [-1, -1], [1, -1]]) { const hp = new THREE.Group(); hp.position.set(sx * 0.55, 1.6, sz * 0.85); g.add(hp); mk(new THREE.CylinderGeometry(0.3, 0.28, 1.6, 18), haut, 0, -0.8, 0, hp); mk(new THREE.CylinderGeometry(0.31, 0.31, 0.08, 18), M(0xd8d0c0), 0, -1.56, 0, hp); beine.push({ hp, sz }); }
        const schw = mk(new THREE.CylinderGeometry(0.03, 0.05, 0.9, 8), haut, 0, 1.9, -1.55); schw.rotation.x = 0.3;
        g.userData.anim = (T) => { ruessel.forEach((s, i) => (s.rotation.x = (i ? 0.1 : 0.4) + Math.sin(T * 0.8 + i * 0.5) * 0.06)); if (o.bewegung === "laufen") beine.forEach((b, i) => (b.hp.rotation.x = Math.sin(T * 2.5 + (i === 0 || i === 3 ? 0 : Math.PI)) * 0.25)); };
        if (o.groesse) g.scale.setScalar(o.groesse); return g; }
      function wal(seed, o = {}) { const g = new THREE.Group(), mk = mkT(g); const pts = []; for (let i = 0; i <= 30; i++) { const t = i / 30; pts.push(new THREE.Vector2(Math.max(0.02, Math.sin(Math.pow(t, 0.7) * Math.PI) * 2.2 * (t < 0.15 ? 0.6 + t * 2.6 : 1)), -12 + t * 24)); }
        const geo = new THREE.LatheGeometry(pts, 32); geo.rotateX(Math.PI / 2); const haut = new THREE.MeshStandardMaterial({ color: 0x4a5a6a, roughness: 0.4, map: texMuster("flecken", 0x4a5a6a, 0x5e6e7a) }); const k = mk(geo, haut, 0, 0, 0); k.scale.set(1, 0.8, 1);
        const bauch = mk(new THREE.SphereGeometry(2, 20, 12), M(0xa8b0b8, { roughness: 0.6 }), 0, -0.9, 4); bauch.scale.set(0.8, 0.35, 3);
        for (const sx of [-1, 1]) { const fl = mk(new THREE.SphereGeometry(1, 14, 8), haut, sx * 2.0, -0.6, 4.5); fl.scale.set(1.8, 0.12, 0.6); fl.rotation.z = sx * 0.4; }
        const schwanz = new THREE.Group(); schwanz.position.z = -11.8; g.add(schwanz); for (const sx of [-1, 1]) { const f = mk(new THREE.SphereGeometry(1, 14, 8), haut, sx * 1.6, 0, -0.4, schwanz); f.scale.set(1.8, 0.1, 0.7); f.rotation.y = sx * 0.4; }
        augenPaar(mk, g, 1.7, -0.4, 8.5, 0.12);
        g.userData.anim = (T) => { schwanz.rotation.x = Math.sin(T * 0.8) * 0.3; g.rotation.x = Math.sin(T * 0.8 - 0.8) * 0.03; }; return g; }

      // ---------- Vögel ----------
      const VOEGEL = { spatz: { gr: 0.08, farbe: 0x8a6a4a, bauch: 0xd8c8b0, kopf: 0x6a4a34, schnabel: 0x3a3a3a, kurz: true }, adler: { gr: 0.45, farbe: 0x4a3220, bauch: 0x5a4028, kopf: 0xf2f0ea, schnabel: 0xe8b830, haken: true, spann: 2.2 },
        moewe: { gr: 0.25, farbe: 0xf4f4f2, bauch: 0xffffff, kopf: 0xffffff, schnabel: 0xe8c030, fluegel: 0xb8bcc4, spann: 1.4 }, pinguin: { gr: 0.35, farbe: 0x1a1a20, bauch: 0xf6f4ee, kopf: 0x1a1a20, schnabel: 0x1a1a1a, steht: true },
        rabe: { gr: 0.22, farbe: 0x14141a, bauch: 0x1a1a22, kopf: 0x14141a, schnabel: 0x111111, spann: 1.0 }, ente: { gr: 0.25, farbe: 0x8a7a64, bauch: 0xb8a888, kopf: 0x1e5a3a, schnabel: 0xe8c030, flach: true } };
      function vogel(seed, art = "spatz", o = {}) { const V = VOEGEL[art], g = new THREE.Group(), mk = mkT(g), s = V.gr; const fed = (c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.8, map: texMuster("feder", 0xe8e8e8, 0xe8e8e8) });
        const koerper = mk(new THREE.SphereGeometry(s * 0.5, 22, 16), fed(V.farbe), 0, s * (V.steht ? 0.9 : 0.6), 0); koerper.scale.set(0.85, V.steht ? 1.6 : 0.85, V.steht ? 0.9 : 1.4); if (V.steht) koerper.position.y = s * 0.95;
        const bauch = mk(new THREE.SphereGeometry(s * 0.46, 20, 14), fed(V.bauch), 0, koerper.position.y - s * 0.05, s * 0.08); bauch.scale.set(0.78, V.steht ? 1.5 : 0.78, V.steht ? 0.85 : 1.3);
        const kopf = new THREE.Group(); kopf.position.set(0, V.steht ? s * 1.75 : s * 0.95, V.steht ? s * 0.05 : s * 0.55); g.add(kopf); mk(new THREE.SphereGeometry(s * 0.3, 18, 14), fed(V.kopf), 0, 0, 0, kopf);
        const sch = mk(new THREE.ConeGeometry(s * (V.flach ? 0.12 : 0.08), s * (V.haken ? 0.35 : V.kurz ? 0.2 : 0.32), 10), M(V.schnabel, { roughness: 0.4 }), 0, -s * 0.04, s * 0.38, kopf); sch.rotation.x = Math.PI / 2 + (V.haken ? 0.4 : 0.05); if (V.flach) sch.scale.set(1.4, 1, 0.45);
        augenPaar(mk, kopf, s * 0.18, s * 0.06, s * 0.2, s * 0.05, art === "adler" ? 0x8a6a1a : 0x0a0a0a);
        const fluegel = []; for (const sx of [-1, 1]) { const f = new THREE.Group(); f.position.set(sx * s * 0.38, koerper.position.y + s * 0.1, 0); g.add(f); const fl = mk(new THREE.SphereGeometry(s * 0.5, 16, 10), fed(V.fluegel ?? V.farbe), sx * s * 0.08, 0, -s * 0.1, f); fl.scale.set(0.25, V.steht ? 1.3 : 0.55, V.steht ? 0.5 : 1.3);
          if (art === "moewe" || art === "adler") mk(new THREE.SphereGeometry(s * 0.2, 10, 6), M(art === "moewe" ? 0x1a1a1a : 0x2a1a10), sx * s * 0.08, 0, -s * 0.6, f).scale.set(0.3, 0.5, 1.5); fluegel.push({ f, fl, sx }); }
        const schwanz = mk(new THREE.BoxGeometry(s * 0.35, s * 0.04, s * 0.5), fed(V.farbe), 0, koerper.position.y + (V.steht ? -s * 0.6 : 0), V.steht ? -s * 0.4 : -s * 0.75); schwanz.rotation.x = V.steht ? 1.2 : -0.15;
        const fussM = M(art === "pinguin" ? 0x2a2a2a : art === "ente" ? 0xe8901e : art === "adler" ? 0xe8c030 : 0xb88a6a, { roughness: 0.6 }); for (const sx of [-1, 1]) { cyl(s * 0.03, s * 0.03, s * 0.35, fussM, sx * s * 0.15, s * 0.17, 0, g, 6); box(s * 0.12, s * 0.02, s * 0.2, fussM, sx * s * 0.15, s * 0.01, s * 0.06, g); }
        const modus = o.bewegung ?? (V.steht ? "watscheln" : "picken");
        g.userData = { kopf, fluegel, anim(T) { const k = T + seed;
          if (modus === "fliegen" || modus === "gleiten") { const sch2 = modus === "gleiten" ? Math.sin(k * 1.2) * 0.1 : Math.sin(k * (art === "spatz" ? 30 : art === "adler" ? 5 : 10)) * 0.9;
            fluegel.forEach(({ f, fl, sx }) => { fl.scale.set(1.6 * (V.spann ?? 1) / 1.4, 0.12, 1.1); fl.position.x = sx * s * 0.75 * (V.spann ?? 1); f.rotation.z = sx * sch2; }); }
          else if (modus === "watscheln") { g.rotation.z = Math.sin(k * 5) * 0.12; g.position.y = Math.abs(Math.sin(k * 5)) * s * 0.05; fluegel.forEach(({ f, sx }) => (f.rotation.z = sx * (0.3 + Math.sin(k * 5) * 0.1))); }
          else { const pk = Math.max(0, Math.sin(k * 3)) ** 4; kopf.rotation.x = pk * 1.0; kopf.position.z = (V.steht ? s * 0.05 : s * 0.55) + pk * s * 0.2; kopf.rotation.y = Math.sin(k * 0.9) * 0.4; } } };
        if (o.groesse) g.scale.setScalar(o.groesse); return g; }

      // ---------- Reptilien & Amphibien ----------
      function kette(g, mk, n, lenSeg, rad0, rad1, mat, y, z0) { let p = new THREE.Group(); p.position.set(0, y, z0); g.add(p); const segs = []; for (let i = 0; i < n; i++) { const s = new THREE.Group(); s.position.z = i ? -lenSeg : 0; p.add(s); const rr = rad0 + (rad1 - rad0) * i / (n - 1); const c = mk(new THREE.SphereGeometry(rr, 14, 10), mat, 0, 0, -lenSeg / 2, s); c.scale.set(1, 0.75, lenSeg / rr * 0.75); segs.push(s); p = s; } return segs; }
      function reptil(seed, art = "eidechse", o = {}) { const g = new THREE.Group(), mk = mkT(g), r = rng(seed);
        const P = { eidechse: { c: 0x5a7a3a, c2: 0x3a5a2a, s: 0.25 }, krokodil: { c: 0x4a5a34, c2: 0x2a3420, s: 3.5 }, schlange: { c: 0x8a6a3a, c2: 0x3a2a1a, s: 1.4 }, schildkroete: { c: 0x6a6a4a, c2: 0x4a3a24, s: 0.35 } }[art];
        const haut = new THREE.MeshStandardMaterial({ color: 0xffffff, map: texMuster(art === "schlange" ? "flecken" : "schuppen", P.c, P.c2), roughness: art === "schlange" ? 0.35 : 0.7 }); const s = P.s;
        let segs = [], kopf;
        if (art === "schildkroete") { const pz = mk(new THREE.SphereGeometry(s * 0.5, 24, 14, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ map: texMuster("panzer", 0x6a5a34, 0x2a2014), roughness: 0.6 }), 0, s * 0.12, 0); pz.scale.set(0.85, 0.6, 1.1); mk(new THREE.CylinderGeometry(s * 0.43, s * 0.43, s * 0.06, 24), haut, 0, s * 0.12, 0).scale.z = 1.25;
          kopf = new THREE.Group(); kopf.position.set(0, s * 0.15, s * 0.6); g.add(kopf); mk(new THREE.SphereGeometry(s * 0.1, 14, 10), haut, 0, 0, 0, kopf).scale.set(1, 0.85, 1.3); augenPaar(mk, kopf, s * 0.06, s * 0.03, s * 0.08, s * 0.018);
          for (const [sx, sz] of [[-1, 1], [1, 1], [-1, -1], [1, -1]]) mk(new THREE.SphereGeometry(s * 0.08, 10, 8), haut, sx * s * 0.38, s * 0.06, sz * s * 0.38).scale.set(1.2, 0.6, 1); }
        else { const n = art === "schlange" ? 22 : 9, len = art === "schlange" ? s / n : s * 0.09; segs = kette(g, mk, n, len, art === "schlange" ? s * 0.035 : s * (art === "krokodil" ? 0.1 : 0.07), art === "schlange" ? s * 0.012 : s * 0.02, haut, art === "schlange" ? s * 0.03 : s * 0.08, 0);
          kopf = new THREE.Group(); kopf.position.set(0, art === "schlange" ? s * 0.03 : s * 0.08, art === "krokodil" ? s * 0.06 : s * 0.05); g.add(kopf);
          if (art === "krokodil") { mk(new THREE.BoxGeometry(s * 0.16, s * 0.06, s * 0.32), haut, 0, 0, s * 0.16, kopf); for (let i = 0; i < 9; i++) for (const sx of [-1, 1]) mk(new THREE.ConeGeometry(s * 0.006, s * 0.02, 5), M(0xf2ece0), sx * s * 0.075, -s * 0.032, s * 0.04 + i * s * 0.032, kopf).rotation.x = Math.PI; augenPaar(mk, kopf, s * 0.05, s * 0.045, s * 0.04, s * 0.015, 0x8a7a1a); for (let i = 0; i < 12; i++) mk(new THREE.ConeGeometry(s * 0.012, s * 0.03, 4), haut, 0, s * 0.11, -i * s * 0.09); }
          else { const k2 = mk(new THREE.SphereGeometry(art === "schlange" ? s * 0.045 : s * 0.06, 14, 10), haut, 0, 0, s * 0.04, kopf); k2.scale.set(1, 0.7, 1.5); augenPaar(mk, kopf, s * (art === "schlange" ? 0.03 : 0.04), s * 0.015, s * 0.06, s * 0.012, 0x8a6a1a);
            if (art === "schlange") { const zunge = mk(new THREE.BoxGeometry(s * 0.004, s * 0.002, s * 0.05), M(0xc82a3a), 0, -s * 0.01, s * 0.11, kopf); } }
          if (art !== "schlange") { const beine = []; for (const [sx, i] of [[-1, 1], [1, 1], [-1, 5], [1, 5]]) { const b = new THREE.Group(); b.position.set(sx * s * 0.06, -s * 0.02, -s * 0.045); segs[i].add(b); const ob = mk(new THREE.CylinderGeometry(s * 0.018, s * 0.014, s * 0.12, 8), haut, sx * s * 0.05, -s * 0.02, 0, b); ob.rotation.z = sx * 1.2; const fu = mk(new THREE.SphereGeometry(s * 0.02, 8, 6), haut, sx * s * 0.1, -s * 0.06, s * 0.01, b); fu.scale.set(1.5, 0.4, 1.6); beine.push(b); } g.userData.beine = beine; } }
        g.userData.anim = (T) => { const k = T * (art === "krokodil" ? 1 : 3) + seed; segs.forEach((sg, i) => (sg.rotation.y = Math.sin(k - i * 0.6) * (art === "schlange" ? 0.35 : 0.12)));
          (g.userData.beine || []).forEach((b, i) => (b.rotation.y = Math.sin(k + i * Math.PI / 2) * 0.4)); if (kopf) kopf.rotation.y = Math.sin(k * 0.5) * 0.2; };
        return g; }
      function amphibie(seed, art = "frosch", o = {}) { const g = new THREE.Group(), mk = mkT(g), c = art === "frosch" ? 0x4a8a3a : 0x3a2a1e, haut = M(c, { roughness: 0.25, map: texMuster("flecken", c, new THREE.Color(c).multiplyScalar(0.6).getHex()) }), s = art === "frosch" ? 0.08 : 0.12;
        if (art === "frosch") { const k = mk(new THREE.SphereGeometry(s * 0.5, 18, 14), haut, 0, s * 0.35, 0); k.scale.set(1.1, 0.75, 1.2); k.rotation.x = -0.35; mk(new THREE.SphereGeometry(s * 0.42, 16, 12), M(0xe8e0b0, { roughness: 0.4 }), 0, s * 0.28, s * 0.05).scale.set(1, 0.6, 1.1);
          for (const sx of [-1, 1]) { mk(new THREE.SphereGeometry(s * 0.14, 12, 10), haut, sx * s * 0.25, s * 0.58, s * 0.3); mk(new THREE.SphereGeometry(s * 0.1, 10, 8), M(0xd8a020, { roughness: 0.1 }), sx * s * 0.28, s * 0.62, s * 0.36); mk(new THREE.SphereGeometry(s * 0.05, 8, 6), M(0x050505), sx * s * 0.3, s * 0.63, s * 0.44);
            const hb = mk(new THREE.SphereGeometry(s * 0.2, 12, 8), haut, sx * s * 0.45, s * 0.12, -s * 0.25); hb.scale.set(0.7, 0.5, 1.6); const vb = mk(new THREE.CylinderGeometry(s * 0.05, s * 0.04, s * 0.3, 8), haut, sx * s * 0.3, s * 0.15, s * 0.35); vb.rotation.z = sx * 0.3; }
          const kehle = mk(new THREE.SphereGeometry(s * 0.2, 12, 10), M(0xf2ecc8, { roughness: 0.3 }), 0, s * 0.2, s * 0.42); g.userData.anim = (T) => { kehle.scale.setScalar(1 + Math.max(0, Math.sin(T * 6 + seed)) * 0.5); }; }
        else { const segs = kette(g, mk, 8, s * 0.12, s * 0.08, s * 0.02, haut, s * 0.06, 0); augenPaar(mk, segs[0], s * 0.05, s * 0.03, s * 0.02, s * 0.015); g.userData.anim = (T) => segs.forEach((sg, i) => (sg.rotation.y = Math.sin(T * 2 + seed - i * 0.5) * 0.15)); }
        return g; }

      // ---------- Fische ----------
      function fisch(seed, art = "forelle", o = {}) { const g = new THREE.Group(), mk = mkT(g);
        const P = { hai: { L: 3.0, R: 0.38, c: 0x6a7a88, c2: 0xe8ecf0, rough: 0.35 }, forelle: { L: 0.45, R: 0.06, c: 0x7a8a5a, c2: 0x2a3a2a, rough: 0.2, flecken: true }, thunfisch: { L: 1.8, R: 0.3, c: 0x1e3a5a, c2: 0xc8ccd0, rough: 0.15 }, goldfisch: { L: 0.15, R: 0.04, c: 0xe8701e, c2: 0xf2a040, rough: 0.2 } }[art];
        const pts = []; for (let i = 0; i <= 24; i++) { const t = i / 24; pts.push(new THREE.Vector2(Math.max(0.002, Math.sin(Math.pow(t, art === "hai" ? 0.9 : 0.75) * Math.PI) * P.R * (t < 0.2 ? 0.4 + t * 3 : 1)), -P.L / 2 + t * P.L)); }
        const geo = new THREE.LatheGeometry(pts, 24); geo.rotateX(Math.PI / 2); const haut = new THREE.MeshStandardMaterial({ color: 0xffffff, map: texMuster(P.flecken ? "flecken" : "schuppen", P.c, P.c2), roughness: P.rough, metalness: 0.3 });
        const koerper = new THREE.Group(); g.add(koerper); const k = mk(geo, haut, 0, 0, 0, koerper); k.scale.set(art === "hai" ? 1 : 0.55, 1, 1);
        mk(new THREE.SphereGeometry(P.R * 0.9, 16, 10), M(P.c2, { roughness: 0.4 }), 0, -P.R * 0.35, 0, koerper).scale.set(art === "hai" ? 0.9 : 0.5, 0.5, P.L / P.R * 0.35);
        const flosse = (w, h, x, y, z, rx, rz, p = koerper) => { const f = mk(new THREE.ConeGeometry(w, h, 3), haut, x, y, z, p); f.rotation.set(rx, 0, rz); f.scale.z = 0.12; return f; };
        flosse(P.L * 0.08, P.L * (art === "hai" ? 0.22 : 0.12), 0, P.R * 1.05, 0, -0.4, 0);
        for (const sx of [-1, 1]) flosse(P.L * 0.05, P.L * 0.12, sx * P.R * 0.7, -P.R * 0.4, P.L * 0.15, -1.2, sx * 1.3);
        const schwanz = new THREE.Group(); schwanz.position.z = -P.L / 2; koerper.add(schwanz); for (const sy of [-1, 1]) { const f = flosse(P.L * 0.06, P.L * (art === "goldfisch" ? 0.4 : 0.22), 0, sy * P.L * 0.07, -P.L * 0.08, -Math.PI / 2 - sy * 0.6, 0, schwanz); }
        augenPaar(mk, koerper, P.R * 0.45, P.R * 0.25, P.L * 0.38, P.R * 0.12, art === "hai" ? 0x050505 : 0x1a1a1a);
        if (art === "hai") for (let i = 0; i < 5; i++) for (const sx of [-1, 1]) mk(new THREE.BoxGeometry(0.005, P.R * 0.5, 0.012), M(0x3a4a58), sx * P.R * 0.98, 0, P.L * 0.22 - i * 0.06, koerper);
        g.userData.anim = (T) => { const k2 = T * (art === "hai" ? 2 : 7) + seed; schwanz.rotation.y = Math.sin(k2) * 0.5; koerper.rotation.y = Math.sin(k2 - 1) * 0.08; }; if (o.groesse) g.scale.setScalar(o.groesse); return g; }

      // ---------- Wirbellose ----------
      function beinePaar(mk, p, n, laenge, dicke, mat, x0, zSpan, y) { const beine = []; for (let i = 0; i < n; i++) for (const sx of [-1, 1]) { const b = new THREE.Group(); b.position.set(sx * x0, y, zSpan / 2 - i * zSpan / Math.max(1, n - 1)); p.add(b);
          const o1 = mk(new THREE.CylinderGeometry(dicke, dicke, laenge * 0.5, 5), mat, sx * laenge * 0.22, laenge * 0.1, 0, b); o1.rotation.z = sx * 1.0; const o2 = mk(new THREE.CylinderGeometry(dicke * 0.8, dicke * 0.5, laenge * 0.6, 5), mat, sx * laenge * 0.5, -laenge * 0.05, 0, b); o2.rotation.z = -sx * 0.4; beine.push({ b, sx, i }); } return beine; }
      function insekt(seed, art = "kaefer", o = {}) { const g = new THREE.Group(), mk = mkT(g);
        const P = { kaefer: { s: 0.02, c: 0x1a3a2a, glanz: true }, ameise: { s: 0.008, c: 0x2a1408 }, biene: { s: 0.014, c: 0xd8a020, streifen: true, fluegel: true }, libelle: { s: 0.07, c: 0x2a6aa8, fluegel: true, lang: true } }[art], s = P.s;
        const chitin = new THREE.MeshPhysicalMaterial({ color: P.c, roughness: 0.25, metalness: P.glanz ? 0.6 : 0.1, clearcoat: 1, map: P.streifen ? texMuster("streifen", 0xd8a020, 0x1a1a1a) : null }), schwarz = M(0x111111, { roughness: 0.4 });
        mk(new THREE.SphereGeometry(s * 0.35, 12, 10), schwarz, 0, s * 0.5, s * 0.8); const brust = mk(new THREE.SphereGeometry(s * 0.4, 12, 10), art === "biene" ? M(0x6a4a1a, { roughness: 0.9 }) : chitin, 0, s * 0.5, s * 0.35);
        const hl = mk(new THREE.SphereGeometry(s * (art === "kaefer" ? 0.7 : 0.5), 16, 12), chitin, 0, s * 0.5, P.lang ? -s * 1.6 : -s * 0.35); hl.scale.set(art === "kaefer" ? 0.9 : 0.8, art === "kaefer" ? 0.6 : 0.75, P.lang ? 4 : art === "ameise" ? 1.3 : 1.2);
        if (art === "kaefer") box(s * 0.01, s * 0.05, s * 1.0, schwarz, 0, s * 0.92, -s * 0.35, g); augenPaar(mk, g, s * 0.2, s * 0.55, s * 0.95, s * (art === "libelle" ? 0.18 : 0.1), art === "libelle" ? 0x2a4a8a : 0x050505);
        for (const sx of [-1, 1]) { const f = mk(new THREE.CylinderGeometry(s * 0.02, s * 0.02, s * 0.8, 4), schwarz, sx * s * 0.15, s * 0.9, s * 1.1); f.rotation.set(0.8, 0, -sx * 0.4); }
        const beine = beinePaar(mk, g, 3, s * 1.6, s * 0.04, schwarz, s * 0.2, s * 0.6, s * 0.4);
        const fl = []; if (P.fluegel) for (const sx of [-1, 1]) for (const fz of art === "libelle" ? [0.1, -0.25] : [0]) { const f = new THREE.Group(); f.position.set(sx * s * 0.2, s * 0.8, s * (0.35 + fz * 4)); g.add(f); const fm = mk(new THREE.SphereGeometry(s * (art === "libelle" ? 1.6 : 0.6), 12, 6), new THREE.MeshPhysicalMaterial({ color: 0xe8f0ff, roughness: 0.1, transparent: true, opacity: 0.35, side: THREE.DoubleSide, iridescence: 1 }), sx * s * (art === "libelle" ? 1.6 : 0.55), 0, 0, f); fm.scale.set(1, 0.03, 0.28); fl.push({ f, sx }); }
        g.userData.anim = (T) => { const k = T * 14 + seed; beine.forEach((b) => (b.b.rotation.y = Math.sin(k + b.i * 2 + (b.sx > 0 ? Math.PI : 0)) * 0.35)); fl.forEach(({ f, sx }) => (f.rotation.z = sx * Math.sin(T * 120 + seed) * 0.6)); };
        if (o.groesse) g.scale.setScalar(o.groesse); return g; }
      function spinnentier(seed, art = "spinne", o = {}) { const g = new THREE.Group(), mk = mkT(g), s = art === "spinne" ? 0.02 : 0.05, c = art === "spinne" ? 0x3a2a1a : 0x5a3a1a, mat = new THREE.MeshPhysicalMaterial({ color: c, roughness: 0.5, clearcoat: 0.5 });
        mk(new THREE.SphereGeometry(s * 0.45, 14, 10), mat, 0, s * 0.5, s * 0.3).scale.set(1, 0.7, 1.1);
        if (art === "spinne") { const h = mk(new THREE.SphereGeometry(s * 0.7, 16, 12), new THREE.MeshPhysicalMaterial({ color: c, roughness: 0.6, map: texMuster("flecken", c, 0xd8c8a0) }), 0, s * 0.7, -s * 0.6); h.scale.set(1, 0.85, 1.15); }
        else { const segs = kette(g, mk, 6, s * 0.3, s * 0.3, s * 0.15, mat, s * 0.5, -s * 0.2); const sw = kette(segs[5], mk, 6, s * 0.18, s * 0.1, s * 0.07, mat, 0, -s * 0.3); sw.forEach((sg) => (sg.rotation.x = -0.45)); const st = mk(new THREE.ConeGeometry(s * 0.04, s * 0.15, 6), M(0x2a1a0a), 0, 0, -s * 0.15, sw[5]); st.rotation.x = -2;
          for (const sx of [-1, 1]) { const sc = mk(new THREE.SphereGeometry(s * 0.15, 10, 8), mat, sx * s * 0.45, s * 0.45, s * 0.95); sc.scale.set(0.8, 0.5, 1.5); } }
        augenPaar(mk, g, s * 0.1, s * 0.7, s * 0.65, s * 0.05); const beine = beinePaar(mk, g, 4, s * (art === "spinne" ? 3 : 1.8), s * 0.05, mat, s * 0.25, s * 0.6, s * 0.5);
        g.userData.anim = (T) => beine.forEach((b) => (b.b.rotation.y = Math.sin(T * 10 + seed + b.i * 1.6 + (b.sx > 0 ? 1 : 0)) * 0.25)); if (o.groesse) g.scale.setScalar(o.groesse); return g; }
      function weichtier(seed, art = "schnecke", o = {}) { const g = new THREE.Group(), mk = mkT(g);
        if (art === "schnecke") { const s = 0.04, haut = M(0xa89a7a, { roughness: 0.2 }); const fuss = mk(new THREE.CapsuleGeometry(s * 0.25, s * 1.6, 6, 12), haut, 0, s * 0.22, 0); fuss.rotation.x = Math.PI / 2; fuss.scale.set(1, 1, 0.5);
          const haus = new THREE.Group(); haus.position.set(0, s * 0.75, -s * 0.2); g.add(haus); for (let i = 0; i < 26; i++) { const t = i / 26, a = t * Math.PI * 5, rr = s * 0.55 * (1 - t * 0.85); mk(new THREE.SphereGeometry(rr * 0.75, 12, 10), M(new THREE.Color(0x8a5a2a).lerp(new THREE.Color(0xd8b080), (i % 4) / 4).getHex(), { roughness: 0.4 }), 0, Math.sin(a) * rr * 0.9, Math.cos(a) * rr * 0.9, haus); }
          const fuehler = []; for (const sx of [-1, 1]) { const f = mk(new THREE.CylinderGeometry(s * 0.03, s * 0.04, s * 0.5, 6), haut, sx * s * 0.1, s * 0.55, s * 0.9); f.rotation.x = 0.4; f.rotation.z = -sx * 0.3; mk(new THREE.SphereGeometry(s * 0.05, 6, 4), M(0x1a1a1a), sx * s * 0.17, s * 0.78, s * 1.0); fuehler.push(f); }
          g.userData.anim = (T) => { fuss.scale.z = 0.5 + Math.sin(T * 1.5 + seed) * 0.03; fuehler.forEach((f, i) => (f.rotation.x = 0.4 + Math.sin(T * 2 + i) * 0.15)); }; }
        else { const s = 0.5, haut = new THREE.MeshPhysicalMaterial({ color: 0xc8644a, roughness: 0.3, clearcoat: 0.6, map: texMuster("flecken", 0xc8644a, 0xa84a3a) }); const mantel = mk(new THREE.SphereGeometry(s * 0.35, 20, 16), haut, 0, s * 0.6, 0); mantel.scale.set(1, 1.6, 1);
          augenPaar(mk, g, s * 0.22, s * 0.3, s * 0.18, s * 0.06, 0x1a1a1a); const arme = [];
          for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; const segs = []; let p = new THREE.Group(); p.position.set(Math.cos(a) * s * 0.18, s * 0.15, Math.sin(a) * s * 0.18); p.rotation.y = -a; g.add(p); for (let k = 0; k < 8; k++) { const sg = new THREE.Group(); sg.position.x = k ? s * 0.11 : 0; p.add(sg); mk(new THREE.SphereGeometry(s * (0.07 - k * 0.007), 10, 8), haut, s * 0.055, 0, 0, sg).scale.set(1.6, 1, 1); segs.push(sg); p = sg; } arme.push(segs); }
          g.userData.anim = (T) => arme.forEach((segs, i) => segs.forEach((sg, k) => (sg.rotation.z = -0.1 + Math.sin(T * 1.6 + i + k * 0.5) * 0.2))); }
        return g; }
      function qualle(seed, o = {}) { const g = new THREE.Group(), mk = mkT(g), c = o.farbe ?? 0xb8a0e8; const glocke = mk(new THREE.SphereGeometry(0.25, 28, 16, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshPhysicalMaterial({ color: c, roughness: 0.1, transparent: true, opacity: 0.5, emissive: c, emissiveIntensity: 0.25, side: THREE.DoubleSide }), 0, 0.5, 0);
        const tent = []; for (let i = 0; i < 14; i++) { const a = i / 14 * 6.28; const pts = []; for (let k = 0; k <= 12; k++) pts.push(new THREE.Vector3(Math.cos(a) * 0.2, 0.5 - k * 0.07, Math.sin(a) * 0.2)); const geo = new THREE.BufferGeometry().setFromPoints(pts); const l = new THREE.Line(geo, new THREE.LineBasicMaterial({ color: c, transparent: true, opacity: 0.6 })); g.add(l); tent.push({ l, a }); }
        g.userData.anim = (T) => { const p = Math.sin(T * 2 + seed); glocke.scale.set(1 + p * 0.1, 1 - p * 0.15, 1 + p * 0.1); g.position.y += 0; tent.forEach(({ l, a }, i) => { const pos = l.geometry.attributes.position; for (let k = 0; k <= 12; k++) { pos.setX(k, Math.cos(a) * 0.2 * (1 + p * 0.1) + Math.sin(T * 1.5 + k * 0.4 + i) * 0.02 * k); pos.setZ(k, Math.sin(a) * 0.2 * (1 + p * 0.1) + Math.cos(T * 1.3 + k * 0.4 + i) * 0.02 * k); } pos.needsUpdate = true; }); };
        if (o.groesse) g.scale.setScalar(o.groesse); return g; }
