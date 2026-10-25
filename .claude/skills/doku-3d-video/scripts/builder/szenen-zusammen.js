      // ===== „ZUSAMMEN“: Straße zwischen den Epochen – links Fachwerk & Industrieziegel, rechts Brutalismus, Kopfstein, Oldtimer, Morgennebel, Goldene Stunde =====
      const SHOTS = [{ id: "weit", t0: 0, t1: 4 }, { id: "tief", t0: 4, t1: 8 }]; const DUR = 8;
      (function () {
        const s = new THREE.Scene(); const sonneDir = [-0.13, 0.13, -0.98];
        const him = himmelShader(s, { zeit: "abend", wolken: 0.4, wolkenTyp: "altocumulus", sonne: sonneDir }); s.fog = new THREE.Fog(0xe8c8a0, 90, 420);
        s.add(new THREE.HemisphereLight(0xffe6c8, 0x6a5a4a, 0.55)); const d = sun(s, 0xffc078, 3.0, [-10, 10.5, -78], 40); d.target.position.set(0, 0, -20); d.shadow.mapSize.set(4096, 4096); d.shadow.camera.far = 220; d.shadow.normalBias = 0.03; umgebung(s, him);
        box(600, 0.1, 600, material("erde", { wiederholen: [80, 80], farbe: 0x8a7a6a }), 0, -0.2, -100, s);
        kopfsteinStrasse(s, 130, { breite: 6.5, gehweg: 3, uneben: 0.1, flicken: 12 });
        const RAND = 3.25 + 0.3 + 3; // Fassadenflucht
        // Links: Fachwerk-Stadthäuser und ein Industrie-Ziegelbau
        const links = [], rauchPos = []; let z = 6; ["fw", "fw", "loft", "fw", "fw", "fw"].forEach((t, i) => { const h = t === "loft" ? loft(70 + i, { breite: 20 }) : fachwerkStadthaus(70 + i, { etagen: 3 + (i % 2) }); h.rotation.y = Math.PI / 2; const w = h.userData.w; h.position.set(-RAND, 0, z - w / 2); s.add(h); links.push(h);
          if (h.userData.schornstein) { h.updateMatrixWorld(true); rauchPos.push(h.userData.schornstein.clone().applyMatrix4(h.matrixWorld)); } z -= w + 0.15; });
        // Rechts: Brutalismus-Blöcke
        z = 4; [0, 1, 2, 3].forEach((i) => { const h = brutalismus(90 + i, { etagen: 6 + (i % 3) * 2, breite: 22 }); h.rotation.y = -Math.PI / 2; const w = h.userData.w; h.position.set(RAND, 0, z - w / 2); s.add(h); z -= w + 2; });
        const ferne = hochhaus(5, { typ: "beton", w: 24, d: 18, etagen: 16 }); ferne.position.set(-10, 0, -170); s.add(ferne);
        // Oldtimer am Bordstein
        const autos = [["oldtimer", -2.35, -4, 0, 0x9ad0b8], ["oldtimer", 2.35, -15, Math.PI, 0xf0e2c0], ["stufenheck", -2.35, -22, 0, 0x7a2a2a], ["oldtimer", 2.35, -34, Math.PI, 0x3a5a8a]].map(([ty, x, z2, ry, f], k) => { const c = fahrzeug(110 + k, ty, { farbe: f, lackArt: "uni", felge: "stahl" }); c.position.set(x, 0.02, z2); c.rotation.y = ry; s.add(c); return c; });
        // Leben: Menschen, Hund, Tauben, Laub, Staub im Licht, Rauch aus Schornsteinen, Nebel
        const leute = [["europaeisch", "f", -5.0, -9, Math.PI], ["afrikanisch", "m", 5.0, -12, 0], ["asiatisch", "m", -4.6, -26, Math.PI], ["arabisch", "f", 5.2, -20, 0]].map(([h, k, x, z2, ry], i) => { const p = person(4000 + i, { herkunft: h, kind: k, jacke: true }); p.position.set(x, 0.14, z2); p.rotation.y = ry; s.add(p); return p; });
        const hd = hund(41, { rasse: "beagle" }); hd.position.set(-4.4, 0.14, -9.6); hd.rotation.y = Math.PI; s.add(hd);
        const tauben = []; for (let k = 0; k < 6; k++) { const t = taube(60 + k); t.position.set(0.8 + (k % 3) * 0.3, 0.05, -8.5 - Math.floor(k / 3) * 0.4); t.rotation.y = k * 1.3; s.add(t); tauben.push(t); }
        const rauch = rauchPos.map((p, i) => schornsteinRauch(s, p.x, p.y, p.z, { seed: i + 3, wind: 0.5, farbe: 0xd8d0c8, dichte: 0.22 }));
        const nebelB = { update() {} }; // (Bodennebel-Ebenen erzeugen bei Augenhöhe Streifen – hier Tiefennebel + Schwaden)
        const schwaden = nebelSchwaden(s, { x: 0, z: -40, breite: 14, tiefe: 80, y: 0.4, hoehe: 2.5, dichte: 0.12, groesse: 7, farbe: 0xf6e8d4 });
        const laub = laubWind(s, -6, -16, 12, 8, 30, { y: 0.03 }); const staub = staubLicht(s, -3, 3, 0.3, 4, -22, -4, 500, { hell: 1.8, farbe: 0xffd8a0 });
        const sp = spiegelflaeche(s, 6.5, 120, { y: 0.045, z: -52, maske: "pfuetzen", staerke: 0.95, rau: 0.4, wiederholen: [1.2, 22] }); // nasse Pfützen spiegeln Häuser, Licht und Schrift
        // Schwebende 3D-Schrift
        const textPos = new THREE.Vector3(0, 3.2, -15); const titel = text3d(s, "ZUSAMMEN", { x: textPos.x, y: textPos.y, z: textPos.z, hoehe: 1.05, farbe: 0xf6efe2, tiefe: 0.16, metall: 0.15 });
        const c1 = cam(), c2 = cam();
        function upd(T, t) { him.update(T); sp.update(T); rauch.forEach((r) => r.update(T)); nebelB.update(T); schwaden.update(T); laub.update(T); staub.update(T);
          leute.forEach((p, k) => { const base = [-9, -12, -26, -20][k]; p.position.z = base + (k % 2 ? 1 : -1) * ((T * 1.1) % 6); walk(p, T + k * 0.4, 0.9); }); hd.position.z = -9.6 - ((T * 1.1) % 6); tierLaufen(hd, T, 1.1);
          tauben.forEach((tb, k) => taubePicken(tb, T + k * 0.6)); titel.g.position.y = textPos.y + Math.sin(T * 0.9) * 0.05; titel.g.rotation.y = Math.sin(T * 0.4) * 0.03; }
        W.weit = { scene: s, camera: c1, look: "golden", post: { uStrahlen: 0.75, uFlare: 0.18, uNebel: 0.22, uNebelHoehe: 4, uAO: 0.5, uDof: 1, uUnscharfAn: 1, uBlende: 1.6, uBokeh: 0.6, uHalation: 0.12, uChroma: 0.35, uKlarheit: 0.18, uRolloff: 0.25, uVig: 0.34 },
          update(t, T) { kamera(c1, t, { art: "dollyIn", von: [0.9, 1.75, 7], nach: [0.4, 1.9, -1.5], blick: [0, 3.0, -40], blickNach: [0, 3.1, -30], dauer: 4, fov: 46, hand: 0.45 }); titel.update(t, { start: 0.6, dauer: 1.2 }); upd(T, t);
            POST.uniforms.uFokus.value = c1.position.distanceTo(textPos); POST.uniforms.uNebelFarbe.value.set(0.95, 0.78, 0.6); } };
        W.tief = { scene: s, camera: c2, look: "golden", post: { uStrahlen: 0.6, uNebel: 0.2, uNebelHoehe: 4, uAO: 0.5, uDof: 1, uUnscharfAn: 1, uBlende: 1.1, uBokeh: 0.8, uHalation: 0.12, uChroma: 0.35, uKlarheit: 0.18, uRolloff: 0.25, uVig: 0.36, uBewegung: 0.35 },
          update(t, T) { kamera(c2, t, { art: "seitlich", von: [1.7, 0.35, 0.5], nach: [1.2, 0.45, -3.5], blick: [-0.8, 1.9, -16], blickNach: [-0.2, 2.6, -16], dauer: 4, fov: 52, hand: 0.5 }); titel.update(4 + t, { start: 0.6, dauer: 1.2 }); upd(T, t);
            fokusZug(POST, t, { von: 1.6, nach: c2.position.distanceTo(textPos), start: 1.2, dauer: 1.6 }); POST.uniforms.uNebelFarbe.value.set(0.95, 0.78, 0.6); } };
      })();
