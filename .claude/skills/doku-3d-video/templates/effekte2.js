      // ===== Effekte v2: echte Spiegelungen, Wasser, Kaustik, Stoff, Auflösen, Morphen, Physik, Wirbel, Zeitlupe, Licht-Setups (braucht: rng, M, canvasTex, rauschen2, SOFT, particles, GLSL_NOISE) =====
      const SPIEGEL_MASKE = {};
      function texSpiegelMaske(art = "pfuetzen", seed = 3) { const key = art + seed; if (SPIEGEL_MASKE[key]) return SPIEGEL_MASKE[key]; const N = rauschen2(seed);
        const t = canvasTex(256, 256, (g) => { const img = g.createImageData(256, 256); for (let y = 0; y < 256; y++) for (let x = 0; x < 256; x++) { const v = N.fbm(x / 34, y / 34, 5); let m;
          if (art === "pfuetzen") m = 0.22 + Math.max(0, Math.min(1, (v - 0.52) * 8)) * 0.78; else if (art === "feucht") m = 0.25 + v * 0.35; else m = 1; const i = (y * 256 + x) * 4; img.data[i] = img.data[i + 1] = img.data[i + 2] = m * 255; img.data[i + 3] = 255; } g.putImageData(img, 0, 0); });
        t.encoding = THREE.LinearEncoding; t.wrapS = t.wrapT = THREE.RepeatWrapping; SPIEGEL_MASKE[key] = t; return t; }
      // Planare Echtzeit-Spiegelung (wie Raytracing für flache Flächen): nasser Asphalt, Pfützen, Wasser, polierter Boden.
      // spiegelflaeche(s, breite, tiefe, { x, y, z, staerke, rau (Unschärfe), maske: "pfuetzen"|"feucht"|"voll", wiederholen, regen (Tropfenringe), wasser: { farbe, wellen } , aufl })
      function spiegelflaeche(s, w, d, o = {}) { const y = o.y ?? 0.01, aufl = o.aufl ?? 0.5, rt = new THREE.WebGLRenderTarget(1080 * aufl, 1920 * aufl, { type: THREE.HalfFloatType, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter });
        const vc = new THREE.PerspectiveCamera(), texM = new THREE.Matrix4(), ebene = new THREE.Plane(new THREE.Vector3(0, 1, 0), -y - 0.002), wasser = o.wasser || null;
        const mat = new THREE.ShaderMaterial({ transparent: !wasser, depthWrite: !!wasser, toneMapped: false, fog: false,
          uniforms: { tSp: { value: rt.texture }, uTexM: { value: texM }, tMaske: { value: texSpiegelMaske(o.maske ?? "feucht", o.seed ?? 3) }, uRep: { value: new THREE.Vector2(...(o.wiederholen ?? [w / 12, d / 12])) }, uStaerke: { value: o.staerke ?? 0.85 }, uRau: { value: o.rau ?? 0.3 },
            uZeit: { value: 0 }, uRegen: { value: o.regen ? 1 : 0 }, uWasser: { value: wasser ? 1 : 0 }, uWFarbe: { value: new THREE.Color(wasser?.farbe ?? 0x1e3a4a) }, uWellen: { value: wasser?.wellen ?? 0.5 } },
          vertexShader: `uniform mat4 uTexM; varying vec4 vR; varying vec3 vWp; varying vec2 vUv; void main(){ vUv = uv; vec4 wp = modelMatrix * vec4(position, 1.0); vWp = wp.xyz; vR = uTexM * wp; gl_Position = projectionMatrix * viewMatrix * wp; }`,
          fragmentShader: `uniform sampler2D tSp, tMaske; uniform vec2 uRep; uniform float uStaerke, uRau, uZeit, uRegen, uWasser, uWellen; uniform vec3 uWFarbe; varying vec4 vR; varying vec3 vWp; varying vec2 vUv;
            ${GLSL_NOISE}
            float hz(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
            void main(){ vec2 ruv = vR.xy / vR.w; vec2 off = vec2(0.0);
              if (uWasser > 0.5) { off += (vec2(fbm(vWp.xz * 0.8 + uZeit * 0.25), fbm(vWp.xz * 0.8 - uZeit * 0.2 + 7.0)) - 0.5) * 0.04 * uWellen; }
              if (uRegen > 0.5) { vec2 zell = floor(vWp.xz * 2.0); for (int i = -1; i <= 1; i++) for (int j = -1; j <= 1; j++) { vec2 c = zell + vec2(float(i), float(j)); float ph = hz(c); vec2 mp = (c + vec2(hz(c + 3.1), hz(c + 7.7))) / 2.0;
                float k = fract(uZeit * (0.7 + ph * 0.6) + ph); float dd = length(vWp.xz - mp); float ring = exp(-pow((dd - k * 0.3) * 45.0, 2.0)) * (1.0 - k); off += normalize(vWp.xz - mp + 1e-4) * ring * 0.012; } }
              vec3 refl = vec3(0.0); float sum = 0.0; for (int i = -2; i <= 2; i++) { float w = 1.0 - abs(float(i)) * 0.3; refl += texture2D(tSp, ruv + off + vec2(0.0, float(i) * 0.006 * uRau)).rgb * w; sum += w; } refl /= sum;
              vec3 V = normalize(cameraPosition - vWp); float fres = 0.1 + 0.9 * pow(1.0 - max(V.y, 0.0), 4.0); float maske = texture2D(tMaske, vUv * uRep).r;
              if (uWasser > 0.5) { vec3 col = mix(uWFarbe, refl, clamp(fres * uStaerke + 0.15, 0.0, 1.0)); gl_FragColor = vec4(col, 1.0); }
              else gl_FragColor = vec4(refl, clamp(uStaerke * fres * maske, 0.0, 1.0)); }` });
        const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), mat); m.rotation.x = -Math.PI / 2; m.position.set(o.x ?? 0, y, o.z ?? 0); m.renderOrder = 1; s.add(m);
        const mp = new THREE.Vector3(0, y, 0), N = new THREE.Vector3(0, 1, 0), cp = new THREE.Vector3(), rot = new THREE.Matrix4(), view = new THREE.Vector3(), ziel = new THREE.Vector3(), la = new THREE.Vector3();
        const sp = { m, mat, vorRender(rend, scene, cam) { cp.setFromMatrixPosition(cam.matrixWorld); if (cp.y < y) return; mp.set(cp.x, y, cp.z);
            view.subVectors(mp, cp).reflect(N).negate().add(mp); rot.extractRotation(cam.matrixWorld); la.set(0, 0, -1).applyMatrix4(rot).add(cp); ziel.subVectors(mp, la).reflect(N).negate().add(mp);
            vc.position.copy(view); vc.up.set(0, 1, 0).applyMatrix4(rot).reflect(N); vc.lookAt(ziel); vc.far = cam.far; vc.near = cam.near; vc.updateMatrixWorld(); vc.projectionMatrix.copy(cam.projectionMatrix);
            texM.set(0.5, 0, 0, 0.5, 0, 0.5, 0, 0.5, 0, 0, 0.5, 0.5, 0, 0, 0, 1).multiply(vc.projectionMatrix).multiply(vc.matrixWorldInverse);
            m.visible = false; const au = rend.shadowMap.autoUpdate; rend.shadowMap.autoUpdate = false; const h = scene.userData.himmel; if (h) h.dome.position.copy(vc.position);
            rend.clippingPlanes = [ebene]; rend.setRenderTarget(rt); rend.clear(); rend.render(scene, vc); rend.clippingPlanes = []; rend.shadowMap.autoUpdate = au; if (h) h.dome.position.copy(cp); m.visible = true; },
          update(T) { sp.T = T; mat.uniforms.uZeit.value = T; } };
        (s.userData.spiegel = s.userData.spiegel || []).push(sp); return sp; }
      // Unterwasser-Kaustik: tanzende Lichtnetze auf dem Grund (additiv)
      function kaustik(s, w, d, o = {}) { const mat = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false, uniforms: { uZeit: { value: 0 }, uF: { value: new THREE.Color(o.farbe ?? 0xbfe8ff).multiplyScalar(o.staerke ?? 0.6) } },
          vertexShader: `varying vec2 vP; void main(){ vec4 wp = modelMatrix * vec4(position, 1.0); vP = wp.xz; gl_Position = projectionMatrix * viewMatrix * wp; }`,
          fragmentShader: `uniform float uZeit; uniform vec3 uF; varying vec2 vP; float c(vec2 p, float t){ vec2 i = p; float s = 0.0; for (int n = 0; n < 4; n++) { float tt = t * (1.0 - 3.5 / float(n + 1)); i = p + vec2(cos(tt - i.x) + sin(tt + i.y), sin(tt - i.y) + cos(tt + i.x)); s += 1.0 / length(vec2(p.x / (sin(i.x + tt) / 0.01), p.y / (cos(i.y + tt) / 0.01))); } s /= 4.0; return pow(1.17 - pow(s, 1.4), 8.0); }
            void main(){ float k = c(mod(vP * 1.6, 6.2832) - 250.0, uZeit * 0.5 + 23.0); gl_FragColor = vec4(uF * clamp(k, 0.0, 2.0), 1.0); }` });
        const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), mat); m.rotation.x = -Math.PI / 2; m.position.set(o.x ?? 0, (o.y ?? 0) + 0.01, o.z ?? 0); m.renderOrder = 3; s.add(m); return { m, update(T) { mat.uniforms.uZeit.value = T; } }; }
      // Stoff im Wind: Fahne / Banner / Wäsche (Wellen nach Abstand vom befestigten Rand)
      function fahne(s, x, y, z, o = {}) { const w = o.breite ?? 1.5, h = o.hoehe ?? 1.0, g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = o.ry ?? 0; s.add(g);
        if (o.mast !== false) cyl(0.03, 0.035, y + h, M(0xb8bcc0, { metalness: 0.7 }), 0, -(y) / 2 + h / 2, 0, g, 10);
        let map = null; if (o.text || o.streifen) map = canvasTex(256, 170, (c) => { const f = o.farben ?? ["#1e3a8a", "#f2f2ee", "#c82a2a"]; if (o.streifen) f.forEach((ff, i) => { c.fillStyle = ff; c.fillRect(0, i * 170 / f.length, 256, 170 / f.length + 1); }); else { c.fillStyle = f[0]; c.fillRect(0, 0, 256, 170); } if (o.text) { c.fillStyle = "#fff"; c.font = "bold 46px sans-serif"; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText(o.text, 128, 88); } });
        const mat = new THREE.MeshStandardMaterial({ color: o.farbe ?? 0xffffff, map, side: THREE.DoubleSide, roughness: 0.8 }); const geo = new THREE.PlaneGeometry(w, h, 24, 12); geo.translate(w / 2, h / 2, 0);
        mat.onBeforeCompile = (sh) => { sh.uniforms.uWindT = WIND.t; sh.uniforms.uWindS = WIND.staerke; sh.vertexShader = "uniform float uWindT; uniform float uWindS;\n" + sh.vertexShader.replace("#include <begin_vertex>", `#include <begin_vertex>
            float fx = transformed.x / ${w.toFixed(3)}; transformed.z += (sin(fx * 7.0 - uWindT * 6.0) * 0.12 + sin(fx * 13.0 - uWindT * 9.0 + transformed.y * 3.0) * 0.04) * fx * uWindS * ${w.toFixed(3)}; transformed.y -= fx * fx * 0.06 * (2.0 - uWindS);`);
          sh.vertexShader = sh.vertexShader.replace("#include <beginnormal_vertex>", "#include <beginnormal_vertex>"); };
        const f = new THREE.Mesh(geo, mat); f.position.y = y > 0 ? 0 : 0; f.castShadow = true; g.add(f); return { g, f }; }
      // Auflösen (Dissolve) eines Materials mit glühender Kante: gibt { setze(k 0..1) } zurück
      function aufloesen(mat, o = {}) { const u = { uK: { value: 0 }, uKante: { value: new THREE.Color(o.kante ?? 0xff8a3a).multiplyScalar(4) } };
        mat.onBeforeCompile = (sh) => { Object.assign(sh.uniforms, u); sh.vertexShader = "varying vec3 vAufP;\n" + sh.vertexShader.replace("#include <begin_vertex>", "#include <begin_vertex>\n vAufP = position;");
          sh.fragmentShader = "uniform float uK; uniform vec3 uKante; varying vec3 vAufP;\n" + GLSL_NOISE + sh.fragmentShader.replace("#include <dithering_fragment>", `#include <dithering_fragment>
            float an = fbm(vAufP.xy * ${(o.skala ?? 3).toFixed(2)} + vAufP.z * 2.0); if (an < uK) discard; if (an < uK + 0.04) gl_FragColor.rgb = uKante;`); };
        mat.customProgramCacheKey = () => "aufloesen"; mat.side = THREE.DoubleSide; return { setze(k) { u.uK.value = k * 1.05; } }; }
      // Morphen: Form A fließt in Form B (gleiche Vertexanzahl – z. B. zwei SphereGeometry/BoxGeometry mit gleichen Segmenten)
      function morphMesh(geoA, geoB, mat) { geoA.morphAttributes.position = [geoB.attributes.position]; if (geoB.attributes.normal) geoA.morphAttributes.normal = [geoB.attributes.normal]; const m = new THREE.Mesh(geoA, mat); m.morphTargetInfluences = [0]; m.castShadow = true; return { m, setze(k) { m.morphTargetInfluences[0] = k; } }; }
      function kugelZuWuerfel(r = 1, seg = 24) { const a = new THREE.SphereGeometry(r, seg, seg), b = a.clone(), p = b.attributes.position, v = new THREE.Vector3(); for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); const m = Math.max(Math.abs(v.x), Math.abs(v.y), Math.abs(v.z)); v.multiplyScalar(r / m * 0.8); p.setXYZ(i, v.x, v.y, v.z); } b.computeVertexNormals(); return [a, b]; }
      // Starre Körper: fallen, prallen (Restitution) und rollen aus – deterministisch, analytisch
      function fallendeKoerper(s, n, o = {}) { const r = rng(o.seed ?? 5), list = []; for (let i = 0; i < n; i++) { const gr = (o.groesse ?? 0.3) * (0.6 + r() * 0.8); const m = new THREE.Mesh(r() < 0.5 ? new THREE.BoxGeometry(gr, gr, gr) : new THREE.IcosahedronGeometry(gr * 0.6, 0), o.material ?? M([0xc8302a, 0xe8c030, 0x2a6aa8, 0xf2f2ee][Math.floor(r() * 4)], { roughness: 0.4 })); m.castShadow = true; s.add(m);
          list.push({ m, gr, x: (o.x ?? 0) + (r() - 0.5) * (o.streuung ?? 2), z: (o.z ?? 0) + (r() - 0.5) * (o.streuung ?? 2), h0: (o.hoehe ?? 5) + r() * 2, t0: (o.start ?? 0) + r() * 0.6, vx: (r() - 0.5) * 1.5, vz: (r() - 0.5) * 1.5, rot: new THREE.Vector3(r() * 6, r() * 6, r() * 6) }); }
        return { list, update(T) { list.forEach((k) => { let t = Math.max(0, T - k.t0), y = k.h0, v = 0, e = 0.45, boden = k.gr / 2; let h = k.h0 - boden, tt = t, x = 0;
          let tF = Math.sqrt(2 * h / 9.81); if (tt < tF) y = k.h0 - 0.5 * 9.81 * tt * tt; else { tt -= tF; v = 9.81 * tF * e; y = boden; while (v > 0.3) { const tb = 2 * v / 9.81; if (tt < tb) { y = boden + v * tt - 0.5 * 9.81 * tt * tt; break; } tt -= tb; v *= e; } }
          const weg = Math.min(t, 2.5) - Math.max(0, Math.min(t, 2.5) - 1.5) * 0.5; k.m.position.set(k.x + k.vx * weg * 0.5, y, k.z + k.vz * weg * 0.5); const ausroll = Math.min(t, 2.0); k.m.rotation.set(k.rot.x + ausroll * 2, k.rot.y + ausroll, k.rot.z + ausroll * 1.5); }); } }; }
      // Weichkörper-Wackeln (Gummi/Gelee): nach Aufprall bei tStart quetschen und nachschwingen
      function wackeln(obj, T, tStart, staerke = 0.3) { const t = T - tStart; if (t < 0) { obj.scale.set(1, 1, 1); return; } const a = Math.exp(-t * 3.5) * Math.cos(t * 18) * staerke; obj.scale.set(1 + a * 0.6, 1 - a, 1 + a * 0.6); }
      // Partikelwirbel (Tornado aus Staub/Blättern/Funken)
      function wirbel(s, x, y, z, o = {}) { const n = o.n ?? 400, r = rng(o.seed ?? 4), pos = new Float32Array(n * 3), P = []; for (let i = 0; i < n; i++) P.push([r(), r() * (o.hoehe ?? 4), 0.6 + r() * 0.8, r() * 6.28]);
        const geo = new THREE.BufferGeometry(); geo.setAttribute("position", new THREE.BufferAttribute(pos, 3)); const pts = new THREE.Points(geo, new THREE.PointsMaterial({ map: SOFT, color: o.farbe ?? 0xd8c8a8, size: o.groesse ?? 0.08, transparent: true, opacity: 0.8, depthWrite: false, blending: o.leuchten ? THREE.AdditiveBlending : THREE.NormalBlending })); pts.frustumCulled = false; s.add(pts);
        return { pts, update(T) { P.forEach((p, i) => { const h = (p[1] + T * 0.6 * p[2]) % (o.hoehe ?? 4), rad = (o.radius ?? 0.4) + h * (o.trichter ?? 0.35), a = p[3] + T * (o.tempo ?? 3) * p[2] / (0.5 + h * 0.2); pos[i * 3] = x + Math.cos(a) * rad; pos[i * 3 + 1] = y + h; pos[i * 3 + 2] = z + Math.sin(a) * rad; }); geo.attributes.position.needsUpdate = true; } }; }
      // Zeitlupen-Rampe: zeitRampe(t, [[0, 1], [1.2, 0.2], [2.4, 1]]) -> verzerrte Zeit (Segmente mit Geschwindigkeit, weich übergeblendet)
      function zeitRampe(t, punkte) { let acc = 0, last = 0; for (let i = 0; i < punkte.length; i++) { const [tp, v] = punkte[i], next = punkte[i + 1]; const ende = next ? next[0] : Infinity; if (t <= tp) break; const seg = Math.min(t, ende) - tp; const v2 = next ? next[1] : v; const mitte = seg / (ende - tp || 1); acc += seg * (v + (v2 - v) * Math.min(1, mitte) * 0.5); last = tp; } return acc; }
      // Drei-Punkt-Licht (Studio): Führungslicht, Aufhellung, Kante/Rim – auf ein Ziel ausgerichtet
      function dreiPunktLicht(s, ziel = [0, 1.6, 0], o = {}) { const g = new THREE.Group(); s.add(g); const zt = new THREE.Object3D(); zt.position.set(...ziel); g.add(zt); const k = o.staerke ?? 1;
        const key = new THREE.SpotLight(o.keyFarbe ?? 0xfff0e0, 6 * k, 20, 0.6, 0.5, 1.5); key.position.set(ziel[0] + 2.5, ziel[1] + 1.8, ziel[2] + 2.5); key.target = zt; key.castShadow = true; key.shadow.mapSize.set(2048, 2048);
        const fill = new THREE.PointLight(o.fillFarbe ?? 0xc8d8ff, 0.8 * k, 12, 2); fill.position.set(ziel[0] - 2.5, ziel[1] + 0.3, ziel[2] + 2);
        const rim = new THREE.SpotLight(o.rimFarbe ?? 0xffffff, 8 * k, 15, 0.5, 0.6, 1.5); rim.position.set(ziel[0] - 1, ziel[1] + 2.2, ziel[2] - 2.8); rim.target = zt; g.add(key, fill, rim); return { g, key, fill, rim }; }
      // Kantenlicht (Fresnel-Rim) auf beliebigem Standard-Material
      function randLicht(mat, farbe = 0xffe8c8, staerke = 0.6) { const u = { uRimF: { value: new THREE.Color(farbe).multiplyScalar(staerke) } }; const alt = mat.onBeforeCompile;
        mat.onBeforeCompile = (sh, r) => { if (alt) alt(sh, r); Object.assign(sh.uniforms, u); sh.fragmentShader = "uniform vec3 uRimF;\n" + sh.fragmentShader.replace("#include <emissivemap_fragment>", "#include <emissivemap_fragment>\n float rimK = pow(1.0 - clamp(dot(normalize(vViewPosition), normal), 0.0, 1.0), 3.0); totalEmissiveRadiance += uRimF * rimK;"); };
        mat.customProgramCacheKey = () => "rim" + farbe; mat.needsUpdate = true; return mat; }
      // Abtrocknender nasser Boden: Rauheit wächst mit Zeit und Fleckenmuster (Pfützen trocknen zuletzt)
      function trocknen(mat, o = {}) { const u = { uTrock: { value: 0 } }; const alt = mat.onBeforeCompile;
        mat.onBeforeCompile = (sh, r) => { if (alt) alt(sh, r); Object.assign(sh.uniforms, u); sh.vertexShader = "varying vec3 vTrW;\n" + sh.vertexShader.replace("#include <worldpos_vertex>", "#include <worldpos_vertex>\n vTrW = (modelMatrix * vec4(transformed, 1.0)).xyz;");
          sh.fragmentShader = "uniform float uTrock; varying vec3 vTrW;\n" + GLSL_NOISE + sh.fragmentShader.replace("#include <roughnessmap_fragment>", "#include <roughnessmap_fragment>\n float nassK = smoothstep(uTrock - 0.15, uTrock + 0.15, fbm(vTrW.xz * 0.35)); roughnessFactor = mix(roughnessFactor, 0.08, nassK); diffuseColor.rgb *= mix(1.0, 0.62, nassK);"); };
        mat.customProgramCacheKey = () => "trocknen"; mat.needsUpdate = true; return { setze(k) { u.uTrock.value = k; } }; }
      // ===== Doku-Licht nach Referenz Lengede: motivierte Lichtquellen statt flacher Helligkeit =====
      // praktischesLicht(s, x, y, z, { farbe, staerke, reichweite, ziel: [x,y,z], winkel, schatten, kegel, staub, glanz }) -> { g, licht, update(T) }
      //   Helmlampe, Laterne, Fenster, Feuer: SpotLight mit Schatten + leuchtender Punkt + optional Lichtkegel und Staub im Strahl
      function praktischesLicht(s, x, y, z, o = {}) { const g = new THREE.Group(); g.position.set(x, y, z); s.add(g); const farbe = o.farbe ?? 0xffb060;
        const L = new THREE.SpotLight(farbe, o.staerke ?? 30, o.reichweite ?? 18, o.winkel ?? 0.7, 0.6, 1.6); L.castShadow = o.schatten !== false; L.shadow.mapSize.set(1024, 1024); L.shadow.bias = -0.0005; L.shadow.normalBias = 0.03; g.add(L);
        const zt = new THREE.Object3D(); zt.position.set(...(o.ziel ?? [0, -1, 2])); g.add(zt); L.target = zt;
        if (o.glanz !== false) g.add(glanzPunkt(farbe, o.glanzGroesse ?? 0.35));
        let kg = null; if (o.kegel) { kg = lichtKegel(o.reichweite ?? 8, Math.tan(o.winkel ?? 0.7) * (o.reichweite ?? 8) * 0.6, farbe, o.kegel === true ? 0.18 : o.kegel); kg.quaternion.setFromUnitVectors(new THREE.Vector3(0, -1, 0), zt.position.clone().normalize()); g.add(kg); }
        const st = o.staub ? staubLicht(s, x - 1.5, x + 1.5, y - 2, y + 0.5, z - 1.5, z + 3, 160, { hell: 1.4, farbe }) : null;
        return { g, licht: L, update(T) { L.intensity = (o.staerke ?? 30) * (1 + Math.sin(T * 13 + x) * (o.flackern ?? 0) * 0.15); st && st.update(T); } }; }
      // dokuFigur(p, { rand, matt, dunkler }): Figuren wie in der Referenz – matte Stoffe, gedämpfte Farben, Randlicht trennt die Silhouette vom Dunkel
      function dokuFigur(p, o = {}) { const gesehen = new Set(); p.traverse((m) => { if (!m.isMesh || !m.material || Array.isArray(m.material)) return; if (gesehen.has(m.material)) return; gesehen.add(m.material);
          const mt = m.material; if (mt.roughness !== undefined && !mt.userData.haut) mt.roughness = Math.max(mt.roughness, o.matt ?? 0.85); if (mt.color && o.dunkler) mt.color.multiplyScalar(1 - o.dunkler); if (o.rand !== false && !mt.userData.randLicht) { randLicht(mt, o.randFarbe ?? 0xffd8a8, o.rand ?? 0.35); mt.userData.randLicht = true; } m.castShadow = true; m.receiveShadow = true; }); return p; }
