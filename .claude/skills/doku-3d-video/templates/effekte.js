      // ===== Effekte v1: Auto-Upgrade (Lack, Scheinwerfer, Kennzeichen, Felgen), Feuer, Regen-Spritzer, nasser Boden =====
      // braucht: rng, box, cyl, M, SOFT, canvasTex, GLSL_NOISE (render.js), auto() (bausteine.js)

      // Lichtkegel mit weichem Verlauf (Spitze hell, Ende und Ränder verblassen) – für Scheinwerfer, Laternen, Taschenlampen
      function lichtKegel(laenge, radius, farbe, staerke = 0.35) {
        const geo = new THREE.ConeGeometry(radius, laenge, 32, 8, true); geo.translate(0, -laenge / 2, 0); // Spitze im Ursprung, zeigt nach -y
        const mat = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, toneMapped: false,
          uniforms: { uF: { value: new THREE.Color(farbe) }, uS: { value: staerke }, uL: { value: laenge } },
          vertexShader: `varying float vK; varying vec3 vN, vV; uniform float uL;
            void main(){ vK = -position.y / uL; vec4 mv = modelViewMatrix * vec4(position, 1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }`,
          fragmentShader: `uniform vec3 uF; uniform float uS; varying float vK; varying vec3 vN, vV;
            void main(){ float rand = pow(abs(dot(normalize(vN), normalize(vV))), 1.4); float a = pow(1.0 - vK, 2.2) * rand * uS; gl_FragColor = vec4(uF * a, 1.0); }` });
        const m = new THREE.Mesh(geo, mat); m.renderOrder = 5; return m;
      }
      function glanzPunkt(farbe, groesse) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: SOFT, color: new THREE.Color(farbe).multiplyScalar(3), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false })); s.scale.setScalar(groesse); return s; }

      const KENNZ = ["B-KA 2024", "M-TS 815", "HH-LX 421", "K-DE 77", "F-RT 309", "S-MN 1260", "D-VO 550", "L-AB 98"];
      function kennzeichenTex(text) {
        return canvasTex(256, 56, (g) => { g.fillStyle = "#f4f4f0"; g.fillRect(0, 0, 256, 56); g.strokeStyle = "#111"; g.lineWidth = 4; g.strokeRect(2, 2, 252, 52);
          g.fillStyle = "#1c3c9a"; g.fillRect(4, 4, 30, 48); g.fillStyle = "#f2c500"; for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2; g.beginPath(); g.arc(19 + Math.cos(a) * 9, 20 + Math.sin(a) * 9, 1.6, 0, 7); g.fill(); }
          g.fillStyle = "#fff"; g.font = "bold 12px sans-serif"; g.fillText("D", 14, 46); g.fillStyle = "#111"; g.font = "bold 38px monospace"; g.textBaseline = "middle"; g.fillText(text, 44, 30); });
      }
      // Macht aus auto(...) ein detailliertes Fahrzeug. o: { licht: bool (Scheinwerfer an), fern: Länge Lichtkegel, bremse: bool, spot: bool (echtes Licht auf Boden), seed }
      function autoPlus(car, o = {}) {
        const r = rng((o.seed ?? 3) * 17 + 1), L = car.userData.L, body = car.children[0];
        // Mehrschicht-Lack mit Klarlack -> spiegelt Himmel/Umgebung
        const alt = body.material || null, lack = alt ? new THREE.MeshPhysicalMaterial({ color: alt.color.clone(), metalness: 0.55, roughness: 0.32, clearcoat: 1.0, clearcoatRoughness: 0.06, envMapIntensity: 1.2 }) : null; // fahrzeug() hat schon Klarlack
        const heads = [], tails = [];
        car.traverse((m) => { if (!m.isMesh) return; if (alt && m.material === alt) m.material = lack;
          if (m.material.isMeshBasicMaterial && m.material.color.getHex() === 0xfff6e0) heads.push(m);
          if (m.material.isMeshBasicMaterial && m.material.color.getHex() === 0xc81a1a) tails.push(m);
          if (m.material.transparent && m.material.isMeshStandardMaterial && m.material.opacity < 0.6) { m.material.envMapIntensity = 1.6; m.material.roughness = 0.02; } });
        // Scheinwerfer: Reflektor-Glas, Glühen, Lichtkegel, Spot auf die Straße
        const an = !!o.licht, headM = new THREE.MeshBasicMaterial({ color: an ? new THREE.Color(0xfff3dc).multiplyScalar(5) : new THREE.Color(0xd8dce0), toneMapped: !an });
        const tailM = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xff1a10).multiplyScalar(an || o.bremse ? (o.bremse ? 5 : 2.2) : 0.6), toneMapped: false });
        const fx = new THREE.Group(); car.add(fx); const kegel = [];
        heads.forEach((h) => { h.material = headM; if (h.geometry.parameters.width) box(0.38, 0.15, 0.02, M(0x9aa0a6, { metalness: 0.9, roughness: 0.2 }), h.position.x, h.position.y, h.position.z - 0.012, car);
          if (an) { const gp = glanzPunkt(0xfff0d0, 0.5); gp.position.copy(h.position).add(new THREE.Vector3(0, 0, 0.08)); fx.add(gp);
            const k = lichtKegel(o.fern ?? 14, 2.6, 0xfff0d8, o.kegel ?? 0.22); k.position.copy(h.position).add(new THREE.Vector3(0, 0, 0.05)); k.rotation.x = -Math.PI / 2 + 0.06; fx.add(k); kegel.push(k); } });
        tails.forEach((t) => { t.material = tailM; if (an || o.bremse) { const gp = glanzPunkt(0xff2010, o.bremse ? 0.9 : 0.55); gp.position.copy(t.position).add(new THREE.Vector3(0, 0, -0.08)); fx.add(gp); } });
        if (an && o.spot !== false && heads.length) {
          const sp = new THREE.SpotLight(0xfff0d8, 6, (o.fern ?? 14) * 1.8, 0.5, 0.6, 1.6); sp.position.set(0, heads[0].position.y, L / 2); sp.target.position.set(0, 0, L / 2 + 10); car.add(sp, sp.target);
          if (o.bremse) { const rl = new THREE.PointLight(0xff2010, o.bremse ? 1.5 : 0.6, 5, 2); rl.position.set(0, 0.7, -L / 2 - 0.4); car.add(rl); } }
        // Kennzeichen vorne/hinten
        const kz = new THREE.MeshStandardMaterial({ map: kennzeichenTex(KENNZ[Math.floor(r() * KENNZ.length)]), roughness: 0.4, ...PO });
        if (!car.userData.details) for (const sz of [1, -1]) { const p = new THREE.Mesh(new THREE.PlaneGeometry(0.52, 0.115), kz); p.position.set(0, sz > 0 ? 0.42 : 0.55, sz * (L / 2 + 0.1)); if (sz < 0) p.rotation.y = Math.PI; car.add(p); }
        // Felgen mit Speichen + Bremsscheibe, Reifenflanke
        const felge = M(r() < 0.5 ? 0xc8ccd0 : 0x2a2c30, { metalness: 0.85, roughness: 0.25 });
        (car.userData.felgenFertig ? [] : car.userData.wheels || []).forEach((wh) => { const aus = Math.sign(wh.position.x) || 1, rr = wh.children[0].geometry.parameters.radiusTop, ww = wh.children[0].geometry.parameters.height;
          if (wh.children[1]) wh.children[1].material = M(0x18191b, { metalness: 0.4, roughness: 0.6 }); // Felgenbett dunkel -> Speichen wirken offen
          for (let k = 0; k < 5; k++) { const sp = box(0.03, rr * 0.6, 0.06, felge, aus * (ww / 2 + 0.02), 0, 0, wh); sp.geometry.translate(0, rr * 0.3, 0); sp.rotation.x = k / 5 * Math.PI * 2; }
          const nabe = cyl(rr * 0.16, rr * 0.16, 0.03, felge, aus * (ww / 2 + 0.03), 0, 0, wh, 16); nabe.rotation.z = Math.PI / 2;
          const kranz = new THREE.Mesh(new THREE.TorusGeometry(rr * 0.6, 0.012, 6, 32), felge); kranz.rotation.y = Math.PI / 2; kranz.position.x = aus * (ww / 2 + 0.02); wh.add(kranz);
          const scheibe = cyl(rr * 0.5, rr * 0.5, 0.01, M(0x5a5c60, { metalness: 0.8, roughness: 0.45 }), aus * (ww / 2 - 0.02), 0, 0, wh, 24); scheibe.rotation.z = Math.PI / 2;
          const flanke = new THREE.Mesh(new THREE.TorusGeometry(rr * 0.82, rr * 0.13, 8, 32), M(0x232323, { roughness: 0.8 })); flanke.rotation.y = Math.PI / 2; flanke.position.x = aus * ww / 2; wh.add(flanke); });
        // Scheibenwischer, Antenne, Türgriffe bleiben aus auto()
        if (L < 5 && !car.userData.details) { const wM = M(0x111111, { roughness: 0.6 }); for (const sx of [-0.35, 0.35]) { const w = box(0.55, 0.015, 0.02, wM, sx, 0.94, L / 2 - (L > 4 ? 1.36 : 1.13), car); w.rotation.z = sx > 0 ? 0.1 : -0.1; } cyl(0.006, 0.006, 0.35, wM, 0.5, 1.6, -L / 2 + 1.3, car, 4); }
        car.userData.kegel = kegel; car.userData.lack = lack;
        return car;
      }

      // Feuer: animierter Rausch-Shader auf gekreuzten Flächen + Glut + Rauch + flackerndes Licht.
      // o: { breite, hoehe, rauch: bool, glut: n, licht: Stärke, kraft, seed }. update(T, kamera) aufrufen (Kamera -> Flammen drehen sich zur Kamera).
      function feuer(s, x, y, z, o = {}) {
        const b = o.breite ?? 1.2, h = o.hoehe ?? 2.2, seed = o.seed ?? 1, g = new THREE.Group(); g.position.set(x, y, z); s.add(g);
        const mat = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, toneMapped: false,
          uniforms: { uT: { value: 0 }, uSeed: { value: seed * 3.7 }, uK: { value: o.kraft ?? 1.2 } },
          vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
          fragmentShader: `uniform float uT, uSeed, uK; varying vec2 vUv; ${GLSL_NOISE}
            void main(){
              vec2 p = vUv; float x = (p.x - 0.5) * 2.0;
              float n = fbm(vec2(x * 2.2 + uSeed, p.y * 3.2 - uT * 2.6)) ;
              float n2 = fbm(vec2(x * 5.0 - uSeed, p.y * 6.0 - uT * 4.1));
              float breite = mix(1.0, 0.3, pow(p.y, 0.7));
              float form = 1.0 - abs(x) / breite;
              float f = form * 1.25 + (n - 0.5) * 1.4 + (n2 - 0.5) * 0.5 - p.y * 0.8 + 0.2;
              f *= smoothstep(0.0, 0.06, p.y);
              float a = smoothstep(0.0, 0.35, f);
              vec3 c = mix(vec3(0.5, 0.04, 0.0), vec3(1.0, 0.35, 0.03), smoothstep(0.05, 0.35, f));
              c = mix(c, vec3(1.0, 0.75, 0.25), smoothstep(0.35, 0.65, f));
              c = mix(c, vec3(1.0, 0.95, 0.8), smoothstep(0.7, 1.0, f));
              gl_FragColor = vec4(c * a * uK, 1.0);
            }` });
        const fl = []; for (let i = 0; i < 3; i++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(b, h), mat); m.position.y = h / 2 - 0.05; m.rotation.y = (i - 1) * 0.55; m.renderOrder = 6; g.add(m); fl.push(m); }
        const kern = glanzPunkt(0xff6a20, b * 1.5); kern.position.y = h * 0.3; kern.material.opacity = 0.5; g.add(kern);
        const licht = new THREE.PointLight(0xff8a3a, o.licht ?? 3, 14 * Math.max(1, b), 2); licht.position.y = h * 0.4; g.add(licht);
        const glut = particles(g, o.glut ?? 60, seed * 13 + 5, { x: [-b * 0.4, b * 0.4], y: [0, h * 0.3], z: [-b * 0.4, b * 0.4], v: [0.3, 1.6, 0.3], drift: [0.15, 0, 0], life: 2.2, color: new THREE.Color(0xff9a40).multiplyScalar(4), size: 0.05, opacity: 1, add: true });
        glut.mat.toneMapped = false;
        const rauch = o.rauch !== false ? particles(g, 40, seed * 7 + 2, { x: [-b * 0.3, b * 0.3], y: [h * 0.7, h], z: [-b * 0.3, b * 0.3], v: [0.4, 1.1, 0.4], drift: [0.35, 0, 0.1], life: 5, color: 0x2a2624, size: b * 2.2, opacity: 0.32 }) : null;
        return { g, mat, licht, update(T, kamera) { mat.uniforms.uT.value = T; if (kamera) { const wp = g.getWorldPosition(new THREE.Vector3()); g.rotation.y = Math.atan2(kamera.position.x - wp.x, kamera.position.z - wp.z); } const fk = 0.75 + 0.25 * Math.sin(T * 17.3 + seed) * Math.sin(T * 7.1) + 0.1 * Math.sin(T * 31.7); licht.intensity = (o.licht ?? 3) * fk; kern.material.opacity = 0.18 + 0.1 * fk; glut.update(T); if (rauch) rauch.update(T); } };
      }

      // Regentropfen-Einschläge am Boden (kleine Ringe, die aufgehen und verblassen) – zusammen mit regen() verwenden.
      function regenSpritzer(s, x0, x1, z0, z1, n = 160, seed = 9, y = 0.02) {
        const r = rng(seed), geo = new THREE.RingGeometry(0.7, 1, 20); geo.rotateX(-Math.PI / 2);
        const mat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false });
        const im = new THREE.InstancedMesh(geo, mat, n); im.frustumCulled = false; s.add(im);
        const P = []; for (let i = 0; i < n; i++) P.push([x0 + r() * (x1 - x0), z0 + r() * (z1 - z0), r(), 0.6 + r() * 0.8]);
        const mm = new THREE.Matrix4(), c = new THREE.Color();
        return { im, update(T) { P.forEach((p, i) => { const k = (T * 2.2 * p[3] + p[2]) % 1, sc = 0.02 + k * 0.13; mm.makeScale(sc, 1, sc); mm.setPosition(p[0], y, p[1]); im.setMatrixAt(i, mm); c.setScalar(0.35 * (1 - k)); im.setColorAt(i, c); });
          im.instanceMatrix.needsUpdate = true; if (im.instanceColor) im.instanceColor.needsUpdate = true; } };
      }
      // Nasser Boden: Material glatter und spiegelnder machen (k = 0..1). Pfützen zusätzlich mit pfuetze().
      function nass(mat, k = 1) { if (!mat) return; mat.roughness = THREE.MathUtils.lerp(mat.roughness, 0.12, k); mat.metalness = THREE.MathUtils.lerp(mat.metalness || 0, 0.35, k); mat.color.multiplyScalar(1 - 0.35 * k); mat.envMapIntensity = 1 + k; mat.needsUpdate = true; }
