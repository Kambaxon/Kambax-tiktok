      // ===== Gebäude v2: Fensterarten, Fassadenarten, Haustypen Stadt & Land (braucht: rng, box, cyl, M, material(), texZiegel, dach) =====
      // Fassaden: "putz" (WDVS, Farbe frei), "klinker", "ziegel", "holz" (Lärchenschalung), "vhf" (Faserzement/Metall), "fachwerk", "beton", "glas"
      // Fenster: fenster2(parent, x, y, z, w, h, { art: "drehkipp"|"schiebe"|"fest"|"sprossen"|"stahl", rahmen: "kunststoff"|"alu"|"holz", kipp: 0..1, licht, vorhang, rollladen, bank })
      const RAHMEN = { kunststoff: () => M(0xf4f4f0, { roughness: 0.35 }), alu: () => M(0x3a3e44, { roughness: 0.35, metalness: 0.8 }), holz: () => material("poliertesholz", { farbe: 0xc8a070 }), dunkel: () => M(0x1e2024, { roughness: 0.4, metalness: 0.5 }) };
      const RAUMFARBEN = [0xffd9a0, 0xffcf8a, 0xffe6c0, 0xfff0dc, 0xd8e6ff];
      function glasM(o = {}) { return new THREE.MeshPhysicalMaterial({ color: o.farbe ?? 0x2a3a44, roughness: 0.03, metalness: 0.2, clearcoat: 1, clearcoatRoughness: 0.02, envMapIntensity: 1.6, emissive: o.licht ? (o.lichtFarbe ?? 0xffd9a0) : 0x000000, emissiveIntensity: o.licht ? (o.leuchten ?? 0.9) : 0 }); }
      function fenster2(parent, x, y, z, w, h, o = {}) {
        const g = new THREE.Group(); g.position.set(x, y, z); parent.add(g); const rM = (RAHMEN[o.rahmen ?? "kunststoff"] || RAHMEN.kunststoff)(), art = o.art ?? "drehkipp", rb = art === "stahl" ? 0.04 : o.rahmen === "alu" ? 0.05 : 0.07, tiefe = 0.08;
        box(w + 0.02, h + 0.02, 0.2, M(0x2a2a2c, { roughness: 0.9 }), 0, 0, -0.1, g); // Laibung (dunkel = Tiefe)
        const raum = box(w - 0.04, h - 0.04, 0.01, new THREE.MeshBasicMaterial({ color: o.licht ? new THREE.Color(o.lichtFarbe ?? RAUMFARBEN[Math.floor((x * 7 + y * 3) % 5 + 5) % 5]).multiplyScalar(0.9) : 0x15181c }), 0, 0, -0.19, g); // Raum dahinter
        if (o.vorhang ?? true) { const vc = o.vorhangFarbe ?? 0xe8e0d0; for (const sx of [-1, 1]) box(w * 0.22, h * 0.95, 0.02, M(vc, { roughness: 0.95, emissive: o.licht ? vc : 0, emissiveIntensity: o.licht ? 0.25 : 0 }), sx * w * 0.36, 0, -0.15, g); }
        if (o.rollladen) { const rl = o.rollladen; box(w, h * rl, 0.03, M(0xd8d8d4, { roughness: 0.6 }), 0, h / 2 - h * rl / 2, 0.05, g); for (let k = 0; k < rl * h / 0.05; k++) box(w, 0.006, 0.035, M(0xb8b8b4), 0, h / 2 - k * 0.05, 0.05, g); box(w + 0.1, 0.18, 0.2, M(0xe8e8e4), 0, h / 2 + 0.09, 0.02, g); }
        const rahmen = (gw, gh, gx, gy, gz, grp) => { box(gw, rb, tiefe, rM, gx, gy + gh / 2 - rb / 2, gz, grp); box(gw, rb * 1.2, tiefe, rM, gx, gy - gh / 2 + rb * 0.6, gz, grp); box(rb, gh, tiefe, rM, gx - gw / 2 + rb / 2, gy, gz, grp); box(rb, gh, tiefe, rM, gx + gw / 2 - rb / 2, gy, gz, grp);
          const gl = box(gw - rb * 2, gh - rb * 2.2, 0.012, glasM(o), gx, gy, gz, grp); gl.material.transparent = true; gl.material.opacity = 0.55; gl.castShadow = false; return gl; };
        box(w, h, 0.02, rM, 0, 0, -0.02, g).visible = false;
        if (art === "fest") rahmen(w, h, 0, 0, 0, g);
        else if (art === "schiebe") { rahmen(w / 2 + rb, h, -w / 4, 0, -0.02, g); rahmen(w / 2 + rb, h, w / 4 - (o.kipp ?? 0) * w * 0.4, 0, 0.03, g); box(0.02, 0.2, 0.04, M(0x8a8e92, { metalness: 0.8 }), w / 4 - w * 0.2 + 0.05, 0, 0.08, g); }
        else { // Dreh-Kipp: zweiflügelig ab 1.3 m Breite, Flügel kippt um die Unterkante
          const fl = w > 1.3 ? 2 : 1; box(w, rb, tiefe, rM, 0, h / 2 - rb / 2, -0.03, g); box(w, rb, tiefe, rM, 0, -h / 2 + rb / 2, -0.03, g); box(rb, h, tiefe, rM, -w / 2 + rb / 2, 0, -0.03, g); box(rb, h, tiefe, rM, w / 2 - rb / 2, 0, -0.03, g);
          for (let i = 0; i < fl; i++) { const fw = (w - rb * 2) / fl, fx = -w / 2 + rb + fw * (i + 0.5); const fg = new THREE.Group(); fg.position.set(fx, -h / 2 + rb, 0.0); g.add(fg); const kipp = i === fl - 1 ? (o.kipp ?? 0) : 0; fg.rotation.x = -kipp * 0.18;
            rahmen(fw, h - rb * 2, 0, (h - rb * 2) / 2, 0.01, fg); const griff = box(0.025, 0.12, 0.03, M(0xe8e8e8, { roughness: 0.3 }), (i ? -1 : 1) * (fw / 2 - 0.06), (h - rb * 2) / 2, 0.06, fg);
            if (art === "sprossen" || art === "stahl") { const n = art === "stahl" ? 4 : 2; for (let k = 1; k < n; k++) box(0.025, h - rb * 2, 0.02, rM, -fw / 2 + fw * k / n, (h - rb * 2) / 2, 0.05, fg); for (let k = 1; k < (art === "stahl" ? 5 : 3); k++) box(fw, 0.025, 0.02, rM, 0, (h - rb * 2) * k / (art === "stahl" ? 5 : 3), 0.05, fg); } } }
        if (o.bank !== false) box(w + 0.12, 0.04, 0.22, M(o.bankFarbe ?? 0xb8bcc0, { roughness: 0.4, metalness: 0.5 }), 0, -h / 2 - 0.02, 0.08, g); // Fensterbank
        return g;
      }
      // Fassadenmaterial (Wandkörper) je Art
      function fassadeM(art, farbe, w, h) { const rep = [w / 3, h / 3];
        if (art === "klinker") return material("klinker", { wiederholen: [w / 2.6, h / 1.9] }); if (art === "ziegel") return material("ziegel", { wiederholen: [w / 2.6, h / 1.9] });
        if (art === "holz") return material("altholz", { wiederholen: [w / 2, h / 3], farbe: farbe ?? 0xd8b080 }); if (art === "vhf") return material("faserzement", { wiederholen: [w / 3, h / 2], farbe: farbe ?? 0xffffff });
        if (art === "beton") return material("sichtbeton", { wiederholen: [w / 3, h / 3] }); return material("putzweiss", { wiederholen: rep, farbe: farbe ?? 0xffffff }); }
      const PUTZ2 = [0xf2ece0, 0xe8dcc4, 0xd8c4a4, 0xe4e8e0, 0xc8d4dc, 0xf0e0c8, 0xe0d0c8, 0xd4dcc4, 0xf6f4ee, 0xe8c8a8];
      function satteldach(parent, w, d, h, y, z0, o = {}) { const sh = new THREE.Shape(); sh.moveTo(-d / 2 - 0.4, 0); sh.lineTo(d / 2 + 0.4, 0); sh.lineTo(0, h); sh.closePath();
        const geo = new THREE.ExtrudeGeometry(sh, { depth: w + 0.6, bevelEnabled: false }); geo.translate(0, 0, -(w + 0.6) / 2); geo.rotateY(Math.PI / 2);
        const dm = o.material ?? (() => { const t = texZiegel(o.farbe ?? "#9a4a34").clone(); t.needsUpdate = true; t.repeat.set(w / 2.2, d / 2.4); return M(0xffffff, { map: t, roughness: 0.8 }); })();
        const m = new THREE.Mesh(geo, dm); m.position.set(0, y, z0); m.castShadow = m.receiveShadow = true; parent.add(m);
        const giebel = new THREE.Mesh(new THREE.ShapeGeometry((() => { const s2 = new THREE.Shape(); s2.moveTo(-d / 2, 0); s2.lineTo(d / 2, 0); s2.lineTo(0, h * (d / 2) / (d / 2 + 0.4)); s2.closePath(); return s2; })()), o.giebelM ?? M(0xeeeae0, { side: THREE.DoubleSide }));
        for (const sx of [-1, 1]) { const gg = giebel.clone(); gg.rotation.y = Math.PI / 2; gg.position.set(sx * (w / 2 + 0.005), y, z0); parent.add(gg); }
        box(w + 0.7, 0.12, 0.16, M(0x6a6a6c, { metalness: 0.5 }), 0, y + h + 0.02, z0, parent); // First
        for (const sz of [-1, 1]) cyl(0.07, 0.07, w + 0.6, M(0x8a8e92, { metalness: 0.6, roughness: 0.4 }), 0, y - 0.05, z0 + sz * (d / 2 + 0.35), parent, 10).rotation.z = Math.PI / 2; // Dachrinne
        return m; }
      function gaube(parent, x, y, z, w, o = {}) { const g = new THREE.Group(); g.position.set(x, y, z); parent.add(g); box(w, 1.3, 1.6, M(o.farbe ?? 0xeeeae0, { roughness: 0.9 }), 0, 0.65, -0.6, g);
        const dg = box(w + 0.3, 0.12, 2.0, M(0x4a4e54, { roughness: 0.7 }), 0, 1.36, -0.6, g); dg.rotation.x = 0.12; fenster2(g, 0, 0.62, 0.22, w * 0.62, 0.95, { art: "drehkipp", rahmen: o.rahmen, licht: o.licht, bank: false }); return g; }
      function dachfenster(parent, x, y, z, neigung, o = {}) { const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.x = -neigung; parent.add(g); box(0.82, 1.2, 0.1, M(0x3a3e44, { metalness: 0.6, roughness: 0.4 }), 0, 0, 0.05, g); const gl = box(0.7, 1.05, 0.02, glasM(o), 0, 0, 0.11, g); return g; }
      function fachwerk(parent, w, h, y0, z, o = {}) { const balken = material("altholz", { farbe: o.balken ?? 0x4a3020, wiederholen: [0.3, 1] }), b = 0.16, felder = Math.max(2, Math.round(w / 1.3));
        box(w, b, 0.1, balken, 0, y0 + b / 2, z, parent); box(w, b, 0.1, balken, 0, y0 + h - b / 2, z, parent); box(w, b * 0.8, 0.1, balken, 0, y0 + h * 0.36, z, parent);
        for (let i = 0; i <= felder; i++) { const x = -w / 2 + w * i / felder; box(b, h, 0.1, balken, x, y0 + h / 2, z, parent);
          if (i < felder && (i === 0 || i === felder - 1 || o.kreuze)) { const xa = x + (i === 0 ? 0 : w / felder), xb = x + (i === 0 ? w / felder : 0); const len = Math.hypot(w / felder, h * 0.64); const st = box(b * 0.8, len, 0.09, balken, (xa + xb) / 2, y0 + h * 0.36 + h * 0.32, z + 0.005, parent); st.rotation.z = Math.atan2(xb - xa, h * 0.64); } } }

      // ---------- Stadt: Mehrfamilienhaus (Blockrand), Reihenhaus, Loft ----------
      function mehrfamilienhaus(seed, o = {}) { const r = rng(seed * 17 + 1), g = new THREE.Group(), pick = (a) => a[Math.floor(r() * a.length)];
        const w = o.breite ?? 14 + Math.floor(r() * 8), d = 12, etagen = o.etagen ?? 4 + Math.floor(r() * 3), eh = 3.0, H = etagen * eh + 0.8, art = o.fassade ?? pick(["putz", "putz", "klinker", "vhf", "putz"]), farbe = pick(PUTZ2);
        const rahmenArt = o.rahmen ?? (art === "klinker" ? pick(["holz", "alu", "kunststoff"]) : pick(["kunststoff", "kunststoff", "alu"]));
        box(w, H, d, fassadeM(art, farbe, w, H), 0, H / 2, -d / 2, g); box(w + 0.04, 0.8, d + 0.04, material("sichtbeton", { wiederholen: [w / 3, 0.4] }), 0, 0.4, -d / 2, g); // Sockel
        if (art === "putz") for (let e = 1; e < etagen; e++) box(w + 0.02, 0.06, 0.04, M(new THREE.Color(farbe).offsetHSL(0, 0, -0.06).getHex()), 0, 0.8 + e * eh - 0.1, 0.02, g); // Putzfuge
        const n = Math.max(3, Math.round(w / 2.5)); const balk = o.balkone ?? r() < 0.6; const bArt = pick(["glas", "stahl", "beton"]);
        for (let e = 0; e < etagen; e++) for (let i = 0; i < n; i++) { const x = -w / 2 + w / n * (i + 0.5), y = 0.8 + e * eh + 1.5, mitte = i === Math.floor(n / 2);
          if (e === 0 && mitte) { box(1.4, 2.4, 0.15, M(pick([0x3a2a1e, 0x2a3a4a, 0x5a2a22, 0x1a1a1c]), { roughness: 0.5 }), x, 0.8 + 1.2, 0.02, g); box(1.2, 0.5, 0.05, glasM(), x, 0.8 + 2.1, 0.1, g); box(2.2, 0.12, 1.2, M(0x3a3e42, { metalness: 0.6 }), x, 0.8 + 2.8, 0.6, g); // Haustür + Vordach + Klingeln
            box(0.15, 0.4, 0.04, M(0xc8ccd0, { metalness: 0.8, roughness: 0.3 }), x + 0.95, 0.8 + 1.35, 0.03, g); for (let k = 0; k < etagen; k++) box(0.05, 0.03, 0.02, M(0x2a2a2a), x + 0.95, 0.8 + 1.2 + k * 0.05, 0.06, g); continue; }
          if (mitte && e > 0) { fenster2(g, x, y + 0.6, 0.0, 0.8, 0.9, { art: "fest", rahmen: rahmenArt, vorhang: false }); continue; } // Treppenhaus
          const breit = balk && (i % 3 === 1) && e > 0; const fw = breit ? 1.6 : 1.2, fh = breit ? 2.2 : 1.4;
          fenster2(g, x, breit ? y - 0.3 : y, 0.0, fw, fh, { art: breit ? "schiebe" : r() < 0.15 ? "sprossen" : "drehkipp", rahmen: rahmenArt, kipp: r() < 0.18 ? 1 : 0, licht: o.licht && r() < 0.55, rollladen: !breit && r() < 0.3 ? 0.2 + r() * 0.7 : 0, vorhangFarbe: pick([0xe8e0d0, 0xf2f2ee, 0xc8b8a0, 0x8a3a3a]) });
          if (breit) { const by = 0.8 + e * eh; box(fw + 1.0, 0.18, 1.4, material("sichtbeton", { wiederholen: [1, 0.4] }), x, by + 0.06, 0.7, g);
            if (bArt === "glas") box(fw + 1.0, 1.0, 0.03, new THREE.MeshPhysicalMaterial({ color: 0xc8dce8, roughness: 0.03, transparent: true, opacity: 0.3, envMapIntensity: 1.5 }), x, by + 0.65, 1.38, g);
            else if (bArt === "stahl") { box(fw + 1.0, 0.04, 0.04, RAHMEN.dunkel(), x, by + 1.1, 1.38, g); for (let k = 0; k <= 12; k++) box(0.02, 0.95, 0.02, RAHMEN.dunkel(), x - (fw + 1) / 2 + k * (fw + 1) / 12, by + 0.62, 1.38, g); }
            else box(fw + 1.0, 1.0, 0.12, fassadeM("putz", farbe, 2, 1), x, by + 0.6, 1.34, g);
            if (r() < 0.5) { const pf = cyl(0.15, 0.12, 0.3, M(0xb8643a), x + 0.6, by + 0.3, 1.0, g, 14); const pl = new THREE.Mesh(new THREE.SphereGeometry(0.25, 10, 8), M(0x3a7a3a, { roughness: 0.9 })); pl.position.set(x + 0.6, by + 0.6, 1.0); g.add(pl); } } }
        if (o.dach === "flach" || r() < 0.4) { box(w + 0.2, 0.6, d + 0.2, M(0x8a8a8c, { roughness: 0.8 }), 0, H + 0.3, -d / 2, g); box(1.2, 1.4, 1.2, M(0x9a9a9c), w * 0.3, H + 1.2, -d * 0.6, g); }
        else { satteldach(g, w, d, 4 + r() * 1.5, H, -d / 2, { farbe: pick(["#9a4a34", "#5a5e64", "#7a3a2a", "#3a3e44"]) }); for (let i = 0; i < Math.floor(w / 5); i++) (r() < 0.5 ? gaube(g, -w / 2 + 2.5 + i * 5, H + 0.6, -0.6, 1.6, { rahmen: rahmenArt, licht: o.licht && r() < 0.5 }) : dachfenster(g, -w / 2 + 2.5 + i * 5, H + 1.6, -1.6, 0.6)); }
        cyl(0.05, 0.05, H, M(0x8a8e92, { metalness: 0.5 }), w / 2 - 0.12, H / 2, 0.08, g, 8); // Fallrohr
        g.userData = { w, H, d }; return g; }
      function reihenhaeuser(seed, o = {}) { const r = rng(seed * 23 + 5), g = new THREE.Group(), n = o.anzahl ?? 5, bw = o.breite ?? 6, pick = (a) => a[Math.floor(r() * a.length)];
        for (let i = 0; i < n; i++) { const h = new THREE.Group(); h.position.x = -n * bw / 2 + bw * (i + 0.5); g.add(h); const art = o.fassade ?? pick(["putz", "putz", "klinker", "ziegel"]), farbe = pick(PUTZ2), H = 6.2, d = 10, ra = pick(["kunststoff", "holz", "alu"]);
          box(bw - 0.02, H, d, fassadeM(art, farbe, bw, H), 0, H / 2, -d / 2, h); box(bw, 0.5, d + 0.02, material("sichtbeton", { wiederholen: [1, 0.2] }), 0, 0.25, -d / 2, h);
          box(1.1, 2.2, 0.12, M(pick([0x2a3a4a, 0x6a2a22, 0x2a4a2a, 0xf2f2ee, 0x3a2a1e]), { roughness: 0.4 }), -bw / 2 + 1.2, 1.6, 0.02, h); box(1.6, 0.1, 1.0, M(0x3a3e42, { metalness: 0.6 }), -bw / 2 + 1.2, 2.9, 0.5, h);
          fenster2(h, 1.1, 1.85, 0, 2.0, 1.5, { art: r() < 0.5 ? "drehkipp" : "sprossen", rahmen: ra, kipp: r() < 0.2 ? 1 : 0, licht: o.licht && r() < 0.5 }); fenster2(h, -1.2, 4.6, 0, 1.2, 1.3, { rahmen: ra, licht: o.licht && r() < 0.5, rollladen: r() < 0.4 ? 0.5 : 0 }); fenster2(h, 1.2, 4.6, 0, 1.2, 1.3, { rahmen: ra, kipp: r() < 0.2 ? 1 : 0 });
          satteldach(h, bw - 0.02, d, 3.6, H, -d / 2, { farbe: pick(["#9a4a34", "#5a5e64", "#7a3a2a"]) }); if (r() < 0.6) dachfenster(h, 0.8, H + 1.4, -1.8, 0.62);
          // Vorgarten mit Zaun, Hecke, Mülltonnenbox
          const zm = M(pick([0xf2f2ee, 0x3a3a3c, 0x8a6a4a]), { roughness: 0.6 }); for (let k = 0; k < 10; k++) box(0.05, 0.8, 0.04, zm, -bw / 2 + 0.3 + k * (bw - 0.6) / 9, 0.4, 3.0, h); box(bw - 0.4, 0.05, 0.04, zm, 0, 0.7, 3.0, h);
          if (r() < 0.6) { const he = box(bw * 0.4, 0.9, 0.5, material("hecke", { wiederholen: [1, 0.5] }), bw * 0.2, 0.45, 2.5, h); } box(1.4, 0.04, 3, material("betonplatten", { wiederholen: [1, 2] }), -bw / 2 + 1.2, 0.02, 1.5, h); }
        g.userData = { w: n * bw }; return g; }
      function loft(seed, o = {}) { const r = rng(seed * 29 + 7), g = new THREE.Group(), w = o.breite ?? 26, d = 16, H = 11;
        box(w, H, d, material("ziegel", { wiederholen: [w / 2.6, H / 1.9] }), 0, H / 2, -d / 2, g);
        for (let e = 0; e < 2; e++) for (let i = 0; i < 6; i++) { const x = -w / 2 + w / 6 * (i + 0.5); fenster2(g, x, 2.6 + e * 5, 0.0, 3.0, 3.6, { art: "stahl", rahmen: "dunkel", kipp: r() < 0.2 ? 1 : 0, licht: o.licht && r() < 0.6, vorhang: false, bank: false });
          box(3.3, 0.35, 0.3, material("sichtbeton", { wiederholen: [1, 0.2] }), x, 2.6 + e * 5 + 2.0, 0.1, g); } // Stahlsprossenfenster mit Betonsturz
        for (let i = 0; i < 4; i++) { const z0 = -d + d * i / 4, z1 = z0 + d / 4; const sh = new THREE.Shape(); sh.moveTo(z0, 0); sh.lineTo(z1, 0); sh.lineTo(z0, 2.4); sh.closePath(); const geo = new THREE.ExtrudeGeometry(sh, { depth: w, bevelEnabled: false }); geo.rotateY(-Math.PI / 2); geo.translate(w / 2, H, 0); // Sheddach: Sägezahn mit Glasflanke
          const pr = new THREE.Mesh(geo, M(0x5a5e64, { roughness: 0.6, metalness: 0.4 })); pr.position.z = 0; pr.castShadow = pr.receiveShadow = true; g.add(pr); const gl = box(w - 0.1, 2.3, 0.05, glasM({ licht: o.licht }), 0, H + 1.18, z0 + 0.04, g); }
        cyl(0.8, 1.0, 22, material("klinker", { wiederholen: [3, 10] }), w / 2 - 3, 11, -d + 3, g, 20); // Schornstein
        box(w * 0.5, 0.15, 2.4, RAHMEN.dunkel(), -w * 0.1, 4.6, 1.2, g); for (let k = 0; k < 4; k++) cyl(0.02, 0.02, 2.6, RAHMEN.dunkel(), -w * 0.35 + k * w * 0.16, 5.9, 2.3, g, 6).rotation.x = 0.4; // Stahl-Vordach
        box(w + 0.1, 0.4, d + 0.1, material("ziegel", { wiederholen: [w / 2.6, 0.3], farbe: 0xb8a088 }), 0, H - 0.2, -d / 2, g);
        g.userData = { w, H, d }; return g; }

      // ---------- Land: Einfamilienhaus (klassisch/modern), Bungalow, Landhaus, Bauernhof ----------
      function einfamilienhaus2(seed, o = {}) { const r = rng(seed * 31 + 3), g = new THREE.Group(), pick = (a) => a[Math.floor(r() * a.length)], stil = o.stil ?? pick(["klassisch", "modern", "klassisch", "fachwerk"]);
        if (stil === "modern") { const w = 11, d = 9, farbe = pick([0xf6f6f2, 0xe8e8e4, 0x3a3c40]);
          box(w, 3.1, d, fassadeM("putz", farbe, w, 3.1), 0, 1.55, -d / 2, g); box(w * 0.6, 3.0, d * 0.75, fassadeM(r() < 0.5 ? "holz" : "vhf", null, w * 0.6, 3), -w * 0.18, 4.6, -d * 0.45, g);
          box(w + 0.6, 0.25, d + 0.6, M(0x2a2c30), 0, 3.15, -d / 2, g); box(w * 0.6 + 0.4, 0.2, d * 0.75 + 0.4, M(0x2a2c30), -w * 0.18, 6.15, -d * 0.45, g);
          fenster2(g, 1.8, 1.25, 0.0, 4.6, 2.3, { art: "schiebe", rahmen: "alu", kipp: o.offen ? 0.6 : 0, licht: o.licht, vorhang: false, bank: false }); fenster2(g, -3.6, 1.6, 0.0, 1.0, 2.0, { art: "fest", rahmen: "alu", vorhang: false, bank: false });
          fenster2(g, -w * 0.18, 4.6, d * -0.45 + d * 0.375 + 0.01, 3.4, 1.4, { art: "fest", rahmen: "alu", licht: o.licht, vorhang: false, bank: false });
          box(4, 0.15, 3.5, material("holzdeck", { wiederholen: [2, 2] }), 1.8, 0.08, 1.75, g); // Terrasse
          box(1.2, 2.4, 0.1, M(0x1a1a1c, { roughness: 0.4 }), -1.2, 1.2, 0.02, g); // Tür
          box(3.2, 2.6, 6, M(farbe, { roughness: 0.9 }), w / 2 + 1.7, 1.3, -3.2, g); box(2.8, 2.2, 0.06, material("lochblech", { wiederholen: [2, 2] }), w / 2 + 1.7, 1.1, -0.18, g); } // Garage
        else { const w = 10, d = 9, H = 5.8, art = stil === "fachwerk" ? "putz" : pick(["putz", "putz", "klinker"]), farbe = stil === "fachwerk" ? 0xf6f2ea : pick(PUTZ2), ra = pick(["holz", "kunststoff"]);
          box(w, H, d, fassadeM(art, farbe, w, H), 0, H / 2, -d / 2, g); box(w + 0.04, 0.5, d + 0.04, material("sandstein", { wiederholen: [w / 3, 0.3] }), 0, 0.25, -d / 2, g);
          if (stil === "fachwerk") { fachwerk(g, w, H / 2, 0.5, 0.05); fachwerk(g, w, H / 2 - 0.5, H / 2 + 0.5, 0.05, { kreuze: true }); }
          [[-2.8, 1.7], [2.8, 1.7], [-2.8, 4.4], [0, 4.4], [2.8, 4.4]].forEach(([x, y]) => fenster2(g, x, y, 0, 1.2, 1.3, { art: stil === "fachwerk" ? "sprossen" : "drehkipp", rahmen: ra, kipp: r() < 0.2 ? 1 : 0, licht: o.licht && r() < 0.5, rollladen: stil !== "fachwerk" && r() < 0.3 ? 0.4 : 0 }));
          box(1.2, 2.2, 0.1, material("poliertesholz", { farbe: 0x8a5a34 }), 0, 1.6, 0.03, g); box(1.8, 0.1, 1.2, M(0x3a3e42), 0, 2.9, 0.6, g); box(2, 0.4, 1.4, material("sandstein", { wiederholen: [1, 0.3] }), 0, 0.2, 0.7, g);
          satteldach(g, w, d, 4.2, H, -d / 2, { farbe: pick(["#9a4a34", "#5a5e64", "#7a3a2a"]), giebelM: stil === "fachwerk" ? fassadeM("putz", farbe, 4, 4) : undefined }); gaube(g, -2, H + 0.7, -0.7, 1.8, { rahmen: ra, licht: o.licht && r() < 0.5 }); dachfenster(g, 2.2, H + 1.8, -2.0, 0.75);
          box(0.7, 2.0, 0.7, material("klinker", { wiederholen: [0.5, 1] }), 2.6, H + 3.2, -5, g); }
        // Garten: Rasen, Zaun, Briefkasten
        box(18, 0.04, 8, material("rasen", { wiederholen: [6, 3] }), 0, 0.02, 4, g); for (let i = 0; i < 30; i++) box(0.08, 0.9, 0.04, M(0xf2f0ea), -8.7 + i * 0.6, 0.45, 7.9, g); box(17.6, 0.06, 0.04, M(0xf2f0ea), 0, 0.75, 7.92, g);
        cyl(0.04, 0.04, 1.1, M(0x2a2a2a), 1.6, 0.55, 7.6, g, 6); box(0.3, 0.25, 0.4, M(0x3a3e44, { metalness: 0.5 }), 1.6, 1.15, 7.6, g); return g; }
      function bungalow(seed, o = {}) { const r = rng(seed * 37 + 1), g = new THREE.Group(), w = 16, d = 11, H = 3.2, farbe = PUTZ2[Math.floor(r() * PUTZ2.length)];
        box(w, H, d, fassadeM(r() < 0.5 ? "putz" : "klinker", farbe, w, H), 0, H / 2, -d / 2, g);
        const sh = new THREE.Shape(); sh.moveTo(-w / 2 - 0.8, -d / 2 - 0.8); sh.lineTo(w / 2 + 0.8, -d / 2 - 0.8); sh.lineTo(w / 2 + 0.8, d / 2 + 0.8); sh.lineTo(-w / 2 - 0.8, d / 2 + 0.8); sh.closePath();
        const walm = new THREE.ConeGeometry(1, 1, 4, 1); walm.rotateY(Math.PI / 4); const dm = new THREE.Mesh(walm, M(0x5a4a44, { roughness: 0.8, map: (() => { const t = texZiegel("#6a4a3a").clone(); t.needsUpdate = true; t.repeat.set(6, 4); return t; })() })); dm.scale.set((w + 1.6) / Math.SQRT2, 2.4, (d + 1.6) / Math.SQRT2); dm.position.set(0, H + 1.2, -d / 2); dm.castShadow = true; g.add(dm); // Walmdach
        for (let i = 0; i < 4; i++) fenster2(g, -w / 2 + 2 + i * 3.6, 1.6, 0, i === 2 ? 3.2 : 1.6, i === 2 ? 2.3 : 1.4, { art: i === 2 ? "schiebe" : "drehkipp", rahmen: "kunststoff", licht: o.licht && r() < 0.5, kipp: r() < 0.2 ? 1 : 0, bank: i !== 2 });
        box(5, 0.15, 3.5, material("terrakotta", { wiederholen: [3, 2] }), -w / 2 + 9.2, 0.08, 1.8, g); for (const x of [-w / 2 + 7, -w / 2 + 11.4]) cyl(0.08, 0.08, 2.9, M(0xf2f2ee), x, 1.5, 3.4, g, 10); box(5, 0.12, 3.8, M(0xf2f2ee), -w / 2 + 9.2, 3.0, 1.7, g); // Terrasse + Überdachung
        return g; }
      function bauernhof(seed, o = {}) { const r = rng(seed * 41 + 9), g = new THREE.Group();
        // Wohnhaus in Fachwerk
        const wh = new THREE.Group(); wh.position.set(-8, 0, 0); g.add(wh); const w = 12, d = 10, H = 6.4; box(w, H, d, fassadeM("putz", 0xf6f2ea, w, H), 0, H / 2, -d / 2, wh); box(w + 0.05, 0.6, d + 0.05, material("sandstein", { wiederholen: [4, 0.3] }), 0, 0.3, -d / 2, wh);
        fachwerk(wh, w, H / 2 - 0.3, 0.6, 0.05, {}); fachwerk(wh, w, H / 2 - 0.3, H / 2 + 0.3, 0.05, { kreuze: true });
        [[-3.6, 1.9], [3.6, 1.9], [-3.6, 4.9], [0, 4.9], [3.6, 4.9]].forEach(([x, y]) => { fenster2(wh, x, y, 0, 1.0, 1.2, { art: "sprossen", rahmen: "holz", licht: o.licht && r() < 0.6 }); for (const sx of [-1, 1]) { const la = box(0.5, 1.25, 0.05, M(0x2a5a3a, { roughness: 0.6 }), x + sx * 0.78, y, 0.06, wh); } });
        box(1.3, 2.3, 0.12, material("altholz", { farbe: 0x8a5a34, wiederholen: [0.5, 1] }), 0, 1.75, 0.03, wh); satteldach(wh, w, d, 5.2, H, -d / 2, { farbe: "#8a3a2a", giebelM: fassadeM("putz", 0xf6f2ea, 4, 4) });
        box(0.8, 2.2, 0.8, material("klinker", { wiederholen: [0.5, 1] }), 3, H + 3.6, -6, wh); const rauchPos = new THREE.Vector3(-5, H + 4.8, -6);
        // Scheune: Holzschalung, großes Tor
        const sc = new THREE.Group(); sc.position.set(9, 0, -2); sc.rotation.y = -0.15; g.add(sc); const sw = 14, sd = 12, sH = 6;
        box(sw, sH, sd, material("altholz", { farbe: 0x8a3a2a, wiederholen: [sw / 2, sH / 3] }), 0, sH / 2, -sd / 2, sc); box(sw + 0.04, 0.5, sd + 0.04, material("feldweg", { wiederholen: [4, 0.3] }), 0, 0.25, -sd / 2, sc);
        box(4.2, 4.6, 0.15, material("altholz", { farbe: 0x5a2a1e, wiederholen: [2, 2] }), 0, 2.3, 0.05, sc); for (const dz of [0.14]) { const x1 = box(0.15, 6.2, 0.06, M(0xe8e4dc), 0, 2.3, dz, sc); x1.rotation.z = 0.74; const x2 = x1.clone(); x2.rotation.z = -0.74; sc.add(x2); }
        satteldach(sc, sw, sd, 5.5, sH, -sd / 2, { material: material("wellblech", { wiederholen: [sw / 2, 6], farbe: 0x8a8e92 }), giebelM: material("altholz", { farbe: 0x8a3a2a, wiederholen: [3, 2] }) });
        // Stall, Silo, Strohballen, Misthaufen, Zaun
        box(10, 3.2, 7, fassadeM("ziegel", null, 10, 3.2), 9, 1.6, 9, g); for (let i = 0; i < 4; i++) fenster2(g, 5.5 + i * 2.3, 2.1, 12.52, 0.7, 0.5, { art: "fest", rahmen: "holz", vorhang: false, bank: false });
        const st = new THREE.Group(); st.position.set(9, 0, 9); g.add(st); satteldach(st, 10, 7, 2.2, 3.2, 0, { material: material("wellblech", { wiederholen: [5, 3] }) });
        cyl(2.2, 2.2, 12, material("wellblech", { wiederholen: [6, 4], farbe: 0xc8ccd0 }), 20, 6, -10, g, 32); const kup = new THREE.Mesh(new THREE.ConeGeometry(2.3, 1.4, 32), M(0x8a8e92, { metalness: 0.7 })); kup.position.set(20, 12.7, -10); g.add(kup);
        for (let i = 0; i < 8; i++) { const ba = cyl(0.7, 0.7, 1.2, material("stroh", { wiederholen: [2, 1] }), 2 + (i % 4) * 1.5, 0.7 + Math.floor(i / 4) * 1.3, 10 + (i % 2) * 0.2, g, 20); ba.rotation.z = Math.PI / 2; }
        const mist = new THREE.Mesh(new THREE.SphereGeometry(2, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), material("mulch", { wiederholen: [2, 2] })); mist.position.set(15, 0, 6); mist.scale.y = 0.45; g.add(mist);
        const holz = material("altholz", { farbe: 0x8a7a64, wiederholen: [0.3, 1] }); for (let i = 0; i < 24; i++) cyl(0.07, 0.07, 1.3, holz, -16 + i * 2, 0.65, 18, g, 8); for (const y of [0.5, 1.0]) box(48, 0.1, 0.06, holz, 8, y, 18, g);
        box(60, 0.03, 8, material("feldweg", { wiederholen: [15, 2] }), 4, 0.015, 6, g); // Hofplatz
        g.userData = { rauchPos }; return g; }
      // Mixed-Use-Hochhaus: Ladensockel + Büroglas + Wohnteil mit Balkonen (setzt hochhaus() aus fassaden.js voraus)
      function mixedTower(seed, o = {}) { const g = new THREE.Group(), w = o.breite ?? 28, d = o.tiefe ?? 22;
        const sockel = hochhaus(seed, { typ: "glas", w: w + 8, d: d + 8, etagen: 3, nacht: o.nacht, licht: 0.8 }); g.add(sockel);
        const buero = hochhaus(seed + 1, { typ: "glas", w, d, etagen: o.buero ?? 14, lobby: false, nacht: o.nacht, licht: o.nacht ? 0.5 : 0.3 }); buero.position.y = sockel.userData.H + 0.9; g.add(buero);
        const wohnen = hochhaus(seed + 2, { typ: "modern", w: w - 6, d: d - 4, etagen: o.wohnen ?? 10, lobby: false, nacht: o.nacht, licht: 0.45 }); wohnen.position.y = buero.position.y + buero.userData.H + 0.9; g.add(wohnen);
        g.userData = { H: wohnen.position.y + wohnen.userData.H, update(T) { [sockel, buero, wohnen].forEach((h) => h.userData.update(T)); } }; return g; }

      // Brutalismus: rohe Sichtbeton-Wohnblöcke mit tiefen Fensterlaibungen, vorspringenden Balkon-Kästen und Treppenhaus-Turm
      function brutalismus(seed, o = {}) { const r = rng(seed * 43 + 3), g = new THREE.Group(), w = o.breite ?? 24, d = 13, etagen = o.etagen ?? 8, eh = 3.0, H = etagen * eh + 1.2;
        const beton = material("sichtbeton", { wiederholen: [w / 3, H / 3], farbe: o.farbe ?? 0xd0ccc4 }), dunkel = material("sichtbeton", { wiederholen: [2, 2], farbe: 0x9a968e });
        box(w, H, d, beton, 0, H / 2, -d / 2, g); box(w + 0.1, 1.2, d + 0.1, dunkel, 0, 0.6, -d / 2, g);
        const raster = Math.max(4, Math.round(w / 3)); const bw = w / raster;
        for (let e = 0; e < etagen; e++) { const y = 1.2 + e * eh; box(w + 0.4, 0.35, 0.6, beton, 0, y + eh - 0.17, 0.3, g); // auskragende Geschossplatte
          for (let i = 0; i < raster; i++) { const x = -w / 2 + bw * (i + 0.5); box(0.32, eh - 0.35, 0.6, beton, x - bw / 2, y + eh / 2 - 0.17, 0.3, g); // Lisene (Betonrippe)
            const breit = (i + e) % 4 === 0; fenster2(g, x, y + (breit ? 1.25 : 1.45), 0.02, bw - 0.6, breit ? 2.2 : 1.5, { art: breit ? "schiebe" : "drehkipp", rahmen: "dunkel", kipp: r() < 0.12 ? 1 : 0, licht: o.licht && r() < 0.5, vorhang: r() < 0.6, bank: false });
            if (breit) box(bw - 0.4, 1.0, 0.12, beton, x, y + 0.55, 0.55, g); } box(0.32, eh - 0.35, 0.6, beton, w / 2, y + eh / 2 - 0.17, 0.3, g); }
        box(4.5, H + 4, 4.5, beton, w / 2 - 2.5, (H + 4) / 2, -d - 1.5, g); for (let e = 0; e < etagen; e++) box(0.3, 1.8, 0.05, glasM({ licht: o.licht }), w / 2 - 2.5, 2.5 + e * eh, -d + 0.77, g); // Treppenturm mit Schlitzfenstern
        box(3.5, 2.6, 0.2, M(0x2a2a2c, { metalness: 0.6, roughness: 0.4 }), -w / 4, 1.3 + 0.1, 0.05, g); box(5, 0.3, 2.4, beton, -w / 4, 3.0, 1.2, g); // Eingang mit Betonvordach
        g.userData = { w, H, d }; return g; }
      // Historisches Fachwerk-Stadthaus (schmal, mehrgeschossig, verwittert, vorkragende Obergeschosse)
      function fachwerkStadthaus(seed, o = {}) { const r = rng(seed * 47 + 5), g = new THREE.Group(), w = o.breite ?? 8 + Math.floor(r() * 4), d = 10, eh = 2.9, etagen = o.etagen ?? 3; const putzF = [0xf2ead8, 0xe8dcc0, 0xf0e4cc, 0xe0d4b8, 0xd8c8a8][Math.floor(r() * 5)];
        let y = 0; for (let e = 0; e < etagen; e++) { const vk = e * 0.25; const wand = material("putzweiss", { farbe: putzF, wiederholen: [w / 3, 1] }); // jedes Geschoss kragt etwas vor
          box(w, eh, d, e === 0 ? material("sandstein", { wiederholen: [w / 3, 1] }) : wand, 0, y + eh / 2, -d / 2 + vk, g);
          if (e > 0) { fachwerk(g, w, eh, y, vk + 0.05, { kreuze: r() < 0.6, balken: [0x3a2418, 0x4a3020, 0x2a1a12][Math.floor(r() * 3)] }); box(w + 0.1, 0.22, 0.3, material("altholz", { farbe: 0x3a2418 }), 0, y + 0.1, vk + 0.1, g); }
          const n = Math.max(2, Math.round(w / 2.4)); for (let i = 0; i < n; i++) { const x = -w / 2 + w / n * (i + 0.5); if (e === 0 && i === Math.floor(n / 2)) { box(1.2, 2.3, 0.1, material("altholz", { farbe: 0x5a3220 }), x, 1.15, vk + 0.04, g); continue; }
            fenster2(g, x, y + eh * 0.55, vk + 0.03, 0.9, 1.25, { art: "sprossen", rahmen: "holz", licht: o.licht && r() < 0.6, bank: false }); if (r() < 0.5) for (const sx of [-1, 1]) box(0.45, 1.3, 0.04, M([0x2a5a3a, 0x7a2a22, 0x3a4a6a][Math.floor(r() * 3)], { roughness: 0.7 }), x + sx * 0.7, y + eh * 0.55, vk + 0.08, g); }
          y += eh; }
        satteldach(g, w, d, 5 + r() * 2, y, -d / 2 + (etagen - 1) * 0.25, { farbe: ["#7a3a2a", "#8a4a34", "#5a3a2e"][Math.floor(r() * 3)], giebelM: material("putzweiss", { farbe: putzF }) }); const sch = box(0.6, 2.2, 0.6, material("klinker", { wiederholen: [0.5, 1] }), w * 0.2, y + 3.2, -d * 0.55, g);
        g.userData = { w, H: y, d, schornstein: new THREE.Vector3(w * 0.2, y + 4.4, -d * 0.55) }; return g; }
