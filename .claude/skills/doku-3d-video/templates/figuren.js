      // ===== Figuren v2: Gesichter, Frisuren, Kleidung (ersetzt die Gliederpuppe) =====
      // person(seed, { top, pants, scale, hair, beard, glasses, jacket, kind }) -> THREE.Group
      // userData: hipL, hipR, shL, shR, elL, elR, head, face, phase  (kompatibel mit idle()/walk())
      const SKIN2 = [0xf3cfb3, 0xe8b894, 0xd29a72, 0xb07850, 0x8a5a3a, 0x6a4028];
      const HAIR2 = [0x1c140e, 0x3a2414, 0x6a4424, 0x9a6a3a, 0xc8a060, 0xd8d0c8, 0x8a2a1a];
      const CLOTH2 = [0x2f4f8f, 0xb8352e, 0x3f7d4f, 0xd8a838, 0x5a4a8a, 0x2b2b30, 0xe8e2d6, 0x1f6f8b, 0xc8708a, 0x6a5038, 0x8a9aa8];
      const PANTS2 = [0x283246, 0x353535, 0x4f4232, 0x1f2f46, 0x5a5a5e];
      function person(seed, o = {}) {
        const r = rng(seed * 7919 + 13), g = new THREE.Group();
        const pick = (a) => a[Math.floor(r() * a.length)];
        const S = (c, rough = 0.75) => new THREE.MeshStandardMaterial({ color: c, roughness: rough, metalness: 0 });
        const skinC = o.skin ?? pick(SKIN2), hairC = o.hairColor ?? pick(HAIR2);
        const skin = S(skinC, 0.6), hair = S(hairC, 0.85), top = S(o.top ?? pick(CLOTH2)), pants = S(o.pants ?? pick(PANTS2), 0.85);
        const shoe = S(pick([0x1a1a1a, 0x3a2a1e, 0xe8e8e8, 0x5a3a28]), 0.5);
        const kind = o.kind ?? (r() < 0.5 ? "f" : "m"); // nur fuer Proportionen/Frisurwahl
        const wide = kind === "m" ? 1.0 + r() * 0.12 : 0.88 + r() * 0.08;
        const mk = (geo, mat, x, y, z, parent) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; (parent || g).add(m); return m; };
        // Beine (Ober-/Unterschenkel in einem, leicht konisch) + Schuhe
        const hipL = new THREE.Group(), hipR = new THREE.Group(); hipL.position.set(-0.095 * wide, 0.9, 0); hipR.position.set(0.095 * wide, 0.9, 0); g.add(hipL, hipR);
        for (const hp of [hipL, hipR]) {
          const leg = mk(new THREE.CylinderGeometry(0.075, 0.058, 0.82, 16), pants, 0, -0.42, 0, hp);
          mk(new THREE.SphereGeometry(0.075, 16, 12), pants, 0, 0, 0, hp);
          const sh = mk(new THREE.BoxGeometry(0.105, 0.07, 0.25), shoe, 0, -0.86, 0.045, hp); sh.geometry.translate(0, 0, 0);
        }
        // Becken + Rumpf (konisch: breite Schultern, schmalere Taille)
        mk(new THREE.CylinderGeometry(0.142 * wide, 0.16 * wide, 0.16, 16), pants, 0, 0.93, 0).scale.z = 0.62; // schmaler als der Rumpf: keine deckungsgleichen Flaechen
        const torso = mk(new THREE.CylinderGeometry(0.188 * wide, 0.155 * wide, 0.5, 18), top, 0, 1.24, 0); torso.scale.z = 0.6;
        const shoulders = mk(new THREE.SphereGeometry(0.207 * wide, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), top, 0, 1.455, 0); shoulders.scale.set(1, 0.44, 0.62);
        mk(new THREE.TorusGeometry(0.065, 0.018, 8, 18), S(new THREE.Color(o.top ?? 0xffffff).offsetHSL(0, 0, 0.12).getHex()), 0, 1.53, 0).rotation.x = Math.PI / 2; // Kragen
        if (o.jacket ?? r() < 0.35) { // offene Jacke: Rueckenschale + Revers
          const jc = S(pick([0x2a2e36, 0x4a3a2a, 0x3a4a3a, 0x6a6a70]));
          const shell = mk(new THREE.CylinderGeometry(0.215 * wide, 0.17 * wide, 0.54, 18, 1, true, Math.PI * 0.62, Math.PI * 1.76), jc, 0, 1.23, 0); shell.scale.z = 0.66; shell.material.side = THREE.DoubleSide;
          top.userData.jacket = jc;
        }
        // Arme mit Ellbogen
        const shL = new THREE.Group(), shR = new THREE.Group(); shL.position.set(-0.235 * wide, 1.44, 0); shR.position.set(0.235 * wide, 1.44, 0); g.add(shL, shR);
        const armMat = top.userData.jacket || top; const elL = new THREE.Group(), elR = new THREE.Group();
        for (const [sh, el] of [[shL, elL], [shR, elR]]) {
          mk(new THREE.SphereGeometry(0.06, 16, 12), armMat, 0, 0, 0, sh);
          mk(new THREE.CylinderGeometry(0.055, 0.047, 0.3, 16), armMat, 0, -0.15, 0, sh);
          el.position.y = -0.3; sh.add(el);
          mk(new THREE.CylinderGeometry(0.046, 0.04, 0.27, 16), armMat, 0, -0.135, 0, el);
          const hand = mk(new THREE.SphereGeometry(0.048, 12, 10), skin, 0, -0.3, 0.005, el); hand.scale.set(0.8, 1.15, 0.6);
        }
        // Hals + Kopf
        mk(new THREE.CylinderGeometry(0.05, 0.055, 0.1, 10), skin, 0, 1.57, 0);
        const head = new THREE.Group(); head.position.set(0, 1.69, 0); g.add(head);
        const skull = mk(new THREE.SphereGeometry(0.12, 28, 22), skin, 0, 0, 0, head); skull.scale.set(0.92, 1.1, 1.0);
        const jawM = mk(new THREE.SphereGeometry(0.085, 24, 16), skin, 0, -0.05, 0.012, head); jawM.scale.set(0.98, 0.82, 0.92);
        for (const sx of [-1, 1]) { const ear = mk(new THREE.SphereGeometry(0.026, 10, 8), skin, sx * 0.108, -0.005, -0.005, head); ear.scale.set(0.45, 1, 0.8); }
        // Gesicht: Augen (Weiss + Iris + Pupille), Brauen, Nase, Mund
        const face = new THREE.Group(); head.add(face);
        const white = S(0xf6f4ef, 0.3), iris = S(pick([0x3a5a8a, 0x5a3a20, 0x3a6a4a, 0x2a1a10, 0x6a6a7a]), 0.3), pupil = S(0x080808, 0.2);
        const eyes = [];
        for (const sx of [-1, 1]) {
          const e = new THREE.Group(); e.position.set(sx * 0.043, 0.02, 0.1); face.add(e);
          mk(new THREE.SphereGeometry(0.022, 16, 12), white, 0, 0, 0, e).scale.set(1.2, 0.95, 0.55);
          mk(new THREE.SphereGeometry(0.0125, 14, 10), iris, 0, -0.001, 0.0095, e).scale.z = 0.45;
          mk(new THREE.SphereGeometry(0.006, 10, 8), pupil, 0, -0.001, 0.0138, e).scale.z = 0.4;
          mk(new THREE.SphereGeometry(0.0028, 6, 4), S(0xffffff, 0.1), 0.004, 0.004, 0.0152, e); // Glanzpunkt
          const brow = mk(new THREE.BoxGeometry(0.046, 0.012, 0.014), hair, sx * 0.045, 0.055, 0.106, face); brow.rotation.z = sx * -(0.08 + r() * 0.12);
          eyes.push(e);
        }
        const nose = mk(new THREE.SphereGeometry(0.02, 14, 10), skin, 0, -0.016, 0.116, face); nose.scale.set(0.75, 1.05, 0.95);
        const mouth = mk(new THREE.CapsuleGeometry(0.0055, 0.034, 4, 8), S(0x8a3a34, 0.45), 0, -0.062, 0.104, face); mouth.rotation.z = Math.PI / 2;
        // Frisur
        const style = o.hair ?? (kind === "f" ? pick(["lang", "lang", "dutt", "locken", "kurz", "pony"]) : pick(["kurz", "kurz", "seitenscheitel", "glatze", "locken", "pony"]));
        const cap = (thetaLen = 0.56) => { const c = mk(new THREE.SphereGeometry(0.127, 26, 16, 0, Math.PI * 2, 0, Math.PI * thetaLen), hair, 0, 0.012, -0.004, head); c.scale.set(0.95, 1.12, 1.04); c.rotation.x = -0.38; return c; }; // vorne auf der Stirn, hinten tief
        if (style === "kurz") cap(0.47);
        if (style === "seitenscheitel") { cap(0.48); const f = mk(new THREE.BoxGeometry(0.17, 0.035, 0.07), hair, 0.012, 0.1, 0.07, head); f.rotation.set(0.35, 0, -0.18); }
        if (style === "pony") { cap(0.47); const f = mk(new THREE.BoxGeometry(0.19, 0.04, 0.05), hair, 0, 0.1, 0.085, head); f.rotation.x = 0.55; }
        if (style === "lang") { cap(0.47); const back = mk(new THREE.CapsuleGeometry(0.1, 0.18, 6, 14), hair, 0, -0.1, -0.06, head); back.scale.set(1.18, 1, 0.55); for (const sx of [-1, 1]) { const side = mk(new THREE.CapsuleGeometry(0.035, 0.14, 4, 8), hair, sx * 0.105, -0.06, 0.0, head); side.rotation.z = sx * 0.08; } }
        if (style === "dutt") { cap(0.47); mk(new THREE.SphereGeometry(0.055, 14, 10), hair, 0, 0.1, -0.1, head); }
        if (style === "locken") { for (let i = 0; i < 26; i++) { const a = r() * Math.PI * 2, b = r() * 1.0; mk(new THREE.SphereGeometry(0.035 + r() * 0.015, 8, 6), hair, Math.sin(b) * Math.cos(a) * 0.12, 0.03 + Math.cos(b) * 0.11, Math.sin(b) * Math.sin(a) * 0.12 - 0.02, head); } }
        if (style === "glatze") { const c = cap(0.3); c.material = S(new THREE.Color(skinC).offsetHSL(0, 0, -0.04).getHex(), 0.45); }
        if (o.beard ?? (kind === "m" && r() < 0.35)) { const b = mk(new THREE.SphereGeometry(0.092, 18, 12, 0, Math.PI * 2, Math.PI * 0.5, Math.PI * 0.5), hair, 0, -0.035, 0.02, head); b.scale.set(1.0, 0.9, 1.0); }
        if (o.glasses ?? r() < 0.2) { const gm = S(0x1a1a1a, 0.3); for (const sx of [-1, 1]) mk(new THREE.TorusGeometry(0.024, 0.0035, 6, 16), gm, sx * 0.042, 0.018, 0.112, face); mk(new THREE.BoxGeometry(0.03, 0.004, 0.004), gm, 0, 0.022, 0.114, face); }
        const sc = o.scale ?? (kind === "m" ? 0.98 + r() * 0.1 : 0.92 + r() * 0.08);
        g.scale.setScalar(sc);
        g.userData = { hipL, hipR, shL, shR, elL, elR, head, face, eyes, phase: r() * 6.28, r };
        return g;
      }
      function idle(p, t) { // Atmen, Gewicht verlagern, Blinzeln, Blick - nie synchron
        const u = p.userData, k = t * 1.3 + u.phase;
        u.shL.rotation.x = Math.sin(k) * 0.05; u.shR.rotation.x = -Math.sin(k * 0.9) * 0.05;
        u.elL.rotation.x = -0.12 - Math.sin(k * 0.7) * 0.04; u.elR.rotation.x = -0.12 - Math.cos(k * 0.6) * 0.04;
        u.head.rotation.y = Math.sin(k * 0.4) * 0.25; p.rotation.z = Math.sin(k * 0.5) * 0.012;
        const blink = ((t + u.phase) % 3.7) < 0.12; u.eyes.forEach((e) => (e.scale.y = blink ? 0.1 : 1));
      }
      function walk(p, t, speed = 1) {
        const u = p.userData, k = t * 6 * speed + u.phase, a = Math.sin(k) * 0.45;
        u.hipL.rotation.x = a; u.hipR.rotation.x = -a; u.shL.rotation.x = -a * 0.8; u.shR.rotation.x = a * 0.8;
        u.elL.rotation.x = -0.3 - Math.max(0, -a) * 0.5; u.elR.rotation.x = -0.3 - Math.max(0, a) * 0.5;
        p.position.y = Math.abs(Math.cos(k)) * 0.03;
      }
