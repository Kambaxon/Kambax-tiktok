      // ---------- Helfer ----------
      function rng(seed) { return function () { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
      const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
      const smooth = (x) => { x = clamp(x, 0, 1); return x * x * (3 - 2 * x); };
      const lerp = (a, b, k) => a + (b - a) * k;
      const lerpV = (a, b, k) => new THREE.Vector3(lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k));
      const M = (color, o = {}) => new THREE.MeshStandardMaterial(Object.assign({ color, roughness: 0.82, metalness: 0 }, o));
      function box(w, h, d, mat, x = 0, y = 0, z = 0, parent) {
        const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z);
        m.castShadow = true; m.receiveShadow = true; if (parent) parent.add(m); return m;
      }
      function cyl(rt, rb, h, mat, x = 0, y = 0, z = 0, parent, seg = 20) {
        const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat); m.position.set(x, y, z);
        m.castShadow = true; m.receiveShadow = true; if (parent) parent.add(m); return m;
      }
      function canvasTex(w, h, draw) {
        const c = document.createElement("canvas"); c.width = w; c.height = h; draw(c.getContext("2d"), w, h);
        const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.anisotropy = 4; return t;
      }
      function skyTex(top, mid, bottom) {
        return canvasTex(8, 512, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, top); gr.addColorStop(0.55, mid); gr.addColorStop(1, bottom); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
      }
      function windowsTex(cols, rows, wall, lit, seed, litShare = 0.75) {
        const r = rng(seed);
        return canvasTex(256, 512, (g, w, h) => {
          g.fillStyle = wall; g.fillRect(0, 0, w, h);
          const cw = w / cols, rh = h / rows;
          for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) {
            g.fillStyle = r() < litShare ? lit : "#2a3340";
            g.fillRect(i * cw + cw * 0.22, j * rh + rh * 0.2, cw * 0.56, rh * 0.55);
          }
        });
      }

      // Gliederpuppen-Figur wie in den Referenzen (glatte Formen, einfarbige Kleidung)
      const SKIN = [0xf1c7a3, 0xd9a47c, 0xb57a52, 0x8a5a3c, 0xf5d5bb];
      const CLOTH = [0x2f4f8f, 0xc23b3b, 0x3f7d4f, 0xe0b23a, 0x6b4c9a, 0x2b2b30, 0xe8e2d6, 0x1f6f8b, 0xd9708a];
      const HAIR = [0x2a1c12, 0x5a3a1e, 0x9a6a32, 0x161616, 0xcaa46a];
      function person(seed, o = {}) {
        const r = rng(seed); const g = new THREE.Group();
        const skin = M(SKIN[Math.floor(r() * SKIN.length)]);
        const top = M(o.top ?? CLOTH[Math.floor(r() * CLOTH.length)]);
        const pants = M(o.pants ?? [0x2b3446, 0x3a3a3a, 0x5b4a36, 0x23364f][Math.floor(r() * 4)]);
        const hair = M(HAIR[Math.floor(r() * HAIR.length)]);
        const s = o.scale ?? (0.92 + r() * 0.16);
        const legGeo = new THREE.CapsuleGeometry(0.075, 0.68, 4, 10);
        const legL = new THREE.Mesh(legGeo, pants); const legR = new THREE.Mesh(legGeo, pants);
        const hipL = new THREE.Group(), hipR = new THREE.Group();
        hipL.position.set(-0.1, 0.86, 0); hipR.position.set(0.1, 0.86, 0);
        legL.position.y = -0.41; legR.position.y = -0.41; hipL.add(legL); hipR.add(legR);
        const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.19, 0.42, 6, 14), top);
        torso.position.y = 1.18; torso.scale.set(1, 1, 0.68);
        const armGeo = new THREE.CapsuleGeometry(0.058, 0.56, 4, 10);
        const shL = new THREE.Group(), shR = new THREE.Group();
        shL.position.set(-0.27, 1.38, 0); shR.position.set(0.27, 1.38, 0);
        const armL = new THREE.Mesh(armGeo, top), armR = new THREE.Mesh(armGeo, top);
        armL.position.y = -0.31; armR.position.y = -0.31; shL.add(armL); shR.add(armR);
        const handL = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 10), skin); handL.position.y = -0.64; shL.add(handL);
        const handR = handL.clone(); shR.add(handR);
        const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.1, 10), skin); neck.position.y = 1.53;
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.13, 20, 16), skin); head.position.y = 1.68; head.scale.set(1, 1.12, 1);
        const cap = new THREE.Mesh(new THREE.SphereGeometry(0.137, 20, 12, 0, Math.PI * 2, 0, Math.PI * 0.55), hair);
        cap.position.y = 1.7; cap.rotation.x = -0.25;
        [legL, legR, torso, armL, armR, head, cap, neck, handL, handR].forEach((m) => { m.castShadow = true; m.receiveShadow = true; });
        g.add(hipL, hipR, torso, shL, shR, neck, head, cap);
        g.scale.setScalar(s);
        g.userData = { hipL, hipR, shL, shR, head, phase: r() * 6.28, r };
        return g;
      }
      function idle(p, t) { // leichtes Gewicht-Verlagern, nie synchron
        const u = p.userData, k = t * 1.3 + u.phase;
        u.shL.rotation.x = Math.sin(k) * 0.05; u.shR.rotation.x = -Math.sin(k * 0.9) * 0.05;
        u.head.rotation.y = Math.sin(k * 0.4) * 0.25; p.rotation.z = Math.sin(k * 0.5) * 0.015;
      }
      function walk(p, t, speed = 1) {
        const u = p.userData, k = t * 6 * speed + u.phase, a = Math.sin(k) * 0.45;
        u.hipL.rotation.x = a; u.hipR.rotation.x = -a; u.shL.rotation.x = -a * 0.8; u.shR.rotation.x = a * 0.8;
        p.position.y = Math.abs(Math.cos(k)) * 0.03;
      }
      function sun(scene, color, intensity, pos, size = 14) {
        const d = new THREE.DirectionalLight(color, intensity); d.position.set(...pos);
        d.castShadow = true; d.shadow.mapSize.set(1024, 1024); d.shadow.bias = -0.0004; d.shadow.normalBias = 0.02;
        const c = d.shadow.camera; c.left = -size; c.right = size; c.top = size; c.bottom = -size; c.near = 0.5; c.far = 80;
        scene.add(d); scene.add(d.target); return d;
      }
      function cam() { return new THREE.PerspectiveCamera(46, 1080 / 1920, 0.1, 400); }

      // ---------- Renderer ----------
      const canvas = document.getElementById("w-canvas");
      const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
      renderer.setPixelRatio(1); renderer.setSize(1080, 1920, false);
      renderer.outputEncoding = THREE.sRGBEncoding; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 0.62;
      renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;

      const W = {};
