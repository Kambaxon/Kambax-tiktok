      // ===== Kamera v1: filmische Bewegungen, deterministisch über die Shot-Zeit t (Sekunden seit Shot-Beginn) =====
      // kamera(c, t, { art, dauer, ... }) setzt Position + Blick. Arten:
      //   "dollyIn"/"dollyOut": von → nach (Vector-Arrays), blick: Ziel      "fahrt": weg: [[x,y,z], ...] (CatmullRom), blick: Ziel oder "voraus"
      //   "orbit": mitte, radius, hoehe, start (rad), grad (Gesamtdrehung in rad)   "kran": von (hoch) → nach (Straßenhöhe), blick
      //   "schwenk": pos, blickVon → blickNach (Panorama)   "seitlich": von → nach parallel zur Fassade, blickVersatz
      //   "vogel": mitte, hoehe, drift (Vogelperspektive von oben)
      // Optionen für alle: weich (true = Ease-in-out), hand (0..1 organisches Handkamera-Wackeln), fov (Brennweite in Grad: 24mm≈62°, 35mm≈46°, 85mm≈20°), fovZu (Zoom während des Shots)
      const _v1 = new THREE.Vector3(), _v2 = new THREE.Vector3();
      const easeIO = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
      function kamera(c, t, o = {}) {
        const dauer = o.dauer ?? 4, k0 = Math.min(1, Math.max(0, t / dauer)), k = o.weich === false ? k0 : easeIO(k0); const V = (a) => _v1.set(a[0], a[1], a[2]);
        const lerp3 = (a, b) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
        let pos, ziel = o.blick ?? [0, 1, 0];
        if (o.art === "dollyIn" || o.art === "dollyOut" || o.art === "kran" || o.art === "seitlich") { pos = lerp3(o.von, o.nach); if (o.art === "seitlich" && o.blickVersatz) ziel = [pos[0] + o.blickVersatz[0], pos[1] + o.blickVersatz[1], pos[2] + o.blickVersatz[2]]; if (o.blickNach) ziel = lerp3(o.blick, o.blickNach); }
        else if (o.art === "orbit") { const a = (o.start ?? 0) + (o.grad ?? Math.PI / 2) * k, m = o.mitte ?? [0, 0, 0]; pos = [m[0] + Math.sin(a) * o.radius, (o.hoehe ?? 2) + (o.hoeheNach != null ? (o.hoeheNach - (o.hoehe ?? 2)) * k : 0), m[2] + Math.cos(a) * o.radius]; ziel = o.blick ?? [m[0], m[1] + 1, m[2]]; }
        else if (o.art === "fahrt") { if (!o._kurve) o._kurve = new THREE.CatmullRomCurve3(o.weg.map((p) => new THREE.Vector3(...p))); const p = o._kurve.getPointAt(k); pos = [p.x, p.y, p.z]; if (o.blick === "voraus") { const p2 = o._kurve.getPointAt(Math.min(1, k + 0.02)); ziel = [p2.x, p2.y - 0.05, p2.z]; } }
        else if (o.art === "schwenk") { pos = o.pos; ziel = lerp3(o.blickVon, o.blickNach); }
        else if (o.art === "vogel") { const m = o.mitte ?? [0, 0, 0], d = o.drift ?? [0, 0, 6]; pos = [m[0] + d[0] * (k - 0.5), o.hoehe ?? 40, m[2] + d[2] * (k - 0.5) + 0.01]; ziel = [pos[0], 0, pos[2] - 0.01 - (o.neigung ?? 0)]; }
        else { pos = o.pos ?? [0, 1.6, 5]; }
        c.position.set(pos[0], pos[1], pos[2]); c.up.set(0, 1, 0); c.lookAt(ziel[0], ziel[1], ziel[2]);
        if (o.fov) { const f = o.fovZu ? o.fov + (o.fovZu - o.fov) * k : o.fov; if (c.fov !== f) { c.fov = f; c.updateProjectionMatrix(); } }
        if (o.hand) handkamera(c, t, o.hand); if (o.rollen) c.rotateZ(o.rollen * Math.sin(k * Math.PI));
        return c;
      }
      // Organisches Mikro-Wackeln (Atmen + leichte Unruhe), deterministisch
      function handkamera(c, t, staerke = 0.5) { const s = staerke * 0.004;
        c.rotateX((Math.sin(t * 1.1) * 0.6 + Math.sin(t * 2.7 + 1.3) * 0.3 + Math.sin(t * 6.1 + 0.4) * 0.1) * s);
        c.rotateY((Math.sin(t * 0.9 + 2.0) * 0.6 + Math.sin(t * 2.3 + 0.7) * 0.3 + Math.sin(t * 5.3) * 0.1) * s);
        c.rotateZ(Math.sin(t * 0.7 + 1.1) * s * 0.4); c.position.y += Math.sin(t * 1.3) * s * 4; }
