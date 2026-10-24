#!/usr/bin/env python3
"""OpenMoji-Icons fuer Schema-Grafiken.  python3 icons.py --suche truck | python3 icons.py assets/icons lkw=1F69B"""
import json, os, shutil, sys
C = os.path.expanduser("~/.cache/doku-3d/node_modules/openmoji"); D = json.load(open(f"{C}/data/openmoji.json"))
if sys.argv[1] == "--suche":
    [print(e["hexcode"], e["annotation"]) for e in D if sys.argv[2].lower() in e["annotation"].lower() and "tone" not in e["annotation"]]; sys.exit()
os.makedirs(sys.argv[1], exist_ok=True)
for a in sys.argv[2:]:
    n, k = a.split("=", 1); e = next((e for e in D if e["hexcode"] == k.upper() or e["annotation"] == k), None)
    if e: shutil.copy(f"{C}/color/svg/{e['hexcode']}.svg", f"{sys.argv[1]}/{n}.svg"); print(n, "<-", e["annotation"])
    else: print("fehlt:", k)
