      // ===== Gelände v2 (Referenz „Lengede 1963“): unebenes Feld mit Matsch, Fahrspuren, echten Grashalmen, Unkraut, kahlen Bäumen, Zäunen =====
      // feld(s, { breite, tiefe, x, z, seed, amp, grund, matsch: [[x, z, r]], spuren: [[x1, z1, x2, z2]] }) -> { mesh, h(x, z) }
      // halme(s, ter, { x, z, breite, tiefe, n, hoehe, trocken (0..1), farbe, ansatz (Helligkeit am Halmansatz, 0.3 = dunkel, 0.6 auf Schnee), skip(x, z) })  – gebogene, verjüngte Halme, schwingen im Wind
      // unkraut(s, ter, x, z, { n, hoehe, seed })  – hohe Stauden/Disteln für den Vordergrund (Tiefe durch Unschärfe)
      // kahlerBaum(s, x, z, { hoehe, seed, y, rinde })  – knorrig, verzweigt, ohne Laub
      // zaun(s, ter, punkte, { abstand, seil, hoehe })  – schiefe Holzpfosten mit durchhängendem Seil
      function feld(s, o = {}) {
        const W = o.breite ?? 80, D = o.tiefe ?? 80, N = rauschen2(o.seed ?? 4), amp = o.amp ?? 0.45, x0 = o.x ?? 0, z0 = o.z ?? 0;
        const matsch = o.matsch ?? [], spuren = o.spuren ?? [];
        const spurAbst = (x, z) => { let m = 1e9; for (const [a, b, c, d] of spuren) { const vx = c - a, vz = d - b, l = vx * vx + vz * vz, t = Math.max(0, Math.min(1, ((x - a) * vx + (z - b) * vz) / l)); m = Math.min(m, Math.hypot(x - a - vx * t, z - b - vz * t)); } return m; };
        const matschW = (x, z) => { let w = 0; for (const [mx, mz, r] of matsch) w = Math.max(w, 1 - Math.min(1, Math.hypot(x - mx, z - mz) / r)); const sp = spurAbst(x, z); if (sp < 1.6) w = Math.max(w, 1 - sp / 1.6); return w; };
        const h = (x, z) => { let y = amp * (N.fbm(x * 0.045, z * 0.045, 4) - 0.5) * 2.2 + 0.06 * (N.vn(x * 1.7, z * 1.7) - 0.5);
          const sp = spurAbst(x, z); if (sp < 1.6) y -= 0.07 * Math.max(0, Math.cos((sp % 0.8) / 0.8 * Math.PI * 2 - Math.PI)) * (1 - sp / 1.6); return y - matschW(x, z) * 0.05; };
        const geo = new THREE.PlaneGeometry(W, D, 220, 220); geo.rotateX(-Math.PI / 2); const p = geo.attributes.position;
        for (let i = 0; i < p.count; i++) p.setY(i, h(p.getX(i) + x0, p.getZ(i) + z0)); geo.computeVertexNormals();
        // Farbe + Rauheit in einem Layout: Gras-Erde-Mischung, nasse dunkle Matschflächen glänzen
        const A = 1024, px = (u, v) => [x0 - W / 2 + (u / A) * W, z0 - D / 2 + (v / A) * D];
        const farbe = canvasTex(A, A, (g) => { const r = rng((o.seed ?? 4) + 9), img = g.createImageData(A, A), gr = new THREE.Color(o.grund ?? 0x55583a), erde = new THREE.Color(0x4a3a2a), nass = new THREE.Color(0x2a2218), c = new THREE.Color();
          for (let v = 0; v < A; v++) for (let u = 0; u < A; u++) { const [x, z] = px(u, v), n1 = N.fbm(x * 0.12, z * 0.12, 4), n2 = N.vn(x * 2.2, z * 2.2), mw = matschW(x, z);
            c.copy(gr).lerp(erde, Math.max(0, Math.min(1, (n1 - 0.48) * 3.5)) * 0.8).offsetHSL(0, 0, (n2 - 0.5) * 0.08 + (r() - 0.5) * 0.05); c.lerp(nass, Math.min(1, mw * 1.6));
            const k = (v * A + u) * 4; img.data[k] = c.r * 255; img.data[k + 1] = c.g * 255; img.data[k + 2] = c.b * 255; img.data[k + 3] = 255; } g.putImageData(img, 0, 0); });
        const rau = canvasTex(A / 4, A / 4, (g) => { const img = g.createImageData(A / 4, A / 4); for (let v = 0; v < A / 4; v++) for (let u = 0; u < A / 4; u++) { const [x, z] = px(u * 4, v * 4), mw = matschW(x, z), q = 255 * (0.95 - Math.min(1, mw * 1.5) * 0.6), k = (v * A / 4 + u) * 4; img.data[k] = img.data[k + 1] = img.data[k + 2] = q; img.data[k + 3] = 255; } g.putImageData(img, 0, 0); });
        rau.encoding = THREE.LinearEncoding;
        const detail = canvasTex(256, 256, (g) => { const r = rng(77); g.fillStyle = "#808080"; g.fillRect(0, 0, 256, 256); for (let i = 0; i < 5000; i++) { const v = 90 + r() * 90; g.fillStyle = `rgb(${v},${v},${v})`; g.fillRect(r() * 256, r() * 256, 1 + r() * 2, 1 + r() * 3); } });
        detail.wrapS = detail.wrapT = THREE.RepeatWrapping; detail.encoding = THREE.LinearEncoding;
        const mat = new THREE.MeshStandardMaterial({ map: farbe, roughnessMap: rau, roughness: 1, metalness: 0 });
        mat.onBeforeCompile = (sh) => { sh.uniforms.tDet = { value: detail }; sh.fragmentShader = sh.fragmentShader.replace("void main() {", "uniform sampler2D tDet;\nvoid main() {").replace("#include <map_fragment>", "#include <map_fragment>\n diffuseColor.rgb *= texture2D(tDet, vUv * " + (W / 1.5).toFixed(1) + ").rgb * 2.0 * mix(1.0, texture2D(tDet, vUv * " + (W / 9).toFixed(1) + ").r * 2.0, 0.5);"); };
        mat.customProgramCacheKey = () => "feld2";
        const mesh = new THREE.Mesh(geo, mat); mesh.position.set(x0, 0, z0); mesh.receiveShadow = true; s.add(mesh);
        return { mesh, h, matschW }; }

      function halme(s, ter, o = {}) {
        const n = o.n ?? 30000, r = rng(o.seed ?? 11), H = o.hoehe ?? 0.32;
        // ein Halm: 4 Segmente, verjüngt, nach vorn gebogen (Biegung in der Geometrie, Wind im Shader); Normalen nach oben = gleiches Licht wie der Boden, keine dunklen Rückseiten
        const geo = new THREE.BufferGeometry(), pos = [], idx = []; for (let i = 0; i <= 4; i++) { const t = i / 4, w = 0.012 * (1 - t * 0.92); pos.push(-w, t, t * t * 0.18, w, t, t * t * 0.18); if (i < 4) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); } }
        geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); geo.setIndex(idx); geo.setAttribute("color", new THREE.Float32BufferAttribute(pos.map((v, i) => { const t = pos[i - (i % 3) + 1]; return (o.ansatz ?? 0.3) + (1 - (o.ansatz ?? 0.3)) * t; }), 3)); geo.setAttribute("normal", new THREE.Float32BufferAttribute(pos.map((_, i) => (i % 3 === 1 ? 1 : 0)), 3));
        const mat = windMat(new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1, vertexColors: true, envMapIntensity: 0.3, side: THREE.DoubleSide }), 1.6);
        const mesh = new THREE.InstancedMesh(geo, mat, n), m4 = new THREE.Matrix4(), qt = new THREE.Quaternion(), e = new THREE.Euler(), c = new THREE.Color();
        const gruen = new THREE.Color(o.farbe ?? 0x3e5424), tro = new THREE.Color(0x8a7c50); let k = 0;
        for (let i = 0; i < n; i++) { const x = (o.x ?? 0) + (r() - 0.5) * (o.breite ?? 20), z = (o.z ?? 0) + (r() - 0.5) * (o.tiefe ?? 20);
          if ((o.skip && o.skip(x, z)) || (ter.matschW && ter.matschW(x, z) > 0.35 + r() * 0.4)) continue;
          e.set((r() - 0.5) * 0.35, r() * 6.28, (r() - 0.5) * 0.35); qt.setFromEuler(e); const hh = H * (0.45 + r() * 0.9);
          m4.compose(new THREE.Vector3(x, ter.h(x, z) - 0.02, z), qt, new THREE.Vector3(0.8 + r() * 0.6, hh, hh)); mesh.setMatrixAt(k, m4);
          c.copy(gruen).lerp(tro, Math.min(1, (o.trocken ?? 0.35) + (r() - 0.5) * 0.6)).offsetHSL((r() - 0.5) * 0.03, 0, (r() - 0.5) * 0.12); mesh.setColorAt(k++, c); }
        mesh.count = k; mesh.frustumCulled = false; mesh.receiveShadow = true; mesh.castShadow = o.schatten ?? false; s.add(mesh); return mesh; }

      function unkraut(s, ter, x, z, o = {}) { const r = rng(o.seed ?? Math.floor(x * 31 + z * 17)), g = new THREE.Group(); s.add(g); const H = o.hoehe ?? 1.1;
        const stM = windMat(M(0x6a6440, { roughness: 0.9 }), 1), kopfM = windMat(M(0x5a4a34, { roughness: 1 }), 1), blM = windMat(M(0x4e5e30, { roughness: 0.85, side: THREE.DoubleSide }), 1);
        for (let i = 0; i < (o.n ?? 7); i++) { const h = H * (0.6 + r() * 0.6), px = x + (r() - 0.5) * 0.5, pz = z + (r() - 0.5) * 0.5, y0 = ter ? ter.h(px, pz) : 0, kx = (r() - 0.5) * 0.25, kz = (r() - 0.5) * 0.25;
          const kurve = new THREE.QuadraticBezierCurve3(new THREE.Vector3(px, y0, pz), new THREE.Vector3(px + kx * 0.3, y0 + h * 0.6, pz + kz * 0.3), new THREE.Vector3(px + kx, y0 + h, pz + kz));
          const st = new THREE.Mesh(new THREE.TubeGeometry(kurve, 8, 0.006 + r() * 0.004, 4, false), stM); st.castShadow = true; g.add(st);
          const top = kurve.getPoint(1); for (let j = 0; j < 3 + r() * 4; j++) { const kk = new THREE.Mesh(new THREE.SphereGeometry(0.02 + r() * 0.02, 6, 5), kopfM); kk.position.copy(top).add(new THREE.Vector3((r() - 0.5) * 0.08, (r() - 0.5) * 0.06, (r() - 0.5) * 0.08)); kk.scale.y = 1.3; kk.castShadow = true; g.add(kk); }
          for (let j = 0; j < 3; j++) { const t = 0.2 + j * 0.2, pp = kurve.getPoint(t), bl = new THREE.Mesh(new THREE.PlaneGeometry(0.05, 0.16).translate(0, 0.08, 0), blM); bl.position.copy(pp); bl.rotation.set(0.9 + r() * 0.5, r() * 6.28, 0); g.add(bl); } }
        return g; }

      function kahlerBaum(s, x, z, o = {}) { const r = rng(o.seed ?? Math.floor(x * 7 + z * 13)), g = new THREE.Group(), H = o.hoehe ?? 9; g.position.set(x, o.y ?? 0, z); g.rotation.y = r() * 6.28; s.add(g);
        const ri = o.rinde ?? (typeof material === "function" ? material("eichenrinde", { wiederholen: [1, 2] }) : M(0x3a3028));
        const zweig = (a, dir, len, rad, tiefe) => { const pts = [a.clone()]; let p = a.clone(), d = dir.clone(); for (let i = 0; i < 4; i++) { d.add(new THREE.Vector3((r() - 0.5) * 0.5, (r() - 0.3) * 0.3, (r() - 0.5) * 0.5)).normalize(); p = p.clone().addScaledVector(d, len / 4); pts.push(p); }
          const c = new THREE.CatmullRomCurve3(pts), geo = new THREE.TubeGeometry(c, tiefe > 1 ? 10 : 5, rad, tiefe > 2 ? 9 : 5, false), ps = geo.attributes.position;
          for (let i = 0; i < ps.count; i++) { const t = Math.floor(i / ((tiefe > 2 ? 9 : 5) + 1)) / (tiefe > 1 ? 10 : 5), cp = c.getPointAt(Math.min(1, t)), f = 1 - t * 0.6; ps.setXYZ(i, cp.x + (ps.getX(i) - cp.x) * f, cp.y + (ps.getY(i) - cp.y) * f, cp.z + (ps.getZ(i) - cp.z) * f); }
          geo.computeVertexNormals(); const m = new THREE.Mesh(geo, ri); m.castShadow = true; m.receiveShadow = tiefe > 2; g.add(m);
          if (tiefe > 0) { const k = tiefe > 2 ? 4 : 3; for (let i = 0; i < k; i++) { const t = 0.45 + r() * 0.5, sp = c.getPointAt(t), dn = d.clone().add(new THREE.Vector3((r() - 0.5) * 1.8, 0.3 + r() * 0.6, (r() - 0.5) * 1.8)).normalize(); zweig(sp, dn, len * (0.5 + r() * 0.25), rad * 0.5, tiefe - 1); } } };
        zweig(new THREE.Vector3(0, -0.2, 0), new THREE.Vector3(0, 1, 0), H * 0.5, H * 0.03, 3); return g; }

      function zaun(s, ter, punkte, o = {}) { const g = new THREE.Group(); s.add(g); const r = rng(o.seed ?? 3), ab = o.abstand ?? 2.4, H = o.hoehe ?? 1.1;
        const holz = typeof material === "function" ? material("altholz", {}) : M(0x6a5a44); const seilM = M(0x8a7a5a, { roughness: 1 }); const pf = [];
        for (let i = 0; i < punkte.length - 1; i++) { const [a, b] = [punkte[i], punkte[i + 1]], L = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(1, Math.round(L / ab));
          for (let k = (i ? 1 : 0); k <= n; k++) { const t = k / n, x = a[0] + (b[0] - a[0]) * t, z = a[1] + (b[1] - a[1]) * t, y = ter ? ter.h(x, z) : 0;
            const p = cyl(0.045, 0.055, H, holz, x, y + H / 2 - 0.05, z, g, 7); p.rotation.set((r() - 0.5) * 0.12, r() * 6, (r() - 0.5) * 0.12); pf.push(new THREE.Vector3(x, y + H * 0.85, z)); } }
        if (o.seil !== false) for (let i = 0; i < pf.length - 1; i++) { const a = pf[i], b = pf[i + 1], m = a.clone().lerp(b, 0.5); m.y -= 0.12 + r() * 0.06;
          g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(a, m, b), 10, 0.009, 4, false), seilM)); }
        return g; }
