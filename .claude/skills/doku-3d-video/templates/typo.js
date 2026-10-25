      // ===== Typografie v1: Schrift im 3D-Raum (wirft Schatten, kann leuchten, steht hinter Gebäudekanten oder im Nebel) =====
      // text3d(s, "TEXT", { x, y, z, ry, hoehe (m), farbe, schrift, gewicht, neon (Leuchtfarbe), tiefe (m, Extrusion durch Schichten), schatten, kontrast (true|Deckkraft: weicher dunkler Halo dahinter) })
      //   -> { g, update(T, { start, dauer }) }  sanftes Einblenden + leichtes Hochskalieren (deterministisch)
      function text3d(s, text, o = {}) {
        const fontPx = 160, schrift = `${o.gewicht ?? 800} ${fontPx}px ${o.schrift ?? "Montserrat, 'Helvetica Neue', Arial, sans-serif"}`;
        const mess = document.createElement("canvas").getContext("2d"); mess.font = schrift; const bw = Math.ceil(mess.measureText(text).width) + 40, bh = Math.ceil(fontPx * 1.3);
        const cv = document.createElement("canvas"); cv.width = bw; cv.height = bh; const g = cv.getContext("2d"); g.font = schrift; g.textBaseline = "middle"; g.textAlign = "center"; g.fillStyle = "#ffffff"; g.fillText(text, bw / 2, bh / 2 + fontPx * 0.04);
        const tex = new THREE.CanvasTexture(cv); tex.encoding = THREE.sRGBEncoding; tex.anisotropy = 8;
        const H = o.hoehe ?? 1, W = H * bw / bh, grp = new THREE.Group(); grp.position.set(o.x ?? 0, o.y ?? 0, o.z ?? 0); grp.rotation.y = o.ry ?? 0; s.add(grp);
        const neon = o.neon != null; const farbe = new THREE.Color(o.farbe ?? 0xf2f2ee);
        const front = neon ? new THREE.MeshBasicMaterial({ map: tex, color: new THREE.Color(o.neon).multiplyScalar(3), transparent: true, alphaTest: 0.4, toneMapped: false, side: THREE.DoubleSide })
          : new THREE.MeshStandardMaterial({ map: tex, color: farbe, transparent: true, alphaTest: 0.4, roughness: 0.35, metalness: o.metall ?? 0.1, side: THREE.DoubleSide });
        const wisch = new THREE.Plane(new THREE.Vector3(-1, 0, 0), 0); // für Wisch-Übergang (Clipping)
        const tiefe = o.tiefe ?? 0.12, schichten = Math.max(1, Math.round(tiefe / 0.012)), planes = [];
        const seite = new THREE.MeshStandardMaterial({ map: tex, color: farbe.clone().multiplyScalar(0.55), transparent: true, alphaTest: 0.4, roughness: 0.5, side: THREE.DoubleSide });
        for (let i = 0; i < schichten; i++) { const p = new THREE.Mesh(new THREE.PlaneGeometry(W, H), i === 0 ? front : seite); p.position.z = -i * (tiefe / schichten); p.castShadow = o.schatten !== false; p.receiveShadow = i === 0;
          p.customDepthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: tex, alphaTest: 0.4, side: THREE.DoubleSide }); p.userData.tiefeMat = p.customDepthMaterial; grp.add(p); planes.push(p); }
        if (o.kontrast) { const kv = document.createElement("canvas"), pad = 60; kv.width = bw + pad * 2; kv.height = bh + pad * 2; const k2 = kv.getContext("2d"); k2.font = schrift; k2.textBaseline = "middle"; k2.textAlign = "center";
          k2.shadowColor = "rgba(0,0,0,1)"; k2.shadowBlur = 38; k2.fillStyle = "rgba(0,0,0,0.6)"; k2.fillText(text, kv.width / 2, kv.height / 2 + fontPx * 0.04); const kt = new THREE.CanvasTexture(kv);
          const kp = new THREE.Mesh(new THREE.PlaneGeometry(W * kv.width / bw, H * kv.height / bh), new THREE.MeshBasicMaterial({ map: kt, color: 0x1a120a, transparent: true, opacity: o.kontrast === true ? 0.32 : o.kontrast, depthWrite: false, toneMapped: false }));
          kp.position.z = -tiefe - 0.05; kp.userData.keineTiefe = true; grp.add(kp); planes.push(kp); kp.userData.basisOpazitaet = kp.material.opacity; } // weicher Kontrastschatten hinter der Schrift (Lesbarkeit vor hellem Gegenlicht)
        if (neon) { const glow = new THREE.Mesh(new THREE.PlaneGeometry(W * 1.15, H * 1.6), new THREE.MeshBasicMaterial({ map: tex, color: new THREE.Color(o.neon).multiplyScalar(0.8), transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false })); glow.position.z = 0.02; grp.add(glow);
          const l = new THREE.PointLight(o.neon, 2.2, H * 8, 2); l.position.z = H * 0.6; grp.add(l); }
        return { g: grp, breite: W, update(T, a = {}) { const st = a.start ?? 0, du = a.dauer ?? 0.8, k = Math.min(1, Math.max(0, (T - st) / du)), e = 1 - Math.pow(1 - k, 3);
          grp.visible = k > 0; grp.scale.setScalar(0.92 + 0.08 * e); grp.position.y = (o.y ?? 0) - (1 - e) * H * 0.15; planes.forEach((p, i) => { p.material.opacity = (a.wischen ? 1 : e) * (p.userData.basisOpazitaet ?? 1); });
          if (a.wischen) { grp.scale.setScalar(1); grp.position.y = o.y ?? 0; wisch.constant = -W / 2 + W * 1.1 * e; wisch.normal.set(-1, 0, 0); grp.updateMatrixWorld(true); planes.forEach((p) => { if (!p.material.clippingPlanes) p.material.needsUpdate = true; p.material.clippingPlanes = [wisch.clone().applyMatrix4(grp.matrixWorld)]; }); } if (a.flackern && neon) front.color.setScalar(0).add(new THREE.Color(o.neon).multiplyScalar(3 * (Math.sin(T * 31) > -0.85 ? 1 : 0.2))); } };
      }
      // Titel, der aus dem Nebel auftaucht: Schrift + Nebelschwaden davor, die sich lichten
      function nebelTitel(s, text, o = {}) { const t = text3d(s, text, o), nb = nebelSchwaden(s, { x: o.x ?? 0, y: (o.y ?? 0) - 0.5, z: (o.z ?? 0) + 0.6, breite: (t.breite ?? 4) * 1.6, tiefe: 2, hoehe: 1.5, dichte: 0.5, groesse: 3, n: 16, farbe: o.nebelFarbe ?? 0xe8e8ec });
        return { t, nb, update(T, a = {}) { t.update(T, a); nb.update(T); const k = Math.min(1, Math.max(0, (T - (a.start ?? 0)) / ((a.dauer ?? 1) * 1.5))); nb.grp.children.forEach((sp) => (sp.material.opacity *= 1 - k * 0.8)); } }; }
