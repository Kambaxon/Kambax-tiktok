      // ===== Natur v2: Berge, Bergketten, Nebel (braucht: rng, canvasTex, SOFT, nadelbaum aus bausteine.js optional) =====
      function rauschen2(seed) { // deterministisches Value-Noise + fbm + ridged
        const P = new Uint8Array(512), r = rng(seed); for (let i = 0; i < 256; i++) P[i] = i; for (let i = 255; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [P[i], P[j]] = [P[j], P[i]]; } for (let i = 0; i < 256; i++) P[i + 256] = P[i];
        const h = (x, y) => P[(P[x & 255] + y) & 511] / 255, f = (t) => t * t * (3 - 2 * t);
        const vn = (x, y) => { const xi = Math.floor(x), yi = Math.floor(y), xf = f(x - xi), yf = f(y - yi); return (h(xi, yi) * (1 - xf) + h(xi + 1, yi) * xf) * (1 - yf) + (h(xi, yi + 1) * (1 - xf) + h(xi + 1, yi + 1) * xf) * yf; };
        return { vn, fbm(x, y, o = 5) { let a = 0.5, s = 0; for (let i = 0; i < o; i++) { s += a * vn(x, y); x *= 2.03; y *= 2.03; a *= 0.5; } return s; },
          ridge(x, y, o = 6) { let a = 0.5, s = 0, w = 1; for (let i = 0; i < o; i++) { let v = 1 - Math.abs(vn(x, y) * 2 - 1); v *= v * w; w = Math.min(1, v * 2); s += v * a; x *= 2.1; y *= 2.1; a *= 0.5; } return s; } };
      }
      // Gebirge: zerklüftete Grate (ridged noise), Farben nach Höhe und Steilheit: Wiese, Wald, Fels, Geröll, Schnee
      // o: { x, z, breite, tiefe, hoehe, seed, schneegrenze (0..1), baumgrenze (0..1), segs, baeume: n, farben: { wiese, wald, fels, schnee } }
      function berge(s, o = {}) {
        const W = o.breite ?? 600, D = o.tiefe ?? 300, Hm = o.hoehe ?? 140, segs = o.segs ?? 180, N = rauschen2(o.seed ?? 3), r = rng((o.seed ?? 3) * 5);
        const geo = new THREE.PlaneGeometry(W, D, segs, Math.round(segs * D / W)); geo.rotateX(-Math.PI / 2);
        const p = geo.attributes.position, col = new Float32Array(p.count * 3), cW = new THREE.Color(o.farben?.wiese ?? 0x5a7a3a), cWald = new THREE.Color(o.farben?.wald ?? 0x2a4a2a), cF = new THREE.Color(o.farben?.fels ?? 0x7a7672), cG = new THREE.Color(0x9a948c), cS = new THREE.Color(o.farben?.schnee ?? 0xf4f6fa), tmp = new THREE.Color();
        const hoehe = (x, z) => { const nx = x / W * 7, nz = z / D * 3.5; const rand = Math.min(1, (D / 2 - Math.abs(z)) / (D * 0.25)) * Math.min(1, (W / 2 - Math.abs(x)) / (W * 0.15));
          return Math.max(0, (Math.pow(N.ridge(nx + 10, nz + 3, 7), 1.6) * 1.9 - 0.08 + N.fbm(nx * 4, nz * 4, 3) * 0.1) * rand) * Hm; };
        for (let i = 0; i < p.count; i++) p.setY(i, hoehe(p.getX(i), p.getZ(i)));
        geo.computeVertexNormals(); const nrm = geo.attributes.normal;
        const sg = o.schneegrenze ?? 0.62, bg = o.baumgrenze ?? 0.35;
        for (let i = 0; i < p.count; i++) { const y = p.getY(i) / Hm, steil = 1 - nrm.getY(i), n = N.fbm(p.getX(i) * 0.05, p.getZ(i) * 0.05, 3);
          if (y < bg * 0.4) tmp.copy(cW).lerp(cWald, Math.min(1, y / (bg * 0.4) + n * 0.3)); else if (y < bg) tmp.copy(cWald).lerp(cF, Math.max(0, (y - bg * 0.7) / (bg * 0.3)));
          else tmp.copy(cF).lerp(cG, n * 0.6);
          if (steil > 0.45) tmp.lerp(cF, Math.min(1, (steil - 0.45) * 3));
          if (y > sg + (n - 0.5) * 0.12 && steil < 0.55) tmp.lerp(cS, Math.min(1, (y - sg) * 6 + 0.4));
          tmp.offsetHSL(0, 0, (n - 0.5) * 0.08); col[i * 3] = tmp.r; col[i * 3 + 1] = tmp.g; col[i * 3 + 2] = tmp.b; }
        geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
        const felsTex = canvasTex(256, 256, (g) => { const q = rng(77); g.fillStyle = "#d8d8d8"; g.fillRect(0, 0, 256, 256); for (let i = 0; i < 5000; i++) { const v = 150 + q() * 105; g.fillStyle = `rgb(${v},${v},${v})`; g.fillRect(q() * 256, q() * 256, 2 + q() * 3, 1 + q() * 2); } g.strokeStyle = "rgba(60,60,60,.35)"; for (let i = 0; i < 40; i++) { g.beginPath(); let x = q() * 256, y = q() * 256; g.moveTo(x, y); for (let k = 0; k < 5; k++) { x += (q() - 0.5) * 40; y += q() * 30; g.lineTo(x, y); } g.stroke(); } });
        felsTex.wrapS = felsTex.wrapT = THREE.RepeatWrapping; felsTex.repeat.set(W / 12, D / 12);
        const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ vertexColors: true, map: felsTex, roughness: 0.95 })); m.position.set(o.x ?? 0, o.y ?? 0, o.z ?? -300); m.receiveShadow = true; m.castShadow = o.schatten ?? false; s.add(m);
        // Nadelbäume als Instanzen am Hang unterhalb der Baumgrenze
        const nB = o.baeume ?? 1500; if (nB > 0) { const stamm = new THREE.ConeGeometry(1, 1, 7); stamm.translate(0, 0.5, 0); const im = new THREE.InstancedMesh(stamm, new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9 }), nB); const mm = new THREE.Matrix4(); let k = 0;
          for (let t = 0; t < nB * 6 && k < nB; t++) { const x = (r() - 0.5) * W * 0.9, z = (r() - 0.5) * D * 0.8, y = hoehe(x, z); if (y / Hm > bg * 0.9 || y / Hm < 0.03) continue; const hh = 4 + r() * 6; mm.makeScale(hh * 0.3, hh, hh * 0.3); mm.setPosition(x + m.position.x, y + m.position.y - 0.5, z + m.position.z); im.setMatrixAt(k, mm); im.setColorAt(k, new THREE.Color(0x2e5a34).offsetHSL((r() - 0.5) * 0.03, 0, (r() - 0.5) * 0.1)); k++; }
          im.count = k; im.castShadow = false; s.add(im); }
        return { mesh: m, hoehe: (x, z) => hoehe(x - m.position.x, z - m.position.z) + m.position.y };
      }
      // Ferne Bergketten als Silhouetten-Schichten (Luftperspektive: je weiter, desto heller/blauer). Mit camFar() verwenden.
      function bergkette(s, o = {}) {
        const N = rauschen2(o.seed ?? 9), lagen = o.lagen ?? 4, grp = new THREE.Group(); s.add(grp); const farbeNah = new THREE.Color(o.nah ?? 0x3a4a5a), farbeFern = new THREE.Color(o.fern ?? 0xa8b8c8);
        for (let l = 0; l < lagen; l++) { const dist = (o.abstand ?? 400) + l * (o.schritt ?? 250), breite = dist * 3.2, hoch = (o.hoehe ?? 120) * (1 + l * 0.35);
          const sh = new THREE.Shape(); sh.moveTo(-breite / 2, -20); for (let i = 0; i <= 200; i++) { const x = -breite / 2 + breite * i / 200; const y = N.ridge(i / 200 * 6 + l * 7, l * 3.1, 5) * hoch; sh.lineTo(x, y); } sh.lineTo(breite / 2, -20); sh.closePath();
          const c = farbeNah.clone().lerp(farbeFern, l / Math.max(1, lagen - 1)); const mesh = new THREE.Mesh(new THREE.ShapeGeometry(sh), new THREE.MeshBasicMaterial({ color: c, fog: o.nebel ?? true }));
          mesh.position.set(o.x ?? 0, o.y ?? 0, (o.z ?? 0) - dist); mesh.renderOrder = -5 - l; grp.add(mesh);
          if (o.schnee !== false && l < lagen - 1) { const sh2 = new THREE.Shape(); let started = false; for (let i = 0; i <= 200; i++) { const x = -breite / 2 + breite * i / 200; const y = N.ridge(i / 200 * 6 + l * 7, l * 3.1, 5) * hoch; if (!started) { sh2.moveTo(x, Math.max(y, hoch * 0.62) - 0.5); started = true; } else sh2.lineTo(x, Math.max(y, hoch * 0.62)); } sh2.lineTo(breite / 2, hoch * 0.62); sh2.lineTo(-breite / 2, hoch * 0.62); sh2.closePath();
            const sn = new THREE.Mesh(new THREE.ShapeGeometry(sh2), new THREE.MeshBasicMaterial({ color: c.clone().lerp(new THREE.Color(0xffffff), 0.75), fog: o.nebel ?? true })); sn.position.copy(mesh.position); sn.position.z += 0.5; sn.renderOrder = mesh.renderOrder + 0; grp.add(sn); } }
        return grp;
      }
      // Nebel: Dunst (FogExp2), Bodennebel-Schichten mit ziehender Struktur, Nebelschwaden
      function nebel(s, farbe = 0xc8d0d8, dichte = 0.012) { s.fog = new THREE.FogExp2(farbe, dichte); return s.fog; }
      const NEBEL_TEX = {};
      function texNebel(seed) { if (NEBEL_TEX[seed]) return NEBEL_TEX[seed]; const N = rauschen2(seed);
        const t = canvasTex(256, 256, (g) => { const img = g.createImageData(256, 256); for (let y = 0; y < 256; y++) for (let x = 0; x < 256; x++) { const v = N.fbm(x / 48, y / 48, 5), rx = Math.min(x, 255 - x) / 40, ry = Math.min(y, 255 - y) / 40, rand = Math.min(1, rx) * Math.min(1, ry);
          const a = Math.max(0, Math.min(1, (v - 0.32) * 2.2)) * rand; const i = (y * 256 + x) * 4; img.data[i] = img.data[i + 1] = img.data[i + 2] = 255; img.data[i + 3] = a * 255; } g.putImageData(img, 0, 0); });
        t.wrapS = t.wrapT = THREE.RepeatWrapping; NEBEL_TEX[seed] = t; return t; }
      function bodenNebel(s, o = {}) { // flache, übereinander liegende Nebelbänke, ziehen langsam (update(T))
        const grp = new THREE.Group(); s.add(grp); const n = o.schichten ?? 6, W = o.breite ?? 120, D = o.tiefe ?? 120, list = [];
        for (let i = 0; i < n; i++) { const mat = new THREE.MeshBasicMaterial({ map: texNebel((o.seed ?? 1) + i), color: o.farbe ?? 0xdde4ea, transparent: true, opacity: (o.dichte ?? 0.35) * (1 - i / n * 0.5), depthWrite: false, fog: true });
          const m = new THREE.Mesh(new THREE.PlaneGeometry(W, D), mat); m.rotation.x = -Math.PI / 2; m.position.set(o.x ?? 0, (o.y ?? 0) + 0.3 + i * (o.hoehe ?? 3) / n, o.z ?? 0); m.renderOrder = 8; grp.add(m); list.push(m); }
        return { grp, update(T) { list.forEach((m, i) => { m.material.map.offset.set(T * 0.004 * (1 + i * 0.3), T * 0.002 * (i % 2 ? 1 : -1)); }); } };
      }
      function nebelSchwaden(s, o = {}) { // große weiche Sprites, die langsam treiben (zwischen Bäumen, über Wasser, in Straßen)
        const r = rng(o.seed ?? 4), grp = new THREE.Group(), list = []; s.add(grp);
        for (let i = 0; i < (o.n ?? 30); i++) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: SOFT, color: o.farbe ?? 0xe4e8ee, transparent: true, opacity: (o.dichte ?? 0.25) * (0.5 + r() * 0.5), depthWrite: false }));
          const sc = (o.groesse ?? 12) * (0.6 + r() * 0.8); sp.scale.set(sc * 1.8, sc * 0.6, 1); const p0 = new THREE.Vector3((o.x ?? 0) + (r() - 0.5) * (o.breite ?? 80), (o.y ?? 0) + r() * (o.hoehe ?? 4), (o.z ?? 0) + (r() - 0.5) * (o.tiefe ?? 80)); sp.position.copy(p0); grp.add(sp); list.push({ sp, p0, v: 0.2 + r() * 0.4, ph: r() * 6 }); }
        return { grp, update(T) { list.forEach((L) => { L.sp.position.x = L.p0.x + Math.sin(T * 0.05 * L.v + L.ph) * 6 + T * L.v * 0.3; L.sp.position.y = L.p0.y + Math.sin(T * 0.2 + L.ph) * 0.3; L.sp.material.opacity = (o.dichte ?? 0.25) * (0.6 + 0.4 * Math.sin(T * 0.15 + L.ph)); }); } };
      }
