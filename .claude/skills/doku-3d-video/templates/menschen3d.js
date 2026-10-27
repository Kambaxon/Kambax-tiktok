      // ===== Menschen 3D v1: echte, geriggte Menschenmodelle (glTF) mit Skelett-Animation – Referenz-Look „Lengede“ =====
      // Braucht vendor-gltf-loader.js (GLTFLoader + SkeletonUtils) und die Modelle in assets/modelle/ (bauen.py kopiert beides).
      //   "mann"     = readyplayer.me.glb  (Oberteil, Hose, Schuhe, Kopfbedeckung, Bart einzeln färbbar/abschaltbar)
      //   "frau"     = Michelle.glb        (stilisiert: eher Mittel-/Hintergrund; gelbe Hose wird per Shader auf farben.unten umgefärbt)
      //   "arbeiter" = Soldier.glb         (Arbeits-/Schutzkleidung, Helm-Optik; eigene Clips idle/walk/run, gedeckt getönt)
      //   Bewegungen aus Xbot.glb: idle, walk, run, agree, headShake, sad_pose, sneak_pose (nur Rotationen → passen auf alle drei)
      // mensch3d(s, { typ, seed, x, y, z, ry, skala, anim, tempo, phase, farben: { oben, unten, schuhe, kopf, ton }, bart, muetze, rand })
      //   kopfArt: "muetze" (Strickmütze, Winter) | "hut" | "frei" (Glatze), Standard zufällig 60/25/15 %
      //   -> { g, update(T), setAnim(name) }   Platzhalter sofort; Modell wird nachgeladen, der Render wartet über window.__hf.buildReady
      //   Bewegung im Raum selbst setzen (g.position); update(T) setzt die Animation deterministisch (gleiches T = gleiches Bild).
      const MENSCH_URL = { mann: "assets/modelle/readyplayer.me.glb", frau: "assets/modelle/Michelle.glb", arbeiter: "assets/modelle/Soldier.glb", anim: "assets/modelle/Xbot.glb" };
      const MENSCH_GLTF = {}, MENSCH_CLIPS = {}, MENSCH_WARTE = []; let MENSCH_LADEN = null;
      function menschenLaden() {
        if (MENSCH_LADEN) return MENSCH_LADEN;
        window.__hf = window.__hf || {}; window.__hf.buildReady = window.__hf.buildReady || {};
        const L = new GLTFLoader();
        MENSCH_LADEN = Promise.all(Object.entries(MENSCH_URL).map(([k, u]) => new Promise((res) => L.load(u, (g) => { MENSCH_GLTF[k] = g; res(); }, undefined, () => { console.error("Modell fehlt: " + u); res(); }))))
          .then(() => { const a = MENSCH_GLTF.anim; if (a) Object.keys(MENSCH_URL).forEach((typ) => { if (typ !== "anim" && MENSCH_GLTF[typ]) MENSCH_CLIPS[typ] = {};
              if (typ !== "anim" && MENSCH_GLTF[typ]) MENSCH_GLTF[typ].animations.forEach((c) => (MENSCH_CLIPS[typ]["eigen_" + c.name.toLowerCase()] = c)); });
            if (a) a.animations.forEach((c) => Object.keys(MENSCH_CLIPS).forEach((typ) => { if (MENSCH_GLTF[typ]) MENSCH_CLIPS[typ][c.name] = menschUmziel(c, MENSCH_GLTF[typ].scene); }));             MENSCH_WARTE.splice(0).forEach((f) => f()); });
        window.__hf.buildReady.menschen3d = MENSCH_LADEN; return MENSCH_LADEN; }
      // Xbot-Bewegung auf ein anderes Rig übertragen: Xbot hat Ruhe-Rotation = Identität, daher q_ziel = P⁻¹ · q_quelle · P · R
      //   (P = Welt-Ruherotation des Elternknochens im Ziel, R = lokale Ruherotation des Zielknochens). Namen ohne "mixamorig" passen auch auf ReadyPlayerMe.
      function menschUmziel(clip, ziel) { const knochen = menschTPose(ziel);
        const P = new THREE.Quaternion(), Pi = new THREE.Quaternion(), q = new THREE.Quaternion(), spuren = [];
        clip.tracks.forEach((t) => { if (!t.name.endsWith(".quaternion")) return; const name = t.name.slice(0, -11).replace("mixamorig", ""), k = knochen[name]; if (!k) return;
          P.copy(k.P); Pi.copy(P).invert(); const v = t.values.slice();
          for (let i = 0; i < v.length; i += 4) { q.fromArray(v, i); q.premultiply(Pi).multiply(P).multiply(k.R); q.toArray(v, i); }
          spuren.push(new THREE.QuaternionKeyframeTrack(k.name + ".quaternion", t.times.slice(), v)); });
        return new THREE.AnimationClip(clip.name, clip.duration, spuren); }
      // Ruhepose des Ziels in die T-Pose des Xbot drehen (ReadyPlayerMe steht in A-Pose): Knochen von oben nach unten so drehen,
      //   dass die Richtung zum Kindknochen der des Xbot entspricht. Liefert je Knochen { name, P (Welt-Rot. Eltern), R (lokal) } der T-Pose.
      const MENSCH_TPOSE = new WeakMap();
      function menschTPose(ziel) { if (MENSCH_TPOSE.has(ziel)) return MENSCH_TPOSE.get(ziel);
        const quelle = {}, kn = {}, erg = {}, a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3(), d = new THREE.Vector3(), q = new THREE.Quaternion(), w = new THREE.Quaternion();
        MENSCH_GLTF.anim.scene.updateMatrixWorld(true); MENSCH_GLTF.anim.scene.traverse((o) => { if (o.isBone) quelle[o.name.replace("mixamorig", "")] = o; });
        const kopie = SkeletonUtils.clone(ziel); kopie.updateMatrixWorld(true); const liste = []; kopie.traverse((o) => { if (o.isBone) { kn[o.name.replace("mixamorig", "")] = o; liste.push(o); } });
        liste.forEach((o) => { const n = o.name.replace("mixamorig", ""), qs = quelle[n], kind = o.children.find((x) => x.isBone && quelle[x.name.replace("mixamorig", "")]);
          if (qs && kind && n !== "Hips") { const qk = quelle[kind.name.replace("mixamorig", "")];
            o.getWorldPosition(a); kind.getWorldPosition(b); qs.getWorldPosition(c); qk.getWorldPosition(d); b.sub(a).normalize(); d.sub(c).normalize();
            if (b.lengthSq() > 0.5 && d.lengthSq() > 0.5 && b.dot(d) < 0.9995) { q.setFromUnitVectors(b, d); o.getWorldQuaternion(w); w.premultiply(q); o.parent.getWorldQuaternion(q); o.quaternion.copy(q.invert().multiply(w)); o.updateMatrixWorld(true); } }
          const P = new THREE.Quaternion(); o.parent.getWorldQuaternion(P); erg[n] = { name: o.name, P, R: o.quaternion.clone() }; });
        MENSCH_TPOSE.set(ziel, erg); return erg; }
      const MENSCH_FARBEN = { oben: [0x5a5e68, 0x6a6a6c, 0x7a6a5a, 0x4e5a6e, 0x8a8a88, 0x6a4a42, 0x4a5a4e, 0xa89a84], unten: [0x42454c, 0x4e4e50, 0x5a5448, 0x3a4050, 0x6a6a68], schuhe: [0x1a1816, 0x2a2420, 0x3a2e24], kopf: [0x2a2a2a, 0x4a3a2a, 0xd8c070, 0x6a1a1a] };
      function mensch3d(s, o = {}) {
        menschenLaden(); const r = rng((o.seed ?? 1) * 131 + 7), pick = (a) => a[Math.floor(r() * a.length)];
        const g = new THREE.Group(); g.position.set(o.x ?? 0, o.y ?? 0, o.z ?? 0); g.rotation.y = o.ry ?? 0; s.add(g);
        const typ = o.typ ?? (() => { const z = r(); return z < 0.6 ? "mann" : z < 0.85 ? "frau" : "arbeiter"; })(), F = Object.assign({ oben: pick(MENSCH_FARBEN.oben), unten: pick(MENSCH_FARBEN.unten), schuhe: pick(MENSCH_FARBEN.schuhe), kopf: pick(MENSCH_FARBEN.kopf) }, o.farben || {});
        const kopfArt = o.kopfArt ?? (o.muetze === true ? "hut" : o.muetze === false ? "frei" : (() => { const z = r(); return z < 0.6 ? "muetze" : z < 0.85 ? "hut" : "frei"; })()); const skala = (o.skala ?? 1) * (0.94 + r() * 0.1), phase = o.phase ?? r() * 10, tempo = o.tempo ?? (0.92 + r() * 0.16);
        let mixer = null, aktion = null, animName = o.anim ?? "idle";
        const aufbauen = () => { const src = MENSCH_GLTF[typ]; if (!src) return; const obj = SkeletonUtils.clone(src.scene); g.add(obj);
          const tint = (m, c, hell = 1.5) => { m = m.clone(); m.color = new THREE.Color(c).multiplyScalar(hell); m.roughness = Math.max(m.roughness ?? 0.8, 0.8); return m; };
          obj.traverse((m) => { if (!m.isMesh) return; m.castShadow = true; m.receiveShadow = true; m.frustumCulled = false; const n = m.name;
            if (typ === "mann") { if (n.includes("Outfit_Top")) m.material = tint(m.material, F.oben); else if (n.includes("Outfit_Bottom")) m.material = tint(m.material, F.unten); else if (n.includes("Footwear")) m.material = tint(m.material, F.schuhe, 1.2);
              else if (n.includes("Headwear")) { m.visible = kopfArt === "hut"; m.material = tint(m.material, F.kopf); } else if (n.includes("Beard")) { m.visible = o.bart ?? r() < 0.4; m.material = m.material.clone(); } else m.material = m.material.clone(); }
            else if (typ === "frau") { m.material = m.material.clone(); m.material.roughness = 0.85; if (m.material.sheen !== undefined) m.material.sheen = 0.2; const unten = new THREE.Color(F.unten).multiplyScalar(2.2), oben = new THREE.Color(F.oben).multiplyScalar(1.6);
              m.material.onBeforeCompile = (sh) => { sh.uniforms.uUnten = { value: unten }; sh.uniforms.uOben = { value: oben }; sh.fragmentShader = sh.fragmentShader.replace("void main() {", "uniform vec3 uUnten; uniform vec3 uOben;\nvoid main() {").replace("#include <map_fragment>", `#include <map_fragment>
                float gelb = smoothstep(0.12, 0.3, min(diffuseColor.r, diffuseColor.g) - diffuseColor.b); float l = dot(diffuseColor.rgb, vec3(0.3, 0.55, 0.15));
                diffuseColor.rgb = mix(diffuseColor.rgb, uUnten * l * 1.3, gelb);`); };
              m.material.customProgramCacheKey = () => "michelle"; }
            else { m.material = m.material.clone(); m.material.metalness = Math.min(m.material.metalness ?? 0, 0.2); const ton = new THREE.Color(F.ton ?? pick([0x8a8478, 0x6a7078, 0x7a6e5e, 0x5a6050]));
              m.material.onBeforeCompile = (sh) => { sh.uniforms.uTon = { value: ton }; sh.fragmentShader = sh.fragmentShader.replace("void main() {", "uniform vec3 uTon;\nvoid main() {").replace("#include <map_fragment>", "#include <map_fragment>\n diffuseColor.rgb = vec3(dot(diffuseColor.rgb, vec3(0.3, 0.55, 0.15))) * uTon * 2.2;"); };
              m.material.customProgramCacheKey = () => "arbeiterTon"; }
            if (o.rand && typeof randLicht === "function") randLicht(m.material, o.randFarbe ?? 0xffd8a8, o.rand); });
          if (kopfArt === "muetze" && typ === "mann") { let kopf = null; obj.traverse((b) => { if (b.isBone && /Head$/.test(b.name)) kopf = b; }); if (kopf) { obj.updateMatrixWorld(true); const ws = kopf.getWorldScale(new THREE.Vector3()).x || 1;
            const mz = new THREE.Mesh(new THREE.SphereGeometry(0.104 / ws, 20, 12, 0, Math.PI * 2, 0, Math.PI * 0.56), new THREE.MeshStandardMaterial({ color: new THREE.Color(F.kopf).multiplyScalar(1.4), roughness: 1, map: typeof texStoff === "function" ? texStoff("strick") : null })); mz.position.set(0, 0.105 / ws, -0.004 / ws); mz.scale.set(1, 0.92, 1.08); mz.castShadow = true; mz.frustumCulled = false; kopf.add(mz);
            const bund = new THREE.Mesh(new THREE.TorusGeometry(0.1 / ws, 0.018 / ws, 8, 24), mz.material); bund.rotation.x = Math.PI / 2; bund.position.set(0, 0.098 / ws, -0.004 / ws); bund.scale.set(1, 1.08, 1); kopf.add(bund); if (o.rand && typeof randLicht === "function") randLicht(mz.material, o.randFarbe ?? 0xffd8a8, o.rand); } }
          obj.scale.multiplyScalar(skala); mixer = new THREE.AnimationMixer(obj); obj.userData.typ = typ; g.userData.modell = obj; setze(animName); };
        const setze = (name) => { animName = name; if (!mixer) return; const K = MENSCH_CLIPS[typ] || {}, C = K["eigen_" + name] || K[name] || K.idle; if (!C) return;
          mixer.stopAllAction(); aktion = mixer.clipAction(C); aktion.play(); };
        if (MENSCH_GLTF[typ]) aufbauen(); else MENSCH_WARTE.push(aufbauen);
        return { g, typ, setAnim: setze, update(T) { if (mixer) mixer.setTime((T + phase) * tempo); } };
      }
      // Menschenmenge: n Personen in einem Bereich, gemischte Typen, Blick zu einem Ziel (z. B. zum Bohrturm)
      function menge3d(s, n, o = {}) { const r = rng(o.seed ?? 5), liste = [];
        for (let i = 0; i < n; i++) { const x = (o.x ?? 0) + (r() - 0.5) * (o.breite ?? 10), z = (o.z ?? 0) + (r() - 0.5) * (o.tiefe ?? 6);
          const ry = o.ziel ? Math.atan2(o.ziel[0] - x, o.ziel[1] - z) + (r() - 0.5) * 0.4 : r() * 6.28;
          liste.push(mensch3d(s, { seed: (o.seed ?? 5) * 100 + i, x, z, y: o.y ?? 0, ry, anim: o.anim ?? (r() < 0.8 ? "idle" : "agree"), typ: o.typ, rand: o.rand })); }
        return { liste, update(T) { liste.forEach((m) => m.update(T)); } }; }
