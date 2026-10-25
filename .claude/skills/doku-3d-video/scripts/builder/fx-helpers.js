      function camFar(far = 3000) { return new THREE.PerspectiveCamera(46, 1080 / 1920, 0.3, far); }
      // Deterministische Partikel: Position = Basis + Geschwindigkeit * Lebensphase
      const SOFT = canvasTex(64, 64, (g) => { const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(0.35, "rgba(255,255,255,.6)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); });
      function particles(s, n, seed, o) {
        const r = rng(seed), base = [], vel = [], off = [];
        for (let i = 0; i < n; i++) {
          base.push([o.x[0] + r() * (o.x[1] - o.x[0]), o.y[0] + r() * (o.y[1] - o.y[0]), o.z[0] + r() * (o.z[1] - o.z[0])]);
          vel.push([o.v[0] * (r() - 0.5) * 2 + (o.drift || [0, 0, 0])[0], o.v[1] * (0.4 + r() * 0.6), o.v[2] * (r() - 0.5) * 2 + (o.drift || [0, 0, 0])[2]]);
          off.push(r());
        }
        const g = new THREE.BufferGeometry(); const pos = new Float32Array(n * 3); g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
        const mat = new THREE.PointsMaterial({ color: o.color, size: o.size, map: SOFT, sizeAttenuation: o.atten !== false, transparent: true, opacity: o.opacity ?? 0.9,
          blending: o.add ? THREE.AdditiveBlending : THREE.NormalBlending, depthWrite: false, fog: o.fog !== false });
        const pts = new THREE.Points(g, mat); pts.frustumCulled = false; s.add(pts);
        return { pts, mat, update(t) {
          for (let i = 0; i < n; i++) {
            const k = ((off[i] + t / o.life) % 1 + 1) % 1, a = k * o.life;
            pos[i * 3] = base[i][0] + vel[i][0] * a; pos[i * 3 + 1] = base[i][1] + vel[i][1] * a + (o.grav || 0) * a * a; pos[i * 3 + 2] = base[i][2] + vel[i][2] * a;
          }
          g.attributes.position.needsUpdate = true;
        } };
      }
      function plattenbau(s, x, z, w, h, d, seed, lit = 0.25, wallCol = "#9a9a92") {
        const tex = windowsTex(Math.round(w / 3), Math.round(h / 2.8), wallCol, "#ffc97a", seed, lit);
        const mat = new THREE.MeshStandardMaterial({ color: 0xffffff, map: tex, roughness: 0.9, emissive: 0xffffff, emissiveMap: tex, emissiveIntensity: 0.0 });
        const b = box(w, h, d, mat, x, h / 2, z, s); return { b, mat };
      }
