      // ===== Fahrzeuge v2: Bauformen, Reifen mit Profil, Felgentypen, Federung, Abgase (braucht: rng, box, cyl, M, extrudeSide, LACK, kennzeichenTex, KENNZ, particles) =====
      // fahrzeug(seed, typ, { farbe, felge, felgenFarbe, kennzeichen, lackArt: "uni"|"metallic"|"matt", carbon, innen: "leder"|"stoff"|"alcantara", innenFarbe, ambiente (LED-Farbe), holz, panorama, unterboden (Leuchtfarbe) })
      //   typ: "stufenheck"|"fliessheck"|"steilheck"|"coupe"|"kombi"|"shooting"|"suv"|"gelaende"|"targa"|"minivan"|"stretch"
      //   felge: "speichen5"|"vielspeichen"|"doppelspeichen"|"stahl"|"turbine"|"offroad"
      // Danach optional autoPlus(car, { licht, bremse }) für Scheinwerfer/Lichtkegel. Bewegung: fahren(car, T, strecke), abgas(car, seed).
      const FLAKE = {};
      function FLAKE_TEX(normal) { const k = normal ? "n" : "r"; if (FLAKE[k]) return FLAKE[k]; const q = rng(normal ? 5 : 7); const t = canvasTex(256, 256, (g) => { g.fillStyle = normal ? "rgb(128,128,255)" : "rgb(90,90,90)"; g.fillRect(0, 0, 256, 256);
          for (let i = 0; i < 9000; i++) { g.fillStyle = normal ? `rgb(${(80 + q() * 96) | 0},${(80 + q() * 96) | 0},255)` : `rgb(${(40 + q() * 120) | 0},${(40 + q() * 120) | 0},${(40 + q() * 120) | 0})`; g.fillRect(q() * 256, q() * 256, 1, 1); } });
        t.encoding = THREE.LinearEncoding; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(8, 8); FLAKE[k] = t; return t; }
      const KAROSSEN = {
        stufenheck: { body: [[-2.4, 0.32], [2.4, 0.32], [2.42, 0.62], [2.1, 0.8], [1.0, 0.9], [-1.6, 0.94], [-2.35, 0.9], [-2.42, 0.62]], glas: [[-1.5, 0.9], [0.95, 0.9], [0.3, 1.4], [-0.95, 1.42], [-1.6, 0.95]], tueren: 4, r: 0.33 },
        fliessheck: { body: [[-2.35, 0.32], [2.4, 0.32], [2.42, 0.62], [2.1, 0.8], [1.0, 0.9], [-2.0, 0.94], [-2.35, 0.86], [-2.4, 0.62]], glas: [[-2.0, 0.92], [0.95, 0.9], [0.3, 1.4], [-0.75, 1.42], [-2.1, 0.95]], tueren: 4, r: 0.34 },
        steilheck:  { body: [[-1.95, 0.32], [1.95, 0.32], [1.96, 0.62], [1.6, 0.84], [0.85, 0.94], [-1.88, 0.98], [-1.96, 0.7]], glas: [[-1.82, 0.95], [0.8, 0.93], [0.18, 1.44], [-1.7, 1.47], [-1.86, 1.02]], tueren: 4, r: 0.31 },
        coupe:      { body: [[-2.25, 0.3], [2.25, 0.3], [2.28, 0.56], [1.95, 0.72], [0.9, 0.82], [-1.5, 0.86], [-2.2, 0.82], [-2.28, 0.56]], glas: [[-1.75, 0.84], [0.85, 0.82], [0.12, 1.24], [-0.75, 1.26], [-1.85, 0.88]], tueren: 2, r: 0.34, tief: true },
        kombi:      { body: [[-2.42, 0.32], [2.42, 0.32], [2.44, 0.62], [2.1, 0.8], [1.0, 0.9], [-2.3, 0.96], [-2.44, 0.7]], glas: [[-2.3, 0.94], [0.95, 0.9], [0.3, 1.42], [-2.2, 1.44], [-2.36, 1.0]], tueren: 4, r: 0.33, reling: true },
        shooting:   { body: [[-2.35, 0.3], [2.4, 0.3], [2.42, 0.58], [2.05, 0.75], [0.95, 0.85], [-2.25, 0.9], [-2.38, 0.66]], glas: [[-2.22, 0.88], [0.9, 0.85], [0.22, 1.3], [-1.85, 1.3], [-2.3, 0.95]], tueren: 2, r: 0.34, tief: true },
        suv:        { body: [[-2.35, 0.45], [2.35, 0.45], [2.38, 0.85], [2.05, 1.05], [1.0, 1.12], [-2.3, 1.15], [-2.38, 0.85]], glas: [[-2.2, 1.12], [0.95, 1.1], [0.4, 1.66], [-2.1, 1.7], [-2.28, 1.2]], tueren: 4, r: 0.38, reling: true, beplankung: true },
        gelaende:   { body: [[-2.3, 0.52], [2.3, 0.52], [2.32, 1.1], [2.2, 1.16], [-2.3, 1.16]], glas: [[-2.25, 1.16], [1.1, 1.16], [0.98, 1.86], [-2.25, 1.86]], tueren: 4, r: 0.4, reling: true, beplankung: true, kastig: true },
        targa:      { body: [[-2.2, 0.3], [2.2, 0.3], [2.24, 0.54], [1.9, 0.7], [0.85, 0.8], [-1.4, 0.84], [-2.15, 0.8], [-2.24, 0.54]], glas: [[-0.9, 0.82], [0.8, 0.8], [0.1, 1.18], [-0.75, 1.2], [-0.95, 0.86]], tueren: 2, r: 0.33, tief: true, offen: true },
        minivan:    { body: [[-2.45, 0.38], [2.45, 0.38], [2.47, 0.8], [2.15, 1.0], [-2.4, 1.05], [-2.47, 0.8]], glas: [[-2.38, 1.02], [2.1, 1.0], [1.1, 1.75], [-2.3, 1.8], [-2.42, 1.1]], tueren: 3, r: 0.34 },
        oldtimer:   { body: [[-2.35, 0.36], [2.3, 0.36], [2.36, 0.62], [2.1, 0.86], [0.95, 0.92], [-1.4, 0.95], [-2.1, 0.88], [-2.38, 0.62]], glas: [[-1.45, 0.93], [0.85, 0.92], [0.45, 1.44], [-0.95, 1.46], [-1.55, 0.98]], tueren: 2, r: 0.36, alt: true },
        stretch:    { body: [[-2.4, 0.32], [2.4, 0.32], [2.42, 0.62], [2.1, 0.8], [1.0, 0.9], [-1.6, 0.94], [-2.35, 0.9], [-2.42, 0.62]], glas: [[-1.5, 0.9], [0.95, 0.9], [0.3, 1.4], [-0.95, 1.42], [-1.6, 0.95]], tueren: 6, r: 0.34, dehnen: 3.2 },
      };
      const REIFEN_TEX = {};
      function texProfil() { if (REIFEN_TEX.p) return REIFEN_TEX.p; const t = canvasTex(64, 256, (g) => { g.fillStyle = "#2a2a2a"; g.fillRect(0, 0, 64, 256); g.fillStyle = "#111";
          for (let y = 0; y < 256; y += 10) { g.fillRect(4, y, 18, 4); g.fillRect(42, y + 5, 18, 4); g.beginPath(); g.moveTo(24, y); g.lineTo(40, y + 6); g.lineTo(40, y + 9); g.lineTo(24, y + 3); g.fill(); } g.fillRect(22, 0, 3, 256); g.fillRect(39, 0, 3, 256); });
        t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(1, 3); REIFEN_TEX.p = t; return t; }
      // Rad mit Reifen (Lauffläche mit Profil, gewölbte Flanke), Felge, Bremsscheibe, Bremssattel, Radmuttern
      function reifenRad(g, x, z, r, w, typ, farbe, sattel) {
        const wheel = new THREE.Group(); wheel.position.set(x, r, z); g.add(wheel); const aus = Math.sign(x) || 1;
        const gummi = new THREE.MeshStandardMaterial({ color: 0x9a9a9a, map: texProfil(), roughness: 0.92 }), flankeM = M(0x1c1c1c, { roughness: 0.75 });
        const lauf = cyl(r, r, w * 0.92, gummi, 0, 0, 0, wheel, 40); lauf.rotation.z = Math.PI / 2;
        for (const sx of [-1, 1]) { const fl = new THREE.Mesh(new THREE.TorusGeometry(r * 0.83, r * 0.17, 12, 40), flankeM); fl.rotation.y = Math.PI / 2; fl.position.x = sx * w * 0.36; fl.scale.z = 0.55; fl.castShadow = true; wheel.add(fl); }
        const fR = r * (typ === "offroad" ? 0.6 : 0.68), fM = M(farbe, { metalness: 0.85, roughness: 0.28 }), dunkel = M(0x141416, { metalness: 0.3, roughness: 0.6 });
        const bett = cyl(fR, fR, w * 0.8, dunkel, 0, 0, 0, wheel, 32); bett.rotation.z = Math.PI / 2;
        const scheibe = cyl(fR * 0.78, fR * 0.78, 0.02, M(0x6a6c70, { metalness: 0.8, roughness: 0.4 }), aus * w * 0.12, 0, 0, wheel, 28); scheibe.rotation.z = Math.PI / 2;
        if (sattel) { const sa = box(0.05, fR * 0.55, fR * 0.4, M(sattel, { roughness: 0.4 }), aus * w * 0.18, fR * 0.42, -fR * 0.3, wheel); }
        const fx = aus * (w * 0.4 + 0.012); const kranz = new THREE.Mesh(new THREE.TorusGeometry(fR * 0.98, 0.016, 8, 36), fM); kranz.rotation.y = Math.PI / 2; kranz.position.x = fx; wheel.add(kranz);
        const speiche = (n, breit, dick = 0.022, versatz = 0) => { for (let k = 0; k < n; k++) { const sp = box(dick, fR * 0.82, breit, fM, fx, 0, 0, wheel); sp.geometry.translate(0, fR * 0.45, 0); sp.rotation.x = k / n * Math.PI * 2 + versatz; } };
        if (typ === "speichen5") speiche(5, 0.07);
        else if (typ === "vielspeichen") speiche(10, 0.025, 0.018);
        else if (typ === "doppelspeichen") { speiche(5, 0.03, 0.02, 0.12); speiche(5, 0.03, 0.02, -0.12); }
        else if (typ === "turbine") { const d = cyl(fR * 0.94, fR * 0.94, 0.02, fM, fx, 0, 0, wheel, 32); d.rotation.z = Math.PI / 2; for (let k = 0; k < 14; k++) { const sl = box(0.026, fR * 0.38, 0.03, dunkel, fx + aus * 0.006, 0, 0, wheel); sl.geometry.translate(0, fR * 0.6, 0); sl.rotation.x = k / 14 * Math.PI * 2; sl.rotation.y = 0.4; } }
        else if (typ === "stahl") { const d = cyl(fR * 0.95, fR * 0.95, 0.018, M(0x3a3c40, { metalness: 0.6, roughness: 0.5 }), fx, 0, 0, wheel, 32); d.rotation.z = Math.PI / 2; for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2; const lo = cyl(fR * 0.1, fR * 0.1, 0.022, dunkel, fx + aus * 0.002, Math.sin(a) * fR * 0.62, Math.cos(a) * fR * 0.62, wheel, 12); lo.rotation.z = Math.PI / 2; } }
        else if (typ === "offroad") { speiche(6, 0.06, 0.03); const bl = new THREE.Mesh(new THREE.TorusGeometry(fR, 0.03, 8, 36), dunkel); bl.rotation.y = Math.PI / 2; bl.position.x = fx + aus * 0.01; wheel.add(bl); for (let k = 0; k < 16; k++) { const a = k / 16 * Math.PI * 2; const bo = cyl(0.008, 0.008, 0.03, fM, fx + aus * 0.02, Math.sin(a) * fR, Math.cos(a) * fR, wheel, 6); bo.rotation.z = Math.PI / 2; } }
        const nabe = cyl(fR * 0.2, fR * 0.2, 0.03, fM, fx + aus * 0.006, 0, 0, wheel, 20); nabe.rotation.z = Math.PI / 2;
        const logo = cyl(fR * 0.1, fR * 0.1, 0.034, M(0x1a1a1e, { metalness: 0.5 }), fx + aus * 0.008, 0, 0, wheel, 16); logo.rotation.z = Math.PI / 2;
        for (let k = 0; k < 5; k++) { const a = k / 5 * Math.PI * 2; const mu = cyl(0.009, 0.009, 0.03, M(0xc8ccd0, { metalness: 0.9, roughness: 0.2 }), fx + aus * 0.01, Math.sin(a) * fR * 0.13 + 0, Math.cos(a) * fR * 0.13, wheel, 6); mu.rotation.z = Math.PI / 2; mu.position.multiplyScalar(1); mu.position.y *= 2.1; mu.position.z *= 2.1; }
        return wheel;
      }
      function fahrzeug(seed, typ = "stufenheck", o = {}) {
        const K = KAROSSEN[typ], r = rng(seed * 37 + 11), pick = (a) => a[Math.floor(r() * a.length)], g = new THREE.Group(), kar = new THREE.Group(); g.add(kar);
        const d = K.dehnen || 0, dehn = (p) => [p[0] > 0.2 ? p[0] + d / 2 : p[0] < -0.2 ? p[0] - d / 2 : p[0] * (1 + d), p[1]];
        const body = K.body.map(dehn), glas = K.glas.map(dehn); const L = body[1][0] - body[0][0], W = K.kastig ? 1.92 : K.tief ? 1.84 : typ === "suv" || typ === "minivan" ? 1.9 : 1.8, zf = body[1][0], zh = body[0][0];
        const farbe = o.farbe ?? (typ === "stretch" ? pick([0x111114, 0xf2f2f0]) : pick(LACK));
        const lackArt = o.lackArt ?? (r() < 0.45 ? "metallic" : r() < 0.12 ? "matt" : "uni");
        const lack = new THREE.MeshPhysicalMaterial({ color: farbe, metalness: lackArt === "metallic" ? 0.75 : lackArt === "matt" ? 0.2 : 0.35, roughness: lackArt === "matt" ? 0.55 : lackArt === "metallic" ? 0.38 : 0.3, clearcoat: lackArt === "matt" ? 0 : 1, clearcoatRoughness: 0.05 });
        if (lackArt === "metallic") { lack.roughnessMap = FLAKE_TEX(); lack.normalMap = FLAKE_TEX(true); lack.normalScale = new THREE.Vector2(0.08, 0.08); } // Metallic-Flakes: funkelnde Mikro-Struktur unter dem Klarlack
        const carbonM = o.carbon ? material("carbon", { wiederholen: [4, 4] }) : null;
        const glasM = new THREE.MeshStandardMaterial({ color: 0x1e2a34, roughness: 0.03, metalness: 0.5, transparent: true, opacity: typ === "stretch" ? 0.85 : 0.58, depthWrite: false, envMapIntensity: 1.6 });
        const dunkel = M(0x18181a, { roughness: 0.7 }), chrom = M(0xd8dce0, { metalness: 0.95, roughness: 0.18 }), gummiM = M(0x0e0e0e, { roughness: 0.8 });
        const b = extrudeSide(body, W, lack, 0.07); kar.add(b);
        // Glasaufbau, Dach, Säulen
        if (!K.offen) { const gh = extrudeSide(glas, W - 0.14, glasM, 0.03); gh.castShadow = false; kar.add(gh); const roof = [glas[3], glas[2], [glas[2][0] - 0.06, glas[2][1] + 0.07], [glas[3][0], glas[3][1] + 0.08]]; kar.add(extrudeSide(roof, W - 0.1, o.panorama ? glasM : carbonM ?? lack, 0.025)); if (o.panorama) for (const sx of [-1, 1]) box(0.08, 0.06, glas[2][0] - glas[3][0], lack, sx * (W / 2 - 0.1), glas[3][1] + 0.06, (glas[2][0] + glas[3][0]) / 2, kar); }
        else { const ws = [[glas[1][0], glas[1][1]], [glas[2][0], glas[2][1]], [glas[2][0] - 0.06, glas[2][1]], [glas[1][0] - 0.12, glas[1][1]]]; kar.add(extrudeSide(ws, W - 0.2, glasM, 0.02));
          const bugel = extrudeSide([[glas[0][0] - 0.05, glas[0][1]], [glas[0][0] + 0.25, glas[0][1]], [glas[3][0] + 0.2, glas[3][1] + 0.06], [glas[3][0] - 0.05, glas[3][1] + 0.06]], W - 0.1, lack, 0.03); kar.add(bugel); } // Targa-Bügel
        const strebe = (z1, y1, z2, y2, x, dicke = 0.07) => { const a = new THREE.Vector3(x, y1, z1), c = new THREE.Vector3(x, y2, z2); const m = box(dicke, a.distanceTo(c), dicke, lack, 0, 0, 0, kar); m.position.copy(a).add(c).multiplyScalar(0.5); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), c.clone().sub(a).normalize()); };
        const tz = []; const nT = K.tueren; for (let i = 1; i < (nT >= 4 ? (nT === 6 ? 3 : 2) : 1) + 1; i++) tz.push(glas[1][0] - (glas[1][0] - glas[0][0]) * i / ((nT >= 4 ? (nT === 6 ? 3 : 2) : 1) + (K.reling || typ === "minivan" ? 0.6 : 0.3)));
        for (const sx of [-1, 1]) { const x = sx * (W / 2 - 0.08);
          strebe(glas[1][0], glas[1][1], glas[2][0], glas[2][1], x, 0.08); if (!K.offen) { strebe(glas[0][0], glas[0][1], glas[3][0], glas[3][1], x, 0.1); tz.forEach((zz) => strebe(zz, glas[0][1], zz, glas[3][1], x, 0.07)); }
          box(0.012, 0.02, glas[1][0] - glas[0][0], chrom, sx * (W / 2 - 0.05), glas[0][1] + 0.01, (glas[1][0] + glas[0][0]) / 2, kar); // Zierleiste an der Fensterlinie
          // Türfugen, Griffe, Spiegel, Seitenschweller
          const fugen = [glas[1][0] + 0.05, ...tz.map((zz) => zz + 0.02)]; if (nT < 4) fugen.push(glas[0][0] + 0.1);
          fugen.forEach((zz) => box(0.012, glas[0][1] - body[0][1] - 0.12, 0.008, dunkel, sx * (W / 2 + 0.002), (glas[0][1] + body[0][1]) / 2 + 0.02, zz, kar));
          fugen.slice(0, nT >= 4 ? -0 : 1).forEach((zz, i) => { if (i < fugen.length) box(0.025, 0.028, 0.15, chrom, sx * (W / 2 + 0.012), glas[0][1] - 0.13, zz - 0.25, kar); });
          box(0.12, 0.09, 0.2, lack, sx * (W / 2 + 0.07), glas[1][1] + 0.08, glas[1][0] - 0.15, kar); box(0.01, 0.07, 0.17, M(0x8a96a0, { metalness: 1, roughness: 0.05 }), sx * (W / 2 + 0.065), glas[1][1] + 0.08, glas[1][0] - 0.26, kar);
          box(0.04, 0.08, L * 0.62, K.beplankung ? dunkel : lack, sx * (W / 2 + 0.01), body[0][1] + 0.06, (zf + zh) / 2, kar);
          if (K.beplankung) box(0.03, 0.22, L * 0.98, dunkel, sx * (W / 2 + 0.012), body[0][1] + 0.1, (zf + zh) / 2, kar);
          if (K.reling) box(0.04, 0.04, (glas[2][0] - glas[3][0]) * 0.9, chrom, sx * (W / 2 - 0.2), glas[3][1] + 0.12, (glas[2][0] + glas[3][0]) / 2 - 0.1, kar);
        }
        if (typ === "minivan") box(0.01, 0.02, 0.9, dunkel, W / 2 + 0.004, glas[0][1] - 0.05, tz[0] - 0.55, kar); // Schiebetür-Schiene
        // Innenraum
        const innen = o.innen ?? pick(["leder", "stoff", "stoff", "alcantara"]), innenC = o.innenFarbe ?? pick([0x2a2a2c, 0x5a3a24, 0xc8b89a, 0x3a3a44, 0x8a2a22]);
        const sitzM = material(innen === "leder" ? "leder" : innen === "alcantara" ? "wildleder" : "mikrofaser", { farbe: innenC, wiederholen: [1, 1] }), naht = M(new THREE.Color(innenC).offsetHSL(0, 0, innenC === 0x2a2a2c ? 0.25 : 0.12).getHex(), { roughness: 0.8 }), sy = glas[0][1] - 0.36;
        const reihen = [glas[1][0] - 0.75]; for (let zz = reihen[0] - 0.95; zz > glas[0][0] + 0.2 && reihen.length < (typ === "stretch" ? 4 : typ === "minivan" ? 3 : nT >= 4 ? 2 : 1); zz -= 0.95) reihen.push(zz);
        reihen.forEach((zz, ri) => { for (const sx of ri ? [-0.42, 0, 0.42] : [-0.4, 0.4]) { const bw = ri ? 0.4 : 0.48; const sitz = box(bw, 0.16, 0.5, sitzM, sx, sy, zz, kar); const lehne = box(bw, 0.55, 0.12, sitzM, sx, sy + 0.32, zz - 0.27, kar); box(0.24, 0.14, 0.1, sitzM, sx, sy + 0.66, zz - 0.29, kar);
          for (const nx of [-bw * 0.28, bw * 0.28]) { box(0.006, 0.005, 0.48, naht, sx + nx, sy + 0.082, zz, kar); box(0.006, 0.52, 0.005, naht, sx + nx, sy + 0.32, zz - 0.21, kar); } } }); // Ziernähte
        const dash = box(W - 0.3, 0.2, 0.45, material(innen === "alcantara" ? "wildleder" : "kunstleder", { farbe: 0x1e1e20 }), 0, sy + 0.32, glas[1][0] - 0.12, kar);
        if (o.holz ?? r() < 0.3) box(W - 0.4, 0.04, 0.02, material("poliertesholz", { farbe: 0x7a4a2a }), 0, sy + 0.3, glas[1][0] - 0.345, kar); else box(W - 0.4, 0.035, 0.02, material("edelstahl"), 0, sy + 0.3, glas[1][0] - 0.345, kar); // Zierleiste Holz/Alu
        const oled = new THREE.MeshBasicMaterial({ color: new THREE.Color(0x4a8ae8).multiplyScalar(1.3), toneMapped: false }); const disp = box(0.42, 0.14, 0.012, oled, 0.12, sy + 0.5, glas[1][0] - 0.32, kar); disp.rotation.x = -0.35; const kombi = box(0.3, 0.1, 0.012, oled, -0.4, sy + 0.47, glas[1][0] - 0.28, kar); kombi.rotation.x = -0.25; // Displays
        box(0.22, 0.2, 0.7, material("edelstahl"), 0, sy + 0.02, reihen[0] + 0.05, kar); const wahl = cyl(0.02, 0.025, 0.08, M(0x1a1a1a, { roughness: 0.4 }), 0, sy + 0.16, reihen[0] + 0.2, kar, 12); // Mittelkonsole + Wählhebel
        for (const vx of [-0.55, -0.15, 0.15, 0.55]) for (let k = 0; k < 4; k++) box(0.12, 0.008, 0.02, M(0x111111), vx, sy + 0.38 + k * 0.018, glas[1][0] - 0.345, kar); // Lüftungsdüsen
        if (o.ambiente) { const amb = new THREE.MeshBasicMaterial({ color: new THREE.Color(o.ambiente).multiplyScalar(2.5), toneMapped: false }); box(W - 0.4, 0.008, 0.008, amb, 0, sy + 0.23, glas[1][0] - 0.345, kar); for (const sx of [-1, 1]) box(0.008, 0.008, glas[1][0] - glas[0][0] - 0.3, amb, sx * (W / 2 - 0.12), sy + 0.2, (glas[1][0] + glas[0][0]) / 2, kar); const al = new THREE.PointLight(o.ambiente, 0.6, 2.2, 2); al.position.set(0, sy + 0.4, (glas[1][0] + glas[0][0]) / 2); kar.add(al); }
        box(W - 0.3, 0.01, glas[1][0] - glas[0][0], material("mikrofaser", { farbe: 0x1a1a1c, wiederholen: [3, 3] }), 0, body[0][1] + 0.2, (glas[1][0] + glas[0][0]) / 2, kar); // Fußmatten
        const lenk = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.024, 12, 32), material("leder", { farbe: 0x1a1a1a })); lenk.position.set(-0.4, sy + 0.45, glas[1][0] - 0.45); lenk.rotation.x = -0.4; kar.add(lenk); const lnabe = cyl(0.06, 0.06, 0.03, M(0x1a1a1c), -0.4, sy + 0.45, glas[1][0] - 0.45, kar, 16); lnabe.rotation.x = Math.PI / 2 - 0.4; box(0.3, 0.02, 0.02, M(0x1a1a1c), -0.4, sy + 0.45, glas[1][0] - 0.45, kar).rotation.x = -0.4;
        // Front: Scheinwerfer (Basis-Material für autoPlus), Kühlergrill je Typ, Stoßfänger, Nebelleuchten
        const licht = new THREE.MeshBasicMaterial({ color: 0xfff6e0 }), rueck = new THREE.MeshBasicMaterial({ color: 0xc81a1a });
        const fy = body[2][1] + 0.02, fH = K.kastig ? 0.2 : 0.11;
        for (const sx of [-1, 1]) {
          if (K.kastig) { const sl = cyl(0.11, 0.11, 0.05, licht, sx * 0.66, fy - 0.02, zf + 0.01, kar, 24); sl.rotation.x = Math.PI / 2; } else box(0.4, fH, 0.05, licht, sx * 0.6, fy, zf + 0.0, kar);
          box(0.42, 0.012, 0.06, M(0xf2f6ff, { emissive: 0xffffff, emissiveIntensity: 0.4 }), sx * 0.6, fy + fH / 2 + 0.008, zf - 0.01, kar); // LED-Tagfahrlicht
          box(K.kastig ? 0.25 : 0.38, 0.1, 0.05, rueck, sx * 0.62, body[body.length - 1][1] + 0.08, zh - 0.0, kar);
          cyl(0.04, 0.04, 0.03, M(0xf8f8f0, { emissive: 0xffffff, emissiveIntensity: 0.1 }), sx * 0.68, body[0][1] + 0.12, zf + 0.04, kar, 16).rotation.x = Math.PI / 2;
        }
        const grill = pick(["waben", "quer", "niere"]), gM = M(0x1a1a1c, { roughness: 0.5, metalness: 0.4 });
        if (grill === "niere" && !K.kastig) for (const sx of [-1, 1]) { box(0.2, 0.16, 0.04, gM, sx * 0.12, fy - 0.06, zf + 0.02, kar); for (let k = 0; k < 6; k++) box(0.012, 0.15, 0.05, chrom, sx * 0.12 - 0.08 + k * 0.032, fy - 0.06, zf + 0.025, kar); }
        else { box(K.kastig ? 0.9 : 0.75, 0.18, 0.04, gM, 0, fy - 0.07, zf + 0.02, kar); for (let k = 0; k < (grill === "quer" ? 4 : 3); k++) box(K.kastig ? 0.88 : 0.73, 0.012, 0.05, grill === "quer" ? chrom : gM, 0, fy - 0.14 + k * 0.045, zf + 0.025, kar);
          if (grill === "waben") for (let k = 0; k < 10; k++) box(0.01, 0.17, 0.05, M(0x2a2a2c), -0.34 + k * 0.075, fy - 0.07, zf + 0.025, kar); }
        box(W + 0.02, 0.18, 0.14, K.beplankung ? dunkel : lack, 0, body[0][1] + 0.05, zf + 0.02, kar); box(W + 0.02, 0.18, 0.14, K.beplankung ? dunkel : lack, 0, body[0][1] + 0.05, zh - 0.02, kar);
        box(W * 0.6, 0.06, 0.1, dunkel, 0, body[0][1] - 0.02, zh + 0.02, kar); // Diffusor
        // Kennzeichen, Auspuff, Antenne, Scheibenwischer, Ersatzrad
        const kz = new THREE.MeshStandardMaterial({ map: kennzeichenTex(o.kennzeichen ?? KENNZ[Math.floor(r() * KENNZ.length)]), roughness: 0.4, ...PO });
        for (const sz of [1, -1]) { const p = new THREE.Mesh(new THREE.PlaneGeometry(0.52, 0.115), kz); p.position.set(0, body[0][1] + 0.12 + (sz < 0 ? 0.12 : 0), sz > 0 ? zf + 0.1 : zh - 0.1); if (sz < 0) p.rotation.y = Math.PI; kar.add(p); }
        const doppelRohr = r() < 0.4 || typ === "coupe" || typ === "targa"; const rohre = doppelRohr ? [-0.55, 0.55] : [-0.55];
        rohre.forEach((xx) => { const rr = cyl(0.04, 0.04, 0.16, chrom, xx, body[0][1] - 0.02, zh - 0.02, kar, 16); rr.rotation.x = Math.PI / 2; const in2 = cyl(0.03, 0.03, 0.17, M(0x050505), xx, body[0][1] - 0.02, zh - 0.025, kar, 12); in2.rotation.x = Math.PI / 2; });
        if (!K.offen) { const fin = box(0.05, 0.06, 0.18, lack, 0, glas[3][1] + 0.1, glas[3][0] + 0.15, kar); }
        for (const sx of [-0.35, 0.35]) { const wi = box(0.6, 0.014, 0.02, gummiM, sx, glas[1][1] + 0.03, glas[1][0] - 0.02, kar); wi.rotation.z = sx > 0 ? 0.08 : -0.08; }
        if (typ === "gelaende") { const ers = reifenRad(kar, 0, zh - 0.28, 0.36, 0.26, "offroad", 0x2a2a2c); ers.rotation.y = Math.PI / 2; ers.position.y = 1.0; }
        // Räder
        const rR = K.r, rW = typ === "coupe" || typ === "targa" ? 0.26 : 0.23, fe = o.felge ?? (K.alt ? "stahl" : typ === "gelaende" ? "offroad" : pick(["speichen5", "vielspeichen", "doppelspeichen", "turbine", r() < 0.3 ? "stahl" : "speichen5"]));
        const feC = o.felgenFarbe ?? (fe === "stahl" ? 0x3a3c40 : pick([0xc8ccd0, 0xc8ccd0, 0x2a2c30, 0x5a5e64, 0xc8a050])), sattel = r() < 0.3 ? pick([0xc82a1a, 0xd8b020, 0x2a5aa8]) : 0x4a4c50;
        const achse = L / 2 - (K.kastig ? 0.75 : 0.78) - (d ? 0 : 0);
        const wheels = [[-1, 1], [1, 1], [-1, -1], [1, -1]].map(([sx, sz]) => reifenRad(g, sx * (W / 2 - 0.12), sz * achse + (zf + zh) / 2, rR, rW, fe, feC, sattel));
        // Radläufe (dunkle Bögen)
        wheels.forEach((wh) => { const bo = new THREE.Mesh(new THREE.TorusGeometry(rR + 0.06, 0.04, 6, 20, Math.PI), dunkel); bo.rotation.y = Math.PI / 2; bo.position.set(wh.position.x + Math.sign(wh.position.x) * 0.08, rR, wh.position.z); kar.add(bo); });
        if (carbonM) { box(0.8, 0.012, 0.9, carbonM, 0, body[3] ? body[3][1] + 0.01 : 0.9, zf - 0.6, kar); for (const sx of [-1, 1]) box(0.13, 0.095, 0.2, carbonM, sx * (W / 2 + 0.071), glas[1][1] + 0.08, glas[1][0] - 0.15, kar); } // Carbon-Haube/Spiegel
        if (o.unterboden) { const ug = box(W - 0.3, 0.02, L - 1.2, new THREE.MeshBasicMaterial({ color: new THREE.Color(o.unterboden).multiplyScalar(2.5), toneMapped: false }), 0, 0.14, (zf + zh) / 2, kar); const ul = new THREE.PointLight(o.unterboden, 2.5, 4, 2); ul.position.set(0, 0.1, (zf + zh) / 2); kar.add(ul); }
        if (K.alt) { const chromM = M(0xe8ecf0, { metalness: 1, roughness: 0.12 }); for (const zz of [zf + 0.08, zh - 0.08]) { const st = cyl(0.07, 0.07, W + 0.12, chromM, 0, body[0][1] + 0.12, zz, kar, 16); st.rotation.z = Math.PI / 2; } // Chromstoßstangen
          for (const sx of [-1, 1]) { const kotf = new THREE.Mesh(new THREE.SphereGeometry(0.46, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), lack); kotf.scale.set(0.42, 0.85, 1.3); kotf.position.set(sx * (W / 2 - 0.1), body[0][1] + 0.05, achse + (zf + zh) / 2); kotf.castShadow = true; kar.add(kotf); const k2 = kotf.clone(); k2.position.z = -achse + (zf + zh) / 2; kar.add(k2);
            const sw = cyl(0.13, 0.13, 0.08, M(0xfff6e0, { emissive: 0xfff0d0, emissiveIntensity: 0.15 }), sx * 0.62, body[2][1] - 0.02, zf - 0.02, kar, 24); sw.rotation.x = Math.PI / 2; const ring = new THREE.Mesh(new THREE.TorusGeometry(0.135, 0.02, 8, 24), chromM); ring.position.set(sx * 0.62, body[2][1] - 0.02, zf + 0.02); kar.add(ring); }
          wheels.forEach((wh) => { const ww = new THREE.Mesh(new THREE.TorusGeometry(K.r * 0.62, K.r * 0.1, 8, 32), M(0xf2f2ee, { roughness: 0.6 })); ww.rotation.y = Math.PI / 2; ww.position.x = Math.sign(wh.position.x) * 0.1; wh.add(ww); }); } // runde Scheinwerfer, Weißwandreifen
        kar.position.y = K.tief ? -0.02 : 0;
        g.userData = { wheels, L, karosse: kar, rR, typ, felgenFertig: true, details: true, auspuff: rohre.map((xx) => new THREE.Vector3(xx, body[0][1] - 0.02, zh - 0.12)), phase: r() * 6.28 };
        return g;
      }
      // Fahren: Räder drehen sich passend zur Strecke, Karosserie federt leicht (Nicken, Wanken, Fahrbahnunebenheiten)
      function fahren(car, T, strecke, o = {}) {
        const u = car.userData; (u.wheels || []).forEach((w) => (w.rotation.x = strecke / (u.rR || 0.33)));
        if (!u.karosse) return; const k = T + u.phase, uneben = o.uneben ?? 1;
        u.karosse.position.y = (Math.sin(k * 7.3) * 0.004 + Math.sin(k * 13.1) * 0.002) * uneben + (u.karosse.userData.y0 ?? (u.karosse.userData.y0 = u.karosse.position.y));
        u.karosse.rotation.x = Math.sin(k * 2.1) * 0.004 * uneben + (o.bremsen ? 0.015 : 0) - (o.gas ? 0.01 : 0); u.karosse.rotation.z = Math.sin(k * 1.7) * 0.004 * uneben + (o.kurve ?? 0) * 0.03;
      }
      // Abgase: weiche graue Wölkchen am Auspuff (kalt am Morgen/Winter stärker: o.staerke)
      function abgas(car, seed = 1, o = {}) {
        const u = car.userData, list = (u.auspuff || [new THREE.Vector3(-0.55, 0.3, -u.L / 2)]).map((p, i) =>
          particles(car, o.n ?? 26, seed * 7 + i, { x: [p.x - 0.02, p.x + 0.02], y: [p.y, p.y + 0.02], z: [p.z, p.z - 0.02], v: [0.12, 0.25, 0.1], drift: [0.05, 0, -(o.wind ?? 0.6)], life: o.life ?? 1.8, color: o.farbe ?? 0xb8bcc4, size: 0.28, opacity: (o.staerke ?? 0.35) }));
        return { update(T) { list.forEach((p) => p.update(T)); } };
      }
