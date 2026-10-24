#!/usr/bin/env python3
"""Satellitenkarte (NASA Blue Marble) im Referenz-Look + Laenderflaechen als SVG-Pfade.

  python3 map.py assets/map --bbox -12,34,34,62 --laender DEU,FRA,POL \
      --staedte "Berlin:13.40,52.52;Paris:2.35,48.86"

bbox = lon_min,lon_max,lat_min,lat_max. Zoom 7 = lokal (npm), 8 = GitHub raw (schaerfer, laedt Kacheln).
Ausgabe: karte.jpg (gegradet: dunkles Petrol-Meer), meta.json (Pixelgroesse, Projektion),
<ISO3>.path.txt (SVG-Pfad in Kartenpixeln), staedte.json, bbox pro Land in meta.json.
Max. ~5000 px Kantenlaenge halten (Browser-Speicher beim Rendern).
"""
import argparse, io, json, math, os, urllib.request
import numpy as np
from PIL import Image, ImageFilter
C = os.path.expanduser("~/.cache/geo-karten")
ap = argparse.ArgumentParser()
ap.add_argument("out"); ap.add_argument("--bbox", required=True)
ap.add_argument("--zoom", type=int, default=7)
ap.add_argument("--laender", default=""); ap.add_argument("--staedte", default="")
ap.add_argument("--admin1", default="", help="Bundeslaender/Provinzen: Namen mit ; getrennt (z.B. 'Bayern;Sachsen-Anhalt')")
a = ap.parse_args()
Z = a.zoom; lon0, lon1, lat0, lat1 = map(float, a.bbox.split(","))
tx = lambda lon: (lon + 180) / 360 * 2 ** Z
def ty(lat):
    r = math.radians(lat); return (1 - math.log(math.tan(r) + 1 / math.cos(r)) / math.pi) / 2 * 2 ** Z
x0, x1, y0, y1 = int(tx(lon0)), int(tx(lon1)), int(ty(lat1)), int(ty(lat0))
W, H = (x1 - x0 + 1) * 256, (y1 - y0 + 1) * 256
print(f"Karte {W}x{H}px (z{Z})")
img = Image.new("RGB", (W, H))
for x in range(x0, x1 + 1):
    for y in range(y0, y1 + 1):
        p = f"{C}/node_modules/@freetiler/nasa-bluemarble/tiles/{Z}/{x}/{y}.jpeg"
        if os.path.exists(p): t = Image.open(p)
        else:
            u = f"https://raw.githubusercontent.com/freetiler/nasa-bluemarble/main/tiles/{Z}/{x}/{y}.jpeg"
            t = Image.open(io.BytesIO(urllib.request.urlopen(u).read()))
        img.paste(t.convert("RGB"), ((x - x0) * 256, (y - y0) * 256))
# Grading: Meer dunkles Petrol, Land etwas satter (wie Esri-Satellit in den Referenzen)
im = np.asarray(img).astype(np.float32) / 255; r, g, b = im[..., 0], im[..., 1], im[..., 2]
water = np.clip((b - np.maximum(r, g) - 0.03) * 8, 0, 1)
water = np.asarray(Image.fromarray((water * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(2))).astype(np.float32) / 255
lum = 0.3 * r + 0.59 * g + 0.11 * b
teal = np.stack([0.07 + lum * 0.30, 0.22 + lum * 0.55, 0.30 + lum * 0.60], -1)
out = im * (1 - water[..., None]) + teal * water[..., None]
m = out.mean(-1, keepdims=True); out = out + (out - m) * 0.18 * (1 - water[..., None])
out = np.clip((out - 0.5) * 1.06 + 0.5, 0, 1)
os.makedirs(a.out, exist_ok=True)
Image.fromarray((out * 255).astype(np.uint8)).save(f"{a.out}/karte.jpg", quality=88)

def P(lon, lat):
    return tx(lon) * 256 - x0 * 256, ty(lat) * 256 - y0 * 256
def path_of(geom):
    polys = geom["coordinates"] if geom["type"] == "MultiPolygon" else [geom["coordinates"]]
    parts, xs, ys = [], [], []
    for poly in polys:
        pts = [P(*c[:2]) for c in poly[0]]
        area = 0.5 * abs(sum(pts[i][0] * pts[i - 1][1] - pts[i - 1][0] * pts[i][1] for i in range(len(pts))))
        if area < 40: continue
        o = [pts[0]]
        for p in pts[1:]:
            if math.dist(p, o[-1]) >= 1.2: o.append(p)
        xs += [p[0] for p in o]; ys += [p[1] for p in o]
        parts.append("M" + "L".join(f"{x:.1f},{y:.1f}" for x, y in o) + "Z")
    return "".join(parts), [round(min(xs)), round(min(ys)), round(max(xs)), round(max(ys))] if xs else None
meta = {"zoom": Z, "x0": x0, "y0": y0, "width": W, "height": H, "laender": {}, "admin1": {}}
if a.laender:
    d = json.load(open(f"{C}/ne10m.geojson"))
    for iso in a.laender.split(","):
        f = next((f for f in d["features"] if f["properties"]["ADM0_A3"] == iso), None)
        if not f: print("Land fehlt:", iso); continue
        pth, bb = path_of(f["geometry"]); open(f"{a.out}/{iso}.path.txt", "w").write(pth)
        meta["laender"][iso] = {"bbox": bb, "name": f["properties"]["NAME_DE"]}
if a.admin1:
    d = json.load(open(f"{C}/ne10m_states.geojson"))
    for nm in a.admin1.split(";"):
        f = next((f for f in d["features"] if nm in (f["properties"].get("name"), f["properties"].get("name_de"))), None)
        if not f: print("Region fehlt:", nm); continue
        slug = nm.lower().replace(" ", "-")
        pth, bb = path_of(f["geometry"]); open(f"{a.out}/{slug}.path.txt", "w").write(pth)
        meta["admin1"][slug] = {"bbox": bb, "name": nm}
st = {}
for item in filter(None, a.staedte.split(";")):
    n, ll = item.split(":"); lo, la = map(float, ll.split(",")); st[n] = [round(v, 1) for v in P(lo, la)]
json.dump(st, open(f"{a.out}/staedte.json", "w"), ensure_ascii=False, indent=1)
json.dump(meta, open(f"{a.out}/meta.json", "w"), ensure_ascii=False, indent=1)
print(json.dumps(meta["laender"], ensure_ascii=False)); print(json.dumps(st, ensure_ascii=False))
