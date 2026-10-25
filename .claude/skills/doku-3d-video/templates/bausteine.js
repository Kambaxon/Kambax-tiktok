      // ===== Bausteine v1: Fahrzeuge, Häuser, Straßen, Natur (braucht: rng, canvasTex, box, cyl, M) =====
      const TEX = {};
      function texNoise(key, base, var1, var2, n = 1800, sz = 3, w = 256) {
        if (TEX[key]) return TEX[key];
        const t = canvasTex(w, w, (g) => { const q = rng(key.length * 97); g.fillStyle = base; g.fillRect(0, 0, w, w); for (let i = 0; i < n; i++) { g.fillStyle = q() < 0.5 ? var1 : var2; g.fillRect(q() * w, q() * w, sz, sz); } });
        t.wrapS = t.wrapT = THREE.RepeatWrapping; TEX[key] = t; return t;
      }
      function texAsphalt() {
        if (TEX.asphalt) return TEX.asphalt;
        const t = canvasTex(512, 512, (g) => { const q = rng(11); g.fillStyle = "#3e4044"; g.fillRect(0, 0, 512, 512);
          for (let i = 0; i < 9000; i++) { const v = 50 + q() * 40; g.fillStyle = `rgb(${v},${v + 1},${v + 4})`; g.fillRect(q() * 512, q() * 512, 2, 2); }
          g.strokeStyle = "rgba(20,20,22,.55)"; g.lineWidth = 1.5; for (let i = 0; i < 7; i++) { let x = q() * 512, y = q() * 512; g.beginPath(); g.moveTo(x, y); for (let k = 0; k < 9; k++) { x += (q() - 0.5) * 50; y += (q() - 0.5) * 50; g.lineTo(x, y); } g.stroke(); }
          g.fillStyle = "rgba(30,30,32,.5)"; for (let i = 0; i < 3; i++) g.fillRect(q() * 460, q() * 460, 30 + q() * 60, 20 + q() * 40); });
        t.wrapS = t.wrapT = THREE.RepeatWrapping; TEX.asphalt = t; return t;
      }
      function texPflaster(col = "#a8a298") {
        const key = "pfl" + col; if (TEX[key]) return TEX[key];
        const t = canvasTex(256, 256, (g) => { const q = rng(5); g.fillStyle = "#7c776e"; g.fillRect(0, 0, 256, 256);
          for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) { const c = new THREE.Color(col).offsetHSL(0, 0, (q() - 0.5) * 0.06); g.fillStyle = "#" + c.getHexString(); g.fillRect(x * 32 + 1.5 + (y % 2) * 16, y * 32 + 1.5, 29, 29); } });
        t.wrapS = t.wrapT = THREE.RepeatWrapping; TEX[key] = t; return t;
      }
      function texZiegel(col = "#9a4a34") {
        const key = "zie" + col; if (TEX[key]) return TEX[key];
        const t = canvasTex(256, 256, (g) => { const q = rng(7); g.fillStyle = "#5a2a1e"; g.fillRect(0, 0, 256, 256);
          for (let y = 0; y < 16; y++) for (let x = 0; x < 10; x++) { const c = new THREE.Color(col).offsetHSL(0, 0, (q() - 0.5) * 0.08); g.fillStyle = "#" + c.getHexString(); g.beginPath(); g.ellipse(x * 26 + (y % 2) * 13 + 13, y * 16 + 10, 12, 9, 0, 0, Math.PI); g.fill(); } });
        t.wrapS = t.wrapT = THREE.RepeatWrapping; TEX[key] = t; return t;
      }
      const PO = { polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }; // für Markierungen/Decals

      // ---------- Fahrzeuge ----------
      const LACK = [0xc8302a, 0xf2f2f0, 0x1e2a44, 0x2a2a2c, 0x8a9aa8, 0x2f6a4a, 0xd8a838, 0x5a6a7a, 0x7a1a2a, 0x3a5a9a];
      function extrudeSide(points, width, mat, bevel = 0.05) {
        const sh = new THREE.Shape(); sh.moveTo(points[0][0], points[0][1]); for (let i = 1; i < points.length; i++) sh.lineTo(points[i][0], points[i][1]); sh.closePath();
        const geo = new THREE.ExtrudeGeometry(sh, { depth: width - bevel * 2, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 3, curveSegments: 8 });
        geo.translate(0, 0, -(width - bevel * 2) / 2); geo.rotateY(Math.PI / 2); // Länge entlang z
        const m = new THREE.Mesh(geo, mat); m.castShadow = true; m.receiveShadow = true; return m;
      }
      function rad(g, x, z, r = 0.33, w = 0.22) {
        const wheel = new THREE.Group(); wheel.position.set(x, r, z); g.add(wheel);
        const tire = cyl(r, r, w, M(0x161616, { roughness: 0.9 }), 0, 0, 0, wheel, 24); tire.rotation.z = Math.PI / 2;
        const rim = cyl(r * 0.62, r * 0.62, w + 0.02, M(0xc8ccd0, { metalness: 0.8, roughness: 0.3 }), 0, 0, 0, wheel, 20); rim.rotation.z = Math.PI / 2;
        const hub = cyl(r * 0.2, r * 0.2, w + 0.04, M(0x6a6e72, { metalness: 0.7, roughness: 0.4 }), 0, 0, 0, wheel, 12); hub.rotation.z = Math.PI / 2;
        return wheel;
      }
      function auto(seed, typ = "limo", farbe) {
        const r = rng(seed * 31 + 7), g = new THREE.Group(); const lack = M(farbe ?? LACK[Math.floor(r() * LACK.length)], { roughness: 0.32, metalness: 0.35 });
        const glas = new THREE.MeshStandardMaterial({ color: 0x2a3a48, roughness: 0.04, metalness: 0.4, transparent: true, opacity: 0.55, depthWrite: false }), dunkel = M(0x1c1c1e, { roughness: 0.7 }), chrom = M(0xd8dce0, { metalness: 0.9, roughness: 0.25 });
        const innen = (zFront, zBack, sitzH = 0.62) => { const sitz = M([0x2a2a2c, 0x5a4a3a, 0x3a3a4a][Math.floor(r() * 3)], { roughness: 0.8 }); for (const zz of [zFront, zBack]) for (const sx of (zz === zFront ? [-0.4, 0.4] : [-0.42, 0, 0.42])) { if (zz === zBack && sx === 0) { box(1.3, 0.18, 0.5, sitz, 0, sitzH, zz, g); box(1.3, 0.5, 0.12, sitz, 0, sitzH + 0.3, zz - 0.25, g); break; } box(0.48, 0.16, 0.5, sitz, sx, sitzH, zz, g); box(0.48, 0.55, 0.12, sitz, sx, sitzH + 0.32, zz - 0.27, g); box(0.26, 0.14, 0.1, sitz, sx, sitzH + 0.66, zz - 0.29, g); } box(W - 0.3, 0.2, 0.4, M(0x1e1e20), 0, sitzH + 0.28, zFront + 0.75, g); const lenk = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.02, 8, 24), M(0x111111)); lenk.position.set(-0.4, sitzH + 0.42, zFront + 0.5); lenk.rotation.x = -0.4; g.add(lenk); };
        const licht = new THREE.MeshBasicMaterial({ color: 0xfff6e0 }), rueck = new THREE.MeshBasicMaterial({ color: 0xc81a1a });
        let L, W = 1.78, wheels;
        if (typ === "limo" || typ === "kleinwagen") {
          L = typ === "limo" ? 4.6 : 3.7;
          const body = typ === "limo" ? [[-2.3, 0.3], [2.3, 0.3], [2.32, 0.62], [2.0, 0.82], [1.0, 0.92], [-1.6, 0.94], [-2.3, 0.86]] : [[-1.85, 0.3], [1.85, 0.3], [1.86, 0.62], [1.5, 0.84], [0.8, 0.94], [-1.8, 0.96], [-1.86, 0.7]];
          const cabin = typ === "limo" ? [[-1.45, 0.9], [0.95, 0.9], [0.35, 1.38], [-0.95, 1.4], [-1.55, 0.95]] : [[-1.7, 0.92], [0.75, 0.92], [0.15, 1.42], [-1.55, 1.45], [-1.78, 1.0]];
          g.add(extrudeSide(body, W, lack, 0.06));
          const cab = extrudeSide(cabin, W - 0.16, glas, 0.03); g.add(cab);
          const roofP = typ === "limo" ? [[-0.95, 1.37], [0.36, 1.35], [0.3, 1.43], [-0.95, 1.45]] : [[-1.55, 1.42], [0.16, 1.39], [0.1, 1.47], [-1.55, 1.5]];
          g.add(extrudeSide(roofP, W - 0.12, lack, 0.025));
          const strebe = (z1, y1, z2, y2, x) => { const a = new THREE.Vector3(x, y1, z1), b2 = new THREE.Vector3(x, y2, z2); const len = a.distanceTo(b2); const m = box(0.07, len, 0.07, lack, 0, 0, 0, g); m.position.copy(a).add(b2).multiplyScalar(0.5); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b2.clone().sub(a).normalize()); };
          const cab0 = cabin[0], cab1 = cabin[1], cab2 = cabin[2], cab3 = cabin[3];
          for (const sx of [-1, 1]) { const x = sx * (W / 2 - 0.1); strebe(cab1[0], cab1[1], cab2[0], cab2[1], x); strebe(cab0[0], cab0[1], cab3[0], cab3[1], x); strebe(typ === "limo" ? -0.3 : -0.6, 0.9, typ === "limo" ? -0.3 : -0.6, 1.4, x); strebe(cab3[0], cab3[1] - 0.02, cab2[0], cab2[1] - 0.02, x); }
          for (const sx of [-1, 1]) { box(0.02, 0.5, 0.012, dunkel, sx * (W / 2 + 0.005), 0.62, typ === "limo" ? -0.3 : -0.6, g); const griff = box(0.03, 0.03, 0.14, chrom, sx * (W / 2 + 0.01), 0.78, typ === "limo" ? 0.2 : 0.0, g); }
          innen(typ === "limo" ? 0.15 : -0.1, typ === "limo" ? -0.95 : -1.05, 0.5);
          wheels = [rad(g, -W / 2 + 0.1, L / 2 - 0.75), rad(g, W / 2 - 0.1, L / 2 - 0.75), rad(g, -W / 2 + 0.1, -L / 2 + 0.75), rad(g, W / 2 - 0.1, -L / 2 + 0.75)];
          box(W + 0.02, 0.16, 0.14, dunkel, 0, 0.36, L / 2 + 0.02, g); box(W + 0.02, 0.16, 0.14, dunkel, 0, 0.36, -L / 2 - 0.02, g);
          for (const sx of [-1, 1]) { const hl = box(0.34, 0.11, 0.04, licht, sx * 0.6, 0.66, L / 2 + 0.03, g); const tl = box(0.32, 0.1, 0.04, rueck, sx * 0.62, 0.72, -L / 2 - 0.03, g); }
          box(0.6, 0.12, 0.03, chrom, 0, 0.5, L / 2 + 0.06, g); // Kühlergrill
          for (const sx of [-1, 1]) { const mir = box(0.14, 0.09, 0.2, lack, sx * (W / 2 + 0.06), 1.0, typ === "limo" ? 0.85 : 0.65, g); }
        } else if (typ === "transporter") {
          L = 5.2; W = 1.95;
          g.add(extrudeSide([[-2.6, 0.32], [2.6, 0.32], [2.62, 0.8], [2.2, 1.4], [1.7, 2.3], [-2.6, 2.35]], W, lack, 0.07));
          g.add(extrudeSide([[1.65, 1.5], [2.15, 1.45], [1.72, 2.2], [1.6, 2.2]], W + 0.02, glas, 0.02));
          for (const sx of [-1, 1]) box(0.02, 0.5, 0.9, glas, sx * (W / 2 + 0.01), 1.75, 1.25, g);
          wheels = [rad(g, -W / 2 + 0.12, 1.85, 0.36), rad(g, W / 2 - 0.12, 1.85, 0.36), rad(g, -W / 2 + 0.12, -1.75, 0.36), rad(g, W / 2 - 0.12, -1.75, 0.36)];
          for (const sx of [-1, 1]) { box(0.3, 0.14, 0.04, licht, sx * 0.65, 0.95, L / 2 + 0.04, g); box(0.18, 0.4, 0.04, rueck, sx * 0.8, 1.3, -L / 2 - 0.04, g); }
          box(W + 0.02, 0.2, 0.14, dunkel, 0, 0.42, L / 2 + 0.03, g);
        } else if (typ === "lkw") {
          L = 8; W = 2.4;
          g.add(extrudeSide([[2.2, 0.5], [4.0, 0.5], [4.05, 1.4], [3.8, 2.9], [2.2, 2.95]], W, lack, 0.08));
          g.add(extrudeSide([[3.75, 1.9], [4.0, 1.5], [3.95, 1.45], [3.72, 2.75]], W - 0.1, glas, 0.02));
          box(W, 3.0, 5.8, M(0xe8e8e4, { roughness: 0.6 }), 0, 2.2, -1.0, g); box(W + 0.02, 0.3, 6.0, dunkel, 0, 0.6, -1.0, g);
          wheels = [rad(g, -W / 2 + 0.15, 3.0, 0.5, 0.35), rad(g, W / 2 - 0.15, 3.0, 0.5, 0.35), rad(g, -W / 2 + 0.15, -2.5, 0.5, 0.35), rad(g, W / 2 - 0.15, -2.5, 0.5, 0.35), rad(g, -W / 2 + 0.15, -3.6, 0.5, 0.35), rad(g, W / 2 - 0.15, -3.6, 0.5, 0.35)];
          for (const sx of [-1, 1]) box(0.3, 0.15, 0.04, licht, sx * 0.85, 1.0, 4.08, g);
        } else if (typ === "bus") {
          L = 11; W = 2.5;
          g.add(extrudeSide([[-5.5, 0.35], [5.5, 0.35], [5.55, 2.9], [5.3, 3.1], [-5.5, 3.1]], W, lack, 0.1));
          for (const sx of [-1, 1]) box(0.02, 0.95, 9.6, glas, sx * (W / 2 + 0.01), 2.25, -0.2, g);
          box(W - 0.2, 1.3, 0.02, glas, 0, 2.1, 5.58, g);
          wheels = [rad(g, -W / 2 + 0.15, 3.6, 0.5, 0.3), rad(g, W / 2 - 0.15, 3.6, 0.5, 0.3), rad(g, -W / 2 + 0.15, -3.3, 0.5, 0.3), rad(g, W / 2 - 0.15, -3.3, 0.5, 0.3)];
          for (const sx of [-1, 1]) box(0.3, 0.15, 0.04, licht, sx * 0.9, 0.85, 5.58, g);
        }
        g.userData = { wheels, L }; return g;
      }
      function fahrrad(seed) {
        const r = rng(seed), g = new THREE.Group(); const rahmen = M(LACK[Math.floor(r() * LACK.length)], { metalness: 0.5, roughness: 0.4 });
        for (const z of [-0.52, 0.52]) { const w = new THREE.Mesh(new THREE.TorusGeometry(0.33, 0.022, 8, 28), M(0x161616)); w.rotation.y = Math.PI / 2; w.position.set(0, 0.35, z); w.castShadow = true; g.add(w); for (let k = 0; k < 6; k++) { const sp = cyl(0.004, 0.004, 0.64, M(0xcccccc), 0, 0.35, z, g, 4); sp.rotation.x = k / 6 * Math.PI; } }
        const bar = (x1, y1, z1, x2, y2, z2) => { const a = new THREE.Vector3(x1, y1, z1), b = new THREE.Vector3(x2, y2, z2); const l = a.distanceTo(b); const c = cyl(0.02, 0.02, l, rahmen, 0, 0, 0, g, 8); c.position.copy(a).add(b).multiplyScalar(0.5); c.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize()); };
        bar(0, 0.35, -0.52, 0, 0.75, -0.1); bar(0, 0.75, -0.1, 0, 0.75, 0.42); bar(0, 0.35, -0.52, 0, 0.36, 0.0); bar(0, 0.36, 0.0, 0, 0.75, -0.1); bar(0, 0.36, 0.0, 0, 0.75, 0.42); bar(0, 0.35, 0.52, 0, 0.9, 0.45);
        box(0.12, 0.04, 0.24, M(0x1a1a1a), 0, 0.86, -0.12, g); box(0.5, 0.025, 0.025, M(0x2a2a2a), 0, 0.92, 0.45, g);
        return g;
      }

      // ---------- Häuser ----------
      const PUTZ = ["#e8dcc4", "#d8c4a4", "#c9a98a", "#e4e0d6", "#b8c4b8", "#d6b8a8", "#c8ccd4", "#e2d2a8", "#a8b4c4"];
      function fenster(parent, x, y, z, w, h, o = {}) { // x,y,z = Mitte auf der Fassadenfläche (Fassade zeigt nach +z)
        const rahmenM = M(o.rahmen ?? 0xf4f2ec, { roughness: 0.6 }), glasM = M(0x2a3a4a, { roughness: 0.08, metalness: 0.5, emissive: o.licht ? 0xffc870 : 0x000000, emissiveIntensity: o.licht ? 0.7 : 0 });
        box(w, h, 0.04, glasM, x, y, z + 0.02, parent);
        box(w + 0.1, 0.06, 0.08, rahmenM, x, y + h / 2 + 0.03, z + 0.04, parent); box(w + 0.1, 0.06, 0.08, rahmenM, x, y - h / 2 - 0.03, z + 0.04, parent);
        box(0.06, h, 0.08, rahmenM, x - w / 2 - 0.02, y, z + 0.04, parent); box(0.06, h, 0.08, rahmenM, x + w / 2 + 0.02, y, z + 0.04, parent);
        box(0.04, h, 0.06, rahmenM, x, y, z + 0.045, parent); box(w, 0.04, 0.06, rahmenM, x, y + h * 0.15, z + 0.045, parent);
        box(w + 0.24, 0.06, 0.2, M(0xd8d2c4), x, y - h / 2 - 0.09, z + 0.1, parent); // Fensterbank
        if (o.laden) { const lm = M(o.laden, { roughness: 0.7 }); for (const sx of [-1, 1]) { const l = box(w * 0.5, h + 0.04, 0.04, lm, x + sx * (w * 0.75 + 0.05), y, z + 0.03, parent); for (let k = 0; k < 6; k++) box(w * 0.46, 0.02, 0.02, M(new THREE.Color(o.laden).offsetHSL(0, 0, -0.08).getHex()), x + sx * (w * 0.75 + 0.05), y - h / 2 + 0.1 + k * h / 6, z + 0.06, parent); } }
        if (o.blumen) { box(w, 0.14, 0.16, M(0x8a5a3a), x, y - h / 2 - 0.03, z + 0.2, parent); for (let k = 0; k < 5; k++) { const b = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6), M([0xd8304a, 0xf2c83a, 0xe86aa8, 0xffffff][k % 4])); b.position.set(x - w / 2 + 0.1 + k * (w - 0.2) / 4, y - h / 2 + 0.08, z + 0.2); parent.add(b); } }
      }
      function dach(parent, w, d, h, y, z0, col = "#9a4a34") { // Satteldach, First entlang x
        const sh = new THREE.Shape(); sh.moveTo(-d / 2 - 0.3, 0); sh.lineTo(d / 2 + 0.3, 0); sh.lineTo(0, h); sh.closePath();
        const geo = new THREE.ExtrudeGeometry(sh, { depth: w + 0.5, bevelEnabled: false }); geo.translate(0, 0, -(w + 0.5) / 2); geo.rotateY(Math.PI / 2);
        const t = texZiegel(col).clone(); t.needsUpdate = true; t.repeat.set(w / 2.2, d / 2.4);
        const m = new THREE.Mesh(geo, [M(0xffffff, { map: t, roughness: 0.8 }), M(0xffffff, { map: t, roughness: 0.8 })]); m.position.set(0, y, z0); m.castShadow = true; m.receiveShadow = true; parent.add(m);
        return m;
      }
      function altbau(seed, w = 12, etagen = 4, o = {}) { // Fassade zeigt nach +z, Mitte unten bei (0,0,0)
        const r = rng(seed * 53 + 3), g = new THREE.Group(); const putz = PUTZ[Math.floor(r() * PUTZ.length)]; const d = 10, eh = 3.2, H = etagen * eh + 0.6;
        const t = texNoise("putz" + putz, putz, new THREE.Color(putz).offsetHSL(0, 0, -0.03).getStyle(), new THREE.Color(putz).offsetHSL(0, 0, 0.03).getStyle(), 2600, 2).clone(); t.needsUpdate = true; t.repeat.set(w / 4, H / 4);
        box(w, H, d, M(0xffffff, { map: t, roughness: 0.9 }), 0, H / 2, -d / 2, g);
        box(w, 0.9, d + 0.06, M(new THREE.Color(putz).offsetHSL(0, -0.05, -0.12).getHex(), { roughness: 0.9 }), 0, 0.45, -d / 2, g); // Sockel
        for (let e = 1; e <= etagen; e++) box(w + 0.1, 0.16, 0.2, M(0xf0ece2), 0, e * eh + 0.3, 0.08, g); // Gesimse
        const n = Math.max(2, Math.round(w / 2.6)); const fw = 1.05, fh = 1.6;
        const laden = r() < 0.4 ? [0x3a6a4a, 0x2f4f6f, 0x7a3a2a][Math.floor(r() * 3)] : null;
        for (let e = 1; e < etagen; e++) for (let i = 0; i < n; i++) {
          const x = -w / 2 + w / n * (i + 0.5); fenster(g, x, e * eh + 1.65, 0.02, fw, fh, { laden, licht: o.licht && r() < 0.6, blumen: r() < 0.15 });
          if (e > 1 && i % 3 === 1 && r() < 0.5) { box(fw + 1.2, 0.12, 0.9, M(0xd8d2c4), x, e * eh + 0.82, 0.47, g); for (let k = 0; k < 9; k++) cyl(0.015, 0.015, 0.9, M(0x2a2a2a), x - (fw + 1.1) / 2 + k * (fw + 1.1) / 8, e * eh + 1.33, 0.88, g, 6); box(fw + 1.2, 0.04, 0.04, M(0x2a2a2a), x, e * eh + 1.78, 0.9, g); }
        }
        // Erdgeschoss: Laden oder Haustür
        if (o.geschaeft ?? r() < 0.5) {
          box(w * 0.7, 2.2, 0.04, M(0x22303a, { roughness: 0.08, metalness: 0.5, emissive: o.licht ? 0xffd090 : 0, emissiveIntensity: 0.5 }), -w * 0.1, 1.95, 0.02, g);
          const markise = box(w * 0.74, 0.08, 1.4, M([0xc43a2b, 0x2f6a8a, 0x3a7a4a, 0xd8a838][Math.floor(r() * 4)], { roughness: 0.8 }), -w * 0.1, 3.15, 0.7, g); markise.rotation.x = 0.25;
        } else for (let i = 0; i < n; i++) fenster(g, -w / 2 + w / n * (i + 0.5), 1.9, 0.02, fw, 1.4, { laden });
        const dx = w / 2 - 1.3; box(1.3, 2.4, 0.08, M(0x5a3a24, { roughness: 0.6 }), dx, 1.2 + 0.25, 0.04, g); box(1.5, 0.12, 0.14, M(0xe8e2d6), dx, 2.75, 0.07, g); box(1.6, 0.25, 0.6, M(0x9a9690), dx, 0.12, 0.3, g);
        box(0.08, 0.08, 0.08, M(0xd8b86a, { metalness: 0.8 }), dx + 0.45, 1.4, 0.1, g);
        box(w + 0.3, 0.3, 0.5, M(0xf0ece2), 0, H - 0.15, 0.1, g); // Traufgesims
        dach(g, w, d, 3.2 + r(), H, -d / 2, ["#9a4a34", "#5a5e64", "#7a3a2a", "#4a4e54"][Math.floor(r() * 4)]);
        if (r() < 0.8) { box(0.6, 1.8, 0.6, M(0x8a5a44), w * 0.25, H + 1.8, -d * 0.4, g); }
        // Regenrinne + Fallrohr
        cyl(0.05, 0.05, H, M(0x8a8e92, { metalness: 0.5 }), -w / 2 + 0.15, H / 2, 0.12, g, 8);
        g.userData = { w, H }; return g;
      }
      function einfamilienhaus(seed, o = {}) {
        const r = rng(seed * 61 + 9), g = new THREE.Group(); const putz = PUTZ[Math.floor(r() * PUTZ.length)]; const w = 9, d = 8, H = 5.6;
        box(w, H, d, M(new THREE.Color(putz).getHex(), { roughness: 0.9 }), 0, H / 2, -d / 2, g);
        box(w, 0.5, d + 0.04, M(0x8a8680), 0, 0.25, -d / 2, g);
        const laden = [0x3a6a4a, 0x7a3a2a, 0x2f4f6f, 0xe8e2d6][Math.floor(r() * 4)];
        [[-2.8, 1.6], [2.8, 1.6], [-2.8, 4.3], [0, 4.3], [2.8, 4.3]].forEach(([x, y]) => fenster(g, x, y, 0.02, 1.1, 1.3, { laden, licht: o.licht && r() < 0.5, blumen: r() < 0.3 }));
        box(1.2, 2.2, 0.08, M(0x7a4a2a), 0, 1.6, 0.04, g); box(1.6, 0.1, 1.0, M(0xe8e2d6), 0, 2.85, 0.5, g); box(1.8, 0.3, 1.2, M(0x9a9690), 0, 0.15, 0.6, g);
        dach(g, w, d, 3.8, H, -d / 2, ["#9a4a34", "#5a5e64", "#7a3a2a"][Math.floor(r() * 3)]);
        box(0.7, 2.0, 0.7, M(0x8a5a44), 2.5, H + 2.2, -5, g);
        for (let i = 0; i < 26; i++) { box(0.08, 0.9, 0.04, M(0xf2f0ea), -6.5 + i * 0.52, 0.45, 3.5, g); } box(13.2, 0.06, 0.04, M(0xf2f0ea), 0, 0.75, 3.52, g); box(13.2, 0.06, 0.04, M(0xf2f0ea), 0, 0.3, 3.52, g);
        cyl(0.04, 0.04, 1.1, M(0x2a2a2a), 1.6, 0.55, 3.2, g, 6); box(0.3, 0.25, 0.4, M(0xc8302a), 1.6, 1.15, 3.2, g); // Briefkasten
        return g;
      }

      // ---------- Straße ----------
      function strasse(s, len, o = {}) { // entlang z, Mitte x=0; Fahrbahn 7 m, Gehwege 4 m
        const t = texAsphalt().clone(); t.needsUpdate = true; t.repeat.set(1.5, len / 10);
        box(7, 0.1, len, M(0xffffff, { map: t, roughness: 0.95 }), 0, -0.05, -len / 2 + 10, s);
        const mark = M(0xf2f2ec, Object.assign({ roughness: 0.6 }, PO));
        for (let z = 8; z > -len + 10; z -= 6) box(0.14, 0.012, 3, mark, 0, 0.006, z, s);
        box(0.12, 0.012, len, mark, -3.3, 0.006, -len / 2 + 10, s); box(0.12, 0.012, len, mark, 3.3, 0.006, -len / 2 + 10, s);
        if (o.zebra !== false) for (let i = 0; i < 7; i++) box(0.55, 0.012, 3.2, mark, -3 + i * 1.0, 0.006, o.zebraZ ?? -18, s);
        for (const sx of [-1, 1]) {
          box(0.25, 0.16, len, M(0xb8b4ac, { roughness: 0.8 }), sx * 3.62, 0.08, -len / 2 + 10, s);
          const pt = texPflaster().clone(); pt.needsUpdate = true; pt.repeat.set(4 / 2, len / 2);
          box(3.75, 0.14, len, M(0xffffff, { map: pt, roughness: 0.9 }), sx * 5.62, 0.07, -len / 2 + 10, s);
        }
        for (let z = 2; z > -len + 10; z -= 23) { const g = cyl(0.32, 0.32, 0.02, M(0x3a3a3a, Object.assign({ metalness: 0.6, roughness: 0.6 }, PO)), 1.6, 0.01, z, s, 20); }
      }
      function laterne(s, x, z, seite = 1, an = false) {
        const g = new THREE.Group(); g.position.set(x, 0.14, z); s.add(g); const m = M(0x2e3236, { metalness: 0.5, roughness: 0.5 });
        cyl(0.09, 0.12, 0.5, m, 0, 0.25, 0, g, 10); cyl(0.05, 0.07, 5.2, m, 0, 2.85, 0, g, 10);
        const arm = cyl(0.035, 0.035, 1.2, m, -seite * 0.55, 5.45, 0, g, 8); arm.rotation.z = Math.PI / 2 + seite * 0.12;
        const kopf = box(0.55, 0.14, 0.28, m, -seite * 1.15, 5.38, 0, g); const glas = box(0.45, 0.04, 0.2, new THREE.MeshBasicMaterial({ color: an ? 0xffd890 : 0xcfd6dc }), -seite * 1.15, 5.29, 0, g);
        if (an) { glas.material.toneMapped = false; glas.material.color.set(0xffe6b0);
          const l = new THREE.PointLight(0xffc870, 2.2, 18, 2); l.position.set(-seite * 1.15, 5.0, 0); g.add(l);
          const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: SOFT, color: 0xffc070, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false })); glow.scale.setScalar(1.6); glow.position.set(-seite * 1.15, 5.22, 0); g.add(glow);
          const kegel = new THREE.Mesh(new THREE.ConeGeometry(2.2, 5.0, 24, 1, true), new THREE.MeshBasicMaterial({ color: 0xffc878, transparent: true, opacity: 0.07, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide })); kegel.position.set(-seite * 1.15, 2.7, 0); g.add(kegel); }
        return g;
      }
      function schild(s, x, z, typ = "tempo30", ry = 0) {
        const g = new THREE.Group(); g.position.set(x, 0.14, z); g.rotation.y = ry; s.add(g); cyl(0.035, 0.035, 2.6, M(0x9aa0a6, { metalness: 0.6 }), 0, 1.3, 0, g, 8);
        const t = canvasTex(128, 128, (c) => { if (typ === "tempo30") { c.fillStyle = "#fff"; c.beginPath(); c.arc(64, 64, 60, 0, 7); c.fill(); c.strokeStyle = "#c8201a"; c.lineWidth = 14; c.stroke(); c.fillStyle = "#111"; c.font = "bold 58px sans-serif"; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("30", 64, 68); } else { c.fillStyle = "#f2c500"; c.save(); c.translate(64, 64); c.rotate(Math.PI / 4); c.fillRect(-40, -40, 80, 80); c.strokeStyle = "#fff"; c.lineWidth = 8; c.strokeRect(-40, -40, 80, 80); c.restore(); } });
        const p = new THREE.Mesh(new THREE.CircleGeometry(0.33, 32), new THREE.MeshStandardMaterial({ map: t, transparent: true, roughness: 0.5 })); p.position.set(0, 2.55, 0.04); g.add(p); box(0.5, 0.5, 0.02, M(0x8a9096), 0, 2.55, 0.0, g).scale.set(0.9, 0.9, 1);
        return g;
      }
      function bank(s, x, z, ry = 0) { const g = new THREE.Group(); g.position.set(x, 0.14, z); g.rotation.y = ry; s.add(g); const holz = M(0x8a5a34, { roughness: 0.7 }), eisen = M(0x2a2a2a, { metalness: 0.5 });
        for (let i = 0; i < 4; i++) box(1.8, 0.04, 0.1, holz, 0, 0.45, -0.18 + i * 0.12, g); for (let i = 0; i < 3; i++) box(1.8, 0.1, 0.03, holz, 0, 0.62 + i * 0.13, -0.26, g);
        for (const sx of [-0.8, 0.8]) { box(0.05, 0.45, 0.05, eisen, sx, 0.22, 0.12, g); box(0.05, 0.85, 0.05, eisen, sx, 0.42, -0.25, g); } return g; }
      function muelleimer(s, x, z) { const g = new THREE.Group(); g.position.set(x, 0.14, z); s.add(g); cyl(0.25, 0.22, 0.75, M(0xe86a1a, { roughness: 0.6 }), 0, 0.38, 0, g, 16); cyl(0.27, 0.27, 0.05, M(0x2a2a2a), 0, 0.77, 0, g, 16); cyl(0.04, 0.04, 0.9, M(0x5a5a5a), 0.3, 0.45, 0, g, 6); return g; }

      // ---------- Natur ----------
      function blobGeo(radius, seed, detail = 2) { const geo = new THREE.IcosahedronGeometry(radius, detail); const p = geo.attributes.position, v = new THREE.Vector3(); const q = rng(seed); const ph = [q() * 6, q() * 6, q() * 6];
        const cols = []; for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); const n = 1 + 0.18 * Math.sin(v.x * 3 + ph[0]) * Math.sin(v.y * 3.4 + ph[1]) + 0.1 * Math.sin(v.z * 5 + ph[2]); v.multiplyScalar(n); p.setXYZ(i, v.x, v.y, v.z); const sh = 0.82 + 0.3 * (v.y / radius) + (q() - 0.5) * 0.12; cols.push(sh, sh, sh); }
        geo.setAttribute("color", new THREE.Float32BufferAttribute(cols, 3)); geo.computeVertexNormals(); return geo; }
      function laubbaum(s, x, z, h = 7, seed = 1, o = {}) {
        const r = rng(seed * 17 + 5), g = new THREE.Group(); g.position.set(x, o.y ?? 0, z); s.add(g);
        const rinde = M(o.rinde ?? 0x5a4632, { roughness: 0.95, map: o.rindeMap ?? null }); const blatt = M(o.blatt ?? [0x4a7a34, 0x56883a, 0x3e6a2e, 0x6a8a3a][Math.floor(r() * 4)], { roughness: 0.85, vertexColors: true });
        const tr = cyl(0.13 * h / 7, 0.24 * h / 7, h * 0.55, rinde, 0, h * 0.275, 0, g, 10);
        for (let i = 0; i < 4; i++) { const a = i / 4 * Math.PI * 2 + r(); const br = cyl(0.04 * h / 7, 0.09 * h / 7, h * 0.32, rinde, Math.cos(a) * h * 0.08, h * 0.6, Math.sin(a) * h * 0.08, g, 7); br.rotation.set(Math.sin(a) * 0.7, 0, -Math.cos(a) * 0.7); }
        const n = 7 + Math.floor(r() * 4);
        for (let i = 0; i < n; i++) { const a = r() * Math.PI * 2, rr = r() * h * 0.2, y = h * (0.62 + r() * 0.32); const b = new THREE.Mesh(blobGeo(h * (0.13 + r() * 0.08), seed * 10 + i), blatt); b.position.set(Math.cos(a) * rr, y, Math.sin(a) * rr); b.castShadow = true; b.receiveShadow = true; g.add(b); }
        g.userData.blatt = blatt; return g;
      }
      function nadelbaum(s, x, z, h = 9, seed = 1) {
        const r = rng(seed * 13 + 1), g = new THREE.Group(); g.position.set(x, 0, z); s.add(g); cyl(0.1, 0.18, h * 0.3, M(0x4a3626), 0, h * 0.15, 0, g, 8);
        const m = M([0x264a2e, 0x2e5634, 0x1f4028][Math.floor(r() * 3)], { roughness: 0.9, vertexColors: true });
        for (let i = 0; i < 6; i++) { const rad = h * (0.3 - i * 0.042), hh = h * 0.28; const geo = new THREE.ConeGeometry(rad, hh, 10, 2); const p = geo.attributes.position, v = new THREE.Vector3(), cols = []; for (let k = 0; k < p.count; k++) { v.fromBufferAttribute(p, k); if (v.y < hh * 0.4) { v.x *= 1 + (r() - 0.5) * 0.25; v.z *= 1 + (r() - 0.5) * 0.25; v.y += (r() - 0.5) * 0.15; } p.setXYZ(k, v.x, v.y, v.z); const sh = 0.75 + 0.35 * (v.y / hh + 0.5); cols.push(sh, sh, sh); } geo.setAttribute("color", new THREE.Float32BufferAttribute(cols, 3)); geo.computeVertexNormals();
          const c = new THREE.Mesh(geo, m); c.position.y = h * 0.25 + i * h * 0.12; c.rotation.y = r() * 3; c.castShadow = true; g.add(c); }
        return g;
      }
      function birke(s, x, z, h = 8, seed = 1) {
        const t = canvasTex(32, 256, (c) => { const q = rng(3); c.fillStyle = "#e8e6e0"; c.fillRect(0, 0, 32, 256); for (let i = 0; i < 40; i++) { c.fillStyle = "#2a2622"; c.fillRect(q() * 30, q() * 256, 4 + q() * 14, 2 + q() * 3); } });
        return laubbaum(s, x, z, h, seed, { rinde: 0xffffff, rindeMap: t, blatt: 0x8aaa4a });
      }
      function busch(s, x, z, r0 = 0.8, seed = 1, col = 0x3e6a2e) { const g = new THREE.Group(); g.position.set(x, 0, z); s.add(g); const m = M(col, { roughness: 0.9, vertexColors: true }); const q = rng(seed);
        for (let i = 0; i < 5; i++) { const b = new THREE.Mesh(blobGeo(r0 * (0.55 + q() * 0.35), seed * 7 + i, 1), m); b.position.set((q() - 0.5) * r0, r0 * (0.45 + q() * 0.3), (q() - 0.5) * r0); b.castShadow = true; g.add(b); } return g; }
      function gras(s, x0, z0, w, d, n, seed = 1, o = {}) { // InstancedMesh aus Halmen
        const geo = new THREE.ConeGeometry(0.018, 1, 3, 1); geo.translate(0, 0.5, 0);
        const mat = M(0xffffff, { roughness: 0.9, vertexColors: false }); const mesh = new THREE.InstancedMesh(geo, mat, n); const q = rng(seed); const m4 = new THREE.Matrix4(), qt = new THREE.Quaternion(), e = new THREE.Euler(), sc = new THREE.Vector3(), ps = new THREE.Vector3(), col = new THREE.Color();
        for (let i = 0; i < n; i++) { ps.set(x0 + q() * w, o.y ?? 0, z0 + q() * d); e.set((q() - 0.5) * 0.5, q() * 6, (q() - 0.5) * 0.5); qt.setFromEuler(e); const hh = (o.h ?? 0.18) * (0.6 + q() * 0.8); sc.set(1, hh, 1); m4.compose(ps, qt, sc); mesh.setMatrixAt(i, m4); col.setHSL(0.24 + q() * 0.06, 0.45 + q() * 0.2, 0.26 + q() * 0.14); mesh.setColorAt(i, col); }
        mesh.receiveShadow = true; s.add(mesh); return mesh;
      }
      function blumen(s, x0, z0, w, d, n, seed = 1) {
        const q = rng(seed); const cols = [0xd8304a, 0xf2c83a, 0xffffff, 0xe86aa8, 0x8a5ad8, 0xf28a2a];
        const stem = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.006, 0.006, 0.3, 4).translate(0, 0.15, 0), M(0x3e7a2e), n);
        const head = new THREE.InstancedMesh(new THREE.SphereGeometry(0.03, 8, 6), M(0xffffff, { roughness: 0.6 }), n); const m4 = new THREE.Matrix4(), c = new THREE.Color();
        for (let i = 0; i < n; i++) { const x = x0 + q() * w, z = z0 + q() * d, h = 0.6 + q() * 0.6; m4.makeScale(1, h, 1).setPosition(x, 0, z); stem.setMatrixAt(i, m4); m4.makeTranslation(x, 0.3 * h, z); head.setMatrixAt(i, m4); head.setColorAt(i, c.setHex(cols[Math.floor(q() * cols.length)])); }
        s.add(stem); s.add(head); return head;
      }

      // ---------- Motorrad ----------
      function motorrad(seed) {
        const r = rng(seed * 41 + 3), g = new THREE.Group(); const lack = M(LACK[Math.floor(r() * LACK.length)], { roughness: 0.3, metalness: 0.4 });
        const chrom = M(0xd8dce0, { metalness: 0.9, roughness: 0.2 }), schwarz = M(0x161618, { roughness: 0.6 });
        const w1 = rad(g, 0, 0.72, 0.32, 0.12), w2 = rad(g, 0, -0.72, 0.32, 0.15);
        const tank = new THREE.Mesh(new THREE.SphereGeometry(0.2, 18, 12), lack); tank.scale.set(0.85, 0.7, 1.4); tank.position.set(0, 0.86, 0.22); tank.castShadow = true; g.add(tank);
        box(0.26, 0.09, 0.62, schwarz, 0, 0.84, -0.3, g); box(0.22, 0.12, 0.3, lack, 0, 0.86, -0.68, g);
        box(0.3, 0.3, 0.36, M(0x4a4e52, { metalness: 0.6, roughness: 0.4 }), 0, 0.5, 0.05, g);
        for (let i = 0; i < 4; i++) box(0.34, 0.02, 0.3, M(0x6a6e72, { metalness: 0.7 }), 0, 0.42 + i * 0.05, 0.05, g);
        const aus = cyl(0.045, 0.05, 0.75, chrom, 0.18, 0.36, -0.35, g, 12); aus.rotation.x = Math.PI / 2 - 0.1;
        for (const sx of [-1, 1]) { const gab = cyl(0.025, 0.025, 0.75, chrom, sx * 0.09, 0.62, 0.62, g, 8); gab.rotation.x = -0.35; }
        const lenk = cyl(0.016, 0.016, 0.7, schwarz, 0, 1.05, 0.5, g, 8); lenk.rotation.z = Math.PI / 2;
        const lampe = new THREE.Mesh(new THREE.SphereGeometry(0.08, 14, 10), chrom); lampe.position.set(0, 0.95, 0.66); g.add(lampe);
        const glasL = new THREE.Mesh(new THREE.CircleGeometry(0.065, 16), new THREE.MeshBasicMaterial({ color: 0xfff4d8, toneMapped: false })); glasL.position.set(0, 0.95, 0.735); g.add(glasL);
        box(0.12, 0.05, 0.03, new THREE.MeshBasicMaterial({ color: 0xc81a1a }), 0, 0.88, -0.85, g);
        g.userData = { wheels: [w1, w2] }; return g;
      }

      // ---------- Gelände: uneben, Rasen/Erde/Kies gemalt, Höhenfunktion ----------
      function gelaende(s, w, d, seed = 1, o = {}) {
        const q = rng(seed), ph = [q() * 9, q() * 9, q() * 9, q() * 9];
        const amp = o.amp ?? 0.35;
        const hAt = (x, z) => amp * (Math.sin(x * 0.18 + ph[0]) * Math.cos(z * 0.15 + ph[1]) + 0.5 * Math.sin(x * 0.53 + z * 0.37 + ph[2]) + 0.25 * Math.sin(x * 1.3 - z * 1.1 + ph[3])) + (o.wegZ !== undefined ? 0 : 0);
        const geo = new THREE.PlaneGeometry(w, d, 180, 180); geo.rotateX(-Math.PI / 2);
        const p = geo.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i) + (o.x ?? 0), z = p.getZ(i) + (o.z ?? 0); p.setY(i, hAt(x, z)); } geo.computeVertexNormals();
        // Bodentextur: Rasen mit Erde- und Kiesflecken, optional ein Kiesweg
        const tex = canvasTex(1024, 1024, (g) => { const r2 = rng(seed + 3);
          g.fillStyle = o.grund ?? "#4f6e34"; g.fillRect(0, 0, 1024, 1024);
          for (let i = 0; i < 26000; i++) { const c = new THREE.Color(o.grund ?? "#4f6e34").offsetHSL((r2() - 0.5) * 0.04, (r2() - 0.5) * 0.15, (r2() - 0.5) * 0.12); g.fillStyle = "#" + c.getHexString(); g.fillRect(r2() * 1024, r2() * 1024, 2 + r2() * 3, 2 + r2() * 5); }
          for (let i = 0; i < (o.erde ?? 14); i++) { const x = r2() * 1024, y = r2() * 1024, rr = 20 + r2() * 70; const gr = g.createRadialGradient(x, y, 0, x, y, rr); gr.addColorStop(0, "rgba(92,70,48,.95)"); gr.addColorStop(0.7, "rgba(92,70,48,.6)"); gr.addColorStop(1, "rgba(92,70,48,0)"); g.fillStyle = gr; g.beginPath(); g.arc(x, y, rr, 0, 7); g.fill(); for (let k = 0; k < 120; k++) { g.fillStyle = r2() < 0.5 ? "#6a5238" : "#4a3828"; g.fillRect(x + (r2() - 0.5) * rr, y + (r2() - 0.5) * rr, 2, 2); } }
          if (o.weg) { const wy = 512, ww = o.wegBreite ?? 90; g.fillStyle = "#9a948a"; g.beginPath(); g.moveTo(0, wy - ww / 2); for (let x = 0; x <= 1024; x += 32) g.lineTo(x, wy - ww / 2 + Math.sin(x * 0.01) * 30); for (let x = 1024; x >= 0; x -= 32) g.lineTo(x, wy + ww / 2 + Math.sin(x * 0.01) * 30); g.closePath(); g.fill();
            for (let i = 0; i < 9000; i++) { const x = r2() * 1024; const y = wy + Math.sin(x * 0.01) * 30 + (r2() - 0.5) * ww; const v = 120 + r2() * 80; g.fillStyle = `rgb(${v},${v - 4},${v - 10})`; g.fillRect(x, y, 2 + r2() * 2, 2 + r2() * 2); } }
          for (let i = 0; i < (o.kiesFlecken ?? 6); i++) { const x = r2() * 1024, y = r2() * 1024, rr = 15 + r2() * 40; for (let k = 0; k < 500; k++) { const a = r2() * 7, d2 = r2() * rr; const v = 110 + r2() * 90; g.fillStyle = `rgb(${v},${v - 3},${v - 8})`; g.fillRect(x + Math.cos(a) * d2, y + Math.sin(a) * d2, 2, 2); } } });
        tex.repeat.set(1, 1);
        const mesh = new THREE.Mesh(geo, M(0xffffff, { map: tex, roughness: 0.95 })); mesh.position.set(o.x ?? 0, 0, o.z ?? 0); mesh.receiveShadow = true; s.add(mesh);
        return { mesh, h: (x, z) => hAt(x, z) };
      }
      function kies(s, x0, z0, w, d, n, hfn, seed = 1) {
        const q = rng(seed); const mesh = new THREE.InstancedMesh(new THREE.DodecahedronGeometry(0.03, 0), M(0xffffff, { roughness: 0.85 }), n); const m4 = new THREE.Matrix4(), qt = new THREE.Quaternion(), e = new THREE.Euler(), c = new THREE.Color();
        for (let i = 0; i < n; i++) { const x = x0 + q() * w, z = z0 + q() * d; const sc = 0.5 + q() * 1.6; e.set(q() * 3, q() * 3, q() * 3); qt.setFromEuler(e); m4.compose(new THREE.Vector3(x, (hfn ? hfn(x, z) : 0) + 0.012, z), qt, new THREE.Vector3(sc, sc * 0.6, sc)); mesh.setMatrixAt(i, m4); const v = 0.45 + q() * 0.35; mesh.setColorAt(i, c.setRGB(v, v * 0.97, v * 0.92)); }
        mesh.castShadow = true; mesh.receiveShadow = true; s.add(mesh); return mesh;
      }
      function grasAufGelaende(s, ter, x0, z0, w, d, n, seed = 1, o = {}) { // Halme folgen der Höhe
        const geo = new THREE.ConeGeometry(0.0085, 1, 3, 1); geo.translate(0, 0.5, 0);
        const mesh = new THREE.InstancedMesh(geo, M(0xffffff, { roughness: 0.9 }), n); const q = rng(seed); const m4 = new THREE.Matrix4(), qt = new THREE.Quaternion(), e = new THREE.Euler(), col = new THREE.Color();
        for (let i = 0; i < n; i++) { const x = x0 + q() * w, z = z0 + q() * d; if (o.skip && o.skip(x, z)) { m4.makeScale(0, 0, 0); mesh.setMatrixAt(i, m4); continue; } e.set((q() - 0.5) * 0.6, q() * 6, (q() - 0.5) * 0.6); qt.setFromEuler(e); const hh = (o.h ?? 0.2) * (0.5 + q()); m4.compose(new THREE.Vector3(x, ter.h(x, z) - 0.01, z), qt, new THREE.Vector3(1, hh, 1)); mesh.setMatrixAt(i, m4); col.setHSL(0.22 + q() * 0.08, 0.4 + q() * 0.25, 0.22 + q() * 0.16); mesh.setColorAt(i, col); }
        mesh.receiveShadow = true; s.add(mesh); return mesh;
      }
      function pfuetze(s, x, z, r0 = 0.8, y = 0.01) { const m = new THREE.Mesh(new THREE.CircleGeometry(r0, 28), M(0x2a3440, Object.assign({ roughness: 0.02, metalness: 0.8 }, PO))); m.rotation.x = -Math.PI / 2; m.position.set(x, y, z); m.scale.set(1, 0.65, 1); s.add(m); return m; }

      // ---------- Insekten (deterministisch animiert, update(t)) ----------
      function schmetterlinge(s, cx, cy, cz, rad0, n, seed = 1) {
        const q = rng(seed), list = []; const cols = [0xf2a020, 0xffffff, 0x3a6ad8, 0xd83a3a, 0xf2e04a];
        for (let i = 0; i < n; i++) { const g = new THREE.Group(); s.add(g); const m = new THREE.MeshStandardMaterial({ color: cols[Math.floor(q() * cols.length)], side: THREE.DoubleSide, roughness: 0.6 });
          const wl = new THREE.Mesh(new THREE.CircleGeometry(0.045, 10), m); wl.geometry.translate(-0.045, 0, 0); const wr = wl.clone(); wr.geometry = wl.geometry.clone(); wr.geometry.translate(0.09, 0, 0);
          const pl = new THREE.Group(), pr = new THREE.Group(); pl.add(wl); pr.add(wr); g.add(pl, pr); const bd = new THREE.Mesh(new THREE.CapsuleGeometry(0.006, 0.04, 3, 6), M(0x1a1a1a)); bd.rotation.x = Math.PI / 2; g.add(bd);
          list.push({ g, pl, pr, a: q() * 6, sp: 0.4 + q() * 0.5, rr: rad0 * (0.4 + q() * 0.6), hy: q() }); }
        return { update(t) { list.forEach((b) => { const a = b.a + t * b.sp; b.g.position.set(cx + Math.cos(a) * b.rr, cy + 0.4 * Math.sin(t * 1.7 + b.a) + b.hy * 0.6, cz + Math.sin(a * 1.3) * b.rr); b.g.rotation.y = -a; const f = Math.sin(t * 18 + b.a) * 1.1; b.pl.rotation.z = f; b.pr.rotation.z = -f; }); } };
      }
      function schwarm(s, cx, cy, cz, rad0, n, seed = 1, farbe = 0x1a1a1a) { // Bienen/Fliegen
        const q = rng(seed), list = []; for (let i = 0; i < n; i++) { const m = new THREE.Mesh(new THREE.SphereGeometry(0.008, 6, 4), M(farbe)); m.scale.set(1, 0.8, 1.6); s.add(m); list.push({ m, a: q() * 6, b: q() * 6, sp: 1.5 + q() * 2 }); }
        return { update(t) { list.forEach((f) => { f.m.position.set(cx + Math.sin(t * f.sp + f.a) * rad0 + Math.sin(t * 7.3 + f.b) * 0.05, cy + Math.sin(t * f.sp * 1.3 + f.b) * rad0 * 0.4, cz + Math.cos(t * f.sp * 0.8 + f.a) * rad0); }); } };
      }
      function ball(s, farbe = 0xe8302a) { const m = new THREE.Mesh(new THREE.SphereGeometry(0.11, 20, 14), M(farbe, { roughness: 0.45 })); m.castShadow = true; s.add(m); return m; }

      function regen(s, x0, x1, z0, z1, h, n, seed = 1, o = {}) { // Regen als Streifen (LineSegments), update(t)
        const q = rng(seed), base = []; for (let i = 0; i < n; i++) base.push([x0 + q() * (x1 - x0), q() * h, z0 + q() * (z1 - z0), q()]);
        const pos = new Float32Array(n * 6); const geo = new THREE.BufferGeometry(); geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
        const lines = new THREE.LineSegments(geo, new THREE.LineBasicMaterial({ color: o.farbe ?? 0xb8c8dc, transparent: true, opacity: o.opacity ?? 0.45, depthWrite: false })); lines.frustumCulled = false; s.add(lines);
        const v = o.v ?? 14, len = o.len ?? 0.45, wind = o.wind ?? 0.8;
        return { lines, update(t) { for (let i = 0; i < n; i++) { const b = base[i]; const y = h - ((b[1] + t * v + b[3] * h) % h); const x = b[0] + wind * (h - y) * 0.05; pos[i * 6] = x; pos[i * 6 + 1] = y; pos[i * 6 + 2] = b[2]; pos[i * 6 + 3] = x + wind * len * 0.05; pos[i * 6 + 4] = y + len; pos[i * 6 + 5] = b[2]; } geo.attributes.position.needsUpdate = true; } };
      }
